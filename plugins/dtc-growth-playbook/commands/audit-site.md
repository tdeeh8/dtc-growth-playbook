---
description: Run a website CRO and conversion path audit using browser tools
argument-hint: "[client URL]"
---

# /audit-site — Website CRO & Conversion Path Audit

Run a structured website CRO audit using browser tools. Navigates the actual client site, takes screenshots, evaluates conversion elements page by page, and outputs a standardized JSON evidence file.

## Usage

```
/audit-site [client name] [website URL]
/audit-site Kodiak Leather https://kodiak-leather.com
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

## Smart Startup

Before asking for any info, check for an existing manifest:

1. Look for `{Client}_audit_manifest.md` in known evidence directories, or ask user for evidence path
2. **If found:** Read manifest for department, AOV, platform URL, known issues. Pre-fill — don't re-ask. Tell user: "Found manifest. Using [AOV], [platform URL]. Starting audit."
3. **If not found:** Standard setup (AskUserQuestion), or suggest: "Run `/audit {Client}` first for full setup."

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

Saved to: evidence directory from manifest or `reports/{Client-Name}/evidence/`

The evidence file conforms to the v2 audit evidence schema and contains:
- Page-by-page conversion element assessment (findings)
- Mobile experience evaluation
- Cross-channel signals for the synthesizer
- Prioritized CRO opportunities with evidence
- Open questions needing GA4/Shopify data to answer

## After This Audit

- **Continue:** `/audit-resume {Client}` — see what's next
- **Report now:** `/audit-synthesize {Client}` — works with 1+ evidence files
- **Check progress:** `/audit {Client}`

## Activation

When this command is invoked, read and follow the full instructions in:
`.claude/skills/site-audit-v2/SKILL.md`
