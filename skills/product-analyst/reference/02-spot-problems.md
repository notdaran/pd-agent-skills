# Stage 2 — Spot (Anomaly + Rule Out Tracking Artifacts FIRST)

> **Non-negotiable #2 (restated):** **Rule out tracking artifacts before trusting any drop.**
> When a metric moves, the FIRST question is *"real behavior change, or a tracking/instrumentation
> artifact?"* You do not get to tell a root-cause story until the number is proven real.

**Purpose:** Detect anomalies and **defend against the dashboard fallacy** — the habit of believing a
chart because it's on a dashboard. Many "drops" and "spikes" are instrumentation bugs, not user behavior.
This is the skill's sharpest discipline: a wrong number sends Stages 3–4 chasing a ghost.

---

## The decision rule (do this every time a metric moves)

```
Metric moved
   │
   ├─ 1. Run the red-flag checks below  ──► any logical impossibility?
   │        YES → it's a TRACKING ARTIFACT until proven otherwise. STOP.
   │              Fix instrumentation (see event-audit) before diagnosing.
   │        NO  → continue
   │
   ├─ 2. Could a recent deploy / SDK change / property rename explain it?
   │        YES → suspect artifact; confirm against raw events before believing.
   │
   └─ 3. Number survives the checks → treat as a REAL anomaly → go to Stage 3 (Diagnose).
```

For deep tracking forensics (which event fires, where, how many times), hand to the **`event-audit`** skill —
it maps events → fire sites → user journey. This stage decides *whether to trust the number at all*.

---

## Red-flag catalog — logical impossibilities (each = a tracking bug until proven otherwise)

If any of these is true on a board, the data is wrong, full stop — no real user behavior can produce it.

| Red flag (impossible) | Why it's impossible | Usual tracking cause | How to confirm |
|---|---|---|---|
| **WAU > MAU** (or DAU > WAU > MAU order violated) | A weekly-active user is by definition also monthly-active; the bigger window must contain the smaller | Different dedup windows, mismatched user-id, timezone bucketing, or counting events not unique users | Recompute all on the same unique-user definition + same timezone; check DAU ≤ WAU ≤ MAU holds |
| **Conversion rate > 100%** | You can't convert more users than entered | Numerator counts **total events**, denominator counts **unique users** (re-entries inflate numerator) | Make numerator and denominator the same unit (both unique users), then recompute |
| **Time-to-convert = 0** (or negative) | Two real actions can't occur at the same instant; convert can't precede start | Same event used for both funnel steps; clock skew; server vs client timestamp mix | Inspect raw timestamps for a few users; ensure start and convert are distinct events |
| **A funnel step has MORE users than the step before it** | You can't reach step N without passing step N−1 | Step events fired independently / out of order, or re-entry counted as new entries | Enforce step ordering on unique users; check if a later step can fire without the earlier one |
| **A sub-segment's unique users > the total** | A part can't exceed the whole | Overlapping/duplicated segment definitions, double-counting users in multiple buckets, or a broken filter | Sum sub-segments and compare to total; check segment definitions are mutually exclusive where assumed |

> Other tells in the same family: a rate that exceeds its own maximum, a "% of total" column summing to >100%,
> a count that exceeds the population, or retention going *up* in a later week without re-acquisition.

**On a board these look like:** a line that jumps to an implausible value, a funnel that widens downstream,
a conversion bar past the 100% gridline, or a breakdown whose parts add up to more than the whole.

---

## Real anomaly vs noise

Once the number survives the red-flag checks, separate a **real drop** from **random variation**:

- Compare against the **expected band / baseline** from Stage 1, like-for-like (seasonality removed).
- Small movements on small samples are usually noise. Before escalating, ask whether the change is
  **statistically meaningful** — confirm with a significance test (Stage 5: Z-test for proportions/CR,
  T-test for averages) rather than reacting to one wiggle.
- A real anomaly is *outside the band* AND *not explained by an artifact* AND *not just sampling noise*.

---

## Output of Stage 2

State, explicitly, one of:
1. **Artifact** — "this drop is a tracking bug (red flag: ___); not real. Fix instrumentation (→ event-audit)
   before any diagnosis." (decision-oriented, non-negotiable #8)
2. **Real anomaly** — "passed all red-flag checks, outside the expected band, not noise → real. Handing to
   Stage 3 to locate where it breaks."
3. **Noise** — "inside the band / not significant → no action; keep monitoring (Stage 1)."
