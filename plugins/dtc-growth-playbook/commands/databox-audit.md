---
description: Triage-first marketing audit powered by Databox MCP. Scans connected ad platforms, scores each RED/YELLOW/GREEN, and deep-dives only where problems exist.
---

Run a Databox-powered marketing audit using the `databox-audit` skill.

**Usage:**
- `/databox-audit [client]` — full triage across all connected data sources, then deep-dives on flagged ones
- `/databox-audit [client] google-ads` — single-channel deep-dive (skip triage)
- `/databox-audit [client] resume` — resume a paused audit from manifest
- `/databox-audit [client] report` — synthesize the cross-channel report from existing evidence

**Covers:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce.
**Data source:** Databox MCP (requires the Databox integration to be connected).
**Reports:** Delivered as DOCX by default.
**Does NOT cover:** SEO, CRO, Klaviyo — use `/audit` for those.

Load the `databox-audit` skill and follow its orchestrator.
