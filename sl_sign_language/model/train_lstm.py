"""
train_lstm.py
-------------
Training script for the SLSL dynamic word-level LSTM model.

Each sample is a fixed-length sequence of 30 consecutive keypoint frames,
collected with data_collection/collect_keypoints.py in sequence mode.

Directory structure expected:
    data/sequences/{word_label}/{sequence_id}/{0..29}.npy

Usage:
    python model/train_lstm.py [--epochs 100] [--batch-size 16]
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from model.lstm_model import build_lstm_model

load_dotenv()
SEQ_DIR        = Path(os.getenv("DATA_DIR", "data")) / "sequences"
SAVED_MODELS   = Path("saved_models")
MODEL_PATH     = SAVED_MODELS / "lstm_model.h5"
LABEL_MAP_PATH = SAVED_MODELS / "lstm_label_map.json"
SEQUENCE_LEN   = int(os.getenv("SEQUENCE_LENGTH", 30))


def load_sequences(seq_dir: Path) -> tuple[np.ndarray, np.ndarray]:
    """
    Load sequence data.

    Expected layout:
        seq_dir/
          {word}/
            {seq_id}/
              0.npy, 1.npy, ..., {SEQUENCE_LEN-1}.npy

    Returns:
        X: (N, SEQUENCE_LEN, 63)
        y: string labels (N,)
    """
    if not seq_dir.exists():
        raise FileNotFoundError(
            f"Sequence directory '{seq_dir}' not found.\n"
            "Collect sequence data first (use collect_keypoints.py with sequence mode)."
        )

    X_list, y_list = [], []

    for word_dir in sorted(seq_dir.iterdir()):
        if not word_dir.is_dir():
            continue
        word = word_dir.name

        for seq_dir_item in sorted(word_dir.iterdir()):
            if not seq_dir_item.is_dir():
                continue
            frames = []
            valid  = True
            for i in range(SEQUENCE_LEN):
                frame_path = seq_dir_item / f"{i}.npy"
                if not frame_path.exists():
                    valid = False
                    break
                frames.append(np.load(frame_path))
            if valid:
                X_list.append(np.stack(frames))  # (30, 63)
                y_list.append(word)

    if not X_list:
        raise ValueError("No valid sequences found.")

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list)
    print(f"[INFO] Loaded {len(X)} sequences over {len(set(y))} classes.")
    return X, y


def get_callbacks(model_path: Path) -> list:
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    return [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=20,
            restore_best_weights=True, verbose=1,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            str(model_path), monitor="val_accuracy",
            save_best_only=True, verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=10,
            min_lr=1e-6, verbose=1,
        ),
        tf.keras.callbacks.TensorBoard(log_dir="logs/lstm", histogram_freq=1),
    ]


def plot_history(history: tf.keras.callbacks.History) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].plot(history.history["accuracy"],     label="Train")
    axes[0].plot(history.history["val_accuracy"], label="Val")
    axes[0].set_title("LSTM Accuracy"); axes[0].legend(); axes[0].grid(True)
    axes[1].plot(history.history["loss"],     label="Train")
    axes[1].plot(history.history["val_loss"], label="Val")
    axes[1].set_title("LSTM Loss");     axes[1].legend(); axes[1].grid(True)
    plt.tight_layout()
    out = SAVED_MODELS / "lstm_training_curves.png"
    plt.savefig(out, dpi=120)
    print(f"[INFO] Saved → {out}")


def main(epochs: int = 100, batch_size: int = 16) -> None:
    X, y_str = load_sequences(SEQ_DIR)

    le = LabelEncoder()
    y  = le.fit_transform(y_str)

    label_map = {int(i): cls for i, cls in enumerate(le.classes_)}
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    with open(LABEL_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(label_map, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Label map saved → {LABEL_MAP_PATH}")

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = build_lstm_model(
        sequence_length=SEQUENCE_LEN,
        num_classes=len(le.classes_),
    )
    model.summary()

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=get_callbacks(MODEL_PATH),
        verbose=1,
    )

    _, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\n[RESULT] Best val accuracy: {val_acc*100:.2f}%")
    plot_history(history)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SLSL LSTM Model")
    parser.add_argument("--epochs",     type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()
    main(epochs=args.epochs, batch_size=args.batch_size)
