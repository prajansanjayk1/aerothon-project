"""Physics-based engine modeling utilities for Aerothon."""

from .physics_api import augment_with_physics, predict_physics
from .efficiency_features import build_efficiency_features
from .engine_features import build_overall_engine_features
from .station_features import build_station_features
from .health_features import build_health_features
from .metadata import build_physics_metadata

# Validation is available as a dedicated submodule to avoid importing
# matplotlib and other heavy dependencies during lightweight dataset exports.
