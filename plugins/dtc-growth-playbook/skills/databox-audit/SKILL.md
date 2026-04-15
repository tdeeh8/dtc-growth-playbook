---
name: databox-audit
description: "Triage-first marketing audit via Databox MCP. Scans all connected ad platforms with lightweight diagnostic pulls, scores each red/yellow/green, then deep-dives ONLY into platforms with real problems. Use for: '/databox-audit', 'databox audit', 'audit their databox', 'triage audit via databox', 'audit [client] in databox', or when the user wants a Databox-powered marketing audit. Covers: Google Ads, Meta Ads, Amazon Ads, GA4, Shopify/BigCommerce. Does NOT cover SEO, CRO, or Klaviyo."
---

# Databox-Audit — Triage-First Marketing Audit

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

### Step 1.1: Resolve Account + Gather Client Info

**Cache-first flow: look up the client BEFORE asking questions so you can pre-populate platform options.**

**A. Resolve account from cache:**

1. Extract client name from the user's message (e.g., "audit Acme Store" → search for "Acme")
2. Check if `databox_account_cache.md` exists in the user's workspace root
3. **If cache exists:** Read it, search for client name (fuzzy match — "Acme Store" matches "Acme-Store")
   - **Found** → note the `account_id` and the `data_source_id` for each connected platform. Proceed to step B with this info.
   - **Not found** → cache may be stale. Go to step 4.
4. **If no cache or cache miss:** Call `list_accounts`, then for the matching account call `list_data_sources(account_id)`. Parse and save the cache file (see cache format below). Search the fresh cache for the client.
5. **Still not found after fresh pull** → ask user for the exact account name in Databox.

**B. Ask user to confirm — with pre-populated platforms from cache:**

Use AskUserQuestion. The platform question should show ONLY the platforms found in the cache for this client, pre-selected, so the user just confirms or unchecks any they don't want audited.

**Required questions:**
- **Client name + account** → "I found account '{Account-Name}' with these data sources. Confirm?" (pre-filled from cache)
- **Platforms to audit** → multiSelect checkboxes showing ONLY the client's connected data sources from cache (e.g., if cache shows "Google Ads, Meta Ads, Shopify, GA4" → show those four as options, not a generic list of all possible platforms)
- **Department** → Agency client, Brand (own product), or Prospect (pre-sales)?
- **Lookback period** → Options: Last 30 days, Last 90 days, YTD, Last 6 months, Last 12 months, Custom
- **Known focus areas** → anything specific? (e.g., "ROAS dropping", "PMax cannibalizing branded")

**Optional:** Monthly revenue, monthly ad spend, AOV tier, vertical

Store confirmed `account_id` and the per-platform `data_source_id` map in the manifest.

### Step 1.2: Databox Account Cache Management

The cache avoids re-calling `list_accounts` + `list_data_sources` on every audit.

**Cache file format** (`databox_account_cache.md` in workspace root):
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
- The cache is user-specific and lives in the workspace root — NOT inside the skill source. Each user generates their own on first run.
- Parse the responses via bash (python/grep) — do NOT try to read raw long responses into context. Normalize platform types (e.g., "Facebook Ads" → "Meta Ads", "Google Analytics 4" → "GA4").
- The cache is a slim table: account name + account_id + platform + data_source_id. No metric keys — those are resolved at pull time via `list_metrics`.
- If a user says a platform is connected but the cache doesn't show it → re-pull `list_data_sources` for that account and update cache.
- If cache is older than 30 days → re-pull on next audit to catch new accounts or new integrations.

### Step 1.3: Create Manifest + Evidence Directory

1. Create evidence directory per file routing rules
2. Create `{Client}_audit_manifest.md` with: client info, `account_id`, per-platform `data_source_id` map, lookback period, platform list, Data Source: Databox MCP
3. Include a Triage Results section (will be filled in Step 1.4)

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

### Step 1.4: Run Triage Scan (THE CORE STEP)

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

Ask: "This is what I'm seeing. Want me to proceed with deep-dives on the flagged platforms, or adjust?"

### Step 1.5: Deep-Dive Flagged Platforms

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

**RED platforms:** Run full deep-dive (all pulls in the platform file)
**YELLOW platforms:** Run targeted deep-dive (2-3 pulls focused on the flagged signal)

**GREEN platforms:** No deep-dive. Write a brief evidence JSON with triage metrics only. Note: "Platform scored GREEN at triage. No deep-dive performed."

**Context window management:**
- After each deep-dive, self-check: "Am I still producing detailed analysis or starting to abbreviate?"
- If you've completed 2 deep-dives and there's a 3rd RED platform, recommend a session break
- The manifest is your checkpoint — nothing is lost by breaking

### Step 1.6: Generate Report

After all deep-dives complete (or user says "just give me the report"):

1. Read `reference/synthesizer.md`
2. Follow its instructions to generate the cross-channel report
3. Report emphasizes the RED/YELLOW platforms with detailed findings
4. GREEN platforms get a 1-paragraph health summary
5. Save report, update manifest

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
8. Offer to generate single-platform report

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
3. Read `reference/synthesizer.md`, follow its instructions
4. Save report, update manifest

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
- Browser-first audits — use `/audit` if Databox isn't connected
- Site design/UX evaluation

---

## Reference Files

| File | When to load |
|---|---|
| `reference/triage-pulls.md` | Always — at triage step (Step 1.4) |
| `reference/playbook/benchmarks.md` | At triage scoring AND any deep-dive — contains Floor/Healthy/Strong thresholds per platform |
| `reference/databox-data-layer.md` | Before any deep-dive |
| `reference/platforms/*.md` | Only for RED/YELLOW platforms |
| `reference/synthesizer.md` | At report generation |

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
