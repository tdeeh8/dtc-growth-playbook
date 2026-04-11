# Audit Manifest Format — Reference Spec

The audit manifest is the human-readable tracker for a client audit. It lives alongside the JSON evidence files and tracks what's been audited, what's pending, and client context.

---

## File Naming

**Pattern:** `{Client}_audit_manifest.md`

**Examples:**
- `Example-Client_audit_manifest.md`
- `Acme-Brand_audit_manifest.md`
- `In-House-Brand_audit_manifest.md`

Use the PascalCase-With-Dashes client folder name as the prefix (per your workspace naming rules).

---

## File Location

| Department | Path |
|---|---|
| agency client | `Agency-Clients/reports/{Client-Name}/evidence/` |
| In-House Brand | `In-House-Brand/reports/evidence/` |

The manifest lives in the same `evidence/` directory as the JSON evidence files.

---

## Template

```markdown
# {Client Name} — Audit Manifest

**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Audit Type:** Full / Platform-specific
**AOV Tier:** Over $200 / $100-200 / Under $100
**Department:** Agency-Clients / In-House-Brand

## Platforms

| Platform | Status | Evidence File | Date Completed | Session |
|----------|--------|---------------|----------------|---------|
| Shopify | NOT STARTED | — | — | — |
| Google Ads | NOT STARTED | — | — | — |
| Meta Ads | NOT STARTED | — | — | — |
| Amazon Ads | NOT STARTED | — | — | — |
| GA4 | NOT STARTED | — | — | — |
| Klaviyo | NOT STARTED | — | — | — |
| Website/CRO | NOT STARTED | — | — | — |

## Platform Access

| Platform | URL / Account ID | Access Level | Notes |
|----------|-----------------|--------------|-------|
| — | — | — | — |

## Client Context

- **Business:** {type, vertical}
- **AOV:** ${X}
- **Monthly Revenue:** ${X} (if known)
- **Monthly Ad Spend:** ${X} (if known)
- **Key Products/Categories:** {list}
- **Known Issues / Focus Areas:** {what the client/AM cares about}

## Synthesis Status

- [ ] All platform audits complete (or skipped with reason)
- [ ] Evidence files validated
- [ ] Synthesizer run
- [ ] Report generated
- [ ] Report verified
```

---

## Field Definitions

### Platform Status Values

| Status | Meaning |
|---|---|
| `NOT STARTED` | Platform is in scope but audit hasn't begun. |
| `IN PROGRESS` | Audit is currently underway (skill is running or was interrupted). |
| `DONE` | Audit complete, evidence JSON written and validated. |
| `SKIPPED` | Platform intentionally excluded — add reason in Notes column or Session column. |
| `NO ACCESS` | Platform is relevant but we don't have access. Flag for the AM. |

### Evidence File Column

When a platform audit completes, this column gets the filename of the JSON evidence file:
- Pattern: `{Client}_{platform}_evidence.json`
- Example: `Example-Client_google-ads_evidence.json`

Platform keys must match the `meta.platform` enum in `evidence-schema.json`:
`google-ads`, `meta-ads`, `ga4`, `klaviyo`, `shopify`, `amazon-ads`, `website-cro`

### AOV Tier

Determines which playbook chunks to load:
- **Over $200** → Load `high-ticket.md` (longer sales cycles, BNPL, financing, social proof patterns)
- **$100-200** → Standard benchmarks
- **Under $100** → Load `low-ticket.md` (impulse purchase optimization, volume strategies)

### Audit Type

- **Full** — Multi-platform audit with synthesis planned. Orchestrator sets up all relevant platforms.
- **Platform-specific** — Single platform audit (e.g., just Google Ads). Still uses the synthesizer for report generation, but no cross-channel analysis.

---

## Update Rules

1. **Platform skills update the manifest** when they complete — changing Status to `DONE`, filling in Evidence File and Date Completed.
2. **The orchestrator updates the manifest** when re-invoked — it reads the current state and reports progress.
3. **The synthesizer reads the manifest** to know what evidence files to expect and what was skipped.
4. **Never delete rows** — if a platform is removed from scope, set it to `SKIPPED` with a reason.
5. **Last Updated date** changes on every manifest edit.

---

## Suggested Platform Order

The orchestrator suggests this order based on data dependencies:

1. **Shopify** — Financial source of truth. Revenue, AOV, orders, refunds. Every other platform's numbers get compared against this.
2. **Google Ads** — Usually the largest ad spend. PMax, Search, Shopping.
3. **Meta Ads** — Second largest ad platform. TOF/MOF/BOF structure, creative performance.
4. **Amazon Ads** — If applicable (In-House Brand, or agency clients selling on Amazon).
5. **GA4** — Cross-platform traffic view. Attribution comparison vs ad platforms.
6. **Klaviyo** — Email/SMS. Revenue attribution, flow health, list health.
7. **Website/CRO** — Last because it benefits from knowing traffic quality and conversion data from other platforms first.

Skip platforms the client doesn't use. Amazon only applies if they sell on Amazon.
