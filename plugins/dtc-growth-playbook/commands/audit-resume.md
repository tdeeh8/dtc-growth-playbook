---
description: Resume a client audit — reads manifest, shows progress, suggests or runs the next platform
argument-hint: "[client name]"
---

# /audit-resume

Resume a client audit from where you left off.

## Usage

```
/audit-resume                         → Prompts for client name
/audit-resume Kodiak Leather          → Shows status + suggests next
/audit-resume Kodiak Leather run      → Shows status + immediately runs next platform
```

## What This Does

1. Finds the manifest (`{Client}_audit_manifest.md` in evidence directory)
2. Reports: DONE (with dates), NOT STARTED, IN PROGRESS, SKIPPED
3. Suggests next platform per order: Shopify → Google Ads → Meta → Amazon → GA4 → Klaviyo → Website/CRO
4. With `run` flag: immediately loads next platform's SKILL.md and begins audit, passing manifest context

## If No Manifest

"No manifest found. Run `/audit {Client}` to start."

## Execution

Uses orchestrator Step 4 (Progress Check) from `skills/audit-orchestrator/SKILL.md`.
For `run` flag: loads next platform's SKILL.md with manifest context pre-filled.
