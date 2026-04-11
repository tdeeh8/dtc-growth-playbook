# Parallel Execution Strategy

Reference doc for the orchestrator. Defines how to run independent platform audits simultaneously using subagents instead of the default sequential flow.

---

## Execution Phases

```
PHASE 1 (sequential, always first):
  → Shopify (or BigCommerce) — financial source of truth

PHASE 2 (parallel — simultaneous subagents):
  → Google Ads  ┐
  → Meta Ads    │ all use Shopify data, NOT each other's
  → Amazon Ads  │
  → Klaviyo     ┘

PHASE 3 (sequential, after Phase 2 completes):
  → GA4 — cross-platform reconciliation, needs ad platform data

PHASE 4 (sequential, last):
  → Website/CRO — benefits from all prior data
```

### Why this order works

Shopify must be first — AOV, revenue, COGS, margins, and profitability math (break-even CPA, target ROAS, MER) all depend on it. Every other platform references Shopify financials.

Phase 2 platforms are independent of each other. Google Ads doesn't need Meta data. Klaviyo doesn't need Amazon data. They all need Shopify data (Phase 1 output) but nothing from each other.

GA4's job is reconciliation — comparing what ad platforms claim vs. what GA4 sees. It needs their evidence to do that. So it runs after Phase 2.

Website/CRO benefits from everything (ad platform landing page data, GA4 funnel data, Klaviyo popup/form data) so it goes last.

---

## Decision: Parallel vs. Sequential

Not every audit needs parallel execution. Use this decision tree:

- **3+ Phase 2 platforms active** → Run Phase 2 in parallel (significant time savings)
- **1-2 Phase 2 platforms active** → Run sequentially (subagent overhead not worth it)
- **Only 1 platform total** → Channel audit mode, no phases needed

---

## Subagent Dispatch Format

Each Phase 2 subagent is launched via the Agent tool. The orchestrator must front-load ALL context into the prompt — subagents cannot ask the user questions mid-audit.

### Required context per subagent:

```
SUBAGENT PROMPT TEMPLATE:
---
You are running a {platform} audit for {client_name}.

CLIENT CONTEXT:
- Client: {client_name}
- Department: {department} ({Agency} / {Brand})
- AOV tier: {aov_tier}
- Known focus areas: {focus_areas or "none specified"}
- Date range: {audit_date_range}
- Evidence output path: {evidence_directory}/{Client}_{platform}_evidence.json

SHOPIFY FINANCIAL ANCHORS (from Phase 1):
- Total revenue: ${revenue}
- AOV: ${aov}
- Total orders: {orders}
- COGS margin: {cogs_pct}% (if available)
- Break-even CPA: ${breakeven_cpa} (if calculated)
- Target ROAS: {target_roas} (if calculated)
- New vs returning customer split: {new_pct}% / {returning_pct}%

INSTRUCTIONS:
1. Read {platform_instruction_path}
2. Execute all phases per the platform skill instructions
3. Load playbook chunks as specified in the platform skill
4. Write the evidence JSON to the output path above
5. Use the Shopify financial anchors for profitability calculations

NOTE: You will NOT have access to other platform audit results.
Cross-channel pattern detection happens at synthesis time, not during
individual audits. Focus on this platform's data only.
---
```

### What the orchestrator does after dispatch:

1. Launch all Phase 2 subagents simultaneously (single message, multiple Agent tool calls)
2. Wait for all to complete
3. Check each evidence file exists and is valid JSON
4. Update manifest for each: Status → DONE (or IN PROGRESS if failed)
5. Proceed to Phase 3

---

## Cross-Channel Signals Tradeoff

**Current sequential model:** Each platform can read `cross_channel_signals` from previously completed platforms. E.g., Google Ads audit might note "branded search CPA spiked" and Meta audit picks that up.

**Parallel model:** Phase 2 platforms do NOT have each other's signals. They only have Shopify data.

**Why this is acceptable:** The synthesizer (`reference/synthesis/synthesizer.md`) already does full cross-channel pattern matching across ALL evidence files at report time. Platform-level cross-channel signals were a nice-to-have optimization, not a requirement. The synthesizer catches everything they would have caught.

**What changes:** Remove the "check previous platform signals" step from the dispatch protocol for Phase 2 audits. Keep it for Phase 3 (GA4) and Phase 4 (CRO), which DO receive all prior evidence.

---

## Context Window Benefits

Sequential mode: one context window holds ALL platform audits back-to-back. Deep audits (Google Ads, Meta) consume massive context, often forcing session breaks mid-audit.

Parallel mode: each subagent gets a fresh, full context window dedicated to ONE platform. This means:
- No context pressure from prior audits
- Each platform gets the full depth treatment
- No more "context running low, let's break here" mid-sequence

**Tradeoff:** Subagents can't ask the user clarifying questions. The orchestrator must front-load everything via the manifest. This is why Step 1.1 (gather client info) and Phase 1 (Shopify) must be thorough — everything downstream depends on them.

---

## Fallback Rules

### Shopify fails or is skipped (no access):
- Phase 2 runs WITHOUT profitability math (no break-even CPA, target ROAS, MER)
- Omit the "Shopify Financial Anchors" section from subagent prompts
- Add to manifest: `profitability_data: unavailable`
- Synthesizer notes: "Profitability analysis unavailable — no ecommerce platform data"

### A Phase 2 subagent fails:
- Mark that platform: Status → IN PROGRESS in manifest
- Do NOT block other Phase 2 platforms or Phase 3
- GA4 (Phase 3) runs with whatever evidence IS available
- Failed platform can be retried via `/audit [client]` resume mode

### ALL Phase 2 platforms fail:
- Skip Phase 3 (GA4 has nothing to reconcile)
- Jump to Phase 4 (CRO) if website is accessible, or straight to report
- Report will be limited to Shopify-only findings

### A subagent returns invalid/empty evidence:
- Treat same as failure — mark IN PROGRESS
- Log the error in manifest notes
- Continue with remaining phases

---

## What Changes vs. Current Sequential Model

| Aspect | Sequential (current) | Parallel (new) |
|---|---|---|
| Phase 2 execution | One at a time, shared context | Simultaneous subagents, isolated contexts |
| Cross-channel signals in Phase 2 | Available from prior platforms | NOT available (synthesizer handles it) |
| Context pressure | Cumulative, often forces session breaks | Fresh context per platform |
| User questions mid-audit | Can ask anytime | Must front-load all context |
| Manifest updates | After each platform | Batch update after Phase 2 completes |
| Dispatch protocol step 3 | "Check previous signals" | Skip for Phase 2; keep for Phases 3-4 |

**Everything else stays the same:** manifest format, evidence schema, platform instruction files, synthesizer logic, resume mode, report generation. This is an execution optimization, not an architecture change.
