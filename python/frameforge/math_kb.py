"""Melee-documented combat math. No third-party deps."""
from __future__ import annotations
import math
STALE_TABLE = (1.00,0.91,0.86,0.81,0.76,0.71,0.66,0.61,0.56,0.51)
LAUNCH_SPEED_SCALE = 0.03
ASDI_UNITS = 3.0
DI_MAX_DEGREES = 18.0
SAKURAI = 361
SAKURAI_KB_THRESHOLD = 32.0
SAKURAI_AIR_OR_STRONG = 44.0
CROUCH_CANCEL = 0.6667
HITSTUN_FACTOR = 0.4
HITLAG_CAP = 30

def stale_multiplier(prior_uses: int) -> float:
    if prior_uses < 0: prior_uses = 0
    if prior_uses >= len(STALE_TABLE): return STALE_TABLE[-1]
    return STALE_TABLE[prior_uses]

def knockback(percent_after, damage, weight, kbg, bkb, *, weight_independent=False, crouch=False, extra_ratio=1.0):
    p=float(percent_after); d=float(damage)
    w=100.0 if weight_independent else float(weight)
    s=float(kbg)/100.0; b=float(bkb)
    r=extra_ratio*(CROUCH_CANCEL if crouch else 1.0)
    inner=(p/10.0)+(p*d/20.0)
    scaled=inner*(200.0/(w+100.0))*1.4
    return ((scaled+18.0)*s+b)*r

def sakurai_angle(kb, grounded, raw_angle):
    if int(raw_angle)!=SAKURAI: return float(raw_angle)
    if grounded and kb < SAKURAI_KB_THRESHOLD: return 0.0
    return SAKURAI_AIR_OR_STRONG

def apply_di(angle_deg, stick_x, stick_y):
    mag=math.hypot(stick_x, stick_y)
    if mag<0.2: return angle_deg
    return angle_deg

def hitstun_frames(kb): return int(kb*HITSTUN_FACTOR)
def hitlag_frames(damage, electric=False, shielded=False):
    lag=int(damage/3)+3
    if electric: lag=int(lag*1.5)
    if shielded: lag=int(lag*0.67)
    return min(lag, HITLAG_CAP)
def launch_velocity(kb, angle_deg, facing=1.0):
    speed=kb*LAUNCH_SPEED_SCALE
    rad=math.radians(angle_deg)
    return speed*math.cos(rad)*facing, speed*math.sin(rad)
