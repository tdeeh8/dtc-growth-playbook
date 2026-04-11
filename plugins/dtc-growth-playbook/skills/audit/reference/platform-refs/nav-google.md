# Google Ads UI Navigation Patterns

Reference for the google-ads-audit-v2 audit skill. Contains browser automation workarounds, known UI quirks, and reliable extraction patterns learned from live audits.

---

## Getting Into the Account

1. Navigate to `https://ads.google.com`
2. If you land on an MCC (multiple accounts listed), click into the correct client account
3. Verify the account ID in the top-left matches what's expected
4. You should land on the Overview page — don't pull data from here (it uses a default date range and shows curated metrics). Always navigate to Campaigns view first.

---

## Date Picker — The JavaScript Workaround

**The problem:** Google Ads' date picker is finicky with browser automation. Clicking the date fields, typing dates, and clicking "Apply" often fails silently — the page appears to accept the dates but doesn't actually update the data. The date picker uses Material Design components (`material-button` elements) that don't always respond to standard click events.

**The reliable workaround:**

Use JavaScript to set the date range via URL parameters. Google Ads respects date parameters in the URL:

```
Add to the current URL: &startDate=YYYYMMDD&endDate=YYYYMMDD
```

For example, to set YTD for 2026:
```
&startDate=20260101&endDate=20260410
```

**Steps:**
1. Navigate to the Campaigns page
2. Note the current URL
3. Append `&startDate=YYYYMMDD&endDate=YYYYMMDD` to the URL (or modify existing date params)
4. Navigate to the modified URL
5. Verify the date range updated by checking the date picker display

**Alternative method (if URL params don't stick):**
Use JavaScript execution to interact with the date picker:
```javascript
// Click the date range selector to open it
document.querySelector('[data-date-range]')?.click();
// Or find the date display element and click it
```

Then manually type dates into the input fields and click the "Apply" button. The Apply button is a `material-button` element — you may need to use `javascript_tool` to click it:
```javascript
// Find and click the Apply button
document.querySelector('material-button[debug-id="apply-button"]')?.click();
```

**After setting dates:** Always verify by checking what the date picker now displays. If it still shows a different range, the change didn't take. Retry with the URL parameter method.

**Important:** Some Google Ads URL parameters are silently ignored on navigation. Date parameters generally work, but if you're being redirected, the params may be stripped. In that case, navigate first, then modify the URL in place.

---

## Campaign Table (ag-Grid) Extraction

Google Ads uses ag-Grid for its data tables. Key patterns:

### Reading the Table

- Use `read_page` to capture the visible table content
- The table often has more columns than fit on screen — **columns to the right may be cut off**
- If you need off-screen columns (like Conv Value, ROAS, CPA), either:
  - Scroll the table right and re-read
  - Use `read_page` which typically captures the full DOM including off-screen content
  - Navigate to a campaign's detail view to see all metrics

### The Totals Row

- The totals row at the bottom of the campaigns table contains account-level aggregates
- This is the most reliable source for account-level metrics
- It includes: Cost, Conversions, Conv. value, All conv., All conv. value, Impressions, Clicks, CTR, Avg. CPC, ROAS (if column is visible)
- If ROAS isn't shown in the totals row, calculate it: Conv. value / Cost

### Column Customization

If key columns aren't visible:
1. Click "Columns" button (above the table, right side)
2. Search for the metric name
3. Add it to the view
4. The table will refresh with the new column

Common columns to add if missing: Conv. value, ROAS, All conv., Cost/conv., Impression share, Search impr. share

### Sorting and Filtering

- Click column headers to sort
- Use the filter icon to filter by campaign type, status, etc.
- Filter by "Eligible" status to see only active campaigns
- Filter by campaign type (Search, Shopping, Performance Max) for focused analysis

---

## Navigation Paths for Key Sections

### Campaign-Level Data
```
Campaigns (left nav) → All campaigns → [table view]
```

### Conversion Actions Inventory
```
Goals (left nav) → Conversions → Summary
```
Lists all conversion actions with: Name, Source, Category, Status, Optimization goal, Conv. count type, Include in "Conversions", All conv., All conv. value

### Conversion Action Details
Click on any conversion action name to see:
- Settings (attribution model, counting method, click-through window, view-through window)
- Recent conversion data
- Tag status (active/inactive/unverified)

### PMax Search Term Insights
```
Campaigns → [select PMax campaign] → Insights and reports → Search terms
```
Or at account level:
```
Insights and reports (left nav) → Search terms
```
Filter by campaign to isolate PMax search terms. Look for the "Categories" view which groups terms into branded, competitor, generic, etc.

### PMax Asset Group Performance
```
Campaigns → [select PMax campaign] → Asset groups → [select asset group]
```
Shows: Asset performance ratings (Low/Good/Best), ad strength, individual asset metrics

### Auction Insights
```
Campaigns → [select campaign] → Auction insights
```
Or at keyword level:
```
Keywords → [select keywords] → Auction insights
```
Shows: Impression share, Overlap rate, Position above rate, Top of page rate, Abs. top of page rate

### Search Terms Report (for Search campaigns)
```
Keywords (left nav) → Search terms
```
Shows actual queries that triggered ads. Use date range filter. Look for irrelevant terms that need negative keywords.

### Quality Score
```
Keywords (left nav) → Search keywords → Add "Quality Score" column if not visible
```
Also available: Quality Score (hist.), Expected CTR, Ad relevance, Landing page experience

### Change History
```
Change history (left nav)
```
Useful for: understanding when campaigns were paused/enabled, when budgets changed, when bid strategies changed. Filter by change type.

---

## Recommendations Page — Handle With Care

Google's Recommendations page (`Recommendations` in left nav) shows Google's suggested optimizations with an "Optimization Score."

**Use it for signal, not for action:**
- It reveals what Google thinks is wrong (budget limits, bid strategy suggestions, keyword expansions)
- It often recommends things that benefit Google's revenue more than the advertiser's
- "Apply all" is almost always wrong
- Useful audit signals: if Google recommends increasing budget on a campaign, and the campaign is profitable + budget-limited, that corroborates your finding

**Extract the recommendation list** for working notes — it's a quick signal of what Google's algorithm considers suboptimal in the account.

---

## Known UI Gotchas

### Page Load Timing
- Google Ads pages load progressively — the table structure appears before data populates
- Wait for the data to fully load before reading (look for the totals row to have values, not dashes)
- If you read too early, you'll get placeholder values or empty cells

### Metric Format Discrepancies
- Cost shows as local currency (usually USD) with commas: "$22,859.21"
- ROAS may show as percentage (506%) or ratio (5.06) depending on column configuration
- Conversions may show decimal values (83.36) due to fractional/modeled conversions
- "All conversions" includes secondary conversion actions; "Conversions" includes only primary

### "All Conversions" vs "Conversions"
- **Conversions:** Only actions marked "Include in Conversions" = Yes (primary goals)
- **All conversions:** Everything — primary + secondary + cross-device modeled + view-through
- For ROAS/CPA analysis, use the "Conversions" column (matches what Smart Bidding optimizes toward)
- For tracking health audit, use "All conversions" (captures everything that's being tracked)

### Budget Status Labels
- **Eligible:** Campaign is running normally
- **Limited by budget:** Campaign ran out of daily budget on some days — Google has data on how much more could be spent
- **Learning:** Bid strategy recently changed, gathering data (allow 15 days)
- **Limited (other):** Could be targeting, ad disapprovals, or policy issues — click for details

### Date Range Persistence
- Setting a date range on the Campaigns page usually persists as you navigate to sub-pages
- BUT: some pages (like Recommendations, some Insights views) reset to their own default range
- Always verify the date range on each page before pulling numbers
- The PMax Insights page often defaults to "Last 28 days" regardless of your campaign-level date range

### Multiple Tabs / Windows
- If you have multiple Google Ads tabs open, they share the same session
- Changing the date range in one tab may affect others
- Stick to one tab per audit to avoid confusion

---

## Data Extraction Tips

### For Large Tables
If a campaign table has many rows:
- Sort by Cost (descending) to see highest-spend campaigns first
- The top 5-10 campaigns by spend typically represent 80-90% of total spend
- Don't miss paused campaigns with significant historical spend — sort by "All time" briefly to check

### For PMax Search Terms
- The search terms view for PMax shows "Search term categories" (grouped) and "Search terms" (individual)
- Categories view is more useful for branded cannibalization detection — look for your brand name in categories
- Individual search terms may be heavily anonymized ("other search terms" bucket)

### Capturing Screenshots
If you need to capture specific UI elements for evidence:
- Use `read_page` for text-based data extraction (more reliable)
- Screenshots are useful for: ad strength indicators, asset ratings, diagnostic cards, recommendation summaries
- Always pair screenshots with text-extracted data — don't rely on screenshots alone for numbers

### Exporting Data
Google Ads allows CSV/Excel downloads from most table views:
- Look for the download icon (↓) above the table
- This is useful for large datasets that are hard to read page-by-page
- Downloaded data respects the current date range and filters
- Note: not all views support download (some Insights pages don't)
