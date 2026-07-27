# Aerothon 2026 — Member 3 (AI Systems & Prognostics)

This is the AI/prediction backend: it trains models that estimate engine
health, thrust, and fuel efficiency from sensor readings, and serves those
predictions over a web API for the dashboard (Member 4) and Unity (Member 1)
to consume.

## Folder structure

```
backend/
  ml/               <- model training & prediction (the "brain")
    config.py         column names, file paths - the single source of truth
    data.py            loads and merges the CSVs
    train.py           trains models, saves them to trained_models/
    predict.py         loads saved models, makes predictions
    evaluate.py        scores saved models against test.csv, makes plots
  api/               <- the web service other team members call
    schemas.py         defines what requests/responses look like
    main.py             the actual FastAPI app
datasets/            <- train.csv, test.csv, ground_truth.csv
trained_models/       <- populated automatically by train.py (not written by hand)
results/               <- populated automatically by evaluate.py
requirements.txt
```

## One-time setup

You need Python 3.10+ installed. Then, from this project's root folder:

```bash
# 1. Create an isolated environment (keeps this project's packages
#    separate from anything else on your machine)
python3 -m venv .venv

# 2. Activate it
source .venv/bin/activate        # Mac/Linux
.venv\Scripts\activate           # Windows

# 3. Install everything this project needs
pip install -r requirements.txt
```

## Day-to-day usage

Run these commands from the project's ROOT folder (the one with
`requirements.txt` in it), not from inside `backend/`.

**Train the models** (do this first, and again any time the data changes):
```bash
python3 -m backend.ml.train
```

**Check how good the models actually are**, scored against data they've
never seen:
```bash
python3 -m backend.ml.evaluate
```
This writes `results/summary_report.txt` (plain-English scores),
`results/predicted_vs_actual.png`, and `results/feature_importance.png`.

**Start the API** (so Member 4's dashboard or Postman can call it):
```bash
uvicorn backend.api.main:app --reload
```
Then open **http://127.0.0.1:8000/docs** in a browser — this gives you an
interactive page where you can try every endpoint by clicking buttons.

## Why "Cycle" is not a model input

The health labels in this dataset degrade almost perfectly smoothly with
the engine's `Cycle` number. If we let the model use `Cycle` as an input,
it would just memorize "cycle 1 = healthy, cycle 30 = worn out" instead of
learning the actual sensor → health relationship — which defeats the point
of a Digital Twin (a real engine doesn't hand you a "wear counter", only
sensor readings). So `Cycle` is deliberately left out of `FEATURE_COLUMNS`
in `config.py`.

## Current known limitation (important — read this)

The health-score models (Compressor/Combustor/Turbine/Overall) currently
score low (R² ≈ 0.05–0.16) using raw sensors alone. Thrust and TSFC score
very well (R² ≈ 0.97). This isn't a bug — it means the raw sensors mostly
reflect random flight conditions, not engine wear. **The fix is Member 2's
physics residuals** (Measured − Physics-Predicted values). Once those are
available:

1. Add the residual columns to `FEATURE_COLUMNS` in `config.py`.
2. Re-run `python3 -m backend.ml.train` and `python3 -m backend.ml.evaluate`.
3. Expect the health R² scores to improve substantially.

## API quick reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Is the API alive and are models loaded? |
| `/predict` | POST | Predict all 6 targets for one sensor reading |
| `/predict/batch` | POST | Predict for a list of sensor readings |

Example request body for `/predict`:
```json
{
  "Altitude_m": 5000, "Mach": 0.6, "Tamb_K": 250, "Pamb_Pa": 50000,
  "RPM_rev_min": 40000, "FuelFlow_kg_s": 1.4,
  "P2_Pa": 100000, "T2_K": 330, "P3_Pa": 95000, "T3_K": 3300,
  "P4_Pa": 85000, "T4_K": 3200
}
```
