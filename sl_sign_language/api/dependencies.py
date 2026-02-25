"""
dependencies.py
---------------
FastAPI dependency-injection singletons.

Uses functools.lru_cache so that the model is loaded once on startup
and reused across all requests (thread-safe for read-only inference).
"""

from __future__ import annotations

import json
import os
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from dotenv import load_dotenv

# Ensure parent directory is on path for relative imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from inference.keypoint_extractor import KeypointExtractor

load_dotenv()

MODEL_PATH     = Path(os.getenv("DNN_MODEL_PATH",  "saved_models/dnn_model.h5"))
LABEL_MAP_PATH = Path(os.getenv("LABEL_MAP_PATH",  "saved_models/label_map.json"))


# ── Model ─────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def get_model() -> tf.keras.Model:
    """
    Load and cache the DNN model.
    Called once at first request; subsequent calls return the cached model.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"DNN model not found at '{MODEL_PATH}'. "
            "Train the model first: python model/train_dnn.py"
        )
    return tf.keras.models.load_model(str(MODEL_PATH))


@lru_cache(maxsize=1)
def get_label_map() -> dict[int, str]:
    """Load and cache the integer → letter label map."""
    if not LABEL_MAP_PATH.exists():
        raise FileNotFoundError(f"Label map not found at '{LABEL_MAP_PATH}'.")
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return {int(k): v for k, v in raw.items()}


# ── Keypoint extractor ────────────────────────────────────────

@lru_cache(maxsize=1)
def get_extractor() -> KeypointExtractor:
    """Instantiate and cache the MediaPipe keypoint extractor."""
    return KeypointExtractor()


# ── Inference helper ──────────────────────────────────────────

def run_inference(keypoints: np.ndarray) -> tuple[str, float]:
    """
    Run the DNN model on a (63,) keypoint array.

    Returns:
        (predicted_letter, confidence)
    """
    model     = get_model()
    label_map = get_label_map()

    x     = keypoints[np.newaxis, :]
    probs = model.predict(x, verbose=0)[0]
    idx   = int(np.argmax(probs))
    return label_map.get(idx, "?"), float(probs[idx])
