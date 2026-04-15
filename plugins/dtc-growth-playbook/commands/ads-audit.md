---
description: Triage-first marketing audit powered by Adzviser MCP. Scans connected ad platforms, scores each RED/YELLOW/GREEN, and deep-dives only where problems exist.
---

Run an Adzviser-powered marketing audit using the `ads-audit` skill.

**Usage:**
- `/ads-audit [client]` — full triage across all connected platforms, then deep-dives on flagged ones
- `/ads-audit [client] google-ads` — single-channel deep-dive (skip triage)
- `/ads-audit [client] resume` — resume a paused audit from manifest
- `/ads-audit [client] report` — synthesize the cross-channel report from existing evidence

**Covers:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce.
**Data source:** Adzviser MCP (requires the Adzviser integration to be connected).
**Does NOT cover:** SEO, CRO, Klaviyo — use `/audit` for those.

Load the `ads-audit` skill and follow its orchestrator.
