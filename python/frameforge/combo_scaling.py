"""Combo damage scaling helpers for FrameForge.

Pure-Python, dependency-free. Computes per-hit damage under a
multiplicative scaling curve with a floor, as used by many fighting
games: each successive hit in a combo is scaled by ``decay`` until the
scale reaches ``floor``.
"""

from __future__ import annotations

from typing import Iterable, List


def scale_for_hit(index: int, decay: float = 0.9, floor: float = 0.3,
                  free_hits: int = 1) -> float:
    """Return the damage multiplier for the hit at zero-based ``index``.

    The first ``free_hits`` hits are unscaled; afterwards each hit is
    multiplied by ``decay`` once more, never dropping below ``floor``.
    """
    if index < 0:
        raise ValueError("index must be >= 0")
    if not 0.0 < decay <= 1.0:
        raise ValueError("decay must be in (0, 1]")
    if not 0.0 <= floor <= 1.0:
        raise ValueError("floor must be in [0, 1]")
    if free_hits < 0:
        raise ValueError("free_hits must be >= 0")
    steps = max(0, index - free_hits + 1)
    return max(floor, decay ** steps)


def scaled_damage(raw_hits: Iterable[float], decay: float = 0.9,
                  floor: float = 0.3, free_hits: int = 1) -> List[float]:
    """Return scaled damage for each raw hit value in order."""
    out: List[float] = []
    for i, raw in enumerate(raw_hits):
        if raw < 0:
            raise ValueError("raw damage must be >= 0")
        out.append(raw * scale_for_hit(i, decay, floor, free_hits))
    return out


def combo_total(raw_hits: Iterable[float], decay: float = 0.9,
                floor: float = 0.3, free_hits: int = 1) -> float:
    """Total scaled damage for a combo."""
    return sum(scaled_damage(raw_hits, decay, floor, free_hits))


def _self_check() -> None:
    assert scale_for_hit(0) == 1.0
    assert abs(scale_for_hit(1) - 0.9) < 1e-12
    assert abs(scale_for_hit(2) - 0.81) < 1e-12
    assert scale_for_hit(50) == 0.3
    assert scale_for_hit(1, free_hits=2) == 1.0
    assert scale_for_hit(5, decay=1.0) == 1.0
    assert abs(combo_total([100, 100, 100]) - 271.0) < 1e-9
    assert scaled_damage([]) == []
    for bad in (lambda: scale_for_hit(-1), lambda: scale_for_hit(0, decay=0),
                lambda: scaled_damage([-1])):
        try:
            bad()
        except ValueError:
            pass
        else:
            raise AssertionError("expected ValueError")


if __name__ == "__main__":
    _self_check()
    print("combo_scaling self-check OK")
