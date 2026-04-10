# Performance Max Audit Checklist

Reference for the google-ads-audit-v2 audit skill. Structured checklist for PMax-specific audit items.

---

## 1. Legacy Smart Shopping Detection

**Why it matters:** Campaigns auto-upgraded from Smart Shopping to PMax (2022-2023) often retain suboptimal settings, audience signals, and asset configurations from the migration. They need a fresh review.

**How to detect:**
- Campaign name contains "Smart Shopping", "SSC", or "[upgraded]"
- Campaign creation date is 2022-2023 with no asset group restructuring since
- Only one asset group with no audience signals configured (Smart Shopping didn't use them)
- Check Change History: filter for "Campaign type" changes — look for Smart Shopping → PMax conversion

**What to flag:**
- `legacy_smart_shopping_upgrade` signal tag on the campaign
- Note in findings whether the campaign has been optimized post-migration or is running on autopilot
- If it has only 1 asset group with default settings, recommend restructuring

---

## 2. Asset Group Quality Audit

**For each active asset group, record:**

| Check | Requirement | Finding |
|---|---|---|
| Image count | 15-20 (min 15, max 20) | |
| Video count | 1-5 (min 1, max 5) — custom, not auto-generated | |
| Headline count | 5-15 (min 5, max 15) | |
| Description count | 2-5 (min 2, max 5) | |
| Ad strength | Poor / Average / Good / Excellent | |
| "Low" rated assets | Count — target <15% of total | |
| "Best" rated assets | Count — protect these, do not remove | |

**Benchmark application:**
- 15+ unique images → 20% higher CVR than <5 images (source: google-ads.md)
- Custom video → 3x more conversions on YouTube vs auto-generated (source: google-ads.md)
- "Excellent" ad strength → 12% more conversions vs "Good"; 35% more vs "Poor" (source: google-ads.md)

**Asset group consolidation check:**
- Each group needs 20+ conversions/month to optimize effectively
- Below 5 conversions/month → **must merge** — the algorithm can't learn
- Below 20 conversions/month → **should merge** unless there's a strong strategic reason to keep separate
- Check conversion count per group: Campaigns → [PMax campaign] → Asset groups → look at "Conversions" column

**Cross-asset group duplication:**
- Are the same assets duplicated across multiple groups with only different audience signals?
- This is a common mistake — different audiences need different messaging, not the same creative
- Flag if identical asset sets appear in multiple groups

**Asset refresh cadence assessment:**
- Check Change History for asset group modifications
- If no assets have been added/replaced in 60+ days, flag as stale
- Recommended: replace 2-3 underperforming assets bi-weekly, major refresh monthly

---

## 3. Search Term Categories — Branded Cannibalization

**This is one of the highest-impact PMax findings.** 91.45% of accounts have keyword overlap between Search and PMax (Optmyzr, 503 accounts). At campaign level, 67% of PMax campaigns overlap with Search (Adalysis).

**How to check:**

1. Navigate to: Campaigns → [PMax campaign] → Insights and reports → Search terms
2. Switch to the "Categories" view (not individual search terms)
3. Look for your client's brand name in the categories
4. Calculate branded share: branded category impressions / total PMax search impressions

**Thresholds:**
- **Below 5%:** Acceptable — PMax is primarily prospecting
- **5-10%:** Monitor — some branded leakage but not critical
- **Above 10%:** PMax is cannibalizing branded search. Flag as finding. Priority: HIGH.

**What to flag if cannibalization detected:**
- The branded % share with evidence
- Whether a separate branded Search campaign exists
- Whether account-level brand exclusions are configured
- Calculate the "true prospecting ROAS" by mentally excluding branded conversions from PMax performance
- Recommendation: add brand name + brand variations as account-level negative keywords for PMax

**Account-level brand exclusions:**
- Navigate to: Settings → Account settings → Brand restrictions (or search for "brand exclusions" in account settings)
- Check if brand exclusions are active for PMax campaigns
- If not, recommend adding: brand name, brand + product, brand misspellings, brand + navigational terms

---

## 4. Budget-Limited Detection

**Why this matters most:** A budget-limited campaign that exceeds its ROAS target is the highest-confidence opportunity in any Google Ads audit. The algorithm is already profitable and is being artificially constrained.

**How to detect:**
- Campaign status column shows "Limited by budget" (or "Eligible (Limited by budget)")
- Google's Recommendations page may show a specific budget increase recommendation with estimated impact

**What to record for each budget-limited campaign:**
- Current daily budget
- Actual ROAS vs. target ROAS (if tROAS bidding)
- Google's recommended budget increase (from Recommendations)
- Google's estimated impact of the increase
- How many days the campaign was budget-limited (if visible)

**Severity assessment:**
- Budget-limited + ROAS above target by 20%+ → **CRITICAL** opportunity — almost certainly leaving profitable revenue on the table
- Budget-limited + ROAS at target → **HIGH** — should increase, but monitor closely
- Budget-limited + ROAS below target → **LOW** — budget constraint may be appropriate; fix ROAS first

**Evidence JSON mapping:**
- Add `budget_limited` to campaign `key_signals`
- If also above target, add `above_target_roas`
- Create an opportunity entry with priority, expected impact (use Google's estimate as a floor), confidence reasoning

---

## 5. Audience Signals Audit

**For each asset group, check what audience signals are configured:**

| Signal Type | Quality | Notes |
|---|---|---|
| Customer match lists (first-party data) | Best | Upload email lists, phone numbers |
| Website visitors (30-90 day retargeting) | Good | Standard retargeting signal |
| Past converters | Good | High-intent signal for lookalike expansion |
| In-market segments (Google's intent data) | Medium | Google's behavioral targeting |
| Custom intent (keyword-based audiences) | Medium | Based on search behavior |
| Affinity / Interest audiences | Low | Too broad — weak signal |
| Demographics only | Poor | Not useful as a PMax signal |
| No signals configured | Flag | Algorithm starts cold — slower learning |

**Remember:** PMax audience signals are hints, not hard targeting. Google's AI shows ads beyond these audiences. But the signals dramatically affect the learning phase — good signals mean faster optimization.

**What to flag:**
- Asset groups with no audience signals → recommend adding customer match + website visitors
- All groups using only generic interest audiences → recommend upgrading to first-party data
- All signals dumped into one group → recommend segmenting signals by persona/product theme

---

## 6. URL Expansion Status

**Check:** Is URL expansion enabled or disabled?

**Default:** ON (Google sends traffic to whatever page it thinks is best)

**When OFF is better:**
- Marketplace sellers (don't want traffic going to non-product pages)
- Multi-domain businesses
- When tight landing page control is needed (specific LP tests running)
- When non-converting pages exist (blog posts, about pages getting ad traffic)

**When ON is fine:**
- Well-optimized ecommerce site where all product pages convert well
- Page feeds configured to curate eligible URLs

**If ON, check:** Are page feeds configured? If not, Google may send paid traffic to blog posts, privacy policy, or other non-converting pages. Flag as a medium-priority finding.

---

## 7. Channel Breakdown

**Where to find it:** Some PMax reporting shows a channel-level breakdown (Search, Shopping, YouTube, Display, Gmail, Maps, Discover). Availability varies — check:
- Insights tab within the PMax campaign
- Third-party tools (if client has them)
- "Where ads showed" report: Campaigns → [PMax] → Insights and reports → Where ads showed

**What to look for:**

| Channel | Expected Share | Flag If |
|---|---|---|
| Shopping/Search | 60-85% | Below 50% — PMax is over-diversifying away from high-intent |
| YouTube | 5-20% | Above 30% without strong video creative — likely wasting spend |
| Display | 5-15% | Above 20% — low-intent impressions diluting ROAS |
| Gmail | 1-5% | Above 10% — unusual, check creative quality |
| Maps/Discover | 1-5% | Usually fine unless spend is disproportionate |

**Key diagnosis:** If Shopping+Search is below 50% of PMax spend and ROAS is below target, the campaign is likely over-spending on awareness channels (YouTube, Display) without strong creative. The fix is better video/image assets, not more budget.

---

## 8. PMax Diagnostics Card

**Where to find it:** Within the PMax campaign view, look for an "Insights" or "Diagnostics" section. Google surfaces:
- Budget limitation signals
- Learning status
- Asset coverage gaps (missing asset types)
- Conversion tracking issues
- Audience signal recommendations

**Extract and record** any diagnostic flags Google surfaces. These corroborate your own findings and can be cited as additional evidence.

---

## 9. Paused PMax Campaigns

**Don't skip these.** Check for paused PMax campaigns that had positive historical performance:

- Pull the campaign list with all statuses (not just Eligible)
- For each paused PMax campaign: record historical spend, ROAS, conversions
- If a paused campaign had ROAS above target → flag as anomaly
- Common reasons for pausing profitable PMax: consolidation into fewer campaigns, seasonal pause, accidental pause, client request

**In the evidence file:** Add to `anomalies` array with the campaign name, historical metrics, and OBSERVED label.

---

## 10. Feed Quality Quick Check (If Shopping/PMax)

This is a quick check — a full feed audit is its own skill. But during a PMax audit, check:

1. **Product count:** How many products are active in the Merchant Center feed?
2. **Disapprovals:** Are any products disapproved? What percentage?
3. **Warnings:** Are there Merchant Center warnings visible in the PMax campaign?

**Navigate to:** If you can access Merchant Center (linked account), check Products → Diagnostics for disapproval counts. If not, note as DATA_NOT_AVAILABLE and flag in open_questions.

**Key thresholds:**
- Disapprovals above 10% of catalog → flag as HIGH severity
- Approaching 28-day warning period → flag as CRITICAL (account suspension risk)
- Feed disapprovals directly suppress PMax/Shopping reach — revenue is lost every day

---

## Evidence JSON Mapping Summary

| PMax Finding | Evidence Section | Key Fields |
|---|---|---|
| Legacy Smart Shopping upgrade | campaigns[].key_signals | `legacy_smart_shopping_upgrade` |
| Asset quality issues | findings[] | title, evidence (asset counts), severity |
| Branded cannibalization | findings[] + campaigns[].key_signals | `high_branded_share`, branded % |
| Budget-limited + profitable | opportunities[] + campaigns[].key_signals | `budget_limited`, `above_target_roas` |
| Weak audience signals | findings[] | signal types present vs. recommended |
| URL expansion on without page feeds | findings[] | Medium severity |
| Channel mix skewed to Display/YouTube | findings[] | Channel breakdown data |
| Paused profitable campaigns | anomalies[] | Historical metrics, OBSERVED |
| Feed disapprovals | tracking_health.flags[] | Severity based on % |
