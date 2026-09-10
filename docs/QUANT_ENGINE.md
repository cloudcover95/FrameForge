# Quant engine — local JuniorCloud rail

Stdlib. Combat math stays float.

```
python3 -m python.frameforge.cli engine
python3 -m python.frameforge.cli engine --out data/ai
```

Writes policy.ffbn (48 B), policy.ffcs (CSR), policy.fflf (LIF).
Eval skip-zero. Optional LIF front-end. Intent only.
UE: UFfQuantEngine wraps UFfBitNetPolicy.
