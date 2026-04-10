# Creative Audit Checklist

Reference for the meta-ads-v2 audit skill. Systematic checklist for Meta creative performance assessment, fatigue detection, and diversity analysis. Draws from `protocols/playbook/andromeda.md` (canonical source for creative fatigue and Entity ID clustering) and `protocols/playbook/benchmarks.md` (creative metric thresholds).

**Principle:** Creative IS targeting in the Andromeda era. Poor creative diversity = narrow delivery, high frequency, and wasted spend. The creative audit is often the highest-leverage finding in a Meta audit.

---

## 1. Hook Rate Analysis

**What it is:** The percentage of impressions that result in 3 seconds of video viewing. Measures whether the creative stops the scroll.

**Formula:** `Hook Rate = 3-Second Video Views / Impressions`

**How to get the data:**
- Customize columns to include "3-Second Video Views" and "Impressions"
- Calculate hook rate per ad: 3s views ÷ impressions
- Only applies to video ads (static images don't have this metric)

**Thresholds (from benchmarks.md):**

| Rating | Hook Rate | Action |
|---|---|---|
| Strong | 40%+ | Winning hook — study what makes it work, replicate the pattern |
| Healthy | 25-35% | Performing well, keep running |
| Floor | 20-25% | Underperforming — test new hooks |
| Broken | <20% | Creative problem. The hook isn't stopping the scroll. Kill or redesign. |

**What to record per ad:**
- Ad name/ID, hook rate, spend, impressions
- Hook style categorization (question, bold claim, visual disruption, testimonial opening, problem statement, before/after, pattern interrupt)
- Flag any ad with hook rate below 20% that's still receiving significant spend

**Evidence JSON mapping:**
```json
{
  "metric": "Hook Rate (Top Ad)",
  "value": 0.32,
  "formatted": "32%",
  "label": "CALCULATED",
  "source": "3-sec views (45,000) / impressions (140,625) = 32%. Meta Ads Manager > Ads > [ad name]"
}
```

---

## 2. Hold Rate Analysis

**What it is:** The percentage of people who watched 3 seconds and continued to watch 50%+ of the video. Measures message resonance beyond the initial hook.

**Formula:** `Hold Rate = Video Plays at 50% / 3-Second Video Views`

**How to get the data:**
- Customize columns to include "Video Plays at 50%" and "3-Second Video Views"
- Calculate per video ad

**Thresholds (from benchmarks.md):**

| Rating | Hold Rate | Action |
|---|---|---|
| Strong | 60%+ | Compelling message — people want to keep watching |
| Healthy | 40-55% | Good retention, message resonates |
| Floor | 30-40% | Message loses people midway — tighten the narrative |
| Broken | <30% | Hook works but message doesn't. Rewrite the body, not the hook. |

**Diagnostic value:** High hook rate + low hold rate = the opening grabs attention but the message doesn't deliver. Low hook rate + high hold rate = the message is strong but the hook isn't stopping people. Different problems, different fixes.

---

## 3. Thumb-Stop Ratio

**What it is:** Similar to hook rate but specifically for the "did this stop the scroll" moment. In practice, this is often used interchangeably with hook rate.

**Formula:** `Thumb-Stop Ratio = 3-Second Video Views / Impressions` (same as hook rate)

Some practitioners use a stricter version: `Video Plays at 25% / Impressions` (requires slightly more engagement).

**Strong:** 25-35%+. **Weak:** Below 20%.

Use whichever version the account/client already tracks for consistency. Default to 3-second version.

---

## 4. Creative Fatigue Detection

**This is the most actionable creative diagnosis.** Fatigue is diagnosed by the *relationship* between metrics over time, not a single number.

### Fatigue Signals (flag when any 2 are present simultaneously)

| Signal | Metric | Threshold | How to Check |
|---|---|---|---|
| CTR decay | CTR drops from peak | >20% decline from 7-day peak | Weekly CTR trend per ad |
| CPA inflation | CPA increases from baseline | >15% increase from first-week CPA | Weekly CPA trend per ad |
| Frequency ceiling | Prospecting frequency | >3.0/7d (diagnose), >3.5 (refresh), >4.5+ (broken) | Campaign-level frequency |
| CPM spike | CPM without seasonal cause | >15% increase from baseline with no competitive explanation | Weekly CPM trend |
| Relevance decline | Ad Relevance Diagnostics | Drops a tier (Average → Below Average) for 3+ days | Ad-level diagnostics |
| Hide rate spike | Negative feedback | Hides per 1K impressions increase significantly | Ad-level feedback (if accessible) |

### How to Build the Fatigue Trend

1. Apply the **Time Breakdown (By Time → Week)** to campaign or ad set level
2. Record weekly: Frequency, CTR, CPA, CPM, Impressions
3. Plot (or tabulate) frequency vs. CTR week over week
4. Find the inflection point: the week where frequency rises and CTR drops simultaneously

### Fatigue vs. Other Problems

| Pattern | Diagnosis | Fix |
|---|---|---|
| CTR drops + CPA rises + frequency rises + reach stable | Creative fatigue | New creative (different hooks, angles, formats) |
| CTR drops + CPA rises + reach flattens + CPM rises | Audience saturation | Expand audiences (broader targeting, new geos) |
| CTR stable + CPA rises + CVR drops | Landing page / site problem | Not a creative issue — flag for site audit |
| All metrics deteriorate simultaneously | Tracking or attribution issue | Check Events Manager before diagnosing creative |

### Ad Lifespan Reference (from andromeda.md)

| Spend Level | Expected Ad Lifespan | Refresh Cadence |
|---|---|---|
| $50K+/mo | 1-2 weeks | Refresh every 7-14 days |
| $10K-50K/mo | 2-3 weeks | Refresh every 2-3 weeks |
| <$10K/mo | 3-4 weeks | Refresh every 3-4 weeks |

Flag any ad that has been running for more than 2x its expected lifespan without refresh.

---

## 5. UGC vs. Branded Performance Comparison

**Why this matters:** Per andromeda.md, UGC/creator content outperforms polished branded production by 3-5x on conversions. This is one of the most reliable findings in Meta advertising.

### How to Compare

1. At the ad level, categorize each ad as:
   - **UGC / Creator:** User-generated, testimonial, unboxing, talking head, raw/authentic feel
   - **Branded / Polished:** Studio-shot, high production value, brand-consistent, professional editing
   - **Mixed / Hybrid:** Brand messaging delivered through UGC-style format

2. Calculate aggregate metrics per category:
   - Average CPA, average ROAS, average CTR, average hook rate
   - Total spend allocation: what % of budget goes to UGC vs. branded?

3. **Key diagnostic questions:**
   - Is UGC outperforming branded? By how much? (3-5x is expected)
   - Is UGC under-allocated relative to its performance? (Common finding)
   - Does the account have ANY UGC? If zero UGC → high-priority flag
   - Are branded ads consuming budget despite higher CPA? Why?

**Evidence JSON mapping:**
```json
{
  "title": "UGC outperforms branded content by 2.8x on CPA",
  "label": "CALCULATED",
  "evidence": "UGC ads (5 ads, $8,200 spend): avg CPA $24.50. Branded ads (8 ads, $12,400 spend): avg CPA $68.60. $24.50 / $68.60 = 2.8x more efficient. But branded receives 60% of budget vs UGC at 40%.",
  "source": "Meta Ads Manager > Ads tab > manual categorization + custom column metrics",
  "significance": "Budget allocation inversely correlated with performance. Shifting 20% of branded budget to UGC could reduce blended CPA by ~15%."
}
```

---

## 6. Video vs. Static vs. Carousel Performance

### How to Compare

At the ad level, categorize by format:
- **Video:** Single video ads (short-form <15s, mid 15-30s, long 30s+)
- **Static Image:** Single image ads
- **Carousel:** Multi-image/video carousel
- **Collection / Instant Experience:** Full-screen mobile format

Calculate per format: average CPA, ROAS, CTR, CPM, and total spend share.

### What to Look For

| Signal | Meaning |
|---|---|
| All ads are the same format | Insufficient format diversity — Andromeda has limited signal variety |
| Video dominates spend but static has lower CPA | Algorithm is biased toward video impressions (more inventory) but static converts better. Test more static. |
| Carousel has highest CTR but lowest volume | Carousels get fewer impressions by default — consider carousel-specific campaigns |
| No video at all | Missing the dominant format. Critical gap. |
| No static at all | Static can outperform in BOF/retargeting. Test. |

### Video Length Analysis

| Length | Best For | Expected Behavior |
|---|---|---|
| <6s | Brand awareness, thumb-stop | Highest hook rate, lowest hold rate. Good for TOF reach. |
| 6-15s | Product demos, benefit highlights | Sweet spot for most DTC products. |
| 15-30s | Testimonials, storytelling | Higher hold rate but lower hook rate. Better for warm audiences. |
| 30s+ | Education, detailed reviews | BOF only. Cold audiences drop off. |

---

## 7. Ad Copy Pattern Analysis

### What to Record Per Ad

- **Primary text length:** Short (<50 words), medium (50-100), long (100+)
- **Opening approach:** Question, bold claim, testimonial quote, problem statement, stat/number, social proof
- **Body approach:** Feature list, benefit narrative, story arc, social proof compilation
- **CTA type:** Shop Now, Learn More, Get Offer, custom
- **Headline text:** What's in the headline field?
- **Urgency/scarcity elements:** Limited time, low stock, seasonal, none

### Patterns to Flag

| Pattern | Action |
|---|---|
| All ads use the same opening approach | Test different openings. Andromeda needs varied signals. |
| Long copy consistently outperforms short | Audience is high-consideration. Lean into educational content. |
| Short copy wins on prospecting, long copy wins on retargeting | Expected pattern. Allocate accordingly. |
| No testimonial/social proof in any ad | Critical gap for most DTC verticals. |
| Every ad uses "Shop Now" CTA | Test "Learn More" for TOF (lower commitment). |

---

## 8. Creative Diversity Assessment (Entity ID Clustering)

**This is the strategic creative diagnosis** — not about individual ad performance but about whether the creative set is giving Andromeda enough signal diversity.

### Entity ID Principle (from andromeda.md)

Andromeda groups semantically similar ads into "Entity IDs." 50 slight variations of the same hook = 1 Entity ID competing in auction, not 50. To get genuine auction diversity, you need genuinely different:
- **Hooks** (different opening 3 seconds)
- **Angles** (different benefit/pain point emphasized)
- **Formats** (video, static, carousel, UGC, polished)
- **Messaging** (different copy approach, different CTA)

### How to Assess Diversity

1. List all active ads in the primary prospecting campaign/ad set
2. For each ad, tag:
   - Primary hook (what does the first 3 seconds show/say?)
   - Primary angle (what benefit/pain point is emphasized?)
   - Format (video/static/carousel)
   - Style (UGC/branded/hybrid)
   - Copy approach (testimonial/benefit/problem-solution/social proof)

3. Count genuinely distinct *concepts* (not just ads):
   - Two ads with the same hook in different colors = 1 concept
   - Same copy with different images = 1 concept (if the message is identical)
   - Same product shown from different angles with different benefit copy = 2 concepts

4. **Minimum viable diversity:** 8-15 genuinely different concepts per ad set (from andromeda.md)

### Diversity Scoring

| Distinct Concepts | Score | Action |
|---|---|---|
| 15+ | Strong | Sufficient diversity for the algorithm |
| 8-14 | Healthy | Adequate but add more as budget allows |
| 4-7 | Weak | Andromeda is likely clustering most ads together. Priority: add variety. |
| 1-3 | Critical | Near-zero creative diversity. Major finding. |

### Red Flags for Clustering

- All ads feature the same person/creator
- All hooks start with the same phrase or visual
- Only one ad format (all video, or all static)
- All ads emphasize the same single benefit
- Variations are just color/background swaps of the same asset

### Evidence JSON mapping for diversity finding:
```json
{
  "title": "Creative diversity critically low — 3 genuine concepts across 12 active ads",
  "label": "INFERENCE",
  "evidence": "12 active ads in ASC campaign, but manual review shows only 3 distinct concepts: (1) product demo video in 4 variations, (2) testimonial static in 5 variations, (3) lifestyle image in 3 variations. Per Andromeda Entity ID clustering, the algorithm likely treats these as 3 ad units competing, not 12.",
  "significance": "Narrow delivery and rising frequency are likely caused by insufficient creative diversity. Andromeda needs 8-15 genuinely different concepts to optimize effectively."
}
```

---

## 9. Creative Production Capacity Flag

After completing the creative analysis, assess whether the client can sustain the refresh cadence their spend level requires:

| Spend Level | Required New Creatives | Cadence |
|---|---|---|
| $50K+/mo | 15-30+ per month | Every 7-14 days |
| $10K-50K/mo | 8-20 per month | Every 2-3 weeks |
| <$10K/mo | 5-15 per month | Every 3-4 weeks |

If the account shows signs of fatigue AND has low creative volume, flag creative production capacity as an open question:
```json
{
  "question": "Can the client produce enough new creative to sustain refresh cadence?",
  "data_needed": "Client's creative production workflow, budget for creative, agency/freelancer capacity",
  "attempted": "Not available from Ads Manager. Requires client conversation."
}
```

---

## Data Collection Template

For each top-spending ad, record in working notes:

```
| Ad Name | Format | Style | Spend | Impr | Reach | Freq | CTR | CPC | CPA | ROAS | Hook Rate | Hold Rate | Hook Type | Angle | Days Active |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ... | Video/Static/Carousel | UGC/Branded/Hybrid | $ | | | | % | $ | $ | x | % | % | [type] | [benefit] | X |
```

This feeds directly into the `raw_metrics.creative_details` section of the evidence JSON.
