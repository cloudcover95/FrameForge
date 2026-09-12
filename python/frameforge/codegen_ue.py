"""Emit Unreal Content/Generated from the catalog. Text only — no uasset."""
from __future__ import annotations

import json
from pathlib import Path

from .catalog import Catalog
from .rails import snapshot


def write_generated(root: Path, out: Path | None = None) -> Path:
    cat = Catalog(root / "data")
    dest = out or (root / "unreal" / "FrameForge" / "Content" / "Generated")
    dest.mkdir(parents=True, exist_ok=True)
    roster = {
        "product": "FrameForge",
        "sim_hz": 120,
        "snapshot_hz": 20,
        "fighters": {
            fid: {
                "display_name": data.get("display_name", fid),
                "weight": (data.get("attributes") or {}).get("weight"),
                "archetype": data.get("archetype"),
            }
            for fid, data in cat.fighters.items()
        },
        "stages": list(cat.stages),
        "movesets": {fid: [m["id"] for m in payload.get("moves", [])] for fid, payload in cat.movesets.items()},
        "rails": snapshot(),
        "look": {
            "lumen_gi": False,
            "chaos_fighter_mesh": False,
            "bitnet_knockback_write": False,
        },
        "legal": "Not a Nintendo product. JuniorCloud LLC.",
    }
    path = dest / "Roster.generated.json"
    path.write_text(json.dumps(roster, indent=2), encoding="utf-8")
    header = dest / "FfRoster.generated.inl"
    lines = ["// generated — do not edit", "#pragma once", "namespace FfGenerated {"]
    lines.append("inline constexpr const char* Fighters[] = {")
    for fid in sorted(cat.fighters):
        lines.append(f'  "{fid}",')
    lines.append("};")
    lines.append("}")
    header.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return dest
