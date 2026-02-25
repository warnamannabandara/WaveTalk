"""
collect_keypoints.py
--------------------
Interactive webcam tool for collecting Sri Lankan Sign Language (SLSL)
keypoint data per letter (A-Z).

Usage:
    python data_collection/collect_keypoints.py

Controls:
    - Press A–Z to label and start saving keypoints for that letter
    - Press SPACE to stop saving for current letter
    - Press Q to quit
    - Press R to show collection stats

Output:
    data/{letter}/{timestamp}.npy  — each file is a (63,) float32 array
"""

import cv2
import mediapipe as mp
import numpy as np
import os
import time
import sys
from pathlib import Path
from dotenv import load_dotenv

# ── Load config ──────────────────────────────────────────────
load_dotenv()
SAMPLES_PER_LETTER = int(os.getenv("SAMPLES_PER_LETTER", 200))
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
MIN_DETECTION_CONFIDENCE = float(os.getenv("MIN_DETECTION_CONFIDENCE", 0.7))
MIN_TRACKING_CONFIDENCE = float(os.getenv("MIN_TRACKING_CONFIDENCE", 0.5))

# Letters to collect (A-Z)
LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

# Colours for OpenCV overlay
COLOR_GREEN  = (0, 255, 0)
COLOR_RED    = (0, 0, 255)
COLOR_YELLOW = (0, 255, 255)
COLOR_WHITE  = (255, 255, 255)
COLOR_CYAN   = (255, 255, 0)


def extract_keypoints(landmarks) -> np.ndarray:
    """Flatten 21 hand landmarks (x, y, z) into a (63,) float32 array."""
    return np.array(
        [[lm.x, lm.y, lm.z] for lm in landmarks.landmark],
        dtype=np.float32,
    ).flatten()


def draw_hud(frame: np.ndarray, current_letter: str | None,
             count: int, total: int, collecting: bool) -> None:
    """Draw heads-up display on the video frame."""
    h, w = frame.shape[:2]

    # Background banner
    cv2.rectangle(frame, (0, 0), (w, 80), (30, 30, 30), -1)

    title = "SLSL Keypoint Collector"
    cv2.putText(frame, title, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.8, COLOR_CYAN, 2, cv2.LINE_AA)

    if current_letter:
        status = f"Letter: [{current_letter}]  Saved: {count}/{total}"
        color = COLOR_GREEN if collecting else COLOR_YELLOW
        cv2.putText(frame, status, (10, 65), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, color, 2, cv2.LINE_AA)
    else:
        cv2.putText(frame, "Press A-Z to start collecting, Q to quit",
                    (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_WHITE, 1)

    # Collecting indicator
    if collecting:
        cv2.circle(frame, (w - 30, 30), 12, COLOR_RED, -1)
        cv2.putText(frame, "REC", (w - 70, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLOR_RED, 2)


def get_stats() -> dict[str, int]:
    """Count existing samples per letter."""
    stats: dict[str, int] = {}
    for letter in LETTERS:
        letter_dir = DATA_DIR / letter
        if letter_dir.exists():
            stats[letter] = len(list(letter_dir.glob("*.npy")))
        else:
            stats[letter] = 0
    return stats


def print_stats() -> None:
    """Print a table of current collection status."""
    stats = get_stats()
    print("\n─── Collection Stats ───────────────────────────────")
    for i, letter in enumerate(LETTERS):
        count = stats[letter]
        bar = "█" * min(count // 10, 20)
        bar = bar.ljust(20)
        print(f"  {letter}: [{bar}] {count:>4} / {SAMPLES_PER_LETTER}")
    print("────────────────────────────────────────────────────\n")


def main() -> None:
    """Main data collection loop."""
    # ── MediaPipe setup ──────────────────────────────────────
    mp_hands = mp.solutions.hands
    mp_draw  = mp.solutions.drawing_utils
    mp_style = mp.solutions.drawing_styles

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
    )

    # ── Camera setup ─────────────────────────────────────────
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot open webcam. Check that a camera is connected.")
        sys.exit(1)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("[INFO] Webcam opened. Press A-Z to start collecting, Q to quit.")
    print_stats()

    current_letter: str | None = None
    collecting: bool           = False
    saved_count: int           = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARNING] Failed to read frame; retrying...")
                continue

            # Mirror frame for natural interaction
            frame = cv2.flip(frame, 1)
            rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # ── MediaPipe inference ──────────────────────────
            results = hands.process(rgb)

            keypoints: np.ndarray | None = None
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Draw skeleton
                    mp_draw.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_style.get_default_hand_landmarks_style(),
                        mp_style.get_default_hand_connections_style(),
                    )
                    keypoints = extract_keypoints(hand_landmarks)

            # ── Save keypoints ───────────────────────────────
            if collecting and current_letter and keypoints is not None:
                letter_dir = DATA_DIR / current_letter
                letter_dir.mkdir(parents=True, exist_ok=True)

                fname = letter_dir / f"{int(time.time() * 1000)}.npy"
                np.save(fname, keypoints)
                saved_count += 1

                # Auto-stop when target reached
                if saved_count >= SAMPLES_PER_LETTER:
                    print(f"[INFO] Completed {SAMPLES_PER_LETTER} samples for '{current_letter}'.")
                    collecting    = False
                    current_letter = None
                    saved_count   = 0

            # ── HUD ──────────────────────────────────────────
            draw_hud(frame, current_letter, saved_count, SAMPLES_PER_LETTER, collecting)

            cv2.imshow("SLSL Keypoint Collector", frame)

            # ── Keyboard handler ─────────────────────────────
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q') or key == ord('Q'):
                print("[INFO] Quitting.")
                break

            elif key == ord('r') or key == ord('R'):
                print_stats()

            elif key == ord(' '):
                # Stop current collection
                collecting    = False
                current_letter = None
                saved_count   = 0
                print("[INFO] Collection stopped.")

            elif 65 <= key <= 90 or 97 <= key <= 122:
                # A-Z pressed (upper or lower)
                letter = chr(key).upper()
                current_letter = letter
                saved_count    = 0
                collecting     = True
                print(f"[INFO] Started collecting for letter '{letter}'")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        hands.close()
        print("[INFO] Resources released.")
        print_stats()


if __name__ == "__main__":
    main()
