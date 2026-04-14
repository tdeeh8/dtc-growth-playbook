# Adzviser Data Layer Protocol

How platform audits collect data via Adzviser MCP. Read this before any deep-dive.

## Workspace Resolution

Before any data pull, you need the `workspace_name`. Use the local cache instead of calling `list_workspace` every time:

1. Read `adzviser_workspace_cache.md` from the user's workspace root — a slim table of all workspaces and their connected platforms (generated on first run, user-specific)
2. Search for client name → get `workspace_name` and confirm which platforms are connected
3. **Cache miss?** Call `list_workspace`, parse via bash, update the cache file, then proceed
4. **Platform mismatch?** (user says a platform is connected but cache doesn't show it) → re-pull and update cache

This turns a 60-second 107K pull into a sub-second file read.

## Core Workflow

1. **Check metrics first.** Call `list_metrics_and_breakdowns_*` to confirm available metrics and breakdowns. Never guess metric names.

2. **Build the request:**
   ```
   retrieve_reporting_data:
     workspace_name: "Client Workspace Name"
     date_ranges: [["YYYY-MM-DD", "YYYY-MM-DD"]]
     time_granularity: ""  # or "Month", "Week"
     client_id: "mcp"
     assorted_requests:
       {platform}_request:
         metrics: ["Exact Metric Name 1", "Exact Metric Name 2"]
         breakdowns: ["Exact Breakdown Name"]  # optional
   ```
   CRITICAL: The platform request MUST be nested inside `assorted_requests`.

3. **Handle responses.** If too large, narrow by adding filters or reducing breakdowns.

## Timeout Prevention

Adzviser has a ~60 second timeout.

**Rules:**
- Max 8 metrics per pull
- 6 metrics + breakdowns is safer than 8 + breakdowns
- If timeout → split in half and retry both
- Second timeout → reduce to 3-4 metrics
- Still failing → mark DATA_NOT_AVAILABLE

**YoY / Multi-Period Pulls:**
- **Default to separate calls** — one per date range. Dual date-range requests (two periods in one `date_ranges` array) timeout ~2× more often than single-period calls.
- Pull current period first (more important), then comparison period.
- If the current period already timed out at 8 metrics, don't even try dual-range — go straight to single-period with fewer metrics.

**Connection vs. Query Failures:**
- If `list_metrics_and_breakdowns_*` itself times out → the connection is dead (token expired, access revoked). Do NOT retry data pulls — they will all fail. Score as ⚠️ ERROR immediately.
- If `list_metrics` succeeds but `retrieve_reporting_data` times out → query is too heavy. Apply the split/reduce rules above.
- To confirm a dead connection is workspace-specific (not systemic Adzviser outage), test the same `list_metrics_and_breakdowns_*` tool on a different workspace.

## Platform Request Keys

| Platform | Request Key | list_metrics Tool |
|----------|------------|-------------------|
| Google Ads | `google_ads_request` | `list_metrics_and_breakdowns_google_ads` |
| Meta Ads | `fb_ads_request` | `list_metrics_and_breakdowns_fb_ads` |
| Shopify | `shopify_request` | `list_metrics_and_breakdowns_shopify` |
| BigCommerce | `bigcommerce_request` | `list_metrics_and_breakdowns_bigcommerce` |
| GA4 | `ga4_request` | `list_metrics_and_breakdowns_ga4` |
| Amazon Ads | `amazon_ads_request` | `list_metrics_and_breakdowns_amazon_ads` |
| Amazon Seller | `amazon_seller_request` | `list_metrics_and_breakdowns_amazon_seller` |

## Metric Tiers

**Tier 1 — Always pull (decision metrics):**

| Platform | Metrics |
|----------|---------|
| Google Ads | Cost, Conversion Value, ROAS, Conversions, Average CPA |
| Meta Ads | Spend, Purchase Conversion Value, ROAS, Total Purchases, CPM |
| Shopify/BC | Gross sales, Net sales, Orders, Items |
| GA4 | Sessions, Purchase revenue, Transaction count |
| Amazon Ads | Spend, Sales (7 day), ACOS (7 day), ROAS (7 day) |

**Tier 2 — Pull for diagnosis (explains WHY):**

| Platform | Metrics |
|----------|---------|
| Google Ads | Search Impression Share, CTR, Quality Score, Average CPC |
| Meta Ads | Frequency, Reach, Quality/Engagement/Conversion Rankings, CTR |
| Shopify/BC | COGS, Gross profit, Discounts, Returns, Customer count |
| GA4 | Bounce rate, Engagement rate, Conversions, Event count |
| Amazon Ads | Impressions, Clicks, Purchases, Units sold, Session %, Buy Box % |

**Tier 3 — Conditional:**
Demographics, geographic breakdowns, video metrics, Brand Analytics SQR, monthly trends (only if lookback > 60d).

## Adzviser Response Behavior

**Adzviser may return more metrics than requested.** For example, requesting `["Net sales", "Orders"]` from Shopify may return `Net sales, Orders, Gross sales, Discounts, Returns`. This is normal — Adzviser bundles related metrics. Accept whatever comes back and use the extra data if relevant. Do NOT re-request metrics you already received as bonus fields.

**Adzviser may return slightly different column names than the metric names you sent.** Match by intent, not exact string. For example, requesting `"Roas (Conversions Value Per Cost)"` may come back as just `Roas` in the CSV header.

## Anti-Bloat Rules

- Never pull "Cost Per [action]" on Meta — calculate from Spend ÷ Action count
- Breakdowns are cheaper than metrics: 6 metrics + 3 breakdowns safer than 8 metrics + 1 breakdown
- If a pull exceeds 8 metrics, split by tier

## Fallback Protocol

1. Try Adzviser first
2. Try browser (Claude in Chrome) for UI-only checks
3. Mark DATA_NOT_AVAILABLE — never skip the check entirely

### Known Adzviser Gaps (Browser Fallback)

**Google Ads:** Conversion action settings, Enhanced Conversions toggle, Consent Mode v2, PMax asset details, Auction Insights
**Meta Ads:** Events Manager pixel status, CAPI implementation, Ad creative visual quality, ASC audience details
**Shopify:** COGS entry verification, theme/checkout assessment, app ecosystem, discount code structure
**GA4:** Conversion event configuration, attribution model setting, data stream config, Enhanced Measurement, Google Signals
**Amazon:** Listing quality (images, A+ content), Brand Registry status, SB video creative assessment

## Date Range Conventions

Lookback period is ALWAYS set during audit setup and stored in manifest. Calculate comparison period as same-length period immediately prior.

## Data Integrity

- Every number cites "Source: Adzviser MCP" or "Source: Browser UI"
- Never invent numbers
- Show calculation formulas
- Handle gaps with DATA_NOT_AVAILABLE labels
