# FrameForge Unreal — Grok Build

Standalone **learning slice** parked inside the Unreal studio repo.

This is the Grok web attempt that built a cinematic 3D platform fighter in the browser
with **procedural primitives**. It did **not** use:

- Blender / `blender_out/` / GLB skins from the live FrameForge pipeline
- the UE 5.4 plugin under `unreal/FrameForge`
- the FrameForge2D canvas kernel (hard-split itch host)

It **does** reuse the original roster and the documented legal floor:

| Fighter | Role |
|---|---|
| Vesper | owl scout, fast-faller |
| Quill | hooded ranger, spacer |
| Relay | ember mage, Codex Rift |
| Forge | crystal automaton, heavy |

Seasons Bloomreach / Alpine / Emberfall / Hearth share `data/stages/_legal_profile.json`
(no walls, no walk-offs, no hazards). Knockback copies `python/frameforge/math_kb.py`.

## Why it lives here

The live product path is still:

1. Python sim + BitNet intent sidecars (this repo)
2. UE 5.4 plugin (`unreal/`)
3. 2D itch kernel (`cloudcover95/FrameForge2D`)

This folder is a third camera — a Grok experiment you can open without an editor.
Treat it as notes you can play, not as a replacement plugin.

## Run

Any static server from this folder (modules + `fetch` need http):

```
python3 -m http.server 8766 --directory web3d-grok
```

Then open `http://127.0.0.1:8766/`.

## Checks

```
node web3d-grok/check.mjs
```

Parity: Melee knockback sample vs `math_kb.py`. Headless stocks can go to zero.

## Ult polish in this pass

Vesper **Veil Plunge** used to launch off the top blastzone at almost any percent.
It is now a 4-hit pull toward the attacker with `maxLaunch` 4.1. Relay Codex Rift
reels the opponent in before the pop. Quill Ridge Volley and Forge Core Collapse
are also launch-capped.

Not a Nintendo product. JuniorCloud LLC.
