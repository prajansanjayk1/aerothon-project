"""Overall (whole-engine, per-cycle) Brayton-cycle performance features.

Every quantity here is derived from the measured station temperatures and
pressures (Tamb/Pamb, T2/P2, T3/P3, T4/P4) plus the ambient specific heat
returned by CoolProp -- nothing is a fixed per-engine constant.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .efficiency_features import mass_flow_rate_kg_s
from .feature_engineering import build_physics_features


def build_overall_engine_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build the overall_engine_features table (one row per EngineID/Cycle)."""

    enriched = build_physics_features(df)
    cp_air = enriched["atm_cp_air_j_kgk"].astype(float)

    tamb = enriched["Tamb_K"].astype(float) if "Tamb_K" in enriched.columns else enriched["atm_temperature_k"].astype(float)
    t2 = enriched["T2_K"].astype(float) if "T2_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    t3 = enriched["T3_K"].astype(float) if "T3_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    t4 = enriched["T4_K"].astype(float) if "T4_K" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p2 = enriched["P2_Pa"].astype(float) if "P2_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p3 = enriched["P3_Pa"].astype(float) if "P3_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    p4 = enriched["P4_Pa"].astype(float) if "P4_Pa" in enriched.columns else pd.Series(np.nan, index=enriched.index)
    pamb = enriched["Pamb_Pa"].astype(float) if "Pamb_Pa" in enriched.columns else enriched["atm_pressure_pa"].astype(float)

    mass_flow_kg_s = mass_flow_rate_kg_s(enriched)
    thrust = enriched.get("Thrust_N", pd.Series(np.nan, index=enriched.index)).astype(float)
    fuel_flow = enriched.get("FuelFlow_kg_s", pd.Series(np.nan, index=enriched.index)).astype(float)

    overall_pressure_ratio = p2 / pamb.replace(0.0, np.nan)
    compressor_temp_ratio = t2 / tamb.replace(0.0, np.nan)
    turbine_expansion_ratio = p3 / p4.replace(0.0, np.nan)
    gamma = enriched["atm_gamma"].astype(float)
    brayton_thermal_efficiency = 1.0 - (1.0 / overall_pressure_ratio) ** ((gamma - 1.0) / gamma)

    compressor_work = cp_air * (t2 - tamb)
    turbine_work = cp_air * (t3 - t4)
    net_work = turbine_work - compressor_work
    heat_added = cp_air * (t3 - t2)
    heat_rejected = cp_air * (t4 - tamb)

    tsfc = np.where(thrust.abs() > 1e-9, fuel_flow / thrust, np.nan)
    specific_thrust = np.where(mass_flow_kg_s > 1e-9, thrust / mass_flow_kg_s, np.nan)

    out = pd.DataFrame(index=enriched.index)
    if "EngineID" in enriched.columns:
        out["EngineID"] = enriched["EngineID"]
    if "Cycle" in enriched.columns:
        out["Cycle"] = enriched["Cycle"]

    out["overall_pressure_ratio"] = overall_pressure_ratio
    out["compressor_temperature_ratio"] = compressor_temp_ratio
    out["turbine_expansion_ratio"] = turbine_expansion_ratio
    out["brayton_thermal_efficiency"] = brayton_thermal_efficiency
    out["compressor_work_j_kg"] = compressor_work
    out["turbine_work_j_kg"] = turbine_work
    out["net_work_j_kg"] = net_work
    out["heat_added_j_kg"] = heat_added
    out["heat_rejected_j_kg"] = heat_rejected
    out["tsfc_kg_per_n_s"] = tsfc
    out["thrust_n"] = thrust
    out["specific_thrust_n_s_per_kg"] = specific_thrust
    out["fuel_air_ratio"] = enriched["fuel_air_ratio"].astype(float)
    out["mass_flow_rate_kg_s"] = mass_flow_kg_s

    return out
