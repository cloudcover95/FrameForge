#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
python3 -m python.frameforge.cli codegen-ue --out unreal/FrameForge/Content/Generated
python3 -m python.frameforge.cli quant
[ -f data/ai/policy.ffbn ] && cp data/ai/policy.ffbn unreal/FrameForge/Content/Generated/policy.ffbn
echo synced
