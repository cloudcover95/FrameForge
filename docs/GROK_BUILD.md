# Grok Build (web3d-grok)

Date parked: 2026-09-12.

A Grok session tried to ship **FrameForge Unreal** as a React / R3F web fighter
with storefront OG cards. Image generation hit a spending limit, so the brand
pass fell back to a forged-steel CSS card. The playable slice itself never
touched Blender or the UE 5.4 plugin.

This tree keeps that attempt as a **standalone learning folder**:

```
web3d-grok/
  index.html          menu + HUD + touch
  js/math.js          copy of math_kb.py
  js/sim.js           60 Hz stocks, smash hold, ults
  js/cpu.js           recover / DI / mix shield
  js/view.js          Three.js primitives (owl / ranger / mage / crystal)
  data/roster.json    Vesper Quill Relay Forge + legal floor
  check.mjs           knockback parity vs Python
```

Known original todo from that session: *polish ultimates, vesper ulti flys off map ez*.
`Veil Plunge` is now a 4-hit inward pull with `maxLaunch: 4.1`.

Do not import this folder into the plugin. Display meshes in the live game stay
on the Blender → GLB / UE path described in `docs/ROADMAP_UE.md`.
