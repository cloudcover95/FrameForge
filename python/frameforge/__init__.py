"""FrameForge sim + content toolkit. Standard library only."""

from .math_kb import (
    knockback,
    launch_velocity,
    hitstun_frames,
    hitlag_frames,
    apply_di,
    sakurai_angle,
    stale_multiplier,
)
from .catalog import Catalog
from .sim import Match, FighterState

__version__ = "0.1.0-beta"
