# Amazon Ads + Seller Central Navigation Reference

Platform navigation patterns, extraction techniques, and documented gotchas for the amazon-ads-v2 audit skill.

---

## Tab Management

- Use `tabs_context_mcp` first to see available tabs
- Create **separate tabs** for Amazon Ads and Seller Central
- Keep tab-to-platform mapping consistent throughout the audit
- If Brand Analytics is accessible, it shares the Seller Central domain but may need its own navigation context

---

## Amazon Ads Campaign Manager

**URL:** `https://advertising.amazon.com/cm/campaigns`

### Date Range

The campaign table and the header summary bar may show **different date ranges**. Always verify which period you're looking at. The campaign table date is typically in the top-right area near "View: Default" and "Columns."

### Scrolling for Full Data

Campaign tables often hide critical columns (Purchases, Sales, ROAS) off-screen to the right. After capturing left-side metrics, scroll right and capture again. Use JavaScript extraction to get all column data at once when possible.

### Targeting Page

Navigate via the **Targeting tab** in the left sidebar. Shows keyword/target-level data with Spend, Orders, Sales, and ACOS columns. Apply filters:
- "Target active status: Enabled"
- "Spend: greater than $0.00"

This surfaces active targets with data and excludes noise.

### Sponsored Products vs. "All" Tab

The "All" campaigns tab shows brand-specific metrics (Branded searches, Detail page views, Purchases new-to-brand). Always switch to the **"Sponsored Products" tab** for actual SP metrics like real purchase counts.

---

## ag-Grid Extraction Techniques

Amazon Ads uses **ag-Grid**, which only renders rows currently visible in the viewport (virtualized rendering). If `read_page` returns empty cells, scroll the table to load more rows, then retry.

### Method 1 — React Fiber Tree (Most Reliable for Bulk Extraction)

Walk the React internal fiber tree to find the ag-Grid API object:

1. Find a grid container element in the DOM
2. Look for `__reactInternalInstance` or `__reactFiber` property on that element
3. Traverse `fiber.stateNode` until you find an object with a `.api` property
4. Once you have the grid API:

```javascript
const rows = [];
gridApi.forEachNode(node => rows.push(node.data));
// Returns ALL rows regardless of scroll position
```

This bypasses virtualization entirely — you get every row even if it's not currently rendered.

### Method 2 — `__agComponent` Shortcut

Some ag-Grid cells expose `__agComponent` directly:

1. Find any rendered cell element in the DOM
2. Access `cell.__agComponent`
3. Navigate up to the grid API from there

This is faster when you only need a few values, but less reliable for full table extraction.

### Method 3 — DOM Scraping with Scroll (Fallback)

If React fiber and __agComponent both fail:

1. Read currently visible rows from the DOM
2. Scroll down to load the next batch
3. Read again, deduplicating by a unique key (campaign name or keyword)
4. Repeat until no new rows appear

Use this only when Methods 1-2 fail.

### Field Name Gotchas

- **Ad spend field** is `spend`, NOT `cost`
- **Monetary values on the Targeting page** are stored in **millicents** — divide by 100,000 to get dollars. Example: `125000` = $1.25
- **ROAS** may be stored as a raw ratio (e.g., `4.5`) or as a formatted string — always check the actual data type before doing math
- **Bid values** on the Targeting page are also in millicents

### Output Sanitization

When extracting data via `javascript_tool`, ASIN strings containing equals signs (e.g., `asin="B0042A8HFY"`) can cause JavaScript output to be **silently blocked or truncated**. Always sanitize:

```javascript
// Option A: Strip special characters
output.replace(/[^a-zA-Z0-9 ,.\-]/g, '')

// Option B: Safe JSON encoding (preferred)
JSON.stringify(data)
```

---

## Amazon Seller Central

### Business Reports

**URL:** `https://sellercentral.amazon.com/business-reports`

### Date Picker

The date picker uses custom React components that **do not respond to URL parameters**. Use the built-in dropdown presets:
- Yesterday
- Week to date
- Month to date
- Year to date

If the dropdown doesn't cooperate, capture whatever period is loaded and note the date range in your evidence.

### Sales Dashboard

Shows today's snapshot with compare data:
- Yesterday
- Same day last week
- Same day last year

Useful for daily run-rate estimates. Label these as OBSERVED with the specific comparison period noted.

### Detail Page Sales and Traffic By Child Item

**The single most important Seller Central view for the audit.**

Shows per-ASIN:
- Sessions
- Page views
- Units ordered
- Ordered product sales
- Session conversion rate
- Featured Offer %

### Seller Central Grid Extraction (Critical)

The Business Reports grid is **NOT a standard HTML table**. It uses a custom React grid with **full row AND column virtualization**:

- `document.querySelectorAll('table tbody tr')` returns **0 results**
- Scrolling right **removes** left-side columns (product titles) from the DOM
- Scrolling down **removes** top rows from the DOM
- Cell count changes as you scroll (e.g., 152 cells at one position, 120 at another)

**Extraction priority order:**

1. **CSV Download (always try first):**
   - Click the "Download (.csv)" button on the report page
   - If a CSV file downloads, parse it — gives all columns and rows in one clean pass
   - This is the most reliable method by far

2. **Multi-pass DOM Extraction (fallback if CSV fails):**
   - Find the grid container (look for classes like `css-1snoav0` or similar with many child `div` elements)
   - **Pass 1 — Left side:** Extract product titles, parent ASINs, sessions, page views from initial scroll position
   - **Pass 2 — Right side:** Scroll grid container right → extract units ordered, sales, Featured Offer % from same rows
   - **Pass 3+ — Additional rows:** Scroll down to load more rows, repeat left/right
   - **Row alignment anchors:** Use a stable numeric field (like session count) that appears in both passes to verify correct row matching

3. **Physical scroll fallback:**
   - `element.scrollLeft = 800` sometimes has no effect on custom grids
   - Use the `computer` tool with physical scroll actions as a fallback

4. **Accessibility tree (`read_page`):**
   - Use to cross-check specific values or read ASIN identifiers
   - ASIN values in `<a>` link elements often return empty `textContent`/`innerText` — extract from `href` attribute instead (e.g., `/products/B0042A8HFY`)

---

## Brand Analytics (Search Query Performance)

### Navigation (CRITICAL — DO NOT USE DIRECT URL)

**Do NOT navigate directly to** `/brand-analytics/search-analytics/search-query-performance`

Direct URL navigation causes the page renderer to **freeze** (CDP screenshot timeout — frozen page).

**Correct navigation:**
1. Navigate to the Brand Analytics main page
2. Click the "Search Analytics" dropdown in the top navigation bar
3. Select "Search Query Performance" from the dropdown menu

### Date Range

Defaults to weekly view. The week selector uses custom dropdowns. If you can't programmatically switch weeks, capture the most recent available week and note the period.

### Data Extraction

The table uses `role="row"` markup. Use JavaScript to extract from `[role="row"]` elements. Standard `<table>` selectors may also work depending on the current page version — try both.

---

## Platform Gotchas — Complete Registry

All 14 documented gotchas for Amazon platform audits. Reference these throughout the audit to avoid common misreads.

### Gotcha 1: "All" Tab Shows 0 Purchases but $X in Sales
The Purchases metric on the All tab is brand-attributed only. **Switch to Sponsored Products tab** for real purchase counts. You'll see Sales > $0 but Purchases = 0, which is confusing but expected behavior on the All tab.

### Gotcha 2: Auto Campaign Targeting Types
Auto campaigns have 4 sub-targeting types with very different performance:
- **loose-match** — broad keyword matching
- **close-match** — tighter keyword matching
- **substitutes** — shows your product on competitor pages (often worst ACOS)
- **complements** — shows with complementary products

The "substitutes" type commonly has the worst ACOS because it shows your product when shoppers are actively looking at competitors. Always break auto performance down by sub-type.

### Gotcha 3: Top-of-Search Impression Share Below 5%
This means barely appearing at the top of search results. It is NOT the same as total impression share. You may still have significant impressions in "rest of search" or product page placements. Low TOS share with decent total impressions = placement problem, not visibility problem.

### Gotcha 4: Budget Amount vs. Actual Spend
A campaign with $75/day budget may only spend $12/day if bids are low or keywords have limited volume. Always look at **actual spend**, not budget caps. Budget utilization = actual spend / (budget × days in period).

### Gotcha 5: Branded vs. Non-Branded ACOS Blending
Account-level ACOS often looks acceptable (e.g., 35%) because branded campaigns at 20% ACOS mask non-branded campaigns at 50%+. **Always separate branded from non-branded** when evaluating account health. Report both in the evidence JSON.

### Gotcha 6: Seller Central Date Pickers
Custom React components that don't respond to standard URL parameters or form interactions. Use the **built-in dropdown presets** (Yesterday, WTD, MTD, YTD). Don't waste time trying to programmatically set custom dates.

### Gotcha 7: Brand Analytics Impression Share Interpretation
- Below 1% = page 3+ organically (essentially invisible)
- 1-5% = page 2 or bottom of page 1
- 5-20% = page 1 but not dominant
- Above 20% = page 1 with strong positioning
- The metric includes both organic AND paid impressions

### Gotcha 8: "Stores Deactivated" Banner
This refers to the Amazon Store (brand storefront page), NOT the seller account itself. The seller can be fully active and selling while the Store page is deactivated. Don't flag this as a critical issue unless the storefront is part of the advertising strategy (SB campaigns linking to Store).

### Gotcha 9: Seller Central Grid is NOT a Standard Table
Business Reports uses a custom React grid with **full row+column virtualization**. `document.querySelectorAll('table tbody tr')` returns 0 results. Must use CSV download or multi-pass DOM extraction. See the Seller Central Grid Extraction section above for detailed methods.

### Gotcha 10: ASIN Link Text Renders as Empty String
In Seller Central grids, ASIN values are `<a>` elements whose `textContent` and `innerText` return empty strings even when the link is visible. **Workarounds:**
- Extract from `href` attribute (e.g., `/products/B0042A8HFY`)
- Use accessibility tree to read the ASIN text

### Gotcha 11: Brand Analytics Direct URL Crashes Renderer
Navigating directly to the Search Query Performance URL causes a CDP screenshot timeout (frozen page). **Always navigate via dropdown menu:** Brand Analytics → Search Analytics dropdown → Search Query Performance. See the Brand Analytics Navigation section above.

### Gotcha 12: JavaScript Output Blocking from ASIN Strings
When extracting data via `javascript_tool`, strings containing `asin="B0042A8HFY"` patterns (with equals signs and quotes) can cause output to be silently blocked or truncated. **Always sanitize** output strings or use `JSON.stringify()` before returning data.

### Gotcha 13: Featured Offer % Below 50% = Buy Box Loss
Often more impactful than any ad optimization. If a product's Featured Offer % is below 50%, every ad dollar on that product partially subsidizes a competitor's sale.
- **Below 50%:** Flag as HIGH severity — investigate pricing, inventory, account health
- **Below 10%:** Flag as CRITICAL — recommend pausing all ads on that ASIN until Buy Box is recovered
- **Private label products** should be at ~100% Featured Offer %

### Gotcha 14: Branded Search with Zero Conversions
If branded keywords (exact brand name) show clicks but zero conversions, the problem is NOT the ads. Root causes:
- Listing issue (pricing, main image, description)
- Out of stock or low inventory
- Buy Box problem (Featured Offer % low)
- Pricing significantly above competitors

Don't optimize bids on branded terms until the root cause is identified. This is a listing/operations problem that no amount of bid tuning will fix.

---

## Navigation Quick Reference

| Action | Method |
|--------|--------|
| Open Campaign Manager | Navigate to `https://advertising.amazon.com/cm/campaigns` |
| Switch to SP tab | Click "Sponsored Products" tab in campaign view |
| Open Targeting page | Click "Targeting" in left sidebar |
| Filter active targets | Set "Target active status: Enabled" + "Spend: > $0.00" |
| Open Seller Central reports | Navigate to `https://sellercentral.amazon.com/business-reports` |
| Set date range (SC) | Use dropdown presets — don't try custom dates |
| Open Brand Analytics SQR | Navigate to Brand Analytics main → Search Analytics dropdown → Search Query Performance |
| Extract ag-Grid data | Try React fiber tree first → `__agComponent` second → DOM scroll third |
| Extract SC grid data | Try CSV download first → multi-pass DOM second → accessibility tree third |
