# Audit Lifecycle — Shared Reference

> Shared lifecycle for all v2 audit skills. Each skill references this instead of duplicating setup/closeout.

---

## Before You Start — Standard Setup

### 1. Load Playbook Chunks

Always load:
- `reference/playbook/benchmarks.md` — diagnostic thresholds, profitability math

Then load the platform-specific chunks listed in your skill's Phase 0 / setup section.

**AOV-conditional loads** (check manifest or ask user for AOV):

| AOV | Additional Chunk | Focus |
|-----|-----------------|-------|
| >$200 | `reference/playbook/high-ticket.md` | Extended consideration, BNPL, social proof |
| <$100 | `reference/playbook/low-ticket.md` | Impulse funnel, checkout friction, offer structures |
| $100–200 | (standard only) | Standard benchmarks apply |

### 2. Load Skill Reference Files

Read ALL files in this skill's `reference/` directory before opening any browser tabs or making API calls.

### 3. Check for Audit Manifest

Look for an existing manifest:
- **agency clients:** `Agency-Clients/reports/{Client-Name}/evidence/{Client}_audit_manifest.md`
- **In-House Brand:** `In-House-Brand/reports/evidence/In_House_Brand_audit_manifest.md`

**If manifest exists:** Read it for client context (AOV tier, department, platform URLs, known issues, completed audits). Use AOV tier to load conditional playbook chunks.

**If no manifest:** Ask the user for:
- Client name (for evidence file naming)
- Platform account URL or ID
- AOV (approximate — for benchmark tier)
- Department (Agency-Clients or In-House-Brand)
- Known issues or focus areas
- Date range preference (default varies by platform)

### 4. Set Up Evidence Directory

Ensure the directory exists:
- **Disruptive:** `Agency-Clients/reports/{Client-Name}/evidence/`
- **In-House Brand:** `In-House-Brand/reports/evidence/`

---

## After the Audit — Standard Closeout

### 1. Save Evidence JSON

Save `{Client}_{platform}_evidence.json` to the evidence directory.

### 2. Update Manifest

If an audit manifest exists, update it:
- Set `{platform}` status to `DONE`
- Record the evidence filename
- Record the completion date
- Note the session reference

If no manifest exists, note in working notes that the orchestrator should be run to create one.

### 3. Flag Critical Issues

If any finding has severity `critical`, surface it to the user immediately — don't wait for the synthesizer.

### 4. Save Working Notes

Save `{Client}_{platform}_audit_notes.md` to the evidence directory. This is the audit trail, not a deliverable.

---

## Working Notes Template

Create `{Client}_{platform}_audit_notes.md` at audit start:

```markdown
# {Client} — {Platform} Audit Notes

**Date:** YYYY-MM-DD
**Account:** [URL or ID]
**Date Range:** [period]
**Extraction Method:** [MCP API / Browser / Both]

## Phase-by-Phase Findings
[Add sections matching your skill's phase structure]

## Anomalies and Surprises
[Unexpected patterns — document immediately when noticed]

## Hypotheses to Test
[Questions raised during audit that need cross-platform validation]

## Parking Lot
[Things noticed but not yet categorized]
```

Working notes are NOT a deliverable. They exist for:
- Tracking progress within a long audit
- Session handoff if context gets long
- Audit trail for quality control
- Retrospective learning
