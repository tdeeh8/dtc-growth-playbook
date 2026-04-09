# Scaling & Frequency Management

Last updated: 2026-04-09. Sources: Foxwell Digital (450+ practitioners), Pilothouse ($1B+ managed), Alex Neiman (ASC guide), StackMatix, AdStellar, Code3, Jon Loomer Digital, AdAmigo.ai, MTM Agency, Motion App, Marpipe, Madgicx.

## Core Methodology (Evergreen)

**Scaling is a sequence, not a lever.** Budget is the last thing you increase. The sequence: creative diversity → audience expansion → new channels → new geos → budget. Skipping steps wastes money.

**Frequency is a symptom, not a cause.** Rising frequency means one of three things: creative fatigue, audience saturation, or both. Diagnose before acting. The wrong fix (new creative when you need new audiences, or new audiences when you need new creative) wastes budget and delays recovery.

**The diagnostic test:** Swap in new creative for the same audience. If CTR and CPA recover within 3-5 days, the issue was creative fatigue. If performance only rebounds when you expand to a fresh audience, the issue is audience saturation. If neither works, it's both — you need new creative AND new audiences.

**Budget increases must be gradual.** Large jumps reset the learning phase and waste the optimization data the algorithm has accumulated. This has held through every Meta algorithm update.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### Frequency Thresholds

Practitioners no longer organize frequency ceilings by AOV tier. Campaign type matters more than product price:

| Campaign Type | Diagnostic Trigger | Refresh Threshold | Actively Broken |
|---|---|---|---|
| **Prospecting (ASC/broad)** | 3.0/7d | 3.5/7d | 4.5+/7d |
| **Prospecting with high existing customer cap** | 3.5/7d | 4.0/7d | 5.0+/7d |
| **Retargeting (manual)** | 5.0/7d | 6.0/7d | 8.0+/7d |

At diagnostic trigger: investigate. At refresh threshold: queue new creative. At actively broken: immediate action required.

**The real diagnostic:** Plot frequency vs. CTR weekly. Find the inflection point where frequency rises and CTR drops. That's the ceiling for that specific account — thresholds above are starting points, not rules.

**ASC frequency behavior:** ASC manages frequency differently than manual campaigns. It pushes higher volume without direct control. When frequency climbs above 3.0 and CTR declines, the fix is adding new creative assets — not adjusting targeting (you can't in ASC). The existing customer budget cap directly affects frequency: higher cap = higher frequency because ASC over-indexes on warm audiences. Keep cap at 25-30% to control this.

### Creative Fatigue vs. Audience Saturation

These are different problems requiring different fixes:

**Creative fatigue signals:**
- Frequency above 3.0 with CTR declining 15-25%+ week-over-week
- CPA increases 40-50% while downstream conversion rates stay stable
- Ad Relevance Score drops a tier (Average → Below Average) for 3+ days
- Hides per 1K impressions spike

**Fix:** Rotate creative, refresh hooks/angles, introduce new formats. Do NOT slice audience thinner.

**Audience saturation signals:**
- Frequency rises BUT reach plateaus (same people, fewer new impressions)
- CTR declines AND downstream conversion rates also slip (both metrics deteriorate)
- CPM rises while reach stays flat

**Fix:** Expand audience pool (broader targeting, new geos, new channels). Do NOT just make more creative for the same exhausted audience.

### Scaling ASC

**Budget increases — the 20% rule still holds:**
- Max 20% budget increase every 3-4 days. Exceeding 20% triggers a full learning phase reset.
- Give campaigns 7 days (50+ conversions) before any edits.
- Minimum viable test: 3-4 days at new budget showing consistent ROAS at or above breakeven. If green, proceed with next 20% increment.
- ASC handles budget changes slightly better than manual campaigns (new budget consolidation tools let Meta redistribute across ad sets), but 20% ceiling still applies.

**Vertical scaling (increase budget on performing campaigns):**
- Use the 20% staircase. Monitor for 3-4 days between steps.
- Watch frequency — if it spikes with the increase, you're hitting the audience ceiling, not a budget ceiling.

**Horizontal scaling (launch new campaigns for new audiences/creatives):**
- Most accounts perform best with 1-2 ASC campaigns. Running 3+ creates the fragmentation ASC was designed to solve.
- Horizontal scaling = new creative concepts fed into existing ASC, not new ASC campaigns.
- Exception: separate ASC campaigns per major product line OR per geo (see geo expansion below).

### Scaling Sequence (ASC-Primary)

When an account hits diminishing returns:

1. **Creative diversity first.** Feed 8-15+ genuinely distinct concepts into ASC. Different hooks, angles, formats — not variations of one concept. Andromeda optimizes based on creative signals, so this is the highest-leverage scaling lever. (See andromeda.md for volume by spend tier and entity ID clustering.)

2. **Audience expansion.** When frequency climbs above 3-4 despite fresh creative: broaden geographic targeting, loosen demographic constraints, test broader interest signals. CPM increase of 30-40% with flat reach = saturation signal.

3. **Cross-channel expansion.** When Meta is genuinely maxed (frequency ceiling across all creative, CPMs rising, diminishing returns clear):
   - **Email & SMS first** (owned channels, highest ROI, should deliver 20%+ of revenue)
   - **TikTok** (paid discovery, strong for younger demos and awareness)
   - **Google Shopping / PMax** (search intent capture, best for strong product feeds)
   - **Pinterest** (seasonal, retargeting, lower CPM than Meta)

4. **Geo expansion.** Create separate ASC campaigns per major market (US, CA, UK, AU). Don't run a single global ASC unless budget exceeds $5K+/day with identical messaging. Match creative and landing pages to local language and culture — not just translation.

5. **Budget increase.** Only after steps 1-4 are exhausted. Use 20% staircase.

### Narrow Delivery Fixes

When Meta delivers to a narrow audience despite broad targeting:

1. **Check creative similarity.** Andromeda treats similar ads as one Entity ID and serves to the same user cluster. Need genuinely different formats (polished video vs. raw UGC vs. meme vs. founder talking head). This is the most common cause.
2. **Check existing customer budget cap.** If not set or too high, ASC defaults to retargeting warm audiences (easy conversions, inflated ROAS, no growth).
3. **Check conversion event volume.** If only a specific person type converts, Meta only finds that type. Consider optimizing for upstream events (ATC instead of Purchase) to broaden the signal.
4. **Frequency reset (last resort).** When frequency exceeds 4.0 with no recovery: pause the campaign for 7-10 days, then relaunch at 10-20% higher budget with refreshed creative. Forces the algorithm to find new inventory.

### Seasonal Scaling (Q4/BFCM)

Q4 rules differ from steady-state:
- CPMs spike 60%+ during BFCM due to competition. Budget same amount = less reach.
- Creative refresh cadence accelerates: every 3-4 days during BFCM (vs. 2-3 weeks normally).
- Build warm audiences 6-8 weeks before peak: shift budget to TOF/awareness to seed pixel data and build retargeting pools.
- At peak: retarget warm audiences with seasonal offers. Higher frequency tolerance during holidays (audiences expect more ads).
- Monitor ASC existing customer cap closely — holiday traffic inflates warm audiences.

---

## Diagnostic Signals

- **Frequency rising + CTR dropping + reach stable** → Creative fatigue. Fix: new creative, not new audiences.
- **Frequency rising + reach flattening + CPM rising** → Audience saturation. Fix: expand audiences, new geos, new channels.
- **Budget increased 20% but CPA jumped 40%+** → Likely hit audience ceiling, not budget ceiling. Revert and focus on creative/audience expansion first.
- **ASC ROAS high but new customer acquisition flat** → Existing customer cap too high or not set. ASC is retargeting, not prospecting. (See tof-strategy.md for ASC setup.)
- **Narrow delivery despite broad targeting** → Creative similarity (Entity ID clustering) or conversion event too narrow. See fixes above.
- **Q4 CPMs spiking** → Normal. Don't panic-cut budget. Increase creative refresh cadence and lean on warm audiences built pre-peak.

## Sources

- Foxwell Digital Scaling Frameworks: https://www.foxwelldigital.com/blog/how-to-create-systematic-growth-frameworks-on-meta-for-confident-scaling
- Alex Neiman ASC Guide: https://alexneiman.com/meta-advantage-plus-shopping-campaigns-guide/
- StackMatix Diminishing Returns Analysis: https://www.stackmatix.com/blog/diminishing-returns-ad-spend-scaling
- AdStellar Meta Scaling Issues: https://www.adstellar.ai/blog/meta-ads-scaling-issues
- Code3 Learning Phase Guide: https://code3.com/resources/understanding-the-meta-learning-phase-why-it-matters-for-campaign-performance/
- Marpipe Creative Fatigue: https://www.marpipe.com/blog/understanding-creative-fatigue
- Madgicx Fatigue Detection: https://madgicx.com/blog/creative-fatigue-detection
- MTM Agency Andromeda Update: https://themtmagency.com/blog/meta-andromeda-october-2025-update-why-creative-diversity-now-defines-ad-performance
- AdAmigo Geo Expansion: https://www.adamigo.ai/blog/ultimate-guide-to-meta-ads-geographic-expansion
