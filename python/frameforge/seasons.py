"""Web x UE season aliases. Presenter may 4K / uncapped Hz. Do not boot UE on the home envelope."""
from __future__ import annotations

LOOK_STYLE = "ff_toon"
WEB_SCALE = 0.045
WEB_FOV = {"portrait": 54, "landscape": 42}

BLAST = {"left": -232, "right": 232, "top": 212, "bottom": -128}
MAIN = {"x": 0, "y": 0, "w": 168, "h": 9}
PLATS_LEGAL = (
    {"id": "plat_l", "x": -54, "y": 27, "w": 34, "h": 3},
    {"id": "plat_r", "x": 54, "y": 27, "w": 34, "h": 3},
)
PLATS_EXTRA = (
    {"id": "plat_ml", "x": -28, "y": 48, "w": 30, "h": 3},
    {"id": "plat_mr", "x": 28, "y": 48, "w": 30, "h": 3},
)

ALIASES = {
    "alpine": "alpine_glass",
    "alpine_glass": "alpine",
    "bloomreach": "bloomreach",
    "hearth": "neon_hearth",
    "neon_hearth": "hearth",
    "emberfall": "sunarch",
    "sunarch": "emberfall",
}

SEASONS = {
    "bloomreach": {"web": "bloomreach", "ue": "bloomreach", "season": "spring"},
    "alpine": {"web": "alpine", "ue": "alpine_glass", "season": "autumn"},
    "emberfall": {"web": "emberfall", "ue": "sunarch", "season": "summer"},
    "hearth": {"web": "hearth", "ue": "neon_hearth", "season": "winter"},
}

PRESENTER = {
    "engine": "UE5.4",
    "boot_on_home_envelope": False,
    "max_resolution": (3840, 2160),
    "allow_8k": True,
    "refresh_hz": 0,
    "sim_hz": 120,
    "snapshot_hz": 20,
    "look_style": LOOK_STYLE,
}

TOON_SCALE = {"vesper": 1.0, "quill": 1.05, "relay": 1.02, "forge": 1.18}


def canon_web(stage_id: str) -> str:
    sid = (stage_id or "bloomreach").lower()
    if sid in SEASONS:
        return sid
    return ALIASES.get(sid, "bloomreach")


def canon_ue(stage_id: str) -> str:
    web = canon_web(stage_id)
    return SEASONS[web]["ue"]
