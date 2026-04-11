# Keyword & Targeting Audit Checklist

Reference checklist for Phase 2B of the amazon-ads-v2 audit. Use this to ensure complete targeting data extraction and diagnosis.

---

## Data Extraction Checklist

### Per-Target Capture (Targeting Page)

For every target with meaningful spend, extract:

- [ ] Target name / keyword text
- [ ] Match type (exact, phrase, broad, auto-loose, auto-close, auto-substitutes, auto-complements, product target)
- [ ] Parent campaign name
- [ ] Ad group name
- [ ] Current bid (remember: millicents on Targeting page — divide by 100,000)
- [ ] Impressions
- [ ] Top-of-search impression share
- [ ] Clicks
- [ ] CTR
- [ ] CPC
- [ ] Total spend
- [ ] Orders
- [ ] Sales
- [ ] ACOS (verify: Spend / Sales)
- [ ] ROAS (verify: Sales / Spend)
- [ ] CVR (verify: Orders / Clicks)

### Sorting & Filtering

1. **Sort by Spend descending** — capture highest-impact targets first
2. **Filter:** Target active status = Enabled, Spend > $0.00
3. **Record "Targets not delivering"** count from the Overview panel
4. **Count zero-conversion targets** — targets with clicks > 0 but orders = 0

### Primary Method — CSV Report Download

- [ ] Use the campaign report and/or search term report CSV downloaded in Phase 2
- [ ] Parse CSV to extract all per-target metrics
- [ ] The CSV contains all columns: keyword, match type, campaign, ad group, bid, impressions, clicks, spend, orders, sales, ACOS, ROAS
- [ ] Sort by Spend descending after parsing
- [ ] Monetary values in the CSV should already be in dollars (unlike the ag-Grid API which uses millicents)

### Fallback — ag-Grid Extraction (only if CSV not available)

- Use React fiber tree method first (see `nav-amazon.md`)
- Monetary values on Targeting page are in **millicents** (÷ 100,000 for dollars)
- The spend field is `spend`, not `cost`
- Sanitize ASIN strings in output to avoid JavaScript blocking

---

## Diagnosis Checklist

### Wasted Spend Identification

Flag targets where ANY of these apply:

| Condition | Threshold | Action Category |
|-----------|-----------|-----------------|
| Spend > $10 and zero orders | Any | NEGATE or PAUSE |
| ACOS > break-even ACOS | Varies by margin | REDUCE BID or NEGATE |
| Auto-substitutes ACOS > 50% | 50% | NEGATE from auto, test in manual if CVR > 5% |
| Auto-complements ACOS > 50% | 50% | NEGATE from auto |
| Spend > $25 and ACOS > 2x break-even | 2x break-even | NEGATE immediately |
| Clicks > 20 and zero orders | 20 clicks | NEGATE — enough data to judge |

**Calculate total wasted spend:** Sum all flagged targets. Express as % of total ad spend.

### Scaling Opportunity Identification

Flag targets where:

| Condition | Signal | Action Category |
|-----------|--------|-----------------|
| ROAS > account average AND TOS share < 5% | Room to grow | INCREASE BID |
| CVR > account average AND budget-limited campaign | Constrained winner | INCREASE BUDGET |
| Exact match outperforming broad on same keyword | Confirmed winner | Increase exact bid, reduce broad |
| High impressions + high CVR + low spend | Under-bid winner | INCREASE BID 15-25% |

### Structural Issue Detection

Check for these patterns:

#### Match Type Isolation
- [ ] Are broad, phrase, and exact match types in separate campaigns or ad groups?
- [ ] If mixed: which keywords appear in multiple match types within the same campaign?
- [ ] Is there a clear harvesting flow? (Auto → Broad → Phrase → Exact)

#### Auto vs. Manual Cannibalization
- [ ] Do any auto campaign search terms overlap with manual exact match campaigns?
- [ ] If overlapping: is the auto campaign stealing impressions from the manual (lower bid wins)?
- [ ] Are converting auto terms being harvested into manual campaigns with negative exact in auto?

#### Negative Keyword Hygiene
- [ ] How many zero-conversion targets exist with > $10 spend?
- [ ] Are there obvious irrelevant terms not negated? (competitor brands, unrelated categories)
- [ ] Are brand terms negated from non-branded campaigns? (prevents self-competition)

#### Branded vs. Non-Branded Split
- [ ] What % of total spend goes to branded keywords?
- [ ] What is branded ACOS vs. non-branded ACOS?
- [ ] Is branded search consuming budget that could go to prospecting?
- [ ] Benchmark: branded ACOS should be significantly below account average (often 10-20%)

### Campaign Type Assessment

#### Sponsored Products (SP)
- [ ] Auto campaigns: break down by 4 sub-types (loose, close, substitutes, complements)
- [ ] Manual exact: are these the proven winners from auto/broad harvesting?
- [ ] Manual broad/phrase: are these discovery campaigns feeding exact winners?
- [ ] Are there SP campaigns for every product/ASIN that should be advertised?

#### Sponsored Brands (SB)
- [ ] Are SB campaigns driving brand awareness on category terms?
- [ ] What is SB ACOS vs. SP ACOS? (SB often higher — evaluate for awareness value)
- [ ] Are SB campaigns linking to optimized landing pages or the Amazon Store?

#### Sponsored Display (SD)
- [ ] Are SD campaigns targeting competitor ASINs?
- [ ] What is SD ROAS? (typically lower than SP — evaluate for defensive value)
- [ ] Are SD retargeting campaigns in place for viewed-but-not-purchased?

---

## Evidence JSON Mapping

Keyword data maps to these evidence JSON sections:

| Finding Type | JSON Section |
|-------------|-------------|
| Per-keyword metrics | `raw_metrics.keyword_details` |
| Zero-conversion targets | `raw_metrics.wasted_spend_targets` |
| Wasted spend total | `findings[]` with CALCULATED label |
| Structural issues | `findings[]` with INFERENCE label |
| Scaling opportunities | `opportunities[]` |
| Match type problems | `diagnosis.secondary_constraints[]` |
| Branded vs non-branded split | `cross_channel_signals[]` (for synthesizer) |
| Missing negatives count | `tracking_health.flags[]` |

### Key Signals for Campaign Objects

Use these `key_signals` tags in the `campaigns[]` array:

- `zero_conversions` — campaign has spend but no orders
- `above_breakeven_acos` — ACOS exceeds break-even threshold
- `budget_limited` — spending full daily budget
- `high_tos_share` — TOS impression share > 40%
- `low_tos_share` — TOS impression share < 5%
- `auto_cannibalizing_manual` — auto campaign overlapping manual keywords
- `no_negative_keywords` — campaign lacks proper negatives
- `branded_spend_heavy` — >30% of campaign spend is branded
- `declining_performance` — ACOS trending up or ROAS trending down over period
- `strong_performer` — ACOS well below break-even with consistent volume
