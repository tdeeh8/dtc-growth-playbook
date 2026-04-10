# Audit Process (Standard / Deep / Profitability)

This file contains the full audit execution flow. It is loaded by SKILL.md for Standard, Deep, and Profitability audit types.

## Operating Principles

- **Accuracy over completeness.** Deeply analyze three verified data sources rather than shallowly skim ten. Never pad with unverified observations.
- **Never speculate about data you haven't directly verified.** If unavailable, write: `DATA NOT AVAILABLE`. Do not guess or infer from partial screenshots.
- **Separate facts from interpretation.** Use this labeling system consistently:
  - **OBSERVED** — you directly saw this data point. Cite the exact number, page, and date range.
  - **INFERENCE** — a logical conclusion from observed data. State the reasoning.
  - **ASSUMPTION** — something you believe but haven't verified. State why.
  - **DATA NOT AVAILABLE** — you could not access or verify this. State what you tried.
- **Let the data lead.** Record what you see first, then look for patterns. Follow the data, not your initial impression.
- **Never claim causality from correlation.** Note correlations, don't assert causation unless evidence supports it.
- **Surface conflicts.** If GA4 says one thing and the ad platform says another, present both and explain the discrepancy.

### Label discipline examples

**Bad (interpretation smuggled into observations):**
```
- Discounts: $1,017 of $4,230 gross (24% discount rate) — margin erosion
- Returning customer rate: 0.75% — virtually no repeat purchases
```

**Good (raw data now, interpretation in Phase 4):**
```
- OBSERVED: Discounts applied: $1,017.27 on $4,230.17 gross sales (24.1%)
- OBSERVED: Returning customer rate: 0.75% (1 of 133 orders from returning customers)
- NOTE FOR PHASE 4: Discount rate seems high — investigate source
```

## Avoiding Bias

- **Do not form a thesis until Phase 4.** During evidence collection, your only job is to record. Write emerging theories under "Hypotheses to Test" — don't let them filter what you collect.
- **Record surprises with the same priority as confirming evidence.** Unexpected data often reveals the real story.
- **Don't anchor on the first platform.** When moving to the next platform, ask: "What could this data tell me that contradicts what I saw before?"
- **In Phase 4, start from patterns, not questions.** Ask "What are the most significant patterns?" not "Where is money wasted?"

## Working Notes File

Create at the start: `{Client_Name}_audit_notes.md` in your working directory.

```
# {Client Name} Audit Notes

## Source Inventory
(filled during Phase 1)

## Tracking Health
(filled during Phase 1b — if running tracking validation)

## Website Findings
(filled during Phase 2)

## {Platform} Findings
(one section per platform, filled during Phase 2)

## Anomalies and Surprises
(things that don't fit or seem unusual)

## Hypotheses to Test
(thoughts from Phase 2 — evaluate in Phase 4, not before)

## Patterns and Hypotheses
(filled during Phase 3)

## Diagnosis
(filled during Phase 4)
```

**Hard rule: update the notes file after completing each platform.** Do not proceed to the next platform until you've saved. This is non-negotiable.

## Scope Control

Prioritize depth over breadth. Default order:

1. **Website** — Product, price point, value prop, trust signals, UX quality
2. **Store backend** (Shopify) — Revenue, orders, AOV, funnel, traffic sources, retention. Source of truth.
3. **Primary revenue channel** — Whichever drives the most revenue
4. **Paid channels** — In order of spend
5. **Supporting channels** — Email, organic social, etc.

If time or access is limited, go deep on fewer platforms. Tell the user what you're prioritizing and why.

## Execution Rules

- **Read-only.** Never change settings, launch campaigns, edit assets, or modify data.
- **No destructive actions.** Nothing irreversible.
- **Handle partial access gracefully.** State limitations and continue with what's verifiable.
- **Prefer fewer high-confidence findings over many weak claims.**

---

## Phase 1: Access and Inventory

Open all platform links simultaneously in separate tabs. Don't analyze yet — just confirm access.

Build a **source inventory** documenting:
- Source name and URL
- What pages/reports are accessible
- What's blocked or requires additional permissions
- Default and available date ranges
- Immediate red flags (warnings, deactivated accounts, error states)

If a critical platform is inaccessible, tell the user immediately.

**Save source inventory to working notes before Phase 2.**

## Phase 2: Evidence Collection

Systematically inspect each platform. **Only record — do not diagnose or recommend.** Write interpretive thoughts under "Hypotheses to Test."

**Minimum data points to look for (where visible):**
- Revenue / sales numbers and trends
- Spend / cost numbers
- Volume metrics (sessions, clicks, impressions, orders, units)
- Rate metrics (CVR, CTR, ACOS, ROAS, bounce rate)
- AOV
- Traffic sources and channel mix
- Campaign structure and status
- Budget allocation across campaigns
- Product/SKU-level performance
- Customer composition (new vs returning, geographic)
- Funnel data (sessions → ATC → checkout → purchase)
- UX observations (hero, navigation, product pages, trust signals, checkout, popups, mobile)
- Copy/content issues (typos, inconsistencies, broken links)
- Platform-surfaced warnings, alerts, or recommendations

**After each platform, immediately update working notes.** Write raw numbers with OBSERVED labels, specific campaign/product names, page URLs, exact metrics.

### Anomaly Detection Checklist

Watch for these during Phase 2:

**Traffic quality:** Geographic concentrations in data center cities (Council Bluffs IA, Ashburn VA, The Dalles OR, Dublin Ireland). High sessions + zero conversions. Extreme bounce rates (>95% or <20%). Zero-second session durations in volume.

**Cross-platform contradictions:** Platform purchase counts don't match store backend. Revenue doesn't reconcile. GA4 traffic sources don't match ad platform clicks.

**Website copy:** Guarantee terms differ between sections. Price discrepancies. Broken domains. Trust claims that conflict with evidence. Spelling errors in trust-critical elements.

**Account health:** Deactivated/suspended accounts (but on Amazon, distinguish "Stores Deactivated" = cosmetic vs. actual suspension). Policy violations. Budget exhaustion. Disapproved ads/listings.

Record anomalies in the "Anomalies and Surprises" section.

## Phase 3: Evidence Summary

Review working notes across all platforms. Without forming recommendations, organize:

- Strongest performers (campaigns, products, channels)
- Weakest (highest cost, lowest return, most waste)
- Where spend is concentrated vs. where revenue is concentrated
- Visible trends (improving, declining, flat, volatile)
- Anomalies and contradictions between data sources
- Missing data that limits confidence
- **What surprised you?** — often the most diagnostic question

Write under "Patterns and Hypotheses." Keep theories labeled as hypotheses.

## Phase 4: Diagnosis

Now — and only now — determine root causes.

1. **What are the 3-5 most significant patterns?** Let the evidence decide the number.
2. **For each pattern, what's the most likely explanation?** Cite specific evidence with OBSERVED/INFERENCE labels.
3. **What must be true for each explanation to hold?** Confirming or contradicting evidence?
4. **What can't be scaled until it's fixed?**
5. **Where do data sources agree or disagree?**

Every claim must cite supporting evidence. No citation = hypothesis, not finding.

**Run the profitability check from SKILL.md Step 2 here** (Break-even CPA, Target ROAS, CM3, CAC Payback).

## Phase 5: Opportunity Mapping

Identify opportunities supported by evidence. For each:
- **Opportunity** — what could be done
- **Supporting evidence** — specific findings
- **Likely impact** — tied to data where possible
- **Confidence level** — high / medium / low
- **Dependencies** — what needs to be true for this to work

## Phase 6: Prioritization

Rank by: expected impact, confidence, speed to implement, dependency risk.

Three tiers:
- **Tier 1: Next 7 days** — High impact, high confidence, low dependency
- **Tier 2: Next 30 days** — Important but requires setup or coordination
- **Tier 3: Next 60-90 days** — Strategic, depends on Tier 1/2

## Phase 7: Generate DOCX Report

Read reference/report-template.md for report structure and formatting specs.

## Phase 8: Verification

Read reference/anti-hallucination.md for the verification checklists and spot-check process.
