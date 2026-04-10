# Klaviyo Navigation

## Browser Tools

Use Claude in Chrome browser tools to inspect Klaviyo dashboards.

**Key views to check:**
- **Flows:** Analytics → Flows. Look at flow performance (RPR, open rate, click rate, CVR) for each flow
- **Campaigns:** Analytics → Campaigns. Campaign send frequency, open/click rates, revenue attribution
- **Lists & Segments:** Audience → Lists & Segments. List size, growth rate, segment health
- **Deliverability:** Check inbox placement rates if available in Analytics

**Data extraction:**
- Use `read_page` for flow/campaign performance tables
- Screenshots for flow builder visualizations and segment logic
- Flow performance tables often have metrics scrolled off-screen — `read_page` captures everything

**Critical flows to check (in order of revenue impact):**
1. Welcome Series / Welcome Flow
2. Abandoned Cart / Checkout
3. Browse Abandonment
4. Post-Purchase / Thank You
5. Winback / Re-engagement
6. Price Drop / Back in Stock (if present)

**Key metrics to record for each flow:**
- RPR (Revenue Per Recipient)
- Open rate
- Click rate
- Conversion rate
- Number of emails in the sequence
- Active/inactive status

**Campaign metrics to record:**
- Send frequency (campaigns per week/month)
- Average open rate, click rate, unsubscribe rate
- Revenue per campaign send
- Segment targeting (full list vs. engaged segments)

**List health signals:**
- List growth rate (monthly)
- Unsubscribe rate trend
- Bounce rate
- Engagement segments (30-day, 60-day, 90-day active)

**Access issues:**
- If login required, tell the user
- Klaviyo URL patterns: app.klaviyo.com/flows, app.klaviyo.com/campaigns, app.klaviyo.com/lists
