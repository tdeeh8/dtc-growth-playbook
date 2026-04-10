# Report Generation (Phase 7)

Read the `docx` skill (the Cowork docx SKILL.md) for technical reference on creating .docx files. Use the `docx` npm package.

Use your working notes file as the primary source — you shouldn't need to go back to platforms to recall data.

## Output Format by Audit Depth

Not every audit needs a full 11-section report. Match output to depth:

| Depth | Output Format | Sections |
|---|---|---|
| Quick check | Chat response (no DOCX) | See quick-check.md Step 4 |
| Standard audit | Full DOCX report | Standard Report Structure below |
| Deep audit | Full DOCX report | Standard Report Structure below + Tracking Health section |
| Profitability audit | Profitability DOCX report | Profitability Report Structure below |

---

## Standard Report Structure (Standard + Deep audits)

Include only the sections relevant to the platforms audited. Skip sections that reference platforms not in scope.

1. **Title Page** — "GROWTH AUDIT REPORT", client name, website URL, date, platforms analyzed, date range
2. **Executive Summary** — 3-5 sentences: what's going on, primary root causes, biggest opportunity
3. **What Was Reviewed** — list of platforms with date ranges
4. **Accessible vs Missing Data** — what you could and couldn't verify (scopes conclusions)
5. **Verified Findings** — organized by platform. Only include sections for platforms actually audited. Each finding uses:
   - Finding:
   - Label: OBSERVED / INFERENCE / ASSUMPTION / DATA NOT AVAILABLE
   - Evidence:
   - Why it matters:
6. **Root-Cause Diagnosis** — top constraints, connected to evidence
7. **Highest-Impact Opportunities** — each using:
   - Action:
   - Priority:
   - Expected impact:
   - Confidence:
   - Why now:
   - How to execute:
8. **Top Actions** — distilled from everything above. Use 5-10 depending on how many genuine, evidence-backed actions exist. Don't pad to 10 if only 6 are real.
9. **Tiered Roadmap** — Tier 1 (7 days), Tier 2 (30 days), Tier 3 (60-90 days)
10. **Scale vs Fix Decision by Channel** — ONLY if 2+ channels were audited. For single-channel audits, fold this into the Diagnosis section instead.
11. **Open Questions / Additional Data Needed** — what you couldn't answer and what data would help

**Deep audit addition:** Insert a **Tracking Health** section after "Accessible vs Missing Data" (becomes section 4b). Include the purchase count reconciliation table, EMQ scores, and any tracking issues discovered during the Phase 1b validation gate.

---

## Profitability Report Structure

Profitability audits need a different report shape — focused on unit economics, not channel tactics.

1. **Title Page** — "PROFITABILITY AUDIT", client name, date, date range
2. **Executive Summary** — 2-3 sentences: profitable or not, primary margin constraint, biggest lever
3. **Revenue & Cost Summary** — Total revenue, total spend, MER, blended ROAS, blended CPA. Table format.
4. **Unit Economics** — The core section:
   - Break-even CPA and Target CPA (with formula shown)
   - Minimum ROAS and Target ROAS (with formula shown)
   - CM1 / CM2 / CM3 breakdown (if COGS available; otherwise COGS estimate with ASSUMPTION label)
   - Contribution margin vs. vertical benchmarks
5. **CAC & Payback Analysis** — CAC payback period with rating. LTV:CAC ratio if repeat purchase data available. Compare to vertical benchmarks.
6. **Channel-Level Profitability** — CM3 by channel (Meta, Google, etc). Which channels are profitable vs. losing money after full cost allocation.
7. **Diagnosis** — Why profit is where it is. Use the "Good ROAS but bad profit" checklist if applicable. Revenue-growing-but-margin-shrinking diagnosis if applicable.
8. **Top Actions** — 3-5 specific moves to improve profitability. Ranked by impact.
9. **Open Questions** — What data would sharpen the analysis (COGS, return rates, LTV by cohort, etc.)

---

## Formatting (all report types)

- US Letter page size (12240 x 15840 DXA)
- Arial font throughout
- Tables with both `columnWidths` and cell `width` in DXA
- `ShadingType.CLEAR` (not SOLID) for table backgrounds
- Headers and footers with page numbers
- Page breaks between major sections
- Professional table formatting for data-heavy sections

## Quality Rules (all report types)

- Use actual data from platforms — never placeholder numbers
- Support every conclusion with evidence (specific metrics, campaign names, page names)
- Be specific: name the campaigns, pages, products, metrics
- Avoid generic advice — every recommendation must connect to a specific finding
- Write as an operator, not a consultant: "here's what I'd do Monday morning" not "consider evaluating your approach to..."
- Match section count to evidence: if you only have strong evidence for 5 actions, don't force 10

Save to workspace folder as `{Client_Name}_{Audit_Type}_Report.docx` (e.g., `Acme_Growth_Audit_Report.docx` or `Acme_Profitability_Report.docx`).