# PeerJS vs Unreal hybrid

| Layer | Owns | PeerJS? |
| --- | --- | --- |
| FrameForge2D canvas | shipped playable | yes, 4-letter rooms |
| web3d-grok HTML5 | UE5 look, JS sim | yes, same seats / STUN |
| Unreal 5.4 plugin | native PIE / packaged | no. Use UE replication later |
| itch embed | storefront iframe | hostile to WebRTC |

Keep PeerJS on the web kernels. Do not vendor it into `unreal/`.
When UE net exists, map the same room code to a session name. Payload stays
`{ t, s, i }` inputs and `{ t:st, p[] }` snaps.

JuniorCloud LLC.
