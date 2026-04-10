# DTC Growth Playbook

A Claude plugin for DTC/eCommerce growth marketing — modular audit system, marketing science playbook, and content tools.

## Install

```
/plugin install github.com/tdeeh8/dtc-growth-playbook
```

## What's Inside

### Modular Audit System v2 (NEW in 3.0.0)

Independent platform audits that each produce a standardized evidence file, then a synthesis skill reads all evidence and generates a unified cross-channel report.

**How it works:**
1. `/audit-start` — Creates audit manifest, identifies which platforms to audit
2. Run platform audits in any order (each is independent):
   - `/audit-google-ads` — Google Ads deep audit (PMax, Search, tracking health)
   - `/audit-meta` — Meta Ads audit (creative, audience, attribution)
   - `/audit-ga4` — GA4 analytics audit (funnel, attribution, tracking validation)
   - `/audit-klaviyo` — Klaviyo email/SMS audit (flows, campaigns, list health)
   - `/audit-shopify` — Shopify profitability audit (financial source of truth)
   - `/audit-bigcommerce` — BigCommerce profitability audit (Shopify alternative)
   - `/audit-amazon` — Amazon Ads + Seller Central audit
   - `/audit-site` — Website CRO audit (homepage, PDP, cart, checkout, mobile)
3. `/audit-synthesize` — Cross-channel synthesis + unified report

Each platform audit writes a structured JSON evidence file. The synthesizer reads all evidence files and detects cross-channel patterns: attribution overlap, halo effects, cannibalization, budget imbalance, and funnel gaps.

**Key features:**
- Works across sessions — evidence files persist between chats
- Single-platform or multi-platform — synthesizer handles 1 to N evidence files
- MER/CM1/CM2/CM3 profitability framework
- Anti-hallucination verification on every report
- Every number traces to a source (OBSERVED/CALCULATED/INFERENCE/ASSUMPTION)

### Legacy Audit Skills

| Skill | Command | Description |
|-------|---------|-------------|
| client-audit | `/audit` | Full multi-platform growth audit (v1 — single-pass) |
| cro-audit | `/cro-audit` | CRO diagnostic audit |
| seo-audit | `/seo-audit` | SEO audit (keywords, on-page, technical, competitors) |

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

## Changelog

### 3.0.0 — Modular Audit System v2
- Added 10 new skills: audit-orchestrator, google-ads-v2, meta-ads-v2, ga4-audit-v2, klaviyo-audit-v2, shopify-audit-v2, bigcommerce-audit-v2, amazon-ads-v2, site-audit-v2, audit-synthesizer
- Added 10 new slash commands for v2 audit workflow
- Standardized JSON evidence format with schema validation
- Cross-channel synthesis with profitability framework
- Existing v1 skills (client-audit, cro-audit, seo-audit) unchanged

### 2.4.0
- Added client-audit reference files (nav guides, checklists, report template)
- SEO audit skill

### 2.3.0
- Initial release with playbook, client-audit, cro-audit, human-voice
