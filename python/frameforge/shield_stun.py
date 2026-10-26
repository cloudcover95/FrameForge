"""Shield stun and shield-drop frame helpers for FrameForge.

Pure-Python, dependency-free frame math for platform-fighter shield
interactions. Additive module; nothing here serves or touches the network.
"""

from __future__ import annotations

from dataclasses import dataclass


def shield_stun(damage: float, multiplier: float = 0.8, base: float = 2.0) -> int:
    """Frames a defender is locked in shield after blocking a hit.

    stun = floor(damage * multiplier + base), never negative.
    """
    if damage < 0:
        raise ValueError("damage must be non-negative")
    if multiplier < 0:
        raise ValueError("multiplier must be non-negative")
    return max(0, int(damage * multiplier + base))


def frame_advantage(attacker_endlag: int, damage: float, **kwargs: float) -> int:
    """Positive means the defender acts first (attack is unsafe on shield)."""
    if attacker_endlag < 0:
        raise ValueError("attacker_endlag must be non-negative")
    return attacker_endlag - shield_stun(damage, **kwargs)


@dataclass(frozen=True)
class OnShield:
    endlag: int
    stun: int

    @property
    def advantage(self) -> int:
        return self.endlag - self.stun

    def punishable_by(self, startup: int, shield_drop: int = 11) -> bool:
        """True if an option with this startup (out of shield drop) lands in time."""
        return shield_drop + startup <= self.advantage


def on_shield(attacker_endlag: int, damage: float, **kwargs: float) -> OnShield:
    return OnShield(attacker_endlag, shield_stun(damage, **kwargs))


def _self_check() -> None:
    assert shield_stun(0) == 2
    assert shield_stun(10) == 10
    assert shield_stun(12.5) == 12
    assert frame_advantage(20, 10) == 10
    s = on_shield(25, 5)
    assert s.stun == 6 and s.advantage == 19
    assert s.punishable_by(8) and not s.punishable_by(9)
    for bad in (lambda: shield_stun(-1), lambda: frame_advantage(-1, 1)):
        try:
            bad()
        except ValueError:
            pass
        else:
            raise AssertionError("expected ValueError")


if __name__ == "__main__":
    _self_check()
    print("shield_stun self-check ok")
