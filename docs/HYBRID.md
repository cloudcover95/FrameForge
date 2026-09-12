# Hybrid map — Grok preview ↔ FrameForge studio

Private Grok Build cut: `cloudcover95/bold-summit-wood-quiet`
Studio / Unreal plugin: this repo.
2D itch kernel: `FrameForge2D`.

| Preview (shipped) | Studio source of truth |
| --- | --- |
| `src/game/roster.ts` palettes + ult names | `data/look/palettes.json` + `data/fighters/*.json` |
| `src/game/moves.ts` hitboxes | `data/movesets/*.json` |
| `src/game/stage.ts` seasons | `data/stages/*.json` + `_legal_profile.json` |
| `src/game/artifacts.ts` | `data/artifacts/catalog.json` |
| `src/components/game/TouchPad.tsx` | UE CommonUI later; web3d-grok touch |
| Camera pullback | Unreal spring-arm 18-30 m |

Legal floor is identical: blast -232/232/212/-128, no walls, no walk-offs, no hazards.
Knockback stays in `python/frameforge/math_kb.py`. BitNet does not scale launch.
Items are a dress/rail toggle. Off by default.

Not a Nintendo product. JuniorCloud LLC.
