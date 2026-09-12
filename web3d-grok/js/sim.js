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
    dropT: 0, px: x, py: 8,
  };
}

export function createMatch(roster, opts) {
  const stocks = opts.stocks ?? 4;
  const ids = ["vesper", "quill", "relay", "forge"];
  const seats = opts.mode === "ffa" ? Math.max(2, Math.min(4, opts.seats || 4)) : 2;
  const chosen = [opts.p1 || "vesper", opts.p2 || "forge"];
  while (chosen.length < seats) {
    const n = ids.find((id) => !chosen.includes(id)) || ids[chosen.length % 4];
    chosen.push(n);
  }
  const span = [ -42, 42, -18, 18 ];
  const pack = chosen.slice(0, seats).map((id, i) => {
    const def = roster.fighters[id] || roster.fighters.vesper;
    const x = span[i] ?? ((i % 2 ? 1 : -1) * (36 + i * 8));
    return createFighter(def, x, x < 0 ? 1 : -1, stocks);
  });
  const floor = JSON.parse(JSON.stringify(roster.floor));
  if (opts.plats !== false) {
    const have = new Set((floor.plats || []).map((p) => p.id));
    [
      { id: "plat_c", x: 0, y: 48, w: 36, h: 3, soft: true },
      { id: "plat_ml", x: -28, y: 18, w: 24, h: 3, soft: true },
      { id: "plat_mr", x: 28, y: 18, w: 24, h: 3, soft: true },
    ].forEach((p) => { if (!have.has(p.id)) floor.plats.push(p); });
    floor.plats.forEach((p) => { p.soft = true; });
  }
  return {
    roster, stageId: opts.stage ?? "bloomreach", floor,
    paused: false, over: false, winner: null, frame: 0, hitStop: 0, fx: [],
    p: pack, mode: opts.mode || "versus",
    items: [],
    shots: [],
    ultimates: opts.ultimates !== false,
    itemsOn: !!(opts.items || opts.artifacts),
    rage: opts.rage !== false,
    coach: "Ready",
    combo: 0,
    comboAt: 0,
  };
}

function platformAt(floor, x, y, prevY, drop) {
  const main = floor.main;
  const half = main.w / 2;
  let soft = null;
  for (const plat of floor.plats || []) {
    const h = plat.w / 2;
    if (x >= plat.x - h && x <= plat.x + h) {
      if (prevY >= plat.y - 0.2 && y <= plat.y + 2.4 && prevY >= y - 0.01) {
        if (!drop) return plat.y;
        soft = plat.y;
      }
    }
  }
  if (x >= main.x - half && x <= main.x + half) {
    if (prevY >= main.y && y <= main.y + 1.6 && y >= main.y - 10) return main.y;
  }
  return drop ? null : soft;
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
    if (input.ult && match.ultimates !== false && f.meter >= 100) {
      f.meter = 0; f.ultHits = 0; startAction(f, "ult", moves.ult.frames);
      match.coach = moves.ult.name;
      match.fx.push({ kind: "ult", x: f.x, y: f.y + 12, t: 18, c: f.def.accent || "#e07a4a", s: 2 });
    } else if (input.grab) startAction(f, "grab", 16);
    else if (input.special) {
      startAction(f, "special", moves.special.frames);
      if (moves.special.blink) { f.x += f.facing * moves.special.blink; f.invuln = Math.max(f.invuln, 8); }
      if (moves.special.projectile) {
        match.shots.push({
          id: f.id + "-shot", x: f.x + f.facing * 10, y: f.y + 10,
          vx: f.facing * 3.4, vy: 0, life: 48, owner: f, move: moves.special,
        });
        match.fx.push({ kind: "spark", x: f.x + f.facing * 14, y: f.y + 10, t: 8, c: "#c4a35a" });
      }
    } else if (input.attack) {
      if (!f.grounded) startAction(f, "aerial", moves.aerial.frames);
      else if (input.holdAttack > 12) startAction(f, "smash", moves.smash.frames);
      else if (Math.abs(input.x) > 0.5) startAction(f, "tilt", moves.tilt.frames);
      else startAction(f, "jab", moves.jab.frames);
      match.coach = f.action === "aerial" ? "Air" : f.action === "smash" ? "Smash" : f.action === "tilt" ? "Tilt" : "Jab";
    } else if (input.shield && f.grounded) { f.action = "shield"; f.shielding = true; }
    else if (input.dodge) {
      startAction(f, "dodge", f.grounded ? 16 : 12);
      f.invuln = f.grounded ? 10 : 14;
      f.vx = f.facing * (Math.abs(input.x) > 0.2 ? Math.sign(input.x) * 2.6 : 2.2);
      if (!f.grounded) f.vy = Math.max(f.vy, 1.1);
      match.coach = "Dodge";
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
      const idx = ((f.actionT - u.hit) / Math.max(1, u.gap || 1)) | 0;
      if (f.actionT >= u.hit && idx < u.hits && f.actionT === u.hit + idx * (u.gap || 1)) {
        match.p.forEach((vic) => {
          if (vic === f || !vic.alive) return;
          if (u.rift) { vic.x += (f.x - vic.x) * 0.55; vic.y += (f.y + 6 - vic.y) * 0.4; }
          const reach = f.id === "quill" ? 70 : f.id === "forge" ? 28 : 22;
          if (rangeHit(f, vic, reach) || u.rift) applyHit(f, vic, { ...u, dmg: u.dmg }, match, "ult");
        });
        if (f.id === "vesper") { f.vy = 2.2; f.y += 2; match.fx.push({ kind: "ult", x: f.x, y: f.y + 8, t: 12, c: "#3f7a74", s: 1.4 }); }
        if (f.id === "quill") {
          match.shots.push({ id: "volley", x: f.x + f.facing * 12, y: f.y + 10 + idx * 2, vx: f.facing * 4.2, vy: 0.4 - idx * 0.2, life: 36, owner: f, move: { ...u, dmg: u.dmg } });
          match.fx.push({ kind: "spark", x: f.x + f.facing * (18 + idx * 10), y: f.y + 10, t: 10, c: "#c4a35a" });
        }
        if (f.id === "relay") match.fx.push({ kind: "ult", x: f.x, y: f.y + 12, t: 14, c: "#7a5cff", s: 1.8 });
        if (f.id === "forge") {
          f.invuln = Math.max(f.invuln, 8);
          match.fx.push({ kind: "blast", x: f.x, y: f.y + 8, t: 16, c: "#e07a4a", s: 2.2 });
        }
        f.ultHits += 1;
        match.coach = u.name;
      }
    } else if (f.actionT === (mv.hit || 6)) {
      const reach = f.action === "smash" ? 22 : f.action === "special" && mv.projectile ? 64 : 18;
      match.p.forEach((vic) => {
        if (vic === f || !vic.alive) return;
        if (rangeHit(f, vic, reach)) applyHit(f, vic, mv, match, f.action);
      });
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
  f.px = f.x; f.py = f.y;
  const prevY = f.y;
  f.x += f.vx; f.y += f.vy;
  if (input.y < -0.28) f.dropT = 10;
  else if (f.dropT > 0) f.dropT -= 1;
  const half = floor.main.w / 2;
  if (!floor.rules.walk_offs && f.grounded) {
    if (f.x < floor.main.x - half) { f.x = floor.main.x - half; f.vx = 0; }
    if (f.x > floor.main.x + half) { f.x = floor.main.x + half; f.vx = 0; }
  }
  const drop = f.dropT > 0 || input.y < -0.28;
  const land = platformAt(floor, f.x, f.y, prevY, drop);
  const ignoreSoft = drop && land !== null && land !== floor.main.y;
  if (land !== null && !ignoreSoft && f.vy <= 0) {
    f.y = land; f.vy = 0; f.grounded = true; f.jumpsLeft = f.def.jumps; f.fastFall = false;
    if (f.action === "air" || f.action === "tumble") f.action = "idle";
  } else {
    f.grounded = false;
  }
  const b = floor.blast;
  if (f.x < b.left || f.x > b.right || f.y > b.top || f.y < b.bottom) {
    f.stocks -= 1; f.alive = false; f.respawnT = 90; f.meter = Math.max(0, f.meter * 0.4);
    match.fx.push({ kind: "blast", x: f.x, y: f.y, t: 22, c: "#e07a4a" });
    if (f.stocks <= 0) {
      const live = match.p.filter((o) => o.stocks > 0);
      if (live.length <= 1) {
        match.over = true;
        match.winner = (live[0] || other).id;
      }
    }
  }
}

export function tickMatch(match, inputs) {
  if (match.paused || match.over) return;
  match.frame += 1;
  for (const fx of match.fx) fx.t -= 1;
  match.fx = match.fx.filter((f) => f.t > 0);
  if (match.itemsOn && match.frame % 90 === 30 && match.items.length < 3) {
    const pool = ["veil-charm", "ridge-fletch", "ember-chip", "slag-heart"];
    match.items.push({
      id: pool[(match.frame / 90 | 0) % pool.length],
      x: ((match.frame / 90 | 0) % 3 - 1) * 36,
      y: 22 + ((match.frame / 90 | 0) % 2) * 12,
    });
  }
  if (match.shots && match.shots.length) {
    match.shots = match.shots.filter((s) => {
      s.x += s.vx; s.y += s.vy; s.life -= 1;
      match.p.forEach((vic) => {
        if (!vic.alive || vic === s.owner) return;
        if (Math.abs(vic.x - s.x) < 12 && Math.abs(vic.y + 8 - s.y) < 14) {
          applyHit(s.owner, vic, s.move, match, "special");
          s.life = 0;
        }
      });
      if (s.life > 0 && s.life % 4 === 0) match.fx.push({ kind: "spark", x: s.x, y: s.y, t: 6, c: "#e8c07a" });
      return s.life > 0;
    });
  }
  if (match.items && match.items.length) {
    match.items = match.items.filter((it) => {
      for (const f of match.p) {
        if (!f.alive) continue;
        if (Math.abs(f.x - it.x) < 10 && Math.abs(f.y - it.y) < 12) {
          f.meter = Math.min(METER_MAX, f.meter + 28);
          match.fx.push({ kind: "spark", x: it.x, y: it.y, t: 12, c: "#e8c07a" });
          match.coach = it.id.replace("-", " ");
          return false;
        }
      }
      return true;
    });
  }
  match.p.forEach((f, i) => {
    let other = f;
    let best = 1e9;
    match.p.forEach((o, j) => {
      if (i === j || !o.alive) return;
      const d = Math.abs(o.x - f.x) + Math.abs(o.y - f.y) * 0.35;
      if (d < best) { best = d; other = o; }
    });
    tickFighter(f, inputs[i] || emptyInput(), other, match);
  });
}

export function emptyInput() {
  return { x: 0, y: 0, jump: false, jumpHold: 0, attack: false, holdAttack: 0, special: false, shield: false, grab: false, dodge: false, ult: false };
}
