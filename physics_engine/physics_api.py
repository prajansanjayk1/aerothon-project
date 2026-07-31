"""High-level API that exposes physics augmentation for dataset rows."""

from __future__ import annotations

import pandas as pd

from .feature_engineering import build_physics_features
from .residual_engine import fit_residual_model, predict_with_residual_model


def _physics_based_prediction(enriched: pd.DataFrame, target_col: str) -> pd.Series:
    """Create a simple thermodynamic proxy prediction for T4."""

    if target_col != "T4_K":
        return pd.Series([float("nan")] * len(enriched), index=enriched.index, name=f"predicted_{target_col}")

    base_temp = enriched["atm_temperature_k"].astype(float)
    compressor_work = enriched["compressor_work"].astype(float)
    combustor_heat = enriched["combustor_heat_release"].astype(float)
    fuel_air_ratio = enriched["fuel_air_ratio"].astype(float)
    predicted = base_temp + 0.25 * combustor_heat + 0.12 * compressor_work + 18.0 * fuel_air_ratio
    return pd.Series(predicted, index=enriched.index, name="predicted_T4_K")


def _compute_supported_physics_predictions(enriched: pd.DataFrame) -> pd.DataFrame:
    """Compute supported physics-based predicted values for each row."""

    index = enriched.index
    atm_temp = enriched["atm_temperature_k"].astype(float)
    atm_press = enriched["atm_pressure_pa"].astype(float)
    pressure_ratio = enriched["pressure_ratio"].astype(float)
    compressor_work = enriched["compressor_work"].astype(float)
    combustor_heat = enriched["combustor_heat_release"].astype(float)
    fuel_air_ratio = enriched["fuel_air_ratio"].astype(float)
    mach = enriched["Mach"].astype(float) if "Mach" in enriched.columns else pd.Series([0.0] * len(enriched), index=index)
    fuelflow = enriched["FuelFlow_kg_s"].astype(float) if "FuelFlow_kg_s" in enriched.columns else pd.Series([0.0] * len(enriched), index=index)

    predicted = pd.DataFrame(index=index)
    predicted["predicted_T4_K"] = _physics_based_prediction(enriched, "T4_K")
    predicted["predicted_P2_Pa"] = atm_press * pressure_ratio
    predicted["predicted_T2_K"] = atm_temp + 0.5 * compressor_work
    predicted["predicted_P3_Pa"] = enriched["P2_Pa"].astype(float) * pressure_ratio if "P2_Pa" in enriched.columns else pd.Series([float("nan")] * len(enriched), index=index)
    predicted["predicted_T3_K"] = atm_temp + combustor_heat / 1000.0
    predicted["predicted_RPM_rev_min"] = 1000.0 + 50.0 * mach
    predicted["predicted_FuelFlow_kg_s"] = 0.5 * fuel_air_ratio
    predicted["predicted_Thrust_N"] = 1000.0 * (fuelflow + 0.5 * mach + 1.0)
    if "TSFC_g_N_s" in enriched.columns:
        predicted["predicted_TSFC_g_N_s"] = predicted["predicted_FuelFlow_kg_s"] / predicted["predicted_Thrust_N"].replace(0.0, float("nan")) * 1000.0
    return predicted


def predict_physics(df: pd.DataFrame, target_col: str | None = None) -> pd.DataFrame:
    """Compute nominal physics predictions for a batch of sensor readings."""

    enriched = build_physics_features(df)
    if target_col is None:
        target_col = "T4_K"

    predictions = _compute_supported_physics_predictions(enriched)
    enriched = pd.concat([enriched, predictions], axis=1)

    if target_col in enriched.columns and target_col != "T4_K":
        params = fit_residual_model(enriched, target_col)
        enriched[f"predicted_{target_col}"] = predict_with_residual_model(
            enriched, params, target_col=target_col
        ).astype(float)

    return enriched


def augment_with_physics(df: pd.DataFrame, target_col: str | None = None) -> pd.DataFrame:
    """Augment a dataframe with engineered physics features, predictions, and residuals."""

    enriched = predict_physics(df, target_col=target_col)
    if target_col is None:
        target_col = "T4_K"

    if target_col in enriched.columns and f"predicted_{target_col}" in enriched.columns:
        enriched[f"residual_{target_col}"] = (
            enriched[target_col].astype(float) - enriched[f"predicted_{target_col}"].astype(float)
        )

    for pred_col in [c for c in enriched.columns if c.startswith("predicted_")]:
        actual_col = pred_col.removeprefix("predicted_")
        residual_col = f"residual_{actual_col}"
        if actual_col in enriched.columns:
            enriched[residual_col] = (
                enriched[actual_col].astype(float) - enriched[pred_col].astype(float)
            )

    return enriched
