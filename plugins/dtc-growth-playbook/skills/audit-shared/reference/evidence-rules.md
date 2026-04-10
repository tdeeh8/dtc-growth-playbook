# Evidence Rules & Data Integrity

> Shared rules for all v2 audit skills. Read once at start of any platform audit.

---

## 1. Evidence Labeling (Required on Every Data Point)

Every metric, finding, or data point in an evidence JSON file MUST carry one of these five labels:

### OBSERVED
- **Definition:** Pulled directly from the platform UI or API.
- **Source field:** Exact location — page > section > metric, or API endpoint > parameter.
- **Example:** `{ "label": "OBSERVED", "source": "Campaigns > All campaigns > Cost column" }`

### CALCULATED
- **Definition:** Derived from two or more observed values using a formula.
- **Source field:** Show the formula with actual numbers.
- **Example:** `{ "label": "CALCULATED", "source": "$4,200 / $18,000 = 23.3%" }`

### INFERENCE
- **Definition:** Logical conclusion drawn from observed data, not directly stated by the platform.
- **Source field:** Explain the reasoning chain.
- **Example:** `{ "label": "INFERENCE", "source": "CTR dropped 40% after creative refresh on 3/15 — likely creative fatigue on previous set" }`

### ASSUMPTION
- **Definition:** Not verified against platform data. Used when real data is unavailable.
- **Source field:** State what was assumed and why.
- **Example:** `{ "label": "ASSUMPTION", "source": "Assumed 52% COGS based on vertical benchmark; client COGS not available" }`

### DATA_NOT_AVAILABLE
- **Definition:** Attempted to retrieve but couldn't access or the data doesn't exist.
- **Source field:** State what was tried.
- **Example:** `{ "label": "DATA_NOT_AVAILABLE", "source": "Attempted to extract via reporting tab; metric not available in this account type" }`

---

## 2. Anti-Hallucination Rules

These seven rules are non-negotiable for every audit:

1. **Platform data only.** Every number in the evidence file must come from the platform (UI or API). No estimates, no "typical" numbers, no recalled benchmarks presented as client data.
2. **Mark gaps, don't fill them.** If you can't read a metric, mark it `DATA_NOT_AVAILABLE`. Never fill gaps with assumptions silently.
3. **Show your math.** Every `CALCULATED` metric must show the formula in the `source` field.
4. **Label everything.** If it's an inference, say `INFERENCE`. If it's an assumption, say `ASSUMPTION`. No unlabeled data points.
5. **Cross-check totals.** Platform-level totals should approximately equal the sum of component parts. If they don't, note the discrepancy.
6. **Don't diagnose unverified issues.** If you suspect a problem but couldn't confirm, label it `INFERENCE`, not `OBSERVED`.
7. **Timestamp everything.** Note the date range explicitly for every metric. Include the pull date.

---

## 3. Data Quality Standards

- Every number must cite its source — no exceptions.
- Never invent numbers. Say "No data available" if missing.
- Show calculation formulas (e.g., "ACoS = $102 / $450 = 22.7%").
- Handle gaps honestly — never fill with assumptions unless Tanner explicitly asks.
- Save raw data snapshots after every audit or report.
- When platform totals conflict with summed components, report both values and flag the discrepancy.
- Round percentages to one decimal place. Round currency to whole dollars unless sub-dollar precision matters.
