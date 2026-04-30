#!/usr/bin/env node
/**
 * build_audit_pdf.js — Databox Audit v4 PDF renderer.
 *
 * Pipeline: spec.json → 15-slide .pptx → LibreOffice headless → final .pdf.
 *
 * Usage:
 *   node build_audit_pdf.js --input <spec.json> --output <client.pdf>
 *
 * The intermediate .pptx is written to a temp dir and deleted after PDF render.
 *
 * Requires: pptxgenjs (npm install pptxgenjs in this scripts/ folder, or globally),
 *           and LibreOffice on PATH (or installed at the macOS default path).
 */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

// ---------------------------------------------------------------------------
// pptxgenjs resolution. Try local node_modules first, then a sibling
// /tmp/pptx-deps used by the test harness, then a global install.
// ---------------------------------------------------------------------------
function loadPptxgen() {
  const candidates = [
    path.join(__dirname, "node_modules", "pptxgenjs"),
    path.join(__dirname, "..", "node_modules", "pptxgenjs"),
    "/tmp/pptx-deps/node_modules/pptxgenjs",
    "pptxgenjs",
  ];
  for (const c of candidates) {
    try {
      return require(c);
    } catch (_) { /* try next */ }
  }
  throw new Error(
    "pptxgenjs not found. Run `npm install pptxgenjs` in " + __dirname + " (or globally)."
  );
}
const pptxgen = loadPptxgen();

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input" || a === "-i") args.input = argv[++i];
    else if (a === "--output" || a === "-o") args.output = argv[++i];
    else if (a === "--help" || a === "-h") {
      console.log("Usage: build_audit_pdf.js --input <spec.json> --output <client.pdf>");
      process.exit(0);
    }
  }
  if (!args.input || !args.output) {
    console.error("ERROR: --input and --output are both required.");
    console.error("Usage: build_audit_pdf.js --input <spec.json> --output <client.pdf>");
    process.exit(2);
  }
  if (!fs.existsSync(args.input)) {
    console.error(`ERROR: input spec not found: ${args.input}`);
    process.exit(2);
  }
  return args;
}

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------
const FONT_HEAD = "Georgia";
const FONT_BODY = "Calibri";
// NOTE: total slide count is no longer fixed — it's determined at render time
// from the deck queue (in-scope platforms only).

// Status colors are LOCKED — they have semantic meaning across all decks.
const STATUS = {
  RED:    "C4453A",
  GREEN:  "2D7A5F",
  YELLOW: "D4A23B",
};

function makePalette(theme) {
  return {
    ink:    theme.dark || "1A2A44",
    cream:  theme.background || "F7F4ED",
    accent: theme.accent || "8E5B3A",
    gray:   "6B6F7B",
    light:  "D9D5CB",
    white:  "FFFFFF",
    red:    STATUS.RED,
    green:  STATUS.GREEN,
    gold:   STATUS.YELLOW,
  };
}

function statusColor(C, status) {
  if (!status) return C.gray;
  const s = String(status).toUpperCase();
  if (s === "RED")    return C.red;
  if (s === "GREEN")  return C.green;
  if (s === "YELLOW") return C.gold;
  return C.gray;
}

function statusGlyph(status) {
  const s = String(status || "").toUpperCase();
  if (s === "GREEN")  return "✓";
  if (s === "YELLOW") return "!";
  if (s === "RED")    return "✕";
  return "·";
}

// Forgiving numeric coercion ("$1,200" → 1200, "2.42×" → 2.42).
function numish(v) {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const m = String(v).replace(/[, ]/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

// ---------------------------------------------------------------------------
// Common slide elements
// ---------------------------------------------------------------------------
function footer(pres, slide, C, theme, slideNum, total) {
  slide.addText(
    [
      {
        text: ((theme.client || "") + "  |  MARKETING AUDIT  |  " + (theme.period || "")).toUpperCase(),
        options: { color: C.gray, fontSize: 8, charSpacing: 2 },
      },
    ],
    { x: 0.4, y: 5.30, w: 7, h: 0.25, fontFace: FONT_BODY, margin: 0 }
  );
  slide.addText(String(slideNum).padStart(2, "0") + " / " + String(total).padStart(2, "0"), {
    x: 8.8, y: 5.30, w: 0.8, h: 0.25, fontFace: FONT_BODY, fontSize: 8, color: C.gray, align: "right", margin: 0,
  });
  slide.addShape(pres.shapes.LINE, { x: 0.4, y: 5.25, w: 9.2, h: 0, line: { color: C.light, width: 0.5 } });
}

function eyebrow(slide, C, x, y, w, text) {
  slide.addText(text, {
    x, y, w, h: 0.25,
    fontFace: FONT_BODY, fontSize: 9, bold: true,
    color: C.accent, charSpacing: 4, margin: 0,
  });
}

// ---------------------------------------------------------------------------
// SLIDE 1 — COVER
// ---------------------------------------------------------------------------
function slideCover(pres, C, theme, lookback) {
  const s = pres.addSlide();
  s.background = { color: C.ink };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.accent }, line: { color: C.accent, width: 0 } });

  s.addText("MARKETING AUDIT", {
    x: 0.7, y: 0.55, w: 6, h: 0.35, fontFace: FONT_BODY, fontSize: 11, bold: true,
    color: C.cream, charSpacing: 6, margin: 0,
  });

  s.addText(theme.client || "[Client]", {
    x: 0.7, y: 1.3, w: 8.6, h: 1.4, fontFace: FONT_HEAD, fontSize: 60, color: C.cream, margin: 0,
  });

  s.addText("A diagnostic of paid + cross-channel performance.\nWhat's working, what's leaking, and what to fix first.", {
    x: 0.7, y: 2.85, w: 8.5, h: 1.0, fontFace: FONT_HEAD, fontSize: 18, italic: true, color: C.cream, margin: 0,
  });

  s.addShape(pres.shapes.LINE, { x: 0.7, y: 4.1, w: 1.5, h: 0, line: { color: C.accent, width: 1.5 } });

  const range = (lookback && lookback.current_start && lookback.current_end)
    ? `${lookback.current_start} → ${lookback.current_end}`
    : "[Date Range]";
  const yoy = (lookback && lookback.yoy_start && lookback.yoy_end)
    ? `YoY vs ${lookback.yoy_start} → ${lookback.yoy_end}`
    : "YoY vs [Prior Year]";

  s.addText(`Prepared by ${theme.agency || "[Agency]"}   ·   Lookback ${range}   ·   ${yoy}`, {
    x: 0.7, y: 4.25, w: 8.5, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: C.cream, margin: 0,
  });

  s.addText((theme.period || "[Month] [Year]").toUpperCase(), {
    x: 0.7, y: 4.85, w: 8, h: 0.3, fontFace: FONT_BODY, fontSize: 10, color: C.gold, charSpacing: 4, bold: true, margin: 0,
  });
}

// ---------------------------------------------------------------------------
// SLIDE 2 — EXECUTIVE SUMMARY
// ---------------------------------------------------------------------------
function slideExecSummary(pres, C, theme, exec, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "EXECUTIVE SUMMARY");
  s.addText("The bottom line.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 36, color: C.ink, margin: 0,
  });
  s.addText("Three numbers that decide whether this account is healthy.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const headline = exec.headline_metric || {};
  const unit = exec.unit_math || {};
  const leak = exec.leak || {};

  const cols = [
    {
      x: 0.4,
      big: headline.value || "[X.XX×]",
      fs: 44,
      label: (headline.label || "BLENDED MER").toUpperCase(),
      body: `Shopify revenue ÷ total paid spend. Target: ${headline.target || "[X.X×]"} (breakeven at ${headline.breakeven || "[Y.Y×]"}).`,
    },
    {
      x: 3.6,
      big: `${unit.cpa || "[$XX]"} vs ${unit.aov || "[$YY]"}`,
      fs: 32,
      label: "CPA  vs  AOV",
      body: unit.interpretation
        ? unit.interpretation
        : `If CPA > AOV, every new order loses money on first purchase. Gap: ${unit.gap || "[+/-$Z]"} per order.`,
    },
    {
      x: 6.8,
      big: leak.pct || "[XX]%",
      fs: 44,
      label: "SPEND BELOW BREAKEVEN",
      body: leak.interpretation
        ? leak.interpretation
        : `${leak.pct || "[X]%"} of paid spend (~${leak.monthly_dollars || "[$Y,YYY]/mo"}) is sitting on lines below breakeven ROAS.`,
    },
  ];
  cols.forEach((c) => {
    s.addText(c.big, { x: c.x, y: 1.95, w: 3.0, h: 0.85, fontFace: FONT_HEAD, fontSize: c.fs, color: C.ink, margin: 0, valign: "middle" });
    s.addText(c.label, { x: c.x, y: 2.85, w: 3.0, h: 0.3, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: c.x, y: 3.20, w: 0.6, h: 0, line: { color: C.ink, width: 1 } });
    s.addText(c.body, { x: c.x, y: 3.30, w: 2.95, h: 1.2, fontFace: FONT_BODY, fontSize: 10.5, color: C.gray, margin: 0, paraSpaceAfter: 4 });
  });

  // "Our plan" callout band
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.55, w: 9.2, h: 0.65, fill: { color: C.ink }, line: { color: C.ink, width: 0 } });
  s.addText([
    { text: "OUR PLAN  ", options: { bold: true, color: C.gold, charSpacing: 3 } },
    { text: exec.plan_one_sentence || "[One-sentence plan + 3-month target.]", options: { color: C.cream } },
  ], { x: 0.6, y: 4.55, w: 8.8, h: 0.65, fontFace: FONT_BODY, fontSize: 11, valign: "middle", margin: 0 });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDE 3 — CURRENT STATE
// ---------------------------------------------------------------------------
function slideCurrentState(pres, C, theme, current, lookback, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "CURRENT STATE  ·  LAST 90 DAYS");
  s.addText("Where the account stands today.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  const range = (lookback && lookback.current_start && lookback.current_end)
    ? `${lookback.current_start} – ${lookback.current_end}`
    : "[Start Date] – [End Date]";
  s.addText(`${range}   ·   Source: Databox (Meta, Google, Amazon, Shopify, GA4)`, {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 11, italic: true, color: C.gray, margin: 0,
  });

  const txCount = current.transactions != null ? current.transactions.toLocaleString() : "[X,XXX]";
  const tinyStats = [
    { x: 0.4, big: current.total_spend     || "[$XX,XXX]", label: "TOTAL PAID SPEND",     body: "≈ daily across paid platforms." },
    { x: 2.7, big: current.claimed_revenue || "[$XX,XXX]", label: "PLATFORM-CLAIMED REV", body: "Sum of platform-attributed; ~60–75% is unique." },
    { x: 5.0, big: txCount,                                label: "TOTAL TRANSACTIONS",    body: "Site-wide. Paid drives the majority of orders." },
    { x: 7.3, big: current.blended_mer     || "[X.X×]",    label: "BLENDED MER",            body: "Shopify ÷ paid. vs target." },
  ];
  tinyStats.forEach((t) => {
    s.addText(t.big, { x: t.x, y: 1.7, w: 2.2, h: 0.6, fontFace: FONT_HEAD, fontSize: 28, color: C.ink, margin: 0 });
    s.addText(t.label, { x: t.x, y: 2.30, w: 2.2, h: 0.25, fontFace: FONT_BODY, fontSize: 8.5, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
    s.addText(t.body,  { x: t.x, y: 2.55, w: 2.2, h: 0.55, fontFace: FONT_BODY, fontSize: 9.5, color: C.gray, margin: 0 });
  });

  // Trend chart — weekly spend
  const weekly = Array.isArray(current.weekly_spend) && current.weekly_spend.length
    ? current.weekly_spend
    : [4200, 5800, 7200, 9100, 11000, 12500, 11200, 9400, 7800, 6500, 6100, 5900, 6300];
  const weekLabels = weekly.map((_, i) => "W" + (i + 1));

  s.addText(`Weekly paid spend  ·  ${weekly.length} weeks`, {
    x: 0.4, y: 3.20, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.ink, charSpacing: 2, margin: 0,
  });
  s.addChart(pres.charts.LINE, [
    { name: "Spend", labels: weekLabels, values: weekly },
  ], {
    x: 0.4, y: 3.5, w: 9.2, h: 1.55,
    chartColors: [C.ink],
    chartArea: { fill: { color: C.cream }, roundedCorners: false },
    catAxisLabelColor: C.gray, catAxisLabelFontSize: 8,
    valAxisLabelColor: C.gray, valAxisLabelFontSize: 8,
    valGridLine: { color: C.light, size: 0.5 }, catGridLine: { style: "none" },
    lineSize: 2.5, lineSmooth: true, showLegend: false,
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDE 4 — DIAGNOSIS
// ---------------------------------------------------------------------------
function slideDiagnosis(pres, C, theme, diagnosis, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "DIAGNOSIS");
  s.addText(diagnosis.title || "Why the math doesn't work.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  s.addText("Four root causes — each fixable, all compounding to drag MER below target.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const causes = (diagnosis.causes || []).slice(0, 4);
  while (causes.length < 4) causes.push({ n: String(causes.length + 1).padStart(2, "0"), title: "[—]", body: "" });

  causes.forEach((c, i) => {
    const cx = 0.4 + (i % 2) * 4.7;
    const cy = 1.85 + Math.floor(i / 2) * 1.65;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.5, h: 1.45, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addText(c.n || String(i + 1).padStart(2, "0"), { x: cx + 0.2, y: cy + 0.15, w: 0.6, h: 0.4, fontFace: FONT_HEAD, fontSize: 22, color: C.accent, italic: true, margin: 0 });
    s.addText(c.title || "", { x: cx + 0.85, y: cy + 0.18, w: 3.5, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, color: C.ink, margin: 0 });
    s.addText(c.body  || "", { x: cx + 0.2, y: cy + 0.65, w: 4.15, h: 0.75, fontFace: FONT_BODY, fontSize: 10, color: C.gray, margin: 0 });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDE 5 — CROSS-PLATFORM COMPARISON
// ---------------------------------------------------------------------------
function slideCrossPlatform(pres, C, theme, cp, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "CROSS-PLATFORM COMPARISON");
  s.addText("Same site, same checkout —\nbut not the same audience.", {
    x: 0.4, y: 0.6, w: 9, h: 1.3, fontFace: FONT_HEAD, fontSize: 28, color: C.ink, margin: 0,
  });

  const cvr = cp.cvr_by_source || {};
  const labels = Object.keys(cvr);
  const values = labels.map((k) => numish(cvr[k]));

  s.addText("Conversion rate by traffic source", {
    x: 0.4, y: 2.0, w: 5.5, h: 0.25, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.ink, charSpacing: 2, margin: 0,
  });
  s.addChart(pres.charts.BAR, [
    { name: "CVR %", labels, values },
  ], {
    x: 0.3, y: 2.25, w: 5.6, h: 2.7, barDir: "bar",
    chartColors: [C.ink],
    chartArea: { fill: { color: C.cream } },
    catAxisLabelColor: C.gray, catAxisLabelFontSize: 9,
    valAxisLabelColor: C.gray, valAxisLabelFontSize: 8,
    valAxisLabelFormatCode: "0.0",
    valGridLine: { color: C.light, size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.ink, dataLabelFontSize: 9,
    dataLabelFormatCode: "0.0\"%\"",
    showLegend: false,
  });

  s.addText("WHAT THIS MEANS", { x: 6.2, y: 2.0, w: 3.4, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  s.addText("The buyer audience exists.", { x: 6.2, y: 2.25, w: 3.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 18, color: C.ink, margin: 0 });
  s.addText(cp.interpretation || "Same site, same checkout — the audience exists, the targeting is wrong.", {
    x: 6.2, y: 2.85, w: 3.4, h: 0.9, fontFace: FONT_BODY, fontSize: 11, color: C.gray, margin: 0,
  });

  // Side stats
  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 3.85, w: 1.6, h: 1.05, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
  s.addText(cp.new_customer_rate_meta || "[XX]%", { x: 6.2, y: 3.90, w: 1.6, h: 0.45, fontFace: FONT_HEAD, fontSize: 22, color: C.ink, align: "center", margin: 0 });
  s.addText("NEW-CUSTOMER\nRATE — META", { x: 6.2, y: 4.35, w: 1.6, h: 0.5, fontFace: FONT_BODY, fontSize: 8, bold: true, color: C.accent, charSpacing: 1, align: "center", margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, { x: 8.0, y: 3.85, w: 1.6, h: 1.05, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
  s.addText(cp.overlap_pct || "[XX]%", { x: 8.0, y: 3.90, w: 1.6, h: 0.45, fontFace: FONT_HEAD, fontSize: 22, color: C.ink, align: "center", margin: 0 });
  s.addText("OVERLAP\n(PAID-CLAIMED vs SHOPIFY)", { x: 8.0, y: 4.35, w: 1.6, h: 0.5, fontFace: FONT_BODY, fontSize: 7, bold: true, color: C.accent, charSpacing: 1, align: "center", margin: 0 });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDE 6 — SPEND ALLOCATION
// ---------------------------------------------------------------------------
function slideSpendAllocation(pres, C, theme, alloc, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "SPEND ALLOCATION");
  s.addText("Where the money is going.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  s.addText("Across paid channels — concentration, leakage, and the working line.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const byPlatform = alloc.by_platform || { Google: 60, Meta: 30, Amazon: 8, Other: 2 };
  const labels = Object.keys(byPlatform);
  const values = labels.map((k) => numish(byPlatform[k]));

  s.addChart(pres.charts.DOUGHNUT, [{
    name: "Spend", labels, values,
  }], {
    x: 0.3, y: 1.85, w: 4.2, h: 3.2,
    chartColors: [C.ink, C.accent, C.gold, C.light, C.gray],
    showLegend: true, legendPos: "b", legendFontSize: 9, legendColor: C.gray,
    showPercent: true, dataLabelColor: C.white, dataLabelFontSize: 10,
    chartArea: { fill: { color: C.cream } },
  });
  s.addText("% OF PAID SPEND BY PLATFORM", { x: 0.3, y: 1.85, w: 4.2, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 2, align: "center", margin: 0 });

  const callouts = [
    {
      y: 1.85, color: C.red,
      big: alloc.below_breakeven_pct || "[XX]%",
      label: "OF SPEND BELOW BREAKEVEN",
      body: alloc.below_breakeven_dollars
        ? `${alloc.below_breakeven_dollars}/mo on lines under breakeven ROAS. The leak.`
        : "Sitting on lines under breakeven ROAS. The leak.",
    },
    {
      y: 2.95, color: C.gold,
      big: alloc.concentration_pct || "[XX]%",
      label: "CONCENTRATION RISK",
      body: alloc.concentration_interpretation || "Single-campaign concentration risk.",
    },
    {
      y: 4.05, color: C.green,
      big: alloc.working_line_pct || "[XX]%",
      label: "SPEND ON THE WORKING LINE",
      body: alloc.working_line_interpretation || "Profitable line — under-funded.",
    },
  ];
  callouts.forEach((c) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 4.7, y: c.y, w: 4.9, h: 1.0, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 4.7, y: c.y, w: 0.10, h: 1.0, fill: { color: c.color }, line: { color: c.color, width: 0 } });
    s.addText(c.big, { x: 4.95, y: c.y + 0.10, w: 1.6, h: 0.55, fontFace: FONT_HEAD, fontSize: 24, color: c.color, margin: 0 });
    s.addText(c.label, { x: 4.95, y: c.y + 0.65, w: 4.5, h: 0.25, fontFace: FONT_BODY, fontSize: 8.5, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
    s.addText(c.body,  { x: 6.55, y: c.y + 0.10, w: 2.95, h: 0.80, fontFace: FONT_BODY, fontSize: 10, color: C.gray, margin: 0 });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDE 7 — FOUNDATION (store + tracking)
// ---------------------------------------------------------------------------
function slideFoundation(pres, C, theme, foundation, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "THE FOUNDATION  ·  STORE  +  ATTRIBUTION");
  s.addText("Is the data we're auditing trustworthy?", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 28, color: C.ink, margin: 0,
  });
  s.addText("Shopify + GA4 anchor every metric on the previous slides. If they're broken, the rest is noise.", {
    x: 0.4, y: 1.30, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 11, italic: true, color: C.gray, margin: 0,
  });

  const storeStats = [
    { x: 0.4, big: foundation.site_cvr         || "[X.X]%",   label: "SITE-WIDE CVR",         body: "Shopify sessions → orders." },
    { x: 3.6, big: foundation.new_vs_returning || "[XX/YY]",  label: "NEW vs RETURNING",      body: "Revenue split. Healthy DTC: 60/40 → 70/30." },
    { x: 6.8, big: foundation.top_sku_pct      || "[XX]%",    label: "TOP-SKU CONCENTRATION", body: "Stockout risk = single point of failure." },
  ];
  storeStats.forEach((c) => {
    s.addText(c.big, { x: c.x, y: 1.75, w: 3.0, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0, valign: "middle" });
    s.addText(c.label, { x: c.x, y: 2.45, w: 3.0, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
    s.addText(c.body,  { x: c.x, y: 2.72, w: 2.95, h: 0.7, fontFace: FONT_BODY, fontSize: 10, color: C.gray, margin: 0 });
  });

  s.addText("TRACKING HEALTH", { x: 0.4, y: 3.65, w: 9, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });

  const checks = (foundation.tracking || []).slice(0, 4);
  while (checks.length < 4) checks.push({ label: "—", status: "GREEN", body: "" });

  checks.forEach((t, i) => {
    const x = 0.4 + i * 2.30;
    const c = statusColor(C, t.status);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.95, w: 2.20, h: 1.10, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addShape(pres.shapes.OVAL,      { x: x + 0.15, y: 4.10, w: 0.36, h: 0.36, fill: { color: c }, line: { color: c, width: 0 } });
    s.addText(statusGlyph(t.status), { x: x + 0.15, y: 4.10, w: 0.36, h: 0.36, fontFace: FONT_HEAD, fontSize: 16, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(t.label || "", { x: x + 0.60, y: 4.10, w: 1.55, h: 0.40, fontFace: FONT_BODY, fontSize: 10.5, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(t.body  || "", { x: x + 0.15, y: 4.55, w: 2.0, h: 0.45, fontFace: FONT_BODY, fontSize: 9, color: C.gray, margin: 0 });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// SLIDES 8-10 (when all in scope) — PER-PLATFORM (Google, Meta, Amazon)
//
// Caller is responsible for filtering: a platform with `in_scope: false`
// is dropped from the render queue entirely; this builder is never invoked
// for it. The deck length and footer numbering shrink accordingly.
// ---------------------------------------------------------------------------
function slidePlatform(pres, C, theme, name, p, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "PER-PLATFORM STATUS");
  s.addText(name, { x: 0.4, y: 0.65, w: 7.5, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0 });

  const sc = statusColor(C, p.status);

  s.addShape(pres.shapes.RECTANGLE, { x: 8.2, y: 0.7, w: 1.4, h: 0.4, fill: { color: sc }, line: { color: sc, width: 0 } });
  s.addText(String(p.status || "").toUpperCase(), { x: 8.2, y: 0.7, w: 1.4, h: 0.4, fontFace: FONT_BODY, fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle", charSpacing: 3, margin: 0 });

  s.addText(p.root_cause || "", {
    x: 0.4, y: 1.30, w: 9.2, h: 0.4, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  s.addText(p.headline || "", { x: 0.4, y: 1.95, w: 4.4, h: 1.4, fontFace: FONT_HEAD, fontSize: 60, color: sc, margin: 0, valign: "middle" });
  s.addText(p.label || "", { x: 0.4, y: 3.30, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  s.addText("Target: " + (p.target || ""), { x: 0.4, y: 3.60, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: C.gray, italic: true, margin: 0 });

  s.addText("DIAGNOSTICS", { x: 5.0, y: 1.95, w: 4.5, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  const diags = (p.diagnostics || []).slice(0, 2);
  while (diags.length < 2) diags.push("");
  s.addText("•  " + diags[0], { x: 5.0, y: 2.25, w: 4.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.ink, margin: 0 });
  s.addText("•  " + diags[1], { x: 5.0, y: 2.80, w: 4.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.ink, margin: 0 });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.10, w: 9.2, h: 1.05, fill: { color: C.ink }, line: { color: C.ink, width: 0 } });
  s.addText("ACTIONS THIS WEEK", { x: 0.6, y: 4.18, w: 4, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.gold, charSpacing: 3, margin: 0 });
  const actions = (p.actions || []).slice(0, 2);
  while (actions.length < 2) actions.push("");
  s.addText("→  " + actions[0], { x: 0.6, y: 4.42, w: 8.8, h: 0.32, fontFace: FONT_BODY, fontSize: 11, color: C.cream, margin: 0 });
  s.addText("→  " + actions[1], { x: 0.6, y: 4.74, w: 8.8, h: 0.32, fontFace: FONT_BODY, fontSize: 11, color: C.cream, margin: 0 });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// TRENDS
// ---------------------------------------------------------------------------
function slideTrends(pres, C, theme, trends, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "TRENDS  ·  MOM  +  YOY");
  s.addText("Direction matters more than level.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  s.addText("Four indicators that tell us whether the account is healing or bleeding.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const slots = [
    { x: 0.40, y: 1.80 },
    { x: 5.10, y: 1.80 },
    { x: 0.40, y: 3.55 },
    { x: 5.10, y: 3.55 },
  ];
  const data = (trends || []).slice(0, 4);
  while (data.length < 4) data.push({ label: "—", values: [0, 0, 0, 0, 0, 0], delta: "", delta_status: "GREEN" });

  data.forEach((t, i) => {
    const slot = slots[i];
    const dc = statusColor(C, t.delta_status);
    s.addShape(pres.shapes.RECTANGLE, { x: slot.x, y: slot.y, w: 4.5, h: 1.65, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addText(t.label || "", { x: slot.x + 0.15, y: slot.y + 0.10, w: 3, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
    s.addText(t.delta || "", { x: slot.x + 3.15, y: slot.y + 0.10, w: 1.30, h: 0.25, fontFace: FONT_BODY, fontSize: 9, bold: true, color: dc, align: "right", margin: 0 });

    const vals = Array.isArray(t.values) && t.values.length ? t.values : [0, 0, 0, 0, 0, 0];
    const labels = vals.map((_, j) => j === vals.length - 1 ? "NOW" : `M-${vals.length - 1 - j}`);

    s.addChart(pres.charts.LINE, [{
      name: t.label || "trend", labels, values: vals,
    }], {
      x: slot.x + 0.10, y: slot.y + 0.40, w: 4.30, h: 1.20,
      chartColors: [C.ink],
      chartArea: { fill: { color: C.white } },
      catAxisLabelColor: C.gray, catAxisLabelFontSize: 7,
      valAxisHidden: true,
      valGridLine: { style: "none" }, catGridLine: { style: "none" },
      lineSize: 2.0, lineSmooth: true, showLegend: false,
    });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// 4-PILLAR PLAN
// ---------------------------------------------------------------------------
function slidePlan(pres, C, theme, plan, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "THE PLAN");
  s.addText(plan.title || "Four pillars to fix it.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  s.addText(plan.subtitle || "Not 12 priorities. Four. In order.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const pillars = (plan.pillars || []).slice(0, 4);
  while (pillars.length < 4) pillars.push({ title: "—", body: "" });

  pillars.forEach((p, i) => {
    const cx = 0.4 + i * 2.32;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.85, w: 2.18, h: 3.2, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.85, w: 2.18, h: 0.18, fill: { color: C.accent }, line: { color: C.accent, width: 0 } });
    s.addText("PILLAR " + (i + 1), { x: cx + 0.15, y: 2.18, w: 2, h: 0.3, fontFace: FONT_BODY, fontSize: 8.5, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
    s.addText(p.title || "", { x: cx + 0.15, y: 2.45, w: 1.95, h: 0.6, fontFace: FONT_HEAD, fontSize: 18, color: C.ink, margin: 0 });
    s.addText(p.body  || "", { x: cx + 0.15, y: 3.10, w: 1.95, h: 1.85, fontFace: FONT_BODY, fontSize: 10, color: C.gray, margin: 0 });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// 90-DAY ROADMAP
// ---------------------------------------------------------------------------
function slideRoadmap(pres, C, theme, roadmap, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "EXECUTION");
  s.addText("The 90-day roadmap.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });
  s.addText("Each phase has a goal, a cadence, and an exit criterion.", {
    x: 0.4, y: 1.3, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 12, italic: true, color: C.gray, margin: 0,
  });

  const phases = (roadmap || []).slice(0, 4);
  while (phases.length < 4) phases.push({ range: "—", title: "—", bullets: [] });

  phases.forEach((p, i) => {
    const cx = 0.4 + i * 2.32;
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.85, w: 2.18, h: 3.2, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addText(p.range || "", { x: cx + 0.15, y: 1.95, w: 2, h: 0.3, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
    s.addText(p.title || "", { x: cx + 0.15, y: 2.20, w: 2, h: 0.5, fontFace: FONT_HEAD, fontSize: 17, color: C.ink, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: cx + 0.15, y: 2.78, w: 0.5, h: 0, line: { color: C.accent, width: 1 } });

    const bullets = Array.isArray(p.bullets) ? p.bullets : [];
    const runs = bullets.map((b, j) => ({
      text: b,
      options: { bullet: { code: "25AA" }, breakLine: j !== bullets.length - 1 },
    }));
    if (runs.length === 0) runs.push({ text: "", options: { bullet: false } });
    s.addText(runs, { x: cx + 0.18, y: 2.90, w: 1.95, h: 2.05, fontFace: FONT_BODY, fontSize: 9.5, color: C.gray, paraSpaceAfter: 4, margin: 0 });
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// INVESTMENT / PROJECTED OUTCOMES
// ---------------------------------------------------------------------------
function slideInvestment(pres, C, theme, investment, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "INVESTMENT  ·  PROJECTED OUTCOMES");
  s.addText("What we ask, what we deliver.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 32, color: C.ink, margin: 0,
  });

  s.addText("INVESTMENT", { x: 0.4, y: 1.55, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  s.addText("Inputs we hold steady (or grow into)", { x: 0.4, y: 1.85, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, italic: true, color: C.gray, margin: 0 });

  const rows = (investment.rows || []).slice(0, 4);
  while (rows.length < 4) rows.push({ label: "—", value: "—" });

  rows.forEach((r, i) => {
    const ry = 2.30 + i * 0.55;
    s.addText(r.label || "", { x: 0.4, y: ry, w: 1.9, h: 0.3, fontFace: FONT_BODY, fontSize: 11, bold: true, color: C.ink, margin: 0 });
    s.addText(r.value || "", { x: 2.3, y: ry, w: 2.5, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: C.gray, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 0.4, y: ry + 0.40, w: 4.4, h: 0, line: { color: C.light, width: 0.5 } });
  });

  s.addShape(pres.shapes.LINE, { x: 5.0, y: 1.55, w: 0, h: 3.5, line: { color: C.light, width: 0.5 } });

  s.addText("PROJECTED OUTCOMES", { x: 5.2, y: 1.55, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  s.addText("Where we expect to land", { x: 5.2, y: 1.85, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, italic: true, color: C.gray, margin: 0 });

  const header = [
    { text: "MILESTONE",   options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 9, charSpacing: 2 } },
    { text: "ROAS",         options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 9, charSpacing: 2 } },
    { text: "REVENUE / MO", options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 9, charSpacing: 2 } },
  ];
  const outcomes = investment.outcomes || [];
  const tableRows = [header];
  outcomes.forEach((o) => {
    tableRows.push([o.milestone || "", o.roas || "", o.revenue || ""]);
  });
  while (tableRows.length < 5) tableRows.push(["—", "—", "—"]);

  s.addTable(tableRows, {
    x: 5.2, y: 2.30, w: 4.4, colW: [1.4, 1.0, 2.0],
    fontSize: 11, fontFace: FONT_BODY, color: C.ink,
    border: { type: "solid", pt: 0.5, color: C.light },
    rowH: 0.42,
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// RISKS + NEXT STEPS
// ---------------------------------------------------------------------------
function slideRisks(pres, C, theme, rns, slideNum, total) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  eyebrow(s, C, 0.4, 0.4, 6, "RISKS  ·  NEXT STEPS");
  s.addText("What could derail this — and what's next.", {
    x: 0.4, y: 0.65, w: 9, h: 0.7, fontFace: FONT_HEAD, fontSize: 28, color: C.ink, margin: 0,
  });

  s.addText("RISKS & MITIGATIONS", { x: 0.4, y: 1.65, w: 4.6, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.accent, charSpacing: 3, margin: 0 });

  const risks = (rns.risks || []).slice(0, 3);
  while (risks.length < 3) risks.push({ title: "—", mitigation: "" });

  risks.forEach((r, i) => {
    const ry = 1.95 + i * 1.05;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: ry, w: 4.6, h: 1.0, fill: { color: C.white }, line: { color: C.light, width: 0.75 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: ry, w: 0.10, h: 1.0, fill: { color: C.red }, line: { color: C.red, width: 0 } });
    s.addText(r.title || "",      { x: 0.6, y: ry + 0.10, w: 4.3, h: 0.35, fontFace: FONT_BODY, fontSize: 11, bold: true, color: C.ink, margin: 0 });
    s.addText(r.mitigation || "", { x: 0.6, y: ry + 0.45, w: 4.3, h: 0.50, fontFace: FONT_BODY, fontSize: 10, color: C.gray, italic: true, margin: 0 });
  });

  s.addText("NEXT STEPS", { x: 5.2, y: 1.65, w: 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 10, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  const steps = (rns.next_steps || []).slice(0, 3);
  while (steps.length < 3) steps.push({ when: "—", title: "—", body: "" });

  steps.forEach((st, i) => {
    const ry = 1.95 + i * 1.05;
    s.addText(st.when  || "", { x: 5.2, y: ry + 0.05, w: 1.2, h: 0.30, fontFace: FONT_BODY, fontSize: 9, bold: true, color: C.gold, charSpacing: 2, margin: 0 });
    s.addText(st.title || "", { x: 5.2, y: ry + 0.32, w: 4.4, h: 0.40, fontFace: FONT_HEAD, fontSize: 16, color: C.ink, margin: 0 });
    s.addText(st.body  || "", { x: 5.2, y: ry + 0.70, w: 4.4, h: 0.35, fontFace: FONT_BODY, fontSize: 10.5, color: C.gray, margin: 0 });
    if (i < steps.length - 1) {
      s.addShape(pres.shapes.LINE, { x: 5.2, y: ry + 1.05, w: 4.4, h: 0, line: { color: C.light, width: 0.5 } });
    }
  });

  footer(pres, s, C, theme, slideNum, total);
}

// ---------------------------------------------------------------------------
// Deck assembly
//
// We build a queue of slide-builder closures up front, filter out
// out-of-scope platforms, then iterate the queue with dynamic (slideNum,
// total) values. The deck length and footer numbering ("X / N") shrink
// when a platform is dropped — so a Google + Meta audit with Amazon out
// of scope renders 14 pages numbered 01..14, not 15 with a stub.
// ---------------------------------------------------------------------------
function isInScope(p) {
  // Treat missing platform blocks as out of scope. An explicit
  // `in_scope: false` also drops the slide.
  return !!(p && p.in_scope !== false);
}

function buildDeck(spec) {
  const C = makePalette(spec.theme || {});
  const theme = spec.theme || {};
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = theme.agency || "Agency";
  pres.title  = `${theme.client || "Client"} — Marketing Audit`;

  const platforms = spec.platforms || {};

  // Each entry is a closure that takes (slideNum, total) and renders one
  // slide. The cover doesn't render a footer, but we still pass the args
  // for signature consistency.
  const queue = [];

  queue.push(() => slideCover(pres, C, theme, spec.lookback || {}));
  queue.push((sn, t) => slideExecSummary    (pres, C, theme, spec.executive_summary || {},   sn, t));
  queue.push((sn, t) => slideCurrentState   (pres, C, theme, spec.current_state || {}, spec.lookback || {}, sn, t));
  queue.push((sn, t) => slideDiagnosis      (pres, C, theme, spec.diagnosis || {},           sn, t));
  queue.push((sn, t) => slideCrossPlatform  (pres, C, theme, spec.cross_platform || {},      sn, t));
  queue.push((sn, t) => slideSpendAllocation(pres, C, theme, spec.spend_allocation || {},    sn, t));
  queue.push((sn, t) => slideFoundation     (pres, C, theme, spec.foundation || {},          sn, t));

  // Per-platform: filter OOS entirely. Order is preserved (Google → Meta → Amazon).
  if (isInScope(platforms.google)) {
    queue.push((sn, t) => slidePlatform(pres, C, theme, "Google Ads", platforms.google, sn, t));
  }
  if (isInScope(platforms.meta)) {
    queue.push((sn, t) => slidePlatform(pres, C, theme, "Meta Ads",   platforms.meta,   sn, t));
  }
  if (isInScope(platforms.amazon)) {
    queue.push((sn, t) => slidePlatform(pres, C, theme, "Amazon Ads", platforms.amazon, sn, t));
  }

  queue.push((sn, t) => slideTrends    (pres, C, theme, spec.trends || [],                   sn, t));
  queue.push((sn, t) => slidePlan      (pres, C, theme, spec.plan || {},                     sn, t));
  queue.push((sn, t) => slideRoadmap   (pres, C, theme, spec.roadmap || [],                  sn, t));
  queue.push((sn, t) => slideInvestment(pres, C, theme, spec.investment || {},               sn, t));
  queue.push((sn, t) => slideRisks     (pres, C, theme, spec.risks_and_next_steps || {},     sn, t));

  const total = queue.length;
  queue.forEach((fn, i) => fn(i + 1, total));

  return pres;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv);
  const specRaw = fs.readFileSync(args.input, "utf8");
  let spec;
  try {
    spec = JSON.parse(specRaw);
  } catch (e) {
    console.error(`ERROR: failed to parse JSON at ${args.input}: ${e.message}`);
    process.exit(2);
  }

  const pres = buildDeck(spec);

  // Write intermediate .pptx to a temp file
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-pdf-"));
  const tmpPptx = path.join(tmpDir, "audit.pptx");

  // pptxgenjs's writeFile expects a path and resolves a Promise.
  await pres.writeFile({ fileName: tmpPptx });

  if (!fs.existsSync(tmpPptx)) {
    console.error(`ERROR: pptxgenjs did not produce ${tmpPptx}`);
    process.exit(1);
  }

  // Convert pptx → pdf via render_pdf.sh
  const renderScript = path.join(__dirname, "render_pdf.sh");
  if (!fs.existsSync(renderScript)) {
    console.error(`ERROR: render_pdf.sh not found alongside build_audit_pdf.js (${renderScript})`);
    process.exit(1);
  }

  const outAbs = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  try {
    execFileSync("bash", [renderScript, tmpPptx, outAbs], { stdio: "inherit" });
  } catch (e) {
    console.error(`ERROR: PDF render failed: ${e.message}`);
    // Leave the pptx in place for debugging
    console.error(`Intermediate pptx kept for debugging: ${tmpPptx}`);
    process.exit(1);
  }

  // Cleanup intermediate
  try { fs.unlinkSync(tmpPptx); } catch (_) {}
  try { fs.rmdirSync(tmpDir);  } catch (_) {}

  if (!fs.existsSync(outAbs)) {
    console.error(`ERROR: PDF was not created at ${outAbs}`);
    process.exit(1);
  }

  const sizeKB = (fs.statSync(outAbs).size / 1024).toFixed(1);
  console.log(`PDF written: ${outAbs} (${sizeKB} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
