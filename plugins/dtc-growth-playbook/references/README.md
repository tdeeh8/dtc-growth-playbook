# DTC Growth Playbook — Modular Knowledge Base

## What This Is

A modular playbook for DTC/ecommerce marketing strategy, built for AI-assisted workflows. Each file covers one topic and stays under 1,500 tokens so skills and agents can load only what they need.

Sources: Stroud Marketing Science Framework (30+ Zoom calls), Klaviyo 2026 benchmarks, Meta Andromeda documentation (October 2025 rollout), internal strategy discussions.

## Files

| File | What It Covers |
|---|---|
| index.md | Routing table — which chunk to load for which task |
| tof-strategy.md | Three-layer framework (Reach, ATC, Purchase), event selection, budget ratios |
| creative-testing.md | Hook/body/CTA model, 3:2:2 method, budget rules |
| mat-testing.md | Messaging Architecture Testing, VP identification, campaign type selection |
| andromeda.md | Meta Andromeda algorithm rules, campaign structure, creative diversity |
| scaling-frequency.md | Frequency thresholds by AOV, scaling sequence, narrow delivery fixes |
| high-ticket.md | Long-cycle strategy, custom events, off-platform conversion |
| low-ticket.md | Compressed framework for under $100 AOV |
| email-sms.md | Flows vs. campaigns, nurture design, seasonal frequency, AI features |
| benchmarks.md | All funnel benchmarks in scannable tables with sources |
| measurement.md | Attribution, incrementality, MMM, cross-validation |
| channel-allocation.md | Channel roles, seasonal budget, incrementality-based allocation |
| list-building.md | Pop-ups, co-registration, first-party data, CLV segmentation |
| post-purchase.md | Aha! moment, flow structure, return prevention |

## How to Integrate with Skills

Start of any skill that does analysis or strategy work, add a "Before Starting" block that reads the index and relevant chunks. Example:

```
## Before Starting: Load Playbook Context

Read `reference/playbook/index.md`, then load these chunks based on the task:
- For Meta analysis: tof-strategy.md, creative-testing.md, andromeda.md, scaling-frequency.md, benchmarks.md
- For email/Klaviyo: email-sms.md, list-building.md, benchmarks.md
- For full audit: tof-strategy.md, creative-testing.md, benchmarks.md, email-sms.md, channel-allocation.md, measurement.md
- For Amazon: benchmarks.md
- For quick check-in: benchmarks.md

If client AOV is $200+, also load high-ticket.md. If under $100, load low-ticket.md.

Use playbook benchmarks and frameworks when analyzing data and forming recommendations.
```

## Publishing Updates to GitHub

The playbook is distributed as a Cowork plugin via a private GitHub repo: `github.com/{your-username}/dtc-growth-playbook`

**When Tanner says "push the playbook to GitHub" or "update the plugin":**

1. Sync local chunks to the plugin repo:
```
# Via osascript on Tanner's Mac:
PLUGIN_DIR="/Users/tannerhill/Library/Mobile Documents/com~apple~CloudDocs/Claude Buddy/_temp-plugin-push"
REPO_DIR="/tmp/dtc-growth-playbook"

# Clone, copy updated files, commit, push
git clone https://github.com/{your-username}/dtc-growth-playbook.git $REPO_DIR
# Copy all 13 chunks from reference/playbook/ → $PLUGIN_DIR/skills/playbook-reference/references/
# Copy SKILL.md, plugin.json, playbook.md, README.md if changed
# cp -R $PLUGIN_DIR/. $REPO_DIR/
# git add -A && git commit -m "Update playbook chunks — [description]" && git push
# Clean up temp dirs
```

2. Files to sync (local → plugin repo):
   - `reference/playbook/*.md` (excluding index.md, README.md) → `references/` (shared at plugin root)
   - Plugin skills at `skills/client-audit/SKILL.md` and `skills/playbook-reference/SKILL.md` — only if changed
   - Plugin commands at `commands/` — only if changed
   - `README.md` and `.claude-plugin/plugin.json` — only if plugin-facing content changed

3. After push: confirm commit hash and verify file count matches

**Team members get updates automatically** — Cowork pulls the latest from the GitHub repo when a plugin is used. No reinstall needed.

---

## Keeping It Updated

This playbook uses a learning loop tied to the 3-strike promotion rule:

1. After audits or strategy sessions, note new findings in workspace notes tagged [new] with the chunk name. Example: `[new] [benchmarks] Client X welcome flow at 52% open rate — above top performer range. (2026-04-08)`
2. Same pattern across 2+ clients: tag [confirmed x2]
3. At 3 confirmations: update the relevant chunk with date and source
4. If something contradicts existing playbook content: flag and update immediately

## Skill-Specific Integration Patches

### For the audit skill (all platforms)

The consolidated audit skill at `skills/audit/SKILL.md` is the single entry point. It dispatches to platform-specific files under `reference/platforms/` which each specify their own playbook loading in their "Before You Start" section. The orchestrator does NOT load playbook chunks itself — each platform skill loads only what it needs.

**Platform → Playbook mapping (defined in each platform's skill file):**

| Platform Skill | Playbook Chunks Loaded |
|---|---|
| `reference/platforms/google-ads.md` | benchmarks, google-ads, measurement + AOV-conditional |
| `reference/platforms/meta-ads.md` | benchmarks, andromeda, scaling-frequency, measurement + creative-testing, tof-strategy (conditional) + AOV-conditional |
| `reference/platforms/shopify.md` | benchmarks, measurement + AOV-conditional |
| `reference/platforms/bigcommerce.md` | benchmarks, measurement + AOV-conditional |
| `reference/platforms/klaviyo.md` | benchmarks, email-sms, list-building + AOV-conditional |
| `reference/platforms/amazon-ads.md` | benchmarks + AOV-conditional |
| `reference/platforms/ga4.md` | benchmarks, measurement + AOV-conditional |
| `reference/platforms/site.md` | benchmarks + high-ticket (if AOV $200+) |
| Synthesizer (`reference/synthesis/synthesizer.md`) | benchmarks, channel-allocation, measurement + platform-conditional + AOV-conditional |

### Post-Audit Playbook Learning Step

After completing any audit, evaluate: did any findings contradict or extend the playbook? If yes, note in the relevant department's workspace notes tagged `[new]` with the chunk it relates to.
