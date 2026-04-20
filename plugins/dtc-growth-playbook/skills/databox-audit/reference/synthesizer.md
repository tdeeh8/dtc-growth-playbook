# Audit Synthesizer — Databox-Audit

Generates the final cross-channel report. The opening sections are structured as a **Marketing Director Overview** — a one-scroll answer to "where is the account, where's the money going, what's at risk, what do I do next." Platform deep-dives come after as reference material.

> **Default output is DOCX.** Markdown is only produced on explicit user request. Chart generation via `scripts/generate_charts.py` is **required**, not optional — every audit ships with the prescribed chart set embedded in the docx.

---

## Chart Set (always generate these 5 charts)

The chart generator produces a fixed set of 5 charts. Build the chart spec, then invoke the generator **before** producing the docx so images can be embedded.

| Chart | Purpose | Include when |
|---|---|---|
| `spend_roas_bubble` | Bubble plot of spend (x) vs ROAS (y), bubble size = revenue, per campaign | Any paid channel was deep-dived |
| `channel_mix_yoy` | Stacked bar of revenue by channel group, current vs prior year | Always include if GA4 was pulled |
| `attribution_gap` | Bar chart: platform-claimed revenue vs GA4-attributed vs Shopify net sales | Combined paid-claimed revenue >40% of Shopify net sales |
| `cvr_bounce_yoy` | Dual-axis line: session-to-purchase CVR and bounce rate YoY | GA4 scored RED or YELLOW |
| `frequency_by_campaign` | Bar of average frequency per Meta campaign with spend overlay | Meta was deep-dived |

### Generation workflow

1. Assemble the chart spec JSON — one entry per chart to include, with the metrics/values pulled from evidence JSONs.
2. Write the spec to `{evidence_dir}/charts/chart_spec.json`.
3. Run: `python scripts/generate_charts.py --spec {evidence_dir}/charts/chart_spec.json --out {evidence_dir}/charts/`
4. Reference the resulting PNGs from the docx-template flow.

If a chart's inclusion criteria aren't met, omit that entry from the spec — don't render a blank chart.

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

- **Executive summary:** ONE paragraph, **4 sentences max** — YoY trajectory, cause, bright spot, biggest risk.
- **Body sections:** one page per channel. Each page = scorecard row + one chart + 3-bullet diagnosis + 3-bullet actions. No repeated narrative between exec summary and body.
- **Every number in the body** must either be visualized (chart) or appear in exactly ONE place (chart OR table, not both).
- **Target total word count: 1,200 words for the body** (excluding appendix).

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

**Data integrity:** Missing/null fields → DATA_NOT_AVAILABLE. Never invent values.

---

## Step 2: Marketing Director Overview (Core Output)

This is the core deliverable. Generate these **eight** components in order.

1. **Executive Summary** — 1 paragraph, 4 sentences
2. **Account Scorecard** — existing 6-dimension table
3. **Cross-Channel Overview** — 1 chart (`channel_mix_yoy`) + attribution reconciliation table
4. **Priority Actions** — 3-6 actions ordered by impact, before per-channel detail
5. **Per-Channel Pages** — one per channel deep-dived, each with chart + 3-bullet diagnosis + 3-bullet actions
6. **Tracking & Attribution Notes**
7. **Methodology + Data Sources**
8. **Appendix** — detailed tables

### 2.1 Executive Summary

One paragraph, **4 sentences max**:
- Is the account growing, holding, or declining? (lead with the YoY revenue number)
- What's actually causing that trajectory? (media vs lifecycle vs tracking vs unit economics)
- What's the bright spot?
- What's the single biggest red flag?

Example: *"{Client} is holding revenue roughly flat (~9% decline YoY) while significantly increasing paid media spend and improving paid ROAS. The softness is not a media problem — it is a lifecycle problem (Email + SMS revenue collapsed YoY) and a tracking problem. Paid is the bright spot; the biggest red flag is owned-channel collapse that the single-period view did not catch."*

### 2.2 Account Scorecard

Six dimensions, each scored RED / YELLOW / GREEN with a one-line signal and a one-line interpretation.

| Dimension | Signals to use |
|---|---|
| Paid media efficiency | Blended ROAS vs target, YoY delta |
| Owned channel health | Email + SMS YoY revenue delta, % of revenue from owned |
| Tracking integrity | UTM fragmentation count, duplicate conversion actions, GA4 vs platform revenue gap |
| Growth trajectory | Sessions YoY, revenue YoY, txns YoY |
| Unit economics | AOV YoY, return rate if available, margin if known |
| Financial measurement | Is Shopify/BC connected? Is there a margin anchor? |

**Scoring rules:**
- RED = broken or declining materially
- YELLOW = below target or concerning trend
- GREEN = at or above target

### 2.3 Cross-Channel Overview

One chart (`channel_mix_yoy`) plus a short attribution reconciliation table:

| Source | Claimed Revenue | % of Shopify Net Sales |
|---|---|---|
| Google Ads | ... | ... |
| Meta Ads | ... | ... |
| GA4 (Paid) | ... | ... |
| Shopify (Net Sales) | ... | 100% |

If combined paid-claimed revenue exceeds 40% of Shopify net sales, also include the `attribution_gap` chart here. Two-sentence read-out: what the mix looks like vs prior year, and whether claimed attribution is plausible.

### 2.4 Priority Actions

**3-6 actions ordered by impact.** Each item: one-line action, expected lift or risk reduction, owner. This sits BEFORE the per-channel detail so the reader can scan it in isolation.

Candidate sources for priority actions (pick from the ones actually supported by evidence):
- Owned channel collapse (if Email/SMS YoY revenue down >50%)
- Attribution blindness (Meta UTM fragmentation, Google conv duplication)
- Over-concentration (one campaign >40% of spend OR one channel >60%)
- Unit economics drift (AOV declining, return rate rising, discount creep)
- Missing financial anchor (no Shopify/BC connected)
- Platform-specific saturation (Meta freq >4, Google IS budget lost >30%)
- Paid reallocation (shift % of underperforming tier into working tier)

### 2.5 Per-Channel Pages

One page per deep-dived channel. Each page:

1. Scorecard row (status + headline metrics from the keep/cut table above)
2. One chart (from the prescribed chart set — pick the one that best fits this channel)
3. **Diagnosis — 3 bullets.** What's happening and why.
4. **Actions — 3 bullets.** What to do, in priority order.

No repeated narrative between exec summary and this section. No restating numbers that appear in the chart.

### 2.6 Tracking & Attribution Notes

Short section. UTM health, conversion duplication, GA4↔platform reconciliation, device-level funnel sanity check. Call out the YoY rate swings that are almost certainly tracking artifacts.

### 2.7 Methodology + Data Sources

Brief. Data sources, date ranges (current + YoY comparison), triage scoring rules, caveats (margin assumption if no Shopify, single-period limitations, etc.).

### 2.8 Appendix

Everything relegated from the body under the keep/cut rules, plus:

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

## Step 3: Triage Summary (Brief)

One compact table after the Marketing Director Overview. Platform, Score, Headline Metric, Root Issue. 3-5 rows.

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

**Read `reference/synthesis/profitability-framework.md`**.

Quick reference:
- Break-even CPA = AOV × Gross Margin %
- Target CPA = Break-even × 0.65
- Minimum ROAS = 1 ÷ Gross Margin %
- Target ROAS = Minimum × 1.4
- MER = Revenue ÷ Total Marketing Spend

| MER | Rating |
|-----|--------|
| <2.0× | Critical |
| 2.0-3.0× | Struggling |
| 3.0-5.0× | Healthy |
| 5.0-8.0× | Strong |
| 8.0×+ | Excellent |

**Quick mode:** Break-even table + MER rating + one paragraph.
**Full mode:** CM waterfall, "Good ROAS bad profit" checks, campaign-level profitability.

---

## Step 7: Methodology

Brief. Data sources, date ranges (current + YoY comparison), triage scoring rules, caveats (margin assumption if no Shopify, single-period limitations, etc.).

---

## Report Output

### Format

**All reports are delivered as DOCX.** No format question — just generate the Word doc.

Read `reference/docx-template.md` for the full generation workflow and status-color helpers. Also read `anthropic-skills:docx` for general docx best practices before generating.

Save to `{department}/reports/{Client-Name}/{Client}_audit_report_{date}.docx`

**If the user explicitly asks for markdown instead** (e.g., "just give me the md", "I don't need a Word doc"), save as `.md` to the same location. Default is always DOCX.

### DOCX generation

Use `reference/docx-template.md` for the color-coded status helpers. Status values in Channel Role, Scorecard, and Triage Summary tables auto-render with RED/YELLOW/GREEN/GRAY fills based on cell content. Charts generated via `scripts/generate_charts.py` are embedded per the template. After generation, validate with `scripts/office/validate.py` if available.

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
