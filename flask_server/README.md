# WaveTalk Flask Server

This is the Python-based service for WaveTalk, built with Flask and managed by [uv](https://github.com/astral-sh/uv).

## Prerequisites

- Python 3.12+
- `uv` (Fast Python package installer and resolver)

## Installation

This service is automatically installed when running `npm run install:all` from the root directory.

To install manually:

```bash
cd flask_server
uv sync
```

## Running the Server

This service is automatically started when running `npm run dev:all` from the root directory.

To run manually:

```bash
cd flask_server
uv run app.py
```

The server will start on `http://127.0.0.1:8000`.
