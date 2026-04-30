# DOCX Report Template — Databox Audit

> ⚠️ **DEPRECATED in v4-cowork-memory (April 2026).** PDF is now the default deliverable. New audits should not load this file. Use `reference/pdf-template.md` and `scripts/build_audit_pdf.js` instead. This file is retained for one version cycle so anyone with v3 muscle memory has a clear pointer; it will be removed in v5.
>
> If you reached this file by reflex (e.g., habit from v3), STOP and route to `pdf-template.md`. The PDF pipeline accepts the same evidence-JSON shape and produces a 15-page deliverable that maps onto the v3 DOCX structure 1:1.

---

Use this template to generate the audit report. **DOCX was the default delivery format in v3** — kept here for legacy reference only. Includes reusable status-color helpers so tables auto-render RED/YELLOW/GREEN/GRAY cells based on the Status value.

## v3-money-page changes (April 2026)

- NEW: `moneyPageBlock()` helper renders the Page 1 Money Page (headline + One Thing + 5-day week).
- NEW: `headlineScorecard()` helper renders the 3-row Page 2 scorecard.
- RENAMED: existing 8-row scorecard helper becomes `detailedScorecard()`, rendered in appendix only.
- CHANGED: Findings Matrix Impact cells render as dollar strings with Severity-row-inherited fill (no more $/$$/$$$ bands).
- REMOVED: `findings_matrix_heatmap` chart rendering (chart cut from spec).

> **Earlier framework note:** v3 (Wave 1, April 2026) extended STATUS_STYLES with Confidence (HIGH/MEDIUM/LOW) entries. Wave 3 (this update) replaces the Impact band entries with row-context dollar-string rendering — see the helper spec and `tr()` notes below.

---

## Content Budget (hard rules)

The report MUST stay concise. Enforce these limits during synthesis and again at build time:

- **Executive summary:** exactly 1 paragraph (no bullets, no sub-headers).
- **Each channel page:** ≤ 200 words of prose (scorecard row + diagnosis + actions combined). Campaign tables and detailed breakdowns go in the appendix.
- **Every number is visualized OR tabled — never both.** If a metric appears in a chart, do not also list it in a table on the same page. If it lives in a table, don't chart it.
- **Body = decisions.** Appendix = supporting detail. If a reader can't act on it, move it to the appendix or cut it.

---

## Chart file locations

Charts are generated BEFORE the docx build and embedded via the `chartImage()` helper.

- **Chart directory:** `{evidence_dir}/charts/`
- **File naming:** `{chart_key}.png` (e.g., `google_spend_roas.png`, `meta_cpa_trend.png`)
- **Spec file:** `{evidence_dir}/charts/chart_spec.json` — lists every chart the report needs

**Generate charts first:**
```bash
python scripts/generate_charts.py --spec {evidence_dir}/charts/chart_spec.json --out {evidence_dir}/charts/
```

Only after charts exist on disk should you run `node build_report.js` — the template reads PNGs synchronously at build time and will throw if a referenced chart is missing.

**Prerequisites:**
- `npm install -g docx` (the docx-js package)
- The docx skill (read `anthropic-skills:docx` first for general docx best practices)

**Workflow:**
1. Write evidence JSONs during deep-dives (already happens)
2. Draft the report content (structure from `reference/synthesizer.md`)
3. Render to DOCX using the template below — this is the standard deliverable
4. Validate with `scripts/office/validate.py`

---

## Template: build_report.js

Save this to the outputs directory, adapt the `children` array with audit-specific content, then run `node build_report.js {output-path}`.

```javascript
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak, ImageRun
} = require('docx');

// ==== Theme ====
const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const headerFill = "1F3864";
const headerTextColor = "FFFFFF";
const altFill = "F2F2F2";

// ==== Status Color Map (the key feature) ====
// Auto-applied to any cell whose text exactly matches a key below.
// STATUS_STYLES is consumed by tableCell() to auto-render color-coded cells.
// Three families of values are recognized:
//   1. Triage RAG: "RED" / "YELLOW" / "GREEN" — used in scorecard cells
//   2. Channel Role status: "Delivering" / "Organic" / "Leaking" / "Fatiguing" /
//      "Misaligned" / "Too early" / "Too-small-to-matter" / "Broken" / "Collapsed" /
//      "Unmeasurable" — used in Channel Role vs Reality matrix
//   3. v3 Findings Matrix: "HIGH" / "MEDIUM" / "LOW" (Confidence) — Confidence
//      values render as their own colored cells. The Impact column is NOT in
//      this map — Impact cells are dollar-string text (e.g. "~$22k/mo",
//      "~$8-15k/mo", "directional") and inherit fill from the row's Severity
//      cell via row-context in tr() (see helper note below). The old
//      "$$$" / "$$" / "$" entries are GONE in v3-money-page.
//      Spec source: reference/synthesis/findings-matrix.md (column schema,
//      sort order, and worked examples). docx-template.md owns the JS
//      object; findings-matrix.md owns the design contract.
// All three coexist; cell content is matched by exact string.
const STATUS_STYLES = {
  // Traffic light
  "RED":                  { fill: "C0392B", color: "FFFFFF", bold: true },
  "YELLOW":               { fill: "D68910", color: "FFFFFF", bold: true },
  "GREEN":                { fill: "229954", color: "FFFFFF", bold: true },
  // Channel Role vs Reality status values
  "Delivering":           { fill: "229954", color: "FFFFFF", bold: true },
  "Organic":              { fill: "229954", color: "FFFFFF", bold: true },
  "Leaking":              { fill: "D68910", color: "FFFFFF", bold: true },
  "Fatiguing":            { fill: "D68910", color: "FFFFFF", bold: true },
  "Misaligned":           { fill: "D68910", color: "FFFFFF", bold: true },
  "Too early":            { fill: "7F8C8D", color: "FFFFFF", bold: true },
  "Too-small-to-matter":  { fill: "7F8C8D", color: "FFFFFF", bold: true },
  "Broken":               { fill: "C0392B", color: "FFFFFF", bold: true },
  "Collapsed":            { fill: "C0392B", color: "FFFFFF", bold: true },
  "Unmeasurable":         { fill: "C0392B", color: "FFFFFF", bold: true },
  // v3 Findings Matrix — Confidence values
  "HIGH":                 { fill: "229954", color: "FFFFFF", bold: true },
  "MEDIUM":               { fill: "D68910", color: "FFFFFF", bold: true },
  "LOW":                  { fill: "7F8C8D", color: "FFFFFF", italic: true },
  // NOTE: Impact band entries ("$$$" / "$$" / "$") were REMOVED in
  // v3-money-page. Impact cells now carry dollar-string text and inherit
  // fill from the row's Severity color via row-context in tr().
};

// ==== Helpers ====
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, ...(opts.run || {}) })],
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 32, color: "1F3864" })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 26, color: "2E74B5" })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, size: 22, color: "2E74B5" })],
  });
}
function bullet(runs, level = 0) {
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80 },
    children,
  });
}
function numbered(runs, level = 0) {
  const children = Array.isArray(runs) ? runs : [new TextRun(runs)];
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 80 },
    children,
  });
}

function chartImage(chartPath, widthDxa = 8640) {
  // widthDxa 8640 = 6 inches; matches one-column page content
  const fs = require('fs');
  const { ImageRun, Paragraph, AlignmentType } = require('docx');
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new ImageRun({
      type: "png",
      data: fs.readFileSync(chartPath),
      transformation: { width: 540, height: 320 },
      altText: { title: "Chart", description: "Audit chart", name: "chart" },
    })],
  });
}

function tr(cells, opts = {}) {
  const { header = false, alt = false, widths, context = null } = opts;
  return new TableRow({
    tableHeader: header,
    children: cells.map((c, i) => {
      const isStr = typeof c === 'string';
      const text = isStr ? c : c.text;
      const align = isStr ? AlignmentType.LEFT : (c.align || AlignmentType.LEFT);
      // Auto-detect status strings and apply color coding
      const statusStyle = isStr && STATUS_STYLES[text.trim()] ? STATUS_STYLES[text.trim()] : null;
      let fill, color, bold;
      if (header) {
        fill = headerFill;
        color = headerTextColor;
        bold = true;
      } else if (statusStyle) {
        fill = statusStyle.fill;
        color = statusStyle.color;
        bold = statusStyle.bold;
      } else {
        fill = alt ? altFill : null;
        color = "000000";
        bold = !isStr && c.bold;
      }
      return new TableCell({
        borders: cellBorders,
        width: { size: widths[i], type: WidthType.DXA },
        ...(fill ? { shading: { fill, type: ShadingType.CLEAR } } : {}),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: statusStyle ? AlignmentType.CENTER : align,
          children: [new TextRun({ text, bold, color, size: 20 })],
        })],
      });
    }),
  });
}

function table(headers, rows, columnWidths) {
  const total = columnWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths,
    rows: [
      tr(headers, { header: true, widths: columnWidths }),
      ...rows.map((r, i) => tr(r, { alt: i % 2 === 1, widths: columnWidths })),
    ],
  });
}

// ==== Document Body (v3-money-page page sequence) ====
//
// v3 page order — see "Worked example: v3 page sequence" markdown section below
// the JS block for the canonical mapping. The sequence is:
//   Page 1     — Money Page                       (moneyPageBlock)
//   Page 2     — Executive Summary + Headline Scorecard  (h1 + p + headlineScorecard)
//   Page 3     — Cross-Channel Overview + Findings Matrix
//   Page 4     — Funnel Health
//   Page 5     — Priority Actions
//   Page 6+    — Per-Channel Pages
//   Page N-2   — Tracking & Attribution Notes
//   Page N-1   — Methodology + Predictions Calibration callout
//   Page N     — Appendix (detailedScorecard + full Triage Summary + tables)
//
const children = [];

// Title block
children.push(new Paragraph({
  spacing: { after: 100 },
  children: [new TextRun({ text: "{CLIENT} — Ads Audit", bold: true, size: 40, color: "1F3864" })],
}));
// ... replace {CLIENT}, {DATE}, {LOOKBACK}, etc. with audit-specific values

// --- Page 1: Money Page (NEW in v3) ---
// Single page, 200-word hard cap. See moneyPageBlock() spec below the JS block.
children.push(moneyPageBlock({
  headline:       "{≤25 words: ~$X/mo at risk OR recoverable. Confidence: HIGH|MEDIUM.}",
  patternFraming: "{≤30 words: dominant-pattern interpretation per the loaded adaptive template}",
  theOneThing:    { /* full 7-field Action Contract — WHAT/WHY/HOW/WHEN/WHO/EXPECTED IMPACT/MEASUREMENT */ },
  theWeek:        ["Mon: …", "Tue: …", "Wed: …", "Thu: …", "Fri: …"],
  footer:         "Detailed scorecard, full findings matrix, and per-channel diagnostics begin on Page 2.",
}));

// --- Page 2: Executive Summary + Headline Scorecard ---
children.push(h1("Executive Summary"));
children.push(p("{1 paragraph, 3 sentences max — YoY trajectory, cause, bright spot}"));

children.push(h2("Headline Scorecard"));
children.push(headlineScorecard({
  profit:   { status: "RED",    subLines: [
    { label: "MER",         value: "{value vs target — derivation method}" },
    { label: "nROAS",       value: "{value vs minimum — confidence label}" },
    { label: "MER trend",   value: "{spend Δ vs revenue Δ — verdict}" },
  ]},
  roles:    { status: "YELLOW", subLines: [
    { label: "TOF spend share", value: "{actual % vs dynamic target band}" },
    { label: "TOF quality",     value: "{CPATC/CPVC/engaged time vs AOV-tier benchmark}" },
    { label: "MOF/BOF",         value: "{retargeting freq + ATC→CO; branded ROAS + attribution ratio}" },
  ]},
  tracking: { status: "RED",    subLines: [
    { label: "UTM hygiene",     value: "{% paid sessions tagged}" },
    { label: "GA4 vs Shopify",  value: "{revenue gap %}" },
    { label: "Duplicate convs", value: "{count + flagged platforms}" },
    { label: "Owned-channel YoY", value: "{Email + SMS revenue delta}" },
  ]},
}));

// --- Page 3: Cross-Channel Overview + Findings Matrix ---
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("Cross-Channel Overview"));
children.push(chartImage(`${evidenceDir}/charts/channel_mix_yoy.png`));
// attribution reconciliation table (Source / Claimed Revenue / % of Shopify Net Sales)

children.push(h2("Findings Matrix"));
// Findings Matrix table — Impact column is dollar-string text with Severity-row-inherited fill.
// Rows must be emitted with row-context so the renderer knows to apply Severity-color
// fill to the Impact cell. See "Findings Matrix Impact rendering" spec below.
//
// Example row emission (pseudo — see helper spec):
//   tr([
//     "1", "RED", "HIGH", "~$22k/mo", "Quick",
//     "Meta CAPI disconnected since Mar 12; conversion volume understated ~38% …",
//     "Tracking-Broken"
//   ], { context: "findings-matrix", severity: "RED", widths: [...] });

// --- Page 4: Funnel Health ---
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("Funnel Health"));
children.push(p("{~150 word diagnosis: TOF funded? TOF quality? MER trend ≥ spend trend?}"));
children.push(chartImage(`${evidenceDir}/charts/funnel_stage_mix.png`));
children.push(chartImage(`${evidenceDir}/charts/mer_vs_spend_trend.png`));
children.push(chartImage(`${evidenceDir}/charts/priority_action_impact_effort.png`));

// --- Page 5: Priority Actions ---
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("Priority Actions"));
// 3-6 actions, each rendered as a 7-field Action Contract table.
// Action #1 is always the same finding the Money Page elaborates as The One Thing
// (full operator-page version here; compact 3-column variant on Page 1).

// --- Page 6+: Per-Channel Pages (role-aware, 1 chart each) ---
// Per RED/YELLOW platform: opener line (role mix) + scorecard row + 1 role-aware chart
//   + diagnosis bullets (role-appropriate KPIs only) + 3 actions.
// GREEN platforms: one-line summary only.
//
// Example usage — Google Ads section:
//   h2("Google Ads"),
//   p("Role mix: TOF 18% / MOF 12% / BOF 70%."),
//   chartImage(`${evidenceDir}/charts/google_spend_roas.png`),    // BOF-dominant → spend_roas_bubble
//   scorecardRow("Google Ads", "YELLOW", "ROAS 2.74× (up 31% YoY), $3k/mo wasted on <1× campaigns"),
//   p("Diagnosis:"),
//   bullet("38% of spend is on sub-1× ROAS campaigns"),
//   bullet("Conversion action change obscures YoY comparison"),
//   bullet("Branded PMax likely cannibalizing branded search"),
//   p("Actions:"),
//   bullet("Pause 4 underperforming campaigns (~$3k/mo reclaim)"),
//   bullet("Reallocate to PMax - Best Sellers and PMax - High AOV"),
//   bullet("Run 2-week branded holdout test"),
//
// `evidenceDir` is the audit's evidence directory; `scorecardRow()` is an app-specific wrapper
// returning a single colored Table row (or Paragraph) that summarizes the platform score.

// --- Page N-2: Tracking & Attribution Notes ---
// --- Page N-1: Methodology + Predictions Calibration callout ---
//   children.push(h1("Methodology + Data Sources"));
//   children.push(p("{calibration callout per outcomes-loop-template.md §5.3}"));
// --- Page N: Appendix ---
//   children.push(new Paragraph({ children: [new PageBreak()] }));
//   children.push(h1("Appendix"));
//   children.push(h2("Detailed Scorecard"));
//   children.push(detailedScorecard({ /* full 8-row Standard or 7-row Degraded variant */ }));
//   // + platform-level Triage Summary (moved out of body in v3) + full campaign tables, etc.

// ==== Build ====
const doc = new Document({
  creator: "Audit Report",
  title: "{CLIENT} — Ads Audit",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: "2E74B5" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Calibri", color: "2E74B5" },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },        // US Letter
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children,
  }],
});

const outPath = process.argv[2];
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote " + outPath);
});
```

---

## Status Color Reference

| Value | Fill | Text | Meaning |
|---|---|---|---|
| `RED` | `#C0392B` | white | Critical / below target |
| `YELLOW` | `#D68910` | white | Below target / at risk |
| `GREEN` | `#229954` | white | On or above target |
| `Delivering` | `#229954` | white | Channel doing its job |
| `Organic` | `#229954` | white | Emerging, producing without formal management |
| `Leaking` | `#D68910` | white | Spending without return |
| `Fatiguing` | `#D68910` | white | Creative saturation |
| `Misaligned` | `#D68910` | white | Wrong optimization event |
| `Too early` | `#7F8C8D` | white | Not enough data |
| `Too-small-to-matter` | `#7F8C8D` | white | <1% of spend |
| `Broken` | `#C0392B` | white | Fundamental misconfiguration |
| `Collapsed` | `#C0392B` | white | YoY decline >50% where it shouldn't |
| `Unmeasurable` | `#C0392B` | white | Can't diagnose due to tracking |

Any cell whose text exactly matches one of these keys auto-applies the fill, text color, bold, and center-alignment. Works across the Scorecard, Channel Role, and Triage Summary tables.

**v3 Confidence cell additions (still in `STATUS_STYLES`):**

| Value | Fill | Text | Meaning |
|---|---|---|---|
| `HIGH` | `#229954` | white, bold | High-confidence finding (Findings Matrix Confidence column) |
| `MEDIUM` | `#D68910` | white, bold | Medium-confidence finding |
| `LOW` | `#7F8C8D` | white, italic | Low-confidence finding (de-emphasized; italic, not bold) |

**Impact column (Findings Matrix) — NO map entry.** Impact cells render dollar-string text (`~$22k/mo`, `~$8-15k/mo`, `directional`) and inherit fill from the row's Severity color via row-context in `tr()`. See "Findings Matrix Impact rendering" below.

---

## v3 Helper Specifications

These are the new top-level docx helpers introduced in v3-money-page. The implementation is in `scripts/build_report.js`; this section is the contract the implementation follows.

### `moneyPageBlock({ headline, patternFraming, theOneThing, theWeek, footer })`

Emits the full Page 1 Money Page in a single call. The Money Page MUST fit on one docx page — the helper appends a `PageBreak` after `footer` so subsequent content starts on Page 2.

```
moneyPageBlock({
  headline:        string,                  // ≤25 words. H1, large font. Dollar amount rendered
                                            //   bold + RED if "at risk", bold + GREEN if "recoverable"
                                            //   (parsed from the headline text — keyword match on "at risk"
                                            //   vs "recoverable"; default to neutral dark-blue if neither).
  patternFraming:  string,                  // ≤30 words. Subtitle / lead paragraph immediately under headline.
                                            //   Italic, slightly muted color (#444 / size 22).
  theOneThing:     ActionContract,          // 7-field Action Contract object. Rendered as a styled action box —
                                            //   bordered (1pt #1F3864) with a shaded background (#F2F4F8) so the
                                            //   block is visually separated from the rest of Page 1. Compact
                                            //   3-column variant (WHAT / WHEN / EXPECTED IMPACT prominent),
                                            //   with the remaining 4 fields (WHY / HOW / WHO / MEASUREMENT)
                                            //   rendered as a compact key-value sidebar/footer that fits inside
                                            //   the same page.
  theWeek:         string[5],               // Mon–Fri. Rendered as a 5-row, 2-column table — left col is the
                                            //   day label (bold), right col is the task. Column widths roughly
                                            //   1100 / 7540 dxa. No row coloring; thin gray borders.
  footer:          string,                  // Cross-reference footer. Italic, small (size 18), light gray.
                                            //   Default value: "Detailed scorecard, full findings matrix, and
                                            //   per-channel diagnostics begin on Page 2."
})
```

**ActionContract shape** (from `reference/synthesis/action-contract.md` Section 2):

```
{
  what:            string,
  why:             string,
  how:             string,
  when:            string,
  who:             string,
  expectedImpact:  string,    // dollar string per dollar-impact-methodology.md;
                              //   Page 1 variant renders this prominently (bold, larger size,
                              //   matching the headline color cue — RED if "at risk", GREEN if
                              //   "recoverable").
  measurement:     string,
}
```

**Headline color-parse rule (deterministic):**

```
if headline.includes("at risk")     → dollar amount = bold, color "C0392B" (RED)
else if headline.includes("recoverable") → dollar amount = bold, color "229954" (GREEN)
else                                → dollar amount = bold, color "1F3864" (neutral)
```

The helper extracts the first `~$X/mo` or `~$X-Y/mo` pattern from `headline` and applies the color treatment to that token only; surrounding words stay in the default H1 styling.

**Page-fit guarantee:** the helper budgets 200 words of content + ~120 dxa of vertical padding; if `headline + patternFraming + theOneThing + theWeek + footer` would overflow a single US Letter page (margin 1080 each side), the helper logs a warning to stderr but still emits — the synthesizer's word-budget gate (synthesizer.md §2.0) is the upstream check.

### `headlineScorecard({ profit, roles, tracking })`

Emits the new 3-row Page 2 scorecard. Each row is a 2-column block: a status-colored cell on the left (single color, full row height), and a stacked list of sub-lines on the right (each sub-line is one row of `label / value`).

```
headlineScorecard({
  profit:    ScorecardRow,    // see shape below
  roles:     ScorecardRow,
  tracking:  ScorecardRow,
})

ScorecardRow = {
  status:   "RED" | "YELLOW" | "GREEN",     // the WORST severity among the row's sub-dimensions —
                                            //   computed by the synthesizer per synthesizer.md §2.2.
                                            //   The renderer just receives the resolved color value
                                            //   and applies it to the left cell.
  subLines: Array<{ label: string, value: string }>,   // 3 entries for Profit and Roles; 4 for Tracking.
                                                       //   Renderer does NOT enforce count — synthesizer owns it.
}
```

**Layout:**

| Left cell (status fill) | Right cell (sub-lines stacked) |
|---|---|
| Status keyword centered, white text, bold (e.g. "RED"). Cell width ≈ 1400 dxa, full row height. | One paragraph per sub-line: `**{label}:** {value}` with size 20, spacing.after = 60. Cell width ≈ 7240 dxa. |

The renderer pulls the status fill from `STATUS_STYLES[status]` (so RED/YELLOW/GREEN reuse the existing palette) and applies `bold: true, color: "FFFFFF", center-aligned` to the left cell text. Right cell uses the standard body font with the label rendered bold and the value plain.

Three rows total (one per dimension); each row uses the layout above. Row spacing: 80 dxa above and below.

### `detailedScorecard({ rows, variant })`

Renders the full 8-row Standard / 7-row Degraded scorecard moved out of the body in v3. **Appendix-only — never include this in the body.**

```
detailedScorecard({
  rows:    Array<{ dimension: string, status: "RED"|"YELLOW"|"GREEN", signal: string, meaning: string }>,
  variant: "standard" | "degraded",   // standard = 8 rows; degraded = 7 rows (Profit rows 1-3
                                      //   collapse to a single MER + MER-trend row, plus a Data Gaps row).
})
```

This helper is the renamed v2 scorecard renderer (formerly the inline `table(["Dimension","Status","Signal","What it means"], [...])` call in the v2 body). The internal implementation is unchanged from v2 — it's the same 4-column color-coded table; the rename clarifies that it now belongs to the appendix. Status column auto-colors via the existing `STATUS_STYLES` map; no row-context needed.

Column widths: `[2500, 1200, 2900, 2760]` (matches v2). Header row: `["Dimension", "Status", "Signal", "What it means"]`.

---

## Findings Matrix Impact rendering — row-context spec

The Findings Matrix is the only table in the report that needs `tr()` to know which table it's emitting a row for. Impact cells in a Findings Matrix row render as dollar-string text with a fill that matches the row's Severity color — not via a `STATUS_STYLES` lookup.

**Calling convention:**

```
tr(cells, {
  widths:    [...],
  context:   "findings-matrix",
  severity:  "RED" | "YELLOW" | "GREEN",   // the row's Severity value — used by the
                                           //   renderer to look up the Impact-cell fill
})
```

**Renderer behavior when `context === "findings-matrix"`:**

For each cell, the renderer detects whether the cell is the Impact column (column index 3 under the canonical schema in `reference/synthesis/findings-matrix.md` §1: `# / Severity / Confidence / Impact / Effort / Finding / Pattern tag`). When emitting the Impact cell:

```
fill   = STATUS_STYLES[severity].fill   // "C0392B" for RED, "D68910" for YELLOW, "229954" for GREEN
color  = "FFFFFF"
bold   = false                          // weight uniform across magnitudes — text carries the magnitude
text   = the dollar string itself       // e.g. "~$22k/mo", "~$8-15k/mo", "directional"
align  = AlignmentType.CENTER
```

For all OTHER cells in the row, the existing auto-detect logic runs unchanged — the Severity cell hits `STATUS_STYLES["RED"]`, the Confidence cell hits `STATUS_STYLES["HIGH"]`, etc. The Effort and Pattern tag cells render as plain text per `findings-matrix.md` §3.

**Why row-context (vs string-match):** the Impact text is a free-form dollar string (different value on every row), so `STATUS_STYLES` can't cover it via the existing exact-match auto-detect. Passing `severity` through the row-context lets the renderer apply the row's RAG color to the Impact cell without a per-row lookup table. Implementation detail — the synthesizer or a wrapper helper (`findingsMatrixRow(...)`) is the natural place to call `tr()` with `context: "findings-matrix"` set.

**Other tables (`scorecard`, `Channel Role vs Reality`, `Triage Summary`, `detailedScorecard`):** call `tr()` without `context` — existing string-match behavior applies.

---

## v3 page sequence (worked example)

The v3 body sequence from synthesizer.md §2 maps to the docx as follows:

| Page | Section(s) | Helpers called |
|---|---|---|
| **Page 1** | 2.0 Money Page | `moneyPageBlock(...)` |
| **Page 2** | 2.1 Executive Summary + 2.2 Headline Scorecard | `h1` + `p` + `h2` + `headlineScorecard(...)` |
| **Page 3** | 2.3 Cross-Channel Overview + 2.4 Findings Matrix | `h1` + `chartImage(channel_mix_yoy)` + reconciliation `table(...)` + `h2` + Findings Matrix `table(...)` (rows emitted with `context: "findings-matrix"`) |
| **Page 4** | 2.5 Funnel Health | `h1` + `p` + `chartImage(funnel_stage_mix)` + `chartImage(mer_vs_spend_trend)` + `chartImage(priority_action_impact_effort)` |
| **Page 5** | 2.6 Priority Actions | `h1` + 3-6 Action Contract `table(...)` calls (full 7-field operator-page variant) |
| **Page 6+** | 2.7 Per-Channel Pages | `h2` + role-mix `p` + `chartImage(...)` (1 chart, role-aware) + diagnosis bullets + actions bullets, one section per RED/YELLOW platform |
| **Page N-2** | 2.8 Tracking & Attribution Notes | `h1` + `p` + bullets |
| **Page N-1** | 2.9 Methodology + Predictions Calibration callout | `h1` + `p` (calibration callout per outcomes-loop-template.md §5.3) + adaptive-template note |
| **Page N** | 2.10 Appendix | `h1` + `h2("Detailed Scorecard")` + `detailedScorecard(...)` + Channel Role vs Reality `table(...)` + Triage Summary `table(...)` + 30/60/90 + Weekly KPIs + full campaign tables |

Page breaks are inserted via `new Paragraph({ children: [new PageBreak()] })` between pages where the natural section break wouldn't already produce one — Page 1 → 2, Page 2 → 3, Page 5 → 6 (before Per-Channel Pages), and N-1 → N (before Appendix) are the explicit ones.

**Chart placement (per synthesizer.md §"Chart layering rules"):** Money Page carries `mer_vs_spend_trend` only as the single anchor chart; Page 2 carries `channel_mix_yoy`; Page 4 carries the 3-chart Funnel Health stack; per-channel pages get 1 chart each, role-aware. The cut `findings_matrix_heatmap` chart is GONE — the Findings Matrix table itself replaces it. Charts not surfaced in the body still ship in the appendix per the synthesizer's chart layering rules.

---

## Validation

After building:
```bash
python scripts/office/validate.py /path/to/output.docx
```

Should print `All validations PASSED!`.

If rendering is critical (presenting to client), rasterize page 2 or 3 to confirm colors applied:
```bash
python scripts/office/soffice.py --headless --convert-to pdf /path/to/output.docx
pdftoppm -jpeg -r 110 -f 2 -l 2 /path/to/output.pdf /path/to/page
```
