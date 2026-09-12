"""Minimal 120 Hz match shell. Knockback stays in math_kb."""
from __future__ import annotations

from dataclasses import dataclass, field
from .math_kb import knockback, launch_velocity, hitstun_frames, sakurai_angle


@dataclass
class FighterState:
    fighter_id: str
    x: float = 0.0
    y: float = 0.0
    vx: float = 0.0
    vy: float = 0.0
    percent: float = 0.0
    stocks: int = 4
    grounded: bool = True
    facing: int = 1
    weight: float = 100.0
    hitstun: int = 0

    def apply_hit(self, damage: float, kbg: float, bkb: float, angle: float) -> None:
        self.percent += damage
        kb = knockback(self.percent, damage, self.weight, kbg, bkb)
        ang = sakurai_angle(kb, self.grounded, angle)
        self.vx, self.vy = launch_velocity(kb, ang, self.facing * -1)
        self.grounded = False
        self.hitstun = hitstun_frames(kb)


@dataclass
class Match:
    fighters: list[FighterState] = field(default_factory=list)
    frame: int = 0
    sim_hz: int = 120

    def step(self) -> None:
        self.frame += 1
        for f in self.fighters:
            if not f.grounded:
                f.vy -= 0.17
                f.x += f.vx
                f.y += f.vy
                if f.y <= 0:
                    f.y = 0
                    f.vy = 0
                    f.grounded = True
