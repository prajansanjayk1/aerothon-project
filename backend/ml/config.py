"""
config.py
=========
BEGINNER NOTE: this file has zero logic. It's just a single place that
says "here's where the data lives" and "here are the column names."

Why bother? Because every other file (train.py, predict.py, the API)
needs these same lists. If you typed the column names fresh in each
file and later renamed a sensor column, you'd have to hunt through
every file to fix it. Instead, everything imports from HERE, so you
only ever change it in one place.
"""

from pathlib import Path

# ---------------------------------------------------------------------
# PATHS
# ---------------------------------------------------------------------
# Path(__file__) = this file's own location. We walk up two folders
# (ml/ -> backend/ -> project root) so these paths work no matter
# where you run the script FROM.
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

DATA_DIR = PROJECT_ROOT / "datasets"
MODELS_DIR = PROJECT_ROOT / "trained_models"
RESULTS_DIR = PROJECT_ROOT / "results"

TRAIN_CSV = DATA_DIR / "train.csv"
TEST_CSV = DATA_DIR / "test.csv"
GROUND_TRUTH_CSV = DATA_DIR / "ground_truth.csv"

# ---------------------------------------------------------------------
# COLUMNS
# ---------------------------------------------------------------------
# The sensor readings the model is allowed to use as input.
# NOTE: "Cycle" is deliberately excluded - see the README for why
# (short version: including it lets the model "cheat" by memorizing
# the degradation curve instead of learning from sensors).
FEATURE_COLUMNS = [
    "Altitude_m", "Mach", "Tamb_K", "Pamb_Pa",
    "RPM_rev_min", "FuelFlow_kg_s",
    "P2_Pa", "T2_K", "P3_Pa", "T3_K", "P4_Pa", "T4_K",
]

# The things we're trying to predict. Each gets its own model.
TARGET_COLUMNS = [
    "CompressorHealth", "CombustorHealth", "TurbineHealth",
    "OverallHealth", "Thrust_N", "TSFC_g_N_s",
]

# The columns used to match sensor rows to their true labels.
JOIN_KEYS = ["EngineID", "Cycle"]

RANDOM_SEED = 42
