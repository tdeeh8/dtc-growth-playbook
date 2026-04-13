# Audit Synthesizer — Ads-Audit

Reads evidence JSONs from platform audits, detects cross-channel patterns, runs profitability analysis, and generates a unified report. Adapted for the triage-first architecture where GREEN platforms have minimal evidence and RED/YELLOW platforms have deep findings.

---

## Playbook Loading

**Always load:** `reference/playbook/benchmarks.md` — profitability math, platform thresholds.
**Conditional (if workspace playbook available):**
- `channel-allocation.md` — channel roles, halo effects, budget splits (for cross-channel diagnosis)
- `measurement.md` — attribution methodology, MER, reconciliation (for tracking assessment)
- `high-ticket.md` or `low-ticket.md` — based on AOV from Shopify evidence

---

## Step 0: Locate Evidence & Determine Scope

1. Find all `*_evidence.json` files in the client's evidence directory
2. Read the manifest for triage scores (RED/YELLOW/GREEN per platform)
3. Count: how many deep-dived vs summary-only platforms?
4. Select depth: **Quick** (1-2 deep-dived platforms) or **Full** (3+ deep-dived platforms)

If zero evidence files → STOP. Tell user to run an audit first.

**Human voice:** Read `protocols/human-voice.md` if available before writing any client-facing or prospect-facing content (Agency and Prospect departments).

---

## Step 1: Ingest Evidence

For each evidence JSON:
- Parse key fields: `meta`, `account_overview`, `findings`, `diagnosis`, `opportunities`
- Note `meta.triage_score` and `meta.audit_depth` — these determine how much weight each platform gets in the report
- Extract `cross_channel_signals` from each platform
- Collect open questions and tracking health flags

**Data integrity:** Missing/null fields → DATA_NOT_AVAILABLE. Never invent values.

---

## Step 2: What Was Audited vs. Missing

**Audited platforms** — list with triage score, audit depth, date range.

**For GREEN platforms (triage only):**
Note: "Scored GREEN at triage. Account-level metrics reviewed; no deep-dive performed. Hidden issues at campaign/ad level are possible but account-level health indicators were within acceptable ranges."

**For missing platforms** — what the report can't tell you:
- No Shopify → profitability uses estimates, can't validate platform revenue
- No GA4 → no cross-platform attribution reconciliation
- No Meta → can't assess TOF pipeline or Meta → Google halo
- No Google → can't assess demand capture or branded search
- No Amazon → can't assess marketplace channel

---

## Step 3: Cross-Channel Diagnosis (2+ platforms with evidence)

**Read `reference/synthesis/cross-channel-patterns.md` now.** It contains the full detection library with specific procedures, confidence thresholds, and recommendations for each pattern. Do NOT include a pattern unless evidence supports it — the library is a detection guide, not a checklist to fill out.

### Pattern Summary (details in cross-channel-patterns.md)

1. **Attribution Overlap** — platforms claiming same conversions. Over-attribution ratio thresholds.
2. **Halo Effects** — Meta TOF → Google branded search. Never cut a channel without modeling halo.
3. **Cannibalization** — PMax eating branded search. Retargeting overlap across platforms.
4. **Budget Imbalance** — highest-ROI channel constrained while lower-ROI unconstrained.
5. **Funnel Gaps** — where in the funnel things break (creative, website, checkout, retention).
6. **Tracking Disconnects** — GA4/Shopify/platform gaps. Fix tracking BEFORE optimization.

**Pattern interactions matter.** The cross-channel-patterns file includes a matrix showing how patterns reinforce each other (e.g., attribution overlap + budget imbalance = double problem).

For each detected pattern: state it, cite evidence with specific numbers, confidence (HIGH/MEDIUM/LOW), business implication, and recommended action.

---

## Step 4: Profitability Analysis

**Read `reference/synthesis/profitability-framework.md` now.** It contains the complete CM waterfall methodology, COGS estimation by vertical, break-even metrics, "Good ROAS but bad profit" 5-check detection, CAC payback, and LTV:CAC analysis. The quick reference below is for orientation — the framework file is the canonical source.

### Quick Reference (details in profitability-framework.md)

**Break-even CPA** = AOV × Gross Margin %
**Target CPA** = Break-even × 0.65
**Minimum ROAS** = 1 ÷ Gross Margin %
**Target ROAS** = Minimum × 1.4
**MER** = Ecommerce Revenue ÷ Total Marketing Spend

| MER | Rating |
|-----|--------|
| <2.0× | Critical |
| 2.0-3.0× | Struggling |
| 3.0-5.0× | Healthy |
| 5.0-8.0× | Strong |
| 8.0×+ | Excellent |

### Quick mode: Break-even table + MER rating + one paragraph. No CM waterfall.
### Full mode: Run full profitability-framework.md — CM waterfall, "Good ROAS bad profit" checks, campaign-level profitability if data exists.

---

## Step 5: Prioritized Opportunities

Aggregate from all evidence files + cross-channel patterns. Sort: HIGH impact + HIGH confidence + QUICK effort first. Tracking fixes always before optimization.

Each opportunity: action, expected impact, evidence reference, dependencies, priority (CRITICAL/HIGH/MEDIUM/LOW).

---

## Step 6: Generate Report

### Output Format

Ask user before generating: "Want this as a Word doc or markdown?"

**Default by department type:**
- **Agency / Prospect** → DOCX (client-shareable). Read the docx SKILL.md before generating.
- **Brand** → Markdown (internal reference).

Save to `{department}/reports/{Client-Name}/{Client}_audit_report_{date}.{ext}`

### Report Customization

The report structure below is the default. Sections can be excluded based on context:

| Section | Default | When to exclude |
|---|---|---|
| Triage Summary | Always | Never |
| Executive Summary | Always | Never |
| Platform Deep-Dives | Always | Never |
| Healthy Platforms | Always | If zero GREEN platforms |
| Cross-Channel Diagnosis | If 2+ platforms | Single-platform audit |
| Profitability | Always | Never |
| Open Questions | Always | Never |
| Methodology | Always | Never |

If previous audits for this client exist, check if Tanner has expressed preferences about report sections and follow them.

### Report Structure

```
# {Client} — Ads Audit Report
Date: {date} | Platforms: {list} | Lookback: {period}

## Triage Summary
[Table showing RED/YELLOW/GREEN scores per platform with key signal]

## Executive Summary
[2-3 paragraphs. Lead with the biggest finding. No jargon. 2-3 numbers max.]

## Platform Deep-Dives
[One section per RED/YELLOW platform with:
  - Key metrics table (5-6 metrics)
  - Primary constraint (2-3 sentences)
  - Key findings (top 3-5)
  - Campaign/product tables if relevant]

## Healthy Platforms
[1 paragraph per GREEN platform: "Google Ads scored GREEN at triage. Account ROAS of X.X× exceeds the X.X× target. No deep-dive warranted."]

## Cross-Channel Diagnosis
[Detected patterns with evidence. Skip if single platform.]

## Profitability
[Break-even table at minimum. CM waterfall if full mode.]

## Open Questions
[Top 3-4 items requiring client input]

## Methodology
[Data sources, date ranges, triage scoring explanation, evidence labels]
```

### Writing Rules
- Direct language. No hedging.
- Show calculation formulas once per metric.
- RED/YELLOW platforms get detailed analysis; GREEN gets a sentence or two.
- Run human-voice check on all prose if protocol available.

---

## Step 7: Anti-Hallucination Verification

**MANDATORY.**

1. Every metric traces to evidence JSON
2. Re-run all calculations
3. Every data point labeled: OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, or DATA_NOT_AVAILABLE
4. All ASSUMPTIONs listed in Open Questions
5. Cross-check totals: sum of platform spend = MER denominator (±5%)
6. Shopify revenue vs platform-claimed revenue — flag discrepancies
7. No untraceable metrics in report

Fix any failures before delivery.

---

## Step 8: Finalize

1. Save report to correct location
2. Update manifest (mark synthesis complete)
3. Tell user where report is saved
4. 3-5 sentence verbal summary of top findings
5. Call out CRITICAL actions
6. Note open questions
