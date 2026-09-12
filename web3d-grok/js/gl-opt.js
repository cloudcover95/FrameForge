/** WebGL helpers for web3d-grok. No new renderer. Shared geo + recycle.
 *  Perf mode drops point lights and dress draw. Detailed keeps ACES.
 *  Geometry lives on the GPU once. FX meshes recycle. Dress is static.
 */
export function tuneRenderer(renderer, THREE, quality, extraLights, key, fog) {
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 820;
  const q = quality || "balanced";
  if (q === "perf") {
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    extraLights.forEach((l) => { l.visible = false; });
    if (key) key.intensity = 1.2;
    if (fog) { fog.near = 24; fog.far = 56; }
    renderer.toneMappingExposure = 1.28;
  } else if (q === "detailed") {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2));
    extraLights.forEach((l) => { l.visible = true; });
    if (key) key.intensity = 1.55;
    if (fog) { fog.near = 28; fog.far = 78; }
    renderer.toneMappingExposure = 1.22;
  } else {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5));
    extraLights.forEach((l, i) => { l.visible = i < 2; });
    if (key) key.intensity = 1.4;
    if (fog) { fog.near = 22; fog.far = 64; }
    renderer.toneMappingExposure = 1.12;
  }
}

export function freezeStatic(root) {
  root.traverse((ch) => {
    ch.matrixAutoUpdate = false;
    ch.updateMatrix();
    if (ch.isMesh) ch.frustumCulled = true;
  });
}

export function sharedGeo(THREE) {
  return {
    hit: new THREE.TorusGeometry(0.22, 0.045, 6, 16),
    parry: new THREE.RingGeometry(0.2, 0.45, 16),
    blast: new THREE.SphereGeometry(0.4, 10, 8),
    ult: new THREE.CircleGeometry(0.32, 12),
  };
}

/** Recycle FX meshes. Alloc once per kind, hide when dead. Cap 16. */
export function makeRecycler(THREE, matFn, geo) {
  const pools = { hit: [], spark: [], parry: [], blast: [], ult: [] };
  const max = 16;
  function kindOf(k) { return k === "spark" ? "hit" : (pools[k] ? k : "ult"); }
  return {
    spawn(root, kind, x, y, color, s, SCALE) {
      const key = kindOf(kind);
      let mesh = pools[key].find((m) => !m.visible);
      if (!mesh) {
        if (pools[key].length >= max) return null;
        const g = geo[key] || geo.ult;
        mesh = new THREE.Mesh(g, matFn(color, color, 1.4, { opacity: 0.85 }));
        mesh.frustumCulled = true;
        pools[key].push(mesh);
        root.add(mesh);
      }
      mesh.visible = true;
      mesh.scale.setScalar(s || 1);
      mesh.position.set(x * SCALE, Math.max(0.4, y * SCALE), 0.4);
      mesh.userData.life = 1;
      if (mesh.material.emissive) mesh.material.emissive.setHex(color);
      return mesh;
    },
    tick(list) {
      for (let i = list.length - 1; i >= 0; i--) {
        const m = list[i];
        m.userData.life -= 0.08;
        if (m.userData.life <= 0) {
          m.visible = false;
          list.splice(i, 1);
        } else {
          m.scale.multiplyScalar(1.06);
          if (m.material.opacity !== undefined) m.material.opacity = Math.max(0, m.userData.life);
        }
      }
    },
  };
}
