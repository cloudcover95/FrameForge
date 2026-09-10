from __future__ import annotations
import json
from pathlib import Path
from typing import Any

def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]

def data_root() -> Path:
    return repo_root() / "data"

class Catalog:
    def __init__(self, root: Path | None = None) -> None:
        self.root = Path(root) if root else data_root()
        self.fighters = {}
        self.movesets = {}
        self.stages = {}
        self.reload()

    def reload(self) -> None:
        self.fighters = self._load_dir(self.root / "fighters")
        self.movesets = {}
        for path in sorted((self.root / "movesets").glob("*.json")):
            payload = json.loads(path.read_text(encoding="utf-8"))
            self.movesets[payload["fighter_id"]] = payload
        self.stages = self._load_dir(self.root / "stages")

    @staticmethod
    def _load_dir(folder: Path):
        out = {}
        if not folder.is_dir():
            return out
        for path in sorted(folder.glob("*.json")):
            if path.name.startswith("_"):
                continue
            payload = json.loads(path.read_text(encoding="utf-8"))
            out[payload["id"]] = payload
        return out

    def move(self, fighter_id: str, move_id: str):
        for move in self.movesets[fighter_id]["moves"]:
            if move["id"] == move_id:
                return move
        raise KeyError(f"{fighter_id}/{move_id}")
