# DTC Growth Playbook Plugin

A modular marketing science playbook and audit toolkit for DTC and ecommerce brands. Gives Claude deep knowledge of campaign strategy, creative testing, funnel optimization, and measurement — loaded automatically during audits and strategy work. Includes a human voice protocol to make all content sound natural.

## What's Inside

**13 playbook chunks** covering:

- **Campaign Strategy** — Three-layer TOF framework (Reach → ATC → Purchase), Meta Andromeda best practices, budget ratios by client maturity
- **Creative** — Hook/Body/CTA testing model, 3:2:2 method, MAT (Messaging Architecture Testing), 70/20/10 budget rule
- **Scaling & Frequency** — Frequency thresholds by AOV tier, scaling sequence, narrow delivery diagnosis
- **Email & SMS** — Flows vs campaigns, nurture series design, Klaviyo 2026 benchmarks
- **Measurement** — Three-layer attribution stack, incrementality testing, cross-platform validation
- **Benchmarks** — Funnel targets with sources (Meta, Klaviyo, Stroud framework)
- **Specialized** — High-ticket ($200+ AOV), low-ticket (under $100), channel allocation, list building, post-purchase

**5 skills:**

| Skill | Purpose |
|---|---|
| playbook-reference | Auto-loads relevant playbook chunks during audits and strategy work |
| client-audit | Full 8-phase client growth audit with DOCX report generation |
| cro-audit | CRO diagnostic audit across website, GA4, Meta Ads, and Google Ads with DOCX report |
| seo-audit | SEO audit with keyword research, on-page analysis, content gaps, technical checks, competitor comparison |
| human-voice | Eliminate AI tells from any written content — banned words, structural patterns, tone fixes |

**5 commands:**

| Command | Purpose |
|---|---|
| /playbook | Browse or search the playbook manually |
| /audit | Run a full client growth audit |
| /cro-audit | Run a CRO diagnostic audit |
| /seo-audit | Run an SEO audit |
| /humanize | Make content sound human (eliminate AI tells) |

## How It Works

**Automatic:** When you ask Claude to run an audit, analyze campaigns, or do strategy work, the playbook-reference skill triggers and loads only the relevant chunks. No manual setup needed.

**Manual:** Type `/playbook` to browse the full playbook, or `/playbook [topic]` to search for a specific topic (e.g., `/playbook frequency`, `/playbook andromeda`).

**Audit:** Type `/audit` or say "run a client audit" to start a full growth audit. Claude will walk through all 8 phases — from evidence collection to a polished DOCX report — using playbook benchmarks throughout.

**CRO Audit:** Type `/cro-audit` or say "run a CRO audit" to diagnose conversion rate issues. Covers website UX, GA4 funnels, Meta Ads, and Google Ads with a DOCX report output.

**SEO Audit:** Type `/seo-audit` or say "audit their SEO" to analyze search optimization. Covers keyword research, on-page SEO, content gaps, technical SEO, and competitor comparison.

**Humanize:** Type `/humanize` or say "make this sound human" to eliminate AI tells from any content. Works on emails, social posts, blog articles, product copy, cover letters, and client comms.

## Architecture

All playbook chunks live in `references/` at the plugin root. All skills reference them via `${CLAUDE_PLUGIN_ROOT}/references/`. This means:

- One place to update when the playbook evolves
- Any new skill can access the shared knowledge base
- No duplication across skills

## Sources

Built from the Stroud Marketing Science Framework (30+ Zoom calls), Klaviyo 2026 benchmarks, Meta Andromeda documentation (October 2025 global rollout), internal strategy sessions, and AI writing detection research (Carnegie Mellon, GPTZero, Wikipedia AI Cleanup).

## Requirements

**For the playbook-reference skill, /playbook, and /humanize commands:** No special setup needed. Works in any Cowork session.

**For the audit skills (/audit, /cro-audit, /seo-audit):**

- **Claude in Chrome extension** — Required. The audit skills use browser tools to inspect websites and platforms in real time. Without Chrome connected, the evidence collection won't work.
  - Enable in Cowork: Settings → Desktop app → Claude in Chrome
  - The Chrome extension must be installed and connected before starting an audit
- **Platform access** — You need to be logged into the platforms you want to audit (Shopify admin, Meta Ads Manager, GA4, Google Ads, Amazon Seller Central, etc.) in Chrome before starting
- **Computer use** — Enable in Settings → Desktop app → Computer use (used for scrolling dashboards and interacting with platform UIs)

## Install

```
/plugin install github.com/tdeeh8/dtc-growth-playbook
```

## Updating

The plugin maintainer updates playbook chunks as new patterns are confirmed across clients. Install from the GitHub repo to get automatic updates.
