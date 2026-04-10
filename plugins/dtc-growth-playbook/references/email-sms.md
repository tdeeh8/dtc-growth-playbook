# Email and SMS Strategy

Last updated: 2026-04-09. Sources: Klaviyo (2026 Benchmarks, 183k accounts), Omnisend (2025 abandoned cart study, SMS statistics), Attentive (BFCM frequency study 2025), TopGrowthMarketing (DTC email best practices), Mailgun (BFCM 2025 breakdown, sunset policy guide), Opensend (unsubscribe/complaint benchmarks), AskNeedle (frequency segmentation), Sakari (SMS benchmarks 2025), Raleon (DTC email frequency guide).

## Core Methodology (Evergreen)

**Flows generate disproportionate revenue.** Automated flows drive ~41% of total email revenue from just 5.3% of sends. Flow RPR is ~18x higher than campaign RPR. Always optimize flows before increasing campaign frequency — the leverage is incomparably higher.

**Segment by engagement, not demographics.** Sending the same email to your entire list is the fastest way to destroy deliverability. Engagement-based segmentation (30/60/90-day activity windows) determines frequency tolerance, content type, and suppression timing. Properly segmented campaigns produce 3x higher revenue per recipient, 1.63x higher open rates, and 2.16x higher click rates.

**Email and SMS are complementary channels, not competing ones.** SMS has ~95% open rates but is expensive per-send and high-friction for unsubscribes. Email has lower open rates but supports longer content and is cheaper at scale. Use SMS for time-sensitive, high-value triggers (cart abandonment, flash sales, back-in-stock). Use email for education, nurture, and storytelling.

**Revenue attribution target: email should drive 20-30% of total DTC revenue.** Below 20% means the program is underbuilt (missing flows, low frequency, poor capture). Above 30% may indicate over-reliance on discounting or attribution inflation. Cross-check with Shopify revenue.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### Flow Benchmarks (Klaviyo, 2026)

| Flow | RPR | Open Rate | Conversion Rate | Notes |
|---|---|---|---|---|
| Welcome series | $2.65 | 45-50% | 8-12% | 48% of flow revenue from new buyers |
| Cart abandonment | $3.65 | 35-41% | 10-15% | Highest recovery ROI |
| Browse abandonment | $1.07 | 30-35% | 3-5% | Lower intent — content-driven, not offer-driven |
| Post-purchase | $0.41 | 55-62% | 0.5-1% | Highest open rate of any flow; optimize for cross-sell and review capture, not immediate revenue |
| Win-back | Varies | 25-35% | 2-4% | Re-engagement before suppression |

**Top 10% flows achieve $7.79+ RPR.** The gap between median and top-decile is enormous — most programs have significant flow optimization headroom.

**Flow vs. campaign revenue split:** Target 50/50 between flow and campaign revenue. If flows are below 40% of email revenue, flows are underbuilt. If flows are above 70%, campaigns are being neglected (missing seasonal opportunities, product launches, content).

### Core Flows (Priority Order)

1. **Welcome series** — 48% of flow revenue from new buyers. 3-5 emails over 7-14 days. Email 1: deliver the offer/incentive promised in the pop-up. Email 2: brand story + VP. Email 3: social proof / bestsellers. Email 4-5: education or category introduction. See list-building.md for capture strategy that feeds this flow.
2. **Cart abandonment** — Highest recovery ROI. Timing matters:
   - Email 1: 30 minutes to 1 hour (sending within 1 hour boosts conversions 20%)
   - Email 2: 18-24 hours later
   - Email 3: 48 hours (optional — only if first two don't recover)
   - Most brands send 1-2 emails; extending to 3 shows diminishing returns in standard DTC. For high-ticket ($200+ AOV), see high-ticket.md for extended cart sequences.
3. **Browse abandonment** — 30-35% open rates, 3-5% conversion. Content-driven, not discount-driven. Surface relevant product details the visitor hasn't seen. Trigger after 2+ product views without add-to-cart.
4. **Post-purchase / cross-sell** — Reduces returns, increases LTV. Timing: order confirmation immediately, shipping update, delivery follow-up (day 3-5 post-delivery), review request (day 7-14), cross-sell (day 14-21). Space it out — over-contact in post-purchase damages brand perception.
5. **Win-back** — Re-engage lapsed customers before suppressing. 2-3 emails over 30 days. If no engagement after the win-back sequence, suppress from marketing sends.

### Campaign Strategy

**Campaign RPR benchmark:** Average $0.10. Top 10% achieve $0.25+. Campaigns are lower RPR by nature — they go to broader audiences. Judge campaign health by RPR trend over time, not absolute value.

**Content mix:** Alternate between value content (education, behind-the-scenes, UGC) and promotional content. Pure promotional cadences burn engagement faster. The ratio depends on brand stage — newer brands can be more promotional; established brands need more content.

**AI product recommendations:** Emails with AI-recommended products see 3.75% click rate lift on average; top 10% see 8.79%. Only ~20% of Klaviyo accounts use this feature — it's a quick win for most programs.

### SMS Benchmarks

| Metric | Benchmark | Notes |
|---|---|---|
| Open rate | 90-98% | Near-universal — the channel's core advantage |
| Flow click rate | ~10% (top 10%: 16%+) | Nearly double campaign click rate |
| Flow RPR | 8x campaign RPR | Top 10% flows: $5+ RPR |
| SMS flow revenue share | 45.2% of SMS revenue from 7.6% of sends | Same flow-leverage dynamic as email |
| SMS ROI | $21-71 per $1 spent | Wide range; depends on list quality and frequency |

**New buyer acquisition:** 64.4% of SMS flow revenue comes from new buyers vs. 20% from campaigns. SMS flows are disproportionately valuable for first-purchase conversion.

**SMS use cases (high-value triggers only):**
- Cart abandonment (highest SMS conversion)
- Flash sales / limited inventory
- Back-in-stock notifications
- Shipping and delivery updates
- VIP early access

**Do not use SMS for:** Regular newsletters, educational content, weekly promotions, or anything that doesn't require immediacy. SMS tolerance is low — overuse drives opt-outs fast.

### Segment-Based Frequency

| Segment | Definition | Email Frequency | SMS Frequency |
|---|---|---|---|
| VIP / highly engaged | Opened or clicked in last 30 days | 3-4x/week | 2-4x/month |
| Engaged | Opened or clicked in last 60 days | 2-3x/week | 1-2x/month |
| Semi-engaged | Opened or clicked in 60-90 days | 1x/week | 1x/month max |
| Disengaged | No activity in 90+ days | Win-back flow only, then suppress | Do not SMS |

**Frequency guardrails:**
- Spam complaint rate must stay below 0.3% (hard limit — above this triggers delivery restrictions from Gmail/Yahoo). Target below 0.1%.
- Unsubscribe rate: 0.20-0.30% is normal for ecommerce. Above 1.5% = frequency too high or content mismatch.
- Bounce rate: target below 1%.

### Seasonal / BFCM Frequency

**Ramp strategy (critical):** Gradual volume buildup produces 22% higher ROI than sudden spikes. Brands that dramatically increase volume without ramp see 22% lower ROI due to deliverability throttling.

**Volume increase guidelines:**
- Large senders (1M+/day): increase by 5% per day
- Smaller senders (~100K/day): increase by 10% per day
- Start ramp 2-3 weeks before BFCM
- SMS: recommend 3x normal weekly volume during peak

**Peak frequency by segment:**
- Engaged (opened/clicked last 30 days): up to 3x/day for short bursts (BFCM week only)
- Semi-engaged (60-90 days): 1x/day max during peak
- Disengaged (90+ days): exclude from high-frequency sends. Run a re-engagement flow instead.

**Recovery:** After a high-frequency push (BFCM, major launch), pause campaigns for 3-5 days. Resume at normal cadence. Monitor unsubscribe and complaint rates in the 7 days following peak — spikes indicate you pushed too hard.

**2025 BFCM reference data (Mailgun):** Email volume +30% YoY during BFCM week. Open rates dipped to 18.3% (vs. 21.5% annual average), but CTR rose to 3.8% (vs. 2.6% annual) and conversion hit 6.4% (2x the 3.2% annual average). Lower opens + higher conversion = buyers are self-selecting, which is healthy.

### Nurture Series — 60% Cohort Rule (Stroud)

Set nurture length to match the time for 60% of the cohort to convert. If 60% of first-time buyers convert within 15 days of signup, the nurture series should run 21-30 days. For high-ticket ($200+ AOV): 45-90 days. See high-ticket.md for curriculum-style nurture sequences specific to high-AOV products.

**Content structure:** Use winning VP from MAT testing as the backbone (see mat-testing.md). Mix education, social proof, and offers. SMS as reinforcement on key emails, not parallel sends. Storytelling sequences outperform pitch sequences.

### Predictive Analytics & AI Features (Klaviyo)

**Predictive CLV segmentation:**
- Requires: 500+ customers, 180+ days of order history, some customers with 3+ orders
- 365-day forward-looking prediction window, model retrains weekly
- Impact: 18-45% higher RPR vs. traditional demographic segmentation
- Churn risk segmentation: 12-18% higher recovery on at-risk customers vs. time-based win-back

**AI send-time optimization:** 14% open rate lift reported (case study: Swirl Wine). Available to all Klaviyo accounts.

**Only ~20% of Klaviyo accounts use predictive features.** This is a consistent low-effort, high-impact recommendation for any audit.

### Suppression & Deliverability

**Authentication requirements (2025+):** SPF, DKIM, DMARC required by Gmail, Yahoo, and Outlook for high-volume senders. Non-negotiable — verify before anything else.

**Sunset policy:**
- 90-180 days without opens or clicks = suppress from marketing sends
- Alternative threshold: 10-15 sends without engagement
- Before suppressing: run 2-3 re-engagement emails as final attempt
- Then suppress (don't delete — suppress). They can re-engage via flows if they return.

**Complaint rate management:** Target below 0.1% (1 complaint per 1,000 emails). Industry average is 0.03%. Above 0.3% = immediate corrective action required (reduce frequency, tighten segmentation, audit content).

---

## Diagnostic Signals

- **Flow revenue below 40% of total email revenue** → Flows are underbuilt. Audit: are all 5 core flows live? Check RPR against benchmarks above. Most common gap: missing browse abandonment or weak post-purchase flow.
- **Campaign RPR below $0.05** → Content or segmentation problem. Check: are you sending to disengaged segments? Is content mix too promotional? Is list hygiene current?
- **Welcome series open rate below 40%** → Deliverability issue or capture quality problem. Check: is SPF/DKIM/DMARC configured? Are pop-up subscribers actually consenting (no pre-checked boxes)? Check list-building.md for capture quality signals.
- **Cart abandonment conversion below 8%** → Timing or offer problem. Check: is first email going out within 1 hour? Is the email rendering properly on mobile? Is there a clear CTA back to cart? For high-ticket, lower rates are expected — check high-ticket.md benchmarks.
- **Unsubscribe rate above 0.5% on regular campaigns** → Frequency too high or content mismatch. Reduce frequency for semi-engaged segment first. If rate persists, audit content relevance.
- **Spam complaint rate above 0.1%** → Red flag. Immediate action: tighten segmentation, suppress disengaged profiles, verify unsubscribe link works in all email clients. Above 0.3% = delivery restrictions imminent.
- **SMS opt-out rate spiking** → Sending too frequently or sending non-urgent content via SMS. Pull back to high-value triggers only. Check if SMS is duplicating email content.
- **Email driving less than 15% of total revenue** → Program is underbuilt or underutilized. Check: list size relative to monthly site traffic, flow coverage, campaign frequency. Often co-occurs with weak list building — check list-building.md.
- **Predictive CLV not enabled despite meeting requirements** → Quick win. Flag in every audit where the account qualifies (500+ customers, 180+ days history). Expected 18-45% RPR improvement.

## Sources

- Klaviyo 2026 Email Benchmarks: https://www.klaviyo.com/products/email-marketing/benchmarks
- Klaviyo 2026 SMS Benchmarks: https://www.klaviyo.com/products/sms-marketing/benchmarks
- Klaviyo Flow Benchmarks: https://help.klaviyo.com/hc/en-us/articles/360033669452
- Klaviyo Predictive Analytics: https://help.klaviyo.com/hc/en-us/articles/360020919731
- Klaviyo Predicted CLV Documentation: https://help.klaviyo.com/hc/en-us/articles/17797865070235
- TopGrowthMarketing DTC Email Best Practices: https://topgrowthmarketing.com/email-marketing-best-practices-dtc-brands/
- TopGrowthMarketing Klaviyo Segmentation Strategies: https://topgrowthmarketing.com/klaviyo-segmentation-strategies-ecommerce/
- Omnisend Abandoned Cart Best Practices: https://www.omnisend.com/blog/abandoned-cart-emails-best-practices/
- Omnisend SMS Marketing Statistics: https://www.omnisend.com/blog/sms-marketing-statistics/
- Omnisend Unsubscribe Rate Benchmarks: https://www.omnisend.com/blog/unsubscribe-rate/
- Attentive BFCM Frequency Guide 2025: https://www.attentive.com/black-friday-cyber-monday-2025/bfcm25-resources/frequency
- Mailgun BFCM 2025 Breakdown: https://www.mailgun.com/blog/email/bfcm-2025-breakdown-the-email-trends-of-the-biggest-holiday-send-season-to-date/
- Mailgun Sunset Policy Guide: https://www.mailgun.com/blog/deliverability/sunset-policies-unengaged-recipients/
- Opensend Unsubscribe Rate Statistics: https://www.opensend.com/post/email-unsubscribe-rate-statistics-ecommerce
- Mailmend Spam Complaint Statistics: https://mailmend.io/blogs/spam-complaint-statistics
- AskNeedle Email Frequency Best Practices: https://www.askneedle.com/blog/email-marketing-frequency-best-practices
- Sakari SMS Benchmarks 2025: https://sakari.io/blog/sms-marketing-benchmarks-2025-performance-metrics-and-insights/
- Raleon DTC Email Frequency Guide: https://raleon.io/blog/how-many-dtc-marketing-emails-should-you-send-per-month-find-your-optimal-email-frequency
