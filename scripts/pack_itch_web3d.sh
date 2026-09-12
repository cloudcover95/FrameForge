#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/dist/frameforge-unreal-web.zip}"
mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"
(cd "$ROOT/web3d-grok" && zip -r "$OUT" index.html styles.css js data README.md check.mjs)
echo "packed $OUT"
echo "butler push $OUT cloudcover95/frameforge-unreal-web:html5"
echo "JuniorCloud LLC. Not a Nintendo product."
