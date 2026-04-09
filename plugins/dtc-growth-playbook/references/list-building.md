# List Building & First-Party Data

Last updated: 2026-04-09. Sources: Klaviyo (2025 Benchmarks, CDP documentation), Omnisend (2024-2025 email/SMS benchmarks), Privy (pop-up conversion studies), Octane AI (quiz funnel data), Lifetimely (LTV segmentation), Retina AI (predictive CLV), Justuno (gamified pop-up data), Google (bulk sender requirements Feb 2024), Stroud (co-registration, UTM-matched pop-ups), TCPA (April 2025 updates).

## Core Methodology (Evergreen)

**List growth is a paid media multiplier, not a standalone metric.** Every email/SMS subscriber captured from paid traffic reduces future CAC — you paid to acquire them once, then market to them for free. List building ROI compounds: a 1% improvement in capture rate on $50K/month Meta spend can yield thousands of additional subscribers per year at zero incremental cost.

**Capture rate is a function of relevance, not aggressiveness.** Generic "10% off your first order" pop-ups average ~2% capture. Pop-ups that match the visitor's intent (UTM-matched messaging, product-specific offers, quiz-based personalization) reach 5-12%+. The variable isn't how big the discount is — it's how well the offer mirrors why the visitor arrived.

**Two-step capture outperforms single-step.** Asking for email first, then SMS on the thank-you screen (the "Trojan Horse" method), converts at higher rates than requesting both simultaneously. Email-first feels lower commitment; SMS feels like a natural add-on once they've already opted in.

**Zero-party data is more valuable than third-party data.** Information customers voluntarily share (quiz answers, survey responses, preference selections) is more accurate, more actionable, and privacy-compliant by design. Post-iOS 14, zero-party data is the most reliable personalization input available.

**List hygiene protects deliverability.** A large list with low engagement hurts more than a small list with high engagement. Google's February 2024 bulk sender requirements (SPF, DKIM, DMARC, one-click unsubscribe, <0.1% spam complaint rate) made list hygiene non-negotiable — dirty lists get throttled or blocked entirely.

---

## Current Playbook [Valid Q2 2026 — review July 2026]

### Pop-Up Strategy

**Baseline benchmarks:**
- Industry average pop-up conversion: ~2.1% (Privy, 2024)
- Target minimum: 5% capture rate
- Strong: 8-12% for matched/segmented audiences
- Gamified pop-ups (spin-to-win, scratch-off): 10%+ conversion but lower lead quality — use for list size, not list quality

**UTM-matched pop-ups (Stroud model):**
Custom pop-ups in Klaviyo triggered by traffic source via UTM parameters. The pop-up messaging mirrors the value proposition of the ad that brought them. A visitor from a "saves you 2 hours/week" ad sees a pop-up reinforcing time savings, not a generic discount. Reported +29.5% lift in capture rate vs. generic pop-ups.

**Implementation hierarchy:**
1. **Traffic-source matching** — Different pop-ups for Meta vs. Google vs. organic vs. direct
2. **Campaign-level matching** — Different pop-ups per ad campaign (requires UTM discipline)
3. **Behavioral triggers** — Exit-intent, scroll-depth (50%+), time-on-site (15+ seconds)
4. **Device-specific** — Mobile pop-ups must be non-intrusive (Google penalizes interstitials). Use slide-ups or bottom bars on mobile.

**Pop-up timing rules:**
- Desktop: 5-10 second delay or 50% scroll depth
- Mobile: 15+ second delay or exit-intent only
- Never fire on first page load for returning visitors who already dismissed
- Suppress for 14-30 days after dismissal

### SMS Capture

**Two-step "Trojan Horse" method:**
1. Pop-up asks for email only (lower friction)
2. Thank-you screen or follow-up page asks for SMS (momentum-based opt-in)
3. SMS capture rates from two-step: 30-50% of email opt-ins also give phone number

**TCPA compliance (April 2025 update):**
- Express written consent required for marketing SMS — pre-checked boxes do NOT count
- Must clearly disclose message frequency and data rates
- Separate opt-in for SMS vs. email (can be on same form but must be distinct consent)
- Violations: $500-$1,500 per message. Non-negotiable compliance requirement.

**SMS list growth benchmarks:**
- Healthy SMS list: 20-40% the size of email list
- SMS subscriber value: 2-3x email subscriber value (higher engagement, higher conversion)
- Omnisend benchmark: SMS campaigns generate $71 per $1 spent vs. $36-42 for email

### Quiz Funnels

**Why quizzes work:** They exchange value (personalized recommendation) for data (email + preferences). The opt-in feels like a service, not a marketing capture.

**Benchmarks:**
- Quiz completion rate: 60-80% once started (Octane AI)
- Quiz-to-opt-in rate: 30-50% (Octane AI reports 42% average)
- Quiz-to-purchase rate: 15-25% (Octane AI reports 21.38% for Shopify brands)
- Quiz subscribers have 2-3x higher conversion rates than generic pop-up subscribers

**Quiz implementation:**
- Keep quizzes to 3-5 questions (completion drops sharply after 6)
- Ask email BEFORE showing results (the recommendation is the incentive)
- Use branching logic to segment into Klaviyo profiles automatically
- Best tools: Octane AI (Shopify-native), Typeform (flexible), Digioh

**Best product categories for quizzes:** Skincare/beauty (routine builder), supplements (needs assessment), apparel (style finder), food/beverage (taste profile), home goods (style quiz).

### Co-Registration Partnerships

**Stroud model:** Partner with influencers or complementary brands for lead capture on their blogs/sites. Co-brand the pop-up, add leads to a customized nurture flow. Reported capture rates: 11-16%.

**How to structure:**
- Partner provides the audience; you provide the offer/incentive
- Co-branded landing page or embedded pop-up on partner's site
- Leads enter a dedicated nurture flow (NOT your main welcome series) that references the partnership
- Tag all co-reg leads in Klaviyo for attribution tracking

### First-Party & Zero-Party Data Enrichment

**Zero-party data collection methods:**

| Method | Expected Response Rate | Data Quality | Best For |
|---|---|---|---|
| Post-purchase survey ("What brought you here?") | 8-15% | High | Attribution, VP discovery |
| Product quiz (pre-purchase) | 30-50% opt-in | Very high | Personalization, segmentation |
| Preference center (email settings page) | 5-10% of list engages | Medium-high | Frequency/content preferences |
| On-site polls (1-question embedded) | 10-20% | Medium | Quick directional data |

**High-value survey questions:**
- "What almost stopped you from buying?" → Reveals objections for ad copy
- "What convinced you to purchase?" → Reveals winning VP for MAT testing
- "How did you first hear about us?" → Attribution data that bypasses iOS limitations

**CLV-based segmentation:**
Segment customers by predicted lifetime value, not just engagement or recency. High-CLV customers get priority messaging, exclusive offers, and higher-touch flows.

- **Lifetimely** (Shopify app, free-$299/mo): Predictive LTV scoring, behavioral cohorts. Brands using LTV segmentation report ~12% higher customer lifetime value.
- **Retina AI**: Predictive CLV modeling. Case studies show +44% CLV improvement when used for segmentation decisions.
- **Klaviyo CDP** ($500+/mo): Built-in predictive analytics including expected CLV, churn risk, and next purchase date. Most powerful but requires Klaviyo Plus tier.

**Event-based behavioral profiles:**
Track these events in Klaviyo for behavioral segmentation:
- Browse behavior (viewed product X times without purchase)
- Add-to-cart abandonment (carted but didn't buy)
- Purchase frequency and recency
- Return/refund events (flag serial returners)
- Email/SMS engagement (opens, clicks, replies)

### List Hygiene & Deliverability

**Google bulk sender requirements (February 2024, still enforced):**
- SPF, DKIM, and DMARC authentication required for domains sending 5,000+ emails/day
- One-click unsubscribe header required
- Spam complaint rate must stay below 0.1% (monitored via Google Postmaster Tools)
- Non-compliance = emails throttled or blocked entirely

**Sunset policy:**
- 90-day engaged segment: Primary sending audience for campaigns
- 90-180 day unengaged: Reduced frequency, re-engagement flow, then suppress
- 180+ day unengaged: Suppress from all campaigns. Run one final win-back, then remove.
- Never send campaigns to 180+ day unengaged profiles — it tanks deliverability for your entire list

**List growth rate benchmarks:**
- Healthy: 2-5% net monthly growth (after unsubscribes and suppressions)
- Strong: 5-10% monthly (usually indicates effective paid acquisition + good capture)
- Declining list: If unsubscribe + bounce rate exceeds new subscriber rate for 2+ months, diagnose immediately

### Identity Resolution & Server-Side Tracking

**Why it matters for list building:** Browser-based tracking misses 30-40% of site visitors due to ad blockers and iOS privacy. Server-side tracking (CAPI) recovers identified visitors that would otherwise be anonymous — more identified visitors = more pop-up trigger opportunities.

**Approach:**
- Implement CAPI as baseline (see measurement.md for setup details)
- Use deterministic matching (email, phone) as primary identifier
- Probabilistic matching (device fingerprint, IP clusters) as supplemental — accuracy varies, use with caution
- Klaviyo's built-in identity resolution connects on-site behavior to known profiles automatically when cookies exist

---

## Diagnostic Signals

- **Pop-up capture rate below 2%** → Pop-up is too generic or firing too early. Check: Is messaging matched to traffic source? Is timing appropriate (not instant-fire)? Is the offer compelling for cold traffic?
- **High email capture but low SMS opt-in** → Two-step flow may be broken, or SMS value prop isn't clear. Check: Is the SMS ask on the thank-you screen? Does it explain what they'll get via text?
- **List growing but email revenue flat** → Capturing low-intent subscribers. Check: Are you using gamified pop-ups (high volume, low quality)? Is the welcome flow converting? Segment new subscribers by capture method and compare conversion rates.
- **High unsubscribe rate (>0.5% per campaign)** → Sending too frequently or content isn't relevant. Check: Campaign frequency, segmentation quality, and whether you're sending to unengaged profiles.
- **Spam complaints above 0.1%** → Deliverability emergency. Immediately: check Google Postmaster Tools, suppress unengaged segments, verify authentication (SPF/DKIM/DMARC), review last 5 campaigns for content issues.
- **Quiz completion high but opt-in low** → Email gate may be placed after results instead of before. Move the email capture to before the recommendation reveal.
- **Co-reg leads don't convert** → Nurture flow isn't contextualized. These leads need a flow that references the partnership and bridges to your brand — not a generic welcome series.

## Sources

- Klaviyo 2025 Email Benchmarks: https://www.klaviyo.com/marketing-resources/email-benchmark-report
- Omnisend 2024-2025 Email/SMS Statistics: https://www.omnisend.com/blog/email-marketing-statistics/
- Privy Pop-Up Conversion Data: https://www.privy.com/blog/popup-conversion-rate
- Octane AI Quiz Funnel Benchmarks: https://www.octaneai.com/
- Lifetimely LTV Segmentation: https://lifetimely.io/
- Retina AI Predictive CLV: https://retina.ai/
- Justuno Gamified Pop-Up Data: https://www.justuno.com/
- Google Bulk Sender Requirements: https://support.google.com/a/answer/81126
- TCPA April 2025 Updates: https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts
- Klaviyo CDP Documentation: https://www.klaviyo.com/product/cdp
