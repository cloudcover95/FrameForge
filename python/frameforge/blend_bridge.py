"""Talk to Blender in --background if the binary exists.

The authoring add-on lives in blender_ext/frameforge_emit. This module never
imports bpy at process start so the studio gate stays stdlib-only.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def blender_bin() -> str | None:
    return shutil.which("blender")


def emit(root: Path) -> dict:
    binary = blender_bin()
    script = root / "blender_ext" / "headless_emit.py"
    if not binary or not script.exists():
        return {"ok": False, "reason": "blender-missing", "bin": binary}
    proc = subprocess.run(
        [binary, "--background", "--python", str(script), "--", str(root)],
        cwd=str(root),
        capture_output=True,
        text=True,
        timeout=180,
    )
    return {
        "ok": proc.returncode == 0,
        "code": proc.returncode,
        "stdout": (proc.stdout or "")[-2000:],
        "stderr": (proc.stderr or "")[-2000:],
    }
