"""FrameForge BitnetCloud sidecar. Do not import from math_kb.py. Not a Nintendo product."""
from __future__ import annotations

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
    if pad.get("trit"):
        out["lx"] = pad.get("lx", out.get("lx", 0))
        out["ly"] = pad.get("ly", out.get("ly", 0))
    return out
