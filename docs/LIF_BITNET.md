# LIF × ternary BitNet

LIF is a quantizer: leaky membrane → ternary spike {-1,0,+1}. Synapses are FFBN.
Intent / memory only. Never writes percent, stocks, blast.

    u <- leak*u + I
    s = +1 if u>=+theta else -1 if u<=-theta else 0
    reset zero | subtract | mod

`python.frameforge.lif_ternary` + `lif_codec` (FFLF sidecar).
Bench: 8×16 layer ~99k steps/s stdlib on this box. 87 nonzero of 128.
JuniorHome pack: `packs/junior_lif/`.
