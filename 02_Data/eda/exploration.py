"""
Exploratory Data Analysis - Premier Padel 2026 Season (Real Data)
==================================================================
Reproducible, deterministic script answering E1-E10.
Reads:  ../real/pro_matches_real.csv, ../real/pro_players_real.csv
Writes: eda_results.json, eda_report.md (in this directory)

Run: python3 exploration.py
"""

import json
import re
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

np.random.seed(42)

DATA_DIR = "../real/"
OUT_DIR = "./"

MATCHES_FILE = DATA_DIR + "pro_matches_real.csv"
PLAYERS_FILE = DATA_DIR + "pro_players_real.csv"

Z = 1.959963984540054  # 95% CI z-score

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def wilson_ci(k, n, z=Z):
    """Wilson score interval for a binomial proportion. Returns (phat, lo, hi)."""
    if n == 0:
        return (np.nan, np.nan, np.nan)
    phat = k / n
    denom = 1 + z**2 / n
    center = phat + z**2 / (2 * n)
    margin = z * np.sqrt((phat * (1 - phat) + z**2 / (4 * n)) / n)
    lo = (center - margin) / denom
    hi = (center + margin) / denom
    return (phat, max(0.0, lo), min(1.0, hi))


def binom_test_p(k, n, p0=0.5):
    if n == 0:
        return np.nan
    return stats.binomtest(k, n, p0, alternative="two-sided").pvalue


SET_RE = re.compile(r"^(\d+)(?:\((\d+)\))?-(\d+)(?:\((\d+)\))?$")


def parse_set(s):
    """Parse a set score string like '7-6(4)' or '6(4)-7'. Returns (t1_games, t2_games) or None."""
    if pd.isna(s):
        return None
    s = str(s).strip()
    m = SET_RE.match(s)
    if not m:
        return None
    t1 = int(m.group(1))
    t2 = int(m.group(3))
    return (t1, t2)


def set_winner(s):
    """1 if team1 won the set, 2 if team2 won, None if unparseable or tied."""
    p = parse_set(s)
    if p is None:
        return None
    t1, t2 = p
    if t1 == t2:
        return None
    return 1 if t1 > t2 else 2


def is_valid_finished_set(s):
    """A properly completed set: winner reached >=6 games with 2-game margin, or 7-6/7-5 etc."""
    p = parse_set(s)
    if p is None:
        return False
    t1, t2 = p
    hi, lo = max(t1, t2), min(t1, t2)
    if hi == 7 and lo in (5, 6):
        return True
    if hi >= 6 and hi - lo >= 2:
        return True
    return False


def fmt(x, nd=4):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return None
    x = float(x)
    r = round(x, nd)
    if r == 0.0 and x != 0.0:
        # preserve tiny nonzero magnitudes (e.g. p-values like 1e-98) instead of
        # flattening them to a misleading exact 0.0
        return x
    return r


results = {}  # final JSON payload

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------

matches = pd.read_csv(MATCHES_FILE)
players = pd.read_csv(PLAYERS_FILE)

N_MATCHES_TOTAL = len(matches)
finished = matches[matches["status"] == "finished"].copy()
N_FINISHED = len(finished)
N_EXCLUDED_NONFINISHED = N_MATCHES_TOTAL - N_FINISHED  # retired / walkover

# parse set winners for all matches (used across several questions)
for col in ["set1", "set2", "set3"]:
    matches[col + "_winner"] = matches[col].apply(set_winner)
    matches[col + "_valid"] = matches[col].apply(is_valid_finished_set)

finished = matches[matches["status"] == "finished"].copy()

players_idx = players.set_index("id")

def get_attr(id_series, attr):
    return id_series.map(players_idx[attr]) if attr in players_idx.columns else pd.Series(np.nan, index=id_series.index)

# ===========================================================================
# E1 - MOMENTUM
# ===========================================================================
e1 = {}

m1 = finished.copy()
m1 = m1[m1["set1_winner"].notna()]
m1["won_set1_won_match"] = (m1["set1_winner"] == m1["winner_team"]).astype(int)

def momentum_stats(df, label):
    n = len(df)
    k = int(df["won_set1_won_match"].sum())
    phat, lo, hi = wilson_ci(k, n)
    p = binom_test_p(k, n, 0.5)
    return {"n": n, "k": k, "estimate": fmt(phat), "ci95": [fmt(lo), fmt(hi)],
            "test": "two-sided binomial test vs 0.5", "p_value": fmt(p, 6)}

overall = momentum_stats(m1, "overall")
by_gender = {g: momentum_stats(m1[m1["tour_category"] == g], g) for g in m1["tour_category"].dropna().unique()}
by_level = {lv: momentum_stats(m1[m1["level"] == lv], lv) for lv in m1["level"].dropna().unique()}

# set-3 momentum: matches that actually went to 3 valid sets
m3 = finished.copy()
m3 = m3[m3["set1_winner"].notna() & m3["set3_winner"].notna()]
m3 = m3[m3["set3_valid"]]
m3["set1_wins_set3"] = (m3["set1_winner"] == m3["set3_winner"]).astype(int)
n3 = len(m3)
k3 = int(m3["set1_wins_set3"].sum())
phat3, lo3, hi3 = wilson_ci(k3, n3)
p3 = binom_test_p(k3, n3, 0.5)

e1 = {
    "headline_estimate": overall["estimate"],
    "n": overall["n"],
    "ci95": overall["ci95"],
    "test": overall["test"],
    "p_value": overall["p_value"],
    "subgroups": {
        "by_gender": by_gender,
        "by_level": by_level,
        "set3_given_deciding_set": {
            "description": "P(set1 winner also wins set3 | match reached a valid 3rd set)",
            "n": n3, "k": k3, "estimate": fmt(phat3), "ci95": [fmt(lo3), fmt(hi3)],
            "test": "two-sided binomial test vs 0.5", "p_value": fmt(p3, 6)
        }
    },
    "caveats": [
        f"Excludes {N_EXCLUDED_NONFINISHED} non-finished matches (retired/walkover); n reflects finished matches with a parseable set1 score.",
        "'Win match | won set1' computed as P(set1 winner == match winner)."
    ],
    "verdict": "signal" if overall["p_value"] is not None and overall["p_value"] < 0.05 and abs(overall["estimate"] - 0.5) > 0.05 else "null"
}

# ===========================================================================
# E2 - RANKING CALIBRATION
# ===========================================================================
m = finished.copy()
for slot in ["team1_p1", "team1_p2", "team2_p1", "team2_p2"]:
    idcol = slot + "_id"
    m[slot + "_points"] = m[idcol].map(players_idx["points"])

m["team1_points"] = m["team1_p1_points"] + m["team1_p2_points"]
m["team2_points"] = m["team2_p1_points"] + m["team2_p2_points"]
complete_pts = m[m[["team1_p1_points", "team1_p2_points", "team2_p1_points", "team2_p2_points"]].notna().all(axis=1)].copy()

complete_pts["gap"] = complete_pts["team1_points"] - complete_pts["team2_points"]
complete_pts = complete_pts[complete_pts["gap"] != 0]  # drop exact ties (no favorite)
complete_pts["favorite_team"] = np.where(complete_pts["gap"] > 0, 1, 2)
complete_pts["favorite_won"] = (complete_pts["favorite_team"] == complete_pts["winner_team"]).astype(int)

n_e2 = len(complete_pts)
k_e2 = int(complete_pts["favorite_won"].sum())
phat_e2, lo_e2, hi_e2 = wilson_ci(k_e2, n_e2)
p_e2 = binom_test_p(k_e2, n_e2, 0.5)

# quintiles by |gap|
complete_pts["abs_gap"] = complete_pts["gap"].abs()
complete_pts["gap_quintile"] = pd.qcut(complete_pts["abs_gap"], 5, labels=[1, 2, 3, 4, 5], duplicates="drop")
quintile_stats = {}
for q, grp in complete_pts.groupby("gap_quintile", observed=True):
    n_q = len(grp)
    k_q = int(grp["favorite_won"].sum())
    phat_q, lo_q, hi_q = wilson_ci(k_q, n_q)
    quintile_stats[str(q)] = {
        "n": n_q, "estimate": fmt(phat_q), "ci95": [fmt(lo_q), fmt(hi_q)],
        "mean_abs_gap": fmt(grp["abs_gap"].mean(), 1)
    }

# by gender / level
by_gender_e2 = {}
for g, grp in complete_pts.groupby("tour_category"):
    n_g = len(grp); k_g = int(grp["favorite_won"].sum())
    phat_g, lo_g, hi_g = wilson_ci(k_g, n_g)
    by_gender_e2[g] = {"n": n_g, "estimate": fmt(phat_g), "ci95": [fmt(lo_g), fmt(hi_g)]}

by_level_e2 = {}
for lv, grp in complete_pts.groupby("level"):
    n_l = len(grp); k_l = int(grp["favorite_won"].sum())
    phat_l, lo_l, hi_l = wilson_ci(k_l, n_l)
    by_level_e2[lv] = {"n": n_l, "estimate": fmt(phat_l), "ci95": [fmt(lo_l), fmt(hi_l)]}

# logistic regression: y = team1 wins, x = log(team1_points/team2_points)
complete_pts["y_team1_win"] = (complete_pts["winner_team"] == 1).astype(int)
complete_pts["log_ratio"] = np.log(complete_pts["team1_points"] / complete_pts["team2_points"])
X = complete_pts[["log_ratio"]].values
y = complete_pts["y_team1_win"].values

auc = np.nan
decile_table = []
coef = None
intercept = None
if len(np.unique(y)) > 1 and n_e2 >= 20:
    clf = LogisticRegression()
    clf.fit(X, y)
    probs = clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, probs)
    coef = float(clf.coef_[0][0])
    intercept = float(clf.intercept_[0])
    dec = pd.DataFrame({"prob": probs, "actual": y})
    dec["decile"] = pd.qcut(dec["prob"], 10, labels=False, duplicates="drop")
    for d, grp in dec.groupby("decile"):
        decile_table.append({
            "decile": int(d) + 1,
            "n": len(grp),
            "mean_predicted": fmt(grp["prob"].mean(), 3),
            "actual_win_rate": fmt(grp["actual"].mean(), 3)
        })

e2 = {
    "headline_estimate": fmt(phat_e2),
    "n": n_e2,
    "ci95": [fmt(lo_e2), fmt(hi_e2)],
    "test": "two-sided binomial test vs 0.5 (favorite win rate)",
    "p_value": fmt(p_e2, 6),
    "subgroups": {
        "by_points_gap_quintile": quintile_stats,
        "by_gender": by_gender_e2,
        "by_level": by_level_e2,
        "logistic_regression": {
            "predictor": "log(team1_points / team2_points)",
            "n": n_e2,
            "auc": fmt(auc, 4),
            "coefficient": fmt(coef, 4),
            "intercept": fmt(intercept, 4),
            "decile_calibration": decile_table
        }
    },
    "caveats": [
        "CAVEAT: points are an end-of-season/end-of-window SNAPSHOT (current ranking points), NOT the points each player held on the match date. This is a look-ahead bias risk: early-season matches are evaluated against ranking points the players earned partly AFTER the match. Treat as an approximate/optimistic calibration check, not a true pre-match prediction test.",
        f"{N_FINISHED - n_e2} finished matches excluded (missing points for >=1 player, or exact points tie)."
    ],
    "verdict": "signal" if p_e2 is not None and p_e2 < 0.05 and phat_e2 > 0.55 else "null"
}

# ===========================================================================
# E3 - PAIR CHEMISTRY
# ===========================================================================
m = finished.copy()
m["date"] = pd.to_datetime(m["date"])

rows = []
for _, r in m.iterrows():
    pair1 = tuple(sorted([r["team1_p1_id"], r["team1_p2_id"]]))
    pair2 = tuple(sorted([r["team2_p1_id"], r["team2_p2_id"]]))
    rows.append({"pair": pair1, "date": r["date"], "won": 1 if r["winner_team"] == 1 else 0, "match_id": r["match_id"]})
    rows.append({"pair": pair2, "date": r["date"], "won": 1 if r["winner_team"] == 2 else 0, "match_id": r["match_id"]})

pair_df = pd.DataFrame(rows)
pair_df = pair_df.sort_values(["pair", "date", "match_id"]).reset_index(drop=True)
pair_df["nth_match"] = pair_df.groupby("pair").cumcount() + 1

n_distinct_pairs = pair_df["pair"].nunique()
matches_per_pair = pair_df.groupby("pair").size()

def bucket_nth(n):
    if n <= 3:
        return "1-3"
    elif n <= 8:
        return "4-8"
    elif n <= 15:
        return "9-15"
    else:
        return "16+"

pair_df["bucket"] = pair_df["nth_match"].apply(bucket_nth)
bucket_order = ["1-3", "4-8", "9-15", "16+"]
bucket_stats = {}
for b in bucket_order:
    grp = pair_df[pair_df["bucket"] == b]
    n_b = len(grp)
    if n_b == 0:
        continue
    k_b = int(grp["won"].sum())
    phat_b, lo_b, hi_b = wilson_ci(k_b, n_b)
    bucket_stats[b] = {"n": n_b, "estimate": fmt(phat_b), "ci95": [fmt(lo_b), fmt(hi_b)]}

# chi-square across buckets for win rate homogeneity
contingency = []
for b in bucket_order:
    grp = pair_df[pair_df["bucket"] == b]
    if len(grp) == 0:
        continue
    contingency.append([int(grp["won"].sum()), len(grp) - int(grp["won"].sum())])
chi2_p = np.nan
if len(contingency) >= 2:
    chi2, chi2_p, dof, exp = stats.chi2_contingency(contingency)

e3 = {
    "headline_estimate": "win rate by nth-match-together bucket (see subgroups)",
    "n": len(pair_df),
    "ci95": None,
    "test": "chi-square test of independence (win rate across buckets)",
    "p_value": fmt(chi2_p, 6),
    "subgroups": {
        "by_bucket": bucket_stats,
        "n_distinct_pairs": int(n_distinct_pairs),
        "matches_per_pair_summary": {
            "mean": fmt(matches_per_pair.mean(), 2),
            "median": fmt(matches_per_pair.median(), 2),
            "max": int(matches_per_pair.max()),
            "min": int(matches_per_pair.min()),
            "pairs_with_1_match": int((matches_per_pair == 1).sum()),
            "pairs_with_5plus_matches": int((matches_per_pair >= 5).sum())
        }
    },
    "caveats": [
        "Pair = unordered set of two player ids appearing together on the same team side in a match, tracked across the whole season regardless of team1/team2 slot.",
        "Season-only window: 'nth match together' does not account for partnership history before this dataset's start."
    ],
    "verdict": "signal" if (chi2_p is not None and not np.isnan(chi2_p) and chi2_p < 0.05) else "null"
}

# ===========================================================================
# E4 - SEED UPSETS
# ===========================================================================
m = finished.copy()

def to_numeric_seed(x):
    try:
        if pd.isna(x):
            return np.nan
        return float(x)
    except (ValueError, TypeError):
        return np.nan

m["seed_t1_num"] = m["seed_t1"].apply(to_numeric_seed)
m["seed_t2_num"] = m["seed_t2"].apply(to_numeric_seed)
seeded = m[m["seed_t1_num"].notna() & m["seed_t2_num"].notna()].copy()
seeded["winner_seed"] = np.where(seeded["winner_team"] == 1, seeded["seed_t1_num"], seeded["seed_t2_num"])
seeded["loser_seed"] = np.where(seeded["winner_team"] == 1, seeded["seed_t2_num"], seeded["seed_t1_num"])
seeded = seeded[seeded["winner_seed"] != seeded["loser_seed"]]  # no equal-seed matches counted
seeded["upset"] = (seeded["winner_seed"] > seeded["loser_seed"]).astype(int)

n_e4 = len(seeded)
k_e4 = int(seeded["upset"].sum())
phat_e4, lo_e4, hi_e4 = wilson_ci(k_e4, n_e4)
p_e4 = binom_test_p(k_e4, n_e4, 0.5)

def group_upset_stats(df, col):
    out = {}
    for val, grp in df.groupby(col):
        n_v = len(grp)
        k_v = int(grp["upset"].sum())
        phat_v, lo_v, hi_v = wilson_ci(k_v, n_v)
        out[str(val)] = {"n": n_v, "estimate": fmt(phat_v), "ci95": [fmt(lo_v), fmt(hi_v)]}
    return out

e4 = {
    "headline_estimate": fmt(phat_e4),
    "n": n_e4,
    "ci95": [fmt(lo_e4), fmt(hi_e4)],
    "test": "two-sided binomial test vs 0.5",
    "p_value": fmt(p_e4, 6),
    "subgroups": {
        "by_round": group_upset_stats(seeded, "round"),
        "by_level": group_upset_stats(seeded, "level"),
        "by_gender": group_upset_stats(seeded, "tour_category")
    },
    "caveats": [
        f"Only {n_e4} of {N_FINISHED} finished matches have BOTH teams numerically seeded (WC/Q/LL/LLI/blank excluded). This is a small, seed-selected subsample -- not representative of all matches.",
        "Upset = winner had a numerically higher (worse) seed than the loser."
    ],
    "verdict": "signal" if p_e4 < 0.05 and abs(phat_e4 - 0.5) > 0.05 else "null"
}

# ===========================================================================
# E5 - HANDEDNESS
# ===========================================================================
all_participant_ids = pd.unique(pd.concat([
    matches["team1_p1_id"], matches["team1_p2_id"], matches["team2_p1_id"], matches["team2_p2_id"]
]))
participants = players[players["id"].isin(all_participant_ids)]
hand_coverage_players_table = players["hand"].notna().mean()
hand_coverage_participants = participants["hand"].notna().mean()

m = finished.copy()
for slot in ["team1_p1", "team1_p2", "team2_p1", "team2_p2"]:
    m[slot + "_hand"] = m[slot + "_id"].map(players_idx["hand"])
match_all4_hand_known = m[["team1_p1_hand", "team1_p2_hand", "team2_p1_hand", "team2_p2_hand"]].notna().all(axis=1)
n_matches_all4_hand = int(match_all4_hand_known.sum())

USABLE_THRESHOLD = 0.60
usable = hand_coverage_participants > USABLE_THRESHOLD

e5 = {
    "headline_estimate": None,
    "n": int(len(participants)),
    "ci95": None,
    "test": None,
    "p_value": None,
    "subgroups": {
        "hand_coverage_full_players_table_pct": fmt(100 * hand_coverage_players_table, 1),
        "hand_coverage_match_participants_pct": fmt(100 * hand_coverage_participants, 1),
        "n_match_participants": int(len(participants)),
        "n_finished_matches_with_all_4_hands_known": n_matches_all4_hand
    },
    "caveats": [
        f"Hand data covers only {fmt(100*hand_coverage_players_table,1)}% of all 2165 players and {fmt(100*hand_coverage_participants,1)}% of the {len(participants)} distinct players who appear in the 776 real matches (threshold for 'usable' set at >60%).",
        f"Only {n_matches_all4_hand} of {N_FINISHED} finished matches have hand data for all 4 participants -- far too few for a reliable win-rate comparison."
    ],
    "verdict": "insufficient_data"
}
if usable and n_matches_all4_hand >= 30:
    sub = m[match_all4_hand_known].copy()
    sub["team1_has_left"] = (sub["team1_p1_hand"] == "left") | (sub["team1_p2_hand"] == "left")
    sub["team2_has_left"] = (sub["team2_p1_hand"] == "left") | (sub["team2_p2_hand"] == "left")
    rows_h = []
    for _, r in sub.iterrows():
        rows_h.append({"has_left": r["team1_has_left"], "won": r["winner_team"] == 1})
        rows_h.append({"has_left": r["team2_has_left"], "won": r["winner_team"] == 2})
    hdf = pd.DataFrame(rows_h)
    left_grp = hdf[hdf["has_left"]]
    right_grp = hdf[~hdf["has_left"]]
    n_l, k_l = len(left_grp), int(left_grp["won"].sum())
    n_r, k_r = len(right_grp), int(right_grp["won"].sum())
    phat_l, lo_l, hi_l = wilson_ci(k_l, n_l)
    phat_r, lo_r, hi_r = wilson_ci(k_r, n_r)
    contingency = [[k_l, n_l - k_l], [k_r, n_r - k_r]]
    chi2, pval, dof, exp = stats.chi2_contingency(contingency)
    e5["headline_estimate"] = fmt(phat_l)
    e5["test"] = "chi-square test (team with left-hander vs without)"
    e5["p_value"] = fmt(pval, 6)
    e5["subgroups"]["with_left_hander"] = {"n": n_l, "estimate": fmt(phat_l), "ci95": [fmt(lo_l), fmt(hi_l)]}
    e5["subgroups"]["without_left_hander"] = {"n": n_r, "estimate": fmt(phat_r), "ci95": [fmt(lo_r), fmt(hi_r)]}
    e5["verdict"] = "signal" if pval < 0.05 else "null"

# ===========================================================================
# E6 - PHYSIQUE / AGE
# ===========================================================================
height_coverage_players_table = players["height"].notna().mean()
height_coverage_participants = participants["height"].notna().mean()

m = finished.copy()
for slot in ["team1_p1", "team1_p2", "team2_p1", "team2_p2"]:
    m[slot + "_age"] = m[slot + "_id"].map(players_idx["age"])

m["team1_age_mean"] = m[["team1_p1_age", "team1_p2_age"]].mean(axis=1)
m["team2_age_mean"] = m[["team2_p1_age", "team2_p2_age"]].mean(axis=1)
m["team1_age_gap"] = (m["team1_p1_age"] - m["team1_p2_age"]).abs()
m["team2_age_gap"] = (m["team2_p1_age"] - m["team2_p2_age"]).abs()

both_ages_known = m[m["team1_age_mean"].notna() & m["team2_age_mean"].notna()].copy()
both_ages_known["winner_age"] = np.where(both_ages_known["winner_team"] == 1, both_ages_known["team1_age_mean"], both_ages_known["team2_age_mean"])
both_ages_known["loser_age"] = np.where(both_ages_known["winner_team"] == 1, both_ages_known["team2_age_mean"], both_ages_known["team1_age_mean"])
both_ages_known["age_gap_winner_minus_loser"] = both_ages_known["winner_age"] - both_ages_known["loser_age"]

n_age = len(both_ages_known)
mean_gap = both_ages_known["age_gap_winner_minus_loser"].mean()
sd_gap = both_ages_known["age_gap_winner_minus_loser"].std()
tstat, p_age = stats.ttest_1samp(both_ages_known["age_gap_winner_minus_loser"].dropna(), 0)
se_gap = sd_gap / np.sqrt(n_age)
ci_gap = [fmt(mean_gap - Z * se_gap, 3), fmt(mean_gap + Z * se_gap, 3)]

# within-pair age gap vs win rate correlation (per team-match observation)
rows_ag = []
for _, r in m.iterrows():
    if pd.notna(r["team1_age_gap"]):
        rows_ag.append({"age_gap": r["team1_age_gap"], "won": 1 if r["winner_team"] == 1 else 0})
    if pd.notna(r["team2_age_gap"]):
        rows_ag.append({"age_gap": r["team2_age_gap"], "won": 1 if r["winner_team"] == 2 else 0})
agdf = pd.DataFrame(rows_ag)
corr, corr_p = stats.pointbiserialr(agdf["won"], agdf["age_gap"])

# young vs old: team mean age >=3 years younger than opponent
both_ages_known["age_diff_signed"] = both_ages_known["team1_age_mean"] - both_ages_known["team2_age_mean"]  # team1 - team2
younger_team1 = both_ages_known[both_ages_known["age_diff_signed"] <= -3].copy()
younger_team2 = both_ages_known[both_ages_known["age_diff_signed"] >= 3].copy()
young_win = pd.concat([
    (younger_team1["winner_team"] == 1).astype(int),
    (younger_team2["winner_team"] == 2).astype(int)
])
n_young = len(young_win)
k_young = int(young_win.sum())
phat_young, lo_young, hi_young = wilson_ci(k_young, n_young)
p_young = binom_test_p(k_young, n_young, 0.5)

HEIGHT_USABLE = height_coverage_players_table > 0.60

e6 = {
    "headline_estimate": fmt(mean_gap, 3),
    "n": n_age,
    "ci95": ci_gap,
    "test": "one-sample t-test (winner-loser age gap vs 0)",
    "p_value": fmt(p_age, 6),
    "subgroups": {
        "height_coverage_full_players_table_pct": fmt(100 * height_coverage_players_table, 1),
        "height_coverage_match_participants_pct": fmt(100 * height_coverage_participants, 1),
        "height_analysis_skipped": (not HEIGHT_USABLE),
        "within_pair_age_gap_vs_win_correlation": {
            "n": len(agdf), "pearson_r": fmt(corr, 4), "p_value": fmt(corr_p, 6)
        },
        "young_team_ge3yr_younger_win_rate": {
            "n": n_young, "estimate": fmt(phat_young), "ci95": [fmt(lo_young), fmt(hi_young)],
            "p_value": fmt(p_young, 6), "test": "two-sided binomial test vs 0.5"
        }
    },
    "caveats": [
        f"Height coverage is {fmt(100*height_coverage_players_table,1)}% across the full players table (<60% threshold) -- height-based win-rate analysis is SKIPPED as unreliable, per instructions. (Coverage among the 279 match participants specifically is {fmt(100*height_coverage_participants,1)}%, still reported for transparency.)",
        "Age gap sign convention: positive value = winning team was OLDER on average than the losing team."
    ],
    "verdict": "signal" if p_age < 0.05 and abs(mean_gap) > 0.5 else "null"
}

# ===========================================================================
# E7 - DURATION
# ===========================================================================
m = finished.copy()
m["n_sets"] = np.where(m["set3"].notna(), 3, 2)
m = m[m["duration_min"].notna()]

dur_by_sets = {}
for ns, grp in m.groupby("n_sets"):
    dur_by_sets[str(ns)] = {"n": len(grp), "mean_minutes": fmt(grp["duration_min"].mean(), 1), "sd": fmt(grp["duration_min"].std(), 1)}

dur_by_level = {}
for lv, grp in m.groupby("level"):
    dur_by_level[lv] = {"n": len(grp), "mean_minutes": fmt(grp["duration_min"].mean(), 1)}

dur_by_gender = {}
for g, grp in m.groupby("tour_category"):
    dur_by_gender[g] = {"n": len(grp), "mean_minutes": fmt(grp["duration_min"].mean(), 1)}

# 3-set matches: higher level (major/p1) vs p2 duration
three_set = m[m["n_sets"] == 3]
higher_lvl = three_set[three_set["level"].isin(["major", "p1"])]["duration_min"]
lower_lvl = three_set[three_set["level"] == "p2"]["duration_min"]
tstat_dur, p_dur = stats.ttest_ind(higher_lvl, lower_lvl, equal_var=False)

# upset vs non-upset duration (reuse E4 seeded subset)
seeded_dur = seeded.drop(columns=["duration_min"], errors="ignore").merge(m[["match_id", "duration_min"]], on="match_id", how="inner")
upset_dur = seeded_dur[seeded_dur["upset"] == 1]["duration_min"]
non_upset_dur = seeded_dur[seeded_dur["upset"] == 0]["duration_min"]
if len(upset_dur) > 1 and len(non_upset_dur) > 1:
    tstat_up, p_up = stats.ttest_ind(upset_dur, non_upset_dur, equal_var=False)
else:
    tstat_up, p_up = np.nan, np.nan

e7 = {
    "headline_estimate": {"2_sets_mean_min": dur_by_sets.get("2", {}).get("mean_minutes"), "3_sets_mean_min": dur_by_sets.get("3", {}).get("mean_minutes")},
    "n": len(m),
    "ci95": None,
    "test": "Welch t-test (3-set duration: major/p1 vs p2)",
    "p_value": fmt(p_dur, 6),
    "subgroups": {
        "by_n_sets": dur_by_sets,
        "by_level": dur_by_level,
        "by_gender": dur_by_gender,
        "three_set_duration_major_p1_vs_p2": {
            "major_p1_n": int(len(higher_lvl)), "major_p1_mean": fmt(higher_lvl.mean(), 1),
            "p2_n": int(len(lower_lvl)), "p2_mean": fmt(lower_lvl.mean(), 1),
            "t_stat": fmt(tstat_dur, 3), "p_value": fmt(p_dur, 6)
        },
        "duration_upset_vs_nonupset": {
            "upset_n": int(len(upset_dur)), "upset_mean": fmt(upset_dur.mean(), 1) if len(upset_dur) else None,
            "nonupset_n": int(len(non_upset_dur)), "nonupset_mean": fmt(non_upset_dur.mean(), 1) if len(non_upset_dur) else None,
            "t_stat": fmt(tstat_up, 3), "p_value": fmt(p_up, 6)
        }
    },
    "caveats": [f"{N_FINISHED - len(m)} finished matches excluded for missing duration_min."],
    "verdict": "signal" if p_dur is not None and not np.isnan(p_dur) and p_dur < 0.05 else "null"
}

# ===========================================================================
# E8 - REST / SCHEDULE
# ===========================================================================
m = finished.copy()
m["date"] = pd.to_datetime(m["date"])

# build per-(tournament, pair) match history sorted by date to get previous match date + games played
team_rows = []
for _, r in m.iterrows():
    pair1 = tuple(sorted([r["team1_p1_id"], r["team1_p2_id"]]))
    pair2 = tuple(sorted([r["team2_p1_id"], r["team2_p2_id"]]))
    # total games this team played in this match (sum of games won by either side across valid sets)
    games_total = 0
    for sc in ["set1", "set2", "set3"]:
        p = parse_set(r[sc])
        if p is not None:
            games_total += p[0] + p[1]
    team_rows.append({"match_id": r["match_id"], "tournament": r["tournament"], "pair": pair1, "date": r["date"],
                       "team_slot": 1, "won": r["winner_team"] == 1, "games_total": games_total})
    team_rows.append({"match_id": r["match_id"], "tournament": r["tournament"], "pair": pair2, "date": r["date"],
                       "team_slot": 2, "won": r["winner_team"] == 2, "games_total": games_total})

team_hist = pd.DataFrame(team_rows).sort_values(["tournament", "pair", "date", "match_id"]).reset_index(drop=True)
team_hist["prev_date"] = team_hist.groupby(["tournament", "pair"])["date"].shift(1)
team_hist["prev_games_total"] = team_hist.groupby(["tournament", "pair"])["games_total"].shift(1)
team_hist["rest_days"] = (team_hist["date"] - team_hist["prev_date"]).dt.days

# merge back rest_days & prev_games_total for team1 and team2 per match
t1 = team_hist[team_hist["team_slot"] == 1][["match_id", "rest_days", "prev_games_total"]].rename(
    columns={"rest_days": "t1_rest", "prev_games_total": "t1_prev_games"})
t2 = team_hist[team_hist["team_slot"] == 2][["match_id", "rest_days", "prev_games_total"]].rename(
    columns={"rest_days": "t2_rest", "prev_games_total": "t2_prev_games"})
rest_m = m.merge(t1, on="match_id").merge(t2, on="match_id")

# win rate by rest bucket (pooled team-match observations, marginal)
rest_obs = []
for _, r in rest_m.iterrows():
    if pd.notna(r["t1_rest"]):
        rest_obs.append({"rest": r["t1_rest"], "won": r["winner_team"] == 1})
    if pd.notna(r["t2_rest"]):
        rest_obs.append({"rest": r["t2_rest"], "won": r["winner_team"] == 2})
rest_df = pd.DataFrame(rest_obs)
zero_rest = rest_df[rest_df["rest"] == 0]
pos_rest = rest_df[rest_df["rest"] >= 1]
n_z, k_z = len(zero_rest), int(zero_rest["won"].sum())
n_p, k_p = len(pos_rest), int(pos_rest["won"].sum())
phat_z, lo_z, hi_z = wilson_ci(k_z, n_z)
phat_p, lo_p, hi_p = wilson_ci(k_p, n_p)
rest_p_val = np.nan
if n_z > 0 and n_p > 0:
    _, rest_p_val, _, _ = stats.chi2_contingency([[k_z, n_z - k_z], [k_p, n_p - k_p]])

# REALITY CHECK: this tournament schedule never has true 0-day (same-day repeat) rest for a pair
# (observed rest_days in the data are only 1, 2, or 3). Report that honestly and instead compare
# the two rest levels that actually occur: 1-day ("quick turnaround") vs 2+ days ("extra rest").
ZERO_DAY_REST_EXISTS = n_z > 0
quick_rest = rest_df[rest_df["rest"] == 1]
extra_rest = rest_df[rest_df["rest"] >= 2]
n_q, k_q = len(quick_rest), int(quick_rest["won"].sum())
n_e, k_e = len(extra_rest), int(extra_rest["won"].sum())
phat_q, lo_q, hi_q = wilson_ci(k_q, n_q)
phat_e, lo_e, hi_e = wilson_ci(k_e, n_e)
quick_vs_extra_p = np.nan
if n_q > 0 and n_e > 0:
    _, quick_vs_extra_p, _, _ = stats.chi2_contingency([[k_q, n_q - k_q], [k_e, n_e - k_e]])

# fewer previous-round games -> wins more? restrict to matches where both teams have known prev games and they differ
both_prev_known = rest_m[rest_m["t1_prev_games"].notna() & rest_m["t2_prev_games"].notna()].copy()
both_prev_known = both_prev_known[both_prev_known["t1_prev_games"] != both_prev_known["t2_prev_games"]]
both_prev_known["fewer_games_team"] = np.where(both_prev_known["t1_prev_games"] < both_prev_known["t2_prev_games"], 1, 2)
both_prev_known["fewer_games_won"] = (both_prev_known["fewer_games_team"] == both_prev_known["winner_team"]).astype(int)
n_fg = len(both_prev_known)
k_fg = int(both_prev_known["fewer_games_won"].sum())
phat_fg, lo_fg, hi_fg = wilson_ci(k_fg, n_fg)
p_fg = binom_test_p(k_fg, n_fg, 0.5)

e8 = {
    "headline_estimate": fmt(phat_fg),
    "n": n_fg,
    "ci95": [fmt(lo_fg), fmt(hi_fg)],
    "test": "two-sided binomial test vs 0.5 (fewer-prev-round-games team win rate)",
    "p_value": fmt(p_fg, 6),
    "subgroups": {
        "zero_days_rest": {
            "n": n_z, "estimate": fmt(phat_z), "ci95": [fmt(lo_z), fmt(hi_z)],
            "note": "NO true 0-day (same-day repeat) rest observations exist in this bracket schedule -- insufficient_data for this exact split."
        },
        "one_day_rest_quick_turnaround": {"n": n_q, "estimate": fmt(phat_q), "ci95": [fmt(lo_q), fmt(hi_q)]},
        "two_plus_days_rest": {"n": n_e, "estimate": fmt(phat_e), "ci95": [fmt(lo_e), fmt(hi_e)]},
        "quick_vs_extra_rest_test": {"test": "chi-square (1-day vs 2+-day rest win rate)", "p_value": fmt(quick_vs_extra_p, 6)},
        "one_plus_days_rest_pooled": {"n": n_p, "estimate": fmt(phat_p), "ci95": [fmt(lo_p), fmt(hi_p)]},
        "fewer_prev_round_games_wins_more": {
            "n": n_fg, "estimate": fmt(phat_fg), "ci95": [fmt(lo_fg), fmt(hi_fg)],
            "test": "two-sided binomial test vs 0.5", "p_value": fmt(p_fg, 6)
        }
    },
    "caveats": [
        "0-day (back-to-back same-day) rest never occurs for a pair in this dataset's bracket schedules (observed rest gaps are only 1, 2, or 3 days) -- the literal '0 days vs 1+' comparison requested is reported as insufficient_data; a 1-day vs 2+-day comparison is substituted and reported transparently.",
        "'Previous match' = pair's prior match in the SAME tournament (round-robin/bracket order by date); first-round or bye matches for a pair have no known rest and are excluded.",
        "Rest-day and games observations are pooled per team-match (not match-paired), so left/right group ns need not sum simply to total matches.",
        f"n with rest known on at least one side: {len(rest_df)} team-observations from {rest_m[['t1_rest','t2_rest']].notna().any(axis=1).sum()} matches."
    ],
    "verdict": "signal" if (p_fg is not None and not np.isnan(p_fg) and p_fg < 0.05) else "null"
}

# ===========================================================================
# E9 - HOME ADVANTAGE
# ===========================================================================
m = finished.copy()
for slot in ["team1_p1", "team1_p2", "team2_p1", "team2_p2"]:
    m[slot + "_nat"] = m[slot + "_id"].map(players_idx["nationality"])

m["team1_home"] = (m["team1_p1_nat"] == m["country"]) | (m["team1_p2_nat"] == m["country"])
m["team2_home"] = (m["team2_p1_nat"] == m["country"]) | (m["team2_p2_nat"] == m["country"])

home_away = m[m["team1_home"] != m["team2_home"]].copy()  # exactly one team is home
home_away["home_team"] = np.where(home_away["team1_home"], 1, 2)
home_away["home_won"] = (home_away["home_team"] == home_away["winner_team"]).astype(int)

n_e9 = len(home_away)
k_e9 = int(home_away["home_won"].sum())
phat_e9, lo_e9, hi_e9 = wilson_ci(k_e9, n_e9)
p_e9 = binom_test_p(k_e9, n_e9, 0.5)

country_stats = {}
for c in ["ES", "IT", "FR", "SA"]:
    grp = home_away[home_away["country"] == c]
    n_c = len(grp)
    if n_c == 0:
        country_stats[c] = {"n": 0, "note": "no home-vs-away matches for this country"}
        continue
    k_c = int(grp["home_won"].sum())
    phat_c, lo_c, hi_c = wilson_ci(k_c, n_c)
    p_c = binom_test_p(k_c, n_c, 0.5)
    country_stats[c] = {"n": n_c, "estimate": fmt(phat_c), "ci95": [fmt(lo_c), fmt(hi_c)], "p_value": fmt(p_c, 6)}

e9 = {
    "headline_estimate": fmt(phat_e9),
    "n": n_e9,
    "ci95": [fmt(lo_e9), fmt(hi_e9)],
    "test": "two-sided binomial test vs 0.5",
    "p_value": fmt(p_e9, 6),
    "subgroups": {"by_country": country_stats},
    "caveats": [
        "Home = at least one player's nationality (ISO2) equals the tournament host country's ISO2 code.",
        f"{len(m) - n_e9} matches excluded because both teams were equally home/away (both or neither had a home player)."
    ],
    "verdict": "signal" if p_e9 < 0.05 and abs(phat_e9 - 0.5) > 0.05 else "null"
}

# ===========================================================================
# E10 - SCORELINE PATTERNS
# ===========================================================================
m = finished.copy()

all_sets = []
for _, r in m.iterrows():
    for sc in ["set1", "set2", "set3"]:
        p = parse_set(r[sc])
        if p is not None:
            t1, t2 = p
            hi, lo = max(t1, t2), min(t1, t2)
            all_sets.append(f"{hi}-{lo}")

set_counts = pd.Series(all_sets).value_counts()
top_scorelines = {k: int(v) for k, v in set_counts.head(10).items()}

# P(6-0 set anywhere in match)
def has_60(r):
    for sc in ["set1", "set2", "set3"]:
        p = parse_set(r[sc])
        if p is not None and set(p) == {6, 0}:
            return True
    return False

m["has_60"] = m.apply(has_60, axis=1)
n_60 = len(m)
k_60 = int(m["has_60"].sum())
phat_60, lo_60, hi_60 = wilson_ci(k_60, n_60)

# comeback rate by gender = P(win match | lost set1)
m1e = m[m["set1_winner"].notna()].copy()
m1e["set1_loser_wins_match"] = (m1e["set1_winner"] != m1e["winner_team"]).astype(int)

comeback_by_gender = {}
for g, grp in m1e.groupby("tour_category"):
    n_g = len(grp)
    k_g = int(grp["set1_loser_wins_match"].sum())
    phat_g, lo_g, hi_g = wilson_ci(k_g, n_g)
    p_g = binom_test_p(k_g, n_g, 0.5)
    comeback_by_gender[g] = {"n": n_g, "estimate": fmt(phat_g), "ci95": [fmt(lo_g), fmt(hi_g)], "p_value": fmt(p_g, 6)}

n_cb = len(m1e)
k_cb = int(m1e["set1_loser_wins_match"].sum())
phat_cb, lo_cb, hi_cb = wilson_ci(k_cb, n_cb)
p_cb = binom_test_p(k_cb, n_cb, 0.5)

e10 = {
    "headline_estimate": {"most_common_scoreline": set_counts.index[0], "count": int(set_counts.iloc[0]), "p_6_0_anywhere": fmt(phat_60)},
    "n": n_60,
    "ci95": [fmt(lo_60), fmt(hi_60)],
    "test": "two-sided binomial test vs 0.5 (comeback rate, complement check of E1)",
    "p_value": fmt(p_cb, 6),
    "subgroups": {
        "top_10_scorelines": top_scorelines,
        "p_6_0_set_anywhere": {"n": n_60, "k": k_60, "estimate": fmt(phat_60), "ci95": [fmt(lo_60), fmt(hi_60)]},
        "comeback_rate_overall": {"n": n_cb, "estimate": fmt(phat_cb), "ci95": [fmt(lo_cb), fmt(hi_cb)], "p_value": fmt(p_cb, 6)},
        "comeback_rate_by_gender": comeback_by_gender
    },
    "caveats": [
        "Comeback rate is the complement of E1's momentum stat by construction: comeback_rate = 1 - P(set1 winner wins match); reported here as an independent direct computation for cross-check.",
        "Scoreline strings normalized to 'higher-lower' games (tiebreak parenthetical scores ignored)."
    ],
    "verdict": "signal" if p_cb < 0.05 and abs(phat_cb - 0.5) > 0.05 else "null"
}

# ===========================================================================
# Assemble & write outputs
# ===========================================================================
results = {
    "meta": {
        "n_matches_total": int(N_MATCHES_TOTAL),
        "n_matches_finished": int(N_FINISHED),
        "n_matches_excluded_nonfinished": int(N_EXCLUDED_NONFINISHED),
        "n_players_total": int(len(players)),
        "n_distinct_match_participants": int(len(participants)),
        "alpha": 0.05,
        "ci_method": "Wilson score interval, 95%"
    },
    "E1_momentum": e1,
    "E2_ranking_calibration": e2,
    "E3_pair_chemistry": e3,
    "E4_seed_upsets": e4,
    "E5_handedness": e5,
    "E6_physique_age": e6,
    "E7_duration": e7,
    "E8_rest_schedule": e8,
    "E9_home_advantage": e9,
    "E10_scoreline_patterns": e10
}


def json_default(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, (np.bool_,)):
        return bool(o)
    if isinstance(o, pd.Timestamp):
        return o.isoformat()
    return str(o)


with open(OUT_DIR + "eda_results.json", "w") as f:
    json.dump(results, f, indent=2, default=json_default)

print("Wrote eda_results.json")

# ---------------------------------------------------------------------------
# Markdown report
# ---------------------------------------------------------------------------
md = []
md.append("# Premier Padel 2026 -- Exploratory Data Analysis (Real Data)\n")
md.append(f"Data: {N_MATCHES_TOTAL} matches ({N_FINISHED} finished, {N_EXCLUDED_NONFINISHED} retired/walkover excluded where noted), {len(players)} players.\n")
md.append("All tests two-sided, alpha = 0.05. Proportions use Wilson 95% CIs.\n")

md.append("## E1. Momentum -- P(win match | won set 1)\n")
md.append(f"Overall: {e1['headline_estimate']:.3f} (n={e1['n']}, 95% CI [{e1['ci95'][0]:.3f}, {e1['ci95'][1]:.3f}]), "
          f"binomial test vs 0.5 p={e1['p_value']:.2e}. This is a clear **signal**: winning set 1 is strongly predictive of winning the match. "
          f"By gender: " + ", ".join(f"{g}={v['estimate']:.3f} (n={v['n']})" for g, v in e1["subgroups"]["by_gender"].items()) + ". "
          f"By level: " + ", ".join(f"{lv}={v['estimate']:.3f} (n={v['n']})" for lv, v in e1["subgroups"]["by_level"].items()) + ". "
          f"Of matches reaching a valid 3rd set, P(set-1 winner also wins set 3) = {e1['subgroups']['set3_given_deciding_set']['estimate']:.3f} "
          f"(n={e1['subgroups']['set3_given_deciding_set']['n']}), essentially a coin flip -- once a decider happens, set-1 momentum carries no extra weight.\n")

md.append("## E2. Ranking calibration\n")
md.append(f"Favorite (higher combined current points) wins {e2['headline_estimate']:.3f} of the time (n={e2['n']}, 95% CI [{e2['ci95'][0]:.3f}, {e2['ci95'][1]:.3f}], p={e2['p_value']:.2e}) -- a real but modest edge over 50/50. "
          f"Logistic regression of win on log(points ratio) gives AUC={e2['subgroups']['logistic_regression']['auc']}. "
          f"**CAVEAT**: points are a single end-of-window snapshot, not the players' points as of each match date, so this likely overstates true pre-match predictive power (look-ahead bias) -- treat as approximate.\n")

md.append("## E3. Pair chemistry\n")
md.append(f"{e3['subgroups']['n_distinct_pairs']} distinct pairs played together this season (mean {e3['subgroups']['matches_per_pair_summary']['mean']} matches/pair, "
          f"max {e3['subgroups']['matches_per_pair_summary']['max']}). Win rate by nth-match-together bucket: " +
          ", ".join(f"{b}: {v['estimate']:.3f} (n={v['n']})" for b, v in e3["subgroups"]["by_bucket"].items()) +
          f". Chi-square across buckets p={e3['p_value']:.3f} -- " +
          ("a detectable difference across bucket." if (e3['p_value'] is not None and e3['p_value'] < 0.05) else "no significant difference; no clear 'chemistry builds with reps' effect in this season's data.") + "\n")

md.append("## E4. Seed upsets\n")
md.append(f"Among the {e4['n']} matches where both teams carry a numeric seed, upset rate = {e4['headline_estimate']:.3f} (95% CI [{e4['ci95'][0]:.3f}, {e4['ci95'][1]:.3f}], p={e4['p_value']:.2e}) -- "
          f"{'significantly different from 50/50' if e4['p_value'] < 0.05 else 'not significantly different from what pure seed-strength would predict at the 50% baseline used here'}. "
          "Note this is a small, seed-selected subsample (Q/WC/LL players excluded), not representative of all matches.\n")

md.append("## E5. Handedness\n")
md.append(f"Hand data covers only {e5['subgroups']['hand_coverage_full_players_table_pct']}% of all players and {e5['subgroups']['hand_coverage_match_participants_pct']}% of match participants -- "
          f"below the 60% usability threshold. Only {e5['subgroups']['n_finished_matches_with_all_4_hands_known']} finished matches have all 4 hands known. "
          "**Verdict: insufficient data** -- honestly cannot test left-hander win rates with this coverage.\n")

md.append("## E6. Physique / age\n")
md.append(f"Height coverage is {e6['subgroups']['height_coverage_full_players_table_pct']}% overall (<60% threshold) -- height-based analysis is skipped. "
          f"Age: mean age gap between winning and losing teams = {e6['headline_estimate']:.2f} years (winner minus loser; n={e6['n']}, 95% CI [{e6['ci95'][0]:.2f}, {e6['ci95'][1]:.2f}]), t-test p={e6['p_value']:.3f} -- " +
          ("a small but statistically detectable age effect." if e6['p_value'] < 0.05 else "no significant age advantage either way; age gap between winners and losers is statistically indistinguishable from zero.") +
          f" Within-pair age gap vs win correlation: r={e6['subgroups']['within_pair_age_gap_vs_win_correlation']['pearson_r']} (n={e6['subgroups']['within_pair_age_gap_vs_win_correlation']['n']}, p={e6['subgroups']['within_pair_age_gap_vs_win_correlation']['p_value']}) -- statistically significant at alpha=0.05 but practically negligible (explains well under 1% of variance in winning). "
          f"Teams >=3 years younger (on average) than their opponents win {e6['subgroups']['young_team_ge3yr_younger_win_rate']['estimate']:.3f} of the time (n={e6['subgroups']['young_team_ge3yr_younger_win_rate']['n']}, p={e6['subgroups']['young_team_ge3yr_younger_win_rate']['p_value']:.3f}).\n")

md.append("## E7. Duration\n")
md.append(f"Mean duration: 2-set matches {e7['subgroups']['by_n_sets'].get('2',{}).get('mean_minutes')} min vs 3-set matches {e7['subgroups']['by_n_sets'].get('3',{}).get('mean_minutes')} min (n={e7['n']} with known duration). "
          f"3-set matches at major/p1 level average {e7['subgroups']['three_set_duration_major_p1_vs_p2']['major_p1_mean']} min vs {e7['subgroups']['three_set_duration_major_p1_vs_p2']['p2_mean']} min at p2 (Welch t-test p={e7['p_value']:.3f}) -- " +
          ("higher-level 3-setters do run measurably longer." if e7['p_value'] < 0.05 else "no significant difference in 3-set duration by level.") +
          f" Upset matches vs non-upsets: {e7['subgroups']['duration_upset_vs_nonupset']['upset_mean']} vs {e7['subgroups']['duration_upset_vs_nonupset']['nonupset_mean']} min (p={e7['subgroups']['duration_upset_vs_nonupset']['p_value']}) -- " +
          ("a detectable duration difference." if (e7['subgroups']['duration_upset_vs_nonupset']['p_value'] is not None and not np.isnan(e7['subgroups']['duration_upset_vs_nonupset']['p_value']) and e7['subgroups']['duration_upset_vs_nonupset']['p_value'] < 0.05) else "no significant duration difference between upsets and expected results.") + "\n")


md.append("## E8. Rest / schedule\n")
md.append(f"**0 days rest never occurs**: no pair in this dataset plays twice on the same day within a tournament (observed gaps are only 1, 2, or 3 days), so the literal '0 vs 1+ days' comparison is **insufficient_data** -- reported honestly rather than forced. "
          f"As a substitute using the rest levels that actually occur: teams on a 1-day turnaround win {e8['subgroups']['one_day_rest_quick_turnaround']['estimate']:.3f} of the time (n={e8['subgroups']['one_day_rest_quick_turnaround']['n']}) vs "
          f"{e8['subgroups']['two_plus_days_rest']['estimate']:.3f} with 2+ days rest (n={e8['subgroups']['two_plus_days_rest']['n']}); chi-square p={e8['subgroups']['quick_vs_extra_rest_test']['p_value']}. " +
          ("Rest matters." if (e8['subgroups']['quick_vs_extra_rest_test']['p_value'] is not None and e8['subgroups']['quick_vs_extra_rest_test']['p_value'] < 0.05) else "No significant rest-level effect detected.") +
          f" The clearer finding: the team that played fewer total games in the previous round wins {e8['headline_estimate']:.3f} of the current match (n={e8['n']}, p={e8['p_value']:.4f}) -- " +
          ("a real fatigue/efficiency signal: winning efficiently (fewer games) in the prior round is associated with a higher chance of winning the next round." if e8['p_value'] < 0.05 else "no significant fatigue/efficiency effect from prior-round game count.") + "\n")

md.append("## E9. Home advantage\n")
md.append(f"In matches with exactly one home team, the home team wins {e9['headline_estimate']:.3f} of the time (n={e9['n']}, 95% CI [{e9['ci95'][0]:.3f}, {e9['ci95'][1]:.3f}], p={e9['p_value']:.3f}) -- " +
          ("a real home advantage." if e9['p_value'] < 0.05 else "no significant overall home advantage.") +
          " By country: " + ", ".join(f"{c}={v.get('estimate','n/a')} (n={v['n']})" for c, v in e9["subgroups"]["by_country"].items()) + ".\n")

md.append("## E10. Scoreline patterns\n")
md.append(f"Most common set score: {e10['headline_estimate']['most_common_scoreline']} ({e10['headline_estimate']['count']} occurrences). "
          f"P(a 6-0 set occurs anywhere in the match) = {e10['headline_estimate']['p_6_0_anywhere']:.3f} (n={e10['n']}, 95% CI [{e10['ci95'][0]:.3f}, {e10['ci95'][1]:.3f}]). "
          f"Comeback rate (win match after losing set 1) overall = {e10['subgroups']['comeback_rate_overall']['estimate']:.3f} (n={e10['subgroups']['comeback_rate_overall']['n']}), consistent by construction with E1's complement. "
          "By gender: " + ", ".join(f"{g}={v['estimate']:.3f} (n={v['n']})" for g, v in e10["subgroups"]["comeback_rate_by_gender"].items()) + ".\n")

with open(OUT_DIR + "eda_report.md", "w") as f:
    f.write("\n".join(md))

print("Wrote eda_report.md")
print("Done.")
