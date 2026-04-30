# Full-Funnel Framework — Role × Quality × Profit

The definitional reference for the v2 audit. The audit no longer judges paid media by in-channel ROAS as the headline. It judges every campaign by its funnel role, scores each role with role-appropriate KPIs, and leads the report with MER + nROAS + MER-trend-vs-spend-trend.

This file is loaded at the triage step on every audit. Other reference files (triage-pulls, benchmarks, synthesizer, the per-platform deep-dives) point at the tables and rules below — they are NOT redefined elsewhere.

**Scope:** Meta + Google + YouTube only for v2. TikTok, Pinterest, Snap appear in the audit if connected but are not classified or scored under role logic until v3.

---

## 1. Channel Role Canonical Mapping

Every paid campaign across the v2 platforms gets classified into one of three roles based on Campaign Objective + audience composition + naming. Role is the lens — not the platform — that drives scoring.

| Role | Job | Canonical campaigns (v2 scope) |
|---|---|---|
| **TOF (Acquisition)** | Buys impressions of cold prospects to fill the funnel | Meta prospecting (Reach, Awareness, ASC with broad/lookalike audiences, Conversions/Sales objective targeting cold), YouTube view campaigns, YouTube Demand Gen, broad Performance Max with no audience signals (or new-customer-only signals) |
| **MOF (Consideration)** | Re-engages site visitors and warm audiences | Meta retargeting (site visitors, video viewers, page engagers, IG profile engagers), Google Display remarketing, YouTube remarketing, Performance Max with retargeting audience signals |
| **BOF (Capture)** | Closes intent already formed | Branded search, non-branded search on high-intent commercial terms, Standard Shopping with strong shopper signals, Performance Max heavily weighted to branded/shopping intent |

**Inference rules per platform (used by the Channel Role Classification pull):**

- **Meta:** Campaign Objective + naming convention + audience type. Broad/lookalike audience = TOF signal. Custom-audience-only = MOF signal. No reliable BOF role on Meta — flag any Meta campaign labeled "branded" or "BOF" for human review.
- **Google Ads:** Campaign Type is the strongest signal. Search-Branded → BOF. Search-Non-Branded → BOF if intent terms, else MOF. Standard Shopping → BOF. Performance Max → role depends on signal mix (treat as TOF unless audience signals indicate retargeting). Display → MOF (retargeting) unless Demand Gen / discovery, then TOF. YouTube within Google Ads follows the YouTube rules below.
- **YouTube (standalone or within Google Ads):** View campaigns, Demand Gen, awareness objectives → TOF. Remarketing lists → MOF. Action campaigns with broad reach → TOF. Action campaigns with narrow targeting + retargeting signals → MOF.

**Out of scope for v2:** TikTok, Pinterest, Snap. Spend on these platforms is reported but not role-classified or role-scored.

---

## 2. Role Compliance Check Rules

A campaign fails role compliance when its label/objective and its actual audience composition disagree. This is "structural mismatch" — the most common cause of misleading platform scores.

The classifier uses three signals: **Campaign Objective**, **naming heuristics**, **audience type**. When two of three disagree, the campaign is flagged as ambiguous and surfaced in the report.

**Hard mismatch rules:**

| Campaign labeling | Actual audience | Verdict |
|---|---|---|
| Named/objectived TOF | >70% spend on retargeting custom audiences | Structural mismatch — mis-labeled MOF |
| Named/objectived MOF | <20% spend on retargeting / 80%+ broad | Structural mismatch — actually TOF, treat as TOF for scoring |
| Branded search campaign | <60% spend on actual brand-term keywords | Structural mismatch — likely cannibalizing non-brand |
| PMax labeled "prospecting" | Audience signals are 100% retargeting / customer match | Structural mismatch — mis-labeled MOF |

**Ambiguous (flag, don't force):**

- Campaign Objective says "Conversions/Sales" but audience is broad and naming includes "TOF" or "Prospecting" → ambiguous, score as TOF.
- Campaign Objective says "Reach" but audience is a 1% LAL of purchasers → ambiguous, score as TOF (lookalikes count as TOF).
- PMax with mixed audience signals (some retargeting, some new-customer) and no clear naming → ambiguous, surface for human review.

**What the audit does with mismatches:**

1. Score the campaign under the role its audience composition implies (audience type wins over the label).
2. Add a Role Compliance row to the report — campaign name, label, actual role, evidence.
3. Trigger the "Role Compliance" override in scoring: if structural mismatch is detected on a campaign worth >10% of platform spend, upgrade the platform score to YELLOW even if other signals look fine.

---

## 3. Per-Role Primary / Secondary KPIs

ROAS is the primary KPI only for BOF. TOF and MOF get evaluated by KPIs that match what they're actually trying to do.

| Role | Primary KPIs (these drive the score) | Secondary (context only) |
|---|---|---|
| **TOF** | Cost per Add-to-Cart (CPATC), Cost per ViewContent (CPVC), GA4 average engaged time per session by source/medium, PDP→ATC rate, hook rate (3s views ÷ impressions), hold rate (50% completion), CTR (Link) | 7-day in-channel ROAS — informational, attribution-window-limited |
| **MOF** | ATC→Checkout rate, Checkout→Purchase rate, retargeting frequency, retargeting CTR | In-channel ROAS — more reliable than TOF (shorter cycle), but still secondary to funnel-stage rates |
| **BOF** | ROAS vs target, CPA vs break-even, attribution ratio vs Shopify orders | Volume share, branded vs non-branded mix, branded impression share |

**Why ROAS is informational-only for TOF:**

A 7-day click + 1-day view attribution window structurally undercounts cold prospecting. The buyer journey for most DTC purchases (especially anything above $50 AOV) is longer than the attribution window. Judging TOF by 7-day ROAS rewards retargeting-overlap and punishes genuine top-of-funnel reach. The platform-reported number is usable as a sanity check ("did we book any sales at all this week?") but cannot be the scoring authority.

**Scoring behavior change:**

When a Meta platform has any TOF-classified spend, the platform-level Meta score becomes a weighted blend:
- TOF-quality verdict (CPATC/CPVC/engaged time/PDP→ATC) weighted by TOF spend share
- MOF/BOF ROAS verdict weighted by their spend shares

Standard ROAS scoring still applies to MOF and BOF Meta campaigns. ROAS-based RED triggers on TOF campaigns become informational rather than score-driving.

The AOV tier (Mass / Standard / Premium / Luxury) determines which benchmark row the TOF-quality scoring uses — see `playbook/benchmarks.md` for the four-tier benchmark tables.

---

## 4. Dynamic TOF Spend Share Target

A flat "TOF should be ≥X% of paid" rule is wrong because the right TOF allocation depends on the brand. The audit computes a target TOF share per client using brand stage × AOV tier × modifiers, then scores actual TOF share against that target.

### 4.1 Inputs

| Input | Source | Effect on target TOF share |
|---|---|---|
| AOV tier | Shopify/BigCommerce triage | Higher AOV → longer cycle → needs more TOF (more touches required before purchase) |
| Returning customer % (last 90d) | Shopify customer data | Higher returning % → retention is doing the work → can afford lower TOF |
| MER trend (last 90d vs prior 90d) | Cross-platform anchor | Declining MER → existing audience pool is exhausting → need more TOF |
| Brand stage | Manifest setup question | Launch (<$500K/yr): TOF-heavy. Growth ($500K–$5M): balanced. Mature ($5M+): can afford more BOF/retention |
| Total paid spend | Cross-platform anchor | Very small spend (<$5K/mo): focus on highest-leverage channel; TOF target relaxes. Large spend ($50K+/mo): TOF target tightens — retention can't carry the load. |

### 4.2 Target Derivation Table

This is the lookup the audit performs before applying modifiers. Twelve cells: 3 brand stages × 4 AOV tiers.

| Brand stage × AOV tier | Target TOF share | Floor (below = under-funding acquisition) |
|---|---|---|
| Launch / Mass-AOV | 40-55% | <30% |
| Launch / Standard-AOV | 45-60% | <35% |
| Launch / Premium-AOV | 50-65% | <40% |
| Launch / Luxury / High-Ticket | 55-70% | <45% |
| Growth / Mass-AOV | 30-45% | <20% |
| Growth / Standard-AOV | 35-50% | <25% |
| Growth / Premium-AOV | 40-55% | <30% |
| Growth / Luxury / High-Ticket | 45-60% | <35% |
| Mature / Mass-AOV | 25-35% | <15% |
| Mature / Standard-AOV | 30-40% | <20% |
| Mature / Premium-AOV | 35-50% | <25% |
| Mature / Luxury / High-Ticket | 40-55% | <30% |

### 4.3 Modifier Rules

Applied after the table lookup:

- Returning customer % >40% AND MER trend healthy → shift target down 5pts (retention is carrying weight, less TOF needed).
- Returning customer % <20% OR MER trend declining → shift target up 5pts (need to refill the funnel).
- Total paid spend <$5K/mo → widen the band by ±10pts (small budgets don't justify rigid splits).

### 4.4 Scoring Actual vs Target

| Actual TOF share vs target | Score | Read |
|---|---|---|
| Within target band | 🟢 | Acquisition funded correctly for stage/AOV |
| Above target by 5-15pts | 🟡 | Possibly over-funding TOF — check if MOF/BOF are starved |
| Above target by >15pts | 🟡 | TOF-heavy — likely waste at this stage; retention/capture under-served |
| Below target band but above floor | 🟡 | Under-funding acquisition — funnel will thin in 60-90 days |
| At or below floor | 🔴 | Critical under-funding — halo and downstream channels will collapse |

### 4.5 TOF Mode Trigger (separate question)

The dynamic target above answers "are you funding acquisition correctly?" — an account-level health check. The TOF Mode trigger answers "how should I score the TOF campaigns that exist?" — a per-campaign-bucket question.

**Rule:** TOF Mode triggers if **any** Meta spend is in TOF role. There's no threshold. Even when prospecting is a small share of Meta spend, there's no point grading it by 7-day in-channel ROAS.

---

## 5. nROAS Calculation Methodology

New customer ROAS — the cleanest "is paid driving real lift" signal. New customers are revenue paid is supposed to be acquiring; everything else is partially capturable by owned channels.

### 5.1 Formula

```
nROAS = New-customer revenue / Total paid spend (all channels, same window)
```

Per-channel nROAS is computed the same way with the channel's spend in the denominator and that channel's attributed new-customer revenue in the numerator (requires GA4 source/medium × new vs returning).

### 5.2 Data Sources

**Primary path (when all data is available):**

1. **New-customer revenue (numerator):** Shopify "First-time vs Returning customers" report → Net sales filtered to first-time. Same date range as the audit lookback period.
2. **Paid spend (denominator):** Sum of Google Ads + Meta Ads + Amazon Ads + YouTube spend over the same window.
3. **Per-channel split (optional):** GA4 Pull 6 — Sessions × Purchase revenue × New users by Source/Medium. Cross-references against Shopify's first-time customer count to validate.

**Degraded path (Shopify customer split missing):**

- If Shopify doesn't expose first-time vs returning, fall back to GA4 "New users" dimension by Source/Medium for an approximation.
- Flag every nROAS number as `(GA4-approximated, no Shopify customer split)` and trigger the Data Gaps callout in the synthesizer.

**Failed path (GA4 UTM hygiene broken):**

- If GA4 `(direct)/(none)` >25% of paid sessions, per-channel nROAS is unreliable. Compute account-level nROAS only. Note this prominently.

### 5.3 Interpretation Table

The nROAS healthy threshold is brand-specific — it depends on contribution margin and customer LTV. The table below is directional starting from a typical 60% CM2 brand. Adjust against the client's actual margin economics.

| nROAS | Read | Action |
|---|---|---|
| <1.0× | Critical — paid is not even breaking even on first-purchase contribution | Cut spend or fix funnel before scaling |
| 1.0-1.5× | Marginal — paid acquisition costs more than first-purchase margin; only viable if LTV justifies the gap | Verify cohort LTV and payback period; if payback >6mo, paid is structurally broken |
| 1.5-2.5× | Healthy — typical for growth-stage DTC at break-even MER | Standard scaling territory |
| 2.5-4.0× | Strong — acquisition is efficient relative to first-purchase contribution | Scale TOF aggressively |
| >4.0× | Excellent OR signal that paid is leaning on retargeting/branded (check role mix) | Confirm role mix before celebrating — high nROAS with TOF spend share <20% means the number is from BOF capture, not acquisition |

### 5.4 nROAS Trend (more important than the absolute number)

A declining nROAS over a 60-90 day window is the earliest signal that paid is shifting from acquisition to capture. Track:

- nROAS down >15% while total paid ROAS holds → channel mix shifting toward retargeting/branded; TOF is failing.
- nROAS up while ROAS down → genuinely acquiring more new customers; first-purchase economics are tighter but cohort will pay back.
- nROAS and ROAS both down → broad efficiency loss, not a mix problem.

---

## 6. MER Trend vs Spend Trend Interpretation

The incrementality proxy. If spend changes and revenue changes proportionally, paid is roughly incremental. If spend changes and revenue doesn't follow, you're either cannibalizing or losing efficiency.

### 6.1 Formula

```
MER = Shopify net sales / Total paid spend (all channels)
Spend trend = (Current period spend - Prior period spend) / Prior period spend
Revenue trend = (Current period revenue - Prior period revenue) / Prior period revenue
MER ratio = Revenue trend / Spend trend
```

Compute over a 90-day vs prior-90-day window when possible. Shorter windows are noisy.

### 6.2 Interpretation Table

| Spend trend | Revenue trend | MER trend | Read |
|---|---|---|---|
| Up 20%+ | Up proportionally (within 5pts) | Held | Healthy — paid is roughly incremental |
| Up 20%+ | Up <50% of spend increase | Declining | Cannibalizing — incremental spend is finding diminishing returns |
| Up 20%+ | Flat or down | Declining sharply | Saturated — additional spend is buying audiences already converting from owned/organic |
| Flat | Up | Improving | Lifecycle, organic, or seasonal — verify before crediting paid |
| Down 20%+ | Down proportionally | Held | Demand is paid-dependent — efficiency unchanged but volume risk |
| Down 20%+ | Down less than spend | Improving | Pruning waste — efficiency gain real, watch for halo lag |
| Down 20%+ | Up or flat | Improving sharply | Either cut waste OR halo from prior TOF still flowing — verify 60-90d out |

### 6.3 Pairing with Channel Mix

MER trend in isolation lies. Pair it with TOF spend share:

- MER up + TOF share up → genuine acquisition lift.
- MER up + TOF share down → relying more on retargeting/branded; short-term win, long-term thin.
- MER down + TOF share up → TOF is broken (creative, audience, or tracking) OR halo hasn't materialized yet.
- MER down + TOF share down → likely under-investing in acquisition; the funnel is thinning.

---

## 7. Incrementality Proxy Decision Tree

Geo holdouts and lift studies are the gold standard. Neither is audit-time analysis — they require 30-90 days of design and execution. The audit uses three proxies that are computable from data already pulled.

**Important:** these are PROXIES, not formal incrementality tests. They suggest where to look. Real lift testing is a 90-day plan recommendation, not an audit verdict.

### 7.1 The Three Proxies

1. **New / Returning customer ratio** — what share of revenue is genuinely new acquisition.
2. **Branded search volume response** — does branded search move when Meta TOF moves (Brainlabs/Meta halo: ~19% incremental branded visits, ~30% incremental search conversions from Meta TOF).
3. **MER elasticity** — does MER hold when spend changes (per Section 6 above).

### 7.2 Decision Tree

```
START: Are you trying to assess whether paid is incremental?

1. Pull New / Returning revenue ratio (last 90d, Shopify first-time vs returning).
   - Returning > 85% of revenue
       → Retention is doing the work. Paid may not be net-new at all.
       → Score: Low incrementality confidence. Recommend geo holdout test.
   - New < 15% of revenue
       → Acquisition is broken — paid is at best capturing existing demand.
       → Score: Low incrementality confidence. Investigate TOF before testing.
   - 15-50% new revenue
       → Mixed — proceed to step 2.
   - 50%+ new revenue
       → Paid likely driving lift. Confirm with steps 2 and 3.

2. Pull branded search trend (Google Ads branded campaigns, last 90d vs prior 90d).
   Cross-reference with Meta TOF spend trend over the same window.
   - Meta TOF up + branded search up 2-4 weeks later
       → Halo confirmed. High incrementality confidence on Meta TOF.
   - Meta TOF up + branded search flat
       → No measurable halo. Either creative isn't memorable OR branded is saturated.
   - Meta TOF down + branded search down 2-4 weeks later
       → Halo dependency confirmed. Pulling TOF will hurt downstream.
   - Meta TOF down + branded search flat
       → Either lag hasn't hit yet (re-check at 60d) OR Meta wasn't driving halo.

3. Pull MER trend vs spend trend (per Section 6).
   Apply the interpretation table.
   - MER held while spend grew → high incrementality.
   - MER declined while spend grew → cannibalization or saturation.
   - MER held or improved while spend dropped → paid was partially redundant with owned/organic.

4. Combine the three signals.
   - All three positive → paid is incremental, scale.
   - Two positive, one negative → likely incremental, dig into the negative signal.
   - One positive, two negative → low confidence, recommend formal lift test.
   - All three negative → paid is likely not net-incremental. Cut and re-test.
```

### 7.3 What's NOT in this tree (90-day actions, not audit-time)

- Geo holdout tests (state-level recommended; DMA-level needs more spend for significance).
- Synthetic control / matched-market tests.
- Conversion lift studies (Meta-native or Google-native).
- Brand lift surveys.

If the audit recommends running any of these, it goes in the 30/60/90 plan in the appendix, NOT the headline scorecard.

---

## 8. Glossary

Defined here so the synthesizer and other reference files can point at this section instead of redefining terms.

- **TOF (Top of Funnel / Acquisition):** Campaigns that buy impressions of cold prospects. Goal is to fill the funnel. Scored by quality metrics (CPATC, CPVC, engaged time, PDP→ATC, hook rate, hold rate), not by 7-day in-channel ROAS.

- **MOF (Middle of Funnel / Consideration):** Campaigns that re-engage warm audiences — site visitors, video viewers, page engagers. Scored by funnel-stage rates (ATC→Checkout, Checkout→Purchase) and frequency.

- **BOF (Bottom of Funnel / Capture):** Campaigns that close intent already formed — branded search, high-intent non-brand, branded shopping. Scored by ROAS vs target and CPA vs break-even.

- **MER (Marketing Efficiency Ratio):** Total revenue (Shopify net sales) divided by total paid marketing spend across all channels in the same window. The honest, business-level efficiency number. Target derived from contribution margin, not industry benchmarks: Break-Even MER = 1 ÷ CM2%, plus a buffer for fixed costs and profit.

- **nROAS (New-Customer ROAS):** New-customer revenue (Shopify first-time customer net sales) divided by total paid spend over the same window. The cleanest "is paid driving real lift" signal.

- **CPATC (Cost per Add-to-Cart):** Paid spend ÷ Add-to-Cart events. A primary TOF quality metric — measures whether the audience is qualified enough to express purchase intent on-site.

- **CPVC (Cost per ViewContent):** Paid spend ÷ ViewContent events (or PDP views). A primary TOF quality metric — measures whether the audience is qualified enough to engage with product detail.

- **Hook rate:** 3-second video views ÷ impressions. The Common Thread ADA framing's "attention" metric. Below 20% on Meta = creative problem.

- **Hold rate:** Video views completed to 50% ÷ 3-second views. Measures whether the message resonates after grabbing attention. Below 30% = message problem.

- **Role compliance:** Whether a campaign's labeling/objective matches its actual audience composition. A campaign labeled TOF with a 70%+ retargeting audience fails compliance.

- **Structural mismatch:** A specific role compliance failure where the audience composition contradicts the campaign label. Surfaced in the report — the audit scores by audience reality, not by label.

- **TOF Mode:** Scoring mode that activates whenever any Meta spend is classified as TOF. Switches the scoring authority for TOF-classified Meta spend from in-channel ROAS to quality metrics. MOF and BOF Meta scoring is unchanged.

- **CM2 / CM3:** Contribution margin tiers. CM2 = Revenue − COGS − fulfillment (shipping, packaging, pick-pack). CM3 = CM2 − marketing − payment processing − returns. CM3 is the only margin that tells you if the business is making money.

- **Halo / cross-channel halo:** The lift one channel's activity creates in another channel's reported volume. Meta TOF driving branded search visits is the canonical example. Halo is a directional read, not a measured number, unless a formal lift test is run.

- **Cannibalization:** When incremental paid spend buys conversions that would have happened anyway via owned/organic. Diagnosed by spend up + revenue flat (MER ratio collapses).

- **Brand stage:** Launch (<$500K/yr revenue), Growth ($500K–$5M), Mature ($5M+). Determines TOF spend share targets and shifts scorecard expectations.

- **AOV tier:** Mass-AOV (<$50), Standard-AOV ($50-200), Premium-AOV ($200-1,000), Luxury / High-Ticket ($1,000+). Determines which benchmark row TOF-quality scoring uses (see `playbook/benchmarks.md`).

---

## Pointer Map (where this is used)

- `reference/triage-pulls.md` → reads Section 1 for role classification, Section 4 for the TOF spend share target, Section 5 for nROAS, Section 6 for MER trend.
- `reference/playbook/benchmarks.md` → reads Section 3 for which KPIs to apply per role; the four-tier benchmark tables live in benchmarks.md and are referenced from this file's Section 3.
- `reference/platforms/meta-ads-deep.md` → reads Section 2 for role compliance rules, Section 3 for per-role scoring, and the TOF Mode rule from Section 4.5.
- `reference/platforms/ga4-deep.md` → reads Section 5 for nROAS data sources and the new vs returning split requirement.
- `reference/synthesizer.md` → reads all sections; leads scorecard with MER + nROAS + MER-trend (Sections 5, 6) and includes a Funnel Health body section using Section 4 + Section 3 outputs.
