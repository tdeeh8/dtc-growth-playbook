# PDF Template — Databox Audit v4

The v4 audit deliverable is a **multi-page PDF** (up to 15 pages,
shrinking when platforms are out of scope), replacing the prior `.docx`
report. The synthesizer produces a single `spec.json`; the renderer
(`scripts/build_audit_pdf.js`) consumes that JSON and writes a fully
populated PDF that mirrors the design prototyped in
`Audit_Deck_Skeleton.pdf`.

This file documents:

1. The slide structure
2. The JSON spec contract the renderer expects
3. Color theming (`CLIENT_THEME` hooks)
4. How to wire the renderer into the synthesizer
5. Debugging font/render issues
6. A worked minimal example

The `.docx` path (`docx-template.md`) is still present during the v4
migration — it will be retired once cutover completes.

---

## 1. The slide structure

A full-scope audit (Google + Meta + Amazon all in scope) produces 15
pages in the order below. If a platform is out of scope, **its slide is
dropped from the render entirely** — the deck shrinks to 14, 13, or 12
pages depending on how many platforms are excluded, and footer numbering
is `X / N` where `N` is the rendered page count.

| #   | Slide                          | Source field              | Always present? | Purpose                                                                  |
| --- | ------------------------------ | ------------------------- | --- | ------------------------------------------------------------------------ |
| 1   | Cover                          | `theme`, `lookback`       | Yes | Client name, agency, date range, period.                                 |
| 2   | Executive summary              | `executive_summary`       | Yes | Three numbers + one-sentence plan band.                                  |
| 3   | Current state                  | `current_state`, `lookback` | Yes | 4 KPI tiles + weekly-spend trend chart.                                  |
| 4   | Diagnosis                      | `diagnosis`               | Yes | Four root-cause cards (always exactly 4).                                |
| 5   | Cross-platform comparison      | `cross_platform`          | Yes | CVR-by-source bar chart + 2 callout stats.                               |
| 6   | Spend allocation               | `spend_allocation`        | Yes | Doughnut by platform + 3 callouts (leak / concentration / working line). |
| 7   | Foundation (store + tracking)  | `foundation`              | Yes | 3 store stats + 4 tracking-health checks.                                |
| 8†  | Google Ads                     | `platforms.google`        | Only when `in_scope: true` | Status chip, headline metric, diagnostics, action band.                  |
| 9†  | Meta Ads                       | `platforms.meta`          | Only when `in_scope: true` | Same template as Google Ads.                                             |
| 10† | Amazon Ads                     | `platforms.amazon`        | Only when `in_scope: true` | Same template as Google Ads.                                             |
| 11  | Trends (MoM + YoY)             | `trends`                  | Yes | Four sparkline cards.                                                    |
| 12  | The 4-pillar plan              | `plan`                    | Yes | Four pillar cards (always exactly 4).                                    |
| 13  | 90-day roadmap                 | `roadmap`                 | Yes | Four phase cards (always exactly 4).                                     |
| 14  | Investment + projected outcomes | `investment`             | Yes | 4-row investment table + 5-row outcomes table.                           |
| 15  | Risks + next steps             | `risks_and_next_steps`    | Yes | 3 risk cards + 3 next-step rows.                                         |

† Slot numbers above assume all three platforms are in scope. The
**actual** slot a platform occupies shifts left if a preceding platform
is dropped (e.g., if Google is OOS, Meta becomes slide 8 and Amazon
becomes slide 9). Out-of-scope platforms produce no slide at all; they
are not stubbed.

**Out-of-scope platforms.** Set `platforms.{name}.in_scope = false` (or
omit the platform block entirely) and the renderer drops that slide.
A missing platform block is treated as out of scope. The deck rhythm
shrinks; the footer numbering shrinks with it.

**Slide builders are independent.** Each slide is its own function in
`build_audit_pdf.js`. The orchestrator `buildDeck()` builds an ordered
queue of builder closures, conditionally pushes platform slides, and
then iterates the queue passing dynamic `(slideNum, total)` to each
builder. To add a new slide or reorder, edit `buildDeck()` and add the
appropriate builder. Every builder ends with
`footer(pres, s, C, theme, slideNum, total)` so numbering stays
consistent.

---

## 2. The JSON spec contract

The full canonical input shape lives at
`outputs/audit_pdf_input_spec.json` (a worked example using "Teak"). The
table below summarizes the top-level shape; see the example file for
nested types.

```jsonc
{
  "theme":               { ... },        // see §3
  "lookback":            { ... },        // 4 ISO date strings
  "executive_summary":   { ... },        // headline_metric, unit_math, leak, plan_one_sentence
  "current_state":       { ... },        // 4 KPI strings + weekly_spend: number[]
  "diagnosis":           { ... },        // title + causes: 4 × {n, title, body}
  "cross_platform":      { ... },        // cvr_by_source map + interpretation + 2 % strings
  "spend_allocation":    { ... },        // by_platform map + 3 callouts
  "foundation":          { ... },        // 3 store stats + tracking: 4 × {label,status,body}
  "platforms": {
    "google":            { ... },        // see §2.1
    "meta":              { ... },        //
    "amazon":            { ... }         //
  },
  "trends":              [ ... ],        // 4 × {label, values: number[6], delta, delta_status}
  "plan":                { ... },        // title + subtitle + pillars: 4 × {title, body}
  "roadmap":             [ ... ],        // 4 × {range, title, bullets: string[]}
  "investment":          { ... },        // rows + outcomes
  "risks_and_next_steps":{ ... }         // risks: 3 × {...}, next_steps: 3 × {...}
}
```

**Strings vs numbers.** Almost every metric value (currency, percentage,
multiplier) is a **pre-formatted string** — e.g., `"$11,800"`, `"49%"`,
`"2.42×"`. The renderer prints these literally. Only chart series
(`weekly_spend`, `trends[].values`, the `cvr_by_source` and `by_platform`
map values, and `current_state.transactions`) are raw numbers.

If the synthesizer needs to switch a string to a numeric chart value
later, the renderer has a `numish()` helper that strips currency / commas
/ multiplier symbols. Don't rely on it; format upstream.

### 2.1 Platform block (slides 8–10)

```jsonc
{
  "in_scope":   true,                // false → renders OOS stub
  "status":     "RED",               // RED | YELLOW | GREEN — drives chip + headline color
  "headline":   "1.91×",             // big number on left
  "label":      "GOOGLE BLENDED ROAS",
  "target":     "2.5× (breakeven 3.33×)",
  "root_cause": "One-sentence italic eyebrow under the title.",
  "diagnostics":["Bullet 1.","Bullet 2."],   // exactly 2 used; extras dropped
  "actions":    ["Action 1.","Action 2."]    // exactly 2 used; extras dropped
}
```

### 2.2 Tracking checks (slide 7)

```jsonc
{ "label": "Shopify connected", "status": "GREEN", "body": "..." }
```

`status` drives both the dot color and the glyph: `GREEN → ✓`,
`YELLOW → !`, `RED → ✕`.

### 2.3 Trends (slide 11)

```jsonc
{
  "label":        "BLENDED MER",
  "values":       [2.1, 2.2, 2.4, 2.6, 2.7, 2.9],   // 6 numbers; last = "NOW", earlier = "M-5..M-1"
  "delta":        "+38% YoY",                        // free-form string, right-aligned
  "delta_status": "GREEN"                            // colors the delta text
}
```

---

## 3. Color theming

The deck has **three** themable hex slots and **three** locked status
slots. Theming is configured in the JSON `theme` block:

```jsonc
{
  "client":     "Teak",
  "agency":     "[Your Agency]",
  "period":     "April 2026",
  "dark":       "1A2A44",   // primary brand — cover bg, action bands, ink text
  "accent":     "8E5B3A",   // secondary — eyebrows, cover side rail, dividers
  "background": "F7F4ED"    // page bg — recommend cream/off-white; pure white also fine
}
```

The renderer rebuilds the palette per render via `makePalette(theme)`.
The status palette is hard-coded inside `build_audit_pdf.js`:

```js
const STATUS = {
  RED:    "C4453A",
  GREEN:  "2D7A5F",
  YELLOW: "D4A23B",
};
```

**Do not add `red`/`green`/`yellow` to the JSON spec.** They are
intentionally not user-controllable: status colors carry semantic
meaning across every audit, and changing them per client breaks
cross-client comparison.

### Picking custom theme colors for a client

- `dark` must be **dark** (≥ ~30% relative luminance from black). The
  cover and action bands print white text on it; light hex values will
  fail contrast.
- `accent` should be visually distinct from `dark`. It carries eyebrows
  and section marks; a low-contrast accent disappears.
- `background` should be **light** (≥ ~85% luminance). Use `F7F4ED`
  (cream) by default, `FFFFFF` for crisp/modern, or any tinted off-white.

If you're unsure, pick from the client's own brand guide. Avoid
saturated mid-tones — they fight the chart palette.

---

## 4. Wiring the renderer into the synthesizer

The synthesizer's job is to produce the JSON spec described in §2. The
renderer's job is to consume it. Wiring is a one-line shell call:

```bash
node scripts/build_audit_pdf.js \
  --input  /path/to/spec.json \
  --output /path/to/Client_Audit_April_2026.pdf
```

Both flags are required. The renderer:

1. Parses `spec.json`. Aborts with a clear error on malformed JSON.
2. Builds a 15-slide `.pptx` in a temp directory using `pptxgenjs`.
3. Invokes `scripts/render_pdf.sh` to convert the temp `.pptx` to PDF
   via LibreOffice headless.
4. Deletes the temp `.pptx` (kept on render failure, for debugging).
5. Logs the final PDF path + size.

### One-time install

In the skill source's `scripts/` directory, run:

```bash
npm install pptxgenjs
```

The renderer also looks for `pptxgenjs` in `../node_modules` and in
`/tmp/pptx-deps/node_modules` (used by the test harness). If you have
`pptxgenjs` installed globally, that works too.

LibreOffice is also required:

- macOS: install from <https://www.libreoffice.org/download/download/>
  (`/Applications/LibreOffice.app/Contents/MacOS/soffice`)
- macOS via Homebrew: `brew install --cask libreoffice`
- Linux / Cowork sandbox: `apt-get install libreoffice` (already present
  in the sandbox).

`render_pdf.sh` auto-detects which path to use.

### Synthesizer integration

The synthesizer should:

1. Build the spec JSON in memory.
2. Write it to a temp path (e.g., `tmp/spec.json`).
3. Shell out to `node scripts/build_audit_pdf.js --input tmp/spec.json
   --output reports/<Client>/<Client>_Audit_<Period>.pdf`.
4. Hand the PDF path to the deliverable layer (Asana attach, drop into
   the client folder, etc.).

There is no library API. The shell-out is the contract. This keeps the
renderer hermetic and lets the synthesizer be written in any language.

---

## 5. Debugging

### "pptxgenjs not found"

The renderer searches local, sibling, and `/tmp/pptx-deps` install
paths in that order. Run `npm install pptxgenjs` in `scripts/` and
retry. If you're on a machine that already has it globally, that works
too — Node's `require()` falls through to global last.

### "LibreOffice not found"

Install per §4. On macOS, the app must live at the standard
`/Applications/LibreOffice.app/Contents/MacOS/soffice` path (or be on
`PATH`). The error message in `render_pdf.sh` includes the install
command for each platform.

### Fonts (Georgia + Calibri) render as fallbacks

The deck uses `Georgia` for headlines and `Calibri` for body. If
LibreOffice can't find them, it'll silently substitute a fallback —
text will still render, but kerning and weight will look off.

- macOS: both fonts ship with the OS by default.
- Linux: `Calibri` is **not** installed by default. Either:
  - Install Microsoft's "Carlito" (Calibri-metric-compatible) — `apt
    install fonts-crosextra-carlito` — and accept the visual swap.
  - Install the actual fonts: copy `Calibri.ttf` and `Georgia.ttf` into
    `~/.local/share/fonts/` and run `fc-cache -f`.
- Cowork sandbox: same as Linux. Without Calibri, body text uses a sans
  serif fallback. The PDF still renders all expected pages.

To verify which fonts LibreOffice actually used, run:
```bash
fc-list | grep -iE "calibri|georgia"
```

### Wrong page count

Expected count = `12 + (number of in-scope platforms)`. So:

- Google + Meta + Amazon all in scope → 15 pages
- Two platforms in scope → 14 pages
- One platform in scope → 13 pages
- All platforms out of scope → 12 pages (every audit always has slides
  1–7 and 11–15)

Possible failure causes:

- The intermediate `.pptx` failed to build a slide (a builder threw and
  was caught downstream). Check the script's stderr output.
- LibreOffice merged or dropped a slide on conversion. Open the
  intermediate `.pptx` (kept in `/tmp/audit-pdf-XXXXX/audit.pptx` on
  render failure) in PowerPoint or Keynote to inspect.
- An expected platform slide isn't appearing: confirm the
  `platforms.{name}` block is present in the spec. If the block exists,
  `in_scope` defaults to `true` (only an explicit `in_scope: false`
  drops the slide). A missing block reads as out of scope.

### Charts look wrong / empty

- Bar/doughnut charts come from maps in the spec. Ensure values are
  **numbers**, not strings: `{"Google": 62}` not `{"Google": "62%"}`.
- Line charts (slide 3 weekly spend, slide 11 trends) take a numeric
  array. Empty arrays will trigger the renderer's fallback placeholder.

### PDF size out of expected band (200 KB – 1 MB)

- **Below 100 KB:** something rendered as empty. Check the test
  harness assertions; they'll catch this.
- **Above 5 MB:** unusual. Probably an embedded font or chart
  duplicated. Open the PDF in `pdfinfo` and inspect.

---

## 6. Worked example

**Input** (minimal, all in-scope, 15 pages):

```jsonc
{
  "theme": {
    "client":     "DemoClient",
    "agency":     "[Your Agency]",
    "period":     "April 2026",
    "dark":       "1A2A44",
    "accent":     "8E5B3A",
    "background": "F7F4ED"
  },
  "lookback":            { "current_start": "2026-01-30", "current_end": "2026-04-28",
                           "yoy_start": "2025-01-30",     "yoy_end": "2025-04-28" },
  "executive_summary":   { ... },
  "current_state":       { ... },
  "diagnosis":           { ... },
  "cross_platform":      { ... },
  "spend_allocation":    { ... },
  "foundation":          { ... },
  "platforms": {
    "google": { "in_scope": true, "status": "RED",    "...": "..." },
    "meta":   { "in_scope": true, "status": "YELLOW", "...": "..." },
    "amazon": { "in_scope": true, "status": "GREEN",  "...": "..." }
  },
  "trends":              [ ... ],
  "plan":                { ... },
  "roadmap":             [ ... ],
  "investment":          { ... },
  "risks_and_next_steps":{ ... }
}
```

(For the full 200-line populated example see `scripts/test_pdf_render.js`
which builds this in code.)

**Run:**

```bash
node scripts/build_audit_pdf.js \
  --input  tmp/demo_spec.json \
  --output out/DemoClient_Audit.pdf
```

**Output (Google Ads slide, all 3 platforms in scope → slot 8 / 15):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PER-PLATFORM STATUS                                              ╔═══════╗ │
│                                                                   ║  RED  ║ │
│  Google Ads                                                       ╚═══════╝ │
│                                                                             │
│  49% of spend on sub-1.5× ROAS lines; PMax High-Margin is the only          │
│  profitable line.                                                           │
│                                                                             │
│                          DIAGNOSTICS                                        │
│   1.91×                  •  Standard Shopping = 0 conversions in 30d        │
│                             on $1.65k spend.                                │
│   GOOGLE BLENDED ROAS                                                       │
│   Target: 2.5×           •  Non-Branded Site Nav at 1.02× ROAS with         │
│                             only 10% IS — query-quality issue.              │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ACTIONS THIS WEEK                                                      │ │
│ │  →  Pause Standard Shopping + NB Commercial; cut PMax Shopping 50%.     │ │
│ │  →  Bump PMax High-Margin +25%; rebuild asset groups by audience theme. │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  DEMOCLIENT  |  MARKETING AUDIT  |  APRIL 2026                       08/15  │
└─────────────────────────────────────────────────────────────────────────────┘
```

If Amazon were out of scope, this same slide's footer would read
`08 / 14` (the total shrinks; Google still occupies slot 8 because no
preceding platform was dropped).

The status chip is filled with `#C4453A` (locked RED). The headline
metric `1.91×` is also colored RED. The action band background is
`theme.dark`. The eyebrow ("PER-PLATFORM STATUS") and divider lines
are `theme.accent`.

---

## 7. Tests

Run the end-to-end test:

```bash
node scripts/test_pdf_render.js
```

It runs **two scenarios** against a fully populated DemoClient spec and
asserts each one:

| Scenario                       | Expected pages | Why                                    |
| ------------------------------ | -------------- | -------------------------------------- |
| All 3 platforms in scope       | 15             | Baseline rhythm.                       |
| `amazon.in_scope = false`      | 14             | Confirms OOS slide is dropped, not stubbed. Confirms footer numbering shrinks. |

Each scenario asserts: file exists, size > 100 KB and < 50 MB, and page
count matches expectation. Exits 0 if all assertions pass, 1 otherwise.
Use this as a CI gate when modifying slide builders or `buildDeck()`.

---

## 8. File ownership and rendering behavior

| File                              | Owner / purpose                                         |
| --------------------------------- | ------------------------------------------------------- |
| `scripts/build_audit_pdf.js`      | The renderer. Contains all slide builders plus `buildDeck()`, the orchestrator that builds an ordered queue of builder closures, conditionally pushes platform slides (only when `in_scope !== false`), then iterates the queue passing dynamic `(slideNum, total)` pairs to each builder. |
| `scripts/render_pdf.sh`           | LibreOffice wrapper — pptx → pdf.                       |
| `scripts/test_pdf_render.js`      | End-to-end test with a populated DemoClient sample. Runs both an all-in-scope (15-page) scenario and an Amazon-OOS (14-page) scenario. |
| `scripts/generate_charts.py`      | Existing PNG chart generator. The PDF renderer does **not** call this — pptxgenjs builds charts inline. The PNG output remains for `.docx` and any future ad-hoc embed work. |
| `scripts/package.json`            | Declares the `pptxgenjs` dependency for one-shot install. |
| `reference/pdf-template.md`       | This file.                                              |
| `reference/docx-template.md`      | Legacy docx contract — kept until v4 cutover finishes.  |
| `outputs/audit_pdf_input_spec.json` | Canonical example spec (workspace-level; ships with v4). |
| `outputs/build_deck_template.js`  | Original design prototype. Reference only — not loaded by the renderer. |

### Out-of-scope rendering behavior (canonical)

The renderer's contract for platform scope is fixed and tested:

1. **Drop, don't stub.** A platform with `in_scope: false` (or a missing
   `platforms.{name}` block) produces no slide at all. The deck length
   shrinks accordingly.
2. **Dynamic numbering.** The footer of every non-cover slide reads
   `XX / NN` where `NN` is the actual rendered page count, computed at
   render time from the queue length. There is no fixed `TOTAL`
   constant in `build_audit_pdf.js`.
3. **Order is preserved.** Among in-scope platforms, the order is
   always Google → Meta → Amazon. Dropping Google does not promote a
   later platform to slide 8 in the cosmetic sense — but that platform
   does shift left in the actual page sequence.
4. **Always-present slides are unaffected.** Slides 1 (cover) through
   7 (foundation) and 11 (trends) through 15 (risks + next steps)
   render every time. The only slides that can be dropped are the
   per-platform pages between Foundation and Trends.

To verify these invariants after any change to `buildDeck()`, run
`node scripts/test_pdf_render.js`.

---

## 9. What's intentionally **not** in this template

- **Title / TOC / appendix slides.** The slide rhythm (12 fixed slides
  + 1–3 platform slides) is the deck. Adding a TOC breaks the
  cross-client comparison habit.
- **Per-client custom slides.** If a client needs an extra section, add
  it to the synthesizer as a new section in the JSON spec **and** add a
  new slide builder here — don't fork the template.
- **Status colors as theme variables.** RED/YELLOW/GREEN are locked.
  See §3.
- **External chart images.** All charts are native pptxgenjs charts so
  they survive PDF conversion as vector. PNG embedding (via
  `generate_charts.py`) is deprecated for v4.
