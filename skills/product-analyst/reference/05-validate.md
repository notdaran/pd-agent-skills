# Stage 5 - Validate (Decide *whether* to prove it, then *how*)

> **Non-negotiable #7 (restated):** Decide **whether** a causal estimate is worth buying **before**
> deciding how to get one. A method you cannot actually run is not a plan, and "ship it and watch the
> guardrails" is a legitimate, often correct, Stage 5 output.

**Purpose:** Three jobs, in order. (a) Decide if measurement is worth its cost at all. (b) If it is,
pick a method you can actually execute at your traffic. (c) Find the *how* through qualitative evidence.
Stage 4 chose *what* to fix; this stage decides how much certainty to buy and how.

---

## Gate 0 - Is a causal estimate worth buying? (run this FIRST, before any method)

Most product changes do not deserve an experiment. Answer three questions:

| Question | If the answer is... | Then |
|---|---|---|
| **Reversible?** Can you turn it off in a day without side effects? | Yes | Bias toward shipping |
| **Cost of being wrong?** What does a bad version cost (revenue, trust, support load, migration debt)? | Low | Bias toward shipping |
| **Can you even tell?** Would the result change what you do next? | No | Do not measure |

**The decision:**
- **Reversible AND low cost of wrong AND the result would not change your next move** -> **ship it, name
  1-3 guardrails from Stage 0, set a review date.** Stop here. Write down that you deliberately chose not
  to measure and why. That is the output.
- **One-way door, expensive to unwind, OR the result genuinely changes the roadmap** -> continue to Gate 1.

> **Value of information.** An experiment costs calendar time, traffic, engineering, and the delay of
> everything queued behind it. If that cost exceeds the value of the certainty it buys, running it is the
> wrong call even when it is technically possible. Say the cost out loud before choosing to pay it.

---

## Gate 1 - Sample-size gate (this is what kills A/B, not "complexity")

Before naming A/B as the method, compute the exposure it needs. If you cannot afford that exposure in an
acceptable window, **A/B is off the table** - not "harder", off.

**Rates / proportions** (conversion, completion), 80% power, 95% two-sided:

```
n per arm  ~=  16 x p x (1 - p) / d^2

  p = baseline rate,  d = the ABSOLUTE lift you want to detect
  (a 20% relative lift on p = 0.05 means d = 0.01, not 0.20)
```

**Averages** (time-on-task, order value): `n per arm ~= 16 x sigma^2 / d^2`.

**Worked example.** Baseline conversion 0.5% (p = 0.005), you want to detect a 20% relative lift
(d = 0.001):

```
n = 16 x 0.005 x 0.995 / (0.001)^2  ~=  79,600 users PER ARM  ->  ~160,000 exposed
```

At 5,000 eligible users a week that is **32 weeks**. The honest conclusion is not "run a longer test",
it is "**this effect is not detectable here - pick a different method or a bigger swing.**"

**Three ways out when n is unaffordable:**
1. **Move up the funnel** to a higher-baseline metric (click -> activation instead of activation -> paid).
   Higher `p` and larger `d` both shrink `n` fast.
2. **Aim for a bigger effect.** A test powered only for a 20% lift cannot see a 5% one; decide up front
   which sizes you care about.
3. **Switch method** (below) or fall back to Gate 0 and ship.

> Declaring the significance test without declaring the sample size is theatre: you will stare at a
> p-value that was never going to reach 0.05.

---

## Method selector (only reached if Gate 0 says measure)

| Situation | Method | What it controls for | Its failure mode (state it) |
|---|---|---|---|
| You can randomize **and** Gate 1 passes | **A/B test** | Everything - randomization balances observed *and* unobserved confounders | Underpowered tests read as "no effect"; peeking inflates false positives |
| You can randomize but traffic is thin | **Sequential / Bayesian stopping** | Same as A/B | Needs a stopping rule declared up front; a fixed-horizon p-value checked daily is invalid |
| Global rollout, but you can withhold a slice | **Holdout / staged rollout** | Same as A/B on the withheld slice | Contamination if the two groups talk or share state; holdout must stay off for the full window |
| Rolled out to everyone, comparable un-exposed group exists | **Difference-in-Differences (DiD)** | Shared time trends + fixed pre-existing differences | **Requires parallel trends. Plot the pre-period first.** If the two lines were not moving in parallel before, DiD is invalid, full stop |
| Rolled out to everyone, **no** control group, sharp date | **Interrupted time series (ITS)** | The metric's own pre-trend and seasonality | Anything else that changed on the same date is inseparable from your change |
| No natural control, but many comparable units (shops, regions, cohorts) | **Synthetic control** | Builds a weighted control from un-exposed units | Needs a long clean pre-period and enough donor units; overfits with few |
| Adoption is self-selected, nothing above applies | **Propensity Score Matching (PSM)** - last resort | Only **observed** confounders | Motivation and intent drive who adopts and are unobserved, so bias survives. Matching on a propensity score can *increase* imbalance rather than reduce it (King & Nielsen, 2019). Report it as suggestive, never as causal proof |

**Reading the table:** the ordering is by strength of evidence, not by convenience. Dropping from A/B to
DiD to PSM means each step buys a weaker claim - say which claim you are actually making.

---

## Cheap substitutes for measurement

Often faster and more decision-useful than any of the above:

| Method | Cost | Answers | Use when |
|---|---|---|---|
| **Qualitative, n = 5** | 2 days | *Why* users fail, and usually whether a design works at all | The question is comprehension or usability, not effect size. Five sessions surface most usability problems; a 6-week test on the same screen answers less |
| **Fake door / painted door** | Hours | Is there demand at all? | Before building. Measure intent (clicks on a not-yet-real entry point) instead of validating a thing you already paid to build |
| **Dogfood / internal use** | Days | Does it break, is it obviously wrong? | Pre-launch smoke check, never a substitute for a real effect estimate |

Do not let a causal method crowd these out. A quant experiment tells you *whether*; five users tell you
*why*, which is what you actually need to design the next version.

---

## Significance - "true trend or random noise?"

Applies once you have numbers from any of the above (ties back to Stage 2's noise check).

| Data type | Test | Use for |
|---|---|---|
| Numeric **averages** (means) | **T-test** | "Did average time-on-task / order value change?" |
| **Proportions / rates** (CR, % completing) | **Z-test** | "Did conversion rate change?" |
| **Categorical** distributions | **Chi-squared** | "Did the mix across categories change?" |

Two rules: declare the test **and** the sample size before starting (Gate 1), and if you are checking
results repeatedly, use a sequential rule - a fixed-horizon p-value peeked at daily is not valid.

A difference that is not significant is **not** evidence of no effect; it usually means underpowered.
Report the confidence interval, not just the verdict.

---

## UX research methods - "HOW should we change it?"

Quant says *what* is broken; these say *how* to fix it (non-negotiable #3).

| Method | When | What it finds | Key rule |
|---|---|---|---|
| **Heuristic Evaluation** | **Before** recruiting users - cheap first pass | Usability flaws against expert checklists | Use Nielsen's 10 heuristics; catches the obvious before you spend on users |
| **Usability Testing** | After heuristics, with real users | Whether users grasp the product's **mental model** | Give a clear **end goal WITHOUT step-by-step guidance** |

> **Usability testing's cardinal rule:** state the goal, then stay silent. The moment you give steps you
> stop testing comprehension and start testing instruction-following.

---

## Putting it together

1. **Gate 0** - decide whether to measure. If reversible + low cost of wrong, ship with guardrails and say
   so explicitly. Done.
2. **Gate 1** - if measuring, compute required n. If unaffordable, A/B is out; move up the funnel, target a
   bigger effect, or pick another method.
3. Run **heuristic evaluation**, then **usability testing (n = 5)**, to learn the *how*. Do this even when
   you are also running a quantitative test.
4. Pick the **causal method** from the table by what you can actually do, and **name its failure mode**
   (parallel trends plotted? contamination? unobserved confounders?).
5. Pre-declare the **significance test**, sample size, stopping rule, success threshold, and the
   **guardrails** from Stage 0.

**End decision-oriented (non-negotiable #8):** either
*"Not measuring [change]: reversible, low cost of being wrong. Shipping with guardrails [list], review [date]."*
or
*"Validating [fix] via [method] because [Gate 1 result + what you can execute]; its main risk is [failure
mode] which I check by [how]; significance via [test] at n = [number] per arm over [window]; the *how* comes
from [heuristic eval -> usability test]; success = [metric past threshold] without regressing [guardrails]."*
