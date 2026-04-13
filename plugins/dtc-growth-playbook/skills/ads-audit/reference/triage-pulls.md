# Triage Pull Specs & Scoring

One pull per platform. Account-level totals only. The goal: enough signal to decide RED/YELLOW/GREEN in under 5 minutes per platform.

**Also load:** `reference/playbook/benchmarks.md` — contains Floor/Healthy/Strong thresholds per platform and profitability math (break-even CPA, target ROAS, minimum ROAS). Use these to contextualize the triage scoring below. The thresholds in this file are simplified decision rules; benchmarks.md has the full vertical-specific context.

---

## Execution Protocol

1. For each platform, call `list_metrics_and_breakdowns_*` to confirm metric names
2. Execute the pull below using `retrieve_reporting_data`
3. Score against thresholds
4. Record results in manifest

All pulls use:
```
retrieve_reporting_data:
  workspace_name: {from manifest}
  date_ranges: [["YYYY-MM-DD", "YYYY-MM-DD"]]  # from manifest lookback
  client_id: "mcp"
  assorted_requests:
    {platform}_request:
      metrics: [...]
      breakdowns: []  # NO breakdowns for triage
```

---

## Platform Triage Pulls

### Shopify (Financial Anchor)

**Request key:** `shopify_request`

**Primary pull (try first):**
```
metrics: ["Gross sales", "Discounts", "Returns", "Net sales", "Orders", "Items", "Cost of goods sold", "Gross profit"]
```

8 metrics, no breakdowns. If COGS returns $0 or null, note it — profitability will use estimates.

**Timeout fallback (large catalogs frequently timeout on 8 metrics):**
1. First timeout → split into core + supplemental:
   - Core: `["Net sales", "Orders"]` (Adzviser often returns additional metrics automatically — accept whatever comes back)
   - Supplemental: `["Cost of goods sold", "Gross profit"]`
2. Second timeout on core → try just `["Net sales"]` alone
3. Still failing → mark Shopify as DATA_NOT_AVAILABLE, ask user for AOV and revenue manually, note: "Shopify data could not be pulled via Adzviser. Profitability analysis will use manual inputs."

**Calculate:**
- AOV = Net sales ÷ Orders
- Discount rate = Discounts ÷ Gross sales
- Return rate = Returns ÷ Gross sales
- Gross margin = Gross profit ÷ Net sales (if COGS available)
- Revenue reconciliation: Gross sales − Discounts − Returns ≈ Net sales (±1%)

**Scoring thresholds:**

| Signal | 🟢 GREEN | 🟡 YELLOW | 🔴 RED |
|--------|----------|-----------|--------|
| Return rate | <10% | 10-20% | >20% |
| Discount rate | <15% | 15-25% | >25% |
| Gross margin (if available) | >50% | 35-50% | <35% |
| Revenue reconciliation | Within 1% | 1-5% gap | >5% gap |

**Auto-RED triggers:** Return rate >25%, discount rate >30%, revenue doesn't reconcile >5%

**Cross-platform outputs (carry forward):**
- Net sales total (for MER calculation)
- AOV (determines high-ticket vs standard)
- Order count (for attribution reconciliation)

---

### BigCommerce (Financial Anchor — alternate)

**Request key:** `bigcommerce_request`

```
metrics: ["Gross sales", "Discounts", "Refunds", "Net sales", "Orders", "Items"]
```

6 metrics. BigCommerce may not have COGS via Adzviser. Check `list_metrics_and_breakdowns_bigcommerce` first.

**Scoring:** Same thresholds as Shopify. Use "Refunds" instead of "Returns."

---

### Google Ads

**Request key:** `google_ads_request`

```
metrics: ["Cost", "Conversion Value", "Roas (Conversions Value Per Cost)", "Conversions", "Average Cpa (Cost Per Conversion)", "Clicks", "Impressions", "Ctr %"]
```

8 metrics, no breakdowns. Account totals snapshot.

**Calculate:**
- ROAS = Conversion Value ÷ Cost (verify against Adzviser's ROAS field)
- CPA = Cost ÷ Conversions
- CVR = Conversions ÷ Clicks
- Break-even CPA = AOV × Gross Margin % (from Shopify triage)
- Target ROAS = (1 ÷ Gross Margin %) × 1.4
- Attribution check: Compare Google-reported conversions to Shopify order count (if available)

**Scoring thresholds:**

| Signal | 🟢 GREEN | 🟡 YELLOW | 🔴 RED |
|--------|----------|-----------|--------|
| ROAS vs target | ≥ target ROAS | 70-99% of target | <70% of target |
| CPA vs break-even | <80% of break-even | 80-100% of break-even | >break-even CPA |
| CVR | >3% | 1.5-3% | <1.5% |
| CTR | >3% | 1.5-3% | <1.5% |
| Attribution ratio (G conversions ÷ Shopify orders) | <1.3× | 1.3-2.0× | >2.0× |

**Auto-RED triggers:** ROAS <1.0× (losing money), CPA >2× break-even, attribution ratio >2.5×

**If no Shopify data yet (Google runs before Shopify):** Use AOV/margin from user input or skip profitability thresholds. Flag: "Profitability scoring deferred — awaiting Shopify data."

---

### Meta Ads

**Request key:** `fb_ads_request`

```
metrics: ["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "Impressions", "Reach", "Frequency", "CPM"]
```

8 metrics, no breakdowns. Account health snapshot.

**Calculate:**
- CPA = Spend ÷ Total Purchases
- ROAS (verify against Adzviser field)
- Break-even CPA = AOV × Gross Margin % (from Shopify)
- Target ROAS = (1 ÷ Gross Margin %) × 1.4
- Attribution check: Compare Meta purchases to Shopify order count

**Scoring thresholds:**

| Signal | 🟢 GREEN | 🟡 YELLOW | 🔴 RED |
|--------|----------|-----------|--------|
| ROAS vs target | ≥ target ROAS | 70-99% of target | <70% of target |
| CPA vs break-even | <80% of break-even | 80-100% of break-even | >break-even CPA |
| Frequency (30d) | <2.5 | 2.5-4.0 | >4.0 |
| CPM trend (if comparison period available) | Stable or declining | Rising <20% | Rising >20% |
| Attribution ratio (Meta purchases ÷ Shopify orders) | <1.3× | 1.3-2.0× | >2.0× |

**Auto-RED triggers:** ROAS <1.0×, frequency >5.0, CPA >2× break-even

---

### Amazon Ads

**Request keys:** Two pulls needed — one from `amazon_ads_request`, one from `amazon_seller_request`.

**Pull A — Ad performance:**
```
amazon_ads_request:
  metrics: ["Spend", "Sales (7 day)", "ACOS (7 day)", "ROAS (7 day)", "Impressions", "Clicks", "Purchases (7 day)", "Units sold (7 day)"]
```

**Pull B — Seller overview (for TACoS):**
```
amazon_seller_request:
  metrics: ["Ordered product sales", "Units ordered", "Average selling price", "Sessions - total", "Unit session percentage", "Featured offer (buy box) percentage", "Units refunded", "Refund rate"]
```

**Calculate:**
- TACoS = Ad Spend ÷ Total Ordered Product Sales
- Break-even ACOS = Gross Margin % (from user input at setup, since Shopify won't have Amazon margins)
- CVR = Purchases ÷ Clicks (from ads data)
- Organic CVR = Unit session percentage (from seller data)
- Ad dependency ratio = Ad Sales ÷ Total Ordered Product Sales

**Scoring thresholds:**

| Signal | 🟢 GREEN | 🟡 YELLOW | 🔴 RED |
|--------|----------|-----------|--------|
| ACOS vs break-even | <80% of break-even | 80-100% of break-even | >break-even ACOS |
| TACoS | <15% | 15-25% | >25% |
| Featured Offer % | >90% | 70-90% | <70% |
| Refund rate | <5% | 5-10% | >10% |
| Ad dependency ratio | <40% | 40-60% | >60% |
| Organic CVR (unit session %) | >10% | 5-10% | <5% |

**Auto-RED triggers:** TACoS >30%, Featured Offer <60%, ACOS >2× break-even

---

### GA4 (Reconciliation Layer)

**Request key:** `ga4_request`

Two triage pulls (split to avoid GA4 timeout):

**Pull A — Traffic overview:**
```
ga4_request:
  metrics: ["Sessions", "Total users", "New users", "Engagement rate", "Bounce rate"]
```

**Pull B — Ecommerce overview:**
```
ga4_request:
  metrics: ["Purchase revenue", "Transaction count", "Ecommerce Add-to-carts", "Ecommerce Checkouts (begin_checkout event count)"]
```

**Calculate:**
- Ecommerce CVR = Transaction count ÷ Sessions
- ATC rate = Add-to-carts ÷ Sessions
- Checkout completion = Transaction count ÷ Checkouts
- GA4 vs Shopify revenue gap = (Shopify Net sales − GA4 Purchase revenue) ÷ Shopify Net sales
- GA4 vs Shopify order gap = (Shopify Orders − GA4 Transactions) ÷ Shopify Orders

**Scoring thresholds:**

| Signal | 🟢 GREEN | 🟡 YELLOW | 🔴 RED |
|--------|----------|-----------|--------|
| GA4 vs Shopify revenue gap | <15% | 15-30% | >30% |
| GA4 vs Shopify order gap | <10% | 10-25% | >25% |
| Ecommerce CVR | >2.5% | 1.5-2.5% | <1.5% |
| Bounce rate | <45% | 45-65% | >65% |
| Checkout completion (txns ÷ checkouts) | >50% | 30-50% | <30% |

**Auto-RED triggers:** Revenue gap >40% (tracking is broken), order gap >30%, CVR <1%

---

## Scoring Logic

### Per-platform score

Each platform gets a composite score:
1. Count RED signals, YELLOW signals, GREEN signals from the threshold table
2. Apply auto-RED triggers (any single auto-RED = platform is RED regardless of other signals)
3. If no auto-RED:
   - Majority RED signals → Platform is 🔴 RED
   - Any RED signal OR majority YELLOW → Platform is 🟡 YELLOW
   - Majority GREEN and no RED → Platform is 🟢 GREEN

### False negative protection

Even if a platform scores GREEN at account level, problems can hide in campaign details. Apply these override rules:

- **High spend override:** If platform spend > $10k/month and GREEN → upgrade to YELLOW. Reason: high-spend accounts warrant at least a campaign-level scan.
- **Attribution smell test:** If sum of all ad platform conversions > 1.5× Shopify orders → force GA4 to YELLOW minimum. Something's inflated.
- **Stale comparison:** If no comparison period data available, scoring confidence is lower. Note: "Single-period data only — trends unknown."

### Triage output format

Record in manifest:
```markdown
## Triage Results
Date: {date}
Lookback: {period}

| Platform | Score | Key Signals | Recommended Depth |
|----------|-------|-------------|-------------------|
| Shopify | 🟢 GREEN | AOV $85, 12% return, margins healthy | Summary only |
| Google Ads | 🔴 RED | ROAS 1.8× (target 3.2×), CPA $45 (BE $38) | Full deep-dive |
| Meta Ads | 🟡 YELLOW | Freq 3.8, CPM +18% MoM | Targeted dive (frequency + creative) |
| Amazon Ads | 🟢 GREEN | ACOS 18% (BE 45%), TACoS 12% | Summary only |
| GA4 | 🟡 YELLOW | Revenue gap 22% vs Shopify | Reconciliation dive |
```

### What gets carried to deep-dive

When a platform is flagged RED or YELLOW, pass these to the deep-dive:
- The specific signals that triggered the flag
- Shopify financial anchor data (AOV, margins, order count)
- Any cross-platform signals (attribution ratios, revenue gaps)
- The user's stated focus areas from setup

This context helps the deep-dive focus on the RIGHT problem instead of auditing everything.
