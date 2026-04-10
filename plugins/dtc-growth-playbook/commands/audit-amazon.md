# /audit-amazon — Amazon Ads + Seller Central Deep Audit

Run a deep Amazon Advertising and Seller Central audit as part of the modular audit system v2. Produces a standardized evidence JSON file for the audit-synthesizer.

## Usage

```
/audit-amazon                     → Start audit, will ask for inputs
/audit-amazon {Own Brand}            → Start audit for {Own Brand}
/audit-amazon {Client Name}       → Start audit for a {Agency} client
```

## What This Command Does

1. **Gathers inputs** — account name, platform access, margin estimate, lookback period, known issues
2. **Extracts data** from Amazon Ads Campaign Manager, Seller Central Business Reports, and Brand Analytics
3. **Diagnoses** platform-level issues: wasted spend, scaling opportunities, structural problems, organic gaps, profitability
4. **Writes evidence JSON** conforming to the v2 schema — the synthesizer uses this to generate reports
5. **Updates the audit manifest** if one exists

## What This Command Does NOT Do

- Generate standalone reports (use `/audit-synthesize` for that)
- Produce XLSX action plans (the synthesizer handles deliverables)
- Cross-channel analysis (the synthesizer does that with all evidence files)

## Prerequisites

- Amazon Ads Campaign Manager accessible in browser
- Seller Central Business Reports accessible in browser
- Brand Analytics accessible (recommended but not required)
- Product margin estimate from the seller

## Invocation

When this command is triggered, load and follow the full instructions in:
`skills/amazon-ads-v2/SKILL.md`

The SKILL.md contains the complete phase-by-phase audit process, evidence JSON schema, anti-hallucination framework, and all reference file loading instructions.

## Quick Phase Reference

| Phase | What | Time |
|-------|------|------|
| 1. Access & Inventory | Confirm platform access, build source inventory | 5 min |
| 2A. Campaign Performance | Extract all campaign metrics from Ads Manager | 10 min |
| 2B. Targeting/Keywords | Extract keyword-level data from Targeting page | 10 min |
| 2C. Seller Central | Sales dashboard, ASIN data, Featured Offer %, TACoS | 10 min |
| 2D. Brand Analytics | Search Query Performance organic ranking data | 5 min |
| 3. Diagnosis | Wasted spend, scaling opps, structural issues, profitability | 10 min |
| 4. Evidence JSON | Build and save standardized evidence file | 5 min |
| 5. Verification | Anti-hallucination checklist | 3 min |
| 6. Manifest + Retro | Update manifest, document learnings | 2 min |

## Output

**Evidence file:** `{Client}_amazon-ads_evidence.json`
**Location:** `{dept}/reports/{Client-Name}/evidence/` ({Agency}) or `{dept}/reports/evidence/` ({Own Brand})
**Working notes:** `{Account_Name}_amazon_audit_notes.md` in the same reports directory

## After This Audit

Run `/audit-synthesize {Client Name}` to generate the final report from all collected evidence files. The synthesizer works with 1 to N evidence files — a single Amazon audit will produce an Amazon-focused report.
