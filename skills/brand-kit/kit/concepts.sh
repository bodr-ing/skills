#!/bin/sh
# Make logo concepts with Codex CLI image generation, in parallel.
# usage: concepts.sh <prompts.txt> <out-dir> [parallel=4]
# prompts.txt: a SHARED BRIEF block, then one line per concept: "NN  direction text".
#   Everything up to the first line that starts with two digits is the shared brief.
# env: CODEX_MODEL (a model your Codex login accepts)
# Output: <out-dir>/NN.png (one per concept) and <out-dir>/prompts.txt (a copy, kept as history).
set -e
PROMPTS=$1; OUT=$2; PAR=${3:-4}
[ -f "$PROMPTS" ] || { echo "no prompts file: $PROMPTS"; exit 1; }
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
cp "$PROMPTS" "$OUT/prompts.txt" 2>/dev/null || true
BRIEF=$(awk '/^[0-9][0-9][ \t]/{exit} {print}' "$PROMPTS" | sed 's/^SHARED BRIEF[^:]*://')
export BRIEF OUT CODEX_MODEL
# -0 so apostrophes and quotes in a prompt are passed through, not parsed by xargs.
grep -E '^[0-9]{2}[[:space:]]' "$PROMPTS" | tr '\n' '\0' |
xargs -0 -P "$PAR" -I{} sh -c '
  line="$1"; n=$(printf "%s" "$line" | cut -c1-2); dir=$(printf "%s" "$line" | cut -c3- | sed "s/^[[:space:]]*//")
  [ -f "$OUT/$n.png" ] && { echo "skip $n (exists)"; exit 0; }
  W=$(mktemp -d)
  codex exec ${CODEX_MODEL:+-m "$CODEX_MODEL"} --sandbox workspace-write --skip-git-repo-check -C "$W" \
    "Use your image generation tool to make ONE square 1024x1024 image. $BRIEF This concept: $dir Save it as out.png in the current folder. Reply only with the file name." \
    > "$W/log.txt" 2>&1 || true
  if [ -f "$W/out.png" ]; then mv "$W/out.png" "$OUT/$n.png"; rm -rf "$W"; echo "ok $n"
  else echo "FAILED $n (log: $W/log.txt)"; fi
' _ {}
ls "$OUT"/*.png 2>/dev/null | wc -l | xargs echo "concepts:"
