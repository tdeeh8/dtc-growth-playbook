# Shopify Audit v2 — Financial Source of Truth

**Trigger phrases:** "audit their Shopify", "profitability audit for [client]", "audit their store data", "Shopify audit", "store-level profitability", "revenue audit", "order data audit"

**Slash command:** `/audit-shopify` (see `commands/audit-shopify.md`)

---

## Role

You are performing a Shopify admin audit as part of the modular audit system v2. Shopify is the **financial source of truth** — its order and revenue data anchors profitability calculations for the entire cross-channel audit. Every other platform's "reported revenue" gets validated against Shopify actuals.

Your output is a standardized JSON evidence file that the audit-synthesizer uses to build the profitability framework (MER, CM1/CM2/CM3, break-even CPA, target ROAS) and reconcile platform-reported attribution against real revenue.

---

## Before You Start

### 1. Read the Audit Manifest

Check for an existing manifest in the client's evidence directory:
- **{Agency} clients:** `{Agency}/reports/{Client-Name}/evidence/{Client}_audit_manifest.md`
- **{Own Brand}:** `{Own-Brand}/reports/evidence/{OwnBrand}_audit_manifest.md`

From the manifest, extract:
- **Client name** and business type/vertical
- **AOV tier** (Over $200 / $100-200 / Under $100)
- **Known monthly revenue** (if pre-filled)
- **Known monthly ad spend** (for MER calculation later)
- **Focus areas** flagged by the AM
- **Which other platform audits are done** (check for cross-channel signals that need Shopify validation)

If no manifest exists, this is a standalone audit. Ask the user for: client name, Shopify admin URL, date range preference, and whether COGS data is entered in Shopify.

### 2. Load Playbook Chunks

**Always load:**
- `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` — Website/ecom benchmarks section + profitability math + CM1/CM2/CM3 framework
- `${CLAUDE_PLUGIN_ROOT}/references/measurement.md` — "Shopify is the financial source of truth" section, MER calculation, source-of-truth stack

**Conditional loading:**
- AOV $200+ → also load `${CLAUDE_PLUGIN_ROOT}/references/high-ticket.md`
- AOV under $100 → also load `${CLAUDE_PLUGIN_ROOT}/references/low-ticket.md`

### 3. Load Navigation Reference

Read `reference/nav-shopify.md` for Shopify admin UI patterns — date pickers, report generation, custom reports, export workflows, and known gotchas.

---

## Phase Structure

Execute these phases in order. Maintain working notes in `{Client}_shopify_audit_notes.md` as a scratchpad throughout. The evidence JSON is the final structured output — write it only after all phases complete.

### Phase 1: Access & Inventory

**Goal:** Confirm access level, identify what data is available, set the date range.

Steps:
1. Navigate to Shopify admin (URL from manifest or user).
2. Confirm access level: full admin, staff (limited), or read-only. Record in evidence meta.
3. Set the audit date range. Default: last 90 days. If the manifest specifies a range, use that. See `nav-shopify.md` for date picker patterns.
4. Inventory what's available:
   - **Analytics → Reports:** Which default reports exist? Any custom reports already built?
   - **Products → Cost per item:** Is COGS data entered? (Products → select a product → Pricing → "Cost per item" field). Check 3-5 products to assess coverage.
   - **Customers:** Is customer data sufficient for cohort analysis? (Check total customer count, tagging practices)
   - **Orders → Export:** Can we export orders for the date range?
   - **Discounts:** Are discount codes actively used? Check Discounts page for active codes.
5. Record data availability in working notes. Flag anything missing — this determines which phases can go deep vs. surface-level.

**Write to working notes:**
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

**Goal:** Extract the core financial metrics that anchor everything else.

Pull from **Analytics → Reports → Sales** (or Analytics dashboard):

1. **Total revenue** for the date range (gross sales, discounts, returns, net sales, taxes, shipping — get the full breakdown)
2. **Total orders** for the date range
3. **AOV calculation:** Net Sales ÷ Total Orders. Compare to manifest AOV if provided.
4. **Revenue by channel:** Online store, POS (if applicable), Buy Button, draft orders, other channels. This is critical — it shows what percentage of revenue comes from which source.
5. **Revenue by traffic source** (if available in Analytics → Reports → Sessions by referrer): Direct, organic search, social, email, paid. Note: Shopify's attribution is last-click and limited — use for directional only, not as source of truth for channel attribution.
6. **Revenue trend:** Pull monthly totals for the date range. Calculate MoM growth rates. Flag any months with >20% swings — investigate (seasonal? promo? stockout?).
7. **Orders trend:** Same monthly breakdown. Compare order count trend to revenue trend — divergence indicates AOV shift.

**Key calculations (show formulas):**
- AOV = Net Sales ÷ Total Orders
- Average discount per order = Total Discounts ÷ Total Orders
- Return rate = Refunded Orders ÷ Total Orders (or Refund Amount ÷ Gross Sales)
- Net revenue after returns = Gross Sales - Discounts - Returns

**Write to working notes** with all raw numbers and sources.

### Phase 3: Product Performance

**Goal:** Identify which products drive revenue and margin, which are dead weight.

Pull from **Analytics → Reports → Sales by product** (or Products → export):

1. **Top products by revenue:** Top 10-15 products ranked by net sales. Include units sold, revenue, and % of total revenue.
2. **Revenue concentration:** What % of revenue comes from top 3 products? Top 10? High concentration (>60% from top 3) = risk signal.
3. **Product-level profitability (if COGS available):**
   - For each top product: Revenue - COGS = CM1 (Product Margin)
   - CM1 % = CM1 ÷ Revenue
   - Flag any products with CM1 below 40% (most DTC verticals need 50%+ gross margin)
   - Flag any high-revenue products with no COGS entered
4. **Products with high return rates:** If visible in order data, flag products where return rate exceeds category average.
5. **Variant analysis (if relevant):** For products with many variants (sizes, colors), check if specific variants underperform. High returns on specific sizes = sizing guide issue.
6. **Dead inventory signals:** Products with zero or near-zero sales in the date range that are still active/published.

**If COGS is NOT available:**
- Use vertical-specific COGS estimates from `benchmarks.md` (Profitability & Unit Economics section)
- Label all margin calculations as ASSUMPTION
- Add to open_questions: "Client needs to provide COGS for accurate profitability analysis"

**Write to working notes** with product tables and margin calculations.

### Phase 4: Customer Analysis

**Goal:** Understand customer composition — new vs returning, purchase frequency, LTV signals.

Pull from **Analytics → Reports → Customers** and **Customers** section:

1. **New vs returning customers:**
   - Total customers in date range
   - New customers (first order in date range) vs returning (had prior orders)
   - Revenue split: what % from new vs returning
   - Order count split: new vs returning
   - AOV comparison: new customer AOV vs returning customer AOV
2. **Purchase frequency (if data sufficient):**
   - Customers with 1 order vs 2 orders vs 3+ orders
   - Average orders per customer
   - Time between orders (if calculable from order export)
3. **Repeat purchase rate:**
   - Formula: Customers with 2+ orders ÷ Total customers (in a defined cohort window)
   - Compare to benchmarks from `benchmarks.md` (Repeat Purchase Rate section — varies by vertical)
4. **LTV estimation (if data sufficient):**
   - Simple LTV = AOV × Average Purchase Frequency × Average Customer Lifespan
   - If cohort data available: track a cohort (customers acquired 6-12 months ago) and measure cumulative revenue per customer
   - Label as CALCULATED if using actual data, INFERENCE if projecting from limited data
5. **Customer acquisition cost context:**
   - If total ad spend is known (from manifest or other evidence files): nCPA = Total Ad Spend ÷ New Customer Orders
   - LTV:CAC ratio = LTV ÷ nCPA
   - CAC payback period = nCPA ÷ (Monthly Revenue per Customer × CM1%)
   - Compare to benchmarks from `benchmarks.md` (CAC Payback section)

**If customer data is limited (common in smaller Shopify stores):**
- Record what IS available
- Label gaps as DATA_NOT_AVAILABLE
- Flag in open_questions for the synthesizer

**Write to working notes** with customer metrics and cohort analysis.

### Phase 5: Profitability Metrics

**Goal:** Build the financial anchor — the numbers the synthesizer uses for the entire audit's profitability framework.

This phase SYNTHESIZES data from Phases 2-4 into the metrics the synthesizer needs:

1. **MER calculation (if total ad spend known):**
   - MER = Total Shopify Revenue ÷ Total Marketing Spend (all channels)
   - Healthy benchmark: 3.0-5.0x (from `measurement.md`)
   - Flag if below 3.0x
2. **Blended CPA:**
   - Blended CPA = Total Ad Spend ÷ Total Shopify Orders
   - Compare to break-even CPA: AOV × gross margin %
   - Compare to target CPA: break-even CPA × 0.65
3. **Blended ROAS:**
   - Blended ROAS = Total Shopify Revenue ÷ Total Paid Ad Spend
   - Compare to minimum ROAS: 1 ÷ gross margin %
   - Compare to target ROAS: minimum × 1.4
4. **CM1 / CM2 / CM3 (if data available):**
   - CM1 (Product Margin) = Revenue - COGS
   - CM2 (Fulfillment Margin) = Revenue - COGS - Shipping - Packaging (if available)
   - CM3 (Marketing-Inclusive) = Revenue - COGS - Shipping - Fulfillment - Ad Spend - Payment Processing - Returns
   - CM3 is the only margin that tells if the business is actually profitable
   - Compare to vertical benchmarks from `benchmarks.md`
5. **Discount impact analysis:**
   - Total discount amount ÷ Gross sales = Discount rate
   - Revenue by discount tier: full price vs <10% off vs 10-20% vs 20%+ off
   - Average discount per order
   - If discount rate >15% of gross sales, flag as margin erosion risk
6. **Return/refund impact:**
   - Total refund amount ÷ Gross sales = Refund rate
   - Net impact on margins: refunds directly reduce CM1
   - Compare to vertical benchmarks (apparel 25-40% returns, most DTC 5-15%)
7. **Attribution reconciliation prep:**
   - Record total Shopify revenue and order count for the exact date range
   - This becomes the denominator when the synthesizer compares platform-claimed conversions to Shopify reality
   - Flag: "Platform sum vs Shopify actual" — the synthesizer will calculate the over-attribution ratio

**Write to working notes** with all profitability calculations, formulas shown.

### Phase 6: Write Evidence JSON

**Goal:** Structure all findings into the standardized evidence format.

Output file: `{Client}_shopify_evidence.json`
Location: Same evidence directory as the manifest.

Follow the schema in `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json` exactly.

**Shopify-specific schema notes:**

- **meta.platform:** Must be `"shopify"`
- **account_overview:** Include: Total Revenue (net), Total Orders, AOV, New Customer %, Returning Customer %, Refund Rate, Discount Rate, MER (if calculable), Blended CPA (if calculable), Blended ROAS (if calculable)
- **campaigns:** Shopify doesn't have campaigns. Use this array for **channels** instead — one entry per sales channel (Online Store, POS, Draft Orders, etc.) with revenue and order count per channel. Set `type` to the channel name, `status` to "Active".
- **tracking_health:** Not primary for Shopify. Include only if tracking inconsistencies noticed (e.g., order count doesn't match analytics, duplicate orders).
- **findings:** Key observations from Phases 2-5. Each finding must have evidence with specific numbers and source locations.
- **anomalies:** Unexpected patterns — revenue spikes/drops, AOV anomalies, unusual discount patterns, products with abnormal return rates.
- **diagnosis.primary_constraint:** The single biggest financial insight (e.g., "Margin erosion from discount dependency", "Revenue concentrated in 2 products", "No retention engine — 90% single-purchase customers", "Healthy margins but CAC payback exceeding 6 months").
- **opportunities:** Specific, actionable recommendations with estimated impact. Prioritize by impact on profitability.
- **cross_channel_signals:** Critical for Shopify since it's the financial anchor. Flag signals like:
  - "Shopify shows $X total revenue — synthesizer should compare to sum of platform-claimed revenue"
  - "Returning customers generate X% of revenue — check if email/retention channels are adequately funded"
  - "AOV is $X — this determines high-ticket vs standard playbook for all platforms"
  - "Refund rate is X% — platform ROAS doesn't account for this"
  - "Discount rate is X% — actual margin is lower than gross margin suggests"
- **open_questions:** Missing data, COGS gaps, questions for the client/AM.
- **raw_metrics:** Include:
  - `product_details`: Top products with revenue, units, COGS, margin
  - `channel_details`: Revenue by channel (custom key — schema allows additional keys)
  - `customer_cohort_details`: New vs returning breakdown (custom key)
  - `monthly_revenue_details`: Monthly revenue trend data (custom key)
  - `discount_details`: Discount usage breakdown (custom key)

**Evidence labeling rules:**
- Revenue, orders, refunds from Shopify admin → OBSERVED (source: "Shopify Admin > Analytics > Reports > [report name]")
- AOV, rates, percentages you calculated → CALCULATED (source: show formula, e.g., "$45,230 / 892 orders = $50.71")
- Margin estimates using benchmark COGS → ASSUMPTION (source: "benchmarks.md vertical estimate — client COGS not available")
- LTV projections from limited data → INFERENCE (source: explain projection method)
- Data you tried to find but couldn't → DATA_NOT_AVAILABLE (source: explain what was attempted)

### Phase 7: Update Manifest

If an audit manifest exists, update the Shopify row:
- Status: `DONE`
- Evidence File: `{Client}_shopify_evidence.json`
- Date Completed: today's date
- Session: current session reference

If no manifest exists (standalone audit), skip this step.

---

## Evidence Quality Checklist

Before finalizing the evidence JSON, verify:

- [ ] Every `OBSERVED` metric has a `source` citing the exact Shopify admin location
- [ ] Every `CALCULATED` metric shows the formula in `source`
- [ ] Every `ASSUMPTION` is explicitly labeled and explains what was assumed
- [ ] Revenue numbers are NET (after discounts and returns) unless explicitly labeled as gross
- [ ] AOV is calculated from net sales ÷ orders (not gross)
- [ ] Date range in evidence meta matches the actual data pulled
- [ ] `cross_channel_signals` includes the total revenue + order count the synthesizer needs for reconciliation
- [ ] No numbers are invented — gaps use DATA_NOT_AVAILABLE
- [ ] Profitability calculations show work (formula in source field)
- [ ] Product-level data is in `raw_metrics.product_details` for the synthesizer

---

## Diagnostic Signals (What to Watch For)

These are patterns that indicate specific problems. Flag them in findings when observed:

**Revenue signals:**
- Revenue growing but margin shrinking → Check discount dependency, channel mix shift, or rising return rates
- AOV declining over time → Check discount escalation, product mix shifting to lower-price items, or new customer AOV lower than returning
- Revenue flat despite increasing ad spend → Demand saturation or attribution inflation (MER will reveal this)

**Customer signals:**
- >85% of orders from new customers → No retention engine. Flag for synthesizer to check email/Klaviyo evidence.
- Returning customer AOV significantly higher than new → Healthy signal, but validate that acquisition is still profitable on first purchase
- Repeat purchase rate below vertical benchmark → Retention problem. Cross-reference with Klaviyo evidence.

**Profitability signals:**
- Gross margin looks healthy but CM3 is negative → Hidden costs (shipping, returns, payment processing) eating profit
- Break-even CPA lower than actual blended CPA → Losing money on every order acquired through paid channels
- MER below 3.0x → Overall marketing efficiency problem. Not necessarily one channel — could be structural.
- Discount rate >15% of gross sales → Discount dependency eroding margins. Check if promo-driven revenue would still be profitable at discounted price.

**Product signals:**
- Top 3 products = >60% of revenue → Concentration risk. One product going out of stock or declining = major revenue hit.
- High-revenue products with no COGS entered → Can't assess profitability. Flag as critical data gap.
- Products with return rates >2x the store average → Quality, sizing, or expectation mismatch.

**Channel signals:**
- Draft order revenue >10% of total → Significant revenue from manual/wholesale orders. May inflate online store metrics if not separated.
- POS revenue mixed with online → Separate in analysis. Different customer behavior and economics.

---

## Working Notes Format

Maintain `{Client}_shopify_audit_notes.md` as a scratchpad during the audit. Structure:

```markdown
# {Client} — Shopify Audit Working Notes

**Date:** YYYY-MM-DD
**Auditor:** Claude (v2 system)
**Status:** IN PROGRESS / COMPLETE

## Access & Inventory
[Phase 1 notes]

## Revenue & Orders
[Phase 2 raw data + calculations]

## Product Performance
[Phase 3 tables + margin calculations]

## Customer Analysis
[Phase 4 cohort data + LTV calculations]

## Profitability Metrics
[Phase 5 synthesis calculations]

## Flags for Synthesizer
[Key signals the synthesizer must pick up]

## Open Questions
[Unresolved items]
```

Save working notes to the same evidence directory as the evidence JSON. These are NOT client-facing — they're the audit trail.

---

## Scope Boundaries

**This skill covers:**
- Shopify admin data extraction and analysis
- Revenue, orders, products, customers, discounts, refunds
- Profitability framework metrics (MER, CM1/CM2/CM3, break-even CPA, blended ROAS)
- Financial anchor data for the synthesizer

**This skill does NOT cover:**
- Shopify theme/design assessment → That's `site-audit-v2`
- Shopify conversion rate optimization → That's `site-audit-v2`
- Shopify SEO → That's `site-audit-v2`
- App stack assessment → Out of scope for v2
- Shipping configuration optimization → Out of scope for v2
- Platform-specific ad performance → That's the respective platform audit skill
