# pf-mainsite-page

A Claude / agent **skill** for building a marketing landing page inside a visual
page builder - assembled from the section library the site already has, rather
than measured from scratch or hand-written as a blob of HTML.

It is a method plus one worked example. No build step, no dependencies: a
pipeline, five reference files, and a real section library printed in full so you
can see the shape of a good one.

English · [Tiếng Việt](./README-vi.md)

---

## The three failures it exists to prevent

**1. The page ships as one big custom-HTML block.** It inherits nothing from the
site, so it is off-brand. Nobody can edit a word without opening code. No part of
it is reusable. Two pages on the store this was written against are literally a
layout wrapper around two HTML blocks and nothing else, while the homepage next
door is built from hundreds of native elements.

**2. The page is factually wrong about the product.** Marketing copy claims a
capability that does not exist, or restates a stale code comment as current law,
or quotes a feature flag's seeded value as its live rollout. On an app
marketplace that is a policy exposure, not a typo.

**3. The page ships and nothing links to it.** Pages built this way drew almost
no traffic in their first clean week, with zero conversion clicks, purely because
no internal link existed. The links were a five-minute job nobody scheduled.

## Rule 0

**Any list in this skill is a snapshot; only the method is durable.** A skill that
ships a stale inventory is worse than one that ships none, because the reader
trusts it. One deliberate exception is carved out and labelled.

## The pipeline

Ten stages, each with an owner, from "content clears the content layer" through
block list, section mapping, claim verification, spec, assembly, and inbound
links. Two gates sit before assembly starts, because the expensive mistakes are
all made before anything is dragged onto a canvas.

Highlights:

- **Open the library before measuring anything.** Measuring is for the one case
  that inherits nothing - a hand-written HTML block - not for a page you are
  assembling from existing sections.
- **Identify a layout by geometry, not by counting elements.** Counting tells you
  what a section *contains*. It read an icon-column section as a bento and a bento
  as a comparison table, in a single session.
- **Verify every product claim against code**, and know that a code comment is a
  snapshot, not a rule - check when it was written and what shipped after.
- **Write to the length of the string you are replacing.** The layout was designed
  around the words that were in it; copy at twice the length breaks the rhythm
  even when every design token is right.
- **Inbound links are part of the deliverable**, and the measurement window starts
  the day the links go live, not the day the page publishes.

## The section library, as a worked example

One reference file prints a real library in full - eight named sections, their
layouts and geometry, the leftovers each drags along when inserted, the page CSS
two of them need, and a measured word budget per slot.

Yours will not be these eight. It is there for the shape: which columns earn
their place, what stays true, what has to be re-read every build. Every layout in
it was measured off public pages.

## The one case that still needs custom HTML

A real data table. Everything else - and the file says so at length - is better
as a native element, because custom HTML leaks CSS in both directions, ignores
the design system, and cannot be edited by anyone who does not write code. The
rules for when you do reach for it are strict and worth reading even if you never
do.

## Requirements

- The chrome-devtools MCP server, for driving the editor
- Access to the page builder and the store you are building on

No Node packages, no build step. Pairs with `pagefly-browser-tester`, which owns
the browser-automation rules this skill relies on.

## Install

Ships as part of [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Not for

UI inside a Shopify embedded admin app - different surface, different component
system, different rules. Marketing imagery, which belongs to `illustra` and
`feature-demo`. Copy, tone of voice, ICP targeting and SEO/AEO layering, which
belong to whatever content layer you run: this skill assumes copy arrives already
written and only checks that its factual claims trace to code.

## Data

No credentials, no admin URLs, no traffic figures. The worked-example library
names sections and layouts of a public marketing site, all of it measurable by
opening the site itself.
