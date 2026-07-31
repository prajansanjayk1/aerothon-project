"""Physics-derived component health indicators.

Health is expressed as a percentage of a *data-driven* nominal (as-new)
efficiency baseline, not against a hardcoded constant. The baseline for each
component is the 95th percentile of that component's efficiency observed
across the whole fleet in the current run -- i.e. "the best-performing
cycles we actually measured", which is the standard way to baseline
health-monitoring indicators when a dedicated new-engine acceptance test is
not available. Health = clip(efficiency / baseline * 100, 0, 100).

Only three components are separable from the source data: the compressor,
the combustor, and the turbine (see station_features.py for why). This
module intentionally does not report Fan/LPC/HPC, HPT/LPT, afterburner, or
nozzle health individually -- the dataset has no sensors that would let
those be told apart from the lumped compressor/turbine readings, and
inventing numbers for them would not be physics, it would be guessing.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .efficiency_features import build_efficiency_features

_BASELINE_PERCENTILE = 95.0


def _health_from_efficiency(efficiency: pd.Series) -> tuple[pd.Series, float]:
    valid = efficiency.dropna()
    baseline = float(np.percentile(valid, _BASELINE_PERCENTILE)) if len(valid) else float("nan")
    if not np.isfinite(baseline) or baseline <= 0.0:
        return pd.Series(np.nan, index=efficiency.index), baseline
    health = (efficiency.astype(float) / baseline * 100.0).clip(lower=0.0, upper=100.0)
    return health, baseline


def build_health_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, float]]:
    """Build the engine_health_features table and return the baselines used.

    Returns
    -------
    (health_df, baselines) where baselines maps each component name to the
    fleet-wide efficiency value used as its 100% reference point.
    """

    efficiency = build_efficiency_features(df)

    compressor_health, compressor_baseline = _health_from_efficiency(efficiency["compressor_efficiency"])
    combustor_health, combustor_baseline = _health_from_efficiency(efficiency["combustor_efficiency"])
    turbine_health, turbine_baseline = _health_from_efficiency(efficiency["turbine_efficiency"])

    out = pd.DataFrame(index=efficiency.index)
    if "EngineID" in efficiency.columns:
        out["EngineID"] = efficiency["EngineID"]
    if "Cycle" in efficiency.columns:
        out["Cycle"] = efficiency["Cycle"]

    out["CompressorHealth_pct"] = compressor_health
    out["CombustorHealth_pct"] = combustor_health
    out["TurbineHealth_pct"] = turbine_health
    out["OverallHealth_pct"] = out[
        ["CompressorHealth_pct", "CombustorHealth_pct", "TurbineHealth_pct"]
    ].mean(axis=1, skipna=True)

    baselines = {
        "compressor_efficiency_baseline": compressor_baseline,
        "combustor_efficiency_baseline": combustor_baseline,
        "turbine_efficiency_baseline": turbine_baseline,
        "baseline_percentile": _BASELINE_PERCENTILE,
    }
    return out, baselines
