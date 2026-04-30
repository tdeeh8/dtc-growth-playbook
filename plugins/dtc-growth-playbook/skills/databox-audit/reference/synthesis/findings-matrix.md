# Findings Matrix

The Findings Matrix is the single biggest visual upgrade in v3. It's a color-coded RAG table that sits at the top of the operator detail layer — immediately after the Account Scorecard — and lists every finding from the audit in one scannable view. A reader scans the entire audit's findings in 30 seconds, decides what to read in detail, and the highest-leverage action is always the first row.

> **Authoritative spec:** `v3-quality-framework-addendum.md` Section 3 ("Color-coded insight tables — the Findings Matrix"). This file is the implementation reference for the synthesizer and the docx renderer; the addendum is the canonical source for the design intent.

This file does NOT define the Node/docx rendering code — that lives in `reference/docx-template.md` (extended by Agent D in Wave 1). It does NOT define the report's section structure — that lives in `reference/synthesizer.md` (extended by Agent E in Wave 2). It defines the matrix's schema, sort logic, color encoding map, worked examples, and connection to Priority Actions.

> **v3-money-page change:** Impact column changed from coarse `$ / $$ / $$$` bands to real dollar estimates per `reference/synthesis/dollar-impact-methodology.md`. The matrix now sorts by dollar within severity, so the headline finding is the largest leak (or recoverable opportunity), not just any RED row.

---

## 1. Schema

The matrix is a 7-column table. Every finding the audit produces gets one row.

| # | Severity | Confidence | Impact | Effort | Finding (≤140 char) | Pattern tag |
|---|---|---|---|---|---|---|

### Column-by-column encoding rules

| Column | Type | Allowed values | Encoding | Notes |
|---|---|---|---|---|
| **#** | Integer | 1, 2, 3, … | Plain text, right-aligned | Stable ID. Once assigned, this number is the finding's reference everywhere else in the report (Priority Actions cites "see F#3"). |
| **Severity** | Enum | `RED` / `YELLOW` / `GREEN` | RAG color fill, white text, bold, centered | `RED` = revenue at risk now. `YELLOW` = will become critical 30–60d. `GREEN` = healthy / optimization-only. |
| **Confidence** | Enum | `HIGH` / `MEDIUM` / `LOW` | Color fill: green / amber / gray. White text. Bold for HIGH and MEDIUM; **italic, not bold** for LOW. | `LOW` findings still appear in the matrix — they are visible but visually de-emphasized so the eye skips them on first scan. |
| **Impact** | Dollar estimate string (HIGH confidence: `~$X/mo`; MEDIUM confidence: `~$X-Y/mo`; LOW confidence: `directional`) | A dollar string (e.g. `~$22k/mo`, `~$8-15k/mo`) OR the literal text `directional` | Fill matches the row's Severity color (RED/YELLOW/GREEN). Weight uniform across magnitudes — the dollar value carries the magnitude, not the marker size. Cell text is the dollar estimate string itself. | Dollar estimates derived per `reference/synthesis/dollar-impact-methodology.md`. LOW-confidence findings show `directional` because their estimates carry too much uncertainty for the body. |
| **Effort** | Enum | `Quick` / `Medium` / `Heavy` | **Plain text. No color.** | `Quick` = ≤1 week, in-house. `Medium` = 2–4 weeks, may need creative or dev. `Heavy` = ≥6 weeks, structural change. The text-only treatment is intentional (see Section 3). |
| **Finding (one line)** | String, ≤140 char | — | Plain prose, left-aligned | The PASS-rubric headline of the finding. Specific, causal, with implication. See Section 8 for examples and the FAIL/PASS contract. |
| **Pattern tag** | String slug | `Tracking-Broken`, `Profitability Trap`, `Owned-Channel Collapse`, `TOF-Underfunded`, `Cannibalization`, `Allocation Imbalance`, `Healthy / Optimization` | Plain text, no color | Connects each finding to the audit's narrative thread. Tags are the v3 dominant patterns; the same tag may appear on multiple rows. |

---

## 2. Sort order

Rows are sorted in this exact order:

1. **Severity DESC** — `RED` rows above `YELLOW` rows above `GREEN` rows.
2. **Dollar impact DESC** — within each severity band, HIGH and MEDIUM rows are ranked by midpoint $/mo (a `~$8-15k/mo` row uses $11.5k as its midpoint). `directional` rows fall to the bottom of their severity band.
3. **Confidence DESC** — within each severity+dollar band, `HIGH` above `MEDIUM` above `LOW` (used to break ties on dollar value).
4. **Effort ASC** — within each severity+dollar+confidence band, `Quick` above `Medium` above `Heavy`.

**The first row is always the audit's headline finding — the highest-dollar RED row.** That's the row the synthesizer's executive summary is written around, and the first action elaborated in Priority Actions.

### Tiebreaker logic (worked)

If two RED findings carry near-identical dollar midpoints, the higher-confidence one ranks first because it's actionable — a `MEDIUM` confidence finding may need more diagnostic work before a client will spend money on it. If they also tie on confidence, the lower-effort one ranks first because it ships faster and produces evidence that compounds into the next sprint.

A `RED` + `~$95k/mo` + `HIGH` + `Heavy` finding beats a `RED` + `~$22k/mo` + `HIGH` + `Quick` finding on this sort, because dollar magnitude dominates effort. The reasoning: the larger leak is the larger opportunity, even if it takes longer to fix; the matrix should surface where the money is, and Priority Actions can still elaborate the Quick win second. A low-confidence claim about a critical issue ranks below higher-confidence claims with smaller dollars in the same severity band, because the matrix should not promote estimates the synthesizer can't defend.

---

## 3. Why color-code 3 of 4 axes (not all 4)

Effort stays plain text on purpose. Coloring all four axes turns the table into noise — every cell competes for attention and the eye can't resolve where the headline is. Three axes carry the "should I act" signals (Severity, Confidence, Impact); Effort is a text qualifier that answers "how hard." Impact is now a dollar value rather than an enum, but it's still color-encoded via Severity row inheritance — the argument stays the same. Dollar magnitude is communicated by the cell text directly; the color reinforces severity rather than encoding magnitude redundantly.

This is the same discipline McKinsey's 9-Box Matrix uses: two color-encoded axes, the third dimension read off the cell quadrant. The Findings Matrix extends to three colored axes only because Severity and Impact are not redundant (a finding can be `YELLOW` severity with a large dollar impact if it'll become critical at scale). Effort would be the fourth axis and is the right one to drop.

> **Reference:** `v3-quality-framework-addendum.md` Section 3.2.

The render contract: anything that helps a reader prioritize ("act / don't act / wait") gets color. Anything that helps a reader plan ("Monday task / quarter project") stays text.

---

## 4. Color encoding map

The Findings Matrix extends the existing `STATUS_STYLES` map in `reference/docx-template.md`. Agent D adds these entries to the existing map in Wave 1. This file documents the mapping so the synthesizer knows what values to emit.

### Existing entries already in `STATUS_STYLES` (reused)

| Value | Fill | Text | Weight |
|---|---|---|---|
| `RED` | `#C0392B` | white | bold |
| `YELLOW` | `#D68910` | white | bold |
| `GREEN` | `#229954` | white | bold |

These cover the **Severity** column directly — no new code needed.

### New entries Agent D adds in Wave 1

```
Confidence values:
  "HIGH":    { fill: "229954", color: "FFFFFF", bold: true }   // green = same as GREEN severity
  "MEDIUM":  { fill: "D68910", color: "FFFFFF", bold: true }   // amber = same as YELLOW severity
  "LOW":     { fill: "7F8C8D", color: "FFFFFF", italic: true } // gray + italic, not bold

Impact values:
  Impact cell fill matches the row's Severity color (RED #C0392B / YELLOW #D68910 / GREEN #229954).
  Weight uniform across magnitudes. The cell text is the dollar estimate string itself
  (e.g. "~$22k/mo", "~$8-15k/mo", or the literal "directional" for LOW-confidence rows).
```

### Notes on the map

- The Confidence colors deliberately reuse the Severity green and amber so the visual vocabulary stays small. Two greens in a row (Severity + Confidence) is the strongest "act now, certain" signal in the matrix.
- The Impact column is the one place a row's Severity color appears in two cells. That's intentional — it amplifies the headline rows without introducing a new hue.
- Impact rendering depends on the row's Severity, so the docx renderer needs row-context when emitting Impact cells. This is a small extension to the auto-detect logic in `tr()`; Agent D handles it.
- `LOW` confidence is the only cell in the table that uses italic instead of bold. The visual de-emphasis is the point: low-confidence findings are surfaced but not promoted.

### What Agent D owns vs what this file owns

| Concern | Owner |
|---|---|
| The values, hex codes, and weights for the new map entries | This file (specification) |
| The `STATUS_STYLES` JS object, the `tr()` helper, and the row-context logic for Impact | `reference/docx-template.md` (Agent D in Wave 1) |
| Rendering dollar estimate strings (`~$X/mo`, `~$X-Y/mo`, `directional`) in the Impact cell — replacing the prior `$$$ / $$ / $` weight-scaling logic | `reference/docx-template.md` (Agent D in Wave 3) |
| The matrix's section heading, position in the report, and the surrounding narrative | `reference/synthesizer.md` (Agent E in Wave 2) |

---

## 5. Worked example

The example below shows what 4–6 sample findings look like when rendered. It mixes severity, confidence, impact, and effort combinations to demonstrate the visual scan pattern. (Color codes shown as text labels here; in the docx these render as colored cells per Section 4.)

| # | Severity | Confidence | Impact | Effort | Finding | Pattern tag |
|---|---|---|---|---|---|---|
| 1 | `RED` | `HIGH` | `~$95k/mo` | `Heavy` | Klaviyo flow revenue down 67% YoY ($142k → $47k); welcome + abandoned cart broken since template migration; full rebuild needed | Owned-Channel Collapse |
| 2 | `RED` | `HIGH` | `~$22k/mo` | `Quick` | Meta CAPI disconnected since Mar 12; conversion volume understated ~38% in platform vs Shopify; reconnect to restore optimization signal | Tracking-Broken |
| 3 | `RED` | `MEDIUM` | `~$8-15k/mo` | `Medium` | Meta TOF allocation 52% vs 35-50% target band; CPATC at $42 floor; expect MER drop 0.4× in 60d if held | TOF-Underfunded |
| 4 | `YELLOW` | `HIGH` | `~$4.2k/mo` | `Quick` | Google PMax + Branded Search overlap; 28% of branded conversions credited to PMax; run 2-week branded holdout to size the cannibalization | Cannibalization |
| 5 | `YELLOW` | `MEDIUM` | `~$3.1k/mo` | `Medium` | 4 Google campaigns at sub-1× ROAS consuming $3,100/mo; pause-and-reallocate to PMax-Best-Sellers | Allocation Imbalance |
| 6 | `GREEN` | `HIGH` | `directional` | `Quick` | Email list growth +22% YoY; pop-up CVR healthy at 4.1%; opportunity to add post-purchase capture for SMS list | Healthy / Optimization |

### How the visual scan works

A reader's eye lands on row 1 first — the `~$95k/mo` Klaviyo flow collapse — even though row 2 (Meta CAPI, `~$22k/mo`, `Quick`) carries the easier-fix `Quick` effort tag. The new dollar-first sort surfaces the biggest leak above the easiest fix: $95k > $22k matters more than $$$ + Quick did under the old enum sort. Row 2's RED + HIGH + Quick combo still earns the second slot — the second-largest leak that's also a Monday-shippable fix — but the headline is the recoverable revenue, not the convenience. Row 6 reads as a `GREEN` band at the bottom — visible but de-emphasized, with `directional` in the Impact cell signaling "healthy area, opportunistic upside, not sized."

The pattern tag column is plain text but it's how the reader connects the matrix to the report's narrative. Three of the top rows tag distinct dominant patterns — that's a multi-pattern audit, and the synthesizer will lead with the dominant pattern that owns the highest-dollar row (here: Owned-Channel Collapse, $95k/mo).

---

## 6. Where it goes in the report

The Findings Matrix sits on **Page 1 of the operator detail layer**, in the synthesizer's Section 2.X (the section number is finalized when Agent E updates `synthesizer.md` in Wave 2).

### The position contract

```
[Section 2.1] Account Scorecard — platform-level RAG status
[Section 2.X] Findings Matrix    — finding-level RAG matrix  ← v3 NEW
[Section 2.4] Funnel Health      — TOF/MOF/BOF diagnosis
[Section 2.5] Priority Actions   — top 3-6 findings expanded into Action Contracts
[Section 2.6] Per-Channel Pages  — depth-scaled platform diagnoses
```

### What it replaces / supplements

- **Replaces:** the current "Triage Summary" table that lived in synthesizer Step 3. The Triage Summary was a platform-level scorecard ("Google Ads: RED, ROAS 2.53× vs 3.5× target") and answered the question "which platform is broken." The Findings Matrix is a finding-level matrix and answers "which findings should I act on."

  Different question, different table. Findings Matrix wins for the body because finding-level priority drives action; the Triage Summary moves to the appendix as a platform-level reference.

- **Supplements:** the Account Scorecard (Section 2.1, dimension-level — "Paid media efficiency: YELLOW"), the Funnel Health diagnosis (Section 2.4, full-funnel narrative), and Priority Actions (Section 2.5, 3–6 findings expanded with the 7-field Action Contract).

The matrix is the bridge between the Scorecard ("here's how the account is doing") and Priority Actions ("here's what to ship Monday"). Without it, the reader would jump from a 6-row scorecard straight to 6 elaborated actions with no scannable middle layer.

### Reader layering

| Layer | Reader | What they see |
|---|---|---|
| **90-second exec scan** | CMO/CEO/CFO | Executive summary + Account Scorecard. The Findings Matrix is *visible* if they keep scrolling but is owned by the operator layer. |
| **Operator detail** | Marketing director / in-house operator | Findings Matrix is the first thing they read after the scorecard. They use it to triage what's worth deep-reading on the per-channel pages. |
| **Internal QC** | Audit team | Full matrix + appendix-level Triage Summary + raw evidence. The matrix is the index into the rest of the document. |

---

## 7. One-line description rules — the 140-char Finding column

The "Finding" column has a **140-character hard cap**. This is the single tightest writing constraint in v3 and it does most of the work of making the matrix scannable. The rule connects directly to the Insight Rubric's **Specificity** axis: a finding that doesn't fit in 140 chars is almost always too vague to be actionable.

### The contract

A passing one-line finding answers three questions:
1. **What is it?** (the metric or condition, with a number)
2. **Why does it matter?** (the comparison, threshold, or business implication)
3. **What pattern does it fit?** (implicit — the Pattern tag handles this, so the prose can stay tight)

### FAIL examples (too vague — would not pass the rubric)

| FAIL | Why it fails |
|---|---|
| "Meta is underperforming." | No metric, no number, no implication. The reader can't prioritize against this. |
| "Tracking has issues." | Doesn't say which platform, which signal, or how big the gap is. |
| "Spend is misallocated." | No allocation %, no target band, no expected impact. |
| "Email could be better." | No KPI, no YoY, no specific flow named. |

### PASS examples (specific, causal, with implication)

| PASS | Why it passes |
|---|---|
| "Meta TOF allocation 52% vs 35–50% target band; CPATC at $42 floor; expect MER drop 0.4× in 60d if held." | Specific metric, target band, threshold, time-bound projection. Fits in 132 chars. |
| "Meta CAPI disconnected since Mar 12; conversion volume understated ~38% in platform vs Shopify; reconnect to restore optimization signal." | Date, magnitude, business implication. 138 chars. |
| "4 Google campaigns at sub-1× ROAS consuming $3,100/mo; pause-and-reallocate to PMax-Best-Sellers." | Specific dollar amount, named campaigns to reallocate to. 99 chars. |

### Cap enforcement

The synthesizer counts characters when emitting each row. A finding that exceeds 140 chars is rewritten — the most common fix is moving the recommended action out of the Finding column (the Action Contract in Priority Actions handles "what to do"; the matrix handles "what's true").

---

## 8. Cross-reference to Priority Actions

The Findings Matrix is **comprehensive**. Every finding the audit produces appears as a row, regardless of whether it earns a Priority Action treatment. A typical audit produces 8–15 findings; the matrix is sized to hold all of them.

Priority Actions is **curated**. It selects the 3–6 highest-leverage findings — the top of the matrix by sort order — and elaborates each one with the 7-field Action Contract (WHAT / SO WHAT / NOW WHAT (HOW / WHEN / WHO / MEASUREMENT)). Findings ranked below the cut still ship to the client (they're in the matrix), but they don't get the full elaboration in the body.

### Selection rule

```
Priority Actions = top 3-6 findings by the new dollar-first sort
                   (Severity DESC → Dollar DESC → Confidence DESC → Effort ASC).
The first action expanded into a full Action Contract is always
the highest-$ HIGH-confidence RED finding.
```

The cut point is judgment-based, not mechanical. The synthesizer expands findings until either:
- The body word budget for Priority Actions (~150 words for a 5-platform audit) is consumed, OR
- The next finding's Severity drops to `GREEN` (no `GREEN` finding gets a full Action Contract — `GREEN` findings are summary-only).

A 5-RED-finding audit may show 5 actions; a single-RED audit may only elaborate 3. The matrix shows them all; Priority Actions promotes the ones worth a Monday-shippable plan.

### Reference convention

Priority Actions cites matrix rows by number: "Action 1 (see F#1)" maps to the first row of the matrix. This lets the reader cross-reference back to the matrix for the one-line context, without Priority Actions having to repeat the finding text.

---

## 9. Quick reference

| Question | Answer |
|---|---|
| Where does the matrix live? | Page 1 of the operator detail layer (synthesizer Section 2.X), immediately after the Account Scorecard. |
| How many rows? | All findings the audit produces. Typical: 8–15 rows. |
| What replaces? | The Triage Summary table in synthesizer Step 3 (Triage Summary moves to the appendix). |
| What's the sort order? | Severity DESC → Dollar impact DESC (HIGH/MEDIUM ranked by midpoint $/mo; `directional` rows sink to the bottom of their severity band) → Confidence DESC → Effort ASC. |
| What type is the Impact column? | A dollar estimate string per row, derived per `reference/synthesis/dollar-impact-methodology.md`. HIGH confidence: `~$X/mo`. MEDIUM confidence: `~$X-Y/mo`. LOW confidence: `directional`. Color fill matches the row's Severity color; weight is uniform — magnitude is read from the cell text. |
| Why isn't Effort color-coded? | Coloring all 4 axes turns the table into noise. Effort is a text qualifier, not a prioritization signal. McKinsey 9-Box discipline. |
| Where do the new color codes live? | `reference/docx-template.md` (Agent D, Wave 1; dollar-string rendering added in Wave 3). This file documents the mapping; that file owns the JS object. |
| How long is each Finding cell? | ≤140 characters, hard cap. |
| Connection to Priority Actions? | Priority Actions = top 3–6 rows of the matrix by the dollar-first sort, expanded with the 7-field Action Contract. The first action elaborated is always the highest-$ HIGH-confidence RED finding. The matrix is comprehensive; Priority Actions is curated. |
| Authoritative spec? | `v3-quality-framework-addendum.md` Section 3. |
| What gates a finding into the matrix? | Every finding must PASS the 5-axis Insight Rubric per `reference/synthesis/insight-rubric.md`. Findings that FAIL the rubric do not appear here — they're demoted to appendix or cut entirely. The rubric is the quality gate; this matrix is the surface. |
