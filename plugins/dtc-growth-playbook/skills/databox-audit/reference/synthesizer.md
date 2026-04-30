# Audit Synthesizer — Databox-Audit

**Framework version:** `v4-cowork-memory` (April 2026)

Generates the final cross-channel report. The opening sections are structured as a **Marketing Director Overview** — a one-scroll answer to "where is the account, where's the money going, what's at risk, what do I do next." Platform deep-dives come after as reference material.

> **Default output is PDF.** The `.md` source is saved alongside for grep-ability. Chart generation via `scripts/generate_charts.py` is **required**, not optional — every audit ships with the prescribed chart set embedded in the PDF (via `scripts/build_audit_pdf.js` / `reference/pdf-template.md`).

## Framework changelog

- **v4-cowork-memory (April 2026):** Per-client memory pattern — each client gets a `clients/{Client}/CLAUDE.md` with stable Identity / Brand / Standing Context zones plus append-only Recurring Patterns / Outcomes. New file routing: `clients/{Client}/runs/{YYYY-MM-DD}/...` replaces `{Agency}/reports/{Client}/`. PDF replaces DOCX as the default deliverable; the `.md` source is still saved alongside. Account cache moved to `clients/_system/databox_account_cache.md`. Outcomes file moved to `clients/{Client}/runs/{date}/outcomes_template.md`. Hard cutover from v3; v3 manifests must be finished under v3 or restarted under v4.
- **v3-money-page (April 2026):** Adds Money Page (Section 2.0) as Page 1, cuts `findings_matrix_heatmap` chart, collapses 8-row Account Scorecard to 3-row Headline Scorecard on Page 2 (full version moves to appendix), adds Predictions Calibration callout to Methodology. Hard cutover from v2; v2 manifests must be finished under v2 or restarted under v3.
- **v2-full-funnel:** Introduced Funnel Health section, Findings Matrix, adaptive templates, role-classification, and the 7-field Action Contract.

---

## Chart Set (catalog of 9 charts — generated based on inclusion criteria)

The chart generator produces a catalog of 9 charts. Build the chart spec including only the charts whose inclusion criteria are met, then invoke the generator **before** producing the docx so images can be embedded. Funnel Health charts (`funnel_stage_mix`, `mer_vs_spend_trend`) are the headline visualization — they answer "is paid pushing revenue and profit up" before any per-channel detail.

> **v3 change:** `findings_matrix_heatmap` was removed (it was redundant with the Findings Matrix table itself — same data, twice the ink). Page 1 (Money Page) is text-only — no charts. The headline + The One Thing + 5-day operator sequence carry the page; charts compete with that for attention. `mer_vs_spend_trend` first appears on the Funnel Health page (Page 2), where it's the headline trend visualization.

| Chart | Purpose | Include when |
|---|---|---|
| `funnel_stage_mix` | Stacked bar of TOF / MOF / BOF spend share with the role-appropriate KPI grade overlaid per stage (bar height = spend share, color + annotation = KPI grade) | **Always include in spec when Funnel Health section runs.** When data is missing (no role classification ran, single-channel audit, etc.), the generator renders a labeled "Data unavailable" placeholder PNG with the chart title — NEVER silently omit. Inclusion at the SPEC level is mandatory; the placeholder is the data-availability signal. |
| `mer_vs_spend_trend` | Dual-axis line: MER and paid spend over time, current period vs prior year | **Always include in spec when Funnel Health section runs.** When ecommerce platform is missing or there's no comparable period (account is <12 months old, etc.), the generator renders a labeled "Data unavailable" placeholder PNG. NEVER drop from spec to "hide" missing data — the placeholder forces the gap to be visible to the reader. |
| `new_vs_returning_revenue` | Bar chart of new vs returning revenue per channel | GA4 Pull 6 ran OR Shopify first-time customer split returned data |
| `spend_roas_bubble` | Bubble plot of spend (x) vs ROAS (y), bubble size = revenue, per campaign | Any paid channel was deep-dived **AND** has BOF or MOF spend. TOF-dominant channels (≥80% of spend in TOF role) skip this chart — ROAS isn't the primary KPI for them. |
| `channel_mix_yoy` | Stacked bar of revenue by channel group, current vs prior year | Always include if GA4 was pulled |
| `attribution_gap` | Bar chart: platform-claimed revenue vs GA4-attributed vs Shopify net sales | Combined paid-claimed revenue >40% of Shopify net sales |
| `cvr_bounce_yoy` | Dual-axis line: session-to-purchase CVR and bounce rate YoY | GA4 scored RED or YELLOW |
| `frequency_by_campaign` | Bar of average frequency per Meta campaign with spend overlay | Meta was deep-dived |
| `priority_action_impact_effort` | Impact-vs-Effort 2×2 scatter of Priority Actions — x-axis = effort (low/med/high), y-axis = expected impact (dollar string per `reference/synthesis/dollar-impact-methodology.md`: HIGH renders `~$X/mo`, MEDIUM renders `~$X-Y/mo`, LOW excluded), each action plotted as a labeled point. Helps the reader see which actions are quick wins vs heavy lifts. | **Always include in spec when Priority Actions has ≥2 actions.** Surfaces on the Funnel Health page (Section 2.5) alongside `funnel_stage_mix` and `mer_vs_spend_trend`. |

### Generation workflow

1. Assemble the chart spec JSON — one entry per chart to include, with the metrics/values pulled from evidence JSONs.
2. Write the spec to `{evidence_dir}/charts/chart_spec.json`.
3. Run: `python scripts/generate_charts.py --spec {evidence_dir}/charts/chart_spec.json --out {evidence_dir}/charts/`
4. Reference the resulting PNGs from the PDF input JSON (per `pdf-template.md`); the renderer (`scripts/build_audit_pdf.js`) embeds them at the right slide positions.

If a chart's inclusion criteria aren't met, omit that entry from the spec — don't render a blank chart.

### Chart layering rules (per body page)

Per v3 quality framework Section 4.3 — each body page surfaces a deliberate, capped set of charts so the reader's attention is allocated, not flooded. Charts not surfaced in the body still ship in the appendix.

| Body page | Charts surfaced | Cap |
|---|---|---|
| **Page 1 — Money Page (Section 2.0)** | (none — text-only) | **0 charts — preserves the 90-second commitment read.** The headline + The One Thing + 5-day operator sequence carry the page; charts compete with that for attention. |
| **Page 2 — Headline Scorecard + Cross-Channel Overview (Sections 2.2–2.3)** | `channel_mix_yoy` | 1 chart |
| **Page 3 — Funnel Health (Section 2.5)** | `funnel_stage_mix` + `mer_vs_spend_trend` + `priority_action_impact_effort` | 3 charts |
| **Per-channel pages (Section 2.7)** | 1 chart each, role-aware (TOF: quality-metric chart; MOF: `frequency_by_campaign` or funnel-rate chart; BOF: `spend_roas_bubble`) | 1 chart per channel |
| **Appendix (Section 2.10)** | All charts not surfaced in the body, including any not used elsewhere | No cap |

Note: `mer_vs_spend_trend` first appears on the Funnel Health page (Section 2.5) as the headline trend visualization. Page 1 (Money Page) is text-only by design — the headline + The One Thing + 5-day operator sequence carry the page, and a chart there would compete with that commitment artifact for attention. Each chart surfaces on exactly one body page.

---

## Metric keep/cut rules

What goes in the BODY of the report vs. the APPENDIX vs. cut entirely. Keep the body tight; the appendix is where detail lives.

| Surface | Shopify | Google Ads | Meta | GA4 |
|---|---|---|---|---|
| **BODY** | Net sales, AOV, orders, return rate, contribution margin (when COGS available), YoY deltas on each | ROAS, CPA vs BE, top 5 + bottom 3 campaigns by spend, YoY ROAS trend, attribution ratio vs Shopify orders | ROAS (platform AND GA4-attributed), CPA, frequency per campaign, attribution gap %, spend allocation | Session-to-purchase CVR, channel group table (sessions/revenue/CVR), revenue gap vs Shopify, bounce rate YoY |

**APPENDIX (always):** full campaign tables, detailed source/medium breakdowns, device splits, event tracking, search query data.

**CUT (never include):** raw impressions, blended CTR without CVR context, reach without frequency context, POS-only metrics, low-volume campaigns with <1% of spend.

---

## Concision rules (hard limits)

- **Page 1 (Money Page) word budget: 200 words HARD CAP.** Page 1 contains: dollarized opportunity headline (≤25 words) + The One Thing's 7-field Action Contract (≤120 words) + 5-day operator sequence (≤55 words). Total: 200 words. The first 200 words of the report determine whether the rest gets read — if the budget is blown, trim to fit before any other section runs. See Section 2.0 for the full Money Page spec.
- **Executive summary:** ONE paragraph, **3 sentences max** — YoY trajectory, cause, bright spot. The "biggest red flag" sentence is dropped in v3 because the Money Page headline already carries that signal.
- **Findings Matrix (Section 2.4):** word budget: **0** (it's a table, not prose). Comment lines under the matrix are limited to **1 sentence each**; if more context is needed it lives in the per-channel pages or the appendix, not in the matrix.
- **Funnel Health section (Section 2.5):** ~150 words of body budget — one paragraph diagnosis answering "is paid pushing revenue and profit up." Two charts (`funnel_stage_mix` + `mer_vs_spend_trend`).
- **Per-Channel Pages (Section 2.7):** body word budget scales by deep-dive depth so the body stays under 1,400w even on full audits with 5 platforms:
  - **RED platform (full deep-dive):** 150 words. Full diagnosis + 3 actions.
  - **YELLOW platform (targeted dive):** 100 words. Single-issue diagnosis + 2 actions.
  - **GREEN platform (summary only):** 30 words. One-line scorecard row + one-line note.
  Each page opens with role mix and uses role-appropriate KPIs in the diagnosis. No repeated narrative between exec summary and body.
- **Every number in the body** must either be visualized (chart) or appear in exactly ONE place (chart OR table, not both).
- **Target total word count: ~1,400 words for the body** (raised from v2's 1,200 to accommodate the 200-word Page 1 Money Page), excluding appendix. Page 1 word count is checked separately at the Pre-Delivery Quality Gate but rolls into the body total. Worked example for a 5-platform audit (2 RED, 2 YELLOW, 1 GREEN): Page 1 Money Page 200w + Exec Summary 60w (down from 80w; v3 drops the "biggest red flag" sentence) + Headline Scorecard narration 60w (down from 100w; 3 rows not 8) + Cross-Channel Overview 80w + Findings Matrix 0w (table only — no prose budget) + Funnel Health 150w + Priority Actions 150w + per-channel (300+200+30) = 530w + Tracking 50w + Methodology 80w (up from 60w; +20w for Predictions Calibration callout) = **1,360w**. Leaves ~40w of headroom under the 1,400 cap. The Findings Matrix adds zero words because it's purely tabular; if a 5-RED audit blows the cap, demote secondary REDs to YELLOW-page treatment and keep the depth in the appendix.
- **TOF channels in the body cannot be judged by in-channel ROAS alone.** A channel where TOF is ≥40% of spend must be diagnosed against role-appropriate KPIs (CPATC / CPVC / engaged time / PDP→ATC) and read in the context of the Funnel Health section. The Funnel Health section is required whenever the audit covers ≥2 paid channels — it is the headline answer; per-channel pages are diagnostic detail underneath it.

---

## Playbook Loading

**Always load:** `reference/playbook/benchmarks.md` — profitability math, platform thresholds.
**Also load:** `reference/diagnostic-patterns.md` — codified patterns for attribution leaks, conversion duplication, UTM fragmentation, owned-channel collapse.
**Conditional (if workspace playbook available):**
- `channel-allocation.md` — channel roles, halo effects, budget splits
- `measurement.md` — attribution methodology, MER, reconciliation
- `high-ticket.md` or `low-ticket.md` — based on AOV

---

## Step 0: Locate Evidence & Determine Scope

1. Find all `*_evidence.json` files in the client's evidence directory
2. Read the manifest for triage scores (RED/YELLOW/GREEN per platform)
3. Count deep-dived vs summary-only platforms
4. Select depth: **Quick** (1-2 deep-dived platforms) or **Full** (3+ deep-dived platforms)

If zero evidence files → STOP. Tell user to run an audit first.

**Human voice:** Read `protocols/human-voice.md` if available before writing any client-facing content.

---

## Step 1: Ingest Evidence

For each evidence JSON:
- Parse: `meta`, `account_overview`, `findings`, `diagnosis`, `opportunities`, `cross_channel_signals`
- Note `meta.triage_score` and `meta.audit_depth`
- Extract YoY deltas (current period vs comparison period — both should be in every evidence file)
- Collect open questions and tracking health flags
- Extract **role mix** (`{platform}.role_mix` — TOF / MOF / BOF spend share %) for every paid platform that ran Channel Role Classification (Step 1.4 of triage). This drives the Per-Channel Pages opener and the `funnel_stage_mix` chart.
- Extract **role compliance** (see contract below) for every paid platform that ran a Role Compliance Check (Meta Pull 7 in Wave 2; Google PMax compliance in a future wave).

**Cross-Platform Anchor scoring:** Look for the four account-level scores produced in triage Step 1.6 — `MER`, `MER trend vs spend trend`, `nROAS`, `TOF spend share vs dynamic target`. These are the headline scorecard inputs and live in the manifest, not in a per-platform evidence file. If the manifest does not contain Step 1.6 outputs, emit a DATA_NOT_AVAILABLE warning and fall back to the Degraded variant of the Detailed Scorecard (rendered in the appendix per Section 2.10) — the Page 2 Headline Scorecard's Profit row will read its sub-lines from whichever variant is active.

**Role compliance contract (canonical path + backward compatibility):**

Wave 2 placed the role compliance block under the `findings` namespace for each platform's evidence file. The Meta deep-dive evidence schema also lists a top-level `meta.role_compliance[]` array (per-campaign rows from Pull 7). The synthesizer reads from BOTH locations to stay forward-compatible:

1. **Canonical path (read first):** `findings.role_compliance` on each platform's evidence file. This is the Wave 2 contract. Future evidence writers MUST emit here.
2. **Backward-compatible path (fall back if canonical is empty):** the top-level `{platform}.role_compliance[]` array (e.g., `meta.role_compliance[]`). This was the per-campaign output specification in `reference/platforms/meta-ads-deep.md`'s "Evidence Output" section before the Wave 2 namespace.
3. **Resolution rule:** if both are present and differ, prefer `findings.role_compliance` (canonical) and add a methodology note: "Two role_compliance sources detected; using canonical findings.role_compliance."

**Confidence handling on compliance entries:** Each compliance entry MAY include a `confidence` field (`HIGH` / `MEDIUM` / `LOW`) or an `inference_method` field describing how the audience-type breakdown was derived:

- `dimension: Audience Type` (Databox exposes the field directly) → HIGH confidence
- `dimension: Targeting Type` (alternate Databox label, same data) → HIGH confidence
- `inference_method: Ad Set Name parsing` (audience type inferred from naming because no audience dimension was available) → MEDIUM confidence

**MEDIUM is the expected default — not a degraded fallback.** The standard Databox FbAds connector does not expose `Audience Type` or `Targeting Type` directly on most accounts, so Pull 7 will hit the `inference_method: "Ad Set Name parsing"` / `confidence: MEDIUM` path on virtually every audit. The synthesizer treats this as the normal case, not as a quality disclaimer.

**Body language calibration:**

| Confidence | Body language pattern |
|---|---|
| HIGH (rare — direct dimension) | "Campaign X has 78% retargeting audience composition (structural mismatch with TOF label)." Assert as fact. |
| **MEDIUM (expected default — naming inference)** | "Campaign X reads as MOF-functional based on ad-set naming (`*RT*`, `*30d*` patterns). Verify before acting on this individual campaign." Useful, actionable, not drowned in caveats. |
| LOW (ad set names unparseable) | Do NOT surface in body. Note in appendix as "Role compliance not assessable — generic ad-set naming." |

The Role Compliance override (which upgrades platform score to YELLOW when a structural-mismatch campaign is worth >10% of platform spend) applies the same way at HIGH and MEDIUM confidence. LOW findings do NOT trigger the override.

**Data integrity:** Missing/null fields → DATA_NOT_AVAILABLE. Never invent values.

---

## Step 1.5: Manifest Framework Version Guard

Before proceeding to pattern detection or body drafting, inspect the manifest's `framework_version` field and gate accordingly. Manifests written under earlier framework versions have different evidence shapes, file routing, and deliverable formats and cannot be cleanly resumed under a newer version.

**Version guards (apply in order, top wins):**

- **v4-cutover guard:** Refuse to resume any manifest whose `framework_version` isn't `v4-cowork-memory`. v3 manifests use the legacy `{Agency}/reports/{Client}/` routing AND assume DOCX as the deliverable; running them through v4's PDF pipeline + per-client memory writes would produce inconsistent client-folder state. Tell the user: `"This manifest is v3-money-page (legacy DOCX deliverable, flat per-client folder layout). Finish under v3 or restart from scratch under v4."`
- **v3-cutover guard:** (legacy) Refuse to resume any v2 manifest under v3. Tell the user: `"This manifest predates v3-money-page — finish under v2 or restart from scratch under v4."`
- **v2-cutover guard:** (legacy) Refuse to resume any v1 manifest under v2. Tell the user: `"This manifest predates v2-full-funnel — restart from scratch under the current framework."`

**On a clean v4 manifest:** stamp `framework_version: v4-cowork-memory` if the field is missing, log the version into `manifest.synthesizer_run_log[]`, and proceed to Step 1.8a.

**On a version mismatch:** STOP. Do not draft. Surface the mismatch message and let the user decide whether to finish under the manifest's native version or restart.

---

## Step 1.8a: Pattern Detection

After all evidence is ingested (Step 1) and before drafting the body (Step 2), run dominant pattern detection per `reference/synthesis/cross-channel-patterns.md` "Dominant Pattern Selection (v3)" section.

Run the full 7-pattern detection sweep (Tracking-Broken, Profitability Trap, Owned-Channel Collapse, TOF-Underfunded, Cannibalization, Allocation Imbalance, Healthy / Optimization). Apply the confidence filter (HIGH and MEDIUM participate; LOW does not). Walk the precedence ranking top-down to pick the dominant pattern.

**Output to manifest:** `dominant_pattern`, `secondary_patterns[]`, `pattern_confidence{}`. The dominant pattern drives the body's lead, the money chart, and the first 1-2 Priority Actions' default shape. Secondary patterns still get recommendations folded into Priority Actions but do not drive the body lead.

The Pre-Delivery Quality Gate (v3 framework §2.4) verifies that the body opener matches `manifest.dominant_pattern` — mismatch triggers a body regenerate.

---

## Step 1.8b: Apply Adaptive Template

Load `reference/synthesis/templates/{dominant_pattern_slug}.md`. The template specifies the body lead's structure, Funnel Health adaptation, default first-2 Priority Actions shape, per-channel page framing, and pattern-specific appendix material.

**Pattern slugs (canonical, kebab-case):** `tracking-broken`, `profitability-trap`, `owned-channel-collapse`, `tof-underfunded`, `cannibalization`, `allocation-imbalance`, `healthy-optimization`.

If no template file exists for the dominant pattern slug, log an error and fall back to the Healthy / Optimization template (`reference/synthesis/templates/healthy-optimization.md`).

---

## Step 2: Marketing Director Overview (Core Output)

**Use the loaded adaptive template (from Step 1.8b) to drive the Money Page lead, the body's lead paragraph, and Funnel Health framing.** The template's Money Page lead structure (per the "Money Page lead (Page 1)" section in each template file) goes into Section 2.0; the Executive Summary (Section 2.1) reuses the template's body lead; the Funnel Health adaptation rewrites Section 2.5's lead paragraph; the default Priority Actions inform Section 2.6's first 1-2 entries. The template is the spec for the body's narrative shape — follow it rather than running a generic skeleton.

This is the core deliverable. Generate these **eleven** components in order.

0. **Money Page (Page 1)** — NEW in v3. Dollarized opportunity headline + The One Thing (full 7-field Action Contract) + 5-day operator sequence. 200-word hard cap. See Section 2.0.
1. **Executive Summary** — 1 paragraph, **3 sentences max** (down from 4 in v2 — the "biggest red flag" sentence drops because the Money Page headline already carries that signal).
2. **Headline Scorecard** — NEW NAME (was "Account Scorecard"). 3 rows: Profit / Roles / Tracking. The full 8-row Standard / 7-row Degraded version moves to the appendix per Section 2.10.
3. **Cross-Channel Overview** — 1 chart (`channel_mix_yoy`) + attribution reconciliation table.
4. **Findings Matrix** — color-coded RAG table per `reference/synthesis/findings-matrix.md`. Sits immediately after the Headline Scorecard area; renders every finding the audit produces with Severity / Confidence / **dollar Impact** / Effort / one-line description / Pattern tag. Sort is dollar-first per the Wave 1 update. Replaces the platform-level Triage Summary's previous role at the top of the body.
5. **Funnel Health** — 1 paragraph diagnosis + 2 charts (`funnel_stage_mix` + `mer_vs_spend_trend`). Headline answer to "is paid pushing revenue and profit up."
6. **Priority Actions** — 3-6 actions ordered by impact, each rendered as a 7-field Action Contract per `reference/synthesis/action-contract.md`. EXPECTED IMPACT now requires `$/mo` per Wave 1. Before per-channel detail.
7. **Per-Channel Pages** — role-aware: each opens with TOF/MOF/BOF mix; diagnosis uses role-appropriate KPIs (no in-channel ROAS for TOF-dominant channels).
8. **Tracking & Attribution Notes**
9. **Methodology + Data Sources** — now includes the Predictions Calibration callout per `reference/synthesis/outcomes-loop-template.md` Section 5.3.
10. **Appendix** — detailed tables, the platform-level Triage Summary, AND the full Detailed Scorecard (8-row Standard / 7-row Degraded variant) moved out of the body in v3.

### 2.0 Money Page (Page 1) — NEW in v3

Page 1 of every audit. **200 words HARD CAP.** The first thing the reader sees is the dollarized opportunity, the single highest-leverage action with a full Action Contract, and a 5-day operator sequence. Diagnostic content (Headline Scorecard, Findings Matrix, per-channel pages) starts on Page 2 — the Money Page is prescription-first.

> **Why Page 1 leads with prescription, not diagnosis.** The v2 report buried Priority Actions at Section 2.6 — five sections of diagnostic content deep. Council critique: readers don't make it that far. v3's Money Page puts the dollar headline + The One Thing in front so the report's value is visible in the first 200 words, before the reader has to decide whether to keep reading.

#### Page 1 structure (in order)

1. **Headline (line 1, ≤25 words):** `~$X/month at risk OR recoverable. Confidence: {HIGH|MEDIUM}.`
   - Dollar value computed per `reference/synthesis/dollar-impact-methodology.md` Section 4 aggregation rule (sum of HIGH+MEDIUM findings, midpoint of MEDIUM ranges, with aggregated confidence band).
   - LOW findings are excluded from the headline aggregation.
   - Render `~$X/mo` (HIGH) or `~$X-Y/mo` (MEDIUM) per the methodology's display rules. Never a bare point estimate.

2. **Pattern framing (lines 2–3, ≤30 words):** A one-line interpretation of the headline using the dominant pattern's Money Page lead from the loaded adaptive template (per `reference/synthesis/templates/{dominant_pattern_slug}.md` "Money Page lead (Page 1)" section).
   - Tracking-Broken example: *"~$22k/mo of conversions invisible to ad platforms — Meta CAPI broken since Mar 12, dropping optimization signal across paid."*
   - Owned-Channel Collapse example: *"~$95k/mo of recoverable email revenue — Klaviyo Welcome + AC flows broken since template migration; full rebuild needed."*

3. **The One Thing (block, ≤120 words):** The highest-$ HIGH-confidence RED finding rendered as a full 7-field Action Contract per `reference/synthesis/action-contract.md` Section 2 schema.
   - **Selection rule:** the top-ranked row of the Findings Matrix (per the Wave 1 dollar-first sort: Severity DESC → Dollar DESC → Confidence DESC → Effort ASC). If the top row is not HIGH-confidence, walk down until the first HIGH-confidence RED row is found and use that — the Money Page never elaborates a MEDIUM-confidence action as The One Thing because the top-of-page promise has to be defensible under pushback.
   - **Render:** the Page 1 compact 3-column variant for the body (WHAT / WHEN / EXPECTED IMPACT prominent), with the full 7 fields in a sidebar/footer that fits on the same page. The full 7-field operator-page version of the same action also renders in Section 2.6 — Page 1 carries the compact form; the operator pages carry the elaborate form. Same action, different layering.
   - Per `action-contract.md` Section 2: "On the Page 1 (Money Page / Executive Snapshot) variant, the EXPECTED IMPACT column shows the dollar figure prominently — that's the version of the field that aggregates into the Money Page headline."

4. **The Week — 5-day operator sequence (block, ≤55 words):** Monday / Tuesday / Wednesday / Thursday / Friday — one specific task per day, derived from The One Thing's HOW field.
   - The shape is template-driven: each dominant-pattern template specifies a typical 5-day shape for that pattern (see "5-day operator sequence (Mon–Fri shape):" in each `reference/synthesis/templates/*.md` file).
   - Tracking-Broken example: *"Mon: reconcile worst-gap platform vs Shopify. Tue: reconnect CAPI / Consent Mode. Wed: trigger backfill. Thu: $1 test conversion end-to-end. Fri: monitor variance, document baseline."*
   - The synthesizer pulls the shape from the template and fills it from Action #1's HOW field — never invent a sequence outside the template.

5. **Cross-references (line N, end of page):** Page 1 ends with: *"Detailed scorecard, full findings matrix, and per-channel diagnostics begin on Page 2."* This makes the layering explicit so the reader knows where to go for depth.

#### Required when

**Always include.** Even single-channel audits get a Money Page — the One Thing is just whatever the audit's single highest-leverage action is, and the headline is the dollarized opportunity for that one channel. If the audit produces only LOW-confidence findings (no HIGH+MEDIUM dollarized findings exist), the Money Page renders the headline as `Calibration: insufficient HIGH/MEDIUM findings — directional opportunity only` and The One Thing is omitted in favor of a 1-line "fix the data first" callout that points the reader to the Tracking & Attribution Notes (Section 2.8).

#### Word budget enforcement

The Pre-Delivery Quality Gate (see below) checks Page 1 word count separately from the body total. If Page 1 exceeds 200w, the synthesizer trims in this priority order: 5-day sequence first (collapse to 4 days if needed), then The One Thing's HOW field (compact to 2 enumerated steps), then the pattern framing (collapse to one line). Never trim the dollar headline — the headline is the page's whole reason for existing.

---

### 2.1 Executive Summary

One paragraph, **3 sentences max** (down from 4 in v2 — the Money Page headline now carries the "biggest red flag" signal):
- Is the account growing, holding, or declining? (lead with the YoY revenue number)
- What's actually causing that trajectory? (media vs lifecycle vs tracking vs unit economics)
- What's the bright spot?

Example: *"{Client} is holding revenue roughly flat (~9% decline YoY) while significantly increasing paid media spend and improving paid ROAS. The softness is not a media problem — it is a lifecycle problem (Email + SMS revenue collapsed YoY) and a tracking problem. Paid is the bright spot."*

### 2.2 Headline Scorecard (Page 2 — was "Account Scorecard" in v2)

> **v3 change:** The 8-row Standard / 7-row Degraded scorecard from v2 collapses to a 3-row Headline Scorecard on Page 2. The full Detailed Scorecard (with all 8 / 7 dimension-level rows) moves to the appendix per Section 2.10. Same content, different layering — the body summary serves the operator scan, the appendix detail serves the dimension-by-dimension reader.

The Headline Scorecard answers "where is the account, in three rows" and gives the reader a 30-second triage of Profit / Roles / Tracking before they hit the Findings Matrix. Each row's color is the WORST score among its sub-dimensions — a row goes RED if any of its sub-dimensions is RED, YELLOW if the worst is YELLOW, GREEN only when all sub-dimensions are at or above target.

#### The 3-row Headline Scorecard

| Dimension | Signal |
|---|---|
| **Profit** | Combines MER vs target + nROAS + MER trend vs spend trend. Three sub-lines under the row, one per sub-dimension. Sub-line 1: MER value vs target with derivation method (per triage Step 1.6.1-1.6.2). Sub-line 2: nROAS vs minimum ROAS (1 ÷ Gross Margin %), with confidence label (HIGH if Shopify direct, MEDIUM if GA4 proxy). Sub-line 3: spend Δ vs revenue Δ over 90-day vs prior-90-day with verdict (healthy / cannibalizing / saturating). |
| **Roles** | Combines TOF spend share vs target + TOF quality + MOF/BOF efficiency. Three sub-lines under the row. Sub-line 1: actual cross-platform TOF spend share % vs the dynamic target band per `reference/full-funnel-framework.md` Section 4.2 (brand stage × AOV tier). Sub-line 2: TOF quality verdict (CPATC / CPVC / engaged time / PDP→ATC composite vs AOV-tier benchmark in `reference/playbook/benchmarks.md`). Sub-line 3: MOF/BOF efficiency one-liner (retargeting frequency + ATC→Checkout for MOF; branded ROAS + attribution ratio vs Shopify orders for BOF). |
| **Tracking** | Combines UTM hygiene + GA4 vs Shopify gap + duplicate conversions + owned-channel YoY. Four sub-lines under the row. Sub-line 1: UTM hygiene (% of paid sessions tagged). Sub-line 2: GA4 vs Shopify revenue gap. Sub-line 3: duplicate conversion actions (count + flagged platforms). Sub-line 4: owned-channel YoY (Email + SMS revenue delta) — moved into Tracking row in v3 because owned-channel collapse is usually a tracking-or-lifecycle signal that the operator triages alongside attribution health. |

**Row color rule:** the row's RED/YELLOW/GREEN is the WORST score among its sub-dimensions. If Profit:MER is GREEN but Profit:nROAS is RED, the Profit row renders RED. This forces the headline color to surface the worst signal — the reader can't miss a RED inside a row whose other sub-dimensions look fine.

**Adaptive logic stays — what changes is what's surfaced.** The same Standard (nROAS-available) vs Degraded (nROAS-missing) determination applies; the only change is that both variants now collapse into the same 3-row Headline Scorecard for Page 2. The full 8-row Standard / 7-row Degraded version with all dimension-level rows lives in the appendix per Section 2.10. The Page 2 reader gets the 3-row summary; the appendix reader gets the dimension-level breakdown.

> Full Detailed Scorecard (8-row Standard / 7-row Degraded variant) lives in the appendix per Section 2.10. The synthesizer renders BOTH the body summary (Section 2.2) AND the appendix detail every audit — same source data, two layers.

**Scoring rules (apply to both scorecard layers):**
- RED = broken or declining materially / below Floor
- YELLOW = below target, concerning trend, or structural mismatch flagged
- GREEN = at or above target, within healthy band

**Adaptive logic check (still runs at synthesis time):**

```
nROAS_available = (
  evidence.shopify.first_time_customer_revenue is not None
  OR evidence.ga4.pull_6_new_vs_returning_by_source_medium is not None
)
if nROAS_available: appendix renders Standard scorecard (8 rows); body Profit row uses real nROAS sub-line
else: appendix renders Degraded scorecard (7 rows); body Profit row's nROAS sub-line reads "nROAS unavailable — first-time customer split not connected"
```

When in doubt about whether GA4 Pull 6 returned usable data, also check UTM hygiene. If `(direct)/(none)` >25% of paid sessions, flag per-channel nROAS as unreliable in the body even when the scorecard shows nROAS — the headline number is still account-level-trustworthy but per-channel attribution should be downgraded to MEDIUM confidence.

### 2.3 Cross-Channel Overview

One chart (`channel_mix_yoy`) plus a short attribution reconciliation table:

| Source | Claimed Revenue | % of Shopify Net Sales |
|---|---|---|
| Google Ads | ... | ... |
| Meta Ads | ... | ... |
| GA4 (Paid) | ... | ... |
| Shopify (Net Sales) | ... | 100% |

If combined paid-claimed revenue exceeds 40% of Shopify net sales, also include the `attribution_gap` chart here. Two-sentence read-out: what the mix looks like vs prior year, and whether claimed attribution is plausible.

### 2.4 Findings Matrix

Color-coded RAG table per `reference/synthesis/findings-matrix.md`. Sits immediately after the Headline Scorecard. Renders every finding the audit produces with **Severity / Confidence / dollar Impact / Effort / one-line description (≤140 char) / Pattern tag**. Sort (per Wave 1 v3 update): **Severity DESC → Dollar Impact DESC → Confidence DESC → Effort ASC**. Status colors and confidence/impact rendering come from `reference/pdf-template.md` (v4 — same RAG palette, same `~$X/mo` HIGH / `~$X-Y/mo` MEDIUM / `directional` LOW conventions defined in `reference/synthesis/dollar-impact-methodology.md`).

This replaces the previous Triage Summary's role at the top of the body. The platform-level Triage Summary (Step 3) now moves to the appendix — the Findings Matrix is finding-level (what should I act on), where the Triage Summary was platform-level (which platform is broken). Different question, different table; the body leads with the finding-level view.

The matrix is the bridge between the Headline Scorecard ("here's how the account is doing") and Priority Actions ("here's what to ship Monday"). Priority Actions selects the top 3-6 rows of the matrix and elaborates each via the 7-field Action Contract — see Section 2.6. The Money Page (Section 2.0) elaborates the single top-ranked HIGH-confidence RED row of the matrix as The One Thing — see Section 2.0.

### 2.5 Funnel Health

The headline answer to "is marketing pushing revenue and profit up." This section sits between the Findings Matrix and Priority Actions because it is the cross-platform synthesis that makes the per-channel pages diagnostic detail rather than the verdict.

**One paragraph diagnosis (~150 words).** Answer three questions in plain language:

1. **Is TOF funded vs target?** Cite the actual cross-platform TOF spend share, the dynamic target band (brand stage × AOV tier), and the verdict (within band / above by Xpts / below band but above floor / at-or-below floor). Reference `reference/full-funnel-framework.md` Section 4.2 for the target derivation.
2. **Is TOF quality at the AOV tier?** Cite the AOV-tier benchmark row from `reference/playbook/benchmarks.md` (Mass / Standard / Premium / Luxury) and call out which quality KPI(s) are driving the verdict — CPATC, CPVC, GA4 engaged time, PDP→ATC.
3. **Is MER trend ≥ spend trend?** Cite the MER ratio (revenue Δ ÷ spend Δ) and read it against framework Section 6.2. If revenue Δ keeps pace with spend Δ → roughly incremental. If revenue lags → cannibalization or saturation. Pair with TOF spend share trend per framework Section 6.3.

**Three charts:**
- `funnel_stage_mix` — stacked bar of TOF / MOF / BOF spend share with the role-appropriate KPI grade overlaid per stage. Bar height encodes spend share; color or annotation encodes the KPI grade for that stage (TOF: CPATC/CPVC/engaged time; MOF: ATC→Checkout + frequency; BOF: ROAS vs target). One chart shows both "where the money is going" and "is each stage doing its job."
- `mer_vs_spend_trend` — dual-axis line: MER over time + paid spend over time, current period vs prior year. The shape that matters: does MER hold or improve as spend changes, or does it diverge?
- `priority_action_impact_effort` — Impact-vs-Effort 2×2 scatter of Priority Actions. Helps the reader see which actions are quick wins vs heavy lifts. Always include when Priority Actions has ≥2 actions.

**Cross-reference for the reader.** This section is the headline answer. If MER trend ≥ spend trend AND TOF share is within target AND TOF quality is GREEN, the per-channel pages are diagnostic detail (where to optimize), not the verdict (whether marketing is working). If any of the three goes RED, the per-channel pages explain which stage is failing.

**Required when:** the audit covers ≥2 paid channels AND an ecommerce platform (Shopify or BigCommerce) is connected. If only one paid channel was deep-dived, fold the diagnosis into the single Per-Channel page and skip the dedicated section. If no ecommerce platform is connected, KEEP the section but the `mer_vs_spend_trend` chart will render as a placeholder ("MER trend data unavailable — no ecommerce platform connected") — and the diagnosis paragraph becomes a Data Gaps callout explaining what to connect to populate the headline.

**Chart spec rule (non-negotiable):** when Funnel Health runs, BOTH charts MUST appear in the chart_spec.json — never drop one to hide missing data. The generator produces a labeled placeholder PNG when data is missing; the placeholder visibility forces the data gap into the reader's view instead of silently disappearing. The body caption under a placeholder should read: "Chart unavailable: {one-line reason}. See Tracking & Attribution Notes (Section 2.8) for what to connect."

### 2.6 Priority Actions

**3-6 priority actions, each rendered as a 7-field Action Contract table per `reference/synthesis/action-contract.md`.** Actions failing any of the 7 fields (WHAT / WHY / HOW / WHEN / WHO / EXPECTED IMPACT / MEASUREMENT) demote to a **Watchlist** section at the bottom of the report (one sentence each, NOT in Priority Actions). This sits BEFORE the per-channel detail so the reader can scan it in isolation.

> **v3 update:** EXPECTED IMPACT now requires a `$/mo` figure derived per `reference/synthesis/dollar-impact-methodology.md` (HIGH renders as `~$X/mo`; MEDIUM renders as `~$X-Y/mo`). Actions whose underlying findings can only support a LOW-confidence dollar estimate are demoted to Watchlist — they're real flags but don't roll up into the Money Page headline. Action #1 in this section is always the same finding the Money Page (Section 2.0) elaborates as The One Thing — Section 2.6 carries the full operator-page version; Section 2.0 carries the compact 3-column variant.

Candidate sources for priority actions (pick from the ones actually supported by evidence):
- Owned channel collapse (if Email/SMS YoY revenue down >50%)
- Attribution blindness (Meta UTM fragmentation, Google conv duplication)
- Over-concentration (one campaign >40% of spend OR one channel >60%)
- Unit economics drift (AOV declining, return rate rising, discount creep)
- Missing financial anchor (no Shopify/BC connected)
- Platform-specific saturation (Meta freq >4, Google IS budget lost >30%)
- Paid reallocation (shift % of underperforming tier into working tier)

### 2.7 Per-Channel Pages (role-aware)

One page per deep-dived channel. **Body word budget per page: 150 words** (down from 200 to make room for Funnel Health). Each page:

1. **Opener line — required.** "Role mix: TOF X% / MOF Y% / BOF Z%." Pulled from `{platform}.role_mix` in the platform's evidence file (Channel Role Classification, triage Step 1.4). This single line tells the reader which KPIs to expect in the diagnosis below — and locks the per-channel verdict to the role lens, not the platform lens.
2. **Scorecard row** — status + headline metrics from the keep/cut table above, filtered to the channel's dominant role(s).
3. **One chart** — from the prescribed chart set, picked to be **role-aware**:
   - TOF-dominant channel (≥60% TOF): NOT `spend_roas_bubble`. Use a quality-metric chart (e.g., a CPATC-vs-AOV-tier-benchmark bar, or `frequency_by_campaign` for Meta TOF saturation).
   - MOF-dominant channel: `frequency_by_campaign` (Meta) or an ATC→Checkout funnel-rate chart.
   - BOF-dominant channel: `spend_roas_bubble` is appropriate (ROAS is the primary KPI for BOF).
   - Mixed channel: pick the chart that best fits the largest role bucket and note the role split in the diagnosis.
4. **Diagnosis — 3 bullets, role-appropriate KPIs only.**
   - **TOF-dominant channel:** NO in-channel ROAS in the diagnosis. Use CPATC, CPVC, GA4 engaged time per source/medium, PDP→ATC rate, hook rate, hold rate. Reference the AOV-tier benchmark row that drove the verdict.
   - **MOF-dominant channel:** ATC→Checkout rate, Checkout→Purchase rate, retargeting frequency, retargeting CTR. ROAS appears as context only.
   - **BOF-dominant channel:** ROAS vs target, CPA vs break-even, attribution ratio vs Shopify orders.
   - **Mixed channel:** weight the bullets to the dominant role mix; if TOF spend share >0%, at least one bullet must be a TOF-quality bullet (per the TOF Mode rule in `reference/triage-pulls.md` and `reference/full-funnel-framework.md` Section 3).
5. **Actions — 3 bullets.** What to do, in priority order. Actions follow the diagnosis framing — TOF channels get TOF actions (audience/creative/PDP), MOF channels get retargeting/funnel actions, BOF channels get bid/budget/landing-page actions.

No repeated narrative between exec summary, Funnel Health, and this section. No restating numbers that appear in the chart.

### 2.8 Tracking & Attribution Notes

Short section. UTM health, conversion duplication, GA4↔platform reconciliation, device-level funnel sanity check. Call out the YoY rate swings that are almost certainly tracking artifacts.

### 2.9 Methodology + Data Sources

Brief. Data sources, date ranges (current + YoY comparison), triage scoring rules, caveats (margin assumption if no Shopify, single-period limitations, etc.).

**Predictions Calibration (NEW in v3).** The synthesizer reads `reference/synthesis/calibration-rollup.json` at audit start (per `reference/synthesis/outcomes-loop-template.md` Section 5). The Methodology section quotes the rollup verbatim using one of three forms (insufficient data / well-calibrated / soft-calibration warning). If the rollup file doesn't exist OR `audits_with_outcomes < 3`, use the insufficient-data form. The three callout forms (per `outcomes-loop-template.md` Section 5.3 "What the Methodology section quotes"):

| Condition | Methodology callout (verbatim) |
|---|---|
| `audits_with_outcomes < 3` | `Calibration: insufficient data (only N audits with outcomes filled in). Predictions in this report should be treated as MEDIUM-confidence by default.` |
| `audits_with_outcomes ≥ 3` AND `hit_rate_within_20pct ≥ 0.60` | `Calibration: of the last N audits' predictions, X% landed within ±20% of forecast (dollar-weighted: Y%). Treat dollar predictions in this report as well-calibrated.` |
| `audits_with_outcomes ≥ 3` AND `hit_rate_within_20pct < 0.60` | `Calibration: of the last N audits' predictions, only X% landed within ±20% of forecast. Predictions in this report are softened to ranges and confidence bands are widened. See `dollar-impact-methodology.md` for downgrade rules.` |

`N` is `audits_with_outcomes`, `X` is `hit_rate_within_20pct` rendered as a percentage, `Y` is `dollar_weighted_hit_rate` rendered as a percentage. If `dollar_weighted_hit_rate` is `null` (no dollar figures in the corpus), the well-calibrated callout drops the parenthetical: `Calibration: of the last N audits' predictions, X% landed within ±20% of forecast. Treat dollar predictions in this report as well-calibrated.`

**Calibration feedback into the dollar accuracy.** If the rollup says `hit_rate_within_20pct < 0.60`, the synthesizer must downgrade Findings Matrix dollar estimates by widening MEDIUM confidence ranges by an extra ±25% AND routing borderline-MEDIUM findings (those within 10% of the LOW threshold) to LOW per `reference/synthesis/dollar-impact-methodology.md`. This is a feedback loop: the system's track record bends the next audit's bands toward where the past predictions actually landed. Findings demoted to LOW on this rule do NOT contribute to the Money Page headline aggregation.

**Adaptive template note (required when patterns were detected).** Include a short paragraph describing the dominant-pattern selection so the reader can audit the decision:

> "This audit detected dominant pattern: `{pattern_slug}`. The body's lead, money chart, and first Priority Actions follow the template for this pattern. Secondary patterns detected: `{list}`. Other patterns analyzed but not dominant. See appendix for full pattern detection results."

Pull the values from `manifest.dominant_pattern` and `manifest.secondary_patterns`. If no patterns triggered (filtered HIGH/MEDIUM set was empty), state that the audit fell through to the Healthy / Optimization template.

### 2.10 Appendix

Everything relegated from the body under the keep/cut rules, plus:

- **Detailed Scorecard (NEW in v3).** The full 8-row Standard / 7-row Degraded scorecard from v2 lives here. Same content as v2's Account Scorecard — every dimension-level row (Profit: MER vs target, Profit: nROAS, Profit: MER trend vs spend trend, Roles: TOF spend share, Roles: TOF quality, Roles: MOF + BOF efficiency, Owned channel health, Tracking integrity; the Degraded variant collapses Profit rows 1-3 into a single MER + MER-trend row and adds a Data Gaps row). Surfaced for readers who want the dimension-level breakdown rather than the 3-row Page 2 summary in Section 2.2. The body Headline Scorecard's row colors are derived from the WORST sub-dimension score in this table — readers tracing a body row's RED can come here to see exactly which sub-dimension drove it.
- **Channel Role vs Reality matrix.** Columns: **Channel · Role · Status · Notes**. Status values (color-coded in docx): `Delivering`, `Organic`, `Leaking`, `Fatiguing`, `Misaligned`, `Too early`, `Too-small-to-matter`, `Broken`, `Collapsed`, `Unmeasurable`. Always include owned channels (Email, SMS, Affiliate, Organic Search).
- **Paid Media Allocation — Confidence Tier table.** Segment total paid spend into four tiers:

  | Tier | Criteria |
  |---|---|
  | Working — above target | ROAS ≥ target OR scaling with stable margin |
  | Acceptable — near target | ROAS 70-99% of target OR acceptable with monitoring |
  | Underperforming — at-risk | ROAS <70% of target OR tracking-broken but spending |
  | Wasted / Diagnostic | 0 conversions, wrong optimization event, or known waste |

  For each tier: dollar amount, % of paid spend, campaign list.

- **30 / 60 / 90 Plan.** Three buckets, each 3-5 specific bullets.
  - 30 days — tracking + triage.
  - 60 days — reallocation + rebuild.
  - 90 days — optimization + strategy.
- **Weekly KPIs to Watch.** 6-10 metrics: Blended MER, Google Ads ROAS, Meta Ads ROAS, Email + SMS weekly revenue, % of Meta sessions attributed in GA4, PMax spend share, new vs returning revenue mix, mobile CVR.
- **Data Gaps to Close.** Typical: Shopify connected to Databox, CRM/attribution platform for multi-touch, LTV by channel, creative performance tracked over 60-90 day cycles.
- Full campaign tables, detailed source/medium breakdowns, device splits, event tracking, search query data.

---

## Step 2.X — Insight Rubric Pass

Apply the 5-axis Insight Quality Rubric (see `reference/synthesis/insight-rubric.md`) to every body finding. PASS findings stay in the body; failing findings iterate up to **2 times** then demote to appendix or cut. Log rubric results in evidence as `findings_rubric_results`.

This step runs after the Step 2 Marketing Director Overview body has been drafted but BEFORE the Anti-Hallucination Verification step below. The 5 axes are **Specificity, Causality, Implication, Confidence, Counterargument** — see `reference/synthesis/insight-rubric.md` for the full rubric, demotion rules, and the iterative loop spec.

---

## Step 3: Triage Summary (Brief)

> **v3 placement note:** Platform-level Triage Summary lives in appendix; finding-level Findings Matrix (Section 2.4) leads the body. The matrix is finding-level (what should I act on); the Triage Summary is platform-level (which platform is broken). Different question, different table — both ship, but the body leads with the finding-level view.

One compact table that now lives in the **Appendix (Section 2.10)** rather than at the top of the body. Platform, Score, Headline Metric, Root Issue. 3-5 rows.

---

## Step 4: Platform Deep-Dives (Reference Material)

One section per RED/YELLOW platform. Include:
- Campaign-level table with spend, value, ROAS, notes
- Conversion action / funnel table if relevant
- Diagnostic findings (top 3-5, not 10+)
- Fix list (3-6 items)

GREEN platforms: one paragraph each.

---

## Step 5: Cross-Channel Patterns (if 2+ platforms)

**Read `reference/synthesis/cross-channel-patterns.md`** AND **`reference/diagnostic-patterns.md`**.

Report each detected pattern with: name, evidence with specific numbers, confidence (HIGH/MEDIUM/LOW), business implication, recommended action. Don't include patterns not supported by evidence.

---

## Step 6: Profitability Analysis

**Read `reference/synthesis/profitability-framework.md`** AND **`reference/playbook/benchmarks.md`** (MER Target Derivation section).

**MER target — use the canonical derivation.** Do NOT use the flat band table below as the primary source for MER target. The canonical MER target was already derived in triage Step 1.6.2 (`Target MER = (1 ÷ CM2%) × 1.4-1.6` when CM2 known; vertical-based ASSUMPTION as fallback; flat 3.0× only as last resort). The synthesizer reads the target out of the manifest's Cross-Platform Anchor block and reports it verbatim — this keeps the headline scorecard, the Funnel Health diagnosis, and the Profitability section consistent on a single number.

**COGS handoff from triage.** If the COGS prompt fired during triage Step 1.6 (Shopify returned $0/null and the user was asked via AskUserQuestion), the answer is already in the manifest under Cross-Platform Anchor → MER Target Derivation Method. Use it. If the manifest does NOT have a CM2% / vertical / fallback method recorded (e.g., triage was rerun without the prompt OR an older audit version produced the manifest), prompt the user again here via AskUserQuestion before generating the CM3 waterfall — do not silently assume a vertical.

Quick reference (formulas, not target sources):
- Break-even CPA = AOV × Gross Margin %
- Target CPA = Break-even × 0.65
- Minimum ROAS = 1 ÷ Gross Margin %
- Target ROAS = Minimum × 1.4
- MER = Revenue ÷ Total Marketing Spend
- **MER target** = `(1 ÷ CM2%) × 1.4-1.6` (per `reference/playbook/benchmarks.md` MER Target Derivation; second fallback is vertical-based ASSUMPTION; last resort is flat 3.0×)

The flat band table below is **informational only** — it is NOT the scoring authority for MER. Use it as a sanity-check sense-of-scale when the reader wants context on what a given MER value means in absolute terms; the actual GREEN/YELLOW/RED scoring comes from triage Step 1.6.2 (MER vs derived target).

| MER | Sense-of-scale rating (informational) |
|-----|--------|
| <2.0× | Critical |
| 2.0-3.0× | Struggling |
| 3.0-5.0× | Healthy |
| 5.0-8.0× | Strong |
| 8.0×+ | Excellent |

**Quick mode:** Break-even table + MER vs target line + one paragraph.
**Full mode:** CM waterfall (using the canonical CM2% from manifest), "Good ROAS bad profit" checks, campaign-level profitability.

---

## Step 7: Methodology

Brief. Data sources, date ranges (current + YoY comparison), triage scoring rules, caveats (margin assumption if no Shopify, single-period limitations, etc.).

---

## Report Output

### Format

**All reports are delivered as PDF.** The `.md` source is saved alongside the PDF for grep-ability — no format question, just generate both.

Read `reference/pdf-template.md` for the input JSON contract, the 15-slide structure, and theme hooks.

Save to `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/{Client-Slug}_audit_{YYYY-MM-DD}.pdf` (and `.md` source alongside).

**If the user explicitly asks for the markdown alone** (e.g., "just give me the md, no PDF"), still produce the PDF — but the `.md` is what they grep over. The PDF is the deliverable shape; the `.md` is the durable, searchable source.

### PDF generation

Build the PDF input JSON per the contract in `reference/pdf-template.md`. Populate the `theme` block from the client's CLAUDE.md "Brand" zone (loaded in SKILL.md Step 1.0). Status colors stay locked. Charts generated via `scripts/generate_charts.py` are referenced from the input JSON and embedded by the renderer. Run:

```bash
node scripts/build_audit_pdf.js \
  --input {run_dir}/audit_pdf_input.json \
  --output {run_dir}/{Client-Slug}_audit_{YYYY-MM-DD}.pdf
```

The script writes a transient `.pptx`, calls `scripts/render_pdf.sh` for LibreOffice headless conversion, deletes the `.pptx`, and logs the final PDF path. Validate that the PDF is >100 KB and has 15 pages before declaring success.

### Writing Rules
- Direct language. No hedging. No corporate fluff.
- Show calculation formulas once per metric.
- RED/YELLOW platforms get detailed analysis; GREEN gets a sentence.
- Run human-voice check on all prose if protocol available.

### YoY Comparison Limitations

When the audit includes a comparison period (every audit, by default now):

- **Campaign-level YoY is usually impossible.** Campaign names change. Focus on account-level + channel-level YoY with campaign-level current-period only.
- **Tracking changes between periods invalidate rate comparisons.** Flag implausible YoY rate swings as likely tracking artifacts.
- **Device-level funnel comparisons are the best tracking-change detector.** Divergent device trends almost always indicate tracking, not behavior.
- **Owned channel YoY deltas are the single highest-value check in the synthesizer.** A >50% YoY drop in Email/SMS is almost always missed without a YoY view.

---

## Step 2.X — Pre-Delivery Quality Gate

Run the following checks BEFORE finalizing the docx. Failures iterate the body until they pass; if a check can't be made to pass after 2 iterations, the report is delivered with the failure logged in `manifest.quality_gate_results` so the orchestrator (Tanner) can decide.

| Gate Check | What it validates | If FAIL |
|---|---|---|
| Insight Rubric pass rate | ≥80% of body findings PASS the 5-axis rubric (per `reference/synthesis/insight-rubric.md`) | Iterate failing findings; demote unfixable ones to appendix |
| Action Contract completeness | 100% of Priority Actions have all 7 fields filled (per `reference/synthesis/action-contract.md`) | Move incomplete actions to Watchlist section |
| Pattern coherence | Body lead matches detected dominant pattern (per template loaded in Step 1.8b) | Regenerate body lead from the template |
| Reader-layer separation | Page 1 (Money Page) standalone-readable in <90 seconds. Operator pages don't bury tactical actions in narrative. Appendix has all calculations. | Restructure failing layer |
| **Money Page word budget** | Page 1 ≤200 words, contains dollarized opportunity headline (per `dollar-impact-methodology.md` aggregation), contains The One Thing as full 7-field Action Contract, contains 5-day operator sequence | Trim Page 1 to budget per Section 2.0 enforcement order; if dollar headline is missing, regenerate from Findings Matrix top row; if One Thing is missing or has incomplete Action Contract, demote that action and select the next highest-$ HIGH-confidence RED row |
| Body word budget | ≤1,400 words total (raised from v2's 1,200 to absorb the 200w Money Page; Page 1 word count is checked separately above and rolls into this total), depth-scaled per channel (RED 150w / YELLOW 100w / GREEN 30w) | Trim or demote to appendix per existing concision rules |
| Findings Matrix presence | Section 2.4 Findings Matrix is rendered with ≥1 row, dollar-Impact cells per `findings-matrix.md`, and color-coded cells | If empty, log finding-source failure; do NOT ship without the matrix |
| Money chart annotation | Per audit-taste composition, the money chart for the dominant pattern is annotated. Non-money charts are minimal. | If wrong chart annotated, swap |

Log results to manifest:

```yaml
quality_gate_results:
  framework_version: v4-cowork-memory
  insight_rubric_pass_rate: 0.85       # 85%, passes ≥80% threshold
  action_contract_completeness: 1.0    # 100%, passes
  pattern_coherence: pass
  reader_layer_separation: pass
  money_page_word_count: 196           # under 200, passes
  money_page_headline_present: pass
  money_page_one_thing_complete: pass
  money_page_5_day_sequence: pass
  body_word_count: 1356                # under 1400 cap (and includes Page 1's 196w), passes
  findings_matrix_rendered: pass
  money_chart_annotation: pass
  overall: pass
```

If `overall: fail` after 2 iterations, deliver anyway but include a `Quality Gate Failures` row at the bottom of the appendix listing what failed and why.

---

## Anti-Hallucination Verification

**MANDATORY before delivery.**

1. Every metric traces to evidence JSON
2. Re-run all calculations
3. Every data point labeled: OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, or DATA_NOT_AVAILABLE
4. All ASSUMPTIONs listed in Data Gaps
5. Cross-check totals: sum of platform spend ≈ MER denominator (±5%)
6. Shopify revenue vs platform-claimed revenue — flag discrepancies
7. No untraceable metrics in report

Fix any failures before delivery.

---

## Finalize

1. Save report to correct location
2. Update manifest (mark synthesis complete)
3. Tell user where report is saved
4. 3-5 sentence verbal summary of top findings
5. Call out CRITICAL actions
6. Note data gaps

---

## Step 1.9 — Outcomes Capture Setup

After the PDF is finalized (Finalize step above), generate the outcomes-tracking stub file in the same dated run folder so the 30/60/90-day check-ins are pre-formatted and ready to fill.

**File path:** `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/outcomes_template.md`

(Same parent folder as the PDF. Date = audit completion date in `YYYY-MM-DD` format. Example: `clients/Acme-Co/runs/2026-04-28/outcomes_template.md`. The canonical content lives at `templates/outcomes-template.md` in the skill source.)

**What goes in the stub:** the synthesizer pre-populates the file using the template structure defined in `reference/synthesis/outcomes-loop-template.md`. Specifically:

- **Header:** audit date, dominant pattern, secondary patterns, MER / nROAS / TOF spend share at audit time (the baseline metrics against which 30/60/90-day movement will be measured)
- **Implementation Tracker (empty rows):** one row per Priority Action from the report, with columns `Action / Status (Not yet checked → Done|In-Progress|Skipped) / Date completed / Reason if skipped / Outcome observed`. Status defaults to "Not yet checked"
- **Predicted vs Actual (empty rows):** one row per measurable claim from the body — any finding with a numeric prediction (e.g., "expect MER to drop 0.4× in 60 days," "expect 15-25% lift in CPATC over 14 days"). Columns: `Finding / Predicted impact / Actual at 30d / Actual at 60d / Match? (Y/N/Partial)`. All actuals empty
- **Pushback & Defenses:** empty section, fills as the audit gets challenged
- **Calibration Learnings:** empty section, fills at the 90-day checkpoint

**Manifest update:** log the outcomes file path to the manifest as `outcomes_file: "{absolute path}"` so future audit runs and the quarterly aggregation pass can find it.

**When the synthesizer runs this step:** after Finalize step 6 (data gaps). It runs immediately before Step 1.10 (CLAUDE.md update) — the stub is written first so the CLAUDE.md outcomes pointer can point to a path that already exists.

**Don't:** populate any of the trackers with placeholder values. The stub is intentionally empty in the row bodies — that's how the human knows what's still pending vs already filled.

---

## Step 1.10 — Update CLAUDE.md  *(NEW in v4)*

After the outcomes stub is written, append the audit's takeaway to `clients/{Client-Slug}/CLAUDE.md`. **Append-only, narrow scope.** The full procedure is owned by SKILL.md Step 1.10 — the synthesizer's job here is just to surface the three values needed:

1. **Pattern summary one-liner** for `## Recurring Patterns` — pulled from `manifest.dominant_pattern` plus one phrase of context (≤140 chars total, prefixed by `{YYYY-MM-DD}: `).
2. **Outcomes pointer** for `## Outcomes` — the literal relative path `runs/{YYYY-MM-DD}[-rN]/outcomes_template.md` (prefixed by `{YYYY-MM-DD}: `).
3. **Last audited line** — `{YYYY-MM-DD} (run #{N})` where `N` is the count of subfolders under `clients/{Client-Slug}/runs/`.

**What the synthesizer does NOT touch:** `## Identity`, `## Brand`, `## Standing Context`. These are user-owned. If the synthesizer notices a discrepancy (e.g., the AOV tier in CLAUDE.md doesn't match the AOV calculated this run, the brand keyword list seems incomplete vs Pull 5C results), surface it as a question in the verbal summary — never auto-edit.

See `reference/synthesis/outcomes-loop-template.md` for the full capture format, the 30/60/90-day cadence, and the quarterly aggregation rule that feeds into framework calibration.
