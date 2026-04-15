# Google Ads Deep-Dive — Ads-Audit

Loaded when Google Ads scores RED or YELLOW at triage. The triage already captured account totals. This file diagnoses the root cause.

**Also load:** `reference/playbook/benchmarks.md` for Floor/Healthy/Strong thresholds.
**Conditional:** If workspace playbook available, also load `google-ads.md` (PMax methodology, Shopping feed, branded cannibalization, Smart Bidding, AI Max).

## Context from Triage

Before starting, review what triggered the flag:
- **ROAS below target** → Focus on campaign structure + wasted spend
- **CPA above break-even** → Focus on keyword efficiency + quality score
- **Attribution ratio high** → Focus on conversion action setup + cross-check GA4
- **Low CTR** → Focus on ad relevance + audience targeting

## Deep-Dive Pulls (4-5 pulls depending on RED vs YELLOW)

### Pull 1 — Campaign Structure (ALWAYS run)

**Databox spec:**
```
Data source: Google Ads (data_source_id from cache)
Metrics: ["Cost", "Conversion Value", "Roas (Conversions Value Per Cost)", "Conversions", "Average Cpa (Cost Per Conversion)", "Clicks"]
Dimensions: ["Campaign Name", "Campaign Advertising Channel Type", "Campaign Bidding Strategy Type", "Campaign Status"]
```

6 metrics × 4 dimensions → call `load_metric_data` per metric+dimension pair you need (usually start with `Campaign Name` for all 6 metrics, then add the other dimensions as targeted follow-ups). Identifies which campaigns are dragging performance and the structural mix (Search vs Shopping vs PMax vs Display).

**Analysis checklist:**
- Campaign type distribution (spend by Search/Shopping/PMax/Display/Video)
- Any paused campaigns still showing recent spend? 
- Bidding strategy alignment (tCPA/tROAS with enough conversion volume?)
- Brand vs non-brand separation (infer from campaign naming)
- PMax spend share (>50% of account = potential concern)

### Pull 2 — Impression Share Diagnosis (run if ROAS or CTR flagged)

**Databox spec:**
```
Data source: Google Ads
Metrics: ["Search Impression Share %", "Search Budget Lost Impression Share %", "Search Rank Lost Impression Share %", "Absolute Top Impression Percentage %", "Impressions", "Cost"]
Dimensions: ["Campaign Name", "Campaign Advertising Channel Type"]
```

6 metrics × 2 dimensions via `load_metric_data`. Answers: "Are we budget-constrained or rank-limited?"

**Analysis:**
- Budget lost IS >20% → budget is capping performance
- Rank lost IS >30% → quality/bid issue  
- Low absolute top impression % (<15%) → losing competitive position

### Pull 3 — Keyword Health + Quality Score (run if CPA or CTR flagged)

**Databox spec:**
```
Data source: Google Ads
Metrics: ["Cost", "Conversion Value", "Conversions", "Average Cpc", "Clicks", "Impressions"]
Dimensions: ["Campaign Name", "Ad Group Name", "Keyword Text", "Keyword Match Type", "Keyword Quality Score"]
```

Use `ask_genie` over the Google Ads dataset for this one — keyword × quality-score joins are faster in Genie than N × M `load_metric_data` calls. Fall back to per-dimension `load_metric_data` pulls if needed.

**Analysis:**
- Keywords with spend >$100 and 0 conversions → wasted spend
- Quality Score distribution (% of keywords at 7+, 5-6, <5)
- Match type distribution (broad match without Smart Bidding = flag)
- High-CPC keywords with low CVR → inefficient

### Pull 4 — Wasted Spend / Search Terms (run if CPA flagged or RED)

**Databox spec:**
```
Data source: Google Ads
Metrics: ["Cost", "Conversions", "Clicks", "Impressions", "Conversion Value"]
Dimensions: ["Campaign Name", "Search Term"]
```

Best handled via `ask_genie` ("show me search terms with >$50 spend and 0 conversions in the last 30 days") — otherwise run 5 × 2 `load_metric_data` calls with `record_limit=50` to surface the long tail.

**Analysis:**
- Search terms with >$50 spend and 0 conversions
- Irrelevant category terms appearing (competitor brands, non-intent queries)
- Brand terms showing in non-brand campaigns (cannibalization risk)
- Estimate total wasted spend as % of account spend

### Pull 5 — Conversion Action Audit (run if attribution flagged)

**Databox spec:**
```
Data source: Google Ads
Metrics: ["Conversions", "All Conversions", "Conversion Value"]
Dimensions: ["Conversion Action Name", "Conversion Action Category"]
```

3 metrics × 2 dimensions via `load_metric_data`. Checks for duplicate or misconfigured conversion tracking.

**Analysis:**
- Multiple purchase conversion actions? → duplicate tracking
- Non-purchase actions counting as primary conversions?
- "All Conversions" significantly higher than "Conversions" → secondary actions inflating numbers

## YELLOW Mode (Targeted Dive)

If platform scored YELLOW (not RED), run only the pulls relevant to the flagged signal:
- **ROAS concern** → Pulls 1 + 2
- **CPA concern** → Pulls 1 + 3
- **Attribution concern** → Pulls 1 + 5
- **CTR concern** → Pulls 2 + 3
- **Multiple concerns** → Pulls 1 + most relevant 2

## Evidence Output

Write `{Client}_google-ads_evidence.json` to evidence directory.

**Key fields:**
- `meta.platform`: "google_ads"
- `meta.extraction_method`: "databox_mcp"
- `meta.audit_depth`: "deep_dive" or "targeted_dive"
- `meta.triage_score`: RED or YELLOW
- `meta.triage_signals`: array of signals that triggered the deep-dive
- `account_overview`: metrics from triage + campaign structure data
- `findings`: grouped by theme (structure, efficiency, targeting, tracking)
- `diagnosis.primary_constraint`: the single biggest issue
- `diagnosis.root_cause`: why the triage signals look the way they do
- `opportunities`: prioritized fixes with estimated impact
- `cross_channel_signals`: anything other platforms need to know

## Diagnostic Patterns

Flag these when observed:

| Pattern | Signal | Action |
|---------|--------|--------|
| PMax cannibalizing branded search | PMax getting >30% branded traffic | Split PMax to non-brand or pause on branded terms |
| Smart Bidding on thin data | Smart Bidding campaigns <30 conversions/month | Pause or switch to manual until volume grows |
| Uncontrolled broad match | Broad match without Smart Bidding | Add negative keywords or switch to Smart Bidding |
| Budget-constrained growth | IS budget lost >20% | Increase budget or shift to higher-ROI campaigns |
| Quality erosion | QS <5 on >20% of keywords | Audit landing pages + ad/keyword relevance |
| Conversion tracking issues | "All Conversions" > 2x "Conversions" | Audit GA4 events + Google Ads conversion actions |
| Attribution inflation | ROAS below CPA-driven profitability | Cross-check multi-touch attribution in GA4 |

## When to Escalate

Recommend strategy review if any of these emerge:
- Account fundamentally unprofitable (CPA >> target even after optimization)
- Attribution data suggests cross-channel cannibalization
- Keyword quality or search term waste exceeds 30% of spend
- Conversion tracking is broken or duplicated
