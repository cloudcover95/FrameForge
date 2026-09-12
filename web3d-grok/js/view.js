import * as THREE from "https://unpkg.com/three@0.160.1/build/three.module.js";

const SCALE = 0.045;
const PAL = { bg: 0x0b0c12, steel: 0xc5c8ce, ember: 0xe07a4a, gold: 0xc4a35a };

function mat(color, emissive = 0x000000, em = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color, metalness: extra.metal ?? 0.42, roughness: extra.rough ?? 0.46,
    emissive, emissiveIntensity: em, transparent: extra.opacity !== undefined, opacity: extra.opacity ?? 1,
  });
}

function add(g, mesh, x, y, z, sx, sy, sz) {
  mesh.position.set(x, y, z);
  if (sx) mesh.scale.set(sx, sy ?? sx, sz ?? sx);
  mesh.castShadow = true;
  g.add(mesh);
  return mesh;
}

function owl(color) {
  const g = new THREE.Group();
  const steel = mat(color, 0x2a3340, 0.1, { metal: 0.72, rough: 0.26 });
  const dark = mat(0x161a20, 0x000000, 0, { metal: 0.55 });
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), steel), 0, 0.58, 0, 1, 1.3, 0.88);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), steel), 0, 1.08, 0.04);
  const tuftL = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), dark), -0.16, 1.3, 0);
  tuftL.rotation.z = 0.35;
  const tuftR = tuftL.clone(); tuftR.position.x = 0.16; tuftR.rotation.z = -0.35; g.add(tuftR);
  const wingL = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.78), dark), -0.42, 0.62, 0);
  wingL.rotation.z = 0.38;
  const wingR = wingL.clone(); wingR.position.x = 0.42; wingR.rotation.z = -0.38; g.add(wingR);
  const beak = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 7), mat(PAL.ember, PAL.ember, 0.6)), 0, 1.0, 0.28);
  beak.rotation.x = Math.PI / 2;
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat(0xecece8, 0xecece8, 0.45)), -0.09, 1.12, 0.2);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat(0xecece8, 0xecece8, 0.45)), 0.09, 1.12, 0.2);
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.36, 6), dark), 0, 0.18, 0);
  g.userData.wings = [wingL, wingR];
  return g;
}

function ranger(color) {
  const g = new THREE.Group();
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.22, 10), mat(color, 0x142010, 0.08, { metal: 0.12, rough: 0.72 })), 0, 0.58, 0);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat(0x141810)), 0, 1.16, 0.02);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(0xe8d5c4)), 0, 1.1, 0.14);
  const bow = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.028, 6, 16, Math.PI), mat(PAL.gold, PAL.gold, 0.25)), 0.36, 0.72, 0.08);
  bow.rotation.y = Math.PI / 2;
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 4), mat(0x3a2a18)), 0.36, 0.72, 0.08);
  g.userData.bow = bow;
  return g;
}

function mage(color, accent) {
  const g = new THREE.Group();
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.26, 9), mat(color, accent, 0.18, { metal: 0.2, rough: 0.55 })), 0, 0.58, 0);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mat(0xe8d5c4)), 0, 1.2, 0);
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 6), mat(color, accent, 0.25)), 0, 1.4, 0);
  const orb = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), mat(accent, accent, 1.2)), 0.4, 0.88, 0.16);
  const halo = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.015, 6, 18), mat(accent, accent, 0.8)), 0.4, 0.88, 0.16);
  g.userData.orb = orb;
  g.userData.halo = halo;
  return g;
}

function golem(color, accent) {
  const g = new THREE.Group();
  const crystal = mat(color, accent, 0.6, { metal: 0.12, rough: 0.2 });
  const plate = mat(0x1c2228, 0x000000, 0, { metal: 0.82, rough: 0.28 });
  const core = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 0), crystal), 0, 0.78, 0);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 0.48), plate), 0, 0.2, 0);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), plate), -0.28, 0.55, 0);
  add(g, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), plate), 0.28, 0.55, 0);
  add(g, new THREE.Mesh(new THREE.OctahedronGeometry(0.16), mat(accent, accent, 1.3)), 0, 1.18, 0);
  g.userData.core = core;
  return g;
}

function dressFor(stageId) {
  const g = new THREE.Group();
  const lantern = (x, z) => {
    const p = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 6), mat(0x2a241c));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), mat(PAL.gold, PAL.ember, 1.5));
    lamp.position.y = 0.95;
    p.add(pole, lamp);
    p.position.set(x, 0.8, z);
    g.add(p);
  };
  if (stageId === "alpine") {
    for (const x of [-5.2, -3.6, 3.8, 5.4]) {
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.8, 7), mat(0x1d2a28, 0x6ec8d4, 0.06));
      t.position.set(x, 1.0, -1.6);
      g.add(t);
    }
  } else if (stageId === "emberfall") {
    for (const x of [-4.8, -2.2, 2.4, 4.9]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.7, 5), mat(0x3a2218, PAL.ember, 0.25));
      p.position.set(x, 0.9, -1.4);
      g.add(p);
    }
  } else if (stageId === "hearth") {
    for (const x of [-4.4, -1.6, 1.8, 4.6]) {
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), mat(0xd8d0c4, 0xecece8, 0.1));
      s.position.set(x, 0.35, -1.3);
      g.add(s);
    }
  } else {
    lantern(-5.1, -1.35); lantern(5.1, -1.35); lantern(-2.4, -1.7); lantern(2.6, -1.7);
  }
  return g;
}

export function createView(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(PAL.bg, 1);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x12141c, 16, 48);
  const camera = new THREE.PerspectiveCamera(50, 9 / 16, 0.1, 200);
  camera.position.set(0, 4.6, 17.2);
  scene.add(new THREE.HemisphereLight(0xc5d0e0, 0x161410, 0.9));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.4);
  key.position.set(-7, 12, 8);
  key.castShadow = true;
  const rim = new THREE.DirectionalLight(0xe07a4a, 0.5);
  rim.position.set(7, 3, -5);
  const fill = new THREE.DirectionalLight(0x89b4ff, 0.32);
  fill.position.set(0, 6, 10);
  scene.add(key, rim, fill);
  const arena = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(168 * SCALE, 0.38, 2.6), mat(0x2c3038, 0xe07a4a, 0.04, { metal: 0.58, rough: 0.38 }));
  deck.position.y = -0.18;
  deck.receiveShadow = true;
  const lip = new THREE.Mesh(new THREE.BoxGeometry(168 * SCALE + 0.18, 0.07, 2.75), mat(PAL.steel, 0x000000, 0, { metal: 0.72 }));
  lip.position.y = 0.04;
  arena.add(deck, lip);
  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(34 * SCALE, 0.1, 1.15), mat(0x3a3d44));
    p.position.set(side * 54 * SCALE, 27 * SCALE, 0);
    arena.add(p);
  }
  scene.add(arena);
  let dress = dressFor("bloomreach");
  scene.add(dress);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 20, 14), new THREE.MeshBasicMaterial({ color: 0x171c28, side: THREE.BackSide }));
  scene.add(sky);
  const fxRoot = new THREE.Group();
  scene.add(fxRoot);
  const fxPool = [];
  const seen = new WeakSet();
  function spawnFx(kind, x, y, c, s = 1) {
    let mesh;
    if (kind === "hit" || kind === "spark") mesh = new THREE.Mesh(new THREE.TorusGeometry(0.22 * s, 0.045, 6, 18), mat(c, c, 1.5));
    else if (kind === "parry") mesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.45, 20), mat(0xecece8, 0xecece8, 1.7));
    else if (kind === "blast") mesh = new THREE.Mesh(new THREE.SphereGeometry(0.4 * s, 10, 8), mat(c, c, 1.9, { opacity: 0.7 }));
    else mesh = new THREE.Mesh(new THREE.CircleGeometry(0.32 * s, 14), mat(c, c, 1.3, { opacity: 0.8 }));
    mesh.position.set(x * SCALE, Math.max(0.4, y * SCALE), 0.4);
    mesh.userData.life = 1;
    fxRoot.add(mesh);
    fxPool.push(mesh);
  }
  const makers = { vesper: owl, quill: ranger, relay: mage, forge: golem };
  const fighters = [null, null];
  const bubbles = [null, null];
  function mountFighter(slot, def) {
    if (fighters[slot]) scene.remove(fighters[slot]);
    if (bubbles[slot]) scene.remove(bubbles[slot]);
    const g = (makers[def.id] || owl)(new THREE.Color(def.color).getHex(), new THREE.Color(def.accent).getHex());
    scene.add(g);
    fighters[slot] = g;
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), mat(PAL.steel, PAL.steel, 0.45, { opacity: 0.22 }));
    bubble.visible = false;
    scene.add(bubble);
    bubbles[slot] = bubble;
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
    sky.material.color = new THREE.Color(stage.sky || 0x171c28);
    scene.fog.color = new THREE.Color(0x12141c);
    rim.color = new THREE.Color(id === "alpine" ? 0x8ad4e0 : id === "emberfall" ? 0xff6a3a : PAL.ember);
    rim.intensity = 0.48 + (stage.tint || 0.15);
    scene.remove(dress);
    dress = dressFor(id);
    scene.add(dress);
  }
  function sync(match) {
    const portrait = camera.aspect < 1;
    const midX = ((match.p[0].x + match.p[1].x) / 2) * SCALE;
    const midY = ((match.p[0].y + match.p[1].y) / 2) * SCALE;
    const zTarget = portrait ? 18.4 : 13.4;
    const yTarget = portrait ? 5.0 + midY * 0.16 : 3.5 + midY * 0.2;
    camera.position.x += (midX * 0.2 - camera.position.x) * 0.05;
    camera.position.y += (yTarget - camera.position.y) * 0.05;
    camera.position.z += (zTarget - camera.position.z) * 0.05;
    camera.lookAt(midX * 0.16, 1.7 + midY * 0.1, 0);
    match.p.forEach((f, i) => {
      const g = fighters[i];
      if (!g) return;
      g.visible = f.alive;
      g.position.set(f.x * SCALE, Math.max(0.08, f.y * SCALE), 0);
      const punch = f.action === "smash" || f.action === "ult" ? 1.1 : f.action === "jab" || f.action === "tilt" ? 1.04 : 1;
      g.scale.setScalar(f.def.scale * punch);
      g.rotation.y = f.facing > 0 ? 0.42 : Math.PI - 0.42;
      g.rotation.z = (f.action === "special" || f.action === "ult") ? Math.sin(match.frame * 0.4) * 0.08 : 0;
      if (g.userData.wings) {
        const flap = f.grounded ? 0.38 : 0.38 + Math.sin(match.frame * 0.45) * 0.4;
        g.userData.wings[0].rotation.z = flap;
        g.userData.wings[1].rotation.z = -flap;
      }
      if (g.userData.orb) g.userData.orb.rotation.y = match.frame * 0.1;
      if (g.userData.halo) g.userData.halo.rotation.x = match.frame * 0.08;
      if (g.userData.core) g.userData.core.rotation.y = match.frame * 0.04;
      if (g.userData.bow) g.userData.bow.rotation.z = (f.action === "special" || f.action === "ult") ? 0.55 : 0;
      if (bubbles[i]) {
        bubbles[i].visible = !!f.shielding;
        bubbles[i].position.copy(g.position);
        bubbles[i].position.y += 0.7;
        bubbles[i].scale.setScalar(0.92 + Math.sin(match.frame * 0.2) * 0.05);
      }
    });
    for (const ev of match.fx) {
      if (!seen.has(ev)) {
        seen.add(ev);
        spawnFx(ev.kind, ev.x, ev.y, new THREE.Color(ev.c || "#e07a4a").getHex(), ev.s || 1);
      }
    }
    for (let i = fxPool.length - 1; i >= 0; i--) {
      const m = fxPool[i];
      m.userData.life -= 0.08;
      m.scale.multiplyScalar(1.07);
      if (m.material.opacity !== undefined) m.material.opacity = Math.max(0, m.userData.life);
      if (m.userData.life <= 0) {
        fxRoot.remove(m);
        fxPool.splice(i, 1);
      }
    }
  }
  function render() { renderer.render(scene, camera); }
  return { mountFighter, tintStage, sync, render, resize };
}
