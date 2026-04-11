# Klaviyo Flow Audit Checklist

Standard checklist for auditing email/SMS flows. Used by klaviyo-audit-v2 during Phase 2 (Flow Performance Analysis). Every ecommerce account should have the critical flows below. Missing or underperforming flows are the highest-leverage fix in most Klaviyo audits.

---

## Critical Flows (Must Have)

These six flows are non-negotiable for any ecommerce store. A missing critical flow is flagged as a CRITICAL or HIGH priority finding.

### 1. Welcome Series

**Trigger:** Profile added to main email list (signup form, popup, checkout opt-in)
**Why critical:** First impression. Highest open rates of any flow (51-84%). Sets expectations, drives first purchase.

**Structure checklist:**
- [ ] Minimum 3-4 emails in sequence
- [ ] Email 1: Immediate (within minutes) — brand intro + welcome offer (if applicable)
- [ ] Email 2: 1-2 days later — brand story, social proof, bestsellers
- [ ] Email 3: 3-4 days later — educational content, product benefits, use cases
- [ ] Email 4: 5-7 days later — urgency/offer reminder (if offer in email 1), testimonials
- [ ] Conditional split: separate path for subscribers who purchase before completing the series
- [ ] SMS message included (if SMS enabled) — typically as email 1 companion or a standalone early in sequence

**Performance benchmarks:**
- Open rate: Floor <35%, Healthy 50-65%, Strong 80%+ (top 10% hit 91%)
- Click rate: Floor <5%, Healthy 10-16%, Strong 20%+
- Revenue: should be a meaningful contributor — if $0, check offer structure or targeting

**Common issues:**
- Single email only (huge missed opportunity)
- No welcome offer despite having one on the popup
- Delay before first email >1 hour (should be immediate)
- No conditional split for converters (they keep getting "buy now" messages after purchasing)
- Generic content — no brand personality

### 2. Abandoned Cart

**Trigger:** Started Checkout event (or Added to Cart, depending on setup) without completing purchase
**Why critical:** Highest-intent automation. Recovers revenue directly. RPR benchmark: avg $3.65, top 10% $28.89.

**Structure checklist:**
- [ ] Minimum 2-3 emails in sequence
- [ ] Email 1: 1-4 hours after abandonment — reminder with cart contents, no discount yet
- [ ] Email 2: 24 hours later — social proof, address objections (shipping, returns, guarantees)
- [ ] Email 3: 48-72 hours later — urgency or incentive (discount, free shipping)
- [ ] Dynamic cart contents block showing abandoned items with images and prices
- [ ] Conditional split: skip discount email for VIP/high-intent segments (they'll buy without it)
- [ ] SMS message: 30-60 minutes after abandonment (if SMS enabled) — plain text, conversational
- [ ] Filter: exclude profiles who have already purchased since the trigger event

**Performance benchmarks:**
- Open rate: Floor <30%, Healthy 40-50%, Strong 55%+
- RPR: Avg $3.65, High-AOV ($200+) stores: $14.14 RPR
- Recovery rate: Floor <5%, Healthy 10-15%, Strong 18%+

**Common issues:**
- Only 1 email (should be 2-3 minimum)
- First email delay too long (>4 hours loses urgency)
- Discount offered in first email (trains customers to abandon for a deal)
- No dynamic cart contents (generic "you left something behind" without showing what)
- No filter for completed purchases (keeps emailing after they bought)
- Cart link doesn't actually restore the cart

### 3. Browse Abandonment

**Trigger:** Viewed Product event without adding to cart (within a time window, typically 1-2 hours)
**Why critical:** Captures mid-funnel interest. Lower intent than cart abandoners but much larger audience.

**Structure checklist:**
- [ ] Minimum 2 emails in sequence
- [ ] Email 1: 2-4 hours after browse — show viewed product(s), related products, social proof
- [ ] Email 2: 24 hours later — alternative products, category highlights, user reviews
- [ ] Dynamic product block showing browsed items
- [ ] Filter: exclude profiles who added to cart or purchased (they're in higher-intent flows)
- [ ] Filter: frequency cap — don't trigger more than once per 3-7 days per profile
- [ ] SMS optional but effective — 1 message, conversational tone

**Performance benchmarks:**
- Open rate: typically 30-45%
- Click rate: typically 3-8%
- RPR: lower than abandoned cart but significant at scale

**Common issues:**
- Triggers too aggressively (every page view → email fatigue)
- No frequency cap (same person gets browse emails daily)
- No exclusion for cart abandoners / purchasers
- Shows products that are out of stock
- Generic content — doesn't show the actual browsed products

### 4. Post-Purchase

**Trigger:** Placed Order event (or Fulfilled Order for physical products)
**Why critical:** Drives repeat purchases, reviews, referrals. Builds LTV. Each 5-point increase in repeat purchase rate can increase LTV by 15-25%.

**Structure checklist:**
- [ ] Minimum 3-5 emails in sequence
- [ ] Email 1: Immediate — order confirmation + thank you (brand voice, not just transactional)
- [ ] Email 2: Shipping notification (may be handled by Shopify — check for duplication)
- [ ] Email 3: Delivery + 2-5 days — usage tips, how-to content, care instructions
- [ ] Email 4: 7-14 days post-delivery — review/feedback request (product review, NPS)
- [ ] Email 5: 21-30 days — cross-sell/upsell based on what they bought, or replenishment reminder
- [ ] Conditional split: first-time buyers vs repeat customers (different messaging)
- [ ] Conditional split: by product category (tailored content/cross-sells)
- [ ] SMS: delivery confirmation + review request work well via SMS

**Performance benchmarks:**
- Open rate: typically 50-70% (customers want post-purchase updates)
- Click rate: 5-15% (high engagement with relevant content)
- Review conversion: 5-15% of recipients leave a review

**Common issues:**
- Only order/shipping confirmation (no relationship building)
- Review request sent too early (before product arrives)
- No cross-sell/upsell component
- Duplicates Shopify transactional emails (customer gets two confirmations)
- Same flow for first-time and repeat buyers
- No product-specific content (generic "thanks for your order")

### 5. Winback / Re-engagement

**Trigger:** Time since last purchase or last engagement exceeds threshold (typically 60-120 days since last purchase, or 90-180 days since last email engagement)
**Why critical:** Reactivates lapsed customers before they churn. Cheaper to re-engage than acquire new.

**Structure checklist:**
- [ ] Minimum 2-3 emails in sequence
- [ ] Email 1: 60-90 days since last purchase — "We miss you" + new arrivals or bestsellers
- [ ] Email 2: 90-120 days — stronger incentive (exclusive discount, free shipping)
- [ ] Email 3: 120-150 days — last chance / final offer before reducing send frequency
- [ ] Conditional split: by customer value (VIP gets better offers)
- [ ] Conditional split: exit flow if customer re-engages (opens, clicks, or purchases)
- [ ] SMS: one winback SMS can be highly effective — personal, direct tone

**Performance benchmarks:**
- Open rate: typically 20-35% (lower because audience is disengaged)
- Recovery rate: 5-12% of lapsed customers make another purchase
- RPR: varies widely but even modest recovery has high ROI

**Common issues:**
- Doesn't exist (most common — many accounts skip winback entirely)
- Trigger threshold too short (30 days → customers who are still active get "we miss you")
- Trigger threshold too long (365 days → customers are already gone)
- No escalating incentive structure (same generic email repeated)
- No exit condition (keeps emailing people who re-engaged)

### 6. Sunset / Suppression

**Trigger:** No email opens/clicks for 120-180+ days (engagement-based, not purchase-based)
**Why critical:** Protects deliverability. Sending to unengaged profiles damages inbox placement for the entire account.

**Structure checklist:**
- [ ] Email 1: 120-150 days unengaged — "Still interested?" with clear CTA to stay subscribed
- [ ] Email 2: 150-180 days — "Last email" warning — explicit opt-in to continue receiving
- [ ] After flow completes with no engagement: suppress profile or move to drastically reduced frequency
- [ ] Subject lines designed to provoke opens ("Should we stop emailing you?", "Your subscription is ending")
- [ ] Clear, easy one-click opt-in to stay on the list

**Performance benchmarks:**
- Open rate: 10-25% (low by design — this targets the unengaged)
- Re-engagement rate: 3-8% of sunset recipients re-engage
- The real metric: deliverability improvement across the rest of the list after suppressing non-responders

**Common issues:**
- Doesn't exist (most common — accounts just accumulate dead weight on their list)
- Exists but doesn't actually suppress anyone (flow runs, then nothing happens)
- Too aggressive (starts at 30-60 days — suppresses active shoppers who just don't open emails)
- No final suppression action — just sends the emails and hopes for the best

---

## Recommended Flows (Should Have)

These aren't critical but represent meaningful revenue opportunities. Flag as MEDIUM priority if missing.

### 7. Price Drop / Back in Stock

**Trigger:** Product price decreased (price drop) or product back in stock after being out of stock
**Structure:** 1-2 emails, immediate notification
**Why valuable:** High intent — these customers already expressed interest

### 8. Birthday / Anniversary

**Trigger:** Profile property — birthday date (if collected)
**Structure:** 1-2 emails around the birthday (day of + reminder a few days before)
**Why valuable:** Personal touch, high open rates, drives incremental purchases

### 9. VIP / Loyalty

**Trigger:** Customer reaches spending/order threshold (e.g., 3rd purchase, $500 total spend)
**Structure:** 1-2 emails — exclusive offer, early access, loyalty program invite
**Why valuable:** Rewards best customers, increases retention and LTV

### 10. Cross-Sell / Replenishment

**Trigger:** Time-based after purchase of consumable or complementary products
**Structure:** 1-2 emails timed to when product would be running out or when complementary items are relevant
**Why valuable:** Drives repeat purchases predictably. Especially strong for consumables (supplements, food, beauty).

### 11. Review Request (Standalone)

**Trigger:** X days after delivery confirmation
**Structure:** 1-2 emails — direct review request with link to review platform
**Note:** Often part of post-purchase flow. Standalone version useful if post-purchase flow handles other things.

---

## Flow Audit Scoring Matrix

Use this matrix to quickly assess each flow during the audit:

| Dimension | Score 0 (Missing) | Score 1 (Exists, Weak) | Score 2 (Functional) | Score 3 (Optimized) |
|---|---|---|---|---|
| **Exists** | Flow doesn't exist | Draft/disabled | Live, basic | Live, tested |
| **Message count** | 0 | 1 email only | 2-3 emails | 4+ with branching |
| **Timing** | N/A | Poor delays | Reasonable | Optimized for intent level |
| **Content quality** | N/A | Generic/template | Brand voice, basic | Personalized, dynamic blocks |
| **Segmentation** | N/A | None | 1 split | Multiple splits (engagement, value, product) |
| **SMS inclusion** | N/A | No SMS | SMS exists but basic | SMS timed and complementary to email |
| **Performance** | N/A | Below floor | Healthy range | Above strong threshold |

**Scoring guide:**
- 0-6 total across critical flows = CRITICAL — email program fundamentally broken
- 7-12 = needs significant work, major revenue left on the table
- 13-15 = functional but room for optimization
- 16-18 = strong program, focus on testing and incremental gains

---

## Flow Timing Reference

Optimal timing between messages based on intent level:

| Flow | Message 1 | Message 2 | Message 3 | Message 4+ |
|---|---|---|---|---|
| Welcome | Immediate | +1-2 days | +3-4 days | +5-7 days |
| Abandoned Cart | +1-4 hours | +24 hours | +48-72 hours | — |
| Browse Abandon | +2-4 hours | +24 hours | — | — |
| Post-Purchase | Immediate | Delivery +2-5d | Delivery +7-14d | Delivery +21-30d |
| Winback | +60-90 days | +90-120 days | +120-150 days | — |
| Sunset | +120-150 days | +150-180 days | Then suppress | — |

**Timing red flags:**
- Abandoned cart email 1 sent after >6 hours (urgency lost)
- Welcome email 1 delayed >1 hour (should be near-instant)
- Post-purchase review request sent before product could have arrived
- Browse abandon triggering within minutes (feels creepy/intrusive)
- Winback starting before 45 days (too early — customer may still be active)

---

## Integration Health Checks

While auditing flows, also check these integration items:

### Shopify-Klaviyo Sync
- [ ] Placed Order events flowing from Shopify to Klaviyo (check Events tab)
- [ ] Started Checkout events present (needed for abandoned cart flow)
- [ ] Viewed Product events present (needed for browse abandonment flow)
- [ ] Product catalog synced (needed for dynamic product blocks)
- [ ] Customer profiles syncing (addresses, order history, LTV)

### Form Integration
- [ ] Signup forms active and submitting to correct list
- [ ] Popup form has SMS consent option (if SMS enabled)
- [ ] Form submissions trigger welcome flow correctly
- [ ] No duplicate signups from multiple forms/sources

### Revenue Attribution
- [ ] Placed Order metric exists in Klaviyo
- [ ] Revenue is attributed to flows and campaigns (not $0 across the board)
- [ ] Attribution window is reasonable (default 5-day click, 24-hour open for email)
- [ ] No double-counting between Klaviyo and other platforms

If any of these are broken, flag in `tracking_health` section of the evidence file with appropriate severity.
