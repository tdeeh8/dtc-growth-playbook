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

---

## Triage-Level Metrics (pull at triage, before deep-dive runs)

In addition to the standard financial overview metrics, triage SHOULD attempt to pull the new-customer split so MER and nROAS can be computed at the cross-platform anchor step.

**Metrics to add at triage:**
- `First-time customers` (or `First-time customer count` — confirm via `list_metrics(data_source_id=bigcommerce_ds_id)`)
- `Returning customers` (or `Returning customer count`)
- `First-time customer Net sales` (or `Net sales (first-time customers)` — BigCommerce Databox first-time-filterable variant, if exposed)
- `Returning customer Net sales` (or `Net sales (returning customers)`)

**Calculation:**
- **New customer revenue %** = First-time customer Net sales ÷ Total Net sales
- Feeds **nROAS** = First-time customer Net sales ÷ Total paid spend at the cross-platform anchor.

**BigCommerce data exposure caveat:** BigCommerce does not expose a first-time vs returning customer split as reliably as Shopify across all Databox tiers / store configurations. If the BigCommerce data source returns `DATA_NOT_AVAILABLE` for the first-time-filterable metrics above:
- **Fallback A:** Derive from the Pull 3 "Is returning customer" breakdown — order counts × cohort AOV — and label as ESTIMATE.
- **Fallback B:** If BigCommerce can't produce the split at all, **fall back to GA4 Pull 6 (New vs Returning by Source/Medium)** for nROAS calculation. Flag in evidence as `nroas_source: ga4_fallback` and surface a Data Gaps row in the scorecard.

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

### Pull 5 — New Customer Revenue by Acquisition Channel (conditional — runs when nROAS is being computed at synthesis time)

**Trigger:** Run this pull whenever the synthesizer is computing per-channel nROAS as part of the cross-platform anchor scoring (i.e., whenever BigCommerce is connected and at least one paid platform was deep-dived). This is the cleanest "is this channel acquiring real new revenue?" diagnostic.

```
Data source: BigCommerce (data_source_id from cache)
Metrics: ["First-time customer Net sales", "First-time customer Orders"]
            (or whatever first-time-filterable variants exist — verify via list_metrics first)
Dimensions: ["Marketing channel" / "UTM source"] (preferred) — fallback to ["Channel"] (Sales channel)
```

One `load_metric_data` call per metric × dimension combination. Verify metric availability via `list_metrics(data_source_id=bigcommerce_ds_id)` before pulling — BigCommerce exposes first-time-filterable variants less reliably than Shopify.

**Output:** per-channel new-customer revenue and order count. Combine with paid spend per channel from the cross-platform anchor:
- **nROAS (per channel)** = First-time customer Net sales (channel) ÷ Paid spend (channel)

**Evidence table:**
| Channel / UTM Source | First-time Net Sales | First-time Orders | Paid Spend | nROAS | % of Total New Customer Revenue |
|---|---|---|---|---|---|

**Data Quality Caveat:**
- Requires UTMs on BigCommerce orders to attribute new-customer revenue to acquisition channel. UTM hygiene is rarely perfect — accounts with `(direct)/(none)` >25% will produce noisy per-channel nROAS.
- BigCommerce Channel Manager rows (Amazon, eBay, POS) should be excluded from per-channel nROAS calculations against ad spend — they don't map to paid acquisition channels and will distort the ratio.
- **Fallback (BigCommerce-specific):** If BigCommerce data source doesn't expose first-time customer split at the channel level (common — varies by store tier and Channel Manager config), fall back to **GA4 Pull 6 (New vs Returning by Source/Medium)** for nROAS calculation. Flag in evidence as `nroas_source: ga4_fallback`.
- When neither BigCommerce nor GA4 can produce reliable per-channel new-customer revenue, report only **account-level nROAS** (total first-time Net sales ÷ total paid spend) and surface a Data Gaps row in the scorecard.

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
