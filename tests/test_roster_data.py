"""Stdlib-only consistency checks for fighter and moveset data.

Run: python3 -m unittest tests.test_roster_data
"""
import json
import unittest
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
FIGHTERS = DATA / "fighters"
MOVESETS = DATA / "movesets"
REQUIRED_ATTRS = {"weight", "gravity", "walk_speed", "dash_speed", "jump_v", "jumps"}
REQUIRED_MOVE = {"id", "dmg", "kbg", "bkb", "ang"}


def _load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


class RosterDataTest(unittest.TestCase):
    def test_every_fighter_has_moveset(self):
        f = {p.stem for p in FIGHTERS.glob("*.json")}
        m = {p.stem for p in MOVESETS.glob("*.json")}
        self.assertTrue(f, "no fighters found")
        self.assertEqual(f, m)

    def test_fighter_ids_and_attributes(self):
        for p in FIGHTERS.glob("*.json"):
            d = _load(p)
            self.assertEqual(d.get("id"), p.stem, p.name)
            attrs = d.get("attributes", {})
            self.assertFalse(REQUIRED_ATTRS - attrs.keys(), p.name)
            self.assertGreater(attrs["weight"], 0, p.name)
            self.assertGreaterEqual(attrs["jumps"], 1, p.name)

    def test_moves_sane(self):
        for p in MOVESETS.glob("*.json"):
            d = _load(p)
            self.assertEqual(d.get("fighter_id"), p.stem, p.name)
            ids = [mv["id"] for mv in d["moves"]]
            self.assertEqual(len(ids), len(set(ids)), f"duplicate move id in {p.name}")
            for mv in d["moves"]:
                self.assertFalse(REQUIRED_MOVE - mv.keys(), f"{p.name}:{mv.get('id')}")
                self.assertGreaterEqual(mv["dmg"], 0)
                self.assertGreaterEqual(mv["kbg"], 0)
                self.assertGreaterEqual(mv["bkb"], 0)
                # 361 is the conventional "sakurai angle" sentinel
                self.assertTrue(0 <= mv["ang"] <= 361, f"{p.name}:{mv['id']}")


if __name__ == "__main__":
    unittest.main()
