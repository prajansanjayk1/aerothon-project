import json
import sys
from pathlib import Path
import zipfile

import numpy as np
import pandas as pd

# Show all rows and columns in terminal
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from physics_engine.physics_api import augment_with_physics
from physics_engine.efficiency_features import build_efficiency_features
from physics_engine.engine_features import build_overall_engine_features
from physics_engine.station_features import build_station_features
from physics_engine.health_features import build_health_features
from physics_engine.metadata import build_physics_metadata

root = Path(__file__).resolve().parent

candidate_paths = [
    root.parent / 'turbojet_complete_dataset.csv',
    root / 'data' / 'turbojet_complete_dataset.csv',
]

for dataset_path in candidate_paths:
    if dataset_path.exists():
        break
else:
    raise FileNotFoundError(
        'Could not find turbojet_complete_dataset.csv in the workspace or data folder.'
    )

# ======================================================
# Load Dataset
# ======================================================

raw_df = pd.read_csv(dataset_path)

# ======================================================
# Physics Engine (predictions + residuals) -- existing behavior, unchanged
# ======================================================

out = augment_with_physics(raw_df, target_col='T4_K')

predicted_cols = [
    col for col in out.columns if col.startswith('predicted_')
]

residual_cols = [
    col for col in out.columns
    if col.startswith('residual_') or col.endswith('_residual')
]

residual_dataset = out[
    ['EngineID', 'Cycle'] +
    [col for col in predicted_cols + residual_cols if col in out.columns]
].copy()

# Guard: every exported column must be scalar (no dicts/lists/JSON blobs).
_non_scalar_cols = [
    col for col in residual_dataset.columns
    if residual_dataset[col].apply(lambda v: isinstance(v, (dict, list))).any()
]
if _non_scalar_cols:
    raise TypeError(
        f'residual_dataset.csv would contain non-scalar columns: {_non_scalar_cols}. '
        'Refusing to export -- every exported CSV must contain only scalar values.'
    )

# ======================================================
# NEW: richer physics-derived feature tables
# ======================================================

efficiency_df = build_efficiency_features(raw_df)
overall_engine_df = build_overall_engine_features(raw_df)
station_df = build_station_features(raw_df)
health_df, health_baselines = build_health_features(raw_df)

# ======================================================
# Save Outputs
# ======================================================

output_dir = root / 'Member2_Residuals'
output_dir.mkdir(parents=True, exist_ok=True)

residual_dataset_path = output_dir / 'residual_dataset.csv'
residual_dataset.to_csv(residual_dataset_path, index=False)

efficiency_path = output_dir / 'efficiency_features.csv'
efficiency_df.to_csv(efficiency_path, index=False)

overall_engine_path = output_dir / 'overall_engine_features.csv'
overall_engine_df.to_csv(overall_engine_path, index=False)

station_path = output_dir / 'physics_station_features.csv'
station_df.to_csv(station_path, index=False)

health_path = output_dir / 'engine_health_features.csv'
health_df.to_csv(health_path, index=False)

# ======================================================
# Generate Summary Statistics (existing behavior, unchanged)
# ======================================================

summary_rows = []

for col in residual_cols:

    values = pd.to_numeric(
        residual_dataset[col],
        errors='coerce'
    ).astype(float)

    summary_rows.append({
        'variable': col,
        'mean': float(values.mean()),
        'std': float(values.std(ddof=0)),
        'min': float(values.min()),
        'max': float(values.max()),
        'rmse': float(np.sqrt(np.mean(values ** 2))),
    })

summary_df = pd.DataFrame(summary_rows)

summary_path = output_dir / 'residual_summary.csv'
summary_df.to_csv(summary_path, index=False)

# ======================================================
# Physics Metadata
# ======================================================

exported_features = {
    'residual_dataset.csv': list(residual_dataset.columns),
    'efficiency_features.csv': list(efficiency_df.columns),
    'overall_engine_features.csv': list(overall_engine_df.columns),
    'physics_station_features.csv': list(station_df.columns),
    'engine_health_features.csv': list(health_df.columns),
}

metadata = build_physics_metadata(
    exported_features=exported_features,
    row_count=len(raw_df),
    engine_count=int(raw_df['EngineID'].nunique()) if 'EngineID' in raw_df.columns else 0,
    health_baselines=health_baselines,
)

metadata_path = output_dir / 'physics_metadata.json'
metadata_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')

# Also keep a copy at project root for convenience / Member3 package assembly.
root_metadata_path = root / 'physics_metadata.json'
root_metadata_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')

# ======================================================
# Member2_Residuals/README.md (existing behavior, unchanged)
# ======================================================

readme_path = output_dir / 'README.md'

readme_path.write_text(
    '# Member2 Residuals\n\n'
    'This folder contains the full physics-derived feature export for the turbojet '
    'complete dataset. See the project-level README.md for equations and integration '
    'instructions.\n\n'
    '## Files\n'
    '- residual_dataset.csv\n'
    '- efficiency_features.csv\n'
    '- overall_engine_features.csv\n'
    '- physics_station_features.csv\n'
    '- engine_health_features.csv\n'
    '- residual_summary.csv\n'
    '- physics_metadata.json\n'
    '- README.md\n',
    encoding='utf-8',
)

# ======================================================
# ZIP Export: Member2_Residuals.zip (existing behavior, unchanged)
# ======================================================

zip_path = root / 'Member2_Residuals.zip'

with zipfile.ZipFile(
    zip_path,
    'w',
    compression=zipfile.ZIP_DEFLATED,
) as zipf:

    for file_path in sorted(output_dir.iterdir()):
        if file_path.is_file():
            zipf.write(file_path, arcname=file_path.name)

# ======================================================
# ZIP Export: Member2_PhysicsEngine_Full.zip (entire project)
# ======================================================

full_zip_path = root / 'Member2_PhysicsEngine_Full.zip'
_skip_dirs = {'__pycache__', '.pytest_cache', '.git'}

with zipfile.ZipFile(full_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
    for file_path in sorted(root.rglob('*')):
        if file_path.is_dir():
            continue
        if any(part in _skip_dirs for part in file_path.parts):
            continue
        if file_path.name in {full_zip_path.name}:
            continue
        arcname = Path('Member2_PhysicsEngine') / file_path.relative_to(root)
        zipf.write(file_path, arcname=str(arcname))

# ======================================================
# ZIP Export: Member3_ML_Package.zip (lightweight, flat)
# ======================================================

member3_zip_path = root / 'Member3_ML_Package.zip'
member3_files = [
    residual_dataset_path,
    efficiency_path,
    overall_engine_path,
    station_path,
    health_path,
    summary_path,
    metadata_path,
    root / 'physics_predict.py',
    root / 'README.md',
]

with zipfile.ZipFile(member3_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
    for file_path in member3_files:
        zipf.write(file_path, arcname=file_path.name)

# ======================================================
# PRINT COMPLETE DATASET (Grouped by Engine ID)
# ======================================================

print("\n")
print("=" * 100)
print("           MEMBER 2 - PHYSICS ENGINE RESIDUAL OUTPUT")
print("=" * 100)

for engine_id, group in residual_dataset.groupby("EngineID"):

    print("\n" + "=" * 100)
    print(f"ENGINE ID : {engine_id}")
    print("=" * 100)

    print(group.to_string(index=False))

print("\n" + "=" * 100)
print("END OF COMPLETE RESIDUAL DATASET")
print("=" * 100)

# ======================================================
# Execution Summary
# ======================================================

print("\n")
print("=" * 50)
print("MEMBER2 PHYSICS ENGINE")
print("=" * 50)
print(f"Rows processed                : {len(raw_df)}")
print(f"Unique engines                : {raw_df['EngineID'].nunique() if 'EngineID' in raw_df.columns else 'n/a'}")
print(f"Unique cycles                 : {raw_df['Cycle'].nunique() if 'Cycle' in raw_df.columns else 'n/a'}")
print(f"Residual dataset generated    : {residual_dataset_path}")
print(f"Efficiency dataset generated  : {efficiency_path}")
print(f"Station features generated    : {station_path}")
print(f"Engine health features gen.   : {health_path}")
print(f"Overall engine features gen.  : {overall_engine_path}")
print(f"Physics metadata generated    : {metadata_path}")
print(f"Full ZIP generated            : {full_zip_path}")
print(f"Member3 ZIP generated         : {member3_zip_path}")
print("=" * 50)
print("Completed Successfully")
print("=" * 50)
