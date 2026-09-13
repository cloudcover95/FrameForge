"""FrameForge BitnetCloud sidecar. Local trit only. Do not import from math_kb.py."""
from __future__ import annotations


def trit(v, lo=-0.2, hi=0.2):
    if v < lo:
        return -1
    if v > hi:
        return 1
    return 0


def sample_pad(pad=None):
    p = pad or {}
    return {
        "trit": True,
        "lx": trit(float(p.get("lx", p.get("x", 0)) or 0)),
        "ly": trit(float(p.get("ly", p.get("y", 0)) or 0)),
        "scale_knockback": False,
    }


def merge_intent(base, guest=None):
    out = dict(base or {})
    if not guest:
        return out
    if guest.get("scale_knockback"):
        guest = dict(guest)
        guest["scale_knockback"] = False
    out["cpu_intent"] = guest
    out["quant"] = guest.get("quant")
    pad = guest.get("pad") or guest
    sampled = sample_pad(pad)
    out["lx"] = sampled["lx"]
    out["ly"] = sampled["ly"]
    out["trit"] = True
    return out
