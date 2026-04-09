# Meta Campaign Architecture (2026)

Last updated: 2026-04-09. Sources: Foxwell Digital (450+ practitioners, State of Agencies 2026), Pilothouse ($1B+ managed), Cody Plofker/Jones Road Beauty, Jon Loomer, Alex Neiman, Andrew Faris, Common Thread Collective, StackMatix, AdStellar, MHI Growth Engine, Bïrch/Revealbot.

## Core Methodology (Evergreen)

**Consolidation beats fragmentation.** Fewer campaigns with more diverse creative outperform many narrowly targeted campaigns. This principle has held through every Meta algorithm update since 2023. For the algorithm mechanics behind this, see andromeda.md (canonical source for Andromeda/Entity ID).

**Match campaign structure to conversion volume.** The right structure depends on how many weekly conversions you can generate, not on a fixed template. Accounts with 200+ conversions/week can run more campaigns than accounts with 20/week.

**Retargeting narrows as automation improves.** Manual retargeting budgets have shrunk from 25-30% to 15-20% as automated systems handle warm-audience delivery. Manual retargeting is now precision work (high-intent segments only), not a broad funnel stage.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### The Shift

The old three-layer funnel (Reach → ATC → Purchase in separate campaigns) is no longer primary. Andromeda + ASC consolidation means one campaign handles prospecting and retargeting simultaneously. But full ASC-only is also wrong — practitioners who went all-in saw ASC become a warm-audience machine inflating ROAS while starving acquisition.

The 2026 answer: ASC as the engine, with tactical manual campaigns for specific jobs ASC can't do well.

### Campaign Structure (Canonical Source)

**Primary: Advantage+ Shopping Campaign (60-70% of budget)**

ASC handles broad prospecting + automated retargeting. Main revenue driver.

Required setup:
- Existing customer budget cap: 25-30%. Without this, ASC over-indexes on warm audiences. Single most common ASC mistake.
- Creative: 10-20 diverse assets minimum (see andromeda.md for volume by spend tier)
- Daily budget: $100+ minimum for learning phase
- Advantage+ placements on. Broad targeting (no interest stacking, no lookalikes).

What ASC does well: Finding new buyers at scale, automated creative-to-audience matching, full-funnel delivery.
What ASC does poorly: Precise retargeting of high-intent segments, messaging control for specific funnel stages, creative testing with clear read-through.

**Secondary: Manual Retargeting (15-20% of budget)**

Dedicated retargeting still outperforms ASC's automated retargeting for high-intent audiences. Jon Loomer: abandoned cart remarketing works even at small budgets.

What to run:
- Cart abandoners (7-14 day window): DPA + urgency/offer creative. Frequency: 7-10 impressions over 3 days.
- Site visitors (7-30 day window): Product-specific reminder creative. Frequency: 5-7/week.
- Video engagers / page visitors: Only if audience is large enough (10K+).

Creative: 6-12 variations per retargeting audience. "Why I Finally Bought" messaging gets 3.2x higher CTR in retargeting (Pilothouse data).

**Tertiary: Testing Campaign (10-20% of budget)**

ABO for creative testing and diagnostics. Test new concepts before they go into ASC.

Structure: 1 campaign, ABO, individual ad set per concept. Equal budget per ad set for clean signals. Winners graduate to ASC.

Minimum test budget per concept: $150 over 7-14 days.

**Situational: Awareness/Reach Campaign (0-15% of budget)**

Add when: New brand / limited pixel data (seed pixel for 2-4 weeks). Complex/high-ticket sales cycle (30-90 day consideration). Brand building alongside performance (Cody Plofker actively moved budget back from ASC into mid-funnel reach).

When NOT needed: Established brands with 50+ conversions/week and sufficient creative volume.

If running: Video Views (ThruPlay) for video-heavy. Reach for mostly-static. Measure hook rate, ThruPlay rate, cost per ThruPlay, unique reach. Do NOT measure CPA.

### Budget Allocation by Account Stage

| Stage | ASC | Retargeting | Testing | Awareness | Context |
|---|---|---|---|---|---|
| **New / pre-launch** | 40-50% | 10% | 10-15% | 25-30% | Building pixel data. Awareness seeds signal. |
| **Early growth** (<50 conv/wk) | 50-60% | 15% | 15-20% | 10-15% | Consolidate into ASC. Awareness optional. |
| **Scaling** (50-200 conv/wk) | 60-70% | 15-20% | 10-15% | 0-10% | ASC primary. Awareness only if complex product. |
| **Mature** (200+ conv/wk) | 65-75% | 15-20% | 10-15% | 0-5% | ASC dominant. Manual retargeting for high-intent. |

Adjust based on: product complexity, creative production capacity, and margin.

### Event Selection

Pick the lowest-funnel event you can hit 50+ of per week per ad set:
- Most DTC at scale: ASC optimized for Purchase
- Low volume: ASC optimized for Add to Cart, switch to Purchase once volume supports it
- High-ticket / complex: Initiate Checkout or custom event

If you can't hit 50/week on any conversion event, consolidate to fewer ad sets before moving to upstream events. One ad set at $100/day beats three at $33/day.

---

## Diagnostic Signals

- **ASC ROAS looks great but new customer acquisition is flat** → Check existing customer budget cap. If not set or set too high, ASC is retargeting warm audiences.
- **Testing campaign winners don't perform in ASC** → Creative may work in isolation but lack diversity needed for ASC's broader delivery. Test more concepts, not more variations of one concept.
- **Retargeting ROAS declining** → Audience pool may be shrinking (check TOF volume). Or ASC is already reaching those users, causing overlap. Reduce retargeting budget.
- **Can't exit learning phase** → Consolidate. Fewer ad sets, upstream events, higher budget per ad set. See andromeda.md for learning phase details.
- **New brand with no conversions** → Start with awareness/reach for 2-4 weeks, then shift to ASC as pixel data builds.

## Sources

- Foxwell Digital State of Agencies 2026: https://www.foxwelldigital.com/
- Pilothouse: https://www.pilothouse.co/
- Cody Plofker / Jones Road Beauty (via Twitter/X and podcasts)
- Jon Loomer Digital: https://www.jonloomer.com/
- Andrew Faris: https://www.andrewfaris.com/
- Common Thread Collective: https://commonthreadco.com/
