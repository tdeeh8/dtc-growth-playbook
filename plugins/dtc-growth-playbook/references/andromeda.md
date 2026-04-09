# Meta Andromeda & Campaign Architecture (2026)

Last updated: 2026-04-09. Sources: Foxwell Digital (450+ practitioners), Pilothouse ($1B+ managed), Five Nine Strategy (original consolidation test), Triple Whale (35k brands), Zentric Digital (March 2026 analysis), Evolut Agency, ScaledOn, Jon Loomer Digital, Alex Neiman.

## Core Methodology (Evergreen)

**Creative IS targeting.** Andromeda uses creative signals (not audience definitions) to determine who sees ads. The algorithm identifies which creative resonates with which user segments automatically. Campaign structure, audience settings, and bid strategy are secondary to creative quality and diversity.

**Consolidation beats fragmentation.** Fewer campaigns with more diverse creative outperform many campaigns with narrow audiences. This principle has held through every major Meta algorithm update since 2023.

**Entity ID clustering:** Andromeda groups semantically similar ads into "Entity IDs." 50 slight variations of the same hook = 1 Entity ID competing in auction, not 50. Genuine diversity means different hooks, angles, formats, and messaging — not color swaps or minor copy tweaks. This is a structural principle of how the ad auction works.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### How Andromeda Works (Four Systems)

Not one system — four interconnected systems:

- **GEM** (foundation model): Learns from all Meta ecosystem behavior. 5% IG conversion lift, 3% FB lift.
- **Lattice** (coordination): Decision-making layer. 10% revenue improvement reported.
- **Andromeda** (retrieval): Ad matching engine. 100x faster than predecessor, 10,000x model capacity.
- **UTIS** (user feedback): Direct user signals on ad relevance. Precision improved from 48% to 63%.

The system adapts within hours now — tactics that used to work for weeks get neutralized in days. (Source: Triple Whale)

### Campaign Structure

**The consolidation test (Five Nine Strategy):** 1 ad set with 25 diverse creatives vs. 5 ad sets with 5 creatives each. Same ads, same landing pages. Result: 17% more conversions at 16% lower cost. Confirmed by Pilothouse, 1 Click Report, ScaledOn, Search Engine Land.

**What this means in practice:** Consolidate into 1-2 ad sets with 8-20 genuinely diverse creatives each. The legacy 5-10 ad set structure is dead. For full campaign architecture (ASC setup, budget splits, retargeting, testing campaigns), see tof-strategy.md — that's the canonical source for campaign structure.

### Creative Volume & Diversity (Canonical Source)

**Volume requirements by spend level (Foxwell Digital):**
- $5K-10K/mo: 5-15 new creatives per week
- $10K-50K/mo: 8-20 new creatives per month (with ongoing rotation)
- $50K+/mo: 15-30+ new per month, 20-50 active per ad set

**Minimum viable:** 8-15 genuinely different concepts per ad set. Below 8 = insufficient signal. Above 20 = diminishing returns unless spend supports it.

**Format hierarchy (not all equal):**
- UGC/creator content outperforms polished production 3-5x on conversions (Super Ads, 303.london)
- Run at least 3 distinct formats: static, video, creator/animated
- One concept across 2-3 formats counts as genuine diversity
- Formats: UGC, static images, short-form raw video, founder selfies, carousels, memes/GIFs

**Testing framework — 3-3-3 Approach (Pilothouse):**
- 3 personas × 3 core desires × 3 awareness levels = 8-12 distinct concepts
- Test concepts, not individual ads. Each concept expressed in multiple executions.
- Let Andromeda optimize combinations via DCT / Flexible Format Ads.

### Creative Fatigue (Canonical Source)

**Effective ad lifespan compressed post-Andromeda:** Pre-Andromeda: 6-8 weeks. Post-Andromeda: 2-3 weeks (Zentric Digital). Faster reach = faster fatigue.

**Refresh cadence:**
- High-spend ($50K+/mo): Refresh every 7-14 days
- Mid-spend ($10-50K): Refresh every 2-3 weeks
- Low-spend (<$10K): Refresh every 3-4 weeks

**Fatigue diagnostic signals (act on any 2):**
- CTR drops 20%+ from its 7-day peak
- CPA increases 15%+ from baseline
- Frequency exceeds 3.0 on prospecting
- CPM spikes without competitive/seasonal explanation

Fatigue is solved by creative volume, not audience exclusions. Andromeda rotates automatically IF given enough diverse creative.

**March 2026 warning:** Industry-wide performance drop (CPMs +15-40%, ROAS declined) traced to algorithm punishing creative similarity and manual audience stacking. Accounts with diverse creative and consolidated structure recovered within 2 weeks. (Source: Zentric Digital)

### Targeting

**Hierarchy (2026):** Advantage+ Audience ≥ Broad > Interest stacking > Lookalikes

- Broad delivers ~49% higher ROAS vs. lookalikes — driven by lookalike CPM inflation (45% higher CPMs)
- Advantage+ Audience is primary for conversion campaigns with 50+ conversions/week and clean CAPI tracking
- **Override Advantage+ when:** Hyper-local single-store, niche B2B with TAM under 5K, dedicated retargeting audiences

### Learning Phase

- **Safe target:** 50 optimization events per ad set per week
- **Emerging lower floor:** 10 events for Purchase and Mobile App Install objectives (limited rollout, not confirmed universal)
- **Budget math:** Minimum daily budget = (Target CPA × 50) ÷ 7. Example: $20 CPA → $143/day minimum.
- **Learning phase CPA penalty:** 20-50% higher CPA. Avoid resetting by not making significant edits during the 7-day window.

**Low-volume accounts (can't hit 50/week):**
1. Consolidate to 1-2 ad sets with CBO
2. Optimize for upstream events (ATC or IC instead of Purchase)
3. Use Broad + Advantage+ targeting
4. Implement CAPI for server-side tracking

### Attribution Changes (January 2026)

Meta removed 7-day and 28-day view attribution windows. Only 1-day view available. Click-through attribution redefined March 2026: only link clicks count. Impact: 30-40% fewer attributable conversions for longer-cycle purchases. Affects reporting, not actual performance.

---

## Diagnostic Signals

- **High frequency + declining CTR** → Creative fatigue. Solution: new creative, not audience changes.
- **Learning phase not exiting** → Insufficient conversion volume. Consolidate ad sets or move to upstream event.
- **ASC ROAS declining while spend is stable** → Check existing customer budget cap (is it set?). Check creative diversity (entity ID clustering).
- **CPMs spiking without seasonal cause** → Algorithm penalizing creative similarity or audience overlap between campaigns.
- **Good CTR but poor conversion** → Post-click problem (landing page, checkout). Not an Andromeda issue.

## Sources

- Foxwell Digital State of Agencies 2026: https://www.foxwelldigital.com/
- Pilothouse Benchmark Reports: https://www.pilothouse.co/
- Triple Whale 2025 Benchmarks: https://www.triplewhale.com/benchmarks
- Zentric Digital March 2026 Meta Analysis: https://www.zentricdm.com/blog/
- Five Nine Strategy consolidation study (via Search Engine Land)
- Jon Loomer Digital: https://www.jonloomer.com/
