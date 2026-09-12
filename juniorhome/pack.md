# JuniorHome pack — FrameForge hybrid

Drop-in for the 45 W node. Unreal editor stays off this envelope.

```
python3 -m python.frameforge.cli serve-web3d --port 8766
python3 -m python.frameforge.cli serve-2d --port 8765
make gate
make quant
```

UE 5.4 host (other machine): `unreal/Host/FrameForgeHost.uproject`
See `unreal/Host/README.md`.
