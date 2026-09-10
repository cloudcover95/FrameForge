"""Discrete LIF bank with ternary synapses. Stdlib only."""
from __future__ import annotations
from dataclasses import dataclass, field

def leak_from_tau(tau: float, dt: float = 1.0) -> float:
    if tau <= 0: return 0.0
    leak = 1.0 - (dt / tau)
    return 0.0 if leak < 0.0 else 1.0 if leak > 1.0 else leak

def fire_ternary(u: float, theta: float) -> int:
    if theta <= 0: return 0
    if u >= theta: return 1
    if u <= -theta: return -1
    return 0

def reset_u(u: float, spike: int, theta: float, mode: str) -> float:
    if spike == 0: return u
    if mode == "zero": return 0.0
    return u - float(spike) * theta

def current_from_ternary(weights, x, scale: float) -> float:
    acc = 0.0
    n = min(len(weights), len(x))
    for j in range(n):
        w = weights[j]
        if w: acc += x[j] if w > 0 else -x[j]
    return acc * scale

@dataclass
class LifCell:
    leak: float = 0.75
    theta: float = 1.0
    reset: str = "subtract"
    u: float = 0.0
    def step(self, i_syn: float) -> int:
        self.u = self.leak * self.u + i_syn
        s = fire_ternary(self.u, self.theta)
        self.u = reset_u(self.u, s, self.theta, self.reset)
        return s

@dataclass
class LifLayer:
    rows: int
    cols: int
    weights: list
    scale: float = 1.0
    leak: float = 0.75
    theta: float = 1.0
    reset: str = "subtract"
    u: list = field(default_factory=list)
    def __post_init__(self) -> None:
        need = self.rows * self.cols
        if len(self.weights) < need:
            self.weights = list(self.weights) + [0] * (need - len(self.weights))
        self.weights = self.weights[:need]
        if len(self.u) != self.rows:
            self.u = [0.0] * self.rows
    def step(self, x) -> list:
        spikes = [0] * self.rows
        for r in range(self.rows):
            base = r * self.cols
            i_syn = current_from_ternary(self.weights[base:base+self.cols], x, self.scale)
            self.u[r] = self.leak * self.u[r] + i_syn
            s = fire_ternary(self.u[r], self.theta)
            self.u[r] = reset_u(self.u[r], s, self.theta, self.reset)
            spikes[r] = s
        return spikes
    def rate(self, xs):
        acc = [0.0] * self.rows
        if not xs: return acc
        for x in xs:
            for r, v in enumerate(self.step(x)):
                acc[r] += float(v)
        n = float(len(xs))
        return [v / n for v in acc]
    def reset_state(self) -> None:
        self.u = [0.0] * self.rows

def encode_features(feat, ticks: int, layer: LifLayer):
    layer.reset_state()
    return layer.rate([list(feat)] * max(1, ticks))

def demo_layer(rows=8, cols=16, seed=3) -> LifLayer:
    w = []; s = seed
    for _ in range(rows * cols):
        s = (s * 1103515245 + 12345) & 0x7FFFFFFF
        w.append((s % 3) - 1)
    return LifLayer(rows=rows, cols=cols, weights=w, scale=0.53, leak=0.8, theta=1.0)

def self_test() -> dict:
    cell = LifCell(leak=0.5, theta=1.0, reset="subtract")
    spikes = [cell.step(0.7) for _ in range(8)]
    assert any(s == 1 for s in spikes)
    cell2 = LifCell(leak=0.5, theta=1.0, reset="zero")
    down = [cell2.step(-0.8) for _ in range(8)]
    assert any(s == -1 for s in down)
    rates = encode_features([1.0]+[0.0]*15, 12, demo_layer())
    assert len(rates) == 8
    return {"cell_up": spikes, "cell_down": down, "rates": [round(v, 4) for v in rates]}
