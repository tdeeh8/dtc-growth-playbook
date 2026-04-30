#!/usr/bin/env python3
"""
generate_charts.py — Chart generator for ads-audit / databox-audit skills.

Produces PNG charts (300 DPI, 1600px wide) used by DTC marketing audit skills
when building .docx deliverables. Two identical copies of this file live in
the two skill sources; edit BOTH when changing.

Chart count: 9 (8 v1/v2 charts + 1 v3 addition).
v3 additions (per v3-quality-framework-addendum.md Section 4):
  - priority_action_impact_effort: 2×2 Impact × Effort quadrant for
    "what should we ship Monday?" prioritization.

  Note: `findings_matrix_heatmap` was cut from the v3 spec (the Findings
  Matrix table itself carries the same data; the heatmap was redundant ink).

Usage:
    python generate_charts.py --spec spec.json --out ./charts
    python generate_charts.py --selftest   # writes charts to ./chart_selftest/

JSON spec:
{
  "period_label": "2026-03-15 to 2026-04-13",
  "charts": [
    {"type": "spend_roas_bubble", "key": "...", "title": "...",
     "break_even": 4.0, "target": 5.0,
     "data": [{"name": "...", "spend": 907, "roas": 6.96}, ...]},
    {"type": "channel_mix_yoy", "key": "...", "title": "...",
     "current": {"Direct": 24365, ...}, "prior": {"Direct": 5125, ...}},
    {"type": "attribution_gap", "key": "...", "title": "...",
     "data": [{"channel": "Google Ads", "platform": 22316, "ga4": 13088}, ...]},
    {"type": "cvr_bounce_yoy", "key": "...", "title": "...",
     "current": {"cvr": 0.00187, "bounce": 0.7175},
     "prior":   {"cvr": 0.00459, "bounce": 0.3506}},
    {"type": "frequency_by_campaign", "key": "...", "title": "...",
     "data": [{"campaign": "...", "frequency": 5.38}, ...]},

    # --- Funnel Health (v2 — full-funnel rethink) ---
    {"type": "funnel_stage_mix", "key": "funnel_stage_mix", "title": "...",
     "stages": [
       {"role": "TOF", "spend_share_pct": 35,
        "primary_kpi_label": "CPATC", "primary_kpi_value": "$28",
        "kpi_grade": "Healthy"},
       {"role": "MOF", "spend_share_pct": 25,
        "primary_kpi_label": "ATC->Checkout", "primary_kpi_value": "42%",
        "kpi_grade": "Concerning"},
       {"role": "BOF", "spend_share_pct": 40,
        "primary_kpi_label": "ROAS", "primary_kpi_value": "6.2x",
        "kpi_grade": "Healthy"}
     ]},
     # Bar height encodes spend_share_pct; bar fill color encodes kpi_grade
     # (Healthy=green, Concerning/Yellow=amber, Floor/Red=red, otherwise=gray);
     # two-line annotation (role on top, KPI value below) on each bar.
     # Output PNG: funnel_stage_mix.png

    {"type": "mer_vs_spend_trend", "key": "mer_vs_spend_trend", "title": "...",
     "periods": ["Jan", "Feb", "Mar", "Apr"],
     "mer_current":     [3.2, 3.4, 3.1, 3.0],
     "mer_prior_year":  [3.0, 3.1, 3.2, 3.3],
     "spend_current":    [12000, 13500, 14200, 14800],
     "spend_prior_year": [10000, 10800, 11500, 12000],
     "mer_target": 2.8},
     # Dual-axis line: left = MER (with target as dashed line),
     # right = paid spend; current solid, prior year dashed.
     # Output PNG: mer_vs_spend_trend.png

    {"type": "new_vs_returning_revenue", "key": "new_vs_returning_revenue",
     "title": "...",
     "channels": ["Meta", "Google Ads", "Email", "Direct"],
     "new_customer_revenue":      [12000, 18000, 4000, 9000],
     "returning_customer_revenue": [3000, 7500, 22000, 15000]}
     # Grouped bar: new (PRIMARY) vs returning (SECONDARY) per channel.
     # Output PNG: new_vs_returning_revenue.png
  ]
}

Output filenames: `{chart_key}.png`. Empty data -> warning + skip (no crash).

Chart Authoring Notes (gotchas that bit prior implementations — read before
adding new chart types):

  1. matplotlib parses `$...$` as TeX math mode. Any tick label, annotation,
     or text that contains literal dollar signs MUST be escaped as a raw
     string with a leading backslash: `r"\$"`, `r"\$\$"`, `r"\$\$\$"`. The
     `priority_action_impact_effort` chart hits this when rendering Impact
     axis labels — see its inline comment for the escape pattern.

  2. Palette constants (RED/YELLOW/GREEN, PRIMARY/SECONDARY/GRID) are tuned
     for cell/bar fills, NOT for bold text rendered on tinted backgrounds.
     If you need a bold quadrant/corner label that reads well against a
     tinted fill, pick a darker hex for the text (e.g. `#9A6E08` for amber-
     family text vs the YELLOW `#D68910` constant). The `priority_action_
     impact_effort` chart uses this exception for its quadrant corner
     labels — fills stay on palette, text drops a stop.

"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from matplotlib.ticker import FuncFormatter, PercentFormatter

# Palette (matches docx-template status cells)
RED, YELLOW, GREEN = "#C0392B", "#D68910", "#229954"
PRIMARY, SECONDARY, GRID = "#1F3864", "#2E74B5", "#F2F2F2"

DPI = 300
FIG_W_IN = 1600 / DPI  # 1600px wide at 300 DPI

plt.rcParams.update({
    "font.family": "sans-serif", "font.size": 10,
    "axes.titleweight": "bold", "axes.titlesize": 13,
    "axes.edgecolor": "#444", "axes.labelcolor": "#222",
    "axes.facecolor": "white", "figure.facecolor": "white",
    "axes.grid": True, "grid.color": GRID, "grid.linewidth": 1,
})


def _footer(fig, period: str) -> None:
    fig.text(0.995, 0.01, f"Source: Databox MCP — {period}",
             ha="right", va="bottom", fontsize=8, color="#666", style="italic")


def _save(fig, out_dir: Path, key: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{key}.png"
    fig.savefig(path, dpi=DPI, bbox_inches="tight")
    plt.close(fig)
    return path


def _empty(chart: dict, reason: str, out_dir: Path | None = None,
           period: str = "") -> None:
    """Render a placeholder PNG when chart data is unavailable.

    Why a placeholder instead of silent skip: v2 spec requires both
    Funnel Health charts to appear in the report — silently dropping
    one breaks the synthesizer's docx layout (missing image reference)
    and hides the data-availability problem from the reader.

    The placeholder shows the chart's title and an explanation of why
    the data is unavailable, so the reader sees "this is a known gap"
    instead of a missing image or, worse, a misleading absence.
    """
    print(f"[warn] placeholder for '{chart.get('key','?')}' "
          f"({chart.get('type','?')}): {reason}", file=sys.stderr)

    # Backward-compat: older callers don't pass out_dir. If absent,
    # we still log but can't write a placeholder — return early.
    if out_dir is None:
        return

    title = chart.get("title") or chart.get("type", "Chart")
    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.55))
    ax.axis("off")
    fig.patch.set_facecolor("#FAFAFA")

    # Title at top
    ax.text(0.5, 0.85, title, ha="center", va="center",
            fontsize=14, fontweight="bold", color="#1F3864",
            transform=ax.transAxes)
    # "Data unavailable" badge
    ax.text(0.5, 0.55, "Data unavailable", ha="center", va="center",
            fontsize=20, fontweight="bold", color=YELLOW,
            transform=ax.transAxes)
    # Reason
    ax.text(0.5, 0.38, reason, ha="center", va="center",
            fontsize=11, color="#444", style="italic",
            transform=ax.transAxes, wrap=True)
    # Methodology hint
    ax.text(0.5, 0.18,
            "This chart is required by the v2 spec. "
            "See the Tracking & Attribution Notes section "
            "for what to connect to populate it.",
            ha="center", va="center", fontsize=9, color="#666",
            transform=ax.transAxes, wrap=True)

    if period:
        _footer(fig, period)
    _save(fig, out_dir, chart.get("key", "placeholder"))


# ---------- spend vs ROAS bubble ----------
def spend_roas_bubble(chart: dict, period: str, out_dir: Path) -> None:
    data = chart.get("data") or []
    if not data:
        return _empty(chart, "no data", out_dir, period)

    be = float(chart.get("break_even", 1.0))
    target = float(chart.get("target", be * 1.25))
    names = [d["name"] for d in data]
    spend = [float(d["spend"]) for d in data]
    roas = [float(d["roas"]) for d in data]

    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.6))
    x_max = max(spend) * 1.15 if spend else 1
    y_max = max(max(roas), target) * 1.2 if roas else target * 1.2

    ax.axhspan(0, be, color=RED, alpha=0.08, zorder=0)
    ax.axhspan(target, y_max, color=GREEN, alpha=0.08, zorder=0)
    ax.axhline(be, color=RED, ls="--", lw=1.2, label=f"Break-even ({be:.1f}x)")
    ax.axhline(target, color=GREEN, ls="--", lw=1.2, label=f"Target ({target:.1f}x)")

    max_spend = max(spend) if spend else 1
    sizes = [max(60, (s / max_spend) * 1800) for s in spend]
    colors = [RED if r < be else (YELLOW if r < target else GREEN) for r in roas]
    ax.scatter(spend, roas, s=sizes, c=colors, alpha=0.7,
               edgecolors=PRIMARY, linewidths=1.2, zorder=3)

    for n, x, y in zip(names, spend, roas):
        lbl = n if len(n) <= 28 else n[:25] + "…"
        ax.annotate(lbl, (x, y), xytext=(6, 6), textcoords="offset points",
                    fontsize=8, color="#222")

    ax.set_xlim(0, x_max); ax.set_ylim(0, y_max)
    ax.set_xlabel("Spend ($)"); ax.set_ylabel("ROAS (x)")
    ax.set_title(chart.get("title", "Spend vs ROAS"))
    ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax.legend(loc="upper right", frameon=False, fontsize=9)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- channel mix YoY (100% stacked horizontal) ----------
def channel_mix_yoy(chart: dict, period: str, out_dir: Path) -> None:
    current = chart.get("current") or {}
    prior = chart.get("prior") or {}
    if not current and not prior:
        return _empty(chart, "no current or prior data", out_dir, period)

    channels = list({*current.keys(), *prior.keys()})
    channels.sort(key=lambda c: current.get(c, 0), reverse=True)

    def pct(d):
        total = sum(d.values()) or 1
        return [d.get(c, 0) / total * 100 for c in channels]

    cur_pct, pri_pct = pct(current), pct(prior)
    base = [PRIMARY, SECONDARY, GREEN, YELLOW, RED, "#6C3483", "#117A65", "#B9770E", "#7D6608"]
    colors = [base[i % len(base)] for i in range(len(channels))]

    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.35))
    rows = ["Prior", "Current"]
    stacks = [pri_pct, cur_pct]
    left = [0.0, 0.0]
    for i, ch in enumerate(channels):
        vals = [stacks[0][i], stacks[1][i]]
        ax.barh(rows, vals, left=left, color=colors[i], edgecolor="white", label=ch)
        for r, v in enumerate(vals):
            if v >= 5:
                ax.text(left[r] + v / 2, r, f"{v:.0f}%", ha="center", va="center",
                        fontsize=8, color="white", fontweight="bold")
        left = [left[0] + vals[0], left[1] + vals[1]]

    ax.set_xlim(0, 100)
    ax.xaxis.set_major_formatter(PercentFormatter())
    ax.set_title(chart.get("title", "Channel Mix YoY"))
    ax.set_axisbelow(True)
    ax.grid(axis="y", visible=False)
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.15),
              ncol=min(len(channels), 5), frameon=False, fontsize=8)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- attribution gap ----------
def attribution_gap(chart: dict, period: str, out_dir: Path) -> None:
    data = chart.get("data") or []
    if not data:
        return _empty(chart, "no data", out_dir, period)

    channels = [d["channel"] for d in data]
    platform = [float(d.get("platform", 0)) for d in data]
    ga4 = [float(d.get("ga4", 0)) for d in data]

    x = list(range(len(channels)))
    w = 0.38
    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.5))
    ax.bar([i - w/2 for i in x], platform, w, label="Platform-claimed",
           color=SECONDARY, edgecolor="white")
    ax.bar([i + w/2 for i in x], ga4, w, label="GA4-attributed",
           color=PRIMARY, edgecolor="white")

    for i, (p, g) in enumerate(zip(platform, ga4)):
        if p <= 0:
            lbl = "n/a"
        else:
            lbl = f"{(p - g) / p * 100:+.0f}% gap"
        top = max(p, g)
        ax.text(i, top * 1.04 if top else 0.1, lbl,
                ha="center", va="bottom", fontsize=9,
                color=RED if p > g else GREEN, fontweight="bold")

    ax.set_xticks(x); ax.set_xticklabels(channels)
    ax.set_ylabel("Revenue ($)")
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax.set_title(chart.get("title", "Platform Claims vs GA4 Attribution"))
    ax.legend(frameon=False, fontsize=9)
    ax.grid(axis="x", visible=False)
    ax.set_ylim(0, max([*platform, *ga4, 1]) * 1.2)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- CVR + bounce YoY ----------
def cvr_bounce_yoy(chart: dict, period: str, out_dir: Path) -> None:
    current = chart.get("current") or {}
    prior = chart.get("prior") or {}
    if not current and not prior:
        return _empty(chart, "no current or prior data", out_dir, period)

    fig, axes = plt.subplots(1, 2, figsize=(FIG_W_IN, FIG_W_IN * 0.45))

    def panel(ax, key: str, label: str, good_high: bool):
        cur, pri = float(current.get(key, 0)), float(prior.get(key, 0))
        vals = [pri, cur]
        good = cur >= pri if good_high else cur <= pri
        colors = [SECONDARY, GREEN if good else RED]
        bars = ax.bar(["Prior", "Current"], vals, color=colors,
                      edgecolor="white", width=0.55)
        for b, v in zip(bars, vals):
            ax.text(b.get_x() + b.get_width() / 2, v, f"{v*100:.2f}%",
                    ha="center", va="bottom", fontsize=9,
                    fontweight="bold", color="#222")
        ax.set_title(label, fontsize=11)
        ax.yaxis.set_major_formatter(PercentFormatter(xmax=1))
        ax.set_ylim(0, max(vals) * 1.3 if max(vals) else 1)
        ax.grid(axis="x", visible=False)

    panel(axes[0], "cvr", "Conversion Rate", good_high=True)
    panel(axes[1], "bounce", "Bounce Rate", good_high=False)
    fig.suptitle(chart.get("title", "GA4 Traffic Quality YoY"),
                 fontsize=13, fontweight="bold", y=1.02)
    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- Meta frequency by campaign ----------
def frequency_by_campaign(chart: dict, period: str, out_dir: Path) -> None:
    data = chart.get("data") or []
    if not data:
        return _empty(chart, "no data", out_dir, period)

    data = sorted(data, key=lambda d: float(d.get("frequency", 0)))
    names = [d["campaign"] for d in data]
    freqs = [float(d["frequency"]) for d in data]

    def color_for(f):
        return GREEN if f < 2.5 else (YELLOW if f <= 4 else RED)

    colors = [color_for(f) for f in freqs]
    height = max(FIG_W_IN * 0.3, 0.35 * len(names) + 1)
    fig, ax = plt.subplots(figsize=(FIG_W_IN, height))
    bars = ax.barh(names, freqs, color=colors, edgecolor="white")
    for b, v in zip(bars, freqs):
        ax.text(v + 0.05, b.get_y() + b.get_height() / 2, f"{v:.2f}",
                va="center", fontsize=8, color="#222")

    ax.axvline(2.5, color=YELLOW, ls="--", lw=1)
    ax.axvline(4.0, color=RED, ls="--", lw=1)
    ax.set_xlabel("Frequency")
    ax.set_title(chart.get("title", "Meta Campaign Frequency"))
    ax.grid(axis="y", visible=False)
    ax.set_xlim(0, max(freqs) * 1.2 if freqs else 5)
    ax.legend(handles=[
        Patch(facecolor=GREEN, label="Healthy (<2.5)"),
        Patch(facecolor=YELLOW, label="Watch (2.5-4)"),
        Patch(facecolor=RED, label="Fatigue (>4)"),
    ], loc="lower right", frameon=False, fontsize=8)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# =====================================================================
# Funnel Health charts (v2 — added for full-funnel rethink, CHANGE 9)
# =====================================================================

# Neutral gray for DATA_NOT_AVAILABLE / unscored
NEUTRAL = "#7F8C8D"


def _grade_color(grade: str | None) -> str:
    """Map a KPI grade label to a fill color.

    Dual-encoding partner: bar height encodes the actual share/value,
    color encodes the scan-level grade. Gray for missing / unknown so
    the chart still reads in print/grayscale.
    """
    if not grade:
        return NEUTRAL
    g = str(grade).strip().lower()
    if g in ("healthy", "green", "good", "ok"):
        return GREEN
    if g in ("concerning", "yellow", "watch", "amber", "warn"):
        return YELLOW
    if g in ("floor", "red", "unhealthy", "bad", "critical"):
        return RED
    if g in ("data_not_available", "n/a", "na", "unknown", ""):
        return NEUTRAL
    return NEUTRAL


# ---------- Funnel stage mix (TOF / MOF / BOF spend share + KPI grade) ----------
def funnel_stage_mix(chart: dict, period: str, out_dir: Path) -> None:
    """Vertical bars for TOF / MOF / BOF.

    - Bar height = spend_share_pct
    - Bar fill color = kpi_grade (green / amber / red / gray)
    - Two-line annotation per bar: role on top, KPI value below
      (dual encoding so the chart reads in grayscale AND scans at glance in color).
    """
    stages = chart.get("stages") or []
    if not stages:
        return _empty(chart, "no stages", out_dir, period)

    roles = [s.get("role", "?") for s in stages]
    shares = [float(s.get("spend_share_pct", 0) or 0) for s in stages]
    kpi_labels = [s.get("primary_kpi_label", "") or "" for s in stages]
    kpi_values = [s.get("primary_kpi_value", "") or "" for s in stages]
    grades = [s.get("kpi_grade", "") or "" for s in stages]
    colors = [_grade_color(g) for g in grades]

    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.6))

    x = list(range(len(roles)))
    bars = ax.bar(x, shares, color=colors, edgecolor="white",
                  linewidth=1.5, width=0.72)

    y_max = max(max(shares) * 1.30 if shares else 50, 50)

    for b, role, kpi_lbl, kpi_val, share in zip(bars, roles, kpi_labels,
                                                 kpi_values, shares):
        # Two-line annotation: ROLE on top, KPI label + value below.
        # KPI line wraps "label\nvalue" if combined string is long.
        kpi_combined = f"{kpi_lbl} {kpi_val}".strip() if (kpi_lbl or kpi_val) else "—"
        if len(kpi_combined) > 12 and kpi_lbl and kpi_val:
            kpi_line = f"{kpi_lbl}\n{kpi_val}"
        else:
            kpi_line = kpi_combined
        annotation = f"{role}\n{kpi_line}"
        # Inside bar (white text) when there's room; otherwise above (dark text).
        if share >= 14:
            ax.text(b.get_x() + b.get_width() / 2, share / 2, annotation,
                    ha="center", va="center", fontsize=9.5,
                    color="white", fontweight="bold", linespacing=1.25)
        else:
            ax.text(b.get_x() + b.get_width() / 2, share + y_max * 0.02,
                    annotation, ha="center", va="bottom", fontsize=9,
                    color="#222", fontweight="bold", linespacing=1.25)

    ax.set_xticks(x)
    ax.set_xticklabels(roles, fontsize=10, fontweight="bold")
    ax.set_ylabel("Spend Share (%)")
    ax.yaxis.set_major_formatter(PercentFormatter())
    ax.set_title(chart.get("title", "Funnel Stage Mix — Spend Share by Role"))
    ax.set_ylim(0, y_max)
    ax.grid(axis="x", visible=False)

    ax.legend(handles=[
        Patch(facecolor=GREEN, label="Healthy"),
        Patch(facecolor=YELLOW, label="Concerning"),
        Patch(facecolor=RED, label="Floor"),
        Patch(facecolor=NEUTRAL, label="No data"),
    ], loc="upper right", frameon=False, fontsize=8, ncol=4)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- MER vs paid spend trend (current vs prior year) ----------
def mer_vs_spend_trend(chart: dict, period: str, out_dir: Path) -> None:
    """Dual-axis line chart.

    - Left axis: MER (current solid, prior year dashed) + target as horizontal dashed
    - Right axis: paid spend (current solid, prior year dashed)
    """
    periods = chart.get("periods") or []
    mer_cur = list(chart.get("mer_current") or [])
    mer_pri = list(chart.get("mer_prior_year") or [])
    spd_cur = list(chart.get("spend_current") or [])
    spd_pri = list(chart.get("spend_prior_year") or [])
    target = chart.get("mer_target")

    if not periods or (not mer_cur and not spd_cur and not mer_pri and not spd_pri):
        return _empty(chart, "no periods or series", out_dir, period)

    fig, ax_mer = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.55))
    ax_spd = ax_mer.twinx()

    x = list(range(len(periods)))

    # MER lines (left axis) — PRIMARY color
    if mer_cur:
        ax_mer.plot(x[:len(mer_cur)], mer_cur, color=PRIMARY, marker="o",
                    linewidth=2.2, label="MER (current)", zorder=5)
    if mer_pri:
        ax_mer.plot(x[:len(mer_pri)], mer_pri, color=PRIMARY, marker="o",
                    linewidth=1.8, linestyle="--", alpha=0.55,
                    label="MER (prior year)", zorder=4)

    if target is not None:
        try:
            tgt = float(target)
            ax_mer.axhline(tgt, color=GREEN, linestyle="--", linewidth=1.3,
                           label=f"MER target ({tgt:.1f}x)", zorder=2)
        except (TypeError, ValueError):
            pass

    # Spend lines (right axis) — SECONDARY color
    if spd_cur:
        ax_spd.plot(x[:len(spd_cur)], spd_cur, color=SECONDARY, marker="s",
                    linewidth=2.0, label="Spend (current)", zorder=5)
    if spd_pri:
        ax_spd.plot(x[:len(spd_pri)], spd_pri, color=SECONDARY, marker="s",
                    linewidth=1.6, linestyle="--", alpha=0.55,
                    label="Spend (prior year)", zorder=4)

    ax_mer.set_xticks(x)
    ax_mer.set_xticklabels(periods)
    ax_mer.set_ylabel("MER (x)", color=PRIMARY)
    ax_spd.set_ylabel("Paid Spend ($)", color=SECONDARY)
    ax_spd.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax_mer.tick_params(axis="y", labelcolor=PRIMARY)
    ax_spd.tick_params(axis="y", labelcolor=SECONDARY)
    ax_mer.set_title(chart.get("title",
                               "MER vs Paid Spend — Current vs Prior Year"))
    ax_mer.grid(axis="x", visible=False)
    ax_spd.grid(False)

    # Floors at 0 with headroom
    all_mer = [v for v in (mer_cur + mer_pri) if v is not None]
    if target is not None:
        try:
            all_mer.append(float(target))
        except (TypeError, ValueError):
            pass
    if all_mer:
        ax_mer.set_ylim(0, max(all_mer) * 1.25)
    all_spd = [v for v in (spd_cur + spd_pri) if v is not None]
    if all_spd:
        ax_spd.set_ylim(0, max(all_spd) * 1.25)

    # Combined legend (both axes)
    h1, l1 = ax_mer.get_legend_handles_labels()
    h2, l2 = ax_spd.get_legend_handles_labels()
    ax_mer.legend(h1 + h2, l1 + l2, loc="upper center",
                  bbox_to_anchor=(0.5, -0.12),
                  ncol=min(5, len(h1) + len(h2)),
                  frameon=False, fontsize=8)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# ---------- New vs returning customer revenue per channel ----------
def new_vs_returning_revenue(chart: dict, period: str, out_dir: Path) -> None:
    """Grouped bar chart.

    - New customers = PRIMARY color
    - Returning customers = SECONDARY color
    - One pair of bars per channel on x-axis
    """
    channels = list(chart.get("channels") or [])
    new_rev = list(chart.get("new_customer_revenue") or [])
    ret_rev = list(chart.get("returning_customer_revenue") or [])

    if not channels or (not new_rev and not ret_rev):
        return _empty(chart, "no channels or revenue", out_dir, period)

    # Pad shorter arrays with 0 so we always have len(channels) values
    n = len(channels)
    new_vals = [float(new_rev[i]) if i < len(new_rev) and new_rev[i] is not None
                else 0.0 for i in range(n)]
    ret_vals = [float(ret_rev[i]) if i < len(ret_rev) and ret_rev[i] is not None
                else 0.0 for i in range(n)]

    x = list(range(n))
    w = 0.38
    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.55))

    ax.bar([i - w/2 for i in x], new_vals, w, label="New customers",
           color=PRIMARY, edgecolor="white")
    ax.bar([i + w/2 for i in x], ret_vals, w, label="Returning customers",
           color=SECONDARY, edgecolor="white")

    max_v = max([*new_vals, *ret_vals, 1])

    for i, (nv, rv) in enumerate(zip(new_vals, ret_vals)):
        if nv > 0:
            ax.text(i - w/2, nv + max_v * 0.01, f"${nv:,.0f}",
                    ha="center", va="bottom", fontsize=8, color="#222")
        if rv > 0:
            ax.text(i + w/2, rv + max_v * 0.01, f"${rv:,.0f}",
                    ha="center", va="bottom", fontsize=8, color="#222")

    ax.set_xticks(x)
    ax.set_xticklabels(channels)
    ax.set_ylabel("Revenue ($)")
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax.set_title(chart.get("title",
                           "New vs Returning Customer Revenue by Channel"))
    ax.legend(frameon=False, fontsize=9, loc="upper right")
    ax.grid(axis="x", visible=False)
    ax.set_ylim(0, max_v * 1.20)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


# =====================================================================
# v3 additions (per v3-quality-framework-addendum.md Section 4)
# =====================================================================


# ---------- Priority Action Impact × Effort (2×2 quadrant) ----------
def priority_action_impact_effort(chart: dict, period: str, out_dir: Path) -> None:
    """2×2 quadrant: Effort (X, Quick → Heavy) × Impact (Y, $ → $$$).

    - Effort: "Quick" → 1, "Medium" → 2, "Heavy" → 3 (midpoint x=2)
    - Impact: "$" → 1, "$$" → 2, "$$$" → 3 (midpoint y=2)

    Quadrants (with background tint):
      - top-left  (Quick, $$$)  = "Do First"      (greenest)
      - top-right (Heavy, $$$)  = "Plan For It"   (primary blue)
      - bot-left  (Quick, $)    = "Easy Wins"     (yellow)
      - bot-right (Heavy, $)    = "Probably Skip" (grayest)

    Each Priority Action plotted as a labeled dot; WHAT label truncated
    to 25 char with "..." suffix when longer.
    """
    actions = chart.get("actions") or []
    if not actions:
        return _empty(chart, "no actions", out_dir, period)

    effort_map = {"Quick": 1, "Medium": 2, "Heavy": 3}
    impact_map = {"$": 1, "$$": 2, "$$$": 3}

    fig, ax = plt.subplots(figsize=(FIG_W_IN, FIG_W_IN * 0.65))

    # Quadrant background tints (split at midpoint x=2, y=2)
    # Bounds 0.5 → 3.5 on each axis.
    ax.add_patch(plt.Rectangle((0.5, 2.0), 1.5, 1.5,
                               facecolor=GREEN, alpha=0.14, zorder=0))   # Do First
    ax.add_patch(plt.Rectangle((2.0, 2.0), 1.5, 1.5,
                               facecolor=PRIMARY, alpha=0.10, zorder=0))  # Plan For It
    ax.add_patch(plt.Rectangle((0.5, 0.5), 1.5, 1.5,
                               facecolor=YELLOW, alpha=0.10, zorder=0))   # Easy Wins
    ax.add_patch(plt.Rectangle((2.0, 0.5), 1.5, 1.5,
                               facecolor=NEUTRAL, alpha=0.16, zorder=0))  # Probably Skip

    # Quadrant labels (corners, away from dots)
    ax.text(0.6, 3.42, "Do First", fontsize=11, fontweight="bold",
            color=GREEN, va="top", ha="left", zorder=1)
    ax.text(3.42, 3.42, "Plan For It", fontsize=11, fontweight="bold",
            color=PRIMARY, va="top", ha="right", zorder=1)
    ax.text(0.6, 0.58, "Easy Wins", fontsize=11, fontweight="bold",
            color="#9A6E08", va="bottom", ha="left", zorder=1)
    ax.text(3.42, 0.58, "Probably Skip", fontsize=11, fontweight="bold",
            color="#555", va="bottom", ha="right", zorder=1)

    # Quadrant boundary lines
    ax.axvline(2.0, color="#666", lw=1, ls="--", zorder=1)
    ax.axhline(2.0, color="#666", lw=1, ls="--", zorder=1)

    # Plot each action as a labeled dot
    for a in actions:
        eff = a.get("effort", "Medium")
        imp = a.get("impact", "$$")
        x = effort_map.get(eff, 2)
        y = impact_map.get(imp, 2)
        label = (a.get("label") or "").strip()
        if len(label) > 25:
            label = label[:22] + "..."
        ax.scatter([x], [y], s=180, color=PRIMARY, edgecolors="white",
                   linewidths=1.5, zorder=5)
        ax.annotate(label, (x, y), xytext=(8, 8),
                    textcoords="offset points",
                    fontsize=9, color="#222", fontweight="bold", zorder=6)

    ax.set_xlim(0.5, 3.5)
    ax.set_ylim(0.5, 3.5)
    ax.set_xticks([1, 2, 3])
    ax.set_xticklabels(["Quick", "Medium", "Heavy"], fontsize=10, fontweight="bold")
    ax.set_yticks([1, 2, 3])
    # Escape $ to avoid matplotlib's TeX math-mode interpretation.
    ax.set_yticklabels([r"\$", r"\$\$", r"\$\$\$"], fontsize=11, fontweight="bold")
    ax.set_xlabel("Effort", fontsize=10)
    ax.set_ylabel("Impact", fontsize=10)
    ax.set_title(chart.get("title", "Priority Actions — Impact × Effort"))
    ax.grid(False)

    _footer(fig, period)
    _save(fig, out_dir, chart["key"])


DISPATCH = {
    "spend_roas_bubble": spend_roas_bubble,
    "channel_mix_yoy": channel_mix_yoy,
    "attribution_gap": attribution_gap,
    "cvr_bounce_yoy": cvr_bounce_yoy,
    "frequency_by_campaign": frequency_by_campaign,
    # v2 funnel-health additions
    "funnel_stage_mix": funnel_stage_mix,
    "mer_vs_spend_trend": mer_vs_spend_trend,
    "new_vs_returning_revenue": new_vs_returning_revenue,
    # v3 additions
    "priority_action_impact_effort": priority_action_impact_effort,
}


def run_spec(spec: dict, out_dir: Path) -> list[Path]:
    period = spec.get("period_label", "")
    results: list[Path] = []
    for chart in spec.get("charts", []):
        fn = DISPATCH.get(chart.get("type"))
        if not fn:
            print(f"[warn] unknown chart type '{chart.get('type')}' "
                  f"(key={chart.get('key')})", file=sys.stderr)
            continue
        try:
            fn(chart, period, out_dir)
            results.append(out_dir / f"{chart.get('key')}.png")
        except Exception as e:
            print(f"[error] chart '{chart.get('key')}' failed: {e}", file=sys.stderr)
    return results


SELFTEST_SPEC: dict[str, Any] = {
    "period_label": "2026-03-15 to 2026-04-13",
    "charts": [
        {"type": "spend_roas_bubble", "key": "google_spend_roas",
         "title": "Google Ads: Spend vs. ROAS by Campaign",
         "break_even": 4.0, "target": 5.0,
         "data": [{"name": "PMax - Best Sellers", "spend": 907, "roas": 6.96},
                  {"name": "Brand - Exact", "spend": 412, "roas": 9.1},
                  {"name": "Non-Brand - Broad", "spend": 1320, "roas": 3.1},
                  {"name": "Shopping - All", "spend": 660, "roas": 4.4},
                  {"name": "Display - Remarketing", "spend": 240, "roas": 2.0}]},
        {"type": "channel_mix_yoy", "key": "ga4_channel_mix",
         "title": "GA4 Session Share by Channel",
         "current": {"Direct": 24365, "Organic Search": 7682, "Paid Search": 5120,
                     "Paid Social": 3200, "Email": 2100, "Referral": 900},
         "prior": {"Direct": 5125, "Organic Search": 8900, "Paid Search": 6400,
                   "Paid Social": 5800, "Email": 1800, "Referral": 750}},
        {"type": "attribution_gap", "key": "attribution_gap",
         "title": "Platform Claims vs GA4 Attribution",
         "data": [{"channel": "Google Ads", "platform": 22316, "ga4": 13088},
                  {"channel": "Meta Ads", "platform": 17778, "ga4": 1414},
                  {"channel": "TikTok Ads", "platform": 4210, "ga4": 980}]},
        {"type": "cvr_bounce_yoy", "key": "ga4_quality",
         "title": "GA4 Traffic Quality YoY",
         "current": {"cvr": 0.00187, "bounce": 0.7175},
         "prior": {"cvr": 0.00459, "bounce": 0.3506}},
        {"type": "frequency_by_campaign", "key": "meta_frequency",
         "title": "Meta Campaign Frequency",
         "data": [{"campaign": "Sales | B2B Ecom", "frequency": 5.38},
                  {"campaign": "Prospecting | Broad", "frequency": 1.9},
                  {"campaign": "Retargeting | 30d", "frequency": 3.6},
                  {"campaign": "ASC | Advantage+", "frequency": 2.3},
                  {"campaign": "Catalog Sales", "frequency": 4.7}]},
        # v2 funnel-health additions — selftest cases stress-test the dual encoding,
        # the long-KPI-label wrap rule (>12 char), and the multi-channel x-axis.
        {"type": "funnel_stage_mix", "key": "funnel_stage_mix",
         "title": "Funnel Stage Mix — Spend Share + KPI Grade",
         "stages": [
             {"role": "TOF", "spend_share_pct": 38,
              "primary_kpi_label": "CPATC", "primary_kpi_value": "$28",
              "kpi_grade": "Healthy"},
             {"role": "MOF", "spend_share_pct": 27,
              "primary_kpi_label": "ATC->Checkout", "primary_kpi_value": "42%",
              "kpi_grade": "Concerning"},
             {"role": "BOF", "spend_share_pct": 35,
              "primary_kpi_label": "ROAS", "primary_kpi_value": "4.2x",
              "kpi_grade": "Healthy"},
         ]},
        {"type": "mer_vs_spend_trend", "key": "mer_vs_spend_trend",
         "title": "MER vs Paid Spend — Current vs Prior Year",
         "periods": ["Jan", "Feb", "Mar", "Apr"],
         "mer_current": [3.4, 3.2, 3.0, 2.9],
         "mer_prior_year": [3.0, 3.1, 3.2, 3.3],
         "spend_current": [12000, 13500, 16200, 18000],
         "spend_prior_year": [10000, 11200, 11800, 12100],
         "mer_target": 2.8},
        {"type": "new_vs_returning_revenue", "key": "new_vs_returning_revenue",
         "title": "New vs Returning Customer Revenue by Channel",
         "channels": ["Meta Ads", "Google Ads", "Email", "Direct", "Organic"],
         "new_customer_revenue": [18400, 12800, 2100, 6300, 4200],
         "returning_customer_revenue": [3200, 5400, 14600, 8900, 3100]},
        # v3 addition — exercise the Priority Action quadrant. Spec values
        # mirror the example payload in v3-quality-framework-addendum.md
        # Section 4.2.
        {"type": "priority_action_impact_effort",
         "key": "priority_action_impact_effort",
         "title": "Priority Actions — Impact × Effort",
         "actions": [
             # Do First (Quick + $$$)
             {"label": "Pause Spring Hero v2", "effort": "Quick", "impact": "$$$"},
             # Plan For It (Heavy + $$$)
             {"label": "Rebuild attribution stack", "effort": "Heavy", "impact": "$$$"},
             # Easy Wins (Quick + $)
             {"label": "Fix UTM tagging on Email", "effort": "Quick", "impact": "$"},
             # Probably Skip (Heavy + $)
             {"label": "Refactor legacy Display campaigns", "effort": "Heavy", "impact": "$"},
             # Mid-grid sample (Medium + $$)
             {"label": "Test 3 hooks vs LAL 1%", "effort": "Medium", "impact": "$$"},
         ]},
    ],
}


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate audit PNG charts.")
    ap.add_argument("--spec", help="Path to JSON spec file")
    ap.add_argument("--out", help="Output directory for PNGs")
    ap.add_argument("--selftest", action="store_true",
                    help="Render all chart types with fake data to ./chart_selftest/")
    args = ap.parse_args()

    if args.selftest:
        out = Path("./chart_selftest")
        results = run_spec(SELFTEST_SPEC, out)
        print(f"[ok] wrote {len(results)} charts to {out.resolve()}")
        return 0

    if not args.spec or not args.out:
        ap.error("--spec and --out are required (or use --selftest)")

    spec_path = Path(args.spec)
    if not spec_path.exists():
        print(f"[error] spec not found: {spec_path}", file=sys.stderr)
        return 2
    with spec_path.open() as f:
        spec = json.load(f)

    out = Path(args.out)
    results = run_spec(spec, out)
    print(f"[ok] wrote {len(results)} charts to {out.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
