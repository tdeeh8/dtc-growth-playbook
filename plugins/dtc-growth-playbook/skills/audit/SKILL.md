---
name: audit
description: "The single entry point for all marketing audits. Use this skill whenever the user mentions 'audit' in any context — full multi-platform audits, single-channel deep dives, checking audit progress, generating audit reports, or any request to evaluate a client's marketing performance. Triggers on: '/audit', 'audit', 'full audit', 'audit this client', 'start an audit', 'audit their [platform]', 'audit Meta', 'audit Google Ads', 'audit Shopify', 'audit Klaviyo', 'audit GA4', 'audit their site', 'audit Amazon', 'audit BigCommerce', 'CRO audit', 'channel audit', 'what audits do I need to run', 'audit status', 'generate the audit report', 'synthesize the audit', 'cross-channel analysis', or pasting a platform URL with audit intent. This skill routes everything — the user never needs to invoke individual platform skills directly."
---

# Audit System — Single Entry Point

> One command: `/audit`. This skill handles full multi-platform audits, single-channel deep dives, progress checks, and report generation. Users never need to know about individual platform skills — this orchestrator reads platform instruction files and executes them directly.

---

## How It Works

The user types `/audit` (with optional context), and this skill figures out what to do. There are four modes, detected automatically from context:

| What the user says | Mode | What happens |
|---|---|---|
| `/audit` | **Full Audit** | Interviews the user, creates manifest, runs platforms in sequence, auto-generates report |
| `/audit Kodiak Leather` (no manifest exists) | **Full Audit** | Same as above, pre-fills client name |
| `/audit Kodiak Leather` (manifest exists) | **Resume** | Reads manifest, reports progress, continues next platform |
| `/audit` + pastes a platform URL | **Channel Audit** | Auto-detects platform from URL, runs that single audit |
| "audit their Meta" / "audit Google Ads" | **Channel Audit** | Runs one platform, offers to generate report after |
| "generate the audit report" / "synthesize" | **Report** | Reads all evidence files, generates cross-channel report |

---

## Step 0: Detect Mode

Read the user's message and check for existing state. This determines which mode to enter.

### Check for existing manifest:
1. Determine client name from the user's message (if provided)
2. Search for `{Client}_audit_manifest.md` in likely locations:
   - `Disruptive-Advertising/reports/{Client-Name}/evidence/`
   - `Pill-Pod/reports/evidence/`
3. If found → manifest exists. If not → no manifest.

### Mode routing:

**Full Audit** — Enter this mode when:
- "full audit", "audit this client", "start an audit for [client]", "run all the audits"
- User provides a client name but no specific platform, and no manifest exists
- `/audit` with no arguments (will ask for client name)

**Resume** — Enter this mode when:
- User says `/audit [client]` and a manifest already exists
- "audit status", "where are we", "what's left", "what audits are done"
- "continue the audit", "pick up where we left off"

**Channel Audit** — Enter this mode when:
- A specific platform is mentioned: Meta, Google Ads, Shopify, Klaviyo, GA4, Amazon, BigCommerce, site/CRO
- A platform URL is pasted (see URL routing table below)
- "just audit their [platform]", "check their [platform]"

**Report** — Enter this mode when:
- "generate the report", "synthesize the audit", "write up the audit", "cross-channel analysis"
- "finalize the audit", "combine the findings"
- All platforms in an existing manifest are DONE (auto-triggered after Resume mode detects this)

### URL auto-detection:

If the user pastes a URL, match it against this table to determine the platform:

| URL contains | Platform | Skill to read |
|---|---|---|
| `ads.google.com` | Google Ads | `reference/platforms/google-ads.md` |
| `business.facebook.com`, `adsmanager.facebook.com`, `facebook.com/adsmanager` | Meta Ads | `reference/platforms/meta-ads.md` |
| `analytics.google.com` | GA4 | `reference/platforms/ga4.md` |
| `app.klaviyo.com` | Klaviyo | `reference/platforms/klaviyo.md` |
| `admin.shopify.com`, `.myshopify.com` | Shopify | `reference/platforms/shopify.md` |
| `store-*.mybigcommerce.com`, `login.bigcommerce.com` | BigCommerce | `reference/platforms/bigcommerce.md` |
| `advertising.amazon.com`, `sellercentral.amazon.com` | Amazon Ads | `reference/platforms/amazon-ads.md` |
| Any other domain (e.g., `www.clientsite.com`) | Website/CRO | `reference/platforms/site.md` |

If the URL is ambiguous, ask: "That looks like [domain]. Should I run a [detected platform] audit, or a website/CRO audit?"

### Ambiguity rules:
- "audit" with no client name → ask which client
- "audit" with client name but no platform, and manifest exists → Resume mode
- "Amazon" in audit context → Amazon Ads (not website)

---

## Mode 1: Full Audit

### Step 1.1: Gather Client Info

Use AskUserQuestion to collect what's needed. Be efficient — one question with multiple fields, not a long interview.

**Required:**
- **Client name** — Confirm PascalCase-With-Dashes version (e.g., "Kodiak Leather" → `Kodiak-Leather`)
- **Department** — Disruptive Advertising or Pill Pod?
- **Platforms accessible** — checkboxes:
  - [ ] Shopify
  - [ ] BigCommerce
  - [ ] Google Ads
  - [ ] Meta Ads
  - [ ] Amazon Ads / Seller Central
  - [ ] GA4
  - [ ] Klaviyo
  - [ ] Website (always available — pre-check this)
- **AOV tier** — Under $100 / $100-200 / Over $200 (or TBD — Shopify audit will determine it)
- **Known focus areas** — anything specific? (e.g., "ROAS dropping", "PMax cannibalizing branded")

**Optional:** Monthly revenue, monthly ad spend, business type/vertical, key products

If the user already provided info in their message, pre-fill and only ask for gaps. Don't re-ask what you already know.

### Step 1.2: Create Manifest + Evidence Directory

1. Create the evidence directory:
   - Disruptive: `Disruptive-Advertising/reports/{Client-Name}/evidence/`
   - Pill Pod: `Pill-Pod/reports/evidence/`
2. Create `{Client}_audit_manifest.md` using the format in `reference/manifest-format.md`
3. Set accessible platforms to `NOT STARTED`, inaccessible to `NO ACCESS`

### Step 1.3: Present the Plan and Start

Tell the user briefly:
- Which platforms will be audited and in what order
- That you'll start now and work through them
- If context runs out, they just say `/audit [client]` in a new chat to resume

**Then immediately start the first platform audit.** Don't wait for the user to run another command.

### Step 1.4: Run Platform Audits (Sequential)

Work through each platform in the order below (skip any with NO ACCESS):

| Order | Platform | Skill to read | Why this order |
|---|---|---|---|
| 1 | Shopify (or BigCommerce) | `reference/platforms/shopify.md` (or `reference/platforms/bigcommerce.md`) | Financial source of truth — anchors profitability math |
| 2 | Google Ads | `reference/platforms/google-ads.md` | Usually largest ad spend |
| 3 | Meta Ads | `reference/platforms/meta-ads.md` | TOF pipeline, creative performance |
| 4 | Amazon Ads | `reference/platforms/amazon-ads.md` | Only if they sell on Amazon |
| 5 | GA4 | `reference/platforms/ga4.md` | Cross-platform traffic reconciliation |
| 6 | Klaviyo | `reference/platforms/klaviyo.md` | Email/SMS retention engine |
| 7 | Website/CRO | `reference/platforms/site.md` | Benefits from having all other data first |

**For each platform:**
1. Read the platform's SKILL.md 
2. Execute it phase by phase, using the manifest context (client name, AOV, department, evidence path) so you don't re-ask the user for info they already provided
3. Before starting, check if previous platforms left `cross_channel_signals` in their evidence — carry those forward as context
4. Write the evidence JSON file when done
5. Update the manifest: Status → DONE, fill in Evidence File and Date Completed
6. Move to the next platform

**Context window awareness:** After completing each platform, assess whether there's enough context remaining for the next one. Deep audits (Google Ads, Meta) consume more context than lighter ones (GA4, site). If context is getting long:
- Save all progress (evidence JSON + manifest are already saved)
- Tell the user: "Completed [platforms done]. Start a new chat and say `/audit [client]` to continue. Next up: [next platform]."
- The manifest makes resume seamless — nothing is lost.

### Step 1.5: Auto-Generate Report

After all platforms are DONE (or the user says "that's enough, just give me the report"):

1. Read `reference/synthesis/synthesizer.md`
2. Follow its instructions to generate the cross-channel report
3. The synthesizer handles everything: cross-channel patterns, profitability framework, anti-hallucination verification
4. Save the report and update the manifest

The user never needs to trigger this separately — it just happens when the auditing is done.

---

## Mode 2: Channel Audit (Single Platform)

For when the user wants just one platform audited.

### Step 2.1: Identify the Platform

Map the user's request to a platform skill:

| User says... | Skill to read |
|---|---|
| "Meta", "Facebook Ads", "Meta Ads" | `reference/platforms/meta-ads.md` |
| "Google Ads", "Google", "PMax", "Search campaigns" | `reference/platforms/google-ads.md` |
| "Shopify", "their store", "store data" | `reference/platforms/shopify.md` |
| "BigCommerce" | `reference/platforms/bigcommerce.md` |
| "Klaviyo", "email", "email marketing", "flows" | `reference/platforms/klaviyo.md` |
| "GA4", "Google Analytics", "analytics" | `reference/platforms/ga4.md` |
| "Amazon", "Amazon Ads", "Seller Central" | `reference/platforms/amazon-ads.md` |
| "site", "website", "CRO", "landing pages" | `reference/platforms/site.md` |

Or use the URL auto-detection table from Step 0.

### Step 2.2: Gather Minimal Context

If no manifest exists, collect just what's needed:
- Client name + department
- AOV tier (or TBD)
- Platform access link/ID
- Any known focus areas

Create a lightweight manifest with Audit Type: `Platform-specific`.

If a manifest already exists from a prior audit, use its context — don't re-ask.

### Step 2.3: Run the Platform Audit

1. Read the platform's SKILL.md
2. Execute it fully (all phases)
3. Write evidence JSON
4. Update manifest

### Step 2.4: Offer to Generate Report

After the platform audit completes:
- "Done with [platform]. Want me to generate a report with findings and recommendations?"
- If yes → read `reference/synthesis/synthesizer.md` and run it (single-platform mode — no cross-channel analysis, but still structured findings + opportunities)
- If no → deliver a verbal summary of key findings and the evidence JSON location

---

## Mode 3: Resume

When a manifest already exists for the requested client.

### Step 3.1: Read and Report Status

Read `{Client}_audit_manifest.md`. Summarize:
- **Done:** Which platforms are complete (with dates)
- **Remaining:** Which are NOT STARTED
- **In Progress:** Any that started but didn't finish
- **Skipped/No Access:** Note these

### Step 3.2: Auto-Continue

**If there are remaining platforms:**
- "Next up is [platform]. Running it now."
- Immediately dispatch that platform's audit (follow Mode 1, Step 1.4 for that platform)
- Continue through remaining platforms in order

**If ALL platforms are DONE (or SKIPPED):**
- "All platform audits are complete. Generating your report now."
- Proceed to report generation (Mode 1, Step 1.5)

**If the user wants to re-audit a platform:**
- Warn that the existing evidence will be overwritten
- Suggest renaming the old file first if they want to compare
- Then re-run that platform

**If the user wants to add a platform:**
- Add it to the manifest as NOT STARTED
- Run it now or queue it in the sequence

---

## Mode 4: Report

When the user explicitly asks for the report or synthesis.

### Step 4.1: Find Evidence

Look for `*_evidence.json` files in the client's evidence directory. Count them.
- **0 files:** "No evidence files found. Let's run at least one platform audit first. Which platform should we start with?"
- **1+ files:** Proceed to synthesis

### Step 4.2: Generate the Report

1. Read `reference/synthesis/synthesizer.md`
2. Follow its instructions completely (it handles single-platform and multi-platform modes)
3. Save the report, update the manifest
4. Deliver the report with a 3-5 sentence verbal summary of the headline findings

---

## Dispatch Protocol

This is how the orchestrator executes a platform audit. It applies in Modes 1, 2, and 3 whenever a platform audit runs.

### Before reading the platform skill:
1. Confirm the manifest has this platform as NOT STARTED or IN PROGRESS
2. Gather from the manifest: client name, AOV tier, department, evidence directory path, focus areas
3. Check if previously completed platforms have `cross_channel_signals` in their evidence — read those signals so you can be aware of them during this audit

### Reading and executing the platform skill:
1. Read the platform's SKILL.md 
2. The skill contains phase-by-phase instructions — follow them in order
3. Use the manifest context (client name, AOV, department, evidence path) instead of re-asking the user
4. The skill will reference playbook chunks to load — load them as instructed
5. The skill will reference its own `reference/` files — read those as instructed

### After the platform audit completes:
1. Verify the evidence JSON was saved to the evidence directory
2. Update the manifest: Status → DONE, Evidence File → filename, Date Completed → today
3. Note any `cross_channel_signals` from the new evidence for upcoming audits
4. Proceed to the next platform (or report generation if this was the last one)

### If a platform audit fails or can't complete:
1. Update manifest: Status → IN PROGRESS, note what was accomplished
2. Save any partial evidence or working notes
3. Tell the user what happened and what's needed to retry
4. Proceed to the next platform — the failed one can be retried later via `/audit [client]`

---

## Rules

### This skill is the router AND the executor
- It reads platform instruction files and follows their instructions directly
- It handles all sequencing, progress tracking, and report generation
- The user never needs to know individual skill names exist

### The user only needs to know:
- `/audit` starts, continues, or finishes any audit
- They can paste URLs and the system figures out what platform it is
- If context runs out, start a new chat and say `/audit [client]` to resume
- The report generates automatically when auditing is done

### File routing
- Disruptive evidence: `Disruptive-Advertising/reports/{Client-Name}/evidence/`
- Pill Pod evidence: `Pill-Pod/reports/evidence/`
- Reports: same parent directory as evidence (`reports/{Client-Name}/`)
- PascalCase-With-Dashes for client folder names

### Data integrity (applies to all platform audits run through this orchestrator)
- Every number must cite its source
- Never invent numbers — say "No data available" if missing
- Show calculation formulas (e.g., "ACoS = $102 / $450 = 22.7%")
- Save raw data snapshots after audits
- Handle gaps honestly — never fill with assumptions unless asked

### Context window management
- Each deep platform audit (Google Ads, Meta) can consume significant context
- After each platform, assess remaining capacity
- Save progress and recommend a session break rather than rush and produce poor evidence
- The manifest is the checkpoint system — it makes resume seamless

---

## Playbook Loading

The orchestrator itself does NOT load playbook chunks. Each platform's SKILL.md specifies which chunks to load when it runs. The synthesizer loads cross-channel chunks (`channel-allocation.md`, `measurement.md`, `benchmarks.md`).

This keeps context lean — only the knowledge needed for the current platform is loaded at any time.

---

## Error Handling

**User says "audit" without client or platform:**
→ Ask: "Which client? And do you want a full audit or just one channel?"

**Manifest is corrupted or unreadable:**
→ Re-create from scratch. Ask user to confirm platform access.

**Evidence files exist but no manifest:**
→ Create a manifest retroactively. Mark platforms DONE based on existing evidence files. Ask if they want to continue or re-audit.

**Platform audit fails mid-session:**
→ Save partial progress. Mark IN PROGRESS. Continue to next platform. On resume, IN PROGRESS platforms get re-attempted.

**User wants to add a platform after audit started:**
→ Add to manifest as NOT STARTED. Run it in sequence or immediately per user preference.

**"Audit their Google Ads" but Google Ads already DONE in manifest:**
→ "Google Ads was already audited on [date]. Want me to re-run it? The old evidence will be overwritten."
