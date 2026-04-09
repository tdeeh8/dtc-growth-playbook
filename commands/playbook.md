---
description: Browse or search the DTC Growth Playbook
allowed-tools: Read, Grep, Glob
argument-hint: [topic or "list"]
---

The user wants to browse or search the DTC Growth Playbook.

If the argument is "list" or empty, read the SKILL.md at `${CLAUDE_PLUGIN_ROOT}/skills/playbook-reference/SKILL.md` and present the Available Chunks table so the user can see what's in the playbook.

If the argument is a topic (e.g., "frequency", "andromeda", "benchmarks", "TOF", "creative", "email"), search the playbook chunk files in `${CLAUDE_PLUGIN_ROOT}/references/` for that topic. Read the most relevant chunk(s) and present a concise summary of what the playbook says about that topic.

Present the information conversationally — don't just dump the raw file. Summarize the key points and offer to go deeper on any section.
