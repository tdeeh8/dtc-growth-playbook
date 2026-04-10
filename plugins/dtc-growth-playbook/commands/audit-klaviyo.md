# /audit-klaviyo

Run a deep Klaviyo email/SMS platform audit for a client. Part of the modular audit system v2.

## Usage

```
/audit-klaviyo                         → prompts for client name + details
/audit-klaviyo Acme Co          → starts audit for Acme Co
/audit-klaviyo Acme Co quick    → surface-level audit (structure + list health only)
```

## What This Does

Connects to Klaviyo via MCP tools (preferred) or browser (fallback), extracts flow performance, campaign performance, list health, segmentation quality, SMS program status, and revenue attribution data — then writes a structured JSON evidence file for the audit-synthesizer.

**Output:** `{Client}_klaviyo_evidence.json` — NOT a report. The synthesizer generates reports.

## Instructions

1. Read the full skill file: `.claude/skills/klaviyo-audit-v2/SKILL.md`
2. Follow the skill instructions exactly — it covers playbook loading, reference file loading, manifest checking, MCP vs browser detection, all 10 audit phases, and the evidence JSON schema.
3. Read all reference files in `.claude/skills/klaviyo-audit-v2/reference/` before extracting data.

## Quick Reference: Audit Phases

1. **Account Overview & Inventory** — Catalog flows, campaigns, lists, segments
2. **Flow Performance Analysis** — Metrics for every active flow + gap analysis against flow-checklist.md
3. **Campaign Performance Analysis** — Send frequency, engagement, revenue contribution
4. **List Health & Deliverability** — Growth rate, suppression, bounce rates, hygiene signals
5. **Segmentation Quality** — Engagement-based, purchase-based, behavioral segments
6. **Revenue Attribution & Cross-Channel Signals** — Flow vs campaign revenue, email % of total store revenue
7. **SMS Assessment** — SMS program health (skip if SMS not enabled)
8. **Platform Diagnosis** — Synthesize into primary/secondary constraints + opportunities
9. **Write Evidence JSON** — Final deliverable conforming to evidence-schema.json
10. **Update Manifest** — Mark Klaviyo as DONE in the audit manifest

## Extraction Method

**Preferred: Klaviyo MCP tools** — `klaviyo_get_flows`, `klaviyo_get_campaigns`, `klaviyo_get_lists`, `klaviyo_get_segments`, `klaviyo_get_flow_report`, `klaviyo_get_campaign_report`, `klaviyo_query_metric_aggregates`, etc.

**Fallback: Browser** (Claude in Chrome) — navigate Klaviyo UI directly. See `reference/nav-klaviyo.md`.

Detection: attempt `klaviyo_get_account_details` at start. Success = MCP path. Failure = browser path.

## Requires

- Klaviyo MCP tools connected OR browser access (Claude in Chrome) to Klaviyo
- Klaviyo account access for the client
- Playbook chunks: `benchmarks.md`
- Conditional (if they exist): `email-sms.md`, `list-building.md`, `post-purchase.md`
- For cross-channel: total store revenue (from Shopify evidence or user-provided)
