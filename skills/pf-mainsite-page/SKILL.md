---
name: pf-mainsite-page
description: |
  Use when building or rebuilding a marketing page on pagefly.io (a Shopify store,
  separate from the app) inside the PageFly editor - feature landing pages, GAP pages,
  spoke pages. Carries the named global-section library the store already has, so a new
  page is assembled from existing layouts (insert + unsync + rewrite) rather than
  measured or hand-written. Also covers claim verification against code, the one case
  that still needs `Custom.HTML`, and keeping the new page off the orphan list.
  Triggers on: "dung trang tren pagefly.io", "build landing page cho feature X",
  "trang GAP", "mainsite page", "tao trang /pages/... tren mainsite".
  NOT for: UI inside the Shopify embedded admin app (different surface, different
  component system), marketing images (illustra / feature-demo), or content claims
  and SEO/AEO decisions (those belong to your content layer).
---

# Building a page on pagefly.io

**`plans/` in this file means your per-build working directory** - the folder holding this page's
spec, copy and build-order files. Substitute whatever your setup calls it.

## Rule 0 — this file contains no inventory

Any list of sections, pages, colors or counts written here is **a snapshot, not a fact**.
The store changes. Re-measure every time. A skill that ships an inventory becomes a liar.

The only durable content here is **method** and **platform mechanics**.

**One deliberate exception: `references/section-library.md`.** The team built a named library of
global sections covering the whole feature-page skeleton, and those *names* are stable by design -
re-deriving "which layouts exist" by measuring the homepage on every build is wasted work. That
file carries the names and layouts as durable; it marks Status and Used-on as things to re-read.
Read it before Step 1. Nothing else in this skill may carry an inventory.

---

## The pipeline

The steps below are the method. This is the order they run in, and where the one unavoidable
human step sits.

| # | Stage | Who |
|---|---|---|
| 1 | **Content passes your content layer** — copy, tone, ICP, SEO/AEO, claim policy | content |
| 2 | **Write the block list from the content**, one line per block naming the question it answers | you |
| 3 | **Choose how each block is made**: existing section → native element → `Custom.HTML`, in that order | you |
| 4 | **Map the block list onto `references/section-library.md`.** Measure or harvest only what it cannot cover (Steps 1–2 below) | you |
| 5 | **Lock the page spec**: block list + copy + per-element mapping (Step 3.5 below) | you |
| 6 | **Build the skeleton**: create the page, unsync, order the sections | agent |
| 7 | **One handover** — every element that must be dragged in by hand, in a single batch | person |
| 8 | **Fill everything**: text, HTML, links, delete the inherited leftovers | agent |
| 9 | **Save. Never publish.** | agent |
| 10 | **Ship inbound links with the page** and lock the baseline (Step 6 below) | you |
| — | **Every progress hand-back goes to the operator as an Artifact** (Step 7 below), at each stage above, not only at the end | you |

Three things decide whether this is fast or slow:

- **Step 3 order is not a preference.** Reaching for `Custom.HTML` before checking the element
  vocabulary is anti-pattern #4. It also buys a manual step, because new elements cannot be
  created by a browser agent — see `references/automating-the-editor.md`.
- **Step 5 is the whole game.** Layout plus copy is not enough; without the per-element mapping
  the agent re-derives it mid-build. Anti-pattern #19.
- **Step 7 sits in the middle, not at the end.** Leaving the drags until last means two handovers,
  because the agent still has to fill the content of whatever was dragged in. Anti-pattern #18.

Before Step 6 runs, two gates must pass: **editor version matches the harvested sections**
(Unsync is locked across Legacy/Gen2), and **every unsync is re-verified** before the first save.
Both are in `references/automating-the-editor.md`.

---

## Step 1 — Open the library first. Measure only what the library cannot answer.

**Start at `references/section-library.md`, not at a browser.** A harvested section already carries
the brand's fonts, colours, radii and section padding, so inserting one is self-correcting. For a
normal feature page there is nothing to measure and nothing to harvest: pick from the table,
insert, unsync, rewrite.

Measuring the live site is for exactly two cases:

1. **A `Custom.HTML` block.** It is hand-written and inherits nothing, so it needs the real tokens
   or it lands looking foreign. Get them with `references/measure-a-page.md` §2.
2. **Any `Custom.HTML` containing a bare tag the theme styles** - a table above all. Pre-flight the
   theme's bare-tag rules (`references/pagefly-editor-mechanics.md`) and write the reset.

Two facts to carry into that block, both wrong before:
- Body font and heading font are **different families**.
- Some existing pages are nothing but two `Custom.HTML` blobs. Those are the anti-pattern, not the
  reference. Never read tokens off `/pages/cro` or `/pages/ai-page-builder`.

Everything else the old Step 1 measured - which pages are native builds, what row rhythm each
section has - existed to *find* a layout. The library names layouts directly, so that search is
over. Run it only when Step 2 says you actually have to harvest.

## Step 2 — Harvest only what the library is missing

**Check `references/section-library.md` against the block list first.** The expected outcome is
that every block maps to a section already in it, and this step is skipped entirely. Harvesting is
the exception, not the routine.

When a block genuinely has no match, the layout still almost certainly exists somewhere on the
site - find it, save it, name it, and **add it to `section-library.md` with the date**. A harvest
that does not get written back means the next build repeats the search.

**Decide the page's block list from the content first, then harvest that many.**
Harvesting first turns the saved-section list into a list of things that must be used up:
the page grows a block per available layout, and content gets stretched or invented to fill
each one. The library is a menu, not a checklist. A harvested section that ends up unused
costs nothing - leave it unpublished for the next page.

**Measure geometry to identify a layout. Never infer layout from element counts.**
See `references/anti-patterns.md` - this exact mistake has been made repeatedly.

Practical order:
1. Element census per section → tells you *what is in* a section.
2. Row-rhythm measurement (card widths grouped by y) → tells you *what it looks like*.
3. Only then decide what to harvest.

Harvest by selecting the root `Section` / `FlexSection` and using **"Save section"**.
It creates a new record and does **not** modify the page you took it from.

**Name it immediately.** Sections on this store are largely unnamed, so the editor outline
shows the same default label for all of them. An unnamed harvest adds to that problem.

## Step 3 — Verify every claim against code, not against docs

The page will make factual claims about a PageFly feature. Every number, capability
and status must trace to source.

- `web/shared/constants/cro-modules.ts` in the product repo is the source of truth
  for feature availability (`status`, `minTier`, `enabledByFlag`).
- **Feature flags: the seeded value is not the live value.** Read the live rollout, not `seed.ts`.
- **A code comment is a snapshot, not a rule.** Check when it was written and what shipped after.
- A claim that a reviewer can disprove is a Shopify policy problem, not a copy problem.

Content rules, tone of voice, ICP and the SEO/LLM-citation layers belong to the **content layer**,
not to this skill. Get them from there.

## Step 3.4 — Name the feature in the headings

A feature page whose H1 and H2s never say the feature's name is not a feature page. It teaches the
reader a *concept* and leaves them unable to ask for the *product*.

**Pull the name from `cro-modules.ts` → `displayName`, resolved through `en.json`.** That is the
string on the pricing table, which is what a merchant sees when choosing a plan. A module often
also has a second, different label in the editor drawer (`tools-config.ts`); both are real, and the
pricing-table name is the one a marketing page uses.

- H1 leads with the product name, then the outcome.
- Every H2 that refers to the feature calls it by name, not by a descriptive stand-in
  ("the AI-readiness check", "the heatmaps").
- Where the in-app **screen** has its own name, put it in the how-to steps so the page teaches the
  real navigation path.

**This is not keyword stuffing, and it is not a substitute for it either.** The target keyword
belongs in the title tag and the lead paragraph; repeating it in every H2 reads as robotic and was
corrected on this store. The product name and the keyword are two different jobs.

Weighs heaviest on a page whose distribution is LLM citation rather than search: an engine can only
cite the name it read.

## Step 3.45 — A harvested section carries an implied copy length. Write to it.

The layout was designed around the words that were in it. Swap in copy of a different size and the
block stops looking like the site, even though every token is correct.

**Before writing a block's copy, read the length of the string it replaces.** The per-element
mapping (Step 3.5) already puts old and new side by side - use that column as a budget, not just
as a lookup.

**The per-slot word budget lives in `references/section-library.md`.** Read it before writing, not
after the block looks wrong. Range at time of writing: a hero lead holds 19 words, a section lead
11-20, a bento tile 6-18.

It has been got wrong twice on this store: the Page Checkup hero at 42 words and the AEO hero at
54, both against a 19-word slot, both wrapping to four lines under the H1. The second time, only
the hero was corrected and every other section lead stayed 2-4x over - so fix the whole page in one
pass, not the slot that was pointed at.

**Do not solve it by dropping required disclosure.** A `beta` label and a `minTier` line are
mandatory (Step 3, and your content layer's claim rules) - move them to the stat row and the line
under the CTA, which
is where the template already has room, rather than cutting them from the page.

**The hero lead is not the LLM-citation TLDR, and neither is any other section lead.** Every lead
inside a harvested section is on a budget. The 40-60 word quotable paragraph goes in the FAQ body
or the `Custom.HTML` block - the only two slots on the page with no layout constraint.

**A "closing fact" per section has no slot.** Wanting one means a hand-dragged element per section.
Fold the fact into the FAQ or the HTML block.

## Step 3.5 — Lock a page spec a machine can build from

One file. Three parts, not two:

1. **Block list** — what each block is, and which harvested section or element makes it.
2. **Copy** — the final strings.
3. **Per-element mapping** — for every string: the *existing* text in the harvested section it
   replaces. Plus two lists: **delete these** (the leftovers the harvest brings along - logo
   strips, "Brands using X", stray CTAs), and **needs a new element** (the blocks that require an
   element that does not exist yet).

Part 3 is what turns the build into mechanical work, and it is the part that gets skipped.
The "needs a new element" list is also the Step 7 handover list, so it has to exist before
building starts, not after.

## Step 4 — Assemble with global sections

Read `references/pagefly-editor-mechanics.md` for how global sections behave, and
`references/automating-the-editor.md` before driving the editor with a browser agent.
The load-bearing facts:

- A global section is a **live reference**. Editing a published one changes every page using it.
- **"Unsync section"** converts one page's instance into an independent copy.
- Insert from the **"Saved sections"** tab for a reference; **"Templates"** gives a detached copy.
- A section must be **published** or host pages show "Removed section".

Working pattern for a family of similar pages:
1. Save each reusable layout as a global section, publish it.
2. Insert it on each page, **unsync**, then edit content.
3. Keep **synced** only the blocks whose content is genuinely identical everywhere
   (site-wide CTA, cross-link block).

Reuse a section on the same page more than once? Unsync each instance, or they all show
the same content.

## Step 5 — Limit custom HTML, do not ban it

Prefer native elements. Reach for `Custom.HTML` only when no layout on the site expresses
what you need - a real data table is the usual case.

CSS leaks in **both** directions, and a scoped class prefix only stops one of them:

- **Page CSS does not reach your fragment.** Hence self-contained: own class prefix, own
  `<style>`. A fragment that relied on page-level CSS lands as an unstyled mess.
- **Theme CSS still reaches your bare tags.** The storefront styles raw element selectors
  (`table thead`, `th, td`, `ul`, `blockquote`). No class prefix protects a `<td>` from a
  rule that targets `td`. Every bare tag you emit is exposed - and the usual `Custom.HTML`
  payload, a table, is exactly what the theme styles hardest.

When you do:
- Write it **self-contained**: its own scoped class prefix and its own `<style>`.
- **Give it no outer box of its own: no vertical padding, no side gutter, no max-width, no
  background.** The `FlexSection` that holds the element is already the site's section shell and
  supplies all four. A fragment that sets its own lands taller and narrower than every other block
  on the page. Measure it, don't assume - `references/pagefly-editor-mechanics.md` has the
  three-line check and the numbers measured on this store.
- **Reset every bare tag you use**, inside your own scope, before styling it. Reset the whole
  property, not one side: `border:0` then `border-bottom:...`, because the theme sets all four.
  Reset on the tag the theme targets, not the one you had in mind - a background on `th` does
  not undo a background on `thead`.
- **Pre-flight the theme's bare-tag rules** instead of guessing which exist. Command and the
  current pagefly.io list: `references/pagefly-editor-mechanics.md`.
- **No `<script>`.** PageFly's HTML element collapses scripts to one line, which silently
  breaks anything relying on `//` comments or omitted semicolons.
- **No HTML comments either.** The fragment is served verbatim on a public page, so a build note
  in `<!-- -->` ships to anyone reading source. Notes go in `build-order-*.md`; the `.html` file
  stays pure payload.
- Wide content gets its own `overflow-x: auto` container.
- **No `rem` units.** The theme sets `html{font-size:14px}`, so every `rem` in a fragment silently
  renders at 87.5% of what it was designed at. Use `px`.
- **Verify in preview, never on the canvas.** The editor canvas does not load the theme's
  stylesheets, so a collision looks fine there and appears only on the live page. Anti-pattern #20.
- **Editing a block that already exists? Copy its code out of the editor first.** The file in
  `plans/` is a mock, not the element. Anti-pattern #21.

## Step 6 — A published page with no inbound links does not exist

This is the failure mode that has already happened on this store: pages shipped with good
content got single-digit weekly views and zero conversions because nothing linked to them.

**Inbound means links on *other* pages pointing *at* the new page.** A cross-link block on the
new page pointing out at siblings is a different thing: it helps those siblings, and does
nothing at all for the orphan problem of the page being built. Never let an outbound block
be counted as the fix - the two have already been confused once.

Before calling a page done:
- Add links from related existing pages (they often already mention the feature in plain text).
- Add the nav entry.
- Lock a baseline on the **source** pages, not just the new one.
- Read results D+7 / D+14 **from the day the links went live**, not from the publish date.

---

## Step 7 — Hand progress back as an Artifact, not a file

**The operator does not read markdown or HTML.** Stated directly, 2026-08-27. A status written to
`plans/*.md` and summarised in chat is a hand-back the operator cannot actually check, which means
nobody reviews the copy before it is built.

**Default: every hand-back to the operator is an Artifact.** Not a file path, not a chat table.
That covers progress and pipeline position, the page spec in reviewable form, the claim table,
the decisions log, blockers, and anything meant for the operator or another human. Exception: they
explicitly asks for a file.

The single most valuable thing to put in it is a **rendered mock of the page** - the real final
copy laid out block by block in the measured tokens (dark ground, Poppins, Instrument Sans), each
block labelled with which harvested section makes it and whether it unsyncs. That is the only form
in which the operator can review copy before the build. A bullet list of headings is not it.

### What stays a file, and why

| Stays a file | Why |
|---|---|
| `custom-html-*.html` | It is **pasted verbatim** into the editor's code panel. It has to exist as raw source with nothing wrapping it - no code fence, no HTML-entity round-trip through a rendered page. This is the one deliverable whose file *is* the payload. |
| `spec-*.md`, `copy-*.md`, `build-order-*.md` | Build input the agent greps mid-build, and the state a **future session** resumes from. An Artifact URL is not what the next session opens; `plans/` is. |

So the split is: **machine-consumed input stays in `plans/`; human-consumed output is an Artifact.**
Do not also write a `plan.md` status file - that is the file the Artifact replaces.

### Rules for the artifact itself

- Framing, labels and explanation in whatever language the operator reads; **the page copy being
  previewed stays in the language that ships**. Do not translate the preview.
- Explain in operator terms, never in build terms. "The layout you inserted is not switched on yet,
  so the page shows *Removed section*" lands; "section unpublished" does not.
- A blocker states **what breaks if it is ignored**, not just that it is unresolved.
- Republish the same file path to update it in place. One artifact per page-build project, kept
  current, beats a new URL per checkpoint.

---

## Checklist

- [ ] `references/section-library.md` read before anything else; block list mapped against it
- [ ] Tokens measured only for a `Custom.HTML` block, and measured today rather than recalled
- [ ] Block list decided from content, before any harvesting
- [ ] Any NEW harvest written back into `section-library.md` with the date
- [ ] Layouts identified by geometry, not by element counts (only when harvesting)
- [ ] No two blocks answer the same question
- [ ] Each new string written to the length of the string it replaces; hero lead ~19 words, not a TLDR
- [ ] One file is the page spec; the others reference it instead of restating it
- [ ] Each harvested section named on save, and Status re-read in the app before insert
- [ ] Every claim traced to code; flags read live, not from seed
- [ ] H1 and every feature-referring H2 use the `displayName` from `cro-modules.ts`, not a descriptive stand-in
- [ ] Target keyword lives in the title tag and lead, not repeated across every H2
- [ ] Sections published before use
- [ ] Each reused instance unsynced (except deliberately shared blocks)
- [ ] Page custom CSS pasted for every inserted section that requires it (`section-library.md` names which, and it is per page - a global section does not carry it)
- [ ] Custom HTML self-contained, no `<script>`, no `rem` units
- [ ] Custom HTML sets no padding / max-width / background of its own - the wrapping section owns those
- [ ] Custom HTML's left and right edges measured against a neighbouring section's content row, and they match
- [ ] Every bare tag in the custom HTML reset against the theme's element selectors
- [ ] Custom HTML checked in preview, not on the canvas
- [ ] Page spec has all three parts, including the per-element mapping
- [ ] Editor version matches the harvested sections before the page is created
- [ ] Every unsync re-verified after the batch, before the first save
- [ ] Hidden per-device variants in harvested sections rewritten too
- [ ] Hand-drag list handed over as one batch mid-build, not at the end
- [ ] Save confirmed against the API, not the UI. Not published
- [ ] Inbound links live; baseline locked; read date set from link-live day
- [ ] Progress handed back as an Artifact with a rendered block-by-block mock, not as a file path
- [ ] No `plan.md` status file written alongside the Artifact
