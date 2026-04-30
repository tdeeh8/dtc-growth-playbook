# Meta Ads Deep-Dive — Ads-Audit

Loaded when Meta Ads scores RED or YELLOW at triage.

**Also load:** `reference/playbook/benchmarks.md` for Floor/Healthy/Strong thresholds.
**Conditional:** If workspace playbook available, also load `andromeda.md` (algorithm behavior, creative diversity, fatigue). If creative is flagged, also `creative-testing.md` and `scaling-frequency.md`.

## Report Inclusion Rules

Not every metric this deep-dive produces belongs in the report body. Apply these rules when synthesizing:

**BODY (scorecard + diagnosis, 1 chart):**
- **First line of the Meta scorecard row: Role mix (TOF/MOF/BOF spend share %)** — always include, regardless of mode.
- Top-line efficiency from Pull 1, broken out by role: total spend by role, role-appropriate KPI per role (TOF: CPATC + engaged time; MOF: ATC→Checkout + frequency; BOF: ROAS + CPA).
- Top 3 and bottom 3 campaigns / ad sets within each role grouping (Pull 1).
- One chart:
  - When TOF Mode is active → "Quality metrics vs benchmark by AOV tier" (CPATC, CPVC, engaged time vs the client's AOV tier row in `reference/playbook/benchmarks.md`). NOT a ROAS chart.
  - When TOF Mode is NOT active → "CPA trend" or "ROAS by campaign" as before.
- Frequency / creative-fatigue signal from Pull 3/4 — one line if it's a flag.
- Role compliance flags from Pull 7 (any TOF-labeled campaign with >70% retargeting audience spend) — one line if any campaigns trip the rule.

**APPENDIX (reference-only, not in body):**
- Full Pull 1 campaign breakdown.
- Pull 2 funnel metrics (CTR, LP views, add-to-cart, purchase).
- Pull 3 creative-level performance.
- Pull 4 creative quality signals (quality/engagement/conversion rankings).
- Pull 5 demographic breakdown.
- Placement / device splits if pulled.

**CUT entirely:**
- Raw impressions with no downstream metric.
- CTR without CVR context.
- Ad sets contributing <1% of spend (noise).
- Any metric that can't be tied to a decision.

The narrative for this platform in the report body must be ≤ 200 words. Detailed tables go in the appendix.

---

## Context from Triage

- ROAS below target → Focus on campaign structure + audience quality (BOF/MOF only — TOF ROAS is informational)
- High frequency → Focus on audience saturation + creative fatigue
- High/rising CPM → Focus on audience targeting + creative quality signals
- CPA above break-even → Focus on funnel conversion rates + creative performance (BOF/MOF only — break-even CPA is structurally inapplicable to TOF prospecting)
- Attribution ratio high → Focus on CAPI/pixel health + deduplication
- **TOF Mode flagged** (any Meta TOF spend exists) → Skip standard ROAS analysis for the TOF portion, run Pull 2 + Pull 6 (TOF Quality Pull) + Pull 7 (Role Compliance Check) and pair with GA4 Pull 5 (Channel Quality) + GA4 Pull 6 (New vs Returning by channel). Use the AOV-tier benchmarks (Mass / Standard / Premium / Luxury) from `playbook/benchmarks.md`.

## TOF Mode

TOF Mode applies whenever **any** Meta spend is classified as TOF (per the Channel Role Classification step in `reference/triage-pulls.md`). There is no AOV gate — prospecting campaigns are never scored by 7-day in-channel ROAS, regardless of AOV. The AOV tier (Mass <$50, Standard $50-200, Premium $200-1,000, Luxury $1,000+) only determines which benchmark row in `playbook/benchmarks.md` the quality metrics are scored against.

**Score authority:** the platform-level Meta score is a **weighted blend** — TOF-quality verdict (weighted by TOF spend share) + MOF/BOF ROAS verdict (weighted by their spend shares). Standard ROAS-based RED triggers fire only on the MOF/BOF portion of spend.

**For the TOF portion of Meta spend:**

- **Skip / deprioritize for diagnosis:** TOF ROAS-based ranking (still pulled but appendix-only), Pull 5 demographics (low value here), the standard "ROAS by campaign" chart.
- **Always run:** Pull 1 (role-aware campaign performance — for context, not scoring), Pull 2 (funnel metrics — central to TOF diagnosis), Pull 6 (TOF Quality Pull — see below), Pull 7 (Role Compliance Check — confirms TOF-labeled campaigns aren't actually retargeting). Then call GA4 Pull 5 (Channel Quality) and GA4 Pull 6 (New vs Returning) — without GA4, the framework only delivers 2 of 5 metrics.

**Reframe the body narrative around the five quality metrics:** Cost per ViewContent, Cost per Add-to-Cart, GA4 average engaged time (Meta source/medium), PDP→ATC%, PDP→Purchase%. Use the AOV-tier decision tree in `playbook/benchmarks.md` to diagnose the pattern. Body chart should be "Quality metrics vs benchmark by AOV tier" — not a ROAS chart.

**Tracking validation gate:** Before declaring "low traffic quality," confirm with Pull 4 + GA4 Pull 4 that ViewContent/AddToCart/view_item/add_to_cart events are firing correctly. Broken pixel looks identical to bad creative.

## Deep-Dive Pulls (5 pulls for RED, 2-3 for YELLOW)

### Pull 1 — Campaign Performance (ALWAYS run)

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "CPM", "Frequency"]
  dimensions: ["Campaign Name", "Campaign Objective", "Campaign Delivery Status"]
```

6 metrics + 3 breakdowns. Shows which campaigns drive results and funnel stage distribution.

**Analysis checklist:**
1. **Classify every campaign as TOF / MOF / BOF** using the Canonical Mapping in `reference/full-funnel-framework.md` Section 1 (Campaign Objective + naming heuristics + audience type). When two of three signals disagree, mark the campaign `ambiguous` and surface in the report — do not silently force a label.
2. Compute spend share by role (TOF % / MOF % / BOF %). This is the headline "Role mix" line for the scorecard.
3. Within each role, compute the role-appropriate KPI summary (see KPI table below).
4. Within each role, identify top 3 / bottom 3 campaigns by that role's primary KPI.
5. Check for spend with 0 purchases (any role).
6. Check campaign count: >5 active at <$50k/mo spend = fragmentation risk.
7. Check delivery status issues (Learning Limited, Delivery Issues).

**Role-appropriate KPIs (use these for the per-role summary and top/bottom rankings):**

| Role | Primary KPIs (driver for top/bottom ranking) | Secondary (context only) |
|---|---|---|
| **TOF** | CPATC, CPVC, frequency, CPM trend, CTR (Link) | 7-day in-channel ROAS — informational only, attribution-window-limited |
| **MOF** | ATC→Checkout rate, frequency, ROAS (more reliable than TOF since cycle is shorter) | CPM, CTR |
| **BOF** | ROAS, CPA vs break-even, attribution ratio (vs Shopify orders) | Spend share, branded vs non-branded mix |

**Output structure (replaces the flat campaign performance table):** group output by role. Three sections — `## TOF Campaigns`, `## MOF Campaigns`, `## BOF Campaigns`. Each section contains: total spend, role-appropriate KPI summary, top 3 / bottom 3 campaigns by that role's primary KPI. Add an `## Ambiguous Campaigns` section at the bottom for any campaigns flagged in step 1.

**ROAS for TOF:** stays in the appendix as informational only — do NOT use TOF ROAS for top/bottom ranking or scoring. Per `reference/full-funnel-framework.md` Section 3, 7-day attribution windows structurally undercount cold prospecting.

### Pull 2 — Funnel Metrics (run if CPA or ROAS flagged)

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Link Clicks", "CTR (Link Click-Through Rate)", "CPC (Link)", "Total Content Views", "Total Adds To Cart", "Total Checkouts Initiated"]
  dimensions: []
```

6 metrics, totals only. Pinpoints WHERE in the funnel things break down.

**Calculate:**
- Thumbstop/Hook rate: CTR (Link Click-Through Rate) — benchmark >1.5%
- View → ATC rate: Add-to-carts ÷ Content Views
- ATC → Checkout: Checkouts ÷ Add-to-carts
- Checkout → Purchase: Purchases (from triage) ÷ Checkouts
- Identify the biggest funnel drop-off

### Pull 3 — Creative Performance (run if frequency or CPM flagged)

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Spend", "Purchase Conversion Value", "Return On Ad Spend (ROAS)", "Total Purchases", "Link Clicks", "CTR (Link Click-Through Rate)"]
  dimensions: ["Campaign Name", "Ad Name", "Ad Creative Name", "Ad Effective Status"]
```

6 metrics + 4 breakdowns. Identifies top/bottom performers and creative fatigue.

**Analysis:**
- Top 5 and bottom 5 ads by ROAS
- Ads with >$500 spend and 0 purchases
- Creative diversity: how many unique creatives active?
- Fatigue signals: high-spend ads with declining CTR
- Active vs paused ratio

### Pull 4 — Creative Quality Signals (run if frequency high or RED)

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Impressions", "Quality Ranking", "Engagement Rate Ranking", "Conversion Rate Ranking", "Frequency"]
  dimensions: ["Campaign Name", "Ad Name"]
```

5 metrics + 2 breakdowns. Meta's own quality scores per ad.

**Analysis:**
- Ads with "Below Average" on any ranking → creative problem
- High frequency + declining quality rankings = fatigue
- Correlation between quality rankings and ROAS

### Pull 5 — Demographics (conditional — run if targeting is a concern)

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Spend", "Total Purchases", "Return On Ad Spend (ROAS)", "Purchase Conversion Value"]
  dimensions: ["Age", "Gender"]
```

4 metrics + 2 breakdowns. Shows who's converting.

**Analysis:**
- Age/gender segments with high spend but low ROAS
- Concentration: is 80%+ of conversions from one demo segment?
- Opportunity: underserved segments with good ROAS but low spend

### Pull 6 — TOF Quality Pull (run when TOF Mode is active — any Meta spend classified as TOF)

**Trigger:** Run whenever TOF Mode is active (any Meta spend classified as TOF in Pull 1). The AOV tier (Mass / Standard / Premium / Luxury) determines which benchmark row in `reference/playbook/benchmarks.md` you score against — not whether to run the pull.

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Spend", "Total Content Views", "Total Adds To Cart", "Total Checkouts Initiated", "Frequency"]
  dimensions: ["Campaign Name", "Ad Set Name"]
```

5 metrics + 2 breakdowns. Surfaces traffic quality at campaign + ad set level for TOF-quality diagnosis. Pull spec is unchanged from prior versions — only the trigger and scoring reference have generalized.

**Calculate per campaign / ad set:**
- CPVC = Spend ÷ Content Views
- CPATC = Spend ÷ Adds To Cart
- VC → ATC rate = Adds To Cart ÷ Content Views
- ATC → IC rate = Checkouts Initiated ÷ Adds To Cart

**Score against the AOV tier benchmark in `reference/playbook/benchmarks.md`** — use the row matching the client's AOV tier (Mass-AOV / Standard-AOV / Premium-AOV / Luxury). The decision-tree pattern is identical across tiers — only the absolute thresholds shift. Identify:
- Campaigns/ad sets with CPVC and CPATC both Healthy → keep, scale
- Campaigns with cheap CPVC but expensive CPATC → wrong audience, kill or refresh creative
- Campaigns with expensive CPVC AND CPATC → audience saturated or too narrow
- Campaigns with cheap CPVC AND CPATC but no GA4 engagement → audit network placement (Audience Network can be bot-heavy)

**Pair with GA4 Pull 5** (Channel Quality) for the engaged-time + PDP funnel half of the framework, and GA4 Pull 6 for new vs returning customer split.

### Pull 7 — Role Compliance Check (run for every campaign labeled TOF in Pull 1)

**Trigger:** Any campaign classified as TOF in Pull 1. Validates that the campaign's actual audience composition matches its TOF label — feeds the synthesizer's Role Compliance flag.

```
# Meta Ads data source — use load_metric_data per metric × dimension
  metrics: ["Spend"]
  dimensions: ["Campaign Name", "<audience dimension — see resolution order below>"]
```

1 metric + 2 breakdowns. The audience dimension resolves to `Custom Audience` (retargeting), `Lookalike`, or `Saved/Broad`. **Resolution order (matches the synthesizer's consumer contract in `reference/synthesizer.md` lines 108-114):**

1. **`Audience Type`** — Databox exposes the field directly. Use first if available. Yields `confidence: HIGH`. **Connector reality check (April 2026):** the standard Databox `FbAds` connector does NOT expose `Audience Type` for most accounts. Treat HIGH-confidence as the rare path, not the expected one.
2. **`Targeting Type`** — alternate Databox label exposing the same data. Use as second choice. Yields `confidence: HIGH`. Same connector caveat — most standard Databox accounts won't expose this either.
3. **Ad Set Name parsing fallback — THIS IS THE EXPECTED DEFAULT PATH for most Databox FbAds accounts.** Infer audience type from `Ad Set Name` naming conventions. Yields `confidence: MEDIUM` and `inference_method: "Ad Set Name parsing"`. Resolve `list_metrics(data_source_id=meta_ds_id)` first to confirm which path applies before pulling — but plan on this path firing.

**Ad Set Name parsing heuristic (the practical default — make it robust):**

Match against the ad set name (case-insensitive) in priority order. First match wins.

| Pattern (case-insensitive substring or regex) | Bucket |
|---|---|
| `\bRT\b`, `retarget`, `remarket`, `30d`, `60d`, `90d`, `180d`, `cart abandoners`, `cart-abandon`, `pdp viewers`, `IG engagers`, `FB engagers`, `video viewers`, `engagers`, `web visitors`, `purchasers`, `existing customers` | **Custom Audience** (retargeting) |
| `LAL`, `lookalike`, `\b1%\b`, `\b2%\b`, `\b3%\b`, `\b5%\b`, `\b10%\b`, `LLA`, `seed audience`, `value-based LAL` | **Lookalike** |
| `broad`, `prospecting`, `cold`, `interest`, `interest-based`, `detailed targeting`, `advantage+ audience`, `ASC`, `saved`, anything that doesn't match the above | **Saved/Broad** |

**Heuristic confidence floor:** only downgrade to `confidence: LOW` if the ad set name is generic / unparseable (e.g., `Ad Set 1`, `New Ad Set`, `Untitled` — no semantic content at all). LOW-confidence findings should appear in evidence but the synthesizer won't surface them as Role Compliance violations.

**Why MEDIUM is the realistic default:** Ad Set naming conventions in well-managed accounts encode audience type ~85% of the time (industry observation, not a measured benchmark). The MEDIUM rating reflects "best-available signal from a real connector" — not "degraded fallback." The synthesizer's softening rule (Section 2.4 / line 114) is calibrated for this reality: MEDIUM body language reads as "based on naming conventions — verify before acting on individual campaigns" rather than as a quality disclaimer that drowns the finding.

**Calculate per TOF-labeled campaign:**
- Spend by audience type bucket (Custom Audience / Lookalike / Saved/Broad)
- % of spend on retargeting Custom Audiences = Custom Audience spend ÷ total campaign spend

**Output:** for each TOF-labeled campaign, a single row with the audience-composition fields PLUS confidence metadata so the synthesizer can soften body claims when inference was used:

```
{
  campaign_name,
  total_spend,
  custom_audience_spend_pct,
  lookalike_spend_pct,
  broad_spend_pct,
  compliance_verdict,
  confidence: "HIGH" | "MEDIUM" | "LOW",
  inference_method: "Audience Type dimension"
                  | "Targeting Type dimension"
                  | "Ad Set Name parsing"
}
```

`confidence` is `HIGH` when the dimension was used directly (resolution path 1 or 2); `MEDIUM` when audience type was inferred from Ad Set Name (resolution path 3). The synthesizer reads this field and softens the body language when MEDIUM (per `reference/synthesizer.md` line 114 — "Role compliance inferred from ad set naming — verify before acting").

**Flag rule:** if a TOF-labeled campaign has **>70% of spend on retargeting custom audiences** → emit verdict `structural_mismatch` with the message "structural mismatch — campaign is functionally MOF, not TOF." This is what feeds the synthesizer's Role Compliance flag (see `reference/full-funnel-framework.md` Section 2). When a structural-mismatch campaign is worth >10% of platform spend, the platform score upgrades to YELLOW (per the Role Compliance override defined in the framework).

**What the audit does with mismatches:** score the campaign under the role its audience composition implies (audience type wins over the label) and surface the campaign in the report's Role Compliance section. Do not silently re-label.

## YELLOW Mode (Targeted Dive)

- Frequency concern → Pulls 1 + 4
- ROAS/CPA concern → Pulls 1 + 2
- CPM concern → Pulls 1 + 3
- Multiple concerns → Pulls 1 + 2 + 3
- **TOF Mode active (any AOV)** → Pulls 1 + 2 + 6 + 7, then trigger GA4 Pull 5 + Pull 6

## Evidence Output

`{Client}_meta-ads_evidence.json`

**Key fields:**
- `meta.triage_score`, `meta.triage_signals`, `meta.audit_depth`
- `meta.tof_mode_active` (bool — true if any spend classified as TOF in Pull 1)
- `meta.role_mix` — `{ tof_spend_pct, mof_spend_pct, bof_spend_pct, ambiguous_spend_pct }`
- `meta.role_classifications[]` — per campaign: `{ campaign_name, label_role, audience_inferred_role, classification_signals: [objective, naming, audience_type], final_role, ambiguous: bool }`
- `meta.role_compliance[]` — per TOF-labeled campaign (from Pull 7): `{ campaign_name, total_spend, custom_audience_spend_pct, lookalike_spend_pct, broad_spend_pct, compliance_verdict: "compliant" | "structural_mismatch", >10pct_of_platform_spend: bool, confidence: "HIGH" | "MEDIUM" | "LOW", inference_method: "Audience Type dimension" | "Targeting Type dimension" | "Ad Set Name parsing" }`. The `confidence` and `inference_method` fields are required — the synthesizer reads them to soften body language when audience type was inferred (per `reference/synthesizer.md` lines 108-114). HIGH for resolution paths 1 and 2 (direct dimension), MEDIUM for path 3 (Ad Set Name parsing).
- `meta.role_summaries` — `{ tof: {spend, primary_kpis, top3, bottom3}, mof: {...}, bof: {...} }`
- `meta.tof_quality_scoring` (when TOF Mode active) — `{ aov_tier, benchmark_row, per_campaign_scores }`
- `account_overview` with triage + deep-dive metrics
- `findings` grouped by: structure, creative, audience, tracking, **role_compliance**
- `diagnosis.primary_constraint` and root_cause
- `cross_channel_signals`: Meta → Google halo assessment, attribution overlap notes

## Diagnostic Patterns

| Pattern | Interpretation |
|---------|-----------------|
| High frequency + stable ROAS | Audience hasn't saturated yet (rare but possible) |
| High frequency + declining ROAS | Classic saturation — need creative refresh |
| Good CTR + bad CVR | Landing page or offer problem, not Meta's fault |
| Bad CTR + good CVR | Targeting is narrow but effective — creative needs work |
| CPM rising across all campaigns | Competitive auction pressure or seasonal |
| CPM rising on specific campaigns | Audience overlap or quality issues |
| >5 active campaigns at <$50k/mo spend | Andromeda can't optimize — fragmentation problem |
| TOF campaign + retargeting audience composition >70% | Mis-labeled, structural mismatch. Reclassify or rebuild as true cold prospecting (per `reference/full-funnel-framework.md` Section 2). |
| TOF spend share <Floor for brand stage × AOV tier (per `reference/full-funnel-framework.md` Section 4.2) AND nROAS declining | Underfunding acquisition. The funnel will collapse on a 30-60 day lag — flag in the headline scorecard. |
