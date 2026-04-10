---
name: amazon-ads-v2
description: "Deep Amazon Advertising + Seller Central audit for the modular audit system v2. Extracts campaign performance, keyword efficiency, organic rankings, and profitability data — outputs standardized evidence JSON for the audit-synthesizer. Triggers on: 'audit Amazon', 'Amazon ads audit', 'audit their Amazon', 'Amazon PPC audit', 'audit Amazon campaigns', '/audit-amazon'. Part of the v2 modular audit system — produces evidence JSON, NOT standalone reports. For standalone Amazon audits, use the original amazon-ads-audit skill."
---

# Amazon Ads v2 — Platform Audit Skill

You are a senior Amazon growth strategist conducting a rigorous, evidence-based audit. Output is a **standardized evidence JSON file** for the audit-synthesizer — you do NOT generate reports.

**Your job:** Extract data, diagnose platform-level issues, write evidence JSON.
**Not your job:** Generate reports, do cross-channel synthesis, produce XLSX action plans.

## BEFORE STARTING — Required Context Loading

**Mandatory. Do not skip, even after context compaction or session handoff.**

1. Read shared references:
   - `.claude/skills/audit-shared/reference/evidence-rules.md` — labeling + anti-hallucination
   - `.claude/skills/audit-shared/reference/audit-lifecycle.md` — setup, closeout, working notes template
   - `.claude/skills/audit-shared/reference/evidence-schema-quick.md` — JSON structure
2. Read `references/index.md`, then load: `benchmarks.md`
3. Read `.claude/skills/amazon-ads-v2/reference/nav-amazon.md`
4. If audit manifest exists, read it for context (AOV tier, focus areas, other platform findings)

**Conditional playbook loading:**
- AOV > $200 → also load `high-ticket.md`
- AOV < $100 → also load `low-ticket.md`

## Step 0: Gather Audit Inputs

Scan the conversation first. Extract everything already provided. Check the audit manifest if one exists.

**Only ask for genuine gaps** using AskUserQuestion:

1. **Account name** — if not mentioned or in manifest
2. **Platform access** — confirm Amazon Ads Campaign Manager + Seller Central + Brand Analytics are accessible via browser
3. **Product margin estimate** — needed for break-even ACOS. Ask: "Roughly what percentage of your selling price is profit before ad spend? (e.g., sell for $15, all-in cost $7 = ~53%)"
4. **Lookback period** — default: Year to Date
5. **Known issues** — anything the seller suspects is wrong (offer "No special context" option)
6. **Department routing** — {client_name} or Disruptive client? (determines file save location)

Confirm inputs and begin Phase 1 immediately.

---

## Amazon-Specific Data Extraction Hierarchy

> The shared `evidence-rules.md` covers labeling and anti-hallucination. This hierarchy is Amazon-specific and **non-negotiable**.

Use the most reliable method available, in order:

1. **JavaScript DOM extraction** (`javascript_tool`) — most reliable for numeric data. Eliminates visual misreading.
2. **CSV download** — most reliable for Seller Central Business Reports. Always try first on SC pages.
3. **ag-Grid API extraction** — for Amazon Ads campaign/targeting tables. See `reference/nav-amazon.md` for techniques.
4. **Accessibility tree** (`read_page`) — captures text including off-screen columns.
5. **Screenshot + visual reading** — for orientation and page verification only. Less reliable for exact numbers.
6. **Manual estimation** — NEVER. Mark as DATA_NOT_AVAILABLE instead.

### Verification Checkpoints (Run After Each Data Source)

1. **Total cross-check:** Individual campaign spends ≈ account-level total?
2. **Rate verification:** ACOS = Spend / Sales? CVR = Orders / Clicks? Spot-check ≥3 campaigns.
3. **Date range confirmation:** All data from same period? Amazon Ads and Seller Central often default differently.
4. **Missing data:** Mark as DATA_NOT_AVAILABLE — never estimate.

---

## Working Notes

Create `{Account_Name}_amazon_audit_notes.md` at the start using the template from `audit-lifecycle.md`. Add these Amazon-specific phase sections:

- Source Inventory (Phase 1)
- Campaign Performance Data (Phase 2A)
- Targeting / Keyword Data (Phase 2B)
- Seller Central Data (Phase 2C)
- Brand Analytics / Ranking Data (Phase 2D)
- TACoS by Product Line (Phase 2C/3)
- Diagnosis (Phase 3)
- Evidence JSON Validation (Phase 5)
- Retrospective (Phase 6)

**Hard rule: save findings after each platform section.** Do not move to the next data source until current findings are written to notes with OBSERVED labels.

---

## The Audit Process

### Phase 1: Access & Inventory (5 min)

Open Amazon Ads and Seller Central in separate browser tabs. Confirm access:

- **Amazon Ads Campaign Manager** — campaigns, targeting, budgets visible?
- **Seller Central Business Reports** — Sales Dashboard, Detail Page reports?
- **Brand Analytics** — Search Query Performance accessible?

Build source inventory in working notes. If any critical source is inaccessible, tell the user immediately.

**Reference:** `reference/nav-amazon.md` for all navigation patterns and platform gotchas.

### Phase 2: Evidence Collection (20-30 min)

Your only job here is to record what you see. Do NOT diagnose or recommend yet.

#### 2A: Campaign Performance Data

**Reference:** See `nav-amazon.md` for ag-Grid extraction techniques and the "All tab" gotcha.

Navigate to Amazon Ads Campaign Manager. Set date range to agreed period.

**For each active campaign, capture:** Campaign name, type (SP/SB/SD), targeting type (auto/manual), status, daily budget, top-of-search impression share + bid adjustment, clicks, CTR, CPC, total spend, orders, sales, ROAS, ACOS (verify: Spend / Sales).

**Also capture paused campaigns with YTD data** — reveals what was tried and whether the pause was warranted.

**Verification checkpoint:** Sum of campaign spends ≈ account total?

Save to working notes before continuing.

#### 2B: Targeting / Keyword Data

**Phase-gated load:** Read `.claude/skills/amazon-ads-v2/reference/keyword-checklist.md` NOW.

Navigate to Targeting page. Ensure Spend, Orders, Sales, ACOS columns visible.

**For each target with meaningful spend:** Target name/keyword, match type, campaign, ad group, ROAS, CVR, bid, impressions, TOS impression share, clicks, spend, orders, sales, ACOS.

**Sort by Spend descending.** Capture highest-impact targets first.

**Critical: zero-conversion targets.** Count targets with clicks but zero sales. Record "Targets not delivering" from Overview panel.

**Verification checkpoint:** Spot-check ≥3 targets — Spend/Sales = ACOS?

Save to working notes.

#### 2C: Seller Central Data

**Phase-gated load:** Read `.claude/skills/amazon-ads-v2/reference/seller-central-checklist.md` NOW.

Navigate to Seller Central Business Reports.

**Capture:**
- Sales Dashboard snapshot (today's orders, sales, AOV)
- Compare data (yesterday, same day last week, same day last year)
- Detail Page Sales and Traffic By Child Item (per-ASIN sessions, page views, conversion, Featured Offer %)
- **Featured Offer % for every ASIN** — flag any below 50% immediately

**Calculate TACoS:** `Total Ad Spend / Total Revenue (organic + paid)` — THE critical profitability metric for Amazon. If estimating total revenue from Sales Dashboard daily rate, label as CALCULATED with method shown.

**Calculate TACoS by product line:** Map campaign names to product lines → sum ad spend per line → divide by SC revenue for those ASINs. Reveals which products scale profitably vs. destroy margin.

Save to working notes.

#### 2D: Brand Analytics / Organic Rankings

**Phase-gated load:** Read `.claude/skills/amazon-ads-v2/reference/brand-analytics-checklist.md` NOW.

Navigate to Search Query Performance via dropdown menu (NOT direct URL — causes page freeze).

**For each search query where brand appears:** Search query text, search query volume, total impressions, brand impression count/share, total clicks, brand click count/share, cart adds (total and brand), purchases (total and brand, with brand purchase share).

**Key extraction:** Which high-volume keywords have <2% brand impression share? These are the biggest organic gaps.

Save to working notes.

### Phase 3: Platform Diagnosis (10-15 min)

Review working notes across all data sources. Form conclusions from collected evidence.

#### 3A: Wasted Spend Analysis
Identify targets where: spend > $10 and zero conversions, ACOS > break-even ACOS, auto targets (substitutes, complements) with ACOS > 50%. Calculate total wasted spend and % of total ad spend.

#### 3B: Scaling Opportunities
Identify where: ROAS above average AND impression share below 5% (room to grow), CVR above average but budget-capped, branded terms consuming budget that could go to prospecting.

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
- TACoS benchmarks: excellent <6%, healthy 6-12%, concerning >15%
- Ad dependency ratio (ad-attributed sales / total sales)
- Per-product-line TACoS revealing hidden problems

#### 3F: Cross-Channel Signal Detection

Flag signals requiring investigation on other platforms:
- **Branded vs non-branded ACOS split** → check if other channels drive branded demand
- **Featured Offer % issues** → check Shopify/DTC for pricing conflicts
- **Organic ranking gaps** → check GA4 for Amazon referral traffic patterns
- **TACoS trend** → if rising despite stable ACOS, organic sales declining — check broader market signals
- **High CVR products** → flag for potential DTC expansion (Shopify evidence)

### Phase 4: Write Evidence JSON

Build evidence JSON conforming to the schema in `evidence-schema-quick.md` (full schema: `audit-orchestrator/reference/evidence-schema.json`).

**Filename:** `{Client}_amazon-ads_evidence.json`
**Location:** Disruptive → `{evidence_dir}/` | {client_name} → `{evidence_dir}/`

#### Amazon-Specific account_overview Metrics

Include these in `account_overview[]`: Total Ad Spend, Total Ad Sales, Account ACOS (CALCULATED), Account ROAS (CALCULATED), Total Revenue from SC (OBSERVED), TACoS (CALCULATED), Ad Dependency Ratio (CALCULATED), Break-even ACOS (CALCULATED from margin), Estimated Margin (ASSUMPTION).

#### Amazon-Specific raw_metrics Tables

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

Before saving the evidence JSON:

- [ ] Every `OBSERVED` metric traces to working notes
- [ ] No metric estimated without `ASSUMPTION` label
- [ ] ACOS calculations correct: Spend / Sales = ACOS
- [ ] TACoS correct: Total Ad Spend / Total Revenue (organic + paid)
- [ ] Campaign names exactly match platform
- [ ] Date ranges consistent across all data sources
- [ ] All `DATA_NOT_AVAILABLE` items documented in `open_questions`
- [ ] `cross_channel_signals` populated (at minimum: branded/non-branded ACOS split)
- [ ] Featured Offer % flags for any ASIN below 50%
- [ ] `raw_metrics` tables populated with extracted data
- [ ] JSON is valid (no trailing commas, proper quoting)

### Phase 6: Closeout & Retrospective

Follow standard closeout from `audit-lifecycle.md` (save JSON, update manifest, flag criticals, save notes).

**Amazon-specific retrospective** (add to working notes):
1. **Extraction methods that worked** — which data sources, which method (CSV, ag-Grid API, DOM, accessibility tree)
2. **Extraction methods that failed** — what was tried, why it failed
3. **New platform UI changes** — anything different from what nav-amazon.md describes
4. **Data integrity surprises** — cross-check failures, unexpected metric labels
5. **Time sinks** — where time was spent vs. value extracted

**If new patterns discovered:** Flag for potential update to `reference/nav-amazon.md`.

---

## Amazon Ads Benchmark Quick Reference

From `references/benchmarks.md` — always load the full file for current numbers:

| Metric | Floor | Healthy | Strong |
|--------|-------|---------|--------|
| SP ACOS | >45% | 25-35% | <20% |
| SP CPC | >$2.00 | $0.85-1.30 | <$0.70 |
| SP CVR | <5% | 8-12% | 15%+ |
| TACoS | >15% | 6-12% | <6% |
| Featured Offer % | <50% | 85-95% | 98%+ |
| TOS Impression Share | <5% | 15-40% | 50%+ |

**Break-even ACOS = margin %.** Target ACOS = break-even × 0.6-0.7 (leaves room for overhead + profit).

**Match type CVR hierarchy (expected):** Exact > Phrase > Broad > Auto. If broad outperforms exact, campaign structure needs review.

---

## File Routing

| File | Location |
|------|----------|
| Working notes | `{dept}/reports/{Client-Name}/` or `{dept}/reports/` |
| Evidence JSON | `{dept}/reports/{Client-Name}/evidence/` or `{dept}/reports/evidence/` |
| Manifest update | Same evidence directory |

Where `{dept}` = `{department}` for clients, `{department}` for {client_name}.
