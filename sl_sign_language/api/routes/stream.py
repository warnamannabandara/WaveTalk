"""
stream.py
---------
WebSocket /ws/stream — real-time streaming inference endpoint.

The client sends raw JPEG frame bytes over a WebSocket connection.
The server responds with JSON predictions for each frame.

Per-connection state:
  - letter_buffer : list of accepted letters for the current word
  - last letter   : for hold-count smoothing

Message protocol:
  Client → Server: binary JPEG bytes (one frame per message)
  Server → Client: JSON string matching PredictResponse schema
"""

from __future__ import annotations

import asyncio
import json
import sys
from collections import deque
from pathlib import Path

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from api.dependencies import get_extractor, run_inference
from translation.translator import Translator

router = APIRouter()

# Per-connection tuning
PRED_BUFFER_SIZE   = 10    # frames to majority-vote over
HOLD_FRAMES        = 15    # frames a letter must hold before accepted
CONFIDENCE_THRESH  = 0.75


class ConnectionState:
    """Mutable state scoped to a single WebSocket connection."""

    def __init__(self) -> None:
        self.pred_buffer:   deque[str] = deque(maxlen=PRED_BUFFER_SIZE)
        self.letter_buffer: list[str]  = []
        self.last_letter:   str        = ""
        self.hold_count:    int        = 0

    def add_prediction(self, letter: str, confidence: float) -> str | None:
        """
        Feed a new prediction into the buffer and return the letter
        the moment it passes the hold threshold, otherwise None.
        """
        self.pred_buffer.append(letter)

        if len(self.pred_buffer) < PRED_BUFFER_SIZE:
            return None

        stable = max(set(self.pred_buffer), key=self.pred_buffer.count)

        if confidence >= CONFIDENCE_THRESH and stable == letter:
            if stable == self.last_letter:
                self.hold_count += 1
            else:
                self.hold_count   = 0
                self.last_letter  = stable

            if self.hold_count == HOLD_FRAMES:
                self.letter_buffer.append(stable)
                self.hold_count = 0
                return stable

        return None


@router.websocket("/ws/stream")
async def stream(websocket: WebSocket) -> None:
    """
    WebSocket endpoint for frame-by-frame real-time inference.

    Accepts binary JPEG frames, responds with JSON predictions.
    """
    await websocket.accept()

    extractor  = get_extractor()
    translator = Translator()
    state      = ConnectionState()

    try:
        while True:
            # Receive binary JPEG frame from client
            frame_bytes = await websocket.receive_bytes()

            # Extract keypoints
            try:
                result = extractor.extract_from_image_bytes(frame_bytes)
            except ValueError:
                await websocket.send_text(json.dumps({
                    "error": "Invalid image data",
                }))
                continue

            if not result.hand_detected or result.keypoints is None:
                await websocket.send_text(json.dumps({
                    "letter":     "–",
                    "word":       "".join(state.letter_buffer),
                    "english":    "No hand detected",
                    "sinhala":    "අත සොයා ගත නොහැක",
                    "tamil":      "கை கண்டுபிடிக்கப்படவில்லை",
                    "confidence": 0.0,
                    "found":      False,
                }))
                continue

            # Run inference
            letter, confidence = run_inference(result.keypoints)

            # Smoothing
            accepted = state.add_prediction(letter, confidence)

            word = "".join(state.letter_buffer)
            translation = translator.translate(word if word else letter)

            response = {
                "letter":     letter,
                "word":       word,
                "english":    translation["en"],
                "sinhala":    translation["si"],
                "tamil":      translation["ta"],
                "confidence": round(confidence, 4),
                "found":      bool(translation.get("found", False)),
                "accepted":   accepted is not None,
            }
            await websocket.send_text(json.dumps(response))

            # Small cooperative yield to avoid blocking the event loop
            await asyncio.sleep(0)

    except WebSocketDisconnect:
        pass  # Client disconnected — clean exit
