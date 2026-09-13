# junior_trit_stack

JuniorHome pack. Composes existing kernels:

- packs/junior_arm_iot — TritARM ISA + IoT envelopes
- packs/junior_lif — ternary LIF
- FrameForge python.frameforge.trit_stack — LIF → FFBN → TritARM → JuniorLLM envelope

BitNet scores CPU intent only. Python sim owns knockback.
Not a Nintendo product. Not an Arm Holdings product.

```
python3 -m python.frameforge.cli trit-stack
python3 -m python.frameforge.cli trit-bench --n 2000
```
