"""Blender-side worker. blender --background --python headless_worker.py -- job.json

Loads bpy via __import__ so host audit stays stdlib-lean.
Does not write sim state.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def _bpy():
    return __import__("bpy")


def load_job() -> dict:
    argv = sys.argv
    raw = argv[argv.index("--") + 1] if "--" in argv else "job.json"
    return json.loads(Path(raw).read_text(encoding="utf-8"))


def wipe(bpy) -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def shade(bpy, obj, color, metal=0.25, rough=0.5, emit=0.0) -> None:
    mat = bpy.data.materials.new(name="JC_" + obj.name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Metallic"].default_value = metal
        bsdf.inputs["Roughness"].default_value = rough
        if emit and "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emit
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def subsurf(bpy, obj, levels: int) -> None:
    if levels <= 0:
        return
    mod = obj.modifiers.new("sub", "SUBSURF")
    mod.levels = levels
    mod.render_levels = levels
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier="sub")
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def make_prim(bpy, kind: str, segments: int):
    if kind == "ico":
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.45, location=(0, 0, 0.45))
    elif kind == "capsule":
        bpy.ops.mesh.primitive_cylinder_add(vertices=max(8, segments), radius=0.22, depth=0.9, location=(0, 0, 0.45))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(8, segments // 2), radius=0.22, location=(0, 0, 0.9))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(8, segments // 2), radius=0.22, location=(0, 0, 0.0))
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=segments, ring_count=max(8, segments // 2), radius=0.45, location=(0, 0, 0.45)
        )
    return bpy.context.view_layer.objects.active


def import_source(bpy, source: str):
    src = Path(source)
    if not src.exists():
        return None
    if src.suffix.lower() == ".ply":
        bpy.ops.wm.ply_import(filepath=str(src)) if hasattr(bpy.ops.wm, "ply_import") else bpy.ops.import_mesh.ply(filepath=str(src))
    elif src.suffix.lower() in {".glb", ".gltf"}:
        bpy.ops.import_scene.gltf(filepath=str(src))
    else:
        return None
    return bpy.context.view_layer.objects.active


def main() -> int:
    job = load_job()
    bpy = _bpy()
    wipe(bpy)
    lod = job.get("lod") or {"segments": 16, "subsurf": 1}
    obj = None
    if job.get("source"):
        obj = import_source(bpy, job["source"])
    if obj is None:
        obj = make_prim(bpy, job.get("prim") or "uv", int(lod.get("segments") or 16))
    if obj is None:
        print("no mesh")
        return 2
    obj.name = job.get("kind") or "jc_mesh"
    colors = {
        "omega-lidar": (0.83, 0.68, 0.21),
        "llm-fieldcore": (0.55, 0.62, 0.78),
        "agi-capsule": (0.88, 0.48, 0.28),
        "frameforge-display": (0.77, 0.78, 0.81),
    }
    shade(bpy, obj, colors.get(job.get("kind"), (0.7, 0.7, 0.7)), metal=0.35, rough=0.42)
    subsurf(bpy, obj, int(lod.get("subsurf") or 0))
    dest = Path(job["out_glb"])
    dest.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(dest), export_format="GLB")
    print("wrote", dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
