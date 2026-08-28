# pagefly-browser-tester

A Claude / agent **skill** for driving end-to-end browser tests against a Shopify
embedded app - an app that renders inside Shopify admin, behind two or three
nested iframes, sometimes inside a max-modal overlay on top of them.

It is a written map, not a framework. One markdown file: the tool decision and
why, the frame topology, the traps that cost hours to rediscover, and a session-continuity
template for runs long enough to exhaust a context window.

---

## The one decision that matters

**Use chrome-devtools MCP. Do not use Playwright** for this surface.

Both tools can reach every frame. The difference is measured elsewhere:

- **Speed.** Playwright MCP through the browser-extension relay took **2 to 6
  minutes per DOM read**. The same operations in chrome-devtools take seconds.
- **Clicks never stabilise.** Every native click timed out at 5s on the
  "wait for element to be stable" check, forcing hand-dispatched mouse events
  for everything.
- **`take_snapshot` crosses all three iframes** and returns clickable uids. That
  is the single capability that makes the workflow possible at all.

**Detection rule:** those two symptoms together - clicks timing out on stability,
DOM reads measured in minutes - mean the relay is the bottleneck. Switch tools;
do not try to tune it.

## What the map covers

| Topic | What you get |
|---|---|
| **Frame topology** | Two diagrams: the plain app iframe, and the max-modal overlay that editor-style screens open into |
| **Navigation** | Why reloading or pasting a URL kills the tunnel WebSocket and leaves a blank page, and the click-through pattern that replaces it |
| **Dialog cascade** | The unsaved-changes dialog, when it fires, and which button flow avoids it |
| **Cross-origin API calls** | `evaluate_script` cannot call app APIs from the parent frame. The workaround reads `id_token` off the iframe `src` and fetches with it |
| **Snapshot freshness** | uids expire after any click or navigation, every run, without warning |
| **Error table** | Eleven symptoms mapped to causes, including the ones that look like a loading delay and are not |
| **Session continuity** | A progress-file template so a long run resumes in a fresh session instead of restarting |

## Requirements

- Chrome launched with `--remote-debugging-port=9222`
- The chrome-devtools MCP server
- A Shopify development store with the app installed, and a dev server running

No Node packages, no build step.

## Setup

Copy `config.example.md` to `config.local.md` and fill in your store handle, app
handle, dev-server command, local database name, and test products. The skill
reads that file first and substitutes the placeholders.

`config.local.md` is gitignored. Nothing environment-specific belongs in
`SKILL.md`.

One thing worth recording there: a store can carry several installs of the same
app, one per dev app config, and only the install whose `client_id` matches what
your dev server is currently serving will load your local code.

## Install

Ships as part of [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Not for

Storefront testing. This is about the admin-embedded surface: nested frames,
App Bridge keyboard interception, overlay modals. A public storefront has none
of those problems and Playwright is fine there.

## Data

Nothing store-specific lives in this skill. No store handles, no app handles, no
admin URLs, no credentials, no product names - every one of them is a placeholder
resolved from your own `config.local.md`.
