# Plan: Add Adzviser Fallback to /databox-audit → Rename to /ecom-audit

**Status:** Decisions locked. Ready to implement.
**Target version:** v5-multiprovider (hard cutover from v4-cowork-memory).
**Skill rename:** `databox-audit` → `ecom-audit`. Slash command becomes `/ecom-audit`.
**Sibling skill:** `/ads-audit` is removed once v5 ships (its functionality is fully absorbed).

---

## 1. Goal in one paragraph

Make this skill data-source-agnostic: it tries Databox first as a whole; if the client has no Databox account at all, it falls back to Adzviser as a whole. The fallback is **all-or-nothing per audit**, not per-platform — once we know the data provider for this client, every pull in the audit goes through that provider. The Adzviser pull patterns from `/ads-audit` move into this skill so the old skill can be deleted.

---

## 2. Locked-in decisions (from review)

| # | Question | Decision |
|---|---|---|
| 1 | Per-platform vs all-or-nothing fallback | **All-or-nothing.** If client is in Databox, pull everything Databox has. If no Databox account, fall back to Adzviser entirely. |
| 2 | Skill / slash-command name | **Rename to `/ecom-audit`.** Folder, SKILL.md `name:`, description, and slash command all change. |
| 3 | What to do with `/ads-audit` | **Delete it** once v5 ships. Functionality is fully absorbed. |
| 4 | Cache staleness window | **Drop the 30-day refresh rule.** Trust cache; refresh only on miss. |
| 5 | COGS prompting when Shopify lacks COGS | **Don't prompt.** Skip COGS-dependent math if data is absent and the user hasn't explicitly given margin. MER target falls back to the flat 3.0× last-resort path silently — no AskUserQuestion. |
| 6 | TOF Mode pull routing | **Yes — just route through the provider.** No new logic needed. |

---

## 3. Architecture — the simplified routing layer

A single field per audit: `data_provider: "databox" | "adzviser"`. Computed once in Step 1.1, written into the manifest, read by every downstream step.

### Resolution algorithm (Step 1.1)

```
1. Read clients/_system/databox_account_cache.md.
2. Fuzzy-match the client name. If found → data_provider = "databox". Resolve account_id and per-platform data_source_id map. Done.
3. Else read clients/_system/adzviser_workspace_cache.md.
4. Fuzzy-match the client name. If found → data_provider = "adzviser". Resolve workspace_name. Done.
5. Else: refresh whichever cache(s) missed. Repeat steps 1–4.
6. Still nothing → ask user "Is this client in Databox or Adzviser? What's the exact account/workspace name?"
```

The user can override the resolved provider in the AskUserQuestion if they want to force-fall-back to Adzviser even when Databox has the account (rare, but useful for diagnostic comparisons).

### Cache files

Two parallel caches, no expiry:

| Cache | Path | Source | Refresh trigger |
|---|---|---|---|
| Databox accounts | `clients/_system/databox_account_cache.md` | `list_accounts` + `list_data_sources` | Cache miss |
| Adzviser workspaces | `clients/_system/adzviser_workspace_cache.md` | `list_workspace` | Cache miss |

The Adzviser cache file is a port of the format from `/ads-audit` — slim table of workspace + connected platforms.

---

## 4. File-by-file change list

The folder and skill name changes everywhere. References below use the new name `ecom-audit`.

### 4.1 RENAME: `skills/databox-audit/` → `skills/ecom-audit/`

Mechanical rename. Source folder: `_system/databox-audit-skill-source/` → `_system/ecom-audit-skill-source/`. Update `_system/scripts/sync-skill.sh` invocations from `databox-audit` to `ecom-audit`. Bake a one-time grep across `Claude Buddy/CLAUDE.md` and the protocols folder for any path or slash-command references that need updating.

### 4.2 SKILL.md (the orchestrator) — major rewrite

- **Frontmatter.** `name: ecom-audit`. New description: emphasize "ecommerce marketing audit via Databox MCP (preferred) or Adzviser MCP (fallback). One command: `/ecom-audit`. Triggers on: `/ecom-audit`, `audit [client]`, `ecom audit`, `marketing audit`, `triage audit`."
- **Header banner.** Bump framework version to `v5-multiprovider`. Add v5 changes block. Add v4 → v5 hard-cutover note (v4 manifests can't resume under v5).
- **Step 1.1 — rename to "Resolve Provider + Gather Client Info."** Implements the §3 algorithm. AskUserQuestion shows the resolved provider, the resolved account/workspace, and the platforms found connected. User confirms or unchecks platforms.
- **Step 1.2 — Cache Management.** Two cache file specs side-by-side. No staleness window. Refresh on miss only.
- **Step 1.3 — Manifest schema delta.** Single `data_provider` field. Plus `databox_account_id` (when provider=databox) OR `adzviser_workspace_name` (when provider=adzviser). The per-platform `data_source_id` map only exists when provider=databox.
- **Step 1.3.5 — Connection Health Check.** One branch per provider:
  - `databox` → `list_metrics(data_source_id=N)` per connected data source.
  - `adzviser` → `list_metrics_and_breakdowns_{platform}` per connected platform.
- **Step 1.4 / 1.5 / 1.5.5 / 1.6 / 1.7.** Each step's pull instructions read: "use the syntax in `{provider}-data-layer.md`." Single conditional branch at the top of each step is enough.
- **COGS rule update.** The COGS Prompting Rule section in `triage-pulls.md` is removed entirely. Replaced with: "If COGS is unavailable, set MER target via the flat 3.0× fallback (per `playbook/benchmarks.md` MER Target Derivation → Fallback) and flag in the report. Do not prompt the user."
- **Reference Files table at bottom.** Update to reflect new files + the single-provider conditional load.

### 4.3 NEW: `reference/adzviser-data-layer.md`

Direct port from `/ads-audit/reference/adzviser-data-layer.md`. Add a header note:

> "This file is the FALLBACK data layer. Use it only when the manifest's `data_provider` field is `adzviser`. For Databox-provided audits, use `databox-data-layer.md`."

Otherwise identical: workspace resolution, core workflow, timeout rules, request keys, metric tiers, fallback protocol.

### 4.4 UPDATE: `reference/triage-pulls.md`

Refactor each platform section so the metric LISTS and SCORING THRESHOLDS stay (provider-agnostic), and the call syntax becomes a single redirect at the top of the file:

> "Pull syntax depends on `data_provider` from the manifest. For `databox`: one `load_metric_data` call per metric (see `databox-data-layer.md`). For `adzviser`: one `retrieve_reporting_data` call per period bundling all metrics for the platform (see `adzviser-data-layer.md`). Adzviser may return additional metrics beyond what's requested — accept and use them."

Also: **delete the entire COGS Prompting Rule section.** Replace with a one-paragraph note that COGS-missing scenarios silently fall through to the flat 3.0× MER target.

### 4.5 UPDATE: `reference/platforms/*.md` (six files)

Add a one-paragraph header to each:

> "Pull syntax depends on the audit's `data_provider`. The pull RECIPES below are written semantically (metric name + dimension + lookback). Resolve them via `databox-data-layer.md` or `adzviser-data-layer.md` depending on the manifest."

The RECIPES (which metrics, which dimensions, what scoring) don't change.

### 4.6 UPDATE: `templates/client-claude-md-scaffold.md`

Add one row to the Identity section: `Data provider:` (e.g., `Databox`, `Adzviser`). Populated from the resolved provider at first audit. Subsequent audits read this to skip the cache lookup if the user has already confirmed.

### 4.7 UPDATE: `reference/synthesizer.md`

Methodology callout gets one new sentence: *"Data was pulled via {Databox | Adzviser}."* Reading from the manifest's `data_provider` field.

### 4.8 DELETE: `/ads-audit` skill

After v5 ships and is verified on at least two clients (one pure-Databox, one pure-Adzviser), delete:
- `skills/ads-audit/` (installed location)
- `_system/ads-audit-skill-source/`
- `_system/ads-audit-dist/`

Confirm `protocols/plugin-management.md` references are also cleaned up.

### 4.9 NO CHANGE NEEDED

- All `reference/synthesis/*` (rubric, dollar-impact, templates) — operate on evidence JSON.
- `reference/playbook/benchmarks.md` — provider-agnostic.
- `reference/full-funnel-framework.md` — provider-agnostic.
- All scripts (`build_audit_pdf.js`, `generate_charts.py`, `render_pdf.sh`).
- `reference/pdf-template.md`.

---

## 5. Manifest + evidence JSON schema deltas

### Manifest header

```yaml
- framework_version: v5-multiprovider
- data_provider: databox            # or "adzviser"
- databox_account_id: 12345         # only when data_provider = databox
- adzviser_workspace_name: null     # only when data_provider = adzviser
- data_sources:                     # only when data_provider = databox
    google_ads: 678901
    meta_ads: 678902
    ...
```

### Evidence JSON (per platform)

Add one field at the top:

```json
{
  "platform": "meta_ads",
  "data_provider": "databox",
  "data_source_handle": "678902",   // data_source_id for databox, workspace_name for adzviser
  ...
}
```

This makes evidence reproducible from the file alone — no need to consult the manifest to know how the data was pulled.

---

## 6. Implementation order

Smallest blast radius first. Commit + sync after each step; manually test on a known client.

1. **Rename folder + skill.** `_system/databox-audit-skill-source/` → `_system/ecom-audit-skill-source/`. Update SKILL.md frontmatter. Update `sync-skill.sh` references. Sync. Confirm `/ecom-audit` slash command activates the skill. (No behavior change yet — still Databox-only.)
2. **Add `reference/adzviser-data-layer.md`.** Port from `/ads-audit`. Zero behavior change yet.
3. **Update `reference/triage-pulls.md`.** Refactor pull-syntax blocks to the single redirect. Delete COGS Prompting Rule, replace with flat-fallback note. Test that an existing pure-Databox audit still runs correctly.
4. **Update SKILL.md Step 1.1 + 1.2.** Add Adzviser cache check + provider resolution + simplified COGS handling. From this point, manifests stamp `v5-multiprovider`.
5. **Update SKILL.md Step 1.3.5 + Step 1.5 + Step 1.7.** Provider-aware health checks and pull routing. Audits can now actually use Adzviser end-to-end.
6. **Update `reference/platforms/*.md`** with the header pointer. Six files, mechanical edit.
7. **Update `templates/client-claude-md-scaffold.md` + `reference/synthesizer.md`.** Provider tracking in CLAUDE.md and methodology callout.
8. **Test on three clients:** one Databox-only, one Adzviser-only, one in both (confirm Databox wins). Compare the Databox-only run against a v4 baseline to confirm no regression.
9. **Delete `/ads-audit`.** Installed folder, source folder, dist folder, plugin-management references. Final sync.
10. **Sync to GitHub plugin** per `protocols/plugin-management.md`.

---

## 7. Risks / things to watch

- **Resume mode (Mode 3)** has to refuse v4 manifests. Document it in the v5 banner.
- **Client name fuzzy-matching across two caches.** A client called "Acme Co" in Databox and "Acme Store" in Adzviser may not collide on the fuzzy match. The Step 1.1 algorithm should look in BOTH caches even after a Databox hit, just to surface "also found in Adzviser as 'Acme Store' — confirm which?" to the user when names don't exactly align. Edge-casey but worth handling.
- **Metric-name drift.** Databox `GoogleAds@cost` and Adzviser `Cost` should map to the same number. Evidence JSON should record raw pulled values (not normalized).
- **Channel Role Classification dimension names** differ slightly between Databox and Adzviser (Meta breakdown name in particular). Note these inline in the data-layer files where they diverge.
- **Silent COGS fallback** (per decision 5) means audits without COGS will quietly produce a flat-3.0× MER target. The synthesizer's Methodology callout should call this out: *"COGS data was not available — MER target uses flat 3.0× fallback. Add COGS in Shopify or pass margin manually for a more accurate target."* Without this surface, the report can mislead on profitability.

---

## 8. Ready to start?

Steps 1-3 in §6 are documentation-only and reversible. I can knock those out in one pass and show you the diffs before moving to Step 4 (which is when behavior actually changes). Say go and I'll start.
