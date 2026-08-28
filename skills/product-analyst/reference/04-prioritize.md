# Stage 4 — Prioritize (Quantitative-Led, Size by Volume × Impact)

> **Non-negotiable #3 (restated):** **Quant decides *what*; qual decides *how*.** Never propose a solution
> from numbers alone.
> **Non-negotiable #4 (restated):** Every problem maps to a **real user journey**, sized by **volume ×
> business impact** — not "technically wrong".

**Purpose:** Turn a list of diagnosed problems into a ranked shortlist and **pick the 1–2 to work on now**.
The quantitative evidence chooses *what* to fix; the qualitative work (Stage 5) figures out *how*.

---

## The quantitative-led rule

Decide **what** to fix from the numbers — typically the funnel step (or segment/cohort) with the **highest
drop-off VOLUME**: the absolute count of users lost, **not** the highest percentage. Then, and only then,
use qualitative evidence to design *how* to fix it.

> Quant tells you the step that loses 12,000 users/month is the biggest prize. Qual tells you *why* they
> leave and therefore *what change* will keep them. Skipping straight from a number to a solution is the
> classic mistake non-negotiable #3 forbids.

---

## Sizing each problem

For every candidate problem from Stage 3:

```
Problem size  =  (users affected / volume)  ×  (business impact on North Star or revenue)
```

- **Users affected / volume** — absolute count lost at that step / in that slice (per week or month).
- **Business impact** — how much each lost user costs the North Star or revenue (an activation leak ≠ a
  referral leak in value). Weight by where on the journey it sits and what it gates downstream.

### Ranking table (product-agnostic worked example)

| Problem (user-journey framing) | Drop-off rate | Users affected / mo | Value per user | **Size (volume × impact)** |
|---|---|---|---|---|
| Step 2 → 3: setup screen stalls | 12% | **12,000** | medium | **highest** |
| Niche import flow fails | **60%** | 400 | medium | low |
| Step 4 → 5: payment friction | 8% | 6,000 | **high (revenue)** | high |
| Onboarding tooltip ignored | 20% | 1,500 | low | low |

Read the table: the **60%** "import flow" looks scariest but affects 400 users — it loses far fewer people
than the unglamorous **12%** setup stall hitting 12,000. Rank by the **Size** column, never the rate column.

---

## The volume-vs-rate trap

A scary **percentage on a tiny segment** routinely loses to a **modest percentage on a huge segment**.
Always convert rates to **absolute impact** before ranking.

| Slice | Rate | Population | Absolute users lost |
|---|---|---|---|
| A (niche) | 60% | 400 | 240 |
| B (mainline) | 12% | 100,000 | **12,000** |

B wins by 50×, despite the smaller percentage. If you ranked by rate you'd fix the wrong thing.
(Mirror of Stage 0: a high % on few users is not value.)

---

## Choosing what to work on

1. Rank candidates by **Size** (volume × impact).
2. Adjust for **confidence** (how sure is the diagnosis?) and **effort-fit** (cost/feasibility now).
3. Pick the **1–2** with the best *size × confidence × effort-fit*.
4. **Explicitly defer the rest** to `templates/problem-log.md` — they're not dropped, they're queued.
5. For the chosen problem, name the **qualitative question** that unlocks the *how* (e.g. "*why* do users
   abandon the setup screen?" → usability test / session replay / survey in Stage 5).

---

## Output of Stage 4

- **Ranked shortlist** (the table, by Size).
- **The single chosen problem** (user-journey framing + its size).
- **The qual question** that unlocks the fix (→ Stage 5 picks the method).
- **Deferred problems** logged to `templates/problem-log.md`.

**End decision-oriented (non-negotiable #8):** "Work on [chosen problem] — it loses ~N users/mo × [impact].
The *how* hinges on [qual question]; Stage 5 decides whether that needs a formal test or ships with guardrails.
Deferred: [list] → problem log."
