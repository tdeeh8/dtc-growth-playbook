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

## Sources

- Triple Whale 2025 Benchmarks Report (35k brands): https://www.triplewhale.com/benchmarks
- Tinuiti Q4 2025 Digital Ads Benchmark Report: https://tinuiti.com/research/digital-ads-benchmark-report/
- Dynamic Yield Ecommerce Benchmarks: https://www.dynamicyield.com/benchmarks/
- Baymard Institute Cart Abandonment Studies: https://baymard.com/lists/cart-abandonment-rate
- Klaviyo 2026 Email & SMS Benchmarks: https://www.klaviyo.com/marketing-resources/email-marketing-benchmarks
- Jungle Scout State of the Amazon Seller 2025: https://www.junglescout.com/amazon-seller-report/
