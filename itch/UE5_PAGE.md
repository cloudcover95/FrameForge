# FrameForge UE5 — itch page copy

**Title:** FrameForge UE5 (Hybrid Web Beta)
**URL slug:** frameforge-unreal-web
**Kind:** HTML
**Price:** Free / PWYW
**Classification:** Game
**Release status:** In development (beta 0.4.2)

## Short description

Original-roster arena fighter. Four toons, four season floors, 3D web hybrid of the UE 5.4 studio. Not a Nintendo product.

## Long description

FrameForge UE5 is the hybrid web cut of JuniorCloud's arena fighter. Same original roster and legal floor as the shipped 2D kernel — Vesper, Quill, Relay, Forge on Bloomreach, Alpine, Emberfall, and Hearth.

This HTML5 project is a Three.js twin of the Unreal 5.4 plugin. It does not ship cooked UE pak files.

- 2D live — https://cloudcover95.itch.io/frameforge2d
- Studio + UE plugin — https://github.com/cloudcover95/FrameForge
- 2D source — https://github.com/cloudcover95/FrameForge2D

Stocks 3–5. CPU or couch P2. Artifacts dress off by default. BitNet does not scale knockback.
JuniorCloud LLC. Not a Nintendo product.

## Tags

fighting, platform-fighter, arena-fighter, 3d, browser, html5, local-multiplayer, indie, original-characters

## Controls

P1: WASD, W/Space jump, J attack (hold smash), K special, L shield, I grab, U ult, O dodge, P/Esc pause.
P2: arrows, 1-6.
Touch: stick + JUMP ATK SP SHIELD GRAB ULT.
Header: GitHub · 2D itch · Pause · New · Menu.

## Run

```
python3 -m python.frameforge.cli serve-web3d --port 8766
butler push dist/frameforge-unreal-web.zip cloudcover95/frameforge-unreal-web:html5
```
