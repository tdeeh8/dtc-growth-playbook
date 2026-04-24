# Diagnostic Benchmarks

Last updated: 2026-04-09. Sources: Triple Whale (35k brands, 2025), Tinuiti (3,300 campaigns, Q1-Q4 2025), Dynamic Yield (200M users), Baymard Institute (50+ studies), Klaviyo (183k accounts), Jungle Scout (2,500+ sellers). All practitioner/independent data — no platform self-marketing.

## Core Methodology (Evergreen)

### How to Use

Every metric has three thresholds: **Floor** (below this = definitely broken, flag immediately), **Healthy** (profitable accounts operate here), **Strong** (diminishing returns above this — focus effort elsewhere). Context matters — always check AOV tier and funnel position before diagnosing.

### Profitability Math (Use This First)

Before comparing to benchmarks, calculate the client's actual constraints:

- **Break-even CPA** = AOV × gross margin %. Example: $80 AOV × 40% margin = $32 max CPA.
- **Target CPA** = Break-even CPA × 0.6-0.7 (leaves room for overhead + profit). Example: $32 × 0.65 = ~$21 target CPA.
- **Minimum ROAS** = 1 / gross margin %. Example: 1 / 0.40 = 2.5x minimum ROAS to break even.
- **Target ROAS** = Minimum × 1.3-1.5. Example: 2.5 × 1.4 = 3.5x target ROAS.

If the client's economics require a 4x ROAS but the channel averages 1.9x, the problem may be structural (wrong channel for the margin), not optimization.

### Cross-Platform Diagnostics

**"Where's the problem?" decision tree:**
1. High CTR + low CVR everywhere → Website/landing page problem
2. Low CTR + low CVR → Targeting/creative problem
3. Good metrics on one platform, bad on another → Channel-specific issue (audit that channel)
4. Everything looks fine but revenue is flat → Check frequency/saturation, AOV trends, or attribution gaps
5. ROAS looks good but profit is low → Check blended CPA vs. break-even, account for non-ad costs

**Attribution reality check:** Platform-reported ROAS is always inflated. Cross-check: if Meta says 4x ROAS and Google says 3x ROAS, but Shopify revenue doesn't support both being true, at least one is over-attributing. Use Shopify as source of truth for total revenue, then allocate credit proportionally.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### High-AOV Traffic Quality Benchmarks (AOV $200+, Cold Prospecting)

**When to use these instead of (not in addition to) standard Meta benchmarks:** AOV ≥ $200, OR stated buying cycle ≥ 14 days, OR Meta purchase optimization can't exit learning. Applies to Meta + any cold prospecting channel (TikTok, Pinterest, Snap). Does NOT apply to retargeting or branded search.

**Why:** 7-day attribution windows miss high-AOV purchases. Judging cold traffic by 7-day ROAS in this scenario is structurally broken — switch evaluation to traffic quality. See playbook `tof-strategy.md` "High-AOV Traffic Quality Framework" for full methodology.

**Cost per ViewContent (Meta cold prospecting, AOV $200+):**

| Category | Floor | Healthy | Strong |
|---|---|---|---|
| Fine jewelry / luxury ($500+ AOV) | >$4.00 | $1.50-3.00 | <$1.50 |
| Premium home / furniture ($300-1,000 AOV) | >$3.00 | $1.00-2.50 | <$1.00 |
| Premium apparel / lifestyle ($200-500 AOV) | >$2.50 | $0.80-2.00 | <$0.80 |
| High-ticket B2B / services ($1,000+ LTV) | >$6.00 | $2.00-5.00 | <$2.00 |

**Cost per Add-to-Cart (Meta cold prospecting, AOV $200+):**

| Category | Floor | Healthy | Strong |
|---|---|---|---|
| Fine jewelry / luxury ($500+ AOV) | >$80 | $25-60 | <$25 |
| Premium home / furniture ($300-1,000 AOV) | >$60 | $20-50 | <$20 |
| Premium apparel / lifestyle ($200-500 AOV) | >$45 | $12-35 | <$12 |
| High-ticket B2B / services | >$120 | $40-90 | <$40 |

**GA4 Average Engaged Session Time (paid social → site):**

| Tier | Time per Session | Read |
|---|---|---|
| Floor | <30 sec | Wrong audience or broken landing experience |
| Concerning | 30-45 sec | Moderate match — likely creative/landing mismatch |
| Healthy | 45-90 sec | Real consideration happening |
| Strong | >90 sec | High-intent research — algo + creative working |

GA4 platform median is ~52 sec. High-AOV traffic should beat that materially.

**PDP → ATC Rate (GA4 view_item → add_to_cart funnel):**

| Category | Floor | Healthy | Strong |
|---|---|---|---|
| Fine jewelry / luxury | <1.5% | 2.0-3.5% | >3.5% |
| Premium home / furniture | <2.0% | 3.5-5.0% | >5.0% |
| Premium apparel / lifestyle | <2.5% | 4.0-6.0% | >6.0% |

**PDP → Purchase Rate (GA4 view_item → purchase, 30-90 day lookback):**

| Category | Floor | Healthy | Strong |
|---|---|---|---|
| Fine jewelry / luxury ($500+) | <0.4% | 0.7-1.2% | >1.2% |
| Premium home / furniture | <0.5% | 0.8-1.5% | >1.5% |
| Premium apparel / lifestyle | <0.8% | 1.2-2.5% | >2.5% |

**Decision tree — columns grouped by data source (Meta first, GA4 second):**

**Label key:** CPVC/CPATC: `Cheap` = below Healthy band (suspect for high-AOV) · `Healthy` = in band · `Expensive` = above Healthy but below Floor · `Floor` = at/above Floor (problem). Engaged Time: `Healthy` ≥45s, `Low` <30s. PDP→ATC: `Healthy` in band, `Low` below Floor.

| Meta: CPVC | Meta: CPATC | GA4: Engaged | GA4: PDP→ATC | Diagnosis |
|---|---|---|---|---|
| Healthy | Healthy | Healthy | Healthy | Channel working — judge total program by MER + email/CRM close rate |
| Cheap | Floor | Low | Low | Wrong audience — clicks but not buyers |
| Healthy | Floor | Healthy | Low | PDP / product-market fit problem — audit site, not Meta |
| Healthy | Healthy | Low | Healthy | Bot/accidental traffic — check Audience Network, pixel dedupe |
| Floor | Floor | Healthy | Healthy | Audience saturated/narrow — broaden, refresh creative |
| Cheap | Cheap | Low | Low | Engagement-bait creative — accidental clicks |
| Healthy | Healthy | Healthy | Low | PDP problem isolated — good ad + audience, audit site |
| Floor | Healthy | Healthy | Healthy | Expensive but quality — narrow audience kept quality up. Test new audiences. |

**Default rule — when no row matches exactly:**
1. **Tracking validation first** — confirm Meta Pull 4 + GA4 Pull 4 events fire correctly. Broken tracking looks identical to bad performance.
2. **Score by worst metric** — that metric is the constraint. CPVC = creative/targeting; CPATC = audience quality; Engaged Time = traffic quality/placement; PDP→ATC = site/product fit.
3. **Cross-channel sanity** — pull GA4 Pull 5 and compare Meta vs Google/organic. Meta-only weakness = Meta-specific. All paid weak = site/PDP.

**Set-up requirements (data has to be collectable for this framework):**
1. Pixel + CAPI must fire ViewContent and AddToCart with deduplication
2. GA4 must have UTM tagging on Meta ads (Source/Medium = `facebook / cpc` etc.)
3. GA4 enhanced ecommerce events (view_item, add_to_cart, purchase) implemented
4. 30-day minimum lookback for PDP→Purchase rate

If the data layer isn't there, fix it before declaring traffic "low quality" — broken pixel looks identical to bad creative.

---

### Meta Ads

| Metric | Floor | Healthy | Strong | Notes |
|---|---|---|---|---|
| **CTR** | <1.0% | 1.5-2.5% | 3.0%+ | Median 2.19% (2025). Secondary to hook rate. |
| **Hook rate** (3s views / impressions) | <20% | 25-35% | 40%+ | Primary creative quality signal. Below 20% = creative problem. |
| **Hold rate** (watched 50%+) | <30% | 40-55% | 60%+ | Measures message resonance, not just attention. |
| **CPM** (purchase objective) | >$25 | $10-18 | <$10 | Median $13.48 (2025, +20% YoY). Retargeting: $30-50 is normal. |
| **CPC** | >$2.50 | $0.60-1.50 | <$0.50 | Varies by objective. Traffic: ~$0.70. Lead gen: ~$1.88. |
| **Blended ROAS** | <1.5x | 2.0-3.5x | 4.0x+ | Median 1.93x (2025). Back-calculate from margin — see math above. |
| **TOF ROAS** | <1.0x | 1.5-2.5x | 3.0x+ | Lower efficiency expected. Judge by volume + downstream impact. |
| **Retargeting ROAS** | <3.0x | 4.0-6.0x | 8.0x+ | Median 3.6x. Below 3x on retargeting = serious conversion problem. |
| **CPA** | >2x break-even | Within target | <60% break-even | Median $38.17 (2025). Always calculate from client's AOV + margin first. |
| **Frequency (prospecting)** | >4.5/7d | 1.5-3.0/7d | 1.0-1.5/7d | 3.0 = diagnostic trigger (investigate). 3.5 = plan creative refresh. 4.5+ = active deterioration. |
| **Frequency (retargeting)** | >12/7d | 3.0-8.0/7d | 3.0-5.0/7d | Higher tolerance, but watch for CTR decay. |
| **Learning phase** | <25 events/wk | 50+/wk | 75+/wk | Need ~50 conversions in 7 days per ad set to exit learning. |

**Fatigue diagnostic:** Plot frequency vs. CTR weekly. When CTR drops >25% from peak while frequency rises, creative is fatigued — not the audience.

**2025-26 trend:** CPMs up 20% YoY, CPA up only 1%. Algorithm efficiency improving but inventory costs rising. ASC showing 10-22% lower CPA vs. manual campaigns (practitioner consensus across Pilothouse, ScaledOn, Search Engine Land).

### Google Ads

| Metric | Floor | Healthy | Strong | Notes |
|---|---|---|---|---|
| **Search CTR (branded)** | <10% | 15-25% | 30%+ | Branded should be highest CTR. Below 10% = ad copy or competitor problem. |
| **Search CTR (non-branded)** | <2% | 4-6% | 8%+ | Ecommerce avg 2.69%. Non-branded 4.04% (2025, down 26% YoY). |
| **Search CVR (branded)** | <8% | 15-25% | 30%+ | Branded search not converting = landing page or pricing problem. |
| **Search CVR (non-branded)** | <1% | 2-4% | 5%+ | Overall ecommerce search CVR: 2.81% (2025, down 9% YoY). |
| **Shopping ROAS** | <2x | 3-5x | 6x+ | Standard Shopping median 5.2x. PMax median 4.1x. |
| **PMax ROAS** | <2x | 3-5x | 5x+ | ~2% lower than standard Shopping. Hybrid (both) outperforms by 20-35%. |
| **Search CPA** | >2x break-even | Within target | <50% break-even | Ecommerce avg $45.27. Shopping avg $38.87. Display avg $65.80. |
| **Display/remarketing CTR** | <0.3% | 0.5-1.0% | 1.5%+ | Standard display 0.46%. Retargeting 3-4x higher (0.7-1.2%). |
| **Branded impression share** | <70% | 80-90% | 95%+ | Below 80% = competitors conquesting your brand terms. |

**Key diagnostic:** High CTR + low CVR = post-click problem (landing page, pricing, trust). Low CTR + low CVR = targeting/relevance problem.

**2025-26 trend:** CVR down 9%, CPA up 12%, ROAS down 10% industry-wide. CPCs rising 13% YoY. Google taking less budget share (23% in 2025 vs. Meta's 68%).

### Email / Klaviyo

| Metric | Floor | Healthy | Strong | Notes |
|---|---|---|---|---|
| **Flow revenue % of email revenue** | <25% | 30-45% | 50%+ | Flows: 41% of revenue from 5.3% of sends. If campaigns dominate, flows are broken. |
| **Flow RPR vs campaign RPR** | <10x | 18-25x | 28x+ | March 2026 data: flows $1.58/recipient vs campaigns $0.06. |
| **Welcome open rate** | <35% | 50-65% | 80%+ | Range 51-84%. Top 10% hit 91%. Below 35% = deliverability or list quality issue. |
| **Welcome click rate** | <5% | 10-16% | 20%+ | Flows click 3.3x higher than campaigns overall. |
| **Abandoned cart recovery** | <5% | 10-15% | 18%+ | RPR: avg $3.65, top 10% $28.89. High-AOV stores ($200+): $14.14 RPR. |
| **Abandoned cart open rate** | <30% | 40-50% | 55%+ | Most reliable flow — high intent signal. |
| **Campaign open rate (engaged 30d)** | <30% | 38-45% | 50%+ | Behavior-based segments: 42%. Full list: 21-27%. |
| **Campaign click rate** | <1% | 1.5-2.5% | 4%+ | Avg 1.69% campaigns vs 5.58% flows. Top 10% campaigns: 9.8%. |
| **Unsubscribe rate** | >0.5% | <0.3% | <0.15% | Doubled 2024-25 (0.08%→0.22%) due to Gmail easy-unsub button. |
| **List growth rate** | <1%/mo | 2-3%/mo | 4%+/mo | 25% annually = healthy baseline. Multi-channel capture grows 40% faster. |
| **Deliverability / inbox placement** | <80% | 85-92% | 95%+ | Global avg 83.5%. Gmail 87-95%. Outlook worst at 75.6%. |

**SMS benchmarks:** Flow CTR ~10% (campaigns ~5%). Flow RPR 8x higher than campaigns. Opt-out target: <2%. SMS flows follow same pattern as email — automate first, campaign second.

### Website / Ecommerce

| Metric | Floor | Healthy | Strong | Notes |
|---|---|---|---|---|
| **Overall CVR** | <1.0% | 1.5-3.0% | 3.5%+ | Shopify avg 1.4%. Top 20%: 3.2%. Top 10%: 4.7%. |
| **CVR from email traffic** | <3% | 4-6% | 7%+ | Highest-converting channel at 5.3% avg. |
| **CVR from paid search** | <1.5% | 2-3.5% | 4%+ | Moderate intent. |
| **CVR from paid social** | <0.5% | 0.7-1.2% | 1.5%+ | Lowest-converting. <0.5% = targeting or landing page problem. |
| **Add-to-cart rate** | <4% | 6-8% | 10%+ | Global avg 6.07%. Food/bev 9-13%. Luxury 2-3% (expected). |
| **Cart abandonment rate** | >80% | 70-76% | <65% | Global avg 70-77%. Mobile 80%. Desktop 66%. |
| **Bounce rate (product pages)** | >55% | 30-45% | <25% | Social traffic bounces higher (expected). |
| **Mobile vs desktop CVR gap** | >2.5x | 1.5-2.0x | <1.3x | Desktop typically 1.6-2.1x higher CVR. Gap >2.5x = mobile UX problem. |
| **Returning visitor rate** | <15% | 25-35% | 40%+ | Returning visitors convert 2-3x higher. Below 15% = no retention engine. |

**CVR by AOV tier (directional — limited hard data):** Sub-$50 AOV → expect 2-4% CVR. $50-150 → 1.5-3%. $150-500 → 1-2%. $500+ → 0.5-1.5%. Inverse relationship is structural.

**Cart abandonment top causes (Baymard):** 48% unexpected costs, 21% slow delivery, 19% payment security concerns, 18% complicated checkout.

### Amazon Ads

| Metric | Floor | Healthy | Strong | Notes |
|---|---|---|---|---|
| **SP ACOS** | >45% | 25-35% | <20% | 2025 avg 30.2%. Always compare to break-even ACOS (= margin %). |
| **SP CPC** | >$2.00 | $0.85-1.30 | <$0.70 | 2025 avg $1.12, rising 15% YoY. Q4 spikes 20-30%. |
| **SP CVR (overall)** | <5% | 8-12% | 15%+ | Amazon avg 10-11%. 5-10x higher than DTC sites. Below 5% = listing problem. |
| **TACoS** | >15% | 6-12% | <6% | Excellent: 5-10%. Early-stage can be 10-15%. Above 15% = ad-dependent. |
| **Featured Offer (Buy Box) %** | <50% | 85-95% | 98%+ | Private label should be ~100%. Below 50% = pause ads on that ASIN. |
| **Top-of-search impression share** | <5% | 15-40% | 50%+ | Below 5% = barely visible. Branded terms: target 70-80%+. |
| **Budget utilization** | <50% | 70-90% | 90-100% | Core keywords: 90%+. Discovery: 70-85%. Below 50% = bids too low. |

**Match type CVR hierarchy:** Exact > Phrase > Broad > Auto (expected). If broad outperforms exact, campaign structure needs review.

**2025-26 trend:** CPCs up 15% YoY, projected another 6-15% in 2026. CPM up 47% but CVR improved 10%, so ROAS slightly up to 3.14x. Rising costs being offset by better algorithm targeting.

---

## Diagnostic Signals

**"Where's the problem?" decision tree:**
1. High CTR + low CVR everywhere → Website/landing page problem
2. Low CTR + low CVR → Targeting/creative problem
3. Good metrics on one platform, bad on another → Channel-specific issue (audit that channel)
4. Everything looks fine but revenue is flat → Check frequency/saturation, AOV trends, or attribution gaps
5. ROAS looks good but profit is low → Check blended CPA vs. break-even, account for non-ad costs

**Attribution reality check:** Platform-reported ROAS is always inflated. Cross-check: if Meta says 4x ROAS and Google says 3x ROAS, but Shopify revenue doesn't support both being true, at least one is over-attributing. Use Shopify as source of truth for total revenue, then allocate credit proportionally.

### Profitability & Unit Economics Layer

ROAS tells you if ads are efficient. Contribution margin tells you if the business is profitable. Always run this layer during audits — less than 30% of DTC audits include profitability metrics.

**The CM1/CM2/CM3 framework:**
- **CM1 (Product Margin):** Revenue - COGS
- **CM2 (Fulfillment Margin):** Revenue - COGS - shipping - packaging - pick-pack labor
- **CM3 (Marketing-Inclusive Margin):** Revenue - COGS - shipping - fulfillment - marketing spend - payment processing - returns

CM3 is the only margin that tells you if the business is actually making money. ROAS and gross margin both hide the true cost of acquiring and fulfilling customers.

**Contribution margin benchmarks by vertical:**

| Vertical | Gross Margin | CM3 (Target) | COGS Estimate (if not shared) |
|---|---|---|---|
| Apparel/Fashion | 55-65% | 20-35% | 35-45% of revenue |
| Beauty/Skincare | 60-80% | 25-40% | 25-35% of revenue |
| Food/Consumables | 65-75% | 30-45% | 30-40% of revenue |
| Home Goods | 50-65% | 18-32% | 35-50% of revenue |
| Electronics | 15-30% | 15-25% | 50-70% of revenue |
| Supplements | 70-85% | 30-50% | 15-30% of revenue |

If the client won't share COGS, use the "COGS Estimate" column and flag it as ASSUMPTION. Back into CM3 from there.

**"Good ROAS but bad profit" — the most common DTC wall:**
1. Check return rates — apparel often 25-40% returns, which ROAS doesn't account for
2. Check discount stacking — promo accumulation eroding true transaction margin
3. Check hidden fulfillment costs — shipping, packaging, pick-pack not allocated to margin
4. Check whether CAC is loaded entirely to first purchase vs amortized over LTV
5. Check invisible overhead — agency retainers, creative production, tools not in platform ROAS
6. Calculate MER (Total Revenue / Total Marketing Spend including all costs) — this is the honest number

**CAC Payback Period:**

Formula: `CAC Payback (months) = Fully Loaded CAC / Monthly Contribution Margin per Customer`

Fully Loaded CAC includes: ad spend + creative production + agency fees + attribution tools + platform overhead.

| Payback Period | Rating | Action |
|---|---|---|
| Under 3 months | Excellent | Scale aggressively — cash cycle supports growth |
| 3-6 months | Healthy | Sustainable with adequate cash reserves |
| 6-12 months | Caution | Requires external capital or retention improvements |
| Beyond 12 months | Unsustainable | Fix unit economics before scaling |

**Payback benchmarks by vertical:**

| Vertical | Healthy Payback | Notes |
|---|---|---|
| Consumables (supplements, food, pet) | 4-8 weeks | Natural replenishment cycle helps |
| Beauty/Skincare | 6-12 weeks | Usage frequency drives repeats |
| Apparel/Fashion | 8-16 weeks | Seasonal, new styles drive returns |
| Home Goods | 12-20 weeks | Infrequent replenishment |
| High-Ticket ($500+) | Up to 12 months | Expected — longer consideration cycle |

**Why payback matters more than LTV:CAC for most DTC brands:** A 5:1 LTV:CAC with 24-month payback is cash-negative for 2 years. A 2.5:1 LTV:CAC with 3-month payback is more profitable in practice. DTC margins (20-30%) are much thinner than SaaS (60-90%), so cash timing determines survival more than lifetime projections.

**LTV:CAC Ratio:**

Formula: `LTV:CAC = (AOV × Purchase Frequency/Year × Customer Lifespan Years × Gross Margin %) / Fully Loaded CAC`

| LTV:CAC | Rating | Notes |
|---|---|---|
| Below 2:1 | Unsustainable | Losing money on customer acquisition |
| 2-3:1 | Marginal | Viable only with high volume or improving retention |
| 3-4:1 | Healthy | Standard benchmark for profitable DTC |
| 4-5:1 | Strong | Efficient growth — can afford to invest in brand |
| 5:1+ | Excellent | Either very efficient or under-investing in growth |

Always pair LTV:CAC with payback period. Either metric alone is misleading. Use cohort-based LTV (customers acquired in same month, tracked over 12-18 months) — blended LTV hides retention decay in older cohorts.

**Repeat Purchase Rate benchmarks:**

| Vertical | 12-Month RPR | Notes |
|---|---|---|
| Consumables (supplements, food, pet) | 35-45% | Natural replenishment |
| Beauty/Skincare | 30-40% | Usage frequency |
| Apparel/Fashion | 15-17% | Seasonal, style-driven |
| Home Goods | 18-25% | Infrequent but steady |
| Subscription models | 40-55% | Built-in recurring billing |

Aggregate DTC average: ~18.8% (12-month window). 50.3% of repeat customers repurchase within 30 days. Each 5-point increase in RPR can increase LTV by 15-25%.

**Metrics by business stage:**

| Stage | Primary Metrics | Key Threshold |
|---|---|---|
| Launch (<$500K) | CM per order, blended CAC, AOV | First-purchase profitability is rare — target 60% revenue from returning customers |
| Growth ($500K-$5M) | CAC payback, channel-level CM3, MER, ncROAS | Paid CAC shouldn't exceed blended CAC by more than 25-35% |
| Mature ($5M+) | LTV:CAC, cohort profitability, retention rate | 3:1 LTV:CAC at scale, path to 5:1+ with investment |

**Revenue growing but margin shrinking — diagnosis:**
1. Channel mix shifting toward higher-CAC channels (check channel-level CM3)
2. CAC payback extending (acquisition becoming less efficient month-over-month)
3. Return rates increasing (quality or expectation mismatch)
4. Discount dependency rising (track revenue split by discount tier: full price vs 10% vs 20%+ off)

**Blended CPA rising despite stable channel CPA — diagnosis:**
1. Budget allocation shifting toward higher-cost channels
2. Repeat customer costs rising (loyalty spend, higher email/SMS frequency)
3. New customer quality declining (worse retention or higher return rates in newer cohorts)

**Profitability analysis tools:**
- **Shopify native:** COGS Report (requires cost-per-item entry), Profit Report, Product Profitability Report
- **Lifetimely:** Deep P&L statements, LTV by cohort, discount code profitability, staff/shipping/ad spend allocation
- **Polar Analytics:** Contribution margin, LTV by cohort, COGS tracking, inventory analytics
- **Triple Whale:** Channel-specific ROAS attribution, Creative Cockpit — less strong on advanced cost allocation
- **If no tool:** Build manual CM3 model from Shopify exports + ad platform spend data

## Sources

- Triple Whale 2025 Benchmarks Report (35k brands): https://www.triplewhale.com/benchmarks
- Tinuiti Q4 2025 Digital Ads Benchmark Report: https://tinuiti.com/research/digital-ads-benchmark-report/
- Dynamic Yield Ecommerce Benchmarks: https://www.dynamicyield.com/benchmarks/
- Baymard Institute Cart Abandonment Studies: https://baymard.com/lists/cart-abandonment-rate
- Klaviyo 2026 Email & SMS Benchmarks: https://www.klaviyo.com/marketing-resources/email-marketing-benchmarks
- Jungle Scout State of the Amazon Seller 2025: https://www.junglescout.com/amazon-seller-report/
