# Build context must be the project root (set in docker-compose.yml)
FROM python:3.12-slim

WORKDIR /app

# ffmpeg is required by pydub for audio format conversion (webm → wav)
RUN apt-get update && \
    apt-get install -y --no-install-recommends --fix-missing ffmpeg || \
    (apt-get update && apt-get install -y --no-install-recommends --fix-missing ffmpeg) && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --timeout 600 --retries 5 \
    flask \
    flask-socketio \
    flask-cors \
    "python-socketio[asyncio_client]" \
    numpy \
    tensorflow \
    eventlet \
    SpeechRecognition \
    pydub

# Copy model files to the expected relative path (../sl_sign_language from app.py)
COPY sl_sign_language/sign_language_model_final.keras /app/sl_sign_language/sign_language_model_final.keras
COPY sl_sign_language/classes.json /app/sl_sign_language/classes.json

# Copy flask app
COPY flask_server/app.py /app/flask_server/app.py

WORKDIR /app/flask_server

EXPOSE 8000
CMD ["python", "app.py"]
