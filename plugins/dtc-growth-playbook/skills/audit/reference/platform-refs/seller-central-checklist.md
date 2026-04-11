# Seller Central Data Extraction Checklist

Reference checklist for Phase 2C of the amazon-ads-v2 audit. Covers Sales Dashboard extraction, Detail Page report, Featured Offer % analysis, and TACoS calculation methodology.

---

## Data Sources

### 1. Sales Dashboard

**URL:** `https://sellercentral.amazon.com/business-reports`

**Capture:**
- [ ] Today's ordered product sales ($)
- [ ] Today's units ordered
- [ ] Today's total order items
- [ ] Compare: yesterday same metric
- [ ] Compare: same day last week
- [ ] Compare: same day last year
- [ ] Any "Deep Dive" alerts (products with significant changes)

**Label:** All as OBSERVED with source "Seller Central > Sales Dashboard > {specific metric}"

**Use for:** Daily run-rate estimates and trend detection. If YTD totals aren't available from Detail Page report, extrapolate from daily rate (label as CALCULATED with method shown).

### 2. Detail Page Sales and Traffic By Child Item

**The single most important Seller Central view for the audit.**

**Navigate:** Business Reports → Detail Page Sales and Traffic → By Child Item

**Set date range:** Use dropdown presets (YTD preferred). See Gotcha 6 in nav-amazon.md — don't try custom date entry.

**Per-ASIN, capture:**

- [ ] ASIN (extract from `href` if `textContent` returns empty — see Gotcha 10)
- [ ] Product title (or first ~50 chars)
- [ ] Sessions
- [ ] Session percentage (share of total sessions)
- [ ] Page views
- [ ] Page views percentage
- [ ] Buy Box percentage / **Featured Offer %** ← CRITICAL
- [ ] Units ordered
- [ ] Units ordered — B2B (if available)
- [ ] Unit session percentage (session CVR)
- [ ] Ordered product sales
- [ ] Total order items

### 3. Extraction Methods (Priority Order)

**Primary Method — CSV Download (expected to work ~90% of the time):**
- [ ] Click "Download (.csv)" button on the Detail Page report page
- [ ] Parse CSV — verify it contains all expected columns (Sessions, Page Views, Units Ordered, Sales, Featured Offer %, etc.)
- [ ] Verify row count matches what the UI header shows
- [ ] If CSV is complete with Featured Offer % column, browser extraction is NOT needed for this source

**If CSV is missing Featured Offer % column:**
- [ ] Featured Offer % may not be included in all CSV exports
- [ ] Go back to the browser to extract Featured Offer % per ASIN from the grid UI
- [ ] Use accessibility tree (read_page) or JavaScript extraction for this specific column only

**Fallback — Multi-pass DOM Extraction (only if CSV download fails entirely):**
- [ ] Find grid container (custom class, many child `div` elements)
- [ ] Pass 1 (left side): product titles, ASINs, sessions, page views
- [ ] Pass 2 (right side): scroll right → units ordered, sales, Featured Offer %
- [ ] Pass 3+: scroll down for additional rows, repeat left/right
- [ ] Use stable numeric field (session count) as row alignment anchor between passes
- [ ] Use `read_page` accessibility tree to cross-check specific values
- [ ] Useful for ASIN identifiers that don't render via DOM

**See Gotcha 9 in nav-amazon.md** for why standard table selectors don't work.

### 4. CSV Parsing Checklist

**After CSV Download:**
- [ ] Open/parse the CSV file
- [ ] Verify column headers match expected schema
- [ ] Check for any empty rows or malformed data
- [ ] Rank ASINs by Ordered Product Sales descending
- [ ] Identify top 20% ASINs by revenue contribution (these get full diagnosis attention)
- [ ] Flag any ASIN with Featured Offer % below 50% immediately
- [ ] Calculate total revenue for TACoS denominator

---

## Featured Offer % (Buy Box) Analysis

This is one of the highest-impact findings possible in an Amazon audit. No amount of ad optimization matters if another seller wins the Buy Box.

### Interpretation

| Featured Offer % | Status | Action |
|-------------------|--------|--------|
| 95-100% | Healthy | No action needed — standard for private label |
| 85-95% | Monitor | Investigate — intermittent Buy Box loss |
| 50-85% | Warning | Significant revenue leakage — investigate cause |
| 10-50% | Critical | Pause or reduce ads on this ASIN until resolved |
| 0-10% | Catastrophic | Pause ALL ads immediately — every ad dollar subsidizes competitor |

### Root Causes of Low Featured Offer %

- **Pricing:** Your price is higher than a competing offer (including shipping)
- **Inventory:** Low stock triggers Amazon to share or remove Buy Box
- **Account health:** Late shipments, high defect rate, or policy violations
- **Unauthorized resellers:** Third parties listing your product at lower price
- **Amazon itself:** Amazon may be a seller on the listing (hardest to compete with)
- **FBM vs FBA:** FBA generally wins Buy Box over FBM at same price

### Evidence JSON Mapping

Flag every ASIN below 50% Featured Offer in `tracking_health.flags[]`:

```json
{
  "title": "ASIN {X} Featured Offer % at {Y}% — Buy Box loss",
  "severity": "critical",  // or "high" if 50-85%
  "label": "OBSERVED",
  "evidence": "ASIN {X} ({product title}): Featured Offer % = {Y}%, Sessions = {Z}, Sales = ${W}",
  "source": "Seller Central > Detail Page Sales and Traffic > By Child Item > {date range}",
  "recommendation": "Investigate pricing, inventory, and unauthorized resellers. Reduce ad spend on this ASIN until Featured Offer % recovers above 85%."
}
```

---

## TACoS Calculation (Critical)

TACoS (Total Advertising Cost of Sale) is the single most important profitability metric for Amazon sellers. It measures ad spend as a percentage of ALL revenue (organic + paid), not just ad-attributed revenue.

### Formula

```
TACoS = Total Ad Spend / Total Revenue (organic + paid)
```

- **Total Ad Spend** = sum of all campaign spend from Amazon Ads Campaign Manager
- **Total Revenue** = Ordered Product Sales from Seller Central (this includes both organic and ad-attributed sales)

### Why TACoS > ACOS

ACOS only measures efficiency of ad-attributed sales. A seller with 25% ACOS but 50% TACoS is spending half their total revenue on ads — that's a business model problem, not just an ad efficiency issue.

### Benchmarks (from playbook)

| TACoS | Rating | Interpretation |
|-------|--------|---------------|
| <6% | Excellent | Strong organic presence, ads supplementing |
| 6-12% | Healthy | Balanced mix of organic and paid |
| 12-15% | Caution | Becoming ad-dependent — organic declining or never established |
| >15% | Critical | Unsustainable ad dependency — needs organic strategy |

### TACoS by Product Line (High-Value Analysis)

Account-level TACoS hides product-level problems. One product at 3% TACoS can subsidize another at 88% TACoS, making the blended number look fine.

**How to calculate:**

1. **Map campaigns to product lines:** Use campaign naming conventions, portfolio names, or ASIN targeting to group campaigns by product line
2. **Sum ad spend per product line** from Campaign Manager data
3. **Get total revenue per product line** from Seller Central Detail Page report (sum Ordered Product Sales for the product's ASINs)
4. **Calculate:** Product Line TACoS = Product Line Ad Spend / Product Line Total Revenue

**Per product line, record:**

```json
{
  "product_line": "Product Name / Line",
  "ad_spend": 0,
  "total_revenue_sc": 0,
  "tacos": 0,
  "ad_dependency_ratio": 0,
  "verdict": "Scale|Fix then Scale|Hold|Cut"
}
```

### Verdict Criteria

| TACoS | Ad Dependency | ACOS vs Break-even | Verdict |
|-------|---------------|-------------------|---------|
| <8% | <30% | Below | **Scale** — profitable organic+paid mix |
| 8-15% | 30-50% | At or below | **Fix then Scale** — reduce waste, build organic |
| 8-15% | 30-50% | Above | **Hold** — needs structural fix before spend increase |
| >15% | >50% | Above | **Cut** — reduce spend, focus on organic ranking |

### Ad Dependency Ratio

```
Ad Dependency = Ad-Attributed Sales / Total Revenue (SC)
```

- **<25%:** Strong organic base — ads are supplemental
- **25-50%:** Balanced — healthy but monitor
- **50-75%:** Ad-dependent — organic needs work
- **>75%:** Critically ad-dependent — revenue will collapse if ads pause

---

## Cross-Channel Signals from Seller Central

Flag these for the synthesizer's `cross_channel_signals[]`:

1. **TACoS rising despite stable ACOS** → organic sales declining. Check broader market (GA4, Google Trends) for category-level decline.

2. **Featured Offer % issues** → if client also sells DTC, check Shopify pricing. MAP violations or DTC pricing below Amazon can trigger Buy Box loss.

3. **High session CVR but low sessions** → listing converts well but lacks traffic. Cross-check with Brand Analytics — organic ranking may be low, or ad spend is the primary traffic driver.

4. **Declining ordered product sales YoY** → macro issue. Check if this is category-wide (Brand Analytics total category data) or brand-specific (listing/competitive issue).

---

## Evidence JSON Mapping

| Data Point | JSON Location |
|-----------|--------------|
| Total Revenue (SC) | `account_overview[]` with OBSERVED label |
| TACoS (account level) | `account_overview[]` with CALCULATED label |
| Ad Dependency Ratio | `account_overview[]` with CALCULATED label |
| Per-ASIN data | `raw_metrics.seller_central_asin_data[]` |
| Product line TACoS | `raw_metrics.product_line_tacos[]` |
| Featured Offer flags | `tracking_health.flags[]` |
| TACoS trend signals | `cross_channel_signals[]` |
| Sales Dashboard snapshot | `raw_metrics.seller_central_asin_data[]` or `findings[]` |
