"""
main.py
-------
FastAPI application entry point for the SLSL Translation System.

Endpoints:
    GET  /              — Redirect to API docs
    GET  /health        — Liveness probe
    GET  /dictionary    — Full SLSL multilingual word listing
    POST /predict       — Single-frame sign prediction (base64 image)
    WS   /ws/stream     — Real-time WebSocket streaming inference

Run locally:
    uvicorn api.main:app --reload --port 8000

Production (Docker):
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 2
"""

from __future__ import annotations

import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.routes import predict as predict_router
from api.routes import stream  as stream_router
from api.schemas import DictionaryEntry, DictionaryResponse, HealthResponse
from api.dependencies import get_extractor, get_label_map, get_model
from translation.dictionary import SLSL_DICT

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("slsl-api")

# ── CORS configuration ────────────────────────────────────────
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]


# ── Lifespan: pre-load model on startup ───────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Pre-load heavy resources (model + MediaPipe) at startup
    so that the first request is fast.
    """
    logger.info("⏳ Loading DNN model and MediaPipe extractor …")
    try:
        get_model()
        get_label_map()
        get_extractor()
        logger.info("✅ Resources loaded successfully.")
    except FileNotFoundError as exc:
        logger.warning(
            "⚠️  %s — The /predict endpoint will return 503 until the model is trained.", exc
        )
    yield
    # Shutdown hooks (none needed for read-only inference)
    logger.info("🔌 SLSL API shutting down.")


# ── FastAPI application ───────────────────────────────────────
app = FastAPI(
    title="WaveTalk — SLSL Translation API",
    description=(
        "Real-time **Sri Lankan Sign Language (SLSL)** to "
        "**English / Sinhala / Tamil** translation service.\n\n"
        "Built with MediaPipe hand landmarks + TensorFlow DNN."
    ),
    version="1.0.0",
    contact={
        "name": "WaveTalk Dev Team",
        "url":  "https://github.com/warnamannabandara/WaveTalk",
    },
    license_info={"name": "MIT"},
    lifespan=lifespan,
)


# ── Middleware ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ─────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed*1000:.1f}ms"
    return response


# ── Routers ───────────────────────────────────────────────────
app.include_router(predict_router.router, tags=["Prediction"])
app.include_router(stream_router.router,  tags=["Streaming"])


# ── Core routes ───────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to interactive API docs."""
    return RedirectResponse(url="/docs")


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Liveness probe",
)
async def health():
    """Return service health status. Used by Docker HEALTHCHECK and k8s probes."""
    return HealthResponse(status="ok", version="1.0.0", model="dnn")


@app.get(
    "/dictionary",
    response_model=DictionaryResponse,
    tags=["Translation"],
    summary="List all available SLSL word translations",
)
async def dictionary():
    """Return the full SLSL multilingual word dictionary."""
    entries = [
        DictionaryEntry(
            word=word,
            english=data["en"],
            sinhala=data["si"],
            tamil=data["ta"],
        )
        for word, data in sorted(SLSL_DICT.items())
    ]
    return DictionaryResponse(count=len(entries), entries=entries)


# ── Global exception handler ──────────────────────────────────
@app.exception_handler(FileNotFoundError)
async def model_not_found_handler(request: Request, exc: FileNotFoundError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": str(exc),
            "hint":   "Train the model first: python model/train_dnn.py",
        },
    )


# ── Development server ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host=os.getenv("APP_HOST", "0.0.0.0"),
        port=int(os.getenv("APP_PORT", 8000)),
        reload=os.getenv("APP_RELOAD", "false").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info"),
    )
