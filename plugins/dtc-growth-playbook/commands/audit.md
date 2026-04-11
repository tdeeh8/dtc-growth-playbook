---
description: Start, resume, or run any marketing audit — the single entry point for the entire audit system
argument-hint: "[client name] or [platform URL]"
---

# /audit

> The only audit command you need. Starts new audits, resumes in-progress ones, runs single-channel deep dives, and generates reports — all from one entry point.

## Usage

```
/audit                                  → Asks which client and what to audit
/audit Kodiak Leather                   → New client? Full interview. Existing? Resumes where you left off
/audit https://ads.google.com/...       → Auto-detects Google Ads, runs that audit
/audit Kodiak Leather Meta              → Runs just Meta Ads for Kodiak Leather
```

## What This Command Does

This command is the single entry point for the modular audit system. It detects what you need from context:

- **No manifest exists** → Interviews you, creates the audit plan, starts running platform audits in sequence, auto-generates the report when done
- **Manifest exists with platforms remaining** → Picks up where you left off, runs the next platform
- **Manifest exists with all platforms done** → Generates the cross-channel report
- **Specific platform mentioned** → Runs just that one platform audit
- **Platform URL pasted** → Auto-detects the platform and runs its audit

Between sessions, just say `/audit [client name]` to resume. The manifest tracks all progress.

## Execution Instructions

When this command is invoked, the audit skill's SKILL.md (the parent of this commands/ directory) contains the complete orchestration logic. Read and follow it for all modes: Full Audit, Channel Audit, Resume, and Report generation.
