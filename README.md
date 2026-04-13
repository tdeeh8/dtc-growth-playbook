# DTC Growth Playbook

A Claude plugin for DTC/eCommerce growth marketing — modular audit system, marketing science playbook, and content tools.

## Install

```
/plugin install github.com/tdeeh8/dtc-growth-playbook
```

## What's Inside

### Consolidated Audit System (v4)

One command, one skill. `/audit` handles full multi-platform audits, single-channel deep dives, resume, and report generation — all from a single entry point.

**Platforms:** Google Ads, Meta Ads, Amazon Ads, GA4, Klaviyo, Shopify, BigCommerce, Site/CRO, SEO

**How it works:**
1. `/audit [client]` — Interviews you, creates audit plan, runs platform audits in sequence
2. Each platform produces structured evidence JSON
3. Cross-channel synthesis detects patterns: attribution overlap, halo effects, cannibalization, budget imbalance, funnel gaps
4. Report generated with MER/CM1/CM2/CM3 profitability framework

### Ads Audit — Triage-First via Adzviser (NEW in 5.2.0)

`/ads-audit` uses Adzviser MCP to pull data programmatically instead of browser scraping. Runs lightweight triage on all connected platforms, scores each RED/YELLOW/GREEN, then deep-dives only where problems exist.

**Platforms:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify, BigCommerce

**Key differences from `/audit`:**
- Data via Adzviser MCP (faster, no browser needed)
- Triage-first: scan vitals, find the bleeding, then operate
- GREEN platforms cost almost nothing — budget goes to analysis
- Workspace cache for instant client lookup after first run
- Does NOT cover: SEO, CRO, Klaviyo, site design/UX (use `/audit` for those)

### Marketing Science Playbook

| Command | Description |
|---------|-------------|
| `/playbook [topic]` | Browse and search playbook chunks |

13 knowledge chunks covering: Andromeda (Meta AI), Google Ads, TOF strategy, channel allocation, creative testing, scaling/frequency, email/SMS, list building, post-purchase, measurement, benchmarks, high-ticket strategy, low-ticket strategy.

### Content Tools

| Skill | Command | Description |
|-------|---------|-------------|
| human-voice | `/humanize` | Strip AI tells from written content |
| playbook-reference | `/playbook` | Auto-load relevant playbook chunks for strategy work |

### Legacy Skills

| Skill | Command | Description |
|-------|---------|-------------|
| client-audit | — | Full multi-platform growth audit (v1) |
| cro-audit | `/cro-audit` | CRO diagnostic audit |
| seo-audit | `/seo-audit` | SEO audit |

## Changelog

### 5.2.0 — Ads Audit (Adzviser-powered)
- Added ads-audit skill: triage-first architecture, Adzviser MCP data collection
- Added `/ads-audit` command
- Workspace cache system for instant client resolution
- Covers: Google Ads, Meta Ads, Amazon Ads, GA4, Shopify, BigCommerce
- Profitability framework with CM1/CM2/CM3 waterfall, break-even CPA/ROAS, MER

### 5.1.2 — Consolidated Audit
- Health Score (0-100), parallel execution, quick audit mode
- 9 platform skills, structured evidence JSON, cross-channel synthesis

### 3.0.0 — Modular Audit System v2
- 10 new skills with standardized JSON evidence
- Cross-channel synthesis with profitability framework

### 2.3.0
- Initial release with playbook, client-audit, cro-audit, human-voice
