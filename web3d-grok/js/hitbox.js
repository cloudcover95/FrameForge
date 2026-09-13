/* SPDX-License-Identifier: MIT
 * Copyright (c) 2026 JuniorCloud LLC and FrameForge contributors.
 * Multi-point arc hitboxes. Local only. No fetch in the tick.
 * Not a Nintendo product.
 */
export function trit(v, lo = -0.2, hi = 0.2) {
  if (v < lo) return -1;
  if (v > hi) return 1;
  return 0;
}

export function arcPoints(x, y, facing, reach = 18, lift = 10, n = 5) {
  const pts = [];
  const count = Math.max(3, n | 0);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const ang = ((-25 + 70 * t) * Math.PI) / 180;
    pts.push([x + facing * reach * Math.cos(ang), y + lift * Math.sin(ang)]);
  }
  return pts;
}

export function hits(points, vx, vy, radius = 10) {
  const r2 = radius * radius;
  for (const p of points) {
    const dx = p[0] - vx;
    const dy = p[1] - vy;
    if (dx * dx + dy * dy < r2) return true;
  }
  return false;
}

export function rangeArc(atk, vic, reach = 18) {
  if (!vic || !vic.alive) return false;
  const pts = arcPoints(atk.x, atk.y + 8, atk.facing || 1, reach, 10, 5);
  return hits(pts, vic.x, vic.y + 8, 10);
}
