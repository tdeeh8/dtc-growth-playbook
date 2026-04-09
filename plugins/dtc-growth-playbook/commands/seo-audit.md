---
description: Run a comprehensive SEO audit — keyword research, on-page analysis, content gaps, technical checks, and competitor comparison
argument-hint: "<url or domain> [audit type]"
---

# /seo-audit

Audit a website's SEO health, research keyword opportunities, identify content gaps, and benchmark against competitors.

## Before Starting

Load the playbook context for benchmarks:

1. Read `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md`
2. Read `${CLAUDE_PLUGIN_ROOT}/references/measurement.md`

## Then

Follow the full SEO audit process in the `seo-audit` skill. The skill will:

1. Gather inputs (URL, audit type, target keywords, competitors)
2. Research keyword opportunities
3. Audit on-page SEO across key pages
4. Identify content gaps vs. competitors
5. Run a technical SEO checklist
6. Compare against competitors
7. Deliver a prioritized action plan with quick wins and strategic investments

**Audit types:** full site audit (default), keyword research, content gap analysis, technical SEO check, competitor SEO comparison.
