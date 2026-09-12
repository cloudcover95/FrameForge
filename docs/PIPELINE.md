# Python-headless → Blender ext → Unreal

Hard-split from the Grok web3d learning slice (`web3d-grok/`). This is the live
Unreal path that FrameForge2D was split away from.

```
data/fighters + data/movesets + data/stages
        │
        ▼
python/frameforge   (stdlib sim, knockback, catalog, codegen)
        │
        ├── blender missing: mesh_emit.py writes blender_out/glb/*.gltf
        └── blender on PATH: blender --background --python blender_ext/headless_emit.py
        │
        ▼
unreal/FrameForge/Content/Generated/Roster.generated.json
unreal/FrameForge plugin (UE 5.4)
```

## Commands

```
make gate
python3 -m python.frameforge.cli test
python3 -m python.frameforge.cli emit-meshes
python3 -m python.frameforge.cli codegen-ue
python3 -m python.frameforge.cli quant
bash unreal/scripts/sync_generated.sh
```

Blender is optional. CI never installs it. Display meshes do not change the
sim capsule. BitNet still scores CPU intent only.

Not a Nintendo product. JuniorCloud LLC.
