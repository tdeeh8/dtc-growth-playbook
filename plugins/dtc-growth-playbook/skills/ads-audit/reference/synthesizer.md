# Audit Synthesizer — Ads-Audit

Generates the final cross-channel report. The opening sections are structured as a **Marketing Director Overview** — a one-scroll answer to "where is the account, where's the money going, what's at risk, what do I do next." Platform deep-dives come after as reference material.

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

This is the core deliverable. Generate these seven components in order.

### 2.1 Executive Summary

One paragraph, 3-4 sentences. Answer:
- Is the account growing, holding, or declining? (lead with the YoY revenue number)
- What's actually causing that trajectory? (media vs lifecycle vs tracking vs unit economics)
- What's the bright spot?
- What's the single biggest red flag?

Example: *"Teak Warehouse is holding revenue roughly flat (-9% YoY) while nearly doubling paid media spend (+91%) and dramatically improving paid ROAS. The softness isn't a media problem — it's a lifecycle problem (Email + SMS went from $19K/mo to $1K/mo YoY) and a tracking problem. Paid is the bright spot; the biggest red flag is owned-channel collapse that the single-period view didn't catch."*

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

### 2.3 Channel Role vs Reality

A matrix of every active channel, what its job should be, and whether it's doing it.

Columns: **Channel · Role · Status · Notes**

Status values (color-coded in the docx):
- `Delivering` — meeting or exceeding role expectations (GREEN)
- `Organic` — emerging / not formally managed but producing (GREEN)
- `Leaking` — spending but underperforming (YELLOW)
- `Fatiguing` — creative saturation, rising CPM (YELLOW)
- `Misaligned` — wrong optimization event or wrong audience (YELLOW)
- `Too early` — not enough data yet (GRAY)
- `Too-small-to-matter` — spend <1% of total (GRAY)
- `Broken` — fundamentally misconfigured (RED)
- `Collapsed` — YoY decline >50% where it shouldn't (RED)
- `Unmeasurable` — can't diagnose due to tracking issue (RED)

Always include owned channels (Email, SMS, Affiliate, Organic Search) even though they aren't "audited" in the paid sense — they're part of the portfolio and the YoY deltas matter.

### 2.4 Paid Media Allocation — Confidence Tier

Segment the total paid spend into four tiers:

| Tier | Criteria |
|---|---|
| Working — above target | ROAS ≥ target OR scaling with stable margin |
| Acceptable — near target | ROAS 70-99% of target OR acceptable with monitoring |
| Underperforming — at-risk | ROAS <70% of target OR tracking-broken but spending |
| Wasted / Diagnostic | 0 conversions, wrong optimization event, or known waste |

For each tier: dollar amount, % of paid spend, campaign list.

Then a one-line takeaway: *"≈X% of paid budget ($Xk/mo) is either underperforming or wasted. Reallocating half into [top performing campaigns] would deliver net lift."*

### 2.5 Top Risks

Ranked 1-6. Each item: name, one-line severity, what to do about it.

Standard candidates to consider:
1. Owned channel collapse (if Email/SMS YoY revenue down >50%)
2. Attribution blindness (Meta UTM fragmentation, Google conv duplication)
3. Over-concentration (one campaign >40% of spend OR one channel >60%)
4. Unit economics drift (AOV declining, return rate rising, discount creep)
5. Missing financial anchor (no Shopify/BC connected)
6. Platform-specific saturation (Meta freq >4, Google IS budget lost >30%)

### 2.6 30 / 60 / 90 Plan

Three buckets. Each bucket: 3-5 bullet actions, specific.

- **30 days** — tracking + triage. Fix the measurement stack first. Pause known waste. Triage any broken flows.
- **60 days** — reallocation + rebuild. Scale proven winners. Rebuild broken lifecycle channels. Fresh creative where fatigued.
- **90 days** — optimization + strategy. CRO, unit-economics diagnostics, net-new channel tests, formalize emerging channels.

### 2.7 Weekly KPIs to Watch

A short table: metric, current value, target or watch-threshold. 6-10 metrics.

Standard set:
- Blended MER
- Google Ads ROAS
- Meta Ads ROAS
- Email + SMS weekly revenue (trend)
- % of Meta sessions attributed in GA4 (the UTM health metric)
- PMax spend share (watch for cannibalization at >50%)
- New vs returning revenue mix (if Shopify connected)
- Mobile CVR (if mobile is a material share)

### 2.8 Data Gaps to Close

What's missing that would make next audit sharper. Typical:
- Shopify connected to Adzviser
- CRM/attribution platform for multi-touch
- LTV by channel
- Creative performance tracked over 60-90 day cycles

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

### Format decision

Ask user: "Want this as a Word doc or markdown?"

**Default by department type:**
- **Agency / Prospect** → DOCX. Read `reference/docx-template.md` for status-color helpers and the skill's docx template.
- **Brand** → Markdown (internal reference).

Save to `{department}/reports/{Client-Name}/{Client}_audit_report_{date}.{ext}`

### DOCX generation

Use `reference/docx-template.md` for the color-coded status helpers. Status values in Channel Role, Scorecard, and Triage Summary tables should auto-render with RED/YELLOW/GREEN/GRAY fills.

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
