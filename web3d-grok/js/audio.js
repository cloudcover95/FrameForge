/** Procedural beds + hits. No wav assets exist in the trees. */
export function createAudio() {
  let ctx = null;
  let bedGain = null;
  let bedOsc = null;
  let stageId = "bloomreach";
  let muted = false;

  function boot() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    bedGain = ctx.createGain();
    bedGain.gain.value = 0.04;
    bedGain.connect(ctx.destination);
    return ctx;
  }

  function tone(freq, dur, type = "triangle", gain = 0.08) {
    if (muted || !boot()) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  function startBed(id) {
    stageId = id || stageId;
    if (muted || !boot()) return;
    if (bedOsc) {
      try { bedOsc.stop(); } catch (_) { /* already stopped */ }
    }
    const o = ctx.createOscillator();
    o.type = "sine";
    const table = { bloomreach: 110, alpine: 98, emberfall: 82, hearth: 73 };
    o.frequency.value = table[stageId] || 110;
    o.connect(bedGain);
    o.start();
    bedOsc = o;
  }

  return {
    unlock() {
      boot()?.resume?.();
      startBed(stageId);
    },
    setStage(id) {
      startBed(id);
    },
    hit() { tone(220, 0.09, "square", 0.05); },
    ult() { tone(82, 0.35, "sawtooth", 0.06); },
    stock() { tone(330, 0.2, "triangle", 0.07); },
    toggleMute() {
      muted = !muted;
      if (bedGain) bedGain.gain.value = muted ? 0 : 0.04;
      return muted;
    },
    muted: () => muted,
  };
}
