"""Optional BitNet knockback scale. Float formula stays the source."""
from __future__ import annotations
from .bitnet_codec import matvec
def kb_scale(tern, rows, cols, scale, feat, enabled: bool) -> float:
    if not enabled or not tern: return 1.0
    logits = matvec(tern, rows, cols, feat[:cols], scale)
    peak = max(logits) if logits else 0.0
    t = -1.0 if peak < -1.0 else 1.0 if peak > 1.0 else peak
    return 1.0 + 0.08 * t
