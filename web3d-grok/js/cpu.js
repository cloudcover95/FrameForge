import { emptyInput } from "./sim.js";

/** Recover toward stage, DI away, mix shield. No BitNet in this learning slice. */
export function cpuThink(self, foe, floor, frame) {
  const i = emptyInput();
  if (!self.alive) return i;

  const onStage = Math.abs(self.x) < floor.main.w / 2 - 4 && self.y >= -2;
  const off = self.x < -floor.main.w / 2 + 2 || self.x > floor.main.w / 2 - 2 || self.y < -8;

  if (self.hitstun > 0) {
    i.x = self.x > foe.x ? 1 : -1;
    i.y = 1;
    return i;
  }

  if (off || (!self.grounded && (Math.abs(self.x) > 70 || self.y < 4))) {
    i.x = self.x > 0 ? -1 : 1;
    if (self.y < 18 || (self.jumpsLeft > 0 && self.vy < 0.4)) i.jump = true;
    if (self.y < -20) i.jump = true;
    return i;
  }

  const dx = foe.x - self.x;
  const dist = Math.abs(dx);
  i.x = dist > 14 ? Math.sign(dx) : dist < 8 ? -Math.sign(dx) : 0;

  if (self.grounded && frame % 47 === 0 && Math.random() < 0.35) i.jump = true;
  if (!self.grounded && foe.y > self.y + 6) i.jump = true;

  if (dist < 20 && Math.abs(self.y - foe.y) < 14) {
    const r = (frame + self.x) % 23;
    if (r < 6) i.attack = true;
    else if (r < 9) i.special = true;
    else if (r < 12) i.shield = true;
    else if (r === 14) i.grab = true;
  }

  if (foe.action === "smash" || foe.action === "ult") i.shield = true;
  if (self.meter >= 100 && dist < 28 && Math.abs(self.y - foe.y) < 18) i.ult = true;

  if (!onStage) {
    i.attack = false;
    i.ult = false;
    i.x = self.x > 0 ? -1 : 1;
  }
  return i;
}
