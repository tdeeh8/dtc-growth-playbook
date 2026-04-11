# BigCommerce Control Panel Navigation Patterns

Reference guide for navigating the BigCommerce admin (Control Panel) during audits. Covers the Control Panel layout, Analytics section, Orders section, Products section, date pickers, report generation, export patterns, API fallbacks, and key differences from Shopify.

---

## Accessing BigCommerce Control Panel

**URL pattern:** `https://store-{hash}.mybigcommerce.com/manage/` or `https://login.bigcommerce.com/` → select store.

Most clients access via `login.bigcommerce.com`. The store-specific URL uses a hash identifier, not a readable store name like Shopify. The user may need to provide direct access or confirm you're logged in.

**Access levels:**
- **Store owner:** Full access to everything including billing, API accounts, staff management
- **Admin user:** Full access to store management but may not see billing
- **Limited staff:** Restricted by role-based permissions. BigCommerce uses granular permissions — a user might have Orders access but not Analytics, or Products but not Customers.
- **App-level access:** Some agency setups use app-level OAuth tokens. Less common for browser audits.

Check access immediately by navigating to Analytics → Overview. If you get a permission error, record `access_level: "limited"` and document what IS accessible.

---

## Control Panel Layout

BigCommerce's left-sidebar navigation structure (top to bottom):

```
Dashboard          ← Store overview, quick stats, recent orders
Orders             ← All orders, returns/RMAs, shipments
Products           ← Catalog, categories, brands, import/export
Customers          ← Customer list, groups, export
Storefront         ← Themes (Stencil), scripts, web pages, blog
Marketing          ← Promotions/coupons, banners, abandoned carts, email marketing
Analytics          ← Overview, Real-Time, Merchandising, In-Store, custom reports
Channel Manager    ← Connected channels (storefront, Amazon, eBay, Facebook, Google, etc.)
Apps               ← Installed apps
Settings           ← Store profile, payments, shipping, taxes, API accounts
```

**Key difference from Shopify:** BigCommerce separates Marketing (promotions/coupons) and Analytics into distinct top-level sections. Shopify lumps discounts under a separate section and analytics under a shared header. BigCommerce also has a dedicated Channel Manager for multi-channel — Shopify uses "Sales channels" in settings.

---

## Dashboard (`/manage/dashboard`)

The Dashboard provides at-a-glance stats:
- Revenue today / this week / this month
- Order count
- Conversion rate
- Average order value
- Recent orders list

**Limitations:** The dashboard is a summary view with limited customization. It does NOT support custom date ranges. Use Analytics for detailed time-series analysis.

---

## Analytics Section

### Analytics → Overview (`/manage/analytics`)

The primary analytics hub. Shows:
- Revenue over time (chart + table)
- Orders over time
- Conversion rate (visits → orders)
- Visitor count / sessions
- AOV trend

**Date picker location:** Top-right of the analytics page.

**How to set custom date range:**
1. Click the date range selector (shows current range like "Last 30 days")
2. Options: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, Custom
3. For Custom: select start date then end date from the calendar
4. Click "Apply" or "Update"

**Comparison:** BigCommerce analytics supports period-over-period comparison (previous period, previous year). Toggle comparison on after setting the primary date range.

**GOTCHA:** BigCommerce analytics may take a moment to load, especially for large stores or longer date ranges. Wait for the spinner to complete before extracting numbers.

**GOTCHA:** Analytics data can lag 1-4 hours behind real-time. Use yesterday as the end date for complete data.

### Analytics → Real-Time (`/manage/analytics/real-time`)

Live view of current store activity — active visitors, recent orders, cart activity. Not useful for audits but confirms the analytics system is active.

### Analytics → Merchandising (`/manage/analytics/merchandising`)

**Plan-dependent — may not be available on all plans.**

Shows product-level analytics:
- Top products by revenue
- Top products by units sold
- Top products by views
- Product conversion rates (views → add-to-cart → purchase)
- Category performance

This is extremely valuable for Phase 3 (Product Performance) if available. It provides product-level conversion funnel data that Shopify requires third-party apps for.

**GOTCHA:** If Merchandising shows "Upgrade your plan" or is empty, the store is on a plan that doesn't include these reports. Fall back to Orders export + product cross-reference for product performance data.

### Analytics → Abandoned Cart (`/manage/analytics/abandoned-carts`)

BigCommerce includes built-in abandoned cart analytics — another feature Shopify requires apps for. Shows:
- Abandoned cart count and recovery rate
- Revenue recovered
- Products most frequently abandoned

Useful for cross-referencing with Klaviyo abandoned cart flow data. If BigCommerce's built-in abandoned cart emails are active AND Klaviyo is also running abandoned cart flows, there may be overlap/conflict — flag for the synthesizer.

### Analytics → In-Store Analytics

Only relevant for BigCommerce POS users. Skip unless the client has physical retail.

---

## Orders Section (`/manage/orders`)

The primary source for revenue data when Analytics is limited.

### Order List View

- **Default:** Shows all orders, most recent first
- **Status filter:** Dropdown at top — Incomplete, Awaiting Payment, Awaiting Fulfillment, Awaiting Shipment, Partially Shipped, Shipped, Completed, Cancelled, Declined, Refunded, Disputed, Manual Verification Required
- **Search:** By order number, customer name, email, or product name
- **Advanced Search:** Click "Advanced Search" for date range, status, payment method, shipping method, coupon code, and more

**How to filter by date:**
1. Click "Advanced Search" above the order list
2. Set "Date From" and "Date To" fields
3. Optionally filter by status (select "Completed" to exclude cancelled/refunded from revenue)
4. Click "Search"

**GOTCHA:** BigCommerce order statuses are more granular than Shopify's. For revenue analysis, typically include: Awaiting Fulfillment, Awaiting Shipment, Partially Shipped, Shipped, Completed. Exclude: Cancelled, Declined, Refunded (unless analyzing refund rates specifically). "Incomplete" orders are abandoned checkouts — exclude from revenue.

**GOTCHA:** BigCommerce does NOT automatically net refunds from the order total in the list view. A refunded order may still show its original total. Check the order detail page for refund status, or use the Analytics dashboard (which does net refunds).

### Order Detail View

Click any order to see:
- Order total breakdown (subtotal, discounts, shipping, tax, total)
- Line items (product, variant/SKU, quantity, price)
- Customer info
- Payment method and status
- Shipping method and tracking
- Coupon codes applied
- Order notes and status history
- Refund history (if applicable)

### Order Export

1. Navigate to Orders (`/manage/orders`)
2. Apply desired filters (date, status)
3. Click "Export" button
4. Format options: CSV (default). BigCommerce exports include: Order ID, Date, Customer, Status, Subtotal, Discount Amount, Coupon Code, Shipping Cost, Tax, Total, Payment Method, Items (with SKU, name, quantity, price).
5. Export generates immediately for smaller datasets. Larger exports may trigger a background job with email delivery.

**What's in the order export:** Order ID, date/time, billing name/address, shipping name/address, email, phone, order status, subtotal, discount amount, coupon code, shipping cost, handling cost, tax, total, payment method, items (product name, SKU, quantity, base price, total), staff notes, customer notes, shipping method.

**What's NOT in the export:** COGS, margin, customer lifetime data, traffic source/UTM data, attribution. These require separate exports or API calls.

---

## Products Section (`/manage/products`)

### Product List

- Shows all products with: name, SKU, price, stock level, status (active/hidden/archived)
- Filter by: category, brand, type, availability, visibility
- Sort by: name, price, SKU, date created, date modified

### Product Detail (Edit Product)

Key fields for audit:
- **Pricing section:**
  - Default Price (retail/selling price)
  - Cost (COGS) — this is the field we need for profitability analysis
  - MSRP / Retail Price (compare-at price equivalent)
  - Sale Price (markdown price)
- **Variants (Options/SKUs):** BigCommerce calls them "Product Options" + "SKUs." Each variant combination can have its own price, cost, weight, SKU, and inventory.
  - Navigate to product → "Options & SKUs" or "Variants" tab
  - Each SKU row shows: Option values, SKU code, price, cost, weight, inventory
- **Categories:** Products can belong to multiple categories (unlike Shopify where a product is in one collection but can have tags). Categories are hierarchical — parent/child structure.
- **Inventory:** Stock level per variant, low stock threshold, inventory tracking on/off

### Product Export

1. Navigate to Products
2. Click "Export" (may be under a "..." or "More" menu)
3. BigCommerce product export includes: Product ID, Name, SKU, Price, Cost Price, Sale Price, Retail Price, Category, Brand, Weight, Inventory Level, Status, Description, Image URLs
4. Format: CSV

**Key difference from Shopify:** BigCommerce product exports natively include the Cost Price field, making COGS assessment from the export file straightforward. Shopify also includes "Cost per item" but BigCommerce's export format is slightly different — Cost is a direct column, not nested under variants.

### Categories vs Shopify Collections

- **BigCommerce categories** are hierarchical (parent → child → grandchild). A product can belong to multiple categories. Categories are the primary organizational structure.
- **Shopify collections** are flat (no parent/child) and can be manual or automated. Tags are the secondary organization layer.
- For audits: BigCommerce category performance gives a natural hierarchy for analysis. Ask the client which category level matters most for their business.

---

## Customers Section (`/manage/customers`)

### Customer List

- Shows: Name, email, phone, customer group, date joined, # orders, total spent
- Filter by: customer group, date range (date joined), order count
- Sort by: name, date joined, # orders, total spent

### Customer Groups

BigCommerce's customer groups are more powerful than Shopify's basic customer segments:
- Groups can have different pricing (percentage or fixed discounts)
- Groups can see/hide specific product categories
- Groups can have different payment method access
- Common groups: Retail, Wholesale, VIP, Tax Exempt

**For audit impact:** If wholesale customers get 20% off via customer group pricing, this discount does NOT show as a coupon code — it's baked into the price they see. This can make margin analysis tricky because the "discount" is invisible in order data. Check Settings → Customer Groups to understand pricing rules.

### Customer Export

1. Navigate to Customers
2. Click "Export"
3. Includes: Customer ID, First Name, Last Name, Email, Phone, Company, Address, Customer Group, Date Created, # Orders, Store Credit
4. Does NOT include: Total lifetime revenue (need to calculate from orders), order dates, or product-level purchase history

**GOTCHA:** BigCommerce customer export does not include a "total spent" column in all versions. You may need to cross-reference with the order export to calculate per-customer revenue and identify new vs returning.

---

## Marketing → Promotions (`/manage/marketing/promotions`)

BigCommerce handles discounts through the **Promotions** system (not a simple "Discounts" page like Shopify).

### Promotion Types

- **Coupon Codes:** Traditional discount codes (% off, $ off, free shipping, BXGY)
- **Cart-Level Discounts:** Automatic rules applied when cart conditions are met (spend $X get Y% off). No code required.
- **Product-Level Discounts:** Sale prices set directly on products
- **Customer Group Pricing:** Discounts tied to customer group membership (invisible in order-level discount data)
- **Shipping Promotions:** Free shipping rules

### Where to Find Discount Data

1. **Marketing → Promotions:** Lists all active, scheduled, disabled, and expired promotions. Click each for: type, code (if applicable), usage count, conditions, date range.
2. **Order-level:** Each order shows coupon codes applied + discount amount in the order detail view.
3. **Order export:** Includes "Coupon Code" and "Discount Amount" columns.
4. **No built-in "Sales by discount" report** like Shopify has. You'll need to aggregate from the order export — filter by coupon code and sum revenue/discount amounts.

**GOTCHA:** Cart-level automatic promotions may not show a coupon code in order data. The discount amount appears but the promotion name/code may be blank. Cross-reference with active promotions to identify which automatic rule applied.

**GOTCHA:** Customer group pricing discounts do NOT appear as discounts in order data at all. The customer simply sees a lower price. To quantify this impact: compare default price vs. customer group price for the group's order volume.

---

## Channel Manager (`/manage/channel-manager`)

BigCommerce's multi-channel hub. Shows all connected sales channels:

- **Storefront:** The native BigCommerce store
- **Amazon:** If connected via BigCommerce's Amazon integration
- **eBay:** If connected
- **Facebook / Instagram:** Social commerce
- **Google Shopping:** Product feed / Buy on Google
- **Walmart Marketplace:** If connected
- **POS:** Point of sale (if applicable)
- **Custom channels:** Headless / API-driven storefronts

**For audit purposes:** Document all connected channels. Revenue attribution across channels helps the synthesizer understand where orders originate. If Amazon is connected as a channel, BigCommerce may show Amazon orders in total revenue — these need to be separated from DTC storefront revenue for accurate MER calculations.

**GOTCHA:** Multi-channel orders flowing into BigCommerce can inflate "total revenue" if you're trying to measure DTC-only performance. Always break out channel-level revenue for the synthesizer.

---

## Date Picker Behavior — Key Differences from Shopify

1. **Analytics date pickers persist within the Analytics section** — unlike Shopify where navigating between sub-pages can reset the range. However, leaving Analytics entirely (e.g., going to Orders) and coming back may reset it.
2. **Orders Advanced Search has its own date fields** — completely independent from Analytics date pickers. Always re-confirm the date range when switching between sections.
3. **Dashboard has NO custom date picker** — it shows preset time windows (today, this week, this month). Don't use Dashboard for audit data.
4. **Timezone:** Check Settings → General → Store Time Zone. All dates in orders and analytics use this timezone. If it differs from the client's operational timezone, boundary dates may be off by a day.
5. **Date format:** BigCommerce uses the store's locale setting for date display. Exports typically use ISO format (YYYY-MM-DD) or MM/DD/YYYY depending on version.

---

## Report Generation and Limitations

### Built-in Reports

BigCommerce's built-in reporting is less flexible than Shopify's custom report builder but includes some features Shopify requires apps for:

**Available natively:**
- Revenue over time (Analytics → Overview)
- Product performance / merchandising (Analytics → Merchandising — plan-dependent)
- Abandoned cart analytics (Analytics → Abandoned Carts)
- Real-time analytics (Analytics → Real-Time)
- Order reports (via Orders filtering and export)

**NOT available natively (may require apps or API):**
- Custom report builder (like Shopify Advanced/Plus has)
- Sales by discount/coupon report (need to build from order export)
- Profit report (no native COGS-based profit reporting — need to calculate manually)
- Customer cohort / LTV reports (need to build from customer + order exports)
- First-time vs returning customer revenue split (need to derive from order data)

### Workarounds for Missing Reports

- **Sales by coupon:** Export orders → filter by coupon code column → pivot table
- **Profit by product:** Export products (with Cost field) + export orders → join on SKU → calculate Revenue - COGS per product
- **New vs returning customers:** Export orders → cross-reference customer email with first order date → classify each order as new or returning
- **Monthly revenue trend:** Analytics → Overview → set date range to full audit period → screenshot/record the monthly chart data, or export orders and aggregate by month

---

## BigCommerce API v3 — Fallback for Data Extraction

If browser extraction is insufficient (large order volumes, need programmatic access, or analytics are plan-limited), BigCommerce API v3 can supplement data collection.

**To use the API, you need:** API credentials (Client ID, Access Token, Store Hash) from Settings → API → API Accounts. The client or store owner must create these.

### Key Endpoints

| Endpoint | Use For | Notes |
|---|---|---|
| `GET /v3/orders` | Order data with filtering | Supports date range, status, customer ID filters. Paginated (250/page). |
| `GET /v3/orders/{id}` | Single order detail | Includes line items, coupons, shipping, totals |
| `GET /v2/orders/{id}/products` | Order line items | Product details per order (v2 endpoint — still needed for line items) |
| `GET /v3/catalog/products` | Product catalog with pricing | Includes price, cost_price, sale_price, retail_price |
| `GET /v3/catalog/products/{id}/variants` | Product variants/SKUs | Price, cost_price, SKU, inventory per variant |
| `GET /v3/customers` | Customer data | Includes date_created, customer_group_id, addresses |
| `GET /v2/customers/{id}/orders` | Orders per customer | For LTV/cohort analysis |
| `GET /v3/promotions` | Active promotions | Coupon codes, rules, usage counts |
| `GET /v3/channels` | Connected channels | Channel IDs, names, types |
| `GET /v3/orders?channel_id={id}` | Orders by channel | Filter orders to specific sales channel |

**Rate limits:** BigCommerce API allows ~450 requests per 30 seconds (varies by plan). Pagination returns 250 items per page for most endpoints.

**Base URL:** `https://api.bigcommerce.com/stores/{store_hash}/`

**Headers required:**
```
X-Auth-Token: {access_token}
Content-Type: application/json
Accept: application/json
```

---

## Shipping and Tax Visibility

**Shipping costs (carrier-charged):** BigCommerce tracks shipping revenue (what the customer paid) in order data. Actual carrier costs are NOT tracked natively — they require a shipping app (ShipStation, ShipperHQ, etc.) or manual tracking. For CM2 calculation, you need actual shipping costs from an external source. Note this gap.

**Tax setup:** Settings → Tax shows tax rules. BigCommerce supports manual tax rules and automatic tax providers (Avalara, TaxJar). Tax amounts appear per order. For margin analysis, taxes are pass-through — exclude from revenue calculations (use subtotal/net, not tax-inclusive total).

**Payment processing fees:** Not tracked in BigCommerce natively. Check Settings → Payments for payment providers (Stripe, PayPal, Square, BigCommerce Payments). Processing fees are typically 2.9% + $0.30 per transaction. For CM3 calculations, estimate payment processing costs: Total Revenue × 0.029 + (Total Orders × 0.30). Label as ASSUMPTION unless client provides actual fees.

---

## BigCommerce Stencil vs Shopify Liquid

This is NOT directly relevant to the financial audit, but important context for the site-audit-v2 skill:

- **BigCommerce Stencil:** Handlebars-based theme engine. Themes are in `Storefront → Themes`.
- **Shopify Liquid:** Ruby-based template language.
- The CRO / site-audit skill needs to know which platform for theme customization recommendations.
- BigCommerce supports a page builder for visual editing (Page Builder) that Shopify matches with its Online Store 2.0 editor.

---

## Common Audit Pitfalls

1. **Multi-channel revenue inflation:** If Amazon, eBay, or other marketplace orders flow into BigCommerce via Channel Manager, total revenue includes non-DTC sales. Always break out channel-level data. For MER calculations, use only DTC storefront revenue vs. DTC ad spend.

2. **Customer group pricing invisible in discounts:** Wholesale or VIP customers may pay lower prices that don't show as "discounts." Revenue per order is accurate, but comparing to retail pricing overstates the discount rate. Check Customer Groups for pricing rules.

3. **Incomplete orders in totals:** BigCommerce "Incomplete" status means the customer started checkout but didn't complete payment. These should be EXCLUDED from revenue. Verify that the order status filter excludes Incomplete when pulling totals.

4. **Refund timing:** Like Shopify, refunds are processed asynchronously. A refund on an order from 30 days ago reduces current-period analytics. Analytics dashboards typically handle this correctly, but manual order export calculations may not — check which date (order date vs refund date) you're using.

5. **Test orders:** Check for orders with $0 total, orders to the store's own email, or orders tagged as test. BigCommerce doesn't have a built-in "test order" flag like some platforms — these need manual identification.

6. **Subscription revenue:** If using a subscription app (ReCharge, Bold, Ordergroove), recurring orders may appear as regular orders or through a separate channel. Clarify with the client how subscription orders flow in.

7. **Currency considerations:** BigCommerce supports multi-currency. Check Settings → Currencies. Order data shows the transacted currency. For audits, confirm whether Analytics shows values in the default/base currency or per-transaction currency. Exports may vary.

8. **Plan-dependent analytics:** BigCommerce Standard, Plus, Pro, and Enterprise plans have different analytics capabilities. Standard/Plus may lack Merchandising reports and advanced analytics. Always check what's available before planning the audit depth.
