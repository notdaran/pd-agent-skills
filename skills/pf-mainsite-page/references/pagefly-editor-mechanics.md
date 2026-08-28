# PageFly global sections — mechanics

Verified against the PageFly product repo, 2026-08-25. Re-verify if behaviour looks different;
cite the code path when you update this file.

## What a global section is

A **reference by id**, not a copy of content.

- The element stores only `{ id }` (`web/core/src/elements/base/GlobalSection/index.tsx`).
- On the storefront it emits Liquid: `{% render 'pf-<sectionId>' %}`.
- Publishing a section writes its compiled HTML to **one file**: `snippets/pf-<sectionId>.liquid`
  (`web/server/src/data/utils/shopify-page/section.ts`).

Consequence: every page using that section points at the same snippet file. Edit the section,
every page changes **immediately, without republishing those pages.**

In-app confirmation string: *"You can edit this section any time. The changes will be
automatically applied to all pages where the section is used."*

## Publish gates everything

Propagation only happens once the **section itself is published**. Saving a draft does not
propagate. An unpublished section shows as **"Removed section"** on host pages.

In-app string on first save: *"This section will be saved as unpublished. Please publish this
section to start using it on other pages."*

## Detach: "Unsync section"

The escape hatch that makes layout-reuse safe. Found in the global section's inspector.

Exact labels:
- Button: **"Unsync section"**
- Confirm title: **"Unsync Section?"**
- Confirm body: *"Once unsynced, all changes made to the original section won't affect this
  section and vice versa."*
- Description: *"To edit this section only on this page, unsync it."*

It converts that page's reference into an independent local copy of the same layout and
content, breaking the link both ways, on that page only.

### Two traps

1. **Version mismatch locks it.** If the section and the page were built in different editor
   versions (Row/Col vs Flex/Gen2), Unsync is disabled. Tooltip: *"This section cannot be
   unsynced because it was created in a different editor version."* Build everything in one
   version or you will be stuck with no way to detach.
2. **`AppBlock` elements are stripped on unsync.** Third-party app embeds inside a global
   section do not survive the conversion. Keep them out of reusable sections.

## Insert: the tab decides reference vs copy

There is no "insert as copy" toggle. The choice is made by which tab you pick in **Add section**:

| Tab | What gets inserted |
|---|---|
| **Saved sections** | live `GlobalSection` reference |
| **Templates** | independent copy (premade PageFly templates) |

## What can become a global section

Only a root **`Section`** or **`FlexSection`** exposes the **"Save section"** toolbar action.
Inside it, any nested elements are allowed.

**"Save section" creates a new record and leaves the current page untouched** — the page keeps
its own local copy. So the page you harvested from does not become dependent on the new section.

## Slots

One slot per **published** section record, regardless of how many pages reference it.
Unpublished drafts do not consume a slot. Counting logic: published `ShopifyPage` records of
`type: 'section'`.

## Other ways to get an independent copy

- **Duplicate** in the sections list — new record, new id, unpublished by default.
- **Export → Import** — always creates a new independent record, works across shops. Importing a
  page that references global sections belonging to another shop auto-flattens them into normal
  sections.

## Custom.HTML element

- The HTML element **collapses `<script>` to a single line**. Anything relying on `//` comments
  or omitted semicolons dies silently. Prefer no script at all. JSON-LD is fine (valid JSON,
  no comments).
- A pasted fragment gets none of the page's CSS. Ship it self-contained with a scoped class
  prefix and its own `<style>`.

- **The wrapping `FlexSection` is already the section shell. The fragment must not be a second
  one.** A `Custom.HTML` element is dropped inside a normal section, and that section carries the
  site's vertical rhythm, its content width and its background. Anything the fragment sets on top
  of that **stacks**, and the block ends up out of step with every other block on the page.
  Measured on `pagefly.io`, 2026-08-27:

  | The wrapping section already gives you | Value |
  |---|---|
  | Vertical padding | `128px` top and bottom |
  | Content width of its inner row | `1200px`, no inner gutter |
  | Background on a dark page | `#030712` - the same value a dark fragment would set |

  So the fragment's own outer rules are all redundant, and each one is a visible defect:

  ```css
  /* wrong - stacks on the section, block is 104px taller per edge and 32px narrower per side */
  .x   { background:#030712; padding:104px 0 }
  .x__w{ max-width:1216px; margin:0 auto; padding:0 32px }

  /* right - the section owns the box, the fragment owns only its contents */
  .x   { color:rgba(255,255,255,.64); font:16px/24px "Instrument Sans",sans-serif }
  .x__w{ margin:0 auto }
  ```

  **Check it, don't trust it.** On the preview URL, compare your block's edges with the content row
  of the section above or below - they must be identical:

  ```js
  const box = n => { const b = n.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] }
  box(document.querySelector('.x__tbl'))        // your fragment's content
  box(document.querySelector('SELECTOR_OF_A_NEIGHBOURING_SECTION_ROW'))
  ```

- **No `rem` units.** The theme sets `html{font-size:14px}`, not the browser default 16px. Every
  `rem` in a fragment renders at 87.5% of the size it was designed at, and headings quietly come
  out too small. Use `px` throughout, including inside `clamp()`.

- **No HTML comments.** The fragment is served verbatim on a public page, so an internal note in
  `<!-- -->` ships to anyone reading source, and to the LLM crawlers a page like this is written
  for. Keep the notes in `build-order-*.md`, keep the file itself pure payload.
- **The theme's bare-tag CSS still applies to it.** Scoping protects your classes; it does not
  protect the raw tags you emit. pagefly.io serves an inline `<style>` on the storefront (blog
  article CSS, shipped unscoped) that hits every `<table>` on the site:

  ```css
  table       { width:100%;border-collapse:collapse;border-spacing:0 }
  table thead { background:#f4f3f2 }
  th          { font-weight:700 }
  th, td      { text-align:left;padding:.5rem;border:1px solid #d9d9d9 }
  ```

  On a dark block this is maximally destructive: `table thead` paints the header row near-white
  so white header text vanishes, and `th, td` draws column dividers you never asked for.

  Tables are the worst case but not the only one - the same sweep also returns `a` (color),
  `img` (`max-width`), `blockquote` (left rule + margin), and `input, select, textarea`
  (border, font). Rule 0 applies to this list too: re-measure it, do not trust it.

- **Reset block for a dark table**, inside your own scope:

  ```css
  .x table    { border:0;background:transparent }
  .x thead    { background:transparent }
  .x th,.x td { border:0;border-bottom:1px solid rgba(255,255,255,.14);background:transparent }
  ```

  Whole property, not one side: `border:0` before `border-bottom`, or the theme keeps the other
  three edges. And on the tag the theme targets: `thead`, not just `th`.

- **Pre-flight** to get the current list instead of trusting the snapshot above. Fetch any live
  page or preview URL of the store, pull its inline `<style>` blocks, keep the rules whose
  selector is nothing but bare tags. Run it from column 0 - the heredoc body must not be indented:

```bash
curl -sL "<live page or /apps/pagefly/preview?id=...>" -o /tmp/p.html
python3 - <<'PF'
import re
d = open('/tmp/p.html', encoding='utf-8', errors='replace').read()
for block in re.findall(r'<style[^>]*>(.*?)</style>', d, re.S):
    for sel, body in re.findall(r'([^{}]{0,160}?)\{([^}]{0,300})\}', block):
        sel = sel.strip().split('\n')[-1]
        if re.fullmatch(r'[a-z][a-z0-9]*([\s,]+[a-z][a-z0-9]*)*', sel):
            print(f'{sel:<24} {body[:140]}')
PF
```

  Ignore `to` / `from` rows in the output - those are `@keyframes` steps, not element selectors.

- **The editor canvas is not the storefront.** It does not load these theme stylesheets, so a
  collision is invisible in the editor and shows up only in preview or live. Same shape as the
  `<script>` trap above: the canvas is a false negative for anything in `Custom.HTML`.
