"""
evaluate.py
===========
BEGINNER NOTE: run this AFTER train.py, any time you want to check
"how good are my current saved models, really?" against data they've
never seen (test.csv).

    python3 -m backend.ml.evaluate

Produces results/predictions_on_test.csv, results/feature_importance.png,
results/predicted_vs_actual.png, and results/summary_report.txt.
"""

import warnings

warnings.filterwarnings("ignore")

import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score

from backend.ml.config import FEATURE_COLUMNS, TARGET_COLUMNS, RESULTS_DIR
from backend.ml.data import load_test_data
from backend.ml.predict import HealthPredictor


def evaluate() -> dict:
    RESULTS_DIR.mkdir(exist_ok=True)

    predictor = HealthPredictor.load()
    test_df = load_test_data()

    scored = predictor.predict_batch(test_df)
    scored.to_csv(RESULTS_DIR / "predictions_on_test.csv", index=False)

    scores = {}
    for target in TARGET_COLUMNS:
        y_true = test_df[target].values
        y_pred = scored[f"{target}_predicted"].values
        scores[target] = {
            "MAE": mean_absolute_error(y_true, y_pred),
            "R2": r2_score(y_true, y_pred),
        }

    _plot_feature_importance(predictor)
    _plot_predicted_vs_actual(test_df, scored, scores)
    _write_report(scores)

    return scores


def _plot_feature_importance(predictor: HealthPredictor):
    fig, axes = plt.subplots(2, 3, figsize=(16, 9))
    axes = axes.flatten()

    for i, target in enumerate(TARGET_COLUMNS):
        importances = predictor.models[target].feature_importances_
        order = np.argsort(importances)[::-1]

        ax = axes[i]
        ax.barh(
            [FEATURE_COLUMNS[j] for j in order][::-1],
            [importances[j] for j in order][::-1],
            color="#2E5266",
        )
        ax.set_title(target)
        ax.set_xlabel("Importance")

    plt.tight_layout()
    plt.savefig(RESULTS_DIR / "feature_importance.png", dpi=150)
    plt.close()


def _plot_predicted_vs_actual(test_df, scored, scores):
    fig, axes = plt.subplots(2, 3, figsize=(16, 9))
    axes = axes.flatten()

    for i, target in enumerate(TARGET_COLUMNS):
        y_true = test_df[target].values
        y_pred = scored[f"{target}_predicted"].values
        unc = scored[f"{target}_uncertainty"].values

        ax = axes[i]
        ax.errorbar(
            y_true, y_pred, yerr=unc, fmt="o", alpha=0.6,
            ecolor="lightgray", capsize=2, color="#C1440E",
        )
        lims = [min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())]
        ax.plot(lims, lims, "k--", linewidth=1, label="Perfect prediction")
        ax.set_xlabel("Actual")
        ax.set_ylabel("Predicted")
        ax.set_title(f"{target}  (R2={scores[target]['R2']:.3f})")
        ax.legend(fontsize=8)

    plt.tight_layout()
    plt.savefig(RESULTS_DIR / "predicted_vs_actual.png", dpi=150)
    plt.close()


def _write_report(scores: dict):
    lines = ["AEROTHON 2026 - Held-out Test Set Results", "=" * 50, ""]
    for target, s in scores.items():
        lines.append(f"  {target:18s} MAE={s['MAE']:.4f}   R2={s['R2']:.3f}")
    with open(RESULTS_DIR / "summary_report.txt", "w") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    print("Evaluating saved models against test.csv...\n")
    scores = evaluate()
    for target, s in scores.items():
        print(f"  {target:18s} MAE={s['MAE']:.4f}   R2={s['R2']:.3f}")
    print(f"\nResults saved to {RESULTS_DIR}/")
