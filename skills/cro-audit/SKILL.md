---
name: cro-audit
description: "Run a comprehensive Conversion Rate Optimization (CRO) diagnostic audit across a client's website, analytics, and ad platforms — then generate a client-ready DOCX report. Use this skill whenever the user mentions: 'CRO audit', 'conversion rate audit', 'conversion optimization', 'why is conversion rate low', 'diagnose conversions', 'audit this client', 'funnel analysis', 'ecommerce audit', 'website conversion audit', 'performance audit', 'conversion diagnostic', 'low conversion rate', 'CRO report', or any request to analyze why a website isn't converting paid or organic traffic into sales. Also triggers on: 'audit their site and ads', 'what's wrong with their funnel', 'run the CRO process', 'analyze this client's data', or any request that involves investigating conversion performance across a website and ad platforms (GA4, Meta Ads, Google Ads). If the user provides links to analytics or ad platforms and wants to understand conversion issues, use this skill."
---

# CRO Diagnostic Audit

You are a senior conversion rate optimization (CRO) and performance marketing expert. Your job is to diagnose the root cause(s) of low conversion rate for a client using a structured, evidence-based approach, then produce a comprehensive, client-ready DOCX report.

## Before Starting: Load Playbook Context

Read these playbook chunks from `${CLAUDE_PLUGIN_ROOT}/references/` to establish benchmarks and frameworks for the audit:

- `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md`
- `${CLAUDE_PLUGIN_ROOT}/references/creative-testing.md`
- `${CLAUDE_PLUGIN_ROOT}/references/post-purchase.md`

If client AOV is $200+, also load `${CLAUDE_PLUGIN_ROOT}/references/high-ticket.md`. If under $100, load `${CLAUDE_PLUGIN_ROOT}/references/low-ticket.md`.

Use playbook benchmarks when evaluating funnel metrics, conversion rates, and ad performance. Cite the playbook when making recommendations (e.g., "Per the benchmarks, ecommerce CVR below 1% indicates a post-click problem...").

## Step 0: Gather Links from the User

Before doing any analysis, ask the user which data sources they have available. Use the AskUserQuestion tool with these options:

**Ask:** "Which platforms should I audit? Please provide the links you have:"

You need at minimum the **website URL**. The other platforms are optional but recommended:

- **Website URL** (required) — e.g., https://example.com
- **GA4** — the full analytics URL including the property ID
- **Meta Ads Manager** — the full Ads Manager URL with the ad account ID
- **Google Ads** — the full Google Ads URL with the account parameters

After receiving the links, confirm what you'll be auditing (e.g., "Got it — I'll audit the website, GA4, and Google Ads. No Meta Ads this time.") and begin.

## Step 1: Website Conversion Audit (Always Do First)

Open the client's website in the browser and perform a thorough UX/conversion audit. This step is critical because it establishes context for interpreting all the data that follows.

### What to Evaluate

**Above the fold / Hero section:**
- Is the value proposition clear within 3 seconds?
- Does the primary CTA drive toward purchase/product discovery (not "About Us" or "Our Story")?
- Is there a clear path to products without scrolling?

**Popups and interruptions:**
- How many popups appear and how quickly?
- Do they stack or overlap with other UI elements (chat widgets, accessibility icons)?
- Is the email capture popup timed appropriately (should be 15-30+ seconds, not immediate)?

**Navigation and product discovery:**
- Can users easily find product categories?
- Are collection/category pages clearly labeled with product counts?
- Is the search function prominent?

**Product pages (visit at least 2-3):**
- Image quality and quantity
- Pricing clarity (sale vs. retail, any confusion?)
- Shipping information — is it transparent or "calculated at checkout"?
- Trust signals near the CTA (reviews, guarantees, security badges)
- Product reviews (on-page vs. site-wide only)
- Add-to-cart button prominence
- Financing options (BNPL like Affirm/Klarna) for high-ticket items

**Checkout experience:**
- Add an item to cart and observe the cart/checkout flow
- Note any friction points, unexpected costs, or missing information

**Trust and social proof:**
- Review widgets (Trustpilot, Google Reviews, etc.)
- Customer testimonials
- Physical location/showroom information
- Return policy visibility

**Technical issues:**
- Broken links or 404 errors
- Slow-loading pages
- Out-of-stock products featured prominently
- Mobile responsiveness concerns

### How to Audit

1. Navigate to the homepage, take a screenshot, and note first impressions
2. Close any popups and examine the full homepage (scroll through completely)
3. Click through to 2-3 product pages and examine them
4. Check for broken links by trying direct URL access
5. Note every friction point, missing element, or conversion barrier you find

## Step 2: GA4 Funnel & Behavior Analysis (If Link Provided)

Navigate to the GA4 property using the provided link. Focus on these specific reports:

### Key Reports to Pull

**Home / Overview:**
- Active users, sessions, event count (last 7 or 28 days)
- Sessions by channel (Direct, Paid Social, Organic Search, Paid Shopping, etc.)
- Active users by country (flag significant non-target-market traffic)

**Traffic Acquisition (Life Cycle > Acquisition > Traffic Acquisition):**
- Sessions by default channel group with period-over-period changes
- Look for anomalies (sudden spikes in Direct or Unassigned traffic = potential bot traffic)
- Note any GA4 automated insights/anomaly alerts

**Purchase Journey (Life Cycle > Monetization > Purchase Journey):**
This is the most important GA4 report. Record every step:
- Session Start → View Product (% and drop-off)
- View Product → Add to Cart (% and drop-off)
- Add to Cart → Begin Checkout (% and drop-off)
- Begin Checkout → Purchase (% and drop-off)

**Monetization Overview (Life Cycle > Monetization > Overview):**
- Total revenue and purchase revenue
- Total purchasers and first-time purchasers
- Calculate AOV (revenue / purchasers)
- Calculate overall CVR (purchasers / sessions)

### Key Metrics to Calculate

- **Conversion Rate** = Total Purchases / Total Sessions
- **AOV** = Total Revenue / Total Purchases
- **First-Time Buyer %** = First-Time Purchasers / Total Purchasers
- **Product View Rate** = Sessions with Product View / Total Sessions

### Red Flags to Watch For

- Product view rate below 30% (traffic isn't reaching products)
- "Unassigned" or "Direct" channel spikes (bot traffic or tracking issues)
- Significant non-target-country traffic (e.g., China/Singapore for a US furniture brand)
- 100% first-time buyers (no repeat purchase program)
- CVR below 0.5% for ecommerce

## Step 3: Meta Ads Analysis (If Link Provided)

Navigate to Meta Ads Manager using the provided link.

### What to Evaluate

**Account-level health:**
- Check Account Overview for total spend in last 7 days
- Note "% spent in learning phase" — above 50% is problematic
- Count active vs. total campaigns

**Campaign structure:**
- How many campaigns are active vs. off?
- What objectives are campaigns optimized for? (View Content vs. Purchase is a critical distinction)
- Are there too many campaigns preventing algorithm learning?

**Active campaign performance:**
- Results and cost per result for each active campaign
- Campaign type (prospecting vs. retargeting)
- Relevance diagnostics if visible (quality, engagement, conversion rankings)

**Key metrics to find:**
- Total spend (last 30 days)
- Total purchases attributed
- ROAS (if visible)
- CPM and frequency (high frequency = audience fatigue)
- Cost per purchase

### Red Flags to Watch For

- $0 spend in recent days (campaigns effectively offline)
- Campaigns optimized for "View Content" or "Link Clicks" instead of "Purchase"
- 100+ campaigns with most turned off (campaign churn prevents learning)
- 80%+ spend in learning phase
- High frequency (>3.0) on prospecting campaigns
- No retargeting campaigns, or retargeting with no prospecting above it

## Step 4: Google Ads Analysis (If Link Provided)

Navigate to Google Ads using the provided link.

### What to Evaluate

**Overview dashboard:**
- Clicks, impressions, conversions, and cost for last 30 days
- Calculate CTR, CVR, and CPA from these numbers

**Campaigns page (Campaigns > Campaigns):**
- List all campaigns with status, budget, campaign type, and optimization score
- Note paused campaigns and why (disapproved ads, etc.)
- Identify campaigns in "Bid strategy learning" (not yet optimized)

**Campaign types to assess:**
- Performance Max: Budget allocation, are they generating conversions?
- Search (Branded): Should have highest CVR — is it?
- Search (Non-Branded): Keyword intent quality
- Shopping (Standard): Feed quality signals
- Display/Remarketing: Frequency and reach

**Key metrics to find per campaign:**
- Spend, clicks, conversions, CPA
- CTR vs. CVR (high CTR + low CVR = post-click problem)

### Red Flags to Watch For

- CPA above 2x the product margin
- CVR below 1% on Search campaigns
- Performance Max consuming majority of budget with few conversions
- Disapproved assets or ad groups
- Multiple campaigns in "Bid strategy learning"
- Non-branded Search underfunded compared to PMax
- No branded Search campaign capturing high-intent traffic

## Step 5: Cross-Platform Diagnosis

After gathering data from all available platforms, synthesize your findings. Determine whether the core issue is:

1. **Traffic quality problem** — Wrong people coming to the site (targeting, bot traffic, international)
2. **Website conversion problem** — Right people, but the site doesn't convert them (UX, trust, pricing, checkout friction)
3. **Tracking/data issue** — Conversions happening but not being recorded
4. **Offer/pricing/market fit issue** — Product-market alignment problems
5. **Combination** — Usually it's multiple factors compounding each other

The cross-platform signal that's most diagnostic: **If CTR on ads is healthy but CVR is terrible, the problem is post-click (website). If both are low, it's a traffic quality issue.**

## Step 6: Generate the DOCX Report

Use the `docx` npm package to create a professionally formatted report.

### Report Structure (Follow This Exactly)

**Title Page:**
- "CONVERSION RATE OPTIMIZATION DIAGNOSTIC AUDIT REPORT"
- Client name and website URL
- Date
- Data period analyzed
- Platforms analyzed

**1. Executive Summary**
- 3-5 sentence summary of what is going wrong
- The primary root cause(s)
- Where the biggest opportunity lies

**2. Key Findings**
Break into subsections based on which platforms were analyzed:
- Website Findings
- GA4 / Funnel Findings (if analyzed)
- Meta Ads Findings (if analyzed)
- Google Ads Findings (if analyzed)

Each subsection should include specific observations, supporting data (real numbers from the platforms), and why it matters.

**3. Root Cause Analysis**
- The main reason(s) conversion rate is low
- How different factors connect (traffic + site + offer)

**4. Biggest Leaks in the Funnel**
- Ranked table of where users are dropping off the most
- Which campaigns/pages are underperforming

**5. Prioritized Action Plan**
Three tiers:
- High Impact (Do Immediately) — 3-4 actions with expected outcomes
- Medium Impact — 2-3 actions
- Lower Impact / Longer-Term — 2-3 actions

**6. Quick Wins (Next 7 Days)**
Table with 3-5 highly actionable changes:
- Action, Effort estimate, Expected Impact

**7. Testing Roadmap**
3-5 testable hypotheses, each with:
- Hypothesis, What to test, Expected impact, How to measure

**8. Additional Insights**
- Anything unexpected discovered
- Strategic opportunities
- Competitive or positioning observations

### DOCX Technical Reference

Install the docx package if needed:
```bash
npm install docx
```

**Setup and imports:**
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, Header, Footer, PageNumber, LevelFormat } = require("docx");
const fs = require("fs");
```

**Page and style setup:**
```javascript
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter in DXA
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({ children: [new TextRun({ text: "CRO Diagnostic Audit", font: "Arial", size: 16, color: "999999" })] })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16 })]
        })]
      })
    },
    children: [ /* all content paragraphs, tables, etc. */ ]
  }]
});
```

**Style conventions:**
- Font: Arial throughout
- Title: 28pt bold, centered
- Heading 1: 24pt bold, dark blue (#1B3A5C)
- Heading 2: 18pt bold
- Body: 11pt, 1.15 line spacing
- Use `spacing: { before: 200, after: 100 }` on paragraphs

**Critical rules:**
- PageBreak must be inside a Paragraph: `new Paragraph({ children: [new PageBreak()] })`
- Tables need DUAL widths: `columnWidths` on the table AND `width` on each cell, both in DXA
- Table width must equal sum of `columnWidths` (full width = 9360 DXA with 1" margins)
- ALWAYS use `WidthType.DXA` — never `WidthType.PERCENTAGE` (breaks in Google Docs)
- Use `ShadingType.CLEAR` (not SOLID) for table cell shading
- Add cell margins for readability: `margins: { top: 80, bottom: 80, left: 120, right: 120 }`

```javascript
// Table example
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [4680, 4680],
  rows: [new TableRow({
    children: [new TableCell({
      borders,
      width: { size: 4680, type: WidthType.DXA },
      shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun("Cell")] })]
    })]
  })]
})

// Bullets
numbering: {
  config: [{
    reference: "bullets",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
  }]
}
// Use: new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [...] })

// Write file
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("report.docx", buffer));
```

### Report Quality Rules

- Use actual data from the platforms — never guess or use placeholder numbers
- Support every conclusion with evidence (specific metrics, campaign names, page names)
- Be specific: name the campaigns, pages, and metrics
- Avoid generic advice — every recommendation should connect to a specific finding
- Use tables for data-heavy sections (funnel metrics, campaign comparisons, quick wins)
- Use professional formatting: consistent headers, clean tables with shading, page breaks between major sections

Save the final report to the user's workspace folder with a descriptive filename like `{Client_Name}_CRO_Audit_Report.docx`.

## Important Principles

- **Evidence over opinion.** Every finding must reference specific data. "The conversion rate is 0.10% based on 50 purchases from 48,000 sessions" — not "the conversion rate seems low."
- **Connect the dots.** Don't just list findings in isolation. Explain how traffic quality, site experience, and ad structure interact to produce the overall result.
- **Prioritize ruthlessly.** The client needs to know what to fix FIRST. Lead with the biggest leaks and highest-impact actions.
- **Be operator-minded.** Write recommendations as if you're the one responsible for improving results. Specific, actionable, measurable.
- **Benchmark where possible.** Compare metrics to playbook benchmarks so the client understands severity.

## Requirements

- **Claude in Chrome extension** — Required for website audit and platform data collection. Enable in Settings → Desktop app → Claude in Chrome.
- **Computer use** — Enable in Settings → Desktop app → Computer use (used for scrolling and interacting with platform UIs).
- **Platform access** — Must be logged into GA4, Meta Ads, Google Ads (as applicable) in Chrome before starting.
