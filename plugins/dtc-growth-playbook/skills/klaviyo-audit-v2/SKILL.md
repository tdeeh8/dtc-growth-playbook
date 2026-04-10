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

This skill supports two extraction methods. **Prefer MCP tools when available** — they're faster, more reliable, and don't require browser navigation.

### Method 1: Klaviyo MCP Tools (Preferred)

Check if these MCP tools are available in the current session:
- `klaviyo_get_flows` — list all flows
- `klaviyo_get_flow` — get individual flow details
- `klaviyo_get_flow_report` — flow performance metrics
- `klaviyo_get_campaigns` — list all campaigns
- `klaviyo_get_campaign` — individual campaign details
- `klaviyo_get_campaign_report` — campaign performance metrics
- `klaviyo_get_lists` — all lists
- `klaviyo_get_list` — individual list details
- `klaviyo_get_segments` — all segments
- `klaviyo_get_segment` — individual segment details
- `klaviyo_get_profiles` — profile data
- `klaviyo_get_metrics` — available metrics
- `klaviyo_query_metric_aggregates` — query metric data over time
- `klaviyo_get_account_details` — account info
- `klaviyo_get_events` — event data (placed order, etc.)

**If MCP tools are available:** Use them for all data extraction. Skip browser navigation entirely. Follow the same audit phases below but pull data via API calls instead of browser reads.

### Method 2: Browser Fallback (Claude in Chrome)

If MCP tools are NOT connected, fall back to browser-based extraction. Use the navigation patterns in `reference/nav-klaviyo.md` to navigate the Klaviyo UI and extract data visually.

**How to detect:** At the start of the audit, attempt `klaviyo_get_account_details`. If it succeeds, use MCP path. If it fails or isn't available, switch to browser.

---

## Before You Start

### 1. Load Playbook Chunks

Read these files before extracting any data:

```
${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md        — diagnostic thresholds (Email/Klaviyo section), profitability math
```

**Conditional loads (read if they exist — skip without error if missing):**
```
${CLAUDE_PLUGIN_ROOT}/references/email-sms.md         — email/SMS methodology, flow architecture, send frequency
${CLAUDE_PLUGIN_ROOT}/references/list-building.md     — list growth tactics, popup strategy, lead magnet optimization
${CLAUDE_PLUGIN_ROOT}/references/post-purchase.md     — post-purchase flow design, review solicitation, cross-sell timing
```

### 2. Load Reference Files

Read all reference files in this skill's `reference/` directory:

```
reference/nav-klaviyo.md          — Klaviyo navigation patterns (MCP + browser)
reference/flow-checklist.md       — Standard flow audit checklist
```

### 3. Check for Audit Manifest

Look for an existing manifest at the client's evidence directory:
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/{Client}_audit_manifest.md`
- {Own Brand}: `{Own-Brand}/reports/evidence/{Own_Brand}_audit_manifest.md`

**If manifest exists:** Read it for client context, AOV tier, department, platform access URLs, known issues, and which other audits have already been completed. Check if Shopify evidence exists — Shopify revenue is needed for email revenue as % of total calculation.

**If no manifest:** Ask the user for:
- Client name (display name for evidence file)
- Klaviyo account URL or account identifier
- AOV (approximate — needed for benchmark tier selection)
- Department ({Agency} or {Own-Brand})
- Any known issues or focus areas (deliverability problems? low flow revenue? missing flows?)
- Date range preference (default: last 90 days for campaigns, all-time for flows)
- Total store revenue for the period (for email revenue % calculation — or note as open question)

### 4. Set Up Evidence Directory

Ensure the evidence directory exists:
- {Agency}: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

---

## Audit Phases

Execute in order. Each phase builds on the previous. Maintain working notes throughout.

### Phase 1: Account Overview & Inventory

**Goal:** Understand the account structure and overall email/SMS program health.

**MCP path:**
1. Call `klaviyo_get_account_details` — record account name, timezone, industry
2. Call `klaviyo_get_flows` — inventory all flows (name, status, trigger type)
3. Call `klaviyo_get_campaigns` — list recent campaigns (last 90 days minimum)
4. Call `klaviyo_get_lists` — inventory all lists (name, member count)
5. Call `klaviyo_get_segments` — inventory all segments (name, member count)

**Browser path:**
1. Navigate to Klaviyo dashboard — see `reference/nav-klaviyo.md`
2. Record account-level summary metrics from the dashboard (total revenue attributed, total recipients, etc.)
3. Navigate to Flows tab — inventory all flows
4. Navigate to Campaigns tab — inventory recent campaigns
5. Navigate to Audience > Lists & Segments — inventory all lists and segments

**Working notes format for Phase 1:**
```
## Account Overview
- Account: [name]
- Industry: [if available]
- Total profiles: X
- Total suppressed: X

## Flow Inventory
| Flow Name | Status | Trigger | # Messages |
|---|---|---|---|
| ... | Live/Draft/Manual | ... | ... |

## Missing Critical Flows (from flow-checklist.md)
- [ ] Welcome Series
- [ ] Abandoned Cart
- [ ] Browse Abandonment
- [ ] Post-Purchase
- [ ] Winback
- [ ] Sunset / Re-engagement

## List Inventory
| List Name | Member Count | Type | Notes |
|---|---|---|---|

## Segment Inventory
| Segment Name | Member Count | Conditions Summary |
|---|---|---|
```

### Phase 2: Flow Performance Analysis

**Goal:** Assess every active flow's performance and identify gaps.

For each live flow, extract performance metrics:

**MCP path:**
- Call `klaviyo_get_flow_report` for each flow — capture: recipients, open rate, click rate, revenue, revenue per recipient (RPR), unsubscribe rate, bounce rate
- Call `klaviyo_get_flow` for each flow — capture: trigger details, message count, filter conditions, time delays between messages

**Browser path:**
- Navigate to each flow's analytics view
- Record: recipients, open rate, click rate, revenue, RPR, unsubscribe rate
- Open flow builder to assess: message count, delays, branching logic, SMS inclusion

**For each flow, record:**
```
### [Flow Name]
- Status: Live/Draft
- Trigger: [event or segment]
- Messages: X emails, Y SMS
- Time delays: [list delays between messages]
- Recipients (period): X
- Open rate: X%
- Click rate: X%
- Revenue: $X
- RPR: $X.XX
- Unsubscribe rate: X%
- Bounce rate: X%
- Key signals: [tags from list below]
```

**Key signals to tag per flow:**
- `missing_flow` — critical flow type doesn't exist (from flow-checklist.md)
- `low_rpr` — RPR below floor threshold
- `high_unsubscribe` — unsubscribe >0.5% on a flow
- `single_message` — flow has only 1 email (most should have 2-4+)
- `no_sms` — flow lacks SMS messages (missed revenue if SMS is enabled)
- `long_delay` — first message delay >1 hour for high-intent flows (abandoned cart, browse abandon)
- `stale_flow` — flow is live but hasn't sent in 30+ days
- `no_branching` — flow doesn't split by engagement level or customer value
- `draft_critical` — critical flow exists but is in Draft status (not sending)

**Benchmark application (from benchmarks.md):**
- Welcome open rate: Floor <35%, Healthy 50-65%, Strong 80%+
- Welcome click rate: Floor <5%, Healthy 10-16%, Strong 20%+
- Abandoned cart recovery RPR: Avg $3.65, Top 10% $28.89, High-AOV ($200+) $14.14
- Abandoned cart open rate: Floor <30%, Healthy 40-50%, Strong 55%+
- Flow RPR vs campaign RPR: Floor <10x, Healthy 18-25x, Strong 28x+

### Phase 3: Campaign Performance Analysis

**Goal:** Assess campaign sending patterns, engagement, and revenue contribution.

**MCP path:**
- Call `klaviyo_get_campaigns` with date filters for the audit period
- Call `klaviyo_get_campaign_report` for each campaign (or top 20 by recipients if >20 campaigns)
- Call `klaviyo_query_metric_aggregates` for aggregate campaign metrics over time

**Browser path:**
- Navigate to Campaigns tab, filter to audit date range
- Sort by send date (most recent first)
- Record metrics for each campaign or top 20

**For each campaign (or top 20), record:**
```
| Campaign Name | Send Date | Recipients | Open Rate | Click Rate | Revenue | RPR | Unsub Rate |
|---|---|---|---|---|---|---|---|
```

**Aggregate campaign metrics to calculate:**
- Total campaign sends in period
- Average send frequency (campaigns per week)
- Average open rate across campaigns (engaged segment vs full list sends)
- Average click rate
- Total campaign revenue
- Campaign RPR (total campaign revenue / total campaign recipients)
- Unsubscribe rate trend (is it rising?)

**Key signals to tag:**
- `low_open_rate` — campaign open rate <30% on engaged segments (or <21% on full list)
- `low_click_rate` — campaign click rate <1%
- `high_frequency` — sending >4x/week to same segment
- `low_frequency` — sending <1x/week (leaving money on the table)
- `full_list_sends` — campaigns going to entire list (no segmentation)
- `no_revenue` — campaigns generating $0 revenue (content-only or tracking issue)
- `rising_unsubs` — unsubscribe rate trending up over last 30/60/90 days
- `engagement_decay` — open rates declining MoM

**Benchmark application:**
- Campaign open rate (engaged 30d): Floor <30%, Healthy 38-45%, Strong 50%+
- Campaign click rate: Floor <1%, Healthy 1.5-2.5%, Strong 4%+
- Campaign unsubscribe rate: Floor >0.5%, Healthy <0.3%, Strong <0.15%

### Phase 4: List Health & Deliverability

**Goal:** Assess list quality, growth, hygiene, and deliverability signals.

**MCP path:**
- Call `klaviyo_get_lists` — get all lists with profile counts
- Call `klaviyo_get_profiles` with filters for suppressed/bounced/unsubscribed counts
- Call `klaviyo_query_metric_aggregates` for bounce rates, complaint rates over time

**Browser path:**
- Navigate to Audience > Lists & Segments
- Record total profiles, suppressed profiles, active profiles
- Check for a "Master List" or main email list — record size
- Check for SMS consent list — record size
- Navigate to Analytics > Deliverability (if available in account tier)

**Metrics to capture:**
```
## List Health
- Total profiles: X
- Active (emailable) profiles: X
- Suppressed profiles: X (X%)
- SMS consent profiles: X
- SMS consent rate: X% (of total profiles)

## Growth Signals
- New profiles (last 30 days): X
- New profiles (last 90 days): X
- List growth rate: X%/month
- Primary acquisition sources: [forms, imports, integrations, etc.]

## Hygiene Signals
- Bounce rate (hard): X%
- Bounce rate (soft): X%
- Complaint/spam rate: X%
- Average deliverability rate: X% (if available)
```

**Key signals to tag:**
- `high_suppression` — suppressed >25% of total profiles (list hygiene issue)
- `low_growth` — list growth <1%/month
- `negative_growth` — unsubscribes + bounces outpacing new signups
- `high_bounce` — hard bounce rate >2%
- `high_complaints` — spam complaint rate >0.1%
- `no_sunset` — no sunset/re-engagement flow AND no suppression of 180+ day inactive
- `single_list` — only one list (no segmentation infrastructure)
- `low_sms_consent` — SMS consent <10% of email list (if SMS is enabled)
- `no_double_optin` — if identifiable, no double opt-in process

**Benchmark application:**
- List growth rate: Floor <1%/mo, Healthy 2-3%/mo, Strong 4%+/mo
- Unsubscribe rate: Floor >0.5%, Healthy <0.3%, Strong <0.15%
- Deliverability: Floor <80%, Healthy 85-92%, Strong 95%+

### Phase 5: Segmentation Quality

**Goal:** Assess whether the account uses meaningful segmentation or blasts everyone.

**MCP path:**
- Call `klaviyo_get_segments` — list all segments with conditions
- For key segments, call `klaviyo_get_segment` for full condition details

**Browser path:**
- Navigate to Audience > Lists & Segments > Segments tab
- Review segment names and member counts
- Open key segments to review conditions

**Check for these segment types:**
1. **Engagement-based segments:**
   - Engaged 30-day (opened/clicked in last 30 days)
   - Engaged 60-day
   - Engaged 90-day
   - Unengaged 90+ days
   - Never opened

2. **Purchase-based segments:**
   - Repeat customers (2+ orders)
   - VIP/high-value customers (top 10-20% by LTV)
   - Recent purchasers (last 30 days)
   - Lapsed customers (purchased 60-180 days ago, no recent activity)
   - Never purchased

3. **Behavioral segments:**
   - Browse abandoners
   - Cart abandoners
   - Viewed specific category/product

4. **Demographic/profile segments:**
   - By location (if relevant)
   - By acquisition source
   - By product interest/preference

**Key signals to tag:**
- `no_engagement_segments` — no segments based on email engagement recency
- `no_purchase_segments` — no segments based on purchase behavior
- `basic_segmentation_only` — only 1-3 segments total
- `sophisticated_segmentation` — 8+ well-defined segments with clear use cases
- `stale_segments` — segments exist but aren't used in campaigns or flows
- `full_list_default` — most campaigns sent to full list rather than segments

### Phase 6: Revenue Attribution & Cross-Channel Signals

**Goal:** Understand email/SMS revenue contribution and flag signals for the synthesizer.

**MCP path:**
- Call `klaviyo_query_metric_aggregates` for "Placed Order" metric attributed to email and SMS
- Calculate: total flow revenue, total campaign revenue, total email+SMS revenue
- If Shopify evidence exists in the manifest, read it for total store revenue

**Browser path:**
- Navigate to Analytics > Dashboard or Revenue tab
- Record: total email-attributed revenue, flow vs campaign revenue split
- If available: SMS-attributed revenue separately

**Metrics to calculate:**
```
## Revenue Attribution
- Total Klaviyo-attributed revenue: $X
  - Flow revenue: $X (X% of Klaviyo total)
  - Campaign revenue: $X (X% of Klaviyo total)
  - SMS revenue: $X (X% of Klaviyo total) [if available]
  - Email revenue: $X (X% of Klaviyo total) [if available]
- Flow revenue as % of total email revenue: X%
- Flow RPR: $X.XX
- Campaign RPR: $X.XX
- Flow RPR / Campaign RPR ratio: Xx

## Cross-Channel (if total store revenue available)
- Email revenue as % of total store revenue: X%
  - Benchmark: 25-40% is healthy
  - Below 20% = email program underperforming
  - Above 45% = possible over-attribution or over-reliance on promotions
- Abandoned cart recovery rate: X% (recovered carts / total abandoned)
```

**Key signals to tag:**
- `low_email_revenue_share` — email <20% of total store revenue
- `high_email_revenue_share` — email >45% of total store revenue (investigate promo dependency)
- `flow_revenue_low` — flow revenue <25% of email revenue (flows underbuilt)
- `flow_revenue_dominant` — flow revenue >60% of email revenue (campaigns weak)
- `campaign_revenue_dominant` — campaign revenue >75% of email revenue (flow opportunity)
- `sms_underutilized` — SMS consent exists but <5% of email+SMS revenue from SMS
- `no_revenue_tracking` — Klaviyo not tracking placed orders (integration issue)

**Cross-channel signals for the synthesizer:**
```json
{
  "signal": "Email revenue is X% of total store revenue (benchmark 25-40%)",
  "check_in": ["shopify", "ga4"],
  "what_to_look_for": "Confirm total store revenue in Shopify. Check GA4 for email traffic volume and CVR vs other channels."
}
```

Additional cross-channel signals to flag:
- List growth rate correlation with paid traffic spend → check in meta-ads, google-ads
- Abandoned cart recovery rate vs cart abandonment rate → check in ga4, shopify
- Email retargeting overlap with Meta/Google retargeting → check in meta-ads, google-ads
- Post-purchase flow driving repeat purchases → check in shopify (repeat customer rate)

### Phase 7: SMS Assessment (If Applicable)

**Goal:** Evaluate SMS program health if SMS is enabled.

**Skip if:** No SMS consent profiles, SMS not enabled in the account.

**Metrics to capture:**
```
## SMS Program
- SMS consent profiles: X
- SMS consent as % of email list: X%
- SMS flows enabled: [list which flows include SMS]
- SMS campaign sends (last 90 days): X
- SMS click rate (flows): X%
- SMS click rate (campaigns): X%
- SMS RPR (flows): $X.XX
- SMS RPR (campaigns): $X.XX
- SMS unsubscribe/opt-out rate: X%
- SMS revenue: $X
- SMS as % of total Klaviyo revenue: X%
```

**Benchmark application:**
- SMS flow CTR: ~10% (campaigns ~5%)
- SMS flow RPR: 8x higher than campaign RPR
- SMS opt-out target: <2%

**Key signals:**
- `sms_not_enabled` — account has email only
- `sms_low_consent` — SMS consent <10% of email list
- `sms_high_optout` — opt-out rate >2%
- `sms_no_flows` — SMS enabled but not integrated into any flows
- `sms_campaign_only` — SMS used for campaigns but not flows (reverse the priority)

### Phase 8: Platform Diagnosis

**Goal:** Synthesize all observations into a coherent diagnosis.

Using the data collected in Phases 1-7, determine:

1. **Primary constraint:** What is the single biggest issue or opportunity? Common patterns:
   - Missing critical flows (welcome, abandoned cart, browse abandon — highest-leverage fix)
   - Flows exist but are underperforming benchmarks (content, timing, or deliverability issue)
   - Campaign-dominant revenue with weak flows (flow architecture problem)
   - Low list growth rate (acquisition/popup problem — not a Klaviyo-only fix)
   - Deliverability issues (high bounces, complaints, low inbox placement)
   - No segmentation (blasting entire list — engagement and deliverability risk)
   - Email revenue far below 25% of total store revenue (underdeveloped email program)
   - SMS enabled but underutilized (quick revenue opportunity)

2. **Secondary constraints:** What else matters after the primary issue? Rank by impact.

3. **Opportunities:** Specific, actionable recommendations with:
   - Priority (CRITICAL / HIGH / MEDIUM / LOW)
   - Expected impact (revenue or efficiency estimate — use RPR benchmarks to project)
   - Confidence level (high / medium / low) with reasoning
   - Supporting evidence from the audit

4. **Cross-channel signals:** What requires investigation on other platforms?
   - Email revenue % requires Shopify total revenue to calculate
   - List growth requires paid traffic data to correlate
   - Abandoned cart recovery requires GA4/Shopify cart abandonment data
   - Email retargeting may overlap with paid retargeting audiences
   - Post-purchase flow effectiveness requires Shopify repeat purchase data

5. **Open questions:** What couldn't you answer? What data is missing?
   - Total store revenue (if Shopify evidence doesn't exist yet)
   - Deliverability details (if account tier doesn't show them)
   - Form/popup conversion rates (if not accessible)
   - A/B test history (if not visible)

### Phase 9: Write Evidence JSON

**Goal:** Produce the final deliverable — a JSON evidence file conforming to the schema.

The evidence file MUST conform to `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json`. Key requirements:

1. **`meta` section:** client name, platform = "klaviyo", audit_date, date_range, access_level, depth, auditor_notes (include whether MCP or browser extraction was used)
2. **`account_overview`:** Array of labeled_metric objects. Include: total profiles, active profiles, suppressed %, total Klaviyo revenue, flow revenue, campaign revenue, SMS revenue (if applicable), email revenue as % of total store revenue (if known), list growth rate, flow count, campaign count (in period)
3. **`campaigns`:** Repurpose for flows + campaigns. Use `type` field to distinguish:
   - type: "Flow - Welcome", "Flow - Abandoned Cart", "Flow - Browse Abandon", "Flow - Post-Purchase", "Flow - Winback", "Flow - Sunset", "Flow - Other"
   - type: "Campaign - Email", "Campaign - SMS"
   - Include key_signals tags
4. **`tracking_health`:** Use for deliverability and integration health:
   - Flags: deliverability issues, integration problems (Shopify sync, event tracking), missing placed-order tracking
   - conversion_actions: repurpose for tracked events (Placed Order, Started Checkout, Added to Cart, etc.)
5. **`findings`:** Discrete observations. Each has title, label, evidence, source (if OBSERVED), significance.
6. **`anomalies`:** Unexpected patterns — flows that are live but not sending, segments with 0 members, campaigns with 0 revenue despite high open rates, etc.
7. **`diagnosis`:** Primary constraint + secondary constraints with evidence_refs.
8. **`opportunities`:** Prioritized actions with expected_impact, confidence, and evidence.
9. **`cross_channel_signals`:** Signals for the synthesizer — email revenue %, list growth vs paid spend, cart recovery vs abandonment, retargeting overlap.
10. **`open_questions`:** Unanswered questions with data_needed and what was attempted.
11. **`raw_metrics`:** Use `flow_details` for per-flow data tables. Add custom keys: `campaign_details`, `list_details`, `segment_details`, `sms_details`.

**Evidence labeling rules (MANDATORY):**
- `OBSERVED` — pulled directly from Klaviyo (MCP API response or browser UI). Must include `source` field.
  - MCP source format: "Klaviyo API > klaviyo_get_flow_report > flow_id: abc123"
  - Browser source format: "Klaviyo > Flows > [Flow Name] > Analytics"
- `CALCULATED` — derived from observed values. `source` must show the formula (e.g., "$4,200 / $18,000 = 23.3%").
- `INFERENCE` — logical conclusion from observed data. Explain the reasoning.
- `ASSUMPTION` — not verified. State what was assumed and why.
- `DATA_NOT_AVAILABLE` — attempted but couldn't get the data. State what was tried.

**File location:**
- {Agency}: `{Agency}/reports/{Client-Name}/evidence/{Client}_klaviyo_evidence.json`
- {Own Brand}: `{Own-Brand}/reports/evidence/{Own_Brand}_klaviyo_evidence.json`

**JSON structure template:**
```json
{
  "meta": {
    "client": "",
    "platform": "klaviyo",
    "audit_date": "",
    "date_range": { "start": "", "end": "" },
    "access_level": "full",
    "depth": "deep",
    "auditor_notes": "Extraction method: MCP API / Browser. [Any data quality notes]"
  },
  "account_overview": [],
  "campaigns": [],
  "tracking_health": {
    "flags": [],
    "conversion_actions": []
  },
  "findings": [],
  "anomalies": [],
  "diagnosis": {
    "primary_constraint": {
      "title": "",
      "description": "",
      "evidence_refs": []
    },
    "secondary_constraints": []
  },
  "opportunities": [],
  "cross_channel_signals": [],
  "open_questions": [],
  "raw_metrics": {
    "flow_details": [],
    "campaign_details": [],
    "list_details": [],
    "segment_details": [],
    "sms_details": []
  }
}
```

### Phase 10: Update Manifest

If an audit manifest exists, update it:
- Set Klaviyo status to `DONE`
- Record the evidence filename
- Record the completion date
- Note the session reference

If no manifest exists, note in working notes that the orchestrator should be run to create one.

---

## Working Notes Protocol

Throughout the audit, maintain `{Client}_klaviyo_audit_notes.md` in the evidence directory. This is your scratchpad — raw observations, intermediate calculations, things to come back to.

**Working notes structure:**
```markdown
# {Client} — Klaviyo Audit Notes

**Date:** YYYY-MM-DD
**Extraction Method:** MCP API / Browser
**Date Range:** Flows: all-time | Campaigns: YYYY-MM-DD to YYYY-MM-DD

## Phase 1: Account Overview & Inventory
[flow inventory, list inventory, segment inventory]

## Phase 2: Flow Performance
[per-flow metrics and signals]

## Phase 3: Campaign Performance
[campaign metrics and patterns]

## Phase 4: List Health
[list sizes, growth, hygiene signals]

## Phase 5: Segmentation Quality
[segment inventory and assessment]

## Phase 6: Revenue Attribution
[revenue splits, cross-channel calculations]

## Phase 7: SMS Assessment
[SMS metrics if applicable]

## Phase 8: Diagnosis
[thinking through the diagnosis before writing JSON]

## Parking Lot
[things noticed but not yet categorized]
```

---

## Benchmark Quick Reference

From `benchmarks.md` — Email/Klaviyo section:

**Flows:**
- Flow revenue % of email revenue: Floor <25%, Healthy 30-45%, Strong 50%+
- Flow RPR vs campaign RPR: Floor <10x, Healthy 18-25x, Strong 28x+
- Welcome open rate: Floor <35%, Healthy 50-65%, Strong 80%+
- Welcome click rate: Floor <5%, Healthy 10-16%, Strong 20%+
- Abandoned cart RPR: Avg $3.65, Top 10% $28.89
- Abandoned cart open rate: Floor <30%, Healthy 40-50%, Strong 55%+

**Campaigns:**
- Campaign open rate (engaged 30d): Floor <30%, Healthy 38-45%, Strong 50%+
- Campaign click rate: Floor <1%, Healthy 1.5-2.5%, Strong 4%+
- Unsubscribe rate: Floor >0.5%, Healthy <0.3%, Strong <0.15%

**List Health:**
- List growth rate: Floor <1%/mo, Healthy 2-3%/mo, Strong 4%+/mo
- Deliverability: Floor <80%, Healthy 85-92%, Strong 95%+

**SMS:**
- SMS flow CTR: ~10% (campaigns ~5%)
- SMS flow RPR: 8x higher than campaigns
- SMS opt-out: target <2%

**Cross-Channel:**
- Email revenue as % of total store revenue: Healthy 25-40%
- Below 20% = underdeveloped email program
- Above 45% = investigate promo dependency or over-attribution

---

## Error Handling & Edge Cases

### MCP Tool Limitations
If MCP tools return incomplete data (e.g., no revenue metrics in flow reports):
- Document what the API returned vs what was expected
- Fall back to browser for the missing data points
- Note the mixed extraction method in `meta.auditor_notes`

### New / Small Accounts
If the account has <1,000 profiles or <30 days of history:
- Note limited data in `meta.auditor_notes`
- Adjust depth to "standard" or "surface"
- Focus on structure (which flows exist, are they built correctly) rather than performance benchmarks
- Flag that performance benchmarks require more data

### SMS Not Enabled
- Skip Phase 7 entirely
- Note in findings that SMS is not enabled
- Add opportunity to evaluate SMS if list size supports it (>5,000 profiles is a reasonable threshold)

### No Revenue Tracking
If Klaviyo shows $0 revenue across all flows and campaigns:
- This is likely an integration issue — Shopify/ecommerce platform not syncing placed orders to Klaviyo
- Flag as CRITICAL in tracking_health
- Note that all revenue-based analysis is impossible without this
- Still audit structure, engagement, and list health

### Free vs Paid Klaviyo Tiers
- Free accounts have limited analytics access
- Note the account tier in `meta.auditor_notes` if identifiable
- Some metrics (deliverability, detailed flow analytics) may only be available on higher tiers

---

## Anti-Hallucination Rules

1. **Every number in the evidence file must come from Klaviyo (MCP API or UI).** No estimates, no "typical" numbers, no recalled benchmarks presented as client data.
2. **If you can't read a metric, say DATA_NOT_AVAILABLE.** Never fill gaps with assumptions silently.
3. **Show your math.** Every CALCULATED metric must show the formula in the `source` field.
4. **Label everything.** If it's an inference, say INFERENCE. If it's an assumption, say ASSUMPTION.
5. **Cross-check totals.** Flow revenue + campaign revenue should approximate total Klaviyo revenue. If they don't, note the discrepancy.
6. **Don't diagnose deliverability issues you didn't verify.** If you suspect inbox placement problems but couldn't access deliverability data, label it INFERENCE.
7. **Timestamp your observations.** Note the date range explicitly for every metric.
8. **MCP vs browser consistency.** If using MCP, note the exact API call and parameters. If using browser, note the page and section.

---

## Completion Checklist

Before marking the audit complete, verify:

- [ ] Extraction method confirmed (MCP or browser) at start
- [ ] All flows inventoried and performance captured (Phase 2)
- [ ] Missing critical flows identified against flow-checklist.md
- [ ] Campaign performance assessed for audit period (Phase 3)
- [ ] List health metrics captured (Phase 4)
- [ ] Segmentation quality evaluated (Phase 5)
- [ ] Revenue attribution calculated — flow vs campaign vs total (Phase 6)
- [ ] Email revenue as % of total store revenue calculated (or flagged as open question)
- [ ] SMS assessed (Phase 7) or noted as not applicable
- [ ] Evidence JSON conforms to the schema (all required fields present)
- [ ] Every OBSERVED metric has a source
- [ ] Every CALCULATED metric shows the formula
- [ ] No numbers were invented or estimated without ASSUMPTION label
- [ ] Cross-channel signals populated (email revenue %, list growth, cart recovery)
- [ ] Open questions documented (what couldn't be answered?)
- [ ] Working notes saved to evidence directory
- [ ] Evidence JSON saved to evidence directory
- [ ] Manifest updated (if it exists)
