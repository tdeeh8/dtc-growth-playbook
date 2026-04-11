# Evidence Schema Quick Reference

Full schema: `reference/evidence-schema.json`

## Required Top-Level Sections

- **meta** — client, platform, audit_date, date_range{start,end}, access_level, depth, auditor_notes
- **account_overview[]** — {metric, value, formatted, label, source} per metric
- **campaigns[]** — name, type, status, spend, revenue, roas, conversions, cpa, budget_daily, bid_strategy, key_signals[]
- **tracking_health.flags[]** — title, severity, label, evidence, source, recommendation
- **findings[]** — title, label, evidence, source, significance
- **anomalies[]** — description, label, evidence, source
- **diagnosis** — primary_constraint{title, description, evidence_refs[]} + secondary_constraints[]
- **opportunities[]** — action, priority, expected_impact, confidence, confidence_reasoning, evidence
- **cross_channel_signals[]** — signal, check_in[], what_to_look_for
- **open_questions[]** — question, data_needed, attempted
- **raw_metrics.{keys}[]** — platform-specific data tables (see below)

## Platform raw_metrics Keys

| Platform | raw_metrics keys |
|---|---|
| google-ads | campaign_details, conversion_action_details, auction_insights, search_term_categories |
| meta-ads | campaign_details, creative_details, audience_details, placement_breakdown, frequency_trend |
| shopify | product_details, customer_cohort_details, channel_details, discount_details |
| ga4 | source_medium_details, landing_page_details, funnel_details, device_details |
| klaviyo | flow_details, campaign_details, list_details, segment_details, sms_details |
| amazon-ads | campaign_details, keyword_details, seller_central_asin_data, brand_analytics_sqr, product_line_tacos, wasted_spend_targets |
| website-cro | landing_page_details, funnel_observations |
| bigcommerce | product_details, customer_details, channel_details |

## Scoring (Optional)

Added by platform audits that implement the weighted scoring system. See `reference/scoring-system.md` for full algorithm and category weights.

- **scoring** — top-level object, optional (evidence files without it still validate)
  - `platform_score`: number (0-100) — weighted score computed from category scores
  - `grade`: string (A/B/C/D/F) — mapped from platform_score using grading scale
  - `categories[]`: array of scoring categories
    - `name`: string — category name (must match platform's defined categories)
    - `weight`: number (0-1) — category weight (all weights must sum to 1.0)
    - `score`: number (0-100) — category score
    - `checks_passed`: integer — count of PASS results
    - `checks_total`: integer — count of non-N/A checks
    - `checks[]`: array of individual checks
      - `id`: string — unique check ID (format: `{platform-abbrev}-{category-abbrev}-{nn}`)
      - `name`: string — human-readable check description
      - `result`: enum — PASS | WARNING | FAIL | N_A
      - `severity`: enum — critical | high | medium | low
      - `notes`: string — evidence or context for the result
  - `quick_wins[]`: array of Quick Win items (Critical/High severity + ≤15 min fix)
    - `check_id`: string — references a check id above
    - `description`: string — what to fix
    - `severity`: enum — critical | high
    - `estimated_minutes`: integer — estimated fix time
    - `expected_impact`: enum — HIGH | MEDIUM | LOW

---

## Labels, Priority & Severity

Labels (5-label system): OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, DATA_NOT_AVAILABLE — see `reference/evidence-rules.md`

Opportunity priority: CRITICAL > HIGH > MEDIUM > LOW

Tracking flag severity: critical > high > medium > low
