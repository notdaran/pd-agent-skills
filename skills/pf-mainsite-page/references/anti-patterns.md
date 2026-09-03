# Anti-patterns

Every item below is a mistake actually made while building a page on this store, not a
hypothetical. They are listed because they are cheap to repeat and expensive to catch late.

---

## 1. Inferring layout from element counts

**What happened.** A section counted `FlexBlock 19 · Icon2 5 · Image4 5` and was labelled
"three columns with icons". It was actually a bento: one full-width card then two rows of two.
The `Icon2` values were arrow glyphs inside "Read more →" links.

Then, after writing down the lesson, the same mistake was made on the very next section:
`FlexBlock 37 · Icon2 14 · Image4 25` was labelled "comparison table". It was a 1+2+2 bento.
The store has **zero** `<table>` elements anywhere.

**Why it keeps happening.** Counting is cheap and feels like measurement. It answers
"what is in here", which sounds like "what is this".

**Do instead.** Group card bounding boxes by y-coordinate and read the widths. Two 590px cards
then three 387px cards is a 2+3 bento; nothing else produces that signature. See
`measure-a-page.md` step 4. Run it **before** naming a layout, not after being corrected.

---

## 2. Treating a seeded flag value as the live rollout

**What happened.** `seed.ts` showed `rolloutPercent: 50` for a feature flag, and that was
reported as the current state. The flag had long since been ramped to 100%. Seed files hold
initial values and are not updated when a flag moves.

**Do instead.** Read the live value from the running system. If you cannot reach it, say so and
label the number as unverified — do not present a seed value as current state.

**Side effect worth fixing when you find it.** A seed description that still says
"50/50 to measure the delta" will mislead the next reader the same way.

---

## 3. Quoting a code comment as current law

**What happened.** A comment listing what a feature "cannot see" was quoted as a hard constraint
on marketing copy. Checking its commit showed it was written **eleven seconds after** the commit
that added three of the capabilities in question, by the same author in the same session — and
that its wording was narrower than it read.

**Do instead.** A comment is a snapshot with a date. Before citing one as a rule: check when it
landed, and what shipped after. If it constrains a deliverable, verify the constraint against
current behaviour rather than the prose.

---

## 4. Confusing "no section for X" with "no way to do X"

**What happened.** A search of the section library found four FAQ sections, all unused, and the
conclusion drawn was "no FAQ available, must write HTML". The editor has a native `Accordion`
element. There was no FAQ *section*; there was a perfectly good FAQ *element*.

**Do instead.** When the library comes up empty, check the element vocabulary before reaching
for HTML. The gap is often at the wrong level of abstraction.

---

## 5. Assuming a global section's identity

**What happened.** The single `GlobalSection` on the homepage was assumed to be the site-wide CTA
section used on 87 pages. Reading `data.name` showed it was a different section, used on 9.

**Do instead.** Read `data.name`. Never infer which shared section you are looking at from
position or from what it appears to contain.

---

## 6. Opening the editor by pasting its URL

**What happened.** Navigating directly to an editor URL produced a blank canvas plus a real
runtime error (`Cannot read properties of null (reading 'querySelector')`), which looked like a
loading delay for a while.

**Do instead.** Enter from the Pages list and click the row.

---

## 7. Fetching an app API from the wrong frame

**What happened.** A fetch to `/api/page/<id>` returned 404 because it executed in the
`admin.shopify.com` frame rather than the app's origin.

**Do instead.** Target an element inside the app iframe so the tool resolves the frame, then use
that document's `defaultView` to fetch. See `measure-a-page.md` step 6.

---

## 8. Treating inbound links as follow-up work

**What happened.** Two pages shipped with solid content and drew almost no traffic in their first
clean week, with zero conversion clicks. Nothing on the site linked to them. Both pages already
mentioned the feature by name elsewhere — the links were a five-minute job that nobody scheduled.

A second-order error followed: the D+7 read was taken from the publish date rather than from the
day links went live, so the numbers had to be re-read later.

**Do instead.** Ship links with the page. Set the measurement window from the day the links go
live.

---

## 9. Padding content to fill a reusable layout

**What happened.** A four-card layout was proposed for a block that had two real links, with the
remaining two pointing at pages that did not exist yet.

**Do instead.** Use fewer cards. A half-used layout is fine; a dead link is not. Reuse is a
convenience, never an obligation.

**It happened again on the very next page, after this entry was written.** A 2+2 bento was used
with two tiles, each holding two lines of text, leaving two card-sized holes. Saying "reuse is
optional" is not enough, because the pull does not come from the layout - it comes from having
harvested five sections before deciding how many blocks the page needed. See #11.

---

## 10. Shipping an inventory inside a durable document

**What happened.** Early drafts of the build plan carried the store's section list and slot
counts as if they were stable facts.

**Do instead.** Durable documents carry method. Inventories go in the per-project plan file with
a measurement date attached, or they are re-measured on the spot.

---

## 11. Letting the harvest decide the page

**What happened.** Five layouts were saved as global sections, then the page was designed to use
all five. The result: a paragraph got promoted to a full section (see #12), a 4-tile bento ran
with 2 tiles, and two blocks ended up saying the same thing. Nothing forced any of this; the page
simply grew one block per available layout.

**Why it happens.** A list of harvested sections reads like a list of work items. Publishing them
also costs slots, which makes leaving one unused feel wasteful - so it gets used.

**Do instead.** Write the block list from the content first: one line per block, each naming the
question that block answers. Then harvest exactly that many layouts. A harvested section left
unpublished costs nothing and is there for the next page.

---

## 12. Promoting a paragraph into a section

**What happened.** The copy document specified a short honesty block as *a closing paragraph at
the end of the table section*. The layout document turned it into a full-width three-column
section with icons, one column per sentence. It filled a whole viewport with three negative
statements, two of which repeated content from the block directly above it and from the FAQ.
Nobody decided to promote it; a 3-column layout was on hand and the paragraph had three clauses.

**Do instead.** The copy document's own structural wording is binding: "paragraph at the end of
section N" means a paragraph, not a section. When a layout seems to fit a piece of copy suspiciously
well, check whether the copy was ever meant to be that size.

**Related check.** Before locking a block list, read it as a list of questions. If two blocks
answer the same question, one of them is redundant regardless of how different they look.

---

## 13. Splitting one page's spec across several files

**What happened.** Three files described the same page: a layout spec, a build order, and the
custom HTML fragment. They disagreed on block order, on how many tiles a bento used, and on how
many tables the HTML block contained. Each had been edited separately, minutes apart. Picking up
the work meant reconciling them before anything could be built.

**Do instead.** One file is the page spec. Everything else references it by block number and does
not restate its content. When a decision changes, it changes in one place. A build order that
repeats the spec's structure is a second spec pretending to be a checklist.


---

## 14. Starting a build without stating the project's tool rule

**What happened.** The operator asked for Playwright. `pagefly-browser-tester` already says
chrome-devtools for every PageFly surface. The rule was not raised, and the session spent over an
hour on a relay where every click timed out and every DOM read took minutes. Switching to
chrome-devtools made the same operations take seconds.

**Do instead.** When a tool is requested for a surface that already has a documented tool rule,
say so before starting, with the reason and the cost, then let the operator decide. Silently
complying is not neutral; it spends their time.

**Related.** The reason recorded in that skill was wrong — it said Playwright cannot reach the
cross-origin app iframe. It can. The real problem is speed and click stability. A wrong reason
invites the next person to retry and lose the same hour. Corrected in `pagefly-browser-tester`
on 2026-08-25; details in `automating-the-editor.md`.

---

## 15. Treating the outline as the source of truth for what a section contains

**What happened.** A routine emptied one duplicated section, then reported the second one
"empty after 0" and moved on. The second section still had all six children — the outline node
was collapsed, so its children were not in the accessibility tree at all.

**Do instead.** The outline lists expanded branches only. To assert a section is empty, read the
sandbox DOM, or expand the node first and then count.

---

## 16. Editing only the variant you can see

**What happened.** The harvested hero contained four buttons, two of them hidden on desktop and
shown at smaller breakpoints. Both visible buttons were rewritten and the section was called done.
Mobile would still have said "Start for free" and "Book demo".

**Do instead.** Before declaring a harvested section rewritten, scan its outline for siblings
carrying the hidden marker and rewrite those too. Harvested sections routinely carry per-device
duplicates that the canvas never shows at the current width.

---

## 17. Assuming an unsync stuck

**What happened.** Four sections were unsynced in one batch and the batch reported success for
all four. A later snapshot showed the fourth had reverted to a global section, with its unsync
confirmation dialog open again. Had the page been saved in between, the build would have been
silently wrong.

**Do instead.** Re-read every section's type after an unsync batch and before saving. Treat a
routine's own success log as a claim, not as verification.

---

## 18. Leaving the un-automatable steps until the end

**What happened.** Element insertion turned out to be impossible for a browser agent (the variant
tile detaches on hover; six approaches failed across two tools). The plan was to finish everything
else and hand the drags over at the end. That is two handoffs, not one: the person drags the
elements, then the agent has to come back and fill their content.

**Do instead.** Work out which elements cannot be created by machine at the moment the layout is
locked, and collect them into **one** batch handed over in the middle of the build: agent builds
the skeleton, person does all the drags in one pass, agent fills everything. One interruption.

**Corollary for layout choices.** Choosing `Custom.HTML` for a block is choosing a manual step,
because the element has to be dragged in by hand. Not a reason to avoid it, but it belongs in the
estimate.

---

## 19. Handing over a page spec that is only layout plus copy

**What happened.** The spec listed the final copy and which harvested section each block used.
It did not say which existing string each new string replaced, which inherited leftovers to
delete, or which blocks needed elements that do not exist yet. All three had to be re-derived
during the build, one element at a time.

**Do instead.** A page spec ready for a machine build has three parts, not two: the block list,
the copy, **and** a per-element mapping — old string → new string, "delete these", and "needs a
new element". The third part is what turns the build into mechanical work.

---

## 20. Accepting a `Custom.HTML` block on the editor canvas

**What happened.** A dark table block rendered correctly in the editor: header row readable, no
column dividers. On the preview URL the header row was near-white with invisible white text and
every cell carried grey borders. The block's own CSS was fine. The storefront serves an unscoped
inline `<style>` (blog article CSS) that hits `table thead` and `th, td`, and the editor canvas
never loads it.

**Do instead.** Treat the canvas as a false negative for anything inside `Custom.HTML` - the same
class of trap as the collapsed `<script>`. Open the preview URL before calling the block done, and
pre-flight the theme's bare-tag rules while writing the CSS rather than after it breaks. A scoped
class prefix does not protect a raw `<td>` from a rule that targets `td`; scoping stops page CSS
reaching in, not theme CSS reaching your tags.

---

## 21. Rebuilding an existing element from the plan file

**What happened.** A request to delete two table rows and one card from a live `Custom.HTML` block
was answered by regenerating the block from the mock in `plans/`. The mock and the element had
drifted: the live element held both tables plus the CTA and its note, the mock held one table.
Pasting the regenerated block wiped the other table and the CTA. Four round trips to recover the
original, which had been sitting in the editor's code panel the whole time.

**Do instead.** To edit an element that already exists, copy its current code out of the editor's
code panel and edit that. The file in `plans/` records design intent at build time, not what the
element contains today. Rule 0 again: a stored copy is a snapshot, not a fact.

---

## 22. Building the `Custom.HTML` fragment as if it were the whole section

**What happened.** The signals-table fragment for `/pages/aeo` opened with
`.pfaeo{background:#030712;padding:104px 0}` and `.pfaeo__w{max-width:1216px;padding:0 32px}` -
a complete, well-formed section. The trouble is that PageFly had already put it inside one. The
wrapping `FlexSection` was contributing 128px of vertical padding and a 1200px content row of its
own, so the block shipped **104px taller at each edge and 32px narrower at each side** than every
other block on the page. It rendered perfectly in isolation, which is exactly why nobody caught it:
the operator did, by eye, on the preview, twice - first the vertical gap, then the side gutter.

**Why it happens.** The fragment is authored as a standalone file and previewed as a standalone
file. Nothing in that loop shows the container it will actually live in, and a self-contained
fragment is otherwise the correct instinct - the skill asks for one. The word "self-contained"
covers CSS scoping; it does not mean "brings its own box".

**Do instead.** Scope the CSS, own the contents, own nothing outside them: no vertical padding, no
side gutter, no max-width, no background. Then verify rather than assume - compare the fragment's
left and right edges against the content row of a neighbouring section on the preview URL, and
compare the section's rendered height against its neighbours. Both numbers are in
`pagefly-editor-mechanics.md` along with the check.

**Related.** The same "authored in isolation" blind spot produced the Vietnamese `<!-- -->` header
that would have shipped into the public page source, and the `rem` units that render at 87.5% under
the theme's `html{font-size:14px}`. All three are one habit: the fragment file is not a document,
it is a fragment.

---

## 23. Believing a negative result from your own tooling

**What happened.** Twice in one session, a tool reported an absence that was not real, and both
reports looked like findings rather than failures.

A bulk fetch of the store came back as the CDN's bot-challenge page, served with `200`. Every
subsequent search over those files answered "not found", and one of those non-answers - "the
pricing page never mentions this feature" - was nearly written into a report.

Later, a shell loop reported two files as missing from a branch. Run directly, one command at a
time, the same check found both. The loop had swallowed its own error.

**Why it keeps happening.** A negative result arrives in the same shape as a positive one: no
error, no warning, just an empty list. Absence reads as information. And unlike a wrong positive,
nothing downstream contradicts it - you simply proceed on a page of the world that has a hole in
it.

It is worse here than in most work because the deliverable is claims about a product. A false
absence becomes "the feature does not do X" on a public page.

**Do instead.** Never accept "X is not there" from your own tooling without a **positive control**:
run the same pipeline against something you already know is present. If it cannot find that, the
pipeline is broken and the absence means nothing.

Cheapest forms of the control:

- Searching pages for a string: first search for a string you can see on that page yourself.
- Checking whether a file exists on a branch: run the check directly on one path before trusting a
  loop over many.
- Any bulk fetch: check one file's size or title before searching all of them - see
  `measure-a-page.md` step 0.

**Related.** Same family as #15 (the collapsed outline node that made a section look empty) and #20
(the editor canvas that made a broken block look fine). All three are a tool answering a narrower
question than the one you asked, and the answer looking exactly like the one you wanted.
