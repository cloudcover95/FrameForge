# Quant engine — local JuniorCloud rail

Stdlib. Combat math stays float. See `docs/BITNET_QUANT.md`.

```
python3 -m python.frameforge.cli engine
python3 -m python.frameforge.cli engine --out data/ai
make quant
```

Writes policy.ffbn (packed ternary), policy.ffcs (CSR), policy.fflf (LIF header).
Eval skip-zero. Intent only. UE: UFfQuantEngine wraps UFfBitNetPolicy.
`bBitNetKnockbackScale` stays false in DefaultFrameForge.ini.
