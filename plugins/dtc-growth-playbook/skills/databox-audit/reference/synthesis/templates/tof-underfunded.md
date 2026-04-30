# Template: TOF-Underfunded

**Trigger:** TOF spend share at/below Floor of dynamic target AND nROAS declining over lookback.
**Precedence:** Tier 4 — wins over Cannibalization, Allocation Imbalance, and Healthy. Loses to Tracking-Broken, Profitability Trap, and Owned-Channel Collapse. Rationale: TOF starvation is a forward-looking problem (the cliff is 30-60 days out, not today), so it gets sequenced after structural bleeds but ahead of optimization-tier patterns.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"Your funnel is starving. {Specific number — TOF spend share at {X}% vs target band of {Y-Z}% for {stage}-stage {AOV-tier} brand, AND nROAS is {trend over lookback}}. {Causal mechanism — the closer-stage audience pool is being harvested faster than prospecting can refill it; CPATC trending up + frequency rising on retargeting are the leading indicators}. Expect a cliff in 30-60 days as your closer-stage audience saturates — the refunding plan and creative-production ramp need to start this month."

Example (literal sample, fill with realistic numbers):

"Your funnel is starving. Meta + Google TOF combined spend share is 22% against the 35-50% target band for a Growth-stage Standard-AOV brand, and nROAS has declined from 2.8x to 2.1x over the last 8 weeks while retargeting frequency climbed to 4.6 — classic saturation signal. The closer-stage audience is being harvested faster than prospecting can refill it; without TOF investment, the retargeting and branded campaigns lose their input pipeline. Expect a cliff in 30-60 days as your closer-stage audience saturates — the refunding plan and creative-production ramp need to start this month."

### Sub-Pattern Worked Example #2 — TOF share in band but quality scoring at Floor

Use this sub-flavor when TOF spend share *is* inside the dynamic target band, but TOF traffic-quality metrics (CPATC, CPVC, PDP→ATC rate) score at or below the AOV-tier Floor. The funnel is being filled by volume, but with the wrong audiences — the result is a false sense of TOF investment that produces the same long-run cliff because none of the prospects survive into MOF. Diagnosis order shifts: audience composition + creative quality first, allocation second.

"Your funnel is starving — but in a way that the spend numbers hide. Meta + Google TOF combined spend share is 41%, comfortably inside the 35-50% target band for a Growth-stage Standard-AOV brand, but the quality side of the picture is breaking down: CPATC is $36 against the $35 Floor for the tier, PDP→ATC rate is 2.8% (under the 3% Floor), and only 18% of TOF-acquired email signups convert within 30 days vs 32% historical. The funnel is filling with traffic, but the traffic isn't qualified — most of the spend is buying clicks from interest-based audiences that don't intend to purchase. Expect the same 30-60 day saturation cliff as the underfunded version, because qualified prospects are being added to retargeting at half the prior rate. The fix is creative + audience surgery before any allocation lever — see the AOV-tier TOF quality benchmark tables in `reference/playbook/benchmarks.md` for the CPATC / PDP→ATC / engaged-time Floor thresholds we're tripping. (Note: the dynamic TOF spend-share target band itself — the 35-50% reference above — lives separately in `reference/full-funnel-framework.md` Section 4.)"

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Lead with traffic-quality benchmarks per AOV tier (CPVC, CPATC, PDP→ATC, engaged time) BEFORE allocation share — share alone is misleading when quality is broken.
- Diagnose creative quality (hook rate, hold rate, CTR vs platform median) and audience composition before adjusting budget — adding spend to bad audiences scales the quality problem.
- Use the Standard Decision Tree in `reference/playbook/benchmarks.md` to label each TOF campaign Healthy/Cheap/Floor by metric, then act on the worst-metric constraint.
- Hold allocation steady or reduce slightly while creative + audience are fixed; resist the urge to scale a quality-broken funnel.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For TOF-Underfunded, the framing is "the funnel is starving — today's numbers still look acceptable, but the leading indicators say a cliff is 30-60 days out."

**Headline template (one line, dollar-led):**

"~${X}/mo of pipeline at risk — TOF at {pct}% of spend vs the {target}% target band for {stage}-stage {AOV-tier} brand, MER decay tracking the underfunding ({trend over lookback})."

The dollar figure is the projected revenue cliff at 60 days: (current monthly paid revenue) × (modeled MER decay if no refunding, typically 15-30%). Show the math underneath: "${X}/mo at risk = {current monthly paid revenue} × {modeled decay %}." Frame as forward risk, not present bleed — the saturation hasn't fully landed yet.

**The One Thing — pattern-specific framing:**

The One Thing is almost always a TOF spend reallocation — name the source (which working tier or capture channel to pull from — usually branded search) and the target (which TOF audience or ad set to push into — usually the top-2 historic Meta TOF winners or non-branded Google Shopping) explicitly, with weekly dollar amounts. Avoid "increase TOF" or "fund prospecting" phrasings; the WHAT must be a specific source-to-target reallocation paired with a creative-production ramp, since refunding TOF without fresh creative scales fatigue.

**5-day operator sequence (Mon–Fri shape):**

Day 1 = identify the source budget (branded search or over-allocated capture) and the target ad sets (top-1-2 historic TOF winners on Meta + top non-branded Search/Shopping on Google). Day 2 = brief the creative team on net-new TOF concepts (3-5 hooks × 2-3 formats) for week-3-4 delivery. Day 3 = execute the first reallocation step (week-1 ramp: +25% on target, offsetting cut on source). Day 4 = stand up the saturation-leading-indicator dashboard (frequency, CPM trend, CPATC trend, retargeting list size). Day 5 = align internal team on the 30-day refunding cadence and the cliff-recovery thesis. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't write the headline as today's metrics — TOF underfunding is a forward-looking cliff, not a current bleed. Sizing it as "lost revenue this month" misframes the urgency and makes the recommendation easier to defer.
- Don't recommend cutting retargeting or branded as the headline move without an offsetting TOF lift — retargeting decays first when TOF is starved, so cutting it without refilling the prospecting pool accelerates the cliff.
- Don't size the dollar number as wasted spend — it's pipeline at risk / future MER decay, not present misallocation. The recoverable opportunity is preventing the cliff, not refunding past spend.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "Your funnel is starving. The numbers today still look acceptable — that's the trap. Here's what the leading indicators say about 30-60 days from now."
- Charts: promote the TOF-vs-MOF-vs-BOF spend share chart (against the stage-appropriate target band), the nROAS trend chart over lookback, and the retargeting frequency trend chart. Demote campaign-level breakdowns.
- Body chart caption: "TOF spend share vs target band, last 90 days. Below the Floor + declining nROAS = saturation in 30-60 days."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Refund TOF over 30 days to land inside the target band.**

| Field | Detail |
|---|---|
| **WHAT** | "Increase Meta + Google TOF prospecting spend by {$X/week over 4 weeks} to reach the {Y}% share Floor of the dynamic target band; reduce branded search by an offsetting amount to keep total spend flat unless explicit budget headroom exists. Do NOT cut retargeting first — retargeting decays first when TOF is starved." |
| **WHY** | "Addresses Finding #1: TOF share at {X}% vs the dynamic target band of {Y-Z}% (per `reference/full-funnel-framework.md` Section 4 — the canonical 12-cell brand stage × AOV tier table), with nROAS declining {N}% over the last {M} weeks and retargeting frequency at {F}/7d — classic saturation signal." |
| **HOW** | "1) Identify the 1-2 best-performing existing TOF prospecting ad sets (Meta) and the top non-branded Search/Shopping campaigns (Google). 2) Add {$X/week} on a stepwise weekly ramp to those proven winners (week 1 +25%, week 2 +50%, week 3 +75%, week 4 to target). 3) Queue creative production in parallel for week-3-4 net-new variants. 4) Pull offsetting budget from branded search ($Y/week reduction). 5) Track frequency, CPATC, and PDP→ATC weekly to catch saturation early." |
| **WHEN** | "30-day rollout starting next Monday; first ramp step live within 5 business days." |
| **WHO** | "Agency PPC manager (Meta + Google) owns ramp execution; agency creative lead owns the parallel creative pipeline; account owner approves the offsetting branded reduction." |
| **EXPECTED IMPACT** | "Expect TOF share to recover into band within 4 weeks; nROAS stabilization within 6-8 weeks; MER recovery within 8-12 weeks at +0.2-0.4× from current. Confidence: MEDIUM on the magnitude (depends on creative refresh quality), HIGH on directional recovery. Escalation: if nROAS doesn't stabilize by week 8, the constraint is creative-quality not allocation — escalate to a broader creative refresh sprint." |
| **MEASUREMENT** | "Day 14 check: did TOF spend share lift by ≥5 percentage points toward the Floor? Day 30 check: is TOF share inside the dynamic target band? Day 60 check: did nROAS stop declining and begin trending up by ≥10% off the trough? Day 90 check: did MER recover by ≥0.3×?" |

**Action #2 default — Spin up the creative production pipeline now.**

| Field | Detail |
|---|---|
| **WHAT** | "Brief and produce {N} new TOF creative concepts (target 3-5 hooks × 2-3 formats — static, UGC, motion) over the next 30 days to support the refund ramp. Sequence delivery so net-new creative ships into ad sets in weeks 3-4 of the ramp." |
| **WHY** | "Refunding TOF without fresh creative scales fatigue, not reach — frequency rises, CTR decays, and nROAS gets worse instead of recovering. Addresses Finding #1's secondary risk: 'historic TOF creative is past its half-life.'" |
| **HOW** | "1) Brief creative team this week with the top-3 historic winners as the launching point. 2) Define hook variants (3-5) covering different angles (problem-aware, solution-aware, social proof). 3) Spec format coverage: 1×1 static, 9×16 UGC, 4×5 motion at minimum. 4) Stagger delivery so 2 concepts land in week 3 of the ramp and 3 in week 4. 5) Set a hook-rate / hold-rate decision check at day 14 post-launch to cull bottom variants." |
| **WHEN** | "Brief delivered this week (by EOD Friday); first 2 concepts shipped by week 3 of the ramp; remaining 3 by week 4." |
| **WHO** | "Agency creative lead owns the brief and production; client brand approver provides one round of feedback per concept; PPC manager handles ad-set rollout." |
| **EXPECTED IMPACT** | "Net-new creative typically lifts CTR 20-40% over fatigued ads in the first 14 days; sustained CTR lift of 10-15% beyond that is the realistic target. CPATC should compress 10-20%. Confidence: MEDIUM on the percentage range (production-quality dependent), HIGH that fresh creative outperforms fatigued. Escalation: if no concept beats the historic baseline on hook rate by day 14 post-launch, the constraint is creative-strategy not creative-volume — escalate to brand/messaging review." |
| **MEASUREMENT** | "Day 14 post-launch: did the winning concept beat current TOF baseline CTR by ≥15% and hook rate by ≥20%? Day 30: did CPATC compress by ≥10% across the refreshed ad sets? Day 60: did the new creative pool sustain a CTR lift of ≥10% (i.e., not a one-week fluke)?" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- For Meta and Google specifically: lead with the TOF/MOF/BOF spend split and the saturation indicators (frequency, CPM trend, CPATC trend). Recommend the channel-specific TOF refund move.
- For platforms with no TOF role (Amazon, branded-only Google): explicitly note "{Platform} doesn't carry the TOF load for this brand. Findings here remain optimization-focused."
- For retargeting and branded campaigns: caution against over-cutting — the right move is to hold or modestly reduce, not slash, since they still have a role inside a healthier funnel.
- Surface the audience-pool saturation evidence on every paid page (frequency, audience overlap, CPATC trend).
- For TOF channels failing on quality (sub-pattern #2): include the labeled decision-tree row + the named worst-metric constraint so the operator knows whether to fix creative, audience, landing page, or attribution.

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **TOF/MOF/BOF Spend Allocation Trend** — 90-day chart showing share by funnel stage against the stage-appropriate dynamic target band from `reference/full-funnel-framework.md` Section 4 (canonical owner of the dynamic TOF spend-share target tables — 12 cells: 3 brand stages × 4 AOV tiers).
- **Saturation Leading-Indicator Pack** — frequency trend, CPM trend, CPATC trend, audience overlap (where available), retargeting list size trend. The early-warning system for the cliff.
- **Refunding Roadmap (30-day)** — week-by-week ramp plan: which campaigns get the lift, by how much, with what creative, against what budget reduction elsewhere.
- **Creative Production Brief Template** — the 5-7 fields the creative team needs to ship the new hooks: angle, audience, format, CTA, length, brand-safe constraints, expected delivery date.
- **TOF Quality Scorecard by AOV Tier** — current metrics (CPVC, CPATC, PDP→ATC, engaged time) labeled Healthy/Cheap/Floor against the AOV-tier benchmark table, with the Standard Decision Tree diagnosis applied per campaign.
- **Audience Saturation Math** — pool-size estimate, weekly reach burn rate, projected weeks until saturation under current spend trajectory; cross-checked against the 30-60 day cliff projection in the report lead.

## Cross-References

- Detection logic: `reference/synthesis/cross-channel-patterns.md` Section 4 (Budget Imbalance — pattern 4b, Branded/Retargeting Over-Invested as the inverse signal) and Section 2 (Halo Effects — pattern 2a, Meta TOF → Google branded).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 3 of the patterns table.
- Dynamic TOF spend-share target table (brand stage × AOV tier): `reference/full-funnel-framework.md` Section 4 (canonical owner). Modifier rules in Section 4.3.
- AOV-tier TOF *quality* benchmarks (CPATC, CPVC, PDP→ATC, engaged time): `reference/playbook/benchmarks.md` — TOF Quality Benchmarks by AOV Tier section, plus the per-tier threshold reference cards. Different concept from the spend-share target table — the two files own different things.
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — numbering source for the WHY field citations.
