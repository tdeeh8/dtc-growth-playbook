# BigCommerce Deep-Dive — Ads-Audit

Loaded when BigCommerce scores RED or YELLOW at triage. Structurally similar to Shopify — BigCommerce is the financial anchor for non-Shopify stores.

## Report Inclusion Rules

Not every metric this deep-dive produces belongs in the report body. Apply these rules when synthesizing:

**BODY (scorecard + diagnosis, 1 chart):**
- Top-line store efficiency: net sales, orders, AOV, gross margin — with YoY deltas.
- Top 5 products by revenue from Pull 1 (and any outlier returns/margin issues).
- New-vs-returning customer split headline from Pull 3.
- One chart: typically "Revenue trend YoY" or "Top 5 products by revenue".

**APPENDIX (reference-only, not in body):**
- Full Pull 1 product performance table (SKU-level).
- Pull 2 channel + traffic attribution breakdown.
- Pull 3 full customer split detail.
- Pull 4 monthly trend series.
- Discount / return detail if pulled.

**CUT entirely:**
- Long-tail SKUs contributing <1% of revenue.
- Sessions reported alone without orders.
- Any metric without a YoY comparison.
- Raw item counts with no revenue or margin context.

The narrative for this platform in the report body must be ≤ 200 words. Detailed tables go in the appendix.

---

## Context from Triage

- High return/refund rate → Focus on product performance
- High discount rate → Focus on channel attribution + discount code reliance
- Low margins → Focus on product-level profitability
- Revenue doesn't reconcile → Focus on channel manager + multi-platform attribution

## Deep-Dive Pulls (3-4 for RED, 1-2 for YELLOW)

### Pull 1 — Product Performance (ALWAYS run)

```
Data source: BigCommerce (data_source_id from cache)
Metrics: ["Gross sales", "Orders", "Items"]
Dimensions: ["Product title", "Product category"]
```

3 metrics × 2 dimensions = 6 `load_metric_data` calls (one per metric + dimension combination, with `record_limit=20`). BigCommerce uses "Product category" instead of Shopify's "Product type."

Call `list_metrics(data_source_id=bigcommerce_ds_id)` first — COGS/Gross profit availability varies. If available, pull them too.

**Analysis:**
- Top 10-15 products by revenue, % of total
- Revenue concentration: top 3 products >60% = risk
- Category distribution
- Products with zero sales in period = dead inventory signal

### Pull 2 — Channel + Traffic Attribution

```
Data source: BigCommerce
Metrics: ["Gross sales", "Orders", "Net sales"]
Dimensions: ["Channel", "UTM source"]
```

3 metrics × 2 dimensions = 6 `load_metric_data` calls. BigCommerce Channel Manager can connect Amazon, eBay, Facebook, Instagram, Google Shopping, POS — verify no double-counting with ad platform data.

**Analysis:**
- Channel revenue split
- UTM tagging coverage (% of orders with UTM data)
- Multi-channel revenue — check for attribution overlap with ad platforms
- Flag draft orders / POS revenue separately

### Pull 3 — Customer Split

```
Data source: BigCommerce
Metrics: ["Gross sales", "Orders", "Customer count"]
Dimension: "Is returning customer"
```

3 `load_metric_data` calls with `dimension="Is returning customer"`. May return DATA_NOT_AVAILABLE — BigCommerce customer data varies.

**Analysis:**
- New vs returning order split
- AOV by segment
- Repeat purchase rate (directional)

### Pull 4 — Monthly Trend (conditional, lookback >60d)

```
Data source: BigCommerce
Metrics: ["Gross sales", "Refunds", "Net sales", "Orders", "Items"]
granulation_time_unit: 4  # monthly
is_whole_range: false
```

5 `load_metric_data` calls, one per metric, each with `granulation_time_unit=4` for monthly series. Look for MoM trends in revenue, orders, AOV.

## YELLOW Mode

- Margin concern → Pull 1 only
- Refund concern → Pull 1
- Discount/channel concern → Pull 2

## Evidence Output

`{Client}_bigcommerce_evidence.json`

Key fields same as Shopify evidence. Note in `meta.platform`: "bigcommerce". Include `cross_channel_signals` with total revenue + order count for synthesizer reconciliation.

## BigCommerce-Specific Notes

- Categories ≠ Shopify Collections — different taxonomy
- Channel Manager can cause double-counting if Amazon/eBay also audited separately
- Customer groups (wholesale, VIP, retail) affect blended margin — note if detected
- COGS less commonly populated than Shopify — expect to use estimates more often
