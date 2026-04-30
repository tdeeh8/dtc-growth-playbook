# Template: Tracking-Broken

**Trigger:** GA4↔platform variance >30% on any platform OR UTM hygiene <70% OR sudden conversion drop matching known platform change.
**Precedence:** Tier 1 — highest. Tracking always wins because it gates trust in every other diagnosis. If this pattern triggers, no other pattern can lead the report, even if its evidence is stronger. The other patterns become secondary actions in the appendix until tracking is trustworthy.

## Report Lead (one paragraph, 4 sentences max)

Template the synthesizer fills:

"Don't trust the platform numbers yet. {Specific tracking disconnect with measured variance and named platform(s)}. {Causal mechanism — usually CAPI misconfig, duplicate events, consent mode, or a known platform change}. Until this is fixed, every optimization you make is being tuned against a broken signal — we recommend a tracking-fix sprint before any budget or creative changes."

Example (literal sample, fill with realistic numbers):

"Don't trust the platform numbers yet. Meta is reporting 2,840 purchases for March against Shopify's 1,610 — a 76% over-attribution gap, well past the 30% threshold where platform data becomes unreliable for budget decisions. Root cause is almost certainly Pixel + CAPI firing without event_id deduplication, compounded by Meta's January 2026 attribution-window change inflating modeled conversions. Until this is fixed, every optimization you make is being tuned against a broken signal — we recommend a 14-day tracking-fix sprint before any budget or creative changes."

### Sub-Pattern Worked Example #2 — sudden conversion drop matching a known platform change

Use this sub-flavor when the variance signal is a step-change in conversions immediately following a known platform/tracking event (Meta Jan 2026 attribution-window removal, GA4 consent-mode rollout, Shopify Checkout Extensibility migration), not a slow drift. The diagnosis is "the platform stopped reporting what it used to" rather than "the platform is over-reporting."

"Don't trust the platform numbers yet. Meta-reported purchases dropped 38% week-over-week starting January 13, 2026 — the exact day Meta removed the 28-day click attribution window for most accounts. Shopify orders held flat across the same window (down only 4%, inside normal seasonality). Root cause is the attribution-window change shrinking what Meta credits, not a real performance collapse — but the platform optimization signals are now operating against a smaller credited dataset, which will compound into worse delivery decisions if we don't reset the baseline. Until we re-baseline against the new attribution model and reconcile against Shopify, every bid and budget call this month is fighting a measurement artifact rather than a demand reality."

**Diagnosis sequence shifts (sub-pattern #2 vs #1):**
- Skip the CAPI/dedup checks first — they likely aren't the root cause when the variance shows as a clean step-change rather than a slow drift.
- Lead with a known-platform-changes audit (Meta Jan 2026, Shopify Checkout Extensibility, GA4 Consent Mode v2) and confirm dates against the variance break point.
- Re-baseline metrics against the new attribution / data-collection model BEFORE re-establishing optimization decisions; old benchmarks no longer apply.
- Communicate the re-baselining explicitly to client stakeholders so the headline drop isn't read as a performance regression.

## Money Page lead (Page 1)

The Money Page is the dollarized one-pager that opens the report. For Tracking-Broken, the framing is "the optimization signal is broken; until it's fixed, every other diagnosis is held."

**Headline template (one line, dollar-led):**

"~${X}/mo of conversions invisible to ad platforms — {tracking gap source — e.g., Pixel+CAPI dedup, Consent Mode v2, Meta attribution-window change} broken since {date or known platform-change trigger}, dropping optimization signal across paid."

The dollar figure is the monthly paid spend currently being optimized against the broken signal — NOT lost revenue. Sizing math: 30-day paid spend × the share of channels with >30% variance. Cite the math underneath the headline so the operator can trace it.

**The One Thing — pattern-specific framing:**

The One Thing is almost always a tracking-fix sprint with a *named* broken pipe (Pixel+CAPI event_id dedup on Purchase, Consent Mode v2 + GA4 consent signals, Meta Jan 2026 attribution re-baseline, Shopify Checkout Extensibility migration). The WHAT must name the specific gap and the platform — never "improve tracking" or "audit measurement" generically. The dollar size of the WHAT is the spend currently misallocated, not the conversions to recover.

**5-day operator sequence (Mon–Fri shape):**

Day 1 = identify the broken pipe (variance reconciliation against Shopify, isolate the worst-gap platform). Day 2 = reconnect / verify (CAPI dedup fix, Consent Mode v2 firing, attribution-window acknowledgement). Day 3 = backfill or trigger reprocessing where supported. Day 4 = validate end-to-end with a $1 test conversion mapped 1:1 across Events Manager, GA4 DebugView, and Shopify. Day 5 = monitor variance trend, document the post-fix baseline, and unfreeze comms. The synthesizer fills the Mon–Fri grid from Action #1's HOW field.

**Money Page lead — failure modes (what NOT to write on Page 1):**

- Don't lead with paid optimization recommendations — every dollar of paid leverage is gated on a trustworthy signal, so any "scale this / cut that" call belongs in the appendix until tracking is clean.
- Don't size the headline as "lost revenue" — it's invisible signal, not gone-forever demand. The dollar figure is the spend currently optimizing against bad data.
- Don't recommend platform algorithm work (bid-strategy changes, CBO toggles, audience restructures) inside the fix window — algos retrain on broken data and embed the error past the fix.

## Funnel Health Section Adaptation

When this pattern is dominant, the Funnel Health section's lead paragraph reframes around the pattern. Specifically:
- Lead with: "Don't trust the platform numbers yet. Here's what's broken and what to fix before optimizing anything else."
- Charts: emphasize the GA4↔Shopify reconciliation chart and the platform-variance-vs-Shopify chart. Demote the CTR / CPATC / ROAS charts — caption them with "Directional only — see tracking section before acting on these." Promote the data-quality matrix from the appendix into the body.
- Body chart caption: "Platform-claimed conversions vs Shopify orders, last 30 days. Anything >30% gap is a tracking failure, not a performance failure."

## Priority Actions Default Shape

The first 1-2 Priority Actions for this pattern follow a default shape:

**Action #1 default — Fix the largest tracking gap first.**

| Field | Detail |
|---|---|
| **WHAT** | "Reconcile {platform with largest gap} reporting against Shopify — root-cause and fix the deduplication / CAPI / consent / attribution-window issue driving the variance." |
| **WHY** | "Addresses Finding #1: {platform} reports {X}% more (or fewer) conversions than Shopify, breaking the 30% trust threshold." |
| **HOW** | "1) Verify event_id deduplication on CAPI vs pixel for Purchase, AddToCart, ViewContent. 2) Check for double-fired pixel + GTM installs (common after a recent dev change). 3) Validate Consent Mode v2 + GA4 consent signals against the cookie banner. 4) Run a $1 test purchase end-to-end; confirm 1:1 mapping in Meta Events Manager + GA4 DebugView + Shopify order. 5) If gap persists, pull a 7-day order-by-order export and reconcile against platform conversion logs to isolate the duplicate / drop pattern." |
| **WHEN** | "This week — kickoff by EOD Wednesday; full reconciliation done within 14 days." |
| **WHO** | "Agency analytics lead owns the audit; client engineering / dev partner owns implementation; account owner approves freeze + comms." |
| **EXPECTED IMPACT** | "Restoring tracking accuracy enables every downstream optimization (indirect, unmeasurable until fixed). Direct: platform-reported numbers will likely drop 15-40% as duplicates clear (or rise back toward Shopify if the issue was missed events). Confidence: HIGH that the variance closes; MEDIUM on the exact %. Escalation: if variance still >30% by day 14, raise to data-engineering for server-side rebuild." |
| **MEASUREMENT** | "Day 7 check: did the largest-gap platform's variance drop below 30%? Day 14 check: are all platforms within 15% variance of Shopify on rolling 7d window? Day 30 check: have rolling 30-day numbers stabilized at the lower (deduplicated) baseline without an unexplained step-recovery?" |

**Action #2 default — Pause major budget or structural changes during the fix window.**

| Field | Detail |
|---|---|
| **WHAT** | "Freeze all budget reallocations, bid-strategy changes, and audience structural changes until tracking is verified clean (target: 14 days). Keep creative iteration and pacing checks running — they don't depend on conversion-attribution accuracy." |
| **WHY** | "Optimization decisions made on broken data compound the problem — platform algos retrain on bad signal, which embeds the error past the fix window. Addresses Finding #1's secondary risk: 'every day under broken tracking is a day of compounded misallocation.'" |
| **HOW** | "1) Account owner sends a freeze memo to internal team + agency on day 1. 2) Document the current tracking baseline (variance %, claimed conversions per platform, MER) as the pre-fix snapshot. 3) Hold weekly check-ins where any proposed budget/bid/audience change is logged but not actioned. 4) On fix completion, document the post-fix baseline and unfreeze with a kickoff call covering the new normal." |
| **WHEN** | "Effective immediately for the 14-day fix sprint; auto-renews 7 days at a time if variance threshold isn't met by day 14." |
| **WHO** | "Account owner / agency strategist owns the comms + governance; in-house ops + agency ad managers honor the freeze; analytics lead signs off on unfreeze." |
| **EXPECTED IMPACT** | "Avoids an estimated $X of misallocated spend during the fix window (calculated as: 14 days × daily spend × estimated misallocation rate from the variance %). Confidence: MEDIUM on the dollar value, HIGH on the directional benefit. Escalation: if business pressure forces an unfreeze before tracking is clean, log the override and capture which decisions were made on partial data so we can re-litigate them post-fix." |
| **MEASUREMENT** | "Day 14 check: did any budget reallocations slip through during the freeze? (Target: zero.) Day 30 check: is the post-fix baseline documented and signed off by client + agency as the new starting point for any future optimization work? Day 60 check: did MER move within ±10% of the pre-fix baseline once tracking was clean? (Larger swings suggest the prior 'optimization' was riding on the broken signal.)" |

## Per-Channel Page Adaptation

How per-channel pages adjust under this pattern:
- Every per-channel page leads with: "Numbers below should be read as directional only until tracking is fixed. Specific gap on this channel: {variance %}."
- Skip the deep optimization recommendations entirely on platforms with >30% variance — replace with the tracking-fix subset for that channel (e.g., Meta CAPI reconciliation, Google enhanced conversions verification, Amazon attribution model check).
- Keep the spend / impression / click data — those are observed, not modeled, and remain trustworthy.
- For platforms below the variance threshold (clean tracking), call that out explicitly: "{Platform} tracking is within tolerance ({X}% variance). Findings here are reliable."
- For platforms with a known-change exposure but no variance yet, flag the risk proactively: "{Platform} hasn't broken the threshold but is exposed to {known change}; monitor weekly through the fix sprint."

## Pattern-Specific Appendix Material

Required appendix sections under this pattern:
- **Tracking-Fix Roadmap** — 14-day sequenced plan with daily milestones: day 1-3 audit & root-cause, day 4-7 implement fixes, day 8-10 validate with test transactions, day 11-14 monitor variance trend.
- **Variance Reconciliation Table** — every platform's reported conversions vs Shopify orders, 30-day window, with computed variance %, threshold flag, and likely root cause for each gap.
- **Known Platform Changes Reference** — Meta Jan 2026 attribution-window removal, Shopify Aug 2025 Checkout Extensibility migration, Google Jul 2025 Consent Mode v2 enforcement. Note which the client is exposed to.
- **Defensibility Note** — explicit statement that all other findings in this report are gated on the tracking fix; if challenged, the QC red-team answer is "we held conclusions on optimization until measurement is trustworthy."
- **Pre-Fix vs Post-Fix Baseline Comparison** — once tracking is verified clean, capture the same metric set side-by-side so future audits can reference the corrected baseline as the starting line for trend analysis.
- **Stakeholder Comms Pack** — a 1-page explainer the account owner can share with client leadership covering: what changed, why platform numbers will look "worse," what's actually different vs what's just attribution-clean, and the 14-day timeline.

## Cross-References

- Detection logic: `reference/synthesis/cross-channel-patterns.md` Section 6 (Tracking Disconnects — patterns 6a, 6b, 6c, 6d, 6e).
- Synthesizer hook: `synthesizer.md` Step 1.8b (Apply Adaptive Template).
- Authoritative trigger source: `v3-quality-framework.md` Section 2.3, row 1 of the patterns table.
- Action Contract reference: `reference/synthesis/action-contract.md` — the 7-field contract every Priority Action above must satisfy.
- Insight Rubric reference: `reference/synthesis/insight-rubric.md` — every finding cited by an action's WHY field must clear this 5-axis check.
- Findings Matrix reference: `reference/synthesis/findings-matrix.md` — the numbering source the WHY field cites.
