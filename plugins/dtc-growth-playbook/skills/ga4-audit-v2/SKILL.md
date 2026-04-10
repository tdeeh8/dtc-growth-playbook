# GA4 Audit v2

GA4 deep analytics audit — part of the modular audit system v2. Produces a standardized JSON evidence file for the audit-synthesizer.

**Trigger phrases:** "audit their GA4", "analytics audit for [client]", "audit their Google Analytics", "GA4 audit for [client]", "check their analytics", "audit GA4"

**Slash command:** `/audit-ga4` (see `commands/audit-ga4.md`)

---

## Role

GA4 is the **cross-platform reconciliation layer**. It doesn't own revenue (Shopify does) and it doesn't own campaign optimization (ad platforms do). GA4 owns:

1. **User behavior** — how visitors move through the site regardless of traffic source
2. **Traffic source comparison** — apples-to-apples view of all channels using the same measurement stick
3. **Conversion funnel** — sessions → product views → add-to-cart → checkout → purchase, by source
4. **Attribution gap detection** — how much each ad platform over-claims vs what GA4 sees
5. **Event tracking health** — are key ecommerce events actually firing?

The synthesizer uses GA4 evidence to validate (or challenge) what ad platform audits claim.

---

## Before You Start

### Load Playbook Chunks

Read these before beginning the audit:

1. `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` — Website/ecom benchmarks (CVR by source, ATC rate, bounce rate, device gap)
2. `${CLAUDE_PLUGIN_ROOT}/references/measurement.md` — Source-of-truth stack, GA4 limitations, cross-platform reconciliation, tracking validation

### Load Navigation Reference

Read `reference/nav-ga4.md` — CRITICAL. GA4's default views are traps. This file contains exact navigation paths, date range workarounds, and report customization steps.

### Check for Existing Manifest

Look for `{Client}_audit_manifest.md` in the client's evidence directory:
- `{Agency}/reports/{Client-Name}/evidence/`
- `{Own-Brand}/reports/evidence/`

If a manifest exists, read it for client context (AOV, business type, focus areas, which other platforms have been audited). If no manifest, proceed standalone — the orchestrator isn't required.

---

## GA4 Gotchas (Read Before Navigating)

These are the most common ways GA4 data misleads auditors:

1. **Default 7-day view is useless.** GA4 Home and most Reports default to "Last 7 days." This is too short for any meaningful analysis. ALWAYS change the date range before extracting any data. See nav-ga4.md for how.

2. **Reports section vs Explore section.** Reports gives pre-built views (good for quick scans). Explore gives custom funnels and segments (required for deep analysis). You need both.

3. **Data thresholds hide low-volume segments.** GA4 applies "thresholding" when Google signals are enabled — it hides rows where user count is too low. This means small traffic sources or device segments may be invisible. If rows seem missing, note it as a data limitation.

4. **Sampling on large date ranges.** Green shield icon = unsampled. Yellow = sampled. If you see the yellow icon, narrow the date range or use Explore with "Request unsampled results" if available. Note sampling in auditor_notes.

5. **Real-time vs processed data.** Real-time reports are not the same as processed data. Never cite real-time numbers as audit data. Standard reports have 24-48 hour processing lag.

6. **GA4 captures 70-80% of actual revenue.** Ad blockers, consent mode, redirect chains, and cross-device loss all reduce GA4's visibility. GA4 will ALWAYS under-report vs Shopify. A 10-15% gap is normal. A 30%+ gap is a tracking problem.

7. **Data-Driven Attribution requires 400+ monthly conversions.** Below that threshold, GA4 falls back to last-click. Check which model is active before interpreting source/medium data.

8. **Cross-domain tracking breaks silently.** If the client uses a third-party checkout (e.g., checkout.shopify.com subdomain), cross-domain tracking must be configured. Look for `_gl=` parameter in URLs during checkout. Missing = attribution is broken between site and checkout.

---

## Audit Procedure

### Phase 1: Access & Setup (5 min)

1. **Open GA4 property.** Navigate to analytics.google.com. Select the correct property.
2. **Set date range.** Change from default 7 days to the audit period. Standard: last 90 days (or match other platform audits). See nav-ga4.md for exact steps.
3. **Verify property.** Confirm you're in the right property — check the property name, website URL under Admin → Property Settings. Record property ID.
4. **Check data freshness.** Look at the most recent date with data. If it's more than 48 hours old, note it.

### Phase 2: Account Overview Metrics (10 min)

Navigate: **Reports → Reports snapshot** (then customize, see nav-ga4.md).

Extract and record these top-level metrics for the full audit date range:

| Metric | Where to Find | Evidence Label |
|---|---|---|
| Total Users | Reports snapshot or Acquisition overview | OBSERVED |
| Total Sessions | Acquisition overview | OBSERVED |
| Sessions per User | CALCULATED (sessions / users) | CALCULATED |
| Total Revenue (GA4-reported) | Monetization overview | OBSERVED |
| Transactions | Monetization overview | OBSERVED |
| Ecommerce CVR | CALCULATED (transactions / sessions) | CALCULATED |
| Average Order Value | CALCULATED (revenue / transactions) | CALCULATED |
| Engagement Rate | Reports snapshot | OBSERVED |
| Avg Session Duration | Reports snapshot | OBSERVED |

**Cross-reference:** Compare GA4 Total Revenue to Shopify revenue for the same period (if Shopify evidence exists or if you can check Shopify). Record the gap percentage. Expected: GA4 is 10-15% lower. Flag if >20% gap.

### Phase 3: Traffic Acquisition by Source/Medium (15 min)

Navigate: **Reports → Acquisition → Traffic acquisition** (NOT User acquisition — Traffic acquisition shows session-level source/medium, which is what we need for channel analysis).

See nav-ga4.md for column customization and sorting.

Extract the **top 15-20 source/medium combinations** with these metrics per row:

| Column | Notes |
|---|---|
| Session source/medium | e.g., google / cpc, facebook / paid, direct / (none), google / organic |
| Sessions | Volume metric |
| Engaged sessions | Quality metric |
| Engagement rate | Engaged sessions / sessions |
| Conversions (key events) | Purchase events attributed to this source |
| Total revenue | Revenue attributed to this source |
| CVR | CALCULATED: conversions / sessions |

**What to look for:**

- **Direct / (none) proportion.** If direct is >30% of sessions, attribution is likely broken — traffic is losing its source tag somewhere. Check UTM hygiene and cross-domain setup.
- **google / cpc vs google / organic split.** Healthy brands have organic growing over time. If cpc dominates entirely, organic strategy is weak.
- **facebook / paid vs facebook / cpc nomenclature.** Inconsistent UTM tagging across Meta campaigns shows up here. Note if Meta traffic is split across multiple source/medium combos.
- **CVR by source.** Compare each source's CVR to benchmarks (benchmarks.md → Website/Ecom → CVR from email traffic, paid search, paid social). Flag sources with CVR below floor.
- **Email traffic performance.** Email should be the highest-converting source (benchmark: 4-6% CVR). If it's below 3%, something is wrong with email landing pages or attribution.

### Phase 4: Conversion Funnel Analysis (15 min)

Navigate: **Explore → Funnel exploration** (Reports section doesn't have a good funnel view — you MUST use Explore for this).

Build a funnel with these steps (standard ecommerce):

1. `session_start` — Sessions
2. `view_item` — Product page views
3. `add_to_cart` — Add to cart
4. `begin_checkout` — Checkout initiated
5. `purchase` — Purchase completed

**If events are missing:** Some GA4 setups don't have all standard ecommerce events. Note which events exist and which are missing. Missing `view_item` or `add_to_cart` means the Shopify → GA4 integration is incomplete.

**Extract per step:**
- User count or event count (whichever the funnel shows)
- Drop-off rate between steps (% who didn't continue)
- Completion rate (% who reached purchase from session_start)

**Benchmark comparisons (from benchmarks.md):**
- Add-to-cart rate: Floor <4%, Healthy 6-8%, Strong 10%+
- Cart abandonment: Floor >80%, Healthy 70-76%, Strong <65%
- Overall CVR: Floor <1.0%, Healthy 1.5-3.0%, Strong 3.5%+

**Segment the funnel by:**
- **Device category** (mobile vs desktop vs tablet) — Look for the mobile/desktop CVR gap. Benchmark: desktop 1.6-2.1x higher CVR than mobile. Gap >2.5x = mobile UX problem.
- **Top 3 traffic sources** (if the funnel tool allows breakdown by source) — Where in the funnel does each source lose people?

### Phase 5: Landing Page Performance (10 min)

Navigate: **Reports → Engagement → Landing page** (or build in Explore if not available).

Extract the **top 15-20 landing pages** with:

| Column | Notes |
|---|---|
| Landing page (page path) | URL path |
| Sessions | Volume |
| Engagement rate | Quality signal |
| Conversions | Purchase events |
| Revenue | Revenue attributed |
| Bounce rate | If available (or inverse of engagement rate) |
| CVR | CALCULATED: conversions / sessions |

**What to look for:**

- **Homepage as top landing page.** If homepage dominates, the brand may be over-reliant on branded search or direct. Product/collection pages should be primary landing pages for paid traffic.
- **High-traffic, low-CVR pages.** These are the biggest opportunities. Flag any page with >500 sessions and CVR below the source-adjusted benchmark.
- **Landing page / traffic source mismatch.** If paid social traffic lands on the homepage instead of product pages, the ad → landing page alignment is wrong.
- **Blog/content pages converting.** If content pages have meaningful conversion rates, the content strategy is working. If zero conversions, content is top-of-funnel only (not necessarily bad, but note it).

### Phase 6: Device & Platform Split (5 min)

Navigate: **Reports → Tech → Tech overview** (or Reports → User → Tech details).

Extract:

| Dimension | Metrics | Notes |
|---|---|---|
| Device category (mobile/desktop/tablet) | Sessions, conversions, revenue, CVR | Primary split |
| Operating system (iOS/Android/Windows/Mac) | Sessions, conversions | Secondary — look for iOS-specific tracking drops |
| Browser (Chrome/Safari/Edge/Firefox) | Sessions, conversions | Safari = ITP impact zone |

**What to look for:**

- **Mobile traffic % vs mobile revenue %.** If mobile is 70% of traffic but 40% of revenue, mobile experience is underperforming (common but important to quantify).
- **Safari conversion rate vs Chrome.** Safari/ITP limits attribution to 7-day window. If Safari CVR is dramatically lower, it may be a tracking gap rather than a real performance gap. Note this.
- **iOS vs Android.** iOS users hit by ATT/ITP harder. If iOS conversion data looks suspiciously low, it's likely a measurement gap.

### Phase 7: Cross-Platform Attribution Comparison (15 min)

**This is GA4's unique value in the audit system.** GA4 provides a single measurement lens across all traffic sources. Ad platforms each measure with their own biased model. GA4 applies one model to all.

**Pull GA4-attributed conversions and revenue by source for the audit period:**

| Source (GA4 view) | GA4 Conversions | GA4 Revenue |
|---|---|---|
| google / cpc | X | $X |
| facebook / paid (or cpc) | X | $X |
| klaviyo / email | X | $X |
| (other paid sources) | X | $X |
| **Total (all sources)** | X | $X |

**Then compare to platform-reported numbers** (from other evidence files or from the platforms directly):

| Platform | Platform-Reported Conversions | GA4-Attributed Conversions | Gap % |
|---|---|---|---|
| Google Ads | From google-ads evidence or platform | From GA4 | CALCULATED |
| Meta Ads | From meta-ads evidence or platform | From GA4 | CALCULATED |
| Klaviyo | From klaviyo evidence or platform | From GA4 | CALCULATED |

**Expected gaps (from measurement.md):**
- GA4 vs Shopify: ±10-15% (GA4 under-reports)
- Meta vs GA4: 15-40% gap (Meta over-reports due to view-through, modeled conversions)
- Google Ads vs GA4: 10-25% gap (Google over-reports via conversion modeling)

**Flag if:**
- Any platform claims >2x the conversions GA4 attributes to it → severe over-attribution
- GA4 total revenue is >30% below Shopify → tracking problem, not attribution difference
- One platform's GA4-attributed conversions dropped suddenly in Jan 2026 → likely Meta attribution window change

**Record in cross_channel_signals:** Specific platform gaps for the synthesizer to investigate.

### Phase 8: Event Tracking Validation (10 min)

Navigate: **Admin → Events** (to see what events exist) and **Reports → Engagement → Events** (to see event counts).

**Required ecommerce events checklist:**

| Event | Status | Count (audit period) | Notes |
|---|---|---|---|
| page_view | Should exist | X | Basic — if missing, GA4 is barely configured |
| view_item | Should exist | X | Product page views |
| add_to_cart | Should exist | X | ATC tracking |
| begin_checkout | Should exist | X | Checkout initiation |
| purchase | Must exist | X | Revenue tracking |
| view_item_list | Nice to have | X | Collection/category page views |
| select_item | Nice to have | X | Product click from list |
| add_payment_info | Nice to have | X | Payment step |
| add_shipping_info | Nice to have | X | Shipping step |

**What to look for:**

- **Missing core events.** If `view_item`, `add_to_cart`, or `begin_checkout` are missing, the funnel analysis in Phase 4 will be incomplete. Flag as tracking gap.
- **Event count sanity checks.** `page_view` count should be > `view_item` > `add_to_cart` > `begin_checkout` > `purchase`. If any step has MORE events than the step above it, there's a tracking bug (likely duplicate event firing).
- **Purchase event parameters.** Check that purchase events include `transaction_id`, `value`, and `currency`. Missing parameters mean revenue data is incomplete or zero.
- **Duplicate events.** In Admin → DebugView (if you can trigger a test), or by comparing event ratios. If `purchase` count is close to or exceeds `begin_checkout`, something is double-firing.

**Cross-domain tracking check:**

1. Look at landing page report for checkout URLs (e.g., `checkout.shopify.com`). If checkout pages appear as separate landing pages with their own sessions, cross-domain tracking is broken.
2. Check Admin → Data Streams → Web → Configure tag settings → Configure your domains. All domains (main site + checkout) should be listed.
3. If cross-domain is broken, a significant chunk of conversions will show as "direct / (none)" source because the referral chain broke at checkout.

### Phase 9: Attribution Model Check (5 min)

Navigate: **Admin → Attribution settings.**

Record:
- **Reporting attribution model:** Data-driven, Last click, or other
- **Conversion window:** 30-day, 60-day, or 90-day
- **Whether data-driven is actually active** (requires 400+ monthly conversions; below that it falls back to last-click silently)

**Check:** Pull the property's monthly conversion count. If it's below 400, note that GA4 is likely using last-click regardless of the setting. This affects all source/medium attribution data.

---

## Evidence File Output

After completing all phases, compile the evidence JSON file.

**Filename:** `{Client}_ga4_evidence.json`
**Location:** `{Agency}/reports/{Client-Name}/evidence/` or `{Own-Brand}/reports/evidence/`

### Schema Mapping

Follow the evidence schema from `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`. GA4-specific mapping:

**meta.platform:** `"ga4"`

**account_overview:** Top-level metrics from Phase 2 (users, sessions, revenue, CVR, AOV, engagement rate).

**campaigns:** NOT used for GA4. GA4 doesn't have campaigns — use `raw_metrics.source_medium_details` instead.

**tracking_health:** Event tracking validation from Phase 8. Each missing or broken event = a flag. Cross-domain issues = a flag. Duplicate events = a flag.

**findings:** Key observations from Phases 3-7. Each finding is a discrete observation. Examples:
- "Mobile CVR is 3.2x lower than desktop, exceeding the 2.5x benchmark threshold"
- "Direct / (none) accounts for 42% of sessions, suggesting attribution breakage"
- "Meta-attributed conversions in GA4 are 47% lower than Meta Ads Manager reports"

**anomalies:** Unexpected patterns. Examples:
- "Safari conversion rate is 80% lower than Chrome despite similar session counts"
- "Blog landing pages have higher CVR than product pages for paid social traffic"

**diagnosis.primary_constraint:** The single biggest analytics/tracking issue found. This is usually either a tracking problem (broken cross-domain, missing events) or a behavioral insight (massive mobile drop-off, one source dominating).

**opportunities:** Prioritized actions. Examples:
- Fix cross-domain tracking (CRITICAL)
- Implement missing ecommerce events (HIGH)
- Investigate mobile UX — CVR gap exceeds benchmark (HIGH)
- Review UTM tagging — direct traffic over-inflated (MEDIUM)

**cross_channel_signals:** THIS IS THE MOST IMPORTANT SECTION FOR GA4. GA4's unique value is cross-platform comparison. Include:
- Platform attribution gaps (GA4 vs each ad platform)
- GA4 vs Shopify revenue gap
- Any source/medium anomalies that other platform audits should investigate
- Channel interaction signals (if path analysis is available)

**raw_metrics:** Include these GA4-specific tables:
- `source_medium_details` — Full source/medium table from Phase 3
- `landing_page_details` — Full landing page table from Phase 5
- `funnel_details` — Funnel step data from Phase 4
- `device_details` — Device/platform split from Phase 6
- `event_inventory` — Event list and counts from Phase 8
- `attribution_comparison` — Cross-platform attribution table from Phase 7

### Evidence Labeling Rules

Every data point gets a label:

- **OBSERVED** — Pulled directly from GA4 UI. Include source: "GA4 > Reports > Acquisition > Traffic acquisition > [metric]"
- **CALCULATED** — Derived from observed values. Include formula: "CVR = 342 transactions / 28,419 sessions = 1.2%"
- **INFERENCE** — Logical conclusion from data. Example: "Direct traffic at 42% suggests attribution breakage" (the 42% is OBSERVED, the conclusion is INFERENCE)
- **ASSUMPTION** — Not verified. Example: "Assumed GA4 is using data-driven attribution (couldn't verify in Admin)"
- **DATA_NOT_AVAILABLE** — Tried but couldn't get it. Example: "Funnel by source not available — Explore funnel doesn't support this breakdown in this property"

---

## After the Audit

1. **Save the evidence JSON file** to the correct evidence directory.
2. **Update the audit manifest** (if one exists) — set GA4 status to DONE, record the evidence filename and completion date.
3. **Flag critical issues** — if tracking is fundamentally broken (missing purchase events, broken cross-domain, GA4 revenue >30% below Shopify), tell the user immediately. These issues invalidate other audit findings.
4. **Note what couldn't be assessed** — if certain phases were impossible due to data gaps or access limitations, record in `open_questions`.

---

## Benchmarks Quick Reference (from benchmarks.md)

| Metric | Floor | Healthy | Strong |
|---|---|---|---|
| Overall CVR | <1.0% | 1.5-3.0% | 3.5%+ |
| CVR from email | <3% | 4-6% | 7%+ |
| CVR from paid search | <1.5% | 2-3.5% | 4%+ |
| CVR from paid social | <0.5% | 0.7-1.2% | 1.5%+ |
| Add-to-cart rate | <4% | 6-8% | 10%+ |
| Cart abandonment | >80% | 70-76% | <65% |
| Bounce rate (product) | >55% | 30-45% | <25% |
| Mobile/desktop CVR gap | >2.5x | 1.5-2.0x | <1.3x |
| Returning visitor rate | <15% | 25-35% | 40%+ |
| GA4 vs Shopify revenue gap | >20% | 10-15% | <10% |

## Reconciliation Thresholds (from measurement.md)

| Comparison | Normal | Investigate | Tracking Problem |
|---|---|---|---|
| GA4 vs Shopify revenue | ±10-15% | 15-25% | >30% |
| Meta conversions vs GA4 | 15-25% gap | 25-40% gap | >40% gap |
| Google Ads conversions vs GA4 | 10-15% gap | 15-25% gap | >25% gap |
