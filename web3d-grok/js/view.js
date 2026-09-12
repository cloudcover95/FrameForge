import * as THREE from "https://unpkg.com/three@0.160.1/build/three.module.js";

const SCALE = 0.045;
const PAL = { bg: 0x09090b, steel: 0xc5c8ce, ember: 0xe07a4a, fg: 0xecece8, muted: 0x8a8a86 };

function mat(color, emissive = 0x000000, em = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.55,
    roughness: 0.38,
    emissive,
    emissiveIntensity: em,
  });
}

function owl(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), mat(color));
  body.scale.set(1, 1.25, 0.85);
  body.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), mat(color));
  head.position.y = 1.05;
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.7), mat(0x2a2e34));
  wingL.position.set(-0.4, 0.6, 0);
  wingL.rotation.z = 0.4;
  const wingR = wingL.clone();
  wingR.position.x = 0.4;
  wingR.rotation.z = -0.4;
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), mat(PAL.ember, PAL.ember, 0.4));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 1.0, 0.26);
  g.add(body, head, wingL, wingR, beak);
  g.userData.wings = [wingL, wingR];
  return g;
}

function ranger(color) {
  const g = new THREE.Group();
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 8), mat(color));
  cloak.position.y = 0.55;
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), mat(0x1a1e16));
  hood.position.y = 1.12;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 6, 14, Math.PI), mat(0xc4a35a, 0xc4a35a, 0.15));
  bow.position.set(0.34, 0.7, 0.1);
  bow.rotation.y = Math.PI / 2;
  g.add(cloak, hood, bow);
  return g;
}

function mage(color, accent) {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 7), mat(color, accent, 0.12));
  robe.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mat(0xe8d5c4));
  head.position.y = 1.18;
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), mat(accent, accent, 0.8));
  orb.position.set(0.38, 0.85, 0.12);
  g.add(robe, head, orb);
  g.userData.orb = orb;
  return g;
}

function golem(color, accent) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mat(color, accent, 0.35));
  core.position.y = 0.7;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.5), mat(0x2a3034));
  slab.position.y = 0.18;
  g.add(core, slab);
  g.userData.core = core;
  return g;
}

export function createView(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(PAL.bg, 1);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090b, 0.034);

  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 200);
  camera.position.set(0, 3.2, 11.5);

  const hemi = new THREE.HemisphereLight(0xc5c8ce, 0x09090b, 0.7);
  const key = new THREE.DirectionalLight(0xffe2c4, 1.15);
  key.position.set(-6, 10, 6);
  key.castShadow = true;
  const rim = new THREE.DirectionalLight(0xe07a4a, 0.45);
  rim.position.set(8, 3, -4);
  scene.add(hemi, key, rim);

  const arena = new THREE.Group();
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(168 * SCALE, 0.42, 2.4),
    mat(0x1a1a1e, 0xe07a4a, 0.05),
  );
  deck.position.y = -0.2;
  deck.receiveShadow = true;
  const lip = new THREE.Mesh(new THREE.BoxGeometry(168 * SCALE + 0.15, 0.08, 2.55), mat(0xc5c8ce));
  lip.position.y = 0.02;
  arena.add(deck, lip);
  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(34 * SCALE, 0.12, 1.2), mat(0x2a2a2e));
    p.position.set(side * 54 * SCALE, 27 * SCALE, 0);
    arena.add(p);
  }
  scene.add(arena);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(80, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x1a120c, side: THREE.BackSide }),
  );
  scene.add(sky);

  const sparks = [];
  const sparkGeo = new THREE.SphereGeometry(0.05, 6, 6);
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(sparkGeo, mat(PAL.ember, PAL.ember, 0.8));
    m.position.set((Math.random() - 0.5) * 12, Math.random() * 6, (Math.random() - 0.5) * 4);
    sparks.push(m);
    scene.add(m);
  }

  const makers = { vesper: owl, quill: ranger, relay: mage, forge: golem };
  const fighters = [null, null];

  function mountFighter(slot, def) {
    if (fighters[slot]) scene.remove(fighters[slot]);
    const fn = makers[def.id] || owl;
    const g = fn(new THREE.Color(def.color).getHex(), new THREE.Color(def.accent).getHex());
    g.castShadow = true;
    scene.add(g);
    fighters[slot] = g;
  }

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || w * 0.52;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  function tintStage(stage) {
    sky.material.color = new THREE.Color(stage.sky);
    scene.fog.color = new THREE.Color(stage.fog);
    rim.intensity = 0.3 + stage.tint;
  }

  function sync(match) {
    const midX = ((match.p[0].x + match.p[1].x) / 2) * SCALE;
    const midY = ((match.p[0].y + match.p[1].y) / 2) * SCALE;
    camera.position.x += (midX * 0.35 - camera.position.x) * 0.06;
    camera.position.y += (2.6 + midY * 0.25 - camera.position.y) * 0.06;
    camera.lookAt(midX * 0.2, 1.4 + midY * 0.15, 0);

    match.p.forEach((f, i) => {
      const g = fighters[i];
      if (!g) return;
      g.visible = f.alive;
      g.position.set(f.x * SCALE, Math.max(0.05, f.y * SCALE), 0);
      g.scale.setScalar(f.def.scale * (f.action === "smash" ? 1.08 : 1));
      g.rotation.y = f.facing > 0 ? 0.35 : Math.PI - 0.35;
      if (g.userData.wings) {
        const flap = f.grounded ? 0.4 : 0.4 + Math.sin(match.frame * 0.4) * 0.35;
        g.userData.wings[0].rotation.z = flap;
        g.userData.wings[1].rotation.z = -flap;
      }
      if (g.userData.orb) g.userData.orb.rotation.y = match.frame * 0.08;
      if (g.userData.core) g.userData.core.rotation.y = match.frame * 0.03;
    });

    sparks.forEach((s, n) => {
      s.position.y += 0.01;
      if (s.position.y > 7) s.position.y = 0;
      s.material.emissiveIntensity = 0.4 + Math.sin(match.frame * 0.1 + n) * 0.3;
    });
  }

  function render() {
    renderer.render(scene, camera);
  }

  return { mountFighter, tintStage, sync, render, resize };
}
