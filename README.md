# The Bodring Skills

Agent skills from The Bodring Company ([bodr.ing](https://bodr.ing)), browsable at [skills.bodr.ing](https://skills.bodr.ing). Each skill is a folder under `skills/` with a
`SKILL.md` that tells the agent when and how to use it.

| Skill | What it does |
|---|---|
| [yepnope](skills/yepnope/SKILL.md) | **Any subject, in words.** Breaks a subject (a game, an app, a trip, a house) into its smallest choices and turns them into a swipe feed. About 100 swipes later you have a clear picture of what the person actually wants. |
| [hand-up](skills/hand-up/SKILL.md) (not on the site yet) | All your coding agents raise blockers, conflicts and findings into one swipe deck. You swipe, and they read your answer and carry on. Works inside Claude with nothing to host, or with the [hub](https://github.com/bodr-ing/hand-up) for any agent and phone push. |
| [oohnah](skills/oohnah/SKILL.md) | **Visual style only.** Finds a brand's visual taste by swiping before any design work, and ends in a `taste.md` your agents design from. |
| [logo-lab](skills/logo-lab/SKILL.md) | **Logos, tested where they live.** Image-model concepts redrawn as clean SVG, tried on a site, a poster, an app icon, an avatar, a tab, a sticker and in one colour, plus photo mockups of the finalists. Scored, then a one-tap pick. |
| [brand-kit](skills/brand-kit/SKILL.md) (not on the site yet) | **A whole brand, start to finish.** For a new brand or sub-brand: reads the brand family, writes a one-page brief, gets 12 image-model concepts, runs the pick, the colourways and Logo Lab, then exports the asset pack (favicons, avatars, app icon, social preview) and writes the brand sheet. Endorsed tools like an admin desk get a shorter path. |

They chain: YepNope finds what to build, OohNah finds how it looks and writes `taste.md`, Logo Lab reads that and finds the mark. Brand Kit runs the chain for a new brand and ships the files.

## A real run: bodr.ing

*Bir bodring* means "one cucumber" in Uzbek. The Bodring Company knew what it was, so it started at OohNah.

1. **OohNah: 40 looks, 22 yeses.** The swipes leaned Uzbek and cultural, techy, premium and playful, with green and print. Of three directions, *Pickle press* won: two-colour riso in green `#00915a` and pink `#ff4aa2` on paper `#eceee4`, set in Bagel Fat One, Work Sans and DM Mono. [skills.bodr.ing](https://skills.bodr.ing) is built in it.
2. **Logo Lab: 8 marks, 20 photos.** Eight image-model concepts were redrawn as SVG and tried in seven places, then the four finalists went onto a Tashkent poster, a phone, a tote, a pickle jar and a shop window ([`skills/logo-lab/example`](skills/logo-lab/example)).
3. **Shipped: the stamp.** Concept 06 won 20 out of 21: a green rim fading into halftone around three pink seed lobes, still a cucumber at 16px. It became the favicon and the "o" in the wordmark. The pick and the reason went into `taste.md` for the next agent.

## Install

With [skills.sh](https://skills.sh), for Claude Code, Codex, Cursor and other agents:

```text
npx skills add bodr-ing/skills
```

In Claude Code, add this repository as a plugin marketplace and install the plugin:

```text
/plugin marketplace add bodr-ing/skills
/plugin install bodring@bodring
```

Or copy a skill folder into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).

## YepNope in short

1. The agent writes a deck: 12 to 25 categories, 150 to 300 one-idea cards.
2. It designs the cards for that subject: palette, fonts, card layout and CSS. Only the swipe mechanics and results are shared.
3. `node skills/yepnope/scripts/build.mjs <deck.json> <out.html>` checks the deck (including that its look isn't copied from another deck) and builds the page.
4. The person swipes: right yes, left no, up love it, down don't care.
5. The agent reads the answers and turns them into a profile and concrete directions.

`skills/yepnope/decks/games.json` is a complete deck for video games (224 cards, 24 categories, drawn as notebook doodles), and `weekend.json` a small trip deck drawn as luggage tags.

## OohNah in short

OohNah works the same way: `skills/oohnah/assets/shell.html` holds only the swipe mechanics, and each deck brings its own surfaces (a poster, a bag, a dashboard tile, an app icon), layouts, CSS and looks, built with `node skills/oohnah/scripts/build.mjs <deck.json> <out.html>`. See `decks/halfmoon.json` (a coffee roaster) and `decks/relay.json` (a developer tool).

## Contributing

Issues and pull requests are welcome: new decks for YepNope, new look recipes for OohNah, new mockup surfaces for Logo Lab, fixes and ideas for new skills. Keep each skill self-contained in its folder under `skills/`, and never commit secrets or personal data.

## License

MIT

## Deploy

The site at skills.bodr.ing is a Cloudflare Worker with static assets, and every merge to `main` deploys it. The CI workflow scans the new commits for secrets, rebuilds the Hand Up, YepNope and OohNah demo pages with `node scripts/build-demos.mjs` and fails if they differ from what is committed, runs `node scripts/check-site.mjs` (broken links and images, missing alt text, page size), and only then runs `wrangler deploy` and checks that the live page matches the commit. `.assetsignore` keeps repo-only files off the site. After changing a skill's deck or demo source, run the build script and commit its output.
