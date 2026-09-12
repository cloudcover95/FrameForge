/** Drop-in path pick for view.js mountFighter. Trit layer only. */
export function fighterGlb(id, gfx = "balanced") {
  const t = gfx === "perf" ? -1 : gfx === "detailed" ? 1 : 0;
  if (t < 0) return `./art/glb/lod/fighter_${id}_perf.glb`;
  if (t > 0) return `./art/glb/fighter_${id}.glb`;
  return `./art/glb/lod/fighter_${id}_balanced.glb`;
}
