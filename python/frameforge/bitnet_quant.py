"""AbsMean ternary quant. Intent sidecar only. Combat math stays float.

Contract
--------
- Weights live in {-1, 0, +1}. Scale is mean(|w|) of the source floats.
- Eval skips zeros (adds_only_skip_zero).
- Output never writes percent, stocks, blast, or knockback.
- Sidecars: FFBN packed 2-bit, FFCS CSR, optional FFLF LIF header.
"""
from __future__ import annotations

import json
import struct
from pathlib import Path

from .bitnet_codec import matvec, pack_header, pack_ternary, unpack_header, unpack_ternary
from .csr_store import pack_csr, to_csr

ACTIONS = ("idle", "approach", "attack", "recover", "shield", "ult")


def absmean_scale(weights) -> float:
    if not weights:
        return 1.0
    acc = 0.0
    for w in weights:
        acc += abs(float(w))
    s = acc / len(weights)
    return s if s > 1e-8 else 1.0


def quantize(weights, threshold: float = 0.5) -> tuple[list[int], float]:
    """BitNet-style AbsMean. threshold is in units of scale (0.5 ≈ 1.58-bit)."""
    scale = absmean_scale(weights)
    t = threshold * scale
    out = []
    for w in weights:
        v = float(w)
        if v > t:
            out.append(1)
        elif v < -t:
            out.append(-1)
        else:
            out.append(0)
    return out, scale


def intent_index(logits) -> int:
    if not logits:
        return 0
    best = 0
    peak = logits[0]
    for i, v in enumerate(logits):
        if v > peak:
            peak = v
            best = i
    return best


def eval_policy(tern, rows, cols, scale, feat) -> dict:
    vec = list(feat[:cols]) + [0.0] * max(0, cols - len(feat))
    logits = matvec(tern, rows, cols, vec, scale)
    idx = intent_index(logits)
    return {
        "logits": logits,
        "intent": ACTIONS[idx] if idx < len(ACTIONS) else "idle",
        "index": idx,
        "kb_scale": 1.0,
    }


def demo_weights(rows: int = 6, cols: int = 8, seed: int = 7) -> list[float]:
    w = []
    s = seed
    for _ in range(rows * cols):
        s = (s * 1103515245 + 12345) & 0x7FFFFFFF
        w.append(((s % 2001) - 1000) / 500.0)
    return w


def write_sidecars(out: Path, tern, rows: int, cols: int, scale: float) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    packed = pack_ternary(tern)
    ffbn = pack_header(rows, cols, scale, packed)
    (out / "policy.ffbn").write_bytes(ffbn)
    row_ptr, col_idx, sign = to_csr(tern, rows, cols)
    (out / "policy.ffcs").write_bytes(pack_csr(row_ptr, col_idx, sign, rows, cols, scale))
    fflf = b"FFLF" + struct.pack("<HHff", rows, cols, 0.8, 1.0)
    (out / "policy.fflf").write_bytes(fflf)
    meta = {
        "role": "cpu_policy_logits_only",
        "present": True,
        "rows": rows,
        "cols": cols,
        "scale": scale,
        "nnz": sum(1 for t in tern if t),
        "actions": list(ACTIONS),
        "writes_knockback": False,
    }
    (out / "policy.ffbn.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    return meta


def load_ffbn(path: Path) -> tuple[list[int], int, int, float]:
    rows, cols, scale, blob = unpack_header(path.read_bytes())
    tern = unpack_ternary(blob, rows * cols)
    return tern, rows, cols, scale


def run_pipeline(out: Path, rows: int = 6, cols: int = 8) -> dict:
    floats = demo_weights(rows, cols)
    tern, scale = quantize(floats)
    meta = write_sidecars(out, tern, rows, cols, scale)
    loaded, r, c, s = load_ffbn(out / "policy.ffbn")
    assert loaded == tern and r == rows and c == cols
    probe = eval_policy(loaded, r, c, s, [1.0] + [0.0] * (cols - 1))
    meta["probe"] = probe
    return meta


def self_test() -> dict:
    tern, scale = quantize([-2.0, -0.01, 0.0, 0.02, 2.0], threshold=0.5)
    assert tern == [-1, 0, 0, 0, 1], tern
    assert scale > 0
    rows, cols = 6, 8
    floats = demo_weights(rows, cols)
    q, sc = quantize(floats)
    assert all(t in (-1, 0, 1) for t in q)
    packed = pack_ternary(q)
    back = unpack_ternary(packed, rows * cols)
    assert back == q
    feat = [0.5] * cols
    a = eval_policy(q, rows, cols, sc, feat)
    assert a["kb_scale"] == 1.0
    assert a["intent"] in ACTIONS
    return {"ok": True, "nnz": sum(1 for t in q if t), "scale": round(sc, 4)}
