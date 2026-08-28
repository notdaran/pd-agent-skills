# Stage 3 — Diagnose (Locate Where It Breaks, Eliminate Hypotheses)

> **Non-negotiable #5 (restated):** **Segment ≠ Cohort.** Always state which you're using.
> **Non-negotiable #6 (restated):** Funnel — **unique-users** for journey success, **total-events**
> for friction diagnosis. State which mode you're in and why.

**Prerequisite:** Only enter Stage 3 after Stage 2 confirmed the number is **real** (not a tracking
artifact). Diagnosing a fake drop wastes the whole loop.

**Purpose:** Pin down *where* the metric breaks (which users, which step) and **systematically eliminate**
candidate causes until one survives. This stage finds the **where** (quant); the **why** often needs qual
(Stage 5).

---

## Exploratory breakdown — do this BEFORE brainstorming causes

Before guessing solutions, break the macro metric down by dimensions to isolate where the drop is worst.
Slice by, in order of usual payoff:

| Dimension | Question it answers |
|---|---|
| **Time** | When did it start? Sharp (deploy/outage) or gradual (market)? |
| **Funnel step** | Which step lost the most users? |
| **Segment** (real-world attributes) | Which kind of user is affected? (plan, geography, device) |
| **Cohort** (in-app behavior) | Which behavior-defined group is affected? |

The dimension where the drop concentrates tells you where to aim. A drop that's uniform everywhere usually
points to a technical/global cause; a drop localized to one slice points to UX or that slice's context.

---

## Segment vs Cohort (state which — non-negotiable #5)

| | **Segment** | **Cohort** |
|---|---|---|
| Defined by | Real-world **attributes / demographics** | Actual **in-app behavioral actions** |
| Examples | Age, profession, geography, plan tier, device, channel | "Clicked feature X", "saved >5 items", "completed onboarding step 2" |
| Answers | *Who* (what kind of person) is affected | *What behavior* correlates with the outcome |
| Use when | You suspect the problem is tied to a user type or context | You suspect the problem is tied to what users did/didn't do |

Always name it out loud: "Breaking down by **cohort** (users who saved >5 items)…" — because a finding about
a *segment* (e.g. "mobile users") implies a different fix than a *cohort* (e.g. "users who skipped setup").

---

## Funnel analysis — two modes (state which — non-negotiable #6)

The same funnel answers two different questions depending on the counting unit:

| Mode | Counting unit | Answers | Watch out for |
|---|---|---|---|
| **Journey success** | **Unique users** | "What share of people who started actually finished?" — overall conversion | Dedups re-entries; the honest top-of-funnel success number |
| **Friction diagnosis** | **Total events / conversions** | "Where and how hard do users struggle?" — repeated attempts reveal sticky steps | Re-entry (multiple attempts) inflates event counts and distorts time-to-convert |

**Re-entry is the trap.** When users retry a step, **total events** balloon and **time-to-convert** stretches
or collapses unpredictably. So: use **unique users** to state how many people succeeded; switch to **total
events** to see which step they fight with (high attempts-per-success = friction). Never mix the two in one
claim.

---

## Fishbone (cause–effect) — enumerate, then ELIMINATE

Put the **negative metric (effect)** at the head of the fish; branch candidate causes along the bones;
then systematically **eliminate invalid hypotheses** until one survives. You're not brainstorming fixes —
you're ruling out causes with evidence.

```
                        Bug ─────────┐
                                     │
                   UX / usability ───┤
                                     │
              Marketing / channel ───┼────────────►  EFFECT:
                                     │                <metric> dropped X% since <date>
        Motivation / user intent ────┤
                                     │
        External / market / seasonal ┘
```

**Reusable bones (adapt per case):**
- **Bug / technical** — broke at a deploy? errors up? one platform only?
- **UX / usability** — a step got harder, confusing copy, new friction, broken affordance?
- **Marketing / channel / acquisition** — traffic mix changed? lower-intent source surged?
- **Motivation / user intent** — did the *kind* of user or their goal shift?
- **External / market / seasonal** — holiday, competitor, macro event?

**Elimination loop:**
1. List every plausible cause on a bone.
2. For each, ask: *what would I see in the data if THIS were the cause?*
3. Check that prediction against the exploratory breakdown.
4. **Cross out** every hypothesis the data contradicts.
5. The cause(s) the evidence can't eliminate = your suspect(s). If several survive, you've found the
   *where*; the *why* may need qual (Stage 5).

---

## Hand-off → Stage 5

The breakdown + funnel give you the **where** (quant). The **why** a step is hard usually needs qualitative
evidence — flag the open question for Stage 5 (e.g. "users abandon step 3; *why* needs usability testing or
a survey").

**End decision-oriented (non-negotiable #8):** "The drop concentrates in [segment/cohort, named] at [funnel
step], measured by [unique users / total events, named]. Surviving hypotheses: ___. Open *why* question for
qual: ___ → Stage 4 to size it, Stage 5 to validate."
