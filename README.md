# FrameForge

**0.4.2 beta — 2026-09-09.** Original-roster arena fighter.

- Unreal: uncapped render / 120 Hz sim / 20 Hz snapshots
- 2D kernel: https://github.com/cloudcover95/FrameForge2D
- itch: https://cloudcover95.itch.io/frameforge2d
- JuniorHome: `juniorhome/README.md` (also updated on cloudcover95/JuniorHome)

Python sim owns knockback. BitNet scores CPU intent only. Not a Nintendo product. See LEGAL.md.

```
make gate
```

Map plugin: copy `unreal/FrameForge` into UE 5.4 `Plugins/`, GameMode `AFfGameMode`, copy `unreal/Config/*.ini`. Docs: `docs/ROADMAP_UE.md`.

Learning slice (not the live pipeline): `web3d-grok/` — Grok Three.js arena, procedural primitives, no Blender. See `docs/GROK_BUILD.md`.

Pipeline (Python stdlib, optional Blender): `docs/PIPELINE.md`. `make gate` then `python3 -m python.frameforge.cli emit-meshes`.
