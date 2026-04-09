---
name: seo-audit
description: "SEO audit with keyword research, on-page analysis, content gaps, technical checks, and competitor comparison. Triggers on: SEO audit, keyword research, content gap analysis, technical SEO, why am I not ranking, organic traffic audit."
---

# SEO Audit

Senior SEO strategist. Audit a site's search health, find keyword opportunities, identify content gaps, benchmark vs competitors, deliver a prioritized action plan.

## Before Starting: Load Playbook Context

Read from `${CLAUDE_PLUGIN_ROOT}/references/`: benchmarks.md, measurement.md

## Step 0: Gather Inputs

Scan conversation first. Ask for genuine gaps only:
1. **URL** (required)
2. **Audit type** — full site audit (default), keyword research, content gap, technical SEO, competitor comparison
3. **Target keywords** (optional)
4. **Competitors** (optional — identify 2-3 via web search if not provided)

## Step 1: Keyword Research

Use web search + site content analysis. For each opportunity assess: primary vs secondary keywords, relative search demand (high/med/low), difficulty (easy/moderate/hard), long-tail opportunities, question-based keywords (People Also Ask), intent classification (informational/navigational/commercial/transactional).

## Step 2: On-Page SEO Audit

Key pages (homepage, top landing pages, blog posts). Check: title tags (unique, 50-60 chars, includes keyword), meta descriptions (150-160 chars, has CTA), H1 (one per page, includes primary keyword), H2/H3 hierarchy, keyword in first 100 words, internal linking and orphan pages, image alt text, URL structure.

## Step 3: Content Gap Analysis

Competitor topic coverage gaps, content freshness (12+ months stale), thin content (<300 words on informational), missing formats (guides, comparisons, glossaries, tools), funnel stage gaps (awareness/consideration/decision), topic cluster opportunities.

## Step 4: Technical SEO

Page speed causes, mobile-friendliness, structured data opportunities (FAQ, Product, Article, Breadcrumb), robots.txt/sitemap/canonicals, broken links and redirect chains, HTTPS/mixed content, Core Web Vitals signals, indexation issues.

## Step 5: Competitor Comparison

Per competitor: keyword overlap and gaps, domain authority signals, content depth and publishing frequency, backlink profile observations, SERP feature ownership (snippets, PAA, image packs), technical advantages.

## Output Format

**Executive Summary** — 3-5 sentences: biggest strength, top 3 priorities, overall assessment.

**Keyword Opportunity Table** (15-25 keywords sorted by opportunity score):
| Keyword | Difficulty | Opportunity | Current Ranking | Intent | Recommended Content |

**On-Page Issues Table:**
| Page | Issue | Severity (Critical/High/Med/Low) | Fix |

**Content Gap Recommendations** — topic, why it matters, format, priority, effort estimate

**Technical Checklist:**
| Check | Status (Pass/Fail/Warning) | Details |

**Competitor Comparison:**
| Dimension | Your Site | Competitor A | Competitor B | Winner |

**Action Plan:**
- Quick Wins (this week): <2 hours, immediate impact
- Strategic Investments (this quarter): larger effort, long-term growth

Each item: what to do, expected impact, effort, dependencies.

## Principles

- Base every recommendation on observable data. Acknowledge when data is estimated (no Search Console/Ahrefs access).
- Name exact pages, keywords, competitors. "Fix your title tags" is useless — "Change homepage title from 'Home' to 'Organic Cotton Bedsheets | [Brand]'" is actionable.
- Frame keywords by buyer intent and business value, not just volume.

## Requirements

- **Claude in Chrome** + **Computer use** — for site analysis and competitor research.
