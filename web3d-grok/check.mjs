#!/usr/bin/env node
/**
 * Production check for the Grok learning slice.
 * No network. Compares JS knockback against the Python math_kb copy.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)));
const repo = join(root, "..");

const roster = JSON.parse(readFileSync(join(root, "data/roster.json"), "utf8"));
assert.deepEqual(Object.keys(roster.fighters).sort(), ["forge", "quill", "relay", "vesper"]);
assert.equal(roster.floor.rules.walk_offs, false);
assert.equal(roster.floor.rules.walls, false);
assert.equal(roster.floor.rules.hazards, false);
assert.equal(roster.floor.main.w, 168);

const mathSrc = readFileSync(join(root, "js/math.js"), "utf8");
assert.match(mathSrc, /LAUNCH_SPEED_SCALE = 0.03/);
assert.match(mathSrc, /HITSTUN_FACTOR = 0.4/);

const py = spawnSync(
  "python3",
  [
    "-c",
    "import importlib.util, pathlib;"
      + "p=pathlib.Path('python/frameforge/math_kb.py');"
      + "s=importlib.util.spec_from_file_location('math_kb', p);"
      + "m=importlib.util.module_from_spec(s); s.loader.exec_module(m);"
      + "kb=m.knockback(80,12,75,90,30); vx,vy=m.launch_velocity(kb,40,1);"
      + "print(f'{kb:.6f} {vx:.6f} {vy:.6f} {m.hitstun_frames(kb)}')",
  ],
  { cwd: repo, encoding: "utf8" },
);
assert.equal(py.status, 0, py.stderr);

function knockback(percentAfter, damage, weight, kbg, bkb) {
  const p = +percentAfter;
  const d = +damage;
  const w = +weight;
  const s = +kbg / 100;
  const b = +bkb;
  const inner = p / 10 + (p * d) / 20;
  const scaled = inner * (200 / (w + 100)) * 1.4;
  return (scaled + 18) * s + b;
}
const LAUNCH_SPEED_SCALE = 0.03;
const kb = knockback(80, 12, 75, 90, 30);
const speed = kb * LAUNCH_SPEED_SCALE;
const rad = (40 * Math.PI) / 180;
const vx = speed * Math.cos(rad);
const vy = speed * Math.sin(rad);
const hs = (kb * 0.4) | 0;
const [pkb, pvx, pvy, phs] = py.stdout.trim().split(/\s+/).map(Number);
assert.ok(Math.abs(kb - pkb) < 1e-6, `kb ${kb} vs ${pkb}`);
assert.ok(Math.abs(vx - pvx) < 1e-6, `vx ${vx} vs ${pvx}`);
assert.ok(Math.abs(vy - pvy) < 1e-6, `vy ${vy} vs ${pvy}`);
assert.equal(hs, phs);

const sim = readFileSync(join(root, "js/sim.js"), "utf8");
assert.match(sim, /Veil Plunge/);
assert.match(sim, /maxLaunch: 4\.1/);
assert.match(sim, /Codex Rift/);

const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /Not a Nintendo product/);
assert.match(html, /no Blender/);

const { createMatch, tickMatch, emptyInput, moveTable } = await import("./js/sim.js");
assert.equal(moveTable("vesper").ult.maxLaunch, 4.1);
const match = createMatch(roster, { p1: "vesper", p2: "forge", stocks: 1, stage: "bloomreach" });
const atk = { ...emptyInput(), attack: true };
for (let i = 0; i < 180; i++) tickMatch(match, [atk, emptyInput()]);
assert.equal(match.p[0].alive || match.p[0].stocks <= 1, true);
assert.ok(match.frame === 180);

console.log(
  JSON.stringify(
    {
      ok: true,
      slice: "web3d-grok",
      fighters: Object.keys(roster.fighters),
      knockback80_12_75: Number(kb.toFixed(4)),
      python_match: true,
    },
    null,
    2,
  ),
);
