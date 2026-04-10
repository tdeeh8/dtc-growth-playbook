# /audit-bigcommerce

Run a BigCommerce Control Panel audit — the financial source of truth for the modular audit system v2.

---

## When This Command Runs

The user invokes `/audit-bigcommerce` optionally followed by a client name (e.g., `/audit-bigcommerce Sample Brand`).

---

## Initialization

1. **Read the SKILL.md:** Load `.claude/skills/bigcommerce-audit-v2/SKILL.md` for the full audit procedure.
2. **Read the navigation reference:** Load `.claude/skills/bigcommerce-audit-v2/reference/nav-bigcommerce.md` for BigCommerce Control Panel UI patterns.
3. **Read the evidence schema:** Load `${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json` for the output contract.

---

## Gather Context

**If a client name was provided:**
- Look for an existing audit manifest:
  - `{Agency}/reports/{Client-Name}/evidence/{Client}_audit_manifest.md`
  - `{Own-Brand}/reports/evidence/{OwnBrand}_audit_manifest.md`
- If found: read it, extract client context, AOV tier, date range, known spend, focus areas.
- If not found: proceed as standalone audit — ask user for details.

**If no client name was provided:**
- Ask: "Which client? And do you have the BigCommerce admin URL?"

**Confirm before starting:**
- Client name
- BigCommerce Control Panel URL (or confirm it's already open in browser)
- Date range (default: last 90 days, or match manifest)
- Whether COGS is entered in BigCommerce (if user knows)
- Any specific focus areas (profitability, product analysis, customer retention, etc.)

---

## Load Playbook

Always:
- `${CLAUDE_PLUGIN_ROOT}/references/benchmarks.md` (profitability math, CM1/CM2/CM3, website/ecom benchmarks)
- `${CLAUDE_PLUGIN_ROOT}/references/measurement.md` (ecommerce platform = financial source of truth, MER, blended metrics)

Conditional:
- AOV $200+ → `${CLAUDE_PLUGIN_ROOT}/references/high-ticket.md`
- AOV <$100 → `${CLAUDE_PLUGIN_ROOT}/references/low-ticket.md`

---

## Execute Audit

Follow the phase structure from SKILL.md:

1. **Phase 1: Access & Inventory** — Confirm access, set dates, inventory available data, check Channel Manager
2. **Phase 2: Revenue & Orders** — Core financial metrics, trends, channel breakdown
3. **Phase 3: Product Performance** — Top products, concentration, margins (if COGS available), category analysis
4. **Phase 4: Customer Analysis** — New vs returning, purchase frequency, customer groups, LTV signals
5. **Phase 5: Profitability Metrics** — MER, blended CPA/ROAS, CM1/CM2/CM3, coupon/return impact
6. **Phase 6: Write Evidence JSON** — Structured output per evidence-schema.json with `"platform": "bigcommerce"`
7. **Phase 7: Update Manifest** — Mark BigCommerce as DONE (if manifest exists)

Maintain working notes throughout: `{Client}_bigcommerce_audit_notes.md` in the evidence directory.

---

## Output Files

| File | Location | Purpose |
|---|---|---|
| `{Client}_bigcommerce_evidence.json` | Evidence directory | Standardized evidence for synthesizer |
| `{Client}_bigcommerce_audit_notes.md` | Evidence directory | Working scratchpad / audit trail |
| `{Client}_audit_manifest.md` | Evidence directory | Updated status (if exists) |

Evidence directory paths:
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

---

## Completion Message

When the audit finishes, report to the user:

```
BigCommerce audit complete for {Client}.

Key findings:
- [Top 2-3 findings in plain language]

Evidence file: {path to JSON}
Working notes: {path to notes}

BigCommerce data is now the financial anchor. The synthesizer will use these numbers
to validate platform-reported revenue and build the profitability framework.

Next suggested step: [whatever platform audit is next per manifest, or /audit-synthesize if this is the last one]
```

---

## Error Handling

- **Can't access BigCommerce Control Panel:** Record `access_level: "screenshot-only"` in evidence meta. Ask user to navigate and share screenshots. Extract what's possible from screenshots — label all metrics as OBSERVED with source noting screenshot-based extraction.
- **COGS not entered:** Proceed with revenue-only analysis. Use vertical COGS estimates from benchmarks.md, labeled as ASSUMPTION. Add to open_questions.
- **Limited date range available:** Use whatever is available. Note the limitation in `meta.auditor_notes`. Adjust trend analysis accordingly.
- **Customer data insufficient for cohort analysis:** Record what's available, label gaps as DATA_NOT_AVAILABLE. LTV section becomes estimates/inferences.
- **Analytics not available (plan limitation):** Fall back to Orders section for revenue data extraction. Use order export if needed. Note reduced analytics depth in `meta.auditor_notes`.
- **API fallback needed:** If browser extraction is insufficient for large datasets, note that BigCommerce API v3 endpoints can be used. See `nav-bigcommerce.md` for endpoint reference. Requires API credentials from the client.
- **Session running long:** If approaching context limits, prioritize completing through Phase 5 (Profitability Metrics) and writing the evidence JSON. Product and customer deep-dives can be noted as surface-level with a flag for follow-up.
