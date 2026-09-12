#!/usr/bin/env python3
"""Serve web3d-grok on loopback. No itch. Stdlib only.

    python3 scripts/serve_hybrid.py
    python3 scripts/serve_hybrid.py --port 8766 --root web3d-grok
"""
from __future__ import annotations

import argparse
import http.server
import os
import socketserver
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8766)
    p.add_argument("--root", default="web3d-grok")
    p.add_argument("--bind", default="127.0.0.1")
    args = p.parse_args()
    root = Path(args.root).resolve()
    if not (root / "index.html").exists():
        raise SystemExit("no index.html under " + str(root))
    os.chdir(root)

    class Handler(http.server.SimpleHTTPRequestHandler):
        extensions_map = {
            **http.server.SimpleHTTPRequestHandler.extensions_map,
            ".js": "text/javascript",
            ".mjs": "text/javascript",
            ".json": "application/json",
            ".glb": "model/gltf-binary",
            ".gltf": "model/gltf+json",
        }

        def log_message(self, fmt, *rest):
            print(self.address_string(), "-", fmt % rest)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((args.bind, args.port), Handler) as httpd:
        print(f"FrameForgeUE5 hybrid  http://{args.bind}:{args.port}/")
        print("Room query: ?room=ABCD&host=1")
        print("JuniorCloud LLC. Not a Nintendo product.")
        httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
