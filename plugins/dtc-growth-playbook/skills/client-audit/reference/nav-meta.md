# Meta Ads Navigation

## Browser Tools

Use Claude in Chrome browser tools to inspect Meta Ads Manager.

**Tab management:**
- Use `tabs_context_mcp` first to get available tabs
- Create a tab for Meta Ads using `tabs_create_mcp`
- Keep tab-to-platform mapping consistent throughout

**Data extraction — prefer `read_page` for campaign tables:**
- Meta Ads campaign tables have columns (Purchases, ROAS, Cost Per Purchase) that are often scrolled off-screen to the right
- `read_page` captures all text content including off-screen columns — faster and more complete than screenshots + horizontal scrolling
- Use targeted screenshots to verify specific numbers after `read_page`

**Date range:**
- Meta Ads has a date range selector in the top bar
- Use "Maximum" if "Year to Date" isn't available
- Prefer YTD over manually selecting dates

**Navigation:**
- Use `navigate` to open URLs, `screenshot` to see what's on screen
- For scrolling dashboards, use `computer` with `scroll` action, then screenshot
- If a page loads slowly, use `wait` (2-3 seconds) and retry

**Access issues:**
- If login required, tell the user — don't attempt to enter credentials
- If columns are cut off, note what's missing as "DATA NOT AVAILABLE — [reason]"
