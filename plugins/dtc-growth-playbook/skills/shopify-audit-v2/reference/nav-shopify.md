# Shopify Admin Navigation Patterns

Reference guide for navigating Shopify admin UI during audits. Covers date pickers, report generation, custom reports, export workflows, and known gotchas.

---

## Accessing Shopify Admin

**URL pattern:** `https://{store-name}.myshopify.com/admin`

If you have the storefront URL (e.g., `https://kodiak-leather.com`), the admin URL is typically the Shopify subdomain: `https://kodiak-leather.myshopify.com/admin`. The user may need to provide the exact admin URL or confirm you're logged in.

**Access levels:**
- **Store owner:** Full access to everything including billing, staff management
- **Staff account:** May have restricted access — check which sections are available. Common restrictions: no access to Finances, limited Analytics, no Settings
- **Collaborator account:** Agency/partner access — typically full analytics and reports but no billing or ownership actions

Check access immediately by navigating to Analytics → Reports. If you get a "You don't have permission" screen, record `access_level: "limited"` and document what IS accessible.

---

## Date Pickers — The #1 Gotcha

Shopify's date picker behavior varies by section and is the most common source of data inconsistency in audits.

### Analytics Dashboard (`/admin/analytics`)

- **Default view:** Shows "Today" or "Last 30 days" depending on the page
- **Date picker location:** Top-right of the analytics dashboard
- **How to set custom range:**
  1. Click the date range dropdown (shows current range like "Last 30 days")
  2. Select "Custom" at the bottom of the dropdown
  3. Click the start date, then click the end date
  4. Click "Apply"
- **Comparison period:** After setting the date range, a "Compare" toggle appears. Options: Previous period, Previous year, or Custom. Enable comparison for trend analysis.
- **GOTCHA:** The dashboard date picker does NOT persist across page navigations. If you go to Analytics → Dashboard, set a custom range, then navigate to Analytics → Reports, the report may revert to its own default range. Always re-confirm the date range on each report page.

### Reports Section (`/admin/analytics/reports`)

- **Default range:** Each report has its own default (often "Last 30 days" or "Last 12 months")
- **How to set custom range on a report:**
  1. Open the specific report (e.g., "Sales over time")
  2. Click the date range at the top of the report
  3. Select "Custom" and set start/end dates
  4. Click "Apply"
- **GOTCHA:** Some reports have a "Since" filter (e.g., "Since last year") that looks like a date range but isn't one. Make sure you're using the explicit date range picker, not a relative filter.
- **GOTCHA:** Report data may lag 1-2 hours behind real-time. If auditing "today," expect incomplete data. Use yesterday as the end date for accuracy.

### Orders Section (`/admin/orders`)

- **Default:** Shows all orders (no date filter)
- **How to filter by date:**
  1. Click "More filters" above the orders list
  2. Select "Date" from the filter options
  3. Choose a predefined range or set custom start/end dates
- **GOTCHA:** Order dates use the store's timezone setting (Settings → General → Time zone). If the store is set to a different timezone than expected, dates may be off by a day at boundaries. Check the timezone first.

### Customers Section (`/admin/customers`)

- **No built-in date range filter** for the customer list itself
- To analyze customers by acquisition date, use: Analytics → Reports → "Customers over time" or "First-time vs returning customer sales"
- Alternative: Export customers and filter by "Created at" column in the CSV

---

## Report Generation

### Default Reports (Pre-Built)

Navigate to **Analytics → Reports** (`/admin/analytics/reports`). Key reports for the audit:

**Sales reports:**
- **Sales over time** — Total sales by day/week/month. Use for revenue trends.
- **Sales by product** — Revenue and units per product. Use for Phase 3 product performance.
- **Sales by product variant** — Deeper cut if variant-level analysis needed.
- **Sales by channel** — Online store, POS, Draft Orders, etc. Critical for channel attribution.
- **Sales by discount** — Shows which discount codes drove how much revenue. Critical for Phase 5 discount impact.
- **Sales by traffic referrer** — Shopify's last-click attribution. Directional only — not source of truth.

**Customer reports:**
- **Customers over time** — New customer acquisition trend.
- **First-time vs returning customer sales** — Revenue split by customer type. Critical for Phase 4.
- **Returning customers** — List of customers with 2+ orders.

**Financial reports (may require owner/full access):**
- **Finances summary** — Gross sales, discounts, returns, net sales, taxes, shipping, total sales.
- **Profit report** — Requires COGS to be entered. Shows product-level profit margins.
- **Product cost report** — Shows products with/without cost-per-item entered.

### Custom Reports

Shopify allows creating custom reports from the Reports page:

1. Navigate to Analytics → Reports
2. Click "Create custom report" (top-right)
3. Select a report category (Sales, Customers, etc.)
4. Choose columns to include
5. Add filters (date range, product, channel, etc.)
6. Save the report with a descriptive name

**Useful custom reports for audits:**
- **Sales by product with COGS:** Sales report + add "Cost" and "Margin" columns (only works if COGS entered)
- **High-return products:** Orders report filtered by financial status = "Refunded" or "Partially refunded", grouped by product
- **New customer orders by channel:** Customer report filtered by orders count = 1, with channel column

**GOTCHA:** Custom report availability depends on the Shopify plan. Basic plans have limited custom report options. Advanced and Shopify Plus have full custom report builder.

---

## Exporting Data

### Order Export

1. Navigate to Orders (`/admin/orders`)
2. Apply desired filters (date range, status, etc.)
3. Click "Export" button (top-right)
4. Choose: "Current page" (filtered results) or "All orders" or specific date range
5. Format: CSV (for data analysis) or Plain CSV (for Excel)
6. Click "Export orders"
7. Shopify emails the export file to the logged-in user's email — it does NOT download immediately for large exports

**GOTCHA:** Large exports (10K+ orders) can take 5-30 minutes to arrive via email. For audits with high order volume, start the export early in the session.

**What's in the order export:** Order number, date, customer name/email, financial status, fulfillment status, currency, subtotal, shipping, taxes, total, discount code, discount amount, shipping method, line items (product, variant, quantity, price), billing/shipping addresses, notes, tags.

**What's NOT in the order export:** COGS, margin, customer lifetime data, traffic source, UTM parameters. These require separate reports or API access.

### Product Export

1. Navigate to Products (`/admin/products`)
2. Click "Export" (top-right)
3. Choose: All products or current filtered view
4. Format: CSV or Plain CSV
5. Includes: Title, handle, vendor, type, tags, published status, variants, prices, compare-at prices, cost per item (if entered), SKU, inventory quantities

### Customer Export

1. Navigate to Customers (`/admin/customers`)
2. Apply segment filters if desired
3. Click "Export" (top-right)
4. Includes: Name, email, phone, orders count, total spent, tags, created date, location

---

## Finding COGS Data

COGS (Cost of Goods Sold) is the most important data point for profitability analysis and the most commonly missing one.

### Where COGS lives in Shopify:

1. **Per-product:** Products → [Product] → Pricing section → "Cost per item" field
   - This is variant-level — each variant can have its own cost
   - If this field is blank, Shopify has no COGS for that product
   - Check 5-10 products (mix of best sellers and random) to assess coverage

2. **Product Cost Report:** Analytics → Reports → "Product cost" (may be labeled "Inventory > Cost of goods sold")
   - Shows all products with their cost-per-item entries
   - Quickly identifies which products have COGS vs which are blank
   - If this report shows mostly blank costs → COGS is not maintained in Shopify

3. **Profit Report:** Analytics → Reports → "Profit by product"
   - Only meaningful if COGS is entered
   - Shows: Net sales, Cost, Profit, Margin % per product
   - If margin shows 100% for products → COGS is $0 (not entered), not actually 100% margin

### COGS coverage assessment:

- **>80% of top products have COGS entered:** Use Shopify's profit data directly. Label as OBSERVED.
- **20-80% coverage:** Use Shopify data where available, estimate gaps from vertical benchmarks. Label known as OBSERVED, estimated as ASSUMPTION.
- **<20% or no COGS:** Don't use Shopify's profit reports — they'll be misleading. Use vertical COGS estimates from benchmarks.md for all products. Label as ASSUMPTION. Flag in open_questions.

---

## Discount Code Analysis

### Where to find discount data:

1. **Discounts page:** Discounts (`/admin/discounts`)
   - Shows all active, scheduled, and expired discount codes
   - Click each code to see: type (percentage, fixed, free shipping, BXGY), usage count, total discount amount, minimum requirements, date range
   - **GOTCHA:** Automatic discounts (applied at checkout without a code) appear separately from code-based discounts. Check both tabs.

2. **Sales by discount report:** Analytics → Reports → "Sales by discount"
   - Shows revenue attributed to each discount code
   - Critical for calculating discount impact on margins
   - **GOTCHA:** Orders with no discount code show as "(No discount)" — subtract this from total to get discount-driven revenue

3. **Order-level discount data:** In individual orders, the discount applied shows in the order summary
   - For bulk analysis, use the order export — "Discount Code" and "Discount Amount" columns

### What to look for:

- **Discount rate:** Total discount amount ÷ Gross sales. Above 15% = margin erosion flag.
- **Always-on discounts:** Codes that have been active for months with high usage — suggests customers expect/require a discount to convert.
- **Stacking:** Multiple discounts applied to the same order. Check Settings → Checkout → "Discount combinations" to see if stacking is enabled.
- **Free shipping thresholds:** If a free shipping discount exists, check the threshold vs AOV. Threshold below AOV = giving away margin. Threshold 10-20% above AOV = healthy AOV lift tool.

---

## Channel Attribution Limitations

Shopify's built-in attribution is **last-click, session-based** and has significant limitations:

- **"Direct" traffic is inflated.** Any session where Shopify can't determine the referrer (ad blockers, iOS privacy, cross-device, bookmark visits) gets bucketed as "Direct." Often 30-50% of sessions.
- **No view-through attribution.** Customer sees a Meta ad, doesn't click, later types the URL directly → Shopify credits "Direct." The Meta evidence file will claim this conversion.
- **UTM parameters required for accurate source tracking.** If the brand doesn't use UTMs consistently on all marketing links, Shopify's "Sessions by referrer" report is unreliable.
- **Cross-device blindspot.** Customer clicks a Google ad on mobile, comes back on desktop to purchase → Shopify may credit "Direct" on desktop.

**For the audit:** Use Shopify's channel data to understand the REVENUE MIX (online vs POS vs wholesale/draft), not to diagnose which marketing channels are performing. That's the ad platform evidence files' job, reconciled by the synthesizer.

---

## Report Lag and Data Freshness

- **Analytics dashboard:** Data updates in near real-time (5-15 minute lag)
- **Reports:** Data may lag 1-2 hours behind live data
- **Exports:** Reflect data at the time the export is generated
- **Financial reports (taxes, payouts):** May lag 24-48 hours for full reconciliation

**Best practice for audits:** Use yesterday (or the day before) as the end date to ensure complete data. Don't audit "today" — you'll get partial numbers.

---

## Shopify Plan Differences That Affect Audits

| Feature | Basic | Shopify | Advanced | Plus |
|---|---|---|---|---|
| Standard reports | Yes | Yes | Yes | Yes |
| Custom reports | Limited | Limited | Full | Full |
| Professional reports | No | Some | Full | Full |
| Product cost tracking | Yes | Yes | Yes | Yes |
| Profit reports | No | No | Yes | Yes |
| Customer segments | Basic | Basic | Advanced | Advanced |
| Export limits | Standard | Standard | Standard | Higher |

**If on Basic/Standard plan:** Profit reports won't be available even if COGS is entered. You'll need to calculate margins manually from product costs + sales data.

---

## Common Audit Pitfalls

1. **Multi-currency stores:** Revenue may show in the store's base currency OR the customer's local currency depending on the report. Always confirm which currency you're looking at. Use "Sales" reports (base currency) not "Orders" list (may show local currency).

2. **Draft orders inflating revenue:** Draft orders (manual orders created by staff) count toward total revenue. If significant, separate them in analysis. Check Analytics → Reports → Sales by channel → "Draft Orders" line.

3. **Test orders in data:** Some stores have test orders that weren't properly cancelled. Look for orders with $0 value, orders to the store's own email, or orders with "test" in notes/tags. If found, note the potential data quality issue.

4. **Subscription revenue:** If the store uses a subscription app (ReCharge, Bold, Skio), recurring orders may show differently in reports. Check if subscription revenue appears under a separate channel or as regular online store orders.

5. **POS revenue mixed in:** If the store has physical retail (POS), this revenue appears in total sales. Always separate online vs POS for meaningful ecommerce analysis. The synthesizer only cares about online revenue for ad platform reconciliation.

6. **Refund timing:** Refunds are dated when the refund is processed, not when the original order was placed. A refund processed today for an order placed 45 days ago will appear in today's data but reduce the previous period's net revenue if you're using the original order date. Check which method the report uses.

7. **Shipping revenue vs shipping cost:** Shopify tracks shipping revenue (what the customer paid) but NOT shipping cost (what the carrier charged). For CM2 calculation, you need actual shipping costs — these require either manual input or a shipping app that tracks costs.
