# Beta deploy options

## 1. Itch HTML5 — already live (2D kernel)
Project: https://cloudcover95.itch.io/frameforge2d
Repo: cloudcover95/FrameForge2D
Upload a zip with `index.html` at the root (`site/` contents). Kind: HTML.
Embed: default size 1280×720, `SharedArrayBuffer` off.

```
cd FrameForge2D/site && zip -r ../dist/frameforge2d-html5.zip .
butler push dist/frameforge2d-html5.zip cloudcover95/frameforge2d:html5
```

## 2. Itch HTML5 — Unreal-experience web slice
Folder: `web3d-grok/` in this repo. Three.js CDN, no build step.
New itch project suggested slug: `frameforge-unreal-web` (separate from 2D).
Zip `web3d-grok/` with `index.html` at root. Mobile touch is in the private Grok preview; this slice is the studio twin.

```
cd web3d-grok && zip -r ../dist/frameforge-unreal-web.zip .
butler push ../dist/frameforge-unreal-web.zip cloudcover95/frameforge-unreal-web:html5
```

## 3. Itch download — UE 5.4 packaged Windows
Not HTML5. Package the host project that loads `unreal/FrameForge` as a plugin.
Upload the packaged folder as a .zip channel `windows`.
Needs a real .uproject host; this repo ships the plugin only.

```
butler push Dist/Windows cloudcover95/frameforge:windows --userversion 0.4.2-beta
```

## 4. Itch download — Grok preview PWA
Private repo `bold-summit-wood-quiet` already has Vercel + PWA hooks.
For itch, `npm run build` then zip `dist/` as HTML5. Larger than the 2D kernel.

## Recommendation for this beta week
Ship **2D HTML5** (live) + **web3d-grok HTML5** as the Unreal-look public beta.
Hold a Windows UE zip until a host .uproject exists. Do not upload plugin sources as a game build.

Not a Nintendo product. JuniorCloud LLC.
