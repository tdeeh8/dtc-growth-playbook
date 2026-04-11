# Meta Ads Audit Skill (v2)

**Skill type:** Platform audit (modular audit system v2)
**Trigger phrases:** "audit their Meta Ads", "Meta audit for [client]", "audit Facebook campaigns", "audit their Meta", "Meta Ads audit", "Facebook ads audit", "audit-meta"
**Output:** `{Client}_meta-ads_evidence.json` → evidence directory
**Working scratchpad:** `{Client}_meta-ads_audit_notes.md`
**Slash command:** `/audit-meta`

---

## Purpose

Deep Meta Ads audit — account metrics, campaign structure (TOF/MOF/BOF), creative fatigue, audience quality, attribution impact (Jan 2026 window changes), frequency/reach, CAPI/pixel health — producing structured evidence JSON for the audit-synthesizer.

This skill writes evidence. The audit-synthesizer generates the report.

---

## Before You Start

> **Read shared ref first:** `reference/audit-lifecycle.md` for standard setup (manifest check, evidence directory, AOV-conditional loads).

### Meta-Specific Setup

**Platform playbook chunks** (load before opening browser):
- `reference/playbook/andromeda.md` — Andromeda algorithm, Entity ID clustering, creative diversity, fatigue
- `reference/playbook/scaling-frequency.md` — frequency ceilings, audience saturation, scaling sequence
- `reference/playbook/measurement.md` — tracking validation, CAPI/EMQ, Meta Jan 2026 attribution changes

**Conditional loads** (per lifecycle ref AOV rules, plus):
- Creative deep dive → `reference/playbook/creative-testing.md`
- Campaign architecture focus → `reference/playbook/tof-strategy.md` (canonical for ASC setup, budget splits, retargeting)

**Skill reference files** (load all before browsing):
- `reference/platform-refs/nav-meta.md` — Ads Manager navigation, column customization, breakdown extraction
- `reference/platform-refs/creative-checklist.md` — *Phase-gated: load at Phase 3*
- `reference/platform-refs/audience-checklist.md` — *Phase-gated: load at Phase 4*

**Meta-specific manifest questions** (if no manifest exists, ask these in addition to lifecycle defaults):
- Meta Ads Manager URL or Account ID
- Whether Jan 2026 attribution window change has been communicated to stakeholders
- Date range preference (default: YTD)

---

## Audit Phases

Execute in order. Maintain working notes throughout.

### Phase 1: Access & Account Overview

**Goal:** Get into Ads Manager, configure columns, capture account-level metrics.

1. Open Meta Ads Manager → correct ad account. **Set date range immediately** (see `reference/platform-refs/nav-meta.md`). Default: YTD.
2. **Customize columns** (defaults are insufficient — see `reference/platform-refs/nav-meta.md` for exact column set):
   - Spend, Results, Cost/Result, Purchase ROAS, Impressions, Reach, Frequency, CPM
   - Link Clicks, CTR (link), CPC (link), ThruPlay views, Video plays 25/50/75/100%
   - Website purchases, Purchase value, Cost/purchase, Add to cart, Initiate checkout
3. **Record account totals:** Spend, Purchase Value, ROAS, Purchases, CPA, Impressions, Reach, Frequency, CPM, Link Clicks, CTR, CPC.
4. **Campaign inventory:** Count active/paused/in-review. Types (ASC, manual Sales, Traffic, Engagement, Leads, Awareness). Objectives. Learning Limited status.

**Working notes format for Phase 1:**
```
## Account Overview
- Account ID: XXX
- Account Name: XXX
- Date range: YYYY-MM-DD to YYYY-MM-DD
- Total campaigns: X active, Y paused
- Campaign types: [list]

## Account Totals (custom columns applied)
- Spend: $X | Purchase Value: $X | ROAS: X.Xx | Purchases: X | CPA: $X
- Impressions: X | Reach: X | Frequency: X.X | CPM: $X
- Link Clicks: X | CTR: X% | CPC: $X

## Campaign Breakdown
| Campaign | Objective | Type | Status | Spend | Revenue | ROAS | Purchases | CPA | Frequency | Budget |
|---|---|---|---|---|---|---|---|---|---|---|
```

### Phase 2: Campaign Structure Assessment

**Goal:** Evaluate funnel architecture — TOF/MOF/BOF split, budget allocation, structural efficiency.

**Classify each campaign by funnel position:**
- TOF: Prospecting/cold, ASC, broad, awareness
- MOF: Engagement retargeting — video viewers, page engagers
- BOF: Website retargeting, cart abandoners, past purchasers, email lists

**Assess:**

1. **Funnel budget split.** Healthy: 60-70% TOF, 10-20% MOF, 15-25% BOF. Flag BOF >30% (retargeting over-investment) or TOF <50% (pipeline risk).

2. **ASC assessment** (if ASC campaigns exist): Existing customer budget cap set? Target 25-30%. Cap >50% or unset → ASC likely retargeting. Ad sets should be 1-2 max. Creative count per ad set: minimum 8-15 genuinely diverse concepts.

3. **Consolidation check.** Per andromeda.md: consolidation (1-2 ad sets, diverse creative) beats fragmentation (5+ ad sets, narrow audiences). Flag overlapping campaigns causing self-competition and CPM inflation.

4. **Budget efficiency.** Flag: campaigns budget-limited while above ROAS target (money on table), campaigns overspending vs. performance, misallocation vs. funnel needs.

5. **Learning phase check:** Each ad set needs 50+ optimization events per week to exit learning. Ad sets stuck in Learning Limited → insufficient conversion volume. Solutions: consolidate ad sets, move optimization to a higher-funnel event (ATC instead of Purchase), or increase budget to drive more volume.

6. **Campaign naming & organization:** Are campaigns clearly named by objective and funnel stage? Unclear naming makes ongoing optimization difficult and audit trail unreliable.

**Tag each campaign with key_signals:** `budget_limited`, `above_target_roas`, `below_target_roas`, `learning_limited`, `high_frequency`, `creative_fatigue`, `audience_saturation`, `asc_no_cap`, `asc_high_cap`, `fragmented_structure`, `retargeting_heavy`, `low_creative_count`.

### Phase 3: Creative Performance & Fatigue Analysis

**Goal:** Assess creative health — what's working, fatigued, format/angle gaps.

> **Phase-gated load:** Read `reference/platform-refs/creative-checklist.md` now. Follow its full checklist.

1. **Navigate to ad-level view.** Customize columns for creative metrics (see `reference/platform-refs/nav-meta.md`).

2. **Extract per-ad metrics for top 15-20 ads by spend:** Ad name, format (image/video/carousel/collection), spend, impressions, reach, frequency, CTR, CPC, CPM, purchases, CPA, ROAS. Videos: ThruPlay rate, hook rate (3s views / impressions), hold rate (50%+ watched / 3s views). Ad copy length and approach (testimonial, benefit-led, problem-solution, etc.).

3. **Creative fatigue detection:**
   - Frequency vs. CTR trend: CTR drops >20% from peak while frequency rises → fatigued
   - CPA increased >15% from baseline while downstream CVR stable → creative issue, not LP
   - Per andromeda.md: effective ad lifespan post-Andromeda is 2-3 weeks. Flag ads running 4+ weeks without refresh.
   - Frequency thresholds: prospecting >3.0/7d = diagnostic, >3.5 = plan refresh, >4.5 = broken

4. **Format performance comparison:** UGC vs. polished (per andromeda.md: UGC outperforms 3-5x — flag zero-UGC accounts). Video vs. static vs. carousel by CPA/CTR. Short (<15s) vs. long (30s+) — hook and hold rates.

5. **Entity ID clustering** (per andromeda.md): 50 slight variations = 1 Entity ID. Count genuinely distinct creative concepts, not just ad count. Flag same hook/angle/format across all ads.

6. **Ad copy patterns:** Approaches tested (testimonial, benefit, problem-solution, social proof, urgency). Headline variety. Winning copy angle.

7. **Thumb-stop ratio:** 3s video views / impressions. Strong: 25-35%. Below 20% = hook failing.

Tag data for `raw_metrics.creative_details`.

### Phase 4: Audience Quality Assessment

**Goal:** Evaluate targeting, overlap, Advantage+ behavior.

> **Phase-gated load:** Read `reference/platform-refs/audience-checklist.md` now. Follow its full checklist.

1. **Audience inventory per ad set:** Targeting type (Advantage+, Broad, Interest, LAL, Custom), audience size, geo, age/gender, exclusions.

2. **Funnel mapping:** TOF (broad, Advantage+), MOF (video viewers, engagers), BOF (website visitors 7/14/30/90/180d, ATC, IC, email, purchasers). Flag missing segments.

3. **LAL assessment:** Seed audiences, sizes (1%, 2-3%, 5%+). Per andromeda.md: broad delivers ~49% higher ROAS vs. LALs due to 45% higher LAL CPMs. Flag LAL-heavy accounts.

4. **Overlap detection:** Multiple ad sets hitting same audience → self-competition. Use Audience Overlap tool if accessible.

5. **Advantage+ behavior:** Audience suggestion broad or constrained? ASC existing customer cap? Actually reaching new prospects or defaulting to warm? Demographic breakdown: if 80%+ delivery to narrow slice despite broad targeting → Andromeda clustering on creative signals (needs more creative diversity).

6. **Exclusion audit:** Past purchasers excluded from prospecting? Email subs? Employees? No exclusions → flag waste.

Tag data for `raw_metrics.audience_details`.

### Phase 5: Attribution & Tracking Health

**Goal:** Assess CAPI/pixel health, attribution window impact, data trustworthiness. **Critical in post-Jan 2026 environment.**

1. **CAPI / Pixel health check:**
   - Navigate to Events Manager → Data Sources → the pixel → Event Quality tab
   - Record Event Match Quality (EMQ) for Purchase event: target 8+/10 (acceptable minimum 6+)
   - Check event_id parameter: is it present on both Pixel AND CAPI events? Missing event_id causes 80% of dedup failures
   - Verify deduplication: Test Events → place test order → confirm Purchase fires once, not twice, with Source = "Server"
   - Check fbp (browser cookie) and fbc (click ID) passing to CAPI
   - Case sensitivity matters: "purchase" vs "Purchase" won't deduplicate

2. **Shopify CAPI integration status:**
   - Is Shopify's native CAPI integration active?
   - Is Data Sharing set to "Always On"? Jan 2026 Shopify auto-upgrade may have reverted to "Optimized"
   - If Meta ROAS dropped suddenly in Jan 2026, this is the first thing to check

3. **Attribution window assessment (Jan 2026 changes):**
   - Per measurement.md: Meta permanently removed 7-day and 28-day view-through attribution from Ads Insights API on January 12, 2026
   - March 2026: click-through redefined (only link clicks count), new "engage-through" category (1-day only)
   - **Impact by AOV tier:**
     - Low-consideration / impulse ($0-100): Minimal impact (most convert within 1-day click window)
     - Mid-consideration ($100-200): Moderate impact (10-20% fewer attributable conversions)
     - High-consideration ($200+): Major impact (30-40% fewer attributable conversions)
   - **YoY comparison warning:** If comparing to pre-Jan 2026 data, reported ROAS will appear significantly different due to attribution model change, not performance change. Flag prominently.
   - Check current attribution settings: what window is configured for each campaign?

4. **Conversion event inventory:**
   - Navigate to Events Manager → Data Sources → the pixel → Events
   - Record all events tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, etc.
   - Which events are being optimized for in campaigns?
   - Are there custom events that may be misconfigured?

5. **Platform vs. Shopify reconciliation flag:**
   - Per measurement.md: don't try to reconcile — use MER instead
   - But DO flag the magnitude of divergence: if Meta claims 2x more purchases than Shopify shows, note the gap
   - Per measurement.md variance thresholds: within ±20% = normal for Meta. 20-30% = warrants investigation. >30% = tracking problem

**Severity classification:** `critical` = no CAPI / EMQ <4 / dedup broken. `high` = EMQ <6 / Data Sharing reverted / event_id missing / >30% divergence. `medium` = EMQ 6-7 / minor dedup / attribution misconfigured for AOV. `low` = missing non-critical events.

### Phase 6: Frequency & Reach Analysis

**Goal:** Diagnose frequency ceilings and audience saturation.

> **Phase-gated load:** Read `reference/playbook/andromeda.md` and `reference/playbook/scaling-frequency.md` now if not loaded at setup.

1. **Account-level frequency:** Overall + by campaign (prospecting vs. retargeting). Per scaling-frequency.md: Prospecting 3.0/7d = diagnostic, 3.5 = plan refresh, 4.5+ = broken. Retargeting 5.0/7d = diagnostic, 6.0 = plan refresh, 8.0+ = broken.

2. **Frequency vs. CTR trend:** Weekly comparison per major campaign. Inflection point where frequency rises + CTR drops = true frequency ceiling.

3. **Fatigue vs. saturation diagnosis** (per scaling-frequency.md):
   - Frequency rising + CTR dropping + reach stable → **Creative fatigue.** Fix: new creative.
   - Frequency rising + reach flattening + CPM rising → **Audience saturation.** Fix: expand audiences.

4. **Reach analysis:** Total reach vs. audience size estimate. >60% of audience reached on prospecting = likely saturated. Week-over-week reach trend.

5. **Placement breakdown** (Breakdown → Delivery → Placement): Spend + performance by FB Feed, IG Feed, IG Stories, IG Reels, Audience Network, Messenger. Flag placements >20% budget with significantly worse performance.

### Phase 7: Platform Diagnosis

**Goal:** Synthesize all observations into coherent diagnosis.

**Primary constraint** (single biggest issue — common Meta patterns): Creative fatigue/insufficient diversity (most common), CAPI broken, fragmented structure, retargeting over-investment, ASC misconfigured, audience saturation, budget-limited on profitable campaigns, Learning Limited, post-Jan 2026 attribution confusion.

**Secondary constraints:** Rank by impact.

**Opportunities:** Each must include:
- Priority: CRITICAL / HIGH / MEDIUM / LOW
- Expected impact: revenue or efficiency estimate where possible
- Confidence level: high / medium / low — with reasoning explaining why
- Supporting evidence: reference specific findings from Phases 1-6
- Specificity: "Add 5 new UGC concepts to ASC campaign" not "improve creative"

**Cross-channel signals** (populate in evidence — these are what the synthesizer uses for cross-platform analysis):
- **Branded search lift:** Meta TOF → ~19% branded search halo. Flag for Google Ads audit.
- **Email list growth:** Meta TOF driving new subs? Check Klaviyo timing vs. spend scaling.
- **Audience overlap with Google remarketing:** Both platforms claiming same converters?
- **Attribution overlap:** Meta ROAS + Google ROAS > Shopify revenue? Flag for synthesizer.
- **Site CVR:** Healthy CTR but poor conversion → flag for site-audit-v2.
- **Platform vs. Shopify divergence magnitude.**

**Open questions:** COGS/margins, Shopify revenue for MER, GA4 attribution comparison, geo-test/incrementality data, creative production capacity, pre-Jan 2026 historical data.

### Phase 8: Write Evidence JSON

> **Read shared ref:** `reference/evidence-schema-quick.md` for schema structure.

**Platform = "meta-ads".** Meta-specific raw_metrics keys: `campaign_details`, `creative_details`, `audience_details`, plus `placement_breakdown` and `frequency_trend`.

**Meta-specific schema notes:**
- `meta.auditor_notes`: Include attribution window in effect (post-Jan 2026 defaults: 1-day view, 7-day click)
- `campaigns[].type`: Include funnel position (e.g., "ASC - TOF", "Manual Sales - BOF Retargeting")
- Every ROAS/conversion number must note attribution window in effect
- Post-Jan 2026 numbers are NOT comparable to pre-Jan 2026

**File location:**
- Disruptive: `Disruptive-Advertising/reports/{Client-Name}/evidence/{Client}_meta-ads_evidence.json`
- Pill Pod: `Pill-Pod/reports/evidence/Pill_Pod_meta-ads_evidence.json`

> **Evidence labeling:** Follow `reference/evidence-rules.md`. Meta-specific source format: "Meta Ads Manager > [page] > [section] > [metric] (custom columns)".

**JSON structure template:**
```json
{
  "meta": {
    "client": "",
    "platform": "meta-ads",
    "audit_date": "",
    "date_range": { "start": "", "end": "" },
    "access_level": "full",
    "depth": "deep",
    "auditor_notes": "Attribution window: 1-day view, 7-day click (post-Jan 2026 defaults). [Add data quality notes.]"
  },
  "account_overview": [],
  "campaigns": [],
  "tracking_health": {
    "flags": [],
    "conversion_actions": []
  },
  "findings": [],
  "anomalies": [],
  "diagnosis": {
    "primary_constraint": {
      "title": "",
      "description": "",
      "evidence_refs": []
    },
    "secondary_constraints": []
  },
  "opportunities": [],
  "cross_channel_signals": [],
  "open_questions": [],
  "raw_metrics": {
    "campaign_details": [],
    "creative_details": [],
    "audience_details": [],
    "placement_breakdown": [],
    "frequency_trend": []
  }
}
```

### Phase 9: Closeout

> Follow `reference/audit-lifecycle.md` → "After the Audit" section.

---

## Working Notes Protocol

> **Template:** Follow `reference/audit-lifecycle.md` → "Working Notes Template" section.

Maintain `{Client}_meta-ads_audit_notes.md` in the evidence directory throughout the audit. Add these Meta-specific phase sections:

```markdown
# {Client} — Meta Ads Audit Notes

**Date:** YYYY-MM-DD
**Account ID:** XXX
**Date Range:** YYYY-MM-DD to YYYY-MM-DD
**Attribution Window:** 1-day view, 7-day click (post-Jan 2026)

## Phase 1: Account Overview
[account-level metrics, campaign inventory]

## Phase 2: Campaign Structure
[funnel classification, budget splits, ASC settings]

## Phase 3: Creative Performance
[top ads, format comparison, fatigue signals, diversity assessment]

## Phase 4: Audience Quality
[targeting inventory, overlap, exclusions, Advantage+ behavior]

## Phase 5: Tracking Health
[EMQ, CAPI status, deduplication, attribution window impact]

## Phase 6: Frequency & Reach
[frequency trends, reach analysis, placement breakdown]

## Phase 7: Diagnosis
[thinking through diagnosis before writing JSON]

## Parking Lot
[things noticed but not yet categorized]
```

Working notes are NOT a deliverable. They exist for progress tracking, session handoff, and audit trail.

---

## Benchmarks

> **Full benchmarks:** `reference/playbook/benchmarks.md`. Only critical Meta thresholds below.

**Account-level:**
- CTR: Floor <1.0%, Healthy 1.5-2.5%, Strong 3.0%+
- CPM (purchase objective): Floor >$25, Healthy $10-18, Strong <$10. Retargeting $30-50 is normal.
- CPC: Floor >$2.50, Healthy $0.60-1.50, Strong <$0.50
- Blended ROAS: Floor <1.5x, Healthy 2.0-3.5x, Strong 4.0x+ (median 1.93x in 2025)

**By funnel position:**
- TOF ROAS: Floor <1.0x, Healthy 1.5-2.5x, Strong 3.0x+
- Retargeting ROAS: Floor <3.0x, Healthy 4.0-6.0x, Strong 8.0x+ (median 3.6x)

**Creative:**
- Hook rate (3s views / impressions): Floor <20%, Healthy 25-35%, Strong 40%+
- Hold rate (50%+ watched): Floor <30%, Healthy 40-55%, Strong 60%+
- Fatigue signal: CTR drops >25% from peak while frequency rises

**Frequency (scaling-frequency.md):** Prospecting 3.0/7d diagnostic → 3.5 plan → 4.5+ broken. Retargeting 5.0 → 6.0 → 8.0+. Learning phase: 50+ events/ad set/week.

**Always calculate client-specific targets first:** Break-even CPA = AOV x margin%. Target CPA = break-even x 0.65. Min ROAS = 1/margin%. Target ROAS = min x 1.4. Unknown margins → vertical estimates from benchmarks.md, label ASSUMPTION.

### AOV Tier Impact (Jan 2026 Attribution)

- **$200+:** 30-40% fewer attributable conversions post-Jan 2026. Reported ROAS may jump from 5.0 to 8.0 simply due to redefinition — not actual improvement. Proxy event optimization may be appropriate (ATC or IC instead of Purchase for bidding). Longer retargeting windows (30-90d). Load `high-ticket.md`.
- **$100-200:** Moderate impact (10-20% fewer attributable conversions). Standard benchmarks apply but monitor for attribution gaps. Some conversions that previously fell in the 7-day view window are now uncredited.
- **<$100:** Minimal attribution impact (most conversions within 1-day click window). Creative fatigue is the primary risk — higher volume means faster burn. Impulse optimization: speed to checkout, free shipping threshold is critical. Load `low-ticket.md`.

---

## Error Handling

### Incomplete Data
Document attempts in working notes. Label `DATA_NOT_AVAILABLE`. Add to `open_questions`. Continue with available data.

### ASC Limitations
ASC hides detailed audience demographics, exact new/existing split beyond cap, individual ad set targeting. Document in `auditor_notes`. Evaluate through creative performance, frequency, and customer budget cap.

### Large Accounts (20+ campaigns)
Focus detailed analysis on active campaigns >5% of spend. Group small campaigns as "long tail" with aggregates. Still check ALL for structural issues. Creative analysis: top 15-20 by spend.

### New/Small Accounts (<30d or <$5K spend)
Set depth to "standard" or "surface". Focus on structure, tracking, creative diversity over benchmarking. Flag insufficient conversion volume.

### Pre/Post Jan 2026 Date Ranges
If range spans Jan 12, 2026: note in auditor_notes, do NOT compare directly, break into two periods if possible, communicate measurement shift clearly.

---

## Anti-Hallucination: Meta-Specific Addendum

> **Core rules:** Follow `reference/evidence-rules.md` in full.

**Meta-specific cross-checks:**
- **Attribution window caveat:** Every ROAS or conversion number must note which attribution window was in effect. Post-Jan 2026 ≠ pre-Jan 2026.
- **Creative fatigue verification:** Don't diagnose fatigue from a single metric. Require frequency rising AND CTR declining AND timeframe >2 weeks. Cross-check CPA trend to confirm creative (not LP) issue.
- **CAPI verification:** Don't diagnose tracking issues you didn't verify in Events Manager. Suspected but unverified → INFERENCE, not OBSERVED.

---

## Completion Checklist

- [ ] Date range set correctly and maintained throughout
- [ ] Columns customized (not defaults)
- [ ] All active campaigns recorded with funnel position
- [ ] Structure assessed (TOF/MOF/BOF split, budget allocation, ASC settings)
- [ ] Creative analyzed: top 15-20 ads (hook/hold rate, fatigue, format comparison, Entity ID diversity)
- [ ] Audience inventoried (types, sizes, exclusions, overlap, Advantage+ behavior)
- [ ] CAPI/pixel checked (EMQ, dedup, Data Sharing)
- [ ] Attribution impact assessed (Jan 2026 changes noted)
- [ ] Frequency/reach analyzed (ceiling detection, fatigue vs. saturation)
- [ ] Placement breakdown captured
- [ ] Evidence JSON conforms to schema (all required fields)
- [ ] All OBSERVED metrics have source, all CALCULATED show formula
- [ ] No invented numbers without ASSUMPTION label
- [ ] Cross-channel signals populated
- [ ] Open questions documented
- [ ] Working notes + evidence JSON saved to evidence directory
- [ ] Manifest updated (if exists)
