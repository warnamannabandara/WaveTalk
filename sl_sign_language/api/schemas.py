"""
schemas.py
----------
Pydantic request / response models for the SLSL FastAPI endpoints.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """
    Request body for POST /predict.

    The client sends a single webcam frame encoded as a base64 string.
    The server decodes it, runs MediaPipe + DNN, and returns predictions.
    """
    image_base64: str = Field(
        ...,
        description="Base64-encoded JPEG or PNG image of the webcam frame.",
        examples=["<base64-string>"],
    )


class PredictResponse(BaseModel):
    """
    Response from POST /predict and WebSocket /ws/stream.
    """
    letter:     str   = Field(..., description="Predicted sign letter (A–Z) or '–'.")
    word:       str   = Field(..., description="Current word buffer (letters so far).")
    english:    str   = Field(..., description="English text for the predicted word/letter.")
    sinhala:    str   = Field(..., description="Sinhala (සිංහල) text.")
    tamil:      str   = Field(..., description="Tamil (தமிழ்) text.")
    confidence: float = Field(..., description="Model confidence [0.0 – 1.0].", ge=0.0, le=1.0)
    found:      bool  = Field(..., description="Whether the word was found in the SLSL dictionary.")


class HealthResponse(BaseModel):
    """Liveness probe response."""
    status:  str = Field(default="ok")
    version: str = Field(default="1.0.0")
    model:   str = Field(default="dnn")


class DictionaryEntry(BaseModel):
    """Single SLSL dictionary entry."""
    word:    str
    english: str
    sinhala: str
    tamil:   str


class DictionaryResponse(BaseModel):
    """Full dictionary listing."""
    count:   int
    entries: list[DictionaryEntry]
