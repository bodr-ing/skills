#!/usr/bin/env node
// Builds the playable demos the site embeds: node scripts/build-demos.mjs
// Hand Up: the real deck page with an in-memory stand-in for the artifact database and a pretend agent.
// YepNope: the games deck built with the skill's own build script.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const deck = readFileSync("skills/hand-up/assets/deck.html", "utf8");
const standIn = `<script>
// Demo only: cards live in memory, and a pretend agent picks up each answer a moment later.
(() => {
  const now = Date.now(), min = 60000;
  const docs = new Map([
    ["claude-drop-col", { kind: "blocked", agent: "claude", repo: "shop-api", title: "Migration drops users.legacy_id (412 rows)", body: "The drop can't be undone. Backing the column up first keeps the data if anything still reads it.", options: ["Back it up, then drop", "Drop it now", "Keep the column"], recommended: 0, waiting: true, status: "open", createdAt: now - 7 * min }],
    ["codex-auth-clash", { kind: "conflict", agent: "codex", relatedAgent: "claude", repo: "shop-api", title: "Both editing src/auth/session.ts", body: "Codex is adding refresh tokens while Claude renames the session store. One of us should wait.", options: ["Codex goes first", "Claude goes first"], recommended: 1, waiting: true, status: "open", createdAt: now - 4 * min }],
    ["gemini-key", { kind: "heads-up", agent: "gemini", repo: "infra", title: "Stripe test key in git history", body: "config/dev.env in commit 3f9a1c2. It's a test key, but it should be rotated.", status: "open", createdAt: now - 2 * min }],
    ["claude-pr", { kind: "done", agent: "claude", repo: "landing", title: "Dark mode PR is ready for review", body: "All pages pass the contrast check.", links: ["https://github.com/"], status: "open", createdAt: now - 1 * min }],
    ["codex-deps", { kind: "heads-up", agent: "codex", repo: "shop-api", title: "Upgraded zod to v4", body: "Two schemas needed small changes. Tests pass.", status: "answered", answer: { action: "go" }, answeredAt: now - 50 * min, ackAt: now - 49 * min, outcome: "Noted in the changelog", createdAt: now - 55 * min }],
  ]);
  const outcomes = {
    "claude-drop-col": ["Backed up legacy_id to legacy_id_backup, then dropped it", "Dropped legacy_id", "Kept the column and removed the drop"],
    "codex-auth-clash": ["Went first; Claude rebases after", "Waiting for Claude's rename, then adding refresh tokens"],
  };
  const subs = new Set();
  const snap = (id) => ({ id, exists: docs.has(id), data: () => docs.get(id), metadata: {} });
  const emit = () => { const arr = [...docs.keys()].map(snap); subs.forEach((cb) => cb({ docs: arr, size: arr.length, empty: !arr.length })); };
  const pickUp = (id) => setTimeout(() => {
    const d = docs.get(id);
    if (!d || d.ackAt || d.status === "open" || d.status === "snoozed") return;
    const a = d.answer || {};
    const outcome = a.action === "dismiss" ? "Used my own judgement" : a.text ? "Did it your way: " + a.text : (outcomes[id] || [])[a.option ?? d.recommended ?? 0] || "Got it, thanks";
    docs.set(id, { ...d, ackAt: Date.now(), outcome });
    emit();
  }, 2500);
  const coll = {
    where() { return coll; }, orderBy() { return coll; }, limit() { return coll; },
    onSnapshot(cb) { subs.add(cb); setTimeout(emit, 0); return () => subs.delete(cb); },
    doc: (id) => ({ get: async () => snap(id), update: async (p) => { docs.set(id, { ...docs.get(id), ...p }); emit(); if (p.answer) pickUp(id); } }),
  };
  const db = { collection: () => coll };
  window.claude = { use: async (n) => (n === "db" ? db : n === "user" ? { can: async () => true } : null) };
})();
</script>
`;
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
`;
const s = deck.indexOf("</style>") + "</style>".length;
const i = deck.indexOf("<script>");
writeFileSync("skills/hand-up/demo.html", head + deck.slice(0, s).replace("<title>Hand Up</title>", "<title>Hand Up demo</title>") + "\n</head>\n<body>" + deck.slice(s, i) + standIn + deck.slice(i) + "\n</body>\n</html>\n");

execFileSync("node", ["skills/yepnope/scripts/build.mjs", "skills/yepnope/decks/games.json", "skills/yepnope/demo.html"], { stdio: "inherit" });
// The skill builds an artifact body; give the standalone page a doctype so it renders in standards mode.
const taste = readFileSync("skills/yepnope/demo.html", "utf8");
writeFileSync("skills/yepnope/demo.html", head.replace("<html lang=\"en\">\n<head>\n", "") + taste);
console.log("Built skills/hand-up/demo.html and skills/yepnope/demo.html");
