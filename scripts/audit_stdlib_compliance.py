#!/usr/bin/env python3
"""Refuse third-party imports under python/frameforge."""
from __future__ import annotations

import ast
import json
import sys
from pathlib import Path

ALLOWED = {
    "argparse", "ast", "collections", "dataclasses", "json", "math", "os",
    "pathlib", "shutil", "struct", "subprocess", "sys", "typing", "__future__",
}


def walk(path: Path) -> list[str]:
    errors = []
    for file in sorted(path.rglob("*.py")):
        tree = ast.parse(file.read_text(encoding="utf-8"), filename=str(file))
        for node in ast.walk(tree):
            names = []
            if isinstance(node, ast.Import):
                names = [a.name.split(".")[0] for a in node.names]
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                names = [node.module.split(".")[0]]
            for name in names:
                if name in ALLOWED or name in {"python", "frameforge"}:
                    continue
                errors.append(f"{file}: third-party import {name}")
    return errors


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    target = Path(args[0]) if args else Path("python/frameforge")
    errors = walk(target)
    if errors:
        print("\n".join(errors))
        return 1
    print(json.dumps({"ok": True, "path": str(target)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
