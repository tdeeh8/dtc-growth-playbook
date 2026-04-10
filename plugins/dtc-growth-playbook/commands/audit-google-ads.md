---
description: Run a deep Google Ads platform audit producing standardized evidence JSON
argument-hint: "[client name]"
---

# /audit-google-ads

Run a deep Google Ads platform audit for a client. Part of the modular audit system v2.

## Usage

```
/audit-google-ads                        → prompts for client name + details
/audit-google-ads Kodiak Leather         → starts audit for Kodiak Leather
/audit-google-ads Kodiak Leather quick   → surface-level audit (structure + tracking only)
```

## What This Does

Opens Google Ads in the browser, extracts all campaign data, assesses conversion tracking health, performs PMax and Search campaign deep dives, evaluates the competitive landscape, and writes a structured JSON evidence file for the audit-synthesizer.

**Output:** `{Client}_google-ads_evidence.json` — NOT a report. The synthesizer generates reports.

## Smart Startup

Before asking for any info, check for an existing manifest:

1. Look for `{Client}_audit_manifest.md` in known evidence directories, or ask user for evidence path
2. **If found:** Read manifest for department, AOV, platform URL, known issues. Pre-fill — don't re-ask. Tell user: "Found manifest. Using [AOV], [platform URL]. Starting audit."
3. **If not found:** Standard setup (AskUserQuestion), or suggest: "Run `/audit {Client}` first for full setup."

## Instructions

1. Read the full skill file: `.claude/skills/google-ads-audit-v2/SKILL.md`
2. Follow the skill instructions exactly — it covers playbook loading, reference file loading, manifest checking, all 9 audit phases, and the evidence JSON schema.
3. Read all reference files in `.claude/skills/google-ads-audit-v2/reference/` before opening the browser.

## Quick Reference: Audit Phases

1. **Access & Inventory** — Get into the account, set date range, catalog campaigns
2. **Campaign Data Extraction** — Detailed metrics for every active campaign
3. **Conversion Tracking Health** — Verify the numbers are trustworthy
4. **PMax Deep Dive** — Asset groups, search terms, branded cannibalization, budget limits
5. **Search Campaign Quality** — Quality Scores, negatives, match types, ad copy
6. **Competitive Landscape** — Auction Insights, impression share gaps
7. **Platform Diagnosis** — Synthesize into primary/secondary constraints + opportunities
8. **Write Evidence JSON** — Final deliverable conforming to evidence-schema.json
9. **Update Manifest** — Mark Google Ads as DONE in the audit manifest

## Requires

- Browser access (Claude in Chrome) to Google Ads
- Google Ads account access for the client
- Playbook chunks: `benchmarks.md`, `google-ads.md`, `measurement.md`
- Conditional: `high-ticket.md` (AOV $200+) or `low-ticket.md` (AOV <$100)

## After This Audit

- **Continue:** `/audit-resume {Client}` — see what's next
- **Report now:** `/audit-synthesize {Client}` — works with 1+ evidence files
- **Check progress:** `/audit {Client}`
