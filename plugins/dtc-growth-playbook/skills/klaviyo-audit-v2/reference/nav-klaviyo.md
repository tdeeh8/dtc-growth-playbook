# Klaviyo Navigation Patterns

Reference for navigating Klaviyo — both via MCP API tools and browser fallback. Used by the klaviyo-audit-v2 skill during data extraction.

---

## Method 1: Klaviyo MCP Tools (Preferred)

### Detection

At audit start, call `klaviyo_get_account_details`. If it returns account data, MCP is connected — use this path for everything.

### Tool Reference & Usage Patterns

#### Account & Profile Tools

**`klaviyo_get_account_details`**
- Returns: account name, timezone, contact info, industry
- Use: Phase 1 — confirm account identity, record metadata

**`klaviyo_get_profiles`**
- Returns: paginated list of profiles
- Use: Phase 4 — get total profile count, check for suppressed profiles
- Note: Pagination required for large lists. Use `page[size]` parameter.
- To count suppressed: filter with `filter=equals(subscriptions.email.marketing.suppressions.reason,'USER_SUPPRESSED')`

**`klaviyo_get_metrics`**
- Returns: list of all tracked metrics (Placed Order, Opened Email, Clicked Email, etc.)
- Use: Phase 1 — confirm which events are being tracked (especially Placed Order for revenue attribution)

#### Flow Tools

**`klaviyo_get_flows`**
- Returns: list of all flows with names, status (live/draft/manual), trigger type
- Use: Phase 1 — build flow inventory
- Key fields: `name`, `status`, `trigger_type`, `created`, `updated`

**`klaviyo_get_flow` (individual flow)**
- Parameters: flow_id
- Returns: flow details including action sequence, timing, filters
- Use: Phase 2 — inspect individual flow structure (message count, delays, branching)
- Navigate to each flow to check: number of messages, time delays, conditional splits, SMS inclusion

**`klaviyo_get_flow_report`**
- Parameters: flow_id, date range (optional)
- Returns: flow performance metrics — recipients, opens, clicks, revenue, bounces, unsubscribes
- Use: Phase 2 — capture per-flow performance
- Key metrics: `open_rate`, `click_rate`, `revenue`, `revenue_per_recipient`, `unsubscribe_rate`, `bounce_rate`
- Note: If date range is omitted, may return all-time data (preferred for flows)

#### Campaign Tools

**`klaviyo_get_campaigns`**
- Parameters: filter by status, date range
- Returns: paginated list of campaigns
- Use: Phase 1 + Phase 3 — inventory + performance
- Filter for sent campaigns: `filter=equals(messages.channel,'email')` or use status filter
- Sort by send date: `sort=-send_time`

**`klaviyo_get_campaign` (individual campaign)**
- Parameters: campaign_id
- Returns: campaign details — subject line, send time, audience, status
- Use: Phase 3 — check targeting (full list vs segment), subject lines

**`klaviyo_get_campaign_report`**
- Parameters: campaign_id
- Returns: campaign performance — recipients, opens, clicks, revenue, bounces, unsubscribes
- Use: Phase 3 — per-campaign performance metrics

#### List & Segment Tools

**`klaviyo_get_lists`**
- Returns: all lists with names and profile counts
- Use: Phase 1 + Phase 4 — inventory lists, check sizes
- Key fields: `name`, `profile_count`, `created`, `updated`

**`klaviyo_get_list` (individual list)**
- Parameters: list_id
- Returns: list details and profile count
- Use: Phase 4 — drill into specific lists for member counts

**`klaviyo_get_segments`**
- Returns: all segments with names
- Use: Phase 1 + Phase 5 — inventory segments
- Note: profile counts may require individual segment calls

**`klaviyo_get_segment` (individual segment)**
- Parameters: segment_id
- Returns: segment details including conditions/definition
- Use: Phase 5 — inspect segment logic to assess quality (engagement-based? purchase-based? behavioral?)

#### Metric Aggregation (Revenue & Trends)

**`klaviyo_query_metric_aggregates`**
- Parameters: metric_id, date range, filters, groupings
- Returns: aggregated metric data over time
- Use: Phase 3 (campaign trends), Phase 4 (bounce/complaint trends), Phase 6 (revenue attribution)
- **Revenue attribution pattern:**
  1. Get metric ID for "Placed Order" from `klaviyo_get_metrics`
  2. Query with `filter=equals($attribution_channel,'email')` for email-attributed revenue
  3. Query with `filter=equals($attribution_channel,'sms')` for SMS-attributed revenue
  4. Query with `filter=equals($flow,'[flow_id]')` for per-flow revenue
- **Trend analysis pattern:**
  1. Query with `by=["$day"]` or `by=["$week"]` for time-series data
  2. Compare recent period vs prior period for trend detection

#### Event Tools

**`klaviyo_get_events`**
- Parameters: metric filter, date range
- Returns: individual events (placed orders, email opens, etc.)
- Use: Spot-check data, verify integration is working
- Note: Use sparingly — individual events are expensive for large accounts. Prefer metric aggregates.

### MCP Workflow Sequence

Efficient order to minimize API calls:

```
1. klaviyo_get_account_details          → confirm account, record metadata
2. klaviyo_get_metrics                  → confirm Placed Order tracking exists
3. klaviyo_get_flows                    → full flow inventory
4. For each flow: klaviyo_get_flow      → structure details
5. For each flow: klaviyo_get_flow_report → performance metrics
6. klaviyo_get_campaigns (filtered)     → campaign inventory (last 90 days)
7. For top 20 campaigns: klaviyo_get_campaign_report → performance
8. klaviyo_get_lists                    → list inventory + sizes
9. klaviyo_get_segments                 → segment inventory
10. For key segments: klaviyo_get_segment → condition details
11. klaviyo_query_metric_aggregates     → revenue attribution (email vs SMS, flow vs campaign)
12. klaviyo_query_metric_aggregates     → trend data (bounce rates, complaint rates over time)
```

### MCP Limitations & Workarounds

- **Pagination:** Most list endpoints paginate at 20-50 items. Always check for `next` cursor and paginate until complete.
- **Rate limits:** Klaviyo API has rate limits. If you get 429 errors, wait and retry.
- **Revenue attribution:** The API may not break revenue into flow vs campaign natively. Use metric aggregates with flow/campaign filters.
- **Deliverability metrics:** Inbox placement rates may NOT be available via API (Klaviyo tier-dependent). Note as DATA_NOT_AVAILABLE if not present.
- **Segment member counts:** May require a separate call per segment. Batch these efficiently.
- **Date ranges:** Flow reports default to all-time. Campaign reports need explicit date filtering.

---

## Method 2: Browser Fallback (Claude in Chrome)

Use this when MCP tools are not connected. Navigate the Klaviyo web UI.

### Login & Account Access

1. Navigate to `https://www.klaviyo.com/login`
2. If already logged in, navigate to `https://www.klaviyo.com/dashboard`
3. If multiple accounts: use the account switcher (top-left dropdown) to select the correct account
4. Confirm account name matches the client

### Dashboard Overview

**URL:** `https://www.klaviyo.com/dashboard`

The dashboard shows summary metrics. Capture:
- Total revenue attributed to Klaviyo (default period — note the date range shown)
- Key metrics cards (if present): total recipients, open rate, click rate, revenue

**Date range adjustment:**
- Look for a date picker in the top-right of the dashboard
- Set to the audit period (default: last 90 days for campaigns, all-time for flows)
- Note: dashboard may not have granular date control — use individual sections instead

### Flows Section

**URL:** `https://www.klaviyo.com/flows`

1. **Flow list view:**
   - Shows all flows with status (Live, Draft, Manual)
   - Look for filter/sort options to see all flows
   - Record: flow name, status, trigger type
   - Use `read_page` or `get_page_text` to capture the flow list

2. **Individual flow analytics:**
   - Click into each flow → click "Analytics" or "Performance" tab
   - Capture: recipients, open rate, click rate, revenue, RPR, unsubscribe rate, bounce rate
   - Note: metrics may default to last 30 days — adjust if possible
   - URL pattern: `https://www.klaviyo.com/flow/{flow_id}/analytics`

3. **Flow builder view:**
   - Click into flow → view the flow diagram
   - Count: number of email messages, SMS messages, time delays, conditional splits
   - Note: the visual builder shows the entire sequence — capture structure via `read_page`

### Campaigns Section

**URL:** `https://www.klaviyo.com/campaigns`

1. **Campaign list view:**
   - Shows sent campaigns with send date, recipients, open rate, click rate
   - Filter to "Sent" status
   - Sort by send date (most recent first)
   - Look for pagination — may need to scroll or page through

2. **Individual campaign report:**
   - Click campaign name → view report
   - Capture: recipients, open rate, click rate, revenue, RPR, unsubscribe rate, bounce rate
   - Check: which list/segment it was sent to (in campaign details)
   - URL pattern: `https://www.klaviyo.com/campaign/{campaign_id}/report`

3. **Campaign analytics (aggregate):**
   - Look for a "Campaign Analytics" or "Performance" overview page
   - If available, capture: total sends, average open rate, average click rate over time

### Audience / Lists & Segments

**URL:** `https://www.klaviyo.com/lists`

1. **Lists tab:**
   - Shows all lists with member counts
   - Capture: list name, member count, type (single opt-in, double opt-in)
   - Identify the main email list and SMS consent list

2. **Segments tab:**
   - URL: `https://www.klaviyo.com/lists` → click "Segments" tab (or `https://www.klaviyo.com/segments`)
   - Shows all segments with member counts
   - Click into key segments to view their conditions
   - Capture: segment name, member count, condition logic

3. **Profiles overview:**
   - URL: `https://www.klaviyo.com/profiles`
   - May show total profile count, suppressed count
   - Check for suppression list or suppressed profiles section

### Analytics / Revenue Section

**URL:** `https://www.klaviyo.com/analytics` or dashboard analytics

1. **Revenue dashboard:**
   - Look for: total attributed revenue, flow revenue, campaign revenue split
   - May be shown as a pie chart or table
   - Note the date range carefully

2. **Deliverability (if available):**
   - URL: `https://www.klaviyo.com/analytics/deliverability` (paid tiers only)
   - Capture: inbox placement rate, bounce rate trends, complaint rate trends
   - If not available: note as DATA_NOT_AVAILABLE

### SMS Section (If Applicable)

**URL:** May be integrated into flows/campaigns or under `https://www.klaviyo.com/sms`

1. Check if SMS is enabled (look for SMS tab or SMS metrics in flows/campaigns)
2. If enabled: capture SMS consent list size, SMS campaign metrics, SMS flow metrics
3. SMS metrics are often shown alongside email metrics in flow/campaign analytics — look for a channel toggle or tab

### Browser Navigation Tips

- **Page load delays:** Klaviyo can be slow to load analytics. Wait for data to populate before reading.
- **Lazy loading:** Metric cards may load asynchronously. Use `read_page` after a brief wait if data appears missing.
- **Pagination:** Campaign and flow lists may paginate. Check for "Load more" or page controls at the bottom.
- **Data export:** Some Klaviyo views offer CSV export — this can be faster than reading individual items. Look for "Export" buttons.
- **Date pickers:** When changing date ranges, confirm the change took effect before reading data. Some views don't auto-refresh.
- **Multiple tabs:** If the account has many flows/campaigns, consider opening multiple tabs to avoid repeated navigation.

### Browser URL Quick Reference

| Section | URL |
|---|---|
| Dashboard | `https://www.klaviyo.com/dashboard` |
| Flows | `https://www.klaviyo.com/flows` |
| Flow detail | `https://www.klaviyo.com/flow/{id}` |
| Flow analytics | `https://www.klaviyo.com/flow/{id}/analytics` |
| Campaigns | `https://www.klaviyo.com/campaigns` |
| Campaign report | `https://www.klaviyo.com/campaign/{id}/report` |
| Lists | `https://www.klaviyo.com/lists` |
| Segments | `https://www.klaviyo.com/segments` |
| Profiles | `https://www.klaviyo.com/profiles` |
| Analytics | `https://www.klaviyo.com/analytics` |
| Signup forms | `https://www.klaviyo.com/signup-forms` |
| Account settings | `https://www.klaviyo.com/settings/account` |
