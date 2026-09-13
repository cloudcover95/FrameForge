# Trit stack — JuniorHome module

BitNet + LIF + TritARM + JuniorLLM compose. They do not replace the sim.

```
features 16
  LIF spikes (optional front-end)
  FFBN skip-zero matvec → 8 logits → action id
  TritARM MMIO INTENT / PAD  (original ISA, guest .tas only)
  JuniorLLM envelope → FieldCore / AstraReason  (text, tools)
```

Python math_kb still owns knockback, hitstun, stocks, blast.
UnrealEditor does not boot on the 45 W node.

## What TritARM is

packs/junior_arm_iot on JuniorHome: 16-register load/store, ARM-inspired
names (r15=pc). Envelope profiles (arm7_class, a57_class) are RAM/watt
hints, not vendor pipelines.

Not Dolphin. Not Yuzu. Not a GCN/ARM binary runner for licensed games.
.xci .nsp .gba .z64 are classified only. No decrypt.

## Commands

```
python3 -m python.frameforge.cli trit-stack
python3 -m python.frameforge.cli trit-bench --n 2000
```
