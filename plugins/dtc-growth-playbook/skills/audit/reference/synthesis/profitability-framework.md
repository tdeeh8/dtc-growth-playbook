# Profitability Framework

Full-funnel profitability analysis methodology for audit reports. This framework answers the question ROAS alone cannot: "Is this business actually making money from its marketing spend?"

> **Platform note:** This framework references "Shopify" as the ecommerce platform source of truth. BigCommerce is fully interchangeable — wherever this document says "Shopify evidence," the same logic applies to BigCommerce evidence. The synthesizer treats both as the financial anchor for MER, CM1/CM2/CM3, and break-even calculations.

---

## Why ROAS Isn't Enough

A brand can have a 5x ROAS and still be losing money. ROAS only measures ad spend efficiency in isolation — it ignores COGS, shipping, fulfillment, returns, payment processing, and overhead. The Contribution Margin framework captures the full picture.

Common "good ROAS, bad profit" scenarios:
- High return rates (apparel: 25-40%) that ROAS doesn't account for
- Discount stacking eroding true transaction margin
- Hidden fulfillment costs not allocated to unit economics
- CAC loaded entirely to first purchase instead of amortized over LTV
- Agency retainers, creative production, and tools not in ROAS denominator

---

## The CM1/CM2/CM3 Framework

Three progressive margin layers, each adding more real-world costs:

### CM1: Product Margin

```
CM1 = Revenue - COGS
CM1% = CM1 / Revenue
```

What it tells you: Can you make money selling this product before any other costs? If CM1% is below 40% for DTC, the business model is structurally challenged — there's almost no room for marketing and fulfillment.

**Data sources:**
- Revenue: Shopify/BigCommerce evidence → `account_overview` (OBSERVED)
- COGS: Shopify/BigCommerce evidence → product cost data, OR client-provided (OBSERVED if available)
- If COGS unavailable: Use vertical estimates (ASSUMPTION)

### CM2: Fulfillment Margin

```
CM2 = CM1 - Shipping Costs - Packaging Costs - Pick/Pack Labor
CM2% = CM2 / Revenue
```

What it tells you: Can you profitably get the product to the customer? Brands with heavy/bulky products or premium packaging often have CM2 problems invisible in ROAS.

**Data sources:**
- Shipping: Shopify evidence → shipping cost data, or client-provided
- Packaging + labor: Usually client-provided. If unavailable, estimate 3-8% of revenue (ASSUMPTION).

### CM3: Marketing-Inclusive Margin (The Truth Metric)

```
CM3 = CM2 - Total Marketing Spend - Payment Processing - Returns/Refunds Cost
CM3% = CM3 / Revenue
```

What it tells you: Is the business actually profitable after paying for everything? This is the only margin that answers the real question.

**Data sources:**
- Marketing spend: Sum of all platform evidence `account_overview` spend values (OBSERVED/CALCULATED)
- Payment processing: Typically 2.9% + $0.30 per transaction (Shopify Payments). Use 3% of revenue if exact figure unavailable (ASSUMPTION).
- Returns: Shopify evidence → refund data if available. Otherwise estimate by vertical (ASSUMPTION).

**CM3 target benchmarks by vertical:**

| Vertical | CM3% Target | Below This = Problem |
|----------|-------------|---------------------|
| Apparel/Fashion | 20-35% | <15% |
| Beauty/Skincare | 25-40% | <20% |
| Food/Consumables | 30-45% | <25% |
| Home Goods | 18-32% | <12% |
| Electronics | 15-25% | <10% |
| Supplements | 30-50% | <20% |

---

## COGS Estimation (When Client Won't Share)

If actual COGS is not available, use these vertical-specific estimates. **Always label as ASSUMPTION.**

| Vertical | Estimated COGS % of Revenue | Notes |
|----------|----------------------------|-------|
| Apparel/Fashion | 35-45% | Higher end for premium/sustainable fabrics |
| Beauty/Skincare | 25-35% | Lower end for high-margin DTC brands |
| Food/Consumables | 30-40% | Higher for perishable, lower for shelf-stable |
| Home Goods | 35-50% | Wide range — depends on materials |
| Electronics | 50-70% | Structurally lower margin |
| Supplements | 15-30% | One of the highest-margin DTC categories |

**Usage rule:** Pick the midpoint of the range as the default estimate. Show sensitivity: "At {low}% COGS, break-even CPA = ${X}. At {high}% COGS, break-even CPA = ${Y}. Actual COGS determines which scenario applies."

**Always include this callout when using COGS estimates:**
> "COGS not provided by client. Using industry estimate of {X}% for {vertical}. All margin and profitability calculations below are ASSUMPTION-labeled. Request actual COGS data from client to validate. If actual COGS differs by more than 5 percentage points, break-even thresholds and profitability conclusions may change significantly."

---

## Break-Even and Target Metrics

These are the client-specific thresholds that determine whether platform performance is actually profitable — more important than industry benchmark comparisons.

### Break-Even CPA

```
Break-even CPA = AOV × Gross Margin %
```

The maximum you can pay to acquire a customer and not lose money on the first purchase. Every dollar above this is a loss (unless LTV justifies it).

Example: $120 AOV × 55% margin = $66 break-even CPA.

### Target CPA

```
Target CPA = Break-even CPA × 0.60 - 0.70
```

The CPA you should aim for to leave room for overhead, profit, and variability. The multiplier depends on business maturity:
- 0.60 for early-stage (needs profit buffer)
- 0.65 for growth-stage (standard)
- 0.70 for mature brands with strong LTV data (can afford tighter margin on first purchase)

Example: $66 break-even × 0.65 = $43 target CPA.

### Minimum ROAS

```
Minimum ROAS = 1 / Gross Margin %
```

The ROAS required to break even on ad spend alone (before fulfillment, processing, etc.). This is the absolute floor.

Example: 1 / 0.55 = 1.82x minimum ROAS.

### Target ROAS

```
Target ROAS = Minimum ROAS × 1.3 - 1.5
```

The ROAS that supports profitable growth after all costs. The multiplier depends on how much of the cost structure is captured in COGS:
- 1.3x if COGS includes most variable costs
- 1.5x if COGS is just product cost (shipping, fulfillment separate)

Example: 1.82x × 1.4 = 2.55x target ROAS.

---

## MER (Marketing Efficiency Ratio)

```
MER = Total Ecommerce Platform Revenue (Shopify or BigCommerce) / Total Marketing Spend (all channels)
```

The single most honest metric for overall marketing efficiency. It bypasses all platform attribution problems because it uses only numbers you fully control: how much revenue came in, how much you spent on marketing.

### MER Benchmarks

| MER | Rating | Interpretation |
|-----|--------|---------------|
| <2.0x | Critical | Spending more than half of revenue on marketing. Unsustainable unless high LTV. |
| 2.0-3.0x | Struggling | Tight margins. Viable only with strong retention or high LTV. |
| 3.0-5.0x | Healthy | Standard for profitable DTC brands. |
| 5.0-8.0x | Strong | Efficient marketing or strong organic/brand presence. |
| 8.0x+ | Excellent | Either very efficient or potentially under-investing in growth. |

### MER Calculation in the Synthesizer

**Numerator:** Ecommerce platform total revenue from Shopify or BigCommerce evidence → `account_overview` total revenue. If no ecommerce platform evidence, use the best available proxy (GA4 revenue, or sum of platform revenue as last resort — label ASSUMPTION).

**Denominator:** Sum of total spend from ALL platform evidence files. Include:
- Google Ads spend
- Meta Ads spend
- Amazon Ads spend
- TikTok Ads spend
- Any other paid platform spend
- Klaviyo costs (if available — often excluded since Klaviyo pricing is subscription-based, not spend-based)

**What to include in "total marketing spend":**
- All paid ad spend (required)
- Agency retainers (if known — usually not in evidence files, note as excluded)
- Creative production costs (if known — usually not in evidence files, note as excluded)
- Attribution/analytics tool costs (if known — usually excluded)

For audit purposes, MER typically uses only ad platform spend in the denominator (what's available in evidence files). Note this: "MER calculated using platform ad spend only. Full loaded MER (including agency fees, creative production, tools) would be lower."

### MER Trend Analysis

MER at a single point in time is useful. MER over time is more useful. When evidence files span different periods or when historical data is available:

- **MER improving:** Business is becoming more efficient. Either revenue growing faster than spend, or spend is being better allocated.
- **MER flat:** Steady state. Scale and efficiency are balanced.
- **MER declining while platform ROAS is stable:** Attribution inflation. Platforms are claiming more credit while actual efficiency drops. This is the classic "good ROAS, bad profit" signal at the business level.
- **MER declining AND platform ROAS declining:** Real performance problem across the board.

---

## "Good ROAS but Bad Profit" Detection

This is the most common profitability trap in DTC. Run these checks whenever platform ROAS looks healthy but you suspect (or can calculate) that the business isn't profitable.

### Check 1: Return Rate Impact

```
Effective Revenue = Gross Revenue × (1 - Return Rate)
Adjusted ROAS = Effective Revenue / Ad Spend
```

If return rate is 30% (common in apparel), a 4x ROAS becomes a 2.8x effective ROAS. Below minimum ROAS for many brands.

Data source: Shopify evidence → refund data. If unavailable, flag and use vertical estimates:
- Apparel: 25-40% returns
- Beauty: 5-10% returns
- Electronics: 10-20% returns
- Food/Consumables: <5% returns
- Supplements: 8-15% returns

### Check 2: Discount Stacking

```
Effective AOV = Gross AOV × (1 - Average Discount %)
```

If average discount is 20% and AOV is $100, effective AOV is $80. Break-even CPA recalculates from the lower AOV.

Data source: Shopify evidence → discount data. Check: what % of orders used a discount code? What's the average discount depth?

Revenue segmentation (if available): full price vs. 10% off vs. 20%+ off vs. 30%+ off. Brands with >50% of revenue from 20%+ discounts have a structural margin problem.

### Check 3: Fulfillment Cost Allocation

```
True CPA = Ad Spend CPA + (Shipping + Packaging + Pick-Pack) per Order
```

A $40 CPA becomes $55 true CPA when shipping ($8), packaging ($3), and pick-pack ($4) are added. Compare true CPA to break-even CPA.

### Check 4: Payment Processing

```
Processing Cost per Order = AOV × 0.029 + $0.30 (Shopify Payments standard; BigCommerce: varies by gateway — use actual rate if known, or 2.9% + $0.30 as default ASSUMPTION)
```

At $100 AOV, this is $3.20 per order. Not huge, but it compounds with other hidden costs.

### Check 5: Agency and Tool Overhead

Typically not in evidence files, but ask: "What's the monthly agency retainer? What are total tool/software costs?" These reduce effective margin.

```
Overhead Per Order = Monthly Overhead / Monthly Orders
Full CPA = Ad CPA + Fulfillment Per Order + Processing Per Order + Overhead Per Order
```

### Detection Summary

Run the full check when any of these triggers appear:
- Platform ROAS > minimum ROAS but client reports "we're not profitable"
- MER < minimum ROAS while platform ROAS > minimum ROAS
- CM3% is negative despite healthy platform metrics
- High discount usage (>40% of orders discounted)
- High return rate vertical (apparel, fashion)

---

## CAC Payback Period

```
CAC Payback (months) = Fully Loaded CAC / Monthly Contribution Margin per Customer
```

**Fully Loaded CAC** includes: ad spend + creative production + agency fees + attribution tools + platform overhead. For audit purposes, typically approximated as: total ad spend / new customer orders.

**Monthly Contribution Margin per Customer** = (AOV × Purchase Frequency per Month × CM3%). Requires repeat purchase data from Shopify.

### Payback Benchmarks

| Payback Period | Rating | Action |
|----------------|--------|--------|
| Under 3 months | Excellent | Scale aggressively — cash cycle supports growth |
| 3-6 months | Healthy | Sustainable with adequate cash reserves |
| 6-12 months | Caution | Requires external capital or retention improvements |
| Beyond 12 months | Unsustainable | Fix unit economics before scaling |

### By Vertical

| Vertical | Healthy Payback | Notes |
|----------|----------------|-------|
| Consumables (supplements, food, pet) | 4-8 weeks | Natural replenishment cycle |
| Beauty/Skincare | 6-12 weeks | Usage frequency drives repeats |
| Apparel/Fashion | 8-16 weeks | Seasonal, style-driven |
| Home Goods | 12-20 weeks | Infrequent replenishment |
| High-Ticket ($500+) | Up to 12 months | Expected — longer consideration |

### When Payback Data Isn't Available

If Shopify evidence doesn't include repeat purchase data or LTV metrics, note: "CAC payback calculation requires repeat purchase frequency and customer lifespan data from Shopify. Not available in current evidence. Request cohort analysis from client or recommend Lifetimely/Polar Analytics for automated LTV tracking."

---

## LTV:CAC Ratio

```
LTV:CAC = (AOV × Purchase Frequency/Year × Customer Lifespan Years × Gross Margin %) / Fully Loaded CAC
```

| LTV:CAC | Rating | Notes |
|---------|--------|-------|
| Below 2:1 | Unsustainable | Losing money on customer acquisition |
| 2-3:1 | Marginal | Viable only with high volume or improving retention |
| 3-4:1 | Healthy | Standard benchmark for profitable DTC |
| 4-5:1 | Strong | Efficient growth |
| 5:1+ | Excellent | Very efficient OR under-investing in growth |

**Always pair LTV:CAC with payback period.** A 5:1 ratio with 24-month payback is cash-negative for 2 years. A 2.5:1 ratio with 3-month payback is more practically profitable.

**DTC vs. SaaS caution:** Most LTV:CAC benchmarks come from SaaS (60-90% margins). DTC margins are 20-30%. A "healthy" 3:1 in SaaS is not the same as 3:1 in DTC — the cash flow dynamics are completely different. Weight payback period more heavily than LTV:CAC for DTC brands.

---

## Profitability Analysis Decision Tree

Use this to determine which profitability analysis to run based on available data:

```
Ecommerce platform evidence exists? (Shopify or BigCommerce)
├── YES → Use ecommerce platform revenue as source of truth
│   ├── COGS available?
│   │   ├── YES → Full CM1/CM2/CM3 analysis [CALCULATED]
│   │   └── NO → Use vertical COGS estimate [ASSUMPTION]
│   │       └── Show sensitivity range (low/mid/high COGS)
│   ├── Repeat purchase data available?
│   │   ├── YES → Calculate CAC payback + LTV:CAC
│   │   └── NO → Note limitation, recommend LTV tool
│   └── Refund/return data available?
│       ├── YES → Include return-adjusted ROAS
│       └── NO → Estimate by vertical [ASSUMPTION]
│
└── NO → Platform-reported revenue only
    ├── Label ALL profitability figures as ASSUMPTION
    ├── Add prominent warning about platform inflation (20-50%)
    ├── Calculate MER proxy (platform revenue / platform spend)
    ├── Skip CM1/CM2/CM3 (not meaningful without reliable revenue)
    └── Provide formulas + data checklist for client to fill in
```

---

## Output Format for Report

The profitability section of the report should include:

1. **Source of truth statement:** "Financial data sourced from {Shopify/BigCommerce/Platform estimates}. Label: {OBSERVED/ASSUMPTION}."
2. **Key metrics table:** MER, blended ROAS, blended CPA, AOV, CM1/CM2/CM3 (if calculable).
3. **Break-even thresholds table:** Break-even CPA, target CPA, minimum ROAS, target ROAS — with formulas shown.
4. **"Good ROAS, bad profit" check results:** Which checks were run, what was found.
5. **Payback and LTV analysis** (if data supports it).
6. **Open questions:** What data is needed from the client to improve this analysis.

Every number in this section must have a label and a source citation. No exceptions.
