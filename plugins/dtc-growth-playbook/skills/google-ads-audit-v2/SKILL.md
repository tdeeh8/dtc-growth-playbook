# /audit-google-ads

Run a deep Google Ads account audit for a client. Part of the modular audit system v2.

## Usage

```
/audit-google-ads                → prompts for client name + details
/audit-google-ads Acme Co → starts audit for Acme Co
/audit-google-ads Acme quick   → surface-level audit (structure + tracking only)
```

## What This Does

Opens Google Ads in the browser, extracts campaign and ad data systematically, assesses campaign structure (Search vs PMax), evaluates Quality Score distribution, analyzes conversion tracking health, reviews audience and targeting strategy, detects bid strategy misconfigurations, identifies conversion tracking issues (duplicates, dead actions, CAPI health), checks Jan 2026 attribution window impact, and writes a structured JSON evidence file for the audit-synthesizer.

**Output:** `{Client}_google-ads_evidence.json` — NOT a report. The synthesizer generates reports.

## Instructions

1. Load the skill and all required reference files
2. Read the full playbook sections specified below before opening the browser
3. Load the audit manifest from the client folder — check what's already done
4. Follow the 9-phase audit procedure exactly as specified
5. Use the reference files to extract data from the UI and populate the evidence JSON
6. Write the evidence JSON file matching the schema
7. Update the manifest when complete

## Phase Checklist

### Phase 1: Access & Account Overview
- Get into Google Ads, select the correct account
- Take account-level screenshot for evidence
- Extract key metrics: total spend, total conversions, blended CPA, blended ROAS
- Inventory all active campaigns by type (Search, PMax, Shopping, Display, etc.)
- Check for Multi-Account Structure (MAS) or Tag Manager usage
- Record timezone, currency, conversion tracking setup type (Pixel, CAPI, both)

### Phase 2: Campaign Structure Assessment
- Classify campaigns: branded vs non-branded, product categories, high-intent vs awareness
- Calculate budget allocation across campaign types
- Flag: Single campaign per product (scaling lock), over-consolidation (targeting dilution), isolated test campaigns
- For Search: check if branded/non-branded are segmented (required for bid strategy analysis)
- For PMax: check if there's a single mega-campaign (inflexible) or multi-PMax structure (better for testing)
- Record in working notes table: Campaign name, type, status, budget, recent spend, conversions, CPA, ROAS

### Phase 3: Search Campaign Health
- Open each Search campaign
- Use the reference/nav-google.md patterns to extract: Quality Score distribution, negative keyword count, match type split (Exact vs Broad vs Phrase)
- For each ad group: record count, avg Quality Score, ad copy freshness (when was the last RSA added?)
- Check: Are branded and non-branded ad groups in the same campaign? (Flag if yes — should be separate)
- Review search term reports: Are there high-spend irrelevant terms? Missing negatives?
- Bid strategy check: Manual CPC, Tgt CPA, Tgt ROAS, or Maximize Conversions? Is the strategy appropriate for campaign maturity?

### Phase 4: PMax Campaign Assessment
- Open each PMax campaign
- Use reference/pmax-checklist.md to assess:
  - Asset group count and quality (required vs optional assets present?)
  - Search term performance (are search terms being triggered? or is it purely audience/intent matching?)
  - Budget-limited detection (daily budget causing delivery cap?)
  - Audience signal health (logged-in, recent purchase, etc.)
  - URL expansion status (how many auto-generated headlines/descriptions active?)
  - Performance diagnostic card: any warnings or paused recommendations?
- Legacy Smart Shopping detection: if campaign was migrated from Smart Shopping, check for manual URL optimization override (should be removed for Andromeda optimization)
- Record: Campaign name, asset groups count, feed health (if applicable), ROAS, CPA, conversion volume

### Phase 5: Conversion Tracking & Attribution
- Open Events/Conversions in Google Ads settings
- Use reference/tracking-checklist.md to assess:
  - Conversion action inventory: which actions exist, what are they tracking?
  - Duplicate purchase event detection: does the account have multiple Purchase events? (High risk of double-counting)
  - Dead conversion actions (created but never tracked): any actions with zero conversions in the audit period?
  - Enhanced Conversions status: is it enabled? What's the match rate?
  - Consent Mode v2: what's the implementation status?
  - Proxy event optimization: are there backup/proxy events if the primary event fails?
  - Shopify Checkout Extensibility impact: if applicable, are post-purchase pixels still firing? (Shopify CXE may block them)
  - Attribution window: current window setting. If account was active before Jan 2026, note that historical window data is no longer available
  - Event Match Quality (EMQ): check CAPI connection in Events Manager. EMQ score 8+/10 is healthy
  - Conversion value accuracy: are values being passed correctly? Sample a few conversions
- Record in working notes: Conversion action name, type, status, count (audit period), last 30d trend, EMQ (if CAPI)

### Phase 6: Cross-Platform Reconciliation
- Pull GA4 data for the same period: sessions, users, transactions, revenue
- Pull Google Ads data: clicks, conversions, conversion value
- Reconcile: Google Ads conversions vs GA4 transactions (expected ~70-80% capture in Ads due to attribution window differences)
- Check for major discrepancies: >20% gap = investigate tracking issue
- Note timezone differences between GA4 and Google Ads (may explain 1-2% daily variance)
- Record reconciliation: Ads conversions vs GA4 purchases, capture rate %, notes on discrepancies

### Phase 7: Audience & Targeting Quality
- Inventory all audience types in use: Affinity, In-Market, Detailed Demographics, Custom Intent, Lookalike, Customer Match
- For each: size, performance (if available), age/freshness of seed data
- Check: Are broad match keywords paired with audience exclusions? (Mitigates broad match risk)
- Search campaigns: are they using Audience Segments for "observation" or "targeting"? (Recommend observation for Search)
- PMax campaigns: check logged-in audience signals and recent purchase signals health
- Record: Audience name, type, size, ROAS/CPA (if performance data available), source/seed

### Phase 8: Bid Strategy Assessment
- Summarize bid strategy by campaign type and maturity:
  - Search: Manual CPC → Tgt CPA → Tgt ROAS (maturity progression)
  - PMax: Typically Maximize Conversions or Tgt ROAS
  - Shopping: Usually Minimize cost-per-sale (Tgt CPA equivalent)
- For each strategy type: check if the threshold (CPA target, ROAS target) is realistic given recent performance
- Flag: Tgt CPA higher than actual recent CPA = algorithm has room to spend more (may improve volume)
- Flag: Tgt ROAS lower than recent ROAS = algorithm is conservative (opportunity to raise target)
- Check: Bid adjustments at device, location, time-of-day, audience level. Are they aligned with performance?
- Record: Campaign, bid strategy, targets, recent actual performance, adjustment observations

### Phase 9: Write Evidence JSON
- Conform to ${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json
- Structure:
  - `account_id`, `account_name`, `audit_date`, `auditor_notes`
  - `raw_metrics`: `account_overview` (spend, conversions, CPA, ROAS), `campaign_structure`, `search_campaigns`, `pmax_campaigns`, `conversion_tracking`, `audiences_targeting`
  - `findings`: array of evidence objects (see schema), each with `title`, `label` (OBSERVED/CALCULATED/INFERENCE), `evidence`, `source`, `significance`
  - `open_questions`: data needed but not available from Ads
  - `audit_status`: completion checklist

---

## Working Notes Template

Maintain a working notes file throughout the audit to track raw data extraction:

```
# Google Ads Audit - {Client Name}
**Audit Period:** {start} to {end}
**Account ID:** {id}
**Auditor:** Claude
**Date Created:** {today}

## Account Overview
- Total Spend (audit period): $X
- Total Conversions: X
- Blended CPA: $X
- Blended ROAS: Xx
- Timezone: UTC / {TZ}
- Currency: USD / {currency}
- Conversion Tracking: Pixel / CAPI / Both

## Campaign Inventory
| Campaign | Type | Status | Budget | Spend | Conv | CPA | ROAS |
|---|---|---|---|---|---|---|---|
| ... | Search/PMax/Shopping | Active | $ | $ | X | $ | x |

## Search Campaign Health
| Campaign | Ad Groups | Avg QS | Match Types | Branded? | Notes |
|---|---|---|---|---|---|

## PMax Campaigns
| Campaign | Asset Groups | Search Terms? | Diagnostics | Budget-Limited? | ROAS | CPA |
|---|---|---|---|---|---|---|

## Conversion Tracking
| Action | Type | Count | EMQ | Status | Notes |
|---|---|---|---|---|---|

## GA4 Reconciliation
- GA4 sessions (period): X
- GA4 transactions: X
- Ads conversions: X
- Capture rate: X%
- Notes: ...

## Audiences
| Audience | Type | Size | ROAS | Source |
|---|---|---|---|---|
| ... | ... | X | x | ... |

## Bid Strategy Summary
| Campaign Type | Strategy | Target | Recent Actual | Status |
|---|---|---|---|---|
| Search | Tgt CPA | $X | $X | {on/below/above target} |

## Open Questions
- ...
```

---

## Requires

- Browser access (Claude in Chrome) to Google Ads
- Google Ads account access with Editor access (minimum)
- GA4 access for cross-platform reconciliation
- Playbook chunks: `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md`, `${CLAUDE_PLUGIN_ROOT}/references/andromeda.md`, `${CLAUDE_PLUGIN_ROOT}/references/pmax-strategy.md`, `${CLAUDE_PLUGIN_ROOT}/references/search-strategy.md`
- Reference files: nav-google.md, search-checklist.md, pmax-checklist.md, tracking-checklist.md (all in this skill folder)
- Audit manifest (client folder) to track completion status
- Evidence JSON schema: ${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json

## Key Gotchas

- **Column customization is mandatory.** Google Ads default columns hide critical metrics (Quality Score, match type distribution, bid adjustments). Customize columns BEFORE extracting data.
- **Jan 2026 attribution window change.** If account was active before Jan 2026, historical data viewed in Google Ads NOW shows the current attribution window (7-day click or 1-day click + 1-day view). YoY comparisons are misleading. Always note the attribution window on every metric pulled from Ads.
- **PMax Search Terms report is hidden by default.** Use the reference/nav-google.md pattern to unhide it. If search terms are blank or very low volume, PMax is defaulting to audience/intent matching instead of search optimization.
- **Quality Score is ad group level, not keyword level.** You can't drill into individual keyword Quality Scores in the modern UI. You must use the ad group report and estimate keyword QS from the distribution.
- **GA4 conversion window differs from Google Ads attribution window.** GA4 defaults to last-click, 30-day window (for web). Google Ads may use 7-day click + 1-day view. Reconciliation will show ~70-80% capture due to window differences, not tracking failure.
- **CAPI deduplication requires event_id on both Browser and Server events.** If your account has CAPI connected but Purchase events fire twice (duplicate), check that event_id is being passed on both sides.
- **PMax campaigns can't be edited for granular audience or targeting details.** You diagnose PMax health through creative performance, search term behavior, and the diagnostics card, not through targeting settings.
