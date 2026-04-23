# Meta Ads Deep-Dive — Ads-Audit

Loaded when Meta Ads scores RED or YELLOW at triage.

**Also load:** `reference/playbook/benchmarks.md` for Floor/Healthy/Strong thresholds.
**Conditional:** If workspace playbook available, also load `andromeda.md` (algorithm behavior, creative diversity, fatigue). If creative is flagged, also `creative-testing.md` and `scaling-frequency.md`.

## Report Inclusion Rules

Not every metric this deep-dive produces belongs in the report body. Apply these rules when synthesizing:

**BODY (scorecard + diagnosis, 1 chart):**
- Top-line efficiency from Pull 1: total spend, ROAS, purchases, CPA — with YoY deltas.
- Top 3 and bottom 3 campaigns / ad sets by spend (Pull 1).
- One chart: typically "CPA trend" or "ROAS by campaign".
- Frequency / creative-fatigue signal from Pull 3/4 — one line if it's a flag.

**APPENDIX (reference-only, not in body):**
- Full Pull 1 campaign breakdown.
- Pull 2 funnel metrics (CTR, LP views, add-to-cart, purchase).
- Pull 3 creative-level performance.
- Pull 4 creative quality signals (quality/engagement/conversion rankings).
- Pull 5 demographic breakdown.
- Placement / device splits if pulled.

**CUT entirely:**
- Raw impressions with no downstream metric.
- CTR without CVR context.
- Ad sets contributing <1% of spend (noise).
- Any metric that can't be tied to a decision.

The narrative for this platform in the report body must be ≤ 200 words. Detailed tables go in the appendix.

---

## Context from Triage

- ROAS below target → Focus on campaign structure + audience quality
- High frequency → Focus on audience saturation + creative fatigue
- High/rising CPM → Focus on audience targeting + creative quality signals
- CPA above break-even → Focus on funnel conversion rates + creative performance
- Attribution ratio high → Focus on CAPI/pixel health + deduplication

## Deep-Dive Pulls (5 pulls for RED, 2-3 for YELLOW)

### Pull 1 — Campaign Performance (ALWAYS run)

```
fb_ads_request:
  metrics: ["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "CPM", "Frequency"]
  breakdowns: ["Campaign Name", "Campaign Objective", "Campaign Delivery Status"]
```

6 metrics + 3 breakdowns. Shows which campaigns drive results and funnel stage distribution.

**Analysis checklist:**
- Funnel stage mapping: infer TOF/MOF/BOF from Campaign Objective + naming
- Spend distribution: >50% in retargeting = audience exhaustion risk
- Any campaigns with spend but 0 purchases
- Campaign count: >5 active at <$50k/mo spend = fragmentation risk
- Delivery status issues (Learning Limited, Delivery Issues)

### Pull 2 — Funnel Metrics (run if CPA or ROAS flagged)

```
fb_ads_request:
  metrics: ["Link Clicks", "CTR (Link Click-Through Rate)", "CPC (Link)", "Total Content Views", "Total Adds To Cart", "Total Checkouts Initiated"]
  breakdowns: []
```

6 metrics, totals only. Pinpoints WHERE in the funnel things break down.

**Calculate:**
- Thumbstop/Hook rate: CTR (Link Click-Through Rate) — benchmark >1.5%
- View → ATC rate: Add-to-carts ÷ Content Views
- ATC → Checkout: Checkouts ÷ Add-to-carts
- Checkout → Purchase: Purchases (from triage) ÷ Checkouts
- Identify the biggest funnel drop-off

### Pull 3 — Creative Performance (run if frequency or CPM flagged)

```
fb_ads_request:
  metrics: ["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "Link Clicks", "CTR (Link Click-Through Rate)"]
  breakdowns: ["Campaign Name", "Ad Name", "Ad Creative Name", "Ad Effective Status"]
```

6 metrics + 4 breakdowns. Identifies top/bottom performers and creative fatigue.

**Analysis:**
- Top 5 and bottom 5 ads by ROAS
- Ads with >$500 spend and 0 purchases
- Creative diversity: how many unique creatives active?
- Fatigue signals: high-spend ads with declining CTR
- Active vs paused ratio

### Pull 4 — Creative Quality Signals (run if frequency high or RED)

```
fb_ads_request:
  metrics: ["Impressions", "Quality Ranking", "Engagement Rate Ranking", "Conversion Rate Ranking", "Frequency"]
  breakdowns: ["Campaign Name", "Ad Name"]
```

5 metrics + 2 breakdowns. Meta's own quality scores per ad.

**Analysis:**
- Ads with "Below Average" on any ranking → creative problem
- High frequency + declining quality rankings = fatigue
- Correlation between quality rankings and ROAS

### Pull 5 — Demographics (conditional — run if targeting is a concern)

```
fb_ads_request:
  metrics: ["Spend", "Total Purchases", "Return On Ad Spend (ROAS)", "Purchase Conversion Value"]
  breakdowns: ["Age", "Gender"]
```

4 metrics + 2 breakdowns. Shows who's converting.

**Analysis:**
- Age/gender segments with high spend but low ROAS
- Concentration: is 80%+ of conversions from one demo segment?
- Opportunity: underserved segments with good ROAS but low spend

## YELLOW Mode (Targeted Dive)

- Frequency concern → Pulls 1 + 4
- ROAS/CPA concern → Pulls 1 + 2
- CPM concern → Pulls 1 + 3
- Multiple concerns → Pulls 1 + 2 + 3

## Evidence Output

`{Client}_meta-ads_evidence.json`

**Key fields:**
- `meta.triage_score`, `meta.triage_signals`, `meta.audit_depth`
- `account_overview` with triage + deep-dive metrics
- `findings` grouped by: structure, creative, audience, tracking
- `diagnosis.primary_constraint` and root_cause
- `cross_channel_signals`: Meta → Google halo assessment, attribution overlap notes

## Diagnostic Patterns

| Pattern | Interpretation |
|---------|-----------------|
| High frequency + stable ROAS | Audience hasn't saturated yet (rare but possible) |
| High frequency + declining ROAS | Classic saturation — need creative refresh |
| Good CTR + bad CVR | Landing page or offer problem, not Meta's fault |
| Bad CTR + good CVR | Targeting is narrow but effective — creative needs work |
| CPM rising across all campaigns | Competitive auction pressure or seasonal |
| CPM rising on specific campaigns | Audience overlap or quality issues |
| >5 active campaigns at <$50k/mo spend | Andromeda can't optimize — fragmentation problem |
