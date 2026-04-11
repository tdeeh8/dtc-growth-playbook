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
- `reference/playbook/benchmarks.md` — diagnostic thresholds, profitability math
- `reference/playbook/channel-allocation.md` — channel roles, halo effects, budget strategy
- `reference/playbook/measurement.md` — attribution, MER, reconciliation, tracking validation

**Conditionally load (for platforms that were audited):**
- `reference/playbook/google-ads.md` — if Google Ads evidence exists
- `reference/playbook/andromeda.md` — if Meta Ads evidence exists
- `reference/playbook/email-sms.md` — if Klaviyo evidence exists
- `reference/playbook/high-ticket.md` — if AOV $200+ (from manifest or Shopify evidence)
- `reference/playbook/low-ticket.md` — if AOV <$100

**Always load these reference files (this skill):**
- `reference/synthesis/report-template.md` — report structure
- `reference/synthesis/cross-channel-patterns.md` — pattern detection library
- `reference/synthesis/anti-hallucination.md` — verification checklist
- `reference/synthesis/profitability-framework.md` — CM1/CM2/CM3 methodology

**If user explicitly requests DOCX output:**
- Also read the docx SKILL.md (`skills/docx/SKILL.md`) for formatting instructions

**Human voice check:**
- Read `reference/human-voice.md` before writing any client-facing report content

---

## Step 0: Locate Evidence Files and Select Report Depth

1. Determine the client name from the user's request or the active manifest.
2. Determine the evidence directory:
   - Agency clients: `{Agency}/reports/{Client-Name}/evidence/`
   - {Brand}: `{Brand}/reports/evidence/`
3. List all `*_evidence.json` files in that directory.
4. Read the audit manifest if it exists (`{Client}_audit_manifest.md`).
5. Count evidence files. This determines the report mode:
   - **1 file** → Single-Platform Report mode
   - **2+ files** → Cross-Channel Synthesis mode
6. **Select report depth mode** (see `report-template.md` for full rules):
   - **Quick** (default for single-platform, or when user says "quick", "summary", "highlights")
   - **Full** (default for 3+ platforms, or when user says "full", "detailed", "comprehensive")
   - User can always override: "give me the full report" on a single platform = Full mode

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

## Step 1b: Compute Aggregate Health Score

After ingesting all evidence files, check each for a `scoring` object (see `reference/scoring-system.md` for the full schema).

**If scoring data exists in one or more evidence files:**

1. Extract each platform's `platform_score` and `grade`.
2. Compute the aggregate score using spend-weighted averaging: `aggregate_score = sum(platform_score × platform_spend_share)`. If spend data is unavailable, use equal weighting (`1 / number_of_scored_platforms`).
3. Map the aggregate to a grade: A (90-100), B (75-89), C (60-74), D (40-59), F (0-39).
4. Collect all `quick_wins` arrays across platforms into a unified list, re-sorted by `severity_multiplier × estimated_impact_score` descending.
5. For each scored platform, note the lowest-scoring category as its "top priority."

**If scoring data is missing from ALL evidence files:**
- Skip this step entirely. In the report, note: "Health Score: Not available (scoring not applied to this audit)."

**Mixed scoring (some platforms scored, others not):**
- Compute the aggregate using only the platforms that have scores.
- Note in the report: "Health Score based on {N} of {M} audited platforms. Scores pending for: {list of unscored platforms}."
- The aggregate reflects scored platforms only — do not estimate or penalize unscored ones.

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

### 3a. Classify tracking flags

Before aggregating, classify each flag as either **actionable** or **extraction-note**:

- **Actionable tracking issues** (go in report Tracking Health section): Conversion tracking gaps, attribution mismatches, EMQ scores below threshold, Enhanced Conversions disabled, duplicate conversion actions, cross-platform transaction count gaps. These affect data quality and what the marketer should do.
- **Extraction notes** (go in Methodology appendix only): Column virtualization blocking data, date picker mismatches caught and corrected during audit, account defaulting to wrong entity, UI navigation workarounds. These are data collection artifacts, not data quality problems.

### 3b. Aggregate actionable flags

1. Collect only actionable flags across platforms. Sort by severity (high → medium → low).
2. Check for cross-platform tracking disconnects:
   - If both GA4 and Shopify evidence exist: compare transaction counts. Flag if gap >15%.
   - If platform evidence + GA4 exist: compare platform conversions to GA4. Flag if gap >25%.
   - If platform evidence + Shopify exist: compare platform conversions to Shopify orders. Flag if gap >30%.
3. Check for duplicate tracking signals (multiple conversion actions for same event).
4. Check EMQ scores (Meta) — flag if below 6/10.
5. Check Enhanced Conversions status (Google) — flag if not enabled.

**If HIGH-severity actionable issues exist, add a prominent warning:**
"⚠️ Tracking issues detected. Performance metrics below may be inflated or understated. Fix tracking before making budget decisions."

### 3c. Route extraction notes to appendix

All extraction-note flags go to the Methodology & Sources appendix (Section 10 of report template). They are NOT mentioned in the main report body.

---

## Step 4: Platform-by-Platform Findings

For each platform with an evidence file, generate a findings section following the structure in `report-template.md` Section 5.

**Depth mode controls the detail level** (see report-template.md for full rules):

### Quick mode:
1. **Key Metrics table** — Use the platform's key metrics shortlist from report-template.md. 5-6 metrics max, no Label column. Show formula once below the table.
2. **Primary constraint** — 2-3 sentences from `diagnosis.primary_constraint`.
3. **Key findings** — Top 3-5 only, ranked by significance. 2-3 sentences each. No evidence labels, no source citations inline. Apply dedup rule against exec summary.
4. **Campaign/product tables** — Top 5 rows by spend or revenue + summary row for remainder.
5. **Anomalies** — Only actionable ones. Skip extraction-method anomalies.
6. **Skip Platform Opportunities** — those merge into Top 5 Actions.

### Full mode:
1. **Performance Overview table** — All meaningful metrics from `account_overview`. No Label column (labels in appendix). Include benchmark comparison columns.
2. **Primary constraint** — Full description with evidence trail.
3. **Key findings** — All findings from `findings[]`. Group by theme if >5. Apply dedup rule (brief callback for items already in exec summary). Include inline source citations.
4. **Campaign/product tables** — All rows with meaningful activity. Drop zero-activity rows.
5. **Anomalies** — Actionable anomalies only (extraction notes → appendix).
6. **Platform Opportunities** — Full table sorted by priority.

### Both modes:
- **Summary Table Rules:** Roll up to the highest useful level. Per-ASIN tables → product-line summaries with 2-3 outlier callouts. Per-keyword tables → campaign-level summaries. Raw data lives in evidence JSON.
- **No inline evidence labels.** No `[OBSERVED]`, `[CALCULATED]` tags in prose. The Formula column or inline formula makes provenance clear.
- **Benchmark comparison:** Show tier ranges (Floor/Healthy/Strong) on FIRST mention of each metric only. Subsequent mentions just state value + rating.
- **Dedup rule:** If a finding restates something from the exec summary, use a brief callback ("TACoS at 25.98% — see Executive Summary — drives the ad-dependency problem") not a full restatement.

**Benchmark comparison rules:**
- Always calculate client-specific thresholds first (break-even CPA, minimum ROAS) from profitability math before comparing to industry benchmarks.
- Show both: "CPA is $45 vs. $32 break-even (client-specific) and $38 industry median."
- If client-specific thresholds aren't calculable (no margin data), use industry benchmarks and note the assumption in prose.

---

## Step 5: Cross-Channel Diagnosis (Multi-Platform Only)

**This step ONLY activates when 2+ evidence files exist.** Skip entirely for single-platform reports.

Load `reference/synthesis/cross-channel-patterns.md` and systematically check each pattern category:

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

Load `reference/synthesis/profitability-framework.md`.

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
- Agency clients: `{Agency}/reports/{Client-Name}/`
- {Brand}: `{Brand}/reports/`

**Use the structure defined in `reference/synthesis/report-template.md`.** Apply the depth mode selected in Step 0.

### Report sections (both modes):

1. **Header Block** — Client name, audit date, platforms audited, date ranges. If scoring data exists: Overall Health Score, Grade, and a one-line interpretation (e.g., "Grade C — notable issues across multiple platforms").
2. **Executive Summary** (identical in both modes)
2a. **Platform Scores** (only if scoring data exists) — Summary table: | Platform | Score | Grade | Top Issue |. If mixed scoring, include note: "Scores available for {N} of {M} platforms." Quick Wins pulled from each platform's `quick_wins` array, unified and re-sorted by severity × impact.
3-4. Scope / Missing / Tracking Health (collapsed callout in Quick, separate sections in Full)
5. Findings by Platform (condensed in Quick, full detail in Full)
— Cross-Channel Diagnosis (multi-platform only, both modes)
6. Profitability (break-even summary in Quick, full CM waterfall in Full)
7. Actions & Opportunities (Top 5 only in Quick, full table + Top 5 in Full). Quick Wins from scoring feed into this section — deduplicate against manually identified opportunities.
8. Implementation Roadmap (fewer items in Quick)
9. Open Questions (top 3-4 in Quick, all in Full)
10. Methodology & Sources appendix (both modes — this is where evidence labels, source citations, extraction notes, and calculation references live)

### Writing rules:
- Run `reference/human-voice.md` check on all prose sections before finalizing.
- Use direct language. No hedging. "CPA is 40% above break-even" not "CPA appears to be somewhat elevated."
- **No inline evidence labels.** Do NOT put `[OBSERVED]`, `[CALCULATED]`, `[INFERENCE]`, `[ASSUMPTION]` in prose or table cells. These labels are tracked in the evidence JSON and summarized in the Methodology appendix.
- **Source citations:** In Full mode, include inline `(Source: evidence.json, field)` after findings and data claims. In Quick mode, omit inline citations — the appendix handles traceability.
- Show calculation formulas once per metric, inline: `TACoS = $6,290 / $24,210 = 25.98%`. Do not repeat the same formula in later sections.
- Benchmark tier ranges (Floor/Healthy/Strong) appear once per metric at first mention. Later references just state value + rating.
- **Dedup rule:** When a finding or metric was already discussed in the Executive Summary, use a brief callback in later sections, not a full restatement.

**DOCX output (only if explicitly requested):**
If the user says "make it a doc", "Word document", "DOCX", or "client-ready document":
1. Read the docx SKILL.md for formatting instructions.
2. Generate the same content structure but formatted as .docx.
3. Save as `{Client}_audit_report_{date}.docx` in the same directory.
4. The markdown version is NOT generated when DOCX is requested — only one output format per run.
5. Depth mode still applies — Quick DOCX = shorter doc.

---

## Step 9: Anti-Hallucination Verification

**This step is MANDATORY. Never skip it.**

Load `reference/synthesis/anti-hallucination.md` and run the full checklist:

1. **Source trace:** For every metric in the report, verify it traces to a specific evidence JSON file + field path. If a number cannot be traced, remove it or note DATA_NOT_AVAILABLE in the appendix.
2. **Calculation verify:** Re-run all CALCULATED metrics. Check the formula matches the inputs. Flag any rounding discrepancies >1%.
3. **Label audit:** Ensure every data point in the evidence JSON has one of the five labels. (Labels are NOT shown inline in the report — they're in the Methodology appendix and the evidence JSON.)
4. **Assumption inventory:** List all ASSUMPTION-labeled items in the Methodology appendix. Each must explain what assumption was made and what data would resolve it.
5. **Cross-check totals:** If multiple evidence files report the same metric differently (e.g., total spend), flag the discrepancy and note which source is used.
6. **Benchmark accuracy:** Verify all benchmark comparisons reference the correct tier from `benchmarks.md`. Check AOV tier is correct (high-ticket vs. low-ticket thresholds).
7. **Missing platform acknowledgment:** Verify the report explicitly states what analysis is NOT possible due to missing platforms.
8. **Confidence calibration:** Review all confidence labels on opportunities. Downgrade any labeled HIGH that rely on ASSUMPTION data.
9. **Dedup check:** Scan the report for metrics or findings restated more than twice. If found, consolidate to first-mention + brief callbacks.

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
