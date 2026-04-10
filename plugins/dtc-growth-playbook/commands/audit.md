---
description: Start, resume, or check progress on a client audit
argument-hint: "[client name] [quick]"
---

# /audit

> Start, resume, or check progress on a client audit. Creates the audit manifest, sets up the evidence directory, and tells you which platform audits to run in order.

## Usage

```
/audit                          → Prompts for client name and details
/audit Kodiak Leather           → Starts (or checks status of) audit for Kodiak Leather
/audit Kodiak Leather quick     → Starts with minimal questions (skips optional fields)
/audit-resume Kodiak Leather    → Shortcut to resume an existing audit (see /audit-resume)
```

## What This Command Does

This command is the entry point for the modular audit system v2. It does NOT perform any auditing — it's a planner and progress tracker.

**On first run for a client:**
1. Gathers client info (platforms, AOV, focus areas) via AskUserQuestion
2. Creates the evidence directory at the user-specified path (default: `reports/{Client-Name}/evidence/`)
3. Creates the audit manifest (`{Client}_audit_manifest.md`)
4. Presents the audit plan with suggested platform order

**On subsequent runs for the same client:**
1. Reads the existing manifest
2. Reports which platforms are done, remaining, skipped
3. Suggests the next platform audit to run
4. When all are done, prompts to run `/audit-synthesize`

## Execution Instructions

When this command is invoked, read and follow the full instructions in:
```
skills/audit-orchestrator/SKILL.md
```

That file contains the complete step-by-step logic for both new audits and progress checks.

## Quick Reference: Platform Audit Commands

After the orchestrator sets up the manifest, run these in order:

| Order | Command | Platform | Why This Order |
|-------|---------|----------|----------------|
| 1 | `/audit-shopify` | Shopify | Financial source of truth |
| 2 | `/audit-google-ads` | Google Ads | Usually largest ad spend |
| 3 | `/audit-meta` | Meta Ads | TOF/MOF/BOF + creative |
| 4 | `/audit-amazon` | Amazon Ads | If selling on Amazon |
| 5 | `/audit-ga4` | GA4 | Cross-platform reconciliation |
| 6 | `/audit-klaviyo` | Klaviyo | Email/SMS retention |
| 7 | `/audit-site` | Website/CRO | Benefits from all other data |

Then: `/audit-synthesize` to generate the cross-channel report.

**Resume shortcut:** `/audit-resume {Client}` to pick up where you left off between sessions.

## Key Files

| File | Purpose |
|------|---------|
| `skills/audit-orchestrator/SKILL.md` | Full orchestrator logic |
| `skills/audit-orchestrator/reference/evidence-schema.json` | JSON Schema contract for evidence files |
| `skills/audit-orchestrator/reference/manifest-format.md` | Manifest template and field definitions |
