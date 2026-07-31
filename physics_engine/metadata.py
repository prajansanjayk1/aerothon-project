"""Metadata describing how the physics model was built, for Member 3's use."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

PACKAGE_VERSION = "2.0.0"


def build_physics_metadata(
    exported_features: dict[str, list[str]],
    row_count: int,
    engine_count: int,
    health_baselines: dict[str, float] | None = None,
) -> dict[str, Any]:
    """Assemble the physics_metadata.json payload.

    Parameters
    ----------
    exported_features:
        Mapping of exported CSV filename -> list of column names in that file.
    row_count, engine_count:
        Size of the dataset that was processed in this run.
    health_baselines:
        The fleet-derived efficiency baselines used for health scoring, if
        engine_health_features.csv was generated in this run.
    """

    return {
        "model_name": "Member2 Turbojet Physics Engine",
        "physics_method": (
            "First-principles Brayton-cycle thermodynamics: predicted_* values are "
            "computed from ambient/flight conditions (altitude, Mach, Tamb, Pamb) and "
            "nominal, as-new component relations (isentropic compressor/turbine "
            "relations, combustor energy balance). They are NOT fit or calibrated "
            "against the measured sensor columns -- the only place a regression is "
            "used is the optional linear residual surrogate in residual_engine.py, "
            "which augment_with_physics() calls only when a non-T4 target_col is "
            "requested."
        ),
        "prediction_target": "T4_K (turbine exit / EGT temperature) by default; predict_physics() accepts any column via target_col.",
        "nominal_assumptions": {
            "compressor_relation": "T2_out = Tamb * (1 + 0.35 * (pressure_ratio - 1)); pressure_ratio taken from measured P2/Pamb when available.",
            "turbine_relation": "Isentropic turbine relation using measured T3, P3, P4 and the local ratio of specific heats (gamma) from CoolProp.",
            "combustor_relation": "Ideal temperature rise from fuel-air ratio and a fixed lower heating value (4.3e7 J/kg), compared against the measured T3-T2 rise for combustor_efficiency.",
            "gas_properties": "cp, cv, and gamma for air are evaluated with CoolProp at the local ambient/station temperature and pressure, not hardcoded.",
        },
        "engine_specific_calibration": False,
        "cycle_used_as_prediction_input": False,
        "health_baseline_method": (
            f"{health_baselines.get('baseline_percentile', 95.0)}th percentile of each "
            "component's efficiency across the processed fleet, used as the 100% "
            "reference point (data-driven, not hardcoded)."
            if health_baselines
            else "engine_health_features.csv not generated in this run."
        ),
        "health_baselines": health_baselines or {},
        "dataset_rows_processed": int(row_count),
        "unique_engines_processed": int(engine_count),
        "exported_features": exported_features,
        "version": PACKAGE_VERSION,
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    }
