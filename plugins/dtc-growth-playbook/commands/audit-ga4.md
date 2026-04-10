# /audit-ga4

Run a deep GA4 analytics audit for a client. Produces a standardized JSON evidence file for the audit-synthesizer.

## Usage

```
/audit-ga4
/audit-ga4 {Client Name}
```

## What This Command Does

Opens GA4 in the browser and systematically extracts:

1. **Account overview** — users, sessions, revenue, CVR, AOV, engagement rate
2. **Traffic acquisition** — source/medium breakdown with CVR per source
3. **Conversion funnel** — sessions → product views → ATC → checkout → purchase (with drop-off rates)
4. **Landing page performance** — top pages by traffic, CVR, and revenue
5. **Device/platform split** — mobile vs desktop CVR gap, browser-specific tracking gaps
6. **Cross-platform attribution comparison** — GA4-attributed conversions vs what each ad platform claims
7. **Event tracking validation** — are all required ecommerce events firing correctly?
8. **Attribution model check** — which model is active, is data-driven actually working?

Output: `{Client}_ga4_evidence.json` saved to the client's evidence directory.

## Before Running

### Required Context

- **GA4 property access** — need at least read access to the correct GA4 property
- **Audit date range** — default is last 90 days, or match whatever other platform audits used
- **Client name** — for file naming and manifest lookup

### Automatic Context Loading

When this command runs, the skill automatically loads:

1. `ga4-audit-v2/SKILL.md` — full audit procedure
2. `ga4-audit-v2/reference/nav-ga4.md` — GA4 navigation patterns (CRITICAL — read before touching GA4)
3. `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` — website/ecom conversion benchmarks
4. `${CLAUDE_PLUGIN_ROOT}/references/measurement.md` — source-of-truth stack, GA4 limitations, reconciliation thresholds

### Check for Manifest

Look for an existing `{Client}_audit_manifest.md` in:
- `{Agency}/reports/{Client-Name}/evidence/`
- `{Own-Brand}/reports/evidence/`

If found, read it for client context (AOV tier, business type, focus areas, which other audits are done). Use the same date range as other completed audits.

## Procedure

Follow the 9-phase procedure in SKILL.md:

1. **Access & Setup** — open GA4, set date range, verify property
2. **Account Overview** — top-level metrics
3. **Traffic Acquisition** — source/medium breakdown
4. **Conversion Funnel** — step-by-step funnel in Explore
5. **Landing Pages** — page-level performance
6. **Device/Platform Split** — mobile vs desktop, browser analysis
7. **Cross-Platform Attribution** — GA4 vs ad platform comparison
8. **Event Tracking Validation** — ecommerce event inventory
9. **Attribution Model Check** — verify active model

## Output

### Evidence File

**Filename:** `{Client}_ga4_evidence.json`
**Location:** Client evidence directory
**Schema:** Follows `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`

Key sections:
- `meta.platform`: `"ga4"`
- `account_overview`: Top-level GA4 metrics
- `tracking_health`: Event validation results, cross-domain status
- `findings`: Behavioral and attribution observations
- `cross_channel_signals`: **Most important for GA4** — platform attribution gaps, Shopify reconciliation, source anomalies
- `raw_metrics`: Full tables (source/medium, landing pages, funnel, device, events, attribution comparison)

### Manifest Update

If an audit manifest exists, update:
- GA4 row → Status: `DONE`
- Evidence File: `{Client}_ga4_evidence.json`
- Date Completed: today's date

## Critical Reminders

- **NEVER use the default 7-day view.** Change the date range FIRST before extracting any data.
- **GA4 is NOT the revenue source of truth.** Shopify is. GA4 under-reports by 10-15% normally.
- **GA4's unique value is cross-platform comparison.** Spend extra time on Phase 7 (attribution comparison). This is what the synthesizer needs most from GA4.
- **Flag tracking problems immediately.** If purchase events are missing, cross-domain is broken, or GA4 revenue is >30% below Shopify, these are CRITICAL findings that affect all other audits.
- **Use Explore for funnels.** The Reports section doesn't have proper funnel analysis. You must use Explore → Funnel exploration.
- **Check for data sampling.** Green shield = unsampled (good). Yellow shield = sampled (note in auditor_notes, narrow date range if possible).
- **Record every number's source.** Every OBSERVED metric needs a source path: "GA4 > Reports > Acquisition > Traffic acquisition > Sessions column"
