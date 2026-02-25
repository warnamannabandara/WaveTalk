"""
predict.py
----------
POST /predict — single-frame sign language prediction endpoint.

Flow:
  1. Decode base64 image from request body
  2. Extract hand keypoints via MediaPipe
  3. Run DNN inference → letter + confidence
  4. Translate letter/word → EN / SI / TA
  5. Return PredictResponse JSON
"""

from __future__ import annotations

import base64
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException, status

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from api.dependencies import get_extractor, run_inference
from api.schemas import PredictRequest, PredictResponse
from translation.translator import Translator

router     = APIRouter()
translator = Translator()

# Per-connection letter buffer is managed at the route level.
# For stateless single-frame prediction we return letter + empty word.
CONFIDENCE_THRESHOLD = 0.70


@router.post(
    "/predict",
    response_model=PredictResponse,
    summary="Predict sign language letter from a webcam frame",
    description=(
        "Send a base64-encoded JPEG/PNG frame captured from the client's webcam. "
        "The server extracts MediaPipe hand landmarks, runs the DNN classifier, "
        "and returns the predicted letter with multilingual translations."
    ),
)
async def predict(request: PredictRequest) -> PredictResponse:
    """
    Decode the incoming frame, run MediaPipe + DNN, return prediction.
    """
    # ── 1. Decode base64 image ────────────────────────────────
    try:
        image_bytes = base64.b64decode(request.image_base64)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid base64 image data: {exc}",
        )

    # ── 2. Extract keypoints ──────────────────────────────────
    extractor = get_extractor()
    try:
        result = extractor.extract_from_image_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    if not result.hand_detected or result.keypoints is None:
        # No hand in frame — return neutral response
        return PredictResponse(
            letter="–",
            word="",
            english="No hand detected",
            sinhala="අත සොයා ගත නොහැක",
            tamil="கை கண்டுபிடிக்கப்படவில்லை",
            confidence=0.0,
            found=False,
        )

    # ── 3. Run inference ──────────────────────────────────────
    letter, confidence = run_inference(result.keypoints)

    # ── 4. Translate ──────────────────────────────────────────
    translation = translator.translate(letter)

    # ── 5. Return response ────────────────────────────────────
    return PredictResponse(
        letter=letter,
        word=letter,                           # Single-frame → word = letter
        english=translation["en"],
        sinhala=translation["si"],
        tamil=translation["ta"],
        confidence=confidence,
        found=bool(translation.get("found", False)),
    )
