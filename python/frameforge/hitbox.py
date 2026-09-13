"""Multi-point arc hitboxes. Stdlib only. Does not write knockback."""
from __future__ import annotations
import math

def trit(v, lo=-0.2, hi=0.2):
    if v < lo:
        return -1
    if v > hi:
        return 1
    return 0


def arc_points(x, y, facing, reach=18.0, lift=10.0, n=5):
    n = max(3, int(n))
    pts = []
    for i in range(n):
        t = i / (n - 1)
        ang = math.radians(-25.0 + 70.0 * t)
        pts.append((x + facing * reach * math.cos(ang), y + lift * math.sin(ang)))
    return pts


def hits(points, vic_x, vic_y, radius=10.0) -> bool:
    r2 = radius * radius
    for px, py in points:
        dx = px - vic_x
        dy = py - vic_y
        if dx * dx + dy * dy < r2:
            return True
    return False
