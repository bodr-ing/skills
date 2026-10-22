# bodr.ing skills

Agent skills from [bodr.ing](https://bodr.ing). Each skill is a folder under `skills/` with a
`SKILL.md` that tells the agent when and how to use it.

| Skill | What it does |
|---|---|
| [taste-swipe](skills/taste-swipe/SKILL.md) | Breaks a subject (a game, an app, a brand, a trip) into its smallest choices and turns them into a swipe feed. About 100 swipes later you have a clear picture of what the person actually wants. |

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
