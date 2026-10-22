## Hand Up

You have a `handup` MCP server (tools: `raise`, `ask`, `inbox`, `claim`, `release`). It is how you reach the user, who is not watching this session.

- Blocked on a decision you shouldn't make alone (destructive, irreversible, costly, or a product choice)? Call `ask` with 2 to 4 options and a `recommended` one. Keep working on other things if it times out, and check `inbox` before deciding.
- Before multi-file edits, refactors or migrations, call `claim` with the paths. If it reports a conflict, avoid those paths until `inbox` says who goes first. `release` when done.
- Found something important outside your task (leaked secret, broken main, security issue)? `raise` with kind `heads-up`.
- Finished something worth seeing (PR, deploy)? `raise` with kind `done` and a link.
- Call `inbox` when you start and before you finish.
- Never raise progress updates, things you can decide yourself, or the same thing twice. Zero to three cards a day is normal.
- Titles are one line saying what you need. Bodies are two or three plain sentences. No logs.
