# Template: Allocation Imbalance

**Trigger:** Branded + retargeting >40% of paid spend OR a constrained channel outperforms an unconstrained one.
**Precedence:** Tier 6 — wins only over Healthy. Loses to Tracking-Broken, Profitability Trap, Owned-Channel Collapse, TOF-Underfunded, and Cannibalization. Rationale: allocation imbalance is real but it's a portfolio-tuning problem, not a structural failure. If anything more serious is also triggering, this becomes a secondary action under that pattern's lead.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"You're over-investing in capture, under-investing in growth. {Specific number — branded + retargeting at {X}% of paid spend vs the {Y}% capture-share ceiling for stage, OR {constrained channel} outperforming {unconstrained channel} at {ROAS comparison}}. {Causal mechanism — usually capture campaigns getting credit-by-default for demand created elsewhere, while a budget-constrained winner is leaving headroom on the table}. Here's the reallocation that shifts {$X/month} from harvesting demand to creating it, without losing the demand you're already capturing."

Example (literal sample, fill with realistic numbers):

"You're over-investing in capture, under-investing in growth. Branded search + retargeting combined are 47% of paid spend against the 25-35% capture-share band for a Growth-stage Standard-AOV brand, while Meta TOF is at the Floor of its target band and Google Shopping non-branded is flagged 'limited by budget' with a 4.1x ROAS — the constrained winner. The capture campaigns are getting credit-by-default for demand the under-funded prospecting and Shopping campaigns are creating. Here's the reallocation that shifts $7,400/month from harvesting demand to creating it, without losing the demand you're already capturing."

### Sub-Pattern Worked Example #2 — constrained winner vs unconstrained underperformer

Use this sub-flavor when the imbalance signal is a budget-cap mismatch rather than a capture-vs-prospect role mismatch — i.e., a high-performing channel running into 'limited by budget' impression-share losses while a lower-performing channel runs unconstrained at the same or higher spend. The first sub-flavor leans capture/prospect ratio; this one leans constraint asymmetry, and the fix is more surgical (lift the cap on the winner, throttle the underperformer) than a portfolio-wide rebalance.

"You're over-investing in capture, under-investing in growth — but the headline isn't the capture/prospect split this month. The bigger asymmetry is constraint-side: Google Shopping non-branded is hitting 38% impression share lost to budget at a 4.6x ROAS (the constrained winner), while Meta retargeting and Meta interest-based prospecting are running unconstrained at 1.7x and 1.4x ROAS respectively, consuming 41% of paid spend combined. The dynamic-target check via `reference/full-funnel-framework.md` Section 4 confirms TOF role is in band — the issue is the wrong channels are being given headroom. Here's the reallocation: lift Shopping's daily cap by 30% over 2 weeks, throttle the lower-ROAS Meta campaigns by an offsetting amount, and watch for Shopping's diminishing-returns curve. Modeled net-portfolio MER lift: 0.3-0.5×."

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Pull constraint signals (impression-share-lost-to-budget, daily-budget-cap hits, learning-phase exits) on EVERY active channel BEFORE looking at role-based allocation share.
- Rank channels by ROAS within their role bucket and flag any constrained channel ranked top-3 — that's the highest-leverage cap to lift.
- Identify the lowest-ROAS unconstrained channel as the funding source for the cap-lift, not whichever capture channel is over-allocated.
- Watch the diminishing-returns curve weekly on the constrained-winner channel; cap the increases as soon as ROAS approaches the channel's incremental Floor.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For Allocation Imbalance, the framing is "the wrong channels are getting headroom — recoverable budget is trapped in over-allocated capture or under-performing unconstrained channels."

**Headline template (one line, dollar-led):**

"~${X}/mo trapped in losing campaigns — {N} campaigns burning ${amount} at sub-target ROAS while {working tier — constrained winner / under-funded growth channel} is starved at {ROAS comparison}."

The dollar figure is the recoverable monthly spend: (over-allocated capture spend above the target band ceiling) + (low-ROAS unconstrained spend that should redirect to the constrained winner). Show the math underneath: "${X}/mo trapped = {capture overage} + {underperformer reallocatable share}." Frame as reallocation upside — the spend isn't lost, it's mis-routed.

**The One Thing — pattern-specific framing:**

The One Thing is a named reallocation pair — specify the source (over-allocated capture channel like branded search, OR the unconstrained underperformer like a low-ROAS Meta interest-based ad set) and the target (under-funded growth-role channel like Meta TOF, OR the constrained winner like Google Shopping non-branded with budget-cap losses). Avoid "rebalance the portfolio" or "optimize allocation" phrasings; the WHAT must be a specific dollar-per-week move from named channel A to named channel B, with the kill criteria (orders drop >10% → restore).

**5-day operator sequence (Mon–Fri shape):**

Day 1 = pull constraint signals (impression-share-lost-to-budget, daily-cap hits, learning-phase status) on every channel and rank by ROAS within role bucket (capture / prospect / Shopping / branded / retention). Day 2 = identify the source-target pair (largest over-allocation paired with the most-constrained winner OR lowest-ROAS unconstrained channel paired with under-funded growth). Day 3 = execute the first weekly reallocation step (e.g., capture −5%, growth/Shopping +10% on the same dollar amount). Day 4 = brief the analytics lead on the diminishing-returns watch on the recipient channel + the order-volume monitoring on the source. Day 5 = align internal team on the 30-day reallocation cadence and the kill criteria. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't size the dollar headline as wasted spend — the budget is mis-routed, not burnt. Most of it is recoverable through reallocation, not cuttable; framing it as waste invites over-correction.
- Don't recommend slashing branded or retargeting in one move — the cut is 15-25% over 4 weeks on a stepwise ramp, not a hard turn-off; capture channels still have a real role even when over-allocated.
- Don't write the Allocation Imbalance headline if a more severe pattern (Tracking-Broken, Profitability Trap, Owned-Channel Collapse, TOF-Underfunded, Cannibalization) is also triggering — Allocation is Tier 6 and only leads when nothing more structural is broken.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "You're over-investing in capture, under-investing in growth. The split between demand-creation and demand-harvesting is off."
- Charts: promote the channel-role allocation chart (capture vs prospect vs Shopping vs branded) against the stage-appropriate target bands. Promote the constrained-vs-unconstrained ROAS bar chart. Demote per-campaign breakdowns.
- Body chart caption: "Paid spend share by channel role vs target band, last 30 days. Capture is over the ceiling; growth-role channels are at or below the Floor."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Reduce the most over-allocated capture channel by 15-25% over 30 days.**

| Field | Detail |
|---|---|
| **WHAT** | "Reduce {worst-offender capture channel — usually branded search or Meta retargeting} budget by {15-25%} over the next 4 weeks; redirect the freed spend to {named under-funded growth channel — usually Meta TOF prospecting or Google Shopping non-branded}." |
| **WHY** | "Addresses Finding #1: capture channels at {X}% of paid spend vs the {Y-Z}% capture-share target band per the stage-appropriate allocation guidance in `reference/full-funnel-framework.md` Section 4 (brand stage × AOV tier dynamic target table); growth-role channels are under-funded by an offsetting amount." |
| **HOW** | "1) Cut {capture channel} budget by {$X/week × 4 weeks} on a stepwise schedule (week 1 −5%, week 2 −10%, week 3 −20%, week 4 to target). 2) Redirect freed budget to {growth channel} on the same weekly cadence — same dollar amounts, opposite direction. 3) Monitor branded ROAS, total Shopify orders, and MER weekly through the transition. 4) If branded ROAS drops modestly while orders hold, the cut was correct (the credit was inflated). If orders drop >10%, restore some budget — real demand was being captured." |
| **WHEN** | "30-day rollout starting next Monday; first reduction step live within 5 business days." |
| **WHO** | "Agency PPC manager owns the budget moves on both channels; agency analytics lead owns the weekly monitoring; account owner approves the weekly step decisions." |
| **EXPECTED IMPACT** | "Branded / capture ROAS will decline modestly (the campaign was previously over-credited — that's correct re-attribution, not regression). Total orders and MER should hold or improve within 30-60 days; expect {0.1-0.3×} MER lift as demand-creation share rises. Confidence: MEDIUM. Escalation: if total order count drops >10% within 14 days of any reduction step, real demand was being captured — pause further cuts and restore last week's level." |
| **MEASUREMENT** | "Day 14 check: did capture channel spend drop by ≥{half the planned 4-week reduction} AND did total Shopify orders hold within −5%? Day 30 check: is capture share inside the target band AND has MER lifted by ≥0.1×? Day 60 check: did the growth channel show meaningful volume lift (≥15% conversions) without ROAS dropping below its incremental Floor?" |

**Action #2 default — Lift the budget cap on the constrained winner.**

| Field | Detail |
|---|---|
| **WHAT** | "Increase {constrained winner channel — typically Google Shopping non-branded or a high-ROAS Meta TOF ad set} budget by {20-30%} over 2 weeks; monitor for diminishing returns at each step." |
| **WHY** | "{Channel} is showing 'limited by budget' / impression-share-lost-to-budget at {X}% with a {Y}x ROAS — there's profitable demand the channel can't currently serve. Addresses Finding #2: a constrained channel outperforming an unconstrained one is a guaranteed reallocation opportunity." |
| **HOW** | "1) Stepwise weekly budget increases on the constrained channel ({$X/week}, week 1 +10%, week 2 +20%, week 3 +25%, week 4 to target +30%). 2) Track ROAS, conversion volume, impression-share-lost-to-budget, and CPA weekly. 3) Source the additional budget from Action #1's offsetting reduction unless explicit headroom exists. 4) Cap or pause increases when ROAS drops below the channel's incremental Floor (back-calculated from CM2)." |
| **WHEN** | "2-week rollout starting next Monday; full +20-30% reached by end of week 2." |
| **WHO** | "Agency PPC manager owns the increases; agency analytics lead validates against the diminishing-returns curve weekly; account owner signs off if budget needs to grow beyond Action #1's offsetting reduction." |
| **EXPECTED IMPACT** | "Expect {15-25%} more conversion volume from {channel} within 2-4 weeks before diminishing returns set in. Net portfolio ROAS should improve as profitable headroom is captured; modeled MER lift 0.2-0.4×. Confidence: HIGH that the constrained channel has headroom; MEDIUM on how much before diminishing returns. Escalation: if ROAS drops below the incremental Floor within 1 week of any increase, the diminishing-returns curve is steeper than modeled — cap at the prior week's level." |
| **MEASUREMENT** | "Day 7 check: did the constrained channel's conversion volume rise ≥10% with ROAS within ±10% of baseline? Day 14 check: is impression-share-lost-to-budget below 15% (i.e., the constraint is meaningfully relaxed)? Day 30 check: did total portfolio MER lift by ≥0.2× from the audit baseline?" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- Each per-channel page surfaces its role classification (capture, prospect, Shopping, branded, retention) and its allocation vs target band: "{Platform} is currently {X}% of paid spend, in the {role} bucket. Target band for stage is {Y-Z}%."
- For over-allocated capture channels: lead with the reduction recommendation and the order-volume-monitoring plan.
- For constrained winners: lead with the lift-the-cap recommendation and the diminishing-returns watch.
- For channels in band: explicit "in target band — hold" call-out so the operator doesn't over-correct everything.
- For each channel, surface the constraint signal directly (impression share lost to budget, learning-phase exits, audience saturation) so the lift-or-throttle decision is data-led, not vibe-led.

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **Channel Role Classification Table** — every active channel mapped to its role (prospect / capture / shopping / branded / retention) with current spend share and the stage-appropriate target band from `reference/full-funnel-framework.md` Section 4 (canonical owner of the dynamic spend-share allocation bands; 12-cell brand stage × AOV tier table).
- **Constrained vs Unconstrained ROAS Comparison** — table flagging any channel showing budget-cap signals, with its ROAS, and what the unconstrained alternative is producing.
- **Reallocation Roadmap (30-60 day)** — week-by-week plan: which channel loses how much, which channel gains how much, with the monitoring metrics for each step.
- **Demand-Creation vs Demand-Harvesting Split** — total spend split into "creates new demand" (TOF Meta, non-branded Google, prospect Amazon) vs "harvests existing demand" (branded, retargeting, MOF/BOF). The split is the leading indicator for whether the portfolio is investing in growth.
- **Constraint-Signal Inventory** — for sub-pattern #2 contexts: every active channel with its current constraint status (impression-share-lost-to-budget %, daily-budget-cap hit frequency, learning-phase status, audience saturation flags) and the lift-or-throttle recommendation derived from each.
- **Diminishing-Returns Curve Estimates** — for any channel proposed for a budget lift, the historical ROAS-vs-spend curve plotted over the last 90 days, with the inflection point identified as the budget ceiling.

## Cross-References

- Detection logic: `reference/synthesis/cross-channel-patterns.md` Section 4 (Budget Imbalance — patterns 4a, 4b, 4d).
- Channel role definitions + dynamic spend-share allocation bands (brand stage × AOV tier): `reference/full-funnel-framework.md` Section 4 (canonical owner — 12-cell table plus modifier rules in 4.3).
- MER target derivation (formula + flat-band fallback): `reference/playbook/benchmarks.md` MER Target Derivation section (canonical owner).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 6 of the patterns table.
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — numbering source for the WHY field citations.
- Insight Rubric reference: `reference/synthesis/insight-rubric.md` — every finding cited by an action must clear the 5-axis check.
