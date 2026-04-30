# Template: Cannibalization

**Trigger:** Sum of platform-claimed conversions >2× Shopify orders OR PMax >30% branded query share.
**Precedence:** Tier 5 — wins over Allocation Imbalance and Healthy. Loses to Tracking-Broken, Profitability Trap, Owned-Channel Collapse, and TOF-Underfunded. Rationale: cannibalization is real waste, but it's a within-portfolio efficiency problem rather than a structural collapse, so it sits below the patterns that gate trust, profitability, retention, and forward pipeline health.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"You're paying twice for the same customer. {Specific number — sum of platform-claimed conversions of {X} vs Shopify orders of {Y} ({Z}× over-attribution), OR PMax branded query share at {W}% with a separate branded search campaign live}. {Causal mechanism — usually retargeting overlap across Meta + Google + email, or PMax bidding on terms a branded campaign already owns}. Here's where the overlap is, and the de-duplication plan that recovers ${$/month} of misallocated spend without losing real demand."

Example (literal sample, fill with realistic numbers):

"You're paying twice for the same customer. Meta + Google + Amazon collectively claim 4,120 conversions for last month against Shopify's 1,840 orders — a 2.24× over-attribution that's well past the 2.0× threshold for severe overlap. The biggest offender is PMax: search-term-category data shows 41% of PMax conversions come from branded queries, while a separate branded search campaign is live and bidding on the same terms. Here's where the overlap is, and the de-duplication plan that recovers an estimated $6,800/month of misallocated spend without losing real demand."

### Sub-Pattern Worked Example #2 — multi-platform stacking with no single dominant offender

Use this sub-flavor when there's no single PMax-branded smoking gun — instead, the over-attribution is spread across 3+ platforms each claiming the same ~30-40% of credit on overlapping audiences. The first sub-flavor (PMax-branded) has one clean fix; this one requires reconciliation across the whole portfolio because no single channel can be cleanly cut without losing real volume. Diagnosis order: MER reconciliation first to size the gap by channel, then targeted exclusions in priority order.

"You're paying twice for the same customer — but the overlap is distributed, not concentrated. Meta retargeting, Google Performance Max, Amazon DSP, and Klaviyo SMS each independently claim a customer who shows up exactly once in Shopify, and the sum of platform-claimed conversions is 2.6× Shopify orders for the last 30 days. No single channel is the smoking gun: each one's individual ROAS reads healthy because each one is taking credit for the same conversions. The likely root cause is that retargeting audiences and email-engaged audiences overlap heavily across all four channels, and there are no exclusions in place. The fix isn't a single negative-keyword change — it's a reconciliation pass: build the MER-share allocation, identify which platform is taking the largest unearned credit, and add exclusions in priority order. Expect total claimed conversions to drop ~30% as the overlap clears, while Shopify orders should hold steady or modestly improve."

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Build the MER-share allocation across ALL paid + owned channels FIRST — without it, the relative cannibalization size is invisible because each platform shows healthy ROAS in isolation.
- Sequence exclusions by claimed-conversion volume, largest-offender first, and add them one at a time over multiple weeks so each cleanup's effect is measurable cleanly.
- After each exclusion step, re-run the platform-claimed-vs-Shopify-orders ratio to validate the cleanup is bringing the ratio back toward 1.0× (healthy) without dragging total orders.
- If after all top exclusions the ratio still sits >1.5×, the overlap is structural (audiences fundamentally overlap) and the conversation shifts to channel role consolidation rather than exclusion mechanics.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For Cannibalization, the framing is "you're paying twice for the same customer — the platform numbers add up to more orders than you actually had."

**Headline template (one line, dollar-led):**

"~${X}/mo of inflated paid attribution — {channel — typically PMax or Meta retargeting} is taking credit for revenue that would've come anyway; the recoverable spend is {portion} of that channel's monthly budget."

The dollar figure is the recoverable misallocated spend: (over-attribution ratio − 1.0) × current monthly paid spend on the worst-offender channel × cannibalized share. Show the math underneath: "${X}/mo recoverable = {channel monthly spend} × {cannibalized share %}." Frame as reallocation upside, not net-new revenue — Shopify orders should hold steady; the win is freeing budget that's currently buying conversions that would've happened for free.

**The One Thing — pattern-specific framing:**

The One Thing is an exclusion + budget reduction — name the largest single overlap (PMax-branded queries, Meta retargeting on email-engaged list, Amazon DSP on existing customers) and the specific exclusion mechanic (account-level brand negatives, audience exclusions on retargeting, customer-list exclusions on DSP). Avoid "switch to MER" as The One Thing — that's a measurement upgrade and belongs as Action #2; the operator move is the targeted exclusion that recovers the spend with a proportional budget reduction on the de-cannibalized channel.

**5-day operator sequence (Mon–Fri shape):**

Day 1 = pull the search-term-category report (PMax) and audience composition exports (Meta retargeting) for the last 30 days. Day 2 = quantify the cannibalized share by channel ($/month and % of channel conversions) via the Attribution Reconciliation table. Day 3 = implement the largest-overlap exclusion (account-level brand negatives in PMax OR email-engaged audience exclusions in Meta retargeting) and reduce that channel's budget by the displaced-volume amount (typically 20-40%). Day 4 = monitor branded search ROAS + total Shopify orders for any real-demand drop (>10% order drop = restore budget). Day 5 = stand up the MER dashboard and brief the team on the metric switch from platform ROAS to MER for cross-channel calls. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't size the dollar headline as net-new revenue — the recovered spend is reallocation upside, not incremental orders. Total Shopify orders should hold within ±5%.
- Don't recommend cutting platforms wholesale because they "look high-ROAS" — the inflation is the diagnosis, the cut amount is what matches the displaced volume; over-cutting trims real demand.
- Don't write a "platform A is cannibalizing platform B" story without the MER reconciliation underneath — without the cross-channel allocation math, the exclusion logic isn't defensible against a stakeholder who points at platform-claimed ROAS.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "You're paying twice for the same customer. The platform numbers add up to more orders than you actually had."
- Charts: promote the platform-claimed-conversions vs Shopify-orders stacked-bar chart and the PMax-branded-share donut. Demote per-platform ROAS bars (they're inflated by the overlap and misleading without correction).
- Body chart caption: "Sum of platform-claimed conversions vs Shopify orders, last 30 days. Anything above 1.3× is overlap; above 2.0× is severe."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Eliminate the largest single overlap (usually PMax branded or retargeting stack).**

| Field | Detail |
|---|---|
| **WHAT** | "Add brand terms as account-level negative keywords in PMax (or move PMax off branded entirely via a feed-only Shopping campaign); OR exclude email-engaged + Klaviyo-purchaser audiences from Meta retargeting audiences — whichever overlap is largest by claimed-conversion volume per the Attribution Reconciliation table." |
| **WHY** | "Addresses Finding #1: {N}% of {channel} conversions are coming from {branded queries / email-engaged users} that the {branded search / email flow} would have captured for free at near-zero CAC." |
| **HOW** | "1) Pull the search-term-category report (PMax) for the last 30 days OR the retargeting audience composition export (Meta). 2) Quantify the cannibalized share ($/month and % of channel conversions). 3) Add the negatives (PMax: brand-term list at account level) or exclusions (Meta: email-engaged + 30d-purchasers as audience exclusions on retargeting). 4) Reduce the now-decannibalized channel's budget by the proportional displaced-volume amount (typically 20-40% on the affected channel). 5) Monitor branded search ROAS + total Shopify orders for any real-demand drop." |
| **WHEN** | "Implementation within 1 week of audit delivery; first measurement window closes day 14 post-implementation." |
| **WHO** | "Agency PPC manager (Google or Meta, depending on which channel hosts the largest overlap) owns implementation; agency analytics lead validates the volume sizing; account owner approves the budget reduction." |
| **EXPECTED IMPACT** | "Recovers {$X-Y}/month of spend currently being paid for conversions that would have happened anyway (sized from the Attribution Reconciliation table). Total Shopify orders should hold steady within ±5%; platform-reported ROAS on the de-cannibalized channel will drop (which is correct — it was inflated), but MER will improve by 0.2-0.5×. Confidence: HIGH that overlap exists; MEDIUM on the dollar recovery. Escalation: if Shopify orders drop >10% post-change, the cannibalization assumption was partially wrong — restore some budget and re-investigate." |
| **MEASUREMENT** | "Day 14 check: did the de-cannibalized channel's claimed conversions drop by ≥{N}%? Did total Shopify orders hold within ±5%? Day 30 check: did MER lift by ≥0.2×? Day 60 check: has total platform-claimed-conversions ÷ Shopify-orders dropped below 1.5× from the original 2.0×+?" |

**Action #2 default — Switch budget decisions from platform ROAS to MER.**

| Field | Detail |
|---|---|
| **WHAT** | "Adopt MER (Shopify revenue ÷ total cross-channel paid spend) as the primary metric for cross-channel budget decisions; demote platform ROAS to within-platform optimization only (campaign-vs-campaign on the same channel). Build a weekly MER dashboard with the per-channel allocation slice." |
| **WHY** | "While overlap exists, platform ROAS is inflated. Acting on inflated ROAS allocates more budget to the most over-attributing channel — exactly the wrong direction. Addresses Finding #2: 'optimization decisions are being made against double-counted credit.'" |
| **HOW** | "1) Build the MER reporting view: Shopify revenue ÷ sum of all paid spend, refreshed daily. 2) Document MER targets by stage and CM2 (use the formula in `reference/playbook/benchmarks.md`). 3) Brief internal team + agency on the new primary metric and decision rights (which calls go to MER, which stay on platform ROAS). 4) Sunset cross-channel budget meetings that lead with platform ROAS comparisons; replace with MER-led conversation." |
| **WHEN** | "MER dashboard live within 14 days; primary-metric switch effective at the next monthly budget review (≤30 days)." |
| **WHO** | "Agency analytics lead builds the dashboard; agency strategist + client marketing director adopt MER as primary in budget reviews; account owner aligns stakeholders on the change." |
| **EXPECTED IMPACT** | "Stops the feedback loop where over-attribution drives more budget into over-attributing channels. Within 30-60 days, expect total conversion volume to be flat or up while reported platform ROAS becomes more honest. MER trajectory should improve 0.2-0.4× as misallocated spend reallocates. Confidence: HIGH on the directional benefit; LOW on the precise MER trajectory (depends on Action #1 effects too). Escalation: if MER doesn't lift within 60 days despite Action #1 + this metric switch, re-examine whether the original over-attribution diagnosis was right or whether there's a real demand source we removed by accident." |
| **MEASUREMENT** | "Day 14: is the MER dashboard live and refreshing daily? Day 30: did the first budget review use MER as primary? Day 60: did MER lift by ≥0.2× off the audit baseline AND total Shopify orders held flat or up?" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- Each per-channel page surfaces the channel's contribution to over-attribution: "{Platform} claims {X} of the {Y} total cross-platform conversions, or {Z}% of the inflation. {Specific overlap source, e.g., 'Most of this comes from retargeting users already on the email list.'}"
- For PMax specifically: full search-term-category breakdown with branded vs non-branded share called out.
- For retargeting campaigns (Meta, Google remarketing): audience composition vs email-engaged list, with overlap %.
- Recommendations stay channel-specific but always reference the cross-channel cleanup as the ordering primary.
- For each platform, report both "platform ROAS" AND "MER-allocated incremental ROAS" side-by-side so the operator sees the true vs claimed gap on every page.

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **Attribution Reconciliation Table** — every platform's claimed conversions vs the MER-share allocation, with the over-attribution gap by platform; identifies the worst offenders by absolute volume and by ratio.
- **PMax Search-Term-Category Breakdown** — branded vs non-branded vs new-customer share, with the trend over the lookback. The decision input for negative-keyword work.
- **Retargeting Overlap Map** — which audiences appear in which campaigns across Meta, Google remarketing, and email; the overlap heatmap.
- **De-Duplication Plan** — sequenced rollout: week-1 PMax negatives, week-2 Meta retargeting exclusions, week-3-4 budget reallocation, week 6 MER recheck.
- **Multi-Platform Stacking Map** — for sub-pattern #2 contexts: matrix of which retargeting/email audiences appear in which platforms, with overlap % and sequenced exclusion priority.
- **MER Reporting Template** — dashboard spec for the new primary metric: Shopify revenue ÷ total cross-channel paid spend, refreshed daily, with per-channel allocation slice and target band call-out.

## Cross-References

- Detection logic: `reference/synthesis/cross-channel-patterns.md` Section 3 (Cannibalization — patterns 3a, 3b, 3c) and Section 1 (Attribution Overlap — for the over-attribution detection ratio).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 5 of the patterns table.
- MER target derivation: `reference/playbook/benchmarks.md` (MER Target Derivation section — informs the new primary metric in Action #2).
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — numbering source for the WHY field citations.
