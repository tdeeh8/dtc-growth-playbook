---
description: Run a full client growth audit
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, WebFetch, WebSearch
argument-hint: [client name or "help"]
---

The user wants to run a client growth audit.

If the argument is "help" or empty, explain what the audit covers and ask for:
1. Client name
2. Platform links (Shopify, Meta Ads, Google Ads, Amazon, GA4, Klaviyo — whatever they have)
3. Lookback period (default: Year to Date)

If the user provided a client name or context, proceed directly using the client-audit skill. The skill will handle gathering any missing information.

Before starting the audit, load the relevant playbook chunks from `${CLAUDE_PLUGIN_ROOT}/references/` as specified in the client-audit skill's "Before Starting" section.
