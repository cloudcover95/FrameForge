"""Stdlib knockback and kill-percent estimator for FrameForge movesets.

Reads data/movesets/*.json (fields: id, dmg, kbg, bkb, ang) and uses the
classic platform-fighter knockback curve to estimate, per move, the lowest
target percent at which knockback reaches a launch threshold. Pure math,
no network, no serving.

Usage:
    python -m frameforge.kill_percent [movesets_dir] [--weight 100] [--threshold 150] [--self-check]
(run with PYTHONPATH=python from the repo root)
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .math_kb import knockback as _kb, sakurai_angle

MAX_PERCENT = 999.0


def knockback(percent: float, dmg: float, kbg: float, bkb: float, weight: float = 100.0) -> float:
    """Knockback for a hit of `dmg` on a target at pre-hit `percent` (wraps math_kb.knockback)."""
    if weight <= -100:
        raise ValueError("weight must be greater than -100")
    return _kb(percent + dmg, dmg, weight, kbg, bkb)


def kill_percent(move: Dict, weight: float = 100.0, threshold: float = 150.0,
                 step: float = 0.5) -> Optional[float]:
    """Lowest pre-hit percent (in `step` increments) where knockback >= threshold, else None."""
    dmg, kbg, bkb = float(move["dmg"]), float(move["kbg"]), float(move["bkb"])
    if step <= 0:
        raise ValueError("step must be positive")
    pct = 0.0
    while pct <= MAX_PERCENT:
        if knockback(pct, dmg, kbg, bkb, weight) >= threshold:
            return pct
        pct += step
    return None


def launch_angle(move: Dict, kb: float, grounded: bool = True) -> float:
    """Resolve the move's angle (including Sakurai 361) via math_kb.sakurai_angle."""
    return sakurai_angle(kb, grounded, move.get("ang", 0))


def table(moves: Iterable[Dict], weight: float = 100.0, threshold: float = 150.0) -> List[Dict]:
    rows = []
    for mv in moves:
        kp = kill_percent(mv, weight, threshold)
        kb = knockback(kp if kp is not None else MAX_PERCENT, mv["dmg"], mv["kbg"], mv["bkb"], weight)
        rows.append({"id": mv["id"], "kill_percent": kp, "angle": launch_angle(mv, kb)})
    rows.sort(key=lambda r: (r["kill_percent"] is None, r["kill_percent"] or 0.0))
    return rows


def load_movesets(directory: Path) -> Dict[str, List[Dict]]:
    out: Dict[str, List[Dict]] = {}
    for path in sorted(Path(directory).glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        out[data.get("fighter_id", path.stem)] = list(data.get("moves", []))
    return out


def _self_check() -> None:
    # Knockback grows monotonically with percent and with kbg.
    a = knockback(0, 10, 80, 20)
    b = knockback(100, 10, 80, 20)
    assert b > a > 20
    assert knockback(50, 10, 100, 20) > knockback(50, 10, 50, 20)
    # Heavier targets take less knockback.
    assert knockback(80, 10, 80, 20, weight=120) < knockback(80, 10, 80, 20, weight=80)
    # bkb alone above threshold kills at 0%.
    assert kill_percent({"dmg": 1, "kbg": 0, "bkb": 200}) == 0.0
    # Zero growth and low base never kills.
    assert kill_percent({"dmg": 1, "kbg": 0, "bkb": 10}) is None
    assert launch_angle({"ang": 361}, 100.0) == 44.0 and launch_angle({"ang": 45}, 100.0) == 45.0
    assert launch_angle({"ang": 361}, 10.0, grounded=True) == 0.0
    rows = table([{"id": "weak", "dmg": 4, "kbg": 30, "bkb": 12, "ang": 361},
                  {"id": "strong", "dmg": 16, "kbg": 98, "bkb": 42, "ang": 40}])
    assert rows[0]["id"] == "strong"


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("movesets", nargs="?", default="data/movesets")
    ap.add_argument("--weight", type=float, default=100.0)
    ap.add_argument("--threshold", type=float, default=150.0)
    ap.add_argument("--self-check", action="store_true")
    args = ap.parse_args(argv)
    if args.self_check:
        _self_check()
        print("kill_percent self-check ok")
        return 0
    for fighter, moves in load_movesets(Path(args.movesets)).items():
        print(f"[{fighter}] weight={args.weight:g} threshold={args.threshold:g}")
        for row in table(moves, args.weight, args.threshold):
            kp = "never" if row["kill_percent"] is None else f"{row['kill_percent']:.1f}%"
            print(f"  {row['id']:<22} {kp:>8}  angle={row['angle']:g}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
