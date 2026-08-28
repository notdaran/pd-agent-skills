# Stage 1 — Monitor (Watch Macro Trends)

> **Non-negotiable #8 (restated):** Output is **decision-oriented**. A monitoring pass never ends with
> "here's a chart" — it ends with *nothing to do* or *anomaly found → go to Stage 2*.

**Purpose:** Watch the **long-term trend of macro metrics** so you can quickly spot when something breaks.
A monitoring dashboard is for **altitude, not detail** — its only job is to surface anomalies and let you
classify the likely cause class. Deep detail belongs in Stage 3 (Diagnose), not here.

---

## What a monitoring dashboard is for

| It IS for | It is NOT for |
|---|---|
| Long-term trend of a few **macro** metrics (North Star + key inputs) | Per-segment, per-feature deep slices (that's Stage 3) |
| Spotting an **anomaly** fast (e.g. a metric dropping toward ~0) | Proving root cause |
| Isolating the **cause class** (technical / market / UX) | Choosing what to fix (Stage 4) |
| Confirming "things are normal" at a glance | Vanity counts nobody acts on |

Keep it small. If a chart wouldn't change a decision, it doesn't belong on the monitoring board.

### Cause-class triage (the first cut when something moves)

When a macro metric shifts, classify the *kind* of cause before digging:

| Cause class | Looks like | Quick tell |
|---|---|---|
| **Technical failure** | Metric craters to ~0 or steps off a cliff at a deploy/time boundary | Sharp edge, lines up with a release or outage; often *all* segments at once |
| **Market / external shift** | Gradual or broad change across the whole base | Seasonality, holidays, a competitor, a channel change |
| **UX issue** | One step / surface / segment degrades while others hold | Localized to a flow or cohort |

A drop straight to zero is almost always **technical or a tracking artifact** — verify instrumentation
(Stage 2) before believing it.

---

## Defining "normal" and setting thresholds

You can't spot an anomaly without a baseline.

1. **Baseline window** — pick a stable recent period (e.g. trailing 4–8 weeks) as "normal".
2. **Seasonality** — compare like-for-like: weekday vs weekday, week-over-week, not Monday vs Sunday.
   Account for known cycles (weekends, holidays, billing days) before calling a dip an anomaly.
3. **Expected range** — define a band (e.g. baseline ± normal variation). Movement *inside* the band is
   noise; movement *outside* it is a candidate anomaly.
4. **Threshold to act** — set an explicit trigger ("WAU down >X% week-over-week, outside the band → investigate").
   Without a pre-set threshold, every wiggle either gets ignored or causes a fire drill.

> Tie "is this outside the band, or just noise?" to significance testing (Stage 5) when the signal is small.

---

## What to monitor (map to Stage 0)

Monitor the **North Star + its top input sub-metrics + guardrails** from `templates/metric-tree.md`,
and one macro metric per lifecycle stage:

| Lifecycle (AARRR) | Macro metric to watch | HEART angle |
|---|---|---|
| Acquisition | New users / signups (trend) | Adoption |
| Activation | Users reaching first value (trend) | Task Success |
| Retention | Cohort still-active in week N | Retention |
| Referral | Invites sent/accepted | Engagement |
| Revenue | Paying users / revenue | — |
| (Always) | Guardrails: errors, churn, latency, tickets | Happiness |

Watch absolute North Star and its inputs as **trend lines**, not single snapshots — a healthy snapshot can
hide a falling trend.

---

## Hand-off cue → Stage 2

When a metric breaks its threshold / leaves the expected band:

1. **Do not** start telling a root-cause story yet.
2. Go to **Stage 2 (Spot)** and first ask: *real behavior change, or a tracking/instrumentation artifact?*
3. Only after artifacts are ruled out do you escalate to Stage 3 (Diagnose).

**End of a monitoring pass (decision-oriented):** either "all macro metrics inside band — nothing to do"
or "metric X broke threshold Y on date Z, likely cause class = ___ → handing to Stage 2 to rule out a
tracking artifact."
