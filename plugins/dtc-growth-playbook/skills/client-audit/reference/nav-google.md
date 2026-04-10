# Google Ads & GA4 Navigation

## Google Ads

**Data extraction:**
- Use `read_page` for campaign tables — captures all columns including those scrolled off-screen
- Screenshots for visual context and verification
- For scrolling, use `computer` with `scroll` action

**Date range:**
- Google Ads has preset date ranges in the top bar
- Prefer "Year to Date" when available

## GA4 Navigation

**Critical: GA4 defaults to "Last 7 days" on the Home view — this is insufficient.**

**To get meaningful data:**
1. Navigate to Reports → Acquisition → Traffic Acquisition
2. Change date range using the date picker in the top-right
3. If the URL redirects to Home: use left sidebar icons — Reports (bar chart icon) → Life cycle → Acquisition

**Reports to check:**
- "Traffic acquisition" (session-level) — primary
- "User acquisition" (first-touch) — secondary, if time allows
- The GA4 Home view only shows 7-day data — always navigate to detailed reports

**Cross-domain tracking verification:**
- If the client uses Shopify checkout, check whether _gl parameter passes between store domain and checkout
- Look for self-referrals from the checkout domain in traffic sources — this indicates broken cross-domain tracking

**Access issues:**
- If login required, tell the user
- If specific reports are restricted, note as DATA NOT AVAILABLE
