#!/usr/bin/env node
/**
 * test_pdf_render.js — End-to-end test for build_audit_pdf.js.
 *
 * Two scenarios:
 *
 *   A) DemoClient with all three platforms in scope.
 *      Asserts: file exists, size > 100 KB, page count == 15.
 *
 *   B) DemoClient with amazon.in_scope = false.
 *      Asserts: file exists, size > 100 KB, page count == 14
 *      (the OOS platform slide is dropped entirely; the deck shrinks
 *       and footer numbering is "X / 14").
 *
 * Run:
 *   node test_pdf_render.js
 *
 * Exits 0 if both scenarios pass, 1 otherwise.
 */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const SCRIPTS_DIR = __dirname;
const BUILD_SCRIPT = path.join(SCRIPTS_DIR, "build_audit_pdf.js");

// --------------------------------------------------------------------
// Sample spec — fully populated so all 15 slides have content.
// --------------------------------------------------------------------
function sampleSpec() {
  return {
    theme: {
      client:     "DemoClient",
      agency:     "[Your Agency]",
      period:     "April 2026",
      dark:       "1A2A44",
      accent:     "8E5B3A",
      background: "F7F4ED",
    },

    lookback: {
      current_start: "2026-01-30",
      current_end:   "2026-04-28",
      yoy_start:     "2025-01-30",
      yoy_end:       "2025-04-28",
    },

    executive_summary: {
      headline_metric: { value: "2.42×", label: "Blended MER", target: "5.0×", breakeven: "3.33×" },
      unit_math:       { cpa: "$111", aov: "$93", gap: "-$18",
                         interpretation: "Every new order loses money on first purchase. LTV must close the $18 gap before any campaign can be profitable." },
      leak:            { pct: "49%", monthly_dollars: "$11,800",
                         interpretation: "Half of paid spend sits below breakeven. Pause/restructure recovers ~$8.4k/mo immediately." },
      plan_one_sentence: "Fix the unit math, kill the bleeders, and rebuild the funnel — target 3.5× MER by Day 90.",
    },

    current_state: {
      total_spend:     "$38,700",
      claimed_revenue: "$93,600",
      transactions:    1247,
      blended_mer:     "2.42×",
      weekly_spend:    [4200, 5800, 7200, 9100, 11000, 12500, 11200, 9400, 7800, 6500, 6100, 5900, 6300],
    },

    diagnosis: {
      title: "Why MER sits at 2.42×.",
      causes: [
        { n: "01", title: "Allocation imbalance",   body: "49% of Google spend on sub-1.5× ROAS lines; PMax High-Margin is the only profitable line and it's under-funded." },
        { n: "02", title: "Unit math broken",       body: "CPA $111 vs AOV $93 — every new customer loses $18 on first purchase before LTV." },
        { n: "03", title: "Test budget starvation", body: "Catalog test campaigns spent $35 over 90d — far below Meta's learning threshold." },
        { n: "04", title: "Wrong intent in funnel", body: "Link CTR healthy at 2.6% but Paid Social CVR 8× weaker than Paid Search." },
      ],
    },

    cross_platform: {
      cvr_by_source: {
        "Paid Search":  4.4,
        "Email":        6.1,
        "Direct":       3.2,
        "Organic":      2.8,
        "Paid Social":  0.5,
      },
      interpretation:         "Paid Search converts 8× better than Paid Social. Same site, same checkout — the buyer audience exists, the targeting is wrong.",
      new_customer_rate_meta: "65%",
      overlap_pct:            "27%",
    },

    spend_allocation: {
      by_platform:                  { Google: 62, Meta: 28, Amazon: 8, Other: 2 },
      below_breakeven_pct:          "31%",
      below_breakeven_dollars:      "$11,800",
      concentration_pct:            "96%",
      concentration_interpretation: "96% of Meta spend in one Andromeda CBO. Single point of failure.",
      working_line_pct:             "24%",
      working_line_interpretation:  "PMax High-Margin is the only profitable Google line — under-funded at 24% of Google spend.",
    },

    foundation: {
      site_cvr:         "2.4%",
      new_vs_returning: "62/38",
      top_sku_pct:      "84%",
      tracking: [
        { label: "Shopify connected",     status: "GREEN",  body: "Net revenue + AOV anchor live." },
        { label: "Meta CAPI + dedupe",    status: "GREEN",  body: "Pixel + server-side parity verified." },
        { label: "Google Enhanced Conv.", status: "YELLOW", body: "Live but not verified in account." },
        { label: "GA4 ecommerce events",  status: "RED",    body: "Purchase + transaction null. Reconnect required." },
      ],
    },

    platforms: {
      google: {
        in_scope:   true,
        status:     "RED",
        headline:   "1.91×",
        label:      "GOOGLE BLENDED ROAS",
        target:     "2.5× (breakeven 3.33×)",
        root_cause: "49% of spend on sub-1.5× ROAS lines; PMax High-Margin is the only profitable line.",
        diagnostics: [
          "Standard Shopping = 0 conversions in 30d on $1.65k spend.",
          "Non-Branded Site Nav at 1.02× ROAS with only 10% IS — query-quality issue, not budget.",
        ],
        actions: [
          "Pause Standard Shopping + NB Commercial; cut PMax Shopping Only 50%.",
          "Bump PMax High-Margin budget +25% and rebuild asset groups by audience theme.",
        ],
      },
      meta: {
        in_scope:   true,
        status:     "YELLOW",
        headline:   "3.25×",
        label:      "META BLENDED ROAS",
        target:     "4.0× (TOF mode active)",
        root_cause: "TOF prospecting strong, retargeting underperforming, frequency creeping.",
        diagnostics: [
          "MOF retargeting at 1.70× vs 4.0× target — creative refresh + audience exclusions needed.",
          "ATC:purchase ratio of 36:1 — DATA_QUALITY_SUSPECT pending GA4 reconciliation.",
        ],
        actions: [
          "Refresh retargeting creative + add exclusions for active TOF audiences.",
          "14-day frequency-cap test on prospecting at freq cap 3.0.",
        ],
      },
      amazon: {
        in_scope:   true,
        status:     "GREEN",
        headline:   "18%",
        label:      "TACOS  (TOTAL ACOS)",
        target:     "20% (target band)",
        root_cause: "Branded efficient, non-branded scaling profitably; halo effect intact.",
        diagnostics: [
          "Ad-attributed share of revenue = 28%. Below threshold = healthy organic.",
          "New-to-brand rate = 41% — top of cohort vs category benchmark.",
        ],
        actions: [
          "Squeeze branded SP defenses; expand non-branded keyword set on top SKUs.",
          "Pull 30d Search Term Report; add converting NB terms as exact match.",
        ],
      },
    },

    trends: [
      { label: "BLENDED MER",     values: [2.1, 2.2, 2.4, 2.6, 2.7, 2.9], delta: "+38% YoY", delta_status: "GREEN" },
      { label: "AOV",             values: [88, 91, 93, 92, 94, 96],         delta: "+9% YoY",  delta_status: "GREEN" },
      { label: "BLENDED ROAS",    values: [1.5, 1.7, 1.8, 1.9, 2.0, 2.1],   delta: "+40% YoY", delta_status: "GREEN" },
      { label: "NEW-CUSTOMER %",  values: [62, 60, 58, 55, 53, 51],         delta: "−18% YoY", delta_status: "RED" },
    ],

    plan: {
      title:    "Four pillars to fix it.",
      subtitle: "Not 12 priorities. Four. In order.",
      pillars: [
        { title: "Restructure", body: "Rebuild Google allocation; restore Meta retargeting layer; cap concentration risk in any single campaign at 60%." },
        { title: "Unit Math",   body: "Lift AOV via bundles + threshold-free-ship. Drop CAC by killing bleeders + tightening audience match." },
        { title: "Creative",    body: "5 angles tested ruthlessly. 60/40 video/static. Refresh every 14d on CTR + CVR signal." },
        { title: "Measurement", body: "Reconnect GA4 ecommerce events. CAPI + dedupe verified. Klaviyo audience sync. Weekly readout." },
      ],
    },

    roadmap: [
      { range: "DAYS 1–14",  title: "Restructure & build", bullets: ["Pause Google bleeders; cut Shopping 50%", "Reconnect GA4; verify CAPI dedupe", "Wave 1 of Meta retargeting creative", "Klaviyo ↔ Meta audience sync"] },
      { range: "DAYS 15–45", title: "Test phase",           bullets: ["5 angles × 3 placements live in TOF", "BOF retargeting goes live wk 3", "Daily $1,200–1,400 budget", "Exit: 3 winning angles"] },
      { range: "DAYS 46–75", title: "Scale winners",        bullets: ["2× budget on validated ad sets", "Cut anything <0.5× ROAS @ 7d mark", "Launch sub + bundle creative", "Exit: ROAS ≥ 2.0×"] },
      { range: "DAYS 76–90", title: "Lock in & expand",     bullets: ["Document winning playbook", "Plan Q3 creative roadmap", "Evaluate TikTok / YouTube spillover", "Exit: ROAS ≥ 2.5×"] },
    ],

    investment: {
      rows: [
        { label: "Media budget",        value: "$38k → $45k / mo" },
        { label: "Creative production", value: "5 ads / week (60% video)" },
        { label: "Agency cadence",      value: "Weekly review + monthly strategy" },
        { label: "Tooling",             value: "CAPI, Klaviyo sync, Triple Whale" },
      ],
      outcomes: [
        { milestone: "Day 30",  roas: "2.5×",      revenue: "$95,000" },
        { milestone: "Day 60",  roas: "3.0×",      revenue: "$135,000" },
        { milestone: "Day 90",  roas: "3.5×",      revenue: "$160,000" },
        { milestone: "Year-1",  roas: "3.0–3.5×",  revenue: "$1.8M–2.1M" },
      ],
    },

    risks_and_next_steps: {
      risks: [
        { title: "Creative bottleneck",  mitigation: "2-week creative buffer + UGC partner for 2 ads/wk." },
        { title: "Tracking degradation", mitigation: "GA4 reconnect by Day 7. CAPI dedupe verified." },
        { title: "SKU concentration",    mitigation: "Bundle creative shifts revenue mix toward 70/30 by Day 90." },
      ],
      next_steps: [
        { when: "THIS WEEK", title: "Greenlight strategy",            body: "Approve scope, budget, and creative brief." },
        { when: "WEEK 1",    title: "Restructure + creative kickoff", body: "Account rebuild starts; first wave of creative in production." },
        { when: "DAY 7",     title: "First weekly review",            body: "Live readout: pixel verification, BOF setup, CAC trend." },
      ],
    },
  };
}

// --------------------------------------------------------------------
// PDF page count: try pdfinfo, then pypdf, then a regex fallback.
// --------------------------------------------------------------------
function pdfPageCount(pdfPath) {
  // 1) pdfinfo (poppler-utils)
  try {
    const out = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
    const m = out.match(/^Pages:\s+(\d+)/m);
    if (m) return parseInt(m[1], 10);
  } catch (_) { /* not installed; try next */ }

  // 2) python3 + pypdf
  try {
    const r = spawnSync("python3", ["-c",
      `import sys; from pypdf import PdfReader; print(len(PdfReader(sys.argv[1]).pages))`,
      pdfPath,
    ], { encoding: "utf8" });
    if (r.status === 0) {
      const n = parseInt((r.stdout || "").trim(), 10);
      if (Number.isFinite(n)) return n;
    }
  } catch (_) { /* not installed */ }

  // 3) Regex over the raw bytes — best-effort
  const buf = fs.readFileSync(pdfPath);
  const matches = buf.toString("binary").match(/\/Type\s*\/Page[^s]/g) || [];
  return matches.length;
}

function fileSizeKB(p) { return fs.statSync(p).size / 1024; }

// --------------------------------------------------------------------
// Assertion helpers
// --------------------------------------------------------------------
let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`); }
  else      { fail++; console.error(`  ✕ ${label}${detail ? ` — ${detail}` : ""}`); }
}

// --------------------------------------------------------------------
// Scenario runner
// --------------------------------------------------------------------
function runScenario(label, spec, expectedPages) {
  console.log(`\n──── Scenario: ${label} ────`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "audit-pdf-test-"));
  const specPath = path.join(tmp, "input.json");
  const pdfPath  = path.join(tmp, "DemoClient.pdf");

  console.log("Workspace:", tmp);
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

  try {
    execFileSync("node", [BUILD_SCRIPT, "--input", specPath, "--output", pdfPath], { stdio: "inherit" });
  } catch (e) {
    console.error(`FATAL: build_audit_pdf.js failed in scenario "${label}".`);
    fail++;
    return { pdfPath };
  }

  console.log("Assertions:");

  check(`[${label}] PDF file exists`, fs.existsSync(pdfPath), pdfPath);
  if (!fs.existsSync(pdfPath)) return { pdfPath };

  const sizeKB = fileSizeKB(pdfPath);
  check(`[${label}] PDF size > 100 KB`, sizeKB > 100, `${sizeKB.toFixed(1)} KB`);
  check(`[${label}] PDF size < 50 MB`,  sizeKB < 50 * 1024, `${sizeKB.toFixed(1)} KB`);

  const pages = pdfPageCount(pdfPath);
  check(`[${label}] Page count == ${expectedPages}`, pages === expectedPages, `got ${pages}`);

  return { pdfPath, pages, sizeKB };
}

// Build a deep copy of the sample spec, then mutate per scenario.
function specCopy() { return JSON.parse(JSON.stringify(sampleSpec())); }

// --------------------------------------------------------------------
// Main
// --------------------------------------------------------------------
function main() {
  // Scenario A — all three platforms in scope → 15 pages.
  const allInScope = specCopy();
  const resA = runScenario("All platforms in scope", allInScope, 15);

  // Scenario B — Amazon out of scope → 14 pages, slide dropped entirely.
  const amazonOOS = specCopy();
  amazonOOS.platforms.amazon = { in_scope: false };
  const resB = runScenario("Amazon out of scope", amazonOOS, 14);

  console.log("\n────────────────────────────────────────");
  console.log(`Result: ${fail === 0 ? "PASS" : "FAIL"}  (${pass} passed, ${fail} failed)`);
  if (resA && resA.pdfPath) console.log(`Scenario A PDF: ${resA.pdfPath}`);
  if (resB && resB.pdfPath) console.log(`Scenario B PDF: ${resB.pdfPath}`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
