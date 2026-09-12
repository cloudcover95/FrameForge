"""FrameForge display job. Shared host: JuniorOmega/blender/jc_blender.py.

Does not replace blender_ext/headless_emit.py. Sim stays in python.frameforge.
"""
from __future__ import annotations

JOB = "frameforge-display"


def display_cmd(out_dir: str = "blender_out", trit: int = 0) -> list[str]:
    return ["python3", "../JuniorOmega/blender/jc_blender.py", JOB, out_dir, str(trit)]


if __name__ == "__main__":
    print(" ".join(display_cmd()))
