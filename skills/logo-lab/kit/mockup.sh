#!/bin/sh
# Make one photo mockup of a finished logo with Codex CLI image generation.
# usage: mockup.sh <logo.png> <surface> <out.png>
# surfaces: poster app-icon tote jar-label window-decal
# env: CODEX_MODEL (a model your Codex login accepts), BRAND_LINE (text on the
#      poster), APP_NAME (label under the app icon), COLOURS (hex list to keep)
# Run several at once: printf "%s\n" poster tote | xargs -P 5 -I{} kit/mockup.sh logo.png {} out/{}.png
set -e
REF=$1; SURFACE=$2; OUT=$3
BRAND_LINE=${BRAND_LINE:-brand name}
APP_NAME=${APP_NAME:-$BRAND_LINE}
case $SURFACE in
  poster) SCENE="a printed street poster pasted on a weathered city wall, with the logo large and the text '$BRAND_LINE' below it";;
  app-icon) SCENE="a close-up photo of an iPhone home screen where this logo is the app icon (rounded square), labelled '$APP_NAME', among a few generic app icons";;
  tote) SCENE="a natural canvas tote bag carried on someone's shoulder outdoors, with the logo screen-printed on the bag";;
  jar-label) SCENE="a glass jar on a kitchen shelf with a round paper label showing the logo";;
  window-decal) SCENE="a small shop's glass front window in daylight, with the logo as a large vinyl decal on the glass, street reflections visible";;
  *) SCENE=$SURFACE;;
esac
WORK=$(mktemp -d)
cp "$REF" "$WORK/ref.png"
# The prompt goes before -i: -i takes several files and would swallow it.
codex exec ${CODEX_MODEL:+-m "$CODEX_MODEL"} --sandbox workspace-write --skip-git-repo-check -C "$WORK" \
  "Use your image generation tool. The attached image is a finished logo. Generate ONE photorealistic mockup photo: $SCENE. Reproduce the logo exactly as given: same shape, same details, same flat colours${COLOURS:+ ($COLOURS)}. Do not redesign, restyle, simplify or add to the logo. Save the result as out.png in the current folder. Reply only with the file name." \
  -i ref.png > "$WORK/log.txt" 2>&1 || true
if [ -f "$WORK/out.png" ]; then
  mkdir -p "$(dirname "$OUT")"
  if command -v sips >/dev/null; then sips -s format png --resampleWidth 768 "$WORK/out.png" --out "$OUT" >/dev/null
  else cp "$WORK/out.png" "$OUT"; fi
  echo "ok $OUT"; rm -rf "$WORK"
else
  echo "FAILED $SURFACE (log: $WORK/log.txt)"; exit 1
fi
