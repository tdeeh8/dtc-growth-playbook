# Brand Analytics / Search Query Performance Checklist

Reference checklist for Phase 2 (Brand Analytics Export) of the amazon-ads-v2 audit. Covers navigation (CRITICAL: use dropdown, NOT direct URL), data extraction, impression share interpretation, and organic ranking gap analysis.

---

## Navigation — CRITICAL

### DO NOT use direct URL navigation

**Never navigate directly to:** `/brand-analytics/search-analytics/search-query-performance`

Direct URL navigation causes the page renderer to **freeze** — CDP screenshot timeout, unresponsive page. This is Gotcha 11 in nav-amazon.md and has been confirmed across multiple audit sessions.

### Correct Navigation Sequence

1. Navigate to Seller Central home or Brand Analytics main page
2. Find the **"Search Analytics"** dropdown in the top navigation bar
3. Click to open the dropdown
4. Select **"Search Query Performance"** from the dropdown menu
5. Wait for the page to fully render before attempting data extraction

### Date Range

- Defaults to **weekly view** showing the most recent complete week
- The week selector uses custom dropdown components
- If you can't programmatically change the week, capture whatever period is loaded
- **Always note the exact date range** in your evidence — SQR data is weekly, not cumulative
- For YTD comparison, you'd need to pull multiple weeks (usually not practical in a single audit pass — capture the most recent week and note the limitation)

---

## Data Extraction

### Primary Method — CSV/Report Export (try first)

- [ ] Check if the Search Query Performance page has an export/download option
- [ ] If CSV export is available, download it
- [ ] Parse CSV to extract all per-query metrics
- [ ] Verify column headers match expected schema (search query, volume, impressions, clicks, cart adds, purchases — with brand vs total splits)

### Fallback — JavaScript Extraction (expected for Brand Analytics)

Note: Brand Analytics may not offer a CSV export. If no export is available, JavaScript extraction is the primary method for this source.

- [ ] Use role-based selectors: `document.querySelectorAll('[role="row"]')`
- [ ] If that fails, try: `document.querySelectorAll('table tbody tr')`
- [ ] Cross-check with accessibility tree (read_page) for validation

### Per-Query Data Points

For each search query where the brand appears, capture:

- [ ] **Search query text** — the actual search term
- [ ] **Search query volume** — relative volume indicator (not absolute number)
- [ ] **Total impressions** — all brands' impressions for this query
- [ ] **Brand impression count** — your brand's impressions
- [ ] **Brand impression share** — your brand's % of total impressions
- [ ] **Total clicks** — all brands' clicks for this query
- [ ] **Brand click count** — your brand's clicks
- [ ] **Brand click share** — your brand's % of total clicks
- [ ] **Total cart adds** — all brands' cart adds
- [ ] **Brand cart adds** — your brand's cart adds
- [ ] **Brand cart add share** — your brand's % of total cart adds
- [ ] **Total purchases** — all brands' purchases
- [ ] **Brand purchases** — your brand's purchases
- [ ] **Brand purchase share** — your brand's % of total purchases

---

## Impression Share Interpretation

Brand impression share tells you where you rank organically (plus paid impressions). This is Gotcha 7 in nav-amazon.md.

| Impression Share | Estimated Position | Interpretation |
|-----------------|-------------------|----------------|
| <1% | Page 3+ | Essentially invisible — organic ranking is very weak |
| 1-3% | Bottom of page 2 or page 3 | Marginal visibility — ads are likely the only traffic driver |
| 3-5% | Page 2 | Some visibility but not competitive |
| 5-10% | Bottom of page 1 | Decent positioning — room to grow |
| 10-20% | Page 1, mid-position | Competitive — good organic presence |
| 20-40% | Page 1, top positions | Strong — dominant for this query |
| 40%+ | #1-2 position | Category leader for this query |

**Important:** Impression share includes BOTH organic AND paid impressions. A high impression share driven primarily by paid ads (high ad spend on this keyword + low organic rank) is not the same as organic dominance.

### How to Distinguish Organic vs. Paid Share

Cross-reference Brand Analytics impression share with Amazon Ads data:

1. Find the same keyword in the Targeting page
2. Compare TOS (Top of Search) impression share from Ads with Brand Analytics impression share
3. If Ad TOS share ≈ Brand Analytics impression share → most impressions are paid, organic is weak
4. If Brand Analytics share >> Ad TOS share → organic is contributing significantly

---

## Diagnostic Analysis

### Organic Ranking Gap Analysis

**The most valuable output from Brand Analytics.**

Identify keywords where:

| Pattern | Signal | Priority |
|---------|--------|----------|
| High volume + <2% impression share | Biggest organic gaps — you're invisible on high-value terms | HIGH |
| High volume + decent impression share but <1% purchase share | Ranking well but not converting — listing problem | HIGH |
| Branded terms + <80% impression share | Competitors conquesting your brand | CRITICAL |
| Branded terms + zero purchases | Brand awareness exists but listing isn't converting | CRITICAL |
| High impression share + low click share | Good rank but poor main image or price | MEDIUM |
| High click share + low cart add share | Good listing visits but something blocks add-to-cart (price, reviews, content) | MEDIUM |
| High cart add share + low purchase share | Cart abandonment — pricing, shipping, or trust issue at checkout | MEDIUM |

### Funnel Drop-off Analysis

For each significant keyword, compare the funnel:

```
Impression Share → Click Share → Cart Add Share → Purchase Share
```

Where the biggest drop-off occurs tells you where the problem is:

- **Impression → Click drop:** Main image, title, price, or review count is weak vs. competitors
- **Click → Cart Add drop:** Detail page content, A+ content, bullet points, or pricing not compelling
- **Cart Add → Purchase drop:** Shipping cost surprise, delivery time, or checkout friction

### Branded Term Health Check

**Branded keywords should have the highest conversion rates.** If they don't, the problem is NOT advertising — it's one of:

1. **Pricing significantly above expectations** (competitor or own DTC price visible)
2. **Poor listing quality** (images, bullets, A+ content)
3. **Review issues** (low count, low rating, recent negative reviews)
4. **Out of stock or low inventory** (Amazon suppresses listings)
5. **Buy Box loss** (Featured Offer % low — see seller-central-checklist.md)

See Gotcha 14 in nav-amazon.md — don't optimize bids on branded terms until root cause is identified.

---

## Evidence JSON Mapping

| Data Point | JSON Location |
|-----------|--------------|
| Per-query SQR data | `raw_metrics.brand_analytics_sqr[]` |
| Organic ranking gaps | `findings[]` with OBSERVED/INFERENCE labels |
| Branded term conversion issues | `findings[]` — flag as high significance |
| Funnel drop-off patterns | `findings[]` with INFERENCE label |
| Organic vs paid share comparison | `cross_channel_signals[]` |
| Keywords needing organic investment | `opportunities[]` |

### Key Cross-Channel Signals to Flag

These go in `cross_channel_signals[]` for the synthesizer:

1. **Organic ranking gaps on high-volume terms:**
```json
{
  "signal": "Brand impression share <2% on {X} high-volume keywords",
  "check_in": ["google-ads", "ga4"],
  "what_to_look_for": "Are these keywords also targeted in Google Shopping? Is organic traffic from Amazon referrals showing in GA4?"
}
```

2. **Branded search health:**
```json
{
  "signal": "Branded terms showing {X}% impression share but only {Y}% purchase share",
  "check_in": ["shopify", "website-cro"],
  "what_to_look_for": "Is DTC pricing lower than Amazon? Are there unauthorized resellers visible on price comparison?"
}
```

3. **Ad-dependent impression share:**
```json
{
  "signal": "High Brand Analytics impression share ({X}%) but Ads TOS share is also {Y}% — organic rank may be weak",
  "check_in": ["amazon-ads"],
  "what_to_look_for": "If ads paused, would impression share collapse? Test by comparing ad-on vs ad-off periods if data available."
}
```

---

## Common Data Quality Issues

1. **SQR data is weekly, not daily or monthly.** Always note the specific week captured. Don't extrapolate to monthly without caveating.

2. **Search query volume is relative, not absolute.** It's a rank/band, not a raw number. Compare volumes relatively ("Keyword A has 3x the volume of Keyword B") rather than stating absolute search counts.

3. **Brand share includes ALL your ASINs.** If you have 5 products appearing for a keyword, the brand impression share is the combined share across all of them. High brand share with low per-ASIN share may mean you're cannibalizing your own listings.

4. **Zero impression share doesn't mean zero impressions.** Amazon may round down or exclude very small impression counts. Zero likely means <0.5%.

5. **Week-to-week volatility is normal.** Don't diagnose from a single week's data. If possible, note the trend direction, but caveat single-week observations appropriately. Label as OBSERVED (single data point) rather than INFERENCE (which would require trend data).
