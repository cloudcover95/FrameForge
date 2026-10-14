"""Stdlib-only consistency checks for display look data (palettes and skins).

Display data only; the sim capsule is never touched. Verifies that every
roster fighter has a palette and a skin entry, colors are valid hex, and the
web3d-grok palette mirror stays in sync with data/look/palettes.json.

Run: python3 -m unittest tests.test_look_data
"""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PALETTES = DATA / "look" / "palettes.json"
SKINS = DATA / "skins" / "catalog.json"
WEB_PALETTES = ROOT / "web3d-grok" / "data" / "palettes.json"
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
REQUIRED_SLOTS = {"primary", "secondary", "accent"}


def _load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _roster():
    return {p.stem for p in (DATA / "fighters").glob("*.json")}


class LookDataTest(unittest.TestCase):
    def test_every_fighter_has_palette(self):
        roster = _roster()
        self.assertTrue(roster, "no fighters found")
        pal = _load(PALETTES)["fighters"]
        self.assertFalse(roster - pal.keys(), "fighters missing a palette")

    def test_palette_slots_and_hex(self):
        for fid, kit in _load(PALETTES)["fighters"].items():
            self.assertTrue(kit.get("title"), fid)
            palette = kit.get("palette", {})
            self.assertFalse(REQUIRED_SLOTS - palette.keys(), fid)
            for slot, color in palette.items():
                self.assertRegex(color, HEX, f"{fid}.{slot}")

    def test_every_fighter_has_skin(self):
        skins = _load(SKINS)["skins"]
        self.assertFalse(_roster() - skins.keys(), "fighters missing a skin")
        for sid, s in skins.items():
            self.assertTrue(str(s.get("gltf", "")).endswith((".gltf", ".glb")), sid)
            self.assertTrue(str(s.get("albedo", "")).endswith(".png"), sid)
            for key in ("gltf", "albedo", "user_override"):
                if key in s:
                    self.assertFalse(Path(s[key]).is_absolute(), f"{sid}.{key}")
                    self.assertNotIn("..", Path(s[key]).parts, f"{sid}.{key}")

    def test_web_palette_mirror_in_sync(self):
        if not WEB_PALETTES.exists():
            self.skipTest("web3d-grok palette mirror not present")
        src = _load(PALETTES)["fighters"]
        web = _load(WEB_PALETTES)["fighters"]
        self.assertEqual(src.keys(), web.keys())
        for fid in src:
            self.assertEqual(src[fid]["title"], web[fid].get("title"), fid)
            self.assertEqual(src[fid]["palette"], web[fid].get("palette"), fid)


if __name__ == "__main__":
    unittest.main()
