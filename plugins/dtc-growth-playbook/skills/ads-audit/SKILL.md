---
name: ads-audit
description: "Triage-first marketing audit via Adzviser MCP. Scans all connected ad platforms with lightweight diagnostic pulls, scores each red/yellow/green, then deep-dives ONLY into platforms with real problems. Use for: '/ads-audit', 'ads audit', 'audit their ads', 'quick audit', 'triage audit', 'audit [client]', or when the user wants an Adzviser-powered marketing audit. Covers: Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce. Does NOT cover SEO, CRO, or Klaviyo."
---

# Ads-Audit — Triage-First Marketing Audit

> One command: `/ads-audit`. Pulls lightweight diagnostics across all connected platforms, scores each one, then deep-dives only where problems exist. This means the model spends its token budget on analysis, not extraction.

## Why Triage-First

Traditional audits go max-depth on every platform equally. That wastes 60-80% of context on platforms that are fine. This skill flips it: scan the vitals first (1 pull per platform), find the bleeding, then operate. The result is sharper analysis where it matters and faster delivery.

**Platforms:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce
**Data source:** Adzviser MCP (with browser fallback for UI-only checks)

---

## How It Works

| What the user says | Mode | What happens |
|---|---|---|
| `/ads-audit [client]` (no manifest) | **Full Triage** | Gathers info, runs triage on all platforms, deep-dives flagged ones, generates report |
| `/ads-audit [client]` (manifest exists) | **Resume** | Reads manifest, reports progress, continues |
| "audit their Google Ads" / "audit Meta" | **Channel Audit** | Skips triage, runs full deep-dive on that one platform |
| "generate the report" / "synthesize" | **Report** | Reads evidence files, generates cross-channel report |

---

## Report Hard Rules

- **DOCX is the default deliverable** — never markdown alone. Save a parallel `.md` source alongside for grep-ability.
- **Every audit with ≥ 1 deep-dived paid channel MUST include charts.** Generated via `scripts/generate_charts.py`.
- **Body word count target: 1,200 words.** Anything longer gets trimmed or moved to appendix.
- **Every number in the body must be visualized OR tabled, never both.**
- **Executive summary is one paragraph, four sentences max.**

### Troubleshooting

- If matplotlib is not installed, run `pip install matplotlib --break-system-packages` in the shell sandbox before running the chart generator.
- If `node` / `docx` is missing, run `npm install -g docx`.

---

## Step 0: Detect Mode

1. Check user message for client name and platform mentions
2. Search for `{Client}_audit_manifest.md` in evidence directories
3. Route to the appropriate mode below

**Ambiguity rules:**
- No client name → ask which client
- Client name + manifest exists → Resume
- "Amazon" in audit context → Amazon Ads (not website)

---

## Mode 1: Full Triage Audit

### Step 1.1: Resolve Workspace + Gather Client Info

**Cache-first flow: look up the client BEFORE asking questions so you can pre-populate platform options.**

**A. Resolve workspace from cache:**

1. Extract client name from the user's message (e.g., "audit Acme Store" → search for "Acme")
2. Check if `adzviser_workspace_cache.md` exists in the user's workspace root
3. **If cache exists:** Read it, search for client name (fuzzy match — "Acme Store" matches "Acme-Store")
   - **Found** → note the `workspace_name` and its connected platforms. Proceed to step B with this info.
   - **Not found** → cache may be stale. Go to step 4.
4. **If no cache or cache miss:** Call `list_workspace`, then immediately parse and save the cache file (see cache format below). Search the fresh cache for the client.
5. **Still not found after fresh pull** → ask user for the exact workspace name in Adzviser

**B. Ask user to confirm — with pre-populated platforms from cache:**

Use AskUserQuestion. The platform question should show ONLY the platforms found in the cache for this client, pre-selected, so the user just confirms or unchecks any they don't want audited.

**Required questions:**
- **Client name + workspace** → "I found workspace '{Workspace-Name}' with these platforms. Confirm?" (pre-filled from cache)
- **Platforms to audit** → multiSelect checkboxes showing ONLY the client's connected platforms from cache (e.g., if cache shows "Google Ads, Meta Ads, Shopify, GA4" → show those four as options, not a generic list of all possible platforms)
- **Department** → Agency client, Brand (own product), or Prospect (pre-sales)?
- **Lookback period** → Options: Last 30 days, Last 90 days, YTD, Last 6 months, Last 12 months, Custom
- **Known focus areas** → anything specific? (e.g., "ROAS dropping", "PMax cannibalizing branded")

**Optional:** Monthly revenue, monthly ad spend, AOV tier, vertical

Store confirmed `workspace_name` in manifest.

### Step 1.2: Workspace Cache Management

The cache avoids the slow 100K+ `list_workspace` pull on every audit.

**Cache file format** (`adzviser_workspace_cache.md` in workspace root):
```markdown
# Adzviser Workspace Cache
Last updated: {YYYY-MM-DD}
Total workspaces: {N}

| Workspace | Platforms |
|---|---|
| Client-Name | Google Ads, Meta Ads, Shopify, GA4 |
```

**Cache rules:**
- The cache is user-specific and lives in the workspace root — NOT inside the skill source. Each user generates their own on first run.
- Parse the full `list_workspace` response via bash (python/grep) — do NOT try to read the raw 100K+ response into context. Normalize platform types (e.g., "Facebook Ads" → "Meta Ads", "Google Analytics" → "GA4").
- The cache is a slim table: workspace name + comma-separated platform types. No account names or IDs needed.
- If a user says a platform is connected but the cache doesn't show it → re-pull `list_workspace` and update cache
- If cache is older than 30 days → re-pull on next audit to catch new client workspaces

### Step 1.3: Create Manifest + Evidence Directory

1. Create evidence directory per file routing rules
2. Create `{Client}_audit_manifest.md` with: client info, workspace_name, lookback period, platform list, Data Source: Adzviser MCP
3. Include a Triage Results section (will be filled in Step 1.4)

### Step 1.3.5: Connection Health Check (BEFORE Triage)

**Purpose:** Detect dead connections BEFORE wasting attempts on triage pulls. A broken token will timeout on every retry — catching it early saves 3-5 failed attempts per dead platform.

**Protocol:**
1. For each platform the user confirmed, call `list_metrics_and_breakdowns_{platform}` (e.g., `list_metrics_and_breakdowns_shopify`).
2. This is a lightweight metadata call — no date ranges, no data. It returns the list of available metrics.
3. **If it returns successfully** → platform connection is alive. Proceed to triage.
4. **If it times out or errors** → the connection itself is dead (expired token, revoked access, etc.).
   - Immediately score as ⚠️ ERROR in the manifest
   - Tell the user: "{Platform} connection is broken — `list_metrics` timed out. This needs to be re-authorized in Adzviser at adzviser.com/main. Skipping to next platform."
   - Do NOT attempt triage pulls on this platform — they will all fail
   - To confirm it's workspace-specific (not systemic), optionally test the same `list_metrics_and_breakdowns_{platform}` on a different workspace

**Execute health checks in order:** Shopify/BigCommerce → Ad platforms → GA4. If the financial anchor (Shopify/BC) is dead, immediately note that profitability analysis will use estimates.

### Step 1.4: Run Triage Scan (THE CORE STEP)

**Read `reference/triage-pulls.md` now.** It contains the exact pull specs and scoring thresholds for every platform.

Execute one lightweight Adzviser pull per accessible platform (only those that passed the health check). These are account-level totals only — no breakdowns, no campaign details. The goal is to get enough signal to decide where to go deep.

**Triage execution order:**
1. Shopify/BigCommerce first (financial anchor — AOV, revenue, margins inform everything else)
2. Ad platforms in parallel or sequence (Google Ads, Meta Ads, Amazon Ads)
3. GA4 last (needs ad platform context for reconciliation)

**After all triage pulls complete:**

Score each platform using the thresholds in `reference/triage-pulls.md`:

| Score | Meaning | Action |
|---|---|---|
| 🔴 RED | Critical issues detected | Deep-dive required — read platform's reference file |
| 🟡 YELLOW | Concerning signals, needs investigation | Moderate dive — read platform's reference file, run 2-3 targeted pulls |
| 🟢 GREEN | Looks healthy at account level | Skip deep-dive — 2-3 sentence summary in report |
| ⚠️ ERROR | Auth failure, timeout, or connection issue | Cannot pull — note what analysis is now impossible |

**Handling connection errors during triage:**

If a platform returns an auth error (e.g., `invalid_grant`, `403`, `token expired`) or repeated timeouts:
1. Score it as ⚠️ ERROR (not RED/YELLOW/GREEN — we have no data to score)
2. Note the specific error in the manifest
3. List what analysis is blocked without this platform:
   - No GA4 → no cross-platform attribution reconciliation, no channel-level CVR
   - No Shopify/BigCommerce → no financial anchor (AOV, margins, MER), profitability uses manual inputs
   - No Google/Meta → can't assess that channel or calculate combined attribution ratio
4. Tell the user: "{Platform} connection is broken ({error}). This needs to be re-authorized in Adzviser. Continuing with remaining platforms."
5. Continue the audit with available platforms — do NOT stop the whole audit for one broken connection

**Present triage results to user:**
```
## Triage Results — {Client}
| Platform | Score | Key Signal | Recommended Action |
|----------|-------|------------|-------------------|
| Shopify | 🟢 GREEN | AOV $85, 12% return rate, healthy | Summary only |
| Google Ads | 🔴 RED | ROAS 1.8× vs 3.0× target | Deep dive |
| Meta Ads | 🟡 YELLOW | Frequency 4.2, CPM rising 23% MoM | Moderate dive |
| Amazon Ads | 🟢 GREEN | ACOS 18%, TACoS 12% | Summary only |
| GA4 | 🟡 YELLOW | GA4 revenue 32% below Shopify | Reconciliation dive |
```

**Auto-proceed — do NOT pause for approval.** Present the triage table as a status update, then immediately continue to Step 1.5 and begin deep-diving the RED/YELLOW platforms. The user can interrupt if they want to change course, but the default is to keep moving. Only stop and ask if the triage found something so unexpected it changes the scope (e.g., every platform is ERROR, or the user's stated focus area doesn't match any flagged platform).

### Step 1.4.5: Structural Health Check (Google Ads Only)

**Runs regardless of Google Ads triage score.** Catches hygiene issues invisible at account totals. Can UPGRADE a GREEN-scored Google Ads platform to YELLOW.

**When it runs:** If Google Ads passed the connection health check in Step 1.3.5 AND is included in the platforms being audited — regardless of triage score (GREEN, YELLOW, or RED).

**What it does:** Runs Pull 0 from `reference/platforms/google-ads-deep.md`. Four cheap checks:
1. Ad Strength distribution (% of RSAs at Poor/Average)
2. Extensions coverage (sitelinks/callouts/snippets per campaign)
3. Enhanced Conversions status
4. Shared negative keyword list presence

**Upgrade rule:** If Google Ads scored GREEN at triage AND Pull 0 finds any of:
- >30% of RSAs rated Poor/Average, OR
- Majority of campaigns with <3 sitelinks, OR
- Enhanced Conversions definitively OFF

→ Upgrade the platform to YELLOW. Note the trigger in the manifest as "GREEN→YELLOW structural upgrade: {specific check}".

For a structurally-upgraded YELLOW, the deep-dive in Step 1.5 runs ONLY Pull 6 (Ad + Extensions Depth) — skip Pulls 1-5 unless other triage signals also flag the account.

**Cost target:** <8% of context budget per audit. If Pull 0 completes in under 5 `retrieve_reporting_data` calls, you're on target.

**Evidence:** Always write Pull 0 findings to the Google Ads evidence JSON under `structural_health_check`, regardless of whether they triggered an upgrade. This gives the final report a clean hygiene section even for healthy accounts.

**Skip conditions:**
- Google Ads was not in the audit scope → skip
- Google Ads connection failed the health check in Step 1.3.5 → skip (already scored ⚠️ ERROR)
- Pull 0 Adzviser calls fail → log DATA_NOT_AVAILABLE per check, continue with other checks, do not abort

### Step 1.5: Deep-Dive Flagged Platforms

**For each RED or YELLOW platform:**

1. Read `reference/adzviser-data-layer.md` for data collection protocol
2. Call the platform's `list_metrics_and_breakdowns_*` tool
3. Read the platform's deep-dive file:
   - Google Ads → `reference/platforms/google-ads-deep.md`
   - Meta Ads → `reference/platforms/meta-ads-deep.md`
   - Amazon Ads → `reference/platforms/amazon-ads-deep.md`
   - GA4 → `reference/platforms/ga4-deep.md`
   - Shopify → `reference/platforms/shopify-deep.md`
   - BigCommerce → `reference/platforms/bigcommerce-deep.md`
4. Execute the deep-dive pulls and analysis
5. Write evidence JSON
6. Update manifest

**RED platforms:** Run full deep-dive (all pulls in the platform file).
**YELLOW platforms (from triage signals):** Run targeted deep-dive (2-3 pulls focused on the flagged signal) per the YELLOW Mode routing in the platform file.
**YELLOW platforms (from Pull 0 structural upgrade, Google Ads only):** Run Pull 6 (Ad + Extensions Depth) only — skip Pulls 1-5 unless triage signals ALSO flag the account.
**GREEN platforms:** No deep-dive. Write a brief evidence JSON with triage + Pull 0 findings (Google Ads only). Note: "Platform scored GREEN at triage. Structural health check completed. No deep-dive performed."

**Context window management:**
- After each deep-dive, self-check: "Am I still producing detailed analysis or starting to abbreviate?"
- If you've completed 2 deep-dives and there's a 3rd RED platform, recommend a session break
- The manifest is your checkpoint — nothing is lost by breaking
- Pull 0 (Step 1.4.5) has a fixed ~5-8% context cost — budget for it in every Google Ads audit.

### Step 1.6: Generate Report

Default deliverable: DOCX (never markdown unless user asks). The report follows the 8-component Marketing Director Overview defined in `reference/synthesizer.md`.

Execution order:
1. Read `reference/synthesizer.md` — follow the 8-component structure.
2. Read `reference/playbook/benchmarks.md` — for scoring context.
3. Build the chart spec JSON at `{evidence_dir}/charts/chart_spec.json` using the schema documented in `scripts/generate_charts.py`. Only include the charts appropriate to this audit (see synthesizer's "Chart Set" section for inclusion rules).
4. Run: `python scripts/generate_charts.py --spec {evidence_dir}/charts/chart_spec.json --out {evidence_dir}/charts/`
5. Read `reference/docx-template.md` — use the `chartImage()` helper to embed the generated PNGs.
6. Write `build_report.js` to the outputs dir, run `node build_report.js {output-path}`, validate with `python scripts/office/validate.py`.
7. Save the docx to the client's reports folder. Also save the markdown source alongside for grep-ability.

---

## Mode 2: Channel Audit (Single Platform)

When the user names a specific platform. Skips triage — goes straight to deep-dive.

1. Gather minimal context (client name, department, lookback period, workspace)
2. **Financial anchor check:** If Shopify or BigCommerce is accessible AND the target platform isn't Shopify/BigCommerce, run a quick triage pull on the ecommerce platform first (see `reference/triage-pulls.md` Shopify/BigCommerce section). This gives you AOV, margins, and order count for profitability calculations. If not accessible, ask user for AOV and margin estimates.
3. Read `reference/adzviser-data-layer.md`
4. Call `list_metrics_and_breakdowns_*` for the platform
5. Read the platform's deep-dive file
6. Execute full deep-dive
7. Write evidence JSON, update manifest
8. Offer to generate single-platform report — if user says yes, always produce `.docx` via the docx skill (see Step 1.6)

**Platform routing:**
| User says | Deep-dive file |
|---|---|
| "Meta", "Facebook Ads" | `reference/platforms/meta-ads-deep.md` |
| "Google Ads", "Google", "PMax" | `reference/platforms/google-ads-deep.md` |
| "Shopify", "store data" | `reference/platforms/shopify-deep.md` |
| "BigCommerce" | `reference/platforms/bigcommerce-deep.md` |
| "GA4", "Google Analytics" | `reference/platforms/ga4-deep.md` |
| "Amazon", "Amazon Ads" | `reference/platforms/amazon-ads-deep.md` |

---

## Mode 3: Resume

1. Read `{Client}_audit_manifest.md`
2. Report status: what's done, what's remaining, triage scores
3. If deep-dives remain → continue next flagged platform
4. If all done → generate report (Mode 1, Step 1.6)

---

## Mode 4: Report

1. Find `*_evidence.json` files in evidence directory
2. If 0 → tell user to run an audit first
3. Read `reference/synthesizer.md` AND `reference/docx-template.md`, then read the `docx` SKILL.md at `/var/folders/x3/r6tjbfkj60z23gcd5xxjd_nm0000gn/T/claude-hostloop-plugins/13690c64666dd2f9/skills/docx/SKILL.md`
4. **Always output `.docx`** — follow synthesizer for content, docx-template for styling. Save to client report directory, update manifest.

---

## Rules

### Data collection hierarchy
1. **Adzviser MCP** — primary for all metric/reporting data
2. **Claude in Chrome** — fallback for UI settings, visual inspections
3. **DATA_NOT_AVAILABLE** — last resort

### Data integrity
- Every number must cite its source
- Never invent numbers — say "No data available" if missing
- Show calculation formulas
- Handle gaps honestly with DATA_NOT_AVAILABLE labels

### File routing
- Agency evidence: `{Agency}/reports/{Client-Name}/evidence/`
- Brand evidence: `{Brand}/reports/evidence/`
- Reports: same parent directory as evidence
- PascalCase-With-Dashes for client folders

### Context window philosophy
- Triage pulls are cheap (~5-10% of context total)
- Deep-dive platform files load ONLY when that platform is flagged
- This means GREEN platforms cost almost nothing
- The model's budget goes to analysis, not extraction

### What this skill does NOT cover
- SEO, CRO, Klaviyo — use the regular `/audit` skill for these
- Browser-first audits — use `/audit` if Adzviser isn't connected
- Site design/UX evaluation

---

## Reference Files

| File | When to load |
|---|---|
| `reference/triage-pulls.md` | Always — at triage step (Step 1.4). Includes YoY default protocol. |
| `reference/platforms/google-ads-deep.md` (Pull 0 section only) | Always — at Step 1.4.5, for Google Ads |
| `reference/playbook/benchmarks.md` | At triage scoring AND any deep-dive — contains Floor/Healthy/Strong thresholds per platform |
| `reference/adzviser-data-layer.md` | Before any deep-dive |
| `reference/platforms/*.md` (full file) | Only for RED/YELLOW platforms — loaded at Step 1.5 |
| `reference/diagnostic-patterns.md` | At synthesizer step AND any deep-dive — codified patterns for UTM fragmentation, conversion duplication, owned-channel collapse, etc. |
| `reference/synthesizer.md` | At report generation — defines the 8-component Marketing Director Overview and chart inclusion rules |
| `reference/docx-template.md` | At report generation — DOCX structure/styling, status-color helpers, and `chartImage()` helper for embedding chart PNGs |
| `scripts/generate_charts.py` | Always — at the chart-generation step in report building |

### Playbook References (conditional, from workspace)

If the DTC playbook exists in the workspace (`_system/av-audit-skill-source/reference/playbook/`), load the relevant chunk during deep-dives for richer strategic context. These are NOT required — the skill works without them — but they add depth to recommendations.

| Deep-dive platform | Playbook chunk to load |
|---|---|
| Google Ads | `google-ads.md` (PMax methodology, Shopping feed, branded cannibalization) |
| Meta Ads | `andromeda.md` (algorithm behavior, creative diversity, fatigue) |
| Meta Ads (if creative flagged) | `creative-testing.md`, `scaling-frequency.md` |
| GA4 | `measurement.md` (reconciliation methodology, CAPI, tracking validation) |
| Synthesizer (cross-channel) | `channel-allocation.md` (channel roles, halo effects, budget splits) |
| Any (AOV >$200) | `high-ticket.md` |
| Any (AOV <$100) | `low-ticket.md` |
