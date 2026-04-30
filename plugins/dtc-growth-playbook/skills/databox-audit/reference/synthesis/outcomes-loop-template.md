# Post-Delivery Outcomes Loop — Databox-Audit v4

The structured way to capture what happened after an audit shipped — what got implemented, what moved, what didn't, and what the framework should learn from it. This file defines the template the synthesizer drops into the dated run folder at audit completion, the 30 / 60 / 90-day fill cadence, and the quarterly aggregation that feeds calibration back into the rubric, contract, and pattern detection rules.

> **v4-cowork-memory change:** Outcomes files now live inside the dated run folder under each client (`clients/{Client}/runs/{date}/outcomes_template.md`) instead of a flat per-client file. The cross-audit calibration rollup reads them from the new path. The CLAUDE.md `## Outcomes` section keeps a one-line pointer per audit so the user can browse history without digging into run folders.
>
> **v3-money-page change (carried into v4):** Outcomes files feed a calibration rollup that the synthesizer reads at every audit start. The Methodology section in new audits cites the hit-rate from past predictions, so the dollar estimates in this audit are anchored to the system's track record.

**Authoritative source:** `v3-quality-framework.md` Section 2.4 ("Pre-Delivery Quality Gate + Post-Delivery Feedback Loop"), updated for v4 file locations in `v3-quality-framework-addendum.md`'s v3→v4 cutover note. This file is the operational reference the synthesizer reads at audit-completion time. If anything here disagrees with Section 2.4 (modulo the v4 path changes), the framework spec wins — fix this file.

**Where the file lives.** Each audit produces one outcomes file, saved to the dated run folder alongside the audit PDF:

```
clients/{Client-Slug}/runs/{YYYY-MM-DD}[-rN]/outcomes_template.md
```

The date in the path is the audit-delivery date, not the check-in date. The same file is appended to at 30 / 60 / 90 days — nothing is overwritten, nothing is replaced. The point of the loop is the longitudinal record. The CLAUDE.md `## Outcomes` section gets a one-line pointer (`{YYYY-MM-DD}: see runs/{YYYY-MM-DD}[-rN]/outcomes_template.md`) so historical audits are findable without ls'ing every dated folder.

**The single test:** at the next quarterly calibration, can someone reconstruct (a) which Priority Actions actually shipped, (b) whether the predicted impacts hit, and (c) what the framework should have done differently? If the file doesn't answer those three questions cleanly, it isn't earning its place.

---

## 1. The capture format

Verbatim structure from `v3-quality-framework.md` Section 2.4. The synthesizer generates this exact skeleton at audit completion — pre-populated where it can be, empty where the data hasn't happened yet.

```markdown
# {Client} Audit Outcomes — {original audit date}

**Audit delivered:** {YYYY-MM-DD}
**Dominant pattern:** {pattern name from manifest.dominant_pattern}
**Owner:** {who fills this file — Tanner / account manager / client}
**Linked audit PDF:** `{relative path to the audit PDF}`
**Linked audit MD source:** `{relative path to the .md source}`
**Linked manifest:** `{relative path to manifest.md}`

---

## Implementation tracker (per Priority Action)

| Action | Status (Done/In-Progress/Skipped) | Date completed | Reason if skipped | Outcome observed |
|---|---|---|---|---|
| Action 1: {one-line WHAT summary} | Not yet checked | — | — | — |
| Action 2: {one-line WHAT summary} | Not yet checked | — | — | — |
| Action 3: {one-line WHAT summary} | Not yet checked | — | — | — |

---

## Predicted vs actual (per measurable claim)

| Finding | Predicted impact | Actual at 30d | Actual at 60d | Match? (Y/N/Partial) |
|---|---|---|---|---|
| Finding #1: {short label} | {predicted band, e.g. "15-25% lift in CPATC over 14 days"} | — | — | — |
| Finding #2: {short label} | {predicted band} | — | — | — |

---

## Pushback & defenses

| Claim challenged | Who challenged | Evidence held up? | Adjustment needed? |
|---|---|---|---|
| (none yet) | — | — | — |

---

## Calibration learnings (feeds v4)

- (filled at 90d)
- (filled at 90d)
- (filled at 90d)
```

Headings, column orders, and section sequence are fixed. Don't reorder. Quarterly aggregation parses these files programmatically — drift in structure breaks the parse.

---

## 2. Synthesizer's role at audit completion

When the audit PDF is finalized (after the Pre-Delivery Quality Gate passes per `v3-quality-framework.md` Section 2.4 — gate logic carries forward into v4 unchanged), the synthesizer ALSO writes the stub outcomes file into the dated run folder. Tanner doesn't manually create this — the system generates the scaffolding at audit time so the 30 / 60 / 90-day check-ins land on a pre-formatted file. The CLAUDE.md `## Outcomes` pointer is appended at the same time so the file is discoverable from the client's memory zone.

**What the stub is pre-populated with:**

1. **Audit metadata.** Delivery date, dominant pattern, owner field (defaults to "Tanner" unless the manifest specifies an account-manager handoff), relative paths to the PDF, the .md source, and the manifest.
2. **Implementation tracker rows — one per Priority Action.** Pull the WHAT summary from each action contract row (per `action-contract.md` Section 2). Status defaults to `Not yet checked`. Date completed, Reason if skipped, Outcome observed are all `—`.
3. **Predicted vs actual rows — one per measurable claim.** Walk the body findings; for each finding whose Action Contract `EXPECTED IMPACT` field carries a numeric prediction (e.g., "15-25% lift in CPATC", "MER recovery ≥0.3×", "5-10% revenue lift over 60 days"), generate a row. The Predicted impact cell quotes the contract's expected-impact language verbatim. Actual at 30d and 60d default to `—`.
4. **Pushback section.** Single placeholder row reading `(none yet)`.
5. **Calibration section.** Three empty bullets labeled `(filled at 90d)`.

**Where it slots in.** Synthesizer step `1.9 — Outcomes Capture Setup`, immediately after the PDF is written and immediately before SKILL.md Step 1.10 (CLAUDE.md update). The step takes the manifest + the action contract table + the body findings list as inputs and produces the stub outcomes file as output. Log the file path into `manifest.outcomes_file` so future tooling can find it without filename guessing.

**Selection rule for "measurable claim".** Not every finding produces a Predicted vs actual row — only findings with a numeric prediction in their Action Contract's `EXPECTED IMPACT` field. Findings whose impact is qualitative ("expect retention to improve as lifecycle hygiene returns") don't generate a row; they're tracked in the implementation tracker via their parent Priority Action only. This keeps the predicted-vs-actual table honest — every row has a verifiable number.

---

## 3. 30 / 60 / 90-day fill cadence

Each checkpoint adds rows or fills cells; nothing is overwritten. The owner field at the top of the file tells the calendar reminder system who to ping.

| Checkpoint | What gets filled | Who fills it |
|---|---|---|
| **30 days** | Implementation tracker — for each Priority Action, update Status (Done / In-Progress / Skipped), Date completed, Reason if skipped. Outcome observed stays `—` unless an early signal is already visible. | Tanner or the account manager. Pulled from the client's standup, Asana board, or direct check-in. |
| **60 days** | Predicted vs actual — for each measurable claim, fill Actual at 30d (using the data window 0-30 days post-audit) and Actual at 60d (data window 30-60 days post-audit). Mark Match? as Y / N / Partial with one-line reasoning if the cell allows. Append any outcomes-observed cells in the implementation tracker that have surfaced. | Tanner, with a fresh Databox pull for the relevant metrics. |
| **90 days** | Pushback & defenses — log every challenge raised by the client / agency / internal review during the 90-day window. Was the evidence defensible? Did the framework need to flex? Calibration learnings — three bullets minimum: what we got right and should keep, what we got wrong and needs framework adjustment, patterns we missed or over-predicted. | Tanner. The 90-day pass is the most synthesis-heavy of the three; budget 30-45 minutes per audit. |

**Rule against overwriting.** If a 60-day fill changes a 30-day status (e.g., "Skipped" became "Done"), don't overwrite — append a second row beneath the original showing the status flip with a date stamp. The longitudinal trail matters for calibration: a Priority Action that took 75 days to ship is a different signal than one that shipped on day 28.

**Rule against premature filling.** Don't fill 60-day cells before 60 days have elapsed even if early data looks definitive. The cadence exists to catch slow-moving signals that don't surface in the first month — front-loading the file biases the predicted-vs-actual record.

**Missing checkpoints.** If a checkpoint is skipped (Tanner forgot the 30-day pass), fill it on the next pass and label the cells with the actual fill-date in parentheses: `Done (logged 2026-06-12 at 47-day check-in)`. Don't backfill what wasn't observed in real time — that creates fake history.

**Rollup eligibility (90d).** The 90-day closeout is the trigger that makes an audit's predictions eligible to count toward the calibration rollup (Section 5). The rollup itself runs at every new audit start, but only audits whose 60-day Actuals are filled in count toward the hit-rate denominator — so the 90d pass is the moment a completed outcomes file enters the rolling track record.

---

## 4. Quarterly aggregation

Every 3 months, aggregate all completed outcomes files into a single retrospective at:

```
_system/databox-audit-skill-source/calibration-{quarter}.md
```

Quarter naming: `calibration-2026-Q2.md`, `calibration-2026-Q3.md`, etc.

**What the retrospective tunes.** The aggregation isn't a status update — it's the lever that adjusts framework behavior in the next quarter's audits. Four explicit calibration outputs:

1. **Insight Rubric thresholds.** Walk every finding that PASSED the rubric and whose 60-day actual missed the predicted band by >50%. If the failure rate among PASS findings is high, the rubric is too lenient — tighten one or more axes (most often Causality or Counterargument). Update `insight-rubric.md` with the revised criteria. If the failure rate is concentrated in a single finding category (e.g., TOF allocation findings consistently miss), the issue is upstream evidence quality, not the rubric — flag it for the relevant `reference/platforms/*-deep.md` chunk instead.
2. **Action Contract field defaults.** For each of the 7 fields, count how often the post-delivery outcome left the field empty or rendered it inapplicable. A field that's consistently empty post-delivery means the synthesizer's template for that field is too vague to be filled in — sharpen it. Most common offender historically: WHO ("the team" instead of a named role), and EXPECTED IMPACT (too-wide bands like "10-50% lift" that always technically "match"). Update `action-contract.md` with the tighter field defaults.
3. **Pattern detection thresholds.** For each audit where a pattern triggered, check whether the diagnosis held up. If a pattern fires but the post-delivery evidence consistently doesn't support the pattern's lead, the detection rule needs retuning — either the detection thresholds in `cross-channel-patterns.md` are too loose or the pattern's report-lead language is overclaiming. Adjust the thresholds, the language, or both.
4. **Impact estimate ranges.** If predicted "15-25% lift" averages 5% actual across audits, the impact bands are wrong — not just for that finding type but for the framework's calibration of "what's a realistic Meta TOF reallocation lift" in general. Update the EXPECTED IMPACT examples in `action-contract.md` and the pattern-template files in `reference/synthesis/templates/` to reflect the recalibrated bands.

**Aggregation cadence rule.** Run the retrospective once per quarter regardless of audit volume. If only 1-2 audits completed in the quarter, the retrospective is short — note that calibration confidence is low and don't make framework changes off n=2. Wait for the next quarter and aggregate across both. Don't tune the framework on noise.

**Output ownership.** The quarterly calibration file is the only artifact in this loop that lives in `_system/`, not in a client folder. It's framework-level memory, not client-level memory. Treat it like a changelog for the framework itself.

---

## 5. Calibration rollup (per-audit, surfaced in Methodology)

The quarterly aggregation in Section 4 tunes the framework over months. The calibration rollup defined here runs at every audit start and is consumed by the synthesizer's Methodology section — so each new audit explicitly cites the hit-rate of the predictions that came before it. The two mechanisms are complementary: quarterly aggregation tunes the rubric and contract; the rollup makes the system's track record visible inside every report it produces.

### 5.1 Calibration Rollup Schema

The rollup is a single struct, recomputed from scratch each run, written to disk as JSON. The synthesizer reads from this file — it does not parse outcomes files directly at audit-start time.

```yaml
calibration_rollup:
  audits_with_outcomes: <int>             # how many audits have any actuals filled in
  predictions_total: <int>                # how many numeric predictions across those audits
  predictions_hit_within_20pct: <int>     # how many actuals landed within ±20% of predicted
  predictions_partial: <int>              # actuals landed within ±50% (partial credit)
  predictions_missed: <int>               # actuals more than 50% off OR opposite direction
  hit_rate_within_20pct: <float>          # predictions_hit_within_20pct / predictions_total
  dollar_weighted_hit_rate: <float>       # same calc but weighted by predicted $/mo magnitude
  last_aggregation_date: <YYYY-MM-DD>
```

**Bucket rules.** Each numeric prediction lands in exactly one of three buckets — `hit_within_20pct`, `partial`, or `missed` — based on the 60-day Actual. A prediction in the opposite direction of forecast (e.g., predicted +15% lift, actual −8%) is always `missed` regardless of magnitude. A prediction with a missing 60-day Actual is excluded from the denominator entirely (it isn't a hit, a partial, or a miss — it doesn't count yet).

**Dollar-weighting rule.** Each prediction with a stated $/mo impact (from the Action Contract `EXPECTED IMPACT` field) contributes its predicted dollar magnitude as the weight. Predictions without a dollar figure (pure-percentage forecasts) are excluded from `dollar_weighted_hit_rate` but still count toward the unweighted `hit_rate_within_20pct`. If no predictions in the corpus carry dollar figures, `dollar_weighted_hit_rate` is `null`.

### 5.2 Aggregation procedure

**When the rollup runs.** At the start of each new audit, BEFORE the synthesizer drafts the Methodology section. The synthesizer reads `calibration-rollup.json` and quotes from it. If the file is missing or older than the most recent outcomes file's modified date, regenerate before reading.

**The procedure.** A small bash + jq script (or Python equivalent) walks all `outcomes_template.md` files under the v4 client tree:

```
clients/*/runs/*/outcomes_template.md
```

For each file: parse the `## Predicted vs actual` table. For each row whose `Actual at 60d` cell is filled in (i.e., not `—`), extract the predicted band, the actual value, and any dollar figure from the matching Action Contract `EXPECTED IMPACT` field. Bucket the row per the rules in 5.1. Increment counters. After all files are walked, compute the two hit-rate floats, stamp `last_aggregation_date` with today's date, and write the struct.

**Where the rollup lives.** Output path:

```
_system/databox-audit-skill-source/reference/synthesis/calibration-rollup.json
```

Overwrite each run. The file is rebuilt from the underlying outcomes files every time — there's no incremental state to preserve. The synthesizer reads from this exact path.

**Sufficiency thresholds.** If `audits_with_outcomes < 3`, the synthesizer's Methodology callout reads the insufficient-data form (see 5.3) instead of citing a hit rate. The 3-audit threshold gates the calibration claim until enough data exists to make the hit-rate non-trivial — quoting "100% hit-rate (n=1)" would be statistical theater, not calibration.

**Failure modes.** If any outcomes file is malformed (missing the `## Predicted vs actual` table, table columns reordered, predicted band unparseable, etc.), log the file path and the parse error to:

```
_system/databox-audit-skill-source/reference/synthesis/calibration-rollup-warnings.log
```

Skip that file's predictions entirely — don't fail the rollup, don't half-count a malformed file. The warnings log is reviewed at quarterly aggregation time so structural drift in outcomes files gets caught and corrected.

### 5.3 What the Methodology section quotes

The synthesizer reads `calibration-rollup.json`, picks one of the three callout forms below based on `audits_with_outcomes` and `hit_rate_within_20pct`, and inlines it verbatim into the Methodology section of the new audit. `N` is `audits_with_outcomes`, `X` is `hit_rate_within_20pct` rendered as a percentage, `Y` is `dollar_weighted_hit_rate` rendered as a percentage.

| Condition | Methodology callout (verbatim) |
|---|---|
| `audits_with_outcomes < 3` | `Calibration: insufficient data (only N audits with outcomes filled in). Predictions in this report should be treated as MEDIUM-confidence by default.` |
| `audits_with_outcomes ≥ 3` AND `hit_rate_within_20pct ≥ 0.60` | `Calibration: of the last N audits' predictions, X% landed within ±20% of forecast (dollar-weighted: Y%). Treat dollar predictions in this report as well-calibrated.` |
| `audits_with_outcomes ≥ 3` AND `hit_rate_within_20pct < 0.60` | `Calibration: of the last N audits' predictions, only X% landed within ±20% of forecast. Predictions in this report are softened to ranges and confidence bands are widened. See `dollar-impact-methodology.md` for downgrade rules.` |

**Rendering rules.** Percentages are rounded to the nearest whole integer (e.g., `0.624` → `62%`). If `dollar_weighted_hit_rate` is `null` (no dollar figures in the corpus), the well-calibrated callout drops the parenthetical entirely: `Calibration: of the last N audits' predictions, X% landed within ±20% of forecast. Treat dollar predictions in this report as well-calibrated.` The 60% threshold is the boundary between the two non-trivial forms — exactly 60% lands in the well-calibrated bucket.

---

## 6. Cross-references

- **Insight Rubric:** `reference/synthesis/insight-rubric.md` — the 5-axis pass/fail check applied to every body finding pre-delivery. The post-delivery loop's predicted-vs-actual section is the calibration check on whether the rubric's PASS threshold is producing predictions that hold.
- **Action Contract:** `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action satisfies. The implementation tracker's Status / Outcome columns are the calibration check on whether the contract's WHAT / WHEN / EXPECTED IMPACT fields are specific enough to ship.
- **Pattern detection:** `reference/synthesis/cross-channel-patterns.md` — the detection rules that select the dominant pattern leading the report. The pushback section + calibration learnings are the calibration check on whether the pattern's diagnosis was the right one.
- **Framework spec:** `v3-quality-framework.md` Section 2.4 — design authority for everything in this file.

---

## 7. Sample outcomes file (complete, post-90-day fill)

This is what the file looks like after all three checkpoints have been filled. Use it as the reference for what `Done` looks like, not as a literal template (the 90-day pass varies in length depending on what was learned).

```markdown
# Acme-Co Audit Outcomes — 2026-03-15

**Audit delivered:** 2026-03-15
**Dominant pattern:** TOF-Underfunded
**Owner:** Tanner
**Linked audit PDF:** `Acme-Co_audit_2026-03-15.pdf`
**Linked audit MD source:** `Acme-Co_audit_2026-03-15.md`
**Linked manifest:** `manifest.md`

---

## Implementation tracker (per Priority Action)

| Action | Status | Date completed | Reason if skipped | Outcome observed |
|---|---|---|---|---|
| Action 1: Reallocate $1,200/day from Meta retargeting to Meta TOF prospecting | Done | 2026-04-08 | — | TOF spend share moved from 38% to 47% by 60d; CPATC dropped from $52 to $44 |
| Action 2: Pause `Spring Hero v2` ad and launch 3 hook variants | Done | 2026-03-22 | — | Hook B won (CPATC $39 vs control $52); rolled out 4/02 |
| Action 3: Refresh Klaviyo Welcome flow with new product bundle offer | Skipped | — | Client deprioritized owned-channel work for Q2; revisit in July | — |
| Action 4: Add Performance Max negative keyword list to suppress branded query overlap | In-Progress (started 2026-04-15) | — | — | Branded query share down from 34% to 29%, still in flight |

---

## Predicted vs actual (per measurable claim)

| Finding | Predicted impact | Actual at 30d | Actual at 60d | Match? |
|---|---|---|---|---|
| Finding #1: Meta TOF reallocation will lift CPATC | 15-25% lift in CPATC over 14 days | 8% lift (slower hook ramp) | 18% lift | Y |
| Finding #2: Closing the TOF gap will recover MER | MER recovery ≥0.3× by day 60 | +0.1× | +0.4× | Y |
| Finding #3: PMax brand-query suppression will free up $400/day for non-branded growth | 5-10% revenue lift over 60 days | n/a (action started day 31) | +3% lift over 30 days of action | Partial — action shipped late, runway too short to call |

---

## Pushback & defenses

| Claim challenged | Who challenged | Evidence held up? | Adjustment needed? |
|---|---|---|---|
| "Pull 7 audience composition is reliable enough to drive a $1,200/day reallocation" | Client CMO | Partial — naming inference held for ad-set buckets but missed 2 newer prospecting sets created post-pull | Yes — synthesizer should flag pull-date staleness in TOF audits when ad-set creation activity is high |
| "Klaviyo Welcome flow refresh is high priority" | Client growth lead (deprioritized) | n/a — action was skipped, so no outcome to defend | Soft — action was real, owner just had different Q2 priorities; not a framework miss |

---

## Calibration learnings (feeds v4)

- **What we got right:** TOF-Underfunded pattern lead held — the report sequenced reallocation before creative refresh, and the operator executed in that order. The framework's instinct to prioritize allocation over creative when frequency is below saturation paid out.
- **What we got wrong:** Predicted CPATC lift of 15-25% landed at 8% by day 30 and only hit the band by day 60. The bands assume a faster hook-ramp than this client's creative production cadence supported. Recalibration: tighten EXPECTED IMPACT timing language for accounts with <2 hooks/week production rate — quote the lift band but flag "expect 30-45 day timeline if creative cadence is constrained."
- **Pattern we missed:** Action 4 (PMax brand-query suppression) was a Cannibalization pattern signal that the dominant-pattern selector buried because TOF-Underfunded ranked higher. The cannibalization was real and meaningful — the framework's "pick one dominant pattern" rule cost 3 weeks of action. Consideration for v4: when secondary pattern triggers HIGH-confidence and addresses a different action category from the dominant, surface the secondary pattern's lead action in Priority Actions rather than folding it silently into the body.
```
