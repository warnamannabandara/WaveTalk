import json
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os
from collections import Counter

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

try:
    model_path = os.path.join(BASE_DIR, "sign_language_model_final.keras")
    classes_path = os.path.join(BASE_DIR, "classes.json")
    model = tf.keras.models.load_model(model_path)
    with open(classes_path, "r") as f:
        classes = json.load(f)
    print(f"Model and {len(classes)} classes loaded successfully!")
except Exception as e:
    print(f"Error loading model or classes: {e}")
    model, classes = None, []

MAX_FRAMES = 50
FEATURE_DIM = 33 * 4   # 33 pose landmarks × (x, y, z, visibility) — must match train_model.py

# Minimum softmax confidence to count a prediction as valid
CONFIDENCE_THRESHOLD = 0.55

# Sliding-window parameters for sentence building
PREDICTION_BUFFER_SIZE = 30    # number of recent predictions to examine
MIN_AGREEMENT_COUNT   = 10     # how many of those must agree (≈ 33 %)


@app.get("/")
async def get():
    index_path = os.path.join(STATIC_DIR, "index.html")
    with open(index_path, "r") as f:
        return HTMLResponse(f.read())


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    frames: list = []
    current_sentence: list = []
    last_word = ""
    frames_since_last_prediction = 0
    recent_predictions: list = []

    try:
        while True:
            data = await websocket.receive_text()
            landmarks = json.loads(data)

            if len(landmarks) == FEATURE_DIM:
                frames.append(landmarks)

                if len(frames) > MAX_FRAMES:
                    frames.pop(0)

                frames_since_last_prediction += 1

                # Predict every 2 frames once the window is full for responsive UI
                if len(frames) == MAX_FRAMES and frames_since_last_prediction >= 2:
                    frames_since_last_prediction = 0

                    input_data = np.array([frames])
                    predictions = model.predict(input_data, verbose=0)

                    predicted_class_idx = int(np.argmax(predictions[0]))
                    confidence = float(predictions[0][predicted_class_idx])
                    word = classes[predicted_class_idx]

                    # Only push a word into the buffer when we're reasonably confident
                    if confidence >= CONFIDENCE_THRESHOLD:
                        recent_predictions.append(word)
                    else:
                        recent_predictions.append("...")

                    if len(recent_predictions) > PREDICTION_BUFFER_SIZE:
                        recent_predictions.pop(0)

                    # Evaluate buffer to decide whether to commit a word
                    word_counts = Counter(recent_predictions)
                    if word_counts:
                        top_word, top_count = word_counts.most_common(1)[0]

                        if top_count >= MIN_AGREEMENT_COUNT and top_word != "..." and top_word != last_word:
                            current_sentence.append(top_word)
                            last_word = top_word
                            recent_predictions.clear()

                            if len(current_sentence) > 15:
                                current_sentence.pop(0)

                        # If the buffer is dominated by low-confidence frames, allow the same word again
                        elif top_count >= MIN_AGREEMENT_COUNT and top_word == "...":
                            last_word = ""

                    display_word = word if confidence >= CONFIDENCE_THRESHOLD else f"... ({word}?)"
                    sentence_display = " ".join(current_sentence) or "Waiting for gestures..."

                    await websocket.send_text(json.dumps({
                        "word": display_word,
                        "confidence": confidence,
                        "sentence": sentence_display,
                    }))

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
