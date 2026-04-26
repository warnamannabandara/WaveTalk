import eventlet
eventlet.monkey_patch()

import json
import os
import io
import base64
import numpy as np
from collections import Counter
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'wavetalk-flask-secret')
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='eventlet',
    logger=False,
    engineio_logger=False,
)

# ── Model loading ─────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'sl_sign_language', 'sign_language_model_final.keras')
CLASSES_PATH = os.path.join(BASE_DIR, '..', 'sl_sign_language', 'classes.json')

model = None
classes = []


def load_model():
    global model, classes
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASSES_PATH, 'r') as f:
            classes = json.load(f)
        print(f'[Flask] Sign language model loaded: {len(classes)} classes')
    except Exception as e:
        print(f'[Flask] Warning: Could not load model: {e}')
        print('[Flask] Sign language detection will be unavailable until model is present.')


# Load at import time so gunicorn workers pick it up without needing __main__
load_model()

# ── Per-session state ─────────────────────────────────────────────────────────

session_state = {}

MAX_FRAMES = 50
FEATURE_DIM = 33 * 4   # 33 pose landmarks × (x, y, z, visibility) — must match train_model.py

CONFIDENCE_THRESHOLD = 0.55
PREDICTION_BUFFER_SIZE = 30
MIN_AGREEMENT_COUNT   = 10

# ── REST endpoints ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return jsonify({
        'service': 'WaveTalk Sign Language Server',
        'status': 'running',
        'model_loaded': model is not None,
        'classes_count': len(classes),
    })


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/classes')
def get_classes():
    return jsonify({'classes': classes, 'count': len(classes)})


# ── Socket.IO handlers ────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    sid = request.sid
    session_state[sid] = {
        'frames': [],
        'current_sentence': [],
        'last_word': '',
        'frames_since_last_prediction': 0,
        'recent_predictions': [],
    }
    emit('connected', {
        'message': 'Connected to sign language server',
        'model_ready': model is not None,
    })
    print(f'[Socket] Client connected: {sid}')


@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    session_state.pop(sid, None)
    print(f'[Socket] Client disconnected: {sid}')


@socketio.on('landmarks')
def on_landmarks(data):
    """Receive 132 pose features (33 landmarks × x,y,z,visibility). Emits 'prediction'."""
    sid = request.sid

    if model is None:
        emit('prediction', {
            'word': '...',
            'confidence': 0.0,
            'sentence': 'Model not loaded',
            'error': True,
        })
        return

    state = session_state.get(sid)
    if state is None:
        return

    try:
        landmarks = data if isinstance(data, list) else json.loads(data)

        if len(landmarks) != FEATURE_DIM:
            emit('error', {'message': f'Expected {FEATURE_DIM} features, got {len(landmarks)}'})
            return

        state['frames'].append(landmarks)
        if len(state['frames']) > MAX_FRAMES:
            state['frames'].pop(0)

        state['frames_since_last_prediction'] += 1

        if len(state['frames']) == MAX_FRAMES and state['frames_since_last_prediction'] >= 2:
            state['frames_since_last_prediction'] = 0

            input_data = np.array([state['frames']])
            predictions = model.predict(input_data, verbose=0)

            predicted_idx = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][predicted_idx])
            word = classes[predicted_idx]

            if confidence >= CONFIDENCE_THRESHOLD:
                state['recent_predictions'].append(word)
            else:
                state['recent_predictions'].append('...')

            if len(state['recent_predictions']) > PREDICTION_BUFFER_SIZE:
                state['recent_predictions'].pop(0)

            word_counts = Counter(state['recent_predictions'])
            if word_counts:
                top_word, top_count = word_counts.most_common(1)[0]

                if top_count >= MIN_AGREEMENT_COUNT and top_word != '...' and top_word != state['last_word']:
                    state['current_sentence'].append(top_word)
                    state['last_word'] = top_word
                    state['recent_predictions'].clear()
                    if len(state['current_sentence']) > 15:
                        state['current_sentence'].pop(0)
                elif top_count >= MIN_AGREEMENT_COUNT and top_word == '...':
                    state['last_word'] = ''

            display_word = word if confidence >= CONFIDENCE_THRESHOLD else f'... ({word}?)'
            sentence_display = ' '.join(state['current_sentence']) or 'Waiting for gestures...'

            emit('prediction', {
                'word': display_word,
                'confidence': confidence,
                'sentence': sentence_display,
            })

    except Exception as e:
        print(f'[Socket] landmarks error: {e}')
        emit('error', {'message': str(e)})


@socketio.on('stt:audio')
def on_stt_audio(data):
    """
    Receive audio chunk from browser MediaRecorder (base64-encoded webm/opus).
    Transcribe server-side using Google Speech API via SpeechRecognition library.
    Emits 'stt:result' or 'stt:error' back to the sender.
    """
    try:
        import speech_recognition as sr
        from pydub import AudioSegment

        audio_b64 = data.get('audio', '')
        lang = data.get('lang', 'en-US')
        mime = data.get('mime', 'audio/webm')

        if not audio_b64:
            return

        raw_bytes = base64.b64decode(audio_b64)

        # pydub needs a format hint — strip codec params (e.g. "audio/webm;codecs=opus" → "webm")
        fmt = mime.split('/')[1].split(';')[0].strip()

        segment = AudioSegment.from_file(io.BytesIO(raw_bytes), format=fmt)
        wav_buf = io.BytesIO()
        segment.export(wav_buf, format='wav')
        wav_buf.seek(0)

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_buf) as source:
            audio_data = recognizer.record(source)

        google_api_key = os.environ.get('GOOGLE_API_KEY')
        if google_api_key:
            text = recognizer.recognize_google(audio_data, key=google_api_key, language=lang)
        else:
            text = recognizer.recognize_google(audio_data, language=lang)
        if text:
            emit('stt:result', {'text': text, 'isFinal': True})

    except Exception as e:
        name = type(e).__name__
        if 'UnknownValue' in name:
            return
        if 'RequestError' in name:
            emit('stt:error', {'message': 'Speech API unreachable from server.'})
            return
        print(f'[STT] error: {e}')
        emit('stt:error', {'message': str(e)})


@socketio.on('reset_sentence')
def on_reset():
    sid = request.sid
    if sid in session_state:
        state = session_state[sid]
        state['current_sentence'] = []
        state['last_word'] = ''
        state['recent_predictions'] = []
    emit('sentence_reset', {'sentence': 'Waiting for gestures...'})


# ── Entry point (local dev only — Docker uses gunicorn) ───────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 8000))
    print(f'[Flask] Starting on port {port}')
    # allow_unsafe_werkzeug=True lets the Werkzeug dev server accept the
    # Socket.IO WebSocket upgrade; for production use gunicorn (see Dockerfile)
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
