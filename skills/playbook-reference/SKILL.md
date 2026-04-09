---
name: playbook-reference
description: >
  This skill should be used when the user asks to "run an audit",
  "analyze campaign performance", "review Meta ads", "audit this client",
  "check ROAS", "diagnose conversion rate", "evaluate creative strategy",
  "review email flows", "analyze frequency", "scaling strategy",
  "TOF strategy", "funnel benchmarks", "campaign structure review",
  "Andromeda best practices", "creative testing methodology",
  "MAT testing", "messaging architecture test", or any request
  involving DTC/ecommerce marketing analysis, campaign optimization,
  or growth strategy. Also triggers on: "what's the benchmark for",
  "is this ROAS good", "how should we structure campaigns",
  "frequency too high", "scaling problems", "creative fatigue",
  "high ticket strategy", "low ticket strategy", "email strategy",
  "Klaviyo audit", "measurement framework", or "channel allocation".
---

# DTC Growth Playbook — Reference Skill

Modular marketing science playbook for DTC/ecommerce. Load only the chunks relevant to the current task.

## Chunk Routing

Read the chunk files from `${CLAUDE_PLUGIN_ROOT}/references/` based on the task at hand:

| Task Type | Load These Files |
|---|---|
| **Full client audit** | tof-strategy.md, creative-testing.md, benchmarks.md, email-sms.md, channel-allocation.md, measurement.md |
| **Meta Ads analysis** | andromeda.md, tof-strategy.md, creative-testing.md, scaling-frequency.md |
| **CRO / conversion audit** | benchmarks.md, creative-testing.md, post-purchase.md |
| **Amazon audit** | benchmarks.md |
| **Email / Klaviyo audit** | email-sms.md, list-building.md, benchmarks.md |
| **New client onboarding** | mat-testing.md, tof-strategy.md, channel-allocation.md, list-building.md |
| **Scaling / frequency issues** | scaling-frequency.md, andromeda.md, tof-strategy.md |
| **Creative review** | creative-testing.md, andromeda.md |
| **Quick benchmark check** | benchmarks.md |

**AOV modifiers:** If client AOV is $200+, also load high-ticket.md. If under $100, load low-ticket.md.

## How to Use

1. Identify the task type from the table above
2. Read ONLY the listed chunk files from `${CLAUDE_PLUGIN_ROOT}/references/`
3. Apply the frameworks, benchmarks, and thresholds when analyzing data and forming recommendations
4. Cite the playbook when making recommendations (e.g., "Per the three-layer framework, Layer 1 should use Reach/ThruPlay objectives...")

## Available Chunks

| File | Contents |
|---|---|
| tof-strategy.md | Three-layer campaign framework (Reach → ATC → Purchase), budget ratios, event selection |
| creative-testing.md | Hook/Body/CTA model, 3:2:2 method, 70/20/10 budget rule |
| mat-testing.md | Messaging Architecture Testing, VP identification, campaign type selection |
| andromeda.md | Meta Andromeda algorithm rules, creative diversity, learning phase thresholds |
| scaling-frequency.md | Frequency thresholds by AOV, scaling sequence, narrow delivery diagnosis |
| high-ticket.md | Strategy for AOV $200+, custom events, off-platform conversion |
| low-ticket.md | Compressed framework for AOV under $100 |
| email-sms.md | Flows vs campaigns, nurture design, seasonal frequency |
| benchmarks.md | Funnel benchmarks with targets and top-performer ranges |
| measurement.md | Attribution, incrementality, MMM, cross-validation |
| channel-allocation.md | Channel roles, seasonal budgets, incrementality-based allocation |
| list-building.md | Pop-ups, co-registration, first-party data, CLV segmentation |
| post-purchase.md | Aha moment, flow structure, return prevention |

## Sources

Built from: Stroud Marketing Science Framework (30+ Zoom calls), Klaviyo 2026 benchmarks, Meta Andromeda documentation (October 2025 global rollout), internal strategy sessions.
