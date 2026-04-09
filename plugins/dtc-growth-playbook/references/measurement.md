# Measurement & Attribution

Last updated: 2026-04-09. Sources: Measured Inc (triangulation framework), Triple Whale (GeoLift, unified measurement), Northbeam (Clicks + Views model, Oct 2025), Common Thread Collective (incrementality studies), Stella (225 geo-tests, 2024-2025), Foxwell Digital (2026 State of Agencies), Fospha, Sellforte, Pilothouse, Jon Loomer Digital, DataSlayer, SearchEngineLand.

## Core Methodology (Evergreen)

**Platform-reported ROAS is unreliable.** Every platform over-attributes. When Meta says 4x ROAS and Google says 3x ROAS, but Shopify revenue doesn't support both being true, at least one is over-counting. This has been true since multi-channel digital marketing existed and won't change.

**Triangulation, not a single source of truth.** No single measurement method works alone. The framework is three methods running simultaneously, validating each other:

- **Attribution (MTA):** Tracks user journeys, assigns credit. Used for daily/weekly campaign optimization. Fast but biased — every platform over-credits itself.
- **Incrementality:** Controlled experiments (holdouts, geo-lifts) that prove ads *caused* sales. Used for budget allocation decisions. Slow (quarterly) but causal.
- **Media Mix Modeling (MMM):** Aggregate historical data modeling cross-channel effects. Used for strategic/annual planning. Requires 2+ years of data.

These aren't sequential layers (you don't "graduate" from one to the next). Run whatever your budget supports in parallel.

**Shopify is the financial source of truth.** For DTC brands on Shopify, order data (count, revenue, refunds, discounts) is 100% accurate. Use Shopify revenue as the denominator for all blended metrics. Don't try to reconcile platform attribution — use MER instead.

**Marketing Efficiency Ratio (MER) is the unifying metric.** MER = Total Revenue ÷ Total Marketing Spend (all channels combined). This bypasses attribution entirely and uses only numbers you fully control.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### Meta Attribution Changes (January-March 2026)

**January 12, 2026:** Meta permanently removed 7-day and 28-day view-through attribution windows from Ads Insights API. Impact: 15-40% fewer reported conversions overnight. No actual campaign performance change — measurement shift only.

**March 2026:** Click-through attribution redefined. Only link clicks count as click-through (not likes, shares, comments, profile taps). New "engage-through" category created (1-day window only) for non-click interactions. Video view threshold reduced from 10 seconds to 5 seconds for engage-through.

**Impact by product type:**
- Impulse/low-consideration products: Minimal impact (most conversions happen within 1-day click window)
- High-consideration products ($200+, 30-90 day cycles): 30-40% fewer attributable conversions (these relied on 7-day+ windows)
- Reported ROAS may jump from 5.0 to 8.0 simply due to redefinition — not actual improvement

**How to adjust:** Shift reporting to blended metrics (MER, blended ROAS). Use cohort-over-cohort trends, not YoY comparisons (attribution model changed mid-year). Communicate change context to stakeholders before they see numbers shift.

### Blended Metrics

**MER (Marketing Efficiency Ratio):**
- Formula: Total Shopify Revenue ÷ Total Marketing Spend (all channels)
- Healthy: 3.0-5.0x (varies by margin and industry)
- Strong: 5.0x+
- Struggling: Below 3.0x
- Update daily. This is your North Star — not platform ROAS.

**Blended ROAS:**
- Formula: Shopify Revenue ÷ Total Paid Ad Spend (Meta + Google + Amazon + TikTok)
- Use for paid channel efficiency. Compare to Minimum ROAS from profitability math (see benchmarks.md).

**Blended CPA:**
- Formula: Total Ad Spend ÷ Total Orders
- Compare to Break-even CPA from benchmarks.md.

**nCPA (New Customer CPA):**
- Formula: Total Acquisition Spend ÷ New Customer Orders
- Requires Shopify customer tagging (new vs. returning). More useful than blended CPA for growth-stage brands.

### The Source-of-Truth Stack

| Data Type | Source of Truth | Use For |
|---|---|---|
| Revenue, orders, refunds | Shopify | Financial reporting, MER calculation, ROAS validation |
| User behavior (journey, device, geo) | GA4 | Audience insights, funnel analysis, traffic source comparison |
| Campaign-level optimization | Platform dashboards (Meta, Google) | Bid adjustments, creative decisions, budget allocation within a platform |
| Cross-platform attribution | Third-party tool OR MER | Channel-level budget allocation decisions |
| Causal impact | Incrementality tests | Proving a channel actually drives sales vs. taking credit |

**GA4 limitations:** Captures 70-80% of actual revenue (ad blockers, redirect chains, cross-device loss). Use for behavioral analysis, not revenue reporting. GA4's Data-Driven Attribution requires 400+ monthly conversions — below that it falls back to last-click.

### Cross-Platform Reconciliation

**Don't reconcile — use MER instead.** In practice: Shopify shows 42 purchases, but Google claims 71 conversions, Meta claims 58, Klaviyo claims 39. Total claimed: 168 conversions for 42 real sales (4x over-counting). Trying to reconcile this is a waste of time.

**Daily workflow:**
1. Pull Shopify revenue (source of truth)
2. Pull platform spend from each channel
3. Calculate MER = Shopify revenue ÷ total spend
4. Calculate blended ROAS = Shopify revenue ÷ paid ad spend only
5. Use platform-reported ROAS for within-platform optimization only (campaign/ad set level)
6. Never present platform ROAS as actual performance to stakeholders

### Third-Party Attribution Tools

| Tool | Best For | Rough Cost | Approach |
|---|---|---|---|
| **Triple Whale** | Shopify DTC, <$1M spend/yr | $129-$4,489/mo | Profitability dashboard, mirrors platform attribution |
| **Northbeam** | Growing brands, $50K-$500K+/mo spend | $999-$2,500+/mo | Multi-touch + MMM, Clicks + Views model (Oct 2025) |
| **Rockerbox** | Enterprise/omnichannel, $500K+/mo | Custom | Offline + online, TV/direct mail |
| **Measured** | Enterprise incrementality, $10M+ annual | ~$50K+/yr | Board-level validation, controlled experiments |
| **Lifetimely** | LTV-focused, any size | Free-$299/mo | Predictive LTV, behavioral cohorts |

**By brand size:**
- Under $250K/mo spend: Triple Whale or Lifetimely
- $50K-$500K/mo: Northbeam (sweet spot for mid-market DTC)
- $500K+/mo with offline: Rockerbox
- Board-level validation needed: Measured

### Incrementality Testing

**What it is:** Turn off ads in specific geos, measure sales vs. control geos. Proves whether ads actually caused sales or just took credit.

**Geo-holdout best practices:**
- **State-level tests** (used by ~65% of practitioners): Higher statistical power, lower noise, lower cost
- **Duration:** 21-28 days for ecommerce (shorter tests miss delayed purchases)
- **Minimum:** 80% statistical power to detect your minimum detectable lift
- **Budget:** $50K-$150K spend for state-level tests (varies by conversion rate)

**Who's actually running these:**
- ~36% of marketers plan to increase incrementality spending (2026 survey)
- Common enough among brands with $5M+ annual media spend
- Still theoretical for most sub-$1M spend brands
- Common Thread Collective found 79% of email-attributed revenue is truly incremental (21% would have happened anyway) — validating incrementality as a corrective to platform over-attribution

**Synthetic control modeling** is replacing matched markets as the standard for geo-holdout control groups. Creates a composite holdout from multiple regions to better mirror the treated market.

### Media Mix Modeling (MMM)

**Accessibility in 2026:** SaaS solutions reduced time-to-value from 3-6 months to 1-2 weeks. But still requires data science involvement for most tools.

**Open-source (free, requires data science team):**
- Meta Robyn: AI/ML-powered, Python rewrite completed. Good for DTC with daily data.
- Google Meridian: Bayesian framework, released Jan 2025. Less adoption data yet.

**SaaS (accessible to $5M+ spend brands):**
- Sellforte: Purpose-built for ecommerce. 15-30 min setup, insights in 1-2 weeks.
- Conjura: Automated modeling, no full-time data scientist required.

**Minimum data requirements:** 2+ years historical daily/weekly spend + revenue data. 4-8 channels minimum. Channels must have meaningful spend variance (can't model flat-spend channels).

### Server-Side Tracking (Table Stakes)

Browser-only tracking (Meta Pixel alone) misses 30-40% of conversions due to iOS privacy, ad blockers, and browser restrictions. Server-side tracking via Conversions API (CAPI) is non-negotiable for any brand claiming to optimize effectively.

**CAPI implementation recovers 20-40% of previously lost conversions.** Post-CAPI attribution accuracy: 85-95% (vs. 60-70% browser-only).

**Tools:** Shopify native CAPI integration (set Data Sharing to "Always On"), Elevar (40+ destination integrations), Trackbee, Conversios.

**Critical:** Event deduplication (Pixel + CAPI) prevents double-counting. Verify this is configured correctly after any tracking change.

**January 2026 Shopify change:** Auto-upgrade broke some CAPI configurations. If Meta ROAS dropped suddenly in Jan 2026, check Data Sharing setting — it may have reverted to "Optimized" from "Always On."

---

## Diagnostic Signals

- **Platform ROAS looks great but Shopify revenue doesn't match** → Attribution overlap. Calculate MER to see actual efficiency. At least one platform is over-crediting.
- **MER declining while platform ROAS is stable** → Rising costs or attribution inflation masking real performance. Check blended CPA vs. break-even.
- **Huge gap between Meta-reported and Shopify-reported revenue** → CAPI may be misconfigured. Check Data Sharing settings. Check event deduplication. Gap >30% = tracking problem.
- **High-ticket product ROAS dropped 30-40% in Jan 2026** → Likely Meta attribution window change (removed 7-day+ view). Actual performance may be unchanged. Switch to blended metrics.
- **Can't tell if Meta or Google is actually driving sales** → Run a geo-holdout test. Turn off one platform in 2-3 states for 3 weeks, measure vs. control.
- **Email ROAS looks incredibly high** → Over-attributed. CTC research shows ~21% of email-attributed revenue would have happened anyway. Don't use email ROAS to justify reducing paid spend.

## Sources

- Measured Triangulation Framework: https://www.measured.com/faq/a-simple-guide-to-understanding-triangulated-measurement/
- Triple Whale GeoLift Guide: https://www.triplewhale.com/blog/geolift-geo-based-incrementality-testing
- Triple Whale Unified Measurement: https://www.triplewhale.com/blog/mmm-mta-incrementality
- Stella 2025 DTC Incrementality Benchmarks: https://www.stellaheystella.com/blog/2025-dtc-digital-advertising-incrementality-benchmarks
- Common Thread Collective Incrementality: https://commonthreadco.com/pages/incrementality
- Fospha MMM/MTA/Incrementality: https://www.fospha.com/measurement-101/mmm-mta-incrementality-building-a-suite-of-truth
- Northbeam Clicks + Views Model: https://www.businesswire.com/news/home/20251007146281/en/
- DataSlayer Meta Attribution Changes: https://www.dataslayer.ai/blog/meta-ads-attribution-window-removed-january-2026
- SearchEngineLand Meta Click/Engage-Through: https://searchengineland.com/meta-introduces-click-and-engage-through-attribution-updates-470629
- Jon Loomer Meta Attribution 2026: https://www.jonloomer.com/meta-ads-attribution-2026/
- Sellforte MMM for Ecommerce: https://sellforte.com/blog/mmm-for-ecommerce-brands/
- Meta Robyn: https://github.com/facebookexperimental/Robyn
