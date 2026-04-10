# DTC Growth Playbook — Index

Last updated: 2026-04-09
Location: protocols/playbook/

## How to Use

Read this index first. Load ONLY the chunks specified for the current task. Each chunk is self-contained — do not chase cross-references to additional files unless the task clearly requires it.

## Chunk Routing

| Chunk | File | Updated | Freshness | Load When |
|---|---|---|---|---|
| Diagnostic Benchmarks | benchmarks.md | 2026-04-09 | Current | Any performance comparison, audit scoring, health checks |
| Meta Andromeda | andromeda.md | 2026-04-09 | Current | Meta algorithm behavior, entity ID clustering, creative diversity, fatigue diagnostics |
| Meta Campaign Architecture | tof-strategy.md | 2026-04-09 | Current | Meta campaign structure, ASC setup, budget allocation, retargeting, testing campaigns |
| Creative Testing | creative-testing.md | 2026-04-09 | Current | Creative performance review, ad testing methodology, concept testing, hook benchmarks, ad format performance, creative analytics tools |
| MAT Testing | mat-testing.md | 2026-04-09 | Current | VP identification, message testing structure, event selection, statistical rigor, creative analytics tools, cross-channel validation |
| Email & SMS | email-sms.md | 2026-04-09 | Current | Klaviyo audit, flow analysis, nurture series, email frequency, SMS benchmarks, predictive CLV, suppression, BFCM frequency, segment-based cadence |
| Scaling & Frequency | scaling-frequency.md | 2026-04-09 | Current | Frequency ceiling, audience saturation, narrow delivery, scaling sequence, ASC budget rules, geo expansion, seasonal scaling |
| Measurement | measurement.md | 2026-04-09 | Current | Attribution, MER/blended metrics, incrementality testing, MMM, CAPI, cross-platform reconciliation, Meta Jan 2026 changes, tracking validation (pixel/CAPI verification, purchase count reconciliation, duplicate event detection, failure modes, tracking health monitoring) |
| Channel Allocation | channel-allocation.md | 2026-04-09 | Current | Budget splits by brand stage, channel roles, seasonal planning, reallocation triggers, halo effects, new channel criteria |
| List Building | list-building.md | 2026-04-09 | Current | Email capture, pop-ups, quiz funnels, SMS capture, first-party data, list hygiene, CLV segmentation |
| Post-Purchase | post-purchase.md | 2026-04-09 | Current | Retention flows, cross-sell/upsell, review timing, replenishment, loyalty programs, referrals, returns/exchanges, subscriptions, package inserts, UGC, post-purchase surveys |
| High-Ticket | high-ticket.md | 2026-04-09 | Current | AOV $200+ strategy, proxy event optimization, lead gen, BNPL/financing, curriculum-style nurture, retargeting windows, landing page depth, Google/YouTube, trust signals, CVR benchmarks by AOV tier |
| Low-Ticket | low-ticket.md | 2026-04-09 | Current | AOV under $100 strategy, impulse funnel, checkout friction, Meta creative fatigue/hooks, AOV optimization, free shipping thresholds, offer structures, email frequency, subscription/repeat, LTV unit economics |
| Google Ads & PMax | google-ads.md | 2026-04-09 | Current | Google Ads audit, PMax methodology, Shopping feed, Smart Bidding, branded cannibalization, asset groups, Google × Meta interaction, AI Max |

## Canonical Ownership

When the same concept appears in multiple chunks, this is the source of truth:

| Concept | Canonical File | Other files may reference but do NOT override |
|---|---|---|
| Campaign structure (ASC, retargeting, testing, awareness) | tof-strategy.md | andromeda.md, creative-testing.md |
| Algorithm mechanics (Andromeda, Entity ID, GEM/Lattice) | andromeda.md | tof-strategy.md, creative-testing.md |
| Creative testing methodology (frameworks, statistical sig) | creative-testing.md | andromeda.md |
| Creative volume & diversity requirements | andromeda.md | creative-testing.md, tof-strategy.md |
| Creative fatigue signals & refresh cadence | andromeda.md | scaling-frequency.md |
| Profitability math (break-even CPA, ROAS formulas) | benchmarks.md | all other chunks |
| Platform metric thresholds (Floor/Healthy/Strong) | benchmarks.md | all other chunks |
| Email/SMS flow architecture & benchmarks | email-sms.md | list-building.md, benchmarks.md |
| Budget allocation across channels | channel-allocation.md | tof-strategy.md, google-ads.md |
| Scaling rules & frequency ceilings | scaling-frequency.md | andromeda.md, tof-strategy.md |
| Google Ads benchmarks (Search, Shopping, PMax, Display) | google-ads.md | benchmarks.md |
| PMax audit methodology & branded cannibalization | google-ads.md | — |
| Shopping feed optimization | google-ads.md | — |
| Google × Meta budget allocation | google-ads.md | channel-allocation.md |
| Tracking validation & purchase reconciliation | measurement.md | — |
| Platform setup verification (CAPI, EMQ, Consent Mode) | measurement.md | google-ads.md |

## Skill-Specific Loading

| Skill | Load These Chunks |
|---|---|
| client-audit | benchmarks, tof-strategy, channel-allocation, measurement + high-ticket OR low-ticket (by AOV) + andromeda, scaling-frequency (if Meta) + google-ads (if Google) + email-sms, list-building (if Klaviyo) |
| cro-audit | benchmarks, creative-testing, post-purchase + high-ticket OR low-ticket (by AOV) |
| amazon-ads-audit | benchmarks |
| seo-audit | benchmarks, measurement |
| Any Meta-specific work | andromeda, tof-strategy, creative-testing, scaling-frequency |
| Any Google-specific work | google-ads, benchmarks, measurement |
| Any Klaviyo-specific work | email-sms, list-building, benchmarks |
| New client onboarding | mat-testing, tof-strategy, channel-allocation, list-building |

## Cross-Channel Ripple Effects

These dependencies matter during audits and strategy work — a problem in one area often surfaces in another:

- **Meta creative fatigue → email list growth slows.** TOF drives new subscribers. If Meta creative is stale, new email signups drop even if Klaviyo is healthy.
- **Email engagement → Google branded ROAS rises.** Warm email recipients search branded terms. Low email engagement = lower branded search volume.
- **Amazon organic rank → blended CAC drops.** Strong organic rankings reduce ad dependency. If organic slips, paid costs spike across all channels.
- **Landing page CVR → all paid channels suffer.** A broken post-click experience tanks Meta, Google, and Amazon ROAS simultaneously. Check website first.
- **Benchmark thresholds depend on client economics.** Always calculate profitability math (benchmarks.md) before comparing any channel to thresholds.

## Chunk Template

Every chunk follows this internal structure:

```
# [Topic Name]
Last updated: YYYY-MM-DD. Sources: [list].

## Core Methodology (Evergreen)
[Timeless principles that don't change with platform updates]

## Current Playbook [Valid Q_ 20__ — review Month 20__]
[Platform-specific tactics with clear dating]

## Diagnostic Signals
[If X → check Y → do Z. Inline decision tree for troubleshooting.]

## Sources
[Clickable URLs for key claims]
```

## Learning Loop

After any audit or strategy session that surfaces a new insight:
1. Note finding in the relevant department context tagged [new] with the playbook chunk it relates to
2. When same pattern appears across 2+ clients or departments: tag [confirmed x2]
3. At 3 confirmations: promote into the relevant playbook chunk with date stamp and source
4. If a finding contradicts existing playbook content: flag immediately, update chunk, note what changed and why
