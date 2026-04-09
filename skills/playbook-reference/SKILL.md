---
name: playbook-reference
description: "Auto-loads DTC marketing playbook chunks during audits and strategy work. Triggers on: run an audit, campaign analysis, Meta ads review, ROAS check, creative strategy, email flows, frequency issues, scaling, benchmarks, Andromeda, TOF strategy."
---

# DTC Growth Playbook — Reference Skill

Modular marketing science playbook. Load only relevant chunks from `${CLAUDE_PLUGIN_ROOT}/references/`.

## Chunk Routing

| Task Type | Load These Files |
|---|---|
| Full client audit | tof-strategy, creative-testing, benchmarks, email-sms, channel-allocation, measurement |
| Meta Ads analysis | andromeda, tof-strategy, creative-testing, scaling-frequency |
| CRO / conversion audit | benchmarks, creative-testing, post-purchase |
| Amazon audit | benchmarks |
| Email / Klaviyo audit | email-sms, list-building, benchmarks |
| New client onboarding | mat-testing, tof-strategy, channel-allocation, list-building |
| Scaling / frequency issues | scaling-frequency, andromeda, tof-strategy |
| Creative review | creative-testing, andromeda |
| Quick benchmark check | benchmarks |

**AOV modifiers:** $200+ → also high-ticket | <$100 → also low-ticket

## Usage

1. Match task to routing table
2. Read listed .md files from `${CLAUDE_PLUGIN_ROOT}/references/`
3. Apply frameworks and benchmarks when analyzing data
4. Cite playbook in recommendations (e.g., "Per the three-layer framework...")

## Available Chunks

tof-strategy (three-layer campaign framework), creative-testing (Hook/Body/CTA, 3:2:2, 70/20/10), mat-testing (VP testing, messaging architecture), andromeda (Meta algorithm, creative diversity, learning phase), scaling-frequency (frequency thresholds by AOV, scaling sequence), high-ticket (AOV $200+), low-ticket (AOV <$100), email-sms (flows vs campaigns, Klaviyo benchmarks), benchmarks (funnel targets with sources), measurement (attribution, incrementality, cross-validation), channel-allocation (channel roles, seasonal budgets), list-building (popups, first-party data, segmentation), post-purchase (retention, cross-sell, flows)
