#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UE="${UE_ROOT:-}"
if [ -z "$UE" ]; then
  echo "set UE_ROOT to your 5.4 Engine directory, then rerun"
  exit 2
fi
bash "$ROOT/scripts/link_host_plugin.sh"
UAT="$UE/Build/BatchFiles/RunUAT.sh"
if [ ! -x "$UAT" ]; then
  UAT="$UE/Build/BatchFiles/RunUAT.bat"
fi
PROJ="$ROOT/unreal/Host/FrameForgeHost.uproject"
OUT="$ROOT/dist/windows"
mkdir -p "$OUT"
"$UAT" BuildCookRun \
  -project="$PROJ" \
  -noP4 -platform=Win64 -clientconfig=Shipping \
  -cook -build -stage -pak -archive \
  -archivedirectory="$OUT"
echo "archived $OUT"
echo "butler push $OUT/Windows cloudcover95/frameforge:windows --userversion 0.4.2-beta"
