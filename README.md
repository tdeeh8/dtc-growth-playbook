# DTC Growth Playbook

Triage-first marketing audit plugin for Claude, powered by Adzviser MCP.

## Install

```
/plugin install github.com/tdeeh8/dtc-growth-playbook
```

## What It Does

`/ads-audit` pulls lightweight diagnostics across all connected ad platforms, scores each RED/YELLOW/GREEN, then deep-dives only where problems exist.

**How it works:**
1. Resolves client workspace from a local cache (or pulls fresh on first run)
2. Shows connected platforms as checkboxes — you pick what to audit
3. Runs triage: 1 pull per platform, account-level totals only
4. Scores each platform against diagnostic thresholds
5. Deep-dives flagged platforms (RED = full, YELLOW = targeted, GREEN = skip)
6. Cross-channel report with profitability analysis (CM1/CM2/CM3, MER, break-even)

**Platforms:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify, BigCommerce

## Usage

```
/ads-audit                              → Asks which client
/ads-audit Acme Brand                   → Looks up workspace, shows connected platforms
/ads-audit Acme Brand Google Ads        → Skips triage, runs full deep-dive on one platform
```

## Requirements

- Adzviser MCP connected with workspace access
- At least one ad platform connected in Adzviser

## Changelog

### 6.0.0
- Removed legacy browser-based audit, playbook references, and old skills
- Plugin now ships only the Adzviser-powered ads-audit

### 5.2.0
- Initial ads-audit release
