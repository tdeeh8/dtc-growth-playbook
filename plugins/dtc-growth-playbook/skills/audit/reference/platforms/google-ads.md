# Google Ads Audit Skill (v2)

**Output:** `{Client}_google-ads_evidence.json` | **Scratchpad:** `{Client}_google-ads_audit_notes.md`
**Slash command:** `/audit-google-ads`

This skill writes evidence, NOT a report. The audit-synthesizer consumes evidence files to generate reports.

---

## Before You Start

> **Shared setup:** Read `reference/audit-lifecycle.md` and follow all steps (playbook loading, manifest check, evidence directory setup).

**Google Ads-specific setup:**

1. **Platform playbook chunks** (load before opening browser):
   - `reference/playbook/google-ads.md` — methodology, PMax, feed optimization
   - `reference/playbook/measurement.md` — tracking validation, purchase reconciliation, CAPI/EMQ

2. **Reference files** — load `reference/platform-refs/nav-google.md` at start. Other refs are phase-gated:
   - `reference/platform-refs/tracking-checklist.md` → load at Phase 3
   - `reference/platform-refs/pmax-checklist.md` → load at Phase 4
   - `reference/platform-refs/search-checklist.md` → load at Phase 5

3. **Default date range:** YTD (Jan 1 → today) unless manifest specifies otherwise.

4. **If no manifest exists**, also ask for: Google Ads account URL or Account ID.

---

## Audit Phases

Execute in order. Maintain working notes per `audit-lifecycle.md` template, using phase names below.

### Phase 1: Access & Inventory

Open Google Ads → navigate to correct account (check MCC) → **set date range immediately** (see `nav-google.md` for date picker JS workaround).

**Capture from Campaigns view:**
- Campaign count: active vs. paused, types present (Search, Shopping, PMax, Display, Demand Gen, Video, App)
- Status flags: eligible, budget-limited, learning
- Account totals row: Spend, Conv Value, ROAS, Conversions, CPA, Clicks, Impressions, CTR
- Per-campaign: same metrics + daily budget + bid strategy

**Working notes for Phase 1:**
```
## Account Inventory
- Account ID: XXX-XXX-XXXX
- Date range: YYYY-MM-DD to YYYY-MM-DD
- Total campaigns: X active, Y paused
- Campaign types: [list]

## Account Totals (from Campaigns > Totals row)
Spend | Conv Value | ROAS | Conversions | CPA | Clicks | Impressions | CTR

## Campaign Breakdown
| Campaign | Type | Status | Spend | Revenue | ROAS | Conv | CPA | Budget | Bid Strategy |
```

**Nav tips:** Use `read_page` for ag-Grid tables; columns may be off-screen right. See `nav-google.md`.

### Phase 2: Campaign Data Extraction

For each **active** campaign, record type-specific metrics:

| Type | Key Metrics |
|---|---|
| PMax | Budget, bid strategy+target, conv value, ROAS, conv, CPA, status, cost |
| Search | Budget, bid strategy, top keywords, match types, QS, impr, clicks, CTR, conv, CPA, ROAS |
| Shopping | Budget, bid strategy, impr, clicks, CTR, conv, CPA, ROAS, impr share |
| Display/DG | Budget, impr, clicks, CTR, conv, CPA, cost |

**Paused campaigns** with significant spend: record name, type, spend, ROAS. Flag profitable paused as anomalies.

**Key signals to tag:** `budget_limited`, `above_target_roas`, `below_target_roas`, `learning`, `low_volume` (<30 conv), `legacy_smart_shopping_upgrade`, `paused_profitable`, `high_branded_share` (branded >10% of PMax search)

### Phase 3: Conversion Tracking Health

> **Load now:** `reference/platform-refs/tracking-checklist.md` + `reference/playbook/measurement.md`

**Goal:** Verify the numbers are trustworthy. Follow the full tracking checklist. Key checks:

1. **Conversion actions inventory** — Goals > Conversions > Summary: name, source, category, count type, attribution window, primary/secondary status, Include in Conversions toggle, counts + values
2. **Duplicate detection** — Multiple purchase events (Google Shopping App + GA4 + custom tag) all in primary goals?
3. **Dead actions** — UA-era actions? Zero conversions 90+ days?
4. **Enhanced Conversions** — Settings > Conversion Tracking: enabled?
5. **Consent Mode v2** — Check if EEA/UK traffic relevant
6. **Conversion modeling** — Requires 700+ clicks/7 days per country
7. **Attribution windows** — Appropriate for AOV tier? High-ticket needs 30-90d, low-ticket can use 7d

**Severity:** `critical` = duplicate purchases in primary goals | `high` = dead UA actions counting, EC disabled | `medium` = suboptimal windows | `low` = minor misconfig

### Phase 4: PMax Deep Dive

> **Skip if no PMax campaigns.** **Load now:** `reference/platform-refs/pmax-checklist.md`

Follow the PMax checklist. Key checks:
1. Legacy Smart Shopping upgrade? (history, naming)
2. Asset group quality — image/video/headline/description counts, ad strength, "Low" rated?
3. Search term categories — Insights > Search Terms: branded vs non-branded. Branded >10% → flag cannibalization
4. Budget-limited + exceeding ROAS target? → high-priority opportunity
5. Audience signals — customer match? website visitors? or generic interests only?
6. URL expansion — on/off? Page feeds configured?
7. Channel breakdown — Display/YouTube >30% with weak creative? Flag it
8. Conv volume per asset group: <5/mo → merge, <20/mo → suboptimal

### Phase 5: Search Campaign Quality

> **Skip if no Search campaigns.** **Load now:** `reference/platform-refs/search-checklist.md`

Follow the Search checklist. Key checks:
1. Quality Score distribution — % at QS 7+, 5-6, below 5
2. Negative keywords — adequate? Check search terms for obvious gaps
3. Match type distribution — heavy phrase match? Note 23% CPA penalty vs broad+smart bidding
4. Branded vs non-branded — separate campaign? Branded impression share?
5. RSA asset ratings — how many "Low" headlines/descriptions?
6. Landing page alignment — relevant pages or generic homepage?
7. Geographic/audience targeting — issues? Exclusions in place?
8. Search term review — flag irrelevant queries for negation

### Phase 6: Competitive Landscape

Navigate to top campaign > Auction Insights:
- Top 5-10 competitors by impression share
- Branded campaigns: who's conquesting? Non-branded: available IS?
- Overlap rate + position above rate for key competitors

→ Feeds `raw_metrics.auction_insights`

### Phase 7: Platform Diagnosis

Synthesize Phases 1-6 into:

**1. Primary constraint** (single biggest issue). Common patterns: budget-limited profitable campaigns, tracking inflation/deflation, PMax branded cannibalization, low volume starving smart bidding, poor feed quality, wrong bid strategy for volume.

**2. Secondary constraints** — ranked by impact.

**3. Opportunities** — each with: priority (CRITICAL/HIGH/MEDIUM/LOW), expected impact, confidence + reasoning, supporting evidence.

**4. Cross-channel signals** for synthesizer:
- Branded search trends → Meta TOF correlation?
- High ROAS but low revenue → Meta driving demand?
- Tracking discrepancies → GA4/Shopify reconciliation needed?
- Budget allocation → channel-allocation analysis needed?

**5. Open questions** — COGS/margins, GA4 data, Shopify reconciliation, client business context (seasonality, promos, inventory).

### Phase 8: Write Evidence JSON

> **Schema:** Read `reference/evidence-schema-quick.md` for structure.
> **Labeling:** Read `reference/evidence-rules.md` for the 5-label system.

**Google Ads source format:** `"Google Ads > [Page] > [Section] > [Metric]"`

**Section-by-section guidance:**
- `account_overview` — every number needs value (number), formatted (string), label, source
- `campaigns` — include key_signals tags from Phase 2
- `tracking_health` — flags array (severity + evidence) from Phase 3, plus conversion_actions inventory
- `findings` — discrete observations with title, label, evidence, significance
- `anomalies` — unexpected patterns (profitable paused campaigns, sudden metric shifts)
- `diagnosis` — primary_constraint + secondary_constraints, each with evidence_refs
- `opportunities` — prioritized actions with expected_impact, confidence, confidence_reasoning
- `cross_channel_signals` — signal + check_in platforms + what_to_look_for
- `open_questions` — question + data_needed + what was attempted

**Google Ads `raw_metrics` keys:** `campaign_details`, `conversion_action_details`, `auction_insights`, `search_term_categories`

**File location:**
- {Agency}: `{Agency}/reports/{Client-Name}/evidence/{Client}_google-ads_evidence.json`
- {Brand}: `{Brand}/reports/evidence/{Brand}_google-ads_evidence.json`

**Google Ads-specific validation:**
- Campaign spend sum ≈ account total (±rounding) — flag discrepancies
- Timestamp all observations — Google Ads shows real-time data; date range must be explicit
- Don't diagnose tracking issues you didn't verify — use INFERENCE, not OBSERVED

**JSON structure (platform = "google-ads"):**
```json
{
  "meta": {
    "client": "", "platform": "google-ads", "audit_date": "",
    "date_range": { "start": "", "end": "" },
    "access_level": "full", "depth": "deep", "auditor_notes": ""
  },
  "account_overview": [],
  "campaigns": [],
  "tracking_health": { "flags": [], "conversion_actions": [] },
  "findings": [],
  "anomalies": [],
  "diagnosis": {
    "primary_constraint": { "title": "", "description": "", "evidence_refs": [] },
    "secondary_constraints": []
  },
  "opportunities": [],
  "cross_channel_signals": [],
  "open_questions": [],
  "raw_metrics": {
    "campaign_details": [],
    "conversion_action_details": [],
    "auction_insights": [],
    "search_term_categories": []
  }
}
```

### Phase 9: Closeout

> Follow `audit-lifecycle.md` closeout: save evidence JSON, update manifest (status → DONE), save working notes.

---

## Benchmarks

> **Full thresholds:** `reference/playbook/benchmarks.md` + `reference/playbook/google-ads.md`

**Always calculate client-specific targets first:**
- Break-even CPA = AOV × gross margin %
- Target CPA = Break-even CPA × 0.65
- Minimum ROAS = 1 / gross margin %
- Target ROAS = Minimum ROAS × 1.4

If margins unknown → vertical estimates from benchmarks.md, label ASSUMPTION.

**Critical thresholds (quick ref):**
- Search: CTR <2% floor, CVR <1.5% floor, CPC >$3.50 = high
- Shopping: ROAS <3x floor, CTR <0.4% floor
- PMax: ROAS <2.5x floor; budget-dependent ($50K+/mo avg 5.2x, <$2K/mo avg 2.8x)
- Branded IS: <70% floor

**AOV tier adjustments** — loaded via conditional playbook chunks (see lifecycle setup):
- $200+: lower CVR (1-2%), 30-90d windows, proxy events, tROAS over tCPA
- <$100: higher CVR (2-4%), 7d windows OK, consolidate for volume, free shipping critical

---

## Working Notes — Google Ads Phase Names

Use the `audit-lifecycle.md` template. Replace `[Add sections matching your skill's phase structure]` with:

```markdown
## Phase 1: Account Inventory
[campaign count, types, account totals, campaign breakdown table]

## Phase 2: Campaign Data
[detailed per-campaign metrics by type]

## Phase 3: Tracking Health
[conversion action inventory, duplicate detection, flags with severity]

## Phase 4: PMax Deep Dive
[asset groups, search term categories, branded split, channel breakdown]

## Phase 5: Search Quality
[Quality Score distribution, match types, negatives, search term review]

## Phase 6: Competitive Landscape
[auction insights — competitors, IS, overlap, position above]

## Phase 7: Diagnosis
[primary constraint reasoning, opportunities draft, cross-channel signals]
```

---

## Edge Cases

**Incomplete data:** Document what was attempted in working notes. Label `DATA_NOT_AVAILABLE` in evidence. Note in `open_questions`. Continue with available data — don't halt.

**Very large accounts (20+ campaigns):** Focus detailed analysis on active campaigns consuming >5% of total spend. Group small campaigns as "long tail" with aggregate metrics. Still check all for tracking issues and status anomalies.

**New/small accounts (<30 days or <$5K spend):** Note limited data in `meta.auditor_notes`. Adjust depth to "standard" or "surface". Focus on structure and tracking rather than performance benchmarking. Flag that benchmarks require more data.

**MCC accounts:** Confirm correct client account (check account ID). Some features like conversion actions may be set at MCC level. Note if conversion actions are inherited vs. account-level.

---

## Completion Checklist

- [ ] Date range set correctly and maintained
- [ ] All active campaigns have metrics
- [ ] Conversion tracking assessed
- [ ] PMax deep dive done (if applicable)
- [ ] Search quality checked (if applicable)
- [ ] Auction insights captured
- [ ] Evidence JSON has all required fields
- [ ] Every OBSERVED has source, every CALCULATED shows formula
- [ ] No invented numbers without ASSUMPTION label
- [ ] Cross-channel signals + open questions populated
- [ ] Working notes + evidence JSON saved
- [ ] Manifest updated (if exists)
