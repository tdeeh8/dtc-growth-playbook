# PMax Campaign Audit Checklist

Reference for the google-ads-v2 audit skill. Systematic checklist for Performance Max campaign assessment, including asset group quality, search term performance, budget health, audience signals, and diagnostics.

---

## 1. Legacy Smart Shopping Detection

**What to Check:** Is this campaign a migration from Smart Shopping (pre-2022)?

**How to Identify:**
- If the campaign was created before mid-2022, it was likely Smart Shopping
- Smart Shopping has been deprecated and campaigns auto-migrated to PMax
- Check in Settings: is "Shopping Ads (Performance Max)" listed as the campaign type?

**Why it matters:** Legacy Smart Shopping campaigns often have manual URL optimization overrides that should be removed. In PMax (Andromeda era), you want the algorithm to auto-generate headlines and descriptions. Manual overrides restrict the optimization.

**What to Record:**
- Campaign name, creation date, migration status (if applicable)
- Whether final URL expansion is enabled or manually constrained
- If constrained: note the constraints (may be appropriate for brand protection, but limits performance)

**Evidence JSON Mapping:**
```json
{
  "title": "Legacy Smart Shopping campaign with manual URL optimization constraints",
  "label": "OBSERVED",
  "evidence": "Campaign created in 2021, migrated from Smart Shopping. Settings show final URL expansion disabled for multiple ad groups. This restricts Andromeda's ability to auto-generate variations.",
  "source": "Google Ads > [Campaign] > Settings > Final URL options",
  "significance": "Removing manual URL constraints could improve PMax delivery flexibility. Recommend enabling auto-generation unless there are brand protection requirements."
}
```

---

## 2. Asset Group Health Assessment

**What to Check:** Is the primary asset group complete and well-formed?

### Required Assets (use as baseline)

| Asset Type | Required | Recommended | Impact if Missing |
|---|---|---|---|
| Headlines (text) | 3+ | 5+ | Limits auto-generated ad variations |
| Descriptions (text) | 2+ | 4+ | Reduces message diversity |
| Images (landscape 4:3) | 3+ | 5+ | Limits creative delivery, may default to stock |
| Images (square 1:1) | 3+ | 5+ | Limits mobile and feed placements |
| Images (portrait 9:16) | 0 | 2+ | Enables Stories/Reels placements |
| Logo | 1+ | 1+ | Needed for brand identity |
| Final URL | 1 | 1 | Required, can't be missing |
| Business Name | 1 | 1 | Required |
| Videos | 0 | 1+ | Optional but improves performance |

**How to Assess:**

1. Open the PMax campaign
2. Click "Asset groups" tab
3. Click the primary asset group to view its composition
4. Count assets in each type
5. Note any "Missing" or "Incomplete" warnings

### Quality Assessment

| Check | Rating | Action if Failed |
|---|---|---|
| Headlines are unique (not copy/paste) | Pass/Fail | Rewrite at least 2 headlines to test different messaging angles |
| Descriptions are unique | Pass/Fail | Add 1-2 distinct descriptions emphasizing different benefits |
| Images are distinct (not slight color/crop variations) | Pass/Fail | Replace similar images with genuinely different creative concepts |
| Image quality is professional (not blurry, cut off, or low-res) | Pass/Fail | Replace low-quality assets |
| Logo is clear and readable at small size | Pass/Fail | Replace with higher contrast or simplified logo |
| Final URL is valid and landing page loads | Pass/Fail | Fix URL, test in browser |

**Evidence JSON Mapping:**
```json
{
  "title": "Primary asset group missing video assets and portrait images — limits placement diversity",
  "label": "OBSERVED",
  "evidence": "Asset group has 5 headlines, 4 descriptions, 3 landscape images, 3 square images, logo, but zero portrait images and zero videos. Google Ads shows warnings for Stories/Reels placement availability.",
  "source": "Google Ads > [PMax Campaign] > Asset groups > [Primary]",
  "significance": "Missing video and portrait assets reduces eligible placements. Andromeda can only deliver to Feed and standard placements. Adding video + portrait images could improve reach by 20-30% to high-intent mobile users."
}
```

---

## 3. Search Term Performance (PMax Diagnosis)

**What to Check:** Is the PMax campaign actually triggering on search, or defaulting to audience matching?

**Critical Gotcha:** Search Terms report is HIDDEN BY DEFAULT. See nav-google.md for unhiding steps.

### How to Extract Search Terms

1. Open the PMax campaign
2. Click "Search Terms" link in the data table (if visible)
3. If not visible: Click "Segments" dropdown → select "Search term" breakdown
4. The table populates with search queries that triggered the campaign
5. Filter by "Impressions > 10" to reduce noise

### What to Assess

| Signal | Meaning | Action |
|---|---|---|
| Search terms present and diverse (100+ distinct queries) | Algorithm is finding varied search intent | Continue monitoring. This is healthy. |
| Search terms are relevant to product/category | Algorithm understanding is correct | Good. |
| Search terms are branded (brand name + modifiers) | Campaign is capturing branded volume | Expected for many PMax campaigns. Check if non-branded search exists too. |
| Search terms are product-specific (product name + reviews, price, etc.) | Algorithm finding high-intent users | Excellent performance signal. |
| **Search terms are completely absent or <20 distinct queries** | **PMax is NOT using search signals — defaulting to audience matching** | **Diagnosis: audience signals are strong, but search optimization is bypassed. Opportunity: add search-focused keywords or create separate Search campaign.** |
| Search terms include irrelevant categories (unrelated products, competitors) | Targeting too broad or negative keywords missing | Add negative keywords for irrelevant categories |
| Search terms show very low quality (typos, off-topic, spam-like) | Low-quality traffic | Tighten negative keywords. Consider adding quality-filtering keywords. |

### Evidence JSON Mapping

```json
{
  "title": "PMax campaign not triggering on search — relying entirely on audience matching",
  "label": "OBSERVED",
  "evidence": "Search Terms report shows zero search queries across a 7-day sample with 500K+ impressions. Campaign is 100% driven by audience signals (in-market, similar to past purchasers) with no search optimization.",
  "source": "Google Ads > [PMax Campaign] > Segments: Search term",
  "significance": "Without search signals, the campaign misses high-intent queries (e.g., '[product category] near me', '[product] reviews'). Recommend: add relevant search-focused keywords to the asset group or create a separate Search campaign for high-intent volume. Expected lift: 15-25% additional conversions."
}
```

---

## 4. Budget-Limited Detection

**What to Check:** Is the campaign's daily budget capping delivery?

**How to Detect:**

1. Check campaign status: does it say "Limited by budget"?
2. Look at daily spend vs. daily budget:
   - If spend is consistently at or above 95% of daily budget → likely budget-limited
   - If spend fluctuates 60-90% of daily budget → normal, not capped
3. Check impressions trend: is impression volume flat despite rising bids/budget elsewhere? → may indicate budget cap

### Flags

| Signal | Severity | Implication |
|---|---|---|
| Daily spend = 98-100% of budget, every day | High | Campaign is capped. Could spend more if budget increased. |
| Impressions flat despite bid/budget increases elsewhere | Medium | Budget may be the constraint. Test 10-20% budget increase and monitor impression lift. |
| "Limited by budget" status in Settings | High | Explicit Google Ads flag. Same as above. |

**Important:** Budget-limited status is NOT inherently bad. It means the campaign is delivering to the best opportunities within the budget. Increasing budget is only worth testing if you can also improve the bid strategy or creative.

---

## 5. Audience Signal Health

**What to Check:** Are logged-in and conversion-based audience signals healthy?

**Where to Find This:**

Settings → Audiences (if configured)

### What to Assess

| Signal Type | Ideal Health | Flag if |
|---|---|---|
| Logged-in users signal | Enabling Andromeda to match intent for signed-in users | Not enabled, or "No eligible conversions" warning |
| Similar to past purchasers | Strong historical data for lookalike matching | List size <100 or >2 years old |
| Recent purchase signal | Fast feedback loop for new converters | >7 days old or no recent conversions in list |
| Similar to cart abandoners | Relevant for retargeting and re-engagement | Not configured or list is stale |
| Video viewers | Engagement signal for prospecting | List size <1,000 viewers |
| Website visitors | Audience for retargeting | List age >90 days or declining |

**Evidence JSON Mapping:**
```json
{
  "title": "Logged-in users signal not enabled — missing high-intent matching opportunity",
  "label": "OBSERVED",
  "evidence": "Campaign Settings show Audiences section with no logged-in user signal configured. Google Ads documentation indicates this signal improves intent matching for 40%+ of daily active users.",
  "source": "Google Ads > [PMax Campaign] > Settings > Audiences",
  "significance": "Enabling logged-in user signal could improve ROAS by 10-20%. Recommend enabling in Settings if this is a conversion-focused campaign."
}
```

---

## 6. URL Expansion & Auto-Generated Content Status

**What to Check:** Is the algorithm allowed to auto-generate headlines and descriptions?

**Where to Find This:**

Campaign Settings → Final URL options

### What to Look For

| Setting | Status | Meaning |
|---|---|---|
| Final URL expansion | Enabled | Algorithm can create variations (recommended) |
| Final URL expansion | Disabled with constraints | Manual override restricting variations (may be for brand safety) |
| Headline pinning | Light or none | Algorithm has freedom (good) |
| Headline pinning | Heavy (2+ pinned) | Manual override restricting messages (limits performance) |
| Description pinning | None | Algorithm has freedom (good) |
| Description pinning | Multiple pinned | Manual override restricting messages (limits performance) |

**Guidance:**

- For performance, enable auto-generation and remove manual constraints
- For brand safety, light pinning (1 headline, 1 description) is acceptable
- Heavy pinning (multiple manual overrides) = Andromeda can't optimize properly

---

## 7. Channel Breakdown & Performance

**What to Check:** How is performance distributed across channels (Search, Display, YouTube, Shopping)?

**How to Extract:**

1. Open the PMax campaign
2. Click "Segments" → "Network"
3. The table populates with performance by channel

### What to Assess

| Channel | Typical ROAS | Typical CPA | Typical Volume |
|---|---|---|---|
| Google Search | Highest ROAS, lowest CPA | Base benchmark | 40-60% of spend |
| Google Display | Medium ROAS, higher CPA | ~20-40% higher than Search | 15-25% of spend |
| Google Shopping | High ROAS (shopping-optimized) | Similar to Search | 5-20% of spend (if feed connected) |
| YouTube | Lower ROAS, higher CPA | ~30-50% higher than Search | 10-20% of spend |

**Flags:**

| Pattern | Severity | Implication |
|---|---|---|
| One channel dominates (e.g., 80% to Display) | Medium | Algorithm may be biased toward cheaper placements. Check bid strategy and consider manual channel bid adjustments. |
| Search channel extremely low volume (<20%) | High | Search optimization may be disabled. Check search terms report (see Section 3). |
| YouTube ROAS significantly lower than Search (2x+ worse) | Medium | Audience may not be engaged on video. Consider lowering YouTube bid adjustment or pausing YouTube. |
| Shopping channel producing high ROAS but low volume | Medium | Feed may be under-optimized or product feed is incomplete. Review feed quality. |

---

## 8. Diagnostics Card & Performance Recommendations

**What to Check:** Google Ads shows AI-generated diagnostics. Which are actionable?

**Where to Find This:**

Campaign view → "Diagnostics" card (right sidebar, below performance summary)

### What the Diagnostics Card Shows

- **Health score** (0-100): Overall campaign health. 70+ is healthy.
- **Recommendations:** AI suggestions for optimization (pause keywords, increase budget, adjust bids)
- **Issues & warnings:** Any tracking problems, disapprovals, or policy violations

### How to Interpret

| Recommendation | Actionable? | Note |
|---|---|---|
| "Increase budget by X%" | Caution | Only if: (1) budget-limited status confirmed, (2) ROAS is sustainable above budget cap, (3) you have creative refresh capacity. |
| "Pause low-performing keywords" (for PMax) | N/A | Not applicable to PMax — keywords are not manually managed. |
| "Increase bids on high-performing search terms" | Maybe | Only if search terms are actually driving conversions. Check search terms report first (Section 3). |
| "Add negative keywords" | Yes | Always actionable if irrelevant search terms identified. |
| "Improve asset quality" | Yes | Actionable if asset group quality assessment (Section 2) identifies missing or low-quality assets. |
| "Enable new features" (e.g., Responsive Search Ads) | Caution | For PMax, RSAs are already used. May be suggesting other features — evaluate case-by-case. |

### Evidence JSON Mapping

```json
{
  "title": "Diagnostics card shows 'Low quality asset group' warning — asset refresh needed",
  "label": "OBSERVED",
  "evidence": "Campaign Diagnostics card displays warning: 'Asset group below recommended quality. Add more images and videos.' Current asset group has 3 images, 4 headlines, 2 descriptions, no videos.",
  "source": "Google Ads > [PMax Campaign] > Diagnostics card",
  "significance": "Google's diagnostic is valid. Asset group is under-diversified. Recommendation: add 2-3 more images (different styles/angles) and 1 product demo video. Expected lift: 10-15% impressions and quality matching."
}
```

---

## 9. Paused Campaigns & Historical Context

**What to Check:** Are there paused PMax campaigns that could be reactivated or deleted?

**How to Identify:**

1. Filter campaign list by Status = "Paused"
2. Check pause date and reason (if available in campaign notes)
3. Check last-30-day performance before pause (if visible in history)

**What to Record:**

| Paused Campaign | Pause Date | Last Performance | Reason | Recommendation |
|---|---|---|---|---|
| ... | ... | ROAS X, CPA $X | Notes | Archive / Delete / Test Reactivate |

**Flags:**

- Paused >6 months ago with no clear reason → likely can be deleted
- Paused due to underperformance but no structural fix applied → reactivate only if new creative ready
- Paused due to budget constraints but account budget increased → consider re-enabling if ROAS was acceptable

---

## 10. Feed Quality Check (if Shopping data included)

**What to Check:** Is the product feed (Merchant Center) connected and healthy?

**Where to Find This:**

Google Merchant Center → [Feed] → Issues & Diagnostics

### What to Assess

| Check | Healthy | Flag if |
|---|---|---|
| Feed submission status | Green (no issues) | Red (errors blocking feed) or Yellow (warnings) |
| Item count | Increasing or stable | Declining (products disappearing) |
| Disapprovals | <5% of items | >10% items disapproved (policy violations) |
| Missing required fields | None | Price, availability, product type, images missing for >5% |
| Image quality | High-res, clear product | Blurry, cut-off, or placeholder images common |

**Evidence JSON Mapping:**
```json
{
  "title": "Merchant Center feed has 12% item disapprovals — limiting Shopping performance",
  "label": "OBSERVED",
  "evidence": "Merchant Center diagnostics show 847 items disapproved out of 7,100 total (12% disapproval rate). Primary issues: 'Images do not follow product policies' (400 items), 'Price format invalid' (280 items), 'Missing required field: description' (167 items).",
  "source": "Google Merchant Center > [Feed] > Issues",
  "significance": "Feed quality issues are limiting PMax Shopping channel performance. Recommend: (1) Fix price format in feed template, (2) Add descriptions to products, (3) Audit image compliance (Google is strict on policy). Expected improvement: 20-30% increase in Shopping impressions."
}
```

---

## Data Collection Summary

At the end of the PMax assessment, you should have:

1. **Campaign metadata:** Name, creation date, budget, status, last updated
2. **Asset group inventory:** Number of asset groups, primary group asset counts (headlines, descriptions, images, video, logo)
3. **Asset quality assessment:** Pass/fail on uniqueness, clarity, professional quality
4. **Search terms analysis:** Count of distinct search queries, relevance assessment, volume by search type
5. **Budget health:** Budget-limited status, spend vs. budget ratio, daily trend
6. **Audience signals:** Logged-in user, past purchaser, video viewer, website visitor signals (enabled/disabled, list size, freshness)
7. **URL expansion & pinning:** Auto-generation status, manual override count, brand safety constraints noted
8. **Channel breakdown:** Search %, Display %, YouTube %, Shopping % (if applicable)
9. **Diagnostics assessment:** Health score, 2-3 key recommendations, warnings
10. **Feed quality (if applicable):** Disapproval rate, issue categories, required field completeness

This feeds into the `raw_metrics.pmax_campaigns` section and multiple `findings` entries in the evidence JSON.
