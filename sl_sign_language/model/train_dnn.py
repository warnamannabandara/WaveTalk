"""
train_dnn.py
------------
Training script for the SLSL static alphabet DNN model.

Workflow:
  1. Load all .npy keypoint files from data/{A-Z}/
  2. Encode labels → integers 0-25
  3. Apply optional data augmentation
  4. Train with Adam + EarlyStopping + ModelCheckpoint
  5. Save model  → saved_models/dnn_model.h5
  6. Save labels → saved_models/label_map.json
  7. Plot training curves

Usage:
    python model/train_dnn.py [--epochs 100] [--batch-size 32]
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

# ── Enable relative imports when run as a script ──────────────
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from model.dnn_model import build_dnn_model

load_dotenv()
DATA_DIR        = Path(os.getenv("DATA_DIR", "data"))
SAVED_MODELS    = Path("saved_models")
MODEL_PATH      = SAVED_MODELS / "dnn_model.h5"
LABEL_MAP_PATH  = SAVED_MODELS / "label_map.json"


# ── Data loading ──────────────────────────────────────────────

def load_dataset(data_dir: Path) -> tuple[np.ndarray, np.ndarray]:
    """
    Load all .npy keypoint files and return (X, y_str) arrays.

    Returns:
        X:     float32 array of shape (N, 63)
        y_str: string array of letter labels, shape (N,)
    """
    X_list, y_list = [], []

    if not data_dir.exists():
        raise FileNotFoundError(
            f"Data directory '{data_dir}' not found. "
            "Run data_collection/collect_keypoints.py first."
        )

    letter_dirs = sorted([d for d in data_dir.iterdir() if d.is_dir()])
    if not letter_dirs:
        raise ValueError("No letter directories found in data/.")

    for letter_dir in letter_dirs:
        letter = letter_dir.name
        files  = list(letter_dir.glob("*.npy"))
        if not files:
            continue
        for f in files:
            keypoints = np.load(f)
            if keypoints.shape != (63,):
                print(f"  [WARN] Skipping {f} — unexpected shape {keypoints.shape}")
                continue
            X_list.append(keypoints)
            y_list.append(letter)

    if not X_list:
        raise ValueError("No valid keypoint files found. Check data/ directory.")

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list)
    print(f"[INFO] Loaded {len(X)} samples across {len(set(y))} classes.")
    return X, y


# ── Training callbacks ────────────────────────────────────────

def get_callbacks(model_path: Path) -> list:
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    return [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=15,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=7,
            min_lr=1e-6,
            verbose=1,
        ),
        tf.keras.callbacks.TensorBoard(
            log_dir="logs/dnn",
            histogram_freq=1,
        ),
    ]


# ── Plot training curves ──────────────────────────────────────

def plot_history(history: tf.keras.callbacks.History) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    axes[0].plot(history.history["accuracy"],     label="Train Acc")
    axes[0].plot(history.history["val_accuracy"], label="Val Acc")
    axes[0].set_title("Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].legend()
    axes[0].grid(True)

    axes[1].plot(history.history["loss"],     label="Train Loss")
    axes[1].plot(history.history["val_loss"], label="Val Loss")
    axes[1].set_title("Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].legend()
    axes[1].grid(True)

    plt.tight_layout()
    out = SAVED_MODELS / "training_curves.png"
    plt.savefig(out, dpi=120)
    print(f"[INFO] Training curves saved → {out}")
    plt.show()


# ── Main ──────────────────────────────────────────────────────

def main(epochs: int = 100, batch_size: int = 32) -> None:
    # 1. Load data
    X, y_str = load_dataset(DATA_DIR)

    # 2. Encode labels
    le = LabelEncoder()
    y  = le.fit_transform(y_str)

    # Save label map: {0: "A", 1: "B", ...}
    label_map = {int(i): cls for i, cls in enumerate(le.classes_)}
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    with open(LABEL_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(label_map, f, ensure_ascii=False, indent=2)
    print(f"[INFO] Label map saved → {LABEL_MAP_PATH}")
    print(f"       Classes: {list(le.classes_)}")

    # 3. Train / validation split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Train: {len(X_train):,}  Val: {len(X_val):,}")

    # 4. Build model
    num_classes = len(le.classes_)
    model = build_dnn_model(num_classes=num_classes)
    model.summary()

    # 5. Train
    print("\n[INFO] Starting training …")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=get_callbacks(MODEL_PATH),
        verbose=1,
    )

    # 6. Final evaluation
    _, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\n[RESULT] Best validation accuracy: {val_acc:.4f} ({val_acc*100:.2f}%)")
    print(f"[INFO]  Model saved → {MODEL_PATH}")

    # 7. Plot
    plot_history(history)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SLSL DNN Model")
    parser.add_argument("--epochs",     type=int, default=100, help="Max training epochs")
    parser.add_argument("--batch-size", type=int, default=32,  help="Mini-batch size")
    args = parser.parse_args()

    main(epochs=args.epochs, batch_size=args.batch_size)
