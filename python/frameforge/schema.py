"""Lightweight catalog validators. Stdlib only."""
from __future__ import annotations

ATTR_KEYS = ("weight", "gravity", "terminal_velocity", "walk_speed", "dash_speed", "jump_v")


def _need(data: dict, key: str, errors: list[str], prefix: str) -> None:
    if key not in data:
        errors.append(f"{prefix}: missing {key}")


def fighter(data: dict) -> list[str]:
    errors: list[str] = []
    _need(data, "id", errors, "fighter")
    _need(data, "display_name", errors, data.get("id", "?"))
    attrs = data.get("attributes") or {}
    for key in ATTR_KEYS:
        if key not in attrs:
            errors.append(f"{data.get('id','?')}: missing attribute {key}")
        else:
            try:
                float(attrs[key])
            except (TypeError, ValueError):
                errors.append(f"{data.get('id','?')}: {key} not numeric")
    return errors


def stage(data: dict) -> list[str]:
    errors: list[str] = []
    _need(data, "id", errors, "stage")
    blast = data.get("blastzones") or {}
    for edge in ("left", "right", "top", "bottom"):
        if edge not in blast:
            errors.append(f"{data.get('id','?')}: blastzones.{edge} missing")
    plats = data.get("platforms") or []
    if not plats:
        errors.append(f"{data.get('id','?')}: no platforms")
    rules = data.get("rules") or {}
    for flag in ("walk_offs", "walls", "hazards"):
        if rules.get(flag) is True:
            errors.append(f"{data.get('id','?')}: legal floor forbids {flag}=true")
    return errors


def moveset(payload: dict) -> list[str]:
    errors: list[str] = []
    _need(payload, "fighter_id", errors, "moveset")
    moves = payload.get("moves") or []
    if not moves:
        errors.append(f"{payload.get('fighter_id','?')}: empty moves")
    ids = set()
    for move in moves:
        mid = move.get("id")
        if not mid:
            errors.append(f"{payload.get('fighter_id','?')}: move missing id")
            continue
        if mid in ids:
            errors.append(f"{payload.get('fighter_id','?')}: duplicate move {mid}")
        ids.add(mid)
        for key in ("dmg", "kbg", "bkb", "ang"):
            if key not in move:
                errors.append(f"{payload.get('fighter_id','?')}/{mid}: missing {key}")
    return errors
