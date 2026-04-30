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

## Step 1.4 — Channel Role Classification

**Goal:** Before deep-dive, classify every paid campaign across the v2 ad platforms into a funnel role (TOF / MOF / BOF) so role-appropriate scoring can be applied. This pull also feeds the headline "Roles" verdict in the report and is the trigger for TOF Mode in the Meta Ads section below.

**Position:** Runs after Step 1.3.5 (Connection Health Check) and before Step 1.5 (Platform Triage Pulls). Skip any platform that failed health check.

**Scope (v2):** Meta Ads, Google Ads, YouTube / Demand Gen. TikTok Ads, Pinterest, Snap appear in the audit if connected but are NOT classified or scored under role logic — note in manifest: "v2 covers Meta + Google + YouTube only — other platforms appear unclassified."

### Per-platform pulls

**Meta Ads** (`data_source_id=meta_ads_ds_id`):
```
load_metric_data(metric_key="Spend", dimension="Campaign Objective", ...)
load_metric_data(metric_key="Spend", dimension="Campaign Name", ...)
```
Two `load_metric_data` calls. Use Campaign Objective to anchor the role (Reach / Awareness / Video Views → TOF; Conversions/Sales → could be TOF or MOF depending on audience; Catalog Sales → typically MOF). Use Campaign Name for naming heuristics ("TOF", "Prospecting", "BOF", "Retargeting", "RT" — common conventions). Audience composition (custom audience vs broad/lookalike) is the third signal but is gathered in the deep-dive Role Compliance pull, not at triage.

**Google Ads** (`data_source_id=google_ads_ds_id`):
```
load_metric_data(metric_key="Cost", dimension="Campaign Type", ...)
load_metric_data(metric_key="Cost", dimension="Campaign Name", ...)
```
Two calls. Campaign Type is the strongest signal: Search-Branded → BOF, Search-Non-Branded → BOF if intent terms / MOF otherwise, Standard Shopping → BOF, Performance Max → TOF unless audience signals indicate retargeting, Display → MOF, Demand Gen → TOF. If a "Brand vs Non-brand" dimension or label exists in the account, prefer that over name parsing for the BOF/MOF split inside Search.

**YouTube / Demand Gen** (data_source filtered to YouTube/Video campaign types within Google Ads, OR standalone YouTube data_source if separate):
```
load_metric_data(metric_key="Cost", dimension="Campaign Objective", ...)
```
One call. View campaigns / Demand Gen / awareness objectives → TOF. Remarketing lists → MOF. Action campaigns with broad reach → TOF; with retargeting signals → MOF.

### Classification

For each campaign, classify TOF / MOF / BOF using the Canonical Mapping table in `reference/full-funnel-framework.md` Section 1. When two of three signals (Objective, naming, audience type) disagree, flag as ambiguous and surface in the manifest. Audience composition wins over labeling — see Section 2 of `reference/full-funnel-framework.md` for the role compliance rules and structural mismatch verdicts.

### Outputs (record in manifest)

For each platform that ran:
- Spend share by role: `TOF_share_pct, MOF_share_pct, BOF_share_pct, Unclassified_share_pct`
- List of ambiguous campaigns (name + label + best-guess role + reason)
- Any structural mismatches detected via naming alone (full audience-composition mismatch detection happens in deep-dive)

Cross-platform aggregate (across Meta + Google + YouTube only — out-of-scope platforms excluded from the share calculation):
- Total paid spend
- Aggregated TOF share, MOF share, BOF share

**TOF Mode trigger:** If Meta TOF share > 0% (any TOF spend at all on Meta), set `TOF_MODE = ON` for the Meta Ads section of Step 1.5. The Meta triage will then run quality-metric pulls in addition to the standard 8 metrics, and the Meta platform score becomes a TOF-quality + MOF/BOF-ROAS weighted blend.

**Out of scope (v2):** TikTok / Pinterest / Snap spend is reported but unclassified — flag in manifest as "v2 unclassified — role logic deferred to v3", do not include in cross-platform role share calculations. Their spend is still included in the Step 1.6 MER denominator (real money out the door).

---

## COGS Prompting Rule

If Shopify or BigCommerce triage (Step 1.5) returns COGS = $0 or null, **immediately ask the user via AskUserQuestion** before proceeding to the MER target derivation in Step 1.6. Do NOT silently fall back to a vertical estimate — the formula path `(1 ÷ CM2%) × 1.4-1.6` produces a target dramatically different from the flat 3.0× threshold for any client whose margins aren't ~33%.

**Question template:**

> Shopify isn't returning COGS for this account. To set the right MER target, what's the gross margin (CM2%) for this client? If you don't know the exact number, what's the vertical (apparel, beauty, supplements, home goods, electronics, food/consumables) — I'll use the playbook's vertical estimate as a labeled assumption.

**Fallback order:**

1. **Primary** — User provides CM2% directly. Use formula: `Target MER = (1 ÷ CM2%) × 1.4-1.6` (per `reference/playbook/benchmarks.md` MER Target Derivation).
2. **Secondary** — User provides vertical only. Use the COGS estimate from `synthesis/profitability-framework.md` (or the Contribution margin benchmarks table in `reference/playbook/benchmarks.md`). Label every downstream MER calculation as ASSUMPTION.
3. **Last resort** — User can't or won't provide either. Use flat 3.0× threshold from `reference/playbook/benchmarks.md` (MER Target Derivation → Fallback). Flag prominently in the report: "MER target uses flat 3.0× fallback — flat bands misjudge any client whose CM2 is materially above or below ~33%."

The MER target is the most leverage-bearing number in the headline scorecard. Don't let it default to a flat band silently.

---

## Step 1.5 — Platform Triage Pulls

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

**Structural Health Check (runs regardless of triage score):**

After triage scoring, ALWAYS run Pull 0 (Structural Health Check) from `reference/platforms/google-ads-deep.md`. Pull 0 is a cheap (4-5 `load_metric_data` calls) hygiene scan that catches issues invisible at account totals: weak Ad Strength, missing extensions, Enhanced Conversions off, missing shared neg lists.

**GREEN → YELLOW upgrade:** Pull 0 can upgrade a GREEN-scored platform to YELLOW if any of the following are true:
- >30% of active RSAs rated Poor or Average
- Majority of campaigns (>50%) have <3 sitelinks active
- Enhanced Conversions definitively OFF

When upgraded, note the trigger in the manifest as: "GREEN→YELLOW structural upgrade: {specific check}"

For a structurally-upgraded YELLOW, run ONLY Pull 6 (Ad + Extensions Depth) as the targeted dive unless other triage signals also flag the account.

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

**TOF MODE — switch scoring of TOF-classified Meta campaigns to quality metrics:**

TOF Mode triggers when **ANY** Meta spend is classified as TOF in Step 1.4 (Channel Role Classification). No threshold — there's no good reason to grade prospecting by 7-day in-channel ROAS even when prospecting is a small share of Meta spend. The dynamic TOF spend share target (Section 4 of `reference/full-funnel-framework.md`) is a separate, account-level health check; TOF Mode is a per-campaign-bucket scoring switch.

1. **TOF-classified Meta spend gets quality scoring, not ROAS scoring.** Standard ROAS/CPA scoring continues to apply unchanged to MOF and BOF Meta campaigns.
2. **Add these triage pulls** (one `load_metric_data` call per metric, no breakdowns):
   ```
   Meta: ["Spend", "Total Content Views", "Total Adds To Cart"]
   ```
   3 additional metric pulls beyond the 8 above. (Account-level totals — GA4 deep-dive Pull 5 supplies per-source/medium engaged-time + PDP funnel rates for full TOF quality scoring in deep-dive.)
3. **Compute traffic quality metrics** for the TOF portion of Meta spend:
   - Cost per ViewContent (CPVC) = Spend ÷ Total Content Views
   - Cost per Add-to-Cart (CPATC) = Spend ÷ Total Adds To Cart
4. **Score against the four-tier TOF Quality Benchmarks in `reference/playbook/benchmarks.md`** (TOF Traffic Quality Benchmarks by AOV Tier). Use the AOV tier matching the client — Mass-AOV (<$50), Standard-AOV ($50-$200), Premium-AOV ($200-$1,000), or Luxury / High-Ticket ($1,000+). The Premium-AOV tier preserves the legacy jewelry / home / apparel sub-rows. Frequency, CPM trend, and attribution ratio scoring still apply unchanged to Meta as a whole.
5. **Flag GA4 for the engaged-time + PDP funnel pulls** in deep-dive (see `reference/platforms/ga4-deep.md` Pull 5 — Channel Quality / Engaged Time + PDP Funnel). Without GA4 you only get 2 of 4-5 quality metrics.
6. **Note in the manifest:** "TOF Mode active for Meta — TOF spend share = X% (per Step 1.4). TOF-classified spend scored under the four-tier quality framework; MOF/BOF Meta scored under standard ROAS framework. AOV tier: {Mass | Standard | Premium | Luxury}."
7. **Auto-RED triggers (TOF Mode, applied to TOF portion only):** CPATC >2× the Floor for the AOV tier, OR CPVC >2× the Floor, OR Frequency >5.0. Standard ROAS auto-RED on TOF campaigns becomes **informational** rather than score-driving.

**Score authority — important:** When TOF Mode is active, the **platform-level Meta score is a weighted blend**, not a single verdict:

```
Meta score = (TOF-quality verdict × TOF spend share) + (MOF/BOF ROAS verdict × MOF/BOF spend share)
```

The TOF-quality verdict (RED/YELLOW/GREEN per the four-tier benchmarks) drives scoring of the TOF portion only. ROAS-based RED triggers on TOF campaigns become **informational** — capture them in the appendix for context, but they do NOT determine the TOF-portion score. MOF and BOF Meta campaigns continue to be scored on ROAS/CPA per the table above.

Worked example: A Standard-AOV apparel brand has 60% of Meta spend in TOF (broad prospecting) and 40% in MOF (retargeting). TOF quality reads GREEN (CPVC $1.10, CPATC $22, engaged time 58s, PDP→ATC 5.2% — all in Standard-AOV Healthy bands). MOF ROAS reads YELLOW (3.5× ROAS vs 4.0× target). Platform Meta score = (GREEN × 60%) + (YELLOW × 40%) → Platform = **YELLOW** (TOF is healthy but the spend-weighted MOF is below target). The body narrative explains the split — TOF is doing its job; retargeting needs work — instead of judging Meta on a single in-channel ROAS number that conflates the two roles.

If Shopify/BigCommerce data is unavailable AND the user hasn't given AOV: ask AOV before scoring Meta. The AOV tier determines which benchmark row TOF-quality scoring uses; defaulting to a single tier across all clients will misjudge most accounts.

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

## Step 1.6 — Cross-Platform Anchor Scoring

After per-platform triage (Step 1.5) completes, compute four account-level scores. These become the headline rows in the synthesizer scorecard — they are the layer that answers "is the business making more money because of marketing?" rather than "what's the ROAS on each channel?"

### 1.6.1 — MER (Marketing Efficiency Ratio)

**Formula:**
```
MER = Net Sales (Shopify/BigCommerce) ÷ Sum of paid spend across all in-scope platforms
```

In-scope platforms for the denominator: Meta + Google Ads + YouTube + Amazon Ads (if connected). TikTok / Pinterest / Snap spend is included in the MER denominator if connected — even though they're unclassified for role logic in v2, they're real money out the door.

### 1.6.2 — MER Target Derivation

**Primary path (always prefer):** `Target MER = (1 ÷ CM2%) × 1.4-1.6`. Requires CM2% from Shopify COGS, OR from user response per the COGS Prompting Rule above. See `reference/playbook/benchmarks.md` MER Target Derivation for worked examples.

**Secondary path:** Use the vertical-based COGS estimate from `synthesis/profitability-framework.md` (or the Contribution margin benchmarks table in `reference/playbook/benchmarks.md`). Label as ASSUMPTION. This is the path taken when the user provides a vertical but not an exact CM2%.

**Last resort:** Flat 3.0× threshold from `reference/playbook/benchmarks.md` (MER Target Derivation → Fallback). Use only when the user explicitly can't or won't provide CM2 OR vertical.

**Score:**

| MER vs Target | Score | Read |
|---|---|---|
| ≥ Target | 🟢 | Paid is profitable at the business level |
| 70-99% of Target | 🟡 | Below target — investigate efficiency or mix |
| <70% of Target | 🔴 | Paid is below break-even-plus-buffer — pause or restructure |

### 1.6.3 — MER Trend vs Spend Trend (incrementality proxy)

**Formula:**
```
Spend trend   = (Current period spend - Prior period spend) ÷ Prior period spend
Revenue trend = (Current period revenue - Prior period revenue) ÷ Prior period revenue
MER ratio     = Revenue trend ÷ Spend trend
```

Compute over 90-day vs prior-90-day where the manifest lookback supports it. Read against `reference/full-funnel-framework.md` Section 6.2 (MER Trend vs Spend Trend Interpretation) — that table is the canonical interpretation source; do not redefine here.

**Score:**

| MER trend vs spend trend | Score | Read |
|---|---|---|
| Revenue grew proportionally to spend (within ±5pts) OR efficiency improved | 🟢 | Paid is roughly incremental |
| Revenue trend < 50% of spend trend (cannibalization signal) | 🟡 | Diminishing returns — investigate role mix |
| Revenue flat/down while spend up >20%, OR sharp MER decline | 🔴 | Saturation or broken channel — re-examine TOF and audience |

### 1.6.4 — nROAS (New-Customer ROAS)

**Formula:**
```
nROAS = New-customer revenue ÷ Sum of paid spend (same denominator as MER)
```

**New-customer revenue source order (per `reference/full-funnel-framework.md` Section 5.2):**
1. **Primary** — Shopify "First-time vs Returning customers" report → Net sales filtered to first-time. Same window as audit lookback (see `reference/platforms/shopify-deep.md` for the pull).
2. **Degraded** — GA4 Pull 6 (`Sessions × Purchase revenue × New users` by Source/Medium — see `reference/platforms/ga4-deep.md`). Flag every nROAS number as `(GA4-approximated, no Shopify customer split)` and trigger the Data Gaps callout in the synthesizer.
3. **Failed** — If neither source is available, omit nROAS from the scorecard and the synthesizer collapses to its degraded layout (per `reference/synthesizer.md` Section 2.2).

**Score against `reference/full-funnel-framework.md` Section 5.3 (nROAS Interpretation Table):**

| nROAS | Score | Read |
|---|---|---|
| ≥ 1.5× (with healthy MER) | 🟢 | Paid is acquiring real new revenue |
| 1.0-1.5× | 🟡 | Marginal — verify cohort LTV / payback period |
| <1.0× | 🔴 | Paid not breaking even on first-purchase contribution |

### 1.6.5 — TOF Spend Share vs Dynamic Target

**Compute target TOF share** using `reference/full-funnel-framework.md` Section 4.2 (Target Derivation Table — brand stage × AOV tier) and Section 4.3 (Modifier Rules — returning customer %, MER trend, total paid spend).

**Inputs:**
- Brand stage (Launch / Growth / Mature) — from manifest setup question
- AOV tier (Mass / Standard / Premium / Luxury) — from Shopify triage
- Returning customer % — from Shopify First-time vs Returning report
- MER trend — from 1.6.3
- Total paid spend — from 1.6.1 denominator

**Compare:** Target TOF share band vs actual cross-platform TOF share (from Step 1.4 cross-platform aggregate, Meta + Google + YouTube only).

**Score against `reference/full-funnel-framework.md` Section 4.4 (Scoring Actual vs Target):**

| Actual TOF share vs target | Score |
|---|---|
| Within target band | 🟢 |
| Above target by 5-15pts | 🟡 |
| Above target by >15pts | 🟡 |
| Below target band but above floor | 🟡 |
| At or below floor | 🔴 |

### Outputs (record in manifest)

```markdown
## Cross-Platform Anchor Scoring
- MER: {value}× vs target {target}× — {🟢/🟡/🔴}
- MER trend vs spend trend: {ratio} — {🟢/🟡/🔴}
- nROAS: {value}× — {🟢/🟡/🔴} {(source: Shopify | GA4-approx | unavailable)}
- TOF spend share: {actual}% vs target {target_band}% (floor {floor}%) — {🟢/🟡/🔴}
```

These four scores become rows 1-4 of the headline scorecard in the synthesizer report (see `reference/synthesizer.md` Section 2.2 — Scorecard Restructure).

---

## Scoring Logic

### Per-platform score

Each platform gets a composite score:
1. Count RED signals, YELLOW signals, GREEN signals from the threshold table.
2. Apply auto-RED triggers (any single auto-RED = platform is RED regardless of other signals).
3. If no auto-RED:
   - Majority RED signals → Platform is 🔴 RED
   - Any RED signal OR majority YELLOW → Platform is 🟡 YELLOW
   - Majority GREEN and no RED → Platform is 🟢 GREEN
4. **TOF Mode adjustment (Meta Ads only):** When TOF Mode is active for Meta (per Step 1.4), the platform score is a **weighted blend**, not a majority count:
   - `Meta score = (TOF-quality verdict × TOF spend share) + (MOF/BOF ROAS verdict × MOF/BOF spend share)`
   - TOF-quality verdict comes from the four-tier TOF Quality Benchmarks in `reference/playbook/benchmarks.md`, not from ROAS/CPA scoring.
   - ROAS-based RED triggers on TOF campaigns become **informational** — they appear in the appendix but do not drive the platform score.
   - MOF/BOF Meta campaigns continue to be scored on ROAS/CPA per the standard table above.

### Account-level overrides (apply after per-platform scoring)

5. **Role Compliance override:** If Step 1.4 (or the Meta deep-dive's audience-composition pull) detected a structural mismatch on a campaign worth >10% of platform spend (per `reference/full-funnel-framework.md` Section 2 — e.g., a campaign labeled TOF but with 70%+ spend on retargeting custom audiences), upgrade that platform's score to 🟡 YELLOW even if all other signals are GREEN. The mismatch surfaces in the synthesizer's Role Compliance row.

6. **TOF Underfunding override (account-level):** If the cross-platform TOF spend share (from Step 1.4 aggregate, Meta + Google + YouTube only) is **at or below the dynamic target's Floor** (per `reference/full-funnel-framework.md` Section 4.2 table — varies by brand stage × AOV tier), flag the **account** as 🟡 YELLOW even if every individual platform scores 🟢 GREEN. Critical under-funding looks fine in the rear-view mirror and breaks the funnel 60-90 days out — the account-level YELLOW is the only place this surfaces.

### False negative protection

Even if a platform scores GREEN at account level, problems can hide in campaign details. Apply these override rules:

- **High spend override:** If platform spend > $10k/month and GREEN → upgrade to YELLOW. Reason: high-spend accounts warrant at least a campaign-level scan.
- **Attribution smell test:** If sum of all ad platform conversions > 1.5× Shopify orders → force GA4 to YELLOW minimum. Something's inflated.
- **Stale comparison:** If no comparison period data available, scoring confidence is lower. Note: "Single-period data only — trends unknown."
- **Structural health gate:** Even if a Google Ads platform scores GREEN, Pull 0 may upgrade it to YELLOW for hygiene reasons (see Google Ads section above). This is the primary false-negative defense for Google Ads.

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
