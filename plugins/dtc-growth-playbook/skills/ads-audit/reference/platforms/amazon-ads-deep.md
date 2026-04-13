# Amazon Ads Deep-Dive Reference

**Load this file ONLY when triage scored RED or YELLOW on Amazon Ads.**
**Also load:** `reference/playbook/benchmarks.md` for Amazon-specific Floor/Healthy/Strong thresholds (SP ACOS, CPC, CVR, TACoS, Featured Offer %).

Triage has already pulled account totals (Spend, Sales, ACOS, ROAS, Impressions, Clicks, Purchases, Units) AND seller data (Ordered product sales, Units ordered, ASP, Sessions, CVR, Buy Box %, Refunds). This file diagnoses root causes.

---

## Deep-Dive Pulls

### Pull 1: Campaign Structure (RED: always | YELLOW: always)

**API:** `amazon_ads_request`

**Metrics:** Spend, Sales (7 day), ACOS (7 day), ROAS (7 day), Impressions, Clicks

**Breakdowns:** Campaign name, Campaign type, Campaign status, Campaign bidding strategy

**Analysis triggers:**
- SP vs SB vs SD mix — Manual campaigns dominate but underperform? SB underutilized?
- Brand vs category split — Brand campaigns masking weak category performance?
- Bidding strategy mismatch — Dynamic bidding on low-velocity campaigns? Fixed bidding on volatile ones?
- Status breakdown — Active vs paused spend ratio. Paused campaigns eating budget?

---

### Pull 2: Keyword Performance (RED: always | YELLOW: ACOS concern)

**API:** `amazon_ads_request`

**Metrics:** Spend, Sales (7 day), ACOS (7 day), Clicks, Impressions

**Breakdowns:** Campaign name, Ad group name, Keyword text, Keyword match type

**Analysis triggers:**
- High-spend low-converting keywords — Spend >$100 with ACOS >50%? Flag for pause/bid cut.
- Match type distribution — Broad match dominating spend but exact has better ACOS? Bid reallocation opportunity.
- Long-tail keyword waste — Keywords with <5 clicks but still burning budget.
- Exact match saturation — Exact keywords at max CPCs with diminishing returns?

---

### Pull 3: Wasted Spend / Search Terms (RED: always | YELLOW: wasted spend concern)

**API:** `amazon_ads_request`

**Metrics:** Spend, Sales (7 day), Clicks, Impressions, ACOS (7 day)

**Breakdowns:** Campaign name, Customer search term, Keyword text

**Analysis triggers:**
- Irrelevant query mapping — Search terms matching to unrelated keywords. Negative keyword gaps.
- Spend concentration on no-sale queries — Top 20% of queries driving <50% of sales?
- Brand/competitor search bleed — Non-brand campaigns matching branded terms?
- Long-tail exploration waste — Spend on <2-click search terms. Natural discovery vs forced targeting.

---

### Pull 4: Product-Level Seller Data (RED: only | YELLOW: TACoS concern)

**API:** `amazon_seller_request`

**Metrics:** Ordered product sales, Units ordered, Sessions - total, Unit session percentage, Featured offer (buy box) percentage

**Breakdowns:** Child ASIN, Title

**Analysis triggers:**
- Buy Box loss on high-spend ASINs — Advertising $500+ on ASIN with 40% Buy Box? Organic rank opportunity.
- CVR variation by ASIN — Session-to-unit conversion spread. Listing quality issue or traffic quality issue?
- ASIN concentration risk — Top 3 ASINs >60% of revenue. Dependency signal.
- Sessions without conversions — ASIN with high session count but low units. Listing or price problem.

---

## YELLOW Mode Routing

**ACOS concern (>35% target):**
- Pulls: 1 + 2
- Focus: Campaign structure for bid reallocation, keyword performance for pause/consolidation

**TACoS concern (organic rank declining):**
- Pulls: 1 + 4
- Focus: Campaign structure efficiency, product-level Buy Box and session-to-unit conversion

**Wasted spend concern (high impression-to-click gap):**
- Pulls: 1 + 3
- Focus: Campaign structure status, search term irrelevance, negative keyword strategy

---

## Evidence Output

Build three tables:

**Table 1: Campaign-Level Summary**
| Campaign Name | Type | Status | Spend | Sales | ACOS | ROAS | Clicks | CTR | Notes |
|---|---|---|---|---|---|---|---|---|---|

**Table 2: Top 10 Keywords by Spend**
| Campaign | Ad Group | Keyword | Match Type | Spend | Sales | ACOS | Clicks | Conversions | Action |
|---|---|---|---|---|---|---|---|---|---|

**Table 3: Top 10 Search Terms (queries) by Spend**
| Campaign | Search Term | Matched Keyword | Spend | Sales | ACOS | Relevance | Action |
|---|---|---|---|---|---|---|---|

---

## Diagnostic Patterns

**TACoS rising, ACOS flat → Organic rank declining**
- Buy Box % down on high-spend ASINs? Seller feedback score issue?
- Pull 4 will confirm: Sessions holding, Units dropping.

**Auto campaigns outperforming manual → Keyword research gap**
- Auto getting better ACOS than manual keyword-targeted? Research is stale.
- Pull 2: Manual keyword consolidation + pause low-performers.

**Wasted spend spike after campaign restructure → Negative keyword lag**
- Pull 3: Search terms now matching unrelated keywords. Build negative list fast.

**High Click-to-Conversion drop by ASIN → Listing quality or price**
- Pull 4: Unit session % collapsing on specific ASINs. Check listing images, reviews, pricing vs competition.

**Bidding strategy misalignment → Underutilized channels**
- Pull 1: Fixed bidding on SB but volatility is high? Switch to dynamic. Dynamic on stable SP? Switch to fixed.
