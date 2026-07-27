import sys
import os
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure parent directory is in Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.auth.models import Base, engine, SessionLocal, Operator
from backend.auth.password_service import hash_password
from backend.auth.routes import router as auth_router
from backend.auth.face_encoding import serialize_embedding

app = FastAPI(
    title="HAL Aerospace Mission Control - Security & Operational Gateway",
    description="Enterprise Biometric Authentication, Liveness Detection & PKI Session Service",
    version="2026.2.0-PROD"
)

# Configure CORS for Vite React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow local dev ports 5173, 3000, 8080
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

def seed_default_operators():
    """Seed initial military commanders and propulsion engineers if database is empty."""
    db = SessionLocal()
    try:
        if db.query(Operator).count() == 0:
            print("Seeding HAL default military operators into SQLite database...")
            
            # Create dummy 1404-dim normalized embedding vector for seed commanders
            dummy_emb_1 = [round(random.uniform(-0.4, 0.4), 4) for _ in range(1404)]
            dummy_emb_2 = [round(random.uniform(-0.4, 0.4), 4) for _ in range(1404)]
            dummy_emb_3 = [round(random.uniform(-0.4, 0.4), 4) for _ in range(1404)]
            
            seeds = [
                Operator(
                    operator_id="USR-8821",
                    employee_id="EMP-10045",
                    full_name="Wgd Cdr S. Rao (Chief Propulsion Lead)",
                    role="COMMANDER",
                    callsign="DAGGER-LEAD",
                    squadron="No. 45 Sqn (Flying Daggers)",
                    password_hash=hash_password("commander2026"),
                    face_embedding=serialize_embedding(dummy_emb_1),
                    is_active=True
                ),
                Operator(
                    operator_id="USR-4402",
                    employee_id="EMP-10088",
                    full_name="Sqn Ldr K. Sharma (AI Diagnostics Lead)",
                    role="ENGINEER",
                    callsign="VECTRA-02",
                    squadron="No. 18 Sqn (Flying Bullets)",
                    password_hash=hash_password("engineer2026"),
                    face_embedding=serialize_embedding(dummy_emb_2),
                    is_active=True
                ),
                Operator(
                    operator_id="USR-9104",
                    employee_id="EMP-10112",
                    full_name="Flt Lt M. Varma (Flight Envelope Analyst)",
                    role="ANALYST",
                    callsign="TELEMETRY-09",
                    squadron="HAL Overhaul & Maintenance Division",
                    password_hash=hash_password("analyst2026"),
                    face_embedding=serialize_embedding(dummy_emb_3),
                    is_active=True
                ),
            ]
            
            db.add_all(seeds)
            db.commit()
            print("Successfully seeded 3 default HAL operators.")
    except Exception as e:
        print(f"Error seeding default operators: {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    print("Initializing SQLite Database Tables...")
    Base.metadata.create_all(bind=engine)
    seed_default_operators()
    print("HAL Aerospace Backend Operational Gateway Ready.")

@app.get("/")
def root():
    return {
        "system": "HAL Aerospace Mission Control Backend",
        "status": "ONLINE // AIR-GAPPED",
        "docs_url": "/docs",
        "api_v1": "/api/v1/auth"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
