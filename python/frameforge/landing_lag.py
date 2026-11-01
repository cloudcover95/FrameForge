"""Aerial landing-lag helpers for FrameForge.

Pure-Python, dependency-free frame math. Additive module; does not touch
existing knockback / shield-stun code.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Aerial:
    name: str
    startup: int          # first active frame (1-indexed)
    active_end: int       # last active frame
    total: int            # total frames if the move finishes in the air
    landing_lag: int      # frames of lag if landing during the move
    autocancel_before: int = 0  # land before this frame -> autocancel
    autocancel_after: int = 10**9  # land on/after this frame -> autocancel
    autocancel_lag: int = 4   # normal landing lag when autocancelled

    def __post_init__(self) -> None:
        if not (1 <= self.startup <= self.active_end <= self.total):
            raise ValueError("require 1 <= startup <= active_end <= total")
        if self.landing_lag < 0 or self.autocancel_lag < 0:
            raise ValueError("lag must be non-negative")


def landing_lag_for(move: Aerial, land_frame: int, lcancel: bool = False) -> int:
    """Frames of landing lag when touching ground on `land_frame` of `move`.

    Autocancel windows win; otherwise L-cancel halves the lag (rounded down,
    minimum 1 frame).
    """
    if land_frame < 1:
        raise ValueError("land_frame must be >= 1")
    if land_frame > move.total:
        return move.autocancel_lag  # move already over, ordinary landing
    if land_frame < move.autocancel_before or land_frame >= move.autocancel_after:
        return move.autocancel_lag
    lag = move.landing_lag
    if lcancel:
        lag = max(1, lag // 2)
    return lag


def advantage_on_shield(move: Aerial, hit_frame: int, land_frame: int,
                        shield_stun: int, lcancel: bool = False) -> int:
    """Frame advantage after an aerial hits shield then lands.

    Positive means the attacker acts first. The defender is free once
    shield_stun frames elapse after the hit frame; the attacker is free after
    landing lag completes.
    """
    if not (move.startup <= hit_frame <= move.active_end):
        raise ValueError("hit_frame must be within active frames")
    if land_frame < hit_frame:
        raise ValueError("land_frame must be >= hit_frame")
    attacker_free = land_frame + landing_lag_for(move, land_frame, lcancel)
    defender_free = hit_frame + shield_stun
    return defender_free - attacker_free


def _self_check() -> None:
    nair = Aerial("nair", startup=3, active_end=20, total=49, landing_lag=15,
                  autocancel_before=3, autocancel_after=41)
    assert landing_lag_for(nair, 2) == 4            # early autocancel
    assert landing_lag_for(nair, 10) == 15
    assert landing_lag_for(nair, 10, lcancel=True) == 7
    assert landing_lag_for(nair, 45) == 4           # late autocancel
    assert landing_lag_for(nair, 60) == 4           # move ended
    assert advantage_on_shield(nair, 5, 6, 8, lcancel=True) == -0  # 13-13
    assert advantage_on_shield(nair, 5, 6, 8) == 13 - 21
    try:
        Aerial("bad", 5, 4, 10, 3)
    except ValueError:
        pass
    else:
        raise AssertionError("invalid aerial accepted")


if __name__ == "__main__":
    _self_check()
    print("landing_lag self-check OK")
