---
name: audit-synthesizer
description: "Read all platform evidence JSON files and generate a unified cross-channel audit report. Detects attribution overlap, halo effects, cannibalization, budget imbalance, and funnel gaps. Applies MER/CM1/CM2/CM3 profitability framework. Triggers on: 'synthesize the audit', 'generate the audit report', 'cross-channel analysis', 'combine audit findings', 'run the synthesizer'."
---

# Audit Synthesizer

Cross-channel synthesis engine for the Modular Audit System v2. Reads all evidence JSON files produced by platform audit skills, detects cross-channel patterns, runs profitability analysis, and generates a unified audit report.

**Trigger phrases:** "synthesize the audit", "generate the audit report", "cross-channel analysis for [client]", "combine the audit findings", "write up the audit", "finalize the audit"

---

## When This Skill Activates

This skill runs AFTER one or more platform audit skills have produced evidence JSON files. It is the final step in every audit workflow — single-platform or multi-platform.

**Prerequisites:**
- At least one `{Client}_{Platform}_evidence.json` file exists in the client's evidence directory
- An audit manifest (`{Client}_audit_manifest.md`) should exist (created by audit-orchestrator), but the synthesizer can operate without one if invoked directly

**This skill ALWAYS generates a report.** Every run, no exceptions. Even if only one evidence file exists, the synthesizer produces a focused platform report.

---

## Context Loading

**Always load these playbook chunks:**
- `references/benchmarks.md` — diagnostic thresholds, profitability math
- `references/channel-allocation.md` — channel roles, halo effects, budget strategy
- `references/measurement.md` — attribution, MER, reconciliation, tracking validation

**Conditionally load (for platforms that were audited):**
- `references/google-ads.md` — if Google Ads evidence exists
- `references/andromeda.md` — if Meta Ads evidence exists
- `references/email-sms.md` — if Klaviyo evidence exists
- `references/high-ticket.md` — if AOV $200+ (from manifest or Shopify evidence)
- `references/low-ticket.md` — if AOV <$100

**Always load these reference files (this skill):**
- `reference/report-template.md` — report structure
- `reference/cross-channel-patterns.md` — pattern detection library
- `reference/anti-hallucination.md` — verification checklist
- `reference/profitability-framework.md` — CM1/CM2/CM3 methodology

**If user explicitly requests DOCX output:**
- Also read the docx SKILL.md (`skills/docx/SKILL.md`) for formatting instructions

**Human voice check:**
- Read `protocols/human-voice.md` before writing any client-facing report content

---

## Step 0: Locate Evidence Files

1. Determine the client name from the user's request or the active manifest.
2. Determine the evidence directory:
   - Disruptive clients: `{evidence_dir}/`
3. List all `*_evidence.json` files in that directory.
4. Read the audit manifest if it exists (`{Client}_audit_manifest.md`).
5. Count evidence files. This determines the report mode:
   - **1 file** → Single-Platform Report mode
   - **2+ files** → Cross-Channel Synthesis mode

If zero evidence files are found, STOP. Tell the user: "No evidence files found for {Client}. Run at least one platform audit first (e.g., /audit-google-ads)."

---

## Step 1: Ingest All Evidence

For each evidence JSON file:

1. **Parse the JSON.** Validate it has the required top-level keys: `meta`, `account_overview`, `findings`, `diagnosis`, `opportunities`.
2. **Extract the meta block.** Note: client name, platform, audit date, date range, access level, depth.
3. **Build the platform summary.** From `account_overview`, extract the headline metrics (spend, revenue, ROAS/ACOS, CPA, conversions).
4. **Catalog all findings.** Each finding has a `title`, `label`, `evidence`, and `significance`.
5. **Catalog all opportunities.** Each has `action`, `priority`, `expected_impact`, `confidence`, `evidence`.
6. **Collect cross-channel signals.** These are flags from platform skills saying "check this against other platforms."
7. **Collect open questions.** Unresolved data gaps that affect analysis confidence.
8. **Note tracking health issues.** If `tracking_health.flags` exist, these feed into the Tracking Health section.

**Data integrity rule:** If a field is missing or null in the JSON, note it as DATA_NOT_AVAILABLE. Never invent a value. Never silently skip it.

---

## Step 2: Determine What Was Audited vs. Missing

Using the manifest (if available) and the evidence files found:

1. **Audited platforms:** List every platform with an evidence file. Note date range and depth for each.
2. **Skipped platforms:** From the manifest, list platforms marked SKIPPED with their reason.
3. **Not started:** From the manifest, list platforms marked NOT_STARTED.
4. **Unknown:** If no manifest exists, note that the full audit scope is unknown — only the platforms with evidence files can be analyzed.

**Generate the "What This Report Cannot Tell You" list:**
- No Shopify evidence → "Profitability analysis uses ASSUMPTION-labeled estimates. We cannot validate platform-reported revenue against actual orders."
- No GA4 evidence → "Cross-platform attribution reconciliation is not possible. We cannot compare platform claims against an independent behavioral source."
- No Meta evidence → "Cannot assess TOF pipeline health or Meta → Google halo effects."
- No Google evidence → "Cannot assess demand capture efficiency or branded search investment."
- No Klaviyo evidence → "Cannot assess retention engine or email/SMS contribution to revenue."
- No site/CRO evidence → "Cannot assess post-click conversion path quality."
- Single platform only → "Cross-channel pattern detection is not possible with only one platform audited."

---

## Step 3: Tracking Health Assessment

**Run this step if ANY evidence file contains a `tracking_health` section with flags.**

1. Aggregate all tracking flags across platforms. Sort by severity (high → medium → low).
2. Check for cross-platform tracking disconnects:
   - If both GA4 and Shopify evidence exist: compare transaction counts. Flag if gap >15%.
   - If platform evidence + GA4 exist: compare platform conversions to GA4. Flag if gap >25%.
   - If platform evidence + Shopify exist: compare platform conversions to Shopify orders. Flag if gap >30%.
3. Check for duplicate tracking signals (multiple conversion actions for same event).
4. Check EMQ scores (Meta) — flag if below 6/10.
5. Check Enhanced Conversions status (Google) — flag if not enabled.

**If high-severity tracking issues exist, add a prominent warning at the top of findings:**
"⚠️ Tracking issues detected. Performance metrics below may be inflated or understated. Fix tracking before making budget decisions."

Reference thresholds from `measurement.md` → Tracking Validation → Purchase Count Reconciliation.

---

## Step 4: Platform-by-Platform Findings

For each platform with an evidence file, generate a findings section:

1. **Headline metrics table** — pulled directly from `account_overview`. Show metric, value, and benchmark comparison (from `benchmarks.md`). Use the three-tier system: Floor / Healthy / Strong.
2. **Primary constraint** — from `diagnosis.primary_constraint`. This is the single biggest lever for improvement on this platform.
3. **Key findings** — from `findings[]`. Group by theme if >5 findings. Each finding must show:
   - What was observed (with label: OBSERVED, CALCULATED, INFERENCE)
   - Why it matters (significance)
   - The evidence trail (source reference)
4. **Anomalies** — from `anomalies[]`. Unusual patterns that warrant investigation.
5. **Platform-specific opportunities** — from `opportunities[]`. Sorted by priority (HIGH → MEDIUM → LOW).

**Benchmark comparison rules:**
- Always calculate client-specific thresholds first (break-even CPA, minimum ROAS) from profitability math before comparing to industry benchmarks.
- Show both: "CPA is $45 vs. $32 break-even (client-specific) and $38 industry median."
- If client-specific thresholds aren't calculable (no margin data), use industry benchmarks and label as ASSUMPTION.

---

## Step 5: Cross-Channel Diagnosis (Multi-Platform Only)

**This step ONLY activates when 2+ evidence files exist.** Skip entirely for single-platform reports.

Load `reference/cross-channel-patterns.md` and systematically check each pattern category:

### 5a. Attribution Overlap
- Sum platform-reported conversions across all platforms.
- Compare to Shopify actual orders (if Shopify evidence exists).
- Calculate over-attribution ratio: `sum of platform conversions / Shopify orders`.
- Calculate MER: `Shopify revenue / total spend across all platforms`.
- Flag if over-attribution ratio > 1.5x (platforms claiming 50%+ more conversions than actually happened).
- Flag if MER is declining while individual platform ROAS is stable or rising (attribution inflation signal).

### 5b. Halo Effects
- Check cross_channel_signals from each platform's evidence for halo mentions.
- If Meta TOF + Google branded search both exist: compare branded search volume trend to Meta prospecting spend trend.
- If Klaviyo + Google exist: check if email engagement metrics correlate with branded search ROAS.
- If Meta/TikTok TOF + Klaviyo exist: check email list growth rate against paid acquisition volume.

### 5c. Cannibalization
- If Google Ads evidence shows PMax + branded search: check for PMax eating branded traffic (search term categories).
- If Meta retargeting + Klaviyo exist: check for audience overlap in retargeting.
- If multiple platforms show the same high-value converters: flag multi-platform attribution stacking.

### 5d. Budget Imbalance
- Rank channels by efficiency metric (platform ROAS or CPA vs. target).
- Flag if the highest-ROI channel is budget-constrained while a lower-ROI channel is unconstrained.
- Flag if branded/retargeting spend exceeds 30% of total while prospecting channels are limited.
- Check channel allocation against `channel-allocation.md` stage-appropriate splits.

### 5e. Funnel Gaps
- Map the full funnel: impression → click → site visit → product view → ATC → checkout → purchase.
- Identify where the biggest drop-off occurs.
- Cross-reference: high traffic quality (good CTR, low CPC) + low site CVR → website problem.
- Cross-reference: good site CVR + poor ad CTR → creative/targeting problem.
- Cross-reference: strong acquisition + no retention program → LTV leak.

### 5f. Tracking Disconnects
- Compare conversion counts across platforms for the same date range.
- Flag if GA4 vs Shopify gap >15%.
- Flag if any platform vs GA4 gap >25%.
- Check for sudden conversion drops coinciding with known platform changes (Meta Jan 2026 attribution changes, Shopify Checkout Extensibility Aug 2025).

**Cross-channel diagnosis output:** For each detected pattern, write:
- **Pattern name** (e.g., "Attribution Overlap")
- **Evidence** — specific numbers from specific evidence files
- **Confidence** — HIGH (clear data), MEDIUM (directional signal), LOW (suggestive but insufficient data)
- **Implication** — what this means for the business
- **Recommended action** — what to do about it

---

## Step 6: Profitability Analysis

Load `reference/profitability-framework.md`.

### When Shopify evidence exists (preferred path):
Shopify is the financial source of truth. Use actual revenue, order count, and AOV.

1. **Calculate MER:** Shopify total revenue / sum of all platform spend.
2. **Calculate blended CPA:** Total spend / Shopify order count.
3. **Calculate blended ROAS:** Shopify revenue / total paid ad spend.
4. **If COGS available (from Shopify evidence or client-provided):**
   - Calculate CM1 (product margin): Revenue - COGS
   - Calculate CM2 (fulfillment margin): CM1 - shipping - packaging - fulfillment
   - Calculate CM3 (marketing-inclusive margin): CM2 - total marketing spend - payment processing - estimated returns
   - Calculate break-even CPA: AOV × gross margin %
   - Calculate target CPA: Break-even CPA × 0.65
   - Calculate minimum ROAS: 1 / gross margin %
   - Calculate target ROAS: Minimum ROAS × 1.4
5. **If COGS NOT available:**
   - Use vertical-specific COGS estimates from `benchmarks.md` profitability section.
   - Label ALL margin calculations as ASSUMPTION.
   - Flag: "COGS not provided. Using industry estimate of {X}% for {vertical}. Actual profitability may differ significantly."
6. **"Good ROAS but bad profit" check:**
   - If any platform shows ROAS > minimum ROAS but MER < minimum ROAS → flag attribution inflation.
   - If platform ROAS looks healthy but CM3 is negative → flag hidden cost problem.
   - Check return rate impact, discount stacking, fulfillment cost allocation per `benchmarks.md`.
7. **CAC payback calculation** (if repeat purchase data available from Shopify):
   - CAC Payback = Fully loaded CAC / monthly contribution margin per customer.
   - Compare to vertical benchmarks from `benchmarks.md`.

### When Shopify evidence does NOT exist:
1. Use platform-reported revenue as the best available proxy. Label as ASSUMPTION.
2. Prominently flag: "No Shopify data available. All profitability figures use platform-reported revenue, which is typically inflated by 20-50%. Treat as directional only."
3. Still calculate MER proxy using platform-reported totals, but label the output clearly.
4. Use vertical-specific COGS estimates. Double-label: ASSUMPTION (no COGS) + ASSUMPTION (no Shopify).
5. Skip CM1/CM2/CM3 — not meaningful without reliable revenue data. Instead, provide the formulas and say what data is needed.

---

## Step 7: Prioritized Opportunities

Aggregate opportunities from ALL evidence files plus cross-channel opportunities identified in Step 5.

**Prioritization framework:**
1. **Impact** — estimated revenue/profit impact (HIGH = >15% improvement potential, MEDIUM = 5-15%, LOW = <5%)
2. **Confidence** — how strong is the evidence (HIGH = directly observed data, MEDIUM = calculated/inferred, LOW = assumption-based)
3. **Effort** — implementation complexity (QUICK = <1 week, MODERATE = 1-4 weeks, STRATEGIC = 4+ weeks)
4. **Dependencies** — does this require fixing something else first? (e.g., fix tracking before optimizing bids)

**Sort order:** HIGH impact + HIGH confidence + QUICK effort first. Always list tracking fixes before optimization moves.

**For each opportunity, include:**
- Clear action statement
- Expected impact (quantified where possible, with confidence label)
- Evidence reference (which evidence file + field path)
- Dependencies / blockers
- Priority tier: CRITICAL / HIGH / MEDIUM / LOW

---

## Step 8: Generate the Report

**Default output: Markdown (.md)**
Save to: `{department}/reports/{Client-Name}/{Client}_audit_report_{date}.md`
- Disruptive clients: `{project_dir}/`

**Use the structure defined in `reference/report-template.md`.** The report sections in order:

1. Executive Summary (2-3 paragraphs, no jargon, business-owner readable)
2. What Was Audited (platforms, date ranges, depth)
3. What's Accessible vs. Missing (and what the report cannot tell you)
4. Tracking Health (if applicable — tracking issues before performance analysis)
5. Findings by Platform (one section per platform with evidence)
6. Cross-Channel Diagnosis (multi-platform only — patterns detected)
7. Profitability Analysis (MER, CM framework, unit economics)
8. Prioritized Opportunities (ranked list with impact/confidence/effort)
9. Top 5 Actions (the "if you do nothing else, do these" list)
10. Tiered Roadmap (Week 1 / Month 1 / Months 2-3)
11. Open Questions (unresolved data gaps, client info needed)

**Writing rules:**
- Run `protocols/human-voice.md` check on all prose sections before finalizing.
- Use direct language. No hedging. "CPA is 40% above break-even" not "CPA appears to be somewhat elevated."
- Every number must trace to a source. Use inline citations: `(Source: Google Ads evidence, account_overview.spend)`.
- Show calculation formulas for all derived metrics: `MER = $125,000 / $28,500 = 4.39x`.
- Label every data point: OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, or DATA_NOT_AVAILABLE.
- Benchmark comparisons use the format: `{metric} is {value} — {rating} (Floor: {x}, Healthy: {y}, Strong: {z})`.

**DOCX output (only if explicitly requested):**
If the user says "make it a doc", "Word document", "DOCX", or "client-ready document":
1. Read the docx SKILL.md for formatting instructions.
2. Generate the same content structure but formatted as .docx.
3. Save as `{Client}_audit_report_{date}.docx` in the same directory.
4. The markdown version is NOT generated when DOCX is requested — only one output format per run.

---

## Step 9: Anti-Hallucination Verification

**This step is MANDATORY. Never skip it.**

Load `reference/anti-hallucination.md` and run the full checklist:

1. **Source trace:** For every metric in the report, verify it traces to a specific evidence JSON file + field path. If a number cannot be traced, remove it or mark DATA_NOT_AVAILABLE.
2. **Calculation verify:** Re-run all CALCULATED metrics. Check the formula matches the inputs. Flag any rounding discrepancies >1%.
3. **Label audit:** Ensure every data point has one of the five labels. No unlabeled numbers.
4. **Assumption inventory:** List all ASSUMPTION-labeled items. Each must explain what assumption was made and what data would resolve it.
5. **Cross-check totals:** If multiple evidence files report the same metric differently (e.g., total spend), flag the discrepancy and note which source is used.
6. **Benchmark accuracy:** Verify all benchmark comparisons reference the correct tier from `benchmarks.md`. Check AOV tier is correct (high-ticket vs. low-ticket thresholds).
7. **Missing platform acknowledgment:** Verify the report explicitly states what analysis is NOT possible due to missing platforms.
8. **Confidence calibration:** Review all confidence labels on opportunities. Downgrade any labeled HIGH that rely on ASSUMPTION data.

If verification catches errors, fix them before delivering the report.

---

## Step 10: Finalize and Deliver

1. Save the report to the correct location per file routing rules.
2. Update the audit manifest (if it exists):
   - Mark synthesis as complete
   - Note report filename and date
   - Check all boxes in the Synthesis Status section
3. Tell the user where the report is saved.
4. Provide a 3-5 sentence verbal summary of the top findings — don't make them read the whole report to get the headline.
5. Call out any CRITICAL priority actions that need immediate attention.
6. Note any open questions that require client input to resolve.

---

## Edge Cases

### Single-platform report
- Skip Step 5 (cross-channel diagnosis) entirely.
- Profitability analysis is limited — MER calculation requires total spend across channels, which a single platform can't provide. Note this limitation.
- Still run all other steps. The report is structured the same way, just with fewer sections populated.

### Evidence files from different date ranges
- Note the date range mismatch prominently in the report header.
- Do NOT calculate cross-platform totals that span different periods.
- Compare metrics within each platform's own date range, then note: "Direct cross-platform comparison is limited because audit date ranges differ."

### Stale evidence files
- If any evidence file's `audit_date` is >30 days old, flag it: "⚠️ {Platform} evidence is from {date} — {X} days ago. Performance may have changed. Consider re-running /audit-{platform} for current data."

### Missing manifest
- The synthesizer can run without a manifest. It simply uses whatever evidence files exist.
- Note in the report: "No audit manifest found. Report is based on {N} evidence files found in the evidence directory. Full audit scope is unknown."

### Conflicting data between platforms
- When two platforms report conflicting numbers for the same metric (e.g., different total revenue figures), use the hierarchy: Shopify > GA4 > Platform dashboards.
- Note the conflict and which source was used.

### Client-specific thresholds vs. industry benchmarks
- Always calculate client-specific thresholds first (break-even CPA, min ROAS from actual margins).
- Fall back to industry benchmarks only when client economics are unknown.
- When using industry benchmarks, label as ASSUMPTION and flag: "Using industry average margin of {X}%. Client-specific thresholds may differ."

---

## What This Skill Does NOT Do

- Does NOT open any browser tabs or extract data from platforms. That's the platform skills' job.
- Does NOT modify evidence files. They are read-only inputs.
- Does NOT run platform-specific audits. If evidence is missing, it tells you to run the platform skill.
- Does NOT guess at data. Every number comes from an evidence file or is calculated from evidence file inputs with a visible formula.
