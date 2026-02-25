"""
keypoint_extractor.py
---------------------
Reusable MediaPipe Hands wrapper for SLSL landmark extraction.

The KeypointExtractor class is the single source of truth for
landmark processing — used by both the real-time script and the
FastAPI endpoint, ensuring identical preprocessing everywhere.
"""

from __future__ import annotations

import cv2
import mediapipe as mp
import numpy as np
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

# ── Configuration defaults ────────────────────────────────────
_MAX_HANDS           = int(os.getenv("MAX_NUM_HANDS", 1))
_MIN_DETECT_CONF     = float(os.getenv("MIN_DETECTION_CONFIDENCE", 0.7))
_MIN_TRACK_CONF      = float(os.getenv("MIN_TRACKING_CONFIDENCE", 0.5))

NUM_LANDMARKS = 21
COORDS_PER_LM = 3        # x, y, z
KEYPOINT_DIM  = NUM_LANDMARKS * COORDS_PER_LM  # 63


@dataclass
class ExtractionResult:
    """Holds the output of a single frame extraction."""
    keypoints:     np.ndarray | None   # shape (63,) or None when no hand found
    hand_detected: bool
    raw_results:   object              # MediaPipe multi_hand_landmarks


class KeypointExtractor:
    """
    Thread-safe wrapper around MediaPipe Hands.

    Usage:
        extractor = KeypointExtractor()
        result    = extractor.extract(bgr_frame)
        if result.hand_detected:
            keypoints = result.keypoints   # (63,) float32
    """

    def __init__(
        self,
        max_num_hands: int = _MAX_HANDS,
        min_detection_confidence: float = _MIN_DETECT_CONF,
        min_tracking_confidence: float  = _MIN_TRACK_CONF,
    ) -> None:
        self._mp_hands = mp.solutions.hands
        self._mp_draw  = mp.solutions.drawing_utils
        self._mp_style = mp.solutions.drawing_styles

        self._hands = self._mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    # ── Core extraction ───────────────────────────────────────

    def extract(self, bgr_frame: np.ndarray) -> ExtractionResult:
        """
        Run MediaPipe on a single BGR OpenCV frame.

        Args:
            bgr_frame: uint8 BGR image from cv2.VideoCapture.

        Returns:
            ExtractionResult with keypoints=(63,) float32 or None.
        """
        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        rgb.flags.writeable = False
        results = self._hands.process(rgb)
        rgb.flags.writeable = True

        if not results.multi_hand_landmarks:
            return ExtractionResult(
                keypoints=None,
                hand_detected=False,
                raw_results=results,
            )

        # Use first detected hand only
        hand = results.multi_hand_landmarks[0]
        kp   = np.array(
            [[lm.x, lm.y, lm.z] for lm in hand.landmark],
            dtype=np.float32,
        ).flatten()

        return ExtractionResult(
            keypoints=kp,
            hand_detected=True,
            raw_results=results,
        )

    def extract_from_image_bytes(self, image_bytes: bytes) -> ExtractionResult:
        """
        Convenience method for the FastAPI endpoint.
        Accepts raw JPEG/PNG bytes and returns an ExtractionResult.
        """
        arr   = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image bytes — ensure valid JPEG/PNG input.")
        return self.extract(frame)

    # ── Visualisation helpers ─────────────────────────────────

    def draw_landmarks(
        self,
        bgr_frame: np.ndarray,
        extraction_result: ExtractionResult,
    ) -> np.ndarray:
        """
        Draw MediaPipe hand skeleton on the frame (in-place).

        Returns the annotated frame.
        """
        if not extraction_result.hand_detected:
            return bgr_frame

        results = extraction_result.raw_results
        for hand_lm in results.multi_hand_landmarks:
            self._mp_draw.draw_landmarks(
                bgr_frame,
                hand_lm,
                self._mp_hands.HAND_CONNECTIONS,
                self._mp_style.get_default_hand_landmarks_style(),
                self._mp_style.get_default_hand_connections_style(),
            )
        return bgr_frame

    # ── Resource management ───────────────────────────────────

    def close(self) -> None:
        """Release MediaPipe resources."""
        self._hands.close()

    def __enter__(self) -> "KeypointExtractor":
        return self

    def __exit__(self, *_) -> None:
        self.close()
