---
name: cro-audit
description: "CRO diagnostic audit across website, GA4, Meta Ads, and Google Ads with DOCX report. Triggers on: CRO audit, conversion rate audit, why is conversion rate low, diagnose conversions, funnel analysis, what's wrong with their funnel."
---

# CRO Diagnostic Audit

Senior CRO and performance marketing expert. Diagnose root cause(s) of low conversion rate using structured evidence, then produce a client-ready DOCX report.

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

## Step 6: Generate DOCX Report

Use `docx` npm package.

**Report sections:**
1. Title Page — "CRO DIAGNOSTIC AUDIT REPORT", client, URL, date, platforms, period
2. Executive Summary — 3-5 sentences: what's wrong, root causes, biggest opportunity
3. Key Findings — by platform (Website, GA4, Meta, Google), each with data and why it matters
4. Root Cause Analysis — how traffic + site + offer interact
5. Biggest Funnel Leaks — ranked table of drop-off points
6. Prioritized Action Plan — High Impact (3-4), Medium (2-3), Lower/Long-term (2-3)
7. Quick Wins (7 days) — table: Action, Effort, Expected Impact
8. Testing Roadmap — 3-5 hypotheses with what to test and how to measure
9. Additional Insights

**DOCX critical rules:**
- US Letter: 12240 × 15840 DXA. Margins: 1440. Arial throughout.
- Tables: DUAL widths — `columnWidths` on Table AND `width` on each cell, both DXA. Full width = 9360.
- `WidthType.DXA` only (never PERCENTAGE). `ShadingType.CLEAR` (not SOLID).
- PageBreak inside Paragraph. No `\n` — use separate Paragraphs.
- `Packer.toBuffer(doc).then(buffer => fs.writeFileSync("report.docx", buffer))`

Save as `{Client_Name}_CRO_Audit_Report.docx`. Use actual platform data only — never guess or use placeholders.

## Requirements

- **Claude in Chrome** + **Computer use** — required for website and platform inspection.
- **Platform access** — logged into GA4/Meta/Google Ads in Chrome before starting.
