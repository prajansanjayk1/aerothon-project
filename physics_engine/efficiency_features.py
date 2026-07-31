"""Component and cycle-level efficiency features derived from physics calculations.

All values in this module are computed from the enriched physics dataframe
produced by :func:`physics_engine.feature_engineering.build_physics_features`.
Nothing here is hardcoded per engine or per cycle; every efficiency is derived
from measured sensor values combined with first-principles Brayton-cycle
relations (see README.md for the exact equations).
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .feature_engineering import build_physics_features


def _speed_of_sound(temperature_k: pd.Series, gamma: pd.Series, r_specific: float = 287.05) -> pd.Series:
    """Ideal-gas speed of sound, used to recover flight velocity from Mach."""

    return np.sqrt(gamma.astype(float) * r_specific * temperature_k.astype(float))


def mass_flow_rate_kg_s(enriched: pd.DataFrame) -> pd.Series:
    """Estimate air mass flow rate from fuel flow and the fuel-air ratio.

    fuel_air_ratio = FuelFlow_kg_s / mass_flow_rate_kg_s (see feature_engineering.py),
    so mass_flow_rate_kg_s = FuelFlow_kg_s / fuel_air_ratio. This is an estimate,
    not a directly measured quantity -- the source dataset has no dedicated air
    mass-flow sensor column.
    """

    fuel_flow = enriched.get("FuelFlow_kg_s", pd.Series([0.0] * len(enriched), index=enriched.index)).astype(float)
    far = enriched["fuel_air_ratio"].astype(float)
    return pd.Series(
        np.where(far > 1e-9, fuel_flow / far.replace(0.0, np.nan), np.nan),
        index=enriched.index,
    )


def _propulsive_efficiency(enriched: pd.DataFrame, mass_flow_kg_s: pd.Series) -> pd.Series:
    """Propulsive efficiency eta_p = 2*V0 / (Vj + V0).

    V0 is the flight (ambient) velocity recovered from Mach and the local
    speed of sound; Vj is the effective jet velocity implied by measured
    thrust and the estimated mass flow rate. Undefined at V0 = 0 (static
    ground test), where propulsive efficiency has no physical meaning; those
    rows are reported as 0.0 rather than an arbitrary large number.
    """

    mach = enriched.get("Mach", pd.Series([0.0] * len(enriched), index=enriched.index)).astype(float)
    v0 = mach * _speed_of_sound(enriched["atm_temperature_k"], enriched["atm_gamma"])
    thrust = enriched.get("Thrust_N", enriched.get("thrust", pd.Series([0.0] * len(enriched), index=enriched.index))).astype(float)

    with np.errstate(divide="ignore", invalid="ignore"):
        vj = v0 + np.where(mass_flow_kg_s > 1e-9, thrust / mass_flow_kg_s, np.nan)

    denom = vj + v0
    eta_p = np.where((v0 > 1e-6) & (denom > 1e-6), 2.0 * v0 / denom, 0.0)
    return pd.Series(eta_p, index=enriched.index).clip(lower=0.0, upper=1.0)


def build_efficiency_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build the efficiency_features table (one row per EngineID/Cycle).

    Reuses efficiency terms already computed by build_physics_features
    (compressor/turbine isentropic efficiency, combustor efficiency, thermal
    efficiency) and adds propulsive and overall efficiency on top.
    """

    enriched = build_physics_features(df)
    mass_flow_kg_s = mass_flow_rate_kg_s(enriched)
    propulsive_efficiency = _propulsive_efficiency(enriched, mass_flow_kg_s)
    thermal_efficiency = enriched["thermal_efficiency"].astype(float)

    out = pd.DataFrame(index=enriched.index)
    if "EngineID" in enriched.columns:
        out["EngineID"] = enriched["EngineID"]
    if "Cycle" in enriched.columns:
        out["Cycle"] = enriched["Cycle"]

    out["pressure_ratio"] = enriched["pressure_ratio"].astype(float)
    out["temperature_ratio"] = enriched["temperature_ratio"].astype(float)
    out["compressor_efficiency"] = enriched["compressor_isentropic_efficiency"].astype(float)
    out["turbine_efficiency"] = enriched["turbine_isentropic_efficiency"].astype(float)
    out["combustor_efficiency"] = enriched["combustor_efficiency"].astype(float)
    out["thermal_efficiency"] = thermal_efficiency
    out["propulsive_efficiency"] = propulsive_efficiency
    out["overall_efficiency"] = (thermal_efficiency * propulsive_efficiency).clip(lower=0.0, upper=1.0)

    return out
