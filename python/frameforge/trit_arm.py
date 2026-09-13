"""Local TritARM slice. ARM-inspired register names only.

Not an Arm Holdings product. Not a Nintendo product. Not a console core.
Does not load vendor ROMs. Guest programs are original .tas / assembled text.

When JuniorHome packs.junior_arm_iot is on PYTHONPATH, Machine is that host.
Otherwise this file is a 16-register load/store that writes INTENT MMIO.
BitNet / TritARM score CPU intent only.
"""

from __future__ import annotations

from dataclasses import dataclass

OPS = (
    "MOV",
    "ADD",
    "SUB",
    "AND",
    "ORR",
    "EOR",
    "LSL",
    "LSR",
    "LDR",
    "STR",
    "B",
    "BL",
    "CMP",
    "SVC",
    "LDRB",
    "STRB",
)
OP = {n: i for i, n in enumerate(OPS)}
REG = {f"r{i}": i for i in range(16)}
REG.update(pc=15, lr=14, sp=13)
MMIO = 0x40000000
PAD_LX, PAD_LY, PAD_BTNS = MMIO + 0x20, MMIO + 0x24, MMIO + 0x28
INTENT, THERMAL = MMIO + 0x40, MMIO + 0x44
ROSTER = ("vesper", "quill", "relay", "forge")


def _try_home_host():
    import importlib

    try:
        return importlib.import_module("junior_arm_iot.host")
    except Exception:
        return None


@dataclass
class Profile:
    name: str
    ram: int
    watts_hint: float
    hz_hint: int


PROFILES = {
    "generic_iot": Profile("generic_iot", 65536, 1.0, 80_000_000),
    "cortex_m0_iot": Profile("cortex_m0_iot", 16384, 0.5, 48_000_000),
    "arm7_class": Profile("arm7_class", 32768, 1.2, 16_000_000),
    "arm9_class": Profile("arm9_class", 65536, 2.0, 66_000_000),
    "a57_class": Profile("a57_class", 262144, 6.0, 1_000_000_000),
}


class Memory:
    def __init__(self, size: int) -> None:
        self.buf = bytearray(size)
        self.mmio: dict[int, int] = {
            PAD_LX: 0,
            PAD_LY: 0,
            PAD_BTNS: 0,
            INTENT: 0,
            THERMAL: 0,
        }

    def load32(self, addr: int) -> int:
        if addr >= MMIO:
            return int(self.mmio.get(addr, 0))
        if addr < 0 or addr + 4 > len(self.buf):
            return 0
        return int.from_bytes(self.buf[addr : addr + 4], "little")

    def store32(self, addr: int, val: int) -> None:
        v = val & 0xFFFFFFFF
        if addr >= MMIO:
            self.mmio[addr] = v
            return
        if 0 <= addr and addr + 4 <= len(self.buf):
            self.buf[addr : addr + 4] = v.to_bytes(4, "little")


class Cpu:
    def __init__(self, mem: Memory) -> None:
        self.mem = mem
        self.r = [0] * 16
        self.z = False
        self.n = False
        self.cycles = 0
        self.halted = False

    def set_nz(self, v: int) -> None:
        v &= 0xFFFFFFFF
        self.z = v == 0
        self.n = (v >> 31) & 1 == 1

    def step(self, word: int) -> None:
        if self.halted:
            return
        op = word & 15
        rd = (word >> 4) & 15
        rn = (word >> 8) & 15
        rm = (word >> 12) & 15
        imm = (word >> 16) & 0xFFFF
        a = self.r[rn]
        b = self.r[rm] if rm else imm
        if op == OP["MOV"]:
            self.r[rd] = b & 0xFFFFFFFF
            self.set_nz(self.r[rd])
        elif op == OP["ADD"]:
            self.r[rd] = (a + b) & 0xFFFFFFFF
            self.set_nz(self.r[rd])
        elif op == OP["SUB"]:
            self.r[rd] = (a - b) & 0xFFFFFFFF
            self.set_nz(self.r[rd])
        elif op == OP["CMP"]:
            self.set_nz((a - b) & 0xFFFFFFFF)
        elif op == OP["LDR"]:
            self.r[rd] = self.mem.load32(a)
        elif op == OP["STR"]:
            self.mem.store32(a, self.r[rd])
        elif op == OP["B"]:
            self.r[15] = (self.r[15] + imm) & 0xFFFFFFFF
        elif op == OP["SVC"]:
            self.halted = True
        self.cycles += 1
        self.r[15] = (self.r[15] + 4) & 0xFFFFFFFF


def encode(op: str, rd: int = 0, rn: int = 0, rm: int = 0, imm: int = 0) -> int:
    return (OP[op] & 15) | ((rd & 15) << 4) | ((rn & 15) << 8) | ((rm & 15) << 12) | ((imm & 0xFFFF) << 16)


class Machine:
    def __init__(self, profile: str = "generic_iot", roster: str = "forge") -> None:
        home = _try_home_host()
        self._home = None
        if home is not None:
            try:
                self._home = home.Machine(profile=profile, roster=roster)
            except TypeError:
                try:
                    self._home = home.Machine()
                except Exception:
                    self._home = None
        name = profile if profile in PROFILES else "generic_iot"
        self.profile = PROFILES[name]
        self.roster = roster if roster.lower() in ROSTER else "forge"
        self.mem = Memory(self.profile.ram)
        self.cpu = Cpu(self.mem)

    def poke_pad(self, lx: int, ly: int, btns: int) -> None:
        if self._home is not None and hasattr(self._home, "mem"):
            try:
                self._home.mem.store32(PAD_LX, lx)
                self._home.mem.store32(PAD_LY, ly)
                self._home.mem.store32(PAD_BTNS, btns)
            except Exception:
                pass
        self.mem.store32(PAD_LX, lx & 0xFFFFFFFF)
        self.mem.store32(PAD_LY, ly & 0xFFFFFFFF)
        self.mem.store32(PAD_BTNS, btns & 0xFFFFFFFF)

    def run_intent(self, lx: float, ly: float, attack: float = 0.0) -> dict:
        ix = 1 if lx > 0.2 else (-1 if lx < -0.2 else 0)
        iy = 1 if ly > 0.2 else (-1 if ly < -0.2 else 0)
        atk = 1 if attack > 0.5 else 0
        self.poke_pad(int(lx * 127), int(ly * 127), atk)
        self.mem.store32(INTENT, ix & 0xFFFFFFFF)
        thermal = min(1.0, self.profile.watts_hint / 8.0)
        self.mem.store32(THERMAL, int(thermal * 1000))
        label = "right" if ix > 0 else ("left" if ix < 0 else ("jump" if iy > 0 else ("down" if iy < 0 else ("attack" if atk else "wait"))))
        return {
            "trit": ix if ix else (iy if iy else atk),
            "label": label,
            "thermal": thermal,
            "profile": self.profile.name,
            "roster": self.roster,
            "watts_hint": self.profile.watts_hint,
            "cycles": self.cpu.cycles,
        }


def score_intent(lx: float, ly: float, attack: float = 0.0, profile: str = "generic_iot") -> dict:
    return Machine(profile=profile).run_intent(lx, ly, attack)
