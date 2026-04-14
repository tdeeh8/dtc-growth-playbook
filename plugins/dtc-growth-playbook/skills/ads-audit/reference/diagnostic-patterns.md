# Diagnostic Patterns Library

Codified patterns observed across real audits. Each pattern has a detection signature, confidence threshold, and a recommended action. These are high-leverage checks — running them catches issues that account-level metrics hide.

**Load this file during:**
- Synthesizer step (cross-channel scan)
- Any deep-dive on a RED platform
- Before writing the "Top Risks" section of the Marketing Director Overview

---

## Pattern 1: Meta UTM Fragmentation

**What it is:** Meta traffic arrives at the site tagged with multiple inconsistent UTM parameter variants — some set by Shopify's auto-tagger, some by Meta's default URL parameters, some by manual UTMs, some by third-party link tools. GA4 can't reconcile them into a single "Paid Social" bucket with revenue, so Meta appears to drive zero or negligible revenue in GA4 while the ads platform reports real purchases.

**Detection signature:**
In GA4 Session Source/Medium breakdown, check for 3+ of these coexisting:
- `facebook / paid`
- `facebook / paidsocial`
- `facebook / socialads`
- `fb / paid`
- `ig / paid`
- `instagram / paid`
- `shareable_link / paid`
- `m.facebook.com / referral` (with significant sessions)
- Anything with `meta` or `facebook` or `ig` + a non-standard medium

**Confidence:** HIGH if:
- 3+ of the above variants have >100 sessions each
- Total of these variants attribute <20% of Meta's reported revenue
- Meta platform reports purchases that don't sum to what GA4 credits to paid social

**Business implication:** The largest consequence is decision-making blindness. Scaling or cutting Meta is being decided against a corrupted channel signal. Direct and Unassigned channels are absorbing the misattributed revenue, inflating their apparent ROAS.

**Recommended action:**
1. Standardize to one UTM template applied at the campaign level: `utm_source=meta&utm_medium=paid_social&utm_campaign={campaign_name}&utm_content={ad_name}`
2. Disable Shopify's auto-tagger for Meta traffic (or override with the template above)
3. Disable auto-URL-tagging in Meta Ads Manager → Ad level → URL parameters
4. Wait 14 days after fixing, re-check GA4 Source/Medium

**Companion metric:** "% of Meta sessions attributed in GA4" — calculated as (sessions with source=meta + medium=paid_social) ÷ (total Meta reported impressions-to-clicks). This metric should climb from ~2% to ~80%+ after the fix. Track weekly.

---

## Pattern 2: Google Ads Duplicate Purchase Conversion Actions

**What it is:** Google Ads has 2-3 different purchase conversion actions firing per transaction (e.g., HM Purchase Shopify, Google Shopping App Purchase, GA4 Web Purchase Import). Only one has value configured; the others have $0 value. Campaign "Conversions" counts only the primary, but "All Conversions" counts every fire — inflating secondary metrics. Smart Bidding on any campaign optimizing toward the $0-value action runs blind.

**Detection signature:**
In Google Ads conversion action audit (Pull 5 of google-ads-deep.md), check for:
- 2+ purchase conversion actions where "All Conversions" count matches within 20% (same event counted multiple ways)
- One action with meaningful `$ Conversion Value` and others with $0
- Shopping or PMax campaigns showing ROAS near 0× despite real sales

**Confidence:** HIGH when all three signals present.

**Business implication:**
- Standard Shopping and other campaigns using the zero-value action look broken when they're not.
- Smart Bidding (tROAS, Max Conv Value) optimizes against a corrupted signal.
- Every downstream dashboard counts purchases 2-3 times when "All Conversions" is used.

**Recommended action:**
1. Identify the authoritative purchase action (usually Shopify or native pixel with value configured).
2. Either (a) disable the duplicate actions, or (b) configure their values correctly and de-dupe in GA4.
3. Confirm Smart Bidding campaigns reference only the primary action.
4. Wait 2 weeks and re-audit Standard Shopping + PMax ROAS.

---

## Pattern 3: Direct Absorption (Misattributed Paid)

**What it is:** GA4 Direct channel shows an unusually high share of revenue relative to its session share, often >40% of revenue on <25% of sessions. This usually means another paid channel is losing its UTM tagging and getting re-credited to Direct — commonly Meta (see Pattern 1), affiliate, or email/SMS without proper tagging.

**Detection signature:**
- Direct revenue share > 1.5× Direct session share (e.g., 40% of rev on 25% of sessions)
- Direct AOV > site-wide AOV by >15%
- At least one paid channel with significant session volume but <30% of its platform-reported revenue

**Confidence:**
- HIGH if 2+ paid channels are UTM-broken (Pattern 1 confirmed)
- MEDIUM if only session/revenue ratio is anomalous

**Business implication:** Direct appears to be a high-value brand channel; in reality, it's a leak bucket. Decisions that credit the brand for organic Direct growth are based on attribution noise.

**Recommended action:**
1. First resolve the UTM leak (Pattern 1 and/or lifecycle tagging).
2. Track Direct revenue share as a KPI — expect it to decline meaningfully after UTM standardization.
3. True Direct should be ~15-25% of revenue for most DTC brands with active paid.

---

## Pattern 4: Owned Channel Collapse

**What it is:** Email and/or SMS revenue drops >50% YoY with no offsetting gain elsewhere. Usually caused by: ESP/SMS provider churn, broken flows, deliverability drop, UTM tagging regression in email links, or deprioritization without plan.

**Detection signature:**
- Email channel YoY revenue down >50% OR
- SMS channel YoY revenue down >50% OR
- Combined owned-channel revenue share dropped from >10% to <3% YoY

**Confidence:** HIGH. This pattern is almost never a tracking artifact — owned-channel revenue tracks reliably. If the number is down, the revenue is gone.

**Business implication:** Owned-channel revenue is the highest-margin revenue in the stack. A 90% drop is an immediate P&L hit that paid media can't offset at any reasonable ROAS. This is usually the single biggest issue in an audit when present.

**Recommended action:**
1. Diagnose: Check ESP/SMS account is active and sending. Check deliverability. Check flows are live. Check UTM tagging on email links.
2. Restore core flows first: Welcome, Abandoned Cart, Post-Purchase, Win-Back. These alone typically account for 60-70% of lifecycle revenue.
3. Launch a reactivation campaign to lapsed customers within 30 days.
4. Set a weekly revenue recovery target and track.

**Required in report:** If this pattern fires, it moves to **Risk #1** in the Marketing Director Overview, regardless of paid media scoring.

---

## Pattern 5: View Content / Wrong-Event Optimization

**What it is:** A Meta campaign at the bottom of the funnel (retargeting or considered-purchase) is optimizing toward View Content, Landing Page Views, or another engagement event instead of Purchase. This wastes spend on people who view but never buy, especially costly on high-AOV products.

**Detection signature:**
- Campaign objective = SALES but ad set optimization event ≠ Purchase
- High spend, low tracked purchases, high engagement metrics
- Explicit naming signal (e.g., "View Content" in campaign name)
- $1K+ AOV product with BOF campaigns optimizing on non-purchase events

**Confidence:** HIGH with campaign-level objective + event data.

**Business implication:** Wastes 100% of the spend for purchase-intent goals. Meta's algorithm optimizes toward cheap engagements, which for a considered purchase are essentially noise.

**Recommended action:**
1. Pause the campaign or switch optimization to Purchase (requires sufficient purchase volume in the account — ~50 purchases/week at the ad-set level).
2. Reallocate the budget to a proven prospecting or retargeting campaign with Purchase optimization.
3. If volume is too low for Purchase optimization, use Initiate Checkout as intermediate signal.

---

## Pattern 6: Retargeting Fatigue

**What it is:** Retargeting campaign frequency climbing past 4, CPM climbing disproportionately (>$40 when prospecting CPM is $15-25), ROAS declining week-over-week. The audience has been hit enough times that the next impression costs more and earns less.

**Detection signature:**
- 30-day frequency ≥ 3.5
- CPM > 2× prospecting CPM in same account
- Week-over-week ROAS trending down with spend stable

**Confidence:** HIGH.

**Business implication:** Retargeting is burning budget optimizing against a saturated audience. The marginal dollar earns less every week until creative refresh.

**Recommended action:**
1. Launch a new creative round (minimum 3-5 new assets). New angles, not just format variations.
2. Expand the retargeting audience window (14d → 30d → 60d) or expand to new audience sources (site visitors + video viewers + engagement).
3. Cap frequency at 3-4 where possible via bid strategy.

---

## Pattern 7: PMax Branded Cannibalization

**What it is:** Performance Max is serving against branded queries (where someone searched the brand name) and taking credit for conversions that would have happened organically or through Branded Search at a much lower cost. PMax's ROAS looks inflated; Branded Search's volume drops.

**Detection signature:**
- PMax spend share > 30% of Google Ads spend
- Branded Search conversion volume dropped YoY while PMax volume rose proportionally
- PMax ROAS dramatically exceeds account average (>2× the account blended)
- Branded Search CPA rose YoY despite stable intent

**Confidence:** MEDIUM — needs PMax campaign insights data or query-level visibility to confirm. Flag the pattern; recommend Google Ads PMax Insights review.

**Business implication:** PMax attribution is taking credit for free brand demand. The "scale PMax" instinct is partially correct but part of the ROAS is cannibalistic, not incremental.

**Recommended action:**
1. Add brand terms as negative keywords to PMax (via customer support or account-level negatives if available).
2. Or split PMax into Branded-Only and Non-Branded campaigns.
3. Re-measure incrementality after 30 days.

---

## Pattern 8: Attribution Ratio Over 2×

**What it is:** The sum of platform-reported purchases across all ad platforms exceeds the actual site transaction count by 2× or more. Every platform is claiming the same purchase.

**Detection signature:**
- (Google purchases + Meta purchases + Amazon purchases) ÷ (Shopify/BC transactions OR GA4 transactions) > 2.0×

**Confidence:** HIGH.

**Business implication:** Platform-level ROAS numbers are double-counted. The "blended ROAS" derived from summing reported values is inflated. Actual ROI per channel is unknowable without multi-touch attribution.

**Recommended action:**
1. Flag in the report; don't use summed ad-reported revenue for MER.
2. Use site revenue (GA4 or Shopify) as the denominator for blended ROAS / MER instead.
3. Recommend a multi-touch attribution tool (Triple Whale, Polar, Northbeam) for medium+ ad spend.

---

## Pattern 9: Single Purchase Conversion Action Shared Across Unrelated Campaigns

**What it is:** Google Ads or Meta has one purchase conversion action that every campaign optimizes toward — including Awareness, Brand Awareness, Demand Gen, or top-funnel campaigns that shouldn't optimize to Purchase. These campaigns look broken because they "have 0 conversions" when in reality their goal is reach or consideration.

**Detection signature:**
- Awareness or Top-Funnel campaign with meaningful spend (>$500/mo) and 0 tracked conversions
- No secondary/soft conversion action configured for engagement or view-through
- Campaign scored RED purely on tracked conversions

**Confidence:** MEDIUM — could be wasted spend OR could be mis-scoring.

**Business implication:** Either wasted spend OR the audit is under-crediting halo effects. Either way, the scoring isn't meaningful until resolved.

**Recommended action:**
1. Either (a) pause the top-funnel campaign if it's not strategically needed, or (b) add a soft conversion action (View Content, Engagement, Landing Page View) and re-measure view-through conversions specifically.
2. Flag in report that the campaign was scored conservatively and real lift may exist.

---

## Pattern 10: Mobile CVR Gap

**What it is:** Mobile CVR is <50% of desktop CVR on a site where mobile is >50% of sessions. Normal pattern for high-ticket furniture/considered-purchase, but still a high-ceiling opportunity.

**Detection signature:**
- Mobile session share > 50%
- Mobile CVR / Desktop CVR < 0.5

**Confidence:** HIGH (it's a direct measurement).

**Business implication:** The mobile experience is underperforming. Closing even half the gap typically unlocks 15-30% revenue upside.

**Recommended action:**
1. Mobile CRO sprint: page speed, form field count, checkout friction, image optimization.
2. Aim to close half the gap as a 90-day goal.
3. Track mobile CVR weekly.

---

## Using This Library

- **Run every pattern through the detection signature.** Don't guess — check the actual evidence.
- **Only report patterns you have evidence for.** Low-signal patterns ("might be happening") dilute the report.
- **Rank patterns by business impact, not detection confidence.** A HIGH-confidence retargeting fatigue pattern is less urgent than a MEDIUM-confidence owned-channel collapse.
- **Every pattern report includes:** the specific evidence citation (source file + line), confidence level, business implication in plain English, and a recommended action with a timeline.
