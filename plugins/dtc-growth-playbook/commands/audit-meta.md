---
description: Run a deep Meta Ads platform audit producing standardized evidence JSON
argument-hint: "[client name]"
---

# /audit-meta

Run a deep Meta Ads platform audit for a client. Part of the modular audit system v2.

## Usage

```
/audit-meta                        → prompts for client name + details
/audit-meta Kodiak Leather         → starts audit for Kodiak Leather
/audit-meta Kodiak Leather quick   → surface-level audit (structure + tracking only)
```

## What This Does

Opens Meta Ads Manager in the browser, customizes columns for real metrics, extracts all campaign data, assesses campaign structure (TOF/MOF/BOF), analyzes creative performance and fatigue, evaluates audience quality and overlap, checks CAPI/pixel health, assesses Jan 2026 attribution impact, analyzes frequency/reach dynamics, and writes a structured JSON evidence file for the audit-synthesizer.

**Output:** `{Client}_meta-ads_evidence.json` — NOT a report. The synthesizer generates reports.

## Smart Startup

Before asking for any info, check for an existing manifest:

1. Look for `{Client}_audit_manifest.md` in known evidence directories, or ask user for evidence path
2. **If found:** Read manifest for department, AOV, platform URL, known issues. Pre-fill — don't re-ask. Tell user: "Found manifest. Using [AOV], [platform URL]. Starting audit."
3. **If not found:** Standard setup (AskUserQuestion), or suggest: "Run `/audit {Client}` first for full setup."

## Instructions

1. Read the full skill file: `.claude/skills/meta-ads-audit-v2/SKILL.md`
2. Follow the skill instructions exactly — it covers playbook loading, reference file loading, manifest checking, all 9 audit phases, and the evidence JSON schema.
3. Read all reference files in `.claude/skills/meta-ads-audit-v2/reference/` before opening the browser.

## Quick Reference: Audit Phases

1. **Access & Account Overview** — Get into Ads Manager, customize columns, capture account-level metrics, inventory campaigns
2. **Campaign Structure Assessment** — Classify TOF/MOF/BOF, budget allocation, ASC settings, consolidation check
3. **Creative Performance & Fatigue** — Top ads analysis, hook/hold rates, format comparison, Entity ID diversity, fatigue signals
4. **Audience Quality** — Targeting inventory, LAL assessment, overlap detection, exclusion audit, Advantage+ behavior
5. **Attribution & Tracking Health** — CAPI/EMQ check, deduplication, Shopify Data Sharing, Jan 2026 attribution impact
6. **Frequency & Reach Analysis** — Frequency ceilings, fatigue vs. saturation diagnosis, placement breakdown
7. **Platform Diagnosis** — Synthesize into primary/secondary constraints + opportunities + cross-channel signals
8. **Write Evidence JSON** — Final deliverable conforming to evidence-schema.json
9. **Update Manifest** — Mark Meta Ads as DONE in the audit manifest

## Requires

- Browser access (Claude in Chrome) to Meta Ads Manager
- Meta Ads account access for the client
- Playbook chunks: `benchmarks.md`, `andromeda.md`, `scaling-frequency.md`, `measurement.md`
- Conditional: `creative-testing.md` (creative deep dive), `high-ticket.md` (AOV $200+), `low-ticket.md` (AOV <$100), `tof-strategy.md` (campaign architecture focus)

## Key Gotchas

- **Column customization is mandatory.** Default Ads Manager columns hide critical metrics (ROAS, frequency, hook rate). Customize BEFORE extracting any data.
- **Jan 2026 attribution change.** 7-day and 28-day view-through windows removed. YoY comparisons are misleading. Note attribution window on every metric.
- **ASC hides targeting details.** You can't see detailed audience composition in Advantage+ Shopping campaigns. Evaluate through creative performance, frequency, and the existing customer budget cap.
- **CAPI dedup failures.** Missing event_id causes 80% of dedup issues. Check event_id on both Pixel and CAPI sides.
- **Shopify Data Sharing may have reverted.** Jan 2026 auto-upgrade broke some configs. If Meta ROAS dropped suddenly, check "Always On" setting.

## After This Audit

- **Continue:** `/audit-resume {Client}` — see what's next
- **Report now:** `/audit-synthesize {Client}` — works with 1+ evidence files
- **Check progress:** `/audit {Client}`
