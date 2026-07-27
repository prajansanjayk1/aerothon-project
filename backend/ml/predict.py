"""
predict.py
==========
BEGINNER NOTE: train.py's job was "learn from data, save the result."
This file's job is the opposite: "load the saved result, use it on
NEW data." This is the file the API (and eventually Unity/dashboard)
actually calls at runtime - it never re-trains anything, it just
loads the frozen models from disk and asks them for a prediction.

USAGE:
    from backend.ml.predict import HealthPredictor

    predictor = HealthPredictor.load()
    result = predictor.predict({
        "Altitude_m": 5000, "Mach": 0.6, "Tamb_K": 250, "Pamb_Pa": 50000,
        "RPM_rev_min": 40000, "FuelFlow_kg_s": 1.4,
        "P2_Pa": 100000, "T2_K": 330, "P3_Pa": 95000, "T3_K": 3300,
        "P4_Pa": 85000, "T4_K": 3200,
    })
    print(result)
"""

import json
import warnings

warnings.filterwarnings("ignore")

import joblib
import numpy as np
import pandas as pd

from backend.ml.config import TARGET_COLUMNS, MODELS_DIR


class HealthPredictor:
    """
    Wraps all six trained models (Compressor/Combustor/Turbine/Overall
    health, Thrust, TSFC) behind one simple .predict() call.
    """

    def __init__(self, models: dict, feature_columns: list):
        self.models = models                    # {target_name: trained_model}
        self.feature_columns = feature_columns    # exact input order expected

    @classmethod
    def load(cls) -> "HealthPredictor":
        """Load every saved model from trained_models/."""
        feature_path = MODELS_DIR / "feature_columns.json"
        if not feature_path.exists():
            raise FileNotFoundError(
                "No trained models found. Run 'python3 -m backend.ml.train' first."
            )

        with open(feature_path) as f:
            feature_columns = json.load(f)

        models = {}
        for target in TARGET_COLUMNS:
            model_path = MODELS_DIR / f"{target}.joblib"
            models[target] = joblib.load(model_path)

        return cls(models, feature_columns)

    def predict_one(self, sensor_reading: dict) -> dict:
        """
        Predict all six targets for a SINGLE engine reading.

        sensor_reading: a dict like {"Altitude_m": 5000, "Mach": 0.6, ...}
                         must contain every column in FEATURE_COLUMNS.

        Returns a dict like:
            {
              "CompressorHealth": {"prediction": 0.91, "uncertainty": 0.04},
              "Thrust_N": {"prediction": 42000.3, "uncertainty": 1500.2},
              ...
            }
        """
        # Build a single-row DataFrame in the exact column order the
        # models expect - sklearn cares about column order, not names,
        # once you call .values, so this step matters.
        row = pd.DataFrame([sensor_reading])[self.feature_columns]

        results = {}
        for target, model in self.models.items():
            prediction = model.predict(row)[0]

            # Uncertainty trick: ask each of the 300 trees individually,
            # then measure how much they disagree (standard deviation).
            # Tight agreement = confident. Wide spread = unsure.
            tree_predictions = np.array(
                [tree.predict(row)[0] for tree in model.estimators_]
            )
            uncertainty = float(tree_predictions.std())

            results[target] = {
                "prediction": float(prediction),
                "uncertainty": uncertainty,
            }

        return results

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Predict all six targets for MANY rows at once (e.g. an entire
        CSV). Returns a DataFrame with a *_predicted and *_uncertainty
        column added for each target - handy for bulk scoring.
        """
        X = df[self.feature_columns]
        output = df.copy()

        for target, model in self.models.items():
            output[f"{target}_predicted"] = model.predict(X)

            tree_preds = np.stack([tree.predict(X) for tree in model.estimators_])
            output[f"{target}_uncertainty"] = tree_preds.std(axis=0)

        return output


if __name__ == "__main__":
    # Quick manual test: predict on one made-up engine reading.
    predictor = HealthPredictor.load()
    example_reading = {
        "Altitude_m": 5000, "Mach": 0.6, "Tamb_K": 250, "Pamb_Pa": 50000,
        "RPM_rev_min": 40000, "FuelFlow_kg_s": 1.4,
        "P2_Pa": 100000, "T2_K": 330, "P3_Pa": 95000, "T3_K": 3300,
        "P4_Pa": 85000, "T4_K": 3200,
    }
    result = predictor.predict_one(example_reading)
    for target, values in result.items():
        print(f"{target:18s} prediction={values['prediction']:.4f}   "
              f"uncertainty={values['uncertainty']:.4f}")
