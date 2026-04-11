# Shopify Audit v2 — Financial Source of Truth

**Trigger phrases:** "audit their Shopify", "profitability audit for [client]", "audit their store data", "Shopify audit", "store-level profitability", "revenue audit", "order data audit"

**Slash command:** `/audit-shopify` (see `commands/audit-shopify.md`)

---

## Role

You are performing a Shopify admin audit as part of the modular audit system v2. Shopify is the **financial source of truth** — its order and revenue data anchors profitability calculations for the entire cross-channel audit. Every other platform's "reported revenue" gets validated against Shopify actuals.

Your output is a standardized JSON evidence file that the audit-synthesizer uses to build the profitability framework (MER, CM1/CM2/CM3, break-even CPA, target ROAS) and reconcile platform-reported attribution against real revenue.

---

## Before You Start

Follow **`reference/audit-lifecycle.md`** → Standard Setup (manifest, evidence directory, AOV-conditional playbook chunks).

**Shopify-specific additions:**
- Also load `reference/playbook/measurement.md` — "Shopify is the financial source of truth" section, MER calculation, source-of-truth stack
- If no manifest exists, also ask: whether COGS data is entered in Shopify
- Do NOT load `reference/platform-refs/nav-shopify.md` yet — load it at Phase 1 start (phase-gated)

---

## Phase Structure

Execute phases in order. Maintain working notes per `audit-lifecycle.md` → Working Notes Template. Evidence JSON is the final output — write only after all phases complete.

### Phase 1: Access & Inventory

**Goal:** Confirm access, identify available data, set date range.

**Now load** `reference/platform-refs/nav-shopify.md` for Shopify admin UI patterns and date picker gotchas.

1. Navigate to Shopify admin. Confirm access level (full admin / staff / read-only).
2. Set audit date range (default: last 90 days, or per manifest).
3. Inventory data availability:
   - Analytics → Reports: default + custom reports available?
   - Products → Cost per item: COGS entered? Check 3-5 products for coverage.
   - Customers: sufficient for cohort analysis? (total count, tagging practices)
   - Orders → Export: exportable for date range?
   - Discounts: active codes count and types
4. Record in working notes:
   ```
   ## Access & Inventory
   - Access level: [full/staff/read-only]
   - Date range: [start] to [end]
   - COGS entered: [yes — X% of products / no / partial]
   - Customer tagging: [yes/no — describe]
   - Discount codes active: [count, types]
   - Custom reports available: [list]
   - Data gaps: [anything missing]
   ```

### Phase 2: Revenue & Orders

**Goal:** Extract core financial metrics that anchor everything else.

Pull from Analytics → Reports → Sales (or dashboard):

1. **Full revenue breakdown:** gross sales, discounts, returns, net sales, taxes, shipping
2. **Total orders** + **AOV** = Net Sales ÷ Total Orders
3. **Revenue by channel:** Online Store, POS, Buy Button, draft orders, other. Critical for channel mix.
4. **Revenue by traffic source** (if available in Analytics → Reports → Sessions by referrer): Direct, organic search, social, email, paid. Note: Shopify's attribution is last-click and limited — use for directional signal only, NOT as source of truth for channel attribution.
5. **Revenue trend:** Pull monthly totals. Calculate MoM growth rates. Flag months with >20% swings — investigate (seasonal? promo? stockout?).
6. **Orders trend:** Same monthly breakdown. Compare order count trend to revenue trend — divergence indicates AOV shift.

**Key calculations (show formulas):**
- AOV = Net Sales ÷ Total Orders
- Avg discount/order = Total Discounts ÷ Total Orders
- Return rate = Refunded Orders ÷ Total Orders (or Refund $ ÷ Gross Sales)
- Net revenue after returns = Gross Sales − Discounts − Returns

### Phase 3: Product Performance

**Goal:** Which products drive revenue and margin; which are dead weight.

Pull from Analytics → Reports → Sales by product:

1. **Top 10-15 products** by net sales (include units, revenue, % of total)
2. **Revenue concentration:** % from top 3 and top 10. >60% from top 3 = concentration risk.
3. **Product-level profitability (if COGS available):**
   - CM1 = Revenue − COGS per product. CM1% = CM1 ÷ Revenue.
   - Flag CM1 below 40%. Flag high-revenue products with no COGS.
4. **High-return products:** flag return rates >2× store average
5. **Variant analysis** (if relevant): underperforming sizes/colors = sizing guide issue
6. **Dead inventory:** zero/near-zero sales, still active/published

**If COGS NOT available:**
- Use vertical-specific estimates from `benchmarks.md` (Profitability & Unit Economics)
- Label ALL margin calculations as `ASSUMPTION`
- Add to open_questions: "Client needs to provide COGS for accurate profitability"

### Phase 4: Customer Analysis

**Goal:** New vs returning, purchase frequency, LTV signals.

Pull from Analytics → Reports → Customers + Customers section:

1. **New vs returning customers:**
   - Total customers in date range
   - New customers (first order in range) vs returning (had prior orders)
   - Revenue split: % from new vs returning
   - Order count split: new vs returning
   - AOV comparison: new customer AOV vs returning customer AOV
2. **Purchase frequency:**
   - Customers with 1 order vs 2 orders vs 3+ orders
   - Average orders per customer
   - Time between orders (if calculable from order export)
3. **Repeat purchase rate** = Customers with 2+ orders ÷ Total customers (in a defined cohort window). Compare to `benchmarks.md` by vertical.
4. **LTV estimation (if data sufficient):**
   - Simple: AOV × Avg Purchase Frequency × Avg Customer Lifespan
   - Cohort (preferred): track customers acquired 6-12mo ago, measure cumulative rev/customer
   - Label `CALCULATED` (actual data) or `INFERENCE` (projected from limited data)
5. **CAC context (if total ad spend known from manifest/evidence):**
   - nCPA = Total Ad Spend ÷ New Customer Orders
   - LTV:CAC = LTV ÷ nCPA
   - CAC payback = nCPA ÷ (Monthly Rev per Customer × CM1%)
   - Compare to `benchmarks.md` CAC Payback section

**If customer data is limited** (common in smaller Shopify stores): record what IS available, label gaps `DATA_NOT_AVAILABLE`, flag in open_questions for the synthesizer.

### Phase 5: Profitability Metrics

**Goal:** Build the financial anchor the synthesizer uses for the entire audit.

Synthesizes data from Phases 2-4:

1. **MER** = Total Shopify Revenue ÷ Total Marketing Spend (all channels). Healthy: 3.0-5.0×. Flag <3.0×.
2. **Blended CPA** = Total Ad Spend ÷ Total Shopify Orders. Compare to:
   - Break-even CPA = AOV × gross margin %
   - Target CPA = break-even × 0.65
3. **Blended ROAS** = Total Shopify Revenue ÷ Total Paid Ad Spend. Compare to:
   - Minimum ROAS = 1 ÷ gross margin %
   - Target ROAS = minimum × 1.4
4. **CM1 / CM2 / CM3:**
   - CM1 (Product Margin) = Revenue − COGS
   - CM2 (Fulfillment Margin) = Revenue − COGS − Shipping − Packaging
   - CM3 (Marketing-Inclusive) = Revenue − COGS − Shipping − Fulfillment − Ad Spend − Payment Processing − Returns
   - **CM3 is the only margin that tells if the business is actually profitable**
   - Compare to vertical benchmarks from `benchmarks.md`
5. **Discount impact:** discount rate = Total Discounts ÷ Gross Sales. Revenue by tier (full price / <10% / 10-20% / 20%+). Flag >15% = margin erosion risk.
6. **Refund impact:** refund rate = Refunds ÷ Gross Sales. Compare to vertical (apparel 25-40%, most DTC 5-15%). Refunds directly reduce CM1.
7. **Attribution reconciliation prep:** Record total Shopify revenue + order count for exact date range. This becomes the denominator when the synthesizer compares platform-claimed conversions to Shopify reality.

### Phase 6: Write Evidence JSON

**Goal:** Structure findings into standardized evidence format.

Output: `{Client}_shopify_evidence.json` in the evidence directory.

Follow schema per **`reference/evidence-schema-quick.md`**. Apply labeling rules per **`reference/evidence-rules.md`**.

**Shopify-specific schema notes:**
- `meta.platform`: `"shopify"`
- `account_overview`: Total Revenue (net), Total Orders, AOV, New Customer %, Returning Customer %, Refund Rate, Discount Rate, MER, Blended CPA, Blended ROAS (where calculable)
- `campaigns[]`: Shopify has no campaigns — use for **channels** instead (one entry per sales channel with revenue + orders, `type` = channel name, `status` = "Active")
- `tracking_health`: Only if inconsistencies noticed (order count mismatches, duplicates)
- `diagnosis.primary_constraint`: Single biggest financial insight (e.g., "Margin erosion from discount dependency", "No retention engine — 90% single-purchase customers")
- `cross_channel_signals` — critical since Shopify is financial anchor:
  - Total revenue for synthesizer reconciliation vs platform-claimed sum
  - Returning customer revenue % → is email/retention adequately funded?
  - AOV → determines high-ticket vs standard playbook for all platforms
  - Refund rate → platform ROAS doesn't account for this
  - Discount rate → actual margin lower than gross suggests
- `raw_metrics` keys: `product_details`, `customer_cohort_details`, `channel_details`, `monthly_revenue_details`, `discount_details`

### Phase 7: Closeout

Follow **`reference/audit-lifecycle.md`** → Standard Closeout (save evidence JSON, update manifest, flag criticals, save working notes).

---

## Shopify-Specific Quality Checks

Before finalizing evidence JSON, verify these beyond standard evidence rules:

- [ ] Every `OBSERVED` metric cites exact Shopify admin location (e.g., "Analytics > Reports > Sales by product")
- [ ] Revenue numbers are NET (after discounts + returns) unless explicitly labeled gross
- [ ] AOV calculated from net sales ÷ orders (not gross)
- [ ] Date range in evidence meta matches actual data pulled
- [ ] `cross_channel_signals` includes total revenue + order count for synthesizer reconciliation
- [ ] Profitability calculations show work (formula in source field)
- [ ] Product-level data is in `raw_metrics.product_details`
- [ ] No numbers invented — gaps use `DATA_NOT_AVAILABLE`

---

## Diagnostic Signals

Flag these patterns in findings when observed:

**Revenue signals:**
- Revenue growing but margin shrinking → check discount dependency, channel mix shift, or rising returns
- AOV declining over time → discount escalation, product mix shifting to lower-price items, or new customer AOV lower
- Revenue flat despite increasing ad spend → demand saturation or attribution inflation (MER reveals this)

**Customer signals:**
- >85% orders from new customers → no retention engine; flag for Klaviyo cross-check
- Returning customer AOV significantly higher than new → healthy, but validate first-purchase profitability
- Repeat purchase rate below vertical benchmark → retention problem; cross-reference Klaviyo evidence

**Profitability signals:**
- Gross margin healthy but CM3 negative → hidden costs (shipping, returns, processing) eating profit
- Break-even CPA < actual blended CPA → losing money on every paid-acquired order
- MER below 3.0× → structural marketing efficiency problem (may not be one channel)
- Discount rate >15% of gross sales → discount dependency eroding margins

**Product signals:**
- Top 3 products = >60% of revenue → concentration risk (one SKU decline = major hit)
- High-revenue products with no COGS → can't assess profitability; critical data gap
- Products with return rates >2× store average → quality, sizing, or expectation mismatch

**Channel signals:**
- Draft order revenue >10% of total → manual/wholesale orders may inflate online metrics
- POS revenue mixed with online → separate in analysis (different economics)

---

## Scope Boundaries

**Covers:** Shopify admin data extraction, revenue/orders/products/customers/discounts/refunds, profitability framework (MER, CM1/CM2/CM3, break-even CPA, blended ROAS), financial anchor for synthesizer.

**Does NOT cover:** Theme/design, CRO, SEO → `site-audit-v2`. App stack, shipping config → out of scope for v2. Platform-specific ad performance → respective platform audit skill.
