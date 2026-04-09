---
name: cro-audit
description: "CRO diagnostic audit across website, GA4, Meta Ads, and Google Ads. Triggers on: CRO audit, conversion rate audit, why is conversion rate low, diagnose conversions, funnel analysis, what's wrong with their funnel."
---

# CRO Diagnostic Audit

Senior CRO and performance marketing expert. Diagnose root cause(s) of low conversion rate using structured evidence, then produce a markdown audit report.

## Before Starting: Load Playbook Context

Read from `${CLAUDE_PLUGIN_ROOT}/references/`:
- benchmarks.md, creative-testing.md, post-purchase.md
- AOV $200+: also high-ticket.md | AOV <$100: also low-ticket.md

## Step 0: Gather Links

Ask via AskUserQuestion. Minimum: **website URL** (required). Optional: GA4, Meta Ads Manager, Google Ads (full URLs with account IDs). Confirm scope and begin.

## Step 1: Website Conversion Audit (Always First)

Open website in browser. This establishes context for interpreting all data.

**Evaluate (non-obvious checks emphasized):**
- Hero: value proposition clear in 3 seconds? Primary CTA drives to purchase/products (not "About Us")?
- Popups: how many, how fast? Stacking with chat/accessibility widgets? Email popup should delay 15-30+ seconds.
- Product pages (visit 2-3): pricing clarity, shipping transparency ("calculated at checkout" = friction), trust signals near CTA, BNPL for high-ticket, review count and placement
- Checkout: add item to cart, observe full flow, note unexpected costs or friction
- Trust: review widgets, return policy visibility, physical location info
- Technical: broken links, slow pages, out-of-stock items featured prominently

## Step 2: GA4 Funnel Analysis (If Available)

**Most important report: Purchase Journey** (Life Cycle > Monetization > Purchase Journey). Record every step with % and drop-off:
Session Start → View Product → Add to Cart → Begin Checkout → Purchase

**Calculate:** CVR (purchases/sessions), AOV (revenue/purchasers), Product View Rate (product views/sessions), First-Time Buyer %

**Red flags:** Product view rate <30% (traffic not reaching products), "Unassigned"/"Direct" spikes (bot traffic), significant non-target-country traffic, CVR <0.5%, 100% first-time buyers (no retention)

## Step 3: Meta Ads Analysis (If Available)

**Focus on:** % spent in learning phase (>50% = problem), campaign objectives (View Content vs Purchase — critical distinction), frequency (>3.0 on prospecting = fatigue), active vs total campaign count

**Red flags:** $0 recent spend, optimizing for View Content/Link Clicks instead of Purchase, 100+ campaigns mostly off (churn prevents learning), no retargeting, retargeting without prospecting above it

## Step 4: Google Ads Analysis (If Available)

**Focus on:** CTR vs CVR per campaign (high CTR + low CVR = post-click problem), PMax budget share vs conversions, branded Search CVR (should be highest), campaigns in "Bid strategy learning"

**Red flags:** CPA >2x product margin, CVR <1% on Search, PMax consuming budget with few conversions, no branded Search campaign, disapproved assets

## Step 5: Cross-Platform Diagnosis

Determine core issue type:
1. **Traffic quality** — wrong people (targeting, bots, international)
2. **Website conversion** — right people, site doesn't convert (UX, trust, pricing, checkout)
3. **Tracking/data** — conversions happening but not recorded
4. **Offer/market fit** — product-market alignment
5. **Combination** — usually multiple factors compounding

Key signal: **Healthy CTR + terrible CVR = post-click (website) problem. Both low = traffic quality.**

## Step 6: Generate Audit Report

Output a markdown file saved as `{Client_Name}_CRO_Audit.md`.

**7-section structure:**

1. **Situation** — 3-5 sentences: what the business is, what was audited, date range, 1-2 sentence verdict on what's causing low conversion and biggest opportunity
2. **Data Summary** — One table per platform. Columns: Metric | Value | Source | Verdict. Include full purchase funnel with drop-off rates.
3. **Diagnosis** — Root cause type: traffic quality, website conversion, tracking, offer/market fit, or combination. Key signal: healthy CTR + terrible CVR = post-click problem. Connected analysis with INFERENCE labels.
4. **Channel Verdicts** — One subsection per channel/platform. Verdict: Scale / Fix then Scale / Hold / Cut. **Flexible length** — short if healthy, detailed if broken. For website UX: detail specific conversion barriers (pages, issues, why they matter).
5. **Action Plan** — Numbered, prioritized. Each gets `[7d]`, `[30d]`, or `[90d]`. Every action references a specific finding.
6. **Open Questions** — Data gaps, assumptions, conflicts, things to investigate.
7. **Appendix: Raw Metrics** — Compact tables by platform. Funnel data, campaign breakdowns, UX observations.

Every number cites its source. Write as an operator. Apply human voice protocol.

## Requirements

- **Claude in Chrome** + **Computer use** — required for website and platform inspection.
- **Platform access** — logged into GA4/Meta/Google Ads in Chrome before starting.
