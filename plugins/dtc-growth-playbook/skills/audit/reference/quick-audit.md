# Quick Audit Mode

15-minute health check producing a scored scorecard. Use before sales calls or for periodic client monitoring.

---

## Trigger Phrases

- "quick audit", "health check", "quick check", "fast audit", "15-minute audit"
- "prospect audit", "sales audit"
- `/audit quick [client]`, `/audit health-check [client]`

---

## Workflow

1. Collect: client name, department, which platforms to check (default: all accessible)
2. Run the quick-check list below for each platform (skip platforms without access)
3. Score using `scoring-system.md` weights and severity multipliers — same formula, reduced check set
4. Output the Health Check Scorecard (template at bottom)

**No manifest is created.** Quick audit is a one-shot report. If the user wants to go deeper afterward, they start a full audit normally — the scorecard helps prioritize which platforms to deep-dive first.

---

## Quick-Check Lists

Each check: ID, name, what to look for, severity, estimated time.

### Google Ads (10 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QG-01 | Enhanced Conversions enabled | Settings > Conversions > Enhanced Conversions toggle ON | critical | 1 |
| QG-02 | No duplicate conversion actions | Goals > Conversion actions — only one purchase action counting | critical | 2 |
| QG-03 | EMQ score ≥ Good | Settings > Conversions > Diagnostics — Event Match Quality rating | high | 1 |
| QG-04 | Negative keyword lists exist | Tools > Shared library > Negative keyword lists — at least 1 list applied | critical | 1 |
| QG-05 | Top wasted search terms | Insights > Search terms — any single term with >$500 spend and 0 conversions (30d) | critical | 2 |
| QG-06 | Brand/non-brand separated | Campaigns tab — brand campaigns distinct from non-brand (naming or structure) | high | 1 |
| QG-07 | PMax not cannibalizing brand | Compare PMax search terms vs brand campaign — PMax capturing branded queries? | high | 2 |
| QG-08 | Smart Bidding conversion volume | Campaigns using tCPA/tROAS have ≥30 conversions/month per campaign | high | 2 |
| QG-09 | Location targeting method | Campaign settings > Locations > Target: "Presence" not "Presence or interest" | high | 1 |
| QG-10 | No broad match without Smart Bidding | Keywords tab — any broad match keywords in manual CPC campaigns? | high | 1 |

**Category mapping:** QG-01–03 → Conversion Tracking (25%), QG-04–05 → Wasted Spend (20%), QG-06–07 → Account Structure (15%), QG-08 → Keywords & QS (15%), QG-09–10 → Settings & Targeting (10%). Ads & Assets skipped for speed.

### Meta Ads (10 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QM-01 | CAPI connected | Events Manager > Settings > Conversions API — shows active connection | critical | 1 |
| QM-02 | EMQ score ≥ Good | Events Manager > Overview — Event Match Quality for Purchase event | critical | 1 |
| QM-03 | Deduplication working | Events Manager > Test Events — no duplicate Purchase events firing | critical | 2 |
| QM-04 | ≥3 active creatives per ad set | Active campaigns > Ad sets > Ads — count unique creatives | high | 2 |
| QM-05 | Frequency < 3.0 (30d) | Campaign overview > Frequency column — any campaign >3.0 in last 30 days | high | 1 |
| QM-06 | No creative over 30d with declining CTR | Ads tab sorted by delivery — any ad running >30d with CTR trending down? | high | 2 |
| QM-07 | Campaign consolidation | Campaign count — fewer than 5 active campaigns (unless spending >$50k/mo) | high | 1 |
| QM-08 | Advantage Campaign Budget (CBO) used | Campaign level — budget set at campaign level, not ad set | high | 1 |
| QM-09 | No ad sets stuck in Learning Limited | Delivery column — any ad sets showing "Learning Limited"? | high | 1 |
| QM-10 | Ad set budget ≥ 5× CPA | Compare each ad set daily budget to its CPA — ratio should be ≥5 | critical | 2 |

**Category mapping:** QM-01–03 → Pixel/CAPI (30%), QM-04–06 → Creative (30%), QM-07–09 → Structure (20%), QM-10 → Structure/Audience (20%).

### Shopify (8 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QS-01 | Revenue MoM trajectory | Analytics > Overview — last month vs prior month revenue, growing or declining? | critical | 1 |
| QS-02 | Revenue YoY trajectory | Same period last year comparison — growth rate | high | 1 |
| QS-03 | Current AOV and trend | Analytics > Overview — AOV this month vs 3-month average | high | 1 |
| QS-04 | Checkout completion rate | Analytics > Conversion funnel — checkout started → completed ratio (benchmark: >60%) | critical | 2 |
| QS-05 | Multiple payment methods | Settings > Payments — Shop Pay, Apple Pay, Google Pay, BNPL active? | high | 1 |
| QS-06 | Discount code reliance | Analytics > Discounts — % of orders using discount codes (flag if >40%) | high | 2 |
| QS-07 | New vs returning customer ratio | Analytics > Customer cohort — new customer % (flag if <30% or >85%) | high | 1 |
| QS-08 | Online store conversion rate | Analytics > Overview — overall CVR (benchmark: 2-4% depending on AOV tier) | critical | 1 |

**Category mapping:** QS-01–03 → Revenue & Profitability (30%), QS-04–05 → Checkout (25%), QS-06 → Product/Catalog (20%), QS-07–08 → Customer Data (15%) + Tracking (10%).

### Amazon Ads (8 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QA-01 | TACoS trending direction | Advertising console > TACoS (30d, 60d, 90d) — rising or falling? | critical | 2 |
| QA-02 | Any campaign ACoS > 3× target | Campaign manager — sort by ACoS, flag any >3× the account target | critical | 2 |
| QA-03 | Wasted spend targets identified | Campaign manager > Search terms — any single target with >$200 spend and 0 sales (30d) | critical | 2 |
| QA-04 | Negative targeting in place | Campaign settings — negative keywords/ASINs applied to top campaigns? | high | 1 |
| QA-05 | Organic rank top 5 keywords | Search main keywords on Amazon — where do products appear organically? | high | 3 |
| QA-06 | Brand/non-brand campaign split | Campaign naming — clear separation between branded defense and category conquest | high | 1 |
| QA-07 | Sponsored Brand campaigns active | Campaign list — at least 1 active SB or SBV campaign | high | 1 |
| QA-08 | Product listing quality (top ASIN) | Check main ASIN: title length, bullet count, A+ content present, main image quality | high | 2 |

**Category mapping:** QA-01–03 → Campaign Structure & TACoS (30%), QA-03–04 → Keyword & Wasted Spend (25%), QA-08 → Listing Quality (20%), QA-05 → Brand Analytics & Organic (15%), QA-06–07 → Budget & Bid (10%).

### GA4 (6 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QGA-01 | Key conversion events configured | Admin > Events > mark as key event — purchase event active and counting | critical | 1 |
| QGA-02 | No duplicate purchase events | Events > purchase — count matches Shopify order count (within 10%) | critical | 2 |
| QGA-03 | Cross-domain tracking | Admin > Data streams > Configure tag settings — cross-domain list populated (if multi-domain) | high | 1 |
| QGA-04 | Source/medium clean | Reports > Acquisition > Traffic acquisition — % of sessions with (not set) source (<5% = good) | high | 2 |
| QGA-05 | GA4 vs Shopify revenue gap | Compare GA4 reported revenue to Shopify for same period — gap <15% is acceptable | critical | 2 |
| QGA-06 | Data retention set to 14 months | Admin > Data settings > Data retention — set to 14 months, not default 2 months | high | 1 |

**Category mapping:** QGA-01–02 → Tracking Implementation (35%), QGA-05 → Cross-Platform Attribution (25%), QGA-01 → Conversion Setup (20%), QGA-04,06 → Reporting Config (10%), QGA-03 → Audience (10%).

### Klaviyo (8 checks)

| ID | Check | What to Look For | Sev | Min |
|---|---|---|---|---|
| QK-01 | Welcome flow active | Flows > Welcome Series/Flow — status is Live, not Draft or Manual | critical | 1 |
| QK-02 | Welcome flow performance | Welcome flow > Analytics — open rate >50%, click rate >5%, revenue attributed | high | 2 |
| QK-03 | Abandoned cart flow active | Flows > Abandoned Cart — status is Live | critical | 1 |
| QK-04 | Bounce rate acceptable | Analytics > Deliverability — bounce rate <2% over last 30 days | high | 1 |
| QK-05 | Spam complaint rate | Analytics > Deliverability — spam rate <0.1% | critical | 1 |
| QK-06 | List growth positive | Lists > Primary list — subscriber count trending up month over month | high | 1 |
| QK-07 | Flow vs campaign revenue split | Analytics > Revenue — flow revenue % (benchmark: 30-50% of total email revenue) | high | 2 |
| QK-08 | Campaign send frequency | Campaigns > Sent — at least 2 campaigns/month; no more than daily | high | 1 |

**Category mapping:** QK-01–03 → Flow Performance (30%), QK-04–06 → List Health & Deliverability (25%), QK-07–08 → Campaign Strategy (20%). Revenue Attribution and SMS skipped for speed.

---

## Scoring Rules

Uses the same formula from `scoring-system.md`:
- Check results: PASS = 1.0, WARNING = 0.5, FAIL = 0.0, N_A = excluded
- Severity multipliers: critical = 5.0×, high = 3.0×
- Category weights: same per-platform weights from `scoring-system.md`
- Categories with no quick-checks (skipped for speed) are excluded from the weighted total — remaining category weights are renormalized to sum to 100%
- Aggregate score: spend-weighted across platforms (equal weight if spend unknown)
- Grading scale: A (90-100), B (75-89), C (60-74), D (40-59), F (0-39)

---

## Output: Health Check Scorecard

```markdown
# {Client} — Quick Health Check
**Date:** {date}
**Platforms checked:** {list}
**Overall Health Score:** {0-100}
**Grade:** {A/B/C/D/F}

## Platform Scores
| Platform | Score | Grade | Top Issue |
|----------|-------|-------|-----------|
| Google Ads | 72 | C | No negative keyword lists |
| Meta Ads | 58 | D | CAPI not connected |

## Critical Issues (Fix Immediately)
1. {issue} — {platform} — {why it matters, one sentence}
2. ...

## Quick Wins (< 15 min each)
1. {action} — {platform} — {expected impact}
2. ...

## Recommendation
{1-2 sentences: full audit recommendation + biggest opportunity}
```

**Save location:** Same as full audit reports — `{Dept}/reports/{Client-Name}/` with filename `{Client}_quick_health_check_{date}.md`.

---

## Relationship to Full Audit

- Quick audit data CAN be referenced by a subsequent full audit to avoid re-checking items already evaluated
- Quick audit does NOT create a manifest (no multi-session workflow)
- The scorecard's platform scores help prioritize which platforms to deep-dive first in a full audit
- If any platform scores F or D, recommend a full audit for that platform specifically
