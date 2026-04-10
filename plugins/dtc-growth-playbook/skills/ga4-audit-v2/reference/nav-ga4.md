# GA4 Navigation Patterns

Reference file for the ga4-audit-v2 skill. Contains exact navigation paths, workarounds for GA4's UI quirks, and step-by-step instructions for report customization.

**Read this BEFORE opening GA4.** The default views are traps that will waste your time and produce misleading data.

---

## Getting Into the Right Property

1. Navigate to `https://analytics.google.com`
2. GA4 may open to the last property you viewed — verify the property name in the top-left dropdown
3. If you need to switch: click the property name dropdown → search or scroll to the correct property
4. **Verify:** Check Admin → Property Settings → confirm the website URL matches the client's domain

---

## CRITICAL: Escape the 7-Day Default

GA4 defaults nearly every view to "Last 7 days." This is the single most common mistake in GA4 audits. **Change the date range BEFORE reading any data.**

### How to Set the Date Range

1. Look for the date range selector — it's in the **top-right area** of most report views. It shows the current range (e.g., "Apr 3 - Apr 10, 2026").
2. Click the date range selector.
3. You'll see preset options (Last 7 days, Last 28 days, Last 90 days) and a custom calendar.
4. **For audits:** Select "Custom" and set your audit date range (typically last 90 days, or match other platform audits).
5. Click "Apply."

**Important:** The date range does NOT persist globally across all reports. When you navigate to a different report section, check that the date range didn't reset. It usually sticks within the same section but can reset when switching between Reports, Explore, and Admin.

### Comparison Period

For trend analysis, enable comparison:
1. In the date range selector, toggle "Compare" on.
2. Select "Preceding period (match day of week)" for the most useful comparison.
3. This adds a comparison column/line to all metrics in the current view.

---

## Reports Section Navigation

The Reports section contains pre-built views. These are good for quick data extraction but limited in customization.

### Reports Snapshot (Overview)

**Path:** Reports → Reports snapshot

This is a dashboard overview. Useful for a quick scan but NOT for detailed data. It shows:
- Users, new users, engagement metrics (summary cards)
- Users over time chart
- Recent activity

**Limitation:** You can't export this data easily or drill into it. Use it to orient, then go to specific reports.

### Acquisition Reports

**Path:** Reports → Acquisition

Two sub-reports matter:

1. **User acquisition** — shows the FIRST source that brought each user. Useful for understanding which channels bring new users. Dimension: "First user source / medium."

2. **Traffic acquisition** — shows the source/medium for each SESSION (not user). **This is what you want for the audit.** It shows how traffic arrived during the audit period regardless of when the user was first acquired. Dimension: "Session source / medium."

**Always use Traffic acquisition for the audit** unless specifically analyzing new user acquisition channels.

### Customizing Traffic Acquisition Report Columns

The default columns may not include everything you need. To customize:

1. Navigate to Reports → Acquisition → Traffic acquisition
2. Click the **pencil icon** (top-right of the report, "Customize report") — note: you need Editor or Admin access
3. In the customization panel:
   - **Metrics:** Add/remove metrics. You want: Sessions, Engaged sessions, Engagement rate, Conversions (or Key events), Total revenue, Average engagement time per session
   - **Dimensions:** Should be "Session source / medium" by default. Leave it.
4. Click "Apply" (this only affects your view, not the saved report for others, unless you explicitly save)

**If you can't customize (read-only access):** Use Explore instead (see below). Explore gives full customization without needing report edit access.

### Sorting and Filtering

- Click any column header to sort by that metric
- Use the search bar above the table to filter source/medium (e.g., type "google" to see only Google sources)
- Click "Add filter" to add dimension/metric filters (e.g., Sessions > 100 to hide noise)

### Monetization Reports

**Path:** Reports → Monetization → Ecommerce purchases

Shows:
- Revenue, items purchased, items viewed, ATC events, items in cart
- By item name, item category, or item brand

**Path:** Reports → Monetization → Overview

Shows:
- Total revenue, purchasers, purchases, average purchase revenue per user
- Revenue trend over time

### Engagement Reports

**Path:** Reports → Engagement → Landing page

Shows landing page performance. Default metrics may be limited — customize to add conversions and revenue if possible.

**Path:** Reports → Engagement → Events

Shows all events firing in the property with their counts. This is where you validate that ecommerce events exist and are firing at reasonable volumes.

### Tech Reports

**Path:** Reports → Tech → Tech overview

Shows device category (mobile/desktop/tablet), OS, browser, screen resolution.

**Path:** Reports → Tech → Tech details

More granular — lets you switch the primary dimension between device category, browser, OS, screen resolution.

---

## Explore Section Navigation

Explore is where you do custom analysis. It's more powerful than Reports but requires manual setup.

### Getting to Explore

**Path:** Click "Explore" in the left navigation (below Reports, above Advertising).

You'll see saved explorations and templates. For the audit, create new ones.

### Building a Funnel Exploration

This is REQUIRED for Phase 4 (conversion funnel). Reports doesn't have a proper funnel view.

1. Click "Explore" → click the "+" or "Blank" template (or "Funnel exploration" template if available)
2. If using blank: change the technique dropdown (top-left of the canvas) to "Funnel exploration"
3. **Set the date range** in the top-right (it may default to 7 days again)
4. In the "Steps" section on the left panel, add funnel steps:
   - Step 1: Event = `session_start`
   - Step 2: Event = `view_item`
   - Step 3: Event = `add_to_cart`
   - Step 4: Event = `begin_checkout`
   - Step 5: Event = `purchase`
5. Click "Apply" to generate the funnel

### Funnel Configuration Options

- **Open funnel vs closed funnel:** Toggle at the top of the funnel settings. Open = users can enter at any step. Closed = users must complete steps in order. **Use closed funnel for ecommerce audit** — it shows the true sequential drop-off.
- **Elapsed time:** Shows time between steps. Useful for understanding consideration cycle.
- **Breakdown:** Add a dimension (e.g., device category) to segment the funnel. WARNING: This can hit data thresholds and hide segments. If rows disappear, remove the breakdown.

### Building a Free-Form Exploration (Custom Report)

Use this when you need a data table that Reports doesn't provide (e.g., source/medium with specific metric combinations).

1. Click "Explore" → "Blank"
2. Technique: "Free form" (default)
3. **Set date range** (top-right)
4. In the Variables panel (left side):
   - Under "Dimensions": click "+" to add dimensions (e.g., Session source / medium, Landing page, Device category)
   - Under "Metrics": click "+" to add metrics (e.g., Sessions, Conversions, Total revenue, Engagement rate)
5. Drag dimensions to "Rows" and metrics to "Values" in the Tab Settings panel
6. The table populates automatically

### Exporting from Explore

- Right-click the exploration → "Export" → choose CSV or Google Sheets
- Or use the share icon (top-right) to download

---

## Admin Section Navigation

### Attribution Settings

**Path:** Admin (gear icon, bottom-left) → Property column → Attribution settings

Shows:
- Reporting attribution model (Data-driven, Last click, etc.)
- Lookback window (30, 60, or 90 days)

**Note:** Data-driven attribution silently falls back to last-click if the property has <400 monthly conversions. GA4 does NOT warn you about this. Check monthly conversion count separately.

### Data Streams

**Path:** Admin → Property column → Data streams

Shows all data streams (web, iOS, Android). Click the web stream to see:
- Measurement ID (G-XXXXXX) — verify this matches what's deployed on the site
- Enhanced measurement settings (page views, scrolls, outbound clicks, file downloads, site search)
- Configure tag settings (cross-domain configuration lives here)

### Cross-Domain Configuration

**Path:** Admin → Data streams → [Web stream] → Configure tag settings → Configure your domains

This is where cross-domain tracking is set up. All domains the client uses (main site, checkout subdomain, landing page domains) should be listed here.

**How to verify it's working:**
1. Open the client's site in a new tab
2. Click a link that goes to a different domain (e.g., add to cart → checkout.shopify.com)
3. Check the URL: it should contain a `_gl=1*xxxxx*` parameter
4. If the `_gl` parameter is missing, cross-domain tracking is broken

### Events Configuration

**Path:** Admin → Events

Shows all events GA4 has received, whether they're standard or custom, and whether they're marked as key events (conversions).

Check:
- Which events are marked as key events (only key events show in conversion reports)
- Whether purchase is marked as a key event (if not, revenue reporting won't work in standard reports)

### DebugView

**Path:** Admin → DebugView

Shows real-time event stream from debug-enabled devices/sessions. Useful for testing if events are firing correctly, but requires either:
- GA4 Debug Mode extension in Chrome
- `debug_mode: true` parameter in the GA4 configuration

If you can trigger a test event (e.g., add something to cart), DebugView shows exactly what GA4 receives in real-time, including all event parameters.

---

## Common GA4 UI Traps

### Trap 1: Home View ≠ Reports

The GA4 **Home** page (what you see when you first open a property) shows AI-generated insights and recent trends. This is NOT a report. Do not cite numbers from the Home page — they're summarized and potentially misleading. Always navigate to the actual Reports or Explore sections.

### Trap 2: "Key Events" vs "Conversions" Rename

In early 2024, GA4 renamed "Conversions" to "Key events" in some views. You may see either term depending on the interface version. They mean the same thing. In evidence files, use "Conversions (key events)" for clarity.

### Trap 3: Sampling Indicator

Look for the shield icon in the top-left of any report or exploration:
- **Green shield with checkmark** = data is unsampled. Good.
- **Yellow/orange shield** = data is sampled (only analyzing a percentage of sessions). Note this in auditor_notes and consider narrowing the date range.
- **No shield visible** = usually means unsampled, but double-check by hovering.

### Trap 4: Thresholding (Missing Rows)

When Google signals are enabled (Admin → Data Settings → Data Collection → Google signals), GA4 applies thresholding to protect user privacy. This means:
- Rows with very few users may be hidden entirely
- You won't see a warning — the rows just don't appear
- Totals still include the hidden data, so summing visible rows won't equal the total

**Workaround:** Switch to "Device-based" reporting identity (Admin → Reporting Identity) temporarily to remove thresholding. Switch back after the audit if the client uses Google signals for demographics.

### Trap 5: "Unassigned" Traffic

GA4 sometimes labels traffic as "(not set)" or "Unassigned" in source/medium reports. This usually means:
- Events fired without session context (e.g., background app events)
- Cross-domain tracking lost the session mid-journey
- Events arrived after the session timeout (30 min default)

If "Unassigned" is >10% of traffic, it's a tracking health issue worth flagging.

### Trap 6: Real-Time ≠ Historical

Real-time reports (Reports → Realtime) show what's happening NOW. This data is:
- Not comparable to historical reports (different processing pipeline)
- Subject to change (events can be reclassified during processing)
- Useful for verifying tracking is working, but NEVER cite real-time data as audit evidence

### Trap 7: Date Range Resets

When navigating between major sections (Reports → Explore → Admin → back to Reports), the date range may silently reset to 7 days. Always glance at the date range indicator before extracting data from a new view.

---

## Quick Reference: Where to Find Each Audit Phase Data

| Audit Phase | Primary Navigation | Backup (if primary unavailable) |
|---|---|---|
| Account overview metrics | Reports → Reports snapshot + Monetization overview | Explore → Free form with key metrics |
| Traffic acquisition by source | Reports → Acquisition → Traffic acquisition | Explore → Free form, dimension = Session source/medium |
| Conversion funnel | **Explore → Funnel exploration** (no Reports equivalent) | N/A — must use Explore |
| Landing page performance | Reports → Engagement → Landing page | Explore → Free form, dimension = Landing page |
| Device/platform split | Reports → Tech → Tech overview / Tech details | Explore → Free form, dimension = Device category |
| Cross-platform attribution | Reports → Acquisition → Traffic acquisition (filter to paid) | Explore → Free form, filter Session medium = cpc/paid |
| Event tracking inventory | Admin → Events + Reports → Engagement → Events | DebugView for live validation |
| Attribution model | Admin → Attribution settings | N/A |
| Cross-domain config | Admin → Data streams → Configure tag settings | Manual test (check for _gl parameter) |
