# WaveTalk Monorepo

This repository contains the source code for the WaveTalk application, managed as a monorepo with a unified build and development system.

## Project Structure

- **frontend/**: Next.js frontend application.
- **backend/**: Node.js/Express backend server.
- **flask_server/**: Python Flask server (managed by UV).

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Python (>= 3.12)
- [UV](https://github.com/astral-sh/uv) (Python package manager, optional but creating a venv is handled by it)

### Installation

To install all dependencies for the frontend, backend, and flask server with a single command:

```bash
npm run install:all
```

This will:
1. Install root dependencies.
2. Install frontend dependencies (`npm install`).
3. Install backend dependencies (`npm install`).
4. Install flask server dependencies (`uv sync`).

### Running the Application

To start all services simultaneously in development mode:

```bash
npm run dev:all
```

This will start:
- **Backend Server**: Port 5000 (default)
- **Frontend Server**: Port 3000 (default)
- **Flask Server**: Port 8000
