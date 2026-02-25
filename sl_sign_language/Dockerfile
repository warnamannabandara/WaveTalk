# ============================================================
# SLSL Translation System — Production Dockerfile (UV)
# ============================================================

FROM ghcr.io/astral-sh/uv:python3.11-slim AS builder

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY pyproject.toml uv.lock ./

# Install dependencies without source code
# This takes advantage of Docker layer caching
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# ── Stage 2: Runtime image ────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install system libs required by OpenCV & MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy the virtualenv from the builder
COPY --from=builder /app/.venv /app/.venv

# Set environment to use the virtualenv
ENV PATH="/app/.venv/bin:$PATH"

# Copy application source
COPY . .

# Create directories expected at runtime
RUN mkdir -p saved_models data

# Non-root user for security
RUN useradd -m -u 1001 slsl && chown -R slsl:slsl /app
USER slsl

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start the API server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
