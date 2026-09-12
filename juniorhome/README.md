# JuniorHome × FrameForge — hybrid go-live

JuniorHome is the 45W local hub. FrameForge drops in. Unreal editor stays off this envelope.

| Surface | Where | Clock |
|---|---|---|
| itch 2D | https://cloudcover95.itch.io/frameforge2d | 60 Hz |
| itch Unreal-web | `web3d-grok/` zip → frameforge-unreal-web | 60 Hz render |
| studio + plugin | this repo `unreal/FrameForge` | 120 / uncapped / 20 |
| UE host | `unreal/Host/FrameForgeHost.uproject` | other machine |

```
python3 -m python.frameforge.cli serve-web3d --port 8766
python3 -m python.frameforge.cli serve-2d --port 8765
make gate
make quant
```

BitNet scores CPU intent only. Not a Nintendo product.
