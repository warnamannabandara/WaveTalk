"""
realtime_inference.py
---------------------
Real-time SLSL sign language translation via webcam.

Pipeline:
  Webcam → MediaPipe → Keypoints (63,) → DNN Model → Letter
  → Letter buffer → Word → Multilingual translation (EN/SI/TA)
  → OpenCV overlay display

Controls:
  SPACE  — manually finalise current word buffer
  C      — clear letter buffer
  Q      — quit

Usage:
    python inference/realtime_inference.py
"""

from __future__ import annotations

import json
import os
import sys
import time
from collections import deque
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from inference.keypoint_extractor import KeypointExtractor
from translation.translator import Translator

load_dotenv()

# ── Configuration ─────────────────────────────────────────────
SAVED_MODELS       = Path("saved_models")
MODEL_PATH         = Path(os.getenv("DNN_MODEL_PATH", "saved_models/dnn_model.h5"))
LABEL_MAP_PATH     = Path(os.getenv("LABEL_MAP_PATH", "saved_models/label_map.json"))
CONFIDENCE_THRESH  = float(os.getenv("CONFIDENCE_THRESHOLD", 0.80))
PREDICTION_BUFFER  = 10     # Number of frames to average for stability
LETTER_HOLD_FRAMES = 15     # Frames a letter must hold before being accepted
WORD_TIMEOUT_SEC   = 2.0    # Seconds of inactivity before word is finalised

# Colours
C_WHITE  = (255, 255, 255)
C_GREEN  = (0, 255, 100)
C_YELLOW = (0, 220, 255)
C_CYAN   = (255, 240, 50)
C_RED    = (50, 50, 255)
C_BG     = (20, 20, 20)


def load_model_and_labels() -> tuple[tf.keras.Model, dict[int, str]]:
    """Load the saved DNN model and its label map."""
    if not MODEL_PATH.exists():
        print(
            f"[ERROR] Model not found at '{MODEL_PATH}'.\n"
            "  →  Run 'python model/train_dnn.py' first."
        )
        sys.exit(1)

    if not LABEL_MAP_PATH.exists():
        print(f"[ERROR] Label map not found at '{LABEL_MAP_PATH}'.")
        sys.exit(1)

    print(f"[INFO] Loading model …  ({MODEL_PATH})")
    model = tf.keras.models.load_model(str(MODEL_PATH))

    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    label_map = {int(k): v for k, v in raw.items()}

    print(f"[INFO] Model loaded. Classes: {list(label_map.values())}")
    return model, label_map


def predict_letter(
    model: tf.keras.Model,
    keypoints: np.ndarray,
    label_map: dict[int, str],
) -> tuple[str, float]:
    """
    Run inference on a single (63,) keypoint array.

    Returns:
        (predicted_letter, confidence_score)
    """
    x     = keypoints[np.newaxis, :]          # (1, 63)
    probs = model.predict(x, verbose=0)[0]    # (26,)
    idx   = int(np.argmax(probs))
    return label_map.get(idx, "?"), float(probs[idx])


def draw_overlay(
    frame: np.ndarray,
    letter: str,
    confidence: float,
    letter_buffer: list[str],
    translation: dict | None,
) -> None:
    """Render the HUD: predicted letter, word buffer, and translations."""
    h, w = frame.shape[:2]

    # Bottom panel background
    cv2.rectangle(frame, (0, h - 180), (w, h), C_BG, -1)
    cv2.rectangle(frame, (0, 0), (w, 50),       C_BG, -1)

    # Title
    cv2.putText(frame, "SLSL Real-Time Translator",
                (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, C_CYAN, 2)

    # Predicted letter + confidence
    letter_text = f"Letter: {letter}  ({confidence*100:.0f}%)"
    cv2.putText(frame, letter_text,
                (10, h - 145), cv2.FONT_HERSHEY_SIMPLEX, 1.1, C_GREEN, 2)

    # Letter buffer (word being built)
    word_so_far = "".join(letter_buffer)
    cv2.putText(frame, f"Word:   {word_so_far}",
                (10, h - 105), cv2.FONT_HERSHEY_SIMPLEX, 0.9, C_WHITE, 2)

    # Multilingual output
    if translation:
        cv2.putText(frame, f"EN: {translation.get('en', '')}",
                    (10, h - 68), cv2.FONT_HERSHEY_SIMPLEX, 0.7, C_YELLOW, 2)
        cv2.putText(frame, f"SI: {translation.get('si', '')}",
                    (10, h - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, C_YELLOW, 2)
        cv2.putText(frame, f"TA: {translation.get('ta', '')}",
                    (10, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.7, C_YELLOW, 2)

    # Controls hint
    controls = "[SPACE] finalise  [C] clear  [Q] quit"
    cv2.putText(frame, controls,
                (w // 2 - 200, h - 155),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, C_WHITE, 1)


def main() -> None:
    # ── Load model & helpers ─────────────────────────────────
    model, label_map = load_model_and_labels()
    translator       = Translator()
    extractor        = KeypointExtractor()

    # ── Open webcam ──────────────────────────────────────────
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot open webcam.")
        sys.exit(1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    # ── State ────────────────────────────────────────────────
    pred_buffer:   deque[str] = deque(maxlen=PREDICTION_BUFFER)
    letter_buffer: list[str]  = []
    last_letter:   str        = ""
    hold_count:    int        = 0
    last_add_time: float      = time.time()
    translation:   dict | None = None

    print("[INFO] Starting real-time inference.  Press Q to quit.")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            frame  = cv2.flip(frame, 1)
            result = extractor.extract(frame)
            extractor.draw_landmarks(frame, result)

            current_letter = "–"
            confidence     = 0.0

            if result.hand_detected and result.keypoints is not None:
                current_letter, confidence = predict_letter(
                    model, result.keypoints, label_map
                )
                pred_buffer.append(current_letter)

                # Majority vote over buffer for stability
                if len(pred_buffer) == PREDICTION_BUFFER:
                    stable = max(set(pred_buffer), key=pred_buffer.count)
                    if (confidence >= CONFIDENCE_THRESH
                            and stable == current_letter):
                        if stable == last_letter:
                            hold_count += 1
                        else:
                            hold_count  = 0
                            last_letter = stable

                        # Accept letter after holding LETTER_HOLD_FRAMES frames
                        if hold_count == LETTER_HOLD_FRAMES:
                            letter_buffer.append(stable)
                            last_add_time = time.time()
                            hold_count    = 0
                            print(f"  + '{stable}'  →  {''.join(letter_buffer)}")

            # Auto-finalise word after timeout
            if letter_buffer and (time.time() - last_add_time) > WORD_TIMEOUT_SEC:
                word       = "".join(letter_buffer).lower()
                translation = translator.translate(word)
                print(f"\n[WORD] '{word}'  →  {translation}")
                letter_buffer.clear()

            draw_overlay(frame, current_letter, confidence, letter_buffer, translation)
            cv2.imshow("SLSL Real-Time Translator", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == ord('Q'):
                break
            elif key == ord(' '):
                if letter_buffer:
                    word        = "".join(letter_buffer).lower()
                    translation = translator.translate(word)
                    print(f"\n[WORD] '{word}'  →  {translation}")
                    letter_buffer.clear()
            elif key == ord('c') or key == ord('C'):
                letter_buffer.clear()
                translation = None
                print("[INFO] Buffer cleared.")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        extractor.close()
        print("[INFO] Inference stopped.")


if __name__ == "__main__":
    main()
