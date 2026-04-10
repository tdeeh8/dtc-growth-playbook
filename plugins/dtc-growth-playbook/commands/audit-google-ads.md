# /audit-google-ads

Run a deep Google Ads platform audit for a client. Part of the modular audit system v2.

## Usage

```
/audit-google-ads                → prompts for client name + details
/audit-google-ads Acme Co → starts audit for Acme Co
/audit-google-ads Acme quick   → surface-level audit (structure + tracking only)
```

## What This Does

Opens Google Ads in the browser, customizes columns for real metrics, extracts all campaign data, assesses campaign structure (Search vs PMax vs Shopping), analyzes Quality Score distribution, evaluates conversion tracking health, reviews audience and targeting quality, checks CAPI/pixel health, assesses Jan 2026 attribution impact, analyzes bid strategy effectiveness, and writes a structured JSON evidence file for the audit-synthesizer.

**Output:** `{Client}_google-ads_evidence.json` — NOT a report. The synthesizer generates reports.

## Instructions

1. Read the full skill file: `../skills/google-ads-v2/SKILL.md`
2. Follow the skill instructions exactly — it covers playbook loading, reference file loading, manifest checking, all 9 audit phases, and the evidence JSON schema.
3. Read all reference files in `../skills/google-ads-v2/reference/` before opening the browser.

## Quick Reference: Audit Phases

1. **Access & Account Overview** — Get into Ads, customize columns, capture account-level metrics, inventory campaigns
2. **Campaign Structure Assessment** — Classify by type (Search, PMax, Shopping), budget allocation, segmentation check
3. **Search Campaign Health** — Quality Score distribution, negative keywords, match type split, ad copy freshness, search term review
4. **PMax Campaign Assessment** — Asset group quality, search term performance, budget-limited detection, diagnostics card
5. **Conversion Tracking & Attribution** — CAPI/pixel health, EMQ, duplicate detection, dead actions, Consent Mode v2, Jan 2026 impact
6. **Cross-Platform Reconciliation** — GA4 vs Google Ads conversion reconciliation, capture rate analysis
7. **Audience & Targeting Quality** — Audience inventory, sizing, seed freshness, signal health
8. **Bid Strategy Assessment** — Strategy type per campaign, target realism, bid adjustments, opportunity detection
9. **Write Evidence JSON** — Final deliverable conforming to evidence-schema.json

## Requires

- Browser access (Claude in Chrome) to Google Ads
- Google Ads account access for the client
- GA4 access for cross-platform reconciliation
- Playbook chunks: `benchmarks.md`, `andromeda.md`, `pmax-strategy.md`, `search-strategy.md`
- Conditional: `high-ticket.md` (AOV $200+), `low-ticket.md` (AOV <$100), `landing-page-strategy.md` (UX focus)

## Key Gotchas

- **Column customization is mandatory.** Default Google Ads columns hide critical metrics (ROAS, Quality Score details, frequency). Customize BEFORE extracting any data.
- **Jan 2026 attribution change.** 7-day and 28-day view-through windows removed. YoY comparisons are misleading. Note attribution window on every metric.
- **PMax hides targeting details.** Diagnose PMax health through creative performance, search term behavior, and diagnostics card — not targeting settings.
- **CAPI dedup failures.** Missing event_id causes duplicate conversions. Check Events Manager Event Quality for Purchase event health.
- **GA4 conversion window differs from Google Ads.** Expected ~70-80% capture due to window differences, not tracking failure.
