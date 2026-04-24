# Triage Pull Specs & Scoring

One pull per platform (× 2 for YoY). Account-level totals only. The goal: enough signal to decide RED/YELLOW/GREEN in under 5 minutes per platform AND see the YoY trajectory.

**Also load:** `reference/playbook/benchmarks.md` — contains Floor/Healthy/Strong thresholds per platform and profitability math. Use these to contextualize the triage scoring below.

---

## Execution Protocol

1. **Health check first** — `list_metrics_and_breakdowns_*` should have already been called in Step 1.3.5. Skip any platform that failed the health check.
2. Execute the pull below using `retrieve_reporting_data` — **run current period AND YoY period for every platform** (see YoY Default Protocol below).
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
retrieve_reporting_data:
  workspace_name: {from manifest}
  date_ranges: [["YYYY-MM-DD", "YYYY-MM-DD"]]  # from manifest lookback
  client_id: "mcp"
  assorted_requests:
    {platform}_request:
      metrics: [...]
      breakdowns: []  # NO breakdowns for triage
```

### YoY / Comparison Period Pulls — Split Protocol

**CRITICAL: Always pull current period and comparison period as SEPARATE requests.**

Adzviser has a ~60 second timeout. Dual date-range pulls (two periods in one request) timeout significantly more often than single-period pulls. The extra API call is much cheaper than a timeout + retry cycle.

```
# DO THIS — two separate calls:
retrieve_reporting_data:  # Call 1: Current period
  date_ranges: [["2026-03-14", "2026-04-13"]]
  ...

retrieve_reporting_data:  # Call 2: Comparison period
  date_ranges: [["2025-03-14", "2025-04-13"]]
  ...

# NOT THIS — one combined call that's more likely to timeout:
retrieve_reporting_data:
  date_ranges: [["2026-03-14", "2026-04-13"], ["2025-03-14", "2025-04-13"]]
  ...
```

**Exception:** If single-period pulls are working reliably and the platform is fast (e.g., GA4 with few metrics), dual-range is acceptable. But default to splitting.

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

**Structural Health Check (runs regardless of triage score):**

After triage scoring, ALWAYS run Pull 0 (Structural Health Check) from `reference/platforms/google-ads-deep.md`. Pull 0 is a cheap (4-5 `retrieve_reporting_data` calls) hygiene scan that catches issues invisible at account totals: weak Ad Strength, missing extensions, Enhanced Conversions off, missing shared neg lists.

**GREEN → YELLOW upgrade:** Pull 0 can upgrade a GREEN-scored platform to YELLOW if any of the following are true:
- >30% of active RSAs rated Poor or Average
- Majority of campaigns (>50%) have <3 sitelinks active
- Enhanced Conversions definitively OFF

When upgraded, note the trigger in the manifest as: "GREEN→YELLOW structural upgrade: {specific check}"

For a structurally-upgraded YELLOW, run ONLY Pull 6 (Ad + Extensions Depth) as the targeted dive unless other triage signals also flag the account.

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

**HIGH-AOV MODE — switch Meta scoring when AOV ≥ $200:**

If Shopify/BigCommerce triage shows AOV ≥ $200 (or user stated buying cycle ≥ 14 days, or Meta is stuck in learning phase with <50 purchases/week), the standard ROAS/CPA scoring above is structurally broken — Meta's 7-day attribution window misses high-AOV purchases. Use the High-AOV Traffic Quality Framework instead:

1. **Skip the standard ROAS/CPA scoring** — it will always look bad and won't reflect channel reality.
2. **Add this triage pull:**
   ```
   fb_ads_request:
     metrics: ["Spend", "Total Content Views", "Total Adds To Cart"]
   ```
   3 additional metrics beyond the 8 above, no breakdowns.
3. **Compute traffic quality metrics:**
   - Cost per ViewContent (CPVC) = Spend ÷ Total Content Views
   - Cost per Add-to-Cart (CPATC) = Spend ÷ Total Adds To Cart
4. **Score against High-AOV benchmarks in `reference/playbook/benchmarks.md`** (use the AOV tier matching the client: jewelry, home/furniture, apparel/lifestyle, B2B services). Frequency, CPM trend, and attribution ratio scoring still apply unchanged.
5. **Flag GA4 for the engaged-time + PDP funnel pulls** in deep-dive (see `reference/platforms/ga4-deep.md` Pull 5 — High-AOV Channel Quality). This is the third and fourth quality metrics; without GA4 you only get 2 of 5.
6. **Note in the manifest:** "Meta scored using High-AOV Traffic Quality Framework (AOV $X, cycle Y days). Standard ROAS scoring deferred per playbook tof-strategy.md."
7. **Auto-RED triggers (high-AOV mode):** CPATC >2× the Floor for the category, OR CPVC >2× the Floor, OR Frequency >5.0. Standard ROAS auto-RED does NOT apply in this mode.

If neither Shopify/BigCommerce data is available AND the user hasn't given AOV: ask AOV before scoring Meta. Do not default to standard scoring on unknown AOV — over half of agency clients are above the $200 threshold.

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
