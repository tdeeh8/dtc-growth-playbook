# Databox Data Layer Protocol

How platform audits collect data via Databox MCP. Read this before any deep-dive.

## Hierarchy Model

Databox uses a different model than Adzviser. Understand it before pulling:

```
Account (one per client/organization)
  └── Data Source (one per platform integration — e.g., "Google Ads", "GA4", "Shopify")
        └── Metric (e.g., "GoogleAnalytics4@sessions") — each metric has a unique metric_key
              └── Dimensions (e.g., "source", "campaign") — optional breakdowns
```

- An **Account** is the top-level container, analogous to an Adzviser "workspace."
- A **Data Source** is a single platform integration (one Google Ads connection, one GA4 property, etc.). A client can have multiple data sources of the same type.
- A **Metric** lives inside a data source. Metric keys are unique (e.g., `GoogleAnalytics4@sessions`, `1234|custom_query_567`). Always use the exact key returned by `list_metrics` — never truncate or modify it.
- Databox pulls **one metric at a time** via `load_metric_data`. To assemble a multi-metric snapshot, you make N calls.

## Account + Data Source Resolution

Before any data pull you need the `account_id` and the correct `data_source_id` for each platform. Use the local cache instead of calling `list_accounts` + `list_data_sources` on every audit:

1. Read `databox_account_cache.md` from the user's workspace root — a slim table of all accounts, their data sources, and the resolved `data_source_id` per platform (generated on first run, user-specific).
2. Search for client name → get `account_id` and the `data_source_id` map for each platform connected.
3. **Cache miss?** Call `list_accounts`, then `list_data_sources(account_id)` for the target account, parse via bash, update the cache file, then proceed.
4. **Platform mismatch?** (user says a platform is connected but cache doesn't show it) → re-pull `list_data_sources` and update the cache.

This turns multiple round-trips into a sub-second file read.

## Core Workflow

1. **List metrics first.** Call `list_metrics(data_source_id=N)` to discover the available `metric_key` values and their dimensions. Never guess metric keys.

2. **Pull each metric:**
   ```
   load_metric_data:
     data_source_id: N                          # from cache
     metric_key: "GoogleAnalytics4@sessions"    # exact key from list_metrics
     start_date: "YYYY-MM-DD"
     end_date: "YYYY-MM-DD"
     dimension: "source"                         # optional, omit for totals
     granulation_time_unit: null                 # 1=hour, 2=day, 3=week, 4=month; null = aggregate
     is_whole_range: true                        # true returns a single aggregated value
     record_limit: 10                            # only used when dimension is set
   ```

3. **For deep exploration, use Genie.** When you need to answer a nuanced question over a dataset (not just pull a metric), use `ask_genie(dataset_id, question, thread_id=None)`. Genie handles SQL-style exploration and can continue a thread.

4. **Reuse thread_id.** When following up on a Genie question about the same dataset, pass the returned `thread_id` so Genie keeps context instead of re-examining the schema.

## Timeout & Request Sizing

Databox's `load_metric_data` is per-metric, so individual calls are fast. The risk isn't timeout per call — it's volume. Each triage pull spec lists 6-8 metrics; that's 6-8 `load_metric_data` calls per platform per period. With YoY, double it.

**Rules:**
- Execute metrics sequentially within a platform (keeps error handling simple).
- If one metric 404s or errors → note in manifest, continue with the rest. Don't abort the whole platform for one missing metric.
- If most metrics fail → the data source may be disconnected or not yet synced. Score the platform ⚠️ ERROR.
- **YoY / comparison period** is still executed as a separate set of calls (different `start_date`/`end_date`). Store both sets in evidence JSON as `account_overview.current` and `account_overview.prior_year`.

## Connection vs. Query Failures

- If `list_metrics(data_source_id=N)` returns empty or errors → the data source isn't synced or the token is invalid. Do NOT retry metric pulls. Score as ⚠️ ERROR immediately and surface the issue to the user (they may need to reconnect the integration in Databox).
- If `list_metrics` returns metrics but `load_metric_data` errors on every one → same as above.
- If `load_metric_data` works for some metrics but not others → the specific metric keys may have been deprecated or not yet backfilled. Note which failed and continue.
- To confirm a failure is data-source-specific (not systemic Databox outage), test `list_metrics` on a different known-good data source.

## Platform → Data Source Type Mapping

Databox data source names/types vary by integration but typically follow these patterns. Use `list_data_sources` to see the exact `type` or `name` string; the cache should record the resolved `data_source_id` per platform per account.

| Platform | Typical Databox data source name(s) | Metric key prefix examples |
|----------|-------------------------------------|----------------------------|
| Google Ads | "Google Ads" | `GoogleAds@...` |
| Meta Ads | "Facebook Ads", "Meta Ads" | `FacebookAds@...` |
| Shopify | "Shopify" | `Shopify@...` |
| BigCommerce | "BigCommerce" | `BigCommerce@...` |
| GA4 | "Google Analytics 4" | `GoogleAnalytics4@...` |
| Amazon Ads | "Amazon Advertising", "Amazon Ads" | `AmazonAds@...` |
| Amazon Seller | "Amazon Seller Central" | `AmazonSeller@...` |

Custom/merged metrics show up with keys like `1234|custom_query_567` — pass the full string exactly as returned.

## Metric Tiers

**Tier 1 — Always pull (decision metrics):**

| Platform | Metrics (match to Databox metric_keys via list_metrics) |
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
Demographics, geographic breakdowns, video metrics, Brand Analytics SQR, monthly trends (only if lookback > 60d). Use `dimension` parameter on `load_metric_data` for breakdowns.

## Databox Response Behavior

**One metric in, one metric out.** Unlike Adzviser, Databox does NOT bundle related metrics. If you need Gross sales + Net sales + Orders, that's three `load_metric_data` calls.

**Metric names come from `list_metrics` — use them verbatim.** Some metrics are human-readable (`GoogleAds@clicks`), others are ID-based (`1234|custom_query_567`). Never fabricate or guess.

**Aggregation:** Pass `is_whole_range: true` for a single aggregated value across the date range. Pass `granulation_time_unit: 2` (day) for a daily time series. The two are mutually exclusive — setting a granulation auto-sets `is_whole_range` to false.

## Anti-Bloat Rules

- Never pull "Cost Per [action]" as a separate metric — calculate from Spend ÷ Action count
- Use `dimension` sparingly in triage. Triage is account totals only; breakdowns belong in deep-dive.
- When using dimensions, set `record_limit` (default 10) so you don't pull the full long tail.

## Fallback Protocol

1. Try Databox first (`load_metric_data` or `ask_genie`)
2. Try browser (Claude in Chrome) for UI-only checks that aren't exposed as Databox metrics
3. Mark DATA_NOT_AVAILABLE — never skip the check entirely

### Known Databox Gaps (Browser Fallback)

**Google Ads:** Conversion action settings, Enhanced Conversions toggle, Consent Mode v2, PMax asset details, Auction Insights
**Meta Ads:** Events Manager pixel status, CAPI implementation, Ad creative visual quality, ASC audience details
**Shopify:** COGS entry verification, theme/checkout assessment, app ecosystem, discount code structure
**GA4:** Conversion event configuration, attribution model setting, data stream config, Enhanced Measurement, Google Signals
**Amazon:** Listing quality (images, A+ content), Brand Registry status, SB video creative assessment

## Date Range Conventions

Lookback period is ALWAYS set during audit setup and stored in manifest. Calculate comparison period as same-length period immediately prior. When a user uses relative dates ("last month"), first call `get_current_datetime()` to resolve to absolute YYYY-MM-DD before calling `load_metric_data`.

## Data Integrity

- Every number cites "Source: Databox MCP" or "Source: Browser UI"
- Include the `metric_key` used in evidence JSON so the pull is reproducible
- Never invent numbers
- Show calculation formulas
- Handle gaps with DATA_NOT_AVAILABLE labels
