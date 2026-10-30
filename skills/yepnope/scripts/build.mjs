#!/usr/bin/env node
// Builds a YepNope page from a deck: node build.mjs <deck.json> <out.html>
// Checks the deck first and prints what is wrong instead of writing a broken page. The deck must bring its own
// look (palette, fonts, card layout and card CSS), designed for its subject: the template only has the mechanics.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [deckPath, outPath] = process.argv.slice(2);
if (!deckPath || !outPath) {
  console.error('Usage: node build.mjs <deck.json> <out.html>');
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(join(here, '..', 'assets', 'template.html'), 'utf8');
const deck = JSON.parse(readFileSync(deckPath, 'utf8'));

const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
need(/^[a-z0-9-]{1,40}$/.test(deck.id || ''), 'id: lowercase letters, digits and dashes (it keys saved answers)');
for (const k of ['name', 'title', 'heading', 'subject']) need(typeof deck[k] === 'string' && deck[k].trim(), `${k}: a non-empty string`);
need(deck.categories && typeof deck.categories === 'object', 'categories: an object of key -> { name, hue }');
const cats = deck.categories || {};
for (const [k, c] of Object.entries(cats)) {
  need(typeof c.name === 'string' && c.name, `categories.${k}.name missing`);
  need(c.hue === undefined || Number.isFinite(c.hue), `categories.${k}.hue, if given, must be a number (0-360)`);
}
need(Array.isArray(deck.atoms) && deck.atoms.length >= 20, 'atoms: at least 20 entries of [category, title, line] or { cat, title, line, ... }');
const titles = new Set();
const perCat = {};
const atoms = (deck.atoms || []).map((a, i) => {
  if (Array.isArray(a) && a.length >= 3 && a.length <= 4) return { cat: a[0], title: a[1], line: a[2], art: a[3] };
  if (a && typeof a === 'object' && !Array.isArray(a)) return a;
  problems.push(`atoms[${i}]: must be [category, title, line], [category, title, line, svg] or { cat, title, line, ... }`);
  return null;
});
atoms.forEach((a, i) => {
  if (!a) return;
  const { cat, title, line, art } = a;
  for (const [k, v] of Object.entries(a)) if (!['cat', 'art'].includes(k) && v !== undefined) {
    need(/^[a-z][a-z0-9_-]*$/i.test(k) && k !== 'id', `atoms[${i}] "${title}": field name "${k}" (letters, digits, - and _; not "id")`);
    need(typeof v === 'string' && v.length <= 160, `atoms[${i}] "${title}": ${k} must be text of at most 160 characters`);
  }
  if (art !== undefined) {
    need(typeof art === 'string' && /^<svg[\s>]/.test(art.trim()) && art.trim().endsWith('</svg>'), `atoms[${i}] "${title}": art must be one <svg>…</svg> element`);
    need(typeof art === 'string' && art.length <= 3000, `atoms[${i}] "${title}": art over 3000 characters; simplify the sketch`);
    need(typeof art === 'string' && !/<script|\son\w+\s*=|href|<text|<image|<foreignObject/i.test(art), `atoms[${i}] "${title}": art may only use shapes (no script, links, text or images)`);
    need(typeof art === 'string' && /viewBox="0 0 160 100"/.test(art), `atoms[${i}] "${title}": art needs viewBox="0 0 160 100"`);
  }
  need(cats[cat], `atoms[${i}] "${title}": unknown category "${cat}"`);
  need(typeof title === 'string' && title.length > 0 && title.length <= 48, `atoms[${i}]: title must be 1-48 characters`);
  need(typeof line === 'string' && line.length > 0 && line.length <= 110, `atoms[${i}] "${title}": line must be 1-110 characters`);
  need(!titles.has(title), `atoms[${i}]: duplicate title "${title}"`);
  titles.add(title);
  perCat[cat] = (perCat[cat] || 0) + 1;
});
for (const k of Object.keys(cats)) need(perCat[k] >= 3, `category "${k}" needs at least 3 atoms (has ${perCat[k] || 0})`);
const rounds = deck.rounds || 100;
need(Number.isInteger(rounds) && rounds >= 10, 'rounds: an integer of at least 10');
need((deck.atoms || []).length >= rounds, `rounds (${rounds}) is more than the number of atoms (${(deck.atoms || []).length})`);
for (const [i, p] of (deck.pitch || []).entries())
  need(Array.isArray(p) && cats[p[0]] && typeof p[1] === 'string', `pitch[${i}]: must be [category, lead-in phrase]`);

// The look: designed fresh for this deck's subject and audience, never borrowed from another deck.
const look = deck.look || {};
const DESIGN = 'design a look for this subject: see "Design the cards" in SKILL.md';
if (!deck.look || typeof deck.look !== 'object') problems.push(`look: missing; ${DESIGN}`);
else {
  need(typeof look.brief === 'string' && look.brief.trim().length >= 30, 'look.brief: one or two sentences on who swipes this deck and why this look suits them');
  need(look.vars && typeof look.vars === 'object', 'look.vars: the page tokens (bg, fg, muted, card, line, display, body, mono; no, yes, love, skip optional)');
  for (const k of ['bg', 'fg', 'muted', 'card', 'line', 'display', 'body', 'mono']) need(typeof look.vars?.[k] === 'string' && look.vars[k], `look.vars.${k} missing`);
  for (const part of ['vars', 'dark']) for (const [k, v] of Object.entries(look[part] || {}))
    need(/^[a-z][a-z0-9-]*$/.test(k) && typeof v === 'string' && !/[;{}<>]|url\(/i.test(v), `look.${part}.${k}: a token name and a plain CSS value`);
  need(look.fonts === undefined || /^https:\/\/fonts\.googleapis\.com\/css2\?[^"<>\s]+$/.test(look.fonts), 'look.fonts: a https://fonts.googleapis.com/css2?… URL');
  need(typeof look.card === 'string' && /data-slot=["']title["']/.test(look.card) && /data-slot=["']line["']/.test(look.card),
    'look.card: the card\'s inner HTML, with data-slot="title" and data-slot="line" (and any of cat, art or your own atom fields)');
  need(typeof look.css === 'string' && look.css.trim().length >= 80, 'look.css: the card\'s CSS (frame, layout, type, art), written for this deck');
  need(!/<script|<iframe|<object|<embed|<link|<style|<meta|<base|<form|\son\w+\s*=|javascript:|srcdoc/i.test(look.card || ''), 'look.card: plain markup only (no script, styles, frames, forms or event handlers)');
  need(!/<\/?style|@import|expression\(|javascript:|url\(\s*['"]?(?!data:)/i.test(look.css || ''), 'look.css: no @import, and url() only for data: URIs');
  const slots = [...(look.card || '').matchAll(/data-slot=["']([a-z][a-z0-9_-]*)["']/gi)].map(m => m[1]);
  for (const k of slots) if (!['cat', 'title', 'line', 'art'].includes(k))
    need(atoms.some(a => a && typeof a[k] === 'string'), `look.card has data-slot="${k}" but no atom has a "${k}" field`);
  // A look copied from another deck is the thing this check exists to stop.
  const norm = l => JSON.stringify([l.card, l.css].map(x => String(x || '').replace(/\s+/g, ' ').trim()));
  const decksDir = join(here, '..', 'decks');
  for (const f of readdirSync(decksDir).filter(f => f.endsWith('.json'))) {
    const other = join(decksDir, f);
    if (resolve(other) === resolve(deckPath)) continue;
    let o; try { o = JSON.parse(readFileSync(other, 'utf8')); } catch { continue; }
    if (o.id !== deck.id && o.look && deck.look && norm(o.look) === norm(look))
      problems.push(`look: card and CSS are copied from decks/${f}. Each deck gets its own look; ${DESIGN}`);
  }
}

if (problems.length) {
  console.error('The deck has problems:\n- ' + problems.join('\n- '));
  process.exit(1);
}
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = JSON.stringify({ ...deck, atoms, rounds }).replace(/</g, '\\u003c');
const tokens = v => Object.entries(v).map(([k, x]) => `--${k}: ${x};`).join(' ');
// Light tokens always; dark ones only when the look has them, otherwise the page stays light.
const lookCss = `:root { ${tokens(look.vars)} color-scheme: ${look.dark ? 'light dark' : 'light'}; }\n` + (look.dark
  ? `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${tokens(look.dark)} } }\n:root[data-theme="dark"] { ${tokens(look.dark)} }\n`
  : '') + look.css;
const fonts = look.fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="${esc(look.fonts)}">` : '';
const page = template
  .replace('{{FONTS}}', () => fonts)
  .replace('/*LOOK*/', () => lookCss)
  .replace('{{TITLE}}', esc(deck.title))
  .replace('{{HEADING}}', esc(deck.heading))
  .replace('{{ROUNDS}}', String(rounds))
  .replace('/*DECK*/null/*END*/', () => json);
writeFileSync(outPath, page);
console.log(`Built ${outPath}: ${atoms.length} atoms in ${Object.keys(cats).length} categories, ${rounds} rounds.`);
