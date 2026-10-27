#!/bin/sh
# Render an SVG to a square PNG with headless Chrome.
# usage: render.sh <in.svg> <out.png> [size=1024]
# Chrome is used instead of sips/qlmanage because those rasterise masks and
# patterns at low resolution (a "bite" mask comes out blurry).
set -e
IN=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
OUT=$2
SIZE=${3:-1024}
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
[ -x "$CHROME" ] || CHROME=$(command -v chromium || command -v google-chrome)
TMP=$(mktemp -d)
printf '<html><body style="margin:0;background:transparent"><img src="file://%s" width=%s height=%s></body></html>' "$IN" "$SIZE" "$SIZE" > "$TMP/r.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --window-size="$SIZE,$SIZE" --allow-file-access-from-files --screenshot="$OUT" "file://$TMP/r.html" 2>/dev/null
rm -rf "$TMP"
echo "$OUT"
