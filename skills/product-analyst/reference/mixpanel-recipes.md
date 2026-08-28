# Mixpanel Recipes — Hybrid Data Wiring per Stage

> **Purpose:** Keep `SKILL.md` lean. This file holds the concrete query shapes per stage so the method can
> *drive* Mixpanel when it's present. **The method works without any tool** — these only accelerate it.

> **Always call `Get-Business-Context` FIRST.** Per the Mixpanel MCP's own instruction, it is the first tool
> in any new conversation: it defines project nicknames, internal acronyms, product/team names, and which
> events and properties matter — things you cannot infer from tool names. Skipping it leads to the wrong
> project and wasted calls. Call it before *any* query, then propose the exact query and **ask before running.**

> **Subagent caveat (mirror `event-audit`):** Mixpanel MCP tools run in **main context only**. If this stage
> runs inside a subagent, **do not call the tools** — instead tell the user exactly which pull to run and ask
> them to paste the result back. Same for Shopify / Sheets MCP.

---

## Per-stage recipe map

### Stage 1 — Monitor (macro trends)
Goal: trend lines of North Star + key inputs + guardrails at altitude.
- `Get-Business-Context` → learn the real event/property names.
- `Get-Metric` / `List-Metrics` → pull defined North Star & input metrics if they exist.
- `Run-Query` or `Get-Report` → macro **trend series** (weekly/monthly) for each macro metric; same
  baseline window and timezone for all so DAU ≤ WAU ≤ MAU stays comparable.

### Stage 2 — Spot (rule out artifacts FIRST)
Goal: get the suspicious metric **and its denominator in the same unit** to run the red-flag checks.
- Pull the moved metric **and** its base/denominator (e.g. converters *and* entrants) — both as **unique
  users** — so you can test for CR > 100%, funnel widening, WAU > MAU, sub-segment > total.
- `Get-Issues` → surface known data-quality / tracking issues Mixpanel has already flagged.
- If a red flag appears → it's a tracking artifact; hand to the **`event-audit`** skill for fire-site forensics
  before any diagnosis.

### Stage 3 — Diagnose (where it breaks)
Goal: localize the drop by dimension, in the correct counting mode.
- **Funnel query** — *explicitly choose the mode* (non-negotiable #6): **unique-user** funnel for journey
  success; **total-event** counts for friction / attempts-per-success. State which in the request.
- **Breakdown** the funnel/metric by a **segment** property (plan, geography, device) vs a **cohort**
  (behavioral) — name which (non-negotiable #5).
- **Retention / cohort report** → for retention-shaped drops; define the cohort by an in-app action.
- `List-Properties` / `Get-Property-Values` → confirm the real breakdown dimensions before slicing.

### Stage 5 — Validate (decide whether to prove it, then how)
- **Gate 1 (sample size) comes first.** Pull the **baseline rate** and the **weekly eligible population**
  for the target metric before proposing any test, so `n per arm ~= 16 p(1-p)/d^2` can be computed. If the
  required exposure exceeds what the population supplies in an acceptable window, A/B is off the table —
  say so instead of proposing it.
- **Pre-trend series** → for **DiD**, pull the metric for exposed *and* control groups over the **pre-period**
  and plot it. Parallel trends is an assumption to verify, not to assume; if the lines diverge before the
  change, DiD is invalid.
- **Single long series** → for **interrupted time series** (global rollout, no control): the metric at a
  consistent grain across a long pre-period, so the pre-trend and seasonality can be modelled.
- **Many comparable units** → for **synthetic control**: the same metric per un-exposed unit (shop, region,
  cohort) across the pre-period, to build a weighted control.
- **Cohort exports** → matched groups for a **holdout** readout, or for **PSM** (adopters vs nearest
  non-adopters by past behavior + demographics). Flag PSM output as suggestive, not causal.
- **Experiments** → `List-Experiments`, `Get-Experiment`, and the experiment setup / results-interpretation
  guidance tools for A/B readouts and significance.

**Revenue / order context:** use **Shopify** MCP (orders, analytics query) and **Sheets** MCP for the
business-impact half of Stage 4 sizing when revenue lives outside Mixpanel.

---

## Fallback — when no MCP is present

Apply the identical method on pasted numbers. Ask the user for exactly:

| Stage | Ask the user to paste |
|---|---|
| 1 Monitor | The macro report/board: metric names + trend values + the baseline window |
| 2 Spot | The moved metric **and its denominator** (same unit), plus any sub-segment breakdown, so red-flag checks run |
| 3 Diagnose | The **funnel** step counts (and whether they're unique-users or total-events), plus the breakdown dimension and whether it's a **segment** or **cohort** |
| 4 Prioritize | Per problem: drop-off step, **absolute** users affected, and the revenue/North-Star impact |
| 5 Validate | The **baseline rate + weekly eligible population** (for the sample-size gate), then group sizes, the metric per group, the **pre-period series** if DiD/ITS, and the time window |

Always restate which **unit** (unique users vs total events) and which **denominator** the numbers use —
the method depends on it.
