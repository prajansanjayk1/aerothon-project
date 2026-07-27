"""
data.py
=======
BEGINNER NOTE: this file's only job is "give me clean, ready-to-use
data." Nothing in here trains a model or makes predictions - it's
pure plumbing. Keeping data-loading separate from model-training
means that if the data format ever changes (new column, new file),
you only fix it here, and train.py/predict.py don't need to change
at all.
"""

import pandas as pd
from backend.ml.config import TRAIN_CSV, TEST_CSV, GROUND_TRUTH_CSV, JOIN_KEYS


def load_ground_truth() -> pd.DataFrame:
    """Load the file that has the TRUE health/thrust values for every row."""
    return pd.read_csv(GROUND_TRUTH_CSV)


def load_train_data() -> pd.DataFrame:
    """
    Load the 240 training rows and attach their true labels.

    Returns a single DataFrame where every row has BOTH the sensor
    readings AND the correct answer - this is what a model trains on.
    """
    sensors = pd.read_csv(TRAIN_CSV)
    labels = load_ground_truth()
    # merge = "VLOOKUP": for each sensor row, find the matching label
    # row (same EngineID + Cycle) and glue the columns together.
    return sensors.merge(labels, on=JOIN_KEYS)


def load_test_data() -> pd.DataFrame:
    """
    Load the 60 held-out test rows and attach their true labels.

    IMPORTANT: these labels are ONLY for scoring the model afterwards.
    Never feed them into training - the whole point of a test set is
    that the model has never seen the right answer for these rows.
    """
    sensors = pd.read_csv(TEST_CSV)
    labels = load_ground_truth()
    return sensors.merge(labels, on=JOIN_KEYS)


if __name__ == "__main__":
    # Running "python3 -m backend.ml.data" directly does a quick
    # self-check - useful the first time you set this up, to confirm
    # the CSVs are where config.py expects them.
    train = load_train_data()
    test = load_test_data()
    print(f"Train rows: {len(train)}   Test rows: {len(test)}")
    print(f"Train columns: {list(train.columns)}")
