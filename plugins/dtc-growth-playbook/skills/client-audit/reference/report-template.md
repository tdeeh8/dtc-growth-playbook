# Report Generation (Phase 7)

Read the docx SKILL.md for technical reference on creating .docx files. Use the `docx` npm package.

Use your working notes file as the primary source — you shouldn't need to go back to platforms to recall data.

## Report Structure (follow this order exactly)

1. **Title Page** — "GROWTH AUDIT REPORT", client name, website URL, date, platforms analyzed, date range
2. **Executive Summary** — 3-5 sentences: what's going on, primary root causes, biggest opportunity
3. **What Was Reviewed** — list of platforms with date ranges
4. **Accessible vs Missing Data** — what you could and couldn't verify (scopes conclusions)
5. **Verified Findings** — organized by platform, each using:
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
8. **Top 10 Actions** — the single most important list, distilled from everything above
9. **Tiered Roadmap** — Tier 1 (7 days), Tier 2 (30 days), Tier 3 (60-90 days)
10. **Scale vs Fix Decision by Channel** — for each: scale, hold, fix first, or cut?
11. **Open Questions / Additional Data Needed** — what you couldn't answer and what data would help

## Formatting

- US Letter page size (12240 x 15840 DXA)
- Arial font throughout
- Tables with both `columnWidths` and cell `width` in DXA
- `ShadingType.CLEAR` (not SOLID) for table backgrounds
- Headers and footers with page numbers
- Page breaks between major sections
- Professional table formatting for data-heavy sections

## Quality Rules

- Use actual data from platforms — never placeholder numbers
- Support every conclusion with evidence (specific metrics, campaign names, page names)
- Be specific: name the campaigns, pages, products, metrics
- Avoid generic advice — every recommendation must connect to a specific finding
- Write as an operator, not a consultant: "here's what I'd do Monday morning" not "consider evaluating your approach to..."

Save to workspace folder as `{Client_Name}_Growth_Audit_Report.docx`.
