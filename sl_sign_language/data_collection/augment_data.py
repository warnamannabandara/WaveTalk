"""
augment_data.py
---------------
Offline augmentation of collected SLSL keypoint data.

Augmentation strategies applied to each (63,) keypoint array:
  1. Horizontal flip  — mirror hand position along x-axis
  2. Coordinate jitter — add Gaussian noise (σ=0.005) to each coordinate
  3. Rotation          — 2-D rotation in the x-y plane by ±15°

Running this script on your existing data/ folder will expand
each letter's dataset by 3× without requiring additional recording.

Usage:
    python data_collection/augment_data.py
"""

import numpy as np
import os
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
JITTER_STD = 0.005       # Gaussian noise standard deviation
ROTATION_MAX_DEG = 15    # max rotation angle in degrees


# ── Augmentation helpers ──────────────────────────────────────

def flip_horizontal(keypoints: np.ndarray) -> np.ndarray:
    """
    Mirror keypoints along the x-axis.
    Reshapes (63,) → (21,3), negates x, reshapes back.
    """
    pts = keypoints.reshape(21, 3).copy()
    pts[:, 0] = 1.0 - pts[:, 0]   # x = 1 - x (normalised [0,1] space)
    return pts.flatten()


def jitter(keypoints: np.ndarray, std: float = JITTER_STD) -> np.ndarray:
    """Add small Gaussian noise to every coordinate value."""
    noise = np.random.normal(0, std, size=keypoints.shape).astype(np.float32)
    return np.clip(keypoints + noise, 0.0, 1.0)


def rotate_2d(keypoints: np.ndarray, angle_deg: float) -> np.ndarray:
    """
    Rotate the hand in the x-y plane around the wrist landmark (index 0).
    z coordinates are left unchanged.
    """
    pts    = keypoints.reshape(21, 3).copy()
    wrist  = pts[0, :2].copy()          # anchor at wrist
    angle  = np.deg2rad(angle_deg)
    c, s   = np.cos(angle), np.sin(angle)
    R      = np.array([[c, -s], [s, c]], dtype=np.float32)

    rel       = pts[:, :2] - wrist      # translate to origin
    rotated   = (R @ rel.T).T          # apply rotation
    pts[:, :2] = rotated + wrist        # translate back

    return np.clip(pts.flatten(), 0.0, 1.0)


# ── Per-sample augmentation pipeline ─────────────────────────

def augment_sample(keypoints: np.ndarray) -> list[np.ndarray]:
    """Return a list of augmented variants of a single keypoint array."""
    angle = np.random.uniform(-ROTATION_MAX_DEG, ROTATION_MAX_DEG)
    return [
        flip_horizontal(keypoints),
        jitter(keypoints),
        rotate_2d(keypoints, angle),
    ]


# ── Main ──────────────────────────────────────────────────────

def augment_all(data_dir: Path = DATA_DIR) -> None:
    """Iterate over all letter directories and augment each .npy file."""
    if not data_dir.exists():
        print(f"[ERROR] Data directory '{data_dir}' does not exist. "
              "Run collect_keypoints.py first.")
        return

    letters = sorted([d.name for d in data_dir.iterdir() if d.is_dir()])
    if not letters:
        print("[ERROR] No letter directories found inside data/.")
        return

    total_original  = 0
    total_augmented = 0

    for letter in letters:
        letter_dir  = data_dir / letter
        npy_files   = list(letter_dir.glob("*.npy"))
        n_original  = len(npy_files)

        if n_original == 0:
            continue

        aug_count = 0
        for npy_path in npy_files:
            keypoints = np.load(npy_path)

            for aug in augment_sample(keypoints):
                ts    = int(time.time() * 1_000_000)
                fname = letter_dir / f"aug_{npy_path.stem}_{ts}.npy"
                np.save(fname, aug.astype(np.float32))
                aug_count += 1

        print(f"  [{letter}] {n_original} originals → +{aug_count} augmented "
              f"= {n_original + aug_count} total")

        total_original  += n_original
        total_augmented += aug_count

    print(f"\n[DONE] {total_original} original → "
          f"+{total_augmented} augmented = "
          f"{total_original + total_augmented} total samples.")


if __name__ == "__main__":
    augment_all()
