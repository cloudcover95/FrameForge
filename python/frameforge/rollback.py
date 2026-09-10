"""Host-side rollback. Store poses + inputs, resim on mismatch."""
from __future__ import annotations
from dataclasses import dataclass, field, replace
from .sim import FighterState, InputFrame, Match
@dataclass
class FrameSnap:
    frame: int
    inputs: list[InputFrame]
    fighters: list[FighterState]
@dataclass
class Rollback:
    depth: int = 8
    confirmed: int = 0
    snaps: list[FrameSnap] = field(default_factory=list)
    def push(self, frame: int, match: Match, inputs: list[InputFrame]) -> None:
        self.snaps.append(FrameSnap(frame, list(inputs), [replace(f) for f in match.fighters]))
        if len(self.snaps) > self.depth * 2:
            self.snaps = self.snaps[-self.depth:]
    def find(self, frame: int):
        for s in self.snaps:
            if s.frame == frame: return s
        return None
    def restore(self, match: Match, frame: int) -> bool:
        snap = self.find(frame)
        if not snap: return False
        match.fighters = [replace(f) for f in snap.fighters]
        return True
