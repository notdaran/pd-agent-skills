---
name: pf-mainsite-page
description: |
  Use when building or rebuilding a marketing page on pagefly.io (a Shopify store,
  separate from the app) inside the PageFly editor - feature landing pages, GAP pages,
  spoke pages. Carries the named global-section library the store already has, so a new
  page is assembled from existing layouts - either by duplicating a page already shipped,
  or by insert + unsync + rewrite - rather than measured or hand-written. Also covers
  claim verification against code, the one case that still needs `Custom.HTML`, and
  keeping the new page off the orphan list.
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
| 2 | **Write the block list from the content**, one line per block naming the question it answers - and check it against Step 2.5 before going further | you |
| 3 | **Choose how each block is made**: existing section → native element → `Custom.HTML`, in that order | you |
| 4 | **Map the block list onto `references/section-library.md`.** Measure or harvest only what it cannot cover (Steps 1–2 below) | you |
| 5 | **Lock the page spec**: block list + copy + per-element mapping (Step 3.5 below) | you |
| 6 | **Build the skeleton** by whichever path Step 3.6 chose: duplicate a shipped page, or create + insert + unsync | agent |
| 7 | **One handover** — every element that must be dragged in by hand, in a single batch | person |
| 8 | **Fill everything**: text, HTML, links, delete the inherited leftovers | agent |
| 9 | **Save. Never publish.** | agent |
| 10 | **Ship inbound links with the page** and lock the baseline (Step 6 below) | you |
| — | **Every progress hand-back goes to the operator as an Artifact** (Step 7 below), at each stage above, not only at the end | you |

Four things decide whether this is fast or slow:

- **Step 3 order is not a preference.** Reaching for `Custom.HTML` before checking the element
  vocabulary is anti-pattern #4. It also buys a manual step, because new elements cannot be
  created by a browser agent — see `references/automating-the-editor.md`.
- **Step 5 is the whole game.** Layout plus copy is not enough; without the per-element mapping
  the agent re-derives it mid-build. Anti-pattern #19.
- **Step 2 is cheap to get wrong and expensive to notice.** A block with no job survives all the way
  to review looking like content, because it is usually a table. Step 2.5 is the test.
- **Step 7 sits in the middle, not at the end.** Leaving the drags until last means two handovers,
  because the agent still has to fill the content of whatever was dragged in. Anti-pattern #18.
- **Step 3.6 decides how much of the build is mechanical.** Duplicating a shipped page skips the
  insert, the unsync of every block, and the page-CSS paste - the three places builds break. It is
  not always available, and it is not a replacement for the insert path. The test is in Step 3.6.

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

**Whenever you do measure the live store, read `measure-a-page.md` step 0 first.** Fetching the
store wrongly does not fail, it answers: a parallel crawl comes back as the CDN's challenge page
with a `200`, and every search over it then reports a clean, believable "not found". That step
carries the detection, the positive control that has to precede any negative result, and why a
summary of a page is not evidence for editing it. The habit behind it is anti-pattern #23.

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

## Step 2.5 — Every block must have a job, and one of them is "why"

The block list is where a page is won or lost. Three failures, all found on one build, all invisible
to the person who wrote them.

### A feature page needs three layers, and the missing one is always "why"

1. **Why a merchant needs this** — the situation they recognise.
2. **What it is / what it changes** — the capability.
3. **How it runs, and its limits** — the mechanics and the disclosures.

Layers 2 and 3 write themselves from the claim table, so they get written. Layer 1 has no source
document, so it gets skipped - and then something has to fill the block, and layer 3 gets repeated
to fill it. Both pages of one build shipped a review round with no layer 1 at all.

Layer 1 is concrete situations, not adjectives. The four that survived review named a thing that
breaks: an offer that does not apply in that market, proof nobody there recognises, a campaign out
of season, a translation that does not fix the photo. No statistics, nothing needing a citation.

### A duplicate block hides as a table

A table reads as new information even when every row of it appears elsewhere on the page. Two
blocks on one build were tables that restated the block above them and the FAQ below them.

**Test each table row: where else on this page is this fact stated?** If more than half are stated
elsewhere, the block has no job. Delete it and give the slot to layer 1.

Deleting it is also cheaper to build - both of those blocks were `Custom.HTML`, and rewriting them
as native tile blocks removed two hand-written fragments from the build.

**The same test applies one level down, to individual cards.** A "how you read it" block and a
"what you get" block are different jobs, so they read as safely different - and then one card in
each ends up saying the identical sentence. It happened on one build: a card in the "three steps"
block and a card in the "why you need it" block carried the same sentence word for word, and the
duplicate survived a whole review round because the two blocks look nothing alike. Read every card
body against every other card body on the page, not just block against block.

### Required disclosure goes in the FAQ, not on the front of a block

A support matrix whose visible content was four rows of "Not released" is factually right and reads
as a feature that barely ships. The same facts as one line in a spec strip plus one FAQ answer are
equally honest and do not make the block's whole job be "here is what we cannot do".

This is not licence to hide anything - Step 3's rules on disclosure still bind, and Step 3.45
already forbids cutting a `beta` or `minTier` line for length. It is a rule about **placement**:
disclosure belongs where a buyer goes looking for it.

### Sell your product, not the platform

A heading that states the problem in the platform's own language and never names what you do is a
heading working for the platform. `One page cannot sell the same way in every Shopify Market` became
`PageFly gives each Shopify Market its own version of the same page`.

The lead is the place for what the merchant **avoids**: `No duplicate page to keep in sync, no
redirect app, no second site`. Those three are how they solve it today without you.

### Watch for the parallel-phrase tic

`The offer does not travel / The proof does not travel / The season does not travel` is writing for
rhythm. Three cards, one idea, and the reader stops reading by the third. Vary the construction;
keep the parallel meaning.

### Write like a salesperson, not an essayist

The reader is a merchant deciding whether to pay, not someone reading a post. Every sentence has to
answer *what do I get*. A sentence that comments on the page's own content instead - an aside, a
piece of advice, a bit of narration - reads as a blog and gets cut by the page owner on sight.

The four shapes that keep appearing, all caught on one build:

| Shape | Caught in the wild | What it should have been |
|---|---|---|
| **Aside about the reader** | `Three steps, and the third is the one merchants forget` | `Three steps from a blank canvas to a live drawer on your storefront` |
| **Advice on how to read the product** | `Treat the shape and the gaps as the signal, not the last digit` | (delete - the FAQ already gave the fact) |
| **Roadmap promise** | `same thing, two names, and PageFly is tidying that up` | (delete - state the name, stop) |
| **Inside baseball** | `and unlike most CRO features it is not granted to grandfathered stores` | `stores on an older plan do not have it` |

The test, read aloud: **is this sentence telling the merchant what they get, or telling them
something interesting about the sentence before it?** The second one is a blog.

**A lead's closing sentence stays on the same axis as its opening.** One hero opened on what the
merchant gets and closed on `No tracking code to install` - a setup detail. It reads as a non
sequitur even though it is true. The fix was to close on positioning instead: `Built into PageFly,
no third-party app.` Same length, same axis.

### The "why" block's heading names your product and what it does

This is the correction to the rule below about matching heading and cards, and it outranks it.

A heading that only states the problem is not a reason to buy. Both of these went to review and both
were rejected, in consecutive rounds on the same build:

- ❌ `Your theme already shows a subtotal and a button.`
- ❌ `Knowing the conversion rate does not tell you what to change.`

The owner's words: *"nó phải kiểu PF <feature> tells you... chứ?? m đang nêu problem thì có"*.

**Subject of the H2 is the product's name. Predicate is what it does for them.**

- ✅ `PageFly Heatmaps show you the part of the page shoppers never reach.`
- ✅ `PageFly AI Page Checkup names what to fix before you publish.`

The problem still gets stated - it moves into the **lead**, and the lead turns back to the product
in its second half (`One number tells you conversion fell. PageFly tells you the step, the page,
and what it costs you in a week.`). Cards then carry four distinct specifics of the promise, none
of them restating the heading.

Beware the trap that produced the first two rejections: the parallel-phrase rule further down says a
problem-stating heading needs solution-stating cards. That is true and it is not permission for the
heading to state the problem. On the "why" block it never is.

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

### Which ref to read

Three refs answer three different questions. A marketing page describes **today**, so its claims are
read from the branch that is in production.

| Ref | Answers |
|---|---|
| the branch you have checked out | what you are building. Never a source for a claim |
| the integration branch | what is merged and will ship. A promise, not a fact |
| **the production branch** | **what merchants have today** - the one a claim must match |

Evidence: a working branch a few dozen commits behind production still carried a cohort constant
that production had deliberately deleted. Writing the page from it would have
shipped a limitation that does not exist, aimed at exactly the merchants the feature was built for.

Production code is still only half the gate. **A deployed feature can be flag-off.** Check both, and
read the flag from the live dashboard, not from a doc that quotes it.

### A universal claim about the merchant's own store is a claim too

`on most Shopify stores it does nothing except add the items up` shipped to review as scene-setting,
not as a claim. The owner rejected it in one line: *"chưa chắc nhé, cnay phụ thuộc vào theme chứ kp
Shopify store, đừng có mà tuyên bố bừa"*. Default cart behaviour is a property of the merchant's
**theme**, and nothing in the claim table could support a statement about most stores.

Grep the finished copy for `most`, `every`, `all`, `always`, `never`, `any`. Each hit either traces
to a row in the claim table or comes out. Statements about the merchant's own setup - their theme,
their traffic, their habits - almost never trace, because the product's code says nothing about them.

### Limitations need the same proof as capabilities

The claim table scores "X cannot be done" the same way it scores "X can be done". A false limitation
is not the safe direction: it makes the product look worse than it is, and it is just as wrong.

Evidence: a doc said a market version locks the page layout, and that was nearly shipped
as the page's honesty beat. Code carried no such restriction and the module's own description said
design was editable. The claim was dropped rather than softened.

### A status label is a claim too - check whether a merchant can actually see it

`status: 'beta'` in the registry is not the same as "merchants see Beta". One module's registry said
beta while the badge rendered in exactly one place: a *collapsed* comparison table below the tier
cards, past the extra-credits block, behind a click. On the tier cards themselves the beta badge had
been deliberately suppressed for four months - while `Upcoming` badges on neighbouring rows rendered
fine, so it was a decision, not a bug.

Trace the label from the registry to the pixel: which component renders it, and how many
interactions from a default view. **Do not put a status on a marketing page that the product itself
declines to show** - it costs conversions and no in-app surface corroborates it. Keep the substance
(the page-type limit, the tier) and drop the label.

The inverse still holds: never *remove* a limitation because it is inconvenient. Ship the fact,
drop the scary word only when no merchant-visible surface carries it.

### When sources disagree, trace to where the effect happens

Do not rank sources by how official they look. The most official-looking source can still be
partial: a live pricing constant turned out to be only the margin, not the charge.

Find the code that **executes** and read the arithmetic there - from the handler down to the
function that mutates the thing being claimed about. Four sources disagreed on one number; the answer came
from following the request into the function that writes the balance.

### Gate inventory - what makes the feature invisible

A feature page needs a list of every condition under which a merchant on the right plan still sees
nothing: page type, surface (page versus section), screen width, tier, cohort, flag. It goes in the
spec, next to the claim table.

It pays three times: the FAQ answers come out of it, whoever records the demo needs it so they do
not lose an hour to "the button is not there", and support tickets arrive from exactly these gates.

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
corrected on this store. The product name and the keyword are two different jobs. Never trade copy
length for a keyword - the budget in Step 3.45 wins.

**When the surfaces disagree on the name, list them before choosing.** One feature was found
carrying four merchant-visible names at once: the pricing comparison table, the editor's create
modal, its delete modal, and the help centre - and the public pricing page carried no line for it
at all. The rule above (pricing-table name wins) is the default, and it has one tie-breaker: **if
the target keyword contains a different one of those names, the keyword wins.** A page that ranks
for a name nobody in the app uses is still a page merchants land on; a page nobody lands on teaches
nobody the name.

Whichever loses, **bridge it once in the FAQ** - one sentence naming the in-app string - so a
reader who goes looking in the app can find it. Then log the drift as a backlog item. Do not block
the page on reconciling four surfaces.

Weighs heaviest on a page whose distribution is LLM citation rather than search: an engine can only
cite the name it read.

### When the feature name contains the platform's own product name

A feature built on top of a named platform capability tends to be named after it, and the result
reads as the platform's feature rather than yours. `Shopify Markets localization` is a page about
**PageFly**, and every heading on it said something Shopify appears to own. The operator caught it
on sight; nobody in three rounds of copy review had.

The keyword makes it worse, not better: the target keyword *was* that exact phrase, so the SEO rule
and the attribution rule pull in opposite directions and the writer resolves the collision silently
in favour of whichever they were thinking about.

**Do this instead.** Detect the collision when you write Step 3.4's heading list: does the feature
name, as written, start with another company's product name? If it does, do not choose. Put both
options and the cost in front of whoever owns the page:

- **Vendor-first** (`PageFly Markets localization`) - unambiguous ownership, loses exact-match on
  the keyword.
- **Keyword-first** (`Shopify Markets localization`) - keeps the match, reads as the platform's.
- **Split the jobs** - vendor-first in the H1's opening, the platform's term in the same line where
  it is factually correct (`... for each Shopify Market`). Usually the answer, never automatically
  the answer.

Whatever is chosen, write the discarded option and its cost into the build order. This is a page
owner's trade-off, and the value the skill adds is forcing it to be made once, out loud, rather
than drifting between rounds.

## Step 3.45 — A harvested section carries an implied copy length. Write to it.

The layout was designed around the words that were in it. Swap in copy of a different size and the
block stops looking like the site, even though every token is correct.

**Before writing a block's copy, read the length of the string it replaces.** The per-element
mapping (Step 3.5) already puts old and new side by side - use that column as a budget, not just
as a lookup.

**The per-slot word budget lives in `references/section-library.md`.** Read it before writing, not
after the block looks wrong.

**When the page is built by duplicating another (Step 3.6), the budget is the donor page's strings,
not that table.** The library's numbers describe the named sections in it; a shipped page usually
also carries blocks it built for itself, whose slots are a different size - measured once at roughly
twice the length of the library's comparable slots. Read the string you are about to replace. Range at time of writing: a hero lead holds 19 words, a section lead
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

**House punctuation: no em dash, anywhere.** Hyphen, colon, or a sentence break. This is an
operator rule for every English string that ships, and it is easy to file mentally under "app UI
strings" and then break on a marketing page - which is what happened here, after two prior
reminders. Before handing copy back, grep for `—` and expect zero. Also grep the artifact, which is
copy too.

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

## Step 3.6 — Choose the build path: duplicate a shipped page, or insert sections

Two paths. Neither replaces the other, and the choice is made here, before anything is built.

**The test: does the block list match the skeleton of a page already shipped?** Same section types,
same count or fewer.

| | Duplicate a shipped page | Insert sections and unsync |
|---|---|---|
| Use when | The block list matches a page already shipped. Typically the third or later page in one family | No shipped page has that shape, the donor is missing a layout you need, editor versions differ, or this is the first page of a family |
| Skips | The insert, the unsync of every block, and the page custom CSS paste | nothing |
| Costs | You inherit the donor's defects | the three steps above |

The three steps duplication skips are the three that break builds: an unsync that silently reverts
(anti-pattern #17), the page CSS this file already calls "the step that gets forgotten", and the
insert itself.

**Pick the donor by block count, not by subject.** Deleting a spare block out of a duplicate is
cheap; adding a missing one costs an insert plus an unsync plus the CSS paste. The donor is the
shipped page whose skeleton is the smallest superset of the new block list.

**Read the donor before copying it.** Duplication carries defects forward. A donor picked for its
skeleton still set its own padding, its own max-width and `rem` units inside `clamp()` in its
`Custom.HTML` block - the exact three things anti-pattern #22 and Step 5 exist to prevent. Fix them in
the copy, or the page ships them a second time.

**Four things to confirm in the editor before duplicating.** None may be assumed:

1. Does the duplicate carry the page custom CSS, or does it have to be pasted again.
2. Does the shared closing CTA stay a reference, or get flattened into a local section.
3. Do the sections arrive already local - this is what removes the unsync step, and it is the whole
   reason to take this path.
4. Does the editor version match.

Write the four answers into the build order. The next build reads them instead of re-deriving them.

## Step 4 — Assemble with global sections

Step 4 describes the **insert** path. On the duplicate path the sections arrive with the page and
most of this becomes a verification pass rather than a build step - but the closing CTA rule below
still holds, and the version-mismatch trap still applies.

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
- **No `<script>` — with exactly one sanctioned exception.** The ban is a house rule, not a
  platform limit: the HTML element *does* execute scripts on the storefront. It exists because the
  element collapses a script to one line when saved, so a `//` comment or an omitted semicolon
  kills it silently, and because the editor does not execute scripts at all, so a working block
  looks dead on the canvas. The one approved exception is an animated section background —
  `references/animated-section-background.md`, which carries the four conditions it stays approved
  under. Anything else wanting a script gets its own review; do not generalise from that one.
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

### The six that get missed on every page built this way

Three feature pages shipped by this method were swept a week later and **all three carried the same
six misses**. They are not content mistakes; they are build steps with no natural prompt. Run them
as a list.

| # | Miss | Where it is fixed |
|---|---|---|
| 1 | `description_tag` empty | **Shopify Admin.** The PageFly editor only ever *reads* the SEO metafields; there is no writer in it. The app says so itself when a page is published |
| 2 | `og:title` falling back to the site default | **Theme.** Nothing in the app touches `og:title`; PageFly writes a section, never the `<head>`. Usually a site-wide fix, so it will not be yours alone |
| 3 | No `FAQPage` JSON-LD despite the page having an FAQ | **In the editor** - there is a shipped one-click generator in the CRO Center drawer. Two conditions to confirm first: its audit is written around product pages, and the schema is only emitted at publish when the Q&A is built from an accordion element, so hand-typed text drops it silently |
| 4 | No inbound links | **In the editor, on the other pages.** See the orphan rule above |
| 5 | Images with no alt | **In the editor** - the image element has an alt field and seeds it from the media library |
| 6 | Target keyword absent from the body | **Copy.** Measure it: count the exact phrase before and after. Two pages went to review at zero occurrences of theirs |

Three of the six cannot be done from the editor at all (1, 2, and the nav half of 4). Schedule them
with whoever owns Admin and the theme **before** the page is due, or the page ships with them open.

### Two pre-publish checks that are not about links

- **Reconcile the tier claim with the store's own pricing page.** A feature page that says "from
  plan X" while the pricing page one click away says plan Y is broken on arrival, and the merchant
  buys the wrong plan. The module list on a pricing page is typically hand-typed rather than read
  from the registry, so it drifts every time a module changes tier - and it drifts in one direction,
  because a module that gained a cheaper tier is the change nobody remembers to publish. Check the
  pricing page and the in-app comparison table against the registry, and fix the pricing page in the
  same pass as the launch.
- **Status-check every URL before it goes into a button.** The hero's secondary button deep-links a
  help-centre article. A help centre that has been restructured leaves those links pointing at 404s,
  and nothing else in the build catches it: the button looks fine, it just goes nowhere. `curl` the
  URL you are about to write into the page.

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

### The split inverts the moment copy is reviewed in the artifact

That table is right until the operator starts **approving copy changes in the artifact**, which is
what the rendered mock is for. From the first accepted change, the artifact holds the copy of record
and `copy-*.md` is a stale draft that still looks like the build input - because this file says it
is one.

It has already cost a build: seven rounds of review ran in the artifact while `copy-*.md` sat four
hours out of date, wrong about the feature name, wrong about whether a "Beta" label was required,
and wrong about the block list. Anti-pattern #25 has the detail.

**Before building, compare mtimes** - `ls -lt copy-*.md review-artifact.html`. If the artifact is
newer, it is the build input until proven otherwise. Then pick one and mark the other: either write
each accepted round back into `copy-*.md`, or stamp a stale banner at its top naming the artifact.
Never leave two live copies of the copy.

And note what a review round can invalidate. A wording change touches only the copy; a change to
the **block list** invalidates the build order and the per-element mapping too.

### Rules for the artifact itself

- Framing, labels and explanation in whatever language the operator reads; **the page copy being
  previewed stays in the language that ships**. Do not translate the preview.
- Explain in operator terms, never in build terms. "The layout you inserted is not switched on yet,
  so the page shows *Removed section*" lands; "section unpublished" does not.
- A blocker states **what breaks if it is ignored**, not just that it is unresolved.
- **Open items only.** When something is resolved, delete it from the artifact - do not convert it
  into a green "done" card, and never into a card explaining why an earlier version was wrong. Test
  each card by asking what the reader still has to *do* with it; no answer means the card goes. The
  operator has asked for this three times.
- Republish the same file path to update it in place. One artifact per page-build project, kept
  current, beats a new URL per checkpoint.

---

## Checklist

- [ ] `references/section-library.md` read before anything else; block list mapped against it
- [ ] Build path chosen deliberately (Step 3.6), not by habit; on the duplicate path the donor was read for inherited defects first, and the four editor questions answered
- [ ] Tokens measured only for a `Custom.HTML` block, and measured today rather than recalled
- [ ] Block list decided from content, before any harvesting
- [ ] Any NEW harvest written back into `section-library.md` with the date
- [ ] Layouts identified by geometry, not by element counts (only when harvesting)
- [ ] No two blocks answer the same question; every table row checked against the rest of the page (Step 2.5)
- [ ] No two **cards** anywhere on the page carry the same sentence, across blocks as well as within one
- [ ] Every sentence read aloud against "what do I get" - no asides, advice, roadmap promises or inside baseball
- [ ] The "why" block's H2 has the product name as its subject and what it does as its predicate
- [ ] Each lead's closing sentence sits on the same axis as its opening
- [ ] `most / every / all / always / never / any` grepped in the finished copy; each hit traces to the claim table or is cut
- [ ] `—` grepped in the copy **and** in the review artifact; count is zero
- [ ] The block list has a "why this matters" block, and it is concrete situations rather than adjectives
- [ ] Headings name what the product does, not what the platform makes hard
- [ ] Required disclosure placed in the spec strip and FAQ, not made the visible content of a block
- [ ] Each new string written to the length of the string it replaces; hero lead ~19 words, not a TLDR
- [ ] On the duplicate path the copy budget came from the donor page, not from the library table
- [ ] One file is the page spec; the others reference it instead of restating it
- [ ] `copy-*.md` confirmed newer than the review artifact, or the artifact used as the build input and the copy file stamped stale (`ls -lt`)
- [ ] Each harvested section named on save, and Status re-read in the app before insert
- [ ] Every claim traced to code; flags read live, not from seed
- [ ] Every status label (beta / upcoming) traced from registry to pixel; nothing on the page the product declines to show
- [ ] All merchant-visible names for the feature listed before one was chosen; the loser bridged once in the FAQ and logged
- [ ] Claims read from the **production** branch, not the checked-out one; flag state checked separately from code
- [ ] Limitations scored in the claim table exactly like capabilities
- [ ] Where sources disagreed, the answer came from the code that executes, not from the most official-looking source
- [ ] Spec carries a gate inventory: every condition under which the feature is invisible in-app
- [ ] H1 and every feature-referring H2 use the `displayName` from `cro-modules.ts`, not a descriptive stand-in
- [ ] Target keyword lives in the title tag and lead, not repeated across every H2
- [ ] If the feature name opens with another company's product name, the ownership-vs-keyword trade-off was put to the page owner and the discarded option recorded
- [ ] Sections published before use
- [ ] Each reused instance unsynced (except deliberately shared blocks)
- [ ] Page custom CSS pasted for every inserted section that requires it (`section-library.md` names which, and it is per page - a global section does not carry it)
- [ ] Custom HTML self-contained, no `rem` units, and no `<script>` unless it is the sanctioned animated background under all four of its conditions
- [ ] Custom HTML sets no padding / max-width / background of its own - the wrapping section owns those
- [ ] Custom HTML's left and right edges measured against a neighbouring section's content row, and they match
- [ ] Every bare tag in the custom HTML reset against the theme's element selectors
- [ ] Custom HTML checked in preview, not on the canvas
- [ ] Any block built by duplicating another block on the same page was re-themed: `background-color`, `background-image`, and text colour
- [ ] Section grounds listed top to bottom and read as a sequence - no two identical grounds adjacent
- [ ] Where a fragment styles PageFly's own elements, the result was verified by `getComputedStyle`, not by the rule existing
- [ ] Page spec has all three parts, including the per-element mapping
- [ ] Editor version matches the harvested sections before the page is created
- [ ] Every unsync re-verified after the batch, before the first save
- [ ] Hidden per-device variants in harvested sections rewritten too
- [ ] Hand-drag list handed over as one batch mid-build, not at the end
- [ ] Save confirmed against the API, not the UI. Not published
- [ ] Inbound links live; baseline locked; read date set from link-live day
- [ ] Tier claim reconciled with the store's pricing page and the in-app comparison table, and the pricing page fixed in the same pass
- [ ] Every URL going into a button status-checked before it was written
- [ ] The six recurring misses run as a list (meta description, og:title, FAQ schema, inbound links, image alt, keyword in body); the three needing Admin or theme scheduled with their owner
- [ ] Store never fetched in parallel (`measure-a-page.md` step 0); any "not found" from your own tooling confirmed with a positive control (anti-pattern #23)
- [ ] Progress handed back as an Artifact with a rendered block-by-block mock, not as a file path
- [ ] Artifact contains open items only; anything resolved was deleted, not marked done
- [ ] No `plan.md` status file written alongside the Artifact
