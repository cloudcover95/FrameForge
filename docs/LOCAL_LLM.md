# Local LLM + FrameForge

FrameForge is a game runtime. A local custom LLM (JuniorHome / BitNet-mlx) does **not** tick physics.

```
LLM / JuniorAGI     content, tooling, CPU policy training data
BitNet 8x16         CPU + ghost *intent* logits only
Python sim / UE     knockback, stocks, blast — float, deterministic
FrameForge2D        itch + loopback canvas
```

Drop `juniorhome/FrameForge2D/app.json` into JuniorHome apps.
Optional MLX: `cloudcover95/BitNet-mlx`. If MLX is missing, `bitnet_codec.matvec` still runs.

Do not let the LLM write percent or stocks. Those snap from the host sim.
