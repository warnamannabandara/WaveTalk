# 🤟 WaveTalk — SLSL Real-Time Sign Language Translation System

> Converts **Sri Lankan Sign Language (SLSL)** gestures into **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)** text in real time using MediaPipe + TensorFlow + FastAPI.

---

## 📁 Project Structure

```
sl_sign_language/
├── data_collection/
│   ├── collect_keypoints.py    # Webcam → MediaPipe → save .npy keypoints
│   └── augment_data.py         # Offline augmentation (flip/jitter/rotate)
├── model/
│   ├── dnn_model.py            # Dense NN architecture (63 → 26 classes)
│   ├── train_dnn.py            # Train & save dnn_model.h5
│   ├── lstm_model.py           # LSTM for dynamic word gestures
│   ├── train_lstm.py           # Train & save lstm_model.h5
│   └── evaluate.py             # Confusion matrix + classification report
├── inference/
│   ├── keypoint_extractor.py   # Reusable MediaPipe wrapper
│   └── realtime_inference.py   # Live webcam inference with CV2 overlay
├── translation/
│   ├── dictionary.py           # 40+ word SLSL multilingual dictionary
│   └── translator.py           # Word → EN/SI/TA lookup with fallback
├── api/
│   ├── main.py                 # FastAPI app (health, dict, predict, ws)
│   ├── schemas.py              # Pydantic request/response models
│   ├── dependencies.py         # Singleton model + extractor (lru_cache)
│   └── routes/
│       ├── predict.py          # POST /predict  (base64 frame → JSON)
│       └── stream.py           # WS   /ws/stream (real-time streaming)
├── data/                       # Auto-created: .npy keypoints per letter
├── saved_models/               # Auto-created after training
├── k8s/
│   ├── deployment.yaml         # K8s Deployment (2 replicas, PVC)
│   ├── service.yaml            # ClusterIP + NGINX Ingress
│   └── hpa.yaml                # HPA: 2–10 pods, CPU 60% / Mem 70%
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## ⚡ Quick Start

### 1. Install dependencies

```bash
cd sl_sign_language
uv sync
```

### 2. Collect gesture data

```bash
uv run data_collection/collect_keypoints.py
```

- Press **A–Z** to label & record keypoints for each letter
- Press **Space** to stop, **Q** to quit
- Aim for **200 samples per letter**

### 3. (Optional) Augment data

```bash
uv run data_collection/augment_data.py
```

Multiplies your dataset 3× using flip, jitter, and rotation.

### 4. Train the DNN model

```bash
uv run model/train_dnn.py --epochs 100 --batch-size 32
```

Saves `saved_models/dnn_model.h5` and `saved_models/label_map.json`.

### 5. Evaluate

```bash
uv run model/evaluate.py
```

Outputs per-class accuracy, confusion matrix PNG, and F1 scores.

### 6. Run real-time inference (webcam)

```bash
uv run inference/realtime_inference.py
```

| Key     | Action                          |
|---------|---------------------------------|
| `SPACE` | Finalise current word           |
| `C`     | Clear letter buffer             |
| `Q`     | Quit                            |

---

## 🚀 FastAPI Server

### Run locally

```bash
uv run uvicorn api.main:app --reload --port 8000
```

📖 Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Endpoints

| Method    | Path           | Description                              |
|-----------|----------------|------------------------------------------|
| `GET`     | `/health`      | Liveness probe                           |
| `GET`     | `/dictionary`  | Full SLSL multilingual word listing      |
| `POST`    | `/predict`     | Single-frame prediction (base64 image)   |
| `WS`      | `/ws/stream`   | Real-time WebSocket streaming            |

### POST /predict example

```bash
# Encode a test frame and call the endpoint
python -c "
import base64, requests, numpy as np, cv2
img = np.zeros((480, 640, 3), dtype=np.uint8)
_, buf = cv2.imencode('.jpg', img)
b64 = base64.b64encode(buf).decode()
r = requests.post('http://localhost:8000/predict', json={'image_base64': b64})
print(r.json())
"
```

**Response:**

```json
{
  "letter":     "A",
  "word":       "A",
  "english":    "A",
  "sinhala":    "A",
  "tamil":      "A",
  "confidence": 0.9821,
  "found":      false
}
```

### WebSocket /ws/stream example (JavaScript)

```js
const ws = new WebSocket('ws://localhost:8000/ws/stream');

ws.onmessage = (event) => {
  const prediction = JSON.parse(event.data);
  console.log(prediction.english, prediction.sinhala, prediction.tamil);
};

// Send JPEG frame bytes
ws.send(jpegFrameBlob);
```

---

## 🐳 Docker

### Build & run

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.

Model files in `saved_models/` are volume-mounted and persist across restarts.

---

## ☸️ Kubernetes

```bash
# Create namespace
kubectl create namespace wavetalk

# Apply all manifests
kubectl apply -f k8s/

# Watch pods
kubectl get pods -n wavetalk -w
```

HPA scales 2 → 10 pods automatically on CPU >60% or Memory >70%.

---

## 🧠 Model Architecture

### Static DNN (A–Z alphabet)

```
Input (63)  →  Dense(256) → BN → Dropout(0.3)
            →  Dense(128) → BN → Dropout(0.2)
            →  Dense(64)
            →  Dense(26, Softmax)
```

### Dynamic LSTM (word-level, optional)

```
Input (30 frames × 63 features)
  →  LSTM(128, return_sequences=True) → Dropout(0.2)
  →  LSTM(64) → Dropout(0.2)
  →  Dense(64) → Dense(N_WORDS, Softmax)
```

---

## 🌐 Multilingual Dictionary

40+ words across greetings, basic needs, family, places, time, and emotions:

| English   | Sinhala  | Tamil          |
|-----------|----------|----------------|
| Hello     | හෙලෝ     | வணக்கம்        |
| Water     | වතුර     | தண்ணீர்        |
| Thank you | ස්තූතියි | நன்றி          |
| Help      | උදව්     | உதவி           |
| Mother    | අම්මා    | அம்மா          |

---

## 📋 Requirements

- Python 3.10–3.12
- Webcam (for data collection and real-time inference)
- TensorFlow 2.15, MediaPipe 0.10, OpenCV 4.9, FastAPI 0.111

---

## 📄 License

MIT — part of the **WaveTalk** project, NSBM Green University.
