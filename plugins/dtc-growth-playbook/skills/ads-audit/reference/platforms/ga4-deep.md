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

**API:** `ga4_request`

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

**API:** `ga4_request`

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

**API:** `ga4_request`

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

**API:** `ga4_request`

**Metrics:** Event count

**Breakdowns:** Event name

**Analysis triggers:**
- Missing purchase events — Purchase event count <transaction count from triage? Tracking gap.
- Add-to-cart tracking — ATC events firer frequency vs triage ATC count. Cart abandonment baseline.
- Page view spike — Inflated page views vs sessions? Event firing on SPA navigation?
- Custom event dead zones — Expected conversion events not firing?

**Evidence:** Event count summary showing expected events (purchase, ATC, checkout, view_item) firing frequency.

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
