"""Stdlib glTF emitter. Used when Blender is not on PATH.

Writes a one-mesh fighter capsule so Unreal / DCC can still import a placeholder
while the Blender extension (`blender_ext/frameforge_emit`) is the real authoring path.
"""
from __future__ import annotations

import json
import math
import struct
from pathlib import Path


def _capsule(radius=0.35, height=1.6, seg=10):
    pos = []
    idx = []
    rings = 8
    for i in range(rings + 1):
        v = i / rings
        y = (v - 0.15) * height
        r = radius if 0.15 < v < 0.85 else max(0.05, radius * math.sin(v * math.pi))
        for j in range(seg):
            a = 2 * math.pi * j / seg
            pos.extend([r * math.cos(a), y, r * math.sin(a)])
    for i in range(rings):
        for j in range(seg):
            a = i * seg + j
            b = i * seg + (j + 1) % seg
            c = (i + 1) * seg + j
            d = (i + 1) * seg + (j + 1) % seg
            idx.extend([a, c, b, b, c, d])
    return pos, idx


def write_gltf(path: Path, name: str, color: list[float]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    pos, idx = _capsule()
    doc = {
        "asset": {"version": "2.0", "generator": "frameforge-mesh-emit-stdlib"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": name}],
        "meshes": [{"name": name, "primitives": [{"attributes": {"POSITION": 0}, "indices": 1, "material": 0}]}],
        "materials": [{
            "name": f"{name}_steel",
            "pbrMetallicRoughness": {
                "baseColorFactor": color + [1.0],
                "metallicFactor": 0.55,
                "roughnessFactor": 0.4,
            },
        }],
        "accessors": [
            {
                "bufferView": 0, "componentType": 5126, "count": len(pos) // 3, "type": "VEC3",
                "max": [max(pos[0::3]), max(pos[1::3]), max(pos[2::3])],
                "min": [min(pos[0::3]), min(pos[1::3]), min(pos[2::3])],
            },
            {"bufferView": 1, "componentType": 5125, "count": len(idx), "type": "SCALAR"},
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": len(pos) * 4, "target": 34962},
            {"buffer": 0, "byteOffset": len(pos) * 4, "byteLength": len(idx) * 4, "target": 34963},
        ],
        "buffers": [{"uri": path.with_suffix(".bin").name, "byteLength": len(pos) * 4 + len(idx) * 4}],
    }
    raw = bytearray()
    raw.extend(struct.pack("<" + "f" * len(pos), *pos))
    raw.extend(struct.pack("<" + "I" * len(idx), *idx))
    path.with_suffix(".bin").write_bytes(raw)
    path.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    return path


COLORS = {
    "vesper": [0.77, 0.78, 0.81],
    "quill": [0.42, 0.56, 0.44],
    "relay": [0.48, 0.36, 1.0],
    "forge": [0.37, 0.78, 0.85],
    "cub": [0.88, 0.48, 0.29],
}


def emit_roster(root: Path) -> list[str]:
    out = root / "blender_out" / "glb"
    written = []
    for name, color in COLORS.items():
        dest = out / f"fighter_{name}.gltf"
        write_gltf(dest, f"Ff_{name.title()}", color)
        written.append(str(dest.relative_to(root)))
    return written
