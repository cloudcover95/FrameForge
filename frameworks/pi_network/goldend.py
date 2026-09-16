"""GoldEnd — terminal record of one engine process, keyed by Pioneer uid."""
from __future__ import annotations

from typing import Any

from .engine import FrameForge2DPiEngine
from .intent import IntentPolicy
from .pioneer import Pioneer, guest
from .rewards import eligibility, sign_claim, verify_claim

STEPS = ("host_sim", "match_over", "fingerprint", "eligibility", "receipt")


class GoldEnd:
    def __init__(self, pioneer: Pioneer | None, engine: FrameForge2DPiEngine, policy: IntentPolicy | None = None) -> None:
        self.pioneer = pioneer or guest()
        self.engine = engine
        self.policy = policy or IntentPolicy()
        self.log: list[str] = []

    def run_ticks(self, steps: int = 160) -> dict[str, Any]:
        self.log.append("host_sim")
        last: dict[str, Any] = {}
        for _ in range(max(1, steps)):
            acts = []
            rows = self.engine.state
            for i, row in enumerate(rows):
                foe = rows[(i + 1) % len(rows)]
                acts.append(self.policy.act(row, foe))
            last = self.engine.tick(acts)
        return last

    def close(self, last: dict[str, Any] | None = None) -> dict[str, Any]:
        last = last or {
            "frame": self.engine.frame,
            "alive": self.engine.alive,
            "frame_state": [list(r) for r in self.engine.state],
        }
        self.log.append("match_over")
        fp = self.policy.fingerprint(last.get("frame_state") or self.engine.state)
        self.log.append("fingerprint")
        stocks_left = 0
        kos = 0
        for row in self.engine.state:
            stocks_left = max(stocks_left, int(row[6]))
            kos += max(0, self.engine.stocks0 - int(row[6]))
        units = eligibility(self.pioneer.uid, self.engine.frame, stocks_left, kos)
        self.log.append("eligibility")
        claim = sign_claim(
            self.pioneer.uid,
            units,
            self.engine.frame,
            {
                "username": self.pioneer.username,
                "verified": self.pioneer.verified,
                "alive": self.engine.alive,
                "fingerprint": [round(v, 4) for v in fp],
                "steps": list(self.log) + ["receipt"],
            },
        )
        self.log.append("receipt")
        return {
            "pioneer": self.pioneer.as_dict(),
            "frame": self.engine.frame,
            "alive": self.engine.alive,
            "claim": claim,
            "claim_ok": verify_claim(claim),
            "workflow": list(self.log),
        }


def process(pioneer: Pioneer | None = None, n: int = 2, stocks: int = 4, steps: int = 160) -> dict[str, Any]:
    g = GoldEnd(pioneer or guest(), FrameForge2DPiEngine(n=n, stocks=stocks))
    last = g.run_ticks(steps)
    out = g.close(last)
    out["last"] = {"frame": last.get("frame"), "alive": last.get("alive")}
    return out
