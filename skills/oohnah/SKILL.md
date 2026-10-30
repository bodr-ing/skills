---
name: oohnah
description: Find how something should look by swiping visual samples (palettes, typefaces, layouts) before any design work, ending in a taste.md style guide. Visual style only. Use when someone says "I'll know it when I see it" about a design, rejects a design without saying why, or starts a new brand, logo, landing page, deck or product look. To find out what someone wants in general (features, a game idea, a trip), use yepnope instead. Formerly called vibe-check.
---

# OohNah

Turn "I'll know it when I see it" into a written taste profile, then design from it. The person swipes through visual direction cards (Tinder-style), and you read the swipes and write `taste.md`.

**What is fixed and what is not.** Only the generic parts are shared between runs: the swipe mechanics, the two rounds, remixing, saving and the results screen (`assets/shell.html`, `scripts/build.mjs`). The shell is plain grey on purpose so it never votes. Everything on the cards, the surfaces they show, the layouts, palettes, fonts, decoration and copy, is designed fresh on each call for this brand and where its look will live. Never take another deck and change the words: the builder refuses a deck whose layouts and CSS match another deck's.

## Options the person can ask for

Read these from the request and use the default for anything not mentioned. Say back the settings you used in one line before you build the deck.

| Option | Default | Example ask |
|---|---|---|
| Swipes per session | 30 (`total` in the deck) | "only 15 swipes", "give me 50" |
| Cards in the deck | 30 to 40 | "make 60 looks" |
| Round 1 map size | 12 (`seed`) | "start with 8 very different looks" |
| What the cards test | whole looks (palette + type + layout) | "only colours", "just fonts", "logos only" |
| Where the looks are shown | the 2 to 4 surfaces this brand lives on | "show them as app screens", "on packaging" |
| Axes | mood, colour, type, density | "also test corners", "test illustration style" |
| Directions to build | 3 | "show me 5 variants", "just one" |
| Logo marks | 3 to 4 | "6 logo options" |
| Where to stop | built directions, then logo | "stop at taste.md", "skip the logo" |
| Starting point | a fresh deck | "start from our taste.md", "lean premium" |

## When to run it

Run it **between brainstorm and plan**: after you know what the thing is and who it's for, but before you pick fonts, colours or layout. Run it again whenever the person rejects designs and can't say why.

## The loop

1. **Brief.** One paragraph: what it is, who it's for, and the one job the page or product must do.
2. **Design the deck** (see below): pick the surfaces this brand's look will live on, write a layout for each, then write 30 to 40 looks. Use the brand's real name and real product names on the cards. Cover the space widely: playful to premium, light to dark, serif to mono to chunky, minimal to bold, and at least one look rooted in the brand's own culture or place. Build it with `node scripts/build.mjs <deck.json> <out.html>`, which checks the deck and prints every problem instead of writing a broken page. Screenshot a few cards at phone width and fix anything that clips or overlaps.
3. **Swipe.** The deck runs in two rounds:
   - **Round 1, map:** 12 cards picked to be as different as possible.
   - **Round 2, remix and explore:** each next card is either a remix (the palette of one liked card with the type of another) or an unseen card that probes a blind spot. Tag scores are sampled from like/dislike counts (Thompson-style), so the deck leans toward the person's taste and keeps exploring.

   Publish it where the person can swipe on a phone. With the Artifact tool, declare `capabilities: {"db": {}}` and read the collection `results` with `ArtifactData` once they are done. Otherwise the page shows a "Copy profile" box to paste back.
4. **Write `taste.md`.** Include the top values per axis with percentages, the liked cards, and an explicit **never** list (everything at or under about 20%). Show it to the person and let them edit it.
5. **Plan three directions.** Each one leans on a different liked cluster. Name each with a short phrase (for example "Samarkand terminal", "Pickle press", "Company ledger"). Give each a palette, a font pairing and one motif.
6. **Build them as real pages,** not mockups. Present them on a single picker page: phone-sized previews, an "open live" link for each, a one-tap pick and an optional note.
7. **Ship the pick.** Then find the logo. If the `logo-lab` skill is installed, hand over to it with `taste.md`: it tests 8 marks in real places and ends in a pick. Otherwise show 3 to 4 marks, each big, as an avatar, as a favicon and on the brand colour.
8. **Compound.** Append the winner, the logo and why the others lost to `taste.md`, and commit it to the repo. The next venture starts from that file.

## Design the deck

Start from the brief: what the brand is, who it is for, and **where its look will live**. A coffee roaster lives on a shop poster, its bags, the menu board and social posts. A developer tool lives on a landing hero, a dashboard tile and an app icon. A children's book lives on a cover, a spread and a sticker. Those surfaces are your layouts: 2 to 4 of them, each written as HTML and CSS for this deck. A look judged where it will be used is judged honestly; the same look on a generic swatch is not. When the cards test one thing only ("just fonts"), one layout built for that test (a type specimen) is right.

Then write the looks. Each card is one look shown on one surface: its palette, type and decoration go in `vars`, and the layout reads them. Spread each surface over different moods so a surface and a look are not confused; the results also count likes per layout.

```jsonc
{
  "id": "halfmoon", "title": "OohNah: Halfmoon", "heading": "Which one is Halfmoon?",
  "hint": "Swipe right if this could be the brand, left if not.",
  "brief": "A neighbourhood coffee roaster. Its look lives on a poster, bags, the menu board and social posts…",
  "fonts": "https://fonts.googleapis.com/css2?family=…",      // every font the looks use
  "total": 30, "seed": 12,
  "axes": { "mood": "Mood", "color": "Colour", "type": "Type", "density": "Density" },
  "remix": { "vars": ["display", "weight", "style", "size"], "axes": ["type"] },  // optional: what a remix borrows
  "content": { "eyebrow": "halfmoon · coffee roasters", "p1": "Cold brew" },      // text shared by all cards
  "layouts": { "poster": "<h2 class=\"w\" data-slot=\"word\"></h2><p data-slot=\"line\"></p>…", "bag": "…" },
  "css": ".spec { background: var(--deco), var(--bg); color: var(--fg); } .L-poster .w { font: var(--weight) var(--size) var(--display); } …",
  "cards": [ { "id": "pickle-jar", "name": "Pickle jar", "layout": "bag",
               "tags": { "mood": "playful", "color": "green", "type": "chunky", "density": "bold" },
               "vars": { "bg": "#2f5d34", "fg": "#f3edc8", "ac": "#ffcf3f", "display": "'Bagel Fat One'", "size": "55px", "deco": "…" },
               "content": { "word": "Halfmoon", "line": "Small batches, roasted till they sing." } } ]
}
```

- `layouts`: the inner HTML of each surface, placed in `<div class="layout L-<key>">`. Elements with `data-slot` get text from the card's `content`, else the deck's `content`; an empty slot gets `data-empty` and is hidden. Plain markup only (inline SVG is fine; no scripts, styles, images or event handlers).
- `css`: styles every `.L-<key>`. Card `vars` arrive as custom properties (`--bg`, `--display`, …) on `.spec`, which wraps the layout. Name the vars whatever your layouts need. `url()` only for `data:` URIs.
- `remix`: in round 2 a remix keeps one liked card's layout, palette and copy and takes the listed `vars` (and the tags in `axes`) from another liked card. Leave it out and round 2 only explores, so `total` must be at most the number of cards.
- The builder refuses a deck with no layouts or CSS, a layout no card uses, a card tagged on too few axes, and a deck whose layouts and CSS are copied from another deck in `decks/`.

Two decks show the range: `decks/halfmoon.json` (a coffee roaster on a poster, a bag, a menu board and a social post, 40 looks) and `decks/relay.json` (a developer tool on a landing hero, a dashboard tile and an app icon, with a `corners` axis, 14 looks). Read them for how a deck is put together, then design a new one for your brand.

## Rules

- Never ask the person to describe their taste in words first. Show, don't ask.
- Cards test a *direction*, not a finished design. Keep each one fast to judge: one surface, one headline, a little real copy.
- Design the cards for this brand and its surfaces every time. A deck from an earlier run is a reference, not a template.
- Avoid the generic AI looks unless the person likes them in the deck: cream with a terracotta serif, a purple-to-blue gradient, Inter everywhere.
- Present results and choices as visual pages, not long chat messages.

## Files

- `assets/shell.html`: the swipe page (mechanics, rounds, remix, results, saving). Don't edit it per run.
- `scripts/build.mjs`: checks a deck and builds the page from the shell.
- `decks/halfmoon.json`, `decks/relay.json`: two finished decks in different contexts.
- `demo.html`: the Halfmoon deck, built.
- `taste.example.md`: the profile this skill produced for The Bodring Company.
