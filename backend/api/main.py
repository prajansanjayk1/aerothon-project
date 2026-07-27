"""
main.py
=======
BEGINNER NOTE: this file turns your trained models into a web service
- a program other programs (the React dashboard, Unity) can talk to
over HTTP, without needing to know anything about Python or ML.

HOW TO RUN THIS (on a machine with internet, so it can install
FastAPI/uvicorn - see requirements.txt):

    pip install -r requirements.txt
    uvicorn backend.api.main:app --reload

Then open http://127.0.0.1:8000/docs in a browser - FastAPI
auto-generates an interactive page where you (or Member 4) can try
every endpoint by clicking buttons, no code required.

ENDPOINTS:
    GET  /health           - "is the service alive?" check
    POST /predict           - predict for ONE engine reading
    POST /predict/batch      - predict for MANY readings at once
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.ml.predict import HealthPredictor
from backend.api.schemas import (
    SensorReading, PredictionResponse, BatchPredictionRequest,
)

app = FastAPI(
    title="Aerothon 2026 - Turbojet Digital Twin API",
    description="Serves health, thrust, and TSFC predictions from the trained models.",
    version="1.0.0",
)

# CORS = lets the React dashboard (running on a different port/domain)
# call this API from a browser without being blocked for security
# reasons. "*" is fine for a hackathon; you'd lock this down in
# production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load all six trained models ONCE, when the server starts - not on
# every request, which would be slow. This is a module-level global,
# reused across every request the server handles.
predictor: HealthPredictor | None = None


@app.on_event("startup")
def load_models():
    global predictor
    try:
        predictor = HealthPredictor.load()
    except FileNotFoundError as e:
        # Don't crash the server - just report the problem clearly
        # when someone actually tries to predict.
        print(f"WARNING: {e}")


@app.get("/health")
def health_check():
    """Simple check: is the API running, and are models loaded?"""
    return {
        "status": "ok",
        "models_loaded": predictor is not None,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(reading: SensorReading):
    """Predict health/thrust/TSFC for a single engine reading."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Run 'python3 -m backend.ml.train' first.",
        )
    result = predictor.predict_one(reading.model_dump())
    return result


@app.post("/predict/batch")
def predict_batch(request: BatchPredictionRequest):
    """Predict for many engine readings in a single call."""
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Run 'python3 -m backend.ml.train' first.",
        )
    results = [
        predictor.predict_one(reading.model_dump())
        for reading in request.readings
    ]
    return {"results": results}
