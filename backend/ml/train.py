"""
train.py
========
BEGINNER NOTE: run this file whenever you want to (re)train the
models - e.g. after you get better data, add residual features from
Member 2, or tweak the model settings below.

    python3 -m backend.ml.train

It saves one file per target into trained_models/, e.g.
trained_models/CompressorHealth.joblib. Think of a .joblib file as
a "frozen brain" - all 300 trees' learned rules, saved to disk so you
never have to retrain from scratch just to make a prediction later.
"""

import json
import warnings

warnings.filterwarnings("ignore")  # silences a harmless sklearn warning

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, r2_score

from backend.ml.config import (
    FEATURE_COLUMNS, TARGET_COLUMNS, MODELS_DIR, RANDOM_SEED,
)
from backend.ml.data import load_train_data


def make_model() -> RandomForestRegressor:
    """
    One place that defines the model settings, so every model
    (in training, cross-validation, etc.) is built identically.
    """
    return RandomForestRegressor(
        n_estimators=300,      # 300 trees "voting" together
        max_depth=6,           # keeps each tree simple (avoids memorizing noise)
        min_samples_leaf=3,
        random_state=RANDOM_SEED,
        n_jobs=-1,              # use all available CPU cores
    )


def cross_validate(X, y, n_splits: int = 5) -> dict:
    """
    5-fold cross-validation: split training data into 5 chunks, train
    on 4 and validate on the 5th, repeat 5 times, average the results.
    This gives a trustworthy accuracy estimate even with a small
    dataset (240 rows), where a single lucky/unlucky split could
    mislead you.
    """
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_SEED)
    mae_scores, r2_scores = [], []

    for train_idx, val_idx in kf.split(X):
        model = make_model()
        model.fit(X.iloc[train_idx], y[train_idx])
        preds = model.predict(X.iloc[val_idx])
        mae_scores.append(mean_absolute_error(y[val_idx], preds))
        r2_scores.append(r2_score(y[val_idx], preds))

    return {
        "MAE_mean": float(np.mean(mae_scores)),
        "R2_mean": float(np.mean(r2_scores)),
    }


def train_all_models() -> dict:
    """
    Trains one model per target, saves each to trained_models/, and
    returns a dict of cross-validation scores so you can see how good
    each model is before you go trust it.
    """
    MODELS_DIR.mkdir(exist_ok=True)

    train_df = load_train_data()
    X = train_df[FEATURE_COLUMNS]

    cv_results = {}

    for target in TARGET_COLUMNS:
        y = train_df[target].values

        print(f"Training {target}...")
        cv_results[target] = cross_validate(X, y)

        # Train the FINAL model on ALL 240 training rows (cross-validation
        # above was just to estimate accuracy - now we use every row
        # we have for the model we actually save and use).
        final_model = make_model()
        final_model.fit(X, y)

        model_path = MODELS_DIR / f"{target}.joblib"
        joblib.dump(final_model, model_path)
        print(f"  -> saved to {model_path}")

    # Save the exact feature column order alongside the models. This
    # matters because predict.py needs to feed columns to the model in
    # EXACTLY the order it was trained on.
    with open(MODELS_DIR / "feature_columns.json", "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    return cv_results


if __name__ == "__main__":
    print("=" * 60)
    print("AEROTHON 2026 - Training all health/performance models")
    print("=" * 60)

    scores = train_all_models()

    print("\nCross-validation results (accuracy estimate on training data):")
    for target, s in scores.items():
        print(f"  {target:18s} MAE={s['MAE_mean']:.4f}   R2={s['R2_mean']:.3f}")

    print(f"\nDone. Models saved in trained_models/")
