# Platform Health Scoring System

Weighted scoring algorithm for the Modular Audit System. Produces a 0-100 Health Score per platform and a rolled-up cross-platform aggregate.

---

## Scoring Formula

Each platform audit produces a `platform_score` (0-100) from 4-6 weighted categories.

**Check-level scoring:**
- Result: PASS = 1.0, WARNING = 0.5, FAIL = 0.0, N_A = excluded from calculation
- Severity multiplier: critical = 5.0×, high = 3.0×, medium = 1.5×, low = 0.5×

**Category score:**
```
category_score = sum(check_result × severity) / sum(max_possible × severity) × 100
```
Where `max_possible` = 1.0 for each non-N/A check. N/A checks are removed from both numerator and denominator so they don't penalize or inflate the score.

**Platform score:**
```
platform_score = sum(category_score × category_weight)
```
Category weights must sum to 100% per platform.

---

## Category Weights by Platform

### Google Ads

| Category | Weight | Rationale |
|---|---|---|
| Conversion Tracking | 25% | Foundation — broken tracking invalidates all optimization signals and reported ROAS |
| Wasted Spend / Negatives | 20% | Direct money leak — every dollar on irrelevant queries is gone |
| Account Structure | 15% | Determines algorithm learning efficiency and budget allocation |
| Keywords & Quality Score | 15% | Quality Score drives CPC and impression share |
| Ads & Assets | 15% | Ad strength and extension coverage affect CTR and CVR |
| Settings & Targeting | 10% | Location, schedule, device — important but less impactful than above |

### Meta Ads

| Category | Weight | Rationale |
|---|---|---|
| Pixel / CAPI Health | 30% | 87% of advertisers have poor EMQ (Meta internal data). Bad signal = bad optimization |
| Creative Diversity & Fatigue | 30% | Creative drives ~70% of Meta performance (Meta creative research). The #1 lever |
| Account Structure | 20% | Consolidation, learning phase, budget allocation across funnel |
| Audience & Targeting | 20% | Audience signals, exclusions, geographic strategy |

### Shopify / BigCommerce

| Category | Weight | Rationale |
|---|---|---|
| Revenue & Profitability Accuracy | 30% | Source of truth for all other platforms — must be accurate |
| Checkout & Conversion Funnel | 25% | Checkout CVR directly multiplies all paid traffic ROI |
| Product & Catalog Health | 20% | Inventory, pricing, variant setup affect discoverability and AOV |
| Customer Data & Segmentation | 15% | Repeat purchase and LTV data powers retention strategy |
| Tracking & Attribution Setup | 10% | UTM consistency, GA4 integration, platform pixel verification |

### Amazon Ads

| Category | Weight | Rationale |
|---|---|---|
| Campaign Structure & TACoS | 30% | TACoS = total ad cost of sale, the true efficiency metric for Amazon |
| Keyword Strategy & Wasted Spend | 25% | Negative targeting and match type hygiene are the biggest spend levers |
| Product Listing Quality | 20% | Listings convert the traffic — title, bullets, images, A+ content |
| Brand Analytics & Organic Rank | 15% | Organic rank reduces paid dependency; SQR reveals search intent |
| Budget & Bid Optimization | 10% | Bid strategy and dayparting — important but secondary to structure |

### GA4

| Category | Weight | Rationale |
|---|---|---|
| Tracking Implementation | 35% | If events don't fire correctly, all GA4 data is unreliable |
| Cross-Platform Attribution | 25% | Reconciling platform claims against GA4 is the core value |
| Conversion Setup | 20% | Key events, conversion counting, value assignment |
| Audience & Segmentation | 10% | Custom audiences, remarketing lists, user properties |
| Reporting Configuration | 10% | Explorations, dashboards, data retention settings |

### Klaviyo

| Category | Weight | Rationale |
|---|---|---|
| Flow Performance & Coverage | 30% | Flows generate 41% of email revenue from 5.3% of sends (Klaviyo benchmark) |
| List Health & Deliverability | 25% | Deliverability is the gatekeeper — nothing works if emails don't land |
| Campaign Strategy | 20% | Frequency, segmentation, A/B testing discipline |
| Revenue Attribution | 15% | Attribution window accuracy, flow vs. campaign credit |
| SMS Program | 10% | Growing channel but still secondary to email for most DTC |

### Website / CRO

| Category | Weight | Rationale |
|---|---|---|
| Homepage & Navigation | 15% | Value prop clarity, hero effectiveness, nav usability, site search |
| Collection Pages | 10% | Grid layout, filtering, sorting, product card information density |
| Product Pages | 20% | Images, pricing, description, reviews, trust signals, cross-sells |
| Cart & Checkout | 25% | Checkout CVR directly multiplies all paid traffic ROI — highest leverage |
| Mobile Experience | 20% | 65-75% of DTC traffic is mobile. Mobile CVR typically 50% of desktop |
| Page Speed & Vitals | 5% | LCP, INP, CLS — only scored when deep CRO checks run |
| Trust & Copy Quality | 5% | Trust signals, copy clarity, social proof — only scored when deep CRO checks run |

Note: When deep checks are NOT run (standard full audit), Page Speed & Vitals and Trust & Copy Quality weights redistribute proportionally across the other 5 categories.

### SEO (Opt-In Only)

| Category | Weight | Rationale |
|---|---|---|
| Technical SEO | 30% | Crawlability, indexation, canonicals, redirects, structured data — foundation |
| On-Page Optimization | 25% | Title tags, meta descriptions, headings, keyword usage, image SEO |
| Content Quality & Gaps | 20% | Thin content, duplicate content, missing pages, blog/resources |
| Internal Linking & Architecture | 15% | Link depth, orphaned pages, breadcrumbs, search functionality |
| Local SEO | 5% | GBP, NAP consistency, local schema (0% if N/A — redistributed) |
| AI Search Visibility | 5% | AI Overviews presence, LLM citation potential (experimental) |

Note: If Local SEO is N/A, its 5% redistributes proportionally across the other categories. SEO is entirely opt-in — it never runs as part of a standard full audit.

---

## Grading Scale

| Grade | Range | Interpretation |
|---|---|---|
| A | 90-100 | Minor optimizations only — account is well-managed |
| B | 75-89 | Some improvement opportunities — solid but room to grow |
| C | 60-74 | Notable issues need attention — meaningful gains available |
| D | 40-59 | Significant problems present — performance is being held back |
| F | 0-39 | Urgent intervention required — major issues across multiple areas |

---

## Cross-Platform Aggregate Score

```
aggregate_score = sum(platform_score × platform_spend_share)
```

Where `platform_spend_share` = platform's spend / total spend across all audited platforms. This weights the aggregate toward where the money actually goes.

**When all platforms have spend data:** Use the formula directly. Example: Google ($18K) + Meta ($22K) + Amazon ($8K) = $48K total. Google weight = 18/48 = 0.375, Meta = 22/48 = 0.458, Amazon = 8/48 = 0.167.

**When mixing spend and non-spend platforms:** Default to equal weighting across all audited platforms. Example: Google (score 63), Meta (score 55), Shopify (score 78) = 3 platforms → aggregate = (63 + 55 + 78) / 3 = 65.3 → Grade C. This avoids the ambiguity of deciding how much weight non-spend platforms should carry.

**Fallback:** If spend data is unavailable for any ad platform, use equal weighting: `1 / number_of_audited_platforms`.

---

## Quick Wins Detection

A check qualifies as a Quick Win when ALL of these are true: (1) result is FAIL or WARNING, (2) severity is critical or high, (3) estimated fix time ≤ 15 minutes.

**Sorting:** `severity_multiplier × estimated_impact_score` descending, where estimated_impact_score maps: HIGH = 3, MEDIUM = 2, LOW = 1. Quick Wins appear in a dedicated report section.

---

## How Platform Audits Should Report Scores

Each platform audit skill adds a `scoring` object to its evidence JSON file. Structure:

```json
{
  "scoring": {
    "platform_score": 72.4,
    "grade": "C",
    "categories": [
      {
        "name": "Conversion Tracking",
        "weight": 0.25,
        "score": 85.0,
        "checks_passed": 6,
        "checks_total": 8,
        "checks": [
          {
            "id": "gads-track-01",
            "name": "Primary conversion action uses correct counting",
            "result": "PASS",
            "severity": "critical",
            "notes": "Purchase action set to 'One' counting — correct"
          },
          {
            "id": "gads-track-02",
            "name": "No duplicate conversion actions in Goals",
            "result": "FAIL",
            "severity": "high",
            "notes": "2 purchase actions both included in Goals"
          }
        ]
      }
    ],
    "quick_wins": [
      {
        "check_id": "gads-track-02",
        "description": "Remove duplicate purchase conversion from Goals",
        "severity": "high",
        "estimated_minutes": 5,
        "expected_impact": "HIGH"
      }
    ]
  }
}
```

**Rules:** `platform_score` must be calculated via the formula — never estimated. Every check needs a unique `id` (format: `{platform-abbrev}-{category-abbrev}-{nn}`). Results must be evidence-based; use `N_A` with a note if a check can't be evaluated. `severity` uses the same scale as tracking_health flags. `quick_wins` only includes checks meeting all three Quick Win criteria.

---

## How the Synthesizer Should Consume Scores

The synthesizer reads `scoring` from each evidence file (skips files without it — pre-scoring audits). It displays per-platform scores in the report header (name, score, grade, lowest-scoring category as "top priority"), computes the aggregate Health Score, collects all Quick Wins across platforms into a unified section re-sorted by severity × impact, and flags gaps: "Health Score based on {N} of {M} audited platforms. Scores pending for: {list}."
