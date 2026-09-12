# blender_ext — JuniorCloud host

Same host as JuniorOmega. FrameForge only consumes `frameforge-display`.

| Job | Consumer | In | Trit LOD |
| --- | --- | --- | --- |
| `omega-lidar` | JuniorOmega | PLY | -1 / 0 / +1 |
| `llm-fieldcore` | JuniorLLM | prim | -1 / 0 / +1 |
| `agi-capsule` | AGI_SDK | prim | scan hull only |
| `frameforge-display` | FrameForge | prim / GLB | display, not sim |

```
python3 blender_ext/jc_blender.py frameforge-display blender_out 0
blender --background --python blender_ext/headless_worker.py -- blender_out/job.json
```

No bpy in `jc_blender.py`. CI stages JSON when Blender is missing.
`python/frameforge` still owns capsules and knockback.

JuniorCloud LLC.
