---
name: brand-kit
description: Start a new brand or sub-brand and take it from a name to a shipped identity (brief, logo, colours, asset pack, brand sheet) that fits its brand family. Chains yepnope, oohnah and logo-lab and adds what they leave out. Use when someone says "we need a brand for X", names a new product, sub-brand or internal tool that needs a logo and avatar, or wants an existing brand's kit filled in.
---

# Brand Kit

A brand is a name, one idea, a mark, a few colours and a pack of files that every surface can use. Brand Kit runs the whole path and keeps every step on record, so the next brand in the family starts from what the last one learned.

It wraps the other skills: **YepNope** when it is unclear what the thing is, **OohNah** for how it looks, **Logo Lab** for the mark. Brand Kit adds the family, the brief, the colour round, the asset pack and the record.

## Options the person can ask for

Read these from the request and use the default for anything not mentioned. Say back the settings you used in one line before you start.

| Option | Default | Example ask |
|---|---|---|
| Kind | worked out from the brief (see "Three kinds") | "it's just an internal tool", "full public brand" |
| Concepts per round | 8, chosen by the model | "just 6", "go wide, 24" |
| Look swipe (OohNah) | public brands only | "skip the swipe", "swipe the site look too" |
| Colourways | 8 of the picked shape | "keep the colours", "show 4" |
| Asset pack | favicon, avatar, app icon, social preview, OG image | "add stickers", "Telegram bot avatar too" |
| Where to stop | shipped pack + brand sheet | "stop at the pick" |

## Three kinds

Decide this first; it sets how much of the loop runs.

- **Parent** (the company). Full loop: OohNah, Logo Lab with photo mockups, a sticker pack.
- **Public sibling** (a product people see). Full loop, but it inherits the family rules and must not reuse a sibling's colour or core object.
- **Endorsed tool** (an admin desk, a bot, an internal product). Concepts, pick, colourways, pack. No OohNah: its screens use the theme of whatever brand it is working on, so its own palette shows only in the mark, favicon, avatar and login screen.

## The loop

1. **Read the family.** Open `family.md` in the brand home (see Records). It lists the shared rules and every brand's colours, object and type. Write it from the existing brands if it does not exist yet. A new brand must differ from every sibling in its main colour and its object.

2. **Brief, on one page.** Copy `templates/brief.md`. Name and literal meaning, the one object it suggests, the kind, who sees it, the surfaces it must work on, spelling rules, colours already taken, and free directions. Check the domain and handles. Never ask the person to describe the logo; the brief is for the image model and for you.

3. **Look (public brands only).** Run OohNah with cards in the brand's real surfaces. Its `taste.md` goes into the brand folder.

4. **Concepts: let the model design.** Give the image model the story, not a spec: the name and what it means, what the brand does, who sees it, the sister brands (for context, not to copy) and what was already rejected. Let it choose its own concepts, colours and type, and ask for 8 genuinely different ones plus a `notes.md` with one line per idea. Do not write the directions or lock the palette yourself: a fixed per-concept prompt caps the model at your own ideas, and the first matba round, written that way, got no likes at all. Run it on the person's machine with Codex CLI, one run per brand. `kit/concepts.sh` is only for when you need many variations of one idea that is already picked.

5. **Pick.** Put all concepts on one visual page, numbered, with a swipe or one-tap pick. If none lands, find what the liked ones share, write it down as **the one idea** ("the bolt lives only in the ç") and run the next round inside it. Each round gets a new `prompts-vN.txt`; never overwrite an old round.

6. **Redraw and test.** Run Logo Lab on the 1 to 3 picks: clean SVG, in-context sheet, scoring. For an endorsed tool, the in-context sheet is enough (favicon, avatar, admin header, bot avatar); skip photo mockups.

7. **Colourways.** Colour comes after shape. Show the picked shape in 8 colourways, 4 on a dark ground and 4 light, with sibling marks on the same row so clashes show. The person picks one.

8. **Ship the pack.** Draw the masters: `mark.svg`, `wordmark.svg`, a light version for dark grounds, one-colour dark and light, `favicon.svg`. Fill `brand.json` and run `node kit/export.mjs brand.json pack/` for favicons, avatars (circle-safe), app icon, GitHub social preview and OG image. Add the brand's theme tokens to the product's theme file.

9. **Record.** Fill `templates/brand.md` as the brand sheet, write a decision note (what won, the runner-up, why), add the brand to `family.md`, and keep every compare page with its date. Publish pages as new versions; never overwrite an old one.

## Records

Keep one brand home (a private repo or folder), one folder per brand:

```text
brand/
  family.md              shared rules + one row per brand
  <brand>/
    brief.md  brand.md  taste.md  brand.json
    concepts-v1/ prompts-v1.txt ...   every round, kept
    mark.svg  wordmark.svg  favicon.svg  ...
    pack/                exported PNGs
```

Product repos get only the shipped SVGs and pack, never the drafts, so they can go public.

## Rules

- Show, don't ask. Every choice reaches the person as a visual page.
- Let the model design the first concepts from the story. Narrow only after the person reacts.
- Shape first, colour second: colourways come after a pick.
- One idea per brand. Once a round finds it, every later round stays inside it.
- Design every swipe deck and compare page for this brand. Never reuse a demo deck with new words.
- Spell the name exactly, in every prompt and file. Keep a separate ASCII form for domains and code.
- Keep palettes exact across prompts, SVGs, pack and theme tokens.
- No secrets, tokens or private URLs in prompts, files or commits.

## Gotchas

- Image models misspell names with special letters. Ask for the wordmark small, judge the mark, and set the wordmark in a real font when redrawing.
- A mark that only works big is not done. Look at the 16px favicon and the round avatar before calling a winner.
- `xargs` parses quotes; `concepts.sh` uses `-0` so prompts can contain apostrophes.
- Render with Chrome (`export.mjs`, Logo Lab's `render.sh`), not `sips` or Quick Look, which blur masks and patterns.

## Files

- `templates/brief.md`: the one-page brief.
- `templates/brand.md`: the brand sheet (meaning, spelling, colours, type, files, do and don't).
- `templates/family.md`: the family file with one row per brand.
- `kit/concepts.sh`: variations of an idea that is already picked, run in parallel with Codex CLI: `kit/concepts.sh prompts-v2.txt concepts-v2 4`.
- `kit/export.mjs`: the asset pack from the master SVGs: `node kit/export.mjs brand.json pack/`.
- `example/`: the Bodring family as a filled-in `family.md`.
