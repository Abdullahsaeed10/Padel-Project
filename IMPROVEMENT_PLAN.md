# PadelLens — Improvement Plan (21/30 → target 27+)

Built directly on `PadelLens_DV4S_ProjectEvaluation.pdf` and the professor's written answer to your question.

---

## 1. Diagnosis — what actually cost the marks

| # | Evaluation note | Severity | Root cause |
|---|---|---|---|
| A | "Insights are properties built into invented data … analytical loop essentially circular" | **Decisive** | The generator script *created* the 80% partner and −40 pp fatigue stories; nothing was discovered. |
| B | "No data exploration was realized to find novel insights" + Q&A answer | **Decisive** | The app *describes* data (rankings, win rates); it never *finds* relationships or correlations. |
| C | "Pro layer … quite small" | High | 30 players / 276 matches — too thin to explore anything. |
| D | "Validation is essentially absent — no user testing or SUS score, heuristic eval reports only two changes" | High | The design→develop→**validate** loop was never closed. |
| E | "Standard Streamlit/Plotly, single-user, without any modelling/analytical tool" | Medium | No statistics, no model, CSV-only, one user. |
| F | "Personas … not clear what was their foundation" | Medium | Marco/Luca invented, not derived from any research. |
| G | "Accessibility checks … not clear if realized and tested with real users" | Medium | Claimed on paper, never demonstrated. |
| H | "Only the Shot DNA case study is well reasoned" | Medium | Other 8 charts justified in one line each; no real alternatives analysis. |
| I | "Placeholder template text left in slides, inconsistent section numbering" | Low but visible | Rushed finishing — cheap points lost. |

**The professor's own words define the winning move:** *"find novel relationships, correlations, etc. to provide the user with, by using effective data viz approaches."* Everything below is organized around that.

---

## 2. Strategy in one sentence

Turn PadelLens from a **dashboard that displays numbers** into an **analytical product that discovers insights in real data, proves them statistically, communicates each one with a purpose-built visualization, and is validated by real users**.

---

## 3. Phase 1 — Rebuild the data foundation (fixes A, C)

### 1a. Grow the pro dataset (real, large)
- Upgrade the [Padel API](https://padelapi.org/) pull: free tier gives 50K requests/month, current rankings and 6 months of match results. Target **full 2025 + 2026 Premier Padel seasons: all tournaments, every round, 1,500+ matches, full top-100 rankings with evolution over time** (paid tier unlocks history — or scrape Premier Padel results pages as fallback, documenting the scraper as part of the §2 pipeline).
- Enrich `pro_players.csv`: side (drive/revés), handedness, height, birth year, nationality, **current pair + pair history** (pair changes are public news).
- Document the whole pipeline (acquisition → cleaning → validation → storage) — the rubric explicitly asks for "the whole pipeline".

### 1b. Make the personal layer real — and make it double as validation
Replace the seeded log with **genuinely logged data**:
- Log **your own matches** from now until the exam (even 10–15 real matches).
- Recruit **3–5 club players** to log their matches for 3–4 weeks through the app. This one action simultaneously fixes: real data (A), user testing + SUS participants (D), and persona foundation (F).
- Keep the synthetic generator **only** as a documented "demo mode" toggle, clearly labeled — the honesty was credited, keep it.

**Critical rule from now on: never state an insight you decided in advance. Only report what the analysis surfaced.**

---

## 4. Phase 2 — Data Exploration → novel insights (fixes B — the core)

Run a real EDA campaign on the enlarged pro dataset. Each candidate below is a genuinely open question — you don't know the answer until you run it, which is exactly what "discovery" means. For each finding: statistical test + effect size + a chart chosen to make it undeniable.

### Candidate insights — pro layer

| # | Question | Method | Visualization if it lands |
|---|---|---|---|
| E1 | **Does winning set 1 decide the match?** How big is momentum, and does it differ indoor vs outdoor? | Conditional probability + chi-square | Slope/flow chart: P(win match \| won set 1) vs (lost set 1), faceted by surface |
| E2 | **Ranking-gap calibration** — a 2,000-point gap should predict what win probability? Is the official ranking well calibrated? | Logistic regression, calibration curve | Calibration plot: predicted vs actual win rate by gap decile, with CI band |
| E3 | **Pair chemistry curve** — do pairs improve with matches played together? Where does the curve flatten? | Win rate vs matches-together, LOWESS | Line with confidence band; annotate the "chemistry threshold" |
| E4 | **New-pair shock** — win rate of pairs in their first N matches after a split vs established pairs | Two-group comparison, Wilson CIs | Dumbbell / diverging bars |
| E5 | **Handedness advantage** — do pairs with a left-hander on the drive side overperform? | Win-rate comparison controlled by ranking gap | Small multiples by pair configuration |
| E6 | **Height/physique** — does within-pair height difference or absolute height correlate with success or style (smash share)? | Correlation + scatter | Scatter with regression line, players as points |
| E7 | **Where do upsets live?** — upset rate by round (R32→final) and by tournament category (Major/P1/P2) | Upset % per stratum | Heatmap round × category |
| E8 | **Duration signal** — do longer matches favor the underdog? | Logistic: upset ~ duration | Binned dot plot with trend |
| E9 | **Fatigue on tour** — performance in back-to-back match days / deep runs in consecutive tournaments | Win rate by rest days | Line/column with annotation |
| E10 | **Home advantage** — Spanish pairs in Spain, Argentine pairs in Argentina? | Chi-square | Diverging bar per country |

Pick the **4–6 that turn out interesting** (positive OR null — a well-proven "no, there is no home advantage in padel" is also a novel insight, and saying so shows scientific maturity).

### Candidate insights — personal layer (once real logs exist)
- Partner × surface interaction (not just partner main effect).
- Rest days between matches vs result.
- Error-rate drift across sets within a match (real fatigue measurement, not seeded).
- Your shot mix vs the pro reference distribution — now computed from real pro data.

### Deliverables for this phase
- `02_Data/02_exploration.ipynb` — the honest EDA notebook (show it in the presentation: "this is where I discovered…").
- A new **"Insights" page in the app**: each discovered finding as a card → chart + plain-language takeaway + method note ("n=1,542 matches, p<0.01").

---

## 5. Phase 3 — Analytical & modelling depth (fixes E)

Three models, each feeding a visualization — modelling in service of viz, not for its own sake:

1. **Elo rating engine for pairs/players** built from match results. The story: *Elo vs official ranking points* scatter — the off-diagonal players are "under/over-rated by the official system". This is a genuinely novel, presentation-worthy insight machine.
2. **Match-win probability model** (logistic regression: ranking gap, surface, pair-tenure, side balance). Show coefficients as a tornado chart; show the calibration plot (E2). In-app: select two pairs → predicted win probability with uncertainty.
3. **Player archetype clustering** (k-means on stat profiles: smash share, bandeja share, error rate…). Radar per cluster centroid: "the 4 ways to play pro padel" — and the amateur user gets told which archetype they resemble.

Plus one **trustworthiness upgrade** that costs little and impresses much: every win-rate in the app gets a **Wilson confidence interval**, and personal insights only display when n is sufficient ("Not enough matches yet to say — log 3 more"). This directly demonstrates the course's *trustworthy* principle and defuses any small-n criticism.

---

## 6. Phase 4 — Close the validation loop (fixes D, F, G)

1. **Ground the personas**: 10-minute survey + 3 short interviews with real club players (the same recruits from Phase 1b). One slide: "Marco is built from 8 survey answers and 3 interviews — here are the quotes."
2. **Task-based user testing**: 5 users × 5 tasks (log a match, find your best partner, read the fatigue chart, …), think-aloud, measure completion & errors.
3. **SUS questionnaire** after each session — report the score explicitly (n=5, average, benchmark vs 68). The evaluation literally names SUS; give the professor exactly that.
4. **Iterate and show it**: before/after screenshots of at least 3–4 design changes caused by testing. The loop must be visible: *found in testing → changed → retested*.
5. **Heuristic evaluation, round 2**: have 1–2 classmates evaluate against Nielsen's 10 (external evaluators, not self), log every finding, fix, and re-score. Target: a findings table with 6–10 items, not 2.
6. **Accessibility, demonstrated**: screenshots of Coblis/colorblind simulation of your actual charts, real WCAG contrast report, and ideally one grayscale printout test. If any tester has color-vision deficiency, gold.

---

## 7. Phase 5 — Technical upgrades (fixes E)

- **SQLite (or Supabase) instead of CSVs** + simple multi-user profiles (`streamlit-authenticator`): "single-user" criticism gone with ~1 day of work.
- `analytics.py` module: Elo, logistic model, clustering, CIs (scipy / statsmodels / scikit-learn) — cleanly separated from the UI.
- Cache layers (`st.cache_data`) for the bigger dataset; document the architecture diagram for rubric §5.
- Deploy to Streamlit Community Cloud → the "works as a web app" cross-platform point becomes a live URL in the deck.

---

## 8. Phase 6 — Design depth & polish (fixes H, I)

1. **Two or three more chart case studies at Shot-DNA depth.** The evaluation praised exactly one. Do the same treatment (question → 3 alternatives → head-to-head reasoning → winner) for: the Elo-vs-ranking scatter, the calibration curve, and the chemistry curve. Tie each to CHRTS chart families explicitly.
2. **Slide hygiene**: strip every placeholder, renumber all sections 1–6 consistently, one visual template. Have someone else proofread — this criticism was free marks lost.
3. **Restructure the deck around discoveries**: the demo section becomes "three things I discovered in the data and how the visualization proves them". Lead with findings, not features.
4. Presentation ≥30 min, walking the full process: Brief → Pipeline → EDA/discoveries → UX + validation loop → encoding case studies → live demo → future work.

---

## 9. Priorities & timeline

If time is short, the grade-per-hour ordering is:

1. **Weeks 1–2 — Data + Exploration (Phases 1–2).** This answers the professor's explicit note; nothing else matters if this is missing.
2. **Weeks 2–4 — Validation (Phase 4)** runs in parallel (recruit players early — it has calendar lead time).
3. **Week 3 — Modelling (Phase 3).** Elo + win model + CIs.
4. **Week 4 — Tech upgrades (Phase 5).**
5. **Final week — Case studies, deck rebuild, polish, rehearsal (Phase 6).**

---

## 10. Coverage check — every evaluation sentence → a fix

| Evaluation criticism | Answered by |
|---|---|
| Circular synthetic insights | Phase 1b (real logs), Phase 2 (discovered insights only) |
| No data exploration / novel insights (Q&A) | Phase 2 (EDA campaign, Insights page), Phase 3 (Elo, calibration, clusters) |
| Pro layer too small | Phase 1a (full seasons, 1,500+ matches) |
| No user testing / SUS / thin heuristic eval | Phase 4 (SUS n=5, task testing, external Nielsen round 2) |
| Personas without foundation | Phase 4.1 (survey + interviews) |
| Accessibility not demonstrated | Phase 4.6 (simulations, contrast report, testers) |
| No modelling/analytical tools | Phase 3 (3 models + CIs) |
| Single-user, standard stack | Phase 5 (DB, auth, analytics module, deployment) |
| Only Shot DNA well reasoned | Phase 6.1 (3 more case studies) |
| Placeholders, inconsistent numbering | Phase 6.2 (slide hygiene + external proofread) |

**Sources:** [Padel API](https://padelapi.org/) · [Fantasy Padel Tour API](https://en.fantasypadeltour.com/docs) (fallback data source)
