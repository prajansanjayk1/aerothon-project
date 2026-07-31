# Validation Report

## Overview
This report summarizes the agreement between measured and predicted values for the physics-based turbojet model.

## Metrics
- RMSE: 950.721
- MAE: 605.514
- R²: 0.328
- Mean residual: 427.708
- Std residual: 849.080
- Max absolute error: 4277.057
- Median absolute error: 315.883

## Summary statistics
- Measurement mean: 1855.869
- Measurement std: 1159.876
- Prediction mean: 1428.161
- Prediction std: 583.436
- Residual mean: 427.708
- Residual std: 849.080

## Metadata
- dataset: turbojet_complete_dataset.csv
- rows: 300
## Figures
- Prediction vs measurement: [predicted_vs_measurement.png](predicted_vs_measurement.png)
- Residual distribution: [residual_distribution.png](residual_distribution.png)
- Error histogram: [error_histogram.png](error_histogram.png)

## Physics consistency checks
- pressure_ratio_gt_one: fail
- temperature_ratio_gt_one: fail
- thermal_efficiency_in_range: pass
## Interpretation
The model quality should be judged together with the residual diagnostics and the physics-based consistency checks above.
