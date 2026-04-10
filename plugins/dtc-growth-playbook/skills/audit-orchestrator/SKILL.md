# Audit Orchestrator — SKILL.md

> **Trigger phrases:** "full audit", "audit this client", "start an audit for [client]", "what audits do I need to run", "audit status", "where are we on the audit", "set up an audit"
>
> **Slash command:** `/audit-start`
>
> **What this skill does:** Creates and tracks audit manifests. It is a planner and progress tracker ONLY — it never opens platforms, extracts data, or diagnoses anything.

---

## When This Skill Activates

This skill activates when the user wants to:
1. **Start a new audit** for a client (creates manifest + evidence directory)
2. **Check progress** on an existing audit (reads manifest, reports status)
3. **Figure out what to run next** (reads manifest, suggests next platform skill)

This skill does NOT activate for:
- Running a specific platform audit (those are separate skills: google-ads-v2, meta-ads-v2, etc.)
- Generating the final report (that's the audit-synthesizer)
- Quick one-off questions about a client's account

---

## Step 1: Detect Mode (New vs. Existing)

Before doing anything, check if a manifest already exists for this client.

**How to check:**
- Determine the client name and department ({Agency} or {Own Brand})
- Look for `{Client}_audit_manifest.md` in the evidence directory:
  - {Agency}: `{Agency}/reports/{Client-Name}/evidence/`
  - {Own Brand}: `{Own-Brand}/reports/evidence/`

**If manifest EXISTS → Go to Step 4 (Progress Check)**
**If manifest DOES NOT EXIST → Go to Step 2 (Gather Info)**

---

## Step 2: Gather Client Info

Use AskUserQuestion to collect the following. Ask in a single question with multiple-choice where possible, free-text where needed.

**Required:**
- **Client name** — Used for folder naming and manifest. Confirm the PascalCase-With-Dashes version (e.g., "Acme Co" → `Acme-Co`).
- **Department** — {Agency} or {Own-Brand}? (If {Own Brand}, this is always Tanner's own brand — no need to ask, just confirm.)
- **Platforms accessible** — Which of these does the user have access to? Check all that apply:
  - Shopify (admin access?)
  - Google Ads (MCC or direct?)
  - Meta Ads Manager
  - Amazon Ads / Seller Central
  - GA4
  - Klaviyo
  - Website (public — always available)
- **Platform links/IDs** — For each accessible platform, get the URL or account ID.
- **AOV tier** — Over $200 / $100-200 / Under $100. If unknown, mark as TBD and the Shopify audit will determine it.
- **Known focus areas** — Any specific concerns? (e.g., "ROAS is dropping", "think PMax is cannibalizing branded", "conversion rate tanked last month")

**Optional but helpful:**
- Monthly revenue (approximate)
- Monthly ad spend (approximate)
- Business type / vertical
- Key products or categories

If the user provides a client name with their initial message (e.g., "start an audit for Acme Co"), pre-fill what you can and only ask for missing info.

---

## Step 3: Create Manifest + Evidence Directory

Once you have the info:

### 3a. Create the evidence directory

Determine the correct path per your file routing rules:
- {Agency} client: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`

If the client folder doesn't exist yet ({Agency} clients), create it.

### 3b. Create the manifest

Read the manifest format spec at:
```
${CLAUDE_PLUGIN_ROOT}/references/manifest-format.md
```

Create `{Client}_audit_manifest.md` in the evidence directory using the template. Fill in:
- All metadata fields from what the user provided
- Platform rows: set accessible platforms to `NOT STARTED`, inaccessible ones to `NO ACCESS` or remove them
- Platform Access table with URLs/IDs provided
- Client Context section with known info
- Synthesis Status: all unchecked

### 3c. Present the audit plan

Tell the user:
1. What was created (manifest location, evidence directory)
2. The suggested audit order — only listing platforms they have access to:

**Suggested order:**
1. `/audit-shopify` — Financial source of truth, do first
2. `/audit-google-ads` — Usually largest spend
3. `/audit-meta` — TOF/MOF/BOF structure, creative
4. `/audit-amazon` — Only if they sell on Amazon
5. `/audit-ga4` — Cross-platform traffic reconciliation
6. `/audit-klaviyo` — Email/SMS retention
7. `/audit-site` — CRO, benefits from having all other data first

**Tell the user:**
- Each platform audit runs independently in its own session
- They can run them in any order, but the suggested order is optimal
- If context runs out mid-audit, they can pick up where they left off
- When all platforms are done (or skipped), run `/audit-synthesize` for the cross-channel report
- They can re-run `/audit-start {client}` anytime to check progress

---

## Step 4: Progress Check (Existing Manifest)

When a manifest already exists:

### 4a. Read the manifest

Read `{Client}_audit_manifest.md` from the evidence directory.

### 4b. Report status

Summarize clearly:
- **Done:** Which platforms are complete (with dates)
- **Remaining:** Which are NOT STARTED
- **In Progress:** Any that were started but not finished
- **Skipped/No Access:** Note these

### 4c. Suggest next step

Based on the suggested order, tell the user which platform to run next:
- "Next up: `/audit-google-ads` — run it whenever you're ready."

If ALL platform audits are DONE (or SKIPPED):
- "All platform audits are complete. Run `/audit-synthesize {client}` to generate the cross-channel report."

If some are DONE and the user seems ready to synthesize early:
- "You have {N} platforms done. You can run `/audit-synthesize` now for a partial report, or finish the remaining platforms first for full cross-channel analysis."

---

## Important Rules

### This skill is a PLANNER only
- Never open any platform tabs or browser windows
- Never extract data from any platform
- Never make diagnostic claims about the client's account
- Never generate reports

### File routing (per your config)
- {Agency} clients: `{Agency}/reports/{Client-Name}/evidence/`
- {Own Brand}: `{Own-Brand}/reports/evidence/`
- Use PascalCase-With-Dashes for client folder names

### Ambiguity handling
- If the user says "audit" without specifying a client, ask which client
- If the user says "Amazon" in an audit context, it means Amazon Ads platform audit (not "is this {Own Brand} or {Agency}")
- If department is unclear, ask: "Is this a {Agency} client or {Own Brand}?"

### Evidence schema
The JSON schema that all platform skills validate against is at:
```
${CLAUDE_PLUGIN_ROOT}/skills/audit-orchestrator/reference/evidence-schema.json
```
The orchestrator doesn't need to use it directly, but it's referenced here so platform skill builders know where the contract lives.

### Manifest is markdown, evidence is JSON
- Manifest: human-readable progress tracker (`.md`)
- Evidence files: machine-parseable data for the synthesizer (`.json`)
- Both live in the same `evidence/` directory

---

## Playbook Loading

This skill does NOT load any playbook chunks. It's a router/tracker, not an analyst.

Platform-specific playbook loading happens inside each platform audit skill.
The synthesizer loads cross-channel chunks (`channel-allocation.md`, `measurement.md`).

---

## Error Handling

**User says "audit" but means a single platform:**
- If they say "audit their Google Ads", that's google-ads-v2, not this skill
- If they say "full audit" or "audit this client" or "start an audit", that's this skill

**Manifest is corrupted or missing fields:**
- Re-create from scratch, noting what was recovered
- Ask user to confirm platform access again

**Client folder already has evidence files but no manifest:**
- This means someone ran platform audits without the orchestrator
- Create a manifest retroactively, marking completed platforms as DONE based on existing evidence files

**User wants to re-audit a platform:**
- The existing evidence file will be overwritten by the new audit
- Update the manifest date and session reference
- Note: the old evidence is lost — if they want to compare, suggest renaming the old file first
