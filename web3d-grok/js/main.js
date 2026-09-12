import { createMatch, tickMatch, emptyInput } from "./sim.js";
import { createInput, holdOnly } from "./input.js";
import { cpuThink, pickFoe } from "./cpu.js";
import { createView } from "./view.js";
import { FFNet } from "./net.js";

const ids = ["vesper", "quill", "relay", "forge"];
const stageIds = ["bloomreach", "alpine", "emberfall", "hearth"];

const ui = {
  overlay: document.getElementById("overlay"),
  hud: document.getElementById("hud"),
  p1: document.getElementById("hud-p1"),
  p2: document.getElementById("hud-p2"),
  banner: document.getElementById("banner"),
  result: document.getElementById("result"),
};

const state = {
  roster: null,
  match: null,
  view: null,
  input: createInput(),
  settings: {
    p1: "vesper", p2: "forge", stage: "bloomreach", stocks: 4,
    mode: "solo", cpu: true, seats: 4, ultimates: true, rage: true, items: true, plats: true, artifacts: true, wires: false,
    shake: true, lefty: false, colorblind: "off", gfx: "balanced", diff: "normal",
  },
  running: false,
};


function applyPrefs() {
  document.body.classList.toggle("lefty", !!state.settings.lefty);
  document.body.dataset.cb = state.settings.colorblind || "off";
  document.body.dataset.gfx = state.settings.gfx || "balanced";
  if (state.view && state.view.applyQuality) state.view.applyQuality(state.settings.gfx);
  if (state.view && state.view.setWires) state.view.setWires(!!state.settings.wires);
  try { localStorage.setItem("ffue5", JSON.stringify({
    diff: state.settings.diff, gfx: state.settings.gfx, colorblind: state.settings.colorblind,
    lefty: state.settings.lefty, shake: state.settings.shake, wires: state.settings.wires,
  })); } catch {}
}
function loadPrefs() {
  try {
    const s = JSON.parse(localStorage.getItem("ffue5") || "{}");
    Object.assign(state.settings, s);
  } catch {}
}
function stockDots(n) {
  return Array.from({ length: Math.max(0, n) }, () => "\u25c6").join(" ");
}

function paintHud() {
  if (!state.match) return;
  const tag = (f) => {
    const bits = [];
    if (state.settings.rage && f.percent >= 100) bits.push("RAGE");
    if (state.settings.ultimates && f.meter >= 100) bits.push("ULT");
    return bits.length ? ` <span class="stk">${bits.join(" \u00b7 ")}</span>` : "";
  };
  const card = (f, you) => {
    const stk = state.settings.mode === "training" ? "TRAIN" : stockDots(f.stocks);
    const name = you ? "YOU \u00b7 " + f.def.name : f.def.name;
    return `<b>${name}</b><span class="pct">${f.percent.toFixed(1)}%</span><span class="stk">${stk}</span>${tag(f)}<i style="width:${f.meter}%"></i>`;
  };
  const slots = [ui.p1, ui.p2, document.getElementById("hud-p3"), document.getElementById("hud-p4")];
  slots.forEach((el, i) => {
    if (!el) return;
    const f = state.match.p[i];
    el.hidden = !f;
    if (f) el.innerHTML = card(f, i === 0);
  });
  document.body.classList.toggle("ffa", state.match.p.length > 2);
  if (state.match.over) {
    ui.result.hidden = false;
    ui.result.textContent = `${state.match.winner.toUpperCase()} wins`;
  } else if (state.match.paused) {
    ui.banner.textContent = "paused";
  } else {
    ui.banner.textContent = state.roster.stages[state.match.stageId].name;
    ui.result.hidden = true;
  }
  const coach = document.getElementById("coach");
  if (coach) coach.textContent = state.match.coach || "Ready";
  const combo = document.getElementById("combo");
  if (combo) {
    const n = state.match.combo || 0;
    const fresh = state.match.comboAt && state.match.frame - state.match.comboAt < 48;
    combo.hidden = !(n > 1 && fresh);
    combo.textContent = n > 1 && fresh ? n + " HIT" : "";
  }
}

function snap(match) {
  return {
    frame: match.frame,
    over: match.over,
    winner: match.winner,
    coach: match.coach,
    p: match.p.map((f) => ({
      id: f.def.id, x: f.x, y: f.y, vx: f.vx, vy: f.vy, face: f.face,
      percent: f.percent, stocks: f.stocks, action: f.action, alive: f.alive, meter: f.meter,
    })),
  };
}
function applySnap(match, s) {
  match.frame = s.frame;
  match.over = s.over;
  match.winner = s.winner;
  if (s.coach) match.coach = s.coach;
  (s.p || []).forEach((d, i) => {
    const f = match.p[i];
    if (!f) return;
    Object.assign(f, d);
  });
}
function cpuToon(you) {
  const ids = ["vesper", "quill", "relay", "forge"];
  return ids.find((id) => id !== you) || "forge";
}
function simMode(m) {
  if (m === "coop") return "couch";
  if (m === "solo" || m === "room" || m === "versus") return "versus";
  return m;
}
function startFight() {
  if (!state.roster) return;
  const m = state.settings.mode;
  if (m === "solo" || m === "room" || m === "training") {
    if (!state.settings.p2 || state.settings.p2 === state.settings.p1) state.settings.p2 = cpuToon(state.settings.p1);
  }
  const opts = { ...state.settings, mode: simMode(m) };
  if (m === "ffa") opts.mode = "ffa";
  if (m === "training") opts.mode = "training";
  if (m === "coop") opts.mode = "couch";
  state.match = createMatch(state.roster, opts);
  if (state.view.clearSlots) state.view.clearSlots();
  state.match.p.forEach((f, i) => state.view.mountFighter(i, f.def));
  state.view.tintStage(state.roster.stages[state.match.stageId], state.settings);
  applyPrefs();
  ui.overlay.hidden = true;
  ui.hud.hidden = false;
  ui.result.hidden = true;
  document.body.classList.add("playing");
  state.running = true;
}

let lastT = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function loop(now) {
  requestAnimationFrame(loop);
  if (!state.match || !state.running) {
    state.view?.render();
    lastT = now || performance.now();
    acc = 0;
    return;
  }
  const t = now || performance.now();
  acc += Math.min(34, t - lastT);
  lastT = t;
  const localP2 = state.settings.mode === "coop";
  const polled = state.input.poll(!localP2);
  if (polled.pause) state.match.paused = !state.match.paused;
  let stepped = false;
  let steps = 0;
  while (acc >= STEP && steps < 2) {
    acc -= STEP;
    stepped = true;
    steps += 1;
    const p1 = steps === 1 ? polled.p1 : holdOnly(polled.p1);
    const p2 = steps === 1 ? polled.p2 : holdOnly(polled.p2);
    const inputs = [p1];
    for (let i = 1; i < state.match.p.length; i++) {
      if (state.settings.mode === "training") inputs.push(emptyInput());
      else if (localP2 && i === 1) inputs.push(p2);
      else {
        const self = state.match.p[i];
        const foe = pickFoe(self, state.match.p);
        inputs.push(cpuThink(self, foe, state.match.floor, state.match.frame, state.settings.diff || "normal"));
      }
    }
    if (FFNet.enabled && !FFNet.host && FFNet.lastState && FFNet.lastState.p) {
      applySnap(state.match, FFNet.lastState);
    } else {
      if (FFNet.enabled && FFNet.host) {
        for (let i = 1; i < inputs.length; i++) {
          if (FFNet.remote[i] && (FFNet.remote[i].x || FFNet.remote[i].attack || FFNet.remote[i].jump)) {
            inputs[i] = steps === 1 ? FFNet.remote[i] : holdOnly(FFNet.remote[i]);
          }
        }
      }
      tickMatch(state.match, inputs);
      if (FFNet.enabled && FFNet.host) FFNet.broadcastState(snap(state.match));
    }
    if (FFNet.enabled && !FFNet.host && steps === 1) FFNet.sendInput(polled.p1);
  }
  if (acc > STEP) acc = STEP * 0.95;
  const alpha = state.settings.gfx === "perf" ? 1 : acc / STEP;
  if (stepped || state.settings.gfx !== "perf") {
    state.view.sync(state.match, state.settings, alpha);
    if (stepped && state.match.frame % 2 === 0) paintHud();
  }
  if (!(state.settings.gfx === "perf" && !stepped)) state.view.render();
}

function bindPad() {
  const pad = state.input.pad;
  const stick = document.getElementById("stick");
  let stickId = null;
  const setAxis = (ev, down) => {
    if (!stick) return;
    const r = stick.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    const y = -(((ev.clientY - r.top) / r.height) * 2 - 1);
    if (down) {
      let ax = Math.max(-1, Math.min(1, x));
      let ay = Math.max(-1, Math.min(1, y));
      const mag = Math.hypot(ax, ay);
      if (mag > 1) { ax /= mag; ay /= mag; }
      const dead = 0.16;
      if (mag < dead) { ax = 0; ay = 0; }
      pad.x = ax;
      pad.y = ay;
    } else {
      pad.x = 0;
      pad.y = 0;
    }
    const knob = document.getElementById("knob");
    if (knob) knob.style.transform = "translate(" + (pad.x * 38) + "px," + (-pad.y * 38) + "px)";
    const q = (sel, on) => { const el = document.querySelector(sel); if (el) el.classList.toggle("on", on); };
    q(".q-right", pad.x > 0.4); q(".q-left", pad.x < -0.4);
    q(".q-up", pad.y > 0.4); q(".q-down", pad.y < -0.4);
  };
  const halt = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  if (stick) {
    stick.addEventListener("pointerdown", (e) => {
      halt(e);
      stickId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      setAxis(e, true);
    });
    stick.addEventListener("pointermove", (e) => {
      if (stickId !== e.pointerId) return;
      halt(e);
      setAxis(e, true);
    });
    const up = (e) => {
      if (stickId !== null && e.pointerId !== stickId) return;
      halt(e);
      stickId = null;
      setAxis(e, false);
    };
    stick.addEventListener("pointerup", up);
    stick.addEventListener("pointercancel", up);
    stick.addEventListener("lostpointercapture", () => {
      stickId = null;
      pad.x = 0;
      pad.y = 0;
    });
  }
  document.querySelectorAll("[data-pad]").forEach((b) => {
    const key = b.dataset.pad;
    const on = (e) => {
      halt(e);
      try { b.setPointerCapture(e.pointerId); } catch {}
      pad[key] = true;
      b.classList.add("on");
    };
    const off = (e) => {
      halt(e);
      pad[key] = false;
      b.classList.remove("on");
    };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointercancel", off);
  });
}

function bindMenu() {
  document.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [slot, id] = btn.dataset.pick.split(":");
      state.settings[slot] = id;
      document.querySelectorAll(`[data-pick^="${slot}:"]`).forEach((b) => b.classList.toggle("on", b === btn));
      if (state.view && state.roster) {
        const you = state.roster.fighters[state.settings.p1];
        const other = state.roster.fighters[state.settings.p2] || state.roster.fighters.forge;
        state.view.clearSlots();
        state.view.mountFighter(0, you);
        if (state.settings.mode !== "solo" && state.settings.mode !== "training") state.view.mountFighter(1, other);
        else state.view.mountFighter(1, other);
      }
    });
  });
  document.querySelectorAll("[data-stage]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.stage = btn.dataset.stage;
      document.querySelectorAll("[data-stage]").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  document.querySelectorAll("[data-seats]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.seats = +btn.dataset.seats;
      document.querySelectorAll("[data-seats]").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  document.getElementById("stocks").addEventListener("change", (e) => {
    state.settings.stocks = +e.target.value;
  });
  function syncMenu() {
    const m = state.settings.mode;
    const opp = document.getElementById("opp-row");
    const room = document.getElementById("room-row");
    const ffa = document.getElementById("ffa-row");
    if (opp) opp.hidden = m !== "coop";
    if (room) room.hidden = m !== "room";
    if (ffa) ffa.hidden = m !== "ffa";
  }
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.mode = btn.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("on", b === btn));
      syncMenu();
    });
  });
  syncMenu();
  const bindCheck = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => { state.settings[key] = el.checked; applyPrefs(); });
  };
  bindCheck("opt-ults", "ultimates");
  bindCheck("opt-rage", "rage");
  bindCheck("opt-items", "items");
  bindCheck("opt-plats", "plats");
  bindCheck("artifacts", "artifacts");
  bindCheck("opt-wires", "wires");
  bindCheck("opt-shake", "shake");
  bindCheck("opt-lefty", "lefty");
  const cb = document.getElementById("opt-cb");
  if (cb) {
    cb.value = state.settings.colorblind || "off";
    cb.addEventListener("change", () => { state.settings.colorblind = cb.value; applyPrefs(); });
  }
  document.querySelectorAll("[data-diff]").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.diff === state.settings.diff);
    btn.addEventListener("click", () => {
      state.settings.diff = btn.dataset.diff;
      document.querySelectorAll("[data-diff]").forEach((b) => b.classList.toggle("on", b === btn));
      applyPrefs();
    });
  });
  document.querySelectorAll("[data-gfx]").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.gfx === state.settings.gfx);
    btn.addEventListener("click", () => {
      state.settings.gfx = btn.dataset.gfx;
      document.querySelectorAll("[data-gfx]").forEach((b) => b.classList.toggle("on", b === btn));
      applyPrefs();
    });
  });
  const leftyEl = document.getElementById("opt-lefty");
  if (leftyEl) leftyEl.checked = !!state.settings.lefty;
  const shakeEl = document.getElementById("opt-shake");
  if (shakeEl) shakeEl.checked = state.settings.shake !== false;
  const wiresEl = document.getElementById("opt-wires");
  if (wiresEl) wiresEl.checked = !!state.settings.wires;

  document.getElementById("btn-enter").addEventListener("click", startFight);
  document.getElementById("btn-quick").addEventListener("click", () => {
    state.settings.mode = "solo";
    startFight();
  });
  const train = document.getElementById("btn-train");
  if (train) train.addEventListener("click", () => {
    state.settings.mode = "training";
    startFight();
  });
  const ffa = document.getElementById("btn-ffa");
  if (ffa) ffa.addEventListener("click", () => {
    state.settings.mode = "ffa";
    startFight();
  });
  document.getElementById("btn-menu").addEventListener("click", () => {
    state.running = false;
    document.body.classList.remove("playing");
    ui.overlay.hidden = false;
    ui.result.hidden = true;
  });
  const info = document.getElementById("btn-info");
  if (info) info.addEventListener("click", () => document.getElementById("info")?.classList.toggle("open"));
  const pauseBtn = document.getElementById("btn-pause");
  if (pauseBtn) pauseBtn.addEventListener("click", () => {
    if (!state.match) return;
    state.match.paused = !state.match.paused;
    pauseBtn.textContent = state.match.paused ? "Play" : "Pause";
  });
  const neu = document.getElementById("btn-new");
  if (neu) neu.addEventListener("click", () => location.reload());
    const codeEl = document.getElementById("room-code");
  const statusEl = document.getElementById("room-status");
  document.getElementById("btn-host")?.addEventListener("click", async () => {
    if (codeEl && !codeEl.value) codeEl.value = FFNet.makeCode();
    state.settings.mode = "room";
    state.settings.room = (codeEl?.value || "").toUpperCase();
    if (statusEl) statusEl.textContent = "hosting\u2026";
    const ok = await FFNet.boot({ host: true, room: state.settings.room });
    if (statusEl) statusEl.textContent = ok ? "host " + state.settings.room : "offline \u00b7 CPU";
  });
  document.getElementById("btn-join")?.addEventListener("click", async () => {
    state.settings.mode = "room";
    state.settings.room = (codeEl?.value || "").toUpperCase();
    if (!state.settings.room) { if (statusEl) statusEl.textContent = "need code"; return; }
    if (statusEl) statusEl.textContent = "joining\u2026";
    const ok = await FFNet.boot({ host: false, room: state.settings.room });
    if (statusEl) statusEl.textContent = ok ? "joined " + state.settings.room : "offline \u00b7 CPU";
  });
  bindPad();
}

async function boot() {
  loadPrefs();
  bindMenu();
  try {
    state.roster = await fetch("./data/roster.json").then((r) => r.json());
    const canvas = document.getElementById("view");
    state.view = createView(canvas);
    state.view.resize();
    state.view.mountFighter(0, state.roster.fighters.vesper);
    state.view.mountFighter(1, state.roster.fighters.forge);
    state.view.tintStage(state.roster.stages.bloomreach);
    applyPrefs();
  } catch (err) {
    console.error(err);
    const sub = document.querySelector("#overlay .sub");
    if (sub) sub.textContent = "Menu is live. 3D view failed to boot \u2014 Enter still starts sim.";
  }
  loop();
}

boot();
export { ids, stageIds, emptyInput };
