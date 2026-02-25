"""
evaluate.py
-----------
Model evaluation script: loads saved DNN model, runs inference on a
held-out test set, and produces:
  - Classification report (precision / recall / F1 per class)
  - Confusion matrix (saved as confusion_matrix.png)
  - Per-class accuracy bar chart

Usage:
    python model/evaluate.py
"""

import json
import os
import sys
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

load_dotenv()
DATA_DIR       = Path(os.getenv("DATA_DIR", "data"))
SAVED_MODELS   = Path("saved_models")
MODEL_PATH     = SAVED_MODELS / "dnn_model.h5"
LABEL_MAP_PATH = SAVED_MODELS / "label_map.json"


def load_dataset(data_dir: Path) -> tuple[np.ndarray, np.ndarray]:
    """Load all .npy keypoints and return (X, y_str)."""
    X_list, y_list = [], []
    for letter_dir in sorted(data_dir.iterdir()):
        if not letter_dir.is_dir():
            continue
        for f in letter_dir.glob("*.npy"):
            kp = np.load(f)
            if kp.shape == (63,):
                X_list.append(kp)
                y_list.append(letter_dir.name)
    return np.array(X_list, dtype=np.float32), np.array(y_list)


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: list[str],
    output_path: Path,
) -> None:
    plt.figure(figsize=(16, 14))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.title("SLSL DNN — Confusion Matrix", fontsize=16)
    plt.xlabel("Predicted", fontsize=12)
    plt.ylabel("True",      fontsize=12)
    plt.tight_layout()
    plt.savefig(output_path, dpi=120)
    print(f"[INFO] Confusion matrix saved → {output_path}")
    plt.show()


def plot_per_class_accuracy(
    report: dict,
    class_names: list[str],
    output_path: Path,
) -> None:
    accs = [report[cls]["precision"] for cls in class_names if cls in report]
    plt.figure(figsize=(14, 5))
    bars = plt.bar(class_names, accs, color="steelblue", edgecolor="white")
    for bar, val in zip(bars, accs):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{val:.2f}",
            ha="center",
            va="bottom",
            fontsize=8,
        )
    plt.ylim(0, 1.1)
    plt.xlabel("Letter")
    plt.ylabel("Precision")
    plt.title("Per-Class Precision — SLSL DNN")
    plt.tight_layout()
    plt.savefig(output_path, dpi=120)
    print(f"[INFO] Per-class chart saved → {output_path}")
    plt.show()


def main() -> None:
    # ── Load model ────────────────────────────────────────────
    if not MODEL_PATH.exists():
        print(f"[ERROR] Model not found at '{MODEL_PATH}'. Train the model first.")
        sys.exit(1)

    print(f"[INFO] Loading model from '{MODEL_PATH}' …")
    model = tf.keras.models.load_model(str(MODEL_PATH))

    # ── Load label map ────────────────────────────────────────
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        label_map: dict = json.load(f)
    class_names = [label_map[str(i)] for i in range(len(label_map))]

    # ── Load dataset ──────────────────────────────────────────
    X, y_str = load_dataset(DATA_DIR)
    le = LabelEncoder()
    le.classes_ = np.array(class_names)
    y = le.transform(y_str)

    # 20% test split (same seed as training)
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[INFO] Testing on {len(X_test)} samples …")

    # ── Inference ─────────────────────────────────────────────
    y_prob = model.predict(X_test, verbose=0)
    y_pred = np.argmax(y_prob, axis=1)

    # ── Reports ───────────────────────────────────────────────
    report = classification_report(
        y_test, y_pred,
        target_names=class_names,
        output_dict=True,
    )
    print("\n" + classification_report(y_test, y_pred, target_names=class_names))
    print(f"Overall accuracy : {report['accuracy']*100:.2f}%")

    # ── Plots ─────────────────────────────────────────────────
    SAVED_MODELS.mkdir(parents=True, exist_ok=True)
    cm = confusion_matrix(y_test, y_pred)
    plot_confusion_matrix(cm, class_names, SAVED_MODELS / "confusion_matrix.png")
    plot_per_class_accuracy(report, class_names, SAVED_MODELS / "per_class_accuracy.png")


if __name__ == "__main__":
    main()
