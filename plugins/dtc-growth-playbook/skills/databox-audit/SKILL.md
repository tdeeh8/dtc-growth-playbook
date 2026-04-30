---
name: databox-audit
description: "Triage-first marketing audit via Databox MCP. Scans all connected ad platforms with lightweight diagnostic pulls, scores each red/yellow/green, then deep-dives ONLY into platforms with real problems. Use for: '/databox-audit', 'databox audit', 'audit their databox', 'triage audit via databox', 'audit [client] in databox', or when the user wants a Databox-powered marketing audit. Covers: Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce. Does NOT cover SEO, CRO, or Klaviyo."
---

# Databox-Audit — Triage-First Marketing Audit

> **Audit framework version: v4-cowork-memory (April 2026 v4 cutover). Old v1, v2, AND v3 manifests created before this version should NOT be resumed under v4 — they will fail or produce inconsistent results (different file routing, different deliverable, different memory layer). Finish them under their version first or restart from scratch under v4.**

### v4-cowork-memory changes (April 2026)
- NEW: Per-client memory pattern. Every client gets a `clients/{Client}/CLAUDE.md` that holds Identity / Brand / Standing Context / Recurring Patterns / Outcomes / Last audited. Read at the start of every audit; appended to at the end.
- NEW: Step 1.0 — Resolve Client Folder + Read CLAUDE.md. Runs BEFORE Step 1.1. Scaffolds the client folder + CLAUDE.md on first audit; reads existing CLAUDE.md on subsequent runs. Brand colors flow into PDF theming, Standing Context flows into CM2 / brand_keyword_list / financial anchor.
- NEW: Final Step — Update CLAUDE.md. Append-only writes to "## Recurring Patterns" and "## Outcomes" sections plus an updated "## Last audited" line. Does NOT touch Identity / Brand / Standing Context.
- CHANGED: Output format. PDF replaces DOCX as the default deliverable. The .md source is still saved alongside for grep-ability. PDF rendering is via `scripts/build_audit_pdf.js` (pptxgenjs → LibreOffice headless).
- CHANGED: File routing. Old `{Agency}/reports/{Client-Name}/evidence/` → New `clients/{Client-Name}/runs/{YYYY-MM-DD}/evidence/`. Same-day reruns suffix the date with `-r2`, `-r3`, etc.
- CHANGED: Account cache location. Old `./databox_account_cache.md` (workspace root) → New `./clients/_system/databox_account_cache.md`.
- CHANGED: Outcomes file location. Old `{Client}_audit_outcomes_{date}.md` in the client folder root → New `clients/{Client}/runs/{YYYY-MM-DD}/outcomes_template.md`.
- HARD CUTOVER from v3; v3 manifests can't resume under v4.

### v3-money-page changes (April 2026, retained as historical reference)
- NEW: Section 2.0 Money Page (Page 1) — dollarized opportunity headline + The One Thing + 5-day operator sequence. ≤200 words.
- NEW: Real dollar estimates on every Findings Matrix row and Priority Action (per `dollar-impact-methodology.md`). Replaces v2 `$ / $$ / $$$` bands.
- NEW: Predictions Calibration callout in Methodology — synthesizer reads `calibration-rollup.json` at audit start and quotes the hit rate.
- CHANGED: Account Scorecard (8 rows) → Headline Scorecard (3 rows on Page 2; full 8-row version in appendix).
- REMOVED: `findings_matrix_heatmap` chart (redundant with the Findings Matrix table).
- HARD CUTOVER from v2; v2 manifests can't resume under v3.

> One command: `/databox-audit`. Pulls lightweight diagnostics across all connected platforms, scores each one, then deep-dives only where problems exist. This means the model spends its token budget on analysis, not extraction.

## Why Triage-First

Traditional audits go max-depth on every platform equally. That wastes 60-80% of context on platforms that are fine. This skill flips it: scan the vitals first (a handful of per-metric pulls per platform), find the bleeding, then operate. The result is sharper analysis where it matters and faster delivery.

**Platforms:** Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce
**Data source:** Databox MCP (with browser fallback for UI-only checks)

---

## How It Works

| What the user says | Mode | What happens |
|---|---|---|
| `/databox-audit [client]` (no manifest) | **Full Triage** | Gathers info, runs triage on all platforms, deep-dives flagged ones, generates report |
| `/databox-audit [client]` (manifest exists) | **Resume** | Reads manifest, reports progress, continues |
| "audit their Google Ads" / "audit Meta" | **Channel Audit** | Skips triage, runs full deep-dive on that one platform |
| "generate the report" / "synthesize" | **Report** | Reads evidence files, generates cross-channel report |

---

## Report Hard Rules

- **Page 1 (Money Page) is the headline.** ≤200 words containing dollarized opportunity + The One Thing's full Action Contract + 5-day operator sequence. The Money Page IS the report; everything else is detail.
- **PDF is the default deliverable. The .md source is also saved for grep-ability.** PDF is rendered via `scripts/build_audit_pdf.js` (pptxgenjs → LibreOffice headless). Never markdown alone, never DOCX.
- **Every audit with ≥ 1 deep-dived paid channel MUST include charts.** Generated via `scripts/generate_charts.py` and embedded by the PDF renderer.
- **Body word count target: 1,400 words** (raised from v2's 1,200 to absorb the 200w Page 1 Money Page; Page 1 rolls into the body total). Anything longer gets trimmed or moved to appendix. Word-count target is unchanged in v4 — readers see PDF page count, but the underlying word target is the same.
- **Every number in the body must be visualized OR tabled, never both.**
- **Executive summary is one paragraph, three sentences max** (down from 4 in v2 — the "biggest red flag" sentence drops because the Money Page headline carries that signal).
- **Body must include the Funnel Health section** (synthesizer Section 2.4) whenever ≥2 paid channels were deep-dived AND an ecommerce platform is connected. Single-channel audits fold the funnel diagnosis into the per-channel page.
- **TOF-dominant channels are scored by quality metrics** (CPATC, CPVC, engaged time, PDP→ATC). In-channel ROAS is informational only for TOF — never the scoring authority.
- **Headline Scorecard on Page 2 leads with Profit / Roles / Tracking (3 rows). Full Detailed Scorecard (8-row Standard / 7-row Degraded) lives in the appendix.** See `reference/synthesizer.md` Section 2.2 for the adaptive standard / degraded layouts.
- **Every finding has a dollar estimate.** Per `reference/synthesis/dollar-impact-methodology.md` — HIGH confidence renders `~$X/mo`, MEDIUM as `~$X-Y/mo`, LOW as `directional`. Findings without a dollar can't appear in Priority Actions.
- **Hard cutover from v3** — there is no transition or dual-display mode. Reports generated after v4 ships use only the new structure (per-client memory, dated run subfolders, PDF deliverable).

### One-time v3 → v4 migration

If you find any of these legacy artifacts on first v4 run, surface them to the user with a one-line "move?" prompt; do not auto-migrate without confirmation:
- Old account cache at workspace root: `databox_account_cache.md` → move to `clients/_system/databox_account_cache.md`.
- Old per-client folders under `{Agency}/reports/{Client}/` → leave in place; v4 starts fresh under `clients/{Client}/`. The user explicitly chose start-fresh, not migrate.

### Troubleshooting

- If matplotlib is not installed, run `pip install matplotlib --break-system-packages` in the shell sandbox before running the chart generator.
- If `node` / `pptxgenjs` is missing, run `cd scripts && npm install` in the skill source.
- If LibreOffice headless conversion fails on macOS, confirm `/Applications/LibreOffice.app/Contents/MacOS/soffice` exists; the bundled `scripts/render_pdf.sh` auto-detects this path.

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

### Step 1.0: Resolve Client Folder + Read CLAUDE.md  *(NEW in v4)*

**Runs first, before any Databox call. Cheap on context, expensive if skipped.** This step gives every later step a stable handle on the client's identity, brand theming, and prior pattern history.

**A. Detect the workspace root.**

In Cowork, the user's mounted workspace is the current working directory of the shell sandbox. To resolve it:
1. Run `pwd` via bash to confirm you're inside the mounted workspace.
2. Confirm `clients/_system/` exists at the root (created by the v4 setup). If `clients/` is missing entirely, the workspace hasn't been initialized for v4 — tell the user and STOP. Do not auto-create the system folder; that's the user's setup step.
3. Cache the resolved root in the manifest as `workspace_root`.

**B. Slug the client name to PascalCase-With-Dashes.**

Convert what the user typed into a folder-safe slug:
- "Acme Co" → `Acme-Co`
- "smith & co" → `Smith-Co`
- "globex warehouse" → `Globex-Warehouse`
- "every step" → `EveryStep`

Rules: capitalize each word, drop punctuation other than internal dashes, collapse whitespace to a single dash. If the user-typed name is ambiguous (e.g., very short or matches multiple folders fuzzy), confirm before scaffolding.

**C. Resolve client folder.**

Look at `clients/{Client-Slug}/`:
- **Folder + CLAUDE.md exist** → existing client. Read `clients/{Client-Slug}/CLAUDE.md` into context. Skip to step E.
- **Folder exists, CLAUDE.md missing** → partial state. Scaffold CLAUDE.md from `templates/client-claude-md-scaffold.md` and continue. Note "scaffolded mid-history" in the manifest.
- **Folder doesn't exist** → first audit for this client. Create `clients/{Client-Slug}/` and scaffold `CLAUDE.md` from `templates/client-claude-md-scaffold.md` populated with `{Client-Name}` placeholders. Continue to step D.

**D. (First audit only) Ask the user the Identity / Brand questions the scaffold can't infer.**

Use AskUserQuestion. The scaffold's "Identity", "Brand", and "Standing Context" sections are stable — they're worth getting right at first audit because every subsequent run reads them. Defaults:
- Identity → Department (Agency client / Brand / Prospect), Vertical, AOV tier (Mass / Standard / Premium / Luxury)
- Brand → Primary color (dark hex; cover/headers), Accent color (warm secondary), Background (default `#F7F4ED`), Tone (editorial / bold / technical / warm)
- Standing Context → CM2 % (with vertical fallback if unknown), Brand keyword list (optional), Financial anchor (Shopify / BigCommerce / not connected)

Write the user's answers into the scaffolded CLAUDE.md before continuing. The Account ID (Databox) gets filled in Step 1.1 once the cache resolves it.

**E. Map CLAUDE.md sections to downstream consumers.**

After CLAUDE.md is loaded, route its zones to the steps that read them:

| CLAUDE.md zone | Consumer | What it feeds |
|---|---|---|
| **Identity** (Department, Vertical, AOV tier, Account ID) | Manifest header + benchmark selection | Department drives report path under `clients/{Client}/runs/{date}/`. AOV tier picks the benchmarks row in `reference/playbook/benchmarks.md`. Account ID seeds the Step 1.1 cache lookup. |
| **Brand** (Primary / Accent / Background hex, Tone) | PDF renderer (`scripts/build_audit_pdf.js`) | These six values populate the `theme` block of the PDF input JSON. Status colors (red/yellow/green) stay locked; only `dark`, `accent`, `background` re-theme per client. |
| **Standing Context** (CM2 %, Brand keywords, Financial anchor, Known data quirks) | Step 1.1 + Step 1.5 + synthesizer | CM2 → MER target derivation in Step 1.6 + profitability framework in Step 6. Brand keywords → `brand_keyword_list` in manifest, used by GA4 Pull 5C BOF baseline and PMax branded-cannibalization checks. Financial anchor → which platform Step 1.5 starts triage with. Known data quirks → upstream evidence-quality flags (e.g., `DATA_QUALITY_SUSPECT` for Meta CPATC inflation patterns). |
| **Recurring Patterns** | Synthesizer (Step 1.8a Pattern Detection) | If the dominant pattern this audit detects matches a pattern logged in prior runs, the synthesizer can reference "third audit in a row showing TOF-Underfunded" — increases pattern confidence and tightens the body lead. |
| **Outcomes** | Synthesizer (Methodology callout) | Pointer list to per-run outcomes files. Cross-audit calibration is computed from these — feeds the Predictions Calibration callout. |

**F. Snapshot CLAUDE.md baseline.**  *(zone-protection guard for Step 1.10)*

Before any other step writes anything, snapshot the current CLAUDE.md so Step 1.10's diff check has a baseline to compare against.

1. Resolve the run folder (see step G below for the exact rule — done in parallel here).
2. Copy `clients/{Client-Slug}/CLAUDE.md` to `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/_claude_md_baseline.md`. The leading underscore signals "system file, do not hand-edit."
3. Compute and stash the SHA-256 of the baseline file in the manifest as `claude_md_baseline_sha256`. Step 1.10 re-hashes at the end and compares.

If `clients/{Client-Slug}/CLAUDE.md` is freshly scaffolded in step C/D (first audit), the baseline IS the freshly-written scaffold. That's correct — Step 1.10's diff check at the end of run 1 should show only the three append zones changed.

**G. Resolve run folder and write the stub manifest.**  *(breadcrumb guard for aborted audits)*

This step actually creates the manifest file on disk so a half-aborted audit (e.g., Databox account resolution fails in Step 1.1) still leaves a discoverable breadcrumb in the client folder.

1. **Resolve the dated run folder.** Today's date in `YYYY-MM-DD` form. If `clients/{Client-Slug}/runs/{date}/` already exists from an earlier run today, append `-r2` (then `-r3`, etc.) until you land on a fresh path. Final form: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/`. Create the directory now.

2. **Write the stub manifest** at `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/manifest.md` with this exact structure:

   ```markdown
   # {Client-Name} — Audit Manifest

   - framework_version: v4-cowork-memory
   - status: pending
   - created_at: {ISO-8601 timestamp}

   ## Setup (Step 1.0)
   - workspace_root: {resolved}
   - client_folder: clients/{Client-Slug}/
   - client_claude_md: clients/{Client-Slug}/CLAUDE.md
   - run_folder: clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/
   - claude_md_baseline_sha256: {hash from step F}

   ## Audit Inputs (Step 1.1 — pending)
   - account_id: (TBD)
   - data_sources: (TBD)
   - platforms: (TBD)
   - lookback: (TBD)
   - department: (TBD)
   - brand_keyword_list: (TBD)

   ## Triage Results (Step 1.5 — pending)

   ## Cross-Platform Anchor Scoring (Step 1.6 — pending)

   ---

   _If this audit was aborted before completion, the breadcrumb above tells you what was attempted. Resume mode (Mode 2) can pick up from this stub by re-reading the manifest and proceeding from the next pending step._
   ```

3. The `status` field is the lifecycle marker. Steps that complete successfully advance it:
   - Step 1.0 done → `status: pending` (waiting on Databox)
   - Step 1.1 done → `status: in_progress`
   - Step 1.5 done → `status: triage_complete`
   - Step 1.7 done → `status: deep_dive_complete`
   - Step 1.8 done → `status: report_generated`
   - Step 1.10 done → `status: done`

   If the user asks "did I try to audit X recently?" the answer is `find clients/X/runs -name manifest.md | xargs grep '^- status:'`.

The Step 1.0 outputs (workspace_root + client_folder + run_folder) become the parent paths for Step 1.3's evidence directory and Step 1.8's PDF output.

---

### Step 1.1: Resolve Account + Gather Client Info

**Cache-first flow: look up the client BEFORE asking questions so you can pre-populate platform options.**

**A. Resolve account from cache:**

1. Extract client name from the user's message (already slugged in Step 1.0).
2. Check if `clients/_system/databox_account_cache.md` exists. *(v4: moved from workspace root.)*
3. **If cache exists:** Read it, search for client name (fuzzy match — "Acme Store" matches "Acme-Store")
   - **Found** → note the `account_id` and the `data_source_id` for each connected platform. Proceed to step B with this info.
   - **Not found** → cache may be stale. Go to step 4.
4. **If no cache or cache miss:** Call `list_accounts`, then for the matching account call `list_data_sources(account_id)`. Parse and save the cache file at `clients/_system/databox_account_cache.md` (see cache format below). Search the fresh cache for the client.
5. **Still not found after fresh pull** → ask user for the exact account name in Databox.

**v3 → v4 migration note:** If `databox_account_cache.md` exists at the workspace root (legacy v3 location), surface it: "Found a v3 account cache at the workspace root. Move it to `clients/_system/databox_account_cache.md`?" Do not auto-move — let the user confirm. After move, re-read from the new path.

**B. Ask user to confirm — with pre-populated platforms from cache:**

Use AskUserQuestion. The platform question should show ONLY the platforms found in the cache for this client, pre-selected, so the user just confirms or unchecks any they don't want audited.

**Required questions:**
- **Client name + account** → "I found account '{Account-Name}' with these data sources. Confirm?" (pre-filled from cache)
- **Platforms to audit** → multiSelect checkboxes showing ONLY the client's connected data sources from cache (e.g., if cache shows "Google Ads, Meta Ads, Shopify, GA4" → show those four as options, not a generic list of all possible platforms)
- **Department** → Agency client, Brand (own product), or Prospect (pre-sales)?
- **Lookback period** → Options: Last 30 days, Last 90 days, YTD, Last 6 months, Last 12 months, Custom
- **Known focus areas** → anything specific? (e.g., "ROAS dropping", "PMax cannibalizing branded")

**Optional:** Monthly revenue, monthly ad spend, AOV tier, vertical
- **Brand keyword list (optional)** → "What brand keywords does this client use? (Used to separate branded vs non-branded paid search and to build the BOF baseline in GA4 Pull 5C. Examples: 'acmestore', 'acme', 'acme co'. If unsure, leave blank — the audit will fall back to Search Console or a heuristic.)"

Store confirmed `account_id` and the per-platform `data_source_id` map in the manifest. Also store the brand keyword list as `brand_keyword_list: ["term1", "term2", ...]` — empty list (`[]`) is valid.

**Brand keyword fallback rule:** If `brand_keyword_list` is empty AND Search Console is not connected, GA4 Pull 5C BOF baseline will use a heuristic and mark itself as APPROXIMATE in evidence — the body report should soften BOF-baseline claims accordingly.

### Step 1.2: Databox Account Cache Management

The cache avoids re-calling `list_accounts` + `list_data_sources` on every audit.

**Cache file format** (`clients/_system/databox_account_cache.md` — v4 location):
```markdown
# Databox Account Cache
Last updated: {YYYY-MM-DD}
Total accounts: {N}

| Account | account_id | Platform | data_source_id |
|---|---|---|---|
| Client-Name | 12345 | Google Ads | 678901 |
| Client-Name | 12345 | Meta Ads | 678902 |
| Client-Name | 12345 | Shopify | 678903 |
| Client-Name | 12345 | GA4 | 678904 |
```

**Cache rules:**
- The cache is user-specific and lives at `clients/_system/databox_account_cache.md` — NOT inside the skill source. Each user generates their own on first run.
- Parse the responses via bash (python/grep) — do NOT try to read raw long responses into context. Normalize platform types (e.g., "Facebook Ads" → "Meta Ads", "Google Analytics 4" → "GA4").
- The cache is a slim table: account name + account_id + platform + data_source_id. No metric keys — those are resolved at pull time via `list_metrics`.
- If a user says a platform is connected but the cache doesn't show it → re-pull `list_data_sources` for that account and update cache.
- If cache is older than 30 days → re-pull on next audit to catch new accounts or new integrations.

### Step 1.3: Promote Stub Manifest + Create Evidence Directory

The stub manifest already exists from Step 1.0 (step G). This step promotes it to a full manifest by filling in audit inputs from Step 1.1 and creating the evidence subdirectory.

1. **Run folder is already resolved.** Step 1.0 created `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/` and the stub `manifest.md`. Read those paths from the stub manifest (`run_folder` field). Do NOT create a new run folder.
2. Create the evidence subdirectory: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/evidence/`.
3. **Promote the stub manifest** by filling in the `## Audit Inputs (Step 1.1 — pending)` section with the values resolved in Step 1.1: `account_id`, per-platform `data_source_id` map, lookback period, platform list, department, brand_keyword_list. Change the section header to `## Audit Inputs` (drop the "pending" suffix). The `## Setup (Step 1.0)` block stays as-is.
4. The Triage Results and Cross-Platform Anchor Scoring sections are already scaffolded in the stub. Leave them empty — Step 1.5 and Step 1.6 will fill them.
5. Update the lifecycle marker at the top: `- status: pending` → `- status: in_progress`.
6. The `framework_version: v4-cowork-memory` line at the top of the manifest is already stamped by Step 1.0 — no action needed.

### Step 1.3.5: Connection Health Check (BEFORE Triage)

**Purpose:** Detect dead connections BEFORE wasting attempts on triage pulls. A stale data source will return empty/error on every metric pull — catching it early saves dozens of failed calls per dead platform.

**Protocol:**
1. For each platform the user confirmed, call `list_metrics(data_source_id=N)` using the `data_source_id` from cache.
2. This is a lightweight metadata call — no date ranges, no data. It returns the list of available metric_keys for that data source.
3. **If it returns a non-empty metric list** → platform connection is alive. Proceed to triage.
4. **If it returns empty, errors, or 403/401** → the data source isn't synced or the token is broken.
   - Immediately score as ⚠️ ERROR in the manifest
   - Tell the user: "{Platform} data source is not returning metrics — the integration may need to be reconnected in Databox (app.databox.com → Data Manager). Skipping to next platform."
   - Do NOT attempt triage pulls on this platform — they will all fail
   - To confirm it's data-source-specific (not systemic), optionally test `list_metrics` on a different known-good data source.

**Execute health checks in order:** Shopify/BigCommerce → Ad platforms → GA4. If the financial anchor (Shopify/BC) is dead, immediately note that profitability analysis will use estimates.

### Step 1.4: Channel Role Classification

**Read `reference/full-funnel-framework.md` now if not already loaded.** Section 1 (Canonical Mapping) is what role assignment uses.

For each ad platform that passed health check, pull spend by Campaign Objective + Campaign Type and classify each campaign as TOF/MOF/BOF using the Canonical Mapping in `reference/full-funnel-framework.md` Section 1. **Out of scope for v3:** TikTok, Pinterest, Snap (their spend is reported but unclassified). Output triggers TOF Mode for Meta when ANY TOF spend exists.

See `reference/triage-pulls.md` Step 1.4 for the full pull spec (per-platform metric calls, dimensions, ambiguity rules) and the manifest output format. The cross-platform aggregate (Meta + Google + YouTube TOF/MOF/BOF share) feeds Step 1.6.

### Step 1.5: Platform Triage Pulls (THE CORE STEP)

**Read `reference/triage-pulls.md` now.** It contains the exact metric lists, pull specs, and scoring thresholds for every platform.

Execute the per-platform triage pulls using `load_metric_data` (only for data sources that passed the health check). These are account-level totals only — no breakdowns, no dimensions. The goal is to get enough signal to decide where to go deep.

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
| ⚠️ ERROR | Auth failure, empty metrics, or data source issue | Cannot pull — note what analysis is now impossible |

**Handling connection errors during triage:**

If a data source returns repeated errors, 403s, or empty metric responses:
1. Score it as ⚠️ ERROR (not RED/YELLOW/GREEN — we have no data to score)
2. Note the specific error in the manifest
3. List what analysis is blocked without this platform:
   - No GA4 → no cross-platform attribution reconciliation, no channel-level CVR
   - No Shopify/BigCommerce → no financial anchor (AOV, margins, MER), profitability uses manual inputs
   - No Google/Meta → can't assess that channel or calculate combined attribution ratio
4. Tell the user: "{Platform} data source is broken ({error}). This needs to be reconnected in Databox. Continuing with remaining platforms."
5. Continue the audit with available platforms — do NOT stop the whole audit for one broken connection

**Present triage results to user:**
```
## Triage Results — {Client}
| Platform | Score | Key Signal | Recommended Action |
|----------|-------|------------|-------------------|
| Shopify | 🟢 GREEN | AOV , 12% return rate, healthy | Summary only |
| Google Ads | 🔴 RED | ROAS 1.8× vs 3.0× target | Deep dive |
| Meta Ads | 🟡 YELLOW | Frequency 4.2, CPM rising 23% MoM | Moderate dive |
| Amazon Ads | 🟢 GREEN | ACOS 18%, TACoS 12% | Summary only |
| GA4 | 🟡 YELLOW | GA4 revenue 32% below Shopify | Reconciliation dive |
```

**Auto-proceed — do NOT pause for approval.** Present the triage table as a status update, then immediately continue to Step 1.5.5 (Google Ads structural check) → Step 1.6 (Cross-Platform Anchor Scoring) → Step 1.7 and begin deep-diving the RED/YELLOW platforms. The user can interrupt if they want to change course, but the default is to keep moving. Only stop and ask if the triage found something so unexpected it changes the scope (e.g., every platform is ERROR, or the user's stated focus area doesn't match any flagged platform).

### Step 1.5.5: Structural Health Check (Google Ads Only)

**Runs regardless of Google Ads triage score.** Catches hygiene issues invisible at account totals. Can UPGRADE a GREEN-scored Google Ads platform to YELLOW.

**When it runs:** If Google Ads passed the data-source health check in Step 1.3.5 AND is included in the platforms being audited — regardless of triage score (GREEN, YELLOW, or RED) from Step 1.5.

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

For a structurally-upgraded YELLOW, the deep-dive in Step 1.7 runs ONLY Pull 6 (Ad + Extensions Depth) — skip Pulls 1-5 unless other triage signals also flag the account.

**Cost target:** <8% of context budget per audit. If Pull 0 completes in under 5 `load_metric_data` calls, you're on target.

**Evidence:** Always write Pull 0 findings to the Google Ads evidence JSON under `structural_health_check`, regardless of whether they triggered an upgrade. This gives the final report a clean hygiene section even for healthy accounts.

**Skip conditions:**
- Google Ads was not in the audit scope → skip
- Google Ads data source failed the health check in Step 1.3.5 → skip (already scored ⚠️ ERROR)
- Pull 0 Databox calls fail → log DATA_NOT_AVAILABLE per check, continue with other checks, do not abort

### Step 1.6: Cross-Platform Anchor Scoring

After all per-platform deep-dives complete, compute MER, MER trend vs spend trend, nROAS, and TOF spend share vs dynamic target. See `reference/triage-pulls.md` Step 1.6 for the full computation spec (formulas, source order, scoring bands) and `reference/full-funnel-framework.md` Sections 4-6 for the canonical interpretation tables.

**COGS re-read rule:** If Shopify returned $0/null COGS at Step 1.5, the COGS Prompting Rule in `reference/triage-pulls.md` should already have asked the user — re-read the manifest before computing the MER target so you use the user-provided CM2% (or vertical fallback) rather than the placeholder.

These four anchor scores (MER vs target, nROAS, MER-trend-vs-spend-trend, TOF spend share vs dynamic target) become rows 1-4 of the headline scorecard in the synthesizer report.

### Step 1.7: Deep-Dive Flagged Platforms

**For each RED or YELLOW platform:**

1. Read `reference/databox-data-layer.md` for data collection protocol
2. Call the platform's `list_metrics(data_source_id=N)` to resolve exact metric_keys
3. Read the platform's deep-dive file:
   - Google Ads → `reference/platforms/google-ads-deep.md`
   - Meta Ads → `reference/platforms/meta-ads-deep.md`
   - Amazon Ads → `reference/platforms/amazon-ads-deep.md`
   - GA4 → `reference/platforms/ga4-deep.md`
   - Shopify → `reference/platforms/shopify-deep.md`
   - BigCommerce → `reference/platforms/bigcommerce-deep.md`
4. Execute the deep-dive pulls and analysis. For nuanced questions over a dataset, you can use `ask_genie(dataset_id, question)` instead of raw metric pulls.
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
- Pull 0 (Step 1.5.5) has a fixed ~5-8% context cost — budget for it in every Google Ads audit.

### Step 1.8: Generate PDF Report

**Default deliverable: PDF.** The .md source is also saved alongside for grep-ability. The report follows the 11-component Marketing Director Overview defined in `reference/synthesizer.md`.

Execution order:
1. Read `reference/synthesizer.md` — follow the 11-component structure to draft the body in `.md`.
2. Read `reference/playbook/benchmarks.md` — for scoring context.
3. Build the chart spec JSON at `{run_dir}/evidence/charts/chart_spec.json` using the schema documented in `scripts/generate_charts.py`. Only include the charts appropriate to this audit (see synthesizer's "Chart Set" section for inclusion rules).
4. Run: `python scripts/generate_charts.py --spec {run_dir}/evidence/charts/chart_spec.json --out {run_dir}/evidence/charts/`.
5. Build the PDF input JSON at `{run_dir}/audit_pdf_input.json`. Populate the `theme` block from the client's CLAUDE.md "Brand" zone (`dark`, `accent`, `background`) — these were loaded in Step 1.0. Status colors stay locked. The remaining JSON shape is documented in `reference/pdf-template.md`.
6. Read `reference/pdf-template.md` for the input contract and the 15-slide structure.
7. Run the PDF renderer:
   ```bash
   node scripts/build_audit_pdf.js \
     --input {run_dir}/audit_pdf_input.json \
     --output {run_dir}/{Client-Slug}_audit_{YYYY-MM-DD}.pdf
   ```
   The script writes a transient `.pptx`, calls `scripts/render_pdf.sh` for LibreOffice headless conversion, deletes the `.pptx`, and logs the final PDF path.
8. Save the markdown source alongside the PDF: `{run_dir}/{Client-Slug}_audit_{YYYY-MM-DD}.md`. The .md is what's grep-able for cross-audit searches; the PDF is what's shared with the client.
9. Validate: confirm the PDF is >100 KB (rendered correctly), that all 15 pages exist, and that the brand-theming block was applied (cover slide background should match the CLAUDE.md `dark` color).

### Step 1.9: Stub Outcomes Template

After the PDF is finalized, drop the outcomes-tracking stub into the same run folder so the 30 / 60 / 90-day check-ins are pre-formatted and ready to fill.

Save path: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/outcomes_template.md`.

Pre-populate from `templates/outcomes-template.md` (canonical structure also defined in `reference/synthesis/outcomes-loop-template.md` Section 1). Fill in the audit-completion header (date, dominant pattern, owner, links to PDF and manifest). Implementation tracker rows: one per Priority Action. Predicted vs actual rows: one per measurable claim. Pushback and Calibration sections start empty.

Log the path into the manifest as `outcomes_file: clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/outcomes_template.md` so future tooling can find it without filename guessing.

### Step 1.10: Update CLAUDE.md  *(NEW in v4 — final step)*

After the PDF and outcomes stub are written, append the audit's takeaway to the client's CLAUDE.md. **Append-only, narrow scope.** This is what makes v4 a memory system: every audit closes by leaving a one-line breadcrumb the next audit will read.

**Three writes.** Make these as targeted edits to `clients/{Client-Slug}/CLAUDE.md`.

1. **Append a bullet under `## Recurring Patterns`** in this exact form:
   ```
   - {YYYY-MM-DD}: {one-line pattern summary, ≤140 chars}
   ```
   The pattern summary is the dominant pattern detected this run, with one phrase of context — e.g., `2026-04-30: TOF-Underfunded — Meta TOF spend share at 22% vs 35-50% target band; CPATC at floor`. Pull from `manifest.dominant_pattern` and the body's lead sentence; trim to fit.

2. **Append a pointer under `## Outcomes`** in this exact form:
   ```
   - {YYYY-MM-DD}: see runs/{YYYY-MM-DD}[-rN]/outcomes_template.md
   ```
   The pointer is a literal relative path from the client folder root.

3. **Update the `## Last audited` line** to:
   ```
   {YYYY-MM-DD} (run #{N})
   ```
   Where `N` is the count of subfolders under `clients/{Client-Slug}/runs/` (including this one).

**Do NOT touch `## Identity`, `## Brand`, or `## Standing Context`.** These are stable zones owned by the user. If something looks wrong (e.g., the Databox account_id you resolved doesn't match the one in CLAUDE.md, the AOV tier doesn't match the spend levels you saw, the brand keyword list seems incomplete), surface it as a question to the user at the end of the audit — do not auto-edit. Example: "I noticed the brand keyword list in CLAUDE.md hasn't been updated since first audit. Want me to add the new branded queries I saw in Pull 5C?"

**4. Zone-protection diff guard.**  *(programmatic safety net for the rule above)*

After the three writes above, verify nothing leaked into the stable zones. The narrative instruction is the primary protection; this diff check is the safety net.

1. Re-compute the SHA-256 of `clients/{Client-Slug}/CLAUDE.md` and compare to `manifest.claude_md_baseline_sha256` (stamped in Step 1.0 step F). If they match, skip — Step 1.10 made no writes (suspicious, but not a violation).
2. Generate a unified diff:
   ```bash
   diff -u "clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/_claude_md_baseline.md" \
           "clients/{Client-Slug}/CLAUDE.md"
   ```
3. **Allowed zones** for diff hunks: lines inside `## Recurring Patterns`, `## Outcomes`, or `## Last audited`. Anything else (Identity / Brand / Standing Context, the document title, or any other H2 section) is a violation.
4. **If the diff is clean** (only allowed-zone changes), advance manifest `status` to `done` and finish.
5. **If the diff touches a stable zone**, HALT immediately:
   - Restore from the baseline: `cp _claude_md_baseline.md ../../../CLAUDE.md` (relative from the run folder).
   - Surface the diff to the user: "Step 1.10 attempted to modify stable zone(s) in CLAUDE.md — restored from baseline. Here's the unified diff that would have been written: …"
   - Set manifest `status: zone_violation_recovered` and stop. Do not retry automatically.

The baseline file (`_claude_md_baseline.md`) stays in the run folder permanently as audit evidence — it's the canonical "what CLAUDE.md looked like at audit start" record.

---

## Mode 2: Channel Audit (Single Platform)

When the user names a specific platform. Skips triage — goes straight to deep-dive.

1. Gather minimal context (client name, department, lookback period, account)
2. **Financial anchor check:** If Shopify or BigCommerce is accessible AND the target platform isn't Shopify/BigCommerce, run a quick triage pull on the ecommerce platform first (see `reference/triage-pulls.md` Shopify/BigCommerce section). This gives you AOV, margins, and order count for profitability calculations. If not accessible, ask user for AOV and margin estimates.
3. Read `reference/databox-data-layer.md`
4. Call `list_metrics(data_source_id=N)` for the platform
5. Read the platform's deep-dive file
6. Execute full deep-dive
7. Write evidence JSON, update manifest
8. Offer to generate single-platform report — if user says yes, produce the PDF via Step 1.8's pipeline. After it's written, run Step 1.9 (outcomes stub) and Step 1.10 (CLAUDE.md update) the same as a full audit — single-platform audits still leave a memory breadcrumb.

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

1. Find the latest `manifest.md` under `clients/{Client-Slug}/runs/{date}[-rN]/`. (If multiple recent runs, prefer the most recent that isn't marked complete.)
2. Read it. Report status: what's done, what's remaining, triage scores.
3. If deep-dives remain → continue next flagged platform.
4. If all done → run Cross-Platform Anchor Scoring (Mode 1, Step 1.6) if not already in manifest, then generate report (Mode 1, Step 1.8) and run Step 1.9 + Step 1.10.

**v1/v2/v3 manifest guard:** Refuse to resume any manifest whose framework version isn't `v4-cowork-memory` (or whose version field is missing). v1/v2/v3 manifests have different evidence shapes, file routing, and deliverable formats and will produce inconsistent results under v4. Tell the user:
- v3 manifest detected: `"This manifest is v3-money-page (legacy DOCX deliverable, flat per-client folder layout). v3 manifests can't resume under v4 — finish under v3 or restart from scratch under v4."`
- v1/v2 manifest detected: `"This manifest predates v3-money-page — restart from scratch under v4."`

---

## Mode 4: Report

1. Resolve client folder via Step 1.0 (so the CLAUDE.md is loaded for theming).
2. Find `*_evidence.json` files under the latest `clients/{Client-Slug}/runs/{date}[-rN]/evidence/`.
3. If 0 → tell user to run an audit first.
4. Read `reference/synthesizer.md` AND `reference/pdf-template.md`. Invoke the PDF pipeline per Step 1.8.
5. **Always output PDF.** Follow synthesizer for content, `pdf-template.md` for the JSON contract, `scripts/build_audit_pdf.js` for rendering. Save to the run folder, update manifest, and run Step 1.10 (CLAUDE.md update).

---

## Rules

### Data collection hierarchy
1. **Databox MCP** — primary for all metric/reporting data (`load_metric_data`, `ask_genie`)
2. **Claude in Chrome** — fallback for UI settings, visual inspections
3. **DATA_NOT_AVAILABLE** — last resort

### Data integrity
- Every number must cite its source (include the `metric_key` used)
- Never invent numbers — say "No data available" if missing
- Show calculation formulas
- Handle gaps honestly with DATA_NOT_AVAILABLE labels

### File routing  *(v4)*
- Per-client memory: `clients/{Client-Slug}/CLAUDE.md` (stable, append-only at audit end)
- Per-run evidence: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/evidence/`
- Per-run manifest: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/manifest.md`
- Per-run PDF + .md source: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/{Client-Slug}_audit_{YYYY-MM-DD}.pdf` (and `.md`)
- Per-run outcomes stub: `clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/outcomes_template.md`
- Account cache: `clients/_system/databox_account_cache.md`
- Audit settings (defaults): `clients/_system/audit_settings.md`
- Calibration JSON (cross-client): `clients/_system/audit_calibration.json`
- PascalCase-With-Dashes for client folders. Same-day reruns suffix the run date with `-r2`, `-r3`, etc.

### Context window philosophy
- Triage pulls are cheap (~5-10% of context total)
- Deep-dive platform files load ONLY when that platform is flagged
- This means GREEN platforms cost almost nothing
- The model's budget goes to analysis, not extraction

### What this skill does NOT cover
- SEO, CRO, Klaviyo — use the regular `/audit` skill for these
- Browser-first audits — use `/audit` if Databox isn't connected
- Site design/UX evaluation

---

## Reference Files

| File | When to load |
|---|---|
| `reference/full-funnel-framework.md` | Always — at audit start (Step 1.1) so role classification, dynamic targets, and KPI definitions are available throughout. Canonical owner of the Channel Role mapping, Dynamic TOF Target table, MER trend interpretation, and nROAS source order. |
| `reference/triage-pulls.md` | Always — at Step 1.4 (Channel Role Classification), Step 1.5 (Platform Triage Pulls), and Step 1.6 (Cross-Platform Anchor Scoring) |
| `reference/platforms/google-ads-deep.md` (Pull 0 section only) | Always — at Step 1.5.5, for Google Ads |
| `reference/playbook/benchmarks.md` | At triage scoring AND any deep-dive — contains Floor/Healthy/Strong thresholds per platform. **Now includes the four AOV-tier rows (Mass <$50, Standard $50-200, Premium $200-1K, Luxury / High-Ticket $1K+) plus DTC Luxury and B2B sub-tier rows** added in Wave 1 — the Premium row preserves the legacy jewelry / home / apparel sub-rows. |
| `reference/databox-data-layer.md` | Before any deep-dive |
| `reference/platforms/*.md` (full file) | Only for RED/YELLOW platforms — loaded at Step 1.7 |
| `reference/synthesizer.md` | At report generation — defines the 11-component Marketing Director Overview (Money Page added in v3) and chart inclusion rules |
| `reference/synthesis/dollar-impact-methodology.md` | Always — at synthesis time. Defines how findings translate into $/mo for the Money Page headline and the Findings Matrix Impact column. |
| `reference/synthesis/calibration-rollup.json` | At audit start (Methodology callout). Generated by the aggregation procedure in `outcomes-loop-template.md`. |
| `reference/pdf-template.md` | At report generation — PDF input JSON contract + 15-slide structure + theme hooks. v4 default. |
| `reference/docx-template.md` | **DEPRECATED in v4 — kept for one version cycle.** Old DOCX path. New audits should not load this; if loaded by accident, follow the deprecation banner pointer to `pdf-template.md`. |
| `scripts/build_audit_pdf.js` | At report generation — pptxgenjs renderer that consumes the PDF input JSON and outputs the final PDF. |
| `scripts/render_pdf.sh` | Called by `build_audit_pdf.js` for LibreOffice headless `.pptx` → `.pdf` conversion. |
| `scripts/generate_charts.py` | Always — at the chart-generation step in report building. |
| `templates/client-claude-md-scaffold.md` | At Step 1.0 when scaffolding a new client's CLAUDE.md. |
| `templates/audit-settings-scaffold.md` | One-time reference for the canonical content of `clients/_system/audit_settings.md`. |
| `templates/outcomes-template.md` | At Step 1.9 when stubbing the per-run outcomes file. |

### Playbook References (conditional, from workspace)

If the DTC playbook exists in the workspace (`_system/databox-audit-skill-source/reference/playbook/` or the shared `protocols/playbook/`), load the relevant chunk during deep-dives for richer strategic context. These are NOT required — the skill works without them — but they add depth to recommendations.

| Deep-dive platform | Playbook chunk to load |
|---|---|
| Google Ads | `google-ads.md` (PMax methodology, Shopping feed, branded cannibalization) |
| Meta Ads | `andromeda.md` (algorithm behavior, creative diversity, fatigue) |
| Meta Ads (if creative flagged) | `creative-testing.md`, `scaling-frequency.md` |
| GA4 | `measurement.md` (reconciliation methodology, CAPI, tracking validation) |
| Synthesizer (cross-channel) | `channel-allocation.md` (channel roles, halo effects, budget splits) |
| Any (AOV >) | `high-ticket.md` |
| Any (AOV <) | `low-ticket.md` |
