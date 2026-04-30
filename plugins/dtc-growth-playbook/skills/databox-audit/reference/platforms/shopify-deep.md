# Shopify Deep-Dive Reference

**Load this file ONLY when triage scored RED or YELLOW on Shopify.**

Triage has already pulled financial overview (Gross sales, Discounts, Returns, Net sales, Orders, Items, COGS, Gross profit). This file digs into product performance, channel attribution, and customer health.

---

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

## Triage-Level Metrics (pull at triage, before deep-dive runs)

In addition to the standard financial overview metrics (Gross sales, Discounts, Returns, Net sales, Orders, Items, COGS, Gross profit), triage MUST also pull the new-customer split so MER and nROAS can be computed at the cross-platform anchor step.

**Metrics to add at triage:**
- `First-time customers` (or `First-time customer count` — confirm exact metric_key via `list_metrics(data_source_id=shopify_ds_id)`)
- `Returning customers` (or `Returning customer count` — same caveat)
- `First-time customer Net sales` (or `Net sales (first-time customers)` — Shopify Databox typically exposes a first-time-filterable Net sales variant)
- `Returning customer Net sales` (or `Net sales (returning customers)`)

**Calculation:**
- **New customer revenue %** = First-time customer Net sales ÷ Total Net sales
- This feeds **nROAS** = First-time customer Net sales ÷ Total paid spend, computed at the cross-platform anchor step in `triage-pulls.md` and surfaced as a dedicated scorecard row per `synthesizer.md`.

**Fallback:** if Shopify doesn't expose a first-time-filterable Net sales variant, derive it from the Pull 3 "Is returning customer" breakdown using order counts × AOV per cohort. Flag as ESTIMATE in evidence.

---

## Deep-Dive Pulls

### Pull 1: Product Performance (RED: always | YELLOW: margin or return concern)

**Data source:** Shopify (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Gross sales, Orders, Items, Cost of goods sold, Gross profit (include only if populated; drop if null)

**Breakdowns:** Product title, Product type

**Analysis triggers:**
- Top 3 product concentration — Revenue >60% from 3 SKUs? Dependency risk.
- Margin variance by product — Product A at 45% margin, Product B at 15%? Mix shift impact.
- Units per order trend — Items/orders declining? Lower ATV or bundle cannibalization?
- COGS accuracy — Gross profit negative on specific products? Cost data stale or pricing wrong?
- Product type mix — Category A margin declining but driving volume. Strategic trade-off or problem?

**Evidence:** Product ranking by Gross sales, Orders, margin %, margin dollars. Top 10 and bottom 5.

---

### Pull 2: Channel + Traffic Attribution (RED: if revenue gap | YELLOW: discount or channel concern)

**Data source:** Shopify (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Gross sales, Orders, Net sales

**Breakdowns:** Channel, UTM source

**Analysis triggers:**
- Channel revenue split — Organic >60%? Dependency on one channel.
- Discounting by channel — Discount-to-sales ratio by channel. Paid channels using discounts to convert?
- UTM coverage — Unattributed (null UTM) >20%? Tagging gaps or organic traffic spillover.
- Channel order value — AOV variance by channel. Direct orders larger than paid?
- Returns by channel — If available in Shopify: Return rate by acquisition channel.

**Evidence:** Channel summary showing Sales, Orders, Discounts, Net sales, AOV, Discount%. Row for (null UTM) traffic.

---

### Pull 3: Customer Split (RED: if AOV concern | YELLOW: always)

**Data source:** Shopify (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Gross sales, Orders, Customer count (if available; otherwise Orders as proxy)

**Breakdowns:** Is returning customer

**Analysis triggers:**
- Repeat rate — Returning customer orders as % of total. <20% = acquisition-heavy, >40% = mature/repeat-focused.
- AOV by customer type — Returning customer order value vs new. Repeat customers higher or lower?
- LTV signals — If repeat order data available: repeat customers clustering around 2-3x repeat rate?
- Customer acquisition efficiency — High new customer orders but low repeat? Payback period concern.
- Churn risk — Repeat customer count declining month-over-month? Retention problem.

**Evidence:** Customer split table showing New vs Returning orders, customers, revenue, AOV, repeat rate %.

---

### Pull 4: Monthly Trend (RED: if available | YELLOW: conditional, only if lookback >60d)

**Data source:** Shopify (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Gross sales, Discounts, Returns, Net sales, Orders, Items, COGS, Gross profit

**Breakdowns:** (none)

**Time Granularity:** Month

**Analysis triggers:**
- Revenue trajectory — MoM growth or decline? Seasonal pattern?
- Order volume trend — Orders declining while revenue stable? Price increases or bundle mix shift?
- Discount creep — Discount % rising month-over-month? Margin compression signal.
- Margin deterioration — Gross profit % declining even as revenue stable? COGS rising or mix shift?
- Volatility — High variance between months? Seasonal business or unstable demand?

**Evidence:** Monthly summary table showing Sales, Orders, AOV, Discount %, Gross profit %, YoY/MoM change.

---

### Pull 5: New Customer Revenue by Acquisition Channel (conditional — runs when nROAS is being computed at synthesis time)

**Trigger:** Run this pull whenever the synthesizer is computing per-channel nROAS as part of the cross-platform anchor scoring (i.e., whenever Shopify is connected and at least one paid platform was deep-dived). This is the cleanest "is this channel acquiring real new revenue?" diagnostic.

**Data source:** Shopify (use `data_source_id` from cache). Call via `load_metric_data` — one call per metric.

**Metrics:** First-time customer Net sales, First-time customer Orders (or whatever first-time-filterable variants exist in the Shopify Databox metric catalog — verify via `list_metrics(data_source_id=shopify_ds_id)` before pulling).

**Breakdowns:** Marketing channel / UTM source if available; otherwise fall back to Sales channel.

**Output:** per-channel new-customer revenue and per-channel new-customer order count. Combine with paid spend per channel from the cross-platform anchor to compute nROAS per channel:
- **nROAS (per channel)** = First-time customer Net sales (channel) ÷ Paid spend (channel)

**Evidence table:**
| Channel / UTM Source | First-time Net Sales | First-time Orders | Paid Spend | nROAS | % of Total New Customer Revenue |
|---|---|---|---|---|---|

**Data Quality Caveat:**
- This pull requires UTMs on Shopify orders to attribute new-customer revenue to acquisition channel. UTM hygiene is rarely perfect — accounts with `(direct)/(none)` >25% will produce noisy per-channel nROAS.
- **Fallback:** if Shopify can't reliably split new-customer revenue by channel (UTM hygiene poor, or first-time-filterable Net sales not exposed by channel), use **GA4 Pull 6 (New vs Returning by Source/Medium)** as the nROAS denominator instead. Flag in evidence as `nroas_source: ga4_fallback`.
- When neither Shopify nor GA4 can produce reliable per-channel new-customer revenue, report only **account-level nROAS** (total first-time Net sales ÷ total paid spend) and surface a Data Gaps row in the scorecard.

---

## YELLOW Mode Routing

**Margin concern (gross profit declining or <target):**
- Pulls: 1 + 4 (if available)
- Focus: Product margin analysis, COGS accuracy, discount creep, mix shift

**Return rate concern (returns high relative to orders):**
- Pulls: 1 + 2
- Focus: Product-level return rates if available, channel-specific return patterns, quality signal

**Discount concern (discounting >15% of sales):**
- Pulls: 1 + 2 + 4
- Focus: Discount by channel, discount by product, discount trend over time, margin impact

---

## Evidence Output

Build four tables:

**Table 1: Product-Level Performance**
| Product Title | Type | Gross Sales | Orders | Items | AOV | COGS | Gross Profit | Margin % | % of Total Revenue |
|---|---|---|---|---|---|---|---|---|---|

**Table 2: Channel Attribution**
| Channel | Gross Sales | Orders | AOV | Discount $ | Discount % | Net Sales | Variant/Notes |
|---|---|---|---|---|---|---|---|

**Table 3: Customer Cohort Split**
| Cohort | Orders | Revenue | Customers | AOV | % of Total Orders | % of Total Revenue | LTV Signal |
|---|---|---|---|---|---|---|---|

**Table 4: Monthly Trend (if >60d lookback)**
| Month | Gross Sales | Orders | AOV | Discount % | COGS | Gross Profit | Margin % | MoM Sales Change |
|---|---|---|---|---|---|---|---|

---

## Key Calculations

**Blended Metrics (if total ad spend from triage known):**
- **Blended ROAS** = Net sales / Total ad spend
- **Blended CPA** = Total ad spend / Orders (from triage)
- **Break-even CPA** = Gross profit / Orders
- **MER (Marketing Efficiency Ratio)** = Net sales / Total marketing spend

**Product & Mix Analysis:**
- **Revenue concentration** = Top 3 products / Total revenue
- **Mix shift impact** = (This month's margin % - Prior month's margin %) × Total sales
- **Repeat order rate** = Returning customer orders / Total orders
- **Customer payback period** = (Gross profit from new customer / Repeat order rate) / Orders per repeat customer

**Return & Quality Signals:**
- **Return rate** = Returns / Orders (if data available)
- **Net revenue impact** = (Returns × AVP) - Return handling cost

---

## Diagnostic Patterns

**Blended ROAS declining, product performance stable → Channel mix shift**
- Pull 2 shows paid channel revenue dropping, organic rising but with lower margins.
- Action: Reweight paid spend or increase organic conversion focus.

**Margin compression with stable AOV → COGS rising or discount creep**
- Pull 1 + 4: Is COGS up (supplier increase)? Or discount % climbing (Pull 4)?
- Action: Supplier renegotiation or reduce discounting. Check product mix shift in Pull 1.

**Top 3 products >65% of revenue → Dependency risk with margin risk**
- Pull 1 shows concentration. Check: Are these high-margin or low-margin products?
- Action: New product launch or SKU expansion to diversify revenue base.

**Repeat rate <15%, AOV declining → Acquisition-only business, retention problem**
- Pull 3 shows low repeat rate. Pull 4: Are new customer acquisitions accelerating spend for same revenue?
- Action: Launch retention campaign (post-purchase email, loyalty program) or acceptance that model is acquisition-focused.

**Returns spiking on one product → Quality or expectations issue**
- Pull 1: Specific SKU showing high return rate. Check: Product reviews, images, description accuracy.
- Action: Listing quality audit or quality control check.

**Unattributed (null UTM) traffic >25% → Tagging gap or organic spillover**
- Pull 2 shows high (null) row. Are email campaigns or paid campaigns missing UTM?
- Action: Audit all campaign setup for UTM tagging. If organic, expected for brand search.

**Discount % rising, new customer orders climbing → Discounting to acquire, not profitably**
- Pull 2 + 4: Discount % up month-over-month. Pull 3: New customer rate up. Are discounts driving acquisition?
- Action: Test removing discounts or raising price. Calculate blended CPA vs break-even CPA (discount % may exceed margin).

**New customer revenue % <15% of total → Retention is weak OR paid is over-driving repeat buyers**
- Triage-level metric (First-time Net sales ÷ Total Net sales) shows <15%. Combined with healthy MER, this means paid is mostly capturing existing customers — retargeting + branded search are doing the heavy lifting and acquisition has stalled.
- Cross-check: Pull 5 nROAS by channel — if every channel's nROAS is <1.0 while blended ROAS is healthy, paid is cannibalizing organic/repeat demand, not driving incremental growth.
- Action: Shift spend toward TOF / acquisition campaigns. Audit retention engine separately (email/SMS LTV) to confirm whether the low new % is a retention success or an acquisition failure.

**>85% of orders from new customers → Retention engine missing, audit email/SMS separately**
- Triage-level metric (First-time customer Orders ÷ Total Orders) >85%. The brand is one-and-done — every dollar of growth requires a new dollar of acquisition spend, which caps scale.
- Cross-check: Pull 3 repeat purchase rate, Pull 4 monthly trend on returning-customer revenue. If returning revenue is flat-to-declining MoM, retention is broken.
- Action: Trigger a separate Klaviyo / SMS / loyalty audit. Don't try to fix this from the paid side — paid can't compensate for a missing retention engine, only mask the problem temporarily.
