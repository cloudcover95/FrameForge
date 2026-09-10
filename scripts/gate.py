#!/usr/bin/env python3
"""Studio gate: schema, bounds, sim tests, stdlib audit."""
from __future__ import annotations
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from python.frameforge.bounds_audit import audit
from python.frameforge.catalog import Catalog
from python.frameforge.schema import fighter, moveset, stage
from python.frameforge import tests_inline

def run(cmd):
    print("+", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))

def main() -> int:
    cat = Catalog()
    errors = []
    for data in cat.fighters.values():
        errors.extend(fighter(data))
    for data in cat.stages.values():
        errors.extend(stage(data))
    for payload in cat.movesets.values():
        errors.extend(moveset(payload))
    bound = audit(cat)
    if not bound["ok"]:
        errors.extend(bound["failures"])
    if tests_inline.run() != 0:
        errors.append("sim tests failed")
    stdlib_rc = run([sys.executable, str(ROOT / "scripts" / "audit_stdlib_compliance.py"), str(ROOT / "python" / "frameforge"), "--recursive", "--strict"])
    if stdlib_rc != 0:
        errors.append("stdlib audit failed")
    report = {"ok": not errors, "errors": errors, "fighters": sorted(cat.fighters), "stages": sorted(cat.stages)}
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
