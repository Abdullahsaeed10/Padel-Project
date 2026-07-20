"""Tests for analytics.py.

Fixtures marked "TEST FIXTURE" below are hand-constructed synthetic data with
known correct answers, built specifically so the expected result can be
computed by hand (or from an independent formula) and is not just "whatever
the code currently produces". The win-model test is the one exception: it
runs on the real bundled CSVs end-to-end, since the professor's ask was
partly "does this actually work on real data".

Run with: pytest tests/test_analytics.py -v
"""
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from analytics import (
    wilson_ci,
    compute_elo,
    fit_win_model,
    momentum_table,
    player_archetypes,
    pair_chemistry,
)

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


# ---------------------------------------------------------------------------
# 1. wilson_ci
# ---------------------------------------------------------------------------

def test_wilson_ci_known_value():
    """8 wins out of 10, z=1.96 -> a hand-computable Wilson interval.

    Worked by hand from the closed-form formula:
      centre = (p + z^2/2n) / (1 + z^2/n),  margin = z*sqrt(p(1-p)/n + z^2/4n^2) / (1 + z^2/n)
    with p=0.8, n=10, z=1.96 gives lo=0.49016, hi=0.94332 (double-checked with
    an independent script, see task notes). This is also the commonly-cited
    textbook example for the Wilson interval at n=10, 80% observed rate.
    """
    lo, hi = wilson_ci(8, 10, z=1.96)
    assert lo == pytest.approx(0.49016, abs=1e-4)
    assert hi == pytest.approx(0.94332, abs=1e-4)


def test_wilson_ci_bounds_always_in_unit_interval():
    """Even extreme p-hat (0/n or n/n) must stay inside [0, 1] — this is
    exactly the failure mode of the naive Wald interval that Wilson fixes."""
    for wins, n in [(0, 5), (5, 5), (1, 3), (2, 3), (100, 100), (0, 1)]:
        lo, hi = wilson_ci(wins, n)
        assert 0.0 <= lo <= hi <= 1.0


def test_wilson_ci_zero_trials_is_maximally_uninformative():
    lo, hi = wilson_ci(0, 0)
    assert (lo, hi) == (0.0, 1.0)


def test_wilson_ci_rejects_invalid_wins():
    with pytest.raises(ValueError):
        wilson_ci(6, 5)


# ---------------------------------------------------------------------------
# 2. compute_elo
# ---------------------------------------------------------------------------

def _synthetic_matches() -> pd.DataFrame:
    """TEST FIXTURE: 4 players (A,B,C,D), 3 matches, deterministic order.

    Match 1: (A,B) beat (C,D) on 2024-01-01
    Match 2: (A,C) beat (B,D) on 2024-01-02
    Match 3: (B,C) beat (A,D) on 2024-01-03
    Every player faces every other configuration; nothing here depends on
    real data, so the expected symmetry property can be checked exactly.
    """
    return pd.DataFrame([
        {"match_id": 1, "date": "2024-01-01", "team1_p1": "A", "team1_p2": "B",
         "team2_p1": "C", "team2_p2": "D", "winner_team": 1},
        {"match_id": 2, "date": "2024-01-02", "team1_p1": "A", "team1_p2": "C",
         "team2_p1": "B", "team2_p2": "D", "winner_team": 1},
        {"match_id": 3, "date": "2024-01-03", "team1_p1": "B", "team1_p2": "C",
         "team2_p1": "A", "team2_p2": "D", "winner_team": 1},
    ])


def test_compute_elo_symmetry_zero_sum_per_match():
    """The total Elo gained by the winning pair must exactly equal the total
    Elo lost by the losing pair, for every single match (zero-sum update) —
    this is a direct algebraic consequence of expected_win_1 + expected_win_2
    == 1, and checking it end-to-end guards against an accidental asymmetric
    K-factor or a sign error in the update.
    """
    matches = _synthetic_matches()
    history, final = compute_elo(matches, k=32.0, base=1500.0)

    for match_id, group in history.groupby("match_id"):
        row = matches.loc[matches.match_id == match_id].iloc[0]
        winning_players = [row.team1_p1, row.team1_p2] if row.winner_team == 1 else [row.team2_p1, row.team2_p2]
        losing_players = [row.team2_p1, row.team2_p2] if row.winner_team == 1 else [row.team1_p1, row.team1_p2]

        # elo_after alone doesn't give the delta directly (need "before"), so
        # instead assert against known invariant: sum of deltas over all 4
        # players in the match is exactly 0 (zero-sum), which we can recover
        # from full history by re-simulating deltas.
        assert set(group["player"]) == set(winning_players) | set(losing_players)

    # Direct re-derivation of deltas to check the zero-sum property precisely.
    ratings = {}
    for _, row in matches.sort_values(["date", "match_id"]).iterrows():
        t1 = [row.team1_p1, row.team1_p2]
        t2 = [row.team2_p1, row.team2_p2]
        for p in t1 + t2:
            ratings.setdefault(p, 1500.0)
        t1_avg = sum(ratings[p] for p in t1) / 2
        t2_avg = sum(ratings[p] for p in t2) / 2
        exp1 = 1.0 / (1.0 + 10 ** ((t2_avg - t1_avg) / 400.0))
        exp2 = 1.0 - exp1
        result1 = 1.0 if row.winner_team == 1 else 0.0
        result2 = 1.0 - result1
        delta1 = 32.0 * (result1 - exp1)
        delta2 = 32.0 * (result2 - exp2)
        # zero-sum: team1's total delta (2 players) == -(team2's total delta)
        assert (2 * delta1) == pytest.approx(-(2 * delta2))
        for p in t1:
            ratings[p] += delta1
        for p in t2:
            ratings[p] += delta2

    # And the function's own output should match this independent re-simulation.
    final_check = pd.Series(ratings).sort_index()
    final_from_fn = final.set_index("player")["elo"].sort_index()
    pd.testing.assert_series_equal(final_check, final_from_fn, check_names=False)


def test_compute_elo_history_is_chronological_and_n_matches_correct():
    matches = _synthetic_matches()
    history, final = compute_elo(matches, k=32.0, base=1500.0)

    # In this fixture every one of A,B,C,D appears in all 3 matches (check the
    # docstring's match layout), so every player's n_matches should be 3.
    assert (final.set_index("player")["n_matches"] == 3).all()

    # match_id order in history should follow the sorted date order
    assert list(history.sort_values(["date", "match_id"])["match_id"]) == list(history["match_id"])


# ---------------------------------------------------------------------------
# 3. fit_win_model — end to end on the REAL bundled CSVs
# ---------------------------------------------------------------------------

def test_fit_win_model_runs_on_real_data():
    matches = pd.read_csv(DATA_DIR / "pro_matches.csv")
    players = pd.read_csv(DATA_DIR / "pro_players.csv")

    result = fit_win_model(matches, players)

    assert result["n_used"] > 0
    assert result["n_used"] <= result["n_total"]
    assert set(result["feature_names"]) == {"ranking_gap", "height_gap", "surface_indoor"}
    assert set(result["coefficients"].keys()) == set(result["feature_names"])
    assert isinstance(result["intercept"], float)

    calib = result["calibration"]
    assert {"mean_predicted", "actual_win_rate", "n"}.issubset(calib.columns)
    assert calib["n"].sum() == result["n_used"]
    assert calib["actual_win_rate"].between(0, 1).all()
    assert calib["mean_predicted"].between(0, 1).all()


def test_fit_win_model_raises_on_too_few_usable_rows():
    players = pd.DataFrame([
        {"name": "A", "ranking_points": 1000, "height_cm": 180},
        {"name": "B", "ranking_points": 1000, "height_cm": 180},
    ])
    matches = pd.DataFrame([
        {"team1_p1": "A", "team1_p2": "B", "team2_p1": "unknown1",
         "team2_p2": "unknown2", "winner_team": 1, "surface": "indoor"}
    ])
    with pytest.raises(ValueError):
        fit_win_model(matches, players)


# ---------------------------------------------------------------------------
# 4. momentum_table
# ---------------------------------------------------------------------------

def _synthetic_momentum_matches() -> pd.DataFrame:
    """TEST FIXTURE: 6 matches with known set1 winners and known match winners
    so P(win match | won set1) can be hand-verified.

    Matches 1-3: team1 wins set1 (6-2) AND wins the match -> 3/3 "momentum held"
    Match 4: team1 wins set1 (6-2) but team2 wins the match (comeback) -> momentum broken
    Match 5: team2 wins set1 (2-6) and team2 wins match -> momentum held
    Match 6: tie set1 (6-6, malformed/impossible) -> dropped from analysis
    Overall expected: momentum held in 4 of 5 valid matches = 0.8
    """
    return pd.DataFrame([
        {"match_id": 1, "set1": "6-2", "set2": "6-3", "set3": None, "winner_team": 1,
         "surface": "indoor", "category": "P1"},
        {"match_id": 2, "set1": "6-2", "set2": "6-3", "set3": None, "winner_team": 1,
         "surface": "outdoor", "category": "P1"},
        {"match_id": 3, "set1": "6-2", "set2": "6-3", "set3": None, "winner_team": 1,
         "surface": "indoor", "category": "P2"},
        {"match_id": 4, "set1": "6-2", "set2": "3-6", "set3": "4-6", "winner_team": 2,
         "surface": "indoor", "category": "P1"},
        {"match_id": 5, "set1": "2-6", "set2": "3-6", "set3": None, "winner_team": 2,
         "surface": "outdoor", "category": "P2"},
        {"match_id": 6, "set1": "6-6", "set2": "6-3", "set3": None, "winner_team": 1,
         "surface": "indoor", "category": "P1"},
    ])


def test_momentum_table_probabilities_and_counts():
    matches = _synthetic_momentum_matches()
    table = momentum_table(matches)

    # win_rate must be a valid probability everywhere it's defined
    valid = table["win_rate"].dropna()
    assert valid.between(0, 1).all()
    assert (table["ci_lo"] <= table["win_rate"]).all() or table["n"].eq(0).any()
    assert (table["win_rate"] <= table["ci_hi"] + 1e-9).all()

    overall = table[table["group"] == "Overall"].iloc[0]
    assert overall["n"] == 5  # match 6 dropped (tied set1 is not a valid outcome)
    assert overall["wins"] == 4
    assert overall["win_rate"] == pytest.approx(0.8)

    # surface split n's should sum to the overall n (every valid match has exactly one surface)
    surface_rows = table[table["split_by"] == "surface"]
    assert surface_rows["n"].sum() == overall["n"]

    category_rows = table[table["split_by"] == "category"]
    assert category_rows["n"].sum() == overall["n"]


# ---------------------------------------------------------------------------
# 5. player_archetypes
# ---------------------------------------------------------------------------

def test_player_archetypes_runs_and_labels_all_rows():
    stats = pd.DataFrame({
        "name": [f"P{i}" for i in range(12)],
        "ranking_points": [11000, 10800, 10500, 200, 250, 300, 5000, 5200, 4800, 9000, 8900, 100],
        "height_cm": [190, 188, 185, 170, 172, 168, 180, 182, 178, 186, 184, 165],
        "birth_year": [1998, 1999, 1997, 2003, 2002, 2004, 2000, 2001, 1999, 1998, 1997, 2005],
    })
    labelled, centroids = player_archetypes(stats, k=3)

    assert len(labelled) == len(stats)
    assert labelled["cluster"].notna().all()
    assert set(labelled["cluster"].unique()) <= {0, 1, 2}
    assert len(centroids) == 3
    assert centroids["n_players"].sum() == len(stats)
    assert {"ranking_points", "height_cm", "birth_year"}.issubset(centroids.columns)


# ---------------------------------------------------------------------------
# 6. pair_chemistry
# ---------------------------------------------------------------------------

def _synthetic_chemistry_matches() -> pd.DataFrame:
    """TEST FIXTURE: pair (A,B) plays together 5 times, pair (C,D) plays
    together 2 times — all with different opponents so pair identity is
    unambiguous. 7 matches total -> 14 (pair, match) rows total across both
    teams in each match.
    """
    rows = []
    mid = 1
    for i in range(5):
        rows.append({"match_id": mid, "date": f"2024-01-{i+1:02d}",
                      "team1_p1": "A", "team1_p2": "B",
                      "team2_p1": f"X{i}", "team2_p2": f"Y{i}",
                      "winner_team": 1 if i % 2 == 0 else 2})
        mid += 1
    for i in range(2):
        rows.append({"match_id": mid, "date": f"2024-02-{i+1:02d}",
                      "team1_p1": "C", "team1_p2": "D",
                      "team2_p1": f"Z{i}", "team2_p2": f"W{i}",
                      "winner_team": 1})
        mid += 1
    return pd.DataFrame(rows)


def test_pair_chemistry_buckets_sum_to_total_pair_matches():
    matches = _synthetic_chemistry_matches()
    result = pair_chemistry(matches)

    per_pair = result[result["level"] == "per_pair"]
    buckets = result[result["level"] == "bucket"]

    # Every (team, match) row is one "pair-match": 2 teams * 7 matches = 14
    assert len(per_pair) == 14
    assert buckets["n"].sum() == len(per_pair)

    # (A,B) played 5 matches together -> bucket "1-3" gets 3, "4-8" gets 2 (from AB alone)
    # (C,D) played 2 -> both land in "1-3"
    # opponents (X0/Y0 etc.) each appear as a pair exactly once -> all in "1-3"
    ab_rows = per_pair[per_pair["pair"] == "A / B"]
    assert len(ab_rows) == 5
    assert list(ab_rows["match_number"]) == [1, 2, 3, 4, 5]
    assert ab_rows["cum_win_rate"].iloc[-1] == pytest.approx(3 / 5)  # wins at i=0,2,4


def test_pair_chemistry_win_rate_in_unit_interval():
    matches = _synthetic_chemistry_matches()
    result = pair_chemistry(matches)
    valid = result["win_rate"].dropna()
    assert valid.between(0, 1).all()
    cum_valid = result["cum_win_rate"].dropna()
    assert cum_valid.between(0, 1).all()
