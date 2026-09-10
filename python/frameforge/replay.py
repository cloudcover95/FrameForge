"""Dump a short pose ring for 4D vod. No second physics."""
from __future__ import annotations
from dataclasses import asdict, dataclass

@dataclass
class Pose:
    frame: int
    x: float
    y: float
    vx: float
    vy: float
    percent: float
    stocks: int
    action: str

class Replay:
    def __init__(self, sim_hz: int = 120) -> None:
        self.sim_hz = sim_hz
        self.frames: list[Pose] = []
    def push(self, pose: Pose) -> None:
        self.frames.append(pose)
        if len(self.frames) > self.sim_hz * 8:
            self.frames = self.frames[-self.sim_hz * 4 :]
    def slice(self, start: int, count: int) -> list[dict]:
        return [asdict(p) for p in self.frames if start <= p.frame < start + count]
