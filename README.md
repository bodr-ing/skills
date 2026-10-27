# The Bodring Skills

Agent skills from The Bodring Company ([bodr.ing](https://bodr.ing)), browsable at [skills.bodr.ing](https://skills.bodr.ing). Each skill is a folder under `skills/` with a
`SKILL.md` that tells the agent when and how to use it.

| Skill | What it does |
|---|---|
| [yepnope](skills/yepnope/SKILL.md) | **Any subject, in words.** Breaks a subject (a game, an app, a trip, a house) into its smallest choices and turns them into a swipe feed. About 100 swipes later you have a clear picture of what the person actually wants. |
| [hand-up](skills/hand-up/SKILL.md) (not on the site yet) | All your coding agents raise blockers, conflicts and findings into one swipe deck. You swipe, and they read your answer and carry on. Works inside Claude with nothing to host, or with the [hub](https://github.com/bodr-ing/hand-up) for any agent and phone push. |
| [oohnah](skills/oohnah/SKILL.md) | **Visual style only.** Finds a brand's visual taste by swiping before any design work, and ends in a `taste.md` your agents design from. |
| [logo-lab](skills/logo-lab/SKILL.md) | **Logos, tested where they live.** Image-model concepts redrawn as clean SVG, tried on a site, a poster, an app icon, an avatar, a tab, a sticker and in one colour, plus photo mockups of the finalists. Scored, then a one-tap pick. |

They chain: YepNope finds what to build, OohNah finds how it looks and writes `taste.md`, Logo Lab reads that and finds the mark.

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
2. `node skills/yepnope/scripts/build.mjs <deck.json> <out.html>` checks the deck and builds the page.
3. The person swipes: right yes, left no, up love it, down don't care.
4. The agent reads the answers and turns them into a profile and concrete directions.

`skills/yepnope/decks/games.json` is a complete deck for video games (224 cards, 24 categories).

## Contributing

Issues and pull requests are welcome: new decks for YepNope, new look recipes for OohNah, new mockup surfaces for Logo Lab, fixes and ideas for new skills. Keep each skill self-contained in its folder under `skills/`, and never commit secrets or personal data.

## License

MIT

## Deploy

The site at skills.bodr.ing is a Cloudflare Worker with static assets. From the repo root, run `node scripts/build-demos.mjs` (it rebuilds the Hand Up and YepNope demo pages) and then `npx wrangler deploy`. `.assetsignore` keeps repo-only files off the site.
