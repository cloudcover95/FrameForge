import {
  knockback,
  sakuraiAngle,
  hitstunFrames,
  hitlagFrames,
  launchVelocity,
  clampLaunch,
  staleMultiplier,
} from "./math.js";

export const HZ = 60;
const FRICTION = 0.82;
const AIR_FRIC = 0.97;
const SHIELD_DECAY = 0.18;
const METER_HIT = 7;
const METER_TAKE = 4.2;
const METER_MAX = 100;

export function moveTable(id) {
  const common = {
    jab: { dmg: 4, kbg: 30, bkb: 12, ang: 361, frames: 10, hit: 3, end: 8 },
    tilt: { dmg: 9, kbg: 80, bkb: 28, ang: 361, frames: 18, hit: 6, end: 12 },
    smash: { dmg: 16, kbg: 98, bkb: 42, ang: 40, frames: 28, hit: 14, end: 20 },
    aerial: { dmg: 10, kbg: 86, bkb: 24, ang: 361, frames: 20, hit: 6, end: 14 },
    special: { dmg: 8, kbg: 70, bkb: 30, ang: 50, frames: 22, hit: 8, end: 16 },
    throw: { dmg: 8, kbg: 60, bkb: 50, ang: 45, frames: 16, hit: 8, end: 16 },
  };
  if (id === "vesper") {
    return {
      ...common,
      special: { dmg: 7, kbg: 40, bkb: 18, ang: 80, frames: 16, hit: 5, end: 12, pull: 0.35 },
      ult: {
        dmg: 6, hits: 4, kbg: 62, bkb: 36, ang: 62, frames: 42, hit: 8, gap: 6, end: 36,
        pull: 0.55, maxLaunch: 4.1, name: "Veil Plunge",
      },
    };
  }
  if (id === "quill") {
    return {
      ...common,
      special: { dmg: 9, kbg: 55, bkb: 22, ang: 12, frames: 24, hit: 10, end: 20, projectile: true },
      ult: {
        dmg: 5, hits: 5, kbg: 70, bkb: 28, ang: 38, frames: 48, hit: 10, gap: 6, end: 42,
        maxLaunch: 4.6, name: "Ridge Volley",
      },
    };
  }
  if (id === "relay") {
    return {
      ...common,
      special: { dmg: 6, kbg: 20, bkb: 10, ang: 90, frames: 14, hit: 4, end: 10, blink: 28 },
      ult: {
        dmg: 14, hits: 2, kbg: 78, bkb: 40, ang: 70, frames: 36, hit: 10, gap: 10, end: 30,
        rift: true, maxLaunch: 4.8, name: "Codex Rift",
      },
    };
  }
  return {
    ...common,
    special: { dmg: 12, kbg: 90, bkb: 50, ang: 80, frames: 26, hit: 10, end: 20, armor: true },
    ult: {
      dmg: 22, hits: 1, kbg: 92, bkb: 58, ang: 50, frames: 40, hit: 16, gap: 0, end: 34,
      maxLaunch: 5.2, name: "Core Collapse",
    },
  };
}

export function createFighter(def, x, facing, stocks) {
  return {
    id: def.id, def, x, y: 8, vx: 0, vy: 0, facing, grounded: true,
    jumpsLeft: def.jumps, percent: 0, stocks, meter: 0, shield: 50, shielding: false,
    action: "idle", actionT: 0, actionMax: 0, hitstun: 0, hitlag: 0, invuln: 0,
    grabT: 0, dodgeT: 0, stale: {}, fastFall: false, ultHits: 0, alive: true, respawnT: 0,
  };
}

export function createMatch(roster, opts) {
  const p1 = roster.fighters[opts.p1];
  const p2 = roster.fighters[opts.p2];
  const stocks = opts.stocks ?? 4;
  return {
    roster, stageId: opts.stage ?? "bloomreach", floor: roster.floor,
    paused: false, over: false, winner: null, frame: 0, hitStop: 0, fx: [],
    p: [createFighter(p1, -36, 1, stocks), createFighter(p2, 36, -1, stocks)],
  };
}

function platformAt(floor, x, y, prevY) {
  const main = floor.main;
  const half = main.w / 2;
  if (x >= main.x - half && x <= main.x + half) {
    if (prevY >= main.y && y <= main.y + 1.2 && y >= main.y - 8) return main.y;
  }
  for (const plat of floor.plats) {
    const h = plat.w / 2;
    if (x >= plat.x - h && x <= plat.x + h) {
      if (prevY >= plat.y && y <= plat.y + 1.2) return plat.y;
    }
  }
  return null;
}

function startAction(f, name, frames) {
  f.action = name; f.actionT = 0; f.actionMax = frames;
}

export function applyHit(atk, vic, move, match, kind) {
  if (vic.invuln > 0 || !vic.alive) return false;
  if (vic.shielding && vic.shield > 4 && kind !== "grab" && kind !== "ult") {
    vic.shield = Math.max(0, vic.shield - move.dmg * 1.4);
    vic.vx += atk.facing * 1.1;
    match.fx.push({ kind: "spark", x: vic.x, y: vic.y + 8, t: 8, c: "#c5c8ce" });
    if (vic.action === "shield" && vic.actionT <= 4) {
      atk.hitstun = 16; atk.vx = -atk.facing * 2.2;
      match.fx.push({ kind: "parry", x: vic.x, y: vic.y + 10, t: 12, c: "#ecece8" });
    }
    return false;
  }
  const uses = atk.stale[kind] || 0;
  const stale = staleMultiplier(uses);
  atk.stale[kind] = uses + 1;
  const dmg = move.dmg * stale;
  vic.percent += dmg;
  const kb = knockback(vic.percent, dmg, vic.def.weight, move.kbg, move.bkb);
  const ang = sakuraiAngle(kb, vic.grounded, move.ang);
  let { vx, vy } = launchVelocity(kb, ang, atk.facing);
  if (move.maxLaunch) {
    const cap = clampLaunch(vx, vy, move.maxLaunch);
    vx = cap.vx; vy = cap.vy;
  }
  if (move.pull) {
    const mid = atk.x * 0.15;
    vic.x += (mid - vic.x) * move.pull;
    vx *= 1 - move.pull * 0.35;
  }
  vic.vx = vx; vic.vy = vy; vic.grounded = false;
  vic.hitstun = Math.max(4, hitstunFrames(kb));
  vic.hitlag = hitlagFrames(dmg);
  atk.hitlag = Math.max(1, (hitlagFrames(dmg) / 2) | 0);
  atk.meter = Math.min(METER_MAX, atk.meter + METER_HIT);
  vic.meter = Math.min(METER_MAX, vic.meter + METER_TAKE);
  vic.action = "tumble"; vic.shielding = false;
  match.fx.push({ kind: "hit", x: vic.x, y: vic.y + 10, t: 10, c: "#e07a4a", s: Math.min(3, 0.6 + dmg / 10) });
  return true;
}

function rangeHit(atk, vic, reach = 16, airOk = true) {
  if (!vic.alive) return false;
  if (!airOk && !atk.grounded) return false;
  const dx = (vic.x - atk.x) * atk.facing;
  const dy = Math.abs(vic.y - atk.y);
  return dx > -2 && dx < reach && dy < 16;
}

export function tickFighter(f, input, other, match) {
  const floor = match.floor;
  if (!f.alive) {
    if (f.respawnT > 0) {
      f.respawnT -= 1;
      if (f.respawnT === 0 && f.stocks > 0) {
        f.alive = true; f.x = 0; f.y = 40; f.vx = 0; f.vy = 0; f.percent = 0;
        f.invuln = 90; f.jumpsLeft = f.def.jumps; f.action = "idle"; f.hitstun = 0;
      }
    }
    return;
  }
  if (f.hitlag > 0) { f.hitlag -= 1; return; }
  if (f.invuln > 0) f.invuln -= 1;
  if (f.hitstun > 0) {
    f.hitstun -= 1;
    input = { x: input.x * 0.35, y: input.y, jump: false, attack: false, special: false, shield: false, grab: false, ult: false };
  }
  const moves = moveTable(f.id);
  const busy = f.action !== "idle" && f.action !== "walk" && f.action !== "dash" && f.action !== "air" && f.action !== "tumble" && f.action !== "shield";
  if (!busy && f.hitstun <= 0) {
    if (input.ult && f.meter >= 100) {
      f.meter = 0; f.ultHits = 0; startAction(f, "ult", moves.ult.frames);
    } else if (input.grab) startAction(f, "grab", 16);
    else if (input.special) {
      startAction(f, "special", moves.special.frames);
      if (moves.special.blink) { f.x += f.facing * moves.special.blink; f.invuln = Math.max(f.invuln, 8); }
    } else if (input.attack) {
      if (!f.grounded) startAction(f, "aerial", moves.aerial.frames);
      else if (input.holdAttack > 12) startAction(f, "smash", moves.smash.frames);
      else if (Math.abs(input.x) > 0.5) startAction(f, "tilt", moves.tilt.frames);
      else startAction(f, "jab", moves.jab.frames);
    } else if (input.shield && f.grounded) { f.action = "shield"; f.shielding = true; }
    else if (input.dodge && f.grounded) {
      startAction(f, "dodge", 16); f.invuln = 10; f.vx = f.facing * (input.x >= 0 ? 2.4 : -2.4);
    }
  }
  if (f.action === "shield") {
    f.shielding = input.shield && f.grounded;
    f.shield = Math.max(0, f.shield - SHIELD_DECAY);
    if (!f.shielding || f.shield <= 0) {
      f.action = "idle"; f.shielding = false;
      if (f.shield <= 0) { f.hitstun = 40; f.shield = 50; }
    }
  } else {
    f.shielding = false; f.shield = Math.min(50, f.shield + 0.08);
  }
  if (f.action !== "idle" && f.action !== "walk" && f.action !== "dash" && f.action !== "air" && f.action !== "tumble" && f.action !== "shield") {
    f.actionT += 1;
    const mv = moves[f.action] || moves.jab;
    if (f.action === "ult") {
      const u = moves.ult;
      const idx = ((f.actionT - u.hit) / Math.max(1, u.gap)) | 0;
      if (f.actionT >= u.hit && idx < u.hits && f.actionT === u.hit + idx * u.gap) {
        if (u.rift) { other.x += (f.x - other.x) * 0.55; other.y += (f.y + 6 - other.y) * 0.4; }
        applyHit(f, other, { ...u, dmg: u.dmg }, match, "ult");
        f.ultHits += 1;
      }
    } else if (f.actionT === (mv.hit || 6)) {
      const reach = f.action === "smash" ? 22 : f.action === "special" && mv.projectile ? 64 : 18;
      if (rangeHit(f, other, reach)) applyHit(f, other, mv, match, f.action);
    }
    if (f.actionT >= f.actionMax) { f.action = f.grounded ? "idle" : "air"; f.actionT = 0; }
  }
  const canSteer = f.hitstun <= 0 && f.action !== "smash" && f.action !== "ult" && f.action !== "dodge";
  if (f.grounded) {
    if (canSteer && f.action !== "shield") {
      const spd = Math.abs(input.x) > 0.7 ? f.def.dash : f.def.walk;
      if (Math.abs(input.x) > 0.2) {
        f.vx = input.x * spd; f.facing = input.x > 0 ? 1 : -1;
        if (f.action === "idle" || f.action === "walk" || f.action === "dash") {
          f.action = Math.abs(input.x) > 0.7 ? "dash" : "walk";
        }
      } else {
        f.vx *= FRICTION;
        if (Math.abs(f.vx) < 0.05 && (f.action === "walk" || f.action === "dash")) f.action = "idle";
      }
    } else if (f.action !== "dodge") f.vx *= FRICTION;
    if (input.jump && canSteer) {
      const hop = input.jumpHold && input.jumpHold < 5 ? f.def.shortHop : f.def.jump;
      f.vy = hop; f.grounded = false; f.jumpsLeft = f.def.jumps - 1; f.fastFall = false; f.action = "air";
    }
  } else {
    if (canSteer) {
      f.vx += input.x * f.def.air * 0.18;
      const cap = f.def.air * 2.2;
      if (f.vx > cap) f.vx = cap;
      if (f.vx < -cap) f.vx = -cap;
      if (Math.abs(input.x) > 0.25) f.facing = input.x > 0 ? 1 : -1;
    }
    f.vx *= AIR_FRIC;
    if (input.jump && f.jumpsLeft > 0 && f.hitstun <= 0) { f.vy = f.def.doubleJump; f.jumpsLeft -= 1; f.fastFall = false; }
    if (input.y < -0.55 && f.vy <= 0) f.fastFall = true;
    f.vy -= f.def.gravity;
    const term = f.fastFall ? f.def.fastFall : f.def.fall;
    if (f.vy < -term) f.vy = -term;
  }
  const prevY = f.y;
  f.x += f.vx; f.y += f.vy;
  const half = floor.main.w / 2;
  if (!floor.rules.walk_offs && f.grounded) {
    if (f.x < floor.main.x - half) { f.x = floor.main.x - half; f.vx = 0; }
    if (f.x > floor.main.x + half) { f.x = floor.main.x + half; f.vx = 0; }
  }
  const land = platformAt(floor, f.x, f.y, prevY);
  if (land !== null && f.vy <= 0) {
    f.y = land; f.vy = 0; f.grounded = true; f.jumpsLeft = f.def.jumps; f.fastFall = false;
    if (f.action === "air" || f.action === "tumble") f.action = "idle";
  } else if (land === null) f.grounded = false;
  const b = floor.blast;
  if (f.x < b.left || f.x > b.right || f.y > b.top || f.y < b.bottom) {
    f.stocks -= 1; f.alive = false; f.respawnT = 90; f.meter = Math.max(0, f.meter * 0.4);
    match.fx.push({ kind: "blast", x: f.x, y: f.y, t: 22, c: "#e07a4a" });
    if (f.stocks <= 0) { match.over = true; match.winner = other.id; }
  }
}

export function tickMatch(match, inputs) {
  if (match.paused || match.over) return;
  match.frame += 1;
  for (const fx of match.fx) fx.t -= 1;
  match.fx = match.fx.filter((f) => f.t > 0);
  tickFighter(match.p[0], inputs[0], match.p[1], match);
  tickFighter(match.p[1], inputs[1], match.p[0], match);
}

export function emptyInput() {
  return { x: 0, y: 0, jump: false, jumpHold: 0, attack: false, holdAttack: 0, special: false, shield: false, grab: false, dodge: false, ult: false };
}
