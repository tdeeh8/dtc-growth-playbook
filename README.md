# DTC Growth Playbook Plugin

A modular marketing science playbook and audit toolkit for DTC and ecommerce brands. Gives Claude deep knowledge of campaign strategy, creative testing, funnel optimization, and measurement — loaded automatically during audits and strategy work.

## What's Inside

**13 playbook chunks** covering:

- **Campaign Strategy** — Three-layer TOF framework (Reach → ATC → Purchase), Meta Andromeda best practices, budget ratios by client maturity
- **Creative** — Hook/Body/CTA testing model, 3:2:2 method, MAT (Messaging Architecture Testing), 70/20/10 budget rule
- **Scaling & Frequency** — Frequency thresholds by AOV tier, scaling sequence, narrow delivery diagnosis
- **Email & SMS** — Flows vs campaigns, nurture series design, Klaviyo 2026 benchmarks
- **Measurement** — Three-layer attribution stack, incrementality testing, cross-platform validation
- **Benchmarks** — Funnel targets with sources (Meta, Klaviyo, Stroud framework)
- **Specialized** — High-ticket ($200+ AOV), low-ticket (under $100), channel allocation, list building, post-purchase

**2 skills:**

| Skill | Purpose |
|---|---|
| playbook-reference | Auto-loads relevant playbook chunks during audits and strategy work |
| client-audit | Full 8-phase client growth audit with DOCX report generation |

**2 commands:**

| Command | Purpose |
|---|---|
| /playbook | Browse or search the playbook manually |
| /audit | Run a full client growth audit |

## How It Works

**Automatic:** When you ask Claude to run an audit, analyze campaigns, or do strategy work, the playbook-reference skill triggers and loads only the relevant chunks. No manual setup needed.

**Manual:** Type `/playbook` to browse the full playbook, or `/playbook [topic]` to search for a specific topic (e.g., `/playbook frequency`, `/playbook andromeda`).

**Audit:** Type `/audit` or say "run a client audit" to start a full growth audit. Claude will walk through all 8 phases — from evidence collection to a polished DOCX report — using playbook benchmarks throughout.

## Architecture

All playbook chunks live in `references/` at the plugin root. Both skills (and any future skills) reference them via `${CLAUDE_PLUGIN_ROOT}/references/`. This means:

- One place to update when the playbook evolves
- Any new skill can access the shared knowledge base
- No duplication across skills

## Sources

Built from the Stroud Marketing Science Framework (30+ Zoom calls), Klaviyo 2026 benchmarks, Meta Andromeda documentation (October 2025 global rollout), and internal strategy sessions.

## Install

```
/plugin install github.com/tdeeh8/dtc-growth-playbook
```

## Updating

The plugin maintainer updates playbook chunks as new patterns are confirmed across clients. Install from the GitHub repo to get automatic updates.
