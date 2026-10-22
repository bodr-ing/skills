# The Bodring Skills

Agent skills from The Bodring Company ([bodr.ing](https://bodr.ing)), browsable at [skills.bodr.ing](https://skills.bodr.ing). Each skill is a folder under `skills/` with a
`SKILL.md` that tells the agent when and how to use it.

| Skill | What it does |
|---|---|
| [taste-swipe](skills/taste-swipe/SKILL.md) | Breaks a subject (a game, an app, a brand, a trip) into its smallest choices and turns them into a swipe feed. About 100 swipes later you have a clear picture of what the person actually wants. |
| [hand-up](skills/hand-up/SKILL.md) | All your coding agents raise blockers, conflicts and findings into one swipe deck. You swipe, and they read your answer and carry on. Works inside Claude with nothing to host, or with the [hub](https://github.com/bodr-ing/hand-up) for any agent and phone push. |
| [vibe-check](skills/vibe-check/SKILL.md) | Finds a brand's visual taste by swiping before any design work, and ends in a `taste.md` your agents design from. |

## Install

In Claude Code, add this repository as a plugin marketplace and install the plugin:

```text
/plugin marketplace add bodr-ing/skills
/plugin install bodring@bodring
```

Or copy a skill folder into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).

## Taste Swipe in short

1. The agent writes a deck: 12 to 25 categories, 150 to 300 one-idea cards.
2. `node skills/taste-swipe/scripts/build.mjs <deck.json> <out.html>` checks the deck and builds the page.
3. The person swipes: right yes, left no, up love it, down don't care.
4. The agent reads the answers and turns them into a profile and concrete directions.

`skills/taste-swipe/decks/games.json` is a complete deck for video games (224 cards, 24 categories).

## License

MIT
