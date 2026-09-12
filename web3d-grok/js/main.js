import { createMatch, tickMatch, emptyInput } from "./sim.js";
import { createInput } from "./input.js";
import { cpuThink } from "./cpu.js";
import { createView } from "./view.js";

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
  settings: { p1: "vesper", p2: "forge", stage: "bloomreach", stocks: 4, cpu: true },
  running: false,
};

function stockDots(n) {
  return Array.from({ length: Math.max(0, n) }, () => "\u25c6").join(" ");
}

function paintHud() {
  if (!state.match) return;
  const [a, b] = state.match.p;
  ui.p1.innerHTML = `<b>${a.def.name}</b><span class="pct">${a.percent.toFixed(1)}%</span><span class="stk">${stockDots(a.stocks)}</span><i style="width:${a.meter}%"></i>`;
  ui.p2.innerHTML = `<b>${b.def.name}</b><span class="pct">${b.percent.toFixed(1)}%</span><span class="stk">${stockDots(b.stocks)}</span><i style="width:${b.meter}%"></i>`;
  if (state.match.over) {
    ui.result.hidden = false;
    ui.result.textContent = `${state.match.winner.toUpperCase()} wins`;
  } else if (state.match.paused) {
    ui.banner.textContent = "paused";
  } else {
    ui.banner.textContent = state.roster.stages[state.match.stageId].name;
    ui.result.hidden = true;
  }
}

function startFight() {
  state.match = createMatch(state.roster, state.settings);
  state.view.mountFighter(0, state.match.p[0].def);
  state.view.mountFighter(1, state.match.p[1].def);
  state.view.tintStage(state.roster.stages[state.match.stageId]);
  ui.overlay.hidden = true;
  ui.hud.hidden = false;
  ui.result.hidden = true;
  document.body.classList.add("playing");
  state.running = true;
}

function loop() {
  requestAnimationFrame(loop);
  if (!state.match || !state.running) {
    state.view?.render();
    return;
  }
  const polled = state.input.poll(state.settings.cpu);
  if (polled.pause) state.match.paused = !state.match.paused;
  const p2 = state.settings.cpu
    ? cpuThink(state.match.p[1], state.match.p[0], state.match.floor, state.match.frame)
    : polled.p2;
  tickMatch(state.match, [polled.p1, p2]);
  state.view.sync(state.match);
  state.view.render();
  if (state.match.frame % 2 === 0) paintHud();
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
      pad.x = Math.max(-1, Math.min(1, x));
      pad.y = Math.max(-1, Math.min(1, y));
    } else {
      pad.x = 0;
      pad.y = 0;
    }
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
    const on = (e) => { halt(e); pad[key] = true; };
    const off = (e) => { halt(e); pad[key] = false; };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointercancel", off);
    b.addEventListener("pointerleave", off);
  });
}

function bindMenu() {
  document.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [slot, id] = btn.dataset.pick.split(":");
      state.settings[slot] = id;
      document.querySelectorAll(`[data-pick^="${slot}:"]`).forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  document.querySelectorAll("[data-stage]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.stage = btn.dataset.stage;
      document.querySelectorAll("[data-stage]").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  document.getElementById("stocks").addEventListener("change", (e) => {
    state.settings.stocks = +e.target.value;
  });
  document.getElementById("cpu").addEventListener("change", (e) => {
    state.settings.cpu = e.target.checked;
  });
  document.getElementById("btn-enter").addEventListener("click", startFight);
  document.getElementById("btn-quick").addEventListener("click", () => {
    state.settings = { p1: "vesper", p2: "forge", stage: "bloomreach", stocks: 4, cpu: true };
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
  bindPad();
}

async function boot() {
  state.roster = await fetch("./data/roster.json").then((r) => r.json());
  const canvas = document.getElementById("view");
  state.view = createView(canvas);
  state.view.resize();
  state.view.mountFighter(0, state.roster.fighters.vesper);
  state.view.mountFighter(1, state.roster.fighters.forge);
  state.view.tintStage(state.roster.stages.bloomreach);
  bindMenu();
  loop();
}

boot();
export { ids, stageIds, emptyInput };
