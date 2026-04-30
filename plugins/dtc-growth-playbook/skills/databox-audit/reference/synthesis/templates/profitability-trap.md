# Template: Profitability Trap

**Trigger:** Platform ROAS healthy AND MER < minimum (1 ÷ CM2%) OR CM3 negative.
**Precedence:** Tier 2 — second-highest, after Tracking-Broken. This pattern wins over Owned-Channel Collapse, TOF-Underfunded, Cannibalization, Allocation Imbalance, and Healthy because the business is actively losing money on every order. Other patterns can be sequenced after the bleed is stopped, but the profitability fix has to lead.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"Platform metrics look fine but you're not making money. {Specific gap — platform ROAS at {X}x while MER is {Y}x against a breakeven of {1 ÷ CM2%}, or CM3 of {-$Z}}. {Causal mechanism — usually attribution inflation hiding real efficiency loss, fixed-cost creep eating margin, or a hidden cost the platform numbers can't see (returns, shipping, COGS drift)}. Here's why your ROAS is lying — and the CM3 fix that has to come before any growth conversation."

Example (literal sample, fill with realistic numbers):

"Platform metrics look fine but you're not making money. Blended platform ROAS is 3.4x — well above the 2.5x target most teams optimize against — but MER is 1.6x against a CM2-derived breakeven of 1.9x, and CM3 is -$0.18 per order after returns and shipping. The gap is attribution inflation (platforms collectively claim 2.4× more conversions than Shopify) compounded by a 14% return rate the platform dashboards never see. Here's why your ROAS is lying — and the CM3 fix that has to come before any growth conversation."

### Sub-Pattern Worked Example #2 — headline ROAS healthy, CM3 negative from returns / fulfillment

Use this sub-flavor when both platform ROAS *and* MER look acceptable on the surface, but CM3 is negative once returns + shipping + fulfillment are loaded against revenue. The first sub-flavor (attribution inflation) describes a measurement gap; this one describes a real-cost gap — the orders are real, the conversions aren't being double-counted, but the unit economics are upside-down because of fulfillment and returns drag the platform dashboards never see. Diagnosis order: returns + shipping + COGS reconciliation first, then channel mix.

"Platform metrics look fine but you're not making money. Blended platform ROAS is 3.1x and MER is 2.4x against a CM2-derived breakeven of 1.9x — both numbers read 'profitable' on a paid-channel dashboard. CM3 tells a different story: -$2.40 per order after a 28% return rate (apparel-typical, but never costed against ROAS), $14.20 average outbound shipping vs $9 captured at checkout, and a 4-point COGS drift since last quarter that flowed straight to gross margin. The orders are real and the platform attribution is reasonable — the leak is downstream of acquisition, hidden inside fulfillment and returns. Here's why your ROAS is lying — the CM3 waterfall has to lead, and the channel-mix question is downstream of the unit-economics fix."

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Pull return-rate data by SKU and category BEFORE running the attribution-overlap analysis — when both ROAS and MER look healthy, the gap is almost always returns or fulfillment.
- Reconcile shipping cost (outbound + returns) against shipping revenue captured at checkout; the gap is a frequent CM3-killer in apparel and home goods.
- Audit COGS quarter-over-quarter to catch silent drift (vendor price increases, ingredient/material substitutions, FX changes) — 2-4 points of COGS drift is enough to flip CM3 negative.
- The attribution-inflation lens (sub-pattern #1) only re-enters the diagnosis if the unit-economics audit doesn't surface a leak >300 bps; until then, treat platform attribution as approximately correct.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For Profitability Trap, the framing is "platform metrics look fine but the business is losing money on every order — stop the bleed before any growth conversation."

**Headline template (one line, dollar-led):**

"~${X}/mo of unprofitable spend — paid is hitting in-channel ROAS targets ({Y}x blended) but MER is collapsing to {Z}x against a CM2 breakeven of {W}x because {root cause — attribution inflation / returns drag / shipping gap / COGS drift}."

The dollar figure is the monthly cash bleed: 30-day paid spend × (per-order CM3 loss ÷ AOV), or for sub-pattern #2, monthly orders × per-order CM3 loss. Show the math underneath: "${X}/mo = {orders} × {-$CM3/order}." Pull CM2 from client P&L when available; flag confidence if estimated.

**The One Thing — pattern-specific framing:**

The One Thing is a CM3 leak fix coupled with a spend freeze — name the specific largest leak (returns, shipping, COGS drift, attribution inflation, payment-fee creep) with its sized $ impact and the freeze trigger. Avoid "improve profitability" or "optimize ROAS" phrasings; the WHAT must name the leak source, the dollar size, and the freeze condition (no scale-ups until CM3 is positive at the order level for 7 consecutive days).

**5-day operator sequence (Mon–Fri shape):**

Day 1 = pull CM3 inputs (Shopify orders, COGS, returns, shipping cost vs captured shipping revenue, payment-processing fees). Day 2 = build the per-order CM3 waterfall and reconcile against ad spend. Day 3 = rank the top-5 leaks by $/month impact and identify the worst-CM3 channel/SKU pair. Day 4 = freeze planned spend increases and execute pre-emptive cuts on the worst-CM3 channel if CM3 < −$2/order. Day 5 = brief the leak owner (finance for COGS, ops for shipping, lifecycle for returns) on the diagnostic findings and the next-step fix plan. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't lead with platform ROAS optimizations — the platform numbers look healthy, that's exactly why this pattern triggered.
- Don't recommend "scale what's working" — there is nothing currently working at the unit-economics level; scaling compounds the bleed linearly.
- Don't write the headline as a tracking issue when attribution inflation is just one of several leaks — overstating the attribution lens hides bigger fulfillment / COGS leaks in sub-pattern #2 contexts.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "Platform metrics look fine but you're not making money. The funnel is converting — it's just not converting profitably."
- Charts: lead with the CM3 waterfall (gross revenue → COGS → ad spend → returns → shipping → CM3). Promote MER vs platform ROAS overlay; demote per-platform ROAS bars unless one is clearly the worst offender.
- Body chart caption: "CM3 waterfall, last 30 days. The gap between platform ROAS and CM3 is what the platform dashboards can't show you."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Diagnose the CM3 leak; find the biggest hidden cost.**

| Field | Detail |
|---|---|
| **WHAT** | "Build the CM3 waterfall against the last 30 days at the order level; identify the largest non-ad-spend line item (returns, shipping, COGS drift, payment-processing creep, or platform-fee changes). Output: a ranked list of the 5 contribution-killers with $ impact each." |
| **WHY** | "Addresses Finding #1: blended MER of {X}x is below CM2 breakeven of {Y}x while platform ROAS reads healthy at {Z}x — the gap is hidden cost, not under-monetization." |
| **HOW** | "1) Pull Shopify orders + returns + shipping cost + product cost (COGS) for the last 30 days. 2) Reconcile against ad spend (all channels) and payment-processing fees. 3) Calculate per-order CM3: revenue − COGS − ad spend allocated − shipping − returns − payment fees − any other variable cost. 4) Sort by SKU, by channel, by promo cohort to find the worst contributors. 5) Export the top 5 leaks with $/month impact for the next CM3 sub-action." |
| **WHEN** | "Diagnosis complete in 14 days; first hypothesis on largest leak by day 7." |
| **WHO** | "Agency analytics lead owns the model build; client finance / ops provides COGS + shipping data within 5 business days; account owner reviews findings." |
| **EXPECTED IMPACT** | "Identifies the single largest margin leak with sized impact. Once known, the fix is usually a SKU-mix shift, a shipping-threshold change, a returns-policy tightening, or renegotiating a fulfillment / payment fee — each typically worth 200-500 bps of CM3 margin recovery, $X-Y/month at current order volume. Confidence: HIGH that a leak surfaces; MEDIUM on how big. Escalation: if CM3 model can't be built within 14 days because COGS data is missing/unreliable, escalate to a client P&L reconciliation with finance before going further." |
| **MEASUREMENT** | "Day 14: is the CM3 waterfall built and the top-5 leaks ranked with $-impact? Day 30: is at least one leak fix in progress (decision made + owner assigned)? Day 60: has CM3 per order improved by ≥{200-500} bps from the diagnosis baseline?" |

**Action #2 default — Stop scaling acquisition until CM3 is positive.**

| Field | Detail |
|---|---|
| **WHAT** | "Hold paid spend flat (no increases) until CM3 is positive at the order level. If currently in a scale-up plan, freeze the next planned increase. If CM3 is materially negative (>−$2/order or >−5% of AOV), execute targeted spend cuts on the worst-CM3 channel/SKU combination." |
| **WHY** | "Adding spend to a negative-CM3 funnel scales the loss linearly — every incremental order is incremental cash burn until the leak is fixed. Addresses Finding #1's secondary risk: 'continued scaling compounds the bleed.'" |
| **HOW** | "1) Cap channel-level budgets at the rolling 7-day spend average. 2) Communicate the hold to internal team + agency PPC. 3) If CM3 < −$2/order, identify the worst-CM3 channel and reduce its budget 20-30% as a pre-emptive cut. 4) Document the freeze baseline so post-fix spend recovery is measurable. 5) Revisit the scaling conversation only after Action #1's leak fix is shipped + verified." |
| **WHEN** | "Effective immediately; hold reviewed every 14 days, lifts only when CM3 turns positive at order level for 7 consecutive days." |
| **WHO** | "Account owner enforces; agency PPC manager honors the cap; agency strategist + client marketing director own the unfreeze decision." |
| **EXPECTED IMPACT** | "Prevents ${X-Y}/month of additional loss during the diagnosis-and-fix window (calculated as: avoided incremental spend × current per-order loss). Confidence: HIGH that the freeze prevents loss compounding; MEDIUM on the exact $ avoided. Escalation: if business pressure forces scale-up before CM3 is positive, log the override and quantify the modeled additional loss so the decision is made with full visibility." |
| **MEASUREMENT** | "Day 14 check: spend variance vs cap <±5%, no scale-up commits made? Day 30 check: is at least one leak remediation in motion AND CM3 trajectory off the floor? Day 60 check: has CM3 turned positive at the order level for 7 consecutive days, allowing the unfreeze conversation to start?" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- Every per-channel page reframes ROAS reporting around blended/MER context: "{Platform} claims {X}x ROAS, but MER attribution suggests {Y}x of that is incremental — the rest is overlap. CM3 contribution is {$Z}."
- Demote campaign-level optimization recommendations until CM3 is fixed — replace with channel-level "should this channel be funded at all" framing.
- Highlight any channel where the gap between platform ROAS and incremental contribution is largest — that's where the inflation is concentrated.
- Add a "True ROAS Estimate" line on each platform: platform ROAS × (Shopify orders ÷ sum of platform-claimed conversions).
- For sub-pattern #2 contexts: surface SKU-level return rates and per-channel return-rate skew (some channels acquire higher-return cohorts than others — that's a CM3 lever).

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **CM3 Waterfall** — full breakdown: Gross revenue → COGS → Ad spend → Returns → Shipping → Payment processing → CM3. Per-order and per-month views.
- **MER vs Platform ROAS Reconciliation** — table showing each platform's reported ROAS, the MER-share allocation, and the gap. Identifies which channels are most over-claiming.
- **Hidden Cost Audit Checklist** — the 5 hidden-cost checks: return rate by SKU, shipping cost vs threshold, COGS drift quarter-over-quarter, platform fee creep, payment processing changes.
- **Profitability Floor Calculation** — the math: minimum MER = 1 ÷ CM2%, with CM2 sourced from client P&L if provided, or estimated from category benchmarks if not (flag confidence).
- **Returns + Shipping Gap Analysis** — for sub-pattern #2 specifically: SKU-level return rate, average outbound shipping cost vs captured shipping revenue, and the per-order CM3 impact of each gap.
- **COGS Drift Tracker** — quarter-over-quarter COGS by top-10 SKU, flagging any SKU whose COGS rose >2 points without a corresponding price increase.

## Cross-References

- Detection logic: `reference/synthesis/profitability-framework.md` (CM2 / CM3 framework, MER thresholds).
- Related cross-channel patterns: `reference/synthesis/cross-channel-patterns.md` Section 1 (Attribution Overlap — feeds the "ROAS is lying" diagnosis).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 4 of the patterns table.
- MER target derivation + CM benchmarks: `reference/playbook/benchmarks.md` (Profitability & Unit Economics Layer — CM2/CM3, MER formula, contribution margin benchmarks by vertical).
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — numbering source for the WHY field citations.
