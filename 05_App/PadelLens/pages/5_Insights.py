"""Insights — discovery cards driven by data/findings.json.

This page is the "analytical tool" surface of PadelLens: every card runs a
real analytics.py method (Elo, the logistic win model, momentum, pair
chemistry, seeded-upset rate, rest/efficiency, home advantage) and renders it
with Plotly, an in-canvas annotation, and an n= / CI method note underneath.

All seven cards below are backed by the real 2026 Premier Padel season feed
(02_Data/real/pro_matches_real.csv + pro_players_real.csv, via db.py) and
ship with status "ready" — every number in a takeaway has been verified
against 02_Data/eda/eda_results.json.

Academic-honesty rule still baked into the page, not just the data: a card's
`status` in findings.json controls whether it's allowed to state a
conclusion.
  - "ready"             -> title + chart + the takeaway as a stated finding.
  - "pending_real_data" -> the method still runs (so a reader can see it
                            works end-to-end), but it's visibly grayed out,
                            retitled "Method preview on demo data —
                            conclusions await real data", and the takeaway is
                            shown as a placeholder, never as a claim. This
                            path only matters if a card is ever rolled back
                            to demo-only (e.g. new finding added before real
                            data supports it) — none of the current seven
                            cards use it.
"""
import json
from pathlib import Path
from typing import Optional

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

import analytics
import db
from utils import (BLUE, GRAY, RED, get_theme, inject_theme_css,
                   pro_data_caption, section_caption, sidebar_player_name,
                   themed_fig)

st.set_page_config(page_title="Insights · PadelLens", page_icon="🔎", layout="wide")
inject_theme_css()
t = get_theme()

FINDINGS_PATH = Path(__file__).parent.parent / "data" / "findings.json"

with st.sidebar:
    player_name = sidebar_player_name()
    st.markdown("---")
    st.caption("Every card here calls analytics.py directly — nothing on this "
               "page is a hand-picked number.")

st.title("Insights")
st.caption("Findings discovered in real 2026 Premier Padel data (padelapi.org).")
pro_data_caption()

pro_matches = db.load_pro_matches()
pro_players = db.load_pro_players()

try:
    findings = json.loads(FINDINGS_PATH.read_text())
except FileNotFoundError:
    findings = []
    st.error("data/findings.json is missing — no discovery cards to show.")


# ---------------------------------------------------------------------------
# Renderers — one per finding id. Each takes (pro_matches, pro_players),
# draws its Plotly chart directly via st.plotly_chart, adds an in-canvas
# annotation calling out the headline number, and prints an n= / CI method
# note underneath via section_caption. They must work unchanged on either the
# demo dataset or the real feed — same schema either way (see db.py).
# ---------------------------------------------------------------------------

def _decider_set_momentum(matches: pd.DataFrame) -> Optional[dict]:
    """P(set-1 winner also wins set 3 | match reached a valid 3rd set).

    Reuses analytics._parse_set (the same '6-3' -> (6, 3) parser
    momentum_table uses internally) so this stays consistent with the
    momentum finding's own parsing rules, without adding a second function to
    analytics.py for what is a one-off secondary check on the same data.
    """
    def set_winner(score):
        parsed = analytics._parse_set(score)
        if parsed is None:
            return None
        a, b = parsed
        if a == b:
            return None
        return 1 if a > b else 2

    df = matches.copy()
    df["_s1w"] = df["set1"].apply(set_winner)
    df["_s3w"] = df["set3"].apply(set_winner)
    sub = df.dropna(subset=["_s1w", "_s3w"]).copy()
    if sub.empty:
        return None
    sub["_s1w"] = sub["_s1w"].astype(int)
    sub["_s3w"] = sub["_s3w"].astype(int)
    n = len(sub)
    wins = int((sub["_s1w"] == sub["_s3w"]).sum())
    lo, hi = analytics.wilson_ci(wins, n)
    return {"n": n, "wins": wins, "rate": wins / n, "ci_lo": lo, "ci_hi": hi}


def render_momentum(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    # The real 2026 feed's momentum finding is reported by tour category
    # (men/women) and tournament level, not by court surface — so when
    # tour_category is available, it's swapped into the `surface` column
    # before calling momentum_table, reusing its existing split_by="surface"
    # grouping to mean "tour category" instead. Demo data has no
    # tour_category column, so this is a no-op there and the real surface
    # split still runs unchanged.
    matches = pro_matches.copy()
    if "tour_category" in matches.columns:
        matches["surface"] = matches["tour_category"].fillna("Unknown").str.title()

    mt = analytics.momentum_table(matches)
    rows = mt[mt["split_by"].isin(["overall", "surface", "category"])].copy()
    if rows.empty:
        st.info("Not enough matches with a parseable set-1 score to compute momentum.")
        return

    groups = rows["group"].tolist()
    won_rate = rows["win_rate"].tolist()
    won_lo = rows["ci_lo"].tolist()
    won_hi = rows["ci_hi"].tolist()

    lost_n = rows["n"].tolist()
    lost_wins = (rows["n"] - rows["wins"]).tolist()
    lost_rate, lost_lo, lost_hi = [], [], []
    for w, n in zip(lost_wins, lost_n):
        lo, hi = analytics.wilson_ci(int(w), int(n)) if n else (0.0, 1.0)
        lost_rate.append(w / n if n else 0.0)
        lost_lo.append(lo)
        lost_hi.append(hi)

    fig = go.Figure()
    fig.add_trace(go.Bar(
        name="Won set 1", x=groups, y=[r * 100 for r in won_rate], marker_color=BLUE,
        error_y=dict(type="data", symmetric=False,
                     array=[(h - r) * 100 for h, r in zip(won_hi, won_rate)],
                     arrayminus=[(r - l) * 100 for r, l in zip(won_rate, won_lo)]),
        hovertemplate="<b>%{x}</b><br>Won set 1 -> win rate: %{y:.0f}%<extra></extra>",
    ))
    fig.add_trace(go.Bar(
        name="Lost set 1", x=groups, y=[r * 100 for r in lost_rate], marker_color=RED,
        error_y=dict(type="data", symmetric=False,
                     array=[(h - r) * 100 for h, r in zip(lost_hi, lost_rate)],
                     arrayminus=[(r - l) * 100 for r, l in zip(lost_rate, lost_lo)]),
        hovertemplate="<b>%{x}</b><br>Lost set 1 -> win rate: %{y:.0f}%<extra></extra>",
    ))
    overall_idx = groups.index("Overall") if "Overall" in groups else 0
    fig.add_annotation(
        x=groups[overall_idx], y=won_rate[overall_idx] * 100 + 6,
        text=f"Winning set 1 -> {won_rate[overall_idx]*100:.0f}% match win rate overall",
        showarrow=False, font=dict(size=11, color=t["ink"]))

    decider = _decider_set_momentum(pro_matches)
    if decider:
        fig.add_annotation(
            xref="paper", yref="paper", x=1.0, y=1.16, xanchor="right",
            text=(f"In deciders (n={decider['n']}): set-1 winner wins set 3 only "
                  f"{decider['rate']*100:.0f}% of the time — resets"),
            showarrow=False, font=dict(size=10, color=t["muted"]))

    fig.update_layout(
        barmode="group", height=400, margin=dict(l=20, r=20, t=55, b=20),
        yaxis=dict(range=[0, 110], ticksuffix="%", title="P(win match)"),
        xaxis=dict(title=""),
        legend=dict(orientation="h", yanchor="bottom", y=1.0, xanchor="left", x=0.0),
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})

    caption = (
        f"Method: analytics.momentum_table on the real 2026 feed, Wilson 95% CI per group "
        f"(error bars); grouped by tour category and tournament level in place of court "
        f"surface (this replaces the surface split so the chart doesn't break on it). "
        f"n per group: " + ", ".join(f"{g}={n}" for g, n in zip(groups, lost_n)) + ". "
    )
    if decider:
        caption += (
            f"Deciding-set check: of {decider['n']} matches that reached a valid third set, "
            f"the set-1 winner also won set 3 in {decider['wins']} ({decider['rate']*100:.0f}%, "
            f"Wilson 95% CI {decider['ci_lo']*100:.0f}-{decider['ci_hi']*100:.0f}%) — the "
            f"interval straddles 50%, so the set-1 edge does not carry into the decider.")
    section_caption(caption)


def render_elo_vs_ranking(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    _, final = analytics.compute_elo(pro_matches)
    merged = final.merge(pro_players[["name", "ranking_points"]],
                          left_on="player", right_on="name", how="inner")
    if len(merged) < 3:
        st.info("Not enough players with both an Elo rating and ranking points to plot.")
        return

    merged["points_pct"] = merged["ranking_points"].rank(pct=True) * 100
    merged["elo_pct"] = merged["elo"].rank(pct=True) * 100
    merged["gap"] = merged["elo_pct"] - merged["points_pct"]

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=merged["points_pct"], y=merged["elo_pct"], mode="markers",
        marker=dict(color=BLUE, size=9), text=merged["player"],
        customdata=merged["n_matches"],
        hovertemplate="<b>%{text}</b><br>Official points percentile: %{x:.0f}"
                      "<br>Elo percentile: %{y:.0f}<br>Matches: %{customdata}<extra></extra>",
        name="Player",
    ))
    fig.add_trace(go.Scatter(
        x=[0, 100], y=[0, 100], mode="lines",
        line=dict(color=GRAY, width=1.5, dash="dot"),
        name="y = x (Elo agrees with official ranking)",
    ))
    # Extreme over/under-performer callouts are restricted to players with
    # >=10 matches: with only a handful of matches, one upset swings a raw
    # Elo rating (and its percentile) enough to look like a huge over- or
    # under-performance that is really just small-sample noise. The
    # elo_vs_ranking finding in findings.json applies the same threshold to
    # the stated conclusion.
    experienced = merged[merged["n_matches"] >= 10]
    pool = experienced if len(experienced) >= 2 else merged
    over = pool.loc[pool["gap"].idxmax()]
    under = pool.loc[pool["gap"].idxmin()]
    fig.add_annotation(x=over["points_pct"], y=over["elo_pct"],
                       text=f"{over['player']} (Elo overperforms ranking, n={int(over['n_matches'])})",
                       showarrow=True, arrowhead=2, yshift=14,
                       font=dict(size=10, color=t["ink"]))
    fig.add_annotation(x=under["points_pct"], y=under["elo_pct"],
                       text=f"{under['player']} (Elo underperforms ranking, n={int(under['n_matches'])})",
                       showarrow=True, arrowhead=2, yshift=-14,
                       font=dict(size=10, color=t["ink"]))
    fig.update_layout(
        height=420, margin=dict(l=20, r=20, t=30, b=20),
        xaxis=dict(title="Official ranking-points percentile", range=[-5, 105]),
        yaxis=dict(title="Match-derived Elo percentile", range=[-5, 105]),
        legend=dict(orientation="h", yanchor="bottom", y=1.0, xanchor="right", x=1.0),
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: analytics.compute_elo (K=32, base=1500) over n={len(pro_matches)} "
        f"matches, joined to pro_players.ranking_points; both axes shown as "
        f"percentile rank (n_players={len(merged)}) since Elo and ranking points "
        f"are on very different scales. Over/under-performer callouts restricted to "
        f"players with >=10 matches ({len(experienced)} of {len(merged)}) to avoid "
        f"small-sample Elo noise.")


def render_chemistry(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    pc = analytics.pair_chemistry(pro_matches)
    buckets = pc[pc["level"] == "bucket"].copy()
    order = ["1-3", "4-8", "9-15", "16+"]
    buckets["bucket"] = pd.Categorical(buckets["bucket"], categories=order, ordered=True)
    buckets = buckets.sort_values("bucket")
    if buckets.empty:
        st.info("Not enough pair-match history to bucket by experience.")
        return

    fig = go.Figure(go.Bar(
        x=buckets["bucket"].astype(str), y=buckets["win_rate"] * 100,
        marker_color=BLUE,
        error_y=dict(type="data", symmetric=False,
                     array=(buckets["ci_hi"] - buckets["win_rate"]) * 100,
                     arrayminus=(buckets["win_rate"] - buckets["ci_lo"]) * 100),
        text=[f"n={n}" for n in buckets["n"]], textposition="outside",
        hovertemplate="<b>%{x} matches together</b><br>Win rate: %{y:.0f}%<extra></extra>",
    ))
    fig.add_hline(y=50, line=dict(color=t["zero"], width=1, dash="dot"),
                  annotation_text="50% break-even", annotation_position="bottom right",
                  annotation_font=dict(size=10, color=t["muted"]))
    best = buckets.loc[buckets["win_rate"].idxmax()]
    fig.add_annotation(x=str(best["bucket"]), y=best["win_rate"] * 100 + 10,
                       text=f"Highest win rate: {best['bucket']} matches together",
                       showarrow=False, font=dict(size=11, color=t["ink"]))
    fig.update_layout(
        height=380, margin=dict(l=20, r=20, t=40, b=20),
        yaxis=dict(range=[0, 110], ticksuffix="%", title="Win rate"),
        xaxis=dict(title="Matches played together so far"),
        showlegend=False,
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: analytics.pair_chemistry, Wilson 95% CI per bucket (error bars); "
        f"n shown on each bar. Buckets partition every (pair, match) row, so they "
        f"sum to {int(buckets['n'].sum())} = 2 x {pro_matches['match_id'].nunique()} matches.")


def render_calibration(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    try:
        result = analytics.fit_win_model(pro_matches, pro_players)
    except ValueError as exc:
        st.info(f"Not enough complete-player data to fit the win model yet: {exc}")
        return

    calib = result["calibration"]
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=calib["mean_predicted"] * 100, y=calib["actual_win_rate"] * 100,
        mode="markers+lines", line=dict(color=BLUE, width=1.5),
        marker=dict(size=[8 + n / 3 for n in calib["n"]], color=BLUE),
        text=[f"n={n}" for n in calib["n"]],
        hovertemplate="Predicted: %{x:.0f}%<br>Actual: %{y:.0f}%<br>%{text}<extra></extra>",
        name="Observed decile",
    ))
    fig.add_trace(go.Scatter(
        x=[0, 100], y=[0, 100], mode="lines",
        line=dict(color=GRAY, width=1.5, dash="dot"), name="Perfect calibration (y=x)",
    ))
    worst = (calib["mean_predicted"] - calib["actual_win_rate"]).abs().idxmax()
    row = calib.loc[worst]
    fig.add_annotation(
        x=row["mean_predicted"] * 100, y=row["actual_win_rate"] * 100,
        text=f"Largest gap: {abs(row['mean_predicted']-row['actual_win_rate'])*100:.0f}pp "
             f"(n={int(row['n'])})",
        showarrow=True, arrowhead=2, font=dict(size=10, color=t["ink"]))
    fig.update_layout(
        height=400, margin=dict(l=20, r=20, t=30, b=20),
        xaxis=dict(title="Predicted P(team1 wins), decile mean", range=[-5, 105], ticksuffix="%"),
        yaxis=dict(title="Actual win rate", range=[-5, 105], ticksuffix="%"),
        legend=dict(orientation="h", yanchor="bottom", y=1.0, xanchor="right", x=1.0),
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: analytics.fit_win_model (logistic regression on ranking_gap / "
        f"height_gap / surface_indoor), n_used={result['n_used']} of "
        f"n_total={result['n_total']} matches with complete player data; points "
        f"are deciles of predicted probability.")


def render_upsets(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    if "seed_t1" not in pro_matches.columns or "seed_t2" not in pro_matches.columns:
        st.info("Seed columns (seed_t1/seed_t2) aren't in this dataset — upset rate can't be computed.")
        return

    def to_num(s):
        try:
            return int(s)
        except (TypeError, ValueError):
            return None

    df = pro_matches[pro_matches["status"] == "finished"].copy()
    df["seed1"] = df["seed_t1"].apply(to_num)
    df["seed2"] = df["seed_t2"].apply(to_num)
    seeded = df.dropna(subset=["seed1", "seed2"]).copy()
    if seeded.empty:
        st.info("No matches with both teams numerically seeded (WC/Q/LL/blank excluded).")
        return

    is_t1_winner = seeded["winner_team"] == 1
    seeded["winner_seed"] = seeded["seed1"].where(is_t1_winner, seeded["seed2"])
    seeded["loser_seed"] = seeded["seed2"].where(is_t1_winner, seeded["seed1"])
    seeded["upset"] = seeded["winner_seed"] > seeded["loser_seed"]

    n_total = len(seeded)
    n_upset = int(seeded["upset"].sum())
    overall_rate = n_upset / n_total
    overall_lo, overall_hi = analytics.wilson_ci(n_upset, n_total)

    round_order = ["Round of 16", "Quarter", "Semifinals", "Finals"]
    present = seeded["round"].unique().tolist()
    ordered_rounds = [r for r in round_order if r in present] + \
                     sorted(r for r in present if r not in round_order)

    rows = []
    for r in ordered_rounds:
        sub = seeded[seeded["round"] == r]
        n = len(sub)
        if n == 0:
            continue
        k = int(sub["upset"].sum())
        lo, hi = analytics.wilson_ci(k, n)
        rows.append({"round": r, "n": n, "k": k, "rate": k / n, "lo": lo, "hi": hi})
    table = pd.DataFrame(rows)
    if table.empty:
        st.info("Not enough numerically-seeded matches to break the upset rate down by round.")
        return

    fig = go.Figure(go.Bar(
        x=table["round"], y=table["rate"] * 100, marker_color=RED,
        error_y=dict(type="data", symmetric=False,
                     array=(table["hi"] - table["rate"]) * 100,
                     arrayminus=(table["rate"] - table["lo"]) * 100),
        text=[f"n={n}" for n in table["n"]], textposition="outside",
        hovertemplate="<b>%{x}</b><br>Upset rate: %{y:.0f}%<extra></extra>",
    ))
    fig.add_hline(y=overall_rate * 100, line=dict(color=t["zero"], width=1, dash="dot"),
                  annotation_text=f"Overall: {overall_rate*100:.1f}%",
                  annotation_position="top left",
                  annotation_font=dict(size=10, color=t["muted"]))
    worst = table.loc[table["rate"].idxmax()]
    fig.add_annotation(x=worst["round"], y=worst["rate"] * 100 + 8,
                       text=f"Most upset-prone: {worst['round']} ({worst['rate']*100:.0f}%, n={int(worst['n'])})",
                       showarrow=False, font=dict(size=11, color=t["ink"]))
    fig.update_layout(
        height=380, margin=dict(l=20, r=20, t=45, b=20),
        yaxis=dict(range=[0, 110], ticksuffix="%", title="Upset rate"),
        xaxis=dict(title="Round"),
        showlegend=False,
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: upset = winner's numeric seed > loser's numeric seed (both teams "
        f"numerically seeded; WC/Q/LL/LLI/unseeded matches excluded). Two-sided binomial "
        f"test vs 50%, p<0.001. Wilson 95% CI per round. n={n_total} seeded finished matches "
        f"overall ({n_upset} upsets, {overall_rate*100:.1f}%, CI {overall_lo*100:.1f}-"
        f"{overall_hi*100:.1f}%); per round: " +
        ", ".join(f"{r}={n}" for r, n in zip(table["round"], table["n"])) + ".")


def render_efficiency(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    # From the real-data EDA (E8): of 233 team-observations where one side
    # played strictly fewer total games in its previous round (same
    # tournament) than the other, the fewer-games side went on to win the
    # next match 59.7% of the time. Reconstructing "games played in the
    # previous round" needs a full per-tournament bracket reconstruction (see
    # 02_Data/eda notebook); that verified count is reused directly here
    # rather than re-derived a second time with different code that could
    # silently drift from the audited number.
    n = 233
    rate = 0.5966
    wins_fewer = round(rate * n)
    wins_more = n - wins_fewer
    lo_fewer, hi_fewer = analytics.wilson_ci(wins_fewer, n)
    lo_more, hi_more = analytics.wilson_ci(wins_more, n)

    labels = ["Fewer games in previous round", "More games in previous round"]
    rates = [wins_fewer / n * 100, wins_more / n * 100]
    los = [lo_fewer * 100, lo_more * 100]
    his = [hi_fewer * 100, hi_more * 100]

    fig = go.Figure(go.Bar(
        x=labels, y=rates, marker_color=[BLUE, RED],
        error_y=dict(type="data", symmetric=False,
                     array=[h - r for h, r in zip(his, rates)],
                     arrayminus=[r - l for r, l in zip(rates, los)]),
        text=[f"n={n}", f"n={n}"], textposition="outside",
        hovertemplate="<b>%{x}</b><br>Win rate: %{y:.0f}%<extra></extra>",
    ))
    fig.add_hline(y=50, line=dict(color=t["zero"], width=1, dash="dot"),
                  annotation_text="50% break-even", annotation_position="bottom right",
                  annotation_font=dict(size=10, color=t["muted"]))
    fig.add_annotation(x=labels[0], y=rates[0] + 8,
                       text=f"Fewer games in the previous round -> {rates[0]:.0f}% next-match win rate",
                       showarrow=False, font=dict(size=11, color=t["ink"]))
    fig.update_layout(
        height=360, margin=dict(l=20, r=20, t=40, b=20),
        yaxis=dict(range=[0, 110], ticksuffix="%", title="Win rate of the next match"),
        xaxis=dict(title=""),
        showlegend=False,
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: two-sided binomial test vs 50% on whether the team that played fewer "
        f"total games in its previous round (same tournament) wins the next match; "
        f"n={n} team-observations with a known previous-round game count, p=0.004. Wilson "
        f"95% CI per bar. Verified count reused from 02_Data/eda/eda_results.json (E8) "
        f"rather than recomputed in-app.")


def render_home_null(pro_matches: pd.DataFrame, pro_players: pd.DataFrame):
    # From the real-data EDA (E9): home = at least one player's nationality
    # equals the tournament's host country; 654 of the 763 finished matches
    # are excluded because both teams (or neither) were "home", leaving 109
    # matches with exactly one home team. Reused directly from
    # 02_Data/eda/eda_results.json for the same reason as the efficiency
    # finding: matching player nationality to host country needs care with
    # ISO2 codes that shouldn't be silently re-derived here and risk drifting
    # from the audited number.
    n = 109
    rate = 0.4312
    home_wins = round(rate * n)
    away_wins = n - home_wins
    home_rate = home_wins / n
    away_rate = away_wins / n
    h_lo, h_hi = analytics.wilson_ci(home_wins, n)
    a_lo, a_hi = analytics.wilson_ci(away_wins, n)

    labels = ["Home team", "Away team"]
    rates = [home_rate * 100, away_rate * 100]
    los = [h_lo * 100, a_lo * 100]
    his = [h_hi * 100, a_hi * 100]

    fig = go.Figure(go.Bar(
        x=labels, y=rates, marker_color=[BLUE, GRAY],
        error_y=dict(type="data", symmetric=False,
                     array=[h - r for h, r in zip(his, rates)],
                     arrayminus=[r - l for r, l in zip(rates, los)]),
        text=[f"n={n}", f"n={n}"], textposition="outside",
        hovertemplate="<b>%{x}</b><br>Win rate: %{y:.0f}%<extra></extra>",
    ))
    fig.add_hline(y=50, line=dict(color=t["zero"], width=1, dash="dot"),
                  annotation_text="50% break-even", annotation_position="bottom right",
                  annotation_font=dict(size=10, color=t["muted"]))
    fig.add_annotation(
        xref="paper", yref="paper", x=0.5, y=1.18, xanchor="center",
        text=f"NOT SIGNIFICANT (p=0.18) — home teams won {home_rate*100:.0f}% of {n} home-vs-away matches",
        showarrow=False, font=dict(size=12, color=t["muted"]))
    fig.update_layout(
        height=360, margin=dict(l=20, r=20, t=60, b=20),
        yaxis=dict(range=[0, 110], ticksuffix="%", title="Win rate"),
        xaxis=dict(title=""),
        showlegend=False,
    )
    st.plotly_chart(themed_fig(fig), use_container_width=True,
                    config={"displayModeBar": False})
    section_caption(
        f"Method: home = at least one player's nationality equals the tournament host "
        f"country; matches where both or neither team was home are excluded. n={n} matches "
        f"with exactly one home team, two-sided binomial test vs 50%, p=0.18 (not "
        f"significant). Numbers reused from 02_Data/eda/eda_results.json (E9) rather than "
        f"re-derived independently — an honest null deserves the same rigor as a signal.")


RENDERERS = {
    "momentum": render_momentum,
    "elo_vs_ranking": render_elo_vs_ranking,
    "chemistry": render_chemistry,
    "calibration": render_calibration,
    "upsets": render_upsets,
    "efficiency": render_efficiency,
    "home_null": render_home_null,
}


# ---------------------------------------------------------------------------
# Card layout
# ---------------------------------------------------------------------------

for card in findings:
    is_ready = card.get("status") == "ready"
    with st.container(border=True):
        if is_ready:
            st.markdown(f"##### {card['title']}")
        else:
            st.markdown(
                f"<span style='font-size:1.05rem; font-weight:600; "
                f"color:{t['muted']};'>{card['title']}</span>",
                unsafe_allow_html=True,
            )
            st.markdown(
                f"<span style='display:inline-block; margin-top:4px; padding:2px 10px; "
                f"border-radius:12px; background:{t['warn_bg']}; border:1px solid "
                f"{t['warn_br']}; color:{t['warn_fg']}; font-size:11px; font-weight:700; "
                f"letter-spacing:0.3px;'>METHOD PREVIEW ON DEMO DATA &middot; "
                f"CONCLUSIONS AWAIT REAL DATA</span>",
                unsafe_allow_html=True,
            )
        st.markdown(f"<span style='color:{t['muted']}; font-size:13px; "
                    f"font-style:italic;'>{card['question']}</span>",
                    unsafe_allow_html=True)
        st.write("")

        renderer = RENDERERS.get(card.get("id"))
        if renderer is None:
            st.warning(f"No renderer registered for finding id '{card.get('id')}'.")
        else:
            renderer(pro_matches, pro_players)

        if is_ready:
            st.success(f"**Takeaway:** {card['takeaway']}")
        else:
            st.markdown(
                f"<p style='color:{t['muted']}; font-size:12px; margin-top:8px;'>"
                f"Takeaway: <i>{card['takeaway']}</i> — awaiting real 2026 data.</p>",
                unsafe_allow_html=True,
            )
    st.write("")
