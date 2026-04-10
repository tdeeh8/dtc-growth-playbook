---
description: Synthesize platform audit evidence into a unified cross-channel report
argument-hint: "[client name]"
---

# /audit-synthesize

Synthesize platform audit evidence files into a unified audit report.

## Usage

```
/audit-synthesize {Client Name}
/audit-synthesize {Client Name} --docx
```

## What It Does

Reads all evidence JSON files for the specified client, detects cross-channel patterns, runs profitability analysis, and generates a unified audit report.

**Default output:** Markdown report saved to `reports/{Client-Name}/`.
**With `--docx` flag:** Word document (reads docx SKILL.md for formatting).

## Auto-Detection

1. Find evidence directory (from manifest or standard path)
2. Scan for `*_evidence.json` files
3. Report: "Found N evidence files: [platforms]. Missing: [platforms per manifest]."
4. Confirm with user before proceeding

## Prerequisites

At minimum, one evidence JSON file. Run `/audit {Client}` to check what's ready. Available platform audits:

- `/audit-google-ads` → Google Ads evidence
- `/audit-meta` → Meta Ads evidence
- `/audit-ga4` → GA4 evidence
- `/audit-klaviyo` → Klaviyo evidence
- `/audit-shopify` → Shopify evidence
- `/audit-site` → Website/CRO evidence
- `/audit-amazon` → Amazon Ads evidence

## Behavior

1. **Locates evidence directory** from manifest or standard path (`reports/{Client-Name}/evidence/`).
2. **Reads all evidence JSON files** in the directory.
3. **Reads the audit manifest** (if it exists) to understand what was planned vs. completed vs. skipped.
4. **Determines report mode:**
   - 1 evidence file → single-platform focused report
   - 2+ evidence files → cross-channel synthesis report
5. **Runs analysis pipeline:**
   - Tracking health assessment (if tracking flags exist)
   - Platform-by-platform findings with benchmark comparisons
   - Cross-channel pattern detection (multi-platform only): attribution overlap, halo effects, cannibalization, budget imbalance, funnel gaps, tracking disconnects
   - Profitability framework (CM1/CM2/CM3 if Shopify data available)
   - Opportunity prioritization
6. **Generates the report** following `reference/report-template.md` structure.
7. **Runs anti-hallucination verification** — every number must trace to an evidence file.
8. **Saves report** and updates manifest.

## Report Structure

1. Executive Summary
2. What Was Audited
3. Accessible vs. Missing (what the report can't tell you)
4. Tracking Health (if issues detected)
5. Findings by Platform
6. Cross-Channel Diagnosis (multi-platform only)
7. Profitability Analysis
8. Prioritized Opportunities
9. Top 5 Actions
10. Tiered Roadmap (Week 1 / Month 1 / Months 2-3)
11. Open Questions

## Context Loading

The skill automatically loads:
- `references/benchmarks.md`
- `references/channel-allocation.md`
- `references/measurement.md`
- Platform-specific playbook chunks for each audited platform
- `protocols/human-voice.md` (for report writing)
- All reference files in `audit-synthesizer/reference/`

## Examples

```
/audit-synthesize Kodiak Leather
→ Auto-detects evidence directory, reads all evidence files
→ Generates markdown report

/audit-synthesize Kodiak Leather --docx
→ Same analysis, outputs as .docx

/audit-synthesize {Client}
→ Works with any client — finds evidence via manifest or standard path
→ Generates report scoped to whatever platforms have evidence
```

## After Running

- Report is saved to the correct department/client folder
- Audit manifest is updated (synthesis complete)
- Verbal summary of top 3-5 findings provided
- Critical actions called out
- Open questions listed for client follow-up
