"""
schemas.py
==========
BEGINNER NOTE: FastAPI uses "Pydantic models" (Python classes that
describe a shape of data) to automatically:
  1. Validate incoming requests (reject bad data with a clear error
     instead of crashing halfway through your code)
  2. Auto-generate interactive API docs (you get a free webpage at
     /docs where anyone on the team can try the API in a browser)

Think of this file as "the contract" - it's what Member 4 will read
to know exactly what fields to send and what fields they'll get back.
"""

from pydantic import BaseModel, Field
from typing import List


class SensorReading(BaseModel):
    """One engine's sensor readings at a single point in time."""

    Altitude_m: float = Field(..., description="Altitude in metres")
    Mach: float = Field(..., description="Mach number")
    Tamb_K: float = Field(..., description="Ambient temperature, Kelvin")
    Pamb_Pa: float = Field(..., description="Ambient pressure, Pascals")
    RPM_rev_min: float = Field(..., description="Shaft speed, rev/min")
    FuelFlow_kg_s: float = Field(..., description="Fuel flow rate, kg/s")
    P2_Pa: float = Field(..., description="Compressor exit pressure, Pa")
    T2_K: float = Field(..., description="Compressor exit temperature, K")
    P3_Pa: float = Field(..., description="Combustor exit pressure, Pa")
    T3_K: float = Field(..., description="Turbine inlet temperature, K")
    P4_Pa: float = Field(..., description="Turbine exit pressure, Pa")
    T4_K: float = Field(..., description="Turbine exit temperature, K")

    class Config:
        json_schema_extra = {
            "example": {
                "Altitude_m": 5000, "Mach": 0.6, "Tamb_K": 250, "Pamb_Pa": 50000,
                "RPM_rev_min": 40000, "FuelFlow_kg_s": 1.4,
                "P2_Pa": 100000, "T2_K": 330, "P3_Pa": 95000, "T3_K": 3300,
                "P4_Pa": 85000, "T4_K": 3200,
            }
        }


class TargetPrediction(BaseModel):
    """One predicted value plus how confident the model is about it."""
    prediction: float
    uncertainty: float


class PredictionResponse(BaseModel):
    """Everything the model knows about one engine reading."""
    CompressorHealth: TargetPrediction
    CombustorHealth: TargetPrediction
    TurbineHealth: TargetPrediction
    OverallHealth: TargetPrediction
    Thrust_N: TargetPrediction
    TSFC_g_N_s: TargetPrediction


class BatchPredictionRequest(BaseModel):
    """Multiple sensor readings at once, e.g. a whole flight's worth."""
    readings: List[SensorReading]
