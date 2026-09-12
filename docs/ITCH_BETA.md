# Beta deploy

## Live
https://cloudcover95.itch.io/frameforge2d — 2D HTML5 kernel.

## Second HTML5 project — Unreal web
Slug: `frameforge-unreal-web`
Zip is built from `web3d-grok/` with `index.html` at the root.

```
bash scripts/pack_itch_web3d.sh
butler push dist/frameforge-unreal-web.zip cloudcover95/frameforge-unreal-web:html5
```

Local self-host (45 W node, no editor):

```
python3 -m python.frameforge.cli serve-web3d --port 8766
python3 -m python.frameforge.cli serve-2d --port 8765
```

## Windows UE 5.4 host
Host project: `unreal/Host/FrameForgeHost.uproject`
Plugin: `unreal/FrameForge` (symlink via `scripts/link_host_plugin.sh`).

This environment does not run UnrealEditor. On a UE 5.4 builder:

```
export UE_ROOT=/path/to/UE_5.4/Engine
bash scripts/package_ue_windows.sh
butler push dist/windows/Windows cloudcover95/frameforge:windows --userversion 0.4.2-beta
```

Listen-server after package: `FrameForgeHost.exe -listen -port=7777`

Not a Nintendo product. JuniorCloud LLC.
