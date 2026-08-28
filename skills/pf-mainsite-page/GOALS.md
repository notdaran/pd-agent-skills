# Goals — `pf-mainsite-page`

Why this exists, what it does, what it does not, how it fits with the other tools.
Read this before extending it.

## Problem statement

Building a marketing page on `pagefly.io` goes wrong in three specific, observed ways:

1. **The page ships as one big `Custom.HTML` blob.** Two feature pages on the store are
   literally `Body > Layout > 2 FlexSection > 2 Custom.HTML` and nothing else. They are
   off-brand, nobody can edit a word without opening code, and no part of them is reusable.
   Meanwhile the homepage next door is built from ~580 native elements.

2. **The page is factually wrong about the product.** Marketing copy claims a capability the
   product does not have, or restates a stale code comment as current law, or quotes a feature
   flag's seeded value as its live rollout. On the Shopify App Store this is a policy exposure,
   not a typo.

3. **The page ships and nothing links to it.** Two pages built this way drew almost no traffic in
   their first clean week, with zero conversion clicks, purely because no internal link existed.

Nothing else in the toolchain covers the *mechanics* of avoiding these. UI inside the admin app is
a different surface with a different component system. `illustra` / `feature-demo` make marketing
images. A separate content layer owns website copy, tone, and SEO/AEO. The gap is: **how do you actually assemble a
page in the PageFly editor without producing an HTML blob.**

## Scope — what this DOES

- Measures the live site's design tokens and per-section layout geometry before any design work.
- Identifies which existing sections can be harvested as reusable layouts.
- Encodes PageFly's global-section mechanics: reference-by-id, publish-gated propagation,
  "Unsync section", the Saved-sections vs Templates insert distinction, slot accounting.
- Sets the boundary for when `Custom.HTML` is legitimate, and how to write it so it survives
  being pasted into a PageFly HTML element.
- Requires claim-to-source verification against the product repo.
- Requires inbound links and a measurement window before a page counts as done.

## Scope — what this does NOT do

- **Copywriting, tone of voice, ICP targeting, SEO/AEO layering** — owned by a separate content
  layer. This skill assumes copy arrives already written and only checks that its factual claims
  trace to code.
- **UI inside the Shopify embedded admin app** — different surface, different component system
  (Polaris / `s-*`), different rules entirely.
- **Marketing imagery** — `illustra`, `feature-demo`, `anima`.
- **Deciding which pages to build, or their keywords** — that is a planning decision made from
  the GAP analysis and keyword volume, not a build-time decision.
- **Shipping an inventory of the store's sections.** Deliberate. See below.

## Layer architecture

```
content layer        what the page SAYS      copy, ToV, ICP, SEO/AEO, claim policy
     |
pf-mainsite-page     how the page is MADE    tokens, layout harvest, global sections, links
     |
PageFly editor       where it is assembled   Saved sections, Unsync, Custom.HTML
```

Each layer trusts the one above for its own domain. This skill never overrides a content
rule, and never invents one.

## Design decisions — why things are the way they are

- **No inventory in the skill.** The store held hundreds of sections, most of them dead, on the day
  this was written. That count, and the list, will be wrong soon. A skill that ships a stale list
  is worse than one that ships none, because the reader trusts it. Hence Rule 0.

- **Geometry beats element counts.** Identifying a layout by counting `data-pf-type` values
  produced two wrong answers in a single session - an icon-column section read as a bento, and
  a bento read as a comparison table. Counting tells you what a section *contains*; only
  measuring card widths and row grouping tells you what it *looks like*.

- **Harvest rather than author.** Every layout a feature page needs already exists on the site.
  Harvesting guarantees brand consistency for free and produces reusable sections as a
  by-product. Authoring produces a blob that matches nothing.
  The known cost of this decision: a harvested set reads like a list of work items, and the page
  starts growing a block per available layout. Hence the ordering rule - block list from content
  first, harvest second. See anti-patterns #11 and #12.

- **Custom HTML limited, not banned.** A real data table has no expression in the site's
  element vocabulary. Forcing it into a card grid to satisfy a purity rule makes a worse page.
  The rule is *limit and isolate*, not *eliminate*.

- **Links are part of the deliverable, not follow-up.** Measured evidence: pages without inbound
  links get single-digit traffic regardless of content quality. Treating linking as a separate
  later task is how that happened twice.

## Extending this

1. Check the existing references cover it before adding a new one.
2. Confirm it is not really a content rule wearing a build-step costume. If it is about
   *what to say*, it does not belong here.
3. If adding a platform mechanic, cite the code path in the product repo. Mechanics
   claimed from memory have been wrong before.
4. Never add a list of the store's current sections, pages, or slot counts.

## Success criteria

Working: a new feature page ships built from named, reusable global sections, with at most one
isolated `Custom.HTML` block, every claim traceable, inbound links live on day one, and the
next page in the family costs materially less to build than the previous one.

Not success: this skill does not decide what to build, does not write the copy, and does not
replace a human reading the page before it goes live.
