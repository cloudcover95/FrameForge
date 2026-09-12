"""JuniorCloud Blender pipeline host. Stdlib. No bpy.

Consumers: JuniorOmega LiDAR, JuniorLLM FieldCore, AGI_SDK capsules,
FrameForge display GLB. Sim and BitNet stay out.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

JOBS = {
    "omega-lidar": {
        "consumer": "JuniorOmega",
        "in": "ply",
        "out": "glb",
        "note": "LiDAR / TrueDepth cloud to shaded GLB.",
        "prim": "cloud",
        "color": (0.83, 0.68, 0.21),
    },
    "llm-fieldcore": {
        "consumer": "JuniorLLM",
        "in": "prim",
        "out": "glb",
        "note": "FieldCore display mesh.",
        "prim": "ico",
        "color": (0.55, 0.62, 0.78),
    },
    "agi-capsule": {
        "consumer": "AGI_SDK",
        "in": "prim",
        "out": "glb",
        "note": "Scan / hurt capsule topology only.",
        "prim": "capsule",
        "color": (0.88, 0.48, 0.28),
    },
    "frameforge-display": {
        "consumer": "FrameForge",
        "in": "prim",
        "out": "glb",
        "note": "Display GLB. Sim capsules stay in python.frameforge.",
        "prim": "uv",
        "color": (0.77, 0.78, 0.81),
    },
}

LEVELS = {
    -1: {"name": "perf", "segments": 8, "subsurf": 0},
    0: {"name": "balanced", "segments": 16, "subsurf": 1},
    1: {"name": "detailed", "segments": 32, "subsurf": 2},
}

_HERE = Path(__file__).resolve().parent
WORKER = _HERE / "headless_worker.py"
if not WORKER.exists():
    WORKER = _HERE.parent / "blender" / "headless_worker.py"


def lod_for(trit: int) -> dict:
    key = 0 if trit == 0 else (1 if trit > 0 else -1)
    out = dict(LEVELS[key])
    out["trit"] = key
    return out


def write_ascii_ply(path: Path, points: list[tuple[float, float, float]]) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "ply",
        "format ascii 1.0",
        f"element vertex {len(points)}",
        "property float x",
        "property float y",
        "property float z",
        "end_header",
    ]
    for x, y, z in points:
        lines.append(f"{float(x):.6f} {float(y):.6f} {float(z):.6f}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def grid_cloud(n: int = 8, span: float = 1.0) -> list[tuple[float, float, float]]:
    if n < 2:
        n = 2
    step = span / (n - 1)
    half = span * 0.5
    pts = []
    for i in range(n):
        for j in range(n):
            pts.append((i * step - half, 0.0, j * step - half))
    return pts


def find_blender() -> str | None:
    env = os.environ.get("BLENDER") or os.environ.get("JUNIORCLOUD_BLENDER")
    if env and Path(env).exists():
        return env
    which = shutil.which("blender")
    if which:
        return which
    for cand in (
        "/usr/bin/blender",
        "/opt/blender/blender",
        "/Applications/Blender.app/Contents/MacOS/Blender",
    ):
        if Path(cand).exists():
            return cand
    return None


def stage_job(kind: str, out_dir: Path, trit: int = 0, source: Path | None = None) -> dict:
    if kind not in JOBS:
        raise ValueError("unknown job " + kind)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    spec = dict(JOBS[kind])
    spec["kind"] = kind
    spec["lod"] = lod_for(trit)
    spec["out_glb"] = str(out_dir / (kind + ".glb"))
    spec["manifest"] = str(out_dir / (kind + ".manifest.json"))
    if kind == "omega-lidar":
        ply = Path(source) if source else out_dir / "lidar.ply"
        if not ply.exists():
            write_ascii_ply(ply, grid_cloud(6, 1.6))
        spec["source"] = str(ply)
    else:
        spec["source"] = str(source) if source else ""
    (out_dir / "job.json").write_text(json.dumps(spec, indent=2), encoding="utf-8")
    return spec


def run_job(kind: str, out_dir: Path, trit: int = 0, source: Path | None = None) -> dict:
    spec = stage_job(kind, out_dir, trit=trit, source=source)
    blender = find_blender()
    spec["blender"] = blender
    spec["worker"] = str(WORKER)
    if not blender:
        spec["status"] = "staged"
        spec["note"] = "Blender binary not on PATH. Job JSON + PLY staged."
        Path(spec["manifest"]).write_text(json.dumps(spec, indent=2), encoding="utf-8")
        return spec
    cmd = [blender, "--background", "--python", str(WORKER), "--", str(Path(out_dir) / "job.json")]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    spec["status"] = "ok" if proc.returncode == 0 else "fail"
    spec["returncode"] = proc.returncode
    spec["stdout_tail"] = (proc.stdout or "")[-800:]
    spec["stderr_tail"] = (proc.stderr or "")[-800:]
    Path(spec["manifest"]).write_text(json.dumps(spec, indent=2), encoding="utf-8")
    return spec


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    kind = argv[0] if argv else "omega-lidar"
    out = Path(argv[1]) if len(argv) > 1 else Path("blender_out")
    trit = int(argv[2]) if len(argv) > 2 else 0
    result = run_job(kind, out, trit=trit)
    print(json.dumps(result, indent=2))
    return 0 if result.get("status") in {"ok", "staged"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
