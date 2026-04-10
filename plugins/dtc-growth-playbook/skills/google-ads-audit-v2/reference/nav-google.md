# Google Ads UI Navigation Patterns

Reference for the google-ads-audit-v2 audit skill. Contains browser automation patterns, column customization steps, report extraction patterns, date range setting, and known UI gotchas for Google Ads.

---

## Getting Into Google Ads

1. Navigate to `https://ads.google.com` or `https://google.com/ads`
2. If multiple ad accounts are available, select the correct one from the account dropdown (top-left)
3. Verify the account ID matches what's expected
4. You should land on the Campaigns view — this is the correct starting view
5. Check your access level: can you see all campaigns? Can you access conversion settings? Note the role for evidence file

---

## Date Range Setting

**The date picker** is in the top-right area of the Google Ads interface.

**Steps:**
1. Click the date range selector (e.g., "Last 30 days" or "Apr 1 - Apr 30")
2. Select a preset or click "Custom date range"
3. Enter start and end dates manually
4. Click "Apply"
5. **Verify:** After setting, confirm the date range displayed matches your selection

**Default for audits:** Last 90 days (or audit manifest specified range)

**Gotcha — Date range persistence:**
- The date range generally persists as you navigate between different views within Google Ads
- BUT: Some report builders may reset to default (last 30 days)
- Always verify the date range on each new page before extracting data

**Gotcha — Timezone:**
- Google Ads displays data in the ad account's timezone setting (not your local timezone)
- This matters for reconciliation with GA4 (which may use different timezone)
- Note the account timezone if there's a discrepancy risk

**Gotcha — Jan 2026 Attribution Window Change:**
- If an account was active before Jan 2026, historical data viewed in Google Ads NOW uses the current attribution window (7-day click or 1-day click + 1-day view)
- Historical data is NOT shown in the old window — it's been reprocessed
- This makes YoY comparisons misleading
- Always note the current attribution window when pulling historical data

---

## Column Customization (MANDATORY Before Data Extraction)

**This is the single most important navigation step.** Default Google Ads columns are insufficient for an audit. You MUST customize columns to see real metrics.

### How to Customize Columns

1. Click the **"Columns"** button (above the data table, right side — usually labeled "Columns" with a dropdown arrow)
2. Select **"Modify columns"** from the dropdown
3. The column customization panel opens

### Required Column Set for Audit

Add these columns (search by name in the customization panel):

**Spending & Results:**
- Cost
- Conversions
- Cost per Conversion (CPA equivalent)
- Conv. Value
- Return on Ad Spend (ROAS)

**Delivery:**
- Impressions
- Clicks
- Interaction Rate (CTR)
- Cost per Click (CPC)
- Avg. CPM

**Quality & Performance (Critical for diagnosis):**
- Avg. Quality Score (for Search ads)
- Quality Score Distribution (shows %, %, % for scores 1-3, 4-6, 7-10)
- First Page Bid Estimate

**Conversion Tracking:**
- Primary Conversion Category
- Conv. Value per Click

**Important distinction for CTR:**
- **Interaction Rate:** Count of interactions (clicks) / impressions. Use this one for Search audit.
- **View-Through Conversion Rate (VTCR):** For Display/Video only. Not applicable to Search.
- Make sure you're looking at Interaction Rate, not VTCR.

### Saving Column Presets

After customizing columns:
1. Click **"Save this column set"**
2. Name it something like "Audit - Full Metrics" or "Deep Audit"
3. This saves time if you need to return to this view later

### Column Order

Google Ads displays columns left-to-right in the table. Arrange the most critical metrics first:
1. Cost
2. Conversions
3. Cost per Conversion
4. ROAS
5. Impressions, Clicks, Interaction Rate
6. Avg. Quality Score, Quality Score Distribution
7. Conv. Value

---

## Reading the Data Table

### Campaign View
```
Campaigns tab → shows all campaigns with aggregate metrics
```
- Each row is one campaign
- The **totals row** at the bottom aggregates all active campaigns
- Use the totals row for account-level metrics
- Sort by "Cost" (descending) to see highest-spend campaigns first

### Ad Group View
```
Click on a campaign name → shows all ad groups within that campaign
```
- Or: Click the "Ad groups" tab at the top to see ALL ad groups across campaigns
- Each ad group shows targeting settings, budget (if set), delivery status, and performance metrics
- This is where you review Quality Score by ad group
- For Search, check: Are branded and non-branded ad groups in the same campaign? (Should be separate)

### Ads View
```
Click on an ad group name → shows all ads within that ad group
```
- Or: Click the "Ads & extensions" tab at the top to see ALL ads across all ad groups
- This is where you review ad copy freshness and RSA (Responsive Search Ad) composition
- Check: Are RSAs recent (created in the last 30 days), or are they old and stale?

### Keywords View
```
Click on an ad group name → scroll down to "Keywords" section
```
- Shows all keywords in the ad group with match type, bid, Quality Score, and performance
- Use this to analyze match type split (Exact vs Broad vs Phrase) and identify negative keyword gaps

### Search Terms View (HIDDEN BY DEFAULT — SEE GOTCHA BELOW)
```
From the Keywords tab, click "Search Terms" (top of the data table)
```
- Shows actual search queries that triggered ads (not the keywords you bid on)
- This is critical for PMax diagnosis: are search terms being triggered, or is PMax relying purely on audience matching?
- Filter by "Impr." (impressions) > 10 to reduce noise
- Look for high-spend irrelevant terms and add them to negative keywords

### Reading Large Tables
- Google Ads paginates at ~50 rows by default
- Look for the pagination controls at the bottom
- For large accounts, filter by status = "Enabled" first to reduce noise
- Use horizontal scrolling to capture columns that don't fit on screen

---

## Breakdown Extraction

Breakdowns add a secondary dimension to performance data. Essential for placement and device analysis.

### How to Access Breakdowns

1. Click the **"Columns"** dropdown and look for a "Breakdown" option, OR
2. Click the **"Segment"** or **"Breakdown"** button (location varies by Google Ads UI version)
3. Select a breakdown category

### Key Breakdowns for Audit

**By Network:**
Shows performance on Google Search, Google Display Network, Google Shopping, YouTube, etc.

**By Device:**
Shows Mobile, Desktop, Tablet performance

**By Top Search Terms (PMax only):**
Shows which search queries triggered the PMax campaign. Critical for PMax diagnosis.

**By Placement (Display/YouTube):**
Shows which sites/placements received impressions

### Breakdown Gotchas
- Only one breakdown can be active at a time (you can't cross-tab network × device)
- Breakdowns replace the totals row — you lose aggregate view while a breakdown is active
- Remove the breakdown before applying a different one

---

## Conversion Actions Inspection

**Path:** Settings → Conversions

Shows all conversion actions configured in the account.

### What to Check

- **Conversion Action List:** Which actions exist? What category? (Purchase, Lead, Signup, etc.)
- **Status:** Is each action tracking or paused? Is it counting towards campaign optimization?
- **Lookback Window:** What's the conversion lookback window? (30 days, 60 days, 90 days?)
- **Attribution Model:** How are multi-touch conversions attributed? (Last click, data-driven, etc.)
- **Duplicate Conversion Detection:** Does the account have MULTIPLE Purchase events? (High risk of double-counting)
- **Click-through Conversion Delay:** Are conversions being counted significantly after the click? (May indicate tracking lag)
- **Dead Actions:** Any conversion actions with zero conversions in the audit period?

### Evidence JSON Mapping

```json
{
  "title": "Duplicate Purchase event detected — two Purchase actions active",
  "label": "OBSERVED",
  "evidence": "Conversion Actions in Settings show two actions: 'Purchase' (counting) and 'Purchase_v2' (also counting). Both have substantial conversion volume in the audit period.",
  "source": "Google Ads > Settings > Conversions",
  "significance": "Risk of double-counting purchase conversions. Recommend deactivating one action and consolidating all conversion tracking into a single Purchase event."
}
```

---

## Campaign Settings Inspection

For assessing campaign-level configuration.

**Path:** Click campaign name → Settings

Key settings to check:
- **Campaign Objective:** Sales, Leads, Website traffic, Product & Brands, App Promotion, Brand awareness & reach
- **Campaign Type:** Search, Display, Shopping, Performance Max (PMax), YouTube, Discovery
- **Networks:** Google Search, Google Display Network, YouTube (varies by campaign type)
- **Budget Type:** Daily or Total (lifetime)
- **Budget Amount:** Daily or lifetime spend limit
- **Bid Strategy:** Manual CPC, Maximize Conversions, Target CPA, Target ROAS, Maximize Clicks
- **Attribution Window:** 7-day, 30-day, 60-day, or 90-day click-through window
- **Campaign URL Options:** Whether final URL expansion is enabled (for PMax)

---

## Ad Group Settings Inspection

**Path:** Click ad group name → Settings

Key settings:
- **Targeting:** Keywords + match types, Audiences (if any), Topics (Display), Placements (Display)
- **Bid Strategy:** Inherited from campaign, or ad group-level override?
- **Max CPC Bid:** For manual bidding campaigns
- **Ad Rotation:** Optimize or rotate evenly?
- **Audience Targeting:** Observation or targeting? (Recommend observation for Search)

---

## PMax Search Terms Report (HIDDEN BY DEFAULT)

**Critical Gotcha:** By default, Google Ads does NOT show the Search Terms report for PMax campaigns. You must unhide it.

**Path:** Click PMax campaign → Click "Assets" tab or "Ad groups" tab → Look for "Search Terms" link in the data table

If you don't see "Search Terms" link:
1. Click "Segments" dropdown (above data table)
2. Select "Search term" breakdown
3. This shows search queries that triggered the PMax campaign

**What to look for:**
- Are search terms being populated? (If blank or very low volume, PMax is relying on audience/intent matching instead of search optimization)
- Are the search terms relevant to the campaign? (If not, the campaign is too broad)
- High-spend irrelevant terms → add to negative keywords

---

## Known UI Gotchas

### Page Load Timing
- Google Ads loads progressively — tables appear before data populates
- Wait for data to fully load: look for actual numbers in the totals row (not loading spinners or dashes)
- If you read too early, you'll get incomplete or zero data

### "Limited by Budget" Status
- If a campaign shows "Limited by budget" in the status column, the daily budget is capping delivery
- This doesn't mean there's a problem, but it means the campaign could spend more if budget increased
- Check bid strategy effectiveness separately — the budget cap may be the right level

### Quality Score Interpretation
- Quality Score ranges 1-10 (higher is better)
- Google Ads shows aggregate distribution, not individual keyword scores
- Quality Score is calculated PER ad group, not per keyword — you can't drill into individual keyword scores in the modern UI
- Expected QS distribution: 40-50% in scores 7-10, 30-40% in scores 4-6, 10-20% in scores 1-3

### Attribution Window Display
- After Jan 2026 changes, available windows are: 1-day click, 7-day click, 1-day click + 1-day view
- 7-day view and 28-day view options are gone
- If an account was running before Jan 2026, historical data shown in Ads Manager NOW uses the current attribution window — not what was active when the ads ran
- This makes historical comparisons misleading

### Currency and Formatting
- Spend shows in the ad account's currency (not necessarily USD)
- Some accounts use periods for thousands separators (European format): 1.234,56 instead of 1,234.56
- Note the currency and format in working notes to avoid parsing errors

### PMax vs Search Campaign Reports Differ
- Search campaign reports show: Keywords, Search Terms, Ad Groups, Ads
- PMax campaign reports show: Assets, Asset Groups, Search Terms (if unhidden), Diagnostics
- You can't access keyword-level data in PMax — it's fully automated

### "Recommended" Actions in Diagnostics
- Google Ads shows AI-generated recommendations in the Diagnostics card
- Some recommendations are valuable (pause low-performing keywords), some are opportunistic (increase budget)
- Recommendations are not auditor findings — use them as signals, not directives
