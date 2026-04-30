# GA4 Deep-Dive Reference

**Load this file ONLY when triage scored RED or YELLOW on GA4.**
**Also load:** `reference/playbook/benchmarks.md` for conversion rate and engagement benchmarks.
**Conditional:** If workspace playbook available, also load `measurement.md` (reconciliation methodology, CAPI validation, tracking health monitoring, Meta Jan 2026 attribution changes).

Triage has already pulled traffic overview (Sessions, Users, New users, Engagement rate, Bounce rate) and ecommerce overview (Purchase revenue, Transaction count, Add-to-carts, Checkouts). This file does the reconciliation deep-dive.

---

## Report Inclusion Rules

Not every metric this deep-dive produces belongs in the report body. Apply these rules when synthesizing:

**BODY (scorecard + diagnosis, 1 chart):**
- Top-line traffic + conversion efficiency: sessions, engagement rate, purchase revenue, transactions — with YoY deltas.
- Top 3 and bottom 3 channels from Pull 1 (channel attribution).
- One chart: typically "Sessions & Conversions by Channel" or YoY revenue trend.
- Tracking integrity call-out from Pull 4 — one line if events look broken, skipped otherwise.

**APPENDIX (reference-only, not in body):**
- Full Pull 1 channel attribution table.
- Pull 2 source/medium detail.
- Pull 3 device performance (desktop / mobile / tablet).
- Pull 4 event tracking validation table.
- Landing-page / geo splits if pulled.

**CUT entirely:**
- Raw sessions without a downstream conversion.
- Bounce rate reported without engagement context.
- Sources contributing <1% of sessions (noise).
- Any metric without a YoY comparison or action tied to it.

The narrative for this platform in the report body must be ≤ 200 words. Detailed tables go in the appendix.

---

## Deep-Dive Pulls

### Pull 1: Channel Attribution (THE Key Pull) (RED: always | YELLOW: always)

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Sessions, Purchase revenue, Transaction count, Conversions

**Breakdowns:** Session default channel group

**Analysis triggers:**
- Platform over-attribution — Google Ads reporting $5K revenue, GA4 showing $3K attributed. Attribution model mismatch?
- Dark traffic spike — Direct/Unassigned >25% of revenue? UTM tagging gaps or cookie issues.
- Organic traffic decline — Sessions up, organic revenue down. Ranking loss or quality shift?
- Cross-channel order velocity — Does GA4's channel ordering match platform claims?

**CRITICAL:** Build reconciliation table comparing:
| Channel | GA4 Revenue | GA4 Transactions | Platform Reported | Variance % | Attribution Model Notes |
|---|---|---|---|---|---|

---

### Pull 2: Source/Medium Detail (RED: if Pull 1 shows gaps | YELLOW: always)

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Sessions, Purchase revenue, Transaction count

**Breakdowns:** Session source and medium

**Analysis triggers:**
- UTM hygiene breakdown — `(direct)(none)` high? Missing UTM parameters on paid traffic?
- Platform source mismatch — Google/gclid sources vs Google Ads channel claim. Tracking tag issues?
- Referral quality — Social referral revenue vs platform-claimed. Organic social overvalued?
- Email tracking — Email source/medium present? Campaign UTM coverage complete?

**Evidence:** Top 20 source/medium combinations by revenue. Identify untagged or mislabeled traffic.

---

### Pull 3: Device Performance (RED: if CVR concern | YELLOW: if CVR concern)

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Sessions, Purchase revenue, Transaction count, Bounce rate

**Breakdowns:** Device category

**Analysis triggers:**
- Mobile revenue per session trailing desktop — Ad spend weighting correct?
- Bounce rate divergence — Mobile >60%, desktop <40%? Landing page mobile UX issue.
- Conversion lag by device — Mobile sessions high, conversions low. Attribution window too short?
- Device-channel interaction — Mobile from paid channels converting worse than organic?

**Evidence:** Device performance matrix showing Sessions/Revenue/Trans/CVR by device. Mobile vs desktop bid adjustment validation.

---

### Pull 4: Event Tracking Validation (RED: if tracking suspect | YELLOW: conditional)

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** Event count

**Breakdowns:** Event name

**Analysis triggers:**
- Missing purchase events — Purchase event count <transaction count from triage? Tracking gap.
- Add-to-cart tracking — ATC events firer frequency vs triage ATC count. Cart abandonment baseline.
- Page view spike — Inflated page views vs sessions? Event firing on SPA navigation?
- Custom event dead zones — Expected conversion events not firing?

**Evidence:** Event count summary showing expected events (purchase, ATC, checkout, view_item) firing frequency.

---

### Pull 5: Channel Quality (Engaged Time + PDP Funnel) (RED/YELLOW: when triggered)

**Run whenever Meta TOF Mode is active OR any RED/YELLOW deep-dive on a paid platform with TOF spend.** This pull provides the GA4 half of the TOF Traffic Quality Framework — engaged time and PDP funnel rates by channel — so TOF-classified spend can be scored on quality metrics rather than 7-day in-channel ROAS.

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`, three sub-pulls:

**Pull 5A — Engagement by Channel (TOF + all paid):**
- Metrics: `Sessions`, `Average engagement time per session`, `Engaged sessions`, `Bounce rate`
- Breakdown: `Session source / medium` (or `Session default channel group` if source/medium too noisy)

**Pull 5B — PDP Funnel by Channel (if available):**
- Metrics: `Event count` (filtered to `view_item`, `add_to_cart`, `purchase`)
- Breakdown: `Session source / medium`
- If GA4 Funnel Exploration via API isn't accessible, compute from event counts + segment manually.

**Pull 5C — BOF Channel Baseline (same-site reference):**
- Same metrics as Pull 5A: `Sessions`, `Average engagement time per session`, `Engaged sessions`, `Bounce rate`
- Breakdown: `Session source / medium`

**BOF channel filtering — deterministic logic:**

The "BOF" set is built in priority order. Use whichever method has the cleanest data available:

1. **Manifest `brand_keyword_list` (preferred when present).** If the audit manifest has a `brand_keyword_list` field (set during account setup — see SKILL.md Step 1.1), build the BOF source/medium set as:
   - `google / cpc` AND `google / organic` sessions whose landing-page URL OR session keyword contains any term in `brand_keyword_list`
   - `(direct) / (none)`
   - `google / cpc` shopping segment (campaigns named `*shopping*` OR campaign type = Shopping)
   This produces a hard, reproducible BOF segment.

2. **Search Console fallback (when connected).** If Search Console is connected to the audit and `brand_keyword_list` is empty, derive brand vs non-brand from Search Console's queries report — terms with >70% click-share to a single domain page typically read as brand. Use those terms to filter the GA4 BOF set the same way as method 1.

3. **Heuristic fallback (last resort, when neither available).** If neither manifest list nor Search Console exists, use this conservative heuristic and explicitly label the BOF set as APPROXIMATE in evidence:
   - `(direct) / (none)` (full match)
   - `google / cpc` campaigns whose Campaign Name contains any of: `brand`, `branded`, the client's own brand string, or `shopping`
   - `google / organic` is EXCLUDED in heuristic mode (no way to separate brand vs non-brand without query data)
   When this method is used, set `bof_baseline.method = "heuristic_approximate"` in evidence so the synthesizer knows to soften body claims.

- **Purpose:** Establishes a same-site baseline for what "good" engagement looks like on this site. Without this, low engaged time on Meta could be interpreted as a Meta-quality problem when it's actually a site-quality problem. BOF traffic is the highest-intent audience the site has — if they engage 90s and convert 4%, that defines the site's ceiling. TOF quality is then judged *relative to* BOF, not against an external benchmark alone.

- **Action when no usable BOF segment exists:** if manifest is empty, no Search Console, AND the heuristic returns <500 sessions over the audit window, skip Pull 5C entirely and note it. The synthesizer falls back to absolute benchmarks (the AOV-tier table in `playbook/benchmarks.md`) without the BOF baseline ratio.

**Lookback override:** Pull 5B should run on a 30-90 day lookback (not the audit's standard period) to capture the full consideration cycle on PDP→Purchase. Note the longer window in evidence.

**Calculate (filter to Meta source/medium = `facebook / cpc`, `fb / cpc`, `meta / paid`, etc. — confirm UTM convention with user):**
- Avg engaged time (Meta TOF) — score against AOV-tier benchmark in `playbook/benchmarks.md` AND against Pull 5C BOF baseline
- PDP→ATC rate (Meta) = Meta-attributed `add_to_cart` events ÷ Meta-attributed `view_item` events
- PDP→Purchase rate (Meta) = Meta-attributed `purchase` events ÷ Meta-attributed `view_item` events (use 30-90 day window)
- BOF baseline ratio: TOF engaged time ÷ BOF engaged time — values <0.5 mean TOF traffic is materially lower-quality than the site's known-good audience; values >0.8 mean TOF quality is roughly comparable to high-intent traffic
- Compare Meta to other paid channels (Google non-brand, TikTok if present) — relative engagement quality matters as much as absolute

**Diagnostic:**
- Engaged time <30s on Meta but >60s on Google → Meta is sending lower-quality traffic, not a site problem
- TOF engaged time <50% of BOF baseline (Pull 5C) across ALL paid channels → TOF audiences are mismatched at the channel-strategy level, not a creative problem
- TOF engaged time within 70-100% of BOF baseline → TOF traffic quality is real; CPATC / CPVC determine whether it's economically efficient
- PDP→ATC healthy but PDP→Purchase very low → consideration cycle longer than your lookback (extend to 90 days) OR retargeting/email isn't closing
- Both PDP rates very low across all channels including BOF → site/PDP problem, not Meta-specific

**Evidence:** Add `channel_quality` block to GA4 evidence JSON with per-channel engaged time + PDP funnel rates AND a `bof_baseline` sub-block from Pull 5C. Cross-reference with Meta evidence's CPVC/CPATC for the full 5-metric picture.

---

### Pull 6: New vs Returning Customer Revenue (by Channel) (RED/YELLOW: when triggered)

**Trigger:** Run whenever (a) Shopify/BigCommerce first-time-customer split is unavailable at triage, OR (b) any audit where nROAS is being computed at the cross-platform anchor — which is most audits under the v2 Role × Quality × Profit framework.

**Data source priority — Shopify FIRST, GA4 SECOND:**

The cleanest source for nROAS is the ecommerce platform's first-time-vs-returning customer split (a real cross-tab between customer identity and revenue). GA4 does NOT expose a clean equivalent — its `New / returning` dimension is at the user-session level, not the revenue/transaction event level. Cross-tabbing it to revenue requires an approximation. Therefore:

1. **Primary path:** if Shopify or BigCommerce returned first-time-customer revenue at triage (Pull 1 of `shopify-deep.md`), use that as the canonical source. nROAS = (Shopify first-time customer net sales attributable to this channel) ÷ (paid spend on this channel). Channel attribution from UTM tags on Shopify orders if available, else fall back to method 2.
2. **Fallback path (GA4 approximation):** if Shopify split is unavailable OR per-channel attribution can't be derived from Shopify orders, run this Pull 6 — but flag every nROAS number it produces as APPROXIMATION in evidence.

**Why GA4 is a fallback, not a peer.** GA4 exposes:
- `New users` and `Total users` per source/medium — at the user level
- `Purchase revenue` per source/medium — at the transaction level
- `New / returning` (user dimension) — categorizes users, NOT events

Cross-tabbing `New / returning` directly with `Purchase revenue` is not a single GA4 query — the dimension applies to user metrics. The cleanest approximation is: assume new-user purchase rate equals returning-user purchase rate within a channel (often false in reality), then split revenue proportionally to the user split. Mathematically:

```
new_user_pct (channel) = New users / Total users         [reliable, GA4 native]
new_customer_revenue (channel) ≈ new_user_pct (channel) × Purchase revenue (channel)
nROAS (channel, GA4-approximated) = new_customer_revenue (channel) ÷ paid spend (channel)
```

**This is a proxy, not a measurement.** The error term: new users actually convert at a different rate than returning users (typically lower for first-time visitors), so nROAS via this proxy systematically overstates new-customer efficiency on most channels. Treat the absolute number as approximate; treat relative comparisons across channels (Channel A nROAS > Channel B nROAS) as more reliable than the absolute values.

**Data source:** Google Analytics 4 (use `data_source_id` from cache). Call via `load_metric_data`.

**Metrics:** `Sessions`, `Purchase revenue`, `Transaction count`, `New users`, `Total users` (or `Active users` if that's the GA4-Databox alias)

**Breakdowns:** `Session source / medium` (no cross-tab with `New / returning` — see proxy formula above)

**Note on dimension names:** GA4-via-Databox dimension strings vary across data sources. Resolve via `list_metrics_and_breakdowns_ga4(data_source_id=...)` before pulling. The `New / returning` dimension exists for user metrics but is NOT the source of the new-customer revenue split — don't try to cross-tab it with `Purchase revenue`.

**Output:** Per-channel new-user %, per-channel total revenue, per-channel APPROXIMATED new-customer revenue (via proxy), per-channel APPROXIMATED nROAS. Every nROAS number must include a `method` field: `"shopify_direct"` for primary path, `"ga4_proxy_user_pct"` for fallback.

**Calculate (when on the GA4 fallback path):**
- **new_user_pct (channel)** = New users (channel) ÷ Total users (channel)
- **new_customer_revenue_approx (channel)** = new_user_pct (channel) × Purchase revenue (channel)
- **nROAS_approx (channel)** = new_customer_revenue_approx ÷ paid spend (channel). Paid spend joins from Meta / Google evidence files on source/medium.
- **Account-level nROAS_approx** = sum of new_customer_revenue_approx across paid channels ÷ total paid spend.

**Calculate (when on the Shopify primary path):**
- **nROAS per channel** = Shopify first-time customer net sales attributable to this channel ÷ paid spend on this channel. Channel attribution comes from UTMs on Shopify orders.
- **New customer revenue % per channel** = first-time customer revenue (this channel) ÷ Total revenue (this channel)
- **Account-level nROAS** = Total Shopify first-time customer net sales ÷ Total paid spend.

**Diagnostic patterns:**
- Channel with **>70% new customers AND healthy nROAS** → real acquisition. This is what TOF spend should produce. Lean in.
- Channel with **<20% new customers AND high ROAS** → capture, not acquisition. Likely cannibalizing email, branded organic, or direct. The ROAS looks great because the channel is intercepting buyers who would have converted anyway. Common pattern with branded search and aggressive retargeting.
- Channel with **high nROAS but low total ROAS** → under-spent acquisition channel — opportunity to scale. The new-customer economics work; total ROAS is dragged down by low returning-customer share because the channel hasn't been running long enough to build a returning audience. Increase spend before judging on blended ROAS.
- Channel with **low nROAS AND low total ROAS** → not working at any layer. Pause or rebuild creative/audience.
- Channel with **high new customer % but declining nROAS over the lookback** → audience saturation. The channel is still acquiring new customers but the marginal cost is rising. Consider lookalike refresh, new creative angles, or geographic expansion.

**Evidence:** Add `new_vs_returning_by_channel` block to GA4 evidence JSON with per-channel new/returning revenue split and computed new-customer revenue %. Synthesizer joins this with paid spend data to compute per-channel nROAS for the headline scorecard.

**Caveat / data quality:** This pull depends on UTM hygiene being adequate (already validated by Pull 4). If `(direct) / (none)` is >25% of revenue, flag every per-channel nROAS as "tracking-degraded" rather than producing false-precision scores — the synthesizer will surface this as a Data Gap in the report.

---

## YELLOW Mode Routing

**Revenue gap concern (GA4 vs platform claims misaligned >15%):**
- Pulls: 1 + 2
- Focus: Channel attribution accuracy, source/medium tagging completeness, UTM coverage

**CVR or AOV concern (transaction metrics low relative to sessions):**
- Pulls: 1 + 3
- Focus: Channel quality, device performance split, conversion path by channel

**Tracking integrity concern (events firing inconsistently):**
- Pulls: 1 + 4
- Focus: Event tracking validation, purchase event completeness, custom event baseline

**TOF Mode active on any paid platform (Meta, Google non-brand, YouTube, etc.):**
- Pulls: 1 + 4 + 5 + 6 (1 for channel context, 4 to validate events, 5 for the quality framework + BOF baseline, 6 for new-customer split feeding nROAS)
- Focus: Engaged time vs BOF baseline, PDP funnel by channel, per-channel nROAS for the cross-platform anchor scorecard

---

## Evidence Output

Build four tables:

**Table 1: Channel Attribution Reconciliation**
| Channel | GA4 Sessions | GA4 Revenue | GA4 Transactions | Platform Reported Revenue | Variance $ | Variance % | Attribution Notes |
|---|---|---|---|---|---|---|---|

**Table 2: Top 20 Source/Medium by Revenue**
| Source | Medium | Sessions | Revenue | Transactions | CVR | Notes |
|---|---|---|---|---|---|---|

**Table 3: Device Performance Summary**
| Device | Sessions | Revenue | Transactions | CVR | Bounce Rate | Revenue/Session | Mobile vs Desktop Notes |
|---|---|---|---|---|---|---|---|

**Table 4: Event Tracking Baseline**
| Event Name | Event Count | Expected Firing Trigger | Status | Notes |
|---|---|---|---|---|

---

## Diagnostic Patterns

**Over-attribution by platform → GA4 lagging platform claims**
- Platform models last-click, GA4 may use multi-touch. >20% variance signals model mismatch, not tracking failure.
- Check: Pull 1 shows platform channel higher than GA4? Normal for last-click platforms.

**UTM tagging decay → Direct/Unassigned climbing**
- Pull 2 shows untagged traffic spike. Check: Campaigns, email, social campaigns all tagged?
- Action: Audit all live campaigns for UTM parameters.

**Mobile revenue per session declining → Bid allocation or landing page UX**
- Pull 3 shows mobile sessions up, revenue per session down. Is bid allocation favoring desktop?
- Action: Check mobile landing page conversion rate. Pull 3 will confirm if mobile traffic quality or UX issue.

**Purchase events <transactions from Shopify triage → Tracking gap**
- Pull 4 shows purchase event count lower than triage transaction count. GA4 tracking tag not firing on thank-you page?
- Action: Validate ecommerce tracking implementation.

**Organic revenue cliff with sessions stable → Ranking loss or organic quality shift**
- Pull 1 shows organic sessions flat, organic revenue down. Pull 2 deep-dive organic source for traffic source shift.
- Action: Check organic search console data for ranking/CTR changes.

**High direct traffic with low bounces → Brand search or repeat customers**
- Pull 1 shows direct traffic high. Pull 2 + device analysis: High-value repeat customers or brand search not tagged as paid?
- Action: Cross-reference brand search spend with direct channel claims.
