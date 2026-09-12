/** Melee-documented knockback. Mirrors python/frameforge/math_kb.py. */
export const STALE_TABLE = [1, 0.91, 0.86, 0.81, 0.76, 0.71, 0.66, 0.61, 0.56, 0.51];
export const LAUNCH_SPEED_SCALE = 0.03;
export const SAKURAI = 361;
export const SAKURAI_KB_THRESHOLD = 32;
export const SAKURAI_AIR_OR_STRONG = 44;
export const CROUCH_CANCEL = 0.6667;
export const HITSTUN_FACTOR = 0.4;
export const HITLAG_CAP = 30;

export function staleMultiplier(priorUses) {
  const i = Math.max(0, priorUses | 0);
  return STALE_TABLE[Math.min(i, STALE_TABLE.length - 1)];
}

export function knockback(percentAfter, damage, weight, kbg, bkb, opts = {}) {
  const p = +percentAfter;
  const d = +damage;
  const w = opts.weightIndependent ? 100 : +weight;
  const s = +kbg / 100;
  const b = +bkb;
  const r = (opts.extraRatio ?? 1) * (opts.crouch ? CROUCH_CANCEL : 1);
  const inner = p / 10 + (p * d) / 20;
  const scaled = inner * (200 / (w + 100)) * 1.4;
  return ((scaled + 18) * s + b) * r;
}

export function sakuraiAngle(kb, grounded, rawAngle) {
  if ((rawAngle | 0) !== SAKURAI) return +rawAngle;
  if (grounded && kb < SAKURAI_KB_THRESHOLD) return 0;
  return SAKURAI_AIR_OR_STRONG;
}

export function hitstunFrames(kb) {
  return (kb * HITSTUN_FACTOR) | 0;
}

export function hitlagFrames(damage, electric = false, shielded = false) {
  let lag = ((damage / 3) | 0) + 3;
  if (electric) lag = (lag * 1.5) | 0;
  if (shielded) lag = (lag * 0.67) | 0;
  return Math.min(lag, HITLAG_CAP);
}

export function launchVelocity(kb, angleDeg, facing = 1) {
  const speed = kb * LAUNCH_SPEED_SCALE;
  const rad = (angleDeg * Math.PI) / 180;
  return { vx: speed * Math.cos(rad) * facing, vy: speed * Math.sin(rad) };
}

/** Soft cap so a learning-slice ult cannot yeet at low percent. */
export function clampLaunch(vx, vy, maxSpeed) {
  const s = Math.hypot(vx, vy);
  if (s <= maxSpeed || s === 0) return { vx, vy };
  const k = maxSpeed / s;
  return { vx: vx * k, vy: vy * k };
}
