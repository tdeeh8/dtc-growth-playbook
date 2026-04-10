# Amazon Seller Central & Ads Navigation

## Seller Central

**"Stores Deactivated" ≠ seller account deactivated.**
Amazon Seller Central may display a banner saying "you have stores currently Deactivated." This refers to Amazon **Stores** — the customizable brand storefront page (a marketing feature). It does NOT mean the seller account is suspended or that listings are down.

**Verify account status from data, not banners:**
- If you see daily sales, open orders, and active FBA inventory, the account is operational
- A truly suspended account shows explicit suspension notices and no active sales
- Always check Global Snapshot (Sales, Open Orders, Featured Offer %) before concluding anything from banners

## Amazon Ads Campaign Manager

**The "All" tab trap — critical:**
- The "All" campaigns tab shows brand-specific metrics that can be misleading
- Summary bar displays "Branded searches," "Detail page views," and a "Purchases" count that refers specifically to brand-attributed purchases
- These can all show **zero** even when Sponsored Products campaigns generate hundreds of real purchases and thousands in sales

**Always check the "Sponsored Products" tab separately:**
- Click the "Sponsored Products" tab at the top of Campaign Manager
- This shows actual SP metrics: Impressions, Clicks, Purchases, CPC, Sales
- These numbers reflect real product-level ad performance

**Cross-reference:**
- If "All" tab shows $X in Sales but 0 Purchases → purchases came from Sponsored Products, not Sponsored Brands
- Switch tabs to confirm before drawing conclusions about ad effectiveness

**Estimating spend when no Spend column is visible:**
- Multiply Clicks × CPC from the Sponsored Products summary bar
- This gives a reliable spend estimate for calculating ROAS

**Virtualized grids (ag-Grid):**
- `read_page` may return empty cells because content hasn't rendered
- Fix: scroll table rows into viewport first, then retry `read_page` on the specific row group
- If still failing: navigate to a report/export view or use summary metrics instead

**Date range:**
- Amazon Ads has a date dropdown with presets
- Prefer "Year to Date" when available

**Access issues:**
- If login required, tell the user
- If specific reports are restricted, note as DATA NOT AVAILABLE
