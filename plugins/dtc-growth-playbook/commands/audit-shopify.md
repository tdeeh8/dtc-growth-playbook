---
description: Run a Shopify admin audit — financial source of truth for the modular audit system
argument-hint: "[client name]"
---

# /audit-shopify

Run a Shopify admin audit — the financial source of truth for the modular audit system v2.

---

## When This Command Runs

The user invokes `/audit-shopify` optionally followed by a client name (e.g., `/audit-shopify Kodiak Leather`).

---

## Initialization

1. **Read the SKILL.md:** Load `.claude/skills/shopify-audit-v2/SKILL.md` for the full audit procedure.
2. **Read the navigation reference:** Load `.claude/skills/shopify-audit-v2/reference/nav-shopify.md` for Shopify admin UI patterns.
3. **Read the evidence schema:** Load `.claude/skills/audit-orchestrator/reference/evidence-schema.json` for the output contract.

---

## Gather Context

**If a client name was provided:**
- Look for `{Client}_audit_manifest.md` in known evidence directories, or ask user for evidence path
- **If found:** Read manifest for department, AOV, platform URL, known issues. Pre-fill — don't re-ask. Tell user: "Found manifest. Using [AOV], [platform URL]. Starting audit."
- **If not found:** Standard setup — ask user for details, or suggest: "Run `/audit {Client}` first for full setup."

**If no client name was provided:**
- Ask: "Which client? And do you have the Shopify admin URL?"

**Confirm before starting:**
- Client name
- Shopify admin URL (or confirm it's already open in browser)
- Date range (default: last 90 days, or match manifest)
- Whether COGS is entered in Shopify (if user knows)
- Any specific focus areas (profitability, product analysis, customer retention, etc.)

---

## Load Playbook

Always:
- `references/benchmarks.md` (profitability math, CM1/CM2/CM3, website/ecom benchmarks)
- `references/measurement.md` (Shopify = financial source of truth, MER, blended metrics)

Conditional:
- AOV $200+ → `references/high-ticket.md`
- AOV <$100 → `references/low-ticket.md`

---

## Execute Audit

Follow the phase structure from SKILL.md:

1. **Phase 1: Access & Inventory** — Confirm access, set dates, inventory available data
2. **Phase 2: Revenue & Orders** — Core financial metrics, trends, channel breakdown
3. **Phase 3: Product Performance** — Top products, concentration, margins (if COGS available)
4. **Phase 4: Customer Analysis** — New vs returning, purchase frequency, LTV signals
5. **Phase 5: Profitability Metrics** — MER, blended CPA/ROAS, CM1/CM2/CM3, discount/return impact
6. **Phase 6: Write Evidence JSON** — Structured output per evidence-schema.json
7. **Phase 7: Update Manifest** — Mark Shopify as DONE (if manifest exists)

Maintain working notes throughout: `{Client}_shopify_audit_notes.md` in the evidence directory.

---

## Output Files

| File | Location | Purpose |
|---|---|---|
| `{Client}_shopify_evidence.json` | Evidence directory | Standardized evidence for synthesizer |
| `{Client}_shopify_audit_notes.md` | Evidence directory | Working scratchpad / audit trail |
| `{Client}_audit_manifest.md` | Evidence directory | Updated status (if exists) |

Evidence directory: from manifest or `reports/{Client-Name}/evidence/`

---

## Completion Message

When the audit finishes, report to the user:

```
Shopify audit complete for {Client}.

Key findings:
- [Top 2-3 findings in plain language]

Evidence file: {path to JSON}
Working notes: {path to notes}

Shopify data is now the financial anchor. The synthesizer will use these numbers
to validate platform-reported revenue and build the profitability framework.

Next suggested step: [whatever platform audit is next per manifest, or /audit-synthesize if this is the last one]
```

---

## After This Audit

- **Continue:** `/audit-resume {Client}` — see what's next
- **Report now:** `/audit-synthesize {Client}` — works with 1+ evidence files
- **Check progress:** `/audit {Client}`

---

## Error Handling

- **Can't access Shopify admin:** Record `access_level: "screenshot-only"` in evidence meta. Ask user to navigate and share screenshots. Extract what's possible from screenshots — label all metrics as OBSERVED with source noting screenshot-based extraction.
- **COGS not entered:** Proceed with revenue-only analysis. Use vertical COGS estimates from benchmarks.md, labeled as ASSUMPTION. Add to open_questions.
- **Limited date range available:** Use whatever is available. Note the limitation in `meta.auditor_notes`. Adjust trend analysis accordingly.
- **Customer data insufficient for cohort analysis:** Record what's available, label gaps as DATA_NOT_AVAILABLE. LTV section becomes estimates/inferences.
- **Session running long:** If approaching context limits, prioritize completing through Phase 5 (Profitability Metrics) and writing the evidence JSON. Product and customer deep-dives can be noted as surface-level with a flag for follow-up.
