# GA4 Audit v2

GA4 deep analytics audit — part of the modular audit system v2. Produces a standardized JSON evidence file for the audit-synthesizer.

**Trigger phrases:** "audit their GA4", "analytics audit for [client]", "audit their Google Analytics", "GA4 audit for [client]", "check their analytics", "audit GA4"

**Slash command:** `/audit-ga4` (see `commands/audit-ga4.md`)

---

## Role

GA4 is the **cross-platform reconciliation layer**. It doesn't own revenue (Shopify does) or campaign optimization (ad platforms do). GA4 owns:

1. **User behavior** — how visitors move through the site regardless of traffic source
2. **Traffic source comparison** — apples-to-apples view of all channels using the same measurement stick
3. **Conversion funnel** — sessions → product views → add-to-cart → checkout → purchase, by source
4. **Attribution gap detection** — how much each ad platform over-claims vs what GA4 sees
5. **Event tracking health** — are key ecommerce events actually firing?

The synthesizer uses GA4 evidence to validate (or challenge) what ad platform audits claim.

---

## Before You Start

**Standard setup:** Follow `reference/audit-lifecycle.md` → "Before You Start" section. This covers manifest checks, evidence directory setup, and AOV-conditional playbook loads.

**GA4-specific loads:**
- `reference/platform-refs/nav-ga4.md` — Read BEFORE opening GA4. Contains exact navigation paths, date range workarounds, report customization, and GA4 Gotchas (Traps 1-10). **Do not navigate GA4 without reading this first.**
- `reference/playbook/benchmarks.md` — Load at setup (standard per audit-lifecycle)
- `reference/playbook/measurement.md` — **Deferred: load at Phase 7** (cross-platform attribution). Not needed for Phases 1-6.

**GA4 source format for evidence:** `"GA4 > Reports > [Report Name] > [date range]"` or `"GA4 > Explore > [Exploration Name] > [date range]"`

---

## Audit Procedure

### Phase 1: Access & Setup (5 min)

1. Open GA4 property at analytics.google.com. Select correct property.
2. **Set date range** — change from default 7 days to audit period (standard: last 90 days or match other platform audits). See nav-ga4.md for exact steps.
3. Verify property: check property name and website URL under Admin → Property Settings. Record property ID.
4. Check data freshness — if most recent data is >48 hours old, note it.

### Phase 2: Account Overview Metrics (10 min)

Navigate: **Reports → Reports snapshot** (then customize per nav-ga4.md).

Extract for full audit date range:

| Metric | Where to Find | Label |
|---|---|---|
| Total Users | Reports snapshot or Acquisition overview | OBSERVED |
| Total Sessions | Acquisition overview | OBSERVED |
| Sessions per User | sessions / users | CALCULATED |
| Total Revenue (GA4) | Monetization overview | OBSERVED |
| Transactions | Monetization overview | OBSERVED |
| Ecommerce CVR | transactions / sessions | CALCULATED |
| AOV | revenue / transactions | CALCULATED |
| Engagement Rate | Reports snapshot | OBSERVED |
| Avg Session Duration | Reports snapshot | OBSERVED |

**Cross-reference:** Compare GA4 Total Revenue to Shopify revenue for same period (if available). Record gap %. Expected: GA4 10-15% lower. Flag if >20%.

### Phase 3: Traffic Acquisition by Source/Medium (15 min)

Navigate: **Reports → Acquisition → Traffic acquisition** (NOT User acquisition — Traffic acquisition shows session-level source/medium).

See nav-ga4.md for column customization and sorting.

Extract **top 15-20 source/medium combos** with: Sessions, Engaged sessions, Engagement rate, Conversions (key events), Total revenue, CVR (calculated).

**What to look for:**
- **Direct / (none) >30% of sessions** → attribution likely broken (UTM hygiene or cross-domain issue)
- **google / cpc vs organic split** → if cpc dominates entirely, organic strategy is weak
- **Meta UTM fragmentation** → inconsistent tagging splits Meta traffic across multiple source/medium combos
- **CVR by source vs benchmarks** (benchmarks.md → CVR from email, paid search, paid social). Flag sources below floor.
- **Email CVR** → benchmark 4-6%. Below 3% = landing page or attribution problem.

### Phase 4: Conversion Funnel Analysis (15 min)

Navigate: **Explore → Funnel exploration** (Reports doesn't have a proper funnel view — must use Explore). See nav-ga4.md for setup steps.

Build standard ecommerce funnel: `session_start` → `view_item` → `add_to_cart` → `begin_checkout` → `purchase`

**If events are missing:** Note which exist/missing. Missing `view_item` or `add_to_cart` = incomplete Shopify → GA4 integration.

**Extract per step:** User/event count, drop-off rate between steps, completion rate (session_start → purchase).

**Compare to benchmarks** (benchmarks.md): ATC rate, cart abandonment, overall CVR — floor/healthy/strong tiers.

**Segment by:**
- **Device** — mobile vs desktop CVR gap. Benchmark: desktop 1.6-2.1x higher. Gap >2.5x = mobile UX problem.
- **Top 3 traffic sources** (if funnel tool supports breakdown) — where in the funnel does each source lose people?

### Phase 5: Landing Page Performance (10 min)

Navigate: **Reports → Engagement → Landing page** (or build in Explore).

Extract **top 15-20 landing pages** with: Sessions, Engagement rate, Conversions, Revenue, Bounce rate, CVR (calculated).

**What to look for:**
- **Homepage dominance** → over-reliant on branded search or direct. Product/collection pages should be primary paid landing pages.
- **High-traffic, low-CVR pages** (>500 sessions, CVR below source-adjusted benchmark) → biggest opportunities.
- **Paid social → homepage** → ad-to-landing-page alignment is wrong; should go to product pages.
- **Blog/content CVR** → if meaningful conversions, content strategy is working. If zero, top-of-funnel only (note, not necessarily bad).

### Phase 6: Device & Platform Split (5 min)

Navigate: **Reports → Tech → Tech overview / Tech details.**

Extract by device category (mobile/desktop/tablet), OS (iOS/Android/Windows/Mac), and browser (Chrome/Safari/Edge): Sessions, Conversions, Revenue, CVR.

**What to look for:**
- **Mobile traffic % vs mobile revenue %** — if mobile = 70% traffic but 40% revenue, mobile UX underperforming.
- **Safari CVR vs Chrome** — Safari/ITP limits attribution to 7 days. Dramatically lower Safari CVR may be measurement gap, not real.
- **iOS vs Android** — iOS hit by ATT/ITP harder. Suspiciously low iOS conversion data = likely measurement gap.

### Phase 7: Cross-Platform Attribution Comparison (15 min)

> **Load now:** `reference/playbook/measurement.md` — contains source-of-truth stack, reconciliation methodology, expected gap ranges.

**This is GA4's unique value in the audit system.** GA4 applies one attribution model to all sources, unlike ad platforms which each use their own biased model.

**Step 1 — Pull GA4-attributed data by source for the audit period:**

| Source (GA4) | GA4 Conversions | GA4 Revenue |
|---|---|---|
| google / cpc | X | $X |
| facebook / paid (or cpc) | X | $X |
| klaviyo / email | X | $X |
| (other paid sources) | X | $X |
| **Total** | X | $X |

**Step 2 — Compare to platform-reported numbers** (from other evidence files or platforms directly):

| Platform | Platform-Reported Conv. | GA4-Attributed Conv. | Gap % |
|---|---|---|---|
| Google Ads | from evidence/platform | from GA4 | CALCULATED |
| Meta Ads | from evidence/platform | from GA4 | CALCULATED |
| Klaviyo | from evidence/platform | from GA4 | CALCULATED |

**Expected gaps** (per measurement.md): Meta vs GA4: 15-40%. Google Ads vs GA4: 10-25%. GA4 vs Shopify revenue: ±10-15%.

**Flag if:** any platform claims >2x GA4-attributed conversions (severe over-attribution), GA4 total revenue >30% below Shopify (tracking problem), or sudden drop in one platform's GA4-attributed conversions (attribution window change).

**Record in `cross_channel_signals`** — specific platform gaps for the synthesizer.

### Phase 8: Event Tracking Validation (10 min)

Navigate: **Admin → Events** (what exists) and **Reports → Engagement → Events** (counts).

**Required ecommerce events:**

| Event | Required? | Count | Notes |
|---|---|---|---|
| page_view | Should exist | X | If missing, GA4 barely configured |
| view_item | Should exist | X | Product page views |
| add_to_cart | Should exist | X | ATC tracking |
| begin_checkout | Should exist | X | Checkout initiation |
| purchase | Must exist | X | Revenue tracking |
| view_item_list | Nice to have | X | Collection/category views |
| select_item | Nice to have | X | Product click from list |
| add_payment_info | Nice to have | X | Payment step |
| add_shipping_info | Nice to have | X | Shipping step |

**What to look for:**
- **Missing core events** → funnel analysis (Phase 4) will be incomplete. Flag as tracking gap.
- **Event count sanity** → page_view > view_item > add_to_cart > begin_checkout > purchase. Any reversal = tracking bug (duplicate firing).
- **Purchase parameters** → must include transaction_id, value, currency. Missing = revenue data incomplete.
- **Duplicate events** → if purchase count ≈ begin_checkout count, something is double-firing.

**Cross-domain check:**
1. If checkout URLs (e.g., `checkout.shopify.com`) appear as separate landing pages with their own sessions → cross-domain broken.
2. Check Admin → Data Streams → Configure tag settings → Configure your domains. All domains should be listed.
3. Broken cross-domain → conversions show as "direct / (none)" because referral chain broke at checkout.

### Phase 9: Attribution Model Check (5 min)

Navigate: **Admin → Attribution settings.**

Record: reporting attribution model (Data-driven / Last click / other), conversion window (30/60/90-day), and whether data-driven is actually active (requires 400+ monthly conversions; below that = silent last-click fallback).

**Check:** Pull monthly conversion count. If <400, note GA4 is likely using last-click regardless of setting. This affects all source/medium attribution data.

---

## Evidence File Output

**Filename:** `{Client}_ga4_evidence.json`
**Location:** Per audit-lifecycle.md (Disruptive or Pill Pod evidence directory).

**Schema:** Follow `reference/evidence-schema-quick.md`. Key GA4-specific mappings:

- **meta.platform:** `"ga4"`
- **account_overview:** Top-level metrics from Phase 2
- **campaigns:** NOT used for GA4. Use `raw_metrics.source_medium_details` instead.
- **tracking_health:** Event validation from Phase 8. Missing/broken events and cross-domain issues = flags.
- **findings:** Key observations from Phases 3-7. Each finding is a discrete observation. Examples:
  - "Mobile CVR is 3.2x lower than desktop, exceeding the 2.5x benchmark threshold"
  - "Direct / (none) accounts for 42% of sessions, suggesting attribution breakage"
  - "Meta-attributed conversions in GA4 are 47% lower than Meta Ads Manager reports"
- **anomalies:** Unexpected patterns. Examples:
  - "Safari conversion rate is 80% lower than Chrome despite similar session counts"
  - "Blog landing pages have higher CVR than product pages for paid social traffic"
- **diagnosis.primary_constraint:** Single biggest analytics/tracking issue found. Usually either a tracking problem (broken cross-domain, missing events) or a behavioral insight (massive mobile drop-off, one source dominating).
- **opportunities:** Prioritized actions. Examples:
  - Fix cross-domain tracking (CRITICAL)
  - Implement missing ecommerce events (HIGH)
  - Investigate mobile UX — CVR gap exceeds benchmark (HIGH)
  - Review UTM tagging — direct traffic over-inflated (MEDIUM)
- **cross_channel_signals:** **Most important GA4 section.** Include:
  - Platform attribution gaps (GA4 vs each ad platform)
  - GA4 vs Shopify revenue gap
  - Source/medium anomalies that other platform audits should investigate
  - Channel interaction signals (if path analysis available)
- **open_questions:** What couldn't be assessed — record the question, what data is needed, and what was attempted.
- **raw_metrics keys:** `source_medium_details`, `landing_page_details`, `funnel_details`, `device_details`, `event_inventory`, `attribution_comparison`

**Evidence labeling:** Follow `reference/evidence-rules.md` (5-label system: OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, DATA_NOT_AVAILABLE).

---

## After the Audit

Follow `reference/audit-lifecycle.md` → "After the Audit" section (save JSON, update manifest, flag critical issues, save working notes).

**GA4-specific critical flags** (surface immediately, don't wait for synthesizer):
- Missing purchase events → revenue data is unreliable across all platforms
- Broken cross-domain tracking → attribution data is unreliable for all sources
- GA4 revenue >30% below Shopify → tracking problem, not just normal under-reporting
