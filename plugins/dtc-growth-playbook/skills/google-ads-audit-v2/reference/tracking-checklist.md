# Conversion Tracking Audit Checklist

Reference for the google-ads-audit-v2 audit skill. Systematic checklist for Google Ads conversion tracking health assessment. Draws heavily from `protocols/playbook/measurement.md` (Tracking Validation section).

**Principle:** Every diagnosis downstream is wrong if the input data is wrong. This checklist runs BEFORE performance analysis.

---

## 1. Conversion Actions Inventory

**Where to find it:** Goals (left nav) → Conversions → Summary

**Record every conversion action in a table:**

| Name | Source | Category | Count Type | Window | In Goals? | Status | All Conv | All Conv Value |
|---|---|---|---|---|---|---|---|---|
| | Website / App / Import / Call | Purchase / Lead / etc. | One / Every | X days click, Y days view | Yes / No | Active / Inactive | | |

**What to look for:**
- How many conversion actions exist total?
- How many are marked "Include in Conversions" (primary goals)?
- Are there conversion actions with zero conversions in the date range?
- Are there conversion actions with zero conversions in the past 90 days? (dead actions)

---

## 2. Duplicate Purchase Event Detection

**This is the most common and most impactful tracking problem.** The Acme Co audit found exactly this: Google Shopping App Purchase AND GA4 purchase both active as primary conversion actions, inflating all reported conversion and ROAS numbers.

**Common duplicate patterns:**

| Pattern | How to Detect | Severity |
|---|---|---|
| Google Shopping App + GA4 purchase | Two purchase-type actions both in primary goals, one sourced from Shopping App and one from GA4 | CRITICAL |
| GA4 purchase + custom Google Tag purchase | Two purchase events from different tag implementations | CRITICAL |
| GA4 purchase + Shopify native tracking | GA4 event + Shopify's built-in Google integration | HIGH |
| Multiple GA4 purchase events | Same event name from different GA4 properties or duplicate implementations | HIGH |
| Purchase + Transaction (legacy naming) | Old "Transaction" action still active alongside newer "Purchase" | MEDIUM |

**How to confirm duplicates:**
1. Compare the "All conversions" count across suspected duplicate actions
2. If two purchase-type actions both show high conversion counts for the same date range, they're likely counting the same purchases twice
3. Check: does the sum of all purchase-type conversion values roughly equal or significantly exceed what you'd expect from Shopify revenue? If yes → duplicates
4. Look at conversion action sources: if one says "Website" and another says "Google Analytics (GA4)" and both track purchases → likely duplicates

**Impact calculation:**
- If two purchase actions are both in primary goals, reported ROAS is inflated by roughly 2x
- Smart Bidding is optimizing toward inflated conversions — bids are set based on bad data
- The entire account's performance story is wrong until this is fixed

**Evidence JSON mapping:**
```json
{
  "title": "Duplicate purchase tracking events",
  "severity": "critical",
  "label": "OBSERVED",
  "evidence": "[Action A] (X all conv, $Y value) AND [Action B] (X all conv, $Y value) both active as primary goals",
  "source": "Google Ads > Goals > Conversions > Summary",
  "recommendation": "Consolidate to single primary purchase event. Keep secondary action as observation-only (remove from primary goals)."
}
```

---

## 3. Dead Conversion Actions (UA-Era Leftovers)

**What to look for:**
- Conversion actions sourced from "Universal Analytics" or "analytics" (not GA4)
- Actions with "Tag inactive" or "No recent conversions" status
- Actions created before 2023 that haven't been updated
- Actions with naming conventions from old implementations ("website_sale", "Transaction", "Goal Completion")

**Why they matter:**
- If dead actions are still in primary goals, Smart Bidding is training on stale/zero signals
- They clutter the conversion actions list, making it harder to understand what's actually being tracked
- Some may have been the ONLY purchase tracking before GA4 migration — if they stopped working and no one noticed, there may have been a period of under-tracking

**What to flag:**
- Dead UA actions still in primary goals → HIGH severity
- Dead actions not in primary goals but still present → LOW (informational cleanup)
- Actions with "Tag inactive" status → MEDIUM (something stopped working)

---

## 4. Enhanced Conversions Status

**Where to find it:** Settings (gear icon) → Conversion tracking → Enhanced conversions

**What Enhanced Conversions does:** Sends hashed first-party customer data (email, phone, address) with conversion tags. Google matches this against signed-in Google users to recover conversions lost to cookie restrictions.

**Recovery impact:** 30-50% of otherwise-lost conversions recovered. Combined with conversion modeling, 70%+ recovery possible.

**What to check:**
- Is Enhanced Conversions enabled? (Yes/No)
- Which data is being sent? (Email, phone, name, address)
- Is it implemented via Google Tag, GTM, or API?
- Status: "Active" / "Needs attention" / "Not set up"

**What to flag:**
- Enhanced Conversions not enabled → HIGH severity finding
- Enabled but "Needs attention" → MEDIUM — something may be misconfigured
- Enabled and active → note as healthy in working notes

**Evidence JSON mapping:** Add to `tracking_health.flags[]` if not enabled or if status is problematic.

---

## 5. Consent Mode v2

**Where to find it:** Check via Google Tag settings or Tag Assistant. May not be directly visible in Google Ads UI.

**Relevance:** Mandatory for EEA/UK traffic since March 2024, with active enforcement since July 2025. US-only businesses may not have it configured — note but don't flag as critical.

**What to check:**
- Are four consent signals configured? `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`
- Is conversion modeling active? (Requires 700+ ad clicks over 7 days per country)
- Is the consent banner/CMP properly triggering consent state changes?

**What to flag:**
- EEA/UK traffic with no Consent Mode → HIGH (compliance risk + data loss)
- US-only with no Consent Mode → LOW (informational — recommended but not required)
- Consent Mode configured but modeling not active → MEDIUM (insufficient click volume)

---

## 6. Proxy Event Optimization (High-Ticket Accounts — AOV $200+)

**Why this matters for high-ticket:** Products with AOV $200+ have fewer purchases per month. Smart Bidding needs 50+ conversions/month to optimize well. If the account only gets 15-20 purchases/month, the algorithm can't learn fast enough.

**The proxy event solution:**
- Use a higher-volume event as the primary conversion action for bidding: `add_to_cart` or `begin_checkout`
- Keep `purchase` as a secondary/observation conversion action
- Smart Bidding optimizes toward the proxy event (more data to learn from)
- You still see purchase data — just don't optimize bids on it directly

**What to check:**
- What's the primary conversion action? Is it purchase?
- How many primary conversions per month? If <30 → proxy event is likely needed
- Are add_to_cart or begin_checkout being tracked? (Check conversion actions list)
- If proxy event is already in use → is it the right one? (begin_checkout is closer to purchase intent than add_to_cart)

**What to flag (AOV $200+ only):**
- Purchase as primary with <30/month → recommend proxy event optimization
- No mid-funnel events tracked at all → recommend implementing add_to_cart and begin_checkout tracking
- Proxy event in use but purchase data not being tracked as secondary → DATA gap

**Evidence JSON mapping:** Add to findings with INFERENCE label (the recommendation is based on conversion volume analysis, not a direct observation of poor performance).

---

## 7. Shopify Checkout Extensibility Impact

**Context:** Shopify migrated all stores to Checkout Extensibility by August 28, 2025. This migration:
- Discontinued checkout.liquid customizations
- Killed script tags on Thank You / Order Status pages
- Created a sandbox environment that blocks most third-party tracking scripts

**What to check:**
- Was the client's Shopify store tracking affected by the Aug 2025 migration?
- Did conversions drop suddenly around Aug-Sep 2025? (Check Change History or conversion action trend)
- Is the client using Shopify Custom Pixels or Customer Events API for tracking? (This may require checking the Shopify admin — flag as open question if you can't confirm from Google Ads alone)

**What to flag:**
- Sudden conversion drop around Aug-Sep 2025 with stable traffic → LIKELY Checkout Extensibility migration impact
- If tracking appears to be working now → migration was handled correctly, no flag needed
- If you can't determine whether tracking was affected → note in open_questions

---

## 8. Attribution Window Assessment

**Where to find it:** Click on any conversion action → Settings → Attribution settings

**What to record per purchase conversion action:**
- Click-through attribution window: 1, 7, 30, 60, or 90 days
- View-through attribution window: None, 1 day, 3 days, 7 days, 14 days, 30 days
- Attribution model: Data-driven, Last click, First click, Linear, Time decay, Position-based

**Assessment by AOV tier:**

| AOV Tier | Recommended Click Window | Recommended View Window | Notes |
|---|---|---|---|
| Under $50 | 7-30 days | 1 day | Short consideration cycle |
| $50-200 | 30 days | 1-3 days | Standard ecommerce |
| $200-500 | 30-60 days | 3-7 days | Extended consideration |
| $500+ | 60-90 days | 7-14 days | Long decision cycle — research, comparison shopping |

**What to flag:**
- High-ticket ($200+) with 7-day click window → losing attribution on late converters (HIGH)
- Low-ticket (<$50) with 90-day window → over-attributing (MEDIUM)
- "Last click" attribution model → acceptable but Data-driven is preferred if 400+ monthly conversions
- View-through attribution on for all campaigns → may inflate reported conversions for Display/YouTube

---

## 9. Event Match Quality (EMQ) — Cross-Platform Reference

**Note:** EMQ is primarily a Meta concept, but the principle applies to Google too. Google's equivalent is the "Tag diagnostics" view on each conversion action.

**Where to find it:** Click on a conversion action → Tag diagnostics

**What to check:**
- Tag status: Active, Unverified, Inactive, Tag not found
- Last conversion: when was the most recent conversion recorded?
- If tag is "Inactive" → the conversion tag stopped firing. Investigate.
- If tag is "Unverified" → tag was recently created and hasn't recorded conversions yet

**Google-specific data quality signals:**
- Enhanced Conversions match rate (if visible) — higher is better
- Conversion modeling status: "Active" means Google is filling gaps with modeled data
- "Insufficient data for modeling" → click volume too low (need 700+ clicks/7 days)

---

## 10. Conversion Value Accuracy

**What to check:**
- Are conversion values being passed dynamically (actual order values) or using a fixed default value?
- If fixed default: is it reasonable? (e.g., default $50 for a store with $200 AOV = wrong)
- If dynamic: does the average conversion value in Google Ads roughly match the expected AOV?

**How to check:**
- Look at Conv. value / Conversions = average conversion value
- Compare to known AOV from manifest or Shopify data
- If average conv value seems wrong (way too high or too low), conversion values may be misconfigured

**What to flag:**
- Fixed default value that doesn't match actual AOV → MEDIUM (ROAS calculations are wrong)
- Dynamic values but average is 2x+ expected AOV → possible duplicate value tracking or currency mismatch
- No conversion value being passed at all ($0 value) → HIGH (can't calculate ROAS, can't use tROAS bidding)

---

## Summary: Severity Classification

| Issue | Severity | Rationale |
|---|---|---|
| Duplicate purchase events in primary goals | CRITICAL | All reported ROAS/CPA/conversion numbers are wrong |
| No conversion value tracking | HIGH | Can't calculate ROAS, can't use value-based bidding |
| Enhanced Conversions disabled | HIGH | Missing 30-50% of recoverable conversions |
| Dead UA actions in primary goals | HIGH | Smart Bidding training on stale signals |
| Attribution window mismatch for AOV | HIGH | Systematic over/under-counting |
| Wrong default conversion value | MEDIUM | ROAS calculations misleading |
| Consent Mode missing (EEA/UK traffic) | HIGH | Compliance risk + 30%+ data loss |
| Consent Mode missing (US-only) | LOW | Recommended but not required |
| Tag status "Inactive" | MEDIUM | Tracking stopped — investigate |
| Shopify Checkout Extensibility impact | MEDIUM | If evident; otherwise open_question |
| Missing proxy event (high-ticket, <30 conv/mo) | MEDIUM | Optimization opportunity, not tracking error |

---

## Evidence JSON Mapping

All tracking findings go into `tracking_health`:

```json
"tracking_health": {
  "flags": [
    {
      "title": "...",
      "severity": "critical|high|medium|low",
      "label": "OBSERVED|INFERENCE",
      "evidence": "...",
      "source": "Google Ads > Goals > Conversions > ...",
      "recommendation": "..."
    }
  ],
  "conversion_actions": [
    {
      "name": "...",
      "source": "Website|GA4|Import|...",
      "count_type": "One|Every",
      "window_days": 30,
      "in_goals": true,
      "all_conversions": 0,
      "all_conv_value": 0
    }
  ]
}
```

Critical and high tracking issues should ALSO appear in the top-level `findings[]` array — they're important enough to surface at the diagnostic level, not just buried in tracking_health.
