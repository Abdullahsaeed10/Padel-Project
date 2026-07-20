# PadelLens Insights - Method Notes (per figure)

Full methodology for each figure on the Insights page. Removed from the app UI for readability; kept here for the exam dossier.

## 1. momentum (set-1 winner win rate)

Method: analytics.momentum_table on the real 2026 feed, Wilson 95% CI per group (error bars); grouped by tour category and tournament level in place of court surface (this replaces the surface split so the chart doesn't break on it). n per group: Overall=668, Men=389, Women=279, Major=79, P1=292, P2=297. Deciding-set check: of 153 matches that reached a valid third set, the set-1 winner also won set 3 in 74 (48%, Wilson 95% CI 41-56%) — the interval straddles 50%, so the set-1 edge does not carry into the decider.

## 2. chemistry (win rate by matches together)

Method: analytics.pair_chemistry, Wilson 95% CI per bucket (error bars); n shown on each bar. Buckets partition every (pair, match) row, so they sum to 1552 = 2 x 776 matches.

## 3. calibration (logistic model deciles)

Method: analytics.fit_win_model (logistic regression on ranking_gap / height_gap / surface_indoor), n_used=776 of n_total=776 matches with complete player data; points are deciles of predicted probability.

## 4. elo_vs_ranking (Elo vs official points)

Method: analytics.compute_elo (K=32, base=1500) over n=776 matches, joined to pro_players.ranking_points; both axes shown as percentile rank (n_players=279) since Elo and ranking points are on very different scales. Over/under-performer callouts restricted to players with >=10 matches (122 of 279) to avoid small-sample Elo noise.

## 5. upsets (by round)

Method: upset = winner's numeric seed > loser's numeric seed (both teams numerically seeded; WC/Q/LL/LLI/unseeded matches excluded). Two-sided binomial test vs 50%, p<0.001. Wilson 95% CI per round. n=165 seeded finished matches overall (37 upsets, 22.4%, CI 16.7-29.4%); per round: Round of 16=31, Quarter=67, Semifinals=43, Finals=24.

## 6. efficiency (previous-round games)

Method: two-sided binomial test vs 50% on whether the team that played fewer total games in its previous round (same tournament) wins the next match; n=233 team-observations with a known previous-round game count, p=0.004. Wilson 95% CI per bar. Verified count reused from 02_Data/eda/eda_results.json (E8) rather than recomputed in-app.

## 7. home_null (no home advantage)

Method: home = at least one player's nationality equals the tournament host country; matches where both or neither team was home are excluded. n=109 matches with exactly one home team, two-sided binomial test vs 50%, p=0.18 (not significant). Numbers reused from 02_Data/eda/eda_results.json (E9) rather than re-derived independently — an honest null deserves the same rigor as a signal.
