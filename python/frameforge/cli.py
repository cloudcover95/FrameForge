"""Studio CLI. stdlib only."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def cmd_test(_args) -> int:
    from . import tests_inline
    return tests_inline.run()


def cmd_codegen(args) -> int:
    from .codegen_ue import write_generated
    dest = write_generated(ROOT, Path(args.out) if args.out else None)
    print(f"codegen-ue -> {dest}")
    return 0


def cmd_quant(args) -> int:
    from .bitnet_quant import run_pipeline
    dest = Path(args.out) if getattr(args, "out", "") else ROOT / "data" / "ai"
    meta = run_pipeline(dest)
    print(json.dumps({k: v for k, v in meta.items() if k != "probe"}, indent=2))
    print("probe", meta.get("probe", {}).get("intent"))
    return 0


def cmd_emit(_args) -> int:
    from . import blend_bridge, mesh_emit
    blend = blend_bridge.emit(ROOT)
    written = mesh_emit.emit_roster(ROOT)
    print(json.dumps({"blender": blend, "stdlib_gltf": written}, indent=2))
    return 0


def cmd_skin(args) -> int:
    print("skin pass is local-only; copy", args.src, "to blender_out/skins/user_cub.png")
    return 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="frameforge")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("test")
    cg = sub.add_parser("codegen-ue")
    cg.add_argument("--out", default="")
    q = sub.add_parser("quant")
    q.add_argument("--out", default="")
    eng = sub.add_parser("engine")
    eng.add_argument("--out", default="")
    sub.add_parser("emit-meshes")
    sk = sub.add_parser("skin")
    sk.add_argument("--src", default="")
    args = p.parse_args(argv)
    if args.cmd == "test":
        return cmd_test(args)
    if args.cmd == "codegen-ue":
        return cmd_codegen(args)
    if args.cmd in {"quant", "engine"}:
        return cmd_quant(args)
    if args.cmd == "emit-meshes":
        return cmd_emit(args)
    if args.cmd == "skin":
        return cmd_skin(args)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
