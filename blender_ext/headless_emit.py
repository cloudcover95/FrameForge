"""blender --background --python blender_ext/headless_emit.py -- /path/to/FrameForge"""
from __future__ import annotations

import sys
from pathlib import Path

argv = sys.argv
root = Path(argv[argv.index("--") + 1]) if "--" in argv else Path(".").resolve()

try:
    import bpy
except ImportError:
    print("bpy missing — use python -m python.frameforge.cli emit-meshes")
    raise SystemExit(2)

bpy.ops.wm.read_factory_settings(use_empty=True)
out = root / "blender_out" / "glb"
out.mkdir(parents=True, exist_ok=True)

COLORS = {
    "vesper": (0.77, 0.78, 0.81, 1),
    "quill": (0.42, 0.56, 0.44, 1),
    "relay": (0.48, 0.36, 1.0, 1),
    "forge": (0.37, 0.78, 0.85, 1),
}

for name, color in COLORS.items():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.45, location=(0, 0, 0.7))
    obj = bpy.context.object
    obj.name = f"Ff_{name.title()}"
    mat = bpy.data.materials.new(name=f"M_Ff{name.title()}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Metallic"].default_value = 0.55
    obj.data.materials.append(mat)
    dest = out / f"fighter_{name}.glb"
    bpy.ops.export_scene.gltf(filepath=str(dest), export_format="GLB")
    print("wrote", dest)

raise SystemExit(0)
