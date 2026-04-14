# DOCX Report Template — Ads Audit

Use this template when generating a Word version of the ads-audit report. Includes reusable status-color helpers so tables auto-render RED/YELLOW/GREEN/GRAY cells based on the Status value.

**Prerequisites:**
- `npm install -g docx` (the docx-js package)
- The docx skill (read `anthropic-skills:docx` first for general docx best practices)

**Workflow:**
1. Write evidence JSONs during deep-dives (already happens)
2. Generate the report as markdown for internal review
3. For Agency/Prospect deliverables, render to DOCX using the template below
4. Validate with `scripts/office/validate.py`

---

## Template: build_report.js

Save this to the outputs directory, adapt the `children` array with audit-specific content, then run `node build_report.js {output-path}`.

```javascript
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak
} = require('docx');

// ==== Theme ====
const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const headerFill = "1F3864";
const headerTextColor = "FFFFFF";
const altFill = "F2F2F2";

// ==== Status Color Map (the key feature) ====
// Auto-applied to any cell whose text exactly matches a key below.
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

function tr(cells, opts = {}) {
  const { header = false, alt = false, widths } = opts;
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

// ==== Document Body ====
const children = [];

// Title block
children.push(new Paragraph({
  spacing: { after: 100 },
  children: [new TextRun({ text: "{CLIENT} — Ads Audit", bold: true, size: 40, color: "1F3864" })],
}));
// ... replace {CLIENT}, {DATE}, {LOOKBACK}, etc. with audit-specific values

// --- 1. Executive Summary ---
children.push(h1("Executive Summary"));
children.push(p("{One-paragraph story: YoY trajectory, what's actually driving it, bright spot, biggest red flag}"));

// --- 2. Marketing Director Overview ---
children.push(h1("Marketing Director Overview"));
children.push(p("What a marketing director would look at first to decide what to do next.",
  { run: { italics: true, size: 20 } }));

// 2.1 Scorecard
children.push(h3("Account Scorecard"));
children.push(table(
  ["Dimension", "Status", "Signal", "What it means"],
  [
    ["Paid media efficiency", "YELLOW", "{signal}", "{interpretation}"],
    ["Owned channel health", "RED", "{signal}", "{interpretation}"],
    ["Tracking integrity", "RED", "{signal}", "{interpretation}"],
    ["Growth trajectory", "YELLOW", "{signal}", "{interpretation}"],
    ["Unit economics (AOV)", "YELLOW", "{signal}", "{interpretation}"],
    ["Financial measurement", "RED", "{signal}", "{interpretation}"],
  ],
  [2500, 1200, 2900, 2760],
));

// 2.2 Channel Role vs Reality
children.push(h3("Channel Role vs Reality"));
children.push(table(
  ["Channel", "Role", "Status", "Notes"],
  [
    // one row per channel — status auto-colored
    // ["Google PMax", "Growth / harvest", "Delivering", "ROAS 4.36×"],
    // ["Email (Attentive)", "Retention / LTV", "Collapsed", "-93% YoY"],
  ],
  [2800, 1800, 1400, 3360],
));

// 2.3 Paid Media Allocation
children.push(h3("Paid Media Allocation — Where does the ${TOTAL} go?"));
children.push(table(
  ["Tier", "Spend", "% of Paid", "Campaigns"],
  [
    ["Working — above target", "$X", "X%", "..."],
    ["Acceptable — near target", "$X", "X%", "..."],
    ["Underperforming — at-risk", "$X", "X%", "..."],
    ["Wasted / Diagnostic", "$X", "X%", "..."],
  ],
  [2800, 1400, 1400, 3760],
));

// 2.4 Top Risks — numbered list
children.push(h3("Top Risks"));
// numbered([new TextRun({ text: "Risk name. ", bold: true }), new TextRun("Explanation and action.")])

// 2.5 30/60/90
children.push(h3("30 / 60 / 90 Plan"));
children.push(p("Next 30 days (tracking + triage)", { run: { bold: true, size: 22 } }));
// bullet list of 30-day actions
children.push(p("Next 60 days (reallocation + rebuild)", { run: { bold: true, size: 22 }, spacing: { before: 160 } }));
// bullet list of 60-day actions
children.push(p("Next 90 days (optimization + strategy)", { run: { bold: true, size: 22 }, spacing: { before: 160 } }));
// bullet list of 90-day actions

// 2.6 Weekly KPIs
children.push(h3("Weekly KPIs to Watch"));
children.push(table(
  ["Metric", "Current", "Target / Watch"],
  [
    // ["Blended MER", "4.37×", "Hold ≥ 4.0×"],
  ],
  [3800, 1700, 3860],
));

// 2.7 Data Gaps
children.push(h3("Data Gaps to Close"));
// bullet list

// --- 3. YoY Context (always included — YoY is default now) ---
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("Year-over-Year Context"));
// YoY totals table + channel breakdown table + 5-6 "what actually happened" numbered findings

// --- 4. Triage Summary (brief) ---
children.push(h1("Triage Summary"));
children.push(table(
  ["Platform", "Score", "Headline Metric", "Root Issue"],
  [
    // ["Google Ads", "RED", "ROAS 2.53× vs 3.5× target", "Duplicate conversion actions"],
    // Status column auto-colored
  ],
  [1700, 1100, 2800, 3760],
));

// --- 5. Platform Deep Dives (reference material) ---
// Per RED/YELLOW platform: h1 + campaign table + conversion action table + findings + fix list

// --- 6. Cross-Channel Patterns (if detected) ---

// --- 7. Methodology ---

// ==== Build ====
const doc = new Document({
  creator: "Disruptive Advertising",
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
