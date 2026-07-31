"""Simple, live-callable entry point for Member 3's ML pipeline.

Usage
-----
    from physics_predict import physics_predict
    physics_df = physics_predict(sensor_dataframe)

This is a thin wrapper around physics_engine.physics_api.augment_with_physics
so Member 3 does not need to know about the internal package layout. It works
one row at a time or on a full batch dataframe.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from physics_engine.physics_api import augment_with_physics  # noqa: E402


def physics_predict(df: pd.DataFrame, target_col: str | None = "T4_K") -> pd.DataFrame:
    """Return the input dataframe augmented with physics features, predictions,
    and residuals. Safe to call at request time (no pre-computed CSV required).
    """

    return augment_with_physics(df, target_col=target_col)


if __name__ == "__main__":
    example = pd.DataFrame(
        {
            "EngineID": [1],
            "Cycle": [1],
            "Altitude_m": [5000.0],
            "Mach": [0.5],
            "Tamb_K": [255.0],
            "Pamb_Pa": [54000.0],
            "RPM_rev_min": [45000.0],
            "FuelFlow_kg_s": [0.8],
            "P2_Pa": [150000.0],
            "T2_K": [330.0],
            "P3_Pa": [145000.0],
            "T3_K": [1000.0],
            "P4_Pa": [90000.0],
            "T4_K": [850.0],
        }
    )
    print(physics_predict(example).to_string(index=False))
