# product-analyst

A Claude / agent **skill** for the make-product loop: turn a fuzzy objective
into metrics, watch them, notice when something breaks, work out where and why,
decide what to fix first, and decide how much certainty that decision is worth
buying.

It is a method, not a renderer. No build step, no dependencies - six staged
reference files the agent loads one at a time, plus the query shapes to drive
Mixpanel when it is connected. Everything works on numbers pasted into the chat
if it is not.

---

## The six stages

The skill routes: it identifies which stage a request needs and loads only that
file, rather than dumping every framework it knows.

| Stage | Question it answers |
|---|---|
| **0 Frame goal** | What is the North Star, what moves it, what must not regress |
| **1 Monitor** | What does "normal" look like, and what threshold means investigate |
| **2 Spot** | Is this drop real, or is it a tracking bug |
| **3 Diagnose** | Where does it break: which users, which step |
| **4 Prioritize** | Which problem is actually the biggest, in absolute users |
| **5 Validate** | Is proof worth its cost here, and if so what method can I actually run |

## What makes it more than a prompt

Eight non-negotiables the agent applies at every stage. The four that change
answers most often:

- **The North Star is an absolute number, never a percentage.** A 90% conversion
  rate on 10 users is worse than 30% on 100,000. The skill refuses to let a rate
  stand in for the value delivered.
- **Rule out tracking artifacts before believing any drop.** Stage 2 carries a
  catalog of logical impossibilities - WAU above MAU, conversion above 100%, a
  funnel step wider than the one before it, a sub-segment larger than the total.
  Each one is a tracking bug until proven otherwise, and no root-cause story is
  allowed until the number survives.
- **Rank by volume, not by rate.** A 60% failure on 400 users loses 240 people;
  a 12% failure on 100,000 loses 12,000. The unglamorous one wins by 50x. Stage 4
  converts every rate to absolute impact before ranking.
- **Decide whether to measure before deciding how.** See below.

## The two gates in front of A/B testing

Most analytics advice treats the experiment as the goal. Stage 5 puts two gates
in front of it, because the usual failure is not choosing the wrong test - it is
running a test that was never going to answer anything.

**Gate 0 - is a causal estimate worth buying?** If the change is reversible, cheap
to get wrong, and the result would not change your next move, the correct output
is *ship it, name the guardrails, set a review date* - and say out loud that you
chose not to measure. That is a legitimate answer, and the skill will give it.

**Gate 1 - the sample-size gate.** Before A/B can even be named, the required
exposure gets computed:

```
n per arm  ~=  16 x p x (1 - p) / d^2      (80% power, 95% two-sided)
```

At a 0.5% baseline, detecting a 20% relative lift needs about **80,000 users per
arm**. If your product does not supply 160,000 exposed users in an acceptable
window, A/B is off the table - not "harder", off. The skill says so instead of
proposing a test that will end in a shrug six weeks later.

Only past those gates does it reach the method table, which is ordered by
strength of evidence rather than convenience: A/B, sequential or Bayesian
stopping, holdout and staged rollout, difference-in-differences, interrupted
time series, synthetic control, and propensity score matching last. Every row
names its own failure mode - DiD is invalid unless you plot the pre-period and
see parallel trends; PSM only removes confounders you observed, and matching on
a propensity score can increase imbalance rather than reduce it.

Alongside them sit the cheap substitutes that a well-powered experiment often
crowds out for no good reason: five usability sessions, a fake door, a day of
dogfooding.

## Not for

Instrumentation forensics - which event fires, from where, how many times. This
skill decides whether to trust a number; tracing it to its fire sites is a
different job.

It also does not design your product. Quant chooses *what* to fix; the *how*
comes from qualitative work, and the skill will keep saying so.

## Requirements

None. No install step, no Node, no packages.

Mixpanel MCP is optional. Connected, the skill proposes the exact query per
stage and asks before running it. Not connected, it asks you to paste the
numbers and applies the identical method.

## Install

Ships as part of [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Data

Nothing environment-specific lives in this skill. No project IDs, no board IDs,
no domains, no real metric values - every example is invented and
product-agnostic. Anything specific to your setup belongs in a config outside
the skill folder.
