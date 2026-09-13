"""Emit Unreal Content/Generated from the catalog. Text only — no uasset."""
from __future__ import annotations

import json
from pathlib import Path

from .catalog import Catalog
from .rails import snapshot
from .seasons import ALIASES, LOOK_STYLE, PRESENTER, SEASONS, TOON_SCALE


def write_generated(root: Path, out: Path | None = None) -> Path:
    cat = Catalog(root / "data")
    dest = out or (root / "unreal" / "FrameForge" / "Content" / "Generated")
    dest.mkdir(parents=True, exist_ok=True)
    roster = {
        "product": "FrameForge",
        "sim_hz": PRESENTER["sim_hz"],
        "snapshot_hz": PRESENTER["snapshot_hz"],
        "fighters": {
            fid: {
                "display_name": data.get("display_name", fid),
                "weight": (data.get("attributes") or {}).get("weight"),
                "archetype": data.get("archetype"),
                "toon_scale": TOON_SCALE.get(fid, 1.0),
            }
            for fid, data in cat.fighters.items()
        },
        "stages": list(cat.stages),
        "stage_aliases": ALIASES,
        "seasons": SEASONS,
        "movesets": {fid: [m["id"] for m in payload.get("moves", [])] for fid, payload in cat.movesets.items()},
        "rails": snapshot(),
        "look": {
            "style": LOOK_STYLE,
            "lumen_gi": False,
            "chaos_fighter_mesh": False,
            "bitnet_knockback_write": False,
        },
        "presenter": {
            "engine": PRESENTER["engine"],
            "boot_on_home_envelope": False,
            "max_resolution": list(PRESENTER["max_resolution"]),
            "allow_8k": True,
            "refresh_hz": 0,
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
    lines.append("inline constexpr int PresenterMaxW = 3840;")
    lines.append("inline constexpr int PresenterMaxH = 2160;")
    lines.append("inline constexpr int PresenterRefreshHz = 0;")
    lines.append("}")
    header.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return dest
