# Google Ads Deep-Dive — Ads-Audit

Loaded when Google Ads scores RED or YELLOW at triage. The triage already captured account totals. This file diagnoses the root cause.

**Also load:** `reference/playbook/benchmarks.md` for Floor/Healthy/Strong thresholds.
**Conditional:** If workspace playbook available, also load `google-ads.md` (PMax methodology, Shopping feed, branded cannibalization, Smart Bidding, AI Max).

## Report Inclusion Rules

Not every metric this deep-dive produces belongs in the report body. Apply these rules when synthesizing:

**BODY (scorecard + diagnosis, 1 chart):**
- Top-line efficiency from Pull 1: total spend, ROAS, conversions, CPA — with YoY deltas.
- Top 3 and bottom 3 campaigns by spend (Pull 1), used to name what's working and what isn't.
- One chart: typically "Spend vs ROAS by Campaign" or "ROAS trend YoY".
- Attribution / conversion-action status from Pull 5 — one line if it's a flag, skipped otherwise.

**APPENDIX (reference-only, not in body):**
- Full Pull 1 campaign breakdown (every campaign, all columns).
- Pull 2 impression-share table (budget-lost vs rank-lost per campaign).
- Pull 3 keyword + Quality Score detail.
- Pull 4 search-term / wasted-spend list.
- Pull 5 conversion-action audit table.
- Pull 0 structural health check (Ad Strength, extensions, Enhanced Conversions, shared neg lists).
- Pull 6 ad-level and extension performance tables.
- Pull 7 PMax asset group detail, schedule heatmap, device split.
- Device, geo, dayparting breakdowns if pulled.

**CUT entirely:**
- Raw impressions with no downstream metric.
- CTR without CVR context.
- Campaigns contributing <1% of spend (noise).
- Any metric that can't be tied to a decision.

The narrative for this platform in the report body must be ≤ 200 words. Detailed tables go in the appendix.

---

## Context from Triage

Before starting, review what triggered the flag:
- **ROAS below target** → Focus on campaign structure + wasted spend
- **CPA above break-even** → Focus on keyword efficiency + quality score
- **Attribution ratio high** → Focus on conversion action setup + cross-check GA4
- **Low CTR** → Focus on ad relevance + audience targeting

## Deep-Dive Pulls (4-5 pulls depending on RED vs YELLOW)

### Pull 0 — Structural Health Check (ALWAYS run for Google Ads)

**Purpose:** Catch hygiene issues invisible at account totals. Runs for every Google Ads audit regardless of triage score. Can UPGRADE a GREEN platform to YELLOW.

**Why it exists:** Triage uses account totals (ROAS, CPA, CVR, CTR). An account can post healthy totals while being structurally underbuilt — weak RSAs, missing extensions, Enhanced Conversions off. Pull 0 surfaces those hygiene issues cheaply.

**Cost:** 4-5 `retrieve_reporting_data` calls total. Target: <8% of context budget per audit.

**Adzviser spec — Check 1: Ad Strength distribution**
```
google_ads_request:
  metrics: ["Impressions", "Clicks", "Cost"]
  breakdowns: ["Ad Strength"]
```

Before pulling, confirm `Ad Strength` is an available breakdown via `list_metrics_and_breakdowns_google_ads`. If not available as a standalone breakdown, try combining with `Ad Id`. If still unavailable, note it as DATA_NOT_AVAILABLE and skip to Check 2 — do not retry.

**Analysis:**
- Count active RSAs by Ad Strength rating (Poor / Average / Good / Excellent)
- Compute % of active RSAs at Poor or Average
- **Flag if >30% of RSAs are Poor/Average**

**Adzviser spec — Check 2: Extensions coverage**
```
google_ads_request:
  metrics: ["Clicks", "Impressions"]
  breakdowns: ["Campaign Name", "Extension Type"]
```

If `Extension Type` isn't available as a breakdown, fall back to pulling per-extension metrics (sitelinks, callouts, structured snippets, promotion, image) by campaign. Confirm exact breakdown names via `list_metrics_and_breakdowns_google_ads`.

**Analysis:**
- Count active extension types per campaign
- Identify campaigns with <3 sitelinks active
- Identify campaigns missing callouts OR structured snippets entirely
- **Flag if majority of campaigns (>50%) have <3 sitelinks**

**Adzviser spec — Check 3: Enhanced Conversions status**

Adzviser typically does NOT expose Enhanced Conversions setup status as a metric. Attempt to detect via:
- Conversion action metadata if exposed (look for "Enhanced Conversions" or "Enhanced Conversions for Leads" fields in conversion action list)
- Fall back: flag as UNKNOWN and recommend manual UI verification

**Analysis:**
- If detectable and OFF → flag
- If UNKNOWN → note for manual verification, do not auto-upgrade

**Adzviser spec — Check 4: Shared negative keyword lists**
```
google_ads_request:
  metrics: ["Clicks", "Impressions"]
  breakdowns: ["Shared Set Name", "Campaign Name"]
```

If shared set data isn't exposed as a breakdown, note DATA_NOT_AVAILABLE and skip. Informational only — does not auto-upgrade.

**Analysis:**
- Count distinct shared negative keyword lists attached to campaigns
- Identify campaigns with zero shared neg lists attached
- **Informational finding only** — do not upgrade score based on this alone

**GREEN → YELLOW Upgrade Rules**

If the platform scored GREEN at triage, upgrade it to YELLOW if ANY of the following are true:
- Check 1: >30% of RSAs rated Poor or Average
- Check 2: Majority of campaigns (>50%) have <3 sitelinks
- Check 3: Enhanced Conversions is definitively OFF (not UNKNOWN)

When upgrading, note the trigger in the manifest as: "GREEN→YELLOW structural upgrade: {specific check that triggered}"

For a GREEN account that upgrades to YELLOW via Pull 0, run ONLY Pull 6 (Ad + Extensions Depth) as the targeted dive — skip Pulls 1-5 unless triage signals also flag them.

**Evidence output:** Always write Pull 0 findings to the evidence JSON under `structural_health_check`, regardless of whether they triggered an upgrade.

### Pull 1 — Campaign Structure (ALWAYS run)

**Adzviser spec:**
```
google_ads_request:
  metrics: ["Cost", "Conversion Value", "Roas (Conversions Value Per Cost)", "Conversions", "Average Cpa (Cost Per Conversion)", "Clicks"]
  breakdowns: ["Campaign Name", "Campaign Advertising Channel Type", "Campaign Bidding Strategy Type", "Campaign Status"]
```

6 metrics + 4 breakdowns. Identifies which campaigns are dragging performance and the structural mix (Search vs Shopping vs PMax vs Display).

**Analysis checklist:**
- Campaign type distribution (spend by Search/Shopping/PMax/Display/Video)
- Any paused campaigns still showing recent spend? 
- Bidding strategy alignment (tCPA/tROAS with enough conversion volume?)
- Brand vs non-brand separation (infer from campaign naming)
- PMax spend share (>50% of account = potential concern)

### Pull 2 — Impression Share Diagnosis (run if ROAS or CTR flagged)

**Adzviser spec:**
```
google_ads_request:
  metrics: ["Search Impression Share %", "Search Budget Lost Impression Share %", "Search Rank Lost Impression Share %", "Absolute Top Impression Percentage %", "Impressions", "Cost"]
  breakdowns: ["Campaign Name", "Campaign Advertising Channel Type"]
```

6 metrics + 2 breakdowns. Answers: "Are we budget-constrained or rank-limited?"

**Analysis:**
- Budget lost IS >20% → budget is capping performance
- Rank lost IS >30% → quality/bid issue  
- Low absolute top impression % (<15%) → losing competitive position

### Pull 3 — Keyword Health + Quality Score (run if CPA or CTR flagged)

**Adzviser spec:**
```
google_ads_request:
  metrics: ["Cost", "Conversion Value", "Conversions", "Average Cpc", "Clicks", "Impressions"]
  breakdowns: ["Campaign Name", "Ad Group Name", "Keyword Text", "Keyword Match Type", "Keyword Quality Score"]
```

6 metrics + 5 breakdowns.

**Analysis:**
- Keywords with spend >$100 and 0 conversions → wasted spend
- Quality Score distribution (% of keywords at 7+, 5-6, <5)
- Match type distribution (broad match without Smart Bidding = flag)
- High-CPC keywords with low CVR → inefficient

### Pull 4 — Wasted Spend / Search Terms (run if CPA flagged or RED)

**Adzviser spec:**
```
google_ads_request:
  metrics: ["Cost", "Conversions", "Clicks", "Impressions", "Conversion Value"]
  breakdowns: ["Campaign Name", "Search Term"]
```

5 metrics + 2 breakdowns. Identifies irrelevant queries eating budget.

**Analysis:**
- Search terms with >$50 spend and 0 conversions
- Irrelevant category terms appearing (competitor brands, non-intent queries)
- Brand terms showing in non-brand campaigns (cannibalization risk)
- Estimate total wasted spend as % of account spend

### Pull 5 — Conversion Action Audit (run if attribution flagged)

**Adzviser spec:**
```
google_ads_request:
  metrics: ["Conversions", "All Conversions", "Conversion Value"]
  breakdowns: ["Conversion Action Name", "Conversion Action Category"]
```

3 metrics + 2 breakdowns. Checks for duplicate or misconfigured conversion tracking.

**Analysis:**
- Multiple purchase conversion actions? → duplicate tracking
- Non-purchase actions counting as primary conversions?
- "All Conversions" significantly higher than "Conversions" → secondary actions inflating numbers

### Pull 6 — Ad + Extensions Depth (run if YELLOW/RED, or if Pull 0 flagged ad/extension hygiene)

**Adzviser spec — RSA-level performance:**
```
google_ads_request:
  metrics: ["Impressions", "Clicks", "Ctr %", "Conversions", "Conversion Value", "Cost"]
  breakdowns: ["Ad Id", "Campaign Name", "Ad Group Name", "Ad Strength"]
```

RSA-level joins can be heavy. If the response is large, narrow by filtering to active ads only, or by pulling per-campaign in sequence.

**Analysis:**
- Count headlines per RSA (ideal: 10-15). Flag ads with <5 headlines.
- Count descriptions per RSA (ideal: 3-4). Flag ads with <3 descriptions.
- Check pinned asset percentage — heavily pinned RSAs often underperform.
- Ad age / last-edit recency — flag ads unchanged in >90 days that are underperforming.
- Top performing vs bottom performing ads within each ad group — identify ads to pause and variants to build.

**Adzviser spec — Extension performance:**
```
google_ads_request:
  metrics: ["Impressions", "Clicks", "Ctr %", "Cost", "Conversions"]
  breakdowns: ["Campaign Name", "Extension Type", "Extension Text"]
```

Confirm `Extension Text` is available via `list_metrics_and_breakdowns_google_ads`. If not, fall back to `Campaign Name` + `Extension Type` only.

**Analysis:**
- Which extension types are producing clicks vs dead weight
- Campaigns missing extension types entirely
- Extensions with zero impressions (likely disapproved or not serving)
- Sitelink CTR variance — pause low performers

**Report output:** Include a "Top 3 ad-level fixes" section in the evidence JSON under `opportunities.ad_level`. Examples: "Rebuild Campaign X's RSAs — all 4 have only 5 headlines and Ad Strength 'Poor'."

### Pull 7 — PMax + Schedule/Device Breakdown (run if YELLOW/RED, OR if Pull 1 shows PMax >30% spend)

PMax is a black box at account totals. Schedule and device splits surface waste that averages out in overall metrics. Run this pull when PMax is a significant spend line even if the account is otherwise YELLOW for unrelated reasons.

**Adzviser spec — PMax asset group performance:**
```
google_ads_request:
  metrics: ["Cost", "Conversion Value", "Conversions", "Impressions", "Clicks", "Roas (Conversions Value Per Cost)"]
  breakdowns: ["Campaign Name", "Asset Group Name", "Asset Group Status"]
```

If the response is large, narrow by filtering to PMax campaigns only, or pull per-campaign in sequence.

**Analysis:**
- Count asset groups per PMax campaign (ideal: 2-5, one per audience theme)
- Identify single-asset-group PMax campaigns (structurally weak)
- Performance variance across asset groups within a campaign
- Paused or "Limited" asset groups still showing recent cost

**Adzviser spec — Ad schedule (dayparting):**
```
google_ads_request:
  metrics: ["Cost", "Conversions", "Conversion Value", "Clicks", "Ctr %"]
  breakdowns: ["Hour Of Day", "Day Of Week"]
```

**Analysis:**
- Heatmap of spend vs conversions by hour-of-day × day-of-week
- Identify hours/days with significant spend and zero/low conversions (waste)
- Identify peak converting hours — opportunity to bid up via ad schedule adjustments
- **Rule of thumb:** if >20% of spend happens in hours producing <5% of conversions, schedule optimization is a high-impact fix

**Adzviser spec — Device performance:**
```
google_ads_request:
  metrics: ["Cost", "Conversions", "Conversion Value", "Ctr %", "Average Cpa (Cost Per Conversion)", "Roas (Conversions Value Per Cost)"]
  breakdowns: ["Device", "Campaign Name"]
```

**Analysis:**
- Device-level CPA and ROAS comparison (mobile vs desktop vs tablet)
- Flag devices where CPA is >1.5× account average — bid adjustment candidate
- Cross-reference with Campaign Name to identify campaigns where device performance varies dramatically

**Report output:** Include findings in evidence JSON under:
- `opportunities.pmax_structure` — asset group fixes
- `opportunities.schedule` — dayparting fixes with estimated wasted spend
- `opportunities.device` — bid adjustment recommendations with specific percentages

## YELLOW Mode (Targeted Dive)

If platform scored YELLOW (not RED), run only the pulls relevant to the flagged signal:
- **ROAS concern** → Pulls 1 + 2
- **CPA concern** → Pulls 1 + 3
- **Attribution concern** → Pulls 1 + 5
- **CTR concern** → Pulls 2 + 3 + 6
- **Pull 0 structural upgrade (ad strength / extensions flagged)** → Pull 6 only
- **PMax >30% of spend (from Pull 1)** → add Pull 7 regardless of other signals
- **Multiple concerns** → Pulls 1 + most relevant 2

Pull 0 always runs regardless of mode. Pull 7 can be triggered outside the normal YELLOW routing if Pull 1 reveals PMax dominance.

## Evidence Output

Write `{Client}_google-ads_evidence.json` to evidence directory.

**Key fields:**
- `meta.platform`: "google_ads"
- `meta.extraction_method`: "adzviser_mcp"
- `meta.audit_depth`: "deep_dive" or "targeted_dive"
- `meta.triage_score`: RED or YELLOW
- `meta.triage_signals`: array of signals that triggered the deep-dive
- `account_overview`: metrics from triage + campaign structure data
- `findings`: grouped by theme (structure, efficiency, targeting, tracking)
- `diagnosis.primary_constraint`: the single biggest issue
- `diagnosis.root_cause`: why the triage signals look the way they do
- `opportunities`: prioritized fixes with estimated impact
- `cross_channel_signals`: anything other platforms need to know
- `structural_health_check`: findings from Pull 0 with pass/fail per check
- `structural_upgrade_applied`: boolean — true if Pull 0 upgraded GREEN to YELLOW
- `opportunities.ad_level`: from Pull 6
- `opportunities.pmax_structure`: from Pull 7
- `opportunities.schedule`: from Pull 7
- `opportunities.device`: from Pull 7

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
| Weak RSA hygiene | >30% of RSAs rated Poor or Average | Rebuild RSAs with 10+ headlines, 3+ descriptions, minimal pinning |
| Extension underuse | Majority of campaigns with <3 sitelinks OR missing callouts | Add sitelinks, callouts, structured snippets, promotion extensions |
| Enhanced Conversions off | Detected OFF in conversion action audit | Enable Enhanced Conversions for Leads or Web per Google's setup guide |
| Single-asset-group PMax | PMax campaign with only 1 asset group | Split into 2-5 asset groups by audience theme for optimization signal |
| Schedule waste | >20% spend in low-converting hours | Adjust ad schedule bids — reduce or exclude waste hours |
| Device mismatch | One device CPA >1.5× account average | Apply device bid adjustment (negative for underperformers) |

## When to Escalate

Recommend strategy review if any of these emerge:
- Account fundamentally unprofitable (CPA >> target even after optimization)
- Attribution data suggests cross-channel cannibalization
- Keyword quality or search term waste exceeds 30% of spend
- Conversion tracking is broken or duplicated
