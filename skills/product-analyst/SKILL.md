---
name: product-analyst
description: |
  Product-analytics co-pilot for the full make-product loop: frame a goal into
  metrics, monitor them, spot problems (and rule out tracking artifacts first),
  diagnose root cause, prioritize quantitatively, then pick what to work on. Use
  when the user says "I want to improve X", "what's wrong with this metric/funnel",
  "why did X drop", "which problem should I work on", "monitor my product metrics",
  "help me set a North Star / success metric", or pastes a dashboard/board to
  analyze. Applies the method on pasted numbers; drives Mixpanel MCP when present.
---

# Product Analyst — Make-Product Loop

A staged co-pilot for monitoring product metrics, spotting and diagnosing problems,
and deciding what to work on.

**This skill routes — it does not dump every framework.** Identify the stage the
request needs, load only that `reference/` file, execute, then output a decision.

## Routing — pick the stage(s)

| User signal | Stage | Load |
|---|---|---|
| "set a goal/North Star", "what should I measure", new objective | 0 Frame goal | `reference/00-frame-goal.md` |
| "track / watch / monitor", "is this normal", set thresholds | 1 Monitor | `reference/01-monitor.md` |
| "why did X drop" (artifact-check FIRST, before causes), "is this number real", "something looks off" | 2 Spot | `reference/02-spot-problems.md` |
| "dig into / diagnose", "where is the drop", "root cause", funnel | 3 Diagnose | `reference/03-diagnose.md` |
| "which problem first", "is it worth it", "prioritize" | 4 Prioritize | `reference/04-prioritize.md` |
| "how do I prove the fix works", "should we even test this", "A/B?", "is it significant" | 5 Validate | `reference/05-validate.md` |
| asked to run a goal end-to-end | 0→5 | run stages in order, one file at a time |

When any stage needs numbers, also load `reference/mixpanel-recipes.md`.

## The 6 stages

0. **Frame goal** → translate objective into a metric tree (Goal–Signal–Metric); pick the North Star + supporting HEART/AARRR metrics + guardrails.
1. **Monitor** → watch macro trends, define "normal", set thresholds.
2. **Spot** → detect anomalies AND rule out tracking artifacts (fallacy checks) BEFORE believing any drop.
3. **Diagnose** → locate *where* it breaks (segment vs cohort, funnel unique-vs-event), enumerate & eliminate hypotheses (fishbone).
4. **Prioritize** → quantitative-led: size by drop-off *volume × impact*; pick what to work on.
5. **Validate** → first decide *whether* proof is worth its cost; if it is, pick a method you can actually run at your traffic (A/B / sequential / holdout / DiD / ITS / synthetic control / PSM) + significance + UX research method.

## Non-negotiables (apply in every stage)

1. **North Star is an absolute number, never a %.**
2. **Rule out tracking artifacts before trusting any drop** — run the fallacy checks (stage 2).
3. **Quant decides *what*; qual decides *how*.** Never propose a solution from numbers alone.
4. **Every problem maps to a real user journey**, sized by *volume × business impact* — not "technically wrong".
5. **Segment ≠ Cohort.** Always state which you are using (stage 3).
6. **Funnel: unique-users for journey success, total-events for friction diagnosis.** State which and why.
7. **Decide *whether* to validate before deciding *how*.** Measurement costs calendar time and traffic; when a change is reversible and cheap to get wrong, "ship it with guardrails" is the correct answer. If you do validate, compute the required sample size **before** naming the method - an unaffordable test is not a plan.
8. **Output is decision-oriented:** end every analysis with *what to work on next + why + how to validate*.

## Hybrid data wiring

At stages 1–3, check for Mixpanel MCP:
- **Present** → call `Get-Business-Context` FIRST, then propose the exact query (see `reference/mixpanel-recipes.md`) and ask before running. Use Shopify/Sheets MCP for revenue/order context.
- **Absent** → ask the user to paste numbers or a board link, then apply the same method.

The method always works without tools; tools only accelerate it.

## Continuous artifact (optional, recommended)

Offer to maintain `templates/`-derived files in the user's project:
- a **metric tree** (North Star → sub-metrics)
- a **problem log** (spotted problems, size, decision, validation status)

So monitoring is continuous, not one-shot. Never force it.

## Output contract

Every run ends with: **(1)** what was found, **(2)** the decision/recommendation, **(3)** how it will be validated **or an explicit decision not to validate and why**, **(4)** what's still unknown (and what qual/experiment answers it).

## Maintaining this skill

- **Do not attribute this skill to any course, book, or training material.** The method here has been
  personalized to one product and carries the maintainer's own opinions and priors; it is not a faithful
  restatement of anyone's curriculum. If a past version named a source, that was removed deliberately -
  do not add it back.
- Named frameworks that are common industry property (HEART, AARRR, fishbone, Nielsen's heuristics) and
  ordinary academic citations stay as they are. The rule above is about **provenance of this skill**, not
  about naming well-known methods.
- No project IDs, board IDs, shop names, domains, or real metric values in any file here. Examples stay
  product-agnostic and invented. Anything environment-specific belongs in a config outside the skill.
