# Search Campaign Audit Checklist

Reference for the google-ads-audit-v2 audit skill. Structured checklist for Search campaign-specific audit items.

---

## 1. Quality Score Distribution

**Where to find it:** Keywords (left nav) → Search keywords → add "Quality Score" column (and optionally "Quality Score (hist.)", "Expected CTR", "Ad relevance", "Landing page experience")

**What to record:**

| QS Range | Count | % of Keywords | Action |
|---|---|---|---|
| 9-10 | | | Strong — protect these |
| 7-8 | | | Healthy — monitor |
| 5-6 | | | Review — optimize ad copy + LP |
| 1-4 | | | Fix or pause — dragging account quality |

**Benchmarks (from google-ads.md):**
- Below 5 = ad relevance, landing page experience, or expected CTR problem
- Below 7 = performance drag — higher CPCs and worse ad positions
- Target: 70%+ of keywords at QS 7+

**Breakdown by component (if visible):**
- **Expected CTR:** "Below average" → ad copy doesn't match intent. Rewrite headlines to match keyword themes.
- **Ad relevance:** "Below average" → keyword-to-ad alignment is poor. Create tighter ad groups with more specific ad copy.
- **Landing page experience:** "Below average" → LP doesn't match search intent, slow load, poor mobile experience. This is often a website problem, not an ads problem — flag for cross-channel.

**Evidence labeling:** Record actual QS distribution as OBSERVED. Diagnosis of causes is INFERENCE.

---

## 2. Negative Keywords

**Where to find it:** Keywords (left nav) → Negative keywords (tab at top). Also check shared negative keyword lists at account level.

**What to check:**

### Existing Negatives
- Are any negative keyword lists applied? How many negatives total?
- Are negatives at campaign level, ad group level, or account level?
- Are there shared negative keyword lists? What do they contain?
- Zero negatives → flag as HIGH priority finding (unless the account is brand new)

### Missing Negatives (from Search Terms Report)
- Pull the Search Terms report: Keywords → Search terms
- Sort by Cost (descending) to find expensive non-converting queries
- Look for obvious irrelevant terms that should be negated:
  - Competitor brand names (unless competitor conquesting is intentional)
  - Informational queries ("how to", "what is", "free", "DIY")
  - Job-related terms ("jobs", "careers", "salary")
  - Wrong product categories
  - Geographic mismatches

### Specific Negatives to Recommend
- Document the top 5-10 terms that should be negated immediately
- Estimate wasted spend on these terms (sum their cost with no conversions)
- Include in opportunities with expected impact = wasted spend recovery

**Evidence JSON mapping:**
- Finding: "Missing negative keywords causing wasted spend"
- Evidence: "Top non-converting search terms: [list with spend]. Estimated wasted spend: $X"
- Opportunity: "Add negative keywords for [terms]. Priority: HIGH. Expected impact: $X/month savings"

---

## 3. Match Type Distribution

**Where to find it:** Keywords → Search keywords. Check the "Match type" column.

**What to record:**

| Match Type | Keyword Count | % of Spend | Avg CPA | Notes |
|---|---|---|---|---|
| Exact | | | | Highest control, usually best CPA |
| Phrase | | | | Middle ground — often worst CPA (23% higher than broad+smart) |
| Broad | | | | Best with smart bidding + 50+ conv/month |

**Current best practice (from google-ads.md):**
- Broad match + smart bidding is the new default — works when: 50+ monthly conversions, accurate tracking, realistic ROAS target
- Phrase match now delivers 23% higher CPA than exact or broad+smart bidding (10,000+ accounts, Groas)
- Exact match is still valuable as a safety net for highest-value keywords

**What to flag:**
- Heavy phrase match usage → recommend testing broad + smart bidding migration (if volume supports it)
- All broad match with no smart bidding → dangerous — broad without smart bidding = uncontrolled spend
- No exact match keywords at all → consider adding exact match for highest-converting terms as controls

**Conversion volume check before recommending broad:**
- Below 30 conversions/month → too low for smart bidding. Recommend Manual CPC or Maximize Clicks.
- 30-50/month → can test Maximize Conversions (no target)
- 50-100/month → Target CPA or Target ROAS viable
- 100+/month → full smart bidding with broad match appropriate

---

## 4. Branded vs. Non-Branded Segmentation

**What to check:**
- Is there a separate branded Search campaign?
- Is branded traffic mixed into non-branded campaigns?
- What's the branded impression share?

**Branded Search Campaign Health:**

| Metric | Target | Flag If |
|---|---|---|
| Impression Share | 85-95% | Below 70% (competitors conquesting) |
| CTR | 15-25% | Below 10% (ad copy or competitor problem) |
| CVR | 15-25% | Below 8% (landing page problem) |
| CPC | Low (usually $0.50-2.00 for branded) | Above $3 (heavy competition or poor QS) |

**Budget allocation question:**
- How much of total Search spend goes to branded campaigns?
- If branded is >30% of total Google spend, flag for cross-channel review (is the brand investing too much in capturing demand it already owns?)
- Reference: Framework plan notes "Branded search may be over-invested at 19% of total budget" as a cross-channel signal

**Cross-channel signal:** If branded search volume is high, flag for the synthesizer to check whether Meta or email is driving that demand. Branded search revenue is often not truly incremental.

---

## 5. Ad Copy Quality (RSA Assessment)

**Where to find it:** Ads & assets (left nav) → Ads → filter by campaign

**For each active RSA (Responsive Search Ad):**
- Ad strength: Poor / Average / Good / Excellent
- Asset-level ratings: check which headlines and descriptions are rated "Low"
- Pin status: are any assets pinned to positions? (Pinning reduces Google's optimization flexibility)

**What to flag:**
- Any ad with "Poor" or "Average" ad strength → recommend rewriting
- More than 30% of assets rated "Low" → underperforming creative
- All headlines pinned → defeats RSA purpose, equivalent to old expanded text ads
- No RSAs at all (only legacy ETAs) → ETAs were sunset June 2022, these are grandfathered and may underperform

**AI Max for Search check (if applicable):**
- Is "Text Customization" enabled? (auto-generates headlines/descriptions per query)
- Is "Final URL Expansion" enabled? (AI selects landing page)
- Is "Search Term Matching" enabled? (keywordless targeting)
- Results: +18% unique search categories, +19% conversions when enabled (Groas data)
- If disabled but account has 50+ monthly conversions and accurate tracking → recommend testing

---

## 6. Landing Page Alignment

**For top-spend ad groups, check:**
- Does the final URL match the keyword theme?
- Are ads pointing to product pages, category pages, or homepage?
- Homepage as landing page for non-branded search → almost always wrong (flag HIGH)

**Quick LP assessment (without opening the site):**
- Check the final URL in the ad settings
- If all keywords in an ad group point to different products but all go to the same LP → mismatch
- If keywords are specific ("men's leather wallet") but LP is generic ("/shop/all") → poor alignment

**Evidence labeling:** LP alignment assessment is OBSERVED (you can see the final URLs) but LP quality judgment is INFERENCE (unless you actually visit the page, which is the site-audit skill's job).

**Cross-channel signal:** If landing page misalignment is widespread, flag for the site-audit/CRO skill. This is a conversion rate problem, not an ads problem.

---

## 7. Geographic Targeting

**Where to find it:** Campaign settings → Locations

**What to check:**
- Target locations: are they appropriate for the business?
- Location options: "Presence" (people IN the location) vs. "Presence or interest" (people IN or SEARCHING ABOUT the location)
- **Default is "Presence or interest"** — this means ads show to people outside your target area who search for something related to it. For ecommerce shipping within the US only, "Presence" is usually better.
- Excluded locations: are any exclusions in place?

**What to flag:**
- "Presence or interest" targeting for an ecommerce business with limited shipping → potential wasted spend on international/out-of-area clicks
- No geographic targeting at all (targeting all countries) → flag HIGH unless the business is truly global
- Geographic targeting that doesn't match the business's shipping capabilities

---

## 8. Bid Strategy Assessment

**For each Search campaign, record:**

| Campaign | Bid Strategy | Target | Monthly Conversions | Assessment |
|---|---|---|---|---|
| | | | | |

**Assessment criteria (from google-ads.md):**

| Monthly Conversions | Recommended Strategy |
|---|---|
| Below 30 | Manual CPC or Maximize Clicks |
| 30-50 | Maximize Conversions (no target) |
| 50-100 | Target CPA or Target ROAS |
| 100+ | Target ROAS with exploration |

**What to flag:**
- Target ROAS/CPA with <30 conversions/month → strategy can't learn, recommend downgrading
- Manual CPC with 100+ conversions/month → leaving efficiency on the table, recommend upgrading
- Target set unrealistically high → recalculate from profitability math (benchmarks.md)
- Recent strategy change within last 15 days → still in learning, don't judge performance yet

---

## 9. Search Term Report Review

**Where to find it:** Keywords → Search terms

**What to pull:**
- Top 20 search terms by cost (for each major campaign)
- Non-converting terms with >$50 spend
- Terms that converted at a CPA above the target

**What to flag:**
- Irrelevant terms with significant spend → negative keyword candidates
- Competitor terms appearing → is this intentional?
- Very broad/generic terms ("shoes", "bags") with poor CVR → add as negatives or reduce bids
- High-performing terms not in the keyword list → add as exact match keywords

**Evidence JSON mapping:**
- Add notable search terms to `raw_metrics.search_term_categories`
- Flag wasted spend in findings
- Create opportunity for negative keyword additions with estimated savings

---

## 10. Campaign Settings Audit

**Quick scan of settings for each Search campaign:**

| Setting | Check | Flag If |
|---|---|---|
| Networks | "Search partners" and "Display Network" | Display Network enabled on a Search campaign → almost always wrong, disable it |
| Ad rotation | "Optimize" vs "Rotate indefinitely" | "Rotate indefinitely" with RSAs → defeats purpose |
| Ad schedule | Any schedule applied? | Not necessary for most ecommerce, but check if one exists and if it makes sense |
| Device adjustments | Any bid adjustments by device? | Large negative on mobile (-50%+) may be outdated — mobile performance has improved |
| Audience targeting | "Observation" vs "Targeting" | "Targeting" limits reach to listed audiences — usually wrong for Search (use "Observation" to collect data) |

**The "Display Network" trap:**
- Google defaults Search campaigns to also show on the Display Network
- Display clicks on Search campaigns are almost always low-quality and waste budget
- If Display Network is enabled on Search campaigns → flag as HIGH, recommend disabling

---

## Evidence JSON Mapping Summary

| Search Finding | Evidence Section | Priority |
|---|---|---|
| QS distribution below 7 | findings[] | MEDIUM |
| Missing negative keywords / wasted spend | findings[] + opportunities[] | HIGH |
| Phrase match CPA penalty | findings[] | MEDIUM |
| Branded IS below 70% | findings[] | HIGH |
| No branded/non-branded separation | findings[] | MEDIUM |
| Ad copy rated Poor/Average | findings[] | MEDIUM |
| Homepage as non-branded LP | findings[] | HIGH |
| Geographic targeting misconfiguration | findings[] | MEDIUM-HIGH |
| Wrong bid strategy for volume | findings[] + opportunities[] | HIGH |
| Display Network on Search campaigns | findings[] | HIGH |
| Search terms with wasted spend | raw_metrics + opportunities[] | HIGH |
