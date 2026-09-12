#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="$ROOT/unreal/Host"
mkdir -p "$HOST/Plugins"
TARGET="$HOST/Plugins/FrameForge"
if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
  echo "already linked $TARGET"
  exit 0
fi
ln -s ../../FrameForge "$TARGET"
echo "linked plugin -> $TARGET"
