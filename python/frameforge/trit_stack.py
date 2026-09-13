"""Compose LIF + FFBN + TritARM + JuniorLLM envelope.

Full stack for JuniorHome. Stdlib. Token-cheap.

  features[16] --LIF--> spikes --FFBN--> 8 logits --TritARM MMIO--> trit
                     \\-- envelope --> JuniorLLM FieldCore (text only)

Never writes percent, stocks, blast, or Chaos. Not a console emulator.
Not a Nintendo product.
"""

from __future__ import annotations

from . import lif_ternary
from . import quant_engine
from . import trit_arm

PORTS = (
    "JuniorBitNetFieldCore",
    "JuniorAstraReason",
    "JuniorFable",
)


def stack_eval(
    feat: list[float],
    seed: list[float] | None = None,
    ticks: int = 8,
    profile: str = "generic_iot",
    port: str = "JuniorBitNetFieldCore",
) -> dict:
    pack = quant_engine.quant_pack(seed or [0.4, -0.2, 0.8, 0.0, 0.1, -0.6] * 22)
    x = (list(feat) + [0.0] * pack["cols"])[: pack["cols"]]
    layer = lif_ternary.LifLayer(
        rows=pack["rows"],
        cols=pack["cols"],
        weights=pack["tern"],
        scale=pack["scale"],
        leak=0.8,
        theta=1.0,
    )
    spikes = lif_ternary.encode_features(x, ticks, layer)
    spiked_feat = (list(spikes) + list(x) + [0.0] * pack["cols"])[: pack["cols"]]
    bit = quant_engine.eval_intent(pack["tern"], pack["rows"], pack["cols"], pack["scale"], spiked_feat)
    lx = float(x[0]) if x else 0.0
    ly = float(x[1]) if len(x) > 1 else 0.0
    atk = float(x[4]) if len(x) > 4 else 0.0
    arm = trit_arm.score_intent(lx, ly, atk, profile=profile)
    route = port if port in PORTS else PORTS[0]
    envelope = {
        "port": route,
        "tokens": [
            "intent",
            bit["action"],
            arm["label"],
            pack["scale"],
        ],
        "trit": arm["trit"],
        "note": "FieldCore scores text/intent. Sim owns knockback.",
    }
    return {
        "bitnet": bit,
        "arm": arm,
        "lif_ticks": ticks,
        "nonzero": pack["nonzero"],
        "bytes_ffbn": pack["bytes_ffbn"],
        "envelope": envelope,
        "authority": "python_sim",
    }


def llm_should_act(envelope: dict) -> bool:
    """JuniorLLM may narrate or tool. It may not tick the match."""
    return envelope.get("port") in PORTS and envelope.get("trit") is not None


def bench_stack(n: int = 2000) -> dict:
    import time

    feat = [0.6, -0.2, 0.4, 1.0, 0.0, 0.0, 0.8, 0.0] + [0.0] * 8
    t0 = time.perf_counter()
    last = None
    for _ in range(n):
        last = stack_eval(feat)
    dt = time.perf_counter() - t0
    return {
        "n": n,
        "seconds": round(dt, 4),
        "per_eval_us": round(dt / max(n, 1) * 1e6, 2),
        "last_action": last["bitnet"]["action"] if last else None,
        "last_trit": last["arm"]["trit"] if last else None,
        "nonzero": last["nonzero"] if last else 0,
    }
