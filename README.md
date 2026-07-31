# Member2 Physics Engine

Physics module for the Aerothon 2026 Aircraft Engine Health Monitoring System.
Given raw turbojet sensor readings, this package computes first-principles
Brayton-cycle predictions, residuals against measured values, component
efficiencies, station-by-station gas-path analysis, and physics-derived
component health indicators -- everything Member 3's ML pipeline needs as
input features.

## Folder structure

```
Member2_PhysicsEngine/
├── physics_engine/              # core physics package
│   ├── atmosphere.py            # ISA + CoolProp ambient properties
│   ├── compressor.py            # compressor outlet state
│   ├── combustor.py             # combustor temperature rise
│   ├── turbine.py               # turbine power ratio
│   ├── brayton.py               # compact Brayton-cycle wrapper
│   ├── propulsion.py            # thrust proxy helper
│   ├── feature_engineering.py   # per-row physics features + efficiencies
│   ├── efficiency_features.py   # efficiency_features.csv builder
│   ├── engine_features.py       # overall_engine_features.csv builder
│   ├── station_features.py      # physics_station_features.csv builder
│   ├── health_features.py       # engine_health_features.csv builder
│   ├── metadata.py              # physics_metadata.json builder
│   ├── residual_engine.py       # linear residual surrogate (scipy/sklearn)
│   ├── physics_api.py           # augment_with_physics(), predict_physics()
│   └── validation.py            # RMSE/MAE/R2 report + plots
├── physics_predict.py           # top-level, live-callable entry point
├── data/                        # datasets
├── tests/                       # regression tests (pytest)
├── notebooks/                   # analysis notebooks
├── validation_outputs/          # generated validation report + plots
├── Member2_Residuals/           # generated CSV/JSON feature exports
├── Member2_Residuals.zip        # generated (legacy, backward compatible)
├── Member2_PhysicsEngine_Full.zip   # generated: entire project
├── Member3_ML_Package.zip           # generated: lightweight feature package
└── run_example.py               # runs the full pipeline end to end
```

Nothing in the existing folder layout was renamed or removed; the items
above the "generated" outputs already existed and keep working exactly as
before (`augment_with_physics()` has the same signature and behavior it
always did).

## Physics equations used

Ambient/ISA state (`atmosphere.py`): standard ISA temperature/pressure
lapse, with `cp`, `cv`, and `gamma` for air evaluated via CoolProp at the
local temperature/pressure (not fixed constants).

Compressor (per row, `feature_engineering.py`):
- `T2s = Tamb * (P2/Pamb)^((gamma-1)/gamma)` -- ideal (isentropic) exit temperature
- `compressor_efficiency = (T2s - Tamb) / (T2 - Tamb)`, clipped to `[0, 1]`

Turbine:
- `T4s = T3 * (P4/P3)^((gamma-1)/gamma)` -- ideal (isentropic) exit temperature
- `turbine_efficiency = (T3 - T4) / (T3 - T4s)`, clipped to `[0, 1]`

Combustor:
- `combustor_ideal_temp_rise = fuel_air_ratio * LHV / cp`, with `LHV = 4.3e7 J/kg`
- `combustor_efficiency = (T3 - T2) / combustor_ideal_temp_rise`, clipped to `[0, 1]`

Overall cycle (`engine_features.py`):
- `overall_pressure_ratio = P2 / Pamb`
- `brayton_thermal_efficiency = 1 - (1/OPR)^((gamma-1)/gamma)`
- `compressor_work = cp * (T2 - Tamb)`, `turbine_work = cp * (T3 - T4)`
- `net_work = turbine_work - compressor_work`
- `heat_added = cp * (T3 - T2)`, `heat_rejected = cp * (T4 - Tamb)`
- `propulsive_efficiency = 2*V0 / (Vj + V0)` (0 at Mach 0, where it is
  physically undefined rather than an arbitrary large/small number)
- `overall_efficiency = thermal_efficiency * propulsive_efficiency`

All of the above are computed per row from the measured sensor columns --
none of these coefficients are fit or calibrated per engine or per cycle.

## Residual calculations

`predict_physics()` computes a *nominal* (as-new, first-principles) physics
prediction for `predicted_T4_K`, `predicted_P2_Pa`, `predicted_T2_K`,
`predicted_P3_Pa`, `predicted_T3_K`, `predicted_RPM_rev_min`,
`predicted_FuelFlow_kg_s`, and `predicted_Thrust_N` from ambient/flight
conditions alone. `augment_with_physics()` then subtracts the prediction
from the measured value for each of those columns to produce
`residual_<column>` -- the part of the signal the nominal physics model
cannot explain, which is what carries wear/degradation information for
Member 3's ML model.

The one place a fitted model is used is `residual_engine.py`'s linear
surrogate, and it is only invoked when `target_col` is something other than
`T4_K` -- the default `T4_K` path is pure first-principles, no fitting.

## Station calculations

The dataset instruments four gas-path stations per cycle: intake/ambient,
compressor exit (T2/P2), combustor exit / turbine inlet (T3/P3), and turbine
exit / EGT (T4/P4). `physics_station_features.csv` reports temperature,
pressure, and rise/drop + ratio between each consecutive pair of stations.
(Additional stations shown in early UI mockups -- separate fan/LPC/HPC taps,
HPT/LPT split, afterburner, nozzle -- are not present in the source sensor
data, so they are not fabricated here.)

## Health calculations

`engine_health_features.csv` scores `CompressorHealth_pct`,
`CombustorHealth_pct`, and `TurbineHealth_pct` as
`clip(efficiency / baseline * 100, 0, 100)`, where `baseline` is the 95th
percentile of that component's efficiency across the processed fleet (a
data-driven "best observed" reference point, not a hardcoded constant).
`OverallHealth_pct` is the mean of the three. The exact baseline values used
in a given run are written to `physics_metadata.json` so Member 3 can see
exactly what "100%" means for that run.

Only compressor, combustor, and turbine health are reported -- the dataset
has no instrumentation to separate fan/LPC/HPC, HPT/LPT, afterburner, or
nozzle behavior individually, so those are intentionally not invented.

## Exported CSV / JSON files

All generated into `Member2_Residuals/` (and copied into the two zip
packages below):

| File | Contents |
|---|---|
| `residual_dataset.csv` | `EngineID`, `Cycle`, all `predicted_*` and `residual_*` scalar columns |
| `efficiency_features.csv` | `EngineID`, `Cycle`, pressure/temperature ratios, compressor/turbine/combustor/thermal/propulsive/overall efficiency |
| `overall_engine_features.csv` | `EngineID`, `Cycle`, OPR, work/heat terms, TSFC, thrust, specific thrust, fuel-air ratio, estimated mass flow |
| `physics_station_features.csv` | Per-station temperature, pressure, rise/drop, and ratios |
| `engine_health_features.csv` | Compressor/combustor/turbine/overall health percentages |
| `residual_summary.csv` | Mean/std/min/max/RMSE per residual column (unchanged from before) |
| `physics_metadata.json` | Model name, method, assumptions, health baselines, exported feature lists, version, generation timestamp |

Every exported CSV contains scalar values only -- `run_example.py` actively
checks for and refuses to export any dict/list-valued column.

## How Member 3 should integrate

```python
from physics_predict import physics_predict

# sensor_dataframe: a pandas DataFrame with the same columns as
# data/turbojet_complete_dataset.csv (EngineID, Cycle, Altitude_m, Mach,
# Tamb_K, Pamb_Pa, RPM_rev_min, FuelFlow_kg_s, P2_Pa, T2_K, P3_Pa, T3_K,
# P4_Pa, T4_K, ...)
physics_df = physics_predict(sensor_dataframe)
```

This works one row at a time (a single live sensor reading) or on a full
batch dataframe, and returns everything `augment_with_physics()` produces:
physics features, efficiencies, `predicted_*`, and `residual_*` columns.

`physics_predict.py` needs the `physics_engine/` package alongside it to
run. It is included in `Member3_ML_Package.zip` for reference/inference, but
if you only unzip that lightweight package, add the `physics_engine/`
folder from `Member2_PhysicsEngine_Full.zip` next to it (or `pip install -e
.` the full project) before calling it live. The CSV/JSON files in the
lightweight package are self-contained and need no extra setup.

### Python example (batch, offline)

```python
import pandas as pd
from physics_engine.physics_api import augment_with_physics

raw = pd.read_csv("data/train.csv")
augmented = augment_with_physics(raw, target_col="T4_K")
print(augmented.head())
```

### Linux

```bash
cd Member2_PhysicsEngine
pip install -r requirements.txt
python3 run_example.py
python3 -m pytest tests/ -v
```

### Windows (PowerShell)

```powershell
cd Member2_PhysicsEngine
pip install -r requirements.txt
python run_example.py
python -m pytest tests/ -v
```

## Two ZIP packages

- `Member2_PhysicsEngine_Full.zip`: the entire project (code, tests,
  notebooks, data, generated outputs).
- `Member3_ML_Package.zip`: just the files Member 3 needs --
  `residual_dataset.csv`, `efficiency_features.csv`,
  `overall_engine_features.csv`, `physics_station_features.csv`,
  `engine_health_features.csv`, `residual_summary.csv`,
  `physics_metadata.json`, `physics_predict.py`, `README.md`.

Both are (re)generated by `python3 run_example.py`.
