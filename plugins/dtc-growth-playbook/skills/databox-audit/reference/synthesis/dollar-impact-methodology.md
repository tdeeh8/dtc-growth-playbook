# Dollar-Impact Methodology — Databox-Audit v3

The Council's v2 critique was that the report had no dollar in the headline and no defensible math behind the `$ / $$ / $$$` Impact bands — a $4k/mo finding and a $40k/mo finding both rounded to `$$`, and the executive summary led with "ROAS underperforming target" instead of "~$XX/month at risk." This file fixes that. Every finding that ships must carry a real dollar figure or an explicit "directional" flag, derived from one of three formulas below, and the Money Page headline aggregates those figures into a single, defensible number with a confidence band.

> **Authoritative source:** `v3-quality-framework-addendum.md` Section 4 ("Money Page — dollarized headline"). This file is the operational reference the synthesizer reads at draft-time; the addendum is the design authority. If anything here conflicts with Section 4, the addendum wins and this file gets corrected.

This file does NOT define where the Money Page sits in the report — that lives in `reference/synthesizer.md` (Agent E in Wave 2). It does NOT define the dollar-rendering style in the docx template — that lives in `reference/docx-template.md` (Agent D in Wave 1). It defines the formulas, confidence bands, display rules, aggregation logic, and what the methodology deliberately doesn't try to do.

---

## 1. The three categories — every finding maps to one

Every finding that earns a dollar figure is one of three categories. The category determines the formula. If a finding doesn't fit cleanly into one of these three, that's a signal the finding isn't sharp enough to dollarize — push it back through the Insight Rubric or demote it to Watchlist.

### 1a. WASTE findings

**Definition:** spend that is currently producing returns below an actionable threshold (typically sub-1× ROAS, or campaigns with zero conversions over a meaningful window). The dollar is the leak — what stops bleeding when the action ships.

**Example:** "Campaign `Spring Hero v2` spending $4,000/mo at 0.8× ROAS, 0 conversions in last 30d."

**Formula:**

```
$_impact = current_spend × waste_factor

where:
  waste_factor = (target_ROAS − actual_ROAS) / target_ROAS
  waste_factor is capped at 1.0 (you can't recover more than 100% of the spend)
  waste_factor is floored at 0 (positive ROAS above target is not waste)
```

**Worked:** Campaign spends $4,000/mo at 0.8× ROAS. Target ROAS for the channel/tier is 3.0×.

```
waste_factor = (3.0 − 0.8) / 3.0 = 0.733
$_impact = $4,000 × 0.733 = $2,933/mo
```

If actual_ROAS is 0 (zero conversions), waste_factor = 1.0 and $_impact = full spend.

**Default confidence:** HIGH. Waste is observed, not modeled — the campaign IS spending the money and IS producing the (low) return. The only inference is the target_ROAS benchmark, and that comes from the playbook canonical thresholds.

---

### 1b. EFFICIENCY findings

**Definition:** a working channel or tier underperforming its target ROAS/CPATC/MER benchmark. The dollar is the **recoverable revenue** if the channel hit target — not the total revenue, not the lift to a stretch goal. Recoverable from what's already being spent.

**Example:** "Meta BOF ROAS at 2.1× vs 3.0× target on $18k/mo spend."

**Formula:**

```
$_impact_recoverable = current_spend × ((target_ROAS − actual_ROAS) / target_ROAS)
                     capped at 1.0, floored at 0
```

This is structurally the same formula as WASTE — same shape, same cap, same floor. The difference is interpretation: WASTE assumes you reclaim the spend (pause and reallocate); EFFICIENCY assumes you keep spending and recover the gap to target.

**Worked:** Meta BOF at 2.1× actual vs 3.0× target on $18,000/mo.

```
gap_ratio = (3.0 − 2.1) / 3.0 = 0.30
$_impact_recoverable = $18,000 × 0.30 = $5,400/mo
```

That's $5,400/mo of revenue currently leaking, recoverable if the channel hits target.

**Default confidence:** HIGH if the underperformance is direct (current spend × current ROAS observed in-platform). MEDIUM if the target ROAS requires a target-setting inference (e.g., "what should BOF ROAS be given this AOV and margin profile?").

---

### 1c. OPPORTUNITY findings

**Definition:** untapped lift from reallocation, channel expansion, or funnel rebalancing. The dollar is **projected new revenue** from a change that isn't currently happening. This is the only category that estimates rather than observes — confidence defaults are lower.

**Example:** "Meta TOF underfunded — currently 18% of spend vs 35-50% target band; reallocating $6k/mo from BOF to TOF projected to lift downstream conversions."

**Formula:**

```
$_impact = projected_new_revenue_from_reallocation

method:
  reallocation_$ × downstream_conversion_rate × AOV
  where downstream_conversion_rate = historical avg from this account's funnel
  where AOV = trailing 90-day account AOV
```

**Worked:** Reallocate $6,000/mo from BOF (already saturated) to TOF. Account's historical TOF→purchase conversion rate is 1.4%. AOV is $85.

```
TOF_visits_added = $6,000 / current_TOF_CPC ($1.20) = 5,000 incremental visits
projected_new_revenue = 5,000 × 1.4% × $85 = $5,950/mo
```

If TOF→purchase conversion rate isn't directly available, the synthesizer uses a funnel multiplier from the playbook's canonical AOV/CR benchmarks (chunk reference: see `protocols/playbook/index.md`) and flags the finding MEDIUM confidence.

**Default confidence:** MEDIUM. The reallocation is hypothetical; the conversion rate is averaged across past periods that may not predict future performance. Promote to HIGH only if the account has previously executed this exact reallocation and produced a measurable lift — that's "evidence-backed projection," not "modeled projection."

Drop to LOW if the OPPORTUNITY requires assumed client behavior the audit can't verify (e.g., "if they launch a referral program") — those go directional, not dollarized.

---

## 2. Confidence bands — three levels, three rendering styles

Confidence is the second pillar of the methodology. Two findings with the same dollar figure but different confidence are NOT equivalent — and the report must show that visual difference.

| Band | Range | Inference steps | When to assign |
|---|---|---|---|
| **HIGH** | ±20% | 0 — direct evidence | The finding is observed in the data. A campaign IS spending $X at Y ROAS; the gap is computed from real numbers, no projection. |
| **MEDIUM** | ±50% | 1 — single inference | One assumption is required: a reallocation flows to working tier at the channel's average ROAS, a benchmark target is inferred from category data, a trend is extrapolated from a partial window. |
| **LOW** | directional only | 2+ inferences OR client-behavior dependent | The finding requires multiple inference steps stacked, OR depends on assumed client behavior, OR rests on data the audit doesn't have direct access to. No dollar gets rendered. |

**The discipline:** if you find yourself stacking assumptions to defend a dollar figure ("if they reallocate AND if conversion rate holds AND if AOV doesn't drop AND if seasonality is flat"), the finding is LOW. Mark it directional, don't dollarize, and let the reader weight it accordingly.

The confidence band is also what gates a finding into the Money Page headline (see Section 4). LOW findings are visible in the Findings Matrix and the body, but they do NOT contribute to the aggregated dollar figure.

---

## 3. Display rules in the body

Every dollarized finding renders the same way everywhere it appears (Findings Matrix, Per-Channel Pages, Priority Actions EXPECTED IMPACT). Consistency is what makes the figures scan and lets the reader trust them.

| Confidence | Render | Example | Why |
|---|---|---|---|
| **HIGH** | `~$X/mo` (single number with tilde) | `~$4.2k/mo` | The tilde signals "this is an estimate, not an invoice." Single number because ±20% is tight enough that a range adds noise. |
| **MEDIUM** | `~$X-Y/mo` (range) | `~$8-15k/mo` | The range is the reader's cue that there's modeling involved. The width of the range maps to the ±50% band. |
| **LOW** | `directional — $-impact unmodeled` | `directional — $-impact unmodeled` | Explicit text. No number. The reader knows immediately that this is a flag, not a quantified opportunity. |

**Rounding rules:**
- Round HIGH figures to 2 significant figures (`$4,233` → `$4.2k`).
- Round MEDIUM ranges to 1 significant figure on each end (`$7,830 - $14,200` → `$8-15k`). Round outward — wider is safer than narrower.
- Always use `k` for thousands and `M` for millions. `$1,200/mo` renders as `$1.2k/mo`. `$1,400,000/mo` renders as `$1.4M/mo`.
- Always include `/mo` (or `/yr` if the audit window is annualized — but `/mo` is the v3 default).

**The tilde is non-negotiable.** A bare `$4,200/mo` reads as accounting precision; `~$4.2k/mo` reads as estimate. The methodology's whole defensibility rests on the reader knowing these are sized leaks, not invoices.

---

## 4. Aggregation rule — the Money Page headline

The Money Page headline is the single dollar figure that leads the executive summary. It's the answer to "if I read one number from this audit, what is it?" The aggregation rule is engineered so that figure is defensible under pushback.

### The rule

```
1. Take all HIGH and MEDIUM dollarized findings.
   (LOW findings are EXCLUDED — they don't contribute to the headline.)

2. For each MEDIUM finding, use the midpoint of its range.
   (~$8-15k/mo contributes $11.5k to the sum.)

3. Sum everything.

4. Compute the dollar-weight of HIGH findings:
   HIGH_weight = sum(HIGH $ contributions) / sum(all $ contributions)

5. Assign aggregated confidence:
   - HIGH if HIGH_weight ≥ 80%
   - MEDIUM otherwise
   (Aggregated confidence cannot be LOW — LOW findings are excluded by step 1.)

6. Render as: "~$X/month at risk OR recoverable" with the aggregated confidence band.
```

### Why exclude LOW findings from the headline

If a $50k/mo LOW-confidence opportunity is added to the sum, the headline number balloons on a finding the audit explicitly says it can't defend. The reader can't tell the headline includes a modeled-with-assumptions number, and the first time the client pushes back ("how did you get to $80k?"), the audit collapses. Excluding LOW findings means the headline is always made of dollars the audit can stand behind.

LOW findings still ship — they're in the Findings Matrix as `directional`, they may anchor a Watchlist item, and they may earn a Priority Action if the underlying evidence improves. They just don't roll up.

### Why midpoint for MEDIUM findings

Using the high end of every range inflates the headline (worst-case framing). Using the low end deflates it (overcautious framing). Midpoint is the unbiased estimator across the band and the only choice that doesn't introduce a directional bias to the aggregation.

### Render rule for the headline

```
HEADLINE: "~$XX/month at risk OR recoverable. Confidence: {HIGH|MEDIUM}."
```

**Never** render as a single point estimate without context. `$87,000/mo at risk.` is forbidden — it implies precision the methodology doesn't claim. `~$87k/mo at risk OR recoverable. Confidence: HIGH.` is correct.

The "at risk OR recoverable" framing is deliberate: WASTE and EFFICIENCY findings are losses to stop; OPPORTUNITY findings are gains to capture. The headline rolls them up because, from the operator's perspective, both are dollars the action plan converts. The body breaks them out by category for readers who care.

---

## 5. Worked example — 5 findings to a headline

Below is a sample audit's dollarized findings table, the math for each, and the aggregated headline.

### The findings

| F# | Category | Description | Inputs | Confidence |
|---|---|---|---|---|
| 1 | WASTE | 4 Google campaigns at sub-1× ROAS | $3,100/mo spend, 0.6× actual ROAS, 3.0× target | HIGH |
| 2 | EFFICIENCY | Meta BOF underperforming target | $18,000/mo spend, 2.1× actual, 3.0× target | HIGH |
| 3 | OPPORTUNITY | TOF underfunded; reallocate from BOF | $6,000/mo reallocation, 1.4% downstream CR, $85 AOV | MEDIUM |
| 4 | EFFICIENCY | Klaviyo flow revenue down YoY | $142k → $47k YoY; needs target-setting inference for "recovered" state | MEDIUM |
| 5 | OPPORTUNITY | SMS list re-engagement | Inactive 90d segment; assumes client launches re-engagement flow | LOW |

### The math

**F#1 (WASTE, HIGH):**
```
waste_factor = (3.0 − 0.6) / 3.0 = 0.80
$_impact = $3,100 × 0.80 = $2,480/mo
Render: ~$2.5k/mo
```

**F#2 (EFFICIENCY, HIGH):**
```
gap_ratio = (3.0 − 2.1) / 3.0 = 0.30
$_impact = $18,000 × 0.30 = $5,400/mo
Render: ~$5.4k/mo
```

**F#3 (OPPORTUNITY, MEDIUM):**
```
TOF_visits_added = $6,000 / $1.20 CPC = 5,000 visits
projected_new_revenue = 5,000 × 1.4% × $85 = $5,950/mo
±50% band: $2,975 - $8,925/mo
Render: ~$3-9k/mo
Midpoint for aggregation: $5,950
```

**F#4 (EFFICIENCY, MEDIUM):**
```
Recovery target = halfway back to YoY ($47k → $94k = $47k/mo recoverable)
Inference step: "halfway back" is the modeled assumption (full recovery is aspirational)
±50% band: $23.5k - $70.5k/mo
Render: ~$24-71k/mo
Midpoint for aggregation: $47,000
```

**F#5 (OPPORTUNITY, LOW):**
```
Render: directional — $-impact unmodeled
Excluded from headline aggregation.
```

### The aggregation

| F# | Confidence | Contribution to sum |
|---|---|---|
| 1 | HIGH | $2,480 |
| 2 | HIGH | $5,400 |
| 3 | MEDIUM | $5,950 (midpoint) |
| 4 | MEDIUM | $47,000 (midpoint) |
| 5 | LOW | excluded |
| **Sum** | — | **$60,830** |

```
HIGH_weight = ($2,480 + $5,400) / $60,830 = 0.13 = 13%
13% < 80% threshold → aggregated confidence = MEDIUM
Round to 1 sig fig: ~$61k/mo

HEADLINE: "~$61k/month at risk OR recoverable. Confidence: MEDIUM."
```

The MEDIUM aggregated confidence is the honest read here — most of the headline dollars come from F#4, which carries a single inference step (the "halfway back" recovery target). If F#4 were dropped or downgraded to LOW, the headline would fall to ~$14k/mo with HIGH confidence. Both versions are defensible; the methodology forces the audit to publish the version that's actually true.

---

## 6. What this is NOT

The methodology is deliberately scoped. It does several specific things and explicitly does not do several others. Mis-applying it — using it as something it's not — is how the dollarized headline becomes a credibility risk instead of a credibility asset.

**This is NOT a forecast of actual outcomes.** The dollar figures are leak sizes (WASTE/EFFICIENCY) and opportunity sizes (OPPORTUNITY), not predicted lifts. A `~$5.4k/mo` EFFICIENCY finding does NOT mean "execute the action and you'll see $5.4k/mo more revenue." It means "the gap between your current performance and target performance is sized at $5.4k/mo of recoverable revenue." Whether the action actually closes that gap is a function of execution, market conditions, and the action contract's MEASUREMENT field — not the dollar figure.

**This does NOT account for execution risk.** A $50k/mo finding with a 6-month execution timeline and a $5k/mo finding with a 1-week execution timeline both render at face value here. Execution risk lives in the Action Contract's HOW / WHEN / WHO / MEASUREMENT fields and in the Effort column of the Findings Matrix. The methodology sizes the leak; the contract sizes the lift to closure. Two different layers, not the same number.

**This does NOT replace the Insight Rubric.** A finding must pass the 5-axis Insight Rubric (Specificity, Causality, Implication, Confidence, Counterargument — see `insight-rubric.md`) BEFORE it earns a dollar figure. Dollarizing a finding that didn't pass the rubric just laminates a precise number onto sloppy thinking. The chain is: rubric gates findings → methodology dollarizes the surviving findings → matrix and Money Page render them. Skip the rubric and the dollars are vibes with decimals.

**This does NOT promise category-level accuracy.** The ±20% / ±50% bands are the methodology's stated precision. A reader who treats `~$5.4k/mo` as "exactly $5,400" has misread the tilde. The bands exist to quantify what the audit can and can't claim — and the LOW band exists specifically to cover findings where even ±50% would be dishonest precision.

**This does NOT supersede the playbook's canonical benchmarks.** The target_ROAS, target_CPATC, target_MER values used in the formulas come from `protocols/playbook/index.md` and the canonical chunks it points to. If the playbook updates a benchmark, the methodology pulls the new value. The methodology owns the math; the playbook owns the targets.

---

## 7. Quick reference

| Question | Answer |
|---|---|
| What are the three categories? | WASTE, EFFICIENCY, OPPORTUNITY. Every dollarized finding is exactly one. |
| What's the WASTE formula? | `current_spend × ((target_ROAS − actual_ROAS) / target_ROAS)`, capped at 1.0. |
| What's the EFFICIENCY formula? | Same shape as WASTE, but the dollar is recoverable revenue, not reclaimed spend. |
| What's the OPPORTUNITY formula? | `reallocation_$ × downstream_CR × AOV` (or equivalent funnel multiplier from the playbook). |
| What are the confidence bands? | HIGH ±20%, MEDIUM ±50%, LOW directional only. |
| How does each render? | HIGH = `~$X/mo`. MEDIUM = `~$X-Y/mo`. LOW = `directional — $-impact unmodeled`. |
| What goes into the headline? | HIGH and MEDIUM findings. LOW findings are excluded. |
| How is MEDIUM aggregated? | Use the midpoint of each range. |
| When is the headline confidence HIGH vs MEDIUM? | HIGH if ≥80% of the dollar weight comes from HIGH findings; otherwise MEDIUM. |
| What's the headline format? | `~$X/month at risk OR recoverable. Confidence: {HIGH|MEDIUM}.` Never a bare point estimate. |
| What does the methodology NOT do? | Predict outcomes, account for execution risk, replace the Insight Rubric, claim sub-band precision, override playbook benchmarks. |
| Authoritative source? | `v3-quality-framework-addendum.md` Section 4. |
