# Audience Structure Audit Checklist

Reference for the meta-ads-audit-v2 audit skill. Systematic checklist for evaluating Meta audience targeting strategy, funnel segmentation, overlap detection, exclusion hygiene, and Advantage+ audience behavior. Draws from `protocols/playbook/andromeda.md` (targeting hierarchy, Advantage+ behavior) and `protocols/playbook/scaling-frequency.md` (audience saturation signals).

**Principle:** In the Andromeda era, audience targeting is secondary to creative quality. But bad audience structure still wastes money — overlapping audiences cause self-competition, missing exclusions burn budget on already-converted users, and misconfigured Advantage+ defaults to retargeting instead of prospecting.

---

## 1. TOF / MOF / BOF Audience Split

### Classification Guide

**TOF (Top of Funnel) — Prospecting / Cold:**
- Advantage+ Shopping Campaign (ASC) with proper customer cap
- Broad targeting (no interest or behavioral constraints)
- Advantage+ Audience (formerly open targeting with suggestions)
- Large interest-based audiences (>5M estimated reach)
- Wide lookalike audiences (5%+)

**MOF (Middle of Funnel) — Engagement / Warm:**
- Video viewers (25%, 50%, 75%, 95% watched)
- Page/profile engagers (Facebook page, Instagram profile interactions)
- Content consumers (blog readers, lead magnet downloaders who haven't purchased)
- Ad engagers (people who clicked/engaged with ads but didn't visit site)

**BOF (Bottom of Funnel) — Retargeting / Hot:**
- Website visitors (various recency windows: 7d, 14d, 30d, 60d, 90d, 180d)
- Add-to-cart audiences (didn't purchase)
- Initiate checkout audiences (didn't purchase)
- Email subscriber lists (for cross-sell/upsell)
- Past purchaser lists (for replenishment/loyalty)

### Budget Split Benchmarks

| Funnel Stage | Healthy Budget % | Floor | Ceiling |
|---|---|---|---|
| TOF (Prospecting) | 60-70% | 50% | 80% |
| MOF (Engagement) | 10-20% | 5% | 25% |
| BOF (Retargeting) | 15-25% | 10% | 30% |

**Flags:**
- BOF > 30% of spend → Over-invested in retargeting. Looks efficient (high ROAS) but is buying people who would have converted anyway. The pipeline will dry up.
- TOF < 50% → Insufficient prospecting. Short-term ROAS looks good but new customer volume is declining.
- No MOF at all → Missing the nurture layer. Cold traffic goes directly to retargeting, losing people who need more touchpoints.

### How to Record

For each ad set, record in working notes:

```
| Ad Set | Campaign | Funnel Stage | Audience Type | Est. Size | Spend | % of Total | ROAS | CPA |
|---|---|---|---|---|---|---|---|---|
| ... | ... | TOF/MOF/BOF | Broad/LAL/Interest/Custom | X M | $ | % | x | $ |
```

---

## 2. Lookalike (LAL) Audience Assessment

### Inventory

For each lookalike audience in use, record:
- **Seed audience:** What list or pixel event is the source? (Purchasers, top 25% by LTV, email list, ATC, website visitors?)
- **Percentage:** What size? (1%, 1-2%, 2-3%, 3-5%, 5-10%?)
- **Country/region:** What geography?
- **Age:** How old is the seed audience? When was it last refreshed?

### Quality Assessment

| Seed Quality | Rating | Notes |
|---|---|---|
| Top 25% customers by LTV | Best | Highest-value signal for finding similar buyers |
| All purchasers (last 180d) | Good | Standard approach, reliable |
| Email subscribers | Moderate | Includes non-buyers — noisier signal |
| Website visitors (all) | Weak | Includes bouncers and bots — low signal quality |
| Page engagers | Weak | Engagement ≠ purchase intent |

### Size Assessment

| LAL Size | Use Case | CPM Impact |
|---|---|---|
| 1% | Highest precision, smallest reach | Highest CPMs (least inventory competition) |
| 1-3% | Balanced precision and reach | Moderate CPMs |
| 3-5% | Broader reach, lower precision | Lower CPMs |
| 5-10% | Near-broad, limited value over broad | Minimal CPM benefit over broad |

### The LAL CPM Penalty (from andromeda.md)

**Key finding:** Broad targeting delivers ~49% higher ROAS vs. lookalikes, driven primarily by 45% higher CPMs on LALs. The algorithm has to bid more aggressively in a restricted auction.

**Flags:**
- Account heavily LAL-dependent (>50% of TOF spend on LALs) → Recommend testing Advantage+ or broad
- Using 1% LALs with limited budget → CPM penalty may be unsustainable
- LAL seed audiences not refreshed in 6+ months → Signal may be stale
- Multiple LALs from the same seed at different percentages (1%, 3%, 5%) → These overlap significantly; consolidate or test broad

### Evidence JSON mapping:
```json
{
  "title": "Lookalike audiences consuming 65% of TOF budget with 45% higher CPMs vs. broad",
  "label": "CALCULATED",
  "evidence": "LAL ad sets: $18,500 spend, avg CPM $22.40. Broad ad sets: $9,800 spend, avg CPM $15.40. CPM delta: ($22.40 - $15.40) / $15.40 = 45.5% higher on LALs. LAL ROAS: 2.1x. Broad ROAS: 2.8x.",
  "source": "Meta Ads Manager > Ad Sets tab > filtered by audience type > custom columns (CPM, ROAS, Spend)",
  "significance": "LALs are more expensive and less efficient than broad targeting. Per Andromeda research, broad consistently outperforms LALs by ~49% on ROAS. Recommend testing Advantage+ Audience or broad targeting for primary prospecting."
}
```

---

## 3. Advantage+ Audience Settings

### What to Check in ASC Campaigns

**Existing Customer Budget Cap:**
```
Campaign Settings → Existing Customer Budget Cap
```

| Cap Setting | Rating | Behavior |
|---|---|---|
| Not set | Critical flag | ASC defaults to retargeting warm audiences (easy conversions, inflated ROAS, no growth) |
| >50% | High flag | Over-indexes on existing customers; prospecting is capped |
| 30-50% | Monitor | Acceptable for mature accounts with strong retention |
| 25-30% | Recommended | Balances prospecting vs. existing customer efficiency |
| <20% | Aggressive prospecting | Good for growth-stage brands, may see lower ROAS initially |

**Customer Definition:**
- How does Meta identify "existing customers"? (Pixel-based purchasers, uploaded customer list, both?)
- If customer list is outdated, the cap doesn't work properly — customers who SHOULD be capped aren't
- Recommend using BOTH pixel + customer list for most accurate definition

### What to Check in Manual Campaigns Using Advantage+ Audience

**Advantage+ Audience (formerly "Advantage detailed targeting expansion"):**
```
Ad Set Settings → Audience → Advantage+ Audience toggle
```

When Advantage+ Audience is ON:
- The targeting inputs (interests, demographics) become "suggestions" not constraints
- Meta can (and will) deliver outside these suggestions if the algorithm finds better prospects
- This is generally good for accounts with 50+ conversions/week and clean CAPI
- Performance data shows delivery can be 80%+ outside the original targeting suggestion

**When to override (use manual targeting instead):**
- Hyper-local single-store businesses (need geographic precision)
- Niche B2B with TAM under 5K (algorithm can't find enough signal in broad)
- Dedicated retargeting campaigns (need specific custom audiences)
- Compliance restrictions (age-gated products, special ad categories)

### Audience Suggestions vs. Constraints

| Setting | Behavior | Best For |
|---|---|---|
| Advantage+ Audience ON, no suggestions | Fully broad — Meta decides everything | High-volume accounts, diverse creative |
| Advantage+ Audience ON, with suggestions | Meta uses suggestions as starting signal, expands from there | Most accounts (recommended default) |
| Advantage+ Audience OFF, manual targeting | Only reaches defined audience | Retargeting, compliance, hyper-local |

---

## 4. Overlap Detection

### Why Overlap Matters

When multiple ad sets target overlapping audiences, the advertiser competes against themselves in the auction. This inflates CPMs and reduces efficiency. The worst case: three ad sets all targeting variations of the same core audience, each driving up the other's costs.

### How to Check Overlap

**Method 1: Audience Overlap Tool (if accessible)**
```
Audiences → select 2+ audiences → "..." menu → Show Audience Overlap
```
- Shows the percentage of people who appear in both audiences
- Overlap >30% between ad sets in different campaigns = significant self-competition
- Overlap >50% = essentially the same audience, consolidate immediately

**Method 2: Manual Inspection**
If the Overlap tool isn't accessible, check audience definitions manually:
- Are multiple ad sets using the same interest categories?
- Are lookalike audiences from the same seed overlapping? (1% LAL and 1-3% LAL share 100% of the 1% audience)
- Are website visitor windows overlapping? (30d visitors includes all 7d visitors)
- Is an ASC campaign running alongside a manual campaign targeting the same broad audience?

### Common Overlap Patterns

| Pattern | Severity | Fix |
|---|---|---|
| ASC + manual broad targeting same geo | High | Consolidate into ASC only, or exclude ASC audiences from manual |
| Multiple LALs from same seed (1%, 3%, 5%) | Medium | The smaller LAL is entirely contained in the larger. Consolidate or test one at a time. |
| 7d website visitors + 30d website visitors in different ad sets | Medium | 7d is a subset of 30d. Use tiered exclusions (30d set excludes 7d visitors). |
| Interest Set A + Interest Set B with significant overlap | Medium | Combine into one ad set or test sequentially, not simultaneously. |
| TOF broad + BOF retargeting without exclusions | High | TOF is also reaching warm audiences. Exclude purchasers + recent visitors from TOF. |

### Evidence JSON mapping:
```json
{
  "title": "Three ad sets with >40% audience overlap causing self-competition",
  "label": "OBSERVED",
  "evidence": "Audience Overlap tool: Ad Set A (Interest: Fitness) and Ad Set B (Interest: Health & Wellness) show 42% overlap. Ad Set C (LAL 3% from purchasers) overlaps 38% with Ad Set A. All three are in separate campaigns bidding in the same auction.",
  "source": "Meta Ads Manager > Audiences > Audience Overlap tool",
  "significance": "Self-competition inflates CPMs across all three ad sets. Consolidating into 1-2 ad sets with diverse creative would reduce CPMs and improve ROAS per Andromeda consolidation research (17% more conversions at 16% lower cost)."
}
```

---

## 5. Exclusion Audit

### Required Exclusions (flag if missing)

| Exclusion | Where to Apply | Why | Severity if Missing |
|---|---|---|---|
| Past purchasers (180d) | TOF prospecting campaigns | Stop paying to acquire people who already bought | High |
| Past purchasers (30d) | MOF engagement campaigns | Avoid re-nurturing recent buyers (unless cross-sell strategy) | Medium |
| Email subscribers | TOF prospecting (optional) | Depends on strategy — some brands want to reach subscribers via ads too | Low |
| Internal users / employees | All campaigns | Wasted impressions on non-prospects | Low |
| BOF audiences from TOF | TOF prospecting | Prevent overlap between funnel stages | Medium |

### How to Check Exclusions

```
Ad Set level → Edit → Audience section → "Exclude" field
```

- Check each prospecting ad set for purchaser exclusions
- Check retargeting ad sets for exclusion of lower-funnel stages (e.g., cart abandoner retargeting excludes purchasers)
- Note: ASC campaigns handle exclusions differently — the existing customer budget cap serves this function instead of explicit exclusions

### ASC Exclusion Handling

In ASC campaigns, you can't add traditional exclusions. Instead:
- The **Existing Customer Budget Cap** controls how much budget goes to warm vs. cold audiences
- You CAN add a "Customer List" to define who counts as an existing customer
- If the customer list is incomplete, the cap doesn't protect against over-retargeting
- Recommend uploading a complete purchaser list AND enabling pixel-based customer definition

### Flag Patterns

| Finding | Severity | Evidence to Record |
|---|---|---|
| Zero exclusions on any TOF campaign | High | "No exclusion audiences configured on [campaign name]. Prospecting budget is reaching past purchasers." |
| ASC with no customer cap and no customer list | Critical | "ASC campaign [name] has no existing customer budget cap and no customer definition. Campaign is likely defaulting to retargeting." |
| Retargeting campaign not excluding purchasers | Medium | "BOF retargeting [campaign name] includes past purchasers in the target audience. Wasting retargeting budget on already-converted users." |
| No cross-stage exclusions (TOF reaches BOF audience) | Medium | "TOF campaign [name] does not exclude website visitors or engagers. Funnel stages are not segmented." |

---

## 6. Audience Size Assessment

### Estimated Reach by Campaign Type

Check the "Estimated Audience Size" indicator in ad set settings:

| Campaign Type | Minimum Viable Audience | Optimal Range | Too Large? |
|---|---|---|---|
| TOF Prospecting (broad) | 1M+ | 5M-50M+ | No upper limit for broad |
| TOF Prospecting (interest) | 500K+ | 2M-20M | >50M is effectively broad |
| MOF Engagement | 100K+ | 500K-5M | Depends on engagement volume |
| BOF Retargeting | 10K+ | 50K-500K | Retargeting audiences should be smaller |
| Lookalike (1%) | Varies by country | 2M-4M (US) | N/A — fixed by seed + % |

**Flags:**
- TOF audience under 500K → Too narrow for effective optimization (Andromeda needs room to explore)
- BOF audience under 1K → Too small for any meaningful delivery. Consider expanding the window (7d → 30d) or merging with other warm audiences.
- Audience shows "Audience too narrow" warning in Ads Manager → Immediate action needed

### Audience Exhaustion Check

If you have both Reach and estimated audience size:
```
Audience Saturation % = Total Reach / Estimated Audience Size × 100
```

| Saturation | Status | Action |
|---|---|---|
| <30% | Healthy | Room to scale within this audience |
| 30-60% | Monitor | Approaching saturation. Watch frequency trends. |
| >60% | Saturated | Expanding audience or channels is likely necessary. New creative alone won't fix it. |

---

## 7. Geographic & Demographic Targeting

### What to Record

For each ad set:
- **Countries / regions targeted:** US-only? Multi-country? Specific states/DMAs?
- **Age range:** 18-65+? Restricted to specific ranges?
- **Gender:** All? Specific?
- **Language:** Targeting specific languages?

### Flags

| Finding | Severity | Notes |
|---|---|---|
| Same geo across TOF and BOF with no exclusions | Medium | Funnel stages compete in same auctions |
| Narrow age range on TOF (<10 year span) | Medium | Restricts Andromeda's ability to find buyers. Broad age often works better. |
| Gender restriction without clear product reason | Low | May be limiting reach unnecessarily |
| Multi-country in single ASC campaign | Medium | Per scaling-frequency.md: separate ASC per major market recommended at $5K+/day. Mixed geos confuse optimization signals. |
| No language targeting in multi-language geos | Low | Ads may serve to audiences who can't read the copy |

---

## 8. Custom Audience Health

### Custom Audience Inventory

Record all custom audiences in use:

```
| Audience Name | Source | Size | Retention Window | Last Updated | Used In |
|---|---|---|---|---|---|
| Website - All Visitors 30d | Pixel | XX,XXX | 30 days | Auto | [ad set names] |
| Purchasers 180d | Pixel + List | XX,XXX | 180 days | [date] | [ad set names] |
| Email Subscribers | Customer List | XX,XXX | N/A | [date] | [ad set names] |
| Video Viewers 50% | Engagement | XX,XXX | 365 days | Auto | [ad set names] |
```

### Health Checks

| Check | What to Look For | Flag If |
|---|---|---|
| Customer list freshness | When was the list last uploaded? | >90 days since last upload (stale data) |
| Pixel audience size | Is it growing, stable, or shrinking? | Shrinking = traffic or tracking issue |
| Retention window appropriateness | Does the window match the purchase cycle? | 7d window for 90-day consideration product = too short |
| Unused audiences | Audiences created but not used in any ad set | Cleanup opportunity (not a performance issue) |
| Duplicate audiences | Multiple audiences tracking the same thing (e.g., two "All Visitors 30d") | Consolidate to prevent confusion |

### Retention Window Guidance by AOV

| AOV | Recommended Retargeting Windows |
|---|---|
| <$50 (impulse) | 7d, 14d, 30d |
| $50-200 | 14d, 30d, 60d |
| $200-500 | 30d, 60d, 90d |
| $500+ | 60d, 90d, 180d |

If the retargeting window is significantly shorter than the consideration cycle, the account is missing converters who need more time. If significantly longer, the audience becomes too diluted with cold users.

---

## Data Collection Summary

At the end of the audience assessment, you should have:

1. **Funnel classification table** — every ad set tagged TOF/MOF/BOF with spend allocation
2. **Targeting type inventory** — Advantage+, Broad, Interest, LAL, Custom Audience per ad set
3. **LAL assessment** — seed quality, size, CPM penalty analysis
4. **ASC settings** — customer cap, customer definition, audience suggestions
5. **Overlap findings** — any overlapping audiences with severity
6. **Exclusion audit** — what's excluded, what's missing
7. **Audience size and saturation** — estimated vs. reached
8. **Custom audience health** — freshness, retention windows, unused/duplicate audiences

This feeds into the `raw_metrics.audience_details` section and multiple `findings` entries in the evidence JSON.
