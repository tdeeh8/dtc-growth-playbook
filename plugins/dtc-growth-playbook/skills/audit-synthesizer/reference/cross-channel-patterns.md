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
   - Klaviyo: `account_overview` → attributed revenue / orders
   - Amazon: `account_overview` → orders metric
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
- Quantification reference: Brainlabs research shows Meta drives 19% more search visits, but only 30% of resulting branded conversions are truly incremental.

**Confidence levels:**
- HIGH: Both platforms show correlated trends in their evidence (Meta spend up → branded search volume up), or evidence explicitly notes the correlation.
- MEDIUM: Meta has active TOF campaigns and Google has strong branded search, but no trend data to correlate.
- LOW: Only one side of the equation visible (e.g., Google branded search is strong but we don't know Meta TOF health).

**Pattern 2b: Email Engagement → Google Branded ROAS**
**Requires:** Klaviyo evidence + Google Ads evidence

- Check Klaviyo for campaign engagement metrics (open rates, click rates).
- Check Google for branded search performance.
- Signal: High email engagement often drives branded search queries as subscribers search for deals/products they saw in emails.

**Pattern 2c: Paid Acquisition → Email List Growth**
**Requires:** Meta/TikTok evidence + Klaviyo evidence

- Check paid acquisition volume (new visitors from Meta/TikTok).
- Check Klaviyo list growth rate.
- Signal: If paid creative is fatigued (declining CTR, rising frequency) AND email list growth has slowed, the TOF pipeline may be drying up.

### What to Recommend
- Do NOT cut Meta TOF spend without modeling the impact on Google branded search. Estimate 25-30% Google CPA increase.
- If email list growth is slowing, check paid acquisition creative health before blaming Klaviyo.
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
**Requires:** Meta evidence + Klaviyo evidence

- Check if Meta has active retargeting/remarketing campaigns targeting site visitors or cart abandoners.
- Check if Klaviyo has abandoned cart or browse abandonment flows active.
- Signal: Both channels targeting the same intent signal (cart abandonment) with the same people.
- The email flow is almost always more cost-effective (near-zero incremental cost vs. paid retargeting CPMs).

**Pattern 3c: Multi-Platform Attribution Stacking**
**Requires:** 2+ platform evidence files

- Check if the same high-value conversion events are being claimed by multiple platforms.
- Sum total claimed conversions across platforms vs. Shopify orders. (Overlaps with Attribution Overlap, but focuses on specific campaigns rather than totals.)
- Signal: Retargeting campaigns on Meta + Google remarketing + Klaviyo flows all claiming the same converters.

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

**Pattern 4c: Email/SMS Under-Invested**
**Requires:** Klaviyo evidence + Shopify or revenue evidence

- Check email/SMS revenue as % of total revenue.
- Threshold from channel-allocation.md: Email/SMS should deliver 20-30%+ of total revenue.
- If email revenue <15% of total → under-invested (missing flows, weak capture, low frequency).
- If email revenue <10% → significantly under-invested — likely missing core flows entirely.

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
  - No Klaviyo evidence (no email/SMS program)
  - OR Klaviyo evidence shows missing core flows (welcome, abandoned cart, post-purchase)
  - OR email revenue <10% of total
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
- Retention gaps (5c): Recommend Klaviyo audit and flow buildout. Priority: welcome → abandoned cart → post-purchase.
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

---

## Confidence Calibration Rules

- **HIGH confidence:** Pattern is supported by direct numerical evidence from 2+ platforms with matching date ranges. Calculations use OBSERVED or CALCULATED data.
- **MEDIUM confidence:** Pattern is directionally supported but relies on some INFERENCE data, different date ranges, or incomplete funnel visibility.
- **LOW confidence:** Pattern is suggested by limited data or relies heavily on ASSUMPTION-labeled inputs. Flag as "worth investigating" rather than a firm finding.

Never label a cross-channel pattern as HIGH confidence if any of its key inputs are ASSUMPTION-labeled.
