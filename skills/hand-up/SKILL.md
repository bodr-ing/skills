---
name: hand-up
description: Raise blockers, conflicts and important findings to the user's Hand Up swipe deck instead of stopping or burying them in chat. Use whenever you need a decision you can't make yourself, are about to touch files another agent may be editing, or find something the user should know outside your task.
---

# Hand Up

The user runs several coding agents at once and doesn't watch any of them. Hand Up is how you reach them: a card in one swipe deck that they clear with a thumb. Swipe right takes your recommended option, left dismisses, up snoozes, down replies in words.

## Two ways to connect

**Deck mode (Claude, nothing to host).** Use it when you have the `Artifact` and `ArtifactData` tools. The deck is the user's artifact titled **Hand Up**. Find its URL once with `Artifact` `action: "list"`, or use the one the user gave you. If there isn't one yet, publish `assets/deck.html` from this skill as a new artifact with `capabilities: {"db": {}, "user": {}}`, and give the user the link to keep on their phone. Cards live in its `cards` collection (writes to the deck need permission: run in auto mode, or approve the first write):

- **Raise or ask:** `ArtifactData` `set` on collection `cards`, with `doc_id` set to `<agent>-<short-slug>` (for example `claude-drop-legacy-id`). Use a fresh id for a new question. Reuse the id only to correct a card that is still open. The data looks like this:
  ```json
  {"kind": "blocked", "agent": "claude", "repo": "bodr.ing",
   "title": "...", "body": "...",
   "options": ["...", "..."], "recommended": 0, "links": ["https://..."],
   "waiting": true, "status": "open", "createdAt": <now in ms>}
  ```
  `kind` is one of `blocked`, `conflict`, `heads-up` or `done`. Set `waiting: true` only when you are holding work for the answer. For `createdAt` and `ackAt`, get the real time from `date +%s%3N`. Never guess it.
- **Wait well.** After a waiting card, keep working on anything that doesn't depend on it. If you can schedule a wake-up (`ScheduleWakeup`, `send_later`), check back after about 3, 10 and then 30 minutes. With no answer after that, take your recommended option if it can be undone. If it can't, stop and say so in your summary.
- **Read the answer:** `ArtifactData` `get` on the same doc. `status` is `open`, `snoozed`, `answered` or `dismissed`. Once it's answered, `answer` holds `{action, option, choice, text}`. Follow `text` when it adds to `choice`. If the card was dismissed, use your own judgement and don't ask again.
- **Close the loop. This is required.** As soon as you've read an answer, `update` the card (pin `if_version`) with `{"ackAt": <now in ms>, "outcome": "<one line: what you did>"}`. The deck then shows "✓ claude picked it up: …". Until you do, it shows the user that you haven't seen the answer yet. Write `outcome` in plain words, such as "Backed up legacy_id, then dropped it".
- **Withdraw** a card you no longer need (you worked it out, or the task changed) with `update` `{"status": "withdrawn", "outcome": "<why>"}` while it's still open. Don't leave stale questions in the stack.
- **Claims:** to say what you're editing, raise a `heads-up` card listing the paths. Before a big edit, `query` the `cards` collection for open cards from other agents in the same repo that touch your paths. If one does, raise a `conflict` card naming both agents.
- Only ever write to your own cards, and after an answer, write only `ackAt` and `outcome`.

**Hub mode (any agent, phone push).** Use it when you have the `handup` MCP server from [bodr-ing/hand-up](https://github.com/bodr-ing/hand-up) (`raise`, `ask`, `inbox`, `claim`, `release`). These map to the same actions as deck mode: `ask` waits for the answer itself, `claim` detects conflicts for you, and `inbox` returns answers.

Everything below applies to both modes.

## When to use which tool

**Ask (`ask`, or a `blocked` card with `waiting: true`): you're blocked.** Use it when you need a decision you shouldn't make alone: something destructive or irreversible (dropping data, force-pushing, deleting files you didn't create), spending money, choosing between product directions, or picking between options that change what the user gets. Their phone buzzes and `ask` returns their answer.
- Always give 2 to 4 options and set `recommended` to the one you'd pick. Most answers are a single swipe on your recommendation, so make it a good one.
- If `ask` returns without an answer, keep working on anything that doesn't depend on it. Call `inbox` before you make the decision.

**Claim (`claim`, or a claim card): before editing shared ground.** Before a multi-file edit, refactor, migration or dependency change, claim the paths (globs are fine). If another agent holds an overlapping claim, the user gets a conflict card and you're told who. Don't edit the overlapping paths until `inbox` tells you who goes first. Call `release` when you're done or give up.

**`heads-up`: important, not blocking.** Something the user would want to know even though it doesn't stop you: a leaked secret, a security issue, data loss risk, flaky or broken CI on main that isn't yours, a bug you found outside your task, a cost spike.

**`done`: a result worth seeing.** A PR ready for review, a deploy, a report. Put the link in `links`. Not for routine progress.

**Check answers (`inbox`, or `get` your open cards) at natural checkpoints.** At the start of a task, before a decision you previously asked about, and before you finish. Answers are delivered once.

## Don't raise

- Progress updates, plans, or "I'm starting X".
- Anything you can decide yourself with reasonable confidence. Decide, note it in your final summary, and move on.
- The same thing twice. Same title from you returns the existing card; a dismissed card means "use your judgement and don't ask again".
- Questions the user already answered in this session.

A good day is zero to three cards per agent. If everything pings, the user mutes the app.

## Writing the card

- **title**: one line, at most ~60 characters, that says what you need. "Migration drops users.legacy_id (412 rows)" beats "Question about the migration".
- **body**: two or three plain sentences: what you found, why it matters, what happens with each option. No logs or stack traces; put a link in `links` instead.
- **options**: short verbs the user can say yes to. "Back up the column, then drop" / "Drop it now" / "Stop and leave it".
- **repo**: the repository name, so cards group correctly.

## Reading answers

An answer has a choice, a free-text message, or both. Follow the message if it adds detail to the choice. If the user dismissed a card, carry on with your best judgement and don't raise it again.
