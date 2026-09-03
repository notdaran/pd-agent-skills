# Driving the PageFly editor with a browser agent

Everything here was measured in real build sessions — 2026-08-25 (`/pages/page-checkup`) and
2026-08-27 (`/pages/aeo`, `/pages/heatmap`) — not inferred. Where a claim has a number attached,
that number came from one of those sessions. The 2026-08-27 pass overturned three claims made
here after the first: `evaluate_script` reach, the `Delete` key, and the cost of emptying a
section. Corrections are marked inline; do not restore the older wording.

## Tool: chrome-devtools MCP, always

`pagefly-browser-tester` already states the rule. This file records **why**, because the reason
written there was wrong and a wrong reason invites someone to retry the mistake.

- The real reason is **speed and click reliability**, not frame access.
- Playwright MCP running through the browser extension relay (`@playwright/mcp --extension`):
  every native `click` timed out at 5s on the "wait for element to be stable" check, and a single
  DOM read took **2 to 6 minutes**. The same work in chrome-devtools takes seconds.
- The claim "Playwright cannot reach the app iframe because it is cross-origin" is **false**.
  Playwright reached all three frames fine via `frameLocator` / `internal:control=enter-frame`.
  It was just unusably slow.

**Detection rule.** Two symptoms together — every click timing out on stability, and DOM reads
measured in minutes — mean the relay is the bottleneck. Switch tools; do not try to fix it.

**One editor at a time.** Two browsers with the same page open is two divergent editor states
racing to overwrite each other. It happened in this session.

## Reading the page

- `take_snapshot` **crosses all three iframes** (admin → app → sandbox) and returns clickable
  uids. This is what makes the whole workflow possible.
- **`evaluate_script` DOES reach the editor DOM** — the note here that it cannot was wrong,
  corrected 2026-08-27. Pass any uid from a snapshot as `args`, and the function receives that
  live element: `(el) => el.ownerDocument.getElementById('page-outline-drawer-button').click()`.
  One anchor uid inside the editor frame unlocks the whole document, and the sandbox iframe is
  same-origin from there (`iframe.contentDocument`), so the rendered page is readable too.
  This is the single biggest speed-up available: whole-page reads and multi-string writes happen
  in one call each instead of four calls per string.
- **`evaluate_script` also clicks what MCP `click` refuses.** When `click` returns "the element
  did not become interactive within the configured timeout" — the editor-version modal does this —
  pass the uid and call `el.click()`. Note the reverse trap: a Radix/Polaris trigger that listens
  on `pointerdown` will not open from a synthetic `.click()`; those need the real MCP `click`.
- **Stable element ids inside the editor**, better than hunting uids:
  `page-outline-drawer-button`, `element-list-drawer-button`, `page-settings-drawer-button`,
  `custom-code-drawer-button`, `version-history-drawer-button`, `page-outline-drawer--add-section`,
  `section-template-drawer--search`, `element-list-drawer--search`, `scroll-wrapper-outline`.
  Outline rows are flat siblings under `#scroll-wrapper-outline` carrying `.container-element`
  with `data-pf-id`, `data-pf-type` and `data-level` — address rows by those, never by label.
- **Always `take_snapshot(filePath=...)` and grep the file.** Snapshots are thousands of lines.
  Returning them inline is the single largest waste of context in this workflow.
- **The Page content outline only lists expanded branches.** Counting children there produces
  false "this section is empty" results. Verify emptiness against the sandbox DOM, or expand the
  node first. This produced a wrong "empty after 0" in the session.

## Editing text — the reliable loop

Do not double-click to edit on canvas. Use the inspector's content box. The same loop covers
**Heading**, **Paragraph** and **Button** — the box is labelled `Heading text` / `Paragraph text` /
`Button text` but behaves identically.

**Do it inside `evaluate_script`, batched** (measured 2026-08-27: ~45 strings in six calls):

1. Read the whole page first, in one call, from the sandbox iframe:
   `iframe.contentDocument.querySelectorAll('[data-pf-id]')` → id, `data-pf-type`, text,
   and `offsetParent===null` for hidden. Save it with the tool's `filePath` and diff it against
   the spec offline. This replaces the entire "find the old string" phase.
2. Per string: find the outline row by `data-pf-id` prefix, click its `.main-element`, wait ~1.7s.
   Clicking the node in the **sandbox** works too and is the only way to reach an element whose
   outline branch is collapsed - dispatch `mousedown`/`mouseup`/`click` on it with real coordinates.
3. **Gate on the `General` tab before every write.** The content box only exists on `General`; the
   inspector reverts to `Styling` when the selected element changes type. Skipping this check is a
   **silent no-op**: `execCommand` returns `true`, nothing changes, and a ten-string batch reports
   success having written nothing. This happened once and cost a full re-run.

   ```js
   const tab = [...d.querySelectorAll('[role=tab]')].find(t => t.textContent.trim() === 'General')
   if (tab && tab.getAttribute('aria-selected') !== 'true') { tab.click(); await sleep(900) }
   ```
4. The inspector's content box is the `[contenteditable="true"]` whose class contains `w-100`.
   Select all of it with a Range, then `document.execCommand('insertText', false, newText)`.
5. Verify by re-reading the sandbox node's `textContent` (`innerText` is empty for anything inside
   a collapsed accordion — that is not a failed write). **Re-query the node from the sandbox
   document first.** A write re-renders the subtree, so the reference you held is detached and
   still carries the old text: verifying through it reports "unchanged" for a write that landed.
   Both false directions are now on record - step 3 gives a false pass, this gives a false fail.

The snapshot-and-grep loop below still works but costs ~4 tool calls per string.

**Accordion headers are not in the outline.** Only `Accordion3.Flex.Content` and its `Paragraph`
appear. To edit a question, click the `Accordion3.Header` element **twice** in the sandbox — the
first click selects the Accordions element, the second drills in and the content box appears.

**Inline links inside rich text**: select the phrase with a Range and
`execCommand('createLink', false, '/pages/foo')`. It survives the save. Link colour is separate —
a link on a dark section renders near-black; fix it with `execCommand('styleWithCSS', false, true)`
then `execCommand('foreColor', false, '#FFFFFF')` over the same range.

### Two traps

- **`fill` appends to a non-empty field, and `fill("")` does nothing.** To replace: `click` the
  field, `press_key("Meta+a")`, then `fill`. Skipping this silently produced one URL concatenated
  onto the tail of another in a URL field, with no error.
- **App Bridge steals keyboard shortcuts.** `Escape` and `Meta+S` open Shopify's
  "Discard all unsaved changes" dialog. Use buttons for save and cancel, never shortcuts.

### Link fields

The URL picker has a protocol dropdown (`https://` / `http://` / `/` / `This page`) separate from
the text box. For a relative link set the dropdown to `/` and the box to `pages/foo` — do not type
the leading slash into the box. Confirm with the picker's own **Select** button.

**Finding that button is the hard part, and getting it wrong loses the edit silently.** Measured
2026-09-03:

- **`Select` sits at the very bottom of the drawer, under the collections list** — far below the URL
  box, with a `Link to` picker and a long scrolling list of collections between them. It reads as
  the collections picker's button. It is not; it commits the whole drawer.
- **`Enter` in the URL box cancels.** The drawer closes, the Action panel still shows the old URL,
  and nothing warns you.
- **Typing the value is not committing it.** The box keeps the new value across close and reopen,
  which looks like it saved. The element's `data.href` is unchanged until `Select` is clicked.
- **`Select` can read as `disabled` on the first pass** and enable after the drawer is reopened.
  If it is disabled, close and reopen the picker rather than fighting the field.
- **Verify against the API, never the panel.** Read `data.href` on the element from
  `/api/page/<id>` after saving. The inspector's `URL:` line is not reliably reactive - it showed
  the stale URL for several minutes across reopens while the edit was genuinely uncommitted, so it
  cannot distinguish "not applied" from "applied, not repainted".

## Creating the page

Enter from the Pages list, never by pasting an editor URL (anti-pattern #6).

1. Pages list → **Create blank page** → pick the page type (`Regular` for a marketing page).
2. **Editor version prompt appears. This is the gate.** Pick the version that matches the
   harvested sections — see "Gates" below. There is no way back after this.
3. In the editor, open the **page settings** drawer (left rail) and set **Page title** and
   **Page URL**. Both are plain inputs; `fill` works directly.
4. Add sections from the outline's **Add section** link → **Saved sections** tab → **Select** on
   the card. The Templates tab gives a detached copy instead; the tab is the only thing that
   decides reference vs copy.

Sections append at the end. To get a section into the middle, put it in the right order as you go,
or duplicate a neighbour (below) rather than trying to reorder afterwards - outline drag does not
work under automation.

## Unsyncing

Select the section in the outline, click **Unsync section** in the inspector, then **Unsync** in
the confirmation dialog. Give the dialog ~1.5s to render. After a batch, re-read every section's
type: a `GlobalSection` that unsynced becomes a `FlexSection`.

**Rename after unsync, never before.** The outline label of a still-synced section belongs to the
global section, so unsyncing throws the new name away and the row reverts to "Flex section". This
already shipped on `/pages/aeo`, whose first section is unnamed for exactly this reason.

## Still unsolved

- **Replacing an image.** Not attempted end to end in the session that produced this file. The
  harvested illustrations stayed in place. If you solve it, write the steps here.

## What a browser agent cannot do

**Inserting a new element into the canvas.** Clicking a catalog entry "picks it up" and a variant
tile appears beside the Elements drawer. That tile **does not follow the cursor**, and it
**detaches from the DOM the moment any tool hovers it**. Six approaches were tried across both
tools and none inserted anything:

| Attempt | Result |
|---|---|
| Playwright: pick up, multi-step mouse drag, release | nothing inserted |
| Playwright: pick up, click the drop zone | cancels the pick-up |
| chrome-devtools `drag` from the catalog row | reports success, nothing inserted |
| chrome-devtools `drag` from the variant tile | `Node is detached from document` |
| chrome-devtools: pick up, hover, click the drop zone | cancels the pick-up |
| Element copy then paste | `Meta+C`/`Meta+V` are copy/paste **style**, not element |

**Plan around it, do not fight it.** See the pipeline below: collect every hand-drag into one
batch and hand it to a person in the middle of the build, not at the end.

## What does work

- **`Meta+D` duplicates in place**, immediately after the original. This is the way to create a
  new section at a chosen position without any drag: duplicate the neighbouring section, then
  empty it. Works both as a real `press_key` and as a synthetic `keydown` with `metaKey:true`.
  Two uses beyond a host for a hand-dragged element: duplicate-then-empty gives a `Custom.HTML`
  host, and duplicate-then-keep-one-`Paragraph` gives a text strip with **no hand-drag at all**.

  **Third use, measured 2026-09-03: duplicate-then-trim builds a whole new content block.** A
  four-tile block was made from the page's five-tile block in one `Meta+D` plus six deletes (the
  spare tile, the button row, four images), then ten string writes. No insert, no unsync, no page
  CSS paste, no hand-drag. Where the block list needs a layout the page already has *at a different
  tile count*, this is the cheapest path by a wide margin.

  Two things it costs, both easy to miss: the duplicate lands **immediately after its donor**, so
  the two sit adjacent and look identical until you re-theme it (anti-pattern #24), and the
  children keep the donor's ids only in your notes - **re-read the new section's subtree from the
  sandbox to get the new ids** before writing to it.
- **The `Delete` key does work** — measured 2026-08-27, contradicting the earlier note here.
  Select the element (click its outline row's `.main-element`), then dispatch
  `KeyboardEvent('keydown',{key:'Delete',keyCode:46,bubbles:true})` on `document`. Deleting a
  container removes its whole subtree, so delete at the container level: emptying a duplicated
  bento section took 6 deletes, not 30.
- **The outline row's `...` menu is out of reach under automation.** It renders only while a real
  pointer sits over the right-hand end of the row, and no synthetic `mouseover`, MCP `hover`, or
  `.main-element` click reproduces that. Consequence: **section renaming cannot be automated** —
  the outline keeps showing "Flex section". Target rows by `data-pf-id` instead of by name.
- **Emptying a duplicated section** is one `Delete` per direct child. A harvested bento section
  has 3-6 direct children, so it is seconds, not minutes.

## Editing a `Custom.HTML` element: it is Monaco

Select the element, `General` tab, **Open code editor**. The editor is **Monaco**, and the a11y
node is a bare `native-edit-context` div inside `.overflow-guard` — typing into it is slow and
lossy for a multi-KB fragment. Drive the model directly instead, then click **Done**:

```js
const m = w.monaco.editor.getModels()[0]
m.setValue(newSource)                  // or m.setValue(patch(m.getValue()))
```

`Done` closes the modal; the page still needs a normal **Save** afterwards. Reading
`m.getValue()` first is also the correct way to honour anti-pattern #21 — it is the live element's
source, which the file in `plans/` is not.

## Duplicating a page

From the Pages list: **tick the row's checkbox → `More actions` → `Duplicate`**. The copy appears
immediately as `<name> - copy`, unpublished.

The two icon buttons on each row are **Analytics** and **Preview** — neither is a `...` menu, and
clicking the first navigates away from the list. There is no per-row duplicate action.

Read the new page's id from `/api/pages?limit=5&type=page` rather than guessing it, then run the
Step 3.6 gate checks against `/api/page/<newId>` before touching anything: `editorVersion`,
`customCSS` length, and every section's `type` (a `GlobalSection` that survived as a reference is
still `GlobalSection`; content sections that were already local read `FlexSection`, which is what
lets you skip unsync entirely).

## Saving

- The Save button lives in Shopify's App Bridge bar in the **top frame**, reachable by uid. The
  in-app `#pf-button-save-page` is a hidden proxy: clicking it opens the confirm popover, and on
  its own it does not always persist.
- A "Save page" popover appears with its own **Save**; tick "Don't remind me again" once.
- **Verify the save against the API, not the UI**: `/api/pages?limit=1&type=page` and read
  `updatedAt`. Fetch it from inside the app iframe (see `measure-a-page.md` §6).
- Save only. **Publish is a human decision.**

## Gates that must run before anything else

1. **Editor version.** Unsync is disabled across Legacy/Gen2. Read `editorVersion` for the source
   sections via `/api/pages?type=section` and create the page in the matching editor. Getting this
   wrong invalidates the entire build with no way back.
2. **Re-verify unsync.** One of four unsyncs silently rolled back between the batch that performed
   it and the next save. Re-read every section's type before saving.

## Inherited content in a harvested section

- **Hidden device variants.** The harvested hero carried four buttons, two hidden on desktop.
  Editing only the visible ones leaves stale copy on mobile. Check the outline for siblings with
  the crossed-eye icon.
- **Content that does not belong.** The same sections carried a logo strip and three
  "Brands using PageFly" lines. Budget deletion time, and list them in the spec (below).

## What the page spec must contain

Layout plus final copy is **not enough** to make the build mechanical. Add a third part:

- **old string → new string**, one row per element
- **delete these** — the inherited leftovers, named
- **needs a new element** — flagged, because that is the expensive part that a person must drag

Without this the agent re-derives the mapping mid-build, which is where the time goes.

## If another editor SOP already exists in your setup

Two documents describing one editor is anti-pattern #13. When an older operating manual for the
same editor exists, make the boundary explicit instead of merging them.

**This file is authoritative for the build pipeline.** It is the newer measurement and it assumes
chrome-devtools MCP. Anything predating that tool change is superseded, not an alternative:

| Older SOPs tend to say | Why not |
|---|---|
| The accessibility tree is too limited, use pixel-level clicks | No longer true. `take_snapshot` returns a full a11y tree across all three iframes with usable uids. Pixel coordinates are brittle and unnecessary. |
| Edit text via clipboard + triple-click on canvas | The inspector content box is more reliable and needs no clipboard. |
| A table of hardcoded pixel coordinates | Viewport-dependent, and superseded by uids. |
| "Save flow: click Save, then Publish" | That use case is publishing an edit. This pipeline **saves only**; publishing is a human decision. |

**What such a document does keep owning:** the content-layer rules this skill deliberately does not
have - claim guardrails, the source-of-truth rule for product claims, the content audit checklist,
the brand-voice guide. Take those from there; this file never overrides them.

**One fact worth carrying over either way:** clicking a row in the left outline can select the
wrong element.
