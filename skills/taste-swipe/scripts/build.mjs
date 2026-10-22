#!/usr/bin/env node
// Builds a Taste Swipe page from a deck: node build.mjs <deck.json> <out.html>
// Checks the deck first and prints what is wrong instead of writing a broken page.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
  need(Number.isFinite(c.hue), `categories.${k}.hue must be a number (0-360)`);
}
need(Array.isArray(deck.atoms) && deck.atoms.length >= 20, 'atoms: at least 20 entries of [category, title, line]');
const titles = new Set();
const perCat = {};
(deck.atoms || []).forEach((a, i) => {
  if (!Array.isArray(a) || a.length < 3 || a.length > 4) { problems.push(`atoms[${i}]: must be [category, title, line] or [category, title, line, svg]`); return; }
  const [cat, title, line, art] = a;
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

if (problems.length) {
  console.error('The deck has problems:\n- ' + problems.join('\n- '));
  process.exit(1);
}
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = JSON.stringify({ ...deck, rounds }).replace(/</g, '\\u003c');
const page = template
  .replace('{{TITLE}}', esc(deck.title))
  .replace('{{HEADING}}', esc(deck.heading))
  .replace('{{ROUNDS}}', String(rounds))
  .replace('/*DECK*/null/*END*/', json);
writeFileSync(outPath, page);
console.log(`Built ${outPath}: ${deck.atoms.length} atoms in ${Object.keys(cats).length} categories, ${rounds} rounds.`);
