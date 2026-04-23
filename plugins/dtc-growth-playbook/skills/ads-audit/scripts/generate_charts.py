#!/usr/bin/env python3
"""
generate_charts.py — Chart generator for ads-audit / databox-audit skills.

Produces PNG charts (300 DPI, 1600px wide) used by DTC marketing audit skills
when building .docx deliverables. Two identical copies of this file live in
the two skill sources; edit BOTH when changing.

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
     "data": [{"campaign": "...", "frequency": 5.38}, ...]}
  ]
}

Output filenames: `{chart_key}.png`. Empty data -> warning + skip (no crash).
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


def _empty(chart: dict, reason: str) -> None:
    print(f"[warn] skip '{chart.get('key','?')}' ({chart.get('type','?')}): {reason}",
          file=sys.stderr)


# ---------- spend vs ROAS bubble ----------
def spend_roas_bubble(chart: dict, period: str, out_dir: Path) -> None:
    data = chart.get("data") or []
    if not data:
        return _empty(chart, "no data")

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
        return _empty(chart, "no current or prior data")

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
        return _empty(chart, "no data")

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
        return _empty(chart, "no current or prior data")

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
        return _empty(chart, "no data")

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


DISPATCH = {
    "spend_roas_bubble": spend_roas_bubble,
    "channel_mix_yoy": channel_mix_yoy,
    "attribution_gap": attribution_gap,
    "cvr_bounce_yoy": cvr_bounce_yoy,
    "frequency_by_campaign": frequency_by_campaign,
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
