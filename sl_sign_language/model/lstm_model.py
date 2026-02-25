"""
lstm_model.py
-------------
LSTM-based model for dynamic word-level SLSL gesture recognition.

Each sample is a sequence of 30 consecutive frames, where each frame
contains 63 keypoint features (21 landmarks × 3 coordinates).

Architecture:
    Input(30, 63)
    → LSTM(128, return_sequences=True) → Dropout(0.2)
    → LSTM(64) → Dropout(0.2)
    → Dense(64, ReLU) → BatchNorm
    → Dense(N_WORDS, Softmax)
"""

import tensorflow as tf
from tensorflow.keras import layers, Model, regularizers


def build_lstm_model(
    sequence_length: int = 30,
    feature_dim: int = 63,
    num_classes: int = 10,
    l2_reg: float = 1e-4,
) -> Model:
    """
    Build and compile the LSTM model for dynamic gesture recognition.

    Args:
        sequence_length: Number of frames per gesture sequence (default 30).
        feature_dim:     Features per frame (default 63 = 21 × 3).
        num_classes:     Number of word classes to recognise.
        l2_reg:          L2 regularisation strength.

    Returns:
        Compiled tf.keras.Model ready for training.
    """
    reg = regularizers.l2(l2_reg)

    inputs = tf.keras.Input(
        shape=(sequence_length, feature_dim), name="keypoint_sequence"
    )

    # ── Recurrent layers ─────────────────────────────────────
    x = layers.LSTM(
        128,
        return_sequences=True,
        kernel_regularizer=reg,
        name="lstm_1",
    )(inputs)
    x = layers.Dropout(0.2, name="drop_lstm_1")(x)

    x = layers.LSTM(
        64,
        return_sequences=False,
        kernel_regularizer=reg,
        name="lstm_2",
    )(x)
    x = layers.Dropout(0.2, name="drop_lstm_2")(x)

    # ── Dense head ───────────────────────────────────────────
    x = layers.Dense(64, kernel_regularizer=reg, name="dense_1")(x)
    x = layers.BatchNormalization(name="bn_1")(x)
    x = layers.Activation("relu", name="relu_1")(x)

    outputs = layers.Dense(
        num_classes, activation="softmax", name="output"
    )(x)

    model = Model(inputs=inputs, outputs=outputs, name="SLSL_LSTM")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


if __name__ == "__main__":
    model = build_lstm_model(num_classes=10)
    model.summary()

    import numpy as np
    dummy = np.random.rand(4, 30, 63).astype(np.float32)
    preds = model.predict(dummy, verbose=0)
    print(f"\nOutput shape: {preds.shape}")
