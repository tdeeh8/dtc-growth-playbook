# Insight Quality Rubric — Databox-Audit v3

The rubric the synthesizer self-applies to every body finding before it ships. Findings that fail the rubric get demoted to the appendix or cut entirely. Only PASS findings make the body.

> **Authoritative source:** `v3-quality-framework.md` Section 2.1 (Insight Quality Rubric). This file is the operational reference the synthesizer reads at run time. If this file and the framework spec disagree, the framework spec wins — fix this file.

**Where it slots in:** new step in the synthesizer between `Step 2 Marketing Director Overview` generation and `Anti-Hallucination Verification`. Run after each finding is drafted; iterate the finding until it passes; only PASS findings make the body. Demoted findings move to the appendix; rubric-failing findings get logged into `manifest.quality_gate_results` so the post-delivery feedback loop (`v3-quality-framework.md` Section 2.4) can calibrate against them.

---

## 1. The 5 axes

Verbatim from `v3-quality-framework.md` Section 2.1. Do not edit these definitions in this file — edit the framework spec and re-sync.

| Axis | What it checks | Pass / Fail |
|---|---|---|
| **Specificity** | Names the exact campaign / channel / metric / time window. Avoids "underperforming" / "could be improved" / "consider optimizing" without referent. | PASS: numbers + named entities. FAIL: generic descriptors. |
| **Causality** | Goes beyond observation to a causal claim, with evidence for the claim. "X is happening BECAUSE Y" — not "X is happening." | PASS: stated mechanism + evidence chain. FAIL: pure correlation or pure observation. |
| **Implication** | States the business impact if the finding is true. "If unaddressed for 60 days, expect X." | PASS: ties to revenue / margin / runway / risk. FAIL: technical implication only ("CPM will rise"). |
| **Confidence** | Self-rates HIGH / MEDIUM / LOW with the data quality reasoning. Not a vague hedge — an explicit confidence label. | PASS: explicit confidence + reasoning. FAIL: implicit, hedged, or absolute when data is sparse. |
| **Counterargument** | Names the strongest objection to the finding. Either rebuts it or acknowledges it as a real limitation. | PASS: objection identified + handled. FAIL: claim presented as obvious truth. |

---

## 2. Worked example — same data, FAIL vs PASS

Both versions are summarizing the same evidence: a Growth-stage Standard-AOV brand running 52% of paid spend through Meta TOF, with a CPATC of $42 against a Floor of $45 for the AOV tier.

### FAIL version

```
Meta ROAS is below target. Recommend optimizing creative.
```

Why it fails:

| Axis | Verdict | Why |
|---|---|---|
| Specificity | FAIL | "Below target" — no number, no time window. "Optimizing creative" — no campaign, no asset. |
| Causality | FAIL | Pure observation. Doesn't say *why* ROAS is below target. |
| Implication | FAIL | "Optimize creative" is a task, not a business outcome. No revenue / margin / runway tie. |
| Confidence | FAIL | No confidence label. Reads as if it's certain when the underlying audience-type data is naming-inferred MEDIUM. |
| Counterargument | FAIL | Presented as obvious truth. Doesn't rule out creative fatigue, audience saturation, tracking gap. |

5 of 5 fail → cut entirely. Don't include anywhere.

### PASS version

```
Meta TOF is structurally overfunded (52% of paid spend vs 35-50% target band for
Growth-stage Standard-AOV brand). CPATC is $42, just under the Floor of $45 for
the tier — the channel isn't broken, the *allocation* is. Causality: the
prospecting funnel built up audience faster than retargeting + email could close,
so ATC events are accumulating but conversion lags. Implication: if TOF share
stays >50% another 60 days without lifecycle scaling, expect MER to drop another
0.4× as the closer-stage audience saturates. Confidence: MEDIUM — Pull 7 audience
composition came from Ad Set Name parsing (typical for this connector).
Counterargument: could be a creative-fatigue problem, not allocation; ruled out
by frequency 2.3 (well below saturation) and stable CTR.
```

Why it passes:

| Axis | Verdict | Why |
|---|---|---|
| Specificity | PASS | Names the channel (Meta TOF), the metric (52% spend share), the comparison band (35-50%), the brand stage and AOV tier, the CPATC ($42), the Floor ($45). |
| Causality | PASS | "Prospecting funnel built up audience faster than retargeting + email could close" — names the mechanism, ties it to ATC accumulation. |
| Implication | PASS | "Expect MER to drop another 0.4× over 60 days" — quantifies, time-bounds, ties to MER (the headline profitability metric). |
| Confidence | PASS | "Confidence: MEDIUM — Pull 7 audience composition came from Ad Set Name parsing" — explicit label + reason. |
| Counterargument | PASS | Names the alternative (creative fatigue), then rebuts with frequency 2.3 + stable CTR evidence. |

5 of 5 pass → ships in the body, drives a Priority Action.

The PASS version is roughly 4× longer. That's the point — body word budget is tight because every word earns its place.

---

## 3. Application protocol

The synthesizer applies the rubric in an iterative loop, finding by finding:

```
for each draft_finding in body_candidates:
    iteration = 0
    while iteration < 2:
        scores = check_axes(draft_finding)  # returns {axis: PASS|FAIL} for each of 5
        failed = [axis for axis, verdict in scores.items() if verdict == "FAIL"]

        if len(failed) == 0:
            promote_to_body(draft_finding)
            break

        # Iterate the finding language to address the failed axes
        draft_finding = rewrite_for_axes(draft_finding, failed)
        iteration += 1
    else:
        # Couldn't pass after 2 iterations — apply demotion rules
        if len(failed) <= 2:
            demote_to_appendix(draft_finding, reason=failed)
        else:
            cut(draft_finding, reason=failed)
        log_to_manifest(draft_finding, scores, action_taken)
```

Step-by-step:

1. **Draft the finding.** Use the evidence files + manifest. Keep it tight — first draft is usually a 1-2 sentence claim.
2. **Check each of the 5 axes.** For each axis, mark PASS or FAIL with one-line reasoning.
3. **If any FAIL, iterate.** Rewrite the finding to address the failed axes. Add the missing specificity, supply the causal mechanism, quantify the implication, add the confidence label, name the counterargument. Re-check.
4. **Cap at 2 iterations.** If the finding still fails after the second rewrite, do not iterate again — apply demotion rules. (Two iterations is enough to rescue a finding that's worth rescuing; more usually means the underlying evidence is too thin.)
5. **Log every demotion.** Write the finding, the failed axes, and the demotion action into `manifest.quality_gate_results` so the post-delivery loop can spot patterns (e.g., "we keep failing Causality on TOF findings — the Pull 7 evidence isn't supporting causal claims").

---

## 4. Demotion rules

| Outcome | Failed axes | Where it goes |
|---|---|---|
| **Body** | 0 | Top-line findings driving Priority Actions. Visible in the Marketing Director Overview, the Findings Matrix, and per-channel pages. |
| **Appendix** | 1 or 2 | Detailed observations, source citations, supporting tables. Surfaced as evidence the Body findings are built on, not as standalone insights. Reader can verify but isn't asked to act on them. |
| **Cut entirely** | 3 or more | Not a real insight — just data. Don't include anywhere. The evidence stays in the JSON; it just doesn't surface in the report. |

**The cut rule is non-negotiable.** Do not soften "cut" into "appendix" because the finding feels important. If 3 of 5 axes fail, the finding isn't supported well enough to ship in any reader-facing layer. Cutting is what keeps the body and appendix both honest.

**The 80% body pass-rate gate.** The Pre-Delivery Quality Gate (`v3-quality-framework.md` Section 2.4) requires ≥80% of body findings to PASS the rubric. If iteration produces too many demotions and the body drops below 80% PASS, the synthesizer regenerates the body from a tighter evidence subset rather than shipping mostly-demoted findings labeled as body content.

---

## 5. Confidence calibration

Every finding gets an explicit HIGH / MEDIUM / LOW label. Use this table to calibrate — don't ad-lib.

| Confidence | When to use | Body language pattern |
|---|---|---|
| **HIGH** | Direct evidence from at least 2 sources (e.g., Shopify revenue + GA4 attributed revenue agree to ±5%). No implausible numbers. Sanity checks pass. No major data quality flags on any input. | Assert as fact: "Email revenue is down 47% YoY." |
| **MEDIUM** | Direct evidence from 1 source. OR multi-source but with one MEDIUM-confidence input. OR the inference is from naming/heuristic, not from a direct dimension. **Most v2 audits land MEDIUM by default — see the Pull 7 reality check in `reference/platforms/meta-ads-deep.md`** (audience type is naming-inferred on the standard FbAds connector, so the default audience-composition confidence is MEDIUM). | Useful, actionable, lightly caveated: "Campaign X reads as MOF-functional based on ad-set naming. Verify before acting on this individual campaign." |
| **LOW** | Single weak source. OR sparse data (e.g., <30 days of trend, <100 conversions). OR a sanity check failed but the signal still seems meaningful. OR the claim is extrapolating beyond the audit window. | Flag explicitly and downgrade urgency: "LOW confidence — single 14-day signal, may not persist. Note for the next audit, don't act on this one." |

**Calibration heuristics:**

- If you find yourself wanting to write "likely" or "appears to" without naming the data source: that's a MEDIUM at best, possibly LOW. Label it.
- If two sources point at the same conclusion AND a sanity check (sum-check, ratio-check, YoY plausibility) confirms: HIGH.
- If you can't name what the strongest objection would be (see Section 6): the confidence is lower than you think — drop one notch.
- If the underlying evidence is from a single naming-inference (Pull 7, UTM parsing, campaign name parsing): MEDIUM is the ceiling. Never label HIGH on naming inference alone.

---

## 6. Counterargument standards

Naming a counterargument is not optional. A finding without a stated counterargument is a finding that hasn't been pressure-tested. Use this table to judge whether the counterargument is handled, weak, or missing.

| Standard | Example | What it does |
|---|---|---|
| **GOOD** | "Could be creative fatigue, ruled out by frequency 2.3 and stable CTR." | Names the alternative explanation by name. Rebuts it with specific evidence (a number, a comparison). The reader can audit the rebuttal. |
| **WEAK** | "Despite limitations, we still believe Meta TOF is overfunded." | Vague. Doesn't name the alternative. Doesn't rebut anything. Reads as "we're hedging because we know we're shaky" — which is the opposite of useful. |
| **MISSING** | (No counterargument sentence at all.) Claim presented as obvious truth. | Fails the Counterargument axis. The reader has no way to know what objections were considered. |

**The two-part test:**

1. **Is the alternative named?** "Could be X" where X is a real, specific competing explanation (creative fatigue, audience saturation, seasonal trend, tracking change, attribution shift, sample-size noise).
2. **Is the rebuttal evidence-based?** Either the alternative is ruled out with a number ("frequency 2.3 is below saturation") or it's acknowledged as a live limitation ("we can't rule out creative fatigue from the connector data — flag for next audit").

If you can't name the alternative, the finding is not ready to ship. If you can name it but can't rebut, that's fine — say so explicitly and lower the confidence label to match.

**Common counterargument types per finding category:**

- **TOF / allocation findings:** creative fatigue, audience saturation, attribution shift, seasonality.
- **Profitability / MER findings:** unit economics drift (AOV, return rate, discount creep), cost-side change (COGS, fulfillment), tracking change.
- **Owned-channel findings:** deliverability change, list size shrinkage, send frequency change, segment overlap.
- **Tracking findings:** platform-side change (iOS, Consent Mode, Performance Max migration), UTM tagging change, GA4 setup change.
- **Cannibalization findings:** intent overlap (branded + retargeting), measurement double-count, view-through window inflation.

---

## 7. Edge cases & FAQ

A handful of edge cases that come up repeatedly in real audits. Resolve them the way this section says, not by re-litigating per finding.

**A finding passes 4 of 5 axes but fails Specificity because the underlying campaign has been renamed mid-period.**
Use the campaign ID + the `as of {date}` qualifier in the body. "Campaign 23857...441 (formerly `Spring Hero v2`, renamed to `Q2 Brand Awareness` on 2026-03-14) — spend $4,200 in the 30 days prior to rename." Specificity passes if the entity is uniquely identifiable in the platform; a name change isn't a Specificity failure.

**A finding fails Causality because the evidence supports correlation only.**
Two options: (1) demote to appendix as an observation rather than a causal claim, or (2) reframe the finding as a hypothesis worth testing and pair it with the test design in the Action Contract. Don't ship a body finding that pretends correlation is causation.

**A finding passes all 5 axes but the implication is small ($500/month impact on a $200K/month account).**
Pass it on rubric, but it does not earn a Priority Action slot. Surface it in the appendix or in the per-channel page diagnosis. Body Priority Actions are reserved for findings whose implication clears a materiality threshold (default: ≥1% of monthly revenue or ≥0.1× MER movement). Smaller findings are real but don't drive the report.

**A finding fails Counterargument because the synthesizer can't think of the alternative.**
That's a signal the synthesizer doesn't understand the finding well enough. Re-read the platform's deep-dive evidence and the relevant playbook chunk before iterating. If after reading you still can't name the alternative, the finding is probably noise — cut it.

**Two findings PASS the rubric individually but contradict each other.**
Both stay in the body only if they're addressing different evidence layers. If they're addressing the same layer and contradicting, the synthesizer picks the higher-confidence one for the body and demotes the other to the appendix with a methodology note: "Conflicting signal observed — see Finding #N. Resolved by preferring [source] because [reason]."

**A LOW-confidence finding feels important.**
Trust the label. LOW belongs in the appendix or in the "Worth investigating" section per `v3-quality-framework.md` Section 2.2 (Watchlist treatment). LOW findings in the body erode the body's credibility — and one weak finding in a body of strong ones is what gets the whole report dismissed by an operator.

---

## 8. Quick reference — checklist before promoting a finding to the body

```
[ ] Specificity:    Named the campaign / channel / metric / time window?
[ ] Causality:      Stated WHY, not just WHAT?
[ ] Implication:    Tied to revenue / margin / runway / risk with a number?
[ ] Confidence:     Explicit HIGH / MEDIUM / LOW with one-line reasoning?
[ ] Counterargument:Named the alternative AND either rebutted it or acknowledged?
```

5 boxes checked → ships in body. 3-4 boxes → demote to appendix with the failed axes logged. ≤2 boxes → cut, log to manifest, do not surface.

---

## 9. Downstream contract — what a rubric-passing finding feeds

A rubric-passing finding is the upstream gate for everything in the body. Two things consume it:

1. **The Findings Matrix** (`reference/synthesis/findings-matrix.md`). Every row in the matrix is a rubric-passing finding. The matrix's Severity / Confidence / Impact columns inherit from this rubric's Confidence calibration; the Finding column carries the rubric-tightened one-line statement.
2. **Priority Actions** (`reference/synthesis/action-contract.md`). The 7-field Action Contract requires every action's WHY field to reference a finding number from the Findings Matrix — and that finding number must trace to a finding that PASSED this rubric. If no rubric-passing finding supports the action, the action shouldn't ship — period.

Rubric → Findings Matrix → Action Contract is the full quality chain that gates body content. A break anywhere in the chain (rubric-failing finding ships in matrix, or action with no traceable supporting finding) erodes the whole body's credibility.
