import { emptyInput } from "./sim.js";

const P1 = {
  left: ["KeyA"],
  right: ["KeyD"],
  up: ["KeyW", "Space"],
  down: ["KeyS"],
  attack: ["KeyJ"],
  special: ["KeyK"],
  shield: ["KeyL"],
  grab: ["KeyI"],
  ult: ["KeyU"],
  dodge: ["KeyO"],
};

const P2 = {
  left: ["ArrowLeft"],
  right: ["ArrowRight"],
  up: ["ArrowUp"],
  down: ["ArrowDown"],
  attack: ["Digit1", "Numpad1"],
  special: ["Digit2", "Numpad2"],
  shield: ["Digit3", "Numpad3"],
  grab: ["Digit4", "Numpad4"],
  ult: ["Digit5", "Numpad5"],
  dodge: ["Digit6"],
};

export function holdOnly(src) {
  const i = emptyInput();
  if (!src) return i;
  i.x = src.x; i.y = src.y;
  i.shield = !!src.shield;
  i.jumpHold = src.jumpHold || 0;
  i.holdAttack = src.holdAttack || 0;
  return i;
}

const TAP = ["attack", "special", "grab", "ult", "dodge", "jump", "smash"];

export function createInput() {
  const down = new Set();
  const hold = { p1Attack: 0, p2Attack: 0, p1Jump: 0, p2Jump: 0 };
  const pad = { x: 0, y: 0, attack: false, special: false, jump: false, shield: false, grab: false, ult: false, dodge: false, smash: false };
  const edge = { pause: false };
  const was = { p1: {}, p2: {}, pad: {} };

  window.addEventListener("keydown", (e) => {
    down.add(e.code);
    if (e.code === "KeyP" || e.code === "Escape") edge.pause = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => down.delete(e.code));

  function axis(map) {
    let x = 0;
    let y = 0;
    if (map.left.some((k) => down.has(k))) x -= 1;
    if (map.right.some((k) => down.has(k))) x += 1;
    if (map.up.some((k) => down.has(k))) y += 1;
    if (map.down.some((k) => down.has(k))) y -= 1;
    return { x, y };
  }

  function pack(map, which) {
    const a = axis(map);
    const attack = map.attack.some((k) => down.has(k));
    const jump = map.up.some((k) => down.has(k));
    if (which === 1) {
      hold.p1Attack = attack ? hold.p1Attack + 1 : 0;
      hold.p1Jump = jump ? hold.p1Jump + 1 : 0;
    } else {
      hold.p2Attack = attack ? hold.p2Attack + 1 : 0;
      hold.p2Jump = jump ? hold.p2Jump + 1 : 0;
    }
    const raw = {
      x: a.x,
      y: a.y,
      jump,
      jumpHold: which === 1 ? hold.p1Jump : hold.p2Jump,
      attack,
      holdAttack: which === 1 ? hold.p1Attack : hold.p2Attack,
      special: map.special.some((k) => down.has(k)),
      shield: map.shield.some((k) => down.has(k)),
      grab: map.grab.some((k) => down.has(k)),
      dodge: map.dodge.some((k) => down.has(k)),
      ult: map.ult.some((k) => down.has(k)),
    };
    const prev = which === 1 ? was.p1 : was.p2;
    TAP.forEach((k) => {
      const on = !!raw[k];
      raw[k] = on && !prev[k];
      prev[k] = on;
    });
    return raw;
  }

  return {
    down,
    pad,
    poll(cpuP2) {
      const p1 = pack(P1, 1);
      const padFire = {};
      TAP.forEach((k) => {
        const on = !!pad[k] || (k === "jump" && pad.y > 0.62) || (k === "attack" && pad.smash);
        padFire[k] = on && !was.pad[k];
        was.pad[k] = on;
      });
      if (Math.abs(pad.x) + Math.abs(pad.y) > 0.12 || pad.attack || pad.jump || pad.special || pad.shield || pad.grab || pad.ult || pad.dodge || pad.smash) {
        p1.x = Math.abs(pad.x) > Math.abs(p1.x) ? pad.x : (p1.x || pad.x);
        p1.y = Math.abs(pad.y) > 0.12 ? pad.y : p1.y;
        p1.attack = p1.attack || padFire.attack || padFire.smash;
        p1.jump = p1.jump || padFire.jump;
        p1.special = p1.special || padFire.special;
        p1.shield = p1.shield || pad.shield;
        p1.grab = p1.grab || padFire.grab;
        p1.ult = p1.ult || padFire.ult;
        p1.dodge = p1.dodge || padFire.dodge;
        if (pad.smash) p1.holdAttack = Math.max(p1.holdAttack || 0, 16);
      }
      const p2 = cpuP2 ? emptyInput() : pack(P2, 2);
      const pause = edge.pause;
      edge.pause = false;
      return { p1, p2, pause };
    },
  };
}
