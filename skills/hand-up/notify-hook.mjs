#!/usr/bin/env node
// Claude Code Notification hook: when Claude is waiting for you in the terminal
// (a permission prompt, or idle waiting for input), put a card on your phone.
// Env: HANDUP_URL, HANDUP_TOKEN, optional HANDUP_AGENT (default "claude").
let input = "";
for await (const chunk of process.stdin) input += chunk;
const e = JSON.parse(input || "{}");
const base = (process.env.HANDUP_URL || "http://localhost:8787").replace(/\/$/, "");
const where = (e.cwd || "").split("/").filter(Boolean).pop() || "a session";
try {
  await fetch(`${base}/api/agent/raise`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.HANDUP_TOKEN || ""}`,
      "x-handup-agent": process.env.HANDUP_AGENT || "claude",
    },
    body: JSON.stringify({
      kind: "blocked",
      repo: where,
      title: `Waiting for you in ${where}`,
      body: `${e.message || "Claude Code needs your input."} Answer in the terminal.`,
      dedupeKey: `notify:${e.session_id || where}`,
    }),
    signal: AbortSignal.timeout(3000),
  });
} catch {
  // Never block Claude Code because the hub is down.
}
