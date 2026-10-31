#!/usr/bin/env node
// Export a brand's asset pack from its master SVGs with headless Chromium (Playwright).
// usage: node export.mjs <brand.json> <out-dir>
// brand.json: { "name": "çaqmoq", "domain": "caqmoq.uz", "line": "Yaşin tezligida xabarlar",
//   "mark": "mark.svg", "wordmark": "wordmark.svg", "paper": "#fffdf5", "ink": "#0b3d3a",
//   "display": "Outfit:700",                  (a Google Font for the line, optional)
//   "ground": "#0b3d3a", "groundMark": "mark-light.svg" }   (optional: avatar and app icon on a brand
//   colour, with the mark version drawn for that colour; paths are relative to brand.json)
// Writes: favicon-16/32/180.png, avatar-640/512.png (circle-safe, mark at 62%), app-icon-1024.png,
// social-1280x640.png (GitHub preview) and og-1200x630.png. Renders through Chrome, not sips,
// because sips and Quick Look rasterise masks and patterns at low resolution.
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { createRequire } from 'node:module';
// require() so a global Playwright install (NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)('playwright');

const [cfgPath, outDir] = process.argv.slice(2);
if (!cfgPath || !outDir) { console.error('usage: node export.mjs <brand.json> <out-dir>'); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const base = dirname(resolve(cfgPath));
const svg = (p) => p ? readFileSync(join(base, p), 'utf8') : '';
const mark = svg(cfg.mark), word = svg(cfg.wordmark);
const paper = cfg.paper ?? '#ffffff', ink = cfg.ink ?? '#111111';
const ground = cfg.ground ?? paper, gmark = cfg.groundMark ? svg(cfg.groundMark) : mark;
const [family, weight] = (cfg.display ?? '').split(':');
const font = family ? `<link href="https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight ?? 700}&display=swap" rel="stylesheet">` : '';
const css = `*{margin:0;box-sizing:border-box}html,body{width:100%;height:100%}svg{width:100%;height:100%;display:block}
body{font-family:${family ? `'${family}',` : ''}system-ui,sans-serif;color:${ink}}`;
mkdirSync(outDir, { recursive: true });

const jobs = [
  ...[16, 32, 180].map((s) => ({ file: `favicon-${s}.png`, w: s, h: s, transparent: s < 180,
    html: `<div style="width:100%;height:100%;${s >= 180 ? `background:${ground};padding:12%` : ''}">${s >= 180 ? gmark : mark}</div>` })),
  ...[640, 512].map((s) => ({ file: `avatar-${s}.png`, w: s, h: s,
    html: `<div style="width:100%;height:100%;background:${ground};display:grid;place-items:center"><div style="width:62%;height:62%">${gmark}</div></div>` })),
  { file: 'app-icon-1024.png', w: 1024, h: 1024,
    html: `<div style="width:100%;height:100%;background:${ground};display:grid;place-items:center"><div style="width:70%;height:70%">${gmark}</div></div>` },
  ...[['social-1280x640.png', 1280, 640], ['og-1200x630.png', 1200, 630]].map(([file, w, h]) => ({ file, w, h,
    html: `<div style="width:100%;height:100%;background:${paper};display:flex;flex-direction:column;justify-content:center;align-items:center;gap:28px;padding:64px">
      <div style="height:46%;width:80%">${word || mark}</div>
      ${cfg.line ? `<div style="font-size:34px;opacity:.85">${cfg.line}</div>` : ''}
      ${cfg.domain ? `<div style="font:500 24px ui-monospace,monospace;opacity:.6">${cfg.domain}</div>` : ''}</div>` })),
];

const browser = await chromium.launch();
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${font}<style>${css}</style></head><body>${j.html}</body></html>`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outDir, j.file), omitBackground: !!j.transparent });
  await page.close();
  console.log(join(outDir, j.file));
}
await browser.close();
