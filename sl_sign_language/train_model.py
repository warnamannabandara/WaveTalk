import os
import glob
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    LSTM, Dense, Dropout, Masking, BatchNormalization,
    Bidirectional, Input, Multiply, Softmax, Lambda
)
from tensorflow.keras.regularizers import l2
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

# Configuration
DATASET_PATH = "archive/Dataset - MP - CSV"
MAX_FRAMES = 50
FEATURE_DIM = 33 * 4   # 33 pose landmarks × (x, y, z, visibility)
AUGMENT_FACTOR = 5


# ── Data loading ─────────────────────────────────────────────────────────────

def parse_csv(csv_file):
    """Return a (MAX_FRAMES, FEATURE_DIM) array for one recording.

    Normalisation:
      - Position: subtract nose (landmark 0) so features are relative
      - Scale: divide by shoulder width (landmarks 11/12) for person-distance invariance
      - Visibility: kept as-is (0–1) so the model can down-weight occluded landmarks
    """
    df = pd.read_csv(csv_file, header=None)
    frames = []

    for i in range(min(len(df), MAX_FRAMES)):
        row = df.iloc[i]
        raw = []
        for col in range(row.shape[0]):
            cell = row[col]
            if isinstance(cell, str):
                vals = [float(v) for v in cell.strip("[]").split(",")]
                raw.append(vals[:4] if len(vals) >= 4 else [0.0, 0.0, 0.0, 0.0])
            else:
                raw.append([0.0, 0.0, 0.0, 0.0])

        # Nose-relative translation
        nose_x, nose_y, nose_z = raw[0][0], raw[0][1], raw[0][2]

        # Shoulder-width scale normalisation (landmarks 11 = left shoulder, 12 = right shoulder)
        sw = abs(raw[11][0] - raw[12][0]) if len(raw) > 12 else 0.0
        scale = sw if sw > 1e-5 else 1.0  # fallback to no scaling when shoulders aren't visible

        frame_features = []
        for lm in raw:
            frame_features.extend([
                (lm[0] - nose_x) / scale,
                (lm[1] - nose_y) / scale,
                (lm[2] - nose_z) / scale,
                lm[3],  # visibility kept raw
            ])
        frames.append(frame_features)

    # Zero-pad short sequences
    while len(frames) < MAX_FRAMES:
        frames.append([0.0] * FEATURE_DIM)

    return np.array(frames[:MAX_FRAMES], dtype=np.float32)


def load_data():
    X, y, classes = [], [], []

    for category in os.listdir(DATASET_PATH):
        cat_path = os.path.join(DATASET_PATH, category)
        if not os.path.isdir(cat_path):
            continue
        for word in os.listdir(cat_path):
            word_path = os.path.join(cat_path, word)
            if not os.path.isdir(word_path):
                continue
            if word not in classes:
                classes.append(word)
            label_idx = classes.index(word)

            for csv_file in glob.glob(os.path.join(word_path, "*.csv")):
                seq = parse_csv(csv_file)
                X.append(seq)
                y.append(label_idx)

    return np.array(X, dtype=np.float32), np.array(y), classes


# ── Data augmentation ─────────────────────────────────────────────────────────

def augment_sequence(seq):
    """Return one randomly augmented copy of seq."""
    aug = seq.copy()

    # 1. Coordinate noise (applies only to x/y/z, not visibility)
    noise = np.random.normal(0, 0.01, aug.shape).astype(np.float32)
    noise[:, 3::4] = 0.0  # leave visibility channels untouched
    aug += noise

    # 2. Uniform spatial scale (±15 %)
    scale = np.random.uniform(0.85, 1.15)
    aug[:, :3] *= scale  # scale only first landmark's xyz; simpler: scale all xyz columns
    xyz_mask = np.zeros(aug.shape[1], dtype=np.float32)
    xyz_mask[0::4] = 1.0; xyz_mask[1::4] = 1.0; xyz_mask[2::4] = 1.0
    aug *= (1.0 - xyz_mask) + xyz_mask * scale  # selectively scale xyz channels

    # 3. Temporal speed perturbation (±20 %)
    speed = np.random.uniform(0.80, 1.20)
    new_len = max(1, min(int(MAX_FRAMES * speed), MAX_FRAMES * 2))
    indices = np.linspace(0, MAX_FRAMES - 1, new_len)
    resampled = np.array([aug[min(int(idx), MAX_FRAMES - 1)] for idx in indices], dtype=np.float32)
    if len(resampled) >= MAX_FRAMES:
        aug = resampled[:MAX_FRAMES]
    else:
        pad = np.zeros((MAX_FRAMES - len(resampled), FEATURE_DIM), dtype=np.float32)
        aug = np.concatenate([resampled, pad], axis=0)

    # 4. Horizontal flip: negate x-coordinates (every 4th channel starting at 0)
    if np.random.random() < 0.5:
        aug[:, 0::4] *= -1

    # 5. Random visibility dropout: zero out a random subset of landmarks
    if np.random.random() < 0.3:
        n_drop = np.random.randint(1, 6)
        drop_lms = np.random.choice(33, n_drop, replace=False)
        for lm in drop_lms:
            aug[:, lm * 4: lm * 4 + 4] = 0.0

    return aug


def augment_dataset(X, y, factor):
    X_aug, y_aug = [X], [y]
    for _ in range(factor):
        batch = np.array([augment_sequence(X[i]) for i in range(len(X))], dtype=np.float32)
        X_aug.append(batch)
        y_aug.append(y)
    return np.concatenate(X_aug, axis=0), np.concatenate(y_aug, axis=0)


# ── Model ─────────────────────────────────────────────────────────────────────

def build_model(num_classes):
    """BiLSTM + temporal attention model."""
    inputs = Input(shape=(MAX_FRAMES, FEATURE_DIM))

    x = Masking(mask_value=0.0)(inputs)

    # BiLSTM stack
    x = Bidirectional(LSTM(128, return_sequences=True, kernel_regularizer=l2(1e-4)))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)

    x = Bidirectional(LSTM(128, return_sequences=True, kernel_regularizer=l2(1e-4)))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)

    x = Bidirectional(LSTM(64, return_sequences=True, kernel_regularizer=l2(1e-4)))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)

    # Temporal attention: learn which frames matter most
    attn_scores = Dense(1, activation="tanh")(x)           # (B, T, 1)
    attn_weights = Softmax(axis=1)(attn_scores)            # (B, T, 1)
    x = Multiply()([x, attn_weights])                      # (B, T, F)
    x = Lambda(lambda t: tf.reduce_sum(t, axis=1))(x)     # (B, F)

    # Classification head
    x = Dense(256, activation="relu", kernel_regularizer=l2(1e-4))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)

    x = Dense(128, activation="relu", kernel_regularizer=l2(1e-4))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)

    outputs = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs, outputs)
    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        # Label smoothing reduces overconfidence and improves generalisation
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
        metrics=["accuracy"],
    )
    return model


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Loading data...")
    X, y, classes = load_data()
    print(f"  Raw samples : {len(X)}")
    print(f"  Classes     : {len(classes)}")
    print(f"  Feature dim : {FEATURE_DIM}")

    with open("classes.json", "w") as f:
        json.dump(classes, f)

    # Stratified train/test split BEFORE augmentation to avoid data leakage
    X_train_raw, X_test, y_train_raw, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Augmenting training set (×{AUGMENT_FACTOR + 1})...")
    X_train, y_train = augment_dataset(X_train_raw, y_train_raw, AUGMENT_FACTOR)
    print(f"  Training samples after augmentation: {len(X_train)}")

    perm = np.random.permutation(len(X_train))
    X_train, y_train = X_train[perm], y_train[perm]

    class_weights_arr = compute_class_weight(
        class_weight="balanced", classes=np.unique(y_train), y=y_train
    )
    class_weight_dict = dict(enumerate(class_weights_arr))

    y_train_cat = to_categorical(y_train, num_classes=len(classes))
    y_test_cat  = to_categorical(y_test,  num_classes=len(classes))

    model = build_model(len(classes))
    model.summary()

    callbacks = [
        EarlyStopping(monitor="val_accuracy", patience=20, restore_best_weights=True, verbose=1),
        ModelCheckpoint("sign_language_model.keras", monitor="val_accuracy", save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=8, min_lr=1e-6, verbose=1),
    ]

    print("Training...")
    model.fit(
        X_train, y_train_cat,
        validation_data=(X_test, y_test_cat),
        epochs=150,
        batch_size=64,
        callbacks=callbacks,
        class_weight=class_weight_dict,
    )

    model.save("sign_language_model_final.keras")
    print("Done — model saved as 'sign_language_model_final.keras'.")


if __name__ == "__main__":
    main()
