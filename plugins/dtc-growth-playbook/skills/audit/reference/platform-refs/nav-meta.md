# Meta Ads Manager UI Navigation Patterns

Reference for the meta-ads-audit-v2 audit skill. Contains browser automation patterns, column customization steps, breakdown extraction, date range setting, and custom report building for Meta Ads Manager.

---

## Getting Into Ads Manager

1. Navigate to `https://adsmanager.facebook.com` or `https://business.facebook.com/adsmanager`
2. If multiple ad accounts are available, select the correct one from the account dropdown (top-left, near the account name/ID)
3. Verify the account ID matches what's expected
4. You should land on the Campaigns tab — this is the correct starting view
5. Check that you have the right permissions level: can you see spend data? Can you see Events Manager? Note the access level for the evidence file.

---

## Date Range Setting

**The date picker** is in the top-right area of Ads Manager.

**Steps:**
1. Click the date range display (e.g., "Last 7 days" or "Apr 1 - Apr 10")
2. Select "Custom" from the preset options
3. Enter the start date and end date manually
4. Click "Update" or "Apply"
5. **Verify:** After setting, confirm the date range displayed matches your selection. Ads Manager sometimes silently reverts to a preset.

**Default for audits:** YTD (January 1 of current year through today). If the audit manifest specifies a different range, use that.

**Gotcha — Date range persistence:**
- The date range generally persists as you navigate between Campaign, Ad Set, and Ad views within the same Ads Manager session
- BUT: Events Manager has its own date range selector — it does NOT inherit from Ads Manager
- Custom reports may also reset to their own defaults
- Always verify the date range on each new page before extracting data

**Gotcha — Timezone:**
- Ads Manager displays data in the ad account's timezone setting (not your local timezone)
- This matters for reconciliation with Shopify or GA4 (which may use different timezones)
- Note the account timezone if there's a discrepancy risk

---

## Column Customization (MANDATORY Before Data Extraction)

**This is the single most important navigation step.** Default Ads Manager columns are insufficient for an audit. You MUST customize columns to see real metrics.

### How to Customize Columns

1. Click the **"Columns"** dropdown button (above the data table, right side — labeled "Columns: Performance" or whatever preset is active)
2. Select **"Customize Columns..."** from the dropdown
3. The column customization panel opens on the right side

### Required Column Set for Audit

Add these columns (search by name in the customization panel):

**Spending & Results:**
- Amount Spent
- Results (primary optimization event)
- Cost per Result
- Purchase ROAS (Return on Ad Spend for purchases)
- Website Purchases
- Website Purchase Conversion Value
- Cost per Purchase

**Delivery:**
- Impressions
- Reach
- Frequency
- CPM (Cost per 1,000 impressions)

**Clicks & Engagement:**
- Link Clicks
- CTR (Link Click-Through Rate) — NOT "CTR (All)" which includes reactions/comments
- CPC (Cost per Link Click) — NOT "CPC (All)"

**Video Metrics (for creative analysis):**
- ThruPlay Views (video watched to completion or 15s, whichever comes first)
- Video Plays at 25%
- Video Plays at 50%
- Video Plays at 75%
- Video Plays at 100%
- 3-Second Video Views (used for hook rate calculation)

**Funnel Metrics (for conversion path analysis):**
- Adds to Cart (Website)
- Initiates Checkout (Website)
- Content Views (Website)

**Important distinction:**
- **CTR (Link Click-Through Rate):** Only counts link clicks (clicks that leave Facebook/Instagram). Use this one.
- **CTR (All):** Includes likes, comments, shares, post saves, profile clicks. Inflated and misleading for performance analysis.
- **CPC (Cost per Link Click):** Cost per link click only. Use this one.
- **CPC (All):** Cost per any click. Misleading.

### Saving Column Presets

After customizing columns:
1. Click **"Save as Preset"** at the bottom of the customization panel
2. Name it something like "Audit - Full Metrics" or "Deep Audit"
3. This saves time if you need to return to this view later

### Column Order

Ads Manager displays columns left-to-right in the table. The first few columns are always visible; later columns require horizontal scrolling. Arrange the most critical metrics first:
1. Amount Spent
2. Purchase ROAS
3. Website Purchases
4. Cost per Purchase
5. Impressions, Reach, Frequency
6. Link Clicks, CTR, CPC, CPM
7. Video metrics
8. Funnel metrics

---

## Reading the Data Table

### Campaign View
```
Campaigns tab → shows all campaigns with aggregate metrics
```
- The **totals row** at the bottom aggregates all active campaigns (or all filtered campaigns)
- Use the totals row for account-level metrics
- Sort by "Amount Spent" (descending) to see highest-spend campaigns first

### Ad Set View
```
Click on a campaign name → shows all ad sets within that campaign
```
- Or: Click the "Ad Sets" tab at the top to see ALL ad sets across campaigns
- Each ad set shows targeting settings, budget, delivery status, and performance metrics

### Ad View
```
Click on an ad set name → shows all ads within that ad set
```
- Or: Click the "Ads" tab at the top to see ALL ads across all ad sets
- This is where creative-level performance data lives
- Each ad shows the creative preview (if accessible), format type, and all performance metrics

### Reading Large Tables
- Ads Manager paginates at ~50 rows by default
- Look for the "Show more" link or pagination controls at the bottom
- For very large accounts, filter by campaign status = "Active" first
- Use horizontal scrolling (or read_page) to capture columns that don't fit on screen

---

## Breakdown Extraction

Breakdowns add a secondary dimension to performance data. Essential for placement analysis and demographic insights.

### How to Access Breakdowns

1. Click the **"Breakdown"** button (next to the Columns button, above the data table)
2. Select a breakdown category:
   - **By Delivery:** Placement, Platform, Device, Time (day/week/month)
   - **By Action:** Conversion device, Destination, Product ID
   - **By Time:** Day, Week, 2 Weeks, Month

### Key Breakdowns for Audit

**Placement Breakdown (By Delivery → Placement):**
Shows performance by: Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, Instagram Explore, Audience Network, Messenger, Facebook Marketplace, Facebook Video Feeds, etc.

What to look for:
- Which placements consume the most spend?
- Are any placements significantly underperforming (higher CPA, lower ROAS)?
- Audience Network often has the worst quality — is it consuming meaningful budget?
- Instagram Reels and Stories may have very different CPA vs. Feed

**Platform Breakdown (By Delivery → Platform):**
Shows: Facebook, Instagram, Audience Network, Messenger
- Simpler than placement but useful for high-level platform split

**Device Breakdown (By Delivery → Device):**
Shows: Mobile, Desktop, Tablet
- If mobile CPA is 2x+ desktop, potential mobile UX issue (flag for site audit)

**Time Breakdown (By Time → Week):**
Shows weekly performance trends
- Essential for frequency vs. CTR trend analysis (fatigue detection)
- Look for the inflection point where performance degrades

### Breakdown Gotchas
- Breakdowns split the totals row — the aggregate row disappears while a breakdown is active
- Only one breakdown can be active at a time (you can't cross-tab placement × device)
- Some breakdowns show "(not set)" or "(unknown)" for a portion of data — this is normal
- Remove the breakdown (click Breakdown → Clear) before switching to a different breakdown

---

## Events Manager Navigation

For CAPI/pixel health checks (Phase 5 of the audit).

### Getting to Events Manager
```
Business Settings → Data Sources → Pixels
```
Or navigate directly: `https://business.facebook.com/events_manager`

### Event Quality Tab
```
Events Manager → select the pixel → "Event Quality" tab
```
- Shows Event Match Quality (EMQ) score per event type (0-10 scale)
- Focus on the Purchase event EMQ — target 8+/10
- Click into an event to see which parameters are being passed (event_id, fbp, fbc, etc.)

### Test Events
```
Events Manager → select the pixel → "Test Events" tab
```
- Used to verify deduplication: place a test order and confirm Purchase fires exactly once
- Shows real-time event activity with source labels (Browser, Server, etc.)
- If Purchase appears twice (one Browser, one Server) WITHOUT deduplication → broken

### Diagnostics Tab
```
Events Manager → select the pixel → "Diagnostics" tab
```
- Shows active warnings and errors
- Common issues: missing parameters, deduplication failures, delayed server events
- Severity labels: Critical, Warning, Info

### Data Sources Overview
```
Events Manager → Overview
```
- Shows all connected data sources (pixels, apps, offline event sets)
- Verify only one active pixel is connected (multiple pixels = likely duplication)
- Check for offline event sets (may be used for conversions API)

---

## Campaign Settings Inspection

For assessing ASC configuration and campaign-level settings.

### Advantage+ Shopping Campaign (ASC) Settings
```
Click campaign name → "Edit" or settings gear icon
```

Key settings to check:
- **Existing Customer Budget Cap:** The percentage cap for spend on existing customers. Should be 25-30%. If not set or >50%, ASC defaults to retargeting.
- **Customer Definition:** How are "existing customers" defined? (pixel-based, customer list, both?)
- **Geographic Targeting:** What geos are included?
- **Optimization Event:** What is the campaign optimizing for? (Purchase, ATC, etc.)
- **Attribution Setting:** What attribution window is configured?
- **Budget Type:** Daily vs. lifetime budget

### Manual Campaign Settings
```
Click campaign name → "Edit" → Campaign level settings
```

Key settings:
- **Campaign Objective:** Sales, Traffic, Engagement, Leads, Awareness, App Promotion
- **Campaign Budget Optimization (CBO):** Is budget set at campaign level or ad set level?
- **Bid Strategy:** Lowest Cost, Cost Cap, Bid Cap, Minimum ROAS
- **Special Ad Categories:** Any restrictions (housing, credit, employment)?

### Ad Set-Level Targeting
```
Click ad set name → "Edit" → Audience section
```

Shows:
- **Audience type:** Advantage+ Audience, Custom Audience, Lookalike, Saved Audience
- **Custom Audience sources:** Website visitors, customer list, video viewers, page engagers
- **Exclusions:** Which audiences are excluded
- **Demographics:** Age, gender, location restrictions
- **Detailed Targeting:** Interests, behaviors (if using manual targeting)
- **Placements:** Advantage+ Placements (automatic) or Manual Placements

---

## Custom Report Building

For extracting specific data views that aren't available in the standard table.

### Ads Reporting Tool
```
Navigate to: https://business.facebook.com/adsmanager/reporting
```
Or: Ads Manager → "Reports" dropdown → "Create Custom Report"

**Useful custom reports for audit:**
1. **Creative Performance Report:** Filter by Ad level, add creative metrics (hook rate proxy via 3s views / impressions, hold rate, format type)
2. **Placement Performance Report:** Campaign + Placement breakdown with CPA and ROAS
3. **Frequency Trend Report:** Campaign + Week breakdown with Frequency, CTR, CPA
4. **Audience Performance:** Ad Set level with audience type, size, and performance

### Exporting Data
- Click the **"Export"** button (top-right of the data table, download icon)
- Options: CSV, Excel (.xlsx)
- Exports respect the current date range, filters, columns, and breakdowns
- Useful for large datasets that are hard to read page-by-page

---

## Known UI Gotchas

### Page Load Timing
- Ads Manager loads progressively — the table structure appears before data populates
- Wait for data to fully load: look for actual numbers in the totals row (not loading spinners or dashes)
- If you read too early, you'll get incomplete data

### "Learning" vs. "Learning Limited"
- **Learning:** Ad set recently created or significantly edited, gathering data. Normal — wait 7 days.
- **Learning Limited:** Ad set can't exit learning phase due to insufficient conversion volume (<50/week). This is a structural problem.
- **Active:** Past learning phase, delivering normally
- **Completed:** Reached end date (if lifetime budget)

### Delivery Column Labels
Different from Google Ads:
- **Active:** Delivering normally
- **In Review:** Pending Meta policy review (usually 24 hours)
- **Not Delivering:** Paused, over budget, or disapproved
- **Scheduled:** Future start date set

### Attribution Window Display
- After Jan 2026 changes, the available windows are: 1-day click, 7-day click, 1-day click + 1-day view
- 7-day view and 28-day view options are gone from the UI
- If an account was running before Jan 2026, historical data viewed in Ads Manager NOW shows the current attribution window — not what was active when the ads ran. This makes historical comparisons misleading.

### Multiple Pixels / Data Sources
- If the account has multiple pixels connected, metrics may be split or duplicated
- Check Events Manager → Overview to see how many data sources exist
- Multiple active pixels = likely deduplication issues. Flag immediately.

### Currency and Formatting
- Spend shows in the ad account's currency (not necessarily USD)
- ROAS may display as a ratio (3.75) or percentage (375%) depending on account settings
- Some accounts use periods for thousands separators (European format): 1.234,56 instead of 1,234.56
- Note the currency and format in working notes to avoid parsing errors
