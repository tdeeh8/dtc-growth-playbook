# Quick Check Process

This file is loaded for quick checks — when the user wants to look at one specific metric, campaign, or channel question. Not a full audit.

## How Quick Checks Differ

- No working notes file needed (unless findings warrant one)
- No DOCX report (answer in chat unless user asks for a doc)
- No full evidence collection sweep — go directly to the relevant data
- Still use playbook benchmarks to evaluate what you find
- Still use OBSERVED/INFERENCE labels for any claims

## Process

### Step 1: Identify the Question

What exactly does the user want to know? Examples:
- "What's the ROAS on our Meta campaigns?"
- "Is this Google campaign worth keeping?"
- "Why did conversions drop last week?"
- "How's the email flow performing?"

### Step 2: Go to the Data

Open the relevant platform. Navigate directly to the data that answers the question. Use `read_page` for data tables, screenshots for visual context.

Record what you see with OBSERVED labels. Pull the specific metrics relevant to the question, plus any immediately adjacent context (e.g., if they ask about ROAS, also grab spend, conversions, and CPM to contextualize).

### Step 3: Compare to Benchmarks

Check the user's metrics against playbook benchmarks (benchmarks.md). Use Floor/Healthy/Strong thresholds to evaluate. Calculate break-even CPA and minimum ROAS from their AOV + margin if available.

### Step 4: Answer Directly

Give the user a clear, direct answer. Structure:
1. **The number** — what you observed
2. **The context** — how it compares to benchmarks and their own history
3. **The diagnosis** — what's likely causing it (if the question is "why")
4. **The action** — what to do about it (1-2 specific steps)

Keep it concise. If the answer reveals a bigger problem that warrants a full audit, say so — but answer the immediate question first.

## When to Escalate to Standard Audit

If during a quick check you discover:
- Multiple compounding issues across platforms
- Tracking appears broken (conversions don't match orders)
- Fundamental structural problems (wrong campaign types, no retargeting, broken flows)
- The user's question can't be answered without cross-platform context

Tell the user: "I can answer your specific question, but I'm seeing [X] that suggests a deeper issue. Want me to run a standard audit to get the full picture?"

## Profitability Quick Check Variant

If the user asks a profitability question ("Are we actually making money?" / "What's our real CPA?" / "Is this channel profitable?"):

1. Pull revenue + order count from Shopify
2. Pull spend from the relevant platform(s)
3. Calculate MER, blended CPA, blended ROAS
4. If COGS/margin available: calculate break-even CPA, CM3
5. If not available: use COGS estimate table from benchmarks.md by vertical, label as ASSUMPTION
6. Compare to profitability benchmarks by vertical
7. Give a clear "profitable / marginal / losing money" verdict with the math shown
