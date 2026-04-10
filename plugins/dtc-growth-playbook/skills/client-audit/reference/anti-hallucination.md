# Verification & Anti-Hallucination (Phase 8)

## Phase 8a: Report Verification

After generating the report, read it back and verify against working notes.

**Checklist:**
- [ ] Open the generated .docx and read through it (use pandoc or unpack script)
- [ ] Cross-check every key metric against working notes — flag mismatches
- [ ] Verify every campaign name, product name, and URL actually appeared in your notes (not hallucinated)
- [ ] Confirm OBSERVED/INFERENCE/ASSUMPTION labels are correct — inferences must not be labeled as observations
- [ ] Check "Open Questions" includes everything marked DATA NOT AVAILABLE
- [ ] Verify executive summary accurately reflects the diagnosis (not overstated)

If errors are found, fix before delivering. If substantial, regenerate the report.

## Phase 8b: Live Platform Spot-Check

Go back to live platform tabs and visually confirm a sample of key data points.

**Why this exists:** Working notes can have transcription errors. Report generation can introduce rounding differences. Numbers on dashboards may have updated if significant time passed.

**How to execute:**

1. **Select 5-8 high-stakes data points** — prioritize:
   - The headline metric the client cares most about (total revenue, total orders)
   - At least one number from each platform audited
   - Any number that drives a key recommendation
   - Any number in the Executive Summary

2. **Navigate to each platform tab** and confirm via screenshot or `read_page`

3. **Build a spot-check table:**

   | Data Point | Report Says | Live Platform Shows | Match? |
   |---|---|---|---|
   | Total Sales | $X | $X (Shopify) | ✅ / ❌ |
   | Meta Spend | $X | $X (Meta Ads) | ✅ / ❌ |
   | Google Ads Conversions | X | X (Google Ads) | ✅ / ❌ |

4. **If any number doesn't match:**
   - Live platform is the source of truth
   - Update working notes AND report
   - If the mismatch changes a recommendation, flag it
   - Small differences (<1%) in rolling windows are acceptable

5. **Show the spot-check table to the user** when delivering — builds confidence

**Minimum coverage:**
- At least 1 revenue/sales number (store backend)
- At least 1 spend number (ad platform)
- At least 1 conversion/purchase count (ad platform)
- At least 1 rate metric (ROAS, CPA, or conversion rate)
- Any warning/alert status mentioned in the report

## Anti-Hallucination Checklist

Before finalizing, verify:
- [ ] Every metric cited was directly observed (not estimated)
- [ ] No "industry average" benchmarks used unless user specifically requested benchmarking
- [ ] No findings generalize from a single campaign/product/day without stating that limitation
- [ ] No causal claims from correlational evidence
- [ ] Conflicting data between platforms is surfaced, not smoothed over
- [ ] Every DATA NOT AVAILABLE label reflects a genuine gap, not laziness
- [ ] Diagnosis emerged from patterns, not pre-formed theories
- [ ] Recommendations don't ignore trade-offs with other channels
- [ ] Working notes were updated after every platform
- [ ] Anomalies and surprises were investigated, not glossed over
