# Klaviyo Audit Skill (v2)

**Skill type:** Platform audit (modular audit system v2)
**Trigger phrases:** "audit their Klaviyo", "email audit for [client]", "audit their email marketing", "check their email flows", "Klaviyo audit", "email/SMS audit", "audit-klaviyo"
**Output:** JSON evidence file (`{Client}_klaviyo_evidence.json`) conforming to `audit-orchestrator/reference/evidence-schema.json`
**Working scratchpad:** `{Client}_klaviyo_audit_notes.md` (maintained during audit, not a deliverable)
**Slash command:** `/audit-klaviyo`

---

## Purpose

Run a deep Klaviyo email/SMS platform audit — flow performance, campaign performance, list health, segmentation quality, SMS vs email split, revenue attribution — and produce a structured evidence JSON file that the audit-synthesizer consumes.

This skill does NOT generate a report. It writes evidence. The audit-synthesizer reads evidence files and generates the report.

---

## Dual Extraction: MCP Tools vs Browser

**Prefer MCP tools when available** — faster, more reliable, no browser navigation needed.

### Method 1: Klaviyo MCP Tools (Preferred)

Check for these MCP tools at session start:
- `klaviyo_get_flows`, `klaviyo_get_flow`, `klaviyo_get_flow_report`
- `klaviyo_get_campaigns`, `klaviyo_get_campaign`, `klaviyo_get_campaign_report`
- `klaviyo_get_lists`, `klaviyo_get_list`
- `klaviyo_get_segments`, `klaviyo_get_segment`
- `klaviyo_get_profiles`, `klaviyo_get_metrics`, `klaviyo_query_metric_aggregates`
- `klaviyo_get_account_details`, `klaviyo_get_events`

If available: use MCP for all extraction. Skip browser. Follow same phases but pull via API.

### Method 2: Browser Fallback (Claude in Chrome)

If MCP tools NOT connected, use `reference/platform-refs/nav-klaviyo.md` for browser navigation patterns.

**Detection:** Attempt `klaviyo_get_account_details` at start. Success → MCP path. Failure → browser path.

---

## Before You Start

Follow `reference/audit-lifecycle.md` for standard setup (playbook loading, manifest check, evidence directory), then:

**Klaviyo-specific reference files (load now):**
- `reference/platform-refs/nav-klaviyo.md` — MCP + browser navigation

**Additional manifest data needed:**
- Klaviyo account URL or identifier
- Total store revenue for the period (for email revenue % calculation)
- Date range: default last 90 days for campaigns, all-time for flows

---

## Audit Phases

Execute in order. Each phase builds on the previous. Maintain working notes throughout.

### Phase 1: Account Overview & Inventory

**Goal:** Understand account structure and overall email/SMS program health.

**MCP path:**
1. `klaviyo_get_account_details` → account name, timezone, industry
2. `klaviyo_get_flows` → all flows (name, status, trigger type)
3. `klaviyo_get_campaigns` → recent campaigns (last 90 days minimum)
4. `klaviyo_get_lists` → all lists (name, member count)
5. `klaviyo_get_segments` → all segments (name, member count)

**Browser path:**
Navigate dashboard → record summary metrics → Flows tab → Campaigns tab → Audience > Lists & Segments. See `reference/platform-refs/nav-klaviyo.md`.

**Working notes — capture:**
```
Account: [name], Industry: [if available], Total profiles: X, Suppressed: X

FLOW INVENTORY: | Flow Name | Status | Trigger | # Messages |
MISSING CRITICAL FLOWS (from flow-checklist.md):
  [ ] Welcome  [ ] Abandoned Cart  [ ] Browse Abandon
  [ ] Post-Purchase  [ ] Winback  [ ] Sunset/Re-engagement

LIST INVENTORY: | List Name | Member Count | Type | Notes |
SEGMENT INVENTORY: | Segment Name | Member Count | Conditions Summary |
```

### Phase 2: Flow Performance Analysis

**Before this phase, read:** `reference/platform-refs/flow-checklist.md`, `reference/playbook/email-sms.md`, `reference/playbook/post-purchase.md` (if not already loaded).

**Goal:** Assess every active flow's performance and identify gaps.

**MCP path:** For each live flow:
- `klaviyo_get_flow_report` → recipients, open_rate, click_rate, revenue, RPR, unsub_rate, bounce_rate
- `klaviyo_get_flow` → trigger details, message_count, filter conditions, time delays

**Browser path:** Navigate each flow's analytics view + flow builder for structure details.

**Per-flow record:**
```
[Flow Name]: status, trigger, messages (X email / Y SMS), delays,
  recipients, open_rate, click_rate, revenue, RPR, unsub_rate, bounce_rate
  Key signals: [from list below]
```

**Key signals per flow:**
- `missing_flow` — critical type doesn't exist (per flow-checklist.md)
- `low_rpr` — RPR below floor threshold
- `high_unsubscribe` — unsub >0.5%
- `single_message` — only 1 email (most should have 2-4+)
- `no_sms` — lacks SMS messages (missed revenue if SMS enabled)
- `long_delay` — first message >1hr for high-intent flows (cart abandon, browse abandon)
- `stale_flow` — live but no sends in 30+ days
- `no_branching` — doesn't split by engagement or customer value
- `draft_critical` — critical flow in Draft status

**Benchmarks (from benchmarks.md):**
- Welcome open: Floor <35%, Healthy 50-65%, Strong 80%+
- Welcome click: Floor <5%, Healthy 10-16%, Strong 20%+
- Abandoned cart RPR: Avg $3.65, Top 10% $28.89, High-AOV ($200+) $14.14
- Abandoned cart open: Floor <30%, Healthy 40-50%, Strong 55%+
- Flow RPR vs campaign RPR: Floor <10x, Healthy 18-25x, Strong 28x+

### Phase 3: Campaign Performance Analysis

**Goal:** Assess campaign sending patterns, engagement, and revenue contribution.

**MCP path:**
- `klaviyo_get_campaigns` (date-filtered) → list campaigns in period
- `klaviyo_get_campaign_report` per campaign (or top 20 if >20)
- `klaviyo_query_metric_aggregates` → aggregate campaign metrics over time

**Browser path:** Campaigns tab → filter date range → sort by send date → record metrics.

**Per-campaign record:** | Campaign Name | Send Date | Recipients | Open Rate | Click Rate | Revenue | RPR | Unsub Rate |

**Aggregate calculations:**
→ total sends, avg frequency (campaigns/week), avg open rate (engaged vs full list), avg click rate, total campaign revenue, campaign RPR, unsub trend

**Key signals:**
- `low_open_rate` — <30% on engaged segments (or <21% full list)
- `low_click_rate` — <1%
- `high_frequency` — >4x/week to same segment
- `low_frequency` — <1x/week
- `full_list_sends` — no segmentation on campaigns
- `no_revenue` — $0 revenue (content-only or tracking issue)
- `rising_unsubs` — unsub rate trending up over 30/60/90d
- `engagement_decay` — open rates declining MoM

**Benchmarks:** Campaign open (engaged 30d): Floor <30%, Healthy 38-45%, Strong 50%+ | Click: Floor <1%, Healthy 1.5-2.5%, Strong 4%+ | Unsub: Floor >0.5%, Healthy <0.3%, Strong <0.15%

### Phase 4: List Health & Deliverability

**Before this phase, read:** `reference/playbook/list-building.md` (if not already loaded).

**Goal:** Assess list quality, growth, hygiene, and deliverability signals.

**MCP path:**
- `klaviyo_get_lists` → all lists with profile counts
- `klaviyo_get_profiles` (filtered) → suppressed/bounced/unsubscribed counts
- `klaviyo_query_metric_aggregates` → bounce rates, complaint rates over time

**Browser path:** Audience > Lists & Segments → total/suppressed/active profiles → SMS consent list → Analytics > Deliverability (if available).

**Capture:**
```
LIST HEALTH: total profiles, active (emailable), suppressed (count + %), SMS consent (count + rate)
GROWTH: new profiles 30d/90d, growth rate %/mo, primary acquisition sources
HYGIENE: hard bounce %, soft bounce %, spam complaint %, deliverability rate (if available)
```

**Key signals:**
- `high_suppression` — suppressed >25% of total
- `low_growth` / `negative_growth` — <1%/mo or unsubs+bounces > new signups
- `high_bounce` — hard bounce >2%
- `high_complaints` — spam >0.1%
- `no_sunset` — no sunset flow AND no 180+ day inactive suppression
- `single_list` — only one list (no segmentation infra)
- `low_sms_consent` — SMS consent <10% of email list (if SMS enabled)
- `no_double_optin` — if identifiable

**Benchmarks:** Growth: Floor <1%/mo, Healthy 2-3%/mo, Strong 4%+ | Deliverability: Floor <80%, Healthy 85-92%, Strong 95%+

### Phase 5: Segmentation Quality

**Goal:** Assess whether account uses meaningful segmentation or blasts everyone.

**MCP path:** `klaviyo_get_segments` → list all → `klaviyo_get_segment` for key segments' full conditions.

**Browser path:** Audience > Lists & Segments > Segments → review names, counts, conditions.

**Check for these segment types:**

1. **Engagement-based:** Engaged 30d, 60d, 90d | Unengaged 90+ | Never opened
2. **Purchase-based:** Repeat customers (2+ orders) | VIP/high-value (top 10-20% LTV) | Recent purchasers (30d) | Lapsed (60-180d, no activity) | Never purchased
3. **Behavioral:** Browse abandoners | Cart abandoners | Category/product viewers
4. **Demographic/profile:** Location | Acquisition source | Product interest

**Key signals:**
- `no_engagement_segments` — no segments based on engagement recency
- `no_purchase_segments` — no purchase-behavior segments
- `basic_segmentation_only` — only 1-3 segments total
- `sophisticated_segmentation` — 8+ well-defined segments
- `stale_segments` — exist but unused in campaigns/flows
- `full_list_default` — most campaigns sent to full list

### Phase 6: Revenue Attribution & Cross-Channel Signals

**Goal:** Understand email/SMS revenue contribution and flag signals for synthesizer.

**MCP path:**
- `klaviyo_query_metric_aggregates` for "Placed Order" attributed to email/SMS
- Calculate: total flow revenue, campaign revenue, email+SMS total
- Read Shopify evidence (if exists) for total store revenue

**Browser path:** Analytics > Dashboard/Revenue tab → email-attributed revenue, flow vs campaign split, SMS revenue.

**Calculate:**
```
REVENUE: Total Klaviyo-attributed $X
  → Flow: $X (X%) | Campaign: $X (X%) | SMS: $X (X%) | Email: $X (X%)
  → Flow RPR: $X.XX | Campaign RPR: $X.XX | Flow/Campaign RPR ratio: Xx
CROSS-CHANNEL (if total store revenue known):
  → Email % of store revenue (benchmark 25-40%; <20% = underperforming; >45% = investigate)
  → Abandoned cart recovery rate
```

**Key signals:**
- `low_email_revenue_share` — <20% of store revenue
- `high_email_revenue_share` — >45% (investigate promo dependency)
- `flow_revenue_low` — flow <25% of email revenue
- `flow_revenue_dominant` — flow >60% (campaigns weak)
- `campaign_revenue_dominant` — campaign >75% (flow opportunity)
- `sms_underutilized` — SMS consent exists but <5% of revenue from SMS
- `no_revenue_tracking` — $0 across all (integration issue)

**Cross-channel signals for synthesizer:**
```json
{ "signal": "Email revenue is X% of total store revenue (benchmark 25-40%)",
  "check_in": ["shopify", "ga4"],
  "what_to_look_for": "Confirm total store revenue in Shopify. Check GA4 for email traffic volume and CVR vs other channels." }
```

Additional cross-channel flags:
- List growth rate vs paid traffic spend → check meta-ads, google-ads
- Cart recovery rate vs abandonment rate → check ga4, shopify
- Email retargeting overlap with paid retargeting → check meta-ads, google-ads
- Post-purchase flow → repeat purchase rate → check shopify

### Phase 7: SMS Assessment (If Applicable)

**Skip if:** No SMS consent profiles or SMS not enabled.

**Capture:**
```
SMS: consent profiles (X, X% of email list), flows with SMS [list], campaign sends (90d),
  flow CTR, campaign CTR, flow RPR, campaign RPR, opt-out rate, revenue ($X, X% of Klaviyo total)
```

**Benchmarks:** Flow CTR ~10% (campaigns ~5%) | Flow RPR 8x campaign RPR | Opt-out target <2%

**Key signals:**
- `sms_not_enabled` — email only
- `sms_low_consent` — <10% of email list
- `sms_high_optout` — >2%
- `sms_no_flows` — enabled but not in any flows
- `sms_campaign_only` — SMS for campaigns but not flows (reverse priority)

### Phase 8: Platform Diagnosis

**Goal:** Synthesize all observations into coherent diagnosis.

Using Phases 1-7 data, determine:

**1. Primary constraint** — single biggest issue/opportunity. Common patterns:
- Missing critical flows (highest-leverage fix)
- Flows exist but underperform benchmarks (content/timing/deliverability)
- Campaign-dominant revenue with weak flows (architecture problem)
- Low list growth (acquisition/popup — not Klaviyo-only fix)
- Deliverability issues (high bounces, complaints, low inbox placement)
- No segmentation (blasting full list — engagement + deliverability risk)
- Email revenue far below 25% of store (underdeveloped program)
- SMS enabled but underutilized (quick revenue opportunity)

**2. Secondary constraints** — rank by impact after primary.

**3. Opportunities** — each with:
→ Priority (CRITICAL / HIGH / MEDIUM / LOW), expected impact (use RPR benchmarks to project), confidence (high/medium/low + reasoning), supporting evidence

**4. Cross-channel signals** — what requires investigation on other platforms:
- Email revenue % → needs Shopify total revenue
- List growth → needs paid traffic data
- Cart recovery → needs GA4/Shopify abandonment data
- Email retargeting → may overlap paid retargeting audiences
- Post-purchase flow → needs Shopify repeat purchase data

**5. Open questions** — what couldn't be answered:
- Total store revenue (if no Shopify evidence)
- Deliverability details (if account tier doesn't show)
- Form/popup conversion rates (if not accessible)
- A/B test history (if not visible)

### Phase 9: Write Evidence JSON

**Goal:** Produce the final evidence JSON conforming to the schema.

Conform to `reference/evidence-schema-quick.md`.

**Klaviyo raw_metrics keys:** `flow_details`, `campaign_details`, `list_details`, `segment_details`, `sms_details`

**Section mapping (Klaviyo-specific):**
1. **meta:** platform = "klaviyo", note MCP vs browser extraction in auditor_notes
2. **account_overview:** total profiles, active, suppressed %, Klaviyo revenue, flow/campaign/SMS revenue, email % of store, list growth rate, flow count, campaign count
3. **campaigns:** Use `type` field to distinguish flows vs campaigns:
   - Flows: "Flow - Welcome", "Flow - Abandoned Cart", "Flow - Browse Abandon", "Flow - Post-Purchase", "Flow - Winback", "Flow - Sunset", "Flow - Other"
   - Campaigns: "Campaign - Email", "Campaign - SMS"
   - Include key_signals tags
4. **tracking_health:** deliverability + integration health (Shopify sync, event tracking, placed-order tracking)
5. **findings:** Discrete observations with title, label, evidence, source, significance
6. **anomalies:** Live flows not sending, 0-member segments, $0-revenue campaigns with high opens, etc.
7. **diagnosis:** Primary + secondary constraints with evidence_refs
8. **opportunities:** Prioritized with expected_impact, confidence, evidence
9. **cross_channel_signals:** Email revenue %, list growth vs paid, cart recovery, retargeting overlap
10. **open_questions:** Unanswered with data_needed and what was attempted

### Evidence Labeling

Read `reference/evidence-rules.md` for the full 5-label system (OBSERVED, CALCULATED, INFERENCE, ASSUMPTION, DATA_NOT_AVAILABLE).

**Klaviyo-specific source formats:**
- MCP: `"Klaviyo API > klaviyo_get_flow_report > flow_id: abc123"`
- Browser: `"Klaviyo > Flows > [Flow Name] > Analytics"`

**File location:**
- Disruptive: `Agency-Clients/reports/{Client-Name}/evidence/{Client}_klaviyo_evidence.json`
- In-House Brand: `In-House-Brand/reports/evidence/In_House_Brand_klaviyo_evidence.json`

### Phase 10: Closeout

Follow `reference/audit-lifecycle.md` > After the Audit section. Platform = "klaviyo".

---

## Working Notes

Follow template in `reference/audit-lifecycle.md` > Working Notes section.

**Klaviyo phase sections:**
Phase 1: Account Overview & Inventory | Phase 2: Flow Performance | Phase 3: Campaign Performance | Phase 4: List Health | Phase 5: Segmentation Quality | Phase 6: Revenue Attribution | Phase 7: SMS Assessment | Phase 8: Diagnosis

---

## Benchmarks

Load from `reference/playbook/benchmarks.md` > Email/Klaviyo section.

**Critical thresholds to memorize:**
- Email revenue % of total store: Healthy 25-40% (below 20% = underdeveloped, above 45% = investigate)
- Flow RPR vs campaign RPR: Healthy 18-25x (Floor <10x, Strong 28x+)
- Welcome open rate: Healthy 50-65% (Floor <35%, Strong 80%+)

---

## Error Handling & Edge Cases

**MCP tool limitations:** If MCP returns incomplete data (e.g., no revenue in flow reports):
→ Document API response vs expected → fall back to browser for missing data → note mixed method in meta.auditor_notes

**New/small accounts (<1,000 profiles or <30d history):**
→ Adjust depth to "standard"/"surface" → focus on structure over benchmarks → flag that performance data needs more history

**SMS not enabled:**
→ Skip Phase 7 → note in findings → add opportunity if list >5,000 profiles

**No revenue tracking ($0 across all):**
→ Likely integration issue (Shopify not syncing) → flag CRITICAL in tracking_health → still audit structure, engagement, list health

**Free vs paid Klaviyo tiers:**
→ Note tier in meta.auditor_notes → some metrics (deliverability, detailed flow analytics) only on higher tiers

---

## Anti-Hallucination

Read `reference/evidence-rules.md` > Anti-Hallucination Rules section.

**Klaviyo-specific additions:**
- MCP vs browser consistency: If using MCP, note exact API call and parameters. If browser, note page and section.
- Cross-check: Flow revenue + campaign revenue ≈ total Klaviyo revenue. Note discrepancies.

---

## Completion Checklist

- [ ] Extraction method confirmed (MCP or browser) at start
- [ ] All flows inventoried and performance captured (Phase 2)
- [ ] Missing critical flows identified against flow-checklist.md
- [ ] Campaign performance assessed for audit period (Phase 3)
- [ ] List health metrics captured (Phase 4)
- [ ] Segmentation quality evaluated (Phase 5)
- [ ] Revenue attribution calculated — flow vs campaign vs total (Phase 6)
- [ ] Email revenue as % of total store revenue calculated (or flagged as open question)
- [ ] SMS assessed (Phase 7) or noted as not applicable
- [ ] Evidence JSON conforms to schema (all required fields present)
- [ ] Every OBSERVED metric has a source
- [ ] Every CALCULATED metric shows the formula
- [ ] No numbers invented without ASSUMPTION label
- [ ] Cross-channel signals populated
- [ ] Open questions documented
- [ ] Working notes saved to evidence directory
- [ ] Evidence JSON saved to evidence directory
- [ ] Manifest updated (if it exists)
