# Cross-Channel Pattern Library

Reference library of cross-channel interactions the synthesizer checks when 2+ platform evidence files exist. Each pattern includes: what to look for, how to detect it, confidence thresholds, and what to recommend.

**Do NOT include a pattern in the report unless the evidence supports it.** This is a detection library, not a checklist to fill out.

---

## 1. Attribution Overlap

### What It Is
Multiple platforms claim credit for the same conversion. When you sum platform-reported conversions, the total exceeds actual Shopify orders — sometimes by 2-4x.

### How to Detect

**Requires:** At least 2 platform evidence files. Shopify evidence strongly preferred.

1. **Sum platform-reported conversions** across all evidence files for the same date range.
   - Google Ads: `account_overview` → conversions metric
   - Meta Ads: `account_overview` → conversions/purchases metric
   - Amazon: `account_overview` → orders metric
   - (Klaviyo not covered by ads-audit — if email evidence exists from separate audit, include it)
2. **Compare to Shopify actual orders** (if Shopify evidence exists).
3. **Calculate over-attribution ratio:** `sum of platform conversions / Shopify orders`
4. **Calculate MER:** `Shopify revenue / total spend across all platforms`

**Detection thresholds:**
- Over-attribution ratio 1.0-1.3x → Normal (platforms measure differently, some overlap expected)
- Over-attribution ratio 1.3-2.0x → Moderate overlap — note it, use MER as the truth metric
- Over-attribution ratio >2.0x → Severe overlap — flag prominently, platform ROAS numbers are unreliable for budget decisions

**MER trend signal:**
- MER stable or improving while platform ROAS is stable → Healthy
- MER declining while platform ROAS is stable or improving → Attribution inflation — platforms are taking more credit while actual efficiency drops
- MER improving while platform ROAS declines → Possible efficiency gains not captured by platforms (e.g., organic growth, brand effects)

### What to Recommend
- Shift reporting to MER/blended metrics for all budget decisions.
- Use platform ROAS only for within-platform optimization (campaign vs. campaign).
- If over-attribution >2x: recommend incrementality testing to determine actual channel contribution.
- Flag: "Platform-reported ROAS of {X}x does not reflect actual business efficiency. MER of {Y}x is the reliable metric."

---

## 2. Halo Effects

### What It Is
Spending on one channel lifts performance on another. The most documented: Meta TOF prospecting drives branded search volume on Google. Cutting Meta can spike Google CPA by 25-30%.

### How to Detect

**Pattern 2a: Meta TOF → Google Branded Search**
**Requires:** Meta evidence + Google Ads evidence

- Check if Meta has active prospecting/TOF campaigns (campaign type, objective).
- Check Google Ads for branded search campaign performance.
- Signal: If Meta TOF spend is significant AND Google branded search volume is strong, the halo effect is likely active.
- Stronger signal: If `cross_channel_signals` from either platform mentions this relationship.
- Quantification reference: Per Brainlabs × Meta, "The Impact of Facebook Advertising on Search" (2023): Meta TOF ads drive ~19% incremental branded search visits and ~30% incremental search conversions. [Source: Brainlabs case studies; also referenced in `reference/playbook/andromeda.md`]

**Confidence levels:**
- HIGH: Both platforms show correlated trends in their evidence (Meta spend up → branded search volume up), or evidence explicitly notes the correlation.
- MEDIUM: Meta has active TOF campaigns and Google has strong branded search, but no trend data to correlate.
- LOW: Only one side of the equation visible (e.g., Google branded search is strong but we don't know Meta TOF health).

**Pattern 2b: Email Engagement → Google Branded ROAS**
**Requires:** Email/Klaviyo evidence (outside ads-audit scope) + Google Ads evidence
**Note:** This pattern is detectable only if email evidence exists from a separate audit. Flag it as a recommendation: "If email engagement has dropped, expect branded search volume to decline — investigate email health."

**Pattern 2c: Paid Acquisition → Email/Retention Pipeline**
**Requires:** Meta evidence + retention data (outside ads-audit scope)
- If Meta TOF creative is fatigued (declining CTR, rising frequency), new customer pipeline is drying up. This will eventually hit retention metrics even if email itself is healthy.
- Flag as recommendation: "TOF pipeline weakening — check email list growth and retention metrics."

### What to Recommend
- Do NOT cut Meta TOF spend without modeling the impact on Google branded search. Estimate 25-30% Google CPA increase.
- If email list growth is slowing, check paid acquisition creative health first — the problem may be upstream.
- For budget reallocation: never cut a channel entirely without a holdout test — you may be killing a halo effect you can't see in platform dashboards.

---

## 3. Cannibalization

### What It Is
One channel or campaign is stealing conversions that another channel/campaign would have captured anyway. The business pays twice for the same customer.

### How to Detect

**Pattern 3a: PMax Eating Branded Search**
**Requires:** Google Ads evidence with PMax + branded search campaigns

- Check PMax search term categories (if available in evidence `raw_metrics.search_term_categories`).
- If PMax is bidding on branded terms AND a branded search campaign exists → cannibalization risk.
- Signal: High PMax conversion volume + declining branded search impression share or conversions.
- Quantification: Check what % of PMax conversions come from branded queries. PMax branded traffic is usually less incremental than PMax non-branded.

**Confidence levels:**
- HIGH: Search term category data shows >30% of PMax traffic is branded while a branded search campaign exists.
- MEDIUM: PMax and branded search both exist, branded search performance has declined since PMax launch, but no search term data.
- LOW: Both campaign types exist but no data to determine overlap.

**Pattern 3b: Retargeting Overlap (Meta + Email)**
**Requires:** Meta evidence + email/Klaviyo evidence (email evidence outside ads-audit scope)

- Check if Meta has active retargeting/remarketing campaigns targeting site visitors or cart abandoners.
- If email flows exist (from separate audit or client confirmation), both channels are likely targeting the same intent signal.
- The email flow is almost always more cost-effective (near-zero incremental cost vs. paid retargeting CPMs).
- Flag as recommendation even without email evidence: "If abandoned cart email flows are active, consider excluding email openers from Meta retargeting audiences to reduce overlap."

**Pattern 3c: Multi-Platform Attribution Stacking**
**Requires:** 2+ platform evidence files

- Check if the same high-value conversion events are being claimed by multiple platforms.
- Sum total claimed conversions across platforms vs. Shopify orders. (Overlaps with Attribution Overlap, but focuses on specific campaigns rather than totals.)
- Signal: Retargeting campaigns on Meta + Google remarketing (+ email flows if active) all claiming the same converters.

### What to Recommend
- PMax branded cannibalization: Add brand terms as negative keywords in PMax (if supported), or reduce branded search budget proportionally.
- Retargeting overlap: Prioritize email/SMS flows (higher ROI) and reduce paid retargeting budget or narrow the audience (exclude email openers from Meta retargeting audiences).
- Multi-platform stacking: Use MER instead of platform ROAS for budget decisions. Don't increase budget on a retargeting channel just because its reported ROAS is high — it may be taking credit for conversions that email would have captured.

---

## 4. Budget Imbalance

### What It Is
Ad spend is misallocated — typically over-invested in low-incrementality channels (branded search, retargeting) and under-invested in high-ROI channels (email/SMS) or budget-constrained profitable channels.

### How to Detect

**Pattern 4a: Highest-ROI Channel is Budget-Constrained**
**Requires:** 2+ platform evidence files

- Rank all audited channels by efficiency metric (ROAS, CPA vs. target, or MER contribution).
- Check if any high-performing channel shows budget constraint signals:
  - Google: "Limited by budget" status, impression share lost to budget >10%
  - Meta: delivery pacing issues, cost cap campaigns not fully spending
  - Amazon: budget utilization <70% on profitable campaigns
- Flag if a constrained channel outperforms an unconstrained channel.

**Pattern 4b: Branded/Retargeting Over-Invested**
**Requires:** Google Ads evidence (branded vs. non-branded split) + overall spend data

- Calculate branded + retargeting spend as % of total ad spend across all platforms.
- Threshold: >30% of total spend on branded search + retargeting = potential over-investment.
- Cross-check: Is prospecting/TOF spend sufficient to fill the funnel?

**Pattern 4c: Retention/Email Under-Invested**
**Requires:** Shopify evidence (customer data) — email evidence outside ads-audit scope

- Check Shopify new vs. returning customer ratio. If >85% of orders are from new customers, retention is weak regardless of email program health.
- Flag as recommendation: "Email/SMS should deliver 20-30%+ of total revenue. If retention revenue is low, audit the email program separately."
- If Shopify shows returning customer revenue <15% of total → under-invested in retention.

**Pattern 4d: Channel Allocation vs. Stage-Appropriate Split**
**Requires:** Total spend data + business stage knowledge (from manifest)

- Compare actual allocation to the stage-appropriate splits in channel-allocation.md.
- Flag significant deviations (>15% off the recommended split for the brand's stage).

### What to Recommend
- Budget-constrained winners: Increase budget 20-30% over 2 weeks, monitor for diminishing returns.
- Branded over-investment: Reduce branded search budget by 10-20%, reallocate to prospecting. Monitor total conversions (not just branded ROAS).
- Email under-investment: Audit and fix flows before increasing campaign frequency. Welcome, abandoned cart, post-purchase are the priority three.
- Stage mismatch: Provide the recommended allocation and a reallocation plan phased over 30-60 days.

---

## 5. Funnel Gaps

### What It Is
A specific stage of the conversion funnel is underperforming, dragging down the entire system. The fix depends on WHERE the gap is, not which platform looks worst.

### How to Detect

**Map the full funnel from available evidence:**

| Stage | Source of Data |
|-------|---------------|
| Impression/reach | Meta evidence, Google evidence |
| Click / CTR | Meta, Google, Amazon evidence |
| Site visit / session | GA4 evidence |
| Product view | GA4 evidence, Shopify evidence |
| Add to cart | GA4 evidence, Shopify evidence |
| Checkout initiated | GA4, Shopify evidence |
| Purchase | Shopify evidence (source of truth) |

**Pattern 5a: High Traffic Quality + Low CVR → Website Problem**
- Good CTR across platforms (Healthy+ range from benchmarks.md) BUT site CVR below Floor.
- This means ads are doing their job (attracting interested people) but the site isn't converting them.
- Fix is on the website, not in the ad platforms.

**Pattern 5b: Low CTR + Low CVR → Creative/Targeting Problem**
- CTR below Floor across platforms AND site CVR below Floor.
- The wrong people are seeing the ads AND the site isn't converting the few who do click.
- Fix creative and targeting first, then assess site CVR with improved traffic quality.

**Pattern 5c: Strong Acquisition + No Retention → LTV Leak**
- Healthy acquisition metrics (CTR, CVR, CPA within target) BUT:
  - Shopify shows >85% of orders from new customers (no retention engine)
  - OR returning customer revenue <10% of total
  - OR no evidence of email/SMS program (outside ads-audit scope — flag for separate audit)
- The business is paying to acquire customers and then letting them leave without building a relationship.

**Pattern 5d: High ATC + Low Checkout Completion → Checkout Problem**
- Add-to-cart rate is Healthy+ BUT cart abandonment rate exceeds 80% (or checkout completion rate is below benchmark).
- Common causes: unexpected shipping costs, complicated checkout, limited payment options, trust issues.
- Requires GA4 or Shopify evidence with funnel data.

**Pattern 5e: Strong Top-of-Funnel + Weak Middle → Nurture Gap**
- High impression volume and traffic BUT low product page engagement or browse-to-ATC rate.
- Visitors are landing but not engaging with products.
- Could be targeting mismatch (wrong audience) or landing page/PDP quality issue.

### What to Recommend
- Website problems (5a, 5d): Recommend site audit if not already done (`/audit-site`). Flag specific funnel stage where drop-off occurs.
- Creative problems (5b): Recommend creative refresh with specific creative testing guidance.
- Retention gaps (5c): Recommend email/SMS audit (use `/audit` for Klaviyo). Priority flows: welcome → abandoned cart → post-purchase.
- Nurture gaps (5e): Check if traffic is landing on the right pages. Review PDP quality. Consider quiz funnel or guided shopping experience.

---

## 6. Tracking Disconnects

### What It Is
Measurement infrastructure problems that make performance data unreliable. Must be identified and fixed BEFORE making optimization or budget decisions.

### How to Detect

**Pattern 6a: GA4 vs. Shopify Revenue Gap**
**Requires:** GA4 evidence + Shopify evidence

- Compare GA4 reported transactions/revenue to Shopify orders/revenue for the same period.
- Expected variance: ±10-15% (GA4 under-counts due to ad blockers, consent).
- Flag if gap >15%.
- Common cause: cross-domain tracking broken, GA4 loaded twice, consent mode blocking.

**Pattern 6b: Platform vs. GA4 Gap**
**Requires:** Any platform evidence + GA4 evidence

- Compare platform-reported conversions to GA4 transactions attributed to that source.
- Expected variance: ±15-20% (different attribution models).
- Flag if gap >25%.
- Common cause: CAPI misconfiguration, attribution window differences, modeled conversions.

**Pattern 6c: Platform vs. Shopify Gap**
**Requires:** Any platform evidence + Shopify evidence

- Compare platform-reported conversions to Shopify orders.
- Flag if gap >30%.
- This is the most serious disconnect — means platform data is significantly unreliable.

**Pattern 6d: Sudden Conversion Drops**
**Requires:** Any platform evidence with time-series data or historical comparison

- Check if any platform shows a sudden conversion drop (>20%) with stable traffic/sessions.
- Cross-reference known platform changes:
  - Meta Jan 2026: Attribution window removal (expect 15-40% fewer reported conversions)
  - Shopify Aug 2025: Checkout Extensibility migration (broke some tracking setups)
  - Google Jul 2025: Consent Mode v2 enforcement
- If drop aligns with a known change, flag as measurement shift, not performance change.

**Pattern 6e: Duplicate Event Detection**
**Requires:** Any platform evidence with tracking_health data

- Check for duplicate conversion actions (multiple events tracking the same purchase).
- Check for Pixel + CAPI without deduplication (Meta).
- Check for hardcoded + GTM GA4 installation (double-counting all events).
- Signal: conversion counts significantly higher than expected, or platform conversions > Shopify orders.

### What to Recommend
- GA4/Shopify gap >15%: Audit cross-domain tracking, check for duplicate GA4 installations, verify measurement ID consistency.
- Platform/Shopify gap >30%: Fix tracking before any budget changes. Check CAPI configuration, event deduplication, conversion action setup.
- Sudden drops: Check against known platform changes before diagnosing as a performance problem. Communicate measurement context to stakeholders.
- Duplicates: Consolidate to single conversion action per event type. Verify deduplication is configured (event_id matching for Meta CAPI).

---

## 7. Cross-Channel Product Performance

### What It Is
Products perform differently across sales channels. A bestseller on Shopify DTC may underperform on Amazon (or vice versa) due to pricing conflicts, listing quality differences, competitive dynamics, or channel-specific demand patterns. Identifying these discrepancies reveals optimization opportunities.

### How to Detect

**Requires:** Shopify evidence + Amazon Seller evidence (both must have product-level data)

**Matching products across platforms:**
- Match by product name/title (fuzzy match — Shopify "Product title" vs Amazon "Title")
- If SKU/ASIN mapping is available in the manifest or client context, use that instead
- Note: matching may be imperfect. Flag confidence level of matches.

**Pattern 7a: DTC Bestseller Underperforming on Amazon**
- Identify top 5 products by Shopify revenue (from Shopify evidence → product performance data)
- Check if those products appear in Amazon evidence → product-level seller data
- Signal: Shopify top product has low Amazon sessions, low CVR, or low Featured Offer %
- Common causes: weak Amazon listing (title, images, bullets), pricing conflict (higher on Amazon), low review count, poor keyword targeting

**Pattern 7b: Amazon Bestseller Underperforming on DTC**
- Identify top 5 products by Amazon ordered product sales (from Amazon evidence → product-level data)
- Check if those products appear in Shopify evidence
- Signal: Amazon top product has low Shopify revenue relative to its Amazon performance
- Common causes: not featured on homepage/collections, no paid traffic to that PDP, DTC price higher than Amazon, product not positioned for DTC audience

**Pattern 7c: Pricing Conflict Between Channels**
- Compare Shopify AOV per product (Gross sales ÷ Orders per product) vs Amazon Average Selling Price per ASIN
- Signal: >10% price difference on the same product across channels
- Impact: Amazon's price parity enforcement can suppress Featured Offer %. DTC customers may find the product cheaper on Amazon and abandon cart.

**Pattern 7d: Channel Concentration Risk**
- Calculate what % of each product's total revenue comes from each channel
- Signal: Any product where one channel drives >85% of revenue = concentration risk
- If Amazon drives >85%, organic rank loss or ad cost increase would crater that product's total revenue
- If DTC drives >85%, opportunity to expand to Amazon (or vice versa)

**Detection thresholds:**
- Price difference >10% → Flag as pricing conflict
- Product in top 5 on one channel but not in top 20 on the other → Flag as channel discrepancy
- Single channel >85% of product revenue → Flag as concentration risk

**Confidence levels:**
- HIGH: Product match confirmed by SKU/ASIN mapping, both platforms have product-level revenue data
- MEDIUM: Product match by name (fuzzy), both platforms have product-level data
- LOW: Product match uncertain, or one platform only has aggregate data (no product breakdown)

### What to Recommend
- DTC bestseller weak on Amazon (7a): Audit Amazon listing quality (title, images, A+ content, reviews). Check keyword targeting in Amazon Ads. Ensure price parity.
- Amazon bestseller weak on DTC (7b): Feature product prominently on site. Test paid traffic to that PDP. Consider bundle/exclusive offers for DTC.
- Pricing conflict (7c): Align pricing or differentiate by offering DTC-exclusive bundles/sizes. Check Amazon MAP enforcement if applicable.
- Concentration risk (7d): Develop the underrepresented channel. For Amazon-heavy products, test DTC ads. For DTC-heavy products, optimize Amazon listing + launch campaigns.

---

## 8. Owned-Channel Collapse

### What It Is
Email/SMS revenue has collapsed (>40% YoY decline) or owned channels are contributing less than 15% of total revenue. Paid acquisition is masking a broken retention engine — every customer paid traffic acquires is one the lifecycle program should have re-activated for free. Cutting paid before the retention engine is fixed will crater the account.

### How to Detect

**Requires:** Email/SMS evidence (Klaviyo, ideally) + Shopify or BigCommerce evidence for total revenue. If Klaviyo evidence isn't available, flag as a data gap — pattern can still be inferred from Shopify returning-customer ratio, but at lower confidence.

1. **Compare email + SMS attributed revenue YoY.** Pull current-period email + SMS revenue from Klaviyo evidence; compare to prior-year same period.
2. **Compute owned-channel revenue share of total:**
   - `Owned % = (Email revenue + SMS revenue) / Total Shopify (or BigCommerce) revenue`
3. **Cross-check retention signals from Shopify:** returning-customer ratio, repeat purchase rate. Low retention metrics + low owned-channel share = strong corroboration.

**Detection thresholds:**
- Email + SMS YoY revenue down >40% → Severe collapse
- Owned-channel revenue <15% of total → Structural under-investment
- Both triggered → strongest signal
- Either triggered alone → still a pattern, lower confidence

**Confidence levels:**
- HIGH: Klaviyo evidence + ecommerce evidence both present, both detection thresholds met.
- MEDIUM: Only one threshold met, OR only one of the two evidence sources is present.
- LOW: Neither Klaviyo nor client confirmation; pattern inferred from Shopify returning-customer ratio alone.

### What to Recommend
- Audit the lifecycle program — welcome, abandoned cart, and post-purchase flows are the priority three. Most owned-channel collapse traces to broken or aging core flows, not campaign cadence.
- Do NOT cut paid spend before the retention engine is fixed. Paid is masking the bleed; cutting it with weak retention will crater the account.
- Cross-reference: recommend the `/audit` skill for a Klaviyo lifecycle deep-dive, then re-run audit synthesis once retention metrics are repaired.
- Body lead reframing: "Your retention engine is broken. Paid is masking it by acquiring customers you should already own."

---

## 9. TOF-Underfunded

### What It Is
Top-of-funnel spend share has fallen at or below the Floor of the dynamic target (per the brand's stage × AOV tier), AND nROAS is declining over the lookback. The funnel is starving — the closer-stage audience pool will saturate in 30-60 days and the cliff hits next.

### How to Detect

**Requires:** 2+ platform evidence files with funnel-stage classification (from v2 Channel Role Classification, Step 1.4). Manifest must include brand stage and AOV tier for the dynamic target lookup.

1. **Compute cross-platform TOF spend share** from v2 Step 1.4 outputs:
   - `TOF Share = TOF Spend (all platforms) / Total Paid Spend (all platforms)`
2. **Look up the dynamic TOF target Floor** in `reference/full-funnel-framework.md` Section 4 — the canonical 12-cell dynamic TOF target table (3 brand stages × 4 AOV tiers), with modifier rules (returning customer %, MER trend, total spend) in Section 4.3. (Note: `reference/playbook/benchmarks.md` does NOT contain this table — it has the AOV tier benchmarks for TOF *quality* metrics like CPATC/CPVC, not the spend-share targets.)
3. **Compute nROAS trend** across the audit window — current period vs. prior period, same lookback length.

**Detection thresholds:**
- TOF share at or below the Floor of the dynamic target band → underfunded
- nROAS declining (>5% drop over the lookback) → funnel pressure confirmed
- Both triggered → strongest signal — saturation cliff is imminent
- TOF share below Floor but nROAS flat → early signal, not yet pressure-tested

**Confidence levels:**
- HIGH: Both signals trigger AND brand stage + AOV tier are confirmed in manifest.
- MEDIUM: Only one signal triggers, OR brand stage / AOV tier is inferred rather than confirmed.
- LOW: Funnel-stage classification is uncertain (Pull 7 audience parsing flagged DATA_QUALITY_SUSPECT) — the TOF share calculation isn't reliable enough to lead with.

### What to Recommend
- Refund TOF — target the Healthy band of the dynamic target, not just the Floor. The Floor is bare-minimum breakeven; sustainable growth lives in Healthy.
- Plan creative production now — refunding TOF without new creative just accelerates fatigue on existing assets. Brief and produce 30-60 days of TOF assets before the spend increase lands.
- Expect lifecycle/retention pressure 30-60 days out as the closer-stage audience saturates. Pre-empt by warming the email/SMS program for the incoming wave of new customers.
- Cross-reference: `reference/full-funnel-framework.md` Section 4 for the dynamic TOF target derivation AND the lookup table (12 cells). `reference/playbook/benchmarks.md` separately for TOF *quality* metric benchmarks (CPATC, CPVC, engaged time) by AOV tier — those are different concepts and live in different files.
- Body lead reframing: "Your funnel is starving. Expect a cliff in 30-60 days as your closer-stage audience saturates."

---

## 10. Profitability Trap

### What It Is
Platform-reported metrics look healthy (ROAS at or above the minimum required for the brand's gross margin) but the business isn't actually making money. MER is below minimum, OR CM3 is negative despite the green ROAS. The platform numbers may be technically honest — the trap is everything they don't capture: returns, discount stacking, fulfillment, payment processing, agency and tool overhead.

**This pattern is NOT a duplicate of Attribution Overlap (Pattern 1).** Attribution Overlap is "platforms claim 2× the conversions they actually drove" — platform numbers are inflated. Profitability Trap is "platform numbers may be honest, but the business is still losing money after all costs are loaded." Both can fire simultaneously — they are orthogonal diagnoses.

### How to Detect

**Requires:** Cross-Platform Anchor outputs from v2 Step 1.6 (platform ROAS, MER, CM2, CM3 if calculable). Shopify or BigCommerce evidence required for honest revenue. Gross margin or COGS estimate required (use vertical estimate per `profitability-framework.md` if client COGS unavailable).

1. **Compare platform ROAS vs. MER** from the Cross-Platform Anchor.
2. **Compute the minimum ROAS threshold:** `Minimum ROAS = 1 / Gross Margin %`. This is the absolute floor — below it, the business loses money on ad spend alone before any other costs (per `reference/synthesis/profitability-framework.md`).
3. **Run the trap detection comparisons:**
   - Platform ROAS ≥ minimum AND MER < minimum → Profitability Trap candidate
   - CM3 < 0 (if calculable) → Profitability Trap confirmed
4. **Run the 5-check "Good ROAS but Bad Profit" detection** per `profitability-framework.md` Section "Good ROAS but Bad Profit Detection":
   - Check 1: Return rate impact (vertical-adjusted if data unavailable)
   - Check 2: Discount stacking
   - Check 3: Fulfillment cost allocation
   - Check 4: Payment processing
   - Check 5: Agency and tool overhead

**Detection thresholds:**
- Platform ROAS ≥ minimum AND MER < minimum → trap signal present
- CM3 < 0 → trap confirmed
- ≥2 of the 5 hidden-cost checks failing → trap mechanism identified

**Confidence levels:**
- HIGH: All canonical inputs OBSERVED/CALCULATED (revenue, spend, COGS, return rate). Minimum ROAS, MER, and CM3 all calculable. Trap signal present in BOTH MER and CM3.
- MEDIUM: COGS or return rate is ASSUMPTION-labeled (vertical estimate), but other inputs are firm. Trap signal present in MER OR CM3 (not both).
- LOW: COGS unavailable AND return rate unavailable — trap is suggested but not verifiable from the evidence.

### What to Recommend
- Lead the body with the CM3 waterfall — it's the headline diagnostic. Visualize where each dollar of revenue goes: COGS → fulfillment → marketing → processing → returns → CM3.
- Identify which hidden cost is the leak. Usually it's one or two of the five checks — returns (apparel), discount stacking (consumables), or fulfillment (heavy/bulky goods) are the most common culprits.
- Recalibrate target ROAS: `Break-even CPA × 0.65` with the actual fully-loaded cost structure. The platform-side target ROAS is wrong if it was set against a thin definition of cost.
- Cross-reference: `reference/synthesis/profitability-framework.md` for the canonical CM2/CM3/MER thresholds, the full 5-check "Good ROAS but Bad Profit" detection, and the COGS estimation logic when client COGS is unavailable.
- Body lead reframing: "Platform metrics look fine but you're not making money. Here's why your ROAS is lying."

---

## 11. Healthy / Optimization

### What It Is
The absence-of-pattern pattern. None of Patterns 1-10 trigger with HIGH confidence, AND the v3 Account Scorecard shows Healthy or above on every framework dimension. The account is fundamentally working — the audit shifts from triage mode to upside mode.

### How to Detect

**Requires:** All other pattern detections complete. v3 Account Scorecard with framework-dimension scores.

1. **Run all other pattern detections** (Patterns 1-10) per their detection rules.
2. **Verify no pattern triggered HIGH confidence.** A single HIGH-confidence pattern disqualifies Healthy.
3. **Open the v3 Account Scorecard.** Verify every framework dimension scores Healthy or above (no Critical, no At Risk).
4. **If both conditions hold** → Healthy / Optimization is the dominant pattern.

**Detection thresholds:**
- Zero patterns at HIGH confidence AND zero scorecard dimensions below Healthy → Healthy / Optimization fires
- One MEDIUM-confidence pattern AND scorecard fully Healthy → still Healthy / Optimization, but surface the secondary pattern in Priority Actions
- Any HIGH-confidence pattern OR any scorecard dimension below Healthy → does NOT trigger; another pattern is dominant

**Confidence levels:**
- HIGH: No HIGH-confidence pattern present, scorecard fully Healthy or better, key inputs (revenue, spend, MER, CM3) all OBSERVED/CALCULATED.
- MEDIUM: One MEDIUM-confidence secondary pattern present but scorecard fully Healthy.
- LOW: Not applicable — Healthy / Optimization is the fallthrough. If the data is too thin to evaluate the other patterns, the dominant pattern is Tracking-Broken (data integrity gates trust), not Healthy.

### What to Recommend
- Shift the report from triage mode to upside mode. The Priority Actions are about "what would unlock the next level," not "what's broken."
- Testing roadmap: prioritize 2-3 high-leverage tests (creative concept tests, audience expansion, landing page tests).
- Retention deepening: lifecycle program improvements (segmentation, post-purchase journey, win-back) — even if email is healthy now, marginal lift is high-leverage at this stage.
- Channel expansion: explore the next channel given the brand's stage (TikTok if Meta is saturated, retail media if DTC is saturated, CTV if budget supports it).
- Cross-reference: `reference/full-funnel-framework.md` for the framework dimensions definitions. `reference/synthesizer.md` Section 2.2 for the Account Scorecard structure — adaptive 8-row (when nROAS data available) or 7-row (degraded). "All Healthy" detection means every row in the rendered scorecard scores GREEN; if any row is RED or YELLOW, the Healthy pattern does NOT trigger.
- Body lead reframing: "Account is fundamentally healthy. Here's what would unlock the next level."

---

## Pattern Naming Map (v3 ↔ existing)

The 7 v3 dominant patterns in `v3-quality-framework.md` Section 2.3 map to patterns in this file. Some are renames (same detection logic, different label); some are NEW (added in Wave 3.5 specifically to support v3 pattern-led report templates). The mapping:

| v3 Dominant Pattern | This file's Pattern | Status |
|---|---|---|
| Tracking-Broken | #6 Tracking Disconnects | Renamed (same detection logic) |
| Owned-Channel Collapse | #8 Owned-Channel Collapse | NEW (added Wave 3.5) |
| TOF-Underfunded | #9 TOF-Underfunded | NEW (added Wave 3.5) |
| Profitability Trap | #10 Profitability Trap | NEW (added Wave 3.5) |
| Cannibalization | #3 Cannibalization | Same |
| Allocation Imbalance | #4 Budget Imbalance | Renamed (same detection logic) |
| Healthy / Optimization | #11 Healthy / Optimization | NEW (added Wave 3.5) |

**Patterns in THIS file NOT used as v3 dominant patterns:**
- #1 Attribution Overlap — orthogonal cross-channel pattern, used in Priority Actions / cross-channel synthesis but not the report's body lead
- #2 Halo Effects — orthogonal, same
- #5 Funnel Gaps — orthogonal, same (some sub-patterns may inform TOF-Underfunded or Profitability Trap as secondary findings)
- #7 Cross-Channel Product Performance — orthogonal, same

**Note:** The synthesizer should always run all 11 detections. The 7 v3 dominant patterns drive the body's lead and money chart; the other 4 contribute to Priority Actions and per-channel pages but don't drive the report's narrative shape.

---

## Dominant Pattern Selection (v3)

### Purpose

When 2+ patterns trigger with HIGH or MEDIUM confidence, the synthesizer must pick **one** as the report lead. The chosen lead — the **dominant pattern** — determines:

- The body opener (the single-paragraph verdict at the top of the report).
- The "money chart" (the headline visualization on Page 1).
- The default first-2 Priority Actions (the lead pattern's Action Contracts come first).
- Per-channel page framing (each channel page is interpreted in light of the dominant pattern, not in isolation).

Other triggered patterns become **secondary patterns** — they still get recommendations folded into Priority Actions, but they don't drive the body lead.

This section formalizes the selection logic so the synthesizer (and any reviewer) can audit the decision.

### Precedence Ranking

Verbatim from `v3-quality-framework.md` Section 2.3 (with cross-references to this file's pattern numbers — see **Pattern Naming Map (v3 ↔ existing)** above for the full mapping):

1. **Tracking-Broken** (#6 Tracking Disconnects) — always wins; gates trust in everything else
2. **Profitability Trap** (#10)
3. **Owned-Channel Collapse** (#8)
4. **TOF-Underfunded** (#9)
5. **Cannibalization** (#3)
6. **Allocation Imbalance** (#4 Budget Imbalance)
7. **Healthy / Optimization** (#11)

Tracking-Broken always wins because no other diagnosis is trustworthy until measurement is reliable. The remaining order goes by business-impact severity: profitability before growth, retention before acquisition, structural funnel issues before efficiency tuning, with Healthy as the fallthrough.

Patterns 1, 2, 5, and 7 in this file (Attribution Overlap, Halo Effects, Funnel Gaps, Cross-Channel Product Performance) are NOT in this ranking — they are orthogonal cross-channel patterns that contribute to Priority Actions and per-channel pages but never drive the body lead. See the Pattern Naming Map for details.

### Selection Algorithm

```
1. Run pattern detection across all 7 patterns (per detection rules above + v3 framework §2.3).
2. Filter: keep only patterns flagged HIGH or MEDIUM confidence. Drop LOW confidence.
3. If filtered set is empty → dominant_pattern = "healthy-optimization" (see edge case below).
4. Otherwise → dominant_pattern = the highest-precedence pattern in the filtered set
   (i.e., walk the precedence list top-down, pick the first pattern present).
5. secondary_patterns = all other patterns in the filtered set, sorted by precedence.
6. Write all three to the manifest (see Manifest Output below).
```

The synthesizer must run this algorithm explicitly before drafting the body — no implicit "pick whichever pattern feels biggest" judgement calls. The precedence list is the spec.

### Detection Threshold (restated from v3 framework)

| Confidence | Criteria | Participates in selection? |
|---|---|---|
| **HIGH** | Detection signal hits all required evidence with **no** `DATA_QUALITY_SUSPECT` flags. | Yes |
| **MEDIUM** | Detection signal hits with **one** source missing OR **one** `DATA_QUALITY_SUSPECT` flag. Pattern still triggers but is labeled MEDIUM. | Yes |
| **LOW** | Detection signal hits with **multiple** data quality issues. Pattern is flagged for the appendix as "worth investigating" but does NOT participate in dominant-pattern selection. | No |

Rationale: leading the body with a LOW-confidence pattern risks framing the entire audit around a finding that doesn't survive scrutiny. LOW patterns are still surfaced — just not as the lead.

### Edge Case — Multiple Patterns at the Same Precedence Level

Cannot happen. The precedence ranking above is a **strict total order** — each of the 7 patterns occupies exactly one rank. If two pattern signals both fire (e.g., Tracking-Broken AND TOF-Underfunded), they are at different ranks by definition, so the algorithm always returns a unique dominant pattern.

Document this explicitly so future maintainers don't add tie-breaker logic that isn't needed.

### Edge Case — No Patterns Trigger

If the filtered (HIGH/MEDIUM) set is empty, dominant_pattern falls through to **Healthy / Optimization** (rank 7). Healthy always passes — it's the fallthrough case, not a detected pattern. The body lead shifts from triage to upside (testing roadmap, retention deepening, channel expansion) per the v3 framework.

### Manifest Output

The synthesizer writes these three keys to the audit manifest before drafting the body:

```yaml
dominant_pattern: "tracking-broken"   # one slug from the 7 patterns
secondary_patterns:                    # any other triggered patterns, in precedence order
  - "profitability-trap"
  - "tof-underfunded"
pattern_confidence:                    # per-pattern confidence labels for ALL detected patterns
  tracking-broken: "HIGH"
  profitability-trap: "MEDIUM"
  tof-underfunded: "MEDIUM"
  cannibalization: "LOW"               # LOW patterns appear here but not in secondary_patterns
```

**Pattern slugs** (canonical, kebab-case):
- `tracking-broken`
- `profitability-trap`
- `owned-channel-collapse`
- `tof-underfunded`
- `cannibalization`
- `allocation-imbalance`
- `healthy-optimization`

The Pre-Delivery Quality Gate (v3 framework §2.4) verifies that the body opener matches `manifest.dominant_pattern`. Mismatch → regenerate body.

### Cross-Reference to Templates

The dominant pattern slug determines which template file to load from `reference/synthesis/templates/{slug}.md` — see Agent F's Wave 3 output for the 7 template files. The template provides the body opener, the recommended money chart, the default first-2 Priority Action skeletons, and the per-channel framing for that pattern.

---

## Pattern Interaction Matrix

Some patterns reinforce or mask each other. Check for these combinations:

| Pattern A | + Pattern B | Combined Signal |
|-----------|-------------|-----------------|
| Attribution Overlap | Budget Imbalance | Over-attributed channel getting more budget because its ROAS "looks great" — double problem |
| Halo Effects | Cannibalization | Hard to separate: is Meta driving Google conversions (halo) or is Google just claiming Meta's converters (cannibalization)? Need incrementality test. |
| Tracking Disconnects | Any other pattern | Tracking problems undermine all other analysis. Fix tracking FIRST, then re-evaluate patterns. |
| Funnel Gap (website) | High Ad Spend | Increasing ad spend into a broken funnel = wasting money faster. Fix the funnel before scaling. |
| Budget Imbalance | Funnel Gap (retention) | Under-investing in email while over-investing in acquisition = acquiring customers you can't retain. Fix retention before scaling acquisition. |
| Attribution Overlap | Halo Effects | Some of what looks like "overlap" may actually be a real halo effect. Without incrementality testing, you can't fully separate the two. Note both patterns and recommend testing. |
| Cross-Channel Products | Budget Imbalance | Product getting heavy ad spend on one channel but underperforming on the other = misallocated spend or listing quality issue |
| Cross-Channel Products | Funnel Gaps | Product with high traffic on both channels but low CVR on one = channel-specific conversion problem (listing quality, pricing, trust) |
| Profitability Trap | Attribution Overlap | Both can fire orthogonally — they describe different failure modes. Trap = real costs (returns, fulfillment, agency overhead) under-counted in ROAS denominator. Overlap = conversions over-counted in ROAS numerator. Both inflate platform ROAS but in opposite directions; CM3 + MER reconciliation surface both. Flag both patterns when both trigger; the Profitability Trap fix (cost loading) and the Overlap fix (deduplication / MER for budget decisions) compose without conflict. |
| Profitability Trap | TOF-Underfunded | Often co-occur in mature accounts: weak unit economics force budget toward "safe" capture channels (branded, retargeting), starving TOF, which propagates back to deeper unit-economics decay 60-90 days later. Fix order: profitability anchor first (so reinvestment math is honest), then TOF refunding (so the funnel doesn't collapse). |
| Owned-Channel Collapse | Healthy / Optimization | Can NOT both fire — Owned-Channel Collapse triggers a non-Healthy scorecard dimension by definition (Owned channel health row goes RED), so the Healthy pattern's "all dimensions ≥ Healthy" gate prevents both from being dominant. If they appear to both fire, the dominant pattern is always Owned-Channel Collapse. |

---

## Confidence Calibration Rules

- **HIGH confidence:** Pattern is supported by direct numerical evidence from 2+ platforms with matching date ranges. Calculations use OBSERVED or CALCULATED data.
- **MEDIUM confidence:** Pattern is directionally supported but relies on some INFERENCE data, different date ranges, or incomplete funnel visibility.
- **LOW confidence:** Pattern is suggested by limited data or relies heavily on ASSUMPTION-labeled inputs. Flag as "worth investigating" rather than a firm finding.

Never label a cross-channel pattern as HIGH confidence if any of its key inputs are ASSUMPTION-labeled.
