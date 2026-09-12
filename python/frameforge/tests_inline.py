"""Gate-time sim tests. Return 0 on success."""
from __future__ import annotations

from .math_kb import knockback, launch_velocity, hitstun_frames
from .sim import FighterState, Match


def run() -> int:
    kb = knockback(80, 12, 75, 90, 30)
    if abs(kb - 126.84) > 0.05:
        print("knockback sample drifted", kb)
        return 1
    vx, vy = launch_velocity(kb, 40, 1)
    if vx <= 0 or vy <= 0:
        print("launch quadrant wrong", vx, vy)
        return 1
    if hitstun_frames(kb) <= 0:
        print("hitstun zero")
        return 1
    match = Match(
        fighters=[
            FighterState("vesper", x=-20, facing=1, weight=75),
            FighterState("forge", x=20, facing=-1, weight=113),
        ]
    )
    match.fighters[1].apply_hit(12, 90, 30, 40)
    match.step()
    if match.frame != 1:
        return 1
    print("tests_inline ok")
    return 0
