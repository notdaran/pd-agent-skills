# Stage 0 — Frame the Goal (Goal → Metric Tree)

> **Non-negotiable #1 (restated):** The **North Star is an absolute number, never a %.**
> A percentage hides the size of the value you deliver. "Total orders delivered" is a North Star;
> "conversion rate" is not — it can rise while the business shrinks.

**Purpose:** Turn a fuzzy objective ("I want more activation") into a *metric tree*: one North Star,
the sub-metrics that move it, supporting health metrics (HEART or AARRR), and guardrails.

---

## Goal–Signal–Metric (the core translation)

Every metric must trace back to a goal through an observable signal. Never measure a number you
can't tie to a behavior, and never name a behavior you can't tie to an objective.

| Layer | Question it answers | Example |
|---|---|---|
| **Goal** | What is the ultimate objective? (qualitative) | "Users get to the value moment fast" |
| **Signal** | What observable behavior / feeling proves it's happening? | "Users reach the first successful action without giving up" |
| **Metric** | What unit do we count? (must be concrete & loggable) | "# users who complete their first core action in session 1" |

**Worked example.** Objective = *"new users should succeed early."*
- Goal: new users experience the product's core value in their first visit.
- Signal: they complete the action that delivers that value (not just sign up).
- Metric: **count of users completing the first core action within 24h of signup** (absolute number).

Rule: if you can't write all three rows, you don't yet have a measurable goal — keep refining.

---

## The North Star

The single number that best reflects the **core value delivered to users**, accumulated.

**Tests a North Star must pass:**
1. **Absolute number** (a count or sum), never a ratio/percentage.
2. Reflects value *received by the user*, not effort or vanity (not "page views").
3. **Decomposes** into a few actionable sub-metrics you can actually move.
4. Goes up only when users are genuinely better off.

| Product type | Good North Star (absolute) | NOT a North Star (why) |
|---|---|---|
| Learning app | Total lessons completed / week | "Completion rate %" — can rise as users churn |
| Marketplace | Total orders delivered / week | "Checkout conversion %" — ignores total volume |
| Collaboration tool | Total active documents created / week | "% of signups who create a doc" — hides scale |

**Counter-example to internalize:** a 90% conversion rate on 10 users is worse than 30% on 100,000.
The percentage looks better; the absolute value delivered is 9 vs 30,000. North Star = the 30,000.

### Decompose it
North Star = (driver A) × (driver B) … Break it into the smallest set of inputs you can influence,
e.g. *Total core actions = (active users) × (actions per active user)*. Each input becomes a sub-metric
you monitor in Stage 1.

---

## Google HEART (feature / experience health)

Pair **qualitative** satisfaction with **quantitative** behavior — one without the other lies.

| Dimension | What it captures | Example signal | Example metric |
|---|---|---|---|
| **Happiness** | Subjective satisfaction (qualitative) | Users rate the flow positively | NPS / CSAT / survey score |
| **Engagement** | Depth of use | Users return and do more per visit | Actions per active user |
| **Adoption** | New uptake | New users try the feature | # new users using feature / week |
| **Retention** | Staying over time | Users keep coming back | % of a cohort active in week N |
| **Task Success** | Can they complete the job? | Users finish the core task | Task completion count + time-on-task |

> Always track **Happiness (qual)** next to **Engagement/Retention (quant)** — behavior tells you
> *what*, satisfaction tells you *whether they liked it*. Stage 4 uses exactly this split.

---

## AARRR (Pirate — journey / funnel framing)

Acquisition → Activation → Retention → Referral → Revenue.

| Stage | Question | Typical metric (absolute) |
|---|---|---|
| Acquisition | Do they show up? | # new visitors / signups |
| Activation | Do they reach first value? | # users hitting the "aha" action |
| Retention | Do they come back? | # users active again in week N |
| Referral | Do they bring others? | # invites sent / accepted |
| Revenue | Do they pay? | # paying users / total revenue |

**When to prefer which:** use **AARRR** when the question is about the *journey* (where do users drop
between stages?) — it feeds Stage 3 funnels directly. Use **HEART** when the question is *feature/experience
health* (is this surface good?). They overlap; pick the one that frames the current objective most cleanly.

---

## Guardrail metrics

Metrics that **must not regress** while you push the North Star. They stop you from "winning" the North
Star by harming users elsewhere.

- Examples (generic): error rate, support ticket volume, load time, churn rate, refund rate.
- Rule: name 1–3 guardrails *before* optimizing. Every Stage 4 decision checks them, and Stage 5 checks them
  whether the change is formally tested or simply shipped and watched.

---

## Output of Stage 0

Fill in **`templates/metric-tree.md`**: North Star (absolute) → inputs → HEART/AARRR supporting metrics
→ guardrails. This becomes the standing reference Stage 1 monitors against.

**End decision-oriented (non-negotiable #8):** state the chosen North Star, its top 2–3 input sub-metrics,
the guardrails, and *what you'll watch first* in Stage 1.
