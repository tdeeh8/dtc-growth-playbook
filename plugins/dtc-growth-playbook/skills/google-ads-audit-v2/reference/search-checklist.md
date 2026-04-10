# Search Campaign Audit Checklist

Reference for the google-ads-audit-v2 audit skill. Systematic checklist for Search campaign health assessment, covering Quality Score, keywords, match types, ad copy, landing pages, bid strategy, and conversion tracking.

---

## 1. Quality Score Assessment

**What it is:** Google's quality metric for keywords, rated 1-10. Directly impacts CPC and ad rank.

**How to Extract:** Customize columns to include "Avg. Quality Score" and "Quality Score Distribution"

**Thresholds (from benchmarks.md):**

| Rating | Score | Action |
|---|---|---|
| Excellent | 8-10 | Reduce bids — Google is rewarding quality with lower CPCs |
| Healthy | 6-7 | Monitor. Typical range. |
| Below Average | 4-5 | Review keyword relevance, landing page, ad copy |
| Poor | 1-3 | Fix or pause. These keywords are costing 2-3x more per click. |

**How to Diagnose Low Quality Scores:**

Quality Score has 3 sub-components (viewable at keyword level):
1. **Ad Relevance:** How closely ads match the keyword intent
2. **Landing Page Experience:** How relevant the landing page is to the keyword and ad
3. **Click-Through Rate (CTR):** Historical CTR of the keyword vs. benchmarks

**Fix Strategy by Component:**
- Low Ad Relevance → Rewrite ad copy or split into new ad group with more specific ads
- Poor Landing Page → Redirect to more relevant page or improve content on current page
- Low CTR → Improve ad copy (headlines, CTA), test new angles, or pause if irrelevant search term

**Evidence JSON Mapping:**
```json
{
  "title": "Quality Score distribution critically poor — 45% of keywords rated 1-3",
  "label": "CALCULATED",
  "evidence": "Ad group quality score distribution: 15% (scores 1-3), 35% (scores 4-6), 50% (scores 7-10). Benchmark for healthy account is 20%, 35%, 45%. This distribution indicates systematic issues with relevance, landing page, or ad copy.",
  "source": "Google Ads > Campaign > Ad Group > Customize Columns: Quality Score Distribution",
  "significance": "Low Quality Score keywords are incurring 2-3x CPCs. Recommendation: (1) Pause bottom 20% of keywords by volume, (2) Test landing page redesign for non-brand ad groups, (3) Refresh ad copy with benefit-focused headlines."
}
```

---

## 2. Negative Keyword Audit

**What to Check:** Are negative keywords preventing irrelevant traffic?

**How to Extract:**

1. Open the campaign or ad group
2. Click "Keywords" tab
3. Look for "Negative keywords" section (may be collapsed)
4. Count negative keywords, review categories

**Assessment:**

| Check | Healthy | Flag if |
|---|---|---|
| Negative keyword count | 20+ per campaign | <10 (likely missing irrelevant terms) |
| Negative keyword freshness | Updated in last 30 days | Unchanged for 90+ days (may have new irrelevant terms) |
| Negative categories | Competitors, job boards, educational, free, alternatives | No strategy evident (seems random) |
| Match type mix | Phrase + Broad negative mix | All exact or all broad (overly restrictive or loose) |

**Common High-Impact Negatives to Audit:**

| Category | Examples | When to Add |
|---|---|---|
| Competitors | -"competitor brand", -"competing product" | If competitor traffic is irrelevant to your offering |
| Jobs/career intent | -"hiring", -"jobs", -"careers" | If product is not a job or recruiting service |
| DIY/tutorials | -"how to", -"DIY", -"tutorial" | If you're selling products, not educational content |
| Free/cheap intent | -"free", -"discount codes", -"coupons" | If you can't compete on price or offer |
| Alternatives/comparisons | -"vs", -"alternative", -"comparison" | If comparison traffic doesn't convert |
| Irrelevant categories | -"used", -"rental", -"subscription" | If you don't offer these variants |

**Evidence JSON Mapping:**
```json
{
  "title": "Negative keyword strategy underdeveloped — only 8 negatives across 40-keyword campaign",
  "label": "OBSERVED",
  "evidence": "Campaign has 40+ active keywords but only 8 negatives configured (all exact match, all competitor brands). Search Terms report shows 30%+ of impressions on non-brand, non-product queries (e.g., 'how to [product]', 'free [product]', 'used [product]').",
  "source": "Google Ads > Campaign > Negative keywords + Search Terms breakdown",
  "significance": "Underdeveloped negative list is allowing irrelevant traffic and wasting budget. Recommendation: add 15-20 phrase-match negatives covering: DIY/tutorial intent, free/cheap modifiers, educational/comparison intent, used/rental variants. Expected improvement: 15-20% reduction in wasted spend."
}
```

---

## 3. Match Type Split & Strategy

**What it is:** Keywords can be Exact, Phrase, or Broad match. Each trades specificity for reach.

**How to Extract:** Customize columns to include "Match Type" in the Keywords tab.

**Thresholds & Strategy:**

| Match Type | Best For | Volume | CPA | Risk |
|---|---|---|---|---|
| Exact Match [keyword] | Branded, high-intent | Lower | Lower CPA | Limited reach |
| Phrase Match "keyword" | Product category | Medium | Medium CPA | Some irrelevant traffic |
| Broad Match keyword | Awareness, prospecting | Higher | Higher CPA | High irrelevant traffic |

**Diagnostic Questions:**

1. **Is the account over-reliant on broad match?** (>60% keywords broad match)
   - Broad match works ONLY if you have strong negative keyword strategy
   - If negatives are weak, broad match = wasted budget
   - Recommendation: migrate to phrase match, build negatives, test ROAS

2. **Is exact match under-used?** (<20% exact match)
   - Exact match typically has lowest CPA and highest quality
   - Good opportunity for bid increases
   - Recommendation: increase bids on exact match +10-15%

3. **Is phrase match misconfigured?** (Phrase keywords with very high CPA)
   - Phrase match should be in the middle (price and performance)
   - If phrase CPA is near broad match CPA, the keywords may be too generic
   - Recommendation: split phrase keywords into more specific sub-groups

**Evidence JSON Mapping:**
```json
{
  "title": "Match type distribution heavily skewed to broad match — high risk of wasted spend",
  "label": "CALCULATED",
  "evidence": "Keywords split: 75% Broad match, 15% Phrase match, 10% Exact match. Broad match keywords average CPA $45, Exact match average CPA $28. Negative keyword count only 5 (insufficient for broad match control). Broad match is responsible for 50% of spend but only 35% of conversions.",
  "source": "Google Ads > Campaign > Keywords > Match Type column",
  "significance": "Broad match without strong negatives is a known inefficiency pattern. Recommendation: (1) Reduce broad match allocation to 30%, (2) Build 20+ phrase match keywords from top performing search terms, (3) Expand exact match +50%. Expected improvement: 20-25% CPA reduction."
}
```

---

## 4. Branded vs Non-Branded Segmentation

**What to Check:** Are branded keywords (brand name + modifiers) separated from non-branded (product category, benefit)?

**How to Assess:**

In the Keywords tab, manually categorize each keyword:
- **Branded:** Contains brand name (e.g., "[Brand] [product]", "[Brand] reviews", "[Brand] vs [competitor]")
- **Non-branded:** Product category or benefit (e.g., "[product type]", "[benefit] [category]", "buy [product]")

**Why it Matters:**

Branded and non-branded keywords have very different:
- **CTR:** Branded keywords typically 5-10% CTR. Non-branded 1-3% CTR.
- **CPA:** Branded typically 50-70% lower CPA than non-branded (high intent, demand already exists)
- **Quality Score:** Branded typically higher QS (strong CTR, brand familiarity)
- **Bid Strategy:** Branded can often run on Manual CPC. Non-branded needs Tgt CPA or Tgt ROAS.

**Red Flag:** Branded and non-branded keywords in the same ad group with the same bid
- Different keywords need different bids
- Branded converts better, should have different bid strategy
- Recommendation: split into separate ad groups or campaigns

**Evidence JSON Mapping:**
```json
{
  "title": "Branded and non-branded keywords mixed in same ad group with identical bids",
  "label": "OBSERVED",
  "evidence": "Ad Group 'Core Products' contains: branded keywords ('[Brand] [product]', '[Brand] reviews', '[Brand] buy') with 8.2% avg CTR, CPA $22 — and non-branded keywords ('[product type]', 'buy [product]', '[product] for [use case]') with 2.1% avg CTR, CPA $68. Same bid applied to all ($1.50 max CPC).",
  "source": "Google Ads > Campaign > Ad Group > Keywords tab + performance metrics",
  "significance": "Branded and non-branded keywords require different bid strategies. Applying same bid to both means non-branded keywords are under-bid (losing high-intent traffic) or over-bid (wasting budget on lower-intent traffic). Recommendation: split into separate ad groups. Expected improvement: 15-20% conversion lift on non-branded, 10-15% CPA reduction on branded."
}
```

---

## 5. Ad Copy Quality & RSA Analysis

**What to Check:** Are Responsive Search Ads (RSAs) fresh, diverse, and benefit-focused?

**How to Assess:**

1. Open the Ads tab within an ad group
2. Review each active RSA:
   - **Headline freshness:** When were the headlines created? (Older than 6 months = potentially stale)
   - **Headline uniqueness:** Are the 3 headlines substantively different, or slight variations of the same message?
   - **Description variety:** Do descriptions emphasize different benefits, or repeat the same value prop?
   - **CTA clarity:** Is there a clear call-to-action (Shop Now, Learn More, Get Offer)?
   - **Keyword alignment:** Do ad copy messages align with the keywords being targeted?

**Healthy RSA Example:**

```
Headline 1: "Buy [Product] Online - Fast Shipping"
Headline 2: "[Product] for [Use Case] - Save 30%"
Headline 3: "Premium [Product] Quality - 5-Star Reviews"

Description 1: "Free shipping on orders over $50. Shop bestsellers today."
Description 2: "Trusted by 100K+ customers. Expert advice available."
```

(Each headline/desc emphasizes a different benefit: speed, discount, trust, reviews, free shipping, advice)

**Poor RSA Example:**

```
Headline 1: "[Product] Online"
Headline 2: "[Product] For Sale"
Headline 3: "Buy [Product]"

Description 1: "Visit our store for [product]."
Description 2: "Shop [product] at great prices."
```

(All headlines are nearly identical. Descriptions repeat same message. No distinct benefits.)

**Flags:**

| Pattern | Severity | Fix |
|---|---|---|
| All headlines use same opening phrase (e.g., all start with "Buy") | High | Rewrite at least 2 headlines with different openings (benefit, use case, social proof) |
| Descriptions all emphasize the same benefit | Medium | Add descriptions emphasizing: shipping speed, price/discount, reviews, expert support, guarantee |
| No social proof messaging (reviews, customer count, awards) | Medium | Add 1 headline and 1 description emphasizing social proof |
| RSAs older than 6 months with no recent updates | Low-Medium | Refresh at least 2 headlines with current offers or timely benefits |

---

## 6. Landing Page Alignment

**What to Check:** Does the landing page match the keyword and ad copy?

**How to Assess:**

For a sample of keywords, review the landing page:
1. Click the keyword
2. Visit the Final URL (click the landing page link)
3. Check alignment:
   - **Headline match:** Does the page headline echo the keyword/ad copy?
   - **Content relevance:** Is the product/benefit featured prominently on the page?
   - **CTA visibility:** Is a conversion CTA (Shop, Sign Up, etc.) visible above the fold?
   - **Loading speed:** Does the page load in <3 seconds?
   - **Mobile experience:** Is the page responsive and readable on mobile?

**Quality Score Impact:**

Landing Page Experience (QS sub-component) is heavily influenced by:
- Content relevance (does it match keyword intent?)
- CTA clarity (is next step obvious?)
- Loading speed (Core Web Vitals matter)
- Mobile-friendliness
- Transparency (are privacy/return policies accessible?)

**Common Issues:**

| Issue | Impact | Fix |
|---|---|---|
| All keywords point to homepage | High | Redirect to product-specific landing pages (5-10% QS improvement expected) |
| Landing page is slow (>5s load time) | High | Optimize images, enable compression, use CDN (QS improvement + 2-3% CTR lift) |
| Mobile page is unreadable (text too small, CTAs hard to click) | High | Redesign for mobile (10-15% mobile conversion lift) |
| CTA is buried below fold | Medium | Move primary CTA above fold (5-10% conversion lift) |
| Page content doesn't match keyword | Medium | Redirect to relevant product page or add content clarifying product fit (3-5% QS improvement) |

---

## 7. Geographic Targeting & Performance

**What to Check:** Are campaigns geographically targeted appropriately?

**How to Extract:**

1. Campaign Settings → Locations
2. Note which countries, states, or cities are targeted
3. If multiple geos: segment performance by location (breakdown by location)

**Assessment:**

| Check | Healthy | Flag if |
|---|---|---|
| Single-country targeting (unless multi-national) | Yes | Multiple countries with different languages/currencies (consolidate or separate) |
| City/state-level targeting (for local business) | Yes | Targeting too broad (entire country) for local business |
| Performance by location | Even distribution across regions | One location driving 60%+ (may indicate seasonality or local demand imbalance) |

---

## 8. Bid Strategy Assessment

**Search Campaign Bid Strategy Maturity Progression:**

| Stage | Strategy | When to Use | Risks |
|---|---|---|---|
| Early | Manual CPC | Starting out, low conversion volume (<20/mo) | Requires constant manual adjustments |
| Growth | Tgt CPA | 20-50 conversions/mo, consistent conversion patterns | Needs historical data; may be volatile early |
| Mature | Tgt ROAS | 50+ conversions/mo, predictable ROAS | Can't execute if conversion volume drops |
| Advanced | Maximize Conversions | High conversion volume (100+/mo), unlimited budget | May spend beyond ROI target |

**What to Check:**

1. **Is the bid strategy appropriate for conversion volume?**
   - <20 conv/mo → Manual CPC (automation needs data)
   - 20-50 conv/mo → Consider Tgt CPA (but watch for volatility)
   - 50+ conv/mo → Tgt CPA or Tgt ROAS (algorithm has signal)
   - 100+ conv/mo → Can support Maximize Conversions

2. **Is the CPA or ROAS target realistic?**
   - Tgt CPA set higher than recent actual CPA → algorithm is conservative, room to spend more
   - Tgt CPA set lower than recent actual CPA → algorithm may not spend enough (reduce target)
   - Tgt ROAS set lower than recent ROAS → can raise (increase profitability)

3. **Are bid adjustments aligned with performance?**
   - High-performing device (e.g., mobile with 20% better ROAS) → increase bid +10-20%
   - Low-performing location → decrease bid -20-30% or exclude

**Evidence JSON Mapping:**
```json
{
  "title": "Bid strategy misaligned with conversion volume — Manual CPC on low-volume campaign",
  "label": "OBSERVED",
  "evidence": "Campaign has averaged 12 conversions/month over the last 90 days. Bid strategy is Manual CPC ($1.50 max CPC). Campaign has sufficient historical data to shift to Tgt CPA, which would improve efficiency.",
  "source": "Google Ads > Campaign Settings > Bid strategy",
  "significance": "Manual CPC requires constant adjustment and doesn't leverage historical conversion patterns. Recommendation: shift to Tgt CPA = $45 (recent average CPA). Expected improvement: 20-30% higher conversion volume with same spend."
}
```

---

## Data Collection Summary

At the end of the Search assessment, you should have:

1. **Quality Score analysis:** Distribution (% in 1-3, 4-6, 7-10), problem areas identified
2. **Negative keyword inventory:** Count, categories, freshness, strategy
3. **Match type breakdown:** % Exact, % Phrase, % Broad, performance comparison
4. **Branded vs non-branded split:** Are they segmented? Performance difference?
5. **RSA quality assessment:** Headline/description freshness, diversity, benefit coverage
6. **Landing page audit:** Sample of 5-10 keywords with landing page relevance assessment
7. **Geographic targeting:** Countries/regions targeted, performance distribution
8. **Bid strategy:** Current strategy, conversion volume, target realism, bid adjustments

This feeds into the `raw_metrics.search_campaigns` section and multiple `findings` entries in the evidence JSON.
