---
name: bigcommerce-audit-v2
description: "Run a BigCommerce store profitability audit — revenue metrics, AOV analysis, customer data, multi-channel revenue — then write a standardized evidence JSON file. Alternative to Shopify audit for BigCommerce clients. Triggers on: 'audit their BigCommerce', 'BigCommerce profitability audit', 'BigCommerce store audit'."
---

# BigCommerce Audit v2 — Financial Source of Truth

**Trigger phrases:** "audit their BigCommerce", "BigCommerce audit for [client]", "profitability audit for [client]", "audit their store data", "store-level profitability", "revenue audit", "order data audit"

**Slash command:** `/audit-bigcommerce` (see `commands/audit-bigcommerce.md`)

---

## Shared References (read once at audit start)

1. `audit-shared/reference/audit-lifecycle.md` — setup, manifest check, playbook loading, closeout, working notes template
2. `audit-shared/reference/evidence-rules.md` — 5-label system (OBSERVED/CALCULATED/INFERENCE/ASSUMPTION/DATA_NOT_AVAILABLE), anti-hallucination rules, data quality standards
3. `audit-shared/reference/evidence-schema-quick.md` — JSON schema structure, raw_metrics keys, priority/severity enums

Follow all procedures in those files. This skill documents only BigCommerce-specific additions.

---

## Role

BigCommerce Control Panel audit as part of modular audit system v2. BigCommerce is the **financial source of truth** — order/revenue data anchors profitability for the entire cross-channel audit. Every platform's "reported revenue" gets validated against BigCommerce actuals.

Interchangeable with Shopify audit: synthesizer treats both as "ecommerce platform" type — financial anchor for MER, CM1/CM2/CM3, break-even CPA, attribution reconciliation.

Output: standardized JSON evidence file for the audit-synthesizer.

---

## Setup Additions (beyond audit-lifecycle.md)

**Platform-specific playbook chunk:**
- `references/measurement.md` — "Ecommerce platform is financial source of truth" section, MER calculation, source-of-truth stack

**Navigation reference:** Read `reference/nav-bigcommerce.md` for Control Panel UI patterns — Analytics section, Orders filtering, date pickers, report generation, export workflows, API fallbacks, known gotchas.

**If no manifest:** Ask for: client name, BigCommerce admin URL, date range preference, whether COGS data is entered in BigCommerce.

---

## Phase Structure

Maintain `{Client}_bigcommerce_audit_notes.md` as scratchpad. Evidence JSON written only after all phases complete.

### Phase 1: Access & Inventory

Navigate to BigCommerce Control Panel → confirm access level (owner/admin/limited) → set date range (default 90 days, or per manifest).

Inventory checklist:
- **Analytics → Overview:** Dashboard loading? Date range controls?
- **Analytics → Merchandising:** Available? (Plan-dependent)
- **Products → Cost field:** COGS entered? Check 3-5 products (Products → edit → Pricing → "Cost")
- **Customers:** Sufficient for cohort analysis? Total count, customer groups configured?
- **Orders → Export:** Can export for date range?
- **Marketing → Promotions:** Active coupon/discount codes?
- **Channel Manager:** Connected channels? (Storefront, Amazon, eBay, social, POS, etc.)
- **Analytics plan tier:** Standard / Pro / Enterprise (affects available reports)

Record all in working notes with this structure:
```
## Access & Inventory
- Access level: [owner/admin/limited]
- Date range: [start] to [end]
- COGS entered: [yes — X% of products / no / partial]
- Customer groups configured: [yes/no — describe]
- Coupon codes active: [count, types]
- Connected channels: [list from Channel Manager]
- Analytics plan tier: [Standard / Pro / Enterprise]
- Data gaps: [anything missing]
```

Flag gaps — determines depth of subsequent phases.

### Phase 2: Revenue & Orders

Pull from **Analytics → Overview** and **Orders**:

1. Full revenue breakdown: gross sales, discounts, refunds, net revenue, taxes, shipping
2. Total orders → AOV = Net Revenue ÷ Total Orders (compare to manifest)
3. **Revenue by channel** via Channel Manager: Storefront + connected channels (Amazon, eBay, Facebook, Instagram, Google Shopping, POS). Key for multi-channel attribution.
4. Revenue by traffic source (if available — BigCommerce built-in attribution is limited, use directional only)
5. Monthly trend for revenue + orders. Flag >20% MoM swings → investigate (seasonal? promo? stockout?)
6. Compare order count trend to revenue trend — divergence = AOV shift

**Key calculations (show formulas):**
- AOV = Net Revenue ÷ Total Orders
- Avg discount/order = Total Discounts ÷ Total Orders
- Return rate = Refunded Orders ÷ Total Orders (or Refund $ ÷ Gross Revenue)
- Net revenue after returns = Gross - Discounts - Refunds

### Phase 3: Product Performance

Pull from **Analytics → Merchandising** (if available) or Products export + Orders:

1. Top 10-15 products by net sales (units, revenue, % of total)
2. Revenue concentration: % from top 3 and top 10. >60% from top 3 = risk signal
3. **Product-level CM1 (if COGS available):** Revenue - COGS per product. Flag CM1 <40%. Flag high-revenue products missing COGS.
4. Products with high return rates (if visible in order data)
5. **Category analysis:** BigCommerce uses categories (NOT collections like Shopify). Revenue distribution across categories — top-performing vs underperforming.
6. Dead inventory: zero/near-zero sales in date range, still active

**If no COGS:** Use vertical estimates from `benchmarks.md`, label all margins ASSUMPTION, add to open_questions.

### Phase 4: Customer Analysis

Pull from **Customers** section and **Analytics**:

1. **New vs returning:** count, revenue split, order split, AOV comparison
2. **Purchase frequency:** 1-order vs 2-order vs 3+ customers, avg orders/customer, time between orders
3. **Repeat purchase rate:** Customers with 2+ orders ÷ Total customers → compare to `benchmarks.md` by vertical
4. **Customer groups (BigCommerce-specific):** BigCommerce supports customer groups (wholesale, VIP, retail, etc.) with per-group pricing and discount rules. Check if groups are configured. Revenue split by customer group can reveal hidden margin dynamics — e.g., wholesale pricing at 40% off retail destroys blended margin even if retail margins look healthy.
5. **LTV estimation:**
   - Simple LTV = AOV × Average Purchase Frequency × Average Customer Lifespan
   - Cohort-based (preferred): Track customers acquired 6-12 months ago, measure cumulative revenue per customer
   - Label CALCULATED if using actual data, INFERENCE if projecting from limited data
6. **CAC context (if ad spend known):**
   - nCPA = Total Ad Spend ÷ New Customer Orders
   - LTV:CAC ratio = LTV ÷ nCPA
   - CAC payback period = nCPA ÷ (Monthly Revenue per Customer × CM1%)
   - Compare all to benchmarks from `benchmarks.md` (CAC Payback section)

If customer data limited: record what IS available, mark gaps DATA_NOT_AVAILABLE, flag in open_questions.

### Phase 5: Profitability Metrics

Synthesize Phases 2-4 into financial anchor metrics:

1. **MER** = Total BC Revenue ÷ Total Marketing Spend. Healthy: 3.0-5.0x. Flag <3.0x.
2. **Blended CPA** = Ad Spend ÷ Total Orders → compare to break-even CPA (AOV × margin%) and target CPA (break-even × 0.65)
3. **Blended ROAS** = Revenue ÷ Paid Ad Spend → compare to minimum (1 ÷ margin%) and target (minimum × 1.4)
4. **CM stack (if data available):**
   - CM1 (Product Margin) = Revenue - COGS
   - CM2 (Fulfillment Margin) = Revenue - COGS - Shipping - Packaging (if available)
   - CM3 (Marketing-Inclusive) = Revenue - COGS - Shipping - Fulfillment - Ad Spend - Payment Processing - Returns
   - CM3 is the only margin that tells if the business is actually profitable
   - Compare to vertical benchmarks from `benchmarks.md`
5. **Discount impact:**
   - Discount rate = Total Discounts ÷ Gross Revenue. >15% = margin erosion risk.
   - Revenue by discount tier: full price vs <10% off vs 10-20% vs 20%+ off
   - Average discount per order
   - Check Marketing → Promotions for cart-level rules and automatic discounts
6. **Refund impact:**
   - Refund rate = Total Refunds ÷ Gross Revenue
   - Compare to vertical benchmarks (apparel 25-40% returns, most DTC 5-15%)
   - Net impact: refunds directly reduce CM1
7. **Attribution reconciliation prep:** Record total BC revenue + order count for exact date range. Synthesizer uses this as denominator for over-attribution ratio. Flag connected Channel Manager channels for double-count risk.

### Phase 6: Write Evidence JSON

Output: `{Client}_bigcommerce_evidence.json` in evidence directory.

Follow schema in `evidence-schema-quick.md`. BigCommerce-specific notes:

- **meta.platform:** `"bigcommerce"`
- **account_overview:** Total Revenue (net), Total Orders, AOV, New Customer %, Returning Customer %, Refund Rate, Discount Rate, MER/Blended CPA/Blended ROAS (if calculable)
- **campaigns[] → use for CHANNELS:** One entry per sales channel (Storefront, Amazon, eBay, etc.) with revenue + order count. Set `type` = channel name, `status` = "Active".
- **tracking_health:** Only if inconsistencies noticed (order count ≠ analytics, duplicates, etc.)
- **diagnosis.primary_constraint:** The single biggest financial insight. Examples: "Margin erosion from coupon dependency", "Revenue concentrated in 2 products", "No retention engine — 90% single-purchase customers", "Healthy margins but CAC payback exceeding 6 months"
- **cross_channel_signals** — critical since BC is financial anchor. Include:
  - Total revenue for synthesizer reconciliation vs platform-claimed sum
  - Returning customer revenue % → check retention channel funding
  - AOV → determines high-ticket vs standard playbook for all platforms
  - Refund rate → platform ROAS doesn't account for this
  - Discount rate → actual margin lower than gross suggests
  - Channel Manager connected channels → verify no double-counted attribution
- **raw_metrics keys:** `product_details`, `customer_details`, `channel_details`

### Phase 7: Closeout

Follow `audit-lifecycle.md` closeout: save evidence JSON, update manifest (if exists), flag critical findings, save working notes.

---

## Evidence Quality Checklist

Per `evidence-rules.md` standards, plus BigCommerce-specific checks:
- [ ] Every OBSERVED metric cites exact BigCommerce Control Panel location
- [ ] Every CALCULATED metric shows formula in source field
- [ ] Revenue numbers are NET (after discounts/returns) unless explicitly labeled gross
- [ ] AOV calculated from net revenue ÷ orders (not gross)
- [ ] Date range in evidence meta matches actual data pulled
- [ ] `cross_channel_signals` includes total revenue + order count for synthesizer reconciliation
- [ ] No numbers invented — gaps use DATA_NOT_AVAILABLE
- [ ] Profitability calculations show work (formula in source field)
- [ ] Product-level data in `raw_metrics.product_details`
- [ ] Channel Manager connected channels documented for multi-channel attribution awareness
- [ ] Channel data in `raw_metrics.channel_details`
- [ ] Customer data in `raw_metrics.customer_details`

---

## Diagnostic Signals

**Revenue:**
- Revenue up + margin down → coupon dependency, channel mix shift, rising returns
- AOV declining → discount escalation, product mix shift, new customer AOV < returning
- Revenue flat + ad spend up → demand saturation or attribution inflation (MER reveals)

**Customer:**
- >85% new customer orders → no retention engine. Flag for Klaviyo cross-check.
- Returning AOV >> new AOV → healthy, but validate first-purchase profitability
- Repeat rate below vertical benchmark → retention problem, cross-ref Klaviyo
- **Customer groups with different pricing → check if wholesale/VIP pricing erodes blended margin**

**Profitability:**
- Healthy gross margin + negative CM3 → hidden costs (shipping, returns, processing)
- Break-even CPA < actual blended CPA → losing money on paid acquisition
- MER <3.0x → structural marketing efficiency problem
- Discount rate >15% → coupon dependency, check if discounted orders still profitable

**Product:**
- Top 3 = >60% revenue → concentration risk
- High-revenue products missing COGS → critical data gap
- Product return rates >2x store average → quality/sizing/expectation mismatch

**Channel (BigCommerce-specific):**
- Multi-channel revenue (Amazon, eBay via Channel Manager) may inflate storefront-only analysis if not separated
- Manual/phone orders in totals → separate; different economics
- Channel Manager connected channels claiming separate attribution → flag for synthesizer reconciliation

---

## Scope Boundaries

**Covers:** BC Control Panel data extraction, revenue/orders/products/customers/coupons/refunds, profitability framework (MER, CM1-3, break-even CPA, blended ROAS), financial anchor for synthesizer, Channel Manager multi-channel breakdown.

**Does NOT cover:** Storefront theme/design → `site-audit-v2` | CRO → `site-audit-v2` | SEO → `site-audit-v2` | Stencil theme code | App/integration stack | Shipping config | Platform-specific ad performance → respective platform audit skill.
