# DTC Growth Playbook — Modular Knowledge Base

## What This Is

A modular playbook for DTC/ecommerce marketing strategy, built for AI-assisted workflows. Each file covers one topic and stays under 1,500 tokens so skills and agents can load only what they need.

Sources: Stroud Marketing Science Framework (30+ Zoom calls), Klaviyo 2026 benchmarks, Meta Andromeda documentation (October 2025 rollout), internal strategy discussions.

## Files

| File | What It Covers |
|---|---|
| index.md | Routing table — which chunk to load for which task |
| tof-strategy.md | Three-layer framework (Reach, ATC, Purchase), event selection, budget ratios |
| creative-testing.md | Hook/body/CTA model, 3:2:2 method, budget rules |
| mat-testing.md | Messaging Architecture Testing, VP identification, campaign type selection |
| andromeda.md | Meta Andromeda algorithm rules, campaign structure, creative diversity |
| scaling-frequency.md | Frequency thresholds by AOV, scaling sequence, narrow delivery fixes |
| high-ticket.md | Long-cycle strategy, custom events, off-platform conversion |
| low-ticket.md | Compressed framework for under $100 AOV |
| email-sms.md | Flows vs. campaigns, nurture design, seasonal frequency, AI features |
| benchmarks.md | All funnel benchmarks in scannable tables with sources |
| measurement.md | Attribution, incrementality, MMM, cross-validation |
| channel-allocation.md | Channel roles, seasonal budget, incrementality-based allocation |
| list-building.md | Pop-ups, co-registration, first-party data, CLV segmentation |
| post-purchase.md | Aha! moment, flow structure, return prevention |

## How to Integrate with Skills

Start of any skill that does analysis or strategy work, add a "Before Starting" block that reads the index and relevant chunks. Example:

```
## Before Starting: Load Playbook Context

Read `reference/playbook/index.md`, then load these chunks based on the task:
- For Meta analysis: tof-strategy.md, creative-testing.md, andromeda.md, scaling-frequency.md, benchmarks.md
- For email/Klaviyo: email-sms.md, list-building.md, benchmarks.md
- For full audit: tof-strategy.md, creative-testing.md, benchmarks.md, email-sms.md, channel-allocation.md, measurement.md
- For Amazon: benchmarks.md
- For quick check-in: benchmarks.md

If client AOV is $200+, also load high-ticket.md. If under $100, load low-ticket.md.

Use playbook benchmarks and frameworks when analyzing data and forming recommendations.
```

