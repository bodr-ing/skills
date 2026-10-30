#!/usr/bin/env node
// Builds an OohNah page from a deck: node build.mjs <deck.json> <out.html>
// Checks the deck first and prints what is wrong instead of writing a broken page. The shell only has the swipe
// mechanics; the deck brings the card layouts, CSS and looks, designed for its brand and use, never copied.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [deckPath, outPath] = process.argv.slice(2);
if (!deckPath || !outPath) {
  console.error('Usage: node build.mjs <deck.json> <out.html>');
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));
const shell = readFileSync(join(here, '..', 'assets', 'shell.html'), 'utf8');
const deck = JSON.parse(readFileSync(deckPath, 'utf8'));
const DESIGN = 'design the cards for this brand and use: see "Design the deck" in SKILL.md';

const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const plain = v => typeof v === 'string' && v.length <= 600 && !/[;{}<>]|url\(\s*['"]?(?!data:)|expression\(|javascript:/i.test(v);
const name = /^[a-z][a-z0-9_-]*$/i;

need(/^[a-z0-9-]{1,40}$/.test(deck.id || ''), 'id: lowercase letters, digits and dashes');
for (const k of ['title', 'heading', 'hint']) need(typeof deck[k] === 'string' && deck[k].trim(), `${k}: a non-empty string`);
need(typeof deck.brief === 'string' && deck.brief.trim().length >= 40,
  'brief: what the brand is, who it is for, where the look will live, and why these layouts show it there');
need(deck.fonts === undefined || /^https:\/\/fonts\.googleapis\.com\/css2\?[^"<>\s]+$/.test(deck.fonts), 'fonts: a https://fonts.googleapis.com/css2?… URL');
need(isObj(deck.axes) && Object.keys(deck.axes).length >= 1, 'axes: an object of axis key -> label, e.g. { "mood": "Mood", "color": "Colour" }');
const axes = Object.keys(deck.axes || {});
for (const a of axes) need(name.test(a) && a !== 'layout', `axes.${a}: a plain key (not "layout", which is always counted)`);
need(deck.content === undefined || isObj(deck.content), 'content: an object of slot -> text shared by every card');

// Layouts and CSS: the design work, written for this deck.
need(isObj(deck.layouts) && Object.keys(deck.layouts).length >= 1, `layouts: an object of layout key -> card HTML; ${DESIGN}`);
const layouts = deck.layouts || {};
for (const [k, html] of Object.entries(layouts)) {
  need(name.test(k), `layouts.${k}: a plain key`);
  need(typeof html === 'string' && html.trim(), `layouts.${k}: the card's HTML`);
  need(!/<script|<iframe|<object|<embed|<link|<style|<meta|<base|<form|<img|\son\w+\s*=|javascript:|srcdoc/i.test(html || ''),
    `layouts.${k}: plain markup only (no script, styles, images, frames, forms or event handlers; draw with CSS or inline SVG)`);
}
need(typeof deck.css === 'string' && deck.css.trim().length >= 200, `css: the layouts' CSS, scoped under .L-<layout>; ${DESIGN}`);
need(!/<\/?style|@import|expression\(|javascript:|url\(\s*['"]?(?!data:)/i.test(deck.css || ''), 'css: no @import, and url() only for data: URIs');
for (const k of Object.keys(layouts)) need((deck.css || '').includes('.L-' + k), `css: nothing styles .L-${k}`);

// Cards.
need(Array.isArray(deck.cards) && deck.cards.length >= 8, 'cards: at least 8');
const ids = new Set(), used = new Set();
const slots = new Set(Object.values(layouts).flatMap(h => [...String(h).matchAll(/data-slot=["']([^"']+)["']/g)].map(m => m[1])));
(deck.cards || []).forEach((c, i) => {
  const at = `cards[${i}]${c && c.id ? ` "${c.id}"` : ''}`;
  if (!isObj(c)) { problems.push(`${at}: an object`); return; }
  need(/^[a-z0-9-]{1,40}$/.test(c.id || '') && !ids.has(c.id), `${at}: id must be unique, lowercase, digits and dashes`);
  ids.add(c.id);
  need(typeof c.name === 'string' && c.name.trim() && c.name.length <= 40, `${at}: name, at most 40 characters`);
  need(layouts[c.layout] !== undefined, `${at}: layout "${c.layout}" is not in layouts`);
  used.add(c.layout);
  need(isObj(c.tags), `${at}: tags for every axis`);
  for (const a of axes) need(typeof c.tags?.[a] === 'string' && c.tags[a], `${at}: tags.${a} missing`);
  need(c.vars === undefined || isObj(c.vars), `${at}: vars, an object of CSS custom properties`);
  for (const [k, v] of Object.entries(c.vars || {})) need(name.test(k) && plain(v), `${at}: vars.${k} must be a plain CSS value`);
  for (const [k, v] of Object.entries(c.content || {})) {
    need(typeof v === 'string' && v.length <= 140, `${at}: content.${k} must be text of at most 140 characters`);
    need(slots.has(k), `${at}: content.${k} fills no data-slot in any layout`);
  }
});
for (const k of Object.keys(layouts)) need(used.has(k), `layouts.${k}: no card uses it`);

const total = deck.total ?? 30, seed = deck.seed ?? 12;
need(Number.isInteger(seed) && seed >= 4 && seed <= (deck.cards || []).length, 'seed: round 1 size, at least 4 and at most the number of cards');
need(Number.isInteger(total) && total >= seed, 'total: swipes per session, at least seed');
if (deck.remix !== undefined) {
  need(isObj(deck.remix) && Array.isArray(deck.remix.vars) && Array.isArray(deck.remix.axes) && deck.remix.vars.length,
    'remix: { "vars": [card vars a remix borrows], "axes": [tags that follow them] }');
  for (const a of deck.remix?.axes || []) need(axes.includes(a), `remix.axes: "${a}" is not an axis`);
} else need(total <= (deck.cards || []).length, `total (${total}) is more than the cards, and there is no remix to fill round 2`);

// A deck that reuses another deck's layouts and CSS with new words is the thing this check exists to stop.
const norm = d => JSON.stringify([d.layouts, String(d.css || '').replace(/\s+/g, ' ').trim()]);
const decksDir = join(here, '..', 'decks');
for (const f of readdirSync(decksDir).filter(f => f.endsWith('.json'))) {
  const other = join(decksDir, f);
  if (resolve(other) === resolve(deckPath)) continue;
  let o; try { o = JSON.parse(readFileSync(other, 'utf8')); } catch { continue; }
  if (o.id !== deck.id && o.layouts && (norm(o) === norm(deck) || String(o.css).trim() === String(deck.css).trim()))
    problems.push(`layouts/css are copied from decks/${f}. Each deck gets its own; ${DESIGN}`);
}

if (problems.length) {
  console.error('The deck has problems:\n- ' + problems.join('\n- '));
  process.exit(1);
}
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = JSON.stringify({ ...deck, total, seed }).replace(/</g, '\\u003c');
const fonts = deck.fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="${esc(deck.fonts)}">` : '';
const page = shell
  .replace('{{FONTS}}', () => fonts)
  .replace('/*CSS*/', () => deck.css)
  .replace('{{TITLE}}', () => esc(deck.title))
  .replace('{{HEADING}}', () => esc(deck.heading))
  .replace('{{HINT}}', () => esc(deck.hint))
  .replace('{{TOTAL}}', String(total))
  .replace('/*DECK*/null/*END*/', () => json);
writeFileSync(outPath, page);
console.log(`Built ${outPath}: ${deck.cards.length} cards in ${Object.keys(layouts).length} layouts, ${total} swipes (round 1: ${seed}).`);
