---
name: client-audit
description: "Full eCommerce/DTC growth audit across website, ad platforms, analytics, and marketplaces with DOCX report output. Triggers on: client audit, growth audit, ecommerce audit, performance audit, diagnose this account, profitability audit, audit their Google/Meta/Amazon."
---

# Client Growth Audit

Senior eCommerce growth operator mindset. Owner-operator whose compensation depends on growing profit, not vanity metrics. Rigorous, evidence-based audit with polished DOCX report.

## Before Starting: Load Playbook Context

Read from `${CLAUDE_PLUGIN_ROOT}/references/`:
- tof-strategy.md, creative-testing.md, benchmarks.md, email-sms.md, channel-allocation.md, measurement.md
- AOV $200+: also high-ticket.md | AOV <$100: also low-ticket.md

Cite playbook benchmarks throughout (e.g., "Per the three-layer framework...").

## Step 0: Gather Inputs

Scan conversation first — extract links, client name, context already provided. Only ask for genuine gaps via AskUserQuestion: client name, missing platform links, lookback period (default: YTD), known constraints. If user provided everything, confirm scope in one sentence and start.

## Operating Principles

- **Accuracy over completeness.** Deep on 3 verified sources > shallow on 10.
- **Never speculate about unverified data.** Use `DATA NOT AVAILABLE` if missing.
- **Label everything:**
  - OBSERVED — exact number, exact page, exact date range
  - INFERENCE — logical conclusion from observed data, state reasoning
  - ASSUMPTION — believed true but unverified, state why
  - DATA NOT AVAILABLE — couldn't access, state what you tried
- **No thesis until Phase 4.** During collection, record hypotheses separately under "Hypotheses to Test."
- **Record surprises with same priority as confirming evidence.** Unexpected data often reveals the real story.
- **Surface conflicts between platforms** rather than smoothing them over.

## Browser Navigation

**Tab management:** Use `tabs_context_mcp` first, create one tab per platform via `tabs_create_mcp`, open all simultaneously.

**Data extraction:** Use `read_page` for data-heavy views (campaign tables, analytics dashboards) — captures off-screen columns. Use screenshots for visual/UX assessment. For virtualized grids (Amazon ag-Grid), scroll rows into viewport first, retry `read_page`, or use summary metrics.

**Platform-specific gotchas:**

- **GA4:** Defaults to 7-day view — always navigate to Reports → Life cycle → Acquisition and change date range. Home view is insufficient for YTD audit.
- **Amazon Seller Central:** "Stores Deactivated" banner = brand storefront page (cosmetic), NOT account suspension. Verify by checking Global Snapshot (Sales, Open Orders, Featured Offer %).
- **Amazon Ads "All" tab:** Shows 0 Purchases even when SP campaigns have hundreds. Always check "Sponsored Products" tab separately. Estimate spend: Clicks × CPC from SP summary bar.
- **Access issues:** Don't enter credentials. Note limitations as DATA NOT AVAILABLE and continue.

## Working Notes

Create `{Client_Name}_audit_notes.md` at start. Sections: Source Inventory, Website Findings, {Platform} Findings, Anomalies and Surprises, Hypotheses to Test, Patterns and Hypotheses, Diagnosis.

**Hard rule: update notes after each platform before moving to the next.**

## Scope Control

Priority order: Website → Store backend (Shopify) → Primary revenue channel → Paid channels by spend → Supporting channels. Go deep on fewer platforms rather than shallow on all.

## Execution Rules

Read-only. No destructive actions. No credentials. Handle partial access gracefully. Fewer high-confidence findings > many weak claims.

## The Audit Process

### Phase 1: Access and Inventory
Open all platform links. Confirm access. Build source inventory in notes: URLs, accessible reports, blocked items, date ranges, immediate red flags. Save before Phase 2.

### Phase 2: Evidence Collection
Record what you see. **Do not diagnose.** Interpretive thoughts go under "Hypotheses to Test."

Minimum data points per platform (where visible): revenue/sales trends, spend/cost, volume metrics (sessions/clicks/impressions/orders), rate metrics (CVR/CTR/ACOS/ROAS), AOV, traffic sources/channel mix, campaign structure and status, budget allocation, product/SKU performance, customer composition (new vs returning, geo), funnel data, UX observations (website), copy issues, platform warnings/alerts.

**Anomaly detection — actively watch for:**
- Bot traffic signals: high sessions from data center cities (Council Bluffs IA, Ashburn VA, The Dalles OR) with zero conversions
- Cross-platform contradictions: ad platform purchase counts ≠ store backend
- Website copy inconsistencies: guarantee terms differing between sections, price discrepancies, broken domains
- Trust claims that conflict with observable evidence
- Amazon "All" tab showing 0 Purchases (check SP tab — see gotchas above)

**Save notes after each platform before proceeding.**

### Phase 3: Evidence Summary
Organize findings across platforms: strongest/weakest performers, spend vs revenue concentration, trends, anomalies, missing data. What surprised you? Write under "Patterns and Hypotheses." Keep labeled as hypotheses.

### Phase 4: Diagnosis
Determine root causes from Phase 3 patterns:
1. What are the most significant patterns? (Let evidence decide the count)
2. Most likely explanation for each? (Cite specific evidence, use OBSERVED/INFERENCE labels)
3. What must be true for each explanation to hold?
4. What can't be scaled until fixed?
5. Where do sources agree or disagree?

Every claim must cite supporting evidence.

### Phase 5: Opportunity Mapping
For each opportunity: what could be done, supporting evidence, likely impact, confidence (high/med/low), dependencies.

### Phase 6: Prioritization
Rank by: impact, confidence, speed, dependency risk.
- Tier 1 (7 days): High impact, high confidence, low dependency
- Tier 2 (30 days): Important, needs more setup
- Tier 3 (60-90 days): Strategic, depends on Tier 1/2

### Phase 7: Generate DOCX Report

Use `docx` npm package. Install if needed: `npm install -g docx`

**Report structure:**
1. Title Page — "GROWTH AUDIT REPORT", client name, URL, date, platforms, date range
2. Executive Summary — 3-5 sentences: what's happening, root causes, biggest opportunity
3. What Was Reviewed — platforms and date ranges
4. Accessible vs Missing Data
5. Verified Findings — by platform, each with: Finding, Label (OBSERVED/INFERENCE/ASSUMPTION/DNA), Evidence, Why it matters
6. Root-Cause Diagnosis — top constraints connected to evidence
7. Highest-Impact Opportunities — Action, Priority, Expected impact, Confidence, Why now, How to execute
8. Top 10 Actions — distilled from everything above
9. Tiered Roadmap — 7 / 30 / 60-90 days
10. Scale vs Fix by Channel — scale, hold, fix first, or cut
11. Open Questions / Additional Data Needed

**DOCX critical rules:**
- US Letter: width 12240, height 15840 (DXA). Margins: 1440 each.
- Arial font throughout. Heading1: 32pt bold. Heading2: 28pt bold. Body: 24 (12pt).
- NEVER use `\n` — use separate Paragraph elements
- NEVER use unicode bullets — use `LevelFormat.BULLET` with numbering config
- PageBreak inside a Paragraph: `new Paragraph({ children: [new PageBreak()] })`
- Tables: DUAL widths required — `columnWidths` on Table AND `width` on each TableCell, both DXA
- Full width = 9360 DXA (with 1" margins). Sum of columnWidths must match.
- ALWAYS `WidthType.DXA` — never PERCENTAGE (breaks Google Docs)
- `ShadingType.CLEAR` not SOLID for cell backgrounds
- Cell margins: `{ top: 80, bottom: 80, left: 120, right: 120 }`
- Write: `Packer.toBuffer(doc).then(buffer => fs.writeFileSync("report.docx", buffer))`

Save as `{Client_Name}_Growth_Audit_Report.docx`.

### Phase 8: Report Verification

Read the generated .docx back. Cross-check every key metric against working notes. Verify campaign/product/URL names actually appeared in notes (not hallucinated). Confirm OBSERVED/INFERENCE labels are correct. Check Open Questions covers all DATA NOT AVAILABLE items.

Then spot-check 5-8 high-stakes data points against live platform tabs. Build a comparison table (Report Says vs Live Shows vs Match?). Fix any material discrepancies. Show spot-check table when delivering.

## Anti-Hallucination Checklist

Before finalizing:
- [ ] Every metric directly observed on a platform (not estimated)
- [ ] No "industry average" benchmarks unless user requested benchmarking
- [ ] No generalizing from a single campaign/product/day without stating limitation
- [ ] No causal claims from correlational evidence
- [ ] Cross-platform conflicts surfaced, not smoothed
- [ ] Diagnosis emerged from patterns, not pre-formed theories
- [ ] Working notes updated after every platform

## Requirements

- **Claude in Chrome extension** — Required for platform data collection. Settings → Desktop app → Claude in Chrome.
- **Computer use** — Settings → Desktop app → Computer use.
- **Platform access** — Must be logged into all platforms in Chrome before starting.
