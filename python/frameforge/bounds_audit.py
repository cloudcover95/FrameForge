"""Attribute / blastzone / season-lock sanity. No third-party deps."""
from __future__ import annotations

from .seasons import BLAST, MAIN, PLATS_EXTRA, PLATS_LEGAL

WEIGHT = (50, 140)
GRAVITY = (0.05, 0.40)


def audit(catalog) -> dict:
    failures: list[str] = []
    for fid, data in catalog.fighters.items():
        attrs = data.get("attributes") or {}
        w = float(attrs.get("weight", 0))
        if not WEIGHT[0] <= w <= WEIGHT[1]:
            failures.append(f"{fid}: weight {w} outside {WEIGHT}")
        g = float(attrs.get("gravity", 0))
        if not GRAVITY[0] <= g <= GRAVITY[1]:
            failures.append(f"{fid}: gravity {g} outside {GRAVITY}")
    for sid, data in catalog.stages.items():
        rules = data.get("rules") or {}
        if any(rules.get(k) for k in ("walk_offs", "walls", "hazards")):
            failures.append(f"{sid}: illegal floor flags {rules}")
        blast = data.get("blastzones") or BLAST
        if float(blast.get("right", 0)) <= float(blast.get("left", 0)):
            failures.append(f"{sid}: blastzone left/right inverted")
        if int(blast.get("left", 0)) != BLAST["left"] or int(blast.get("right", 0)) != BLAST["right"]:
            failures.append(f"{sid}: blast not forge_standard")
    if MAIN["w"] != 168:
        failures.append("main width lock broken")
    if len(PLATS_LEGAL) != 2 or len(PLATS_EXTRA) != 2:
        failures.append("plat recipe lock broken")
    return {"ok": not failures, "failures": failures}
