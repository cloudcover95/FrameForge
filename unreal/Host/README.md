# FrameForgeHost — UE 5.4 game host

This is the packaged Windows host. The playable plugin lives at
`unreal/FrameForge`. Copy or symlink it into `Plugins/` on a machine that
has UE 5.4. This sandbox / 45 W node does not boot the editor.

```
cd unreal/Host
mkdir -p Plugins
ln -s ../../FrameForge Plugins/FrameForge
# open FrameForgeHost.uproject in UE 5.4
# GameMode AFfGameMode
```

Listen-server self-host (same LAN):

```
FrameForgeHost.exe -log -listen -port=7777
FrameForgeHost.exe -log 192.168.x.x:7777
```

BitNet intent only. `bBitNetKnockbackScale=False`.
Not a Nintendo product. JuniorCloud LLC.
