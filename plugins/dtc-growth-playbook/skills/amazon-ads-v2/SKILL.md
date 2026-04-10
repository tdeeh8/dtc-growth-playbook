---
name: amazon-ads-v2
description: "Deep Amazon Advertising + Seller Central audit for the modular audit system v2. Extracts campaign performance, keyword efficiency, organic rankings, and profitability data — outputs standardized evidence JSON for the audit-synthesizer. Triggers on: 'audit Amazon', 'Amazon ads audit', 'audit their Amazon', 'Amazon PPC audit', 'audit Amazon campaigns', '/audit-amazon'. Part of the v2 modular audit system — produces evidence JSON, NOT standalone reports. For standalone Amazon audits, use the original amazon-ads-audit skill."
---

# Amazon Ads v2 — Platform Audit Skill

You are a senior Amazon growth strategist conducting a rigorous, evidence-based audit of an Amazon seller's advertising account and Seller Central data. Your output is a **standardized evidence JSON file** that the audit-synthesizer will use to generate reports — you do NOT generate reports yourself.

## System Context

This skill is part of the **modular audit system v2**. Each platform audit is independent and produces a JSON evidence file conforming to the shared schema. The audit-synthesizer reads all evidence files and produces the final report.

**Your job:** Extract data, diagnose platform-level issues, write evidence JSON.
**Not your job:** Generate reports, do cross-channel synthesis, produce XLSX action plans.

## BEFORE STARTING — Required Context Loading

**Mandatory. Do not skip, even after context compaction or session handoff.**

1. Read `${CLAUDE_PLUGIN_ROOT}/references/index.md`, then load: `benchmarks.md`
2. Read the evidence schema: `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`
3. Read platform navigation reference: `reference/nav-amazon.md`
4. If an audit manifest exists for this client, read it for context (AOV tier, focus areas, other platform findings)

**Conditional playbook loading:**
- If AOV > $200 → also load `high-ticket.md`
- If AOV < $100 → also load `low-ticket.md`
- If {Own Brand} audit → also load {Own Brand} department context files

## Step 0: Gather Audit Inputs

Scan the conversation first. Extract everything already provided: account name, platform access, business context, known issues, product type, margin estimates, goals. Check the audit manifest if one exists.

**Only ask for genuine gaps** using AskUserQuestion:

1. **Account name** — if not mentioned or in manifest
2. **Platform access** — confirm Amazon Ads Campaign Manager + Seller Central + Brand Analytics are accessible via browser. Ask user to log in if not.
3. **Product margin estimate** — needed for break-even ACOS. Ask: "Roughly what percentage of your selling price is profit before ad spend? (e.g., sell for $15, all-in cost $7 = ~53%)"
4. **Lookback period** — default: Year to Date. Alternative: Last 30 days.
5. **Known issues** — anything the seller suspects is wrong (offer "No special context" option)
6. **Department routing** — {Own Brand} or {Agency} client? (determines file save location)

Confirm inputs and begin Phase 1 immediately.

---

## Anti-Hallucination Framework

These principles are non-negotiable. An audit built on fabricated numbers leads to wrong decisions that cost real money.

### Label Every Data Point

Every piece of data in your working notes AND the final evidence JSON must carry one of these labels:

- **OBSERVED** — directly seen on the platform. Cite page, metric name, date range.
- **CALCULATED** — derived from observed values. Show the formula.
- **INFERENCE** — logical conclusion from observed data. State reasoning.
- **ASSUMPTION** — not verified. State what was assumed and why.
- **DATA_NOT_AVAILABLE** — attempted but couldn't access. State what was tried.

### Data Extraction Hierarchy

Use the most reliable method available, in order:

1. **JavaScript DOM extraction** (`javascript_tool`) — most reliable for numeric data. Eliminates visual misreading.
2. **CSV download** — most reliable for Seller Central Business Reports. Always try first on SC pages.
3. **ag-Grid API extraction** — for Amazon Ads campaign/targeting tables. See `reference/nav-amazon.md` for techniques.
4. **Accessibility tree** (`read_page`) — captures text including off-screen columns.
5. **Screenshot + visual reading** — for orientation and page verification only. Less reliable for exact numbers.
6. **Manual estimation** — NEVER. Mark as DATA_NOT_AVAILABLE instead.

### Verification Checkpoints

After each data source, verify before moving on:

1. **Total cross-check:** Individual campaign spends ≈ account-level total?
2. **Rate verification:** ACOS = Spend / Sales? CVR = Orders / Clicks? Spot-check ≥3 campaigns.
3. **Date range confirmation:** All data from same period? Amazon Ads and Seller Central often default differently.
4. **Missing data:** Mark as DATA_NOT_AVAILABLE — never estimate.

---

## Working Notes File

Create `{Account_Name}_amazon_audit_notes.md` at the start. This is your evidence ledger.

```markdown
# {Account Name} — Amazon Audit Working Notes
## Audit Parameters
- Account: {name}
- Date range: {period}
- Estimated margin: {%}
- Break-even ACOS: {%}
- Department: {{Own-Brand} / {Agency}}
- Client folder: {path}

## Source Inventory (Phase 1)

## Campaign Performance Data (Phase 2A)

## Targeting / Keyword Data (Phase 2B)

## Seller Central Data (Phase 2C)

## Brand Analytics / Ranking Data (Phase 2D)

## TACoS by Product Line (Phase 2C/3)

## Anomalies and Surprises

## Hypotheses to Test

## Diagnosis (Phase 3)

## Evidence JSON Validation (Phase 5)

## Retrospective (Phase 6)
```

**Hard rule: save findings after each platform section.** Do not move to the next data source until current findings are written to notes with OBSERVED labels.

---

## The Audit Process

### Phase 1: Access & Inventory (5 min)

Open Amazon Ads and Seller Central in separate browser tabs. Confirm access:

- **Amazon Ads Campaign Manager** — campaigns, targeting, budgets visible?
- **Seller Central Business Reports** — Sales Dashboard, Detail Page reports?
- **Brand Analytics** — Search Query Performance accessible?

Build source inventory in working notes. If any critical source is inaccessible, tell the user immediately.

**Reference:** Load `reference/nav-amazon.md` for all navigation patterns and platform gotchas.

### Phase 2: Evidence Collection (20-30 min)

Your only job here is to record what you see. Do NOT diagnose or recommend yet.

#### 2A: Campaign Performance Data

**Reference:** See `nav-amazon.md` for ag-Grid extraction techniques and the "All tab" gotcha.

Navigate to Amazon Ads Campaign Manager. Set date range to agreed period.

**For each active campaign, capture:**
- Campaign name, type (SP/SB/SD), targeting type (auto/manual), status
- Daily budget
- Top-of-search impression share + bid adjustment
- Clicks, CTR, CPC
- Total spend
- Orders (purchases)
- Sales
- ROAS
- ACOS (verify: Spend / Sales)

**Also capture paused campaigns with YTD data** — reveals what was tried and whether the pause was warranted.

**Verification checkpoint:** Sum of campaign spends ≈ account total?

Save to working notes before continuing.

#### 2B: Targeting / Keyword Data

**Reference:** Load `reference/keyword-checklist.md` for the full targeting audit checklist.

Navigate to Targeting page. Ensure Spend, Orders, Sales, ACOS columns visible.

**For each target with meaningful spend:**
- Target name/keyword, match type, campaign, ad group
- ROAS, CVR, bid
- Impressions, TOS impression share
- Clicks, spend, orders, sales, ACOS

**Sort by Spend descending.** Capture highest-impact targets first.

**Critical: zero-conversion targets.** Count targets with clicks but zero sales. Record "Targets not delivering" from Overview panel.

**Verification checkpoint:** Spot-check ≥3 targets — Spend/Sales = ACOS?

Save to working notes.

#### 2C: Seller Central Data

**Reference:** Load `reference/seller-central-checklist.md` for extraction techniques and TACoS methodology.

Navigate to Seller Central Business Reports.

**Capture:**
- Sales Dashboard snapshot (today's orders, sales, AOV)
- Compare data (yesterday, same day last week, same day last year)
- Detail Page Sales and Traffic By Child Item (per-ASIN sessions, page views, conversion, Featured Offer %)
- **Featured Offer % for every ASIN** — flag any below 50% immediately

**Calculate TACoS:** `Total Ad Spend / Total Revenue (organic + paid)`
- This is THE critical profitability metric for Amazon
- If you can only estimate total revenue from Sales Dashboard daily rate, label as CALCULATED with method shown

**Calculate TACoS by product line:** Map campaign names to product lines → sum ad spend per line → divide by SC revenue for those ASINs. This reveals which products scale profitably vs. destroy margin.

Save to working notes.

#### 2D: Brand Analytics / Organic Rankings

**Reference:** Load `reference/brand-analytics-checklist.md` for navigation (CRITICAL: use dropdown, NOT direct URL) and interpretation.

Navigate to Search Query Performance via dropdown menu (NOT direct URL — causes page freeze).

**For each search query where brand appears:**
- Search query text, search query volume
- Total impressions, brand impression count, brand impression share
- Total clicks, brand click count, brand click share
- Cart adds (total and brand)
- Purchases (total and brand, with brand purchase share)

**Key extraction:** Which high-volume keywords have <2% brand impression share? These are the biggest organic gaps.

Save to working notes.

### Phase 3: Platform Diagnosis (10-15 min)

Now form conclusions from collected evidence. Review working notes across all data sources.

#### 3A: Wasted Spend Analysis
Identify targets where:
- Spend > $10 and zero conversions
- ACOS > break-even ACOS
- Auto targets (substitutes, complements) with ACOS > 50%

Calculate total wasted spend and % of total ad spend.

#### 3B: Scaling Opportunities
Identify where:
- ROAS above average AND impression share below 5% (room to grow)
- CVR above average but budget-capped
- Branded terms consuming budget that could go to prospecting

#### 3C: Structural Issues
- Budget misallocation (branded vs. non-branded ratio)
- Missing negative keywords (zero-conversion targets not negated)
- Auto campaigns cannibalizing manual on same keywords
- No match type isolation (broad/phrase/exact mixed in same campaign)

#### 3D: Organic Ranking Assessment (from Brand Analytics)
- Highest volume keywords with lowest brand share
- Are branded terms converting? (If not → listing problem, not ad problem)
- Total addressable search volume vs. current organic capture

#### 3E: Profitability Analysis
- Overall ACOS vs. break-even ACOS
- TACoS (ad spend / total revenue) — use benchmarks: excellent <6%, healthy 6-12%, concerning >15%
- Ad dependency ratio (ad-attributed sales / total sales)
- Per-product-line TACoS revealing hidden problems

#### 3F: Cross-Channel Signal Detection

Flag signals that require investigation on other platforms:
- **Branded vs non-branded ACOS split** → check if other channels (Meta, email) are driving branded demand
- **Featured Offer % issues** → check Shopify/DTC for pricing conflicts
- **Organic ranking gaps** → check GA4 for Amazon referral traffic patterns
- **TACoS trend** → if rising despite stable ACOS, organic sales are declining — check broader market signals
- **High CVR products** → flag for potential DTC expansion (Shopify evidence)

### Phase 4: Write Evidence JSON

Build the evidence JSON file conforming to the schema in `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`.

**Filename:** `{Client}_{platform}_evidence.json` where platform = `amazon-ads`
**Location:**
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

#### Evidence JSON Structure

```json
{
  "meta": {
    "client": "{Client Name}",
    "platform": "amazon-ads",
    "audit_date": "YYYY-MM-DD",
    "date_range": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "access_level": "full|read-only|limited|screenshot-only",
    "depth": "deep|standard|surface",
    "auditor_notes": "Context about data quality, limitations, extraction methods used"
  },

  "account_overview": [
    { "metric": "Total Ad Spend", "value": 0, "formatted": "$0.00", "label": "OBSERVED", "source": "Amazon Ads > Campaigns > Totals row" },
    { "metric": "Total Ad Sales", "value": 0, "formatted": "$0.00", "label": "OBSERVED", "source": "Amazon Ads > Campaigns > Totals row" },
    { "metric": "Account ACOS", "value": 0, "formatted": "0%", "label": "CALCULATED", "source": "Total Ad Spend / Total Ad Sales = X%" },
    { "metric": "Account ROAS", "value": 0, "formatted": "0.0x", "label": "CALCULATED", "source": "Total Ad Sales / Total Ad Spend = Xx" },
    { "metric": "Total Revenue (SC)", "value": 0, "formatted": "$0.00", "label": "OBSERVED", "source": "Seller Central > Business Reports > Sales Dashboard" },
    { "metric": "TACoS", "value": 0, "formatted": "0%", "label": "CALCULATED", "source": "Total Ad Spend / Total Revenue (SC) = X%" },
    { "metric": "Ad Dependency Ratio", "value": 0, "formatted": "0%", "label": "CALCULATED", "source": "Ad-Attributed Sales / Total Revenue = X%" },
    { "metric": "Break-even ACOS", "value": 0, "formatted": "0%", "label": "CALCULATED", "source": "Based on {X}% estimated margin" },
    { "metric": "Estimated Margin", "value": 0, "formatted": "0%", "label": "ASSUMPTION", "source": "User-stated margin — not verified against actual COGS" }
  ],

  "campaigns": [
    {
      "name": "Campaign Name",
      "type": "SP|SB|SD",
      "status": "Active|Paused|Budget Limited",
      "spend": 0,
      "revenue": 0,
      "roas": 0,
      "conversions": 0,
      "cpa": 0,
      "budget_daily": 0,
      "bid_strategy": "Description",
      "key_signals": ["budget_limited", "above_breakeven_acos", "zero_conversions", "high_tos_share", "low_tos_share", "auto_cannibalizing_manual"]
    }
  ],

  "tracking_health": {
    "flags": [
      {
        "title": "Description of issue",
        "severity": "critical|high|medium|low",
        "label": "OBSERVED",
        "evidence": "What was seen",
        "source": "Where in platform",
        "recommendation": "Suggested fix"
      }
    ],
    "conversion_actions": []
  },

  "findings": [
    {
      "title": "One-line finding summary",
      "label": "OBSERVED|CALCULATED|INFERENCE",
      "evidence": "Supporting data with numbers",
      "source": "Platform location",
      "significance": "Business impact"
    }
  ],

  "anomalies": [
    {
      "description": "Unexpected pattern",
      "label": "OBSERVED",
      "evidence": "What was seen",
      "source": "Where"
    }
  ],

  "diagnosis": {
    "primary_constraint": {
      "title": "Biggest issue or opportunity",
      "description": "Detailed explanation with data",
      "evidence_refs": ["Specific data points supporting this"]
    },
    "secondary_constraints": [
      {
        "title": "Additional issue",
        "description": "Explanation",
        "evidence_refs": ["Data points"]
      }
    ]
  },

  "opportunities": [
    {
      "action": "Specific, actionable recommendation",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "expected_impact": "Revenue/efficiency estimate",
      "confidence": "high|medium|low",
      "confidence_reasoning": "Why this confidence level",
      "evidence": "Data supporting this"
    }
  ],

  "cross_channel_signals": [
    {
      "signal": "What was noticed on Amazon",
      "check_in": ["google-ads", "meta-ads", "ga4", "shopify"],
      "what_to_look_for": "Specific question for other platforms"
    }
  ],

  "open_questions": [
    {
      "question": "What couldn't be answered",
      "data_needed": "What data would answer it",
      "attempted": "What was tried"
    }
  ],

  "raw_metrics": {
    "campaign_details": [],
    "keyword_details": [],
    "seller_central_asin_data": [],
    "brand_analytics_sqr": [],
    "product_line_tacos": [],
    "wasted_spend_targets": []
  }
}
```

#### Amazon-Specific Evidence Sections

The `raw_metrics` section should include these Amazon-specific data tables:

**`keyword_details`** — Every target with meaningful spend:
```json
{ "keyword": "", "match_type": "", "campaign": "", "ad_group": "", "spend": 0, "sales": 0, "orders": 0, "acos": 0, "roas": 0, "cvr": 0, "bid": 0, "impressions": 0, "clicks": 0, "tos_impression_share": 0 }
```

**`seller_central_asin_data`** — Per-ASIN from Detail Page report:
```json
{ "asin": "", "product_title": "", "sessions": 0, "page_views": 0, "units_ordered": 0, "ordered_product_sales": 0, "session_cvr": 0, "featured_offer_pct": 0 }
```

**`brand_analytics_sqr`** — Search Query Performance data:
```json
{ "search_query": "", "search_volume": 0, "total_impressions": 0, "brand_impression_count": 0, "brand_impression_share": 0, "total_clicks": 0, "brand_click_count": 0, "brand_click_share": 0, "brand_cart_adds": 0, "brand_purchases": 0, "brand_purchase_share": 0 }
```

**`product_line_tacos`** — Per-product-line TACoS:
```json
{ "product_line": "", "ad_spend": 0, "total_revenue_sc": 0, "tacos": 0, "ad_dependency_ratio": 0, "verdict": "Scale|Fix then Scale|Hold|Cut" }
```

**`wasted_spend_targets`** — Zero-conversion or above-breakeven targets:
```json
{ "keyword": "", "match_type": "", "campaign": "", "spend": 0, "clicks": 0, "orders": 0, "acos": null, "reason": "zero_conversions|above_breakeven|high_acos_auto" }
```

### Phase 5: Verification

Before saving the evidence JSON, run this checklist:

- [ ] Every `OBSERVED` metric in evidence JSON traces to working notes
- [ ] No metric was estimated without `ASSUMPTION` label
- [ ] ACOS calculations correct: Spend / Sales = ACOS
- [ ] TACoS calculation correct: Total Ad Spend / Total Revenue (organic + paid)
- [ ] Campaign names exactly match platform
- [ ] Date ranges consistent across all data sources
- [ ] All `DATA_NOT_AVAILABLE` items documented in `open_questions`
- [ ] `cross_channel_signals` populated with at least branded/non-branded ACOS split signal
- [ ] Featured Offer % flags included for any ASIN below 50%
- [ ] `raw_metrics` tables populated with extracted data
- [ ] JSON is valid (no trailing commas, proper quoting)

### Phase 6: Update Manifest & Retrospective

#### Update Manifest
If an audit manifest exists, update the Amazon row:
- Status → `DONE`
- Evidence File → filename
- Date Completed → today
- Session → current session reference

#### Retrospective (Mandatory)
Add to working notes:

1. **Extraction methods that worked** — which data sources, which method (CSV, ag-Grid API, DOM, accessibility tree)
2. **Extraction methods that failed** — what was tried, why it failed
3. **New platform UI changes** — anything different from what nav-amazon.md describes
4. **Data integrity surprises** — cross-check failures, unexpected metric labels
5. **Time sinks** — where time was spent vs. value extracted

**If new patterns discovered:** Flag for potential update to `reference/nav-amazon.md`.

---

## Amazon Ads Benchmark Reference (Quick Access)

From `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` — always load the full file for current numbers:

| Metric | Floor | Healthy | Strong |
|--------|-------|---------|--------|
| SP ACOS | >45% | 25-35% | <20% |
| SP CPC | >$2.00 | $0.85-1.30 | <$0.70 |
| SP CVR | <5% | 8-12% | 15%+ |
| TACoS | >15% | 6-12% | <6% |
| Featured Offer % | <50% | 85-95% | 98%+ |
| TOS Impression Share | <5% | 15-40% | 50%+ |
| Budget Utilization | <50% | 70-90% | 90-100% |

**Break-even ACOS = margin %.** If margin is 55%, break-even ACOS is 55%.
**Target ACOS = break-even × 0.6-0.7.** Leaves room for overhead + profit.

**Match type CVR hierarchy (expected):** Exact > Phrase > Broad > Auto. If broad outperforms exact, campaign structure needs review.

---

## Key Differences from Old amazon-ads-audit

| Aspect | Old (v1) | New (v2) |
|--------|----------|----------|
| Output | Markdown report + XLSX action plan | Evidence JSON file |
| Report generation | Self-contained | Delegated to audit-synthesizer |
| Cross-channel | Mentioned but not actionable | Structured `cross_channel_signals` for synthesizer |
| Data format | Prose + tables in markdown | Structured JSON with labeled metrics |
| Invocation | Conversational triggers only | `/audit-amazon` command + conversational |
| Manifest | None | Updates shared audit manifest |
| Evidence labels | In working notes only | In both working notes AND output JSON |

---

## File Routing

| File | Location |
|------|----------|
| Working notes | `{dept}/reports/{Client-Name}/` or `{dept}/reports/` |
| Evidence JSON | `{dept}/reports/{Client-Name}/evidence/` or `{dept}/reports/evidence/` |
| Manifest update | Same evidence directory |

Where `{dept}` = `{Agency}` for clients, `{Own-Brand}` for {Own Brand}.
