"""Stdlib-only geometry/consistency checks for stage data.

Run: python3 -m unittest tests.test_stage_data
"""
import json
import unittest
from pathlib import Path

STAGES = Path(__file__).resolve().parent.parent / "data" / "stages"


def _stages():
    for p in sorted(STAGES.glob("*.json")):
        with open(p, encoding="utf-8") as f:
            yield p, json.load(f)


class StageDataTest(unittest.TestCase):
    def test_stages_exist(self):
        self.assertTrue(list(_stages()), "no stages found")

    def test_ids_match_filenames(self):
        for p, d in _stages():
            if p.stem.startswith("_"):
                continue
            self.assertEqual(d.get("id"), p.stem, p.name)

    def test_blastzones_ordered(self):
        for p, d in _stages():
            bz = d["blastzones"]
            self.assertLess(bz["left"], bz["right"], p.name)
            self.assertLess(bz["bottom"], bz["top"], p.name)

    def test_platforms_valid_and_inside_blastzones(self):
        for p, d in _stages():
            bz = d["blastzones"]
            plats = d.get("platforms", [])
            self.assertTrue(plats, p.name)
            ids = [pl["id"] for pl in plats]
            self.assertEqual(len(ids), len(set(ids)), f"dup platform id in {p.name}")
            self.assertTrue(any(pl.get("solid") for pl in plats), f"no solid platform in {p.name}")
            for pl in plats:
                self.assertGreater(pl["w"], 0, p.name)
                self.assertGreater(pl["h"], 0, p.name)
                self.assertGreater(pl["x"] - pl["w"] / 2, bz["left"], p.name)
                self.assertLess(pl["x"] + pl["w"] / 2, bz["right"], p.name)
                self.assertGreater(pl["y"], bz["bottom"], p.name)
                self.assertLess(pl["y"], bz["top"], p.name)

    def test_rules_are_booleans(self):
        for p, d in _stages():
            for k, v in d.get("rules", {}).items():
                self.assertIsInstance(v, bool, f"{p.name}:{k}")


if __name__ == "__main__":
    unittest.main()
