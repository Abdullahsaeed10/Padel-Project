# Premier Padel 2026 -- Exploratory Data Analysis (Real Data)

Data: 776 matches (763 finished, 13 retired/walkover excluded where noted), 2165 players.

All tests two-sided, alpha = 0.05. Proportions use Wilson 95% CIs.

## E1. Momentum -- P(win match | won set 1)

Overall: 0.862 (n=763, 95% CI [0.836, 0.885]), binomial test vs 0.5 p=1.15e-98. This is a clear **signal**: winning set 1 is strongly predictive of winning the match. By gender: men=0.862 (n=449), women=0.863 (n=314). By level: p1=0.865 (n=333), p2=0.858 (n=345), major=0.871 (n=85). Of matches reaching a valid 3rd set, P(set-1 winner also wins set 3) = 0.493 (n=207), essentially a coin flip -- once a decider happens, set-1 momentum carries no extra weight.

## E2. Ranking calibration

Favorite (higher combined current points) wins 0.785 of the time (n=763, 95% CI [0.754, 0.813], p=5.65e-59) -- a real but modest edge over 50/50. Logistic regression of win on log(points ratio) gives AUC=0.8832. **CAVEAT**: points are a single end-of-window snapshot, not the players' points as of each match date, so this likely overstates true pre-match predictive power (look-ahead bias) -- treat as approximate.

## E3. Pair chemistry

230 distinct pairs played together this season (mean 6.63 matches/pair, max 51). Win rate by nth-match-together bucket: 1-3: 0.398 (n=488), 4-8: 0.453 (n=400), 9-15: 0.519 (n=289), 16+: 0.682 (n=349). Chi-square across buckets p=0.000 -- a detectable difference across bucket.

## E4. Seed upsets

Among the 165 matches where both teams carry a numeric seed, upset rate = 0.224 (95% CI [0.167, 0.294], p=6.10e-13) -- significantly different from 50/50. Note this is a small, seed-selected subsample (Q/WC/LL players excluded), not representative of all matches.

## E5. Handedness

Hand data covers only 6.4% of all players and 38.4% of match participants -- below the 60% usability threshold. Only 368 finished matches have all 4 hands known. **Verdict: insufficient data** -- honestly cannot test left-hander win rates with this coverage.

## E6. Physique / age

Height coverage is 33.8% overall (<60% threshold) -- height-based analysis is skipped. Age: mean age gap between winning and losing teams = -0.22 years (winner minus loser; n=763, 95% CI [-0.63, 0.18]), t-test p=0.277 -- no significant age advantage either way; age gap between winners and losers is statistically indistinguishable from zero. Within-pair age gap vs win correlation: r=-0.0574 (n=1526, p=0.0249) -- statistically significant at alpha=0.05 but practically negligible (explains well under 1% of variance in winning). Teams >=3 years younger (on average) than their opponents win 0.508 of the time (n=484, p=0.750).

## E7. Duration

Mean duration: 2-set matches 79.0 min vs 3-set matches 135.5 min (n=755 with known duration). 3-set matches at major/p1 level average 137.2 min vs 133.2 min at p2 (Welch t-test p=0.612) -- no significant difference in 3-set duration by level. Upset matches vs non-upsets: 141.2 vs 89.4 min (p=0.024124) -- a detectable duration difference.

## E8. Rest / schedule

**0 days rest never occurs**: no pair in this dataset plays twice on the same day within a tournament (observed gaps are only 1, 2, or 3 days), so the literal '0 vs 1+ days' comparison is **insufficient_data** -- reported honestly rather than forced. As a substitute using the rest levels that actually occur: teams on a 1-day turnaround win 0.400 of the time (n=618) vs 0.302 with 2+ days rest (n=86); chi-square p=0.105685. No significant rest-level effect detected. The clearer finding: the team that played fewer total games in the previous round wins 0.597 of the current match (n=233, p=0.0039) -- a real fatigue/efficiency signal: winning efficiently (fewer games) in the prior round is associated with a higher chance of winning the next round.

## E9. Home advantage

In matches with exactly one home team, the home team wins 0.431 of the time (n=109, 95% CI [0.342, 0.525], p=0.180) -- no significant overall home advantage. By country: ES=0.6176 (n=34), IT=0.4118 (n=17), FR=0.2 (n=5), SA=0.0 (n=4).

## E10. Scoreline patterns

Most common set score: 6-3 (399 occurrences). P(a 6-0 set occurs anywhere in the match) = 0.106 (n=763, 95% CI [0.086, 0.130]). Comeback rate (win match after losing set 1) overall = 0.138 (n=763), consistent by construction with E1's complement. By gender: men=0.138 (n=449), women=0.137 (n=314).
