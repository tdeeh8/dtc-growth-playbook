# Triage Pull Specs & Scoring

One pull per platform (× 2 for YoY). Account-level totals only. The goal: enough signal to decide RED/YELLOW/GREEN in under 5 minutes per platform AND see the YoY trajectory.

**Also load:** `reference/playbook/benchmarks.md` — contains Floor/Healthy/Strong thresholds per platform and profitability math. Use these to contextualize the triage scoring below.

---

## Execution Protocol

1. **Health check first** — `list_metrics(data_source_id=N)` should have already been called in Step 1.3.5. Skip any platform that failed the health check.
2. Execute the pulls below using `load_metric_data` (one call per metric) — **run current period AND YoY period for every platform** (see YoY Default Protocol below).
3. Score against thresholds using the current period.
4. Compute YoY deltas for headline metrics (spend, revenue, ROAS, transactions).
5. Run sanity checks (see below) — YoY included.
6. Record current + YoY results in manifest.

## YoY Default Protocol (mandatory)

**Every triage pull runs twice: current period + year-ago period.**

Single-period audits miss the highest-leverage finding type: owned-channel collapse. Email/SMS revenue falling 90% YoY is invisible without a baseline. YoY is now required on every triage pull, not a follow-up.

**How it works:**
- Current period: from manifest (e.g., Last 30 days = today-30 → today-1)
- YoY period: same calendar range offset by 1 year
- Run as **two separate calls per platform**, never dual-range in one request (timeout risk — see "YoY / Comparison Period Pulls — Split Protocol" below)
- Store both in evidence JSON as `account_overview.current` and `account_overview.prior_year`
- The synthesizer reads both and calculates YoY deltas

**Platforms where YoY is especially valuable (do not skip):**
- GA4 Channel Group breakdown — catches owned-channel collapse (Email/SMS/Direct)
- GA4 Source/Medium breakdown — catches UTM tagging regressions
- Google Ads + Meta Ads totals — ROAS trajectory
- Shopify/BigCommerce — revenue + AOV trajectory

**When to skip YoY:** only if the account wasn't running the platform 12 months ago (new account, platform added mid-year). Note that in the manifest.

All pulls use:
```
load_metric_data(
  data_source_id=<platform>_ds_id,  # from manifest account setup
  metric_key="<exact key from list_metrics>",
  start_date="YYYY-MM-DD",
  end_date="YYYY-MM-DD",
  is_whole_range=true,
  dimension=None  # NO dimensions for triage pulls
)
```

### YoY / Comparison Period Pulls — Per-Metric Protocol

**Standard approach: Call load_metric_data once per metric, twice per period.**

Databox returns data per metric. For a 30-day lookback with 8 triage metrics, that's 8 calls per platform per period (16 total for YoY). Individual calls are fast; the risk is volume and occasional 404s (metric not connected or not available for that data source).

```
# DO THIS — two separate calls per metric:
load_metric_data(  # Call 1: Current period
  data_source_id=google_ads_ds_id,
  metric_key="Cost",
  start_date="2026-03-14",
  end_date="2026-04-13",
  is_whole_range=true
)

load_metric_data(  # Call 2: Comparison period
  data_source_id=google_ads_ds_id,
  metric_key="Cost",
  start_date="2025-03-14",
  end_date="2025-04-13",
  is_whole_range=true
)
```

**If a metric 404s or errors:** Log it as DATA_NOT_AVAILABLE and continue with the rest. Do NOT retry the same metric multiple times.

### Data Quality Sanity Checks

After scoring, run these sanity checks to catch tracking artifacts and implausible data:

| Metric | Implausible Range | Likely Cause | Action |
|---|---|---|---|
| ATC rate (ATCs ÷ Sessions) | >40% | Auto-add feature, popup, or event firing multiple times per pageview | Flag as DATA_QUALITY_SUSPECT. Note: "ATC rate of X% exceeds realistic range. Likely a tracking artifact (auto-add, popup, or duplicate event firing). Use with caution for YoY comparison." |
| Checkout rate (Checkouts ÷ Sessions) | >25% | Same as above, or checkout event misconfigured | Flag as DATA_QUALITY_SUSPECT |
| CVR (Transactions ÷ Sessions) | >10% (non-Amazon) | Purchase event firing on non-purchase pages, or inflated by returning to thank-you page | Flag as DATA_QUALITY_SUSPECT |
| Return rate | >40% | Possible data issue OR genuinely broken product/sizing | Flag but investigate — could be real |
| Discount rate | >50% | Possible gross/net sales confusion | Verify calculation: Discounts ÷ Gross sales |

**YoY sanity check:** If a RATE metric changed >50% YoY (e.g., ATC rate went from 22% to 10%), check whether the change is:
- **Volume-proportional** (e.g., ATCs dropped 72% but sessions dropped 51% = rate dropped ~44% — proportional to traffic quality decline)
- **Disproportionate by device** (e.g., desktop ATC rate cratered 82% while mobile only dropped 14% — suggests a platform-specific change, not real behavior)
- **Tracking-related** (e.g., one period shows implausible rates that the other doesn't — likely a tracking change between periods)

When a sanity check fires, note it in the manifest and in the triage presentation to the user. Do NOT let inflated historical metrics make current performance look worse than it is.

---

## Platform Triage Pulls

### Shopify (Financial Anchor)

**Data source:** Shopify (use `data_source_id` from cache)

**Primary pulls (one `load_metric_data` call per metric):**
```
["Gross sales", "Discounts", "Returns", "Net sales", "Orders", "Items", "Cost of goods sold", "Gross profit"]
```

8 metric pulls, no dimensions. If COGS returns $0 or null, note it — profitability will use estimates. Resolve each semantic name to its exact `metric_key` via `list_metrics(data_source_id=shopify_ds_id)` before pulling.

**Error fallback:**
1. First error on a metric → log DATA_NOT_AVAILABLE for that metric, continue with the rest.
2. If most metrics fail (e.g., 5+ errors out of 8) → the data source is likely disconnected. Score ⚠️ ERROR.
3. If only Net sales + Orders come through → that's still enough for AOV; note partial data in manifest.
4. If nothing comes through → mark Shopify as DATA_NOT_AVAILABLE, ask user for AOV and revenue manually, note: "Shopify data could not be pulled via Databox. Profitability analysis will use manual inputs."

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

**Data source:** BigCommerce (use `data_source_id` from cache)

**Metrics to pull (one `load_metric_data` call per metric):**
```
["Gross sales", "Discounts", "Refunds", "Net sales", "Orders", "Items"]
```

6 metric pulls. BigCommerce may not expose COGS via Databox. Call `list_metrics(data_source_id=bigcommerce_ds_id)` first to confirm which metrics are available.

**Scoring:** Same thresholds as Shopify. Use "Refunds" instead of "Returns."

---

### Google Ads

**Data source:** Google Ads (use `data_source_id` from cache)

**Metrics to pull (one `load_metric_data` call per metric):**
```
["Cost", "Conversion Value", "Roas (Conversions Value Per Cost)", "Conversions", "Average Cpa (Cost Per Conversion)", "Clicks", "Impressions", "Ctr %"]
```

8 metric pulls, no dimensions. Account totals snapshot. Resolve each semantic name to its exact `metric_key` via `list_metrics(data_source_id=google_ads_ds_id)` before pulling.

**Calculate:**
- ROAS = Conversion Value ÷ Cost (verify against Databox's ROAS field)
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

**Data source:** Meta Ads / Facebook Ads (use `data_source_id` from cache)

**Metrics to pull (one `load_metric_data` call per metric):**
```
["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "Impressions", "Reach", "Frequency", "CPM"]
```

8 metric pulls, no dimensions. Account health snapshot.

**Calculate:**
- CPA = Spend ÷ Total Purchases
- ROAS (verify against Databox field)
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

**Data sources:** Two data sources needed — "Amazon Ads" (or "Amazon Advertising") and "Amazon Seller Central". Use `data_source_id` from cache for each.

**Group A — Ad performance (one `load_metric_data` call per metric, data_source_id=amazon_ads_ds_id):**
```
["Spend", "Sales (7 day)", "ACOS (7 day)", "ROAS (7 day)", "Impressions", "Clicks", "Purchases (7 day)", "Units sold (7 day)"]
```

**Group B — Seller overview for TACoS (one `load_metric_data` call per metric, data_source_id=amazon_seller_ds_id):**
```
["Ordered product sales", "Units ordered", "Average selling price", "Sessions - total", "Unit session percentage", "Featured offer (buy box) percentage", "Units refunded", "Refund rate"]
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

**Data source:** Google Analytics 4 (use `data_source_id` from cache)

**Group A — Traffic overview (one `load_metric_data` call per metric):**
```
["Sessions", "Total users", "New users", "Engagement rate", "Bounce rate"]
```

**Group B — Ecommerce overview (one `load_metric_data` call per metric):**
```
["Purchase revenue", "Transaction count", "Ecommerce Add-to-carts", "Ecommerce Checkouts (begin_checkout event count)"]
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
