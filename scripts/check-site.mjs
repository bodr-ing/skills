#!/usr/bin/env node
// Quality gate for a static site: run before every deploy (CI) and by hand with `node scripts/check-site.mjs [dir]`.
// Fails on what would ship broken: a local link, image, script or stylesheet that points at no file, an in-page
// #anchor with no matching id, duplicate ids, a page with no <title>, lang or viewport, an <img> with no alt,
// a page over the size budget, or a file that must never be public (.github, wrangler config, .env, keys)
// that .assetsignore lets ship. An HTML file with no <html> element is a template partial and is skipped.
// No dependencies, so it runs on any runner with Node.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const PAGE_BUDGET = 400 * 1024; // bytes of HTML per page, images not counted
const ALWAYS_IGNORED = ['.git', 'node_modules', '.wrangler'];

// .assetsignore uses .gitignore syntax; this covers the forms the Bodring sites use: names, dir/, globs with *.
const ignoreRules = (existsSync(join(root, '.assetsignore')) ? readFileSync(join(root, '.assetsignore'), 'utf8') : '')
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const toRegex = (rule) => {
  const anchored = rule.startsWith('/') || rule.replace(/\/$/, '').includes('/');
  const body = rule.replace(/^\//, '').replace(/\/$/, '')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
  return new RegExp(`${anchored ? '^' : '(^|/)'}${body}(/|$)`);
};
const ignores = [...ALWAYS_IGNORED, ...ignoreRules].map(toRegex);
const shipped = (rel) => !ignores.some((re) => re.test(rel));

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(root, abs).split(sep).join('/');
    if (!shipped(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs);
    else files.push(rel);
  }
})(root);
const fileSet = new Set(files);

// _redirects sources count as existing paths (exact, or a /prefix/* splat).
const redirects = (existsSync(join(root, '_redirects')) ? readFileSync(join(root, '_redirects'), 'utf8') : '')
  .split('\n').map((l) => l.trim().split(/\s+/)[0]).filter((s) => s && !s.startsWith('#'));
const redirected = (path) => redirects.some((src) => src.endsWith('/*') ? path.startsWith(src.slice(0, -1)) : src === path || src === `${path}/`);

const problems = [];
const report = (file, msg) => problems.push(`${file}: ${msg}`);

// Files that must never be public. Flagged only if .assetsignore lets them ship.
const NEVER_SHIP = [/^\.github\//, /^wrangler\.jsonc?$/, /(^|\/)\.env/, /\.(pem|key)$/];
for (const f of files) if (NEVER_SHIP.some((re) => re.test(f))) report(f, 'would be deployed; add it to .assetsignore');

const isExternal = (url) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url);

function checkRef(from, raw) {
  const url = raw.trim().replace(/&amp;/g, '&');
  if (!url || url.startsWith('#') || isExternal(url) || url.includes('${') || url.includes('{{')) return;
  const path = decodeURI(url.split(/[?#]/)[0]);
  if (!path) return;
  const target = path.startsWith('/') ? path.slice(1) : relative(root, resolve(root, dirname(from), path)).split(sep).join('/');
  const asDir = target.replace(/\/$/, '');
  if (fileSet.has(target) || fileSet.has(asDir ? `${asDir}/index.html` : 'index.html') || fileSet.has(`${asDir}.html`)) return;
  if (redirected(`/${target}`)) return;
  report(from, `"${raw}" points at no deployed file`);
}

function checkCss(from, css) {
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) checkRef(from, m[2]);
}

for (const f of files.filter((f) => f.endsWith('.css'))) checkCss(f, readFileSync(join(root, f), 'utf8'));

for (const f of files.filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join(root, f), 'utf8');
  if (raw.length > PAGE_BUDGET) report(f, `page is ${Math.round(raw.length / 1024)} KB of HTML, budget is ${PAGE_BUDGET / 1024} KB`);
  // Script bodies are code, not markup: their strings would read as false attributes and ids.
  const html = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, '$1$2');
  if (!/<html[\s>]/i.test(html)) continue;
  if (!/<html[^>]*\slang=["'][^"']+["']/i.test(html)) report(f, '<html> has no lang');
  if (!/<title>[^<]+<\/title>/i.test(html)) report(f, 'no <title>');
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) report(f, 'no viewport meta');
  const ids = new Map();
  for (const m of html.matchAll(/\sid=["']([^"']+)["']/g)) ids.set(m[1], (ids.get(m[1]) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) report(f, `id "${id}" is used ${n} times`);
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) if (!/\salt=/i.test(m[0])) report(f, `<img> with no alt: ${m[0].slice(0, 80)}`);
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src)=["']([^"']*)["']/gi)) {
    if (m[1].startsWith('#') && m[1].length > 1 && !ids.has(decodeURIComponent(m[1].slice(1)))) report(f, `"${m[1]}" has no matching id on the page`);
    else checkRef(f, m[1]);
  }
  for (const m of html.matchAll(/\ssrcset=["']([^"']*)["']/gi)) for (const part of m[1].split(',')) checkRef(f, part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(f, m[1]);
  for (const m of html.matchAll(/\sstyle=["']([^"']*)["']/gi)) checkCss(f, m[1]);
}

const pages = files.filter((f) => f.endsWith('.html')).length;
if (problems.length) {
  console.error(`check-site: ${problems.length} problem(s) in ${pages} page(s)\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`check-site: ${pages} page(s), ${files.length} deployed file(s), no problems`);
