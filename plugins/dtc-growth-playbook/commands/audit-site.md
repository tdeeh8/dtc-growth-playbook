# /audit-site — Website CRO & Conversion Path Audit

Run a structured website CRO audit using browser tools. Navigates the actual client site, takes screenshots, evaluates conversion elements page by page, and outputs a standardized JSON evidence file.

## Usage

```
/audit-site [client name] [website URL]
/audit-site Acme Co https://acme-co.com
/audit-site                  (will prompt for details)
```

## What This Command Does

1. Loads playbook benchmarks (benchmarks.md + high-ticket.md if AOV $200+)
2. Reads CRO checklist and mobile checklist reference files
3. Opens the client website in the browser
4. Walks through the full conversion path: homepage > collections > product pages > cart > checkout
5. Audits mobile experience
6. Assesses cross-channel landing page alignment
7. Checks page speed / Core Web Vitals (if tools available)
8. Outputs a `{Client}_website-cro_evidence.json` file

## What This Command Does NOT Do

- Does not generate a report (the audit-synthesizer does that via `/audit-synthesize`)
- Does not audit GA4, Meta Ads, Google Ads, or any other platform (those are separate `/audit-*` commands)
- Does not complete a purchase on the site

## Prerequisites

- **Claude in Chrome browser tools** must be enabled — this skill navigates the actual website
- Website URL must be accessible (not behind a login wall, unless credentials are provided)

## Required Information

The command needs these details (will ask if not provided):

| Field | Required? | Notes |
|-------|-----------|-------|
| Client name | Yes | Used for evidence file naming |
| Website URL | Yes | The storefront URL to audit |
| AOV (approximate) | Yes | Determines benchmark tier and high-ticket checklist loading |
| Business vertical | Helpful | Contextualizes benchmarks |
| Known issues | Optional | Focus areas or suspected problems |
| Ad landing page URLs | Optional | For cross-channel message match assessment |

## Output

**Evidence file:** `{Client}_website-cro_evidence.json`

Saved to the client's evidence directory:
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

The evidence file conforms to the v2 audit evidence schema and contains:
- Page-by-page conversion element assessment (findings)
- Mobile experience evaluation
- Cross-channel signals for the synthesizer
- Prioritized CRO opportunities with evidence
- Open questions needing GA4/Shopify data to answer

## Integration with Audit System

This is one module in the v2 modular audit system:

```
/audit-start          → Creates manifest, plans audit sequence
/audit-shopify        → Financial source of truth
/audit-google-ads     → Google Ads deep dive
/audit-meta           → Meta Ads deep dive
/audit-ga4            → GA4 analytics deep dive
/audit-klaviyo        → Email/SMS deep dive
/audit-site           → THIS COMMAND (website CRO)
/audit-amazon         → Amazon Ads deep dive
/audit-synthesize     → Cross-channel synthesis + report generation
```

Can run standalone (without `/audit-start`) or as part of a full multi-platform audit. When run as part of the system, reads the audit manifest for client context and updates it upon completion.

## Activation

When this command is invoked, read and follow the full instructions in:
`skills/site-audit-v2/SKILL.md`
