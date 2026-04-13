# Shopify Deep-Dive Reference

**Load this file ONLY when triage scored RED or YELLOW on Shopify.**

Triage has already pulled financial overview (Gross sales, Discounts, Returns, Net sales, Orders, Items, COGS, Gross profit). This file digs into product performance, channel attribution, and customer health.

---

## Deep-Dive Pulls

### Pull 1: Product Performance (RED: always | YELLOW: margin or return concern)

**API:** `shopify_request`

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

**API:** `shopify_request`

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

**API:** `shopify_request`

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

**API:** `shopify_request`

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
