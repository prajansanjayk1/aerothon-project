"""Gas-path station analysis.

The source dataset instruments four thermodynamic stations per engine cycle:

- Station 1 (Intake / ambient):        Tamb_K, Pamb_Pa
- Station 2 (Compressor exit):         T2_K,  P2_Pa
- Station 3 (Combustor exit / HPT in): T3_K,  P3_Pa
- Station 4 (Turbine exit / EGT):      T4_K,  P4_Pa

Only these four stations are built here because they are the only ones with
real sensor columns in the dataset. A richer instrumentation rig (separate
fan/LPC/HPC taps, HPT/LPT split, afterburner, nozzle) would be needed to
report additional stations -- fabricating numbers for stations that were
never measured would misrepresent the data, so this module does not do that.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .feature_engineering import build_physics_features


def build_station_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build the physics_station_features table (one row per EngineID/Cycle)."""

    enriched = build_physics_features(df)

    tamb = enriched["Tamb_K"].astype(float) if "Tamb_K" in enriched.columns else enriched["atm_temperature_k"].astype(float)
    pamb = enriched["Pamb_Pa"].astype(float) if "Pamb_Pa" in enriched.columns else enriched["atm_pressure_pa"].astype(float)
    t2 = enriched["T2_K"].astype(float) if "T2_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p2 = enriched["P2_Pa"].astype(float) if "P2_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    t3 = enriched["T3_K"].astype(float) if "T3_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p3 = enriched["P3_Pa"].astype(float) if "P3_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    t4 = enriched["T4_K"].astype(float) if "T4_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p4 = enriched["P4_Pa"].astype(float) if "P4_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)

    out = pd.DataFrame(index=enriched.index)
    if "EngineID" in enriched.columns:
        out["EngineID"] = enriched["EngineID"]
    if "Cycle" in enriched.columns:
        out["Cycle"] = enriched["Cycle"]

    out["Station1_Intake_Temperature_K"] = tamb
    out["Station1_Intake_Pressure_Pa"] = pamb

    out["Station2_Compressor_Exit_Temperature_K"] = t2
    out["Station2_Compressor_Exit_Pressure_Pa"] = p2
    out["Station2_Temperature_Rise_K"] = t2 - tamb
    out["Station2_Pressure_Ratio"] = p2 / pamb.replace(0.0, np.nan)
    out["Station2_Temperature_Ratio"] = t2 / tamb.replace(0.0, np.nan)

    out["Station3_Combustor_Exit_Temperature_K"] = t3
    out["Station3_Combustor_Exit_Pressure_Pa"] = p3
    out["Station3_Temperature_Rise_K"] = t3 - t2
    out["Station3_Pressure_Ratio"] = p3 / p2.replace(0.0, np.nan)
    out["Station3_Temperature_Ratio"] = t3 / t2.replace(0.0, np.nan)

    out["Station4_Turbine_Exit_Temperature_K"] = t4
    out["Station4_Turbine_Exit_Pressure_Pa"] = p4
    out["Station4_Temperature_Drop_K"] = t3 - t4
    out["Station4_Pressure_Ratio"] = p4 / p3.replace(0.0, np.nan)
    out["Station4_Temperature_Ratio"] = t4 / t3.replace(0.0, np.nan)

    return out
