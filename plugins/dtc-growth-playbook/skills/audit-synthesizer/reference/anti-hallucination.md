# Anti-Hallucination Verification Checklist

Run this checklist AFTER generating the report draft and BEFORE delivering to the user. Every check must pass. If any check fails, fix the report before delivery.

---

## 1. Source Trace Verification

**Rule:** Every metric in the report must trace to a specific evidence JSON file and field path.

### Procedure

For each number in the report:

1. **Identify the claimed source.** The report should have an inline citation like `(Source: {evidence file}, {field path})`.
2. **Verify the citation exists.** Check that the referenced evidence file was actually ingested.
3. **Verify the field path exists.** Confirm the referenced field exists in the evidence JSON at that path.
4. **Verify the value matches.** The number in the report must match the value in the evidence file exactly (for OBSERVED data) or within rounding tolerance (for CALCULATED data).

### Failure modes

- **Missing citation:** A number appears in the report with no source reference → ADD the source or REMOVE the number.
- **Broken citation:** Source references a file or field that doesn't exist → FIX the reference or REMOVE the metric.
- **Value mismatch:** Report says $22,859 but evidence file says $22,859.21 → Use the evidence file value. Rounding is acceptable only in the Executive Summary (round to nearest $100 or $1K for readability) — full precision required in data tables.
- **Fabricated metric:** A number appears that doesn't exist in ANY evidence file and wasn't calculated from evidence data → REMOVE it immediately. This is the most critical failure.

### Quick-check method

Scan the report for all dollar amounts, percentages, ratios, and counts. For each one, answer: "Which evidence file contains this number, or which evidence file values did I calculate it from?" If you can't answer, it's a hallucination.

---

## 2. Calculation Verification

**Rule:** Every CALCULATED metric must show its formula and the formula must be mathematically correct.

### Procedure

Re-compute each calculated metric from its inputs:

| Metric | Formula | Verify |
|--------|---------|--------|
| ROAS | Revenue / Spend | Check both numerator and denominator match evidence |
| CPA | Spend / Conversions | Check both values match evidence |
| MER | Shopify Revenue / Total Spend (all channels) | Verify Shopify revenue is from Shopify evidence, spend is summed correctly |
| Blended ROAS | Shopify Revenue / Total Paid Ad Spend | Ensure only paid ad spend is in denominator (not email costs, etc.) |
| CM1 | Revenue - COGS | Verify COGS source and label |
| CM2 | CM1 - shipping - packaging - fulfillment | Verify each cost component has a source |
| CM3 | CM2 - marketing spend - processing - returns | Verify all inputs |
| Break-even CPA | AOV × gross margin % | Verify AOV and margin % sources |
| Target CPA | Break-even CPA × 0.65 | Simple multiplication check |
| Minimum ROAS | 1 / gross margin % | Verify margin % source |
| Target ROAS | Minimum ROAS × 1.4 | Simple multiplication check |
| Over-attribution ratio | Sum of platform conversions / Shopify orders | Verify each platform's conversion count and Shopify order count |

### Tolerance

- Rounding: ±1% is acceptable for percentages, ±$1 for dollar amounts.
- If rounding produces a >1% discrepancy in a ratio (e.g., ROAS), show the precise calculation.

### Failure modes

- **Wrong formula:** Report shows "CPA = Revenue / Spend" instead of "CPA = Spend / Conversions" → FIX the formula and recalculate.
- **Input mismatch:** Calculation uses a different spend figure than what's in the evidence → Use the evidence file value.
- **Missing formula:** A CALCULATED metric appears without showing how it was derived → ADD the formula inline.

---

## 3. Label Audit

**Rule:** Every data point in the report must carry exactly one label from the approved set.

### Approved labels

| Label | Meaning | Requirements |
|-------|---------|-------------|
| OBSERVED | Directly pulled from a platform UI or data export | Must have a `source` field citing the platform, page, and metric name |
| CALCULATED | Derived from OBSERVED values using a formula | Must show the formula and all input values |
| INFERENCE | Logical conclusion drawn from observed patterns | Must explain the reasoning chain |
| ASSUMPTION | Estimated value where real data is unavailable | Must state what was assumed and what data would replace it |
| DATA_NOT_AVAILABLE | Data point was sought but not found | Must note what was looked for and where |

### Procedure

1. Scan every data table in the report. Each row should have a Label column.
2. Scan prose sections for inline metrics. Each should have an inline label or be in a context where the label is clear.
3. Verify label correctness:
   - Is something labeled OBSERVED that was actually calculated? → Change to CALCULATED.
   - Is something labeled CALCULATED that uses assumptions? → Change to ASSUMPTION if any input is assumed.
   - Is something unlabeled? → Add the correct label.

### Escalation rule

A metric is only as reliable as its least reliable input:
- CALCULATED from OBSERVED inputs → Label stays CALCULATED
- CALCULATED from one OBSERVED + one ASSUMPTION input → Entire result is ASSUMPTION
- INFERENCE based on OBSERVED data → Label stays INFERENCE
- INFERENCE based on ASSUMPTION data → Downgrade to ASSUMPTION

---

## 4. Assumption Inventory

**Rule:** Every ASSUMPTION in the report must be explicitly listed with what was assumed and what data would resolve it.

### Procedure

1. Search the report for every instance of the ASSUMPTION label.
2. For each one, verify it includes:
   - **What was assumed:** "Using industry average COGS of 35% for apparel vertical."
   - **Why it was necessary:** "Client did not provide COGS data."
   - **What data would resolve it:** "Actual COGS per product from client's P&L or Shopify cost-per-item."
   - **Impact if wrong:** "If actual COGS is 45% instead of 35%, break-even CPA drops from $32 to $24 — current CPA of $38 would be significantly unprofitable."
3. Aggregate all assumptions into the Open Questions section (Section 11 of the report).

### Failure mode

- An ASSUMPTION exists in a data table but is not called out anywhere as an assumption → Add explicit callout and add to Open Questions.

---

## 5. Cross-Check Totals

**Rule:** When multiple evidence files report metrics that should reconcile, verify consistency or flag discrepancies.

### Common cross-checks

| Check | Sources | Expected |
|-------|---------|----------|
| Total ad spend | Sum of all platform evidence spend values | Should match or be within 5% of any "total spend" figure used in MER calculation |
| Total revenue | Shopify vs. sum of platform-reported revenue | Shopify is source of truth; platform sum will be higher (over-attribution) |
| Conversion count | Shopify orders vs. sum of platform conversions | Platform sum > Shopify is expected; ratio is the over-attribution metric |
| Date ranges | All evidence files | Note if they differ — cross-platform math is only valid for overlapping periods |

### Procedure

1. Pull the "Total Spend" value from each platform evidence file.
2. Sum them.
3. Verify this sum matches what's used in the MER calculation.
4. If Shopify evidence exists, pull total revenue and orders.
5. Compare Shopify totals to the sum of platform-claimed revenue/conversions.
6. Any discrepancy >5% in spend totals (which should be exact) → investigate. Spend should not vary between sources — it's a known quantity.

---

## 6. Benchmark Accuracy

**Rule:** All benchmark comparisons must reference the correct thresholds from `benchmarks.md` and use the correct AOV tier.

### Procedure

1. For each benchmark comparison in the report, verify:
   - The metric name matches what's in benchmarks.md.
   - The Floor/Healthy/Strong thresholds match benchmarks.md exactly.
   - The correct platform section is referenced (don't use Meta benchmarks for Google metrics).
2. Verify AOV tier is correct:
   - AOV $200+ → high-ticket thresholds apply where available
   - AOV <$100 → low-ticket thresholds apply where available
   - AOV $100-200 → standard thresholds
3. Verify client-specific thresholds (break-even CPA, min ROAS) are calculated from the client's actual economics, not confused with industry benchmarks.

### Failure modes

- **Wrong tier:** Report uses high-ticket CVR benchmarks for a $40 AOV product → Fix to correct tier.
- **Stale benchmarks:** Report references benchmarks dated before the current playbook validity window → Flag: "This benchmark is from {date} — may need validation."
- **Mixed sources:** Report compares a client metric to a benchmark from the wrong platform section → Fix the comparison.

---

## 7. Missing Platform Acknowledgment

**Rule:** The report must explicitly state what analysis is NOT possible due to missing platforms.

### Procedure

1. Check Section 3 (Accessible vs. Missing) exists in the report.
2. Verify it lists every platform that was planned but not audited (from manifest) or that would provide valuable context.
3. Verify each missing platform has a corresponding limitation statement: "Without {platform}, we cannot {specific analysis}."
4. Verify cross-channel diagnosis (Section 6) does NOT make claims that require data from missing platforms.

### Failure modes

- **Silent gap:** Report makes a cross-channel claim that requires Shopify data, but Shopify wasn't audited → Remove the claim or add prominent ASSUMPTION label.
- **Missing section:** Section 3 is absent → Add it. This section is required even if all planned platforms were audited (to confirm completeness).

---

## 8. Confidence Calibration

**Rule:** Opportunity confidence levels must be consistent with the evidence quality supporting them.

### Procedure

For each opportunity in the report:

1. Check its confidence label (HIGH/MEDIUM/LOW).
2. Check what evidence supports it.
3. Apply the calibration rule:

| Evidence Quality | Max Confidence for Opportunity |
|-----------------|-------------------------------|
| All inputs OBSERVED or CALCULATED from OBSERVED | HIGH |
| Mix of OBSERVED and INFERENCE | MEDIUM (max) |
| Any input labeled ASSUMPTION | LOW (max) — regardless of how logical it seems |
| Cross-channel pattern with MEDIUM confidence | MEDIUM (max) for resulting opportunity |
| Cross-channel pattern with LOW confidence | LOW (max) |

4. Downgrade any opportunity whose confidence exceeds what its evidence supports.

### Failure mode

- An opportunity is labeled HIGH confidence but its expected impact relies on assumed COGS margins → Downgrade to MEDIUM or LOW and note the assumption dependency.

---

## Final Sign-Off

Before delivering the report, confirm ALL of the following:

- [ ] Every dollar amount, percentage, ratio, and count traces to an evidence file or a shown calculation
- [ ] All calculations have been re-verified and formulas are shown inline
- [ ] Every data point has one of the five approved labels
- [ ] All ASSUMPTION items are inventoried in Open Questions
- [ ] Cross-platform totals reconcile (or discrepancies are flagged)
- [ ] Benchmark comparisons use correct thresholds and AOV tier
- [ ] Missing platforms are acknowledged with specific limitation statements
- [ ] Opportunity confidence levels match evidence quality
- [ ] No metric exists in the report that cannot be traced to source data

If any box cannot be checked, fix the issue before delivery. Do not deliver an unverified report.
