# Template: Owned-Channel Collapse

**Trigger:** Email/SMS YoY revenue down >40% OR <15% of total revenue from owned channels.
**Precedence:** Tier 3 — wins over TOF-Underfunded, Cannibalization, Allocation Imbalance, and Healthy. Loses to Tracking-Broken and Profitability Trap. Rationale: a collapsed retention engine is a structural problem (margin and LTV are bleeding) but it's diagnosable — it doesn't gate trust the way tracking does, and it doesn't actively bleed cash the way negative CM3 does.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"Your retention engine is broken. {Specific number — owned-channel revenue at {X}% of total against the 20-30% Healthy band, OR YoY decline of {Y}%}. {Causal mechanism — usually a flow gap (welcome / abandoned-cart / post-purchase missing or stale), list-growth stagnation, or paid-acquisition pulling new customers faster than retention can catch}. Paid is masking it by acquiring customers you should already own — the lifecycle audit is the priority before any paid scaling."

Example (literal sample, fill with realistic numbers):

"Your retention engine is broken. Email/SMS is contributing 9% of total revenue against the 20-30% Healthy band for a Growth-stage Standard-AOV brand, and YoY revenue from owned channels is down 47%. Three core flows (welcome series, abandoned-cart, post-purchase) haven't been touched in 14 months while the list grew 38% — the engine got bigger but worse. Paid is masking it by acquiring customers you should already own — the lifecycle audit is the priority before any paid scaling."

### Sub-Pattern Worked Example #2 — owned share <15% with declining list growth

Use this sub-flavor when share of total revenue from owned is at or below the Floor (<15%) AND list growth is also flat or negative. The first sub-flavor (YoY collapse) describes a previously-working engine that broke; this one describes an engine that was never built — or that has stopped capturing new prospects, so even if flows worked they have nobody fresh to nurture. Diagnosis order shifts: capture mechanics first (popups, list-building, form placement), then flow performance.

"Your retention engine is broken. Email/SMS is at 11% of total revenue against the 20-30% Healthy band, and the subscriber list has grown net 0.4% per month over the last 6 months — well under the 2-3%/month Healthy floor for this stage. The flows are live but they're being fed an audience that isn't expanding, so even a perfectly-tuned welcome series can only convert a static, slowly-decaying inbox. The leak is upstream of email itself — popup conversion rate is 1.2% (vs 3-5% expected), there's no exit-intent capture, and SMS opt-in isn't surfaced anywhere in checkout. Fix list capture first, then flow performance — order matters or we'll spend three months tuning flows that have nobody new to nurture."

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Audit list-capture surfaces (popups, exit-intent, checkout opt-in, post-purchase opt-in) BEFORE auditing flow performance — fixing flows on a non-growing list is wasted work.
- Pull list-growth metrics (net new subscribers/month, signup-source breakdown, opt-out rate) and benchmark against the 2-3%/mo Healthy floor.
- Score capture-tool conversion rates against vendor benchmarks (3-5% popup, 5-8% checkout opt-in) before assigning blame to email content.
- If list growth is structural (no acquisition channel sending traffic), the upstream issue is paid/SEO/social — escalate to acquisition-side review.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For Owned-Channel Collapse, the framing is "the retention engine is broken; paid is masking it by re-acquiring customers you should already own."

**Headline template (one line, dollar-led):**

"~${X}/mo of owned-channel revenue gone YoY — {flow or capture surface — e.g., welcome series / abandoned-cart / popup-conversion} down {pct}% since {trigger — last edit date, ESP migration, list-stagnation start}, paid spend up to compensate."

The dollar figure is the YoY revenue gap from owned: (prior-year monthly owned revenue) − (current monthly owned revenue), OR the monthly revenue gap to the 20-30% Healthy band at current total revenue. Show the math underneath: "${X}/mo = {prior owned $} − {current owned $}" or "${X}/mo = ({Healthy floor %} − {current %}) × {total monthly revenue}."

**The One Thing — pattern-specific framing:**

The One Thing is a named lifecycle rebuild — specify the priority flow (welcome / abandoned-cart / post-purchase) for sub-pattern #1, or the specific capture surface (popup conversion rate, exit-intent, checkout SMS opt-in) for sub-pattern #2. Avoid "improve email" or "fix Klaviyo" phrasings; the WHAT must name the flow or surface, the ESP, and a target RPR or capture-rate benchmark.

**5-day operator sequence (Mon–Fri shape):**

Day 1 = pull last-90-day flow performance + list-growth metrics from the ESP (revenue per recipient, open/click rates, signup-source breakdown). Day 2 = score each flow against Klaviyo category benchmarks and identify the widest gap; for sub-pattern #2, score capture surfaces against vendor benchmarks. Day 3 = brief the lifecycle owner on the priority rebuild with target RPR or capture rate. Day 4 = stand up a 5-10% holdout group for clean lift measurement and freeze paid scale-up commits. Day 5 = ship the first content/copy round into the build and align on the 60-day flow refresh sequence. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't blame paid for the YoY decline — paid is compensating, not causing. The headline is owned-side erosion; paid spend rising is a symptom, not the root.
- Don't recommend paid optimization as The One Thing — the leverage is in rebuilding the broken owned channel; paid changes belong in the secondary actions or appendix.
- Don't size the dollar headline as "paid waste" — it's owned-channel revenue not earned, which compounds via LTV erosion. Misframing it as wasted ad spend hides the real CAC payback risk.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "Your retention engine is broken. Paid is masking it by acquiring customers you should already own."
- Charts: promote the new-vs-returning customer revenue split chart and the owned-channel revenue share chart. Demote individual paid-platform performance unless one is clearly compensating for the retention gap.
- Body chart caption: "Owned channel revenue share, last 12 months. Healthy band is 20-30% for this stage; current trend below the Floor."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Audit and fix the three core lifecycle flows.**

| Field | Detail |
|---|---|
| **WHAT** | "Audit welcome series, abandoned-cart flow, and post-purchase flow in {ESP — typically Klaviyo}. Rebuild whichever is missing or stale; A/B test subject lines and send timing on whichever is live but underperforming. Prioritize the flow with the largest revenue-per-recipient gap to the Klaviyo category benchmark." |
| **WHY** | "Addresses Finding #1: owned-channel revenue at {X}% of total — under the 20-30% Healthy band — driven primarily by flow neglect (last edit dates >9 months on all three core flows; flow RPR averaging $0.40 vs Klaviyo benchmark of $1.58)." |
| **HOW** | "1) Pull last-90-day flow performance from {ESP}: revenue per recipient, open rate, click rate, conversion rate per flow. 2) Score each flow against Klaviyo's category benchmark (welcome RPR, abandoned-cart RPR, post-purchase RPR). 3) Rebuild the largest-gap flow first — new copy, new subject lines, new segmentation, refreshed offer logic. 4) Stand up holdout group (5-10% of audience) so post-launch lift can be measured cleanly. 5) Repeat for second and third flow on a 2-week cadence." |
| **WHEN** | "Audit complete in 2 weeks; first flow rebuild shipped within 30 days; all three flows refreshed within 60 days." |
| **WHO** | "Lifecycle / email manager owns the build; agency strategist owns the audit + sequencing; client design / brand provides creative refresh as needed." |
| **EXPECTED IMPACT** | "Welcome + abandoned-cart + post-purchase fixes typically lift owned-channel revenue 30-60% within 60 days; expect 2-5 percentage points of total revenue share recovery, $X-Y/month incremental owned revenue depending on list size and AOV. Confidence: HIGH that all three flows lift; MEDIUM on the magnitude. Escalation: if any flow's RPR doesn't beat its 90-day prior baseline by ≥20% within 30 days post-rebuild, the gap is list-quality not flow-quality — pivot to list hygiene + capture rebuild." |
| **MEASUREMENT** | "Day 30 check: did the first rebuilt flow's RPR beat its prior 90-day average by ≥20%? Day 60 check: did owned-channel share lift by ≥3 percentage points of total revenue? Day 90 check: did welcome + abandoned-cart + post-purchase all hit their stage-appropriate Klaviyo Healthy band?" |

**Action #2 default — Stop scaling paid acquisition until retention catches up.**

| Field | Detail |
|---|---|
| **WHAT** | "Hold paid spend flat for 60 days while owned channels rebuild. Reallocate any planned increase into lifecycle fixes — flow creative production, list-growth tooling (popup vendor, exit-intent), segmentation work, SMS opt-in build-out." |
| **WHY** | "Acquiring more customers into a broken retention funnel compounds the LTV problem — every new customer is more likely to churn before the lifecycle program catches them, which inflates fully-loaded CAC and erodes payback. Addresses Finding #2: ratio of paid acquisition spend to owned-channel infrastructure investment is materially out of balance." |
| **HOW** | "1) Cap paid budgets at current 30-day rolling run rate. 2) Account owner sends freeze comms to internal team + agency PPC. 3) Reroute the budget that would have gone to paid increases into the lifecycle owner's rebuild line items (use the flow rebuild plan from Action #1 as the spend menu). 4) Weekly check-in monitoring owned-channel share trend; revisit the paid-scale conversation only when share trends back into the 20-30% band for two consecutive weeks." |
| **WHEN** | "60-day pause starting next Monday; auto-extends in 30-day increments if owned share hasn't returned to 18%+ by day 60." |
| **WHO** | "Agency PPC lead + client marketing director jointly own the freeze; lifecycle owner is accountable for the rebuild milestones; account owner adjudicates any unfreeze request." |
| **EXPECTED IMPACT** | "Prevents acquisition spend from being wasted on churn-prone customers; the 60-day pause typically pays for itself in retention recovery alone (1.2-2x net benefit modeled against the avoided wasted CAC). Confidence: MEDIUM on the dollar value, HIGH on the directional benefit. Escalation: if business pressure forces an unfreeze, log the override and capture which decisions were made on partial retention recovery so they can be re-litigated post-rebuild." |
| **MEASUREMENT** | "Day 30 check: paid spend variance vs cap <±5%, no scale-up commits in calendar? Day 60 check: owned-channel share trending up by ≥1 percentage point per month? Day 90 check: are we back to a position where scaling paid wouldn't compound the LTV problem (owned share ≥18%, list growth ≥2%/mo, flow RPR within Healthy band)?" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- Every paid per-channel page reframes around the retention gap: "{Platform} is acquiring at {$X CPATC} into a funnel that's losing {Y}% of customers before the second purchase. The platform is doing its job — the retention layer isn't."
- Skip aggressive paid scaling recommendations even on healthy paid channels; replace with "maintain or modestly reduce, redirect headroom to lifecycle."
- For email/SMS (if in scope of audit): full deep-dive on flow performance with named flow gaps; flow-level revenue contribution; list-growth trend.
- If email/SMS is out of scope (ads-audit only): explicit recommendation to commission a Klaviyo/lifecycle audit immediately, with named ESP and a 30-day deadline.
- For each paid channel, add a "share of new customers attributable" reading — channels driving net-new customers are doing their job; those just re-acquiring existing customers compound the retention problem.

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **Owned-Channel Revenue Share Trend** — 12-month rolling chart of owned-channel revenue as % of total, with the 20-30% Healthy band overlaid.
- **New vs Returning Customer Mix** — Shopify customer-cohort breakdown over the same period; the higher the new-customer concentration, the worse the retention picture.
- **Flow Inventory Snapshot** — list of every flow in the ESP, last-edit date, last-90-day revenue, status (active / paused / draft). Identifies which flows exist on paper but contribute nothing.
- **LTV Recovery Forecast** — modeled scenario: if owned-channel share recovers to 20% within 90 days, expected MER lift and CM3 improvement.
- **List-Capture Surface Audit** — every signup surface (homepage popup, exit-intent, checkout opt-in, post-purchase, footer, blog, paid-social offer) with current conversion rate and vendor-benchmark gap.
- **Flow Refresh Sequencing Plan** — 60-day calendar showing which flow gets rebuilt when, with holdout-group spec, success metric, and decision date for each.

## Cross-References

- Detection logic: `reference/synthesis/cross-channel-patterns.md` Section 4 (Budget Imbalance — pattern 4c, Retention/Email Under-Invested) and Section 5 (Funnel Gaps — pattern 5c, Strong Acquisition + No Retention).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 2 of the patterns table.
- Klaviyo benchmarks: `reference/playbook/benchmarks.md` (Email / Klaviyo section — flow RPR, welcome open rates, abandoned-cart recovery rates by AOV tier).
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — numbering source for the WHY field citations.
