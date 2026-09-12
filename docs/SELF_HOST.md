# Self-host FrameForgeUE5 hybrid

Itch is a storefront, not the runtime. The hybrid boots from this repo.

```
python3 scripts/serve_hybrid.py --port 8766 --root web3d-grok
# or
python3 -m http.server 8766 --bind 127.0.0.1 --directory web3d-grok
```

Open `http://127.0.0.1:8766/` on the home node.
GitHub Pages works the same: serve `web3d-grok/` as the site root.

## Rooms without itch

`?room=ABCD&host=1` hosts. `?room=ABCD` joins.
Codes match FrameForge2D alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
Peer prefix is `ffue-`. 2D can keep its own prefix so sessions do not collide.

STUN: Google + Cloudflare public servers. No TURN yet. Symmetric NAT may fail.
Long-term signaling can move to a JuniorHome PeerServer (`window.FF_PEER_HOST`)
without changing the input / state payload.

## What PeerJS is for

Keeps couch + remote seats on the HTML5 hybrid and 2D kernel.
Does not replace Unreal netcode, Steam sockets, or EOS.
Host still owns `tickMatch`. Guests send inputs, apply host snaps.

## Blender / Omega

```
python3 blender_ext/jc_blender.py frameforge-display blender_out 0
python3 blender_ext/jc_blender.py omega-lidar blender_out -1
```

Binary optional. CI stages `job.json` + PLY. Display GLB never writes knockback.

JuniorCloud LLC. Not a Nintendo product.
