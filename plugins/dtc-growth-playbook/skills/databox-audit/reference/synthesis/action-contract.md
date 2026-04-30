# Action Contract — Databox-Audit v3

Every Priority Action that ships to the body of the report MUST satisfy all 7 fields below. An action missing any field does NOT belong in Priority Actions — it gets demoted to a "Worth investigating" Watchlist section at the bottom of the report.

**Authoritative source:** `v3-quality-framework.md` Section 2.2 ("Action Format Contract"). This file is the operational reference the synthesizer reads at draft-time; the v3 framework doc is the design authority. If anything in this file conflicts with Section 2.2 of the framework, the framework wins and this file gets corrected.

**The single test:** can an operator execute the action without asking a clarifying question? If yes, it's a Priority Action. If no, it's Watchlist (or it doesn't ship at all).

> **v3-money-page change:** EXPECTED IMPACT now requires a dollar/month figure (derived per `reference/synthesis/dollar-impact-methodology.md`) in addition to the operational lift and escalation rule. Actions whose underlying findings can only support a LOW-confidence dollar estimate get demoted to Watchlist — they're real flags but don't roll up into the Money Page headline.

---

## 1. The 7 fields

Every Priority Action must answer all seven of these questions. Each row below uses the canonical FAIL / PASS examples from `v3-quality-framework.md` Section 2.2 verbatim.

| Field | What it answers | FAIL example | PASS example |
|---|---|---|---|
| **WHAT** | The specific change. Named entity. | "Improve Meta creative" | "Pause `Spring Hero v2` ad; launch 3 hooks variants against `LAL 1% Purchase Seed`" |
| **WHY** | Which finding it addresses (link). | (no link) | "Addresses Finding #3: Meta TOF allocation mismatch." |
| **HOW** | Concrete steps. | "Test new creative" | "1) Pause `Spring Hero v2` in Ads Manager. 2) Duplicate ad set, swap headline to one of the 3 hooks: A) [hook], B) [hook], C) [hook]. 3) Set $80/day budget per hook, run 7 days. 4) Cut bottom hook day 8." |
| **WHEN** | Specific window. | "Soon" | "This week (by EOD Friday)" |
| **WHO** | Named role or person. | "The team" | "Agency creative lead + in-house ops" |
| **EXPECTED IMPACT** | Estimated $/mo impact with confidence band, plus the operational lift the dollar derives from. | "Improvement" | "~$8-15k/mo (MEDIUM confidence per `dollar-impact-methodology.md`). Operationally: expect 15-25% lift in CPATC over 14 days; if no lift by day 14, signal is creative-quality not allocation, escalate to broader creative refresh." |
| **MEASUREMENT** | How you know it worked, when. | "Monitor" | "Day 14 check: did winning hook beat current CPATC by ≥15%? Day 30 check: did Meta TOF spend share drop into target band? Day 60 check: did MER recover by ≥0.3×?" |

**Why all 7 are non-negotiable.** Any missing field breaks the action's executability:
- No WHAT → nothing actually changes.
- No WHY → the action is unanchored from the diagnosis; first pushback collapses it.
- No HOW → the operator stalls on "how do I actually do this," and the action drifts a week.
- No WHEN → it falls behind whatever has a deadline.
- No WHO → ownership ambiguity; everyone assumes someone else is on it.
- No EXPECTED IMPACT → the client can't prioritize this action against the other audits/projects on their plate, AND the action can't roll up into the Money Page headline. Without a $/mo figure, the audit's top-line opportunity number is incomplete.
- No MEASUREMENT → no learning loop, no calibration, and the next audit can't reference whether this one worked.

---

## 2. Output schema — the per-action table

Every Priority Action renders as a 2-column markdown table (Field / Detail). The synthesizer must produce exactly this format — no variation, no trimming columns, no merging cells.

```
| Field | Detail |
|---|---|
| **WHAT** | Pause `Spring Hero v2`; launch 3 hooks against `LAL 1% Purchase Seed` |
| **WHY** | Addresses Finding #3: Meta TOF allocation mismatch |
| **HOW** | 1) ... 2) ... 3) ... |
| **WHEN** | This week (by EOD Friday) |
| **WHO** | Agency creative lead + in-house ops |
| **EXPECTED IMPACT** | ~$8-15k/mo (MEDIUM, per `dollar-impact-methodology.md`). 15-25% lift in CPATC over 14 days; if no lift by day 14, escalate. |
| **MEASUREMENT** | Day 14: did winning hook beat current CPATC by ≥15%? Day 30: did Meta TOF spend share drop into target band? Day 60: did MER recover by ≥0.3×? |
```

**Section header pattern (above each table):** `### Action {N}: {one-line WHAT summary}` — e.g., `### Action 1: Reallocate Meta TOF spend out of `Spring Hero v2``. The header is the scannable index entry; the table is the contract.

**Ordering rule.** Priority Actions are ranked by expected business impact (largest revenue / margin / risk-mitigation effect first), not alphabetical, not by channel. The synthesizer renders 3-6 actions per `synthesizer.md` Section 2.5; if more than 6 candidates pass the contract, demote the bottom ones to Watchlist or roll them into the Per-Channel Pages.

**Executive Snapshot (Page 1) variant.** On the executive-summary page only, render a 3-column compact version showing **WHAT / WHEN / EXPECTED IMPACT** for the top 3 actions. The full 7-field table lives on the operator pages (Pages 2-N). Same actions, different layering — matches the reader-aware structure described in `v3-quality-framework.md` Section 3.

On the Page 1 (Money Page / Executive Snapshot) variant, the EXPECTED IMPACT column shows the dollar figure prominently — that's the version of the field that aggregates into the Money Page headline. The full text (operational lift + escalation rule) lives in the operator-page version of the action.

---

## 3. Field-level detail rules

Each field has a specificity bar. If the field exists but doesn't clear the bar, treat it as missing (demote to Watchlist).

**WHAT** — must name the entity. Specifically: the campaign, ad, audience, channel, segment, flow, or metric being changed. Generic verbs like "improve," "optimize," "test new" without a named entity FAIL. If the entity is a campaign, use the actual campaign name in backticks. If it's a channel, name it (`Meta`, `Google Ads`, not "paid").

**WHY** — must reference a numbered finding from the Findings Matrix. Format: "Addresses Finding #N: {one-line restatement}." If no Findings Matrix entry supports this action, the action shouldn't ship — go check whether the underlying finding actually passed the Insight Rubric. Cross-reference: see `findings-matrix.md` for the matrix structure and finding numbering convention.

**HOW** — must be enumerated steps an operator can execute without asking clarifying questions. Numbered list (1, 2, 3...). Each step names the surface (Ads Manager, Klaviyo, Shopify admin), the object (campaign / ad set / flow / collection), and the action (pause / duplicate / set budget / launch). If a step requires a creative asset, the asset has to be either attached, named, or specified ("3 hooks: A) [hook A], B) [hook B], C) [hook C]"). "Test new creative" without naming the creative FAILS.

**WHEN** — must be a specific window. Acceptable formats: `This week (by EOD Friday)`, `Next 2 weeks`, `Q3 2026`, `By {specific date}`. Unacceptable: `Soon`, `ASAP`, `When ready`, `Ongoing`. If the action is genuinely ongoing (e.g., a weekly cadence), state the cadence: `Weekly, starting next Monday`.

**WHO** — must name a role or a person. Acceptable: `Agency creative lead`, `In-house growth marketer`, `{Client} ops team + agency PPC manager`, `Tanner`. Unacceptable: `The team`, `Whoever owns this`. If two parties share ownership, name both and split the responsibility (`Agency owns creative production; client ops owns Ads Manager pause`).

**EXPECTED IMPACT** — four pieces required:
1. A **dollar/month estimate** — required. Derived per `reference/synthesis/dollar-impact-methodology.md`. Format: HIGH confidence renders as `~$X/mo`; MEDIUM as `~$X-Y/mo`; LOW means the action shouldn't ship as a Priority Action — demote to Watchlist.
2. A **confidence band** — explicit (`HIGH` / `MEDIUM`) — must match the methodology rules in `dollar-impact-methodology.md`.
3. An **operational lift estimate** — the percent or unit lift that the dollar derives from (e.g., `15-25% lift in CPATC over 14 days`). The operator needs this to know what they're watching for in the first 14 days before the dollar materializes.
4. An **escalation rule** — what happens if the operational lift doesn't materialize within the window. (`If no lift by day 14, signal is creative-quality not allocation, escalate to broader creative refresh.`) The escalation rule is what turns the action into a learning loop instead of a fire-and-forget.

> **Confidence floor.** If the underlying finding's confidence is LOW (per Findings Matrix), the action does NOT belong in Priority Actions. LOW-confidence findings can't carry a defensible dollar estimate, and an action without a defensible dollar can't roll up into the Money Page headline. Demote to Watchlist.

**MEASUREMENT** — must name **check-in dates** and **success thresholds**. Standard cadence is **14d / 30d / 60d** unless the action has a different natural rhythm. Each check-in needs a binary question with a numeric threshold:
- Day 14: did {metric} move by ≥{threshold}?
- Day 30: did {downstream metric} shift into {target band}?
- Day 60: did {account-level metric} recover by ≥{amount}?

"Monitor performance" FAILS. "Watch the dashboard" FAILS. The MEASUREMENT field is the calibration input that feeds the post-delivery feedback loop in `v3-quality-framework.md` Section 2.4.

---

## 4. Watchlist treatment

Actions that are real ideas but don't have a full 7-field contract get **one sentence** in a "Worth investigating" section at the bottom of the report. Not in Priority Actions. Not in Per-Channel Pages. Not in the executive summary. LOW-confidence findings are also routed here automatically — they're real flags worth investigating, but they don't carry the dollar estimate required for Priority Actions.

**Watchlist format:**

```
## Worth investigating

- {One-sentence description}. Missing: {comma-separated list of fields that aren't ready}.
- {One-sentence description}. Missing: {fields}.
```

Example:

```
- Test SMS list re-engagement flow against the inactive 90-day segment. Missing: HOW, EXPECTED IMPACT, MEASUREMENT.
- Audit Klaviyo flow deliverability — open rates suggest inbox placement issue. Missing: WHAT (which flow), WHO, MEASUREMENT.
```

**Why this matters.** The contract forces honesty about what's actually shippable vs what's vibes. v2 reports tend to bury soft suggestions inside Priority Actions because "we should put something there" — and the client either ignores them (because they can't act on them) or executes them badly (because the spec was incomplete). Watchlist is the honest place for ideas that are worth flagging but aren't ready to ship. The reader sees the difference between "execute this Friday" and "this is on our radar."

**Watchlist is intentionally lower-stakes.** It's not graded by the Quality Gate. It's not a TODO list. It's a sentence each, max 5 items, and the items that promote to Priority Actions in the next audit are the ones where someone (Tanner, the operator, the client) does the work to fill in the missing fields between audits.

---

## 5. Common failure modes

Patterns the synthesizer should refuse on sight. If a draft action looks like any of these, it FAILS the contract — either upgrade it (fill in the missing fields) or demote to Watchlist.

| Draft action | Fields it fails | Why it fails |
|---|---|---|
| "Improve creative" | WHAT, HOW, WHO, MEASUREMENT | No named asset, no production steps, no owner, no success threshold. Pure vibe. |
| "Test new audiences" | WHAT, HOW, WHEN, MEASUREMENT | Which audiences? Built how? Tested when? Against what threshold? None answered. |
| "Increase TOF spend" | HOW, EXPECTED IMPACT, MEASUREMENT | No spend amount, no expected nROAS lift, no 30/60-day check. Sounds directional but isn't executable. |
| "Optimize the funnel" | WHAT, HOW, WHEN, WHO, EXPECTED IMPACT, MEASUREMENT | Six fails out of seven. Almost the platonic ideal of a non-action. |
| "Pause underperforming campaigns" | WHAT, EXPECTED IMPACT, MEASUREMENT | No campaign names, no expected savings, no check-back. Becomes "pause stuff and hope" in execution. |
| "Refresh email flows" | WHAT (which flows), HOW, EXPECTED IMPACT, MEASUREMENT | Refresh how? Which flows? Expected revenue lift? Same failure shape as "improve creative." |
| "Expect double-digit ROAS lift" | EXPECTED IMPACT (no dollar, no operational lift detail, no escalation) | Sounds quantitative but doesn't translate into a Money Page line item or an operator's 14-day watchlist. |

---

## 6. Connection to the Insight Rubric

Every action's **WHY** field references a numbered finding. That finding **must have passed the Insight Rubric** (the 5-axis quality check in `insight-rubric.md`). If the finding didn't pass the rubric, it's in the appendix — and an appendix finding cannot anchor a Priority Action.

**The chain:** Insight Rubric (gates findings) → Findings Matrix (numbers the surviving findings) → Action Contract (forces every action to reference a numbered finding). Break any link in the chain and the report goes back to v2-grade vibes.

**If the synthesizer drafts an action that wants to ship but no rubric-passing finding supports it:** the action shouldn't ship. Period. Either the finding needs to be upgraded so it passes the rubric, or the action is an idea looking for evidence — and ideas without evidence go to Watchlist (or get cut). Cross-reference: see `insight-rubric.md` for the 5-axis check (Specificity, Causality, Implication, Confidence, Counterargument).

This is the v3 contract: actions trace to findings; findings trace to evidence; evidence comes from the data layer. Anything that breaks that chain is sloppy thinking, and the contract's job is to catch it before the docx renders.
