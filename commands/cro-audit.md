---
description: Run a CRO diagnostic audit on a client's website, analytics, and ad platforms
argument-hint: "<website URL> [GA4 link] [Meta Ads link] [Google Ads link]"
---

# /cro-audit

Run a comprehensive Conversion Rate Optimization diagnostic audit.

## Before Starting

Load the playbook context for benchmarks:

1. Read `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md`
2. Read `${CLAUDE_PLUGIN_ROOT}/references/creative-testing.md`
3. Read `${CLAUDE_PLUGIN_ROOT}/references/post-purchase.md`

## Then

Follow the full CRO audit process in the `cro-audit` skill. The skill will:

1. Gather platform links from the user (website required, GA4/Meta/Google optional)
2. Audit the website for conversion barriers
3. Analyze GA4 funnel data (if provided)
4. Analyze Meta Ads performance (if provided)
5. Analyze Google Ads performance (if provided)
6. Cross-platform diagnosis to identify root cause(s)
7. Generate a client-ready DOCX report with findings, root cause analysis, and prioritized action plan
