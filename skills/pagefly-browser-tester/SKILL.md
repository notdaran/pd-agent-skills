---
name: pagefly-browser-tester
description: Use when running any E2E browser test for PageFly — AISP, CRO Center, Dashboard, Page Editor, A/B Tests, Analytics, Settings, or any screen inside the Shopify admin overlay/iframe. Covers Chrome DevTools MCP automation, Shopify iframe nesting, overlay modal handling, session continuity. MUST activate before ANY PageFly browser interaction — NEVER use Playwright (unusably slow and clicks never stabilise; see Tool rule).
---

# PageFly Browser Tester

Automates E2E testing across all PageFly screens via Chrome DevTools MCP. Handles Shopify's nested iframe architecture, overlay modals, dialog cascades, cross-origin API calls, and session continuity across long test runs.

**Scope:** Works for every PageFly surface — AISP editor, page editor, CRO Center, Dashboard, AB Tests, Analytics, Settings, Preferences, any feature mounted inside the app iframe or max-modal overlay.

**Tool rule:** ALWAYS chrome-devtools MCP. NEVER Playwright.

**The reason, corrected 2026-08-25.** This file used to say Playwright cannot reach the app iframe
because it is cross-origin. **That is false** — Playwright reaches all three frames fine via
`frameLocator` / `internal:control=enter-frame`. Measured in a real session that day.

The real reasons:

- **Speed.** Playwright MCP through the browser extension relay (`@playwright/mcp --extension`)
  took **2 to 6 minutes per DOM read**. The same operations in chrome-devtools take seconds.
- **Clicks never stabilise.** Every native `click` timed out at 5s on Playwright's
  "wait for element to be stable" check, forcing hand-dispatched mouse events for everything.
- **chrome-devtools `take_snapshot` crosses all three iframes** and returns clickable uids, which
  is what actually makes this workflow possible.

**Detection rule.** Those two symptoms together — clicks timing out on stability, DOM reads in
minutes — mean the relay is the bottleneck. Switch tools, do not try to fix it.

Keeping a wrong reason here is expensive: it invites the next person to retry Playwright when
they hit the "but it can reach the iframe" contradiction, and lose the same hour.

**Note on `evaluate_script`.** The cross-origin constraint is real, but it applies to
`evaluate_script`, not to frame access — see "Cross-Origin Iframe API Calls" below.

## Prerequisites

Your store handle, app handle, dev command, local DB name and test products live in
`config.local.md` next to this file. **Read it first** and substitute the placeholders below.
`config.example.md` shows the shape if you have not written yours yet.

- Chrome running with `--remote-debugging-port=9222`
- Dev server running (`<DEV_SERVER_COMMAND>` from project root)
- Target screen open in admin (URL depends on feature). A store can carry several installs of the
  same app, one per dev app config. Only the install whose `client_id` matches what your dev server
  is currently serving will load your local code — open **that** one. If you switch between dev apps,
  re-check the handle whenever you restart the server, not just once:
  - Dashboard: `admin.shopify.com/store/<STORE_HANDLE>/apps/<APP_HANDLE>`
  - AISP editor: `admin.shopify.com/store/<STORE_HANDLE>/apps/<APP_HANDLE>/ai-sales-page`
  - CRO Center: `admin.shopify.com/store/<STORE_HANDLE>/apps/<APP_HANDLE>/cro-center`
  - Page editor: opens as max-modal overlay on top of Pages list
- Feature flags set in `.env` as needed (see "Feature Flag Bypass")

## Architecture: Shopify Iframe Nesting

Two common patterns — **App iframe** (dashboard-style screens) and **Max-modal overlay** (editor-style screens).

### Pattern 1 — Plain App iframe (Dashboard, Pages list, CRO Center, AB Tests, Analytics)
```
admin.shopify.com (uid=1_*)
  └─ Iframe "<APP_HANDLE>" (uid=2_*) ← App
       └─ Screen content (React routes)
```

### Pattern 2 — Max-modal overlay (AISP Editor, Page Editor)
```
admin.shopify.com (uid=1_*)
  └─ dialog "Overlay" modal (uid=2_*)  ← e.g. "AI Sales Page Editor"
       └─ Iframe "<APP_HANDLE>" (uid=2_*)   ← Editor app
            ├─ Left sidebar / toolbar
            └─ Iframe "PageFly Sandbox" (uid=N_*) ← Rendered preview
                 └─ Page HTML content
```

**Detection:** after `take_snapshot`, look for `dialog "Overlay"` at root → max-modal active. Otherwise plain iframe.

**Critical:** `fullPage: true` screenshots do NOT capture iframe content. Always use viewport screenshots.

## Unsaved Changes Dialog (applies to ALL editors)

Shopify's max-modal cascades 2 dialogs when leaving with dirty state:

1. **First:** heading "Unsaved changes" → buttons "Discard" / "Save"
2. **Second (after Discard):** heading "Discard all unsaved changes" → buttons "Continue editing" / "Discard changes"

**Rule:** If test needs to persist state → click "Save" on first dialog. If test needs rollback → click "Discard" then "Discard changes" on second.

**Trap:** some actions (e.g. removing an AISP product) get reverted when Discard is chosen — the removal was the "unsaved change" being discarded. Always verify post-discard state matches expectation.

## Capturing Results

**Snapshot (preferred — token efficient):**
```
take_snapshot() → parse target iframe content by UID
```
Extract headings, StaticText nodes, button labels from the target RootWebArea.

**Screenshot (visual comparison):**
```
take_screenshot(filePath="{plan_dir}/e2e-screenshots/{test-id}-{state}.png")
```
Save per-feature to the active plan dir (never `fullPage: true` — iframes won't render).

## AISP-Specific Flows

### Product Swap (Browse + Save — preferred)
1. Click "Products" tab in editor sidebar
2. Click "Browse" → Shopify product picker opens
3. Uncheck current product, check new product
4. Click "Done" (disabled until selection changes)
5. "Unsaved changes" dialog → click **Save**
6. Wait for "Campaign saved successfully" toast
7. AI content streams into sandbox iframe: `wait_for(["Why Choose", product_keyword], timeout=120000)` (30-90s)

**Do NOT use remove-then-add** — Discard reverts the removal, product comes back.

### Quality Assessment Rubric
Score generated content 1-5 on:

| Dimension | 1 (Bad) | 3 (Okay) | 5 (Excellent) |
|-----------|---------|----------|---------------|
| **Hero Section** | Missing/generic | Present, generic headline | Product-specific, compelling CTA |
| **Benefits** | None or 1 generic | 2-3 somewhat relevant | 4+ product-specific with details |
| **Product Title** | Just product name | Enhanced but generic | Branded, benefit-driven, unique |
| **CRO Elements** | None | 1-2 (price, button) | Urgency + trust + payment + scarcity |
| **Below-Fold** | Missing | Present but thin | Rich "Why Choose" with 4+ points |
| **Copy Quality** | Filler/repetitive | Adequate | Professional, conversion-focused |

### Available products in your test store

List yours in `config.local.md`, split into **active** and **disabled (archived / draft / hidden)**.

You need both groups. The disabled ones are what the product picker must keep out, and a picker bug
only surfaces when such products actually exist in the store. A Shopify development store seeded
with the standard sample data already gives you that mix.

## Output Format

Save results to report file:

```markdown
# AISP Quality Test: {product_name}
**Version:** v2.1 | **Date:** {date}
**Hero:** {hero_heading_text}
**Benefits:** {count} - {list}
**Title:** {product_title_text}
**CRO:** {elements_found}
**Below-fold:** {section_name} or "Missing"
**Score:** {n}/5
**Notes:** {observations}
```

## Page Navigation (CRITICAL — prevents blank pages)

**NEVER reload or paste URLs directly** — this kills the Cloudflare tunnel WebSocket and causes blank/stuck pages.

**Correct navigation pattern:**
1. Navigate to dashboard: `navigate_page(url="https://admin.shopify.com/store/<STORE_HANDLE>/apps/<APP_HANDLE>")`
2. Wait for dashboard to FULLY load: `wait_for(["Dashboard", "Slot usages", "Get started"])`
3. Take snapshot to find sidebar link UIDs
4. Click "AI sales page" link in sidebar (NOT navigate by URL)
5. Wait for AISP content: `wait_for(["credits remaining", "credits"])`

**To "reload" the AISP page:** go to dashboard first (step 1-2), then click sidebar (step 3-5). Never use `navigate_page(type="reload")`.

**To open a campaign editor:** user must click campaign row manually (Polaris `s-resource-item` rows are not clickable via MCP snapshot UIDs — they're StaticText nodes). Ask user to open it.

## Cross-Origin Iframe API Calls

App iframe is cross-origin (Cloudflare tunnel). Cannot use `evaluate_script` directly from parent frame to call app APIs.

**Workaround — fetch from parent with iframe auth:**
```javascript
async () => {
  const iframe = document.querySelector('iframe');
  const params = new URL(iframe.src).searchParams;
  const id_token = params.get('id_token');
  const origin = new URL(iframe.src).origin;
  const shop = params.get('shop');
  const res = await fetch(`${origin}/api/ai-wallet/balance?shop=${shop}`, {
    headers: { 'Authorization': `Bearer ${id_token}` }
  });
  return await res.json();
}
```

## Snapshot UID Freshness

UIDs expire after ANY click or navigation. Always `take_snapshot()` again before referencing UIDs from a previous snapshot.

## MongoDB Direct Manipulation

Always use full connection string — `mongosh` defaults to `test` db:
```bash
mongosh "mongodb://localhost:27017/<DB_NAME>" --quiet --eval '<query>'
```

## Feature Flag Bypass in Dev

Unleash flags don't exist in local dev → gating functions like `isWalletEnabled()` return false → features silently bypassed. For wallet tests, set `AI_WALLET_ENABLED=true` in `.env` and restart dev server.

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `list_pages` fails | Chrome not started with `--remote-debugging-port=9222`. Kill all Chrome, relaunch with flag. |
| Snapshot shows Dashboard not Editor | Editor is in the overlay dialog. The iframe nested inside that dialog holds it — read its uid from a fresh snapshot, it changes every run. |
| fullPage screenshot is blank | Iframes not captured by fullPage. Use viewport screenshot instead. |
| Product picker "Done" disabled | Must change selection (check/uncheck) for Done to enable. |
| AI content not generating after save | Check dev server logs for errors. May need to wait longer (120s). |
| "Unsaved changes" loop | Don't Discard when swapping products. Use Browse+Save flow. |
| Blank page after navigation | Used reload or direct URL paste. Follow "Page Navigation" section above. |
| `evaluate_script` returns HTML instead of JSON | Cross-origin iframe. Use workaround in "Cross-Origin Iframe API Calls" section. |
| `Element uid not found` | Stale snapshot. Take fresh snapshot before clicking. |
| MongoDB query returns null | Using wrong db. Pass the full connection string with `<DB_NAME>`. |
| Wallet check bypassed / credits not deducted | Unleash flag missing in dev. Set `AI_WALLET_ENABLED=true` in `.env`. |

## Session Continuity (for long E2E runs)

E2E runs burn context fast. Before starting, create a progress file **inside the plan dir** so next session can resume without reloading everything.

**Location:** `{plan_dir}/e2e-progress.md` (same folder as the test plan)

**Template:**

```markdown
# E2E Progress — {plan-name}

**Plan:** {path to e2e-test-plan-*.md}
**Started:** {YYYY-MM-DD HH:MM}
**Branch:** {git branch}
**Dev URL:** {cloudflare tunnel URL — changes each restart}

## Environment
- Store: <STORE_HANDLE>.myshopify.com
- Campaign/Page ID: {if applicable}
- Feature flags set: {AI_WALLET_ENABLED=true, etc.}
- Seed data: {credits added, ClickHouse rows, etc.}

## Test Progress

| ID | Name | Status | Notes |
|----|------|--------|-------|
| A1 | Happy path | PASS | - |
| A2 | Period validation | FAIL | 90d returns 500 not 400 — see Bug #1 |
| A3 | Sort validation | SKIP | blocked by A2 |
| ... | ... | TODO | - |

Status: `PASS` / `FAIL` / `SKIP` / `TODO` / `IN_PROGRESS`

## Bugs Found

### Bug #1 — {short title}
- **Test:** A2
- **Repro:** {curl command or click steps}
- **Expected:** 400 with error message
- **Actual:** 500 with stack trace
- **File:** {path:line}
- **Fix:** {pending / committed {hash}}

## Resume Instructions

Next session:
1. Read this file (`{plan_dir}/e2e-progress.md`)
2. Read plan file for any test NOT marked PASS
3. Confirm dev server + Chrome DevTools MCP still running (re-check Dev URL)
4. Continue from first `IN_PROGRESS` or `TODO` row
5. Update this file after each test

## Screenshots

Saved to: `{plan_dir}/e2e-screenshots/`
Naming: `{test-id}-{state}.png` (e.g. `D18-populated.png`)
```

**Update cadence:** after each test row — don't batch. If context hits ~70%, stop testing, commit progress, tell user to `/clear` and resume next session pointing at this file.

**Memory save trigger:** only save to `MEMORY.md` when finding a *non-obvious* pattern (new iframe quirk, new dialog cascade, new auth workaround) — not per-test results.
