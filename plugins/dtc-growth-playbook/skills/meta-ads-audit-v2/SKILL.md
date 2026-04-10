# Meta Ads Audit Skill (v2)

**Skill type:** Platform audit (modular audit system v2)
**Trigger phrases:** "audit their Meta Ads", "Meta audit for [client]", "audit Facebook campaigns", "audit their Meta", "audit Meta for [client]", "Meta Ads audit", "Facebook ads audit", "audit-meta"
**Output:** JSON evidence file (`{Client}_meta-ads_evidence.json`) conforming to `audit-orchestrator/reference/evidence-schema.json`
**Working scratchpad:** `{Client}_meta-ads_audit_notes.md` (maintained during audit, not a deliverable)
**Slash command:** `/audit-meta`

---

## Purpose

Run a deep Meta Ads platform audit — account-level metrics, campaign structure (TOF/MOF/BOF), creative performance and fatigue analysis, audience quality, attribution impact (Jan 2026 window changes), frequency/reach dynamics, and CAPI/pixel health — and produce a structured evidence JSON file that the audit-synthesizer consumes.

This skill does NOT generate a report. It writes evidence. The audit-synthesizer reads evidence files and generates the report.

---

## Before You Start

### 1. Load Playbook Chunks

Read these files before opening any browser tabs:

```
${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md           — diagnostic thresholds, profitability math
${CLAUDE_PLUGIN_ROOT}/references/andromeda.md            — Andromeda algorithm, Entity ID clustering, creative diversity, fatigue
${CLAUDE_PLUGIN_ROOT}/references/scaling-frequency.md    — frequency ceilings, audience saturation, scaling sequence
${CLAUDE_PLUGIN_ROOT}/references/measurement.md          — tracking validation, CAPI/EMQ, Meta Jan 2026 attribution changes
```

**Conditional loads (check AOV tier from manifest or ask):**
- AOV $200+ → also read `${CLAUDE_PLUGIN_ROOT}/references/high-ticket.md` (proxy event optimization, extended consideration windows, BNPL)
- AOV <$100 → also read `${CLAUDE_PLUGIN_ROOT}/references/low-ticket.md` (impulse funnel, creative fatigue/hooks, offer structures)
- Creative deep dive requested → also read `${CLAUDE_PLUGIN_ROOT}/references/creative-testing.md` (testing methodology, concept testing, hook benchmarks)

**Note:** `${CLAUDE_PLUGIN_ROOT}/references/tof-strategy.md` is the canonical source for campaign structure (ASC setup, budget splits, retargeting, testing campaigns). Load it if campaign architecture assessment is a focus area.

### 2. Load Reference Files

Read all reference files in this skill's `reference/` directory:

```
reference/nav-meta.md              — Meta Ads Manager navigation, column customization, breakdown extraction
reference/creative-checklist.md    — Creative audit items (hook rate, hold rate, fatigue, UGC vs branded)
reference/audience-checklist.md    — Audience structure, overlap, exclusions, LAL sizing, Advantage+ settings
```

### 3. Check for Audit Manifest

Look for an existing manifest at the client's evidence directory:
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/{Client}_audit_manifest.md`
- {Own Brand}: `{Own-Brand}/reports/evidence/{Own_Brand}_audit_manifest.md`

**If manifest exists:** Read it for client context, AOV tier, department, platform access URLs, known issues, and which other audits have already been completed. Use the AOV tier to load conditional playbook chunks. Check if Shopify or Google Ads evidence already exists — their cross-channel signals may inform what to look for.

**If no manifest:** Ask the user for:
- Client name (display name for evidence file)
- Meta Ads Manager URL or Account ID
- AOV (approximate — needed for benchmark tier selection and attribution impact assessment)
- Department ({Agency} or {Own-Brand})
- Any known issues or focus areas
- Date range preference (default: Jan 1 of current year through today — YTD)
- Whether the Jan 2026 attribution window change has already been communicated to the client/stakeholders

### 4. Set Up Evidence Directory

Ensure the evidence directory exists:
- {Agency}: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

---

## Audit Phases

Execute in order. Each phase builds on the previous. Maintain working notes throughout.

### Phase 1: Access & Account Overview

**Goal:** Get into Ads Manager, configure the view correctly, and capture account-level metrics.

1. Open Meta Ads Manager in the browser. Navigate to the correct ad account if multiple accounts are available.
2. **Set the date range immediately** — see `reference/nav-meta.md` for the date picker navigation. Default: YTD (Jan 1 through today). If the manifest specifies a different range, use that.
3. **Customize columns** — the default columns are insufficient. You MUST customize columns before extracting any data. See `reference/nav-meta.md` for the exact column set needed. Key columns to add:
   - Amount Spent, Results, Cost per Result, Purchase ROAS
   - Impressions, Reach, Frequency, CPM
   - Link Clicks, CTR (link click-through rate), CPC (cost per link click)
   - ThruPlay views (video), Video plays at 25%/50%/75%/100%
   - Website purchases, Purchase conversion value, Cost per purchase
   - Add to cart, Initiate checkout (for funnel analysis)
4. **Record account-level totals** from the totals row:
   - Total Spend, Total Purchase Value, ROAS, Total Purchases, CPA
   - Total Impressions, Total Reach, Average Frequency, Average CPM
   - Total Link Clicks, Average CTR, Average CPC
5. **Take inventory** of the campaign structure:
   - How many campaigns total? How many active vs. paused vs. in review?
   - Campaign types: ASC (Advantage+ Shopping), manual Sales, Traffic, Engagement, Leads, Awareness?
   - Campaign objectives set for each
   - Which campaigns are in Learning Limited? Active? Completed?

**Working notes format for Phase 1:**
```
## Account Overview
- Account ID: XXX
- Account Name: XXX
- Date range: YYYY-MM-DD to YYYY-MM-DD
- Total campaigns: X active, Y paused
- Campaign types: [list]

## Account Totals (custom columns applied)
- Spend: $X
- Purchase Value: $X
- ROAS: X.Xx
- Purchases: X
- CPA: $X
- Impressions: X
- Reach: X
- Frequency: X.X
- CPM: $X
- Link Clicks: X
- CTR: X%
- CPC: $X

## Campaign Breakdown
| Campaign | Objective | Type | Status | Spend | Revenue | ROAS | Purchases | CPA | Frequency | Budget |
|---|---|---|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

### Phase 2: Campaign Structure Assessment

**Goal:** Evaluate the funnel architecture — TOF/MOF/BOF split, budget allocation, and structural efficiency.

1. **Classify each campaign by funnel position:**
   - **TOF (Top of Funnel):** Prospecting/cold audiences, ASC campaigns, broad targeting, awareness campaigns
   - **MOF (Middle of Funnel):** Engagement-based retargeting, video viewers, page engagers, content consumers
   - **BOF (Bottom of Funnel):** Website retargeting, cart abandoners, past purchasers, email list targets

2. **Calculate funnel budget split:**
   - What % of spend goes to TOF vs. MOF vs. BOF?
   - Healthy benchmark: 60-70% TOF, 10-20% MOF, 15-25% BOF (varies by maturity)
   - If BOF > 30% of spend, flag over-investment in retargeting
   - If TOF < 50%, flag insufficient prospecting (the pipeline will dry up)

3. **ASC-specific assessment (if ASC campaigns exist):**
   - Is the existing customer budget cap set? What percentage? (Target: 25-30%)
   - If cap not set or >50%, flag — ASC is likely retargeting, not prospecting
   - How many ad sets within ASC? (Should be consolidated: 1-2 max)
   - Creative count per ad set — minimum 8-15 genuinely diverse concepts
   - Is this the primary prospecting vehicle or a supplementary campaign?

4. **Campaign consolidation check:**
   - Are there multiple campaigns targeting overlapping audiences? (Causes self-competition and inflates CPMs)
   - Could campaigns be consolidated into fewer structures?
   - Per andromeda.md: consolidation (1-2 ad sets with diverse creative) beats fragmentation (5+ ad sets with narrow audiences). Flag fragmented structures.

5. **Budget allocation efficiency:**
   - Are any campaigns budget-limited while performing above ROAS targets? (Leaving money on the table)
   - Are any campaigns overspending relative to performance?
   - Does budget allocation match funnel needs?

**Key signals to tag per campaign:**
- `budget_limited` — delivery shows "Learning Limited" or budget constrained
- `above_target_roas` — actual ROAS exceeds account target
- `below_target_roas` — actual ROAS below target
- `learning_limited` — not exiting learning phase (insufficient conversion volume)
- `high_frequency` — frequency exceeds 3.0 on prospecting or 8.0 on retargeting
- `creative_fatigue` — CTR declining while frequency rising
- `audience_saturation` — reach plateaued, CPM rising, frequency climbing
- `asc_no_cap` — ASC campaign without existing customer budget cap
- `asc_high_cap` — ASC existing customer cap >50%
- `fragmented_structure` — multiple ad sets or campaigns targeting overlapping audiences
- `retargeting_heavy` — BOF spend >30% of total
- `low_creative_count` — fewer than 8 creatives in an ad set

### Phase 3: Creative Performance & Fatigue Analysis

**Goal:** Assess creative health — what's working, what's fatigued, and what format/angle gaps exist.

Follow `reference/creative-checklist.md` for the full checklist. Key steps:

1. **Navigate to ad-level view.** For each active campaign, drill into ad sets → ads. Customize columns for creative metrics (see `reference/nav-meta.md` for column setup).

2. **Extract per-ad metrics for top-spending ads (top 15-20 by spend):**
   - Ad name, format (image/video/carousel/collection), spend, impressions, reach, frequency
   - CTR, CPC, CPM, purchases, CPA, ROAS
   - For videos: ThruPlay rate, hook rate (3-sec views / impressions), hold rate (video watches at 50%+ / 3-sec views)
   - Ad copy length, primary text approach (testimonial, benefit-led, problem-solution, etc.)

3. **Creative fatigue detection:**
   - Plot frequency vs. CTR trend for top ads. When CTR drops >20% from peak while frequency rises → fatigued.
   - Check CPA trend: if CPA increased >15% from baseline while downstream CVR is stable → creative issue, not landing page.
   - Per andromeda.md: effective ad lifespan post-Andromeda is 2-3 weeks. Flag any ad running 4+ weeks without refresh.
   - Frequency thresholds: prospecting >3.0/7d = diagnostic trigger, >3.5 = plan refresh, >4.5 = actively broken.

4. **Format performance comparison:**
   - UGC/creator content vs. polished branded content — which has better CPA?
   - Video vs. static image vs. carousel — CPA and CTR by format
   - Short video (<15s) vs. long video (30s+) — hook rates and hold rates
   - Per andromeda.md: UGC outperforms polished 3-5x on conversions. Flag accounts with zero UGC.

5. **Creative diversity assessment (Entity ID clustering):**
   - Are ads genuinely different or just variations of the same concept?
   - Per andromeda.md: 50 slight variations = 1 Entity ID. Need different hooks, angles, formats, and messaging.
   - Count genuinely distinct creative concepts (not just ad count)
   - Flag if all ads share the same hook, angle, or format — Andromeda treats them as one.

6. **Ad copy pattern analysis:**
   - What primary text approaches are being tested? (testimonial, benefit, problem-solution, social proof, urgency)
   - Are headlines varied or repetitive?
   - Is there a clear winning copy angle?

7. **Thumb-stop ratio (if data available):**
   - 3-second video views / impressions. Strong: 25-35%. Below 20% = hook isn't stopping the scroll.

**Record creative data in working notes and tag for the raw_metrics.creative_details section.**

### Phase 4: Audience Quality Assessment

**Goal:** Evaluate targeting strategy, audience overlap, and Advantage+ behavior.

Follow `reference/audience-checklist.md` for the full checklist. Key steps:

1. **Audience structure inventory:**
   - For each ad set, record: targeting type (Advantage+, Broad, Interest, Lookalike, Custom Audience), audience size estimate, geographic targeting, age/gender restrictions
   - Note any audience exclusions in place (purchasers excluded from prospecting? website visitors excluded from TOF?)

2. **TOF/MOF/BOF audience mapping:**
   - TOF: Broad, Advantage+ Audience, broad interest stacks
   - MOF: Video viewers, page engagers, content interactors
   - BOF: Website visitors (7d/14d/30d/90d/180d), add-to-cart, initiate checkout, email lists, past purchasers (for cross-sell)
   - Flag missing segments (e.g., no cart abandoner retargeting, no video viewer retargeting)

3. **Lookalike assessment (if LALs exist):**
   - What seed audiences are used? (purchasers, high-value customers, email list?)
   - What sizes? (1%, 2-3%, 5%+?)
   - Per andromeda.md: broad targeting delivers ~49% higher ROAS vs. lookalikes due to 45% higher LAL CPMs.
   - If account is heavily LAL-dependent, flag the CPM penalty and recommend Advantage+ or broad testing.

4. **Overlap detection:**
   - Are multiple ad sets targeting the same or heavily overlapping audiences?
   - Use Audience Overlap tool (if accessible: Audiences → select 2 audiences → Show Audience Overlap)
   - Overlapping audiences cause self-competition — the advertiser bids against themselves in auction.

5. **Advantage+ Audience behavior:**
   - For Advantage+ campaigns: is the "audience suggestion" (formerly targeting expansion) set to broad or constrained?
   - For ASC: what's the existing customer budget cap? (Check campaign settings)
   - Is Advantage+ actually reaching new prospects or defaulting to warm audiences?
   - Check demographic breakdown: if 80%+ of delivery goes to a narrow age/gender slice despite broad targeting → Andromeda is clustering on creative signals (may need more creative diversity)

6. **Exclusion audit:**
   - Are past purchasers excluded from prospecting? (Should be, or capped via ASC)
   - Are email subscribers excluded from cold prospecting? (Depends on strategy)
   - Are employees/internal users excluded?
   - If no exclusions → flag potential waste on already-converted audiences

**Record audience data for the raw_metrics.audience_details section.**

### Phase 5: Attribution & Tracking Health

**Goal:** Assess CAPI/pixel health, attribution window impact, and data trustworthiness.

**This phase is critical in the post-Jan 2026 environment.** Meta's attribution changes make historical comparison unreliable and reported ROAS potentially misleading.

1. **CAPI / Pixel health check:**
   - Navigate to Events Manager → Data Sources → the pixel → Event Quality tab
   - Record Event Match Quality (EMQ) for Purchase event: target 8+/10 (acceptable minimum 6+)
   - Check event_id parameter: is it present on both Pixel and CAPI events? (Missing event_id causes 80% of dedup failures)
   - Verify deduplication: Test Events → place test order → confirm Purchase fires once, not twice, with Source = "Server"
   - Check fbp (browser cookie) and fbc (click ID) passing to CAPI
   - Note: event name case sensitivity matters ("purchase" vs "Purchase" won't deduplicate)

2. **Shopify CAPI integration status:**
   - Is Shopify's native CAPI integration active?
   - Is Data Sharing set to "Always On"? (Jan 2026 Shopify auto-upgrade may have reverted this to "Optimized")
   - If Meta ROAS dropped suddenly in Jan 2026, this is the first thing to check.

3. **Attribution window assessment (Jan 2026 changes):**
   - Per measurement.md: Meta permanently removed 7-day and 28-day view-through attribution from Ads Insights API on January 12, 2026.
   - March 2026: click-through redefined (only link clicks count), new "engage-through" category (1-day only).
   - **Impact assessment by AOV tier:**
     - Low-consideration / impulse ($0-100): Minimal impact (most convert within 1-day click window)
     - Mid-consideration ($100-200): Moderate impact (10-20% fewer attributable conversions)
     - High-consideration ($200+): Major impact (30-40% fewer attributable conversions)
   - **YoY comparison warning:** If comparing current period to pre-Jan 2026 data, reported ROAS will appear significantly different due to attribution model change, not performance change. Flag this prominently.
   - Check current attribution settings: what window is configured for each campaign?

4. **Conversion event inventory:**
   - Navigate to Events Manager → Data Sources → the pixel → Events
   - Record all events being tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, etc.
   - Which events are optimized for in campaigns?
   - Are there custom events that may be misconfigured?

5. **Platform vs. Shopify reconciliation flag:**
   - Per measurement.md: don't try to reconcile — use MER instead.
   - But DO flag the magnitude of divergence: if Meta claims 2x more purchases than Shopify shows, note the gap.
   - Per measurement.md variance thresholds: within ±20% = normal for Meta. 20-30% = warrants investigation. >30% = tracking problem.

**Severity classification for tracking issues:**
- `critical` — CAPI not configured at all, or EMQ below 4/10, or deduplication completely broken (all ROAS numbers untrustworthy)
- `high` — EMQ below 6/10, Data Sharing reverted to "Optimized", event_id missing on one side, >30% Shopify divergence
- `medium` — EMQ 6-7/10, minor deduplication issues, attribution window misconfigured for AOV tier
- `low` — Missing non-critical events, informational items

### Phase 6: Frequency & Reach Analysis

**Goal:** Diagnose whether the account is hitting frequency ceilings or audience saturation.

1. **Account-level frequency check:**
   - What's the overall account frequency for the date range?
   - Break down by campaign: prospecting frequency vs. retargeting frequency
   - Per scaling-frequency.md thresholds:
     - Prospecting: 3.0/7d = diagnostic trigger, 3.5 = plan refresh, 4.5+ = actively broken
     - Retargeting: 5.0/7d = diagnostic trigger, 6.0 = plan refresh, 8.0+ = actively broken

2. **Frequency vs. CTR trend analysis:**
   - For each major campaign, compare weekly frequency trend to weekly CTR trend
   - The inflection point where frequency rises and CTR drops = that account's true frequency ceiling
   - Per scaling-frequency.md: this is the real diagnostic, not the threshold numbers alone

3. **Creative fatigue vs. audience saturation diagnosis:**
   - Per scaling-frequency.md diagnostic:
     - Frequency rising + CTR dropping + reach stable → Creative fatigue. Fix: new creative.
     - Frequency rising + reach flattening + CPM rising → Audience saturation. Fix: expand audiences.
   - Test: would new creative for the same audience fix it, or does the audience need to change?

4. **Reach analysis:**
   - Total reach vs. estimated audience size — what % of the addressable audience has been reached?
   - If reach is >60% of audience for prospecting campaigns, audience is likely saturated
   - Check reach trend: is it growing or plateauing week-over-week?

5. **Breakdown by placement (if accessible):**
   - Use the Breakdown menu → By Delivery → Placement
   - Record spend and performance by: Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, Audience Network, Messenger
   - Flag any placement consuming >20% of budget with significantly worse performance than others

**Record frequency/reach data in working notes for the findings and raw_metrics sections.**

### Phase 7: Platform Diagnosis

**Goal:** Synthesize all observations into a coherent diagnosis.

Using the data collected in Phases 1-6, determine:

1. **Primary constraint:** What is the single biggest issue or opportunity? Common Meta patterns:
   - Creative fatigue / insufficient creative diversity (most common)
   - Attribution tracking broken (CAPI issues inflating/deflating all numbers)
   - Campaign structure fragmented (too many campaigns competing for the same audience)
   - Retargeting over-investment (BOF consuming disproportionate budget)
   - ASC misconfigured (no customer cap, defaulting to retargeting)
   - Audience saturation (frequency ceilings hit, reach plateaued)
   - Budget-limited on profitable campaigns (leaving money on the table)
   - Learning Limited (insufficient conversion volume per ad set)
   - Post-Jan 2026 attribution confusion (stakeholders reacting to metric shifts, not actual performance changes)

2. **Secondary constraints:** What else matters after the primary issue? Rank by impact.

3. **Opportunities:** Specific, actionable recommendations with:
   - Priority (CRITICAL / HIGH / MEDIUM / LOW)
   - Expected impact (revenue or efficiency estimate)
   - Confidence level (high / medium / low) with reasoning
   - Supporting evidence from the audit

4. **Cross-channel signals:** What requires investigation on other platforms?
   - **Branded search lift:** Is Meta TOF spend correlated with Google branded search volume? (Meta TOF → branded search halo is ~19% lift per studies.) Flag for Google Ads audit.
   - **Email list growth:** Is Meta TOF driving new email subscribers? Check Klaviyo list growth timing vs. Meta spend scaling. Flag for Klaviyo audit.
   - **Audience overlap with Google remarketing:** Are Meta retargeting audiences overlapping with Google Display/Demand Gen remarketing? Both platforms may be claiming the same converters. Flag for Google Ads and GA4 audits.
   - **Attribution overlap:** If Meta-reported ROAS looks great but Shopify revenue doesn't support it alongside Google's claims, flag for synthesizer cross-check.
   - **Landing page / site CVR:** If Meta CTR is healthy but conversion is poor, flag for site-audit-v2.
   - **Platform vs. Shopify divergence magnitude:** Note the gap for synthesizer reconciliation.

5. **Open questions:** What couldn't you answer? What data is missing?
   - COGS/margins (not in Meta)
   - Shopify revenue for MER calculation
   - GA4 attribution comparison
   - Geo-test or incrementality data
   - Creative production capacity (can they produce the volume needed?)
   - Historical data from before Jan 2026 attribution change (for trend context)

### Phase 8: Write Evidence JSON

**Goal:** Produce the final deliverable — a JSON evidence file conforming to the schema.

The evidence file MUST conform to `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`. Key requirements:

1. **`meta` section:** client name, platform = "meta-ads", audit_date, date_range, access_level, depth, auditor_notes (include note about attribution window in effect)
2. **`account_overview`:** Array of labeled_metric objects. Every number has `value` (number), `formatted` (string), `label` (OBSERVED/CALCULATED/etc.), and `source`.
3. **`campaigns`:** Array of campaign objects. Include funnel position (TOF/MOF/BOF) in the `type` field (e.g., "ASC - TOF", "Manual Sales - BOF Retargeting"). Use key_signals tags.
4. **`tracking_health`:** Flags array (severity + evidence) for CAPI/pixel/EMQ issues. Include conversion event inventory.
5. **`findings`:** Discrete observations. Each has title, label, evidence, source (if OBSERVED), significance.
6. **`anomalies`:** Unexpected patterns (e.g., paused campaigns that were profitable, sudden metric shifts around Jan 2026, ASC defaulting to retargeting).
7. **`diagnosis`:** Primary constraint + secondary constraints with evidence_refs.
8. **`opportunities`:** Prioritized actions with expected_impact, confidence, and evidence.
9. **`cross_channel_signals`:** Signals for the synthesizer — branded search lift, email list growth, audience overlap, attribution overlap, site CVR.
10. **`open_questions`:** Unanswered questions with data_needed and what was attempted.
11. **`raw_metrics`:** Full data tables:
    - `campaign_details` — all campaigns with full metric sets
    - `creative_details` — top ads with format, spend, CTR, CPA, hook rate, hold rate
    - `audience_details` — ad set targeting configurations, audience sizes, overlap data
    - `placement_breakdown` — spend and performance by placement
    - `frequency_trend` — weekly frequency and CTR data for trend analysis

**Evidence labeling rules (MANDATORY):**
- `OBSERVED` — pulled directly from Meta Ads Manager UI. Must include `source` field (e.g., "Meta Ads Manager > Campaigns > Totals row (custom columns)").
- `CALCULATED` — derived from observed values. `source` must show formula (e.g., "$45,000 / $12,000 = 3.75x").
- `INFERENCE` — logical conclusion from observed data. Explain reasoning.
- `ASSUMPTION` — not verified. State what was assumed and why.
- `DATA_NOT_AVAILABLE` — attempted but couldn't get data. State what was tried.

**File location:**
- {Agency}: `{Agency}/reports/{Client-Name}/evidence/{Client}_meta-ads_evidence.json`
- {Own Brand}: `{Own-Brand}/reports/evidence/{Own_Brand}_meta-ads_evidence.json`

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
    "auditor_notes": "Attribution window: 1-day view, 7-day click (post-Jan 2026 defaults). [Add any data quality notes.]"
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

### Phase 9: Update Manifest

If an audit manifest exists, update it:
- Set Meta Ads status to `DONE`
- Record the evidence filename
- Record the completion date
- Note the session reference

If no manifest exists, note in working notes that the orchestrator should be run to create one.

---

## Working Notes Protocol

Throughout the audit, maintain `{Client}_meta-ads_audit_notes.md` in the evidence directory. This is your scratchpad — raw observations, intermediate calculations, things to come back to.

**Working notes structure:**
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

The working notes are NOT a deliverable. They exist so the auditor (Claude) can track what's been done and what's remaining, especially if context runs long or the session needs to be resumed.

---

## Benchmark Application

When evaluating metrics, use the playbook thresholds:

### Quick Reference (from benchmarks.md + andromeda.md)

**Account-level:**
- CTR Floor <1.0%, Healthy 1.5-2.5%, Strong 3.0%+
- CPM (purchase objective) Floor >$25, Healthy $10-18, Strong <$10. Retargeting $30-50 is normal.
- CPC Floor >$2.50, Healthy $0.60-1.50, Strong <$0.50
- Blended ROAS Floor <1.5x, Healthy 2.0-3.5x, Strong 4.0x+ (median 1.93x in 2025)

**By funnel position:**
- TOF ROAS Floor <1.0x, Healthy 1.5-2.5x, Strong 3.0x+
- Retargeting ROAS Floor <3.0x, Healthy 4.0-6.0x, Strong 8.0x+ (median 3.6x)

**Creative:**
- Hook rate (3s views / impressions) Floor <20%, Healthy 25-35%, Strong 40%+
- Hold rate (50%+ watched) Floor <30%, Healthy 40-55%, Strong 60%+
- Fatigue: CTR drops >25% from peak while frequency rises = fatigued

**Frequency (per scaling-frequency.md):**
- Prospecting: 3.0/7d = diagnostic trigger, 3.5 = plan refresh, 4.5+ = actively broken
- Retargeting: 5.0/7d = diagnostic trigger, 6.0 = plan refresh, 8.0+ = actively broken

**Learning phase:** Need 50+ optimization events per ad set per week. Below that = Learning Limited.

**Always calculate client-specific targets first:**
- Break-even CPA = AOV x gross margin %
- Target CPA = Break-even CPA x 0.65
- Minimum ROAS = 1 / gross margin %
- Target ROAS = Minimum ROAS x 1.4

If client margins are unknown, use vertical estimates from benchmarks.md and label as ASSUMPTION.

### AOV Tier Adjustments

**AOV $200+ (high-ticket):**
- Expect lower ROAS post-Jan 2026 (30-40% fewer attributable conversions due to removed view-through windows)
- Longer consideration cycles mean more conversions fell outside the now-removed 7-day+ windows
- Reported ROAS may jump from 5.0 to 8.0 simply due to redefinition — not actual improvement
- Proxy event optimization may be appropriate (ATC or IC instead of Purchase for bidding)
- Retargeting windows should be longer (30-90 day audiences)
- Load `high-ticket.md` for full playbook

**AOV <$100 (low-ticket):**
- Minimal attribution impact from Jan 2026 changes (most conversions within 1-day click window)
- Creative fatigue is the primary risk — higher volume means faster burn
- Impulse purchase optimization: speed to checkout matters most
- Free shipping threshold is critical conversion lever
- Load `low-ticket.md` for full playbook

---

## Error Handling & Edge Cases

### Incomplete Data
If you can't access certain data (permissions, UI changes, loading errors):
- Document what was attempted in working notes
- Label the gap as `DATA_NOT_AVAILABLE` in the evidence file
- Note what data is missing in `open_questions`
- Continue the audit with available data — don't halt

### Advantage+ Shopping Campaigns (ASC)
ASC hides most targeting details. You cannot see:
- Detailed audience demographics of who was served
- Exact audience composition (new vs. existing customer split beyond the cap)
- Individual ad set-level targeting (there's only one ad set)
This is a known limitation. Document it in auditor_notes. Evaluate ASC primarily through creative performance, frequency, and the existing customer budget cap setting.

### Very Large Accounts (20+ campaigns)
- Focus detailed analysis on active campaigns consuming >5% of total spend
- Group small campaigns and note them as "long tail" with aggregate metrics
- Still check ALL campaigns for structural issues (fragmentation, overlap, missing exclusions)
- Creative analysis should cover top 15-20 ads by spend

### New / Small Accounts
If the account has <30 days of data or <$5K total spend:
- Note limited data in `meta.auditor_notes`
- Adjust depth to "standard" or "surface"
- Focus on structure, tracking, and creative diversity rather than performance benchmarking
- Flag that performance benchmarks require more data and more conversion volume

### Pre-Jan 2026 vs. Post-Jan 2026 Data
If the date range spans across January 12, 2026:
- Note in auditor_notes that attribution model changed mid-range
- Do NOT compare pre-Jan and post-Jan metrics directly
- If possible, break analysis into two periods and note the attribution shift
- Communicate clearly that metric changes around this date are likely measurement shifts, not performance shifts

---

## Anti-Hallucination Rules

1. **Every number in the evidence file must come from Meta Ads Manager.** No estimates, no "typical" numbers, no recalled benchmarks presented as client data.
2. **If you can't read a metric, say DATA_NOT_AVAILABLE.** Never fill gaps with assumptions silently.
3. **Show your math.** Every CALCULATED metric must show the formula in the `source` field.
4. **Label everything.** If it's an inference, say INFERENCE. If it's an assumption, say ASSUMPTION.
5. **Cross-check totals.** Campaign-level spend should sum to account-level spend (±rounding). If they don't, note the discrepancy.
6. **Don't diagnose tracking issues you didn't verify.** If you suspect CAPI issues but couldn't access Events Manager, label it INFERENCE, not OBSERVED.
7. **Timestamp your observations.** Note the date range and attribution window explicitly for every metric.
8. **Attribution window caveat.** Every ROAS or conversion number must note which attribution window was in effect. Post-Jan 2026 numbers are NOT comparable to pre-Jan 2026 numbers.

---

## Completion Checklist

Before marking the audit complete, verify:

- [ ] Date range was set correctly at the start and maintained throughout
- [ ] Columns were customized to include all required metrics (not using defaults)
- [ ] All active campaigns have metrics recorded with funnel position classified
- [ ] Campaign structure assessed (TOF/MOF/BOF split, budget allocation, ASC settings)
- [ ] Creative performance analyzed for top 15-20 ads (hook rate, hold rate, fatigue signals, format comparison)
- [ ] Creative diversity assessed (Entity ID clustering check — genuinely different concepts?)
- [ ] Audience targeting inventoried (types, sizes, exclusions, overlap)
- [ ] CAPI/pixel health checked (EMQ, deduplication, Data Sharing setting)
- [ ] Attribution window impact assessed and noted (Jan 2026 changes)
- [ ] Frequency and reach analyzed (ceiling detection, fatigue vs. saturation diagnosis)
- [ ] Placement breakdown captured (if accessible)
- [ ] Evidence JSON conforms to the schema (all required fields present)
- [ ] Every OBSERVED metric has a source
- [ ] Every CALCULATED metric shows the formula
- [ ] No numbers were invented or estimated without ASSUMPTION label
- [ ] Cross-channel signals populated (branded search lift, email list growth, audience overlap, attribution overlap)
- [ ] Open questions documented (what couldn't be answered?)
- [ ] Working notes saved to evidence directory
- [ ] Evidence JSON saved to evidence directory
- [ ] Manifest updated (if it exists)
