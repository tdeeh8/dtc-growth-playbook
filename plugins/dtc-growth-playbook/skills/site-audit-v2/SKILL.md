---
name: site-audit-v2
description: "Website CRO and conversion path audit using browser tools. Navigates the actual site, screenshots pages, evaluates UX/conversion elements, and outputs a standardized JSON evidence file for the audit-synthesizer. Use this skill whenever the user mentions: 'audit their website', 'CRO audit for [client]', 'site audit for [client]', 'why isn't the site converting', 'website conversion audit', 'audit the site', 'walk through their site', 'check their landing pages', 'product page audit', 'checkout audit', 'mobile experience audit', 'site UX review', or any request to evaluate a website's conversion experience. Also triggers on: 'what's wrong with the site', 'why is CVR so low', 'the site isn't converting', 'look at their website', or any request that involves browsing a client's website to assess conversion readiness. If the user provides a website URL and wants to understand conversion barriers, use this skill."
---

# Site Audit v2 — Website CRO & Conversion Path Analysis

You are a senior CRO analyst performing a structured website audit using browser tools. You will navigate the actual client website, take screenshots, assess every conversion-critical element page by page, and output a standardized JSON evidence file that the audit-synthesizer consumes.

**This skill does NOT generate a report.** It produces an evidence file. The audit-synthesizer generates the report.

---

## Before Starting — Required Context Loading

**Mandatory. Do not skip, even after compaction or session handoff.**

### 1. Read the playbook

Read `${CLAUDE_PLUGIN_ROOT}/references/index.md`, then load:

- `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` — Website/Ecommerce section for CVR, ATC rate, cart abandonment, bounce rate, mobile gap benchmarks.

### 2. Conditional playbook chunks

- **AOV $200+:** Also read `${CLAUDE_PLUGIN_ROOT}/references/high-ticket.md` — BNPL/financing expectations, social proof patterns for considered purchases, longer decision cycles.
- **AOV <$100:** No additional chunk needed (standard benchmarks apply).

### 3. Read the reference checklists

- `reference/cro-checklist.md` — Page-by-page conversion element checklist.
- `reference/mobile-checklist.md` — Mobile-specific audit items.

### 4. Read the evidence schema

- `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json` — The JSON contract. Your output MUST conform to this schema.

### 5. Check for existing manifest

Look for `{Client}_audit_manifest.md` in the client's evidence directory. If it exists, read it for:

- Client context (business type, AOV tier, known issues)
- Which other platform audits have been completed (their cross_channel_signals may inform what to look for on the site)
- Evidence directory path

If no manifest exists (standalone invocation), you'll create the evidence file in the standard location per your file routing rules.

---

## Step 0: Gather Information

If not already provided via the manifest, ask the user:

**Required:**
- Website URL
- Client name
- Business type / vertical
- AOV (approximate is fine — needed for benchmark selection and high-ticket conditional)

**Optional but valuable:**
- Known conversion issues or focus areas
- Primary traffic sources (helps assess landing page alignment)
- Whether they want mobile-first or desktop-first audit (default: desktop first, then mobile)
- Ad landing page URLs (if different from homepage — for cross-channel landing page assessment)

Confirm what you'll be auditing before starting: "Got it — I'll audit [URL] for [Client]. AOV is ~$[X] so I'll use [standard/high-ticket] benchmarks. Starting with desktop, then mobile."

---

## Step 1: Desktop Audit — Homepage

Use Claude in Chrome browser tools to navigate to the homepage.

### 1a. First Impression (Above the Fold)

Navigate to the homepage. Take a screenshot immediately — this captures the true first-visit experience including any popups.

Evaluate against `cro-checklist.md > Homepage` section:

- **Value proposition clarity:** Can a new visitor understand what you sell and why in under 3 seconds?
- **Hero CTA:** Does it drive toward product discovery / shopping (not "Learn More" or "Our Story")?
- **Visual hierarchy:** Is the primary action obvious? Or does the eye wander?
- **Trust signals above fold:** Any social proof, review counts, "As seen in", guarantees visible before scrolling?
- **Navigation clarity:** Can users find product categories immediately?
- **Search bar:** Prominent and functional?

### 1b. Popups and Interruptions

Note every popup, modal, slide-in, or overlay that appears:

- **Timing:** How many seconds after page load? (Best practice: 15-30+ seconds or exit-intent)
- **Stacking:** Do popups overlap with chat widgets, cookie banners, accessibility icons?
- **Offer:** Is the popup offer compelling? (10% off is standard — does it match the brand positioning?)
- **Dismiss UX:** Easy to close? Does closing one trigger another?

### 1c. Below the Fold (Scroll Audit)

Scroll through the full homepage. Evaluate:

- **Content hierarchy:** Does the page guide users toward products/collections?
- **Social proof placement:** Reviews, testimonials, press logos, UGC
- **Category/collection links:** Clear paths to product discovery?
- **Promotions/offers:** Any active promos? Are they clear or confusing?
- **Footer:** Contact info, policies (returns, shipping), trust badges

### 1d. Navigation Deep Dive

Open the main navigation menu. Evaluate:

- **Category structure:** Logical grouping? Too many / too few categories?
- **Product counts visible?** Users want to know scope before clicking
- **Mega menu vs simple dropdown:** Appropriate for catalog size?
- **Utility nav:** Cart, account, search, wishlist accessible?

---

## Step 2: Desktop Audit — Collection / Category Pages

Navigate to 2-3 collection pages (prioritize highest-traffic or most representative). Take screenshots.

Evaluate against `cro-checklist.md > Collection Pages` section:

- **Product grid:** Image quality, consistency, hover states
- **Filtering and sorting:** Are filters relevant to the product type? Can users sort by price, popularity, reviews?
- **Product card info:** Price visible? Review stars? "New" or "Sale" badges? Quick-add-to-cart?
- **Pagination vs infinite scroll:** Appropriate for catalog size?
- **Empty state:** What happens with filters that return 0 results?
- **Collection description/SEO content:** Present? Useful or keyword-stuffed?

---

## Step 3: Desktop Audit — Product Pages

Navigate to 2-3 product pages (mix of hero products and standard). Take screenshots.

Evaluate against `cro-checklist.md > Product Pages` section:

- **Images:** Quantity (5+ recommended), quality, zoom, lifestyle vs product-only, video
- **Pricing:** Clear current price. If on sale, original vs sale price shown? Bundle/multi-buy options?
- **Product description:** Features AND benefits? Scannable (not a wall of text)? Addresses objections?
- **Reviews:** On-page reviews (not just a link to a reviews page). Star rating visible near title. Review count. Photo reviews?
- **Add-to-cart button:** Prominent, above fold, sticky on scroll? Clear color contrast?
- **Shipping info:** Transparent on the product page (not "calculated at checkout"). Free shipping threshold visible?
- **Returns policy:** Visible on PDP or linked clearly?
- **Trust signals near CTA:** Guarantees, secure checkout badge, payment icons
- **BNPL / Financing:** For AOV $100+, is Affirm/Klarna/Afterpay offered? Is it visible near the price?
- **Stock/urgency:** Low stock indicators? Estimated delivery date?
- **Cross-sells / upsells:** "Frequently bought together", "You may also like"
- **Variant selection:** Color/size selectors clear? What happens when a variant is OOS?

---

## Step 4: Desktop Audit — Cart & Checkout Flow

Add a product to cart and walk through the checkout flow. Take screenshots at each step.

Evaluate against `cro-checklist.md > Cart & Checkout` section:

### Cart Page / Drawer:
- **Cart visibility:** Slide-out drawer vs separate page? Is the cart always accessible?
- **Product info in cart:** Image, name, variant, price, quantity editor
- **Subtotal clarity:** Are taxes/shipping shown or "calculated at checkout"?
- **Free shipping progress bar:** If free shipping threshold exists, is progress shown?
- **Cross-sell in cart:** Recommended add-ons?
- **Checkout CTA:** Prominent, clear. Express checkout options (Shop Pay, Apple Pay, PayPal)?

### Checkout Page:
- **Guest checkout available?** Or forced account creation?
- **Form fields:** Minimal? Auto-fill friendly? Address validation?
- **Order summary visible** throughout checkout?
- **Payment options:** Credit card, Shop Pay, PayPal, Apple Pay, Google Pay, BNPL
- **Trust signals in checkout:** Security badges, money-back guarantee, SSL indicators
- **Shipping options:** Clear pricing, estimated delivery dates
- **Surprise costs:** Any fees that weren't visible earlier?
- **Discount code field:** Present but not distractingly prominent? (Prominent discount fields cause users to leave and Google discount codes)

**Do NOT complete a purchase.** Stop at the payment step after documenting the flow.

---

## Step 5: Mobile Audit

Resize the browser to mobile viewport (375px width) OR use Chrome's device emulation. Navigate through the same flow: homepage > collection > product page > cart.

Load and follow `reference/mobile-checklist.md` for this section.

Key areas (detailed in mobile-checklist.md):
- **Tap targets:** Buttons large enough (44x44px minimum)? Adequate spacing?
- **Navigation:** Hamburger menu usability, search accessibility
- **Hero / above fold:** Does the mobile hero convey the same value prop? Or is it cropped/broken?
- **Product page on mobile:** Image carousel swipeable? ATC button sticky/accessible? Reviews scrollable?
- **Checkout on mobile:** Form field sizes, keyboard types, express checkout prominence
- **Page speed perception:** Does the site feel fast on mobile? Visual loading indicators?
- **Scroll depth:** How far must a mobile user scroll to reach key elements?
- **Mobile vs desktop CVR gap:** Note any mobile-specific friction that would explain a CVR gap >2x (benchmark: desktop CVR is typically 1.6-2.1x higher; gap >2.5x = mobile UX problem)

---

## Step 6: Cross-Channel Landing Page Assessment

If ad landing page URLs were provided (or if you can infer them from the site structure):

- **Message match:** Do landing pages echo the language/offer of the ads driving traffic to them?
- **Landing page vs homepage:** Are paid traffic users sent to the homepage (bad) or dedicated landing pages / collection pages (better)?
- **Source-specific experience:** Does the site handle UTM parameters? Do any pages adapt content based on traffic source?
- **Paid social landing pages:** For Meta/TikTok traffic (low-intent, interruption-based), does the page educate before selling? Or does it assume high intent?
- **Paid search landing pages:** For Google Search traffic (high-intent), is the path to purchase short and direct?

---

## Step 7: Page Speed & Core Web Vitals (If Tools Available)

If you can access PageSpeed Insights or similar:

- **LCP (Largest Contentful Paint):** <2.5s good, 2.5-4s needs improvement, >4s poor
- **FID/INP (Interaction to Next Paint):** <200ms good, 200-500ms needs improvement, >500ms poor
- **CLS (Cumulative Layout Shift):** <0.1 good, 0.1-0.25 needs improvement, >0.25 poor
- **Mobile vs desktop speed gap:** Significant?
- **Render-blocking resources:** Large JavaScript bundles, unoptimized images?

If PageSpeed tools are not accessible, note speed as a subjective observation: "Site felt slow/fast during browsing" with specific pages that lagged, and mark as `DATA_NOT_AVAILABLE` in the evidence file with `attempted: "No PageSpeed Insights access"`.

---

## Step 8: Information Architecture & Navigation

Assess the overall site structure:

- **Depth to purchase:** How many clicks from homepage to checkout? (Benchmark: 3-4 clicks max)
- **Breadcrumbs:** Present and functional?
- **Internal linking:** Do pages link to related products/categories?
- **Search quality:** Search for a product — are results relevant? Does it handle typos?
- **404 handling:** Try a broken URL — is the 404 page helpful or a dead end?
- **Site-wide banners:** Any important info in announcement bars? Is it dismissible?

---

## Step 9: Compile Evidence File

After completing all steps, compile your findings into the standardized JSON evidence file.

### File Details:
- **Filename:** `{Client}_{platform}_evidence.json` where platform = `website-cro`
- **Location:** Client's evidence directory (per manifest or your file routing rules)
- **Schema:** Must conform to `evidence-schema.json`

### Evidence File Structure for Website CRO:

**`meta.platform`:** `"website-cro"`

**`account_overview`:** Site-level metrics (use labeled_metric format):
- Overall CVR (if known from GA4 evidence or stated by user)
- Mobile vs Desktop CVR gap (if known)
- ATC rate (if observable)
- Cart abandonment rate (if observable)
- AOV (if known)
- Page speed scores (if measured)

Label each metric appropriately: OBSERVED (from browser tools or stated data), INFERENCE (estimated from behavior), ASSUMPTION (industry benchmark used as proxy), or DATA_NOT_AVAILABLE.

**`campaigns`:** Not applicable for website CRO — omit or leave empty array.

**`tracking_health`:** Note any tracking observations:
- Missing events (no ATC tracking visible, etc.)
- Cookie consent implementation issues
- Chat widget interference with analytics
- Multiple analytics tools conflicting

**`findings`:** Each discrete UX/conversion observation as a finding:
- Title: One-line summary (e.g., "Product pages lack visible shipping information")
- Label: OBSERVED (you saw it on the site)
- Evidence: Specific description of what you observed (page, element, behavior)
- Source: URL or page name where observed
- Significance: Why it matters for conversion (reference benchmarks when relevant)

**`anomalies`:** Unexpected patterns:
- Broken functionality, 404s, JS errors
- Contradictory messaging (free shipping banner but shipping charges at checkout)
- Out-of-stock products featured prominently

**`diagnosis`:**
- `primary_constraint`: The single biggest conversion barrier on the site
- `secondary_constraints`: Additional issues ranked by impact

**`opportunities`:** Prioritized CRO actions:
- Each must cite evidence from findings
- Priority: CRITICAL / HIGH / MEDIUM / LOW
- Expected impact: Estimated CVR or revenue impact (use benchmark ranges)
- Confidence: high / medium / low with reasoning

**`cross_channel_signals`:** Flags for the synthesizer to investigate on other platforms:
- "Product pages lack trust signals — check if Meta retargeting ROAS is suffering from low post-click confidence" → check_in: `["meta-ads", "google-ads"]`
- "No visible BNPL for $250+ AOV — check if cart abandonment correlates with checkout stage in GA4" → check_in: `["ga4", "shopify"]`
- "Mobile experience significantly degraded — check mobile vs desktop CVR split in GA4" → check_in: `["ga4"]`
- "Landing pages don't match ad messaging — check ad creative vs landing page alignment" → check_in: `["meta-ads", "google-ads"]`
- "Site feels slow — check if bounce rate is elevated for paid traffic sources" → check_in: `["ga4"]`

**`open_questions`:** What you couldn't determine from the front-end audit:
- Backend checkout abandonment rate (need Shopify or GA4)
- Actual conversion rate by traffic source (need GA4)
- Heatmap/scroll depth data (need Hotjar or similar)
- A/B test history
- Page speed under real load conditions

**`raw_metrics`:** Use `landing_page_details` for page-by-page observations:
```json
{
  "landing_page_details": [
    {
      "page": "Homepage",
      "url": "https://example.com",
      "screenshot_taken": true,
      "hero_score": "weak|ok|strong",
      "cta_clarity": "weak|ok|strong",
      "trust_signals": "weak|ok|strong",
      "mobile_experience": "weak|ok|strong",
      "issues_found": ["list of specific issues"],
      "strengths": ["list of things done well"]
    }
  ]
}
```

---

## Step 10: Update Manifest

If an audit manifest exists, update the Website/CRO row:
- Status: `DONE`
- Evidence File: filename
- Date Completed: today's date

---

## Evidence Labeling Rules (Mandatory)

Every data point in the evidence file must carry one of these labels:

- **OBSERVED:** You saw this directly on the website. Include the URL/page as source.
- **CALCULATED:** Derived from observed values. Show formula in source field.
- **INFERENCE:** Logical conclusion from what you observed. Explain reasoning.
- **ASSUMPTION:** Not verified. State what was assumed and why.
- **DATA_NOT_AVAILABLE:** You tried to get this data but couldn't. State what you attempted.

**Never invent data.** If you can't measure a metric from the front end, mark it DATA_NOT_AVAILABLE and note it in open_questions.

---

## Anti-Hallucination Checkpoint

Before saving the evidence file, verify:

1. Every finding references a specific page/URL you actually visited
2. Every screenshot reference corresponds to a screenshot you actually took
3. No benchmark numbers are presented as observed site metrics
4. No metrics are fabricated — every number traces to an observation or is marked as unavailable
5. Cross-channel signals only flag things you actually noticed, not generic CRO advice
6. Opportunities are grounded in findings, not template recommendations

---

## Important Principles

- **Browse first, judge second.** Complete the full walkthrough before forming your diagnosis. First impressions can be misleading.
- **Screenshot everything.** The synthesizer and the AM need visual evidence, not just descriptions.
- **Benchmark against the playbook.** Conversion rates, ATC rates, cart abandonment — compare to benchmarks.md thresholds and note where the client falls (Floor / Healthy / Strong).
- **Think like a customer.** Would YOU buy from this site? Where would YOU abandon?
- **Note what's working too.** The evidence file includes strengths, not just problems. This prevents the synthesizer from painting an unfairly negative picture.
- **Mobile is not optional.** Over 60% of ecommerce traffic is mobile. A desktop-only audit misses the majority experience.
- **Cross-channel signals are your handoff.** Flag anything that needs investigation on other platforms. The synthesizer will connect the dots.
