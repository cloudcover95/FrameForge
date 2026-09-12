"""Local HTTP host for playable web slices. Stdlib only. No Unreal boot."""
from __future__ import annotations

import http.server
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def resolve_root(kind: str) -> Path:
    if kind in {"web3d", "unreal-web"}:
        dest = ROOT / "web3d-grok"
        if dest.joinpath("index.html").is_file():
            return dest
        raise FileNotFoundError("web3d-grok/index.html missing")
    candidates = [
        ROOT.parent / "FrameForge2D" / "site",
        ROOT / "web2d",
        Path.home() / "src" / "FrameForge2D" / "site",
    ]
    for dest in candidates:
        if dest.joinpath("index.html").is_file() or dest.joinpath("play.html").is_file():
            return dest
    raise FileNotFoundError("FrameForge2D site not found next to this repo")


def serve(kind: str = "web3d", host: str = "127.0.0.1", port: int = 8766) -> int:
    root = resolve_root(kind)
    os.chdir(root)
    handler = http.server.SimpleHTTPRequestHandler
    with http.server.ThreadingHTTPServer((host, port), handler) as httpd:
        print(f"serving {root} on http://{host}:{port}/")
        print("JuniorCloud LLC. Not a Nintendo product.")
        httpd.serve_forever()
    return 0
