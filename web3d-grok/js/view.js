import * as THREE from "https://unpkg.com/three@0.160.1/build/three.module.js";

const SCALE = 0.045;
const PAL = { bg: 0x0b0c12, steel: 0xc5c8ce, ember: 0xe07a4a, gold: 0xc4a35a };
const KIT = {
  vesper: { primary: 0x4a3428, secondary: 0xd8c3a0, accent: 0x3f7a74, eye: 0xe2c86a },
  quill: { primary: 0x3c4a38, secondary: 0xc4b496, accent: 0x6e8b6a, metal: 0xb8c0c8 },
  relay: { primary: 0x2a3344, secondary: 0xd8d0c0, accent: 0x6a88a8, metal: 0xc4aa6a },
  forge: { primary: 0x2c3036, secondary: 0x8a9098, accent: 0xd07040, eye: 0xffb070 },
};

function rampMap() {
  const c = document.createElement("canvas");
  c.width = 5; c.height = 1;
  const g = c.getContext("2d");
  ["#171717", "#3d3d3d", "#7a7a7a", "#c4c4c4", "#ffffff"].forEach((col, i) => {
    g.fillStyle = col; g.fillRect(i, 0, 1, 1);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}
const RAMP = rampMap();

function cobbleTex() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#6a6460";
  g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 16; x++) {
      const ox = (y % 2) * 8;
      const n = 92 + ((x * 13 + y * 7) % 40);
      g.fillStyle = `rgb(${n + 8},${n + 4},${n - 6})`;
      g.fillRect(x * 16 + ox + 1, y * 16 + 1, 14, 14);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mat(color, emissive = 0x000000, em = 0, extra = {}) {
  if (extra.lit || extra.map) {
    return new THREE.MeshStandardMaterial({
      color, map: extra.map || null,
      metalness: extra.metal ?? 0.28, roughness: extra.rough ?? 0.55,
      emissive, emissiveIntensity: em, transparent: extra.opacity !== undefined, opacity: extra.opacity ?? 1,
    });
  }
  return new THREE.MeshToonMaterial({
    color, gradientMap: RAMP, emissive, emissiveIntensity: em,
    transparent: extra.opacity !== undefined, opacity: extra.opacity ?? 1,
  });
}

function add(g, mesh, x, y, z, sx, sy, sz) {
  mesh.position.set(x, y, z);
  if (sx) mesh.scale.set(sx, sy ?? sx, sz ?? sx);
  g.add(mesh);
  return mesh;
}

function owl() {
  const k = KIT.vesper;
  const g = new THREE.Group();
  const down = mat(k.primary);
  const cream = mat(k.secondary);
  const teal = mat(k.accent, k.accent, 0.15);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), down), 0, 0.62, 0, 1.05, 1.25, 0.9);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), cream), 0, 0.55, 0.16, 0.85, 1.0, 0.7);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), down), 0, 1.08, 0.04);
  add(g, new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), cream), 0, 1.05, 0.22);
  const tuftL = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 6), down), -0.16, 1.32, 0);
  tuftL.rotation.z = 0.4;
  const tuftR = tuftL.clone(); tuftR.position.x = 0.16; tuftR.rotation.z = -0.4; g.add(tuftR);
  const wingL = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.95), down), -0.46, 0.64, -0.02);
  wingL.rotation.z = 0.42; wingL.rotation.y = 0.15;
  const wingR = wingL.clone(); wingR.position.x = 0.46; wingR.rotation.z = -0.42; wingR.rotation.y = -0.15; g.add(wingR);
  const beak = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 6), mat(PAL.gold, PAL.gold, 0.35)), 0, 1.0, 0.3);
  beak.rotation.x = Math.PI / 2;
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mat(k.eye, k.eye, 0.7)), -0.08, 1.12, 0.22);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mat(k.eye, k.eye, 0.7)), 0.08, 1.12, 0.22);
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.32, 6), down), 0, 0.2, 0);
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 5), mat(0x2a2218)), -0.09, 0.02, 0.08);
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 5), mat(0x2a2218)), 0.09, 0.02, 0.08);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), teal), 0, 0.72, 0.3);
  g.userData.wings = [wingL, wingR];
  return g;
}

function ranger() {
  const k = KIT.quill;
  const g = new THREE.Group();
  const cloak = mat(k.primary);
  const cloth = mat(k.secondary);
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 0.95, 8), cloak), 0, 0.62, 0);
  const cape = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.85, 0.08), cloak), 0, 0.7, -0.2);
  cape.rotation.x = 0.18;
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mat(0x1a1814)), 0, 1.18, 0.02);
  const hood = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.28, 8), cloak), 0, 1.34, -0.02);
  hood.rotation.x = -0.2;
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), cloth), 0, 1.12, 0.14);
  const bow = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.022, 6, 16, Math.PI), mat(k.metal, k.metal, 0.2)), 0.38, 0.7, 0.1);
  bow.rotation.y = Math.PI / 2;
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), mat(0x3a2a18)), 0.38, 0.7, 0.1);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), cloak), -0.1, 0.2, 0.02);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), cloak), 0.1, 0.2, 0.02);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.18), mat(k.accent, k.accent, 0.15)), 0, 0.95, 0.16);
  g.userData.bow = bow;
  return g;
}

function mage() {
  const k = KIT.relay;
  const g = new THREE.Group();
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.36, 1.05, 8), mat(k.primary, k.accent, 0.12)), 0, 0.58, 0);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat(k.secondary)), 0, 1.18, 0.02);
  const hood = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 7), mat(k.primary, k.accent, 0.2)), 0, 1.36, -0.02);
  hood.rotation.x = -0.25;
  const book = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.16), mat(k.metal, k.metal, 0.9)), 0.32, 0.72, 0.18);
  const orb = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mat(k.accent, k.accent, 1.4)), 0.32, 0.82, 0.18);
  const halo = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 6, 16), mat(k.metal, k.metal, 0.7)), 0.32, 0.82, 0.18);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), mat(0x1a1220)), -0.1, 0.16, 0);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), mat(0x1a1220)), 0.1, 0.16, 0);
  g.userData.orb = orb; g.userData.halo = halo; g.userData.book = book;
  return g;
}

function golem() {
  const k = KIT.forge;
  const g = new THREE.Group();
  const crystal = mat(k.secondary, k.accent, 0.45, { metal: 0.15, rough: 0.22 });
  const plate = mat(k.primary, 0x000000, 0, { metal: 0.78, rough: 0.32 });
  const core = add(g, new THREE.Mesh(new THREE.OctahedronGeometry(0.22), mat(k.eye, k.eye, 1.6)), 0, 0.86, 0.16);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.7, 0.42), plate), 0, 0.72, 0);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.5), plate), 0, 1.12, 0);
  const shL = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 5), crystal), -0.4, 1.18, 0);
  shL.rotation.z = 0.5;
  const shR = shL.clone(); shR.position.x = 0.4; shR.rotation.z = -0.5; g.add(shR);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), plate), -0.22, 0.28, 0.02);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), plate), 0.22, 0.28, 0.02);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), plate), -0.4, 0.62, 0.04);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), plate), 0.4, 0.62, 0.04);
  g.userData.core = core;
  return g;
}

function dressFor(stageId) {
  const g = new THREE.Group();
  const dirt = stageId === "alpine" ? 0x6a7c88 : stageId === "emberfall" ? 0x3a2218 : stageId === "hearth" ? 0x4a3a30 : 0x243028;
  const far = new THREE.Mesh(new THREE.PlaneGeometry(56, 18), mat(dirt, 0x000000, 0, { lit: true, metal: 0.04, rough: 0.96 }));
  far.position.set(0, 5.2, -16);
  g.add(far);
  const midFloor = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), mat(dirt, 0x000000, 0, { lit: true, metal: 0.06, rough: 0.92 }));
  midFloor.rotation.x = -Math.PI / 2;
  midFloor.position.set(0, -0.42, -7);
  g.add(midFloor);
  const lantern = (x, z, col = PAL.gold) => {
    const p = new THREE.Group();
    p.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.1, 6), mat(0x2a241c)));
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.04), mat(0x2a241c));
    arm.position.set(0.16, 1.05, 0); p.add(arm);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat(col, col, 2.0));
    lamp.position.set(0.28, 0.95, 0); p.add(lamp);
    p.position.set(x, 0.9, z); g.add(p);
  };
  if (stageId === "alpine") {
    lantern(-6.2, -2.0, 0xb8e0e8); lantern(6.2, -2.0, 0xb8e0e8);
    for (const x of [-7.2, -5.2, -3.4, 3.6, 5.4, 7.2]) {
      const z = Math.abs(x) > 5 ? -7.2 : -3.2;
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.62, 2.6, 8), mat(0x1d2a28, 0x6ec8d4, 0.08));
      t.position.set(x, 1.55, z); g.add(t);
    }
  } else if (stageId === "emberfall") {
    lantern(-5.8, -1.8, PAL.ember); lantern(5.8, -1.8, PAL.ember);
    for (const x of [-6.0, -3.6, 3.8, 6.2]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 2.6, 5), mat(0x3a2218, PAL.ember, 0.4));
      p.position.set(x, 1.2, Math.abs(x) > 4 ? -6.4 : -2.4); g.add(p);
    }
  } else if (stageId === "hearth") {
    lantern(-5.6, -1.6, 0xffc07a); lantern(5.6, -1.6, 0xffc07a);
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.55), mat(0x3a2a22, PAL.ember, 0.4));
    hearth.position.set(0, 0.48, -5.0);
    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 6), mat(PAL.ember, PAL.ember, 2.3));
    fire.position.set(0, 1.1, -4.8); g.add(hearth, fire);
  } else {
    lantern(-5.6, -1.5); lantern(5.6, -1.5); lantern(-2.2, -2.0); lantern(2.2, -2.0);
    for (const x of [-6.4, -4.2, 4.4, 6.6]) {
      const z = Math.abs(x) > 5.5 ? -7.0 : -2.6;
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), mat(0x6a3a18, 0xc46a28, 0.08));
      canopy.position.set(x, 1.35, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 1.2, 6), mat(0x3a2a18));
      trunk.position.set(x, 0.4, z); g.add(canopy, trunk);
    }
  }
  return g;
}

export function createView(canvas) {
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 820;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5));
  renderer.setClearColor(PAL.bg, 1);
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xb89878, 48, 110);
  const camera = new THREE.PerspectiveCamera(46, 9 / 16, 0.1, 220);
  camera.position.set(0, 5.2, 19.4);
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6a5848, 1.7));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.05);
  key.position.set(-7, 12, 8);
  const rim = new THREE.DirectionalLight(0xe07a4a, 0.5);
  rim.position.set(7, 3, -5);
  const fill = new THREE.DirectionalLight(0x89b4ff, 0.32);
  fill.position.set(0, 6, 10);
  const warm = new THREE.PointLight(0xffc07a, 4.2, 32, 1.3);
  warm.position.set(-5.4, 3.2, 2.2);
  const cool = new THREE.PointLight(0xffe0a8, 3.2, 30, 1.3);
  cool.position.set(5.4, 3.4, 2.4);
  const under = new THREE.PointLight(0xff9a4a, 2.0, 20, 1.8);
  under.position.set(0, 0.6, 3.2);
  scene.add(key, rim, fill, warm, cool, under);
  const arena = new THREE.Group();
  const cobble = cobbleTex();
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 4.25, 0.42, 36), mat(0x3a3d44, 0x000000, 0, { lit: true, metal: 0.18, rough: 0.82, map: cobble }));
  deck.position.y = -0.2;
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(4.32, 4.38, 0.08, 36), mat(0x1c1e22, 0x000000, 0, { metal: 0.35, rough: 0.7 }));
  lip.position.y = 0.04;
  arena.add(deck, lip);
  scene.add(arena);
  let dress = dressFor("bloomreach");
  scene.add(dress);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 20, 14), new THREE.MeshBasicMaterial({ color: 0x171c28, side: THREE.BackSide }));
  scene.add(sky);
  const fxRoot = new THREE.Group(); scene.add(fxRoot);
  const fxPool = []; const seen = new WeakSet();
  function spawnFx(kind, x, y, c, s = 1) {
    let mesh;
    if (kind === "hit" || kind === "spark") mesh = new THREE.Mesh(new THREE.TorusGeometry(0.22 * s, 0.045, 6, 18), mat(c, c, 1.5));
    else if (kind === "parry") mesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.45, 20), mat(0xecece8, 0xecece8, 1.7));
    else if (kind === "blast") mesh = new THREE.Mesh(new THREE.SphereGeometry(0.4 * s, 10, 8), mat(c, c, 1.9, { opacity: 0.7 }));
    else mesh = new THREE.Mesh(new THREE.CircleGeometry(0.32 * s, 14), mat(c, c, 1.3, { opacity: 0.8 }));
    mesh.position.set(x * SCALE, Math.max(0.4, y * SCALE), 0.4);
    mesh.userData.life = 1; fxRoot.add(mesh); fxPool.push(mesh);
  }
  const makers = { vesper: owl, quill: ranger, relay: mage, forge: golem };
  const fighters = [null, null, null, null];
  const bubbles = [null, null, null, null];
  const platRoot = new THREE.Group(); scene.add(platRoot);
  const itemRoot = new THREE.Group(); scene.add(itemRoot);
  const wireRoot = new THREE.Group(); wireRoot.visible = false; scene.add(wireRoot);
  (function buildWires() {
    const wmat = mat(0xc5c8ce, 0xe07a4a, 0.55, { opacity: 0.7 });
    const slim = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wmat); m.position.set(x, y, z); wireRoot.add(m); };
    const L = 168 * SCALE / 2;
    slim(L * 2, 0.03, 0.03, 0, 0.22, 2.25); slim(L * 2, 0.03, 0.03, 0, 0.22, -2.25);
    slim(0.03, 0.03, 4.5, -L, 0.22, 0); slim(0.03, 0.03, 4.5, L, 0.22, 0);
  })();
  const extraLights = [warm, cool, under];
  let quality = "balanced"; let trauma = 0;
  function applyQuality(q) {
    quality = q || "balanced";
    const mob = Math.min(window.innerWidth, window.innerHeight) < 820;
    if (quality === "perf") {
      renderer.setPixelRatio(1); extraLights.forEach((l) => { l.intensity = 0.55; });
      key.intensity = 1.35; scene.fog.near = 28; scene.fog.far = 70; renderer.toneMappingExposure = 1.35;
    } else if (quality === "detailed") {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1.6 : 2));
      extraLights.forEach((l, i) => { l.intensity = [2.6, 2.0, 1.3][i]; });
      key.intensity = 1.55; scene.fog.near = 28; scene.fog.far = 78; renderer.toneMappingExposure = 1.22;
    } else {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1.15 : 1.5));
      extraLights.forEach((l, i) => { l.intensity = [2.4, 1.8, 1.1][i]; });
      key.intensity = 1.4; scene.fog.near = 22; scene.fog.far = 64; renderer.toneMappingExposure = 1.12;
    }
  }
  function setWires(on) { wireRoot.visible = !!on; }
  function clearSlots() {
    for (let i = 0; i < fighters.length; i++) {
      if (fighters[i]) scene.remove(fighters[i]);
      if (bubbles[i]) scene.remove(bubbles[i]);
      fighters[i] = null; bubbles[i] = null;
    }
  }
  function mountFighter(slot, def) {
    if (fighters[slot]) scene.remove(fighters[slot]);
    if (bubbles[slot]) scene.remove(bubbles[slot]);
    if (!def) { fighters[slot] = null; bubbles[slot] = null; return; }
    const g = (makers[def.id] || owl)();
    g.userData.id = def.id; scene.add(g); fighters[slot] = g;
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), mat(PAL.steel, PAL.steel, 0.45, { opacity: 0.22 }));
    bubble.visible = false; scene.add(bubble); bubbles[slot] = bubble;
  }
  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || w * 1.4;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.fov = camera.aspect < 1 ? 54 : 42;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  function tintStage(stage) {
    const id = stage.id || "bloomreach";
    sky.material.color = new THREE.Color(stage.sky || 0x6a7a88);
    scene.fog.color = new THREE.Color(id === "alpine" ? 0xb8d0dc : id === "emberfall" ? 0x8a4a28 : id === "hearth" ? 0x8a7058 : 0x8a6a50);
    renderer.setClearColor(id === "alpine" ? 0xc8deea : id === "emberfall" ? 0x7a3a20 : id === "hearth" ? 0x6a5040 : 0x5a4030, 1);
    deck.material.color = new THREE.Color(id === "alpine" ? 0xc4d4dc : id === "emberfall" ? 0x8a4a30 : id === "hearth" ? 0x8a6a50 : 0x7a6a58);
    rim.color = new THREE.Color(id === "alpine" ? 0x8ad4e0 : id === "emberfall" ? 0xff6a3a : id === "hearth" ? 0xffc07a : PAL.ember);
    rim.intensity = 0.48 + (stage.tint || 0.15);
    scene.remove(dress); dress = dressFor(id); scene.add(dress);
    if (arguments[1]) setWires(!!arguments[1].wires);
  }
  function sync(match, settings = {}, alpha = 1) {
    const portrait = camera.aspect < 1;
    const a = Math.max(0, Math.min(1, alpha));
    const poseX = (f) => ((f.px ?? f.x) + ((f.x - (f.px ?? f.x)) * a));
    const poseY = (f) => ((f.py ?? f.y) + ((f.y - (f.py ?? f.y)) * a));
    const live = match.p.filter((f) => f.alive);
    const midX = (live.reduce((s, f) => s + poseX(f), 0) / Math.max(1, live.length)) * SCALE;
    const midY = (live.reduce((s, f) => s + poseY(f), 0) / Math.max(1, live.length)) * SCALE;
    const xs = live.map((f) => f.x);
    const span = xs.length ? (Math.max(...xs) - Math.min(...xs)) * SCALE : 0;
    const off = live.some((f) => Math.abs(f.x) > 84 || f.y < -4 || f.y > 40);
    const zTarget = (portrait ? 19.2 : 14.2) + span * 0.55 + (off ? 4.5 : 0) + (match.p.length > 2 ? 2.4 : 0);
    const yTarget = (portrait ? 4.6 : 3.4) + Math.max(-1.2, midY * 0.35);
    camera.position.x += (midX - camera.position.x) * 0.12;
    camera.position.y += (yTarget - camera.position.y) * 0.1;
    camera.position.z += (zTarget - camera.position.z) * 0.1;
    if (settings.shake !== false) {
      const hit = (match.fx || []).some((e) => e.kind === "hit" || e.kind === "blast" || e.kind === "ult");
      if (hit) trauma = Math.min(1, trauma + 0.28);
      if (trauma > 0.02) {
        camera.position.x += (Math.random() - 0.5) * trauma * 0.45;
        camera.position.y += (Math.random() - 0.5) * trauma * 0.22;
        trauma *= 0.82;
      } else trauma = 0;
    } else trauma = 0;
    camera.lookAt(midX, 1.2 + midY * 0.25, 0);
    const platKey = (match.floor.plats || []).map((p) => p.x + ":" + p.y + ":" + p.w).join("|");
    if (platRoot.userData.key !== platKey) {
      while (platRoot.children.length) platRoot.remove(platRoot.children[0]);
      for (const plat of match.floor.plats || []) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(plat.w * SCALE, 0.16, 2.15), mat(0x8a8074, 0xe8d0a0, 0.22, { lit: true, metal: 0.12, rough: 0.7 }));
        mesh.position.set(plat.x * SCALE, plat.y * SCALE + 0.04, 0);
        platRoot.add(mesh);
      }
      platRoot.userData.key = platKey;
    }
    match.p.forEach((f, i) => {
      const g = fighters[i];
      if (!g) return;
      g.visible = f.alive;
      g.position.set(poseX(f) * SCALE, poseY(f) * SCALE, 0);
      const punch = f.action === "smash" || f.action === "ult" ? 1.1 : f.action === "jab" || f.action === "tilt" ? 1.04 : 1;
      g.scale.setScalar(f.def.scale * punch);
      g.rotation.y = f.facing > 0 ? 0.42 : Math.PI - 0.42;
      if (g.userData.wings) {
        const flap = f.grounded ? 0.38 : 0.38 + Math.sin(match.frame * 0.45) * 0.4;
        g.userData.wings[0].rotation.z = flap; g.userData.wings[1].rotation.z = -flap;
      }
      if (g.userData.orb) g.userData.orb.rotation.y = match.frame * 0.1;
      if (g.userData.halo) g.userData.halo.rotation.x = match.frame * 0.08;
      if (g.userData.core) g.userData.core.rotation.y = match.frame * 0.04;
      if (bubbles[i]) {
        bubbles[i].visible = !!f.shielding;
        bubbles[i].position.copy(g.position); bubbles[i].position.y += 0.7;
      }
    });
    const itemKey = (match.items || []).map((it) => it.id).join(",");
    if (itemRoot.userData.key !== itemKey) {
      while (itemRoot.children.length) itemRoot.remove(itemRoot.children[0]);
      for (const it of match.items || []) {
        const col = it.id === "slag-heart" ? 0xe07a4a : it.id === "ember-chip" ? 0x7a5cff : it.id === "ridge-fletch" ? 0x6b8f71 : 0xe8c07a;
        itemRoot.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.22), mat(col, col, 1.6)));
      }
      itemRoot.userData.key = itemKey;
    }
    (match.items || []).forEach((it, idx) => {
      const m = itemRoot.children[idx];
      if (!m) return;
      m.position.set(it.x * SCALE, Math.max(0.4, it.y * SCALE + 0.2), 0.2);
      m.rotation.y = match.frame * 0.08;
    });
    for (const ev of match.fx) {
      if (!seen.has(ev) && fxPool.length < 18) { seen.add(ev); spawnFx(ev.kind, ev.x, ev.y, new THREE.Color(ev.c || "#e07a4a").getHex(), ev.s || 1); }
    }
    for (let i = fxPool.length - 1; i >= 0; i--) {
      const m = fxPool[i];
      m.userData.life -= 0.08; m.scale.multiplyScalar(1.07);
      if (m.material.opacity !== undefined) m.material.opacity = Math.max(0, m.userData.life);
      if (m.userData.life <= 0) { fxRoot.remove(m); fxPool.splice(i, 1); }
    }
  }
  function render() { renderer.render(scene, camera); }
  return { mountFighter, tintStage, sync, render, resize, clearSlots, applyQuality, setWires };
}
