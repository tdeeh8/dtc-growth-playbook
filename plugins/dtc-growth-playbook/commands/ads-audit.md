---
description: Triage-first marketing audit via Adzviser MCP — scans all connected ad platforms, scores each, then deep-dives only where problems exist
argument-hint: "[client name]"
---

# /ads-audit

> Pulls lightweight diagnostics across all connected ad platforms via Adzviser, scores each RED/YELLOW/GREEN, then deep-dives only the flagged ones. Faster and more focused than a full browser-based audit.

## Usage

```
/ads-audit                              → Asks which client
/ads-audit Acme Brand                 → Looks up workspace, shows connected platforms, starts triage
/ads-audit Acme Brand Google Ads      → Skips triage, runs full deep-dive on Google Ads only
```

## What This Command Does

This command runs the triage-first ads audit system powered by Adzviser MCP. It:

- **Resolves the client workspace** from a local cache (or pulls fresh from Adzviser on first run)
- **Shows connected platforms** as checkboxes so you pick exactly what to audit
- **Runs lightweight triage** (1 pull per platform, account-level totals only)
- **Scores each platform** RED/YELLOW/GREEN based on diagnostic thresholds
- **Deep-dives only flagged platforms** (RED = full dive, YELLOW = targeted dive, GREEN = skip)
- **Generates a cross-channel report** with profitability analysis

## Platforms Covered

Google Ads, Meta Ads, Amazon Ads, GA4, Shopify, BigCommerce

## What This Does NOT Cover

SEO, CRO, Klaviyo, site design/UX — use `/audit` for those.

## Execution Instructions

When this command is invoked, the ads-audit skill's SKILL.md contains the complete orchestration logic. Read and follow it for all modes: Full Triage, Channel Audit, Resume, and Report generation.
