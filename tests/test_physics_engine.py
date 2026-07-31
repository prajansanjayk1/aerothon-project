import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from physics_engine.atmosphere import isa_atmosphere
from physics_engine.compressor import compressor_outlet_state
from physics_engine.feature_engineering import build_physics_features
from physics_engine.physics_api import augment_with_physics, predict_physics
from physics_engine.validation import validate_predictions


def test_isa_atmosphere_matches_sea_level_reference():
    state = isa_atmosphere(0.0)
    assert state["temperature_k"] == 288.15
    assert state["pressure_pa"] == 101325.0


def test_compressor_outlet_state_is_consistent():
    state = compressor_outlet_state(288.15, 101325.0, pressure_ratio=2.0)
    assert state["temperature_out_k"] > 288.15
    assert state["pressure_out_pa"] == 202650.0


def test_feature_engineering_adds_physics_features():
    df = pd.DataFrame(
        {
            "Altitude_m": [1000.0],
            "Mach": [0.8],
            "Tamb_K": [288.15],
            "Pamb_Pa": [101325.0],
            "RPM_rev_min": [50000.0],
            "FuelFlow_kg_s": [1.0],
            "P2_Pa": [150000.0],
            "T2_K": [320.0],
            "P3_Pa": [180000.0],
            "T3_K": [1000.0],
            "P4_Pa": [120000.0],
            "T4_K": [1400.0],
        }
    )
    out = build_physics_features(df)
    assert "compressor_pressure_ratio" in out.columns
    assert "compressor_temp_ratio" in out.columns
    assert "fuel_air_ratio" in out.columns
    assert "compressor_isentropic_efficiency" in out.columns
    assert "turbine_isentropic_efficiency" in out.columns
    assert "combustor_efficiency" in out.columns
    assert "T2s_K" in out.columns
    assert "T4s_K" in out.columns


def test_physics_api_returns_predictions_and_residuals():
    df = pd.DataFrame(
        {
            "Altitude_m": [0.0],
            "Mach": [0.0],
            "Tamb_K": [288.15],
            "Pamb_Pa": [101325.0],
            "RPM_rev_min": [50000.0],
            "FuelFlow_kg_s": [1.0],
            "P2_Pa": [120000.0],
            "T2_K": [320.0],
            "P3_Pa": [180000.0],
            "T3_K": [1000.0],
            "P4_Pa": [120000.0],
            "T4_K": [1400.0],
        }
    )
    out = augment_with_physics(df, target_col="T4_K")
    assert "predicted_T4_K" in out.columns
    assert "residual_T4_K" in out.columns
    assert out["residual_T4_K"].iloc[0] != 0.0


def test_physics_api_builds_residuals():
    df = pd.DataFrame(
        {
            "Altitude_m": [0.0],
            "Mach": [0.3],
            "Tamb_K": [288.15],
            "Pamb_Pa": [101325.0],
            "RPM_rev_min": [50000.0],
            "FuelFlow_kg_s": [1.2],
            "P2_Pa": [130000.0],
            "T2_K": [330.0],
            "P3_Pa": [190000.0],
            "T3_K": [1050.0],
            "P4_Pa": [125000.0],
            "T4_K": [1450.0],
        }
    )
    out = augment_with_physics(df, target_col="T4_K")
    assert out["predicted_T4_K"].iloc[0] != out["T4_K"].iloc[0]
    assert out["residual_T4_K"].iloc[0] != 0.0
    assert "training_ready_frame" not in out.columns


def test_validation_module_creates_report_and_plots(tmp_path):
    df = pd.DataFrame(
        {
            "Altitude_m": [0.0, 1000.0, 2000.0],
            "Mach": [0.2, 0.4, 0.6],
            "Tamb_K": [288.15, 280.0, 275.0],
            "Pamb_Pa": [101325.0, 90000.0, 80000.0],
            "RPM_rev_min": [50000.0, 52000.0, 56000.0],
            "FuelFlow_kg_s": [1.0, 1.1, 1.3],
            "P2_Pa": [120000.0, 105000.0, 95000.0],
            "T2_K": [320.0, 310.0, 305.0],
            "P3_Pa": [180000.0, 160000.0, 145000.0],
            "T3_K": [1000.0, 1020.0, 1080.0],
            "P4_Pa": [110000.0, 100000.0, 90000.0],
            "T4_K": [1400.0, 1350.0, 1450.0],
        }
    )
    out = augment_with_physics(df, target_col="T4_K")
    metrics = validate_predictions(
        measurements=out["T4_K"].to_numpy(),
        predictions=out["predicted_T4_K"].to_numpy(),
        output_dir=tmp_path,
        report_name="validation_test.md",
        metadata={"dataset": "synthetic"},
        physics_df=out,
    )
    assert metrics["rmse"] >= 0.0
    assert metrics["mae"] >= 0.0
    assert "predicted_vs_measurement.png" in metrics["plot_paths"]
    assert (tmp_path / "validation_test.md").exists()


def test_predict_physics_has_live_callable_api():
    df = pd.DataFrame(
        {
            "Altitude_m": [0.0],
            "Mach": [0.1],
            "Tamb_K": [288.15],
            "Pamb_Pa": [101325.0],
            "RPM_rev_min": [50000.0],
            "FuelFlow_kg_s": [1.0],
            "P2_Pa": [120000.0],
            "T2_K": [320.0],
            "P3_Pa": [180000.0],
            "T3_K": [1000.0],
            "P4_Pa": [120000.0],
            "T4_K": [1400.0],
        }
    )
    out = predict_physics(df, target_col="T4_K")
    assert "predicted_T4_K" in out.columns
    assert "compressor_isentropic_efficiency" in out.columns
    assert "turbine_isentropic_efficiency" in out.columns
    assert "combustor_efficiency" in out.columns
    assert out["predicted_T4_K"].iloc[0] == out["predicted_T4_K"].iloc[0]


def _sample_multi_row_df():
    return pd.DataFrame(
        {
            "EngineID": [1, 1, 2],
            "Cycle": [1, 2, 1],
            "Altitude_m": [0.0, 1000.0, 2000.0],
            "Mach": [0.2, 0.4, 0.6],
            "Tamb_K": [288.15, 280.0, 275.0],
            "Pamb_Pa": [101325.0, 90000.0, 80000.0],
            "RPM_rev_min": [50000.0, 52000.0, 56000.0],
            "FuelFlow_kg_s": [1.0, 1.1, 1.3],
            "P2_Pa": [150000.0, 140000.0, 130000.0],
            "T2_K": [330.0, 320.0, 315.0],
            "P3_Pa": [145000.0, 135000.0, 125000.0],
            "T3_K": [1000.0, 1020.0, 1080.0],
            "P4_Pa": [90000.0, 85000.0, 80000.0],
            "T4_K": [850.0, 870.0, 900.0],
            "Thrust_N": [21000.0, 22000.0, 23000.0],
        }
    )


def test_compressor_and_turbine_efficiency_are_not_all_nan():
    # Regression test for the issubset(row) vs issubset(row.index) bug:
    # efficiency columns must actually compute on real multi-row data,
    # not silently come out NaN for every row.
    from physics_engine.feature_engineering import build_physics_features

    df = _sample_multi_row_df()
    out = build_physics_features(df)
    assert out["compressor_isentropic_efficiency"].notna().any()
    assert out["turbine_isentropic_efficiency"].notna().any()
    assert out["combustor_efficiency"].notna().any()
    assert (out["compressor_isentropic_efficiency"].dropna().between(0.0, 1.0)).all()
    assert (out["turbine_isentropic_efficiency"].dropna().between(0.0, 1.0)).all()
    assert (out["combustor_efficiency"].dropna().between(0.0, 1.0)).all()


def test_build_efficiency_features_returns_expected_columns():
    from physics_engine.efficiency_features import build_efficiency_features

    df = _sample_multi_row_df()
    out = build_efficiency_features(df)
    expected = {
        "EngineID", "Cycle", "pressure_ratio", "temperature_ratio",
        "compressor_efficiency", "turbine_efficiency", "combustor_efficiency",
        "thermal_efficiency", "propulsive_efficiency", "overall_efficiency",
    }
    assert expected.issubset(set(out.columns))
    assert len(out) == len(df)


def test_build_overall_engine_features_returns_expected_columns():
    from physics_engine.engine_features import build_overall_engine_features

    df = _sample_multi_row_df()
    out = build_overall_engine_features(df)
    expected = {
        "EngineID", "Cycle", "overall_pressure_ratio", "compressor_temperature_ratio",
        "turbine_expansion_ratio", "brayton_thermal_efficiency",
        "compressor_work_j_kg", "turbine_work_j_kg", "net_work_j_kg",
        "heat_added_j_kg", "heat_rejected_j_kg", "tsfc_kg_per_n_s",
        "thrust_n", "specific_thrust_n_s_per_kg", "fuel_air_ratio",
        "mass_flow_rate_kg_s",
    }
    assert expected.issubset(set(out.columns))
    assert len(out) == len(df)


def test_build_station_features_returns_expected_columns():
    from physics_engine.station_features import build_station_features

    df = _sample_multi_row_df()
    out = build_station_features(df)
    assert "Station1_Intake_Temperature_K" in out.columns
    assert "Station4_Turbine_Exit_Temperature_K" in out.columns
    assert len(out) == len(df)


def test_build_health_features_returns_percentages_in_range():
    from physics_engine.health_features import build_health_features

    df = _sample_multi_row_df()
    health, baselines = build_health_features(df)
    for col in ["CompressorHealth_pct", "CombustorHealth_pct", "TurbineHealth_pct", "OverallHealth_pct"]:
        assert col in health.columns
        valid = health[col].dropna()
        assert (valid >= 0.0).all() and (valid <= 100.0).all()
    assert "compressor_efficiency_baseline" in baselines


def test_no_exported_csv_column_contains_non_scalar_values():
    from physics_engine.efficiency_features import build_efficiency_features
    from physics_engine.engine_features import build_overall_engine_features
    from physics_engine.station_features import build_station_features
    from physics_engine.health_features import build_health_features

    df = _sample_multi_row_df()
    frames = [
        build_efficiency_features(df),
        build_overall_engine_features(df),
        build_station_features(df),
        build_health_features(df)[0],
        augment_with_physics(df, target_col="T4_K"),
    ]
    for frame in frames:
        for col in frame.columns:
            assert not frame[col].apply(lambda v: isinstance(v, (dict, list))).any(), col


def test_physics_predict_module_is_importable_and_callable():
    import importlib
    import sys as _sys
    from pathlib import Path as _Path

    module_dir = str(_Path(__file__).resolve().parents[1])
    if module_dir not in _sys.path:
        _sys.path.insert(0, module_dir)
    physics_predict_module = importlib.import_module("physics_predict")

    df = _sample_multi_row_df()
    out = physics_predict_module.physics_predict(df)
    assert "predicted_T4_K" in out.columns
    assert len(out) == len(df)
