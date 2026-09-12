# Production contract — BitNet quant

Self-prompt the implementer must satisfy before merge.

1. Combat formula stays float in `math_kb.py`. Quant does not multiply knockback unless `UFfLookFlags.bBitNetKnockbackScale` is explicitly on, and even then `eval_policy` returns `kb_scale=1.0` in this build.
2. Weights are AbsMean-ternary: `scale = mean(|w|)`, then `{-1,0,+1}` at `0.5 * scale`.
3. Pack 2 bits/weight into `policy.ffbn` (magic FFBN). CSR twin `policy.ffcs`. LIF header `policy.fflf`.
4. Eval is skip-zero matvec. Intent is argmax over idle/approach/attack/recover/shield/ult.
5. Stdlib only. `make gate` must stay green. No pip. No MLX required (optional later).
6. UE `UFfBitNetPolicy` loads `Content/Generated/policy.ffbn` if present; missing file = intent 0.
7. Never write percent, stocks, or blastzones.

```
python3 -m python.frameforge.cli quant
python3 -m python.frameforge.cli engine --out data/ai
```
