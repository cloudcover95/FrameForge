"""Blender 4.x add-on. Authoring path for fighter display meshes.

Sim capsules stay in Python. This only writes blender_out/glb for Unreal import.
"""

bl_info = {
    "name": "FrameForge Emit",
    "author": "JuniorCloud LLC",
    "version": (0, 4, 2),
    "blender": (4, 2, 0),
    "location": "View3D > Sidebar > FrameForge",
    "category": "Import-Export",
}

try:
    import bpy
except ImportError:
    bpy = None


def register():
    if bpy is None:
        return


def unregister():
    if bpy is None:
        return
