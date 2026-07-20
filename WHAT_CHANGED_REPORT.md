# PadelLens — Resubmission Report: What Changed and Why

**Student:** Abdullah Saeed Aly Elhusseiny · **Course:** Data Visualization for Sport (DV4S), Politecnico di Milano, AY 2025/26
**Reference:** First submission graded 21/30 (`PadelLens_DV4S_ProjectEvaluation.pdf`). This document maps every change in the current project to the specific criticism it answers.

---

## 1. The project as it was (first submission, 21/30)

PadelLens was a Streamlit/Plotly web app for amateur padel players with five pages (Home, Pro Tour, My Stats, Log Match, Compare). Its strengths, per the evaluation: a well-articulated brief, explicit Angle/Framing/Focus, one well-reasoned chart case study (Shot DNA), a documented color/accessibility system. Its decisive weaknesses:

1. The personal "My Match Log" — the heart of the value proposition — ran on **synthetic, user-seeded data**, so every headline insight (80% partner win rate, −40 pp fatigue) was **built into the data, not discovered** ("analytical loop essentially circular").
2. The pro layer used a real API but was **small** (30 players, 276 demo matches) and **no data exploration was performed to find novel insights** — the professor's central point, repeated in his written answer to my question.
3. **Validation was absent**: no user testing, no SUS score, heuristic evaluation produced only two changes.
4. Technically it was a **standard single-user Streamlit app with no modelling or analytical tools**.
5. Personas had **no research foundation**; accessibility checks were claimed but not demonstrated.
6. The deliverable was **unfinished**: placeholder template text in slides, inconsistent section numbering.

## 2. What changed, criticism by criticism

### 2.1 "Synthetic core data / circular analytical loop" → real data foundation

- Acquired the **real 2026 Premier Padel season** through the padelapi.org REST API (my own API key): **776 completed matches, 26 tournaments, full draws from Round-of-64 to Finals, men's and women's competitions, with seeds, player IDs, court sides, and match durations**, plus the **full player directory: 2,165 professional players** with current ranking, points, age, and nationality.
- The pipeline is engineered, not improvised: `02_Data/fetch_padelapi.py` (rate-limit-throttled, restartable, archives every raw API response to `02_Data/real/raw/*.jsonl` before any transformation) and `02_Data/build_real_csv.py` (separate, auditable cleaning step). During examination we discovered the API returns scores in a different format than documented — finding and fixing that is itself §2 "Examination" evidence, documented in `02_Data/02_pipeline_real_data.md`.
- The synthetic personal log still exists but is **demoted and labeled**: every personal page shows a visible "SYNTHETIC DEMO DATA" badge. No conclusion in the project is drawn from it anymore.

### 2.2 "No data exploration to find novel insights" → a real EDA with discovered findings

This was the professor's core request. A systematic exploration (`02_Data/eda/`: `exploration.py`, `eda_results.json`, `eda_report.md`) tested ten hypotheses on the real data with two-sided statistical tests and Wilson confidence intervals. **Discovered — not assumed:**

| Finding | Result |
|---|---|
| Momentum | Set-1 winners win the match **86%** of the time (n=668, p<0.001) — but win a deciding third set only **~49%**: momentum resets in the decider |
| Pair chemistry | Win rate climbs **~40% → ~67%** from 1–3 to 16+ matches together (p<0.001; survivorship caveat stated) |
| Ranking power | The team with more combined ranking points wins **78.5%** (logistic model, AUC 0.88; snapshot caveat stated) |
| Upsets | Only **22.4%** of seeded matches; non-monotonic by round — Finals are ≈50/50 |
| Efficiency | The team that spent fewer games in its previous round wins **59.7%** of the next match (n=233, p=0.004) |
| Elo vs ranking | An Elo rating built purely from 2026 results flags over-performers the official ranking underrates (De Pascual, Rodriguez Martinez, Valenzuela) |
| **Honest nulls** | **No home advantage** (43%, p=0.18), no age-gap effect, handedness/height data insufficient — reported openly as evidence of trustworthy analysis |

Headline numbers were independently re-computed before publication.

### 2.3 "No modelling/analytical tool" → analytics module

New `05_App/PadelLens/analytics.py`, unit-tested (12/12 passing, `tests/`): per-player **Elo engine**, **logistic win-probability model** with decile calibration, **momentum tables**, **pair-chemistry curves**, and **Wilson confidence intervals** used on every win rate in the app, with a small-sample guard (n<10 → the app refuses to make a claim).

### 2.4 "Standard single-user Streamlit app" → upgraded architecture

- **SQLite database** (`db.py`, `build_db.py`) replaces raw CSV reads; includes a `users` table — the schema is multi-user-ready.
- Data loaders are **real-data-aware**: pro pages read the real 2026 dataset and caption their source; a data-provenance caption appears on every pro view.
- New **Insights page** (`pages/5_Insights.py`): seven discovery cards, each with a purpose-built chart, an in-canvas annotation carrying the headline, and a method note (test, n, p-value) under the chart.
- Launcher `run_app.bat` (project root): installs, builds the DB, starts the app — tested end-to-end on this machine (database confirms 776 rows, source=real).

### 2.5 "Validation essentially absent" → instruments built, sessions honest

`07_Validation/` now contains the complete instrument pack: persona-grounding survey (EN/IT), interview guide, SUS questionnaire with scoring sheet, task-based user-testing protocol, and a heuristic-evaluation round-2 template for external evaluators. **Status presented honestly: instruments ready, sessions with real club players scheduled — no SUS score is invented.** This also answers "personas without foundation": the survey/interview results will ground Marco and Luca in real respondents.

### 2.6 "Only one well-reasoned chart case study" → three more at the same depth

`04_Visual_Encoding/02_case_studies.md`: the momentum **slope chart**, the chemistry **line with CI band and survivorship annotation**, and the calibration **lollipop** — each argued against rejected alternatives with perceptual reasoning and accessibility notes, in the same format as the praised Shot DNA study.

### 2.7 "Placeholder text, inconsistent numbering" → new deck, machine-verified

`06_Presentation/PadelLens_Deck_v2.pptx` — 32 slides, built fresh: opening "What changed since the first submission" slide, consistent §1–§6 numbering with sequential footers, speaker notes (55–121 words) on every slide, native charts for the case studies, honest "validation in progress" status. Programmatically verified: zero placeholder strings, zero empty notes, plus a visual QA render of all 32 slides.

## 3. New and changed files (inventory)

| Area | Files |
|---|---|
| Planning & tracking | `IMPROVEMENT_PLAN.md`, `PROGRESS_LOG.md` (every action dated, with the criticism it addresses), `PRESENTATION_CHEATSHEET.md`, this report |
| Data pipeline | `02_Data/fetch_padelapi.py`, `02_Data/build_real_csv.py`, `02_Data/run_fetch.bat`, `02_Data/02_pipeline_real_data.md`, `02_Data/real/` (CSVs + raw JSONL archives) |
| Exploration | `02_Data/eda/exploration.py`, `eda_results.json`, `eda_report.md` |
| Application | `05_App/PadelLens/analytics.py`, `tests/`, `db.py`, `build_db.py`, `pages/5_Insights.py`, `data/findings.json`; modified: `Dashboard.py`, all pages, `utils.py`, `requirements.txt`, `README.md`; launcher `run_app.bat` |
| Design | `04_Visual_Encoding/02_case_studies.md` |
| Validation | `07_Validation/` (5 instruments) |
| Presentation | `06_Presentation/PadelLens_Deck_v2.pptx` |

## 4. Still open (requires the student in person)

1. Log real personal matches (start immediately — replaces the last synthetic layer).
2. Recruit 3–5 club players → run the survey, user-testing sessions, and SUS (instruments ready in `07_Validation/`).
3. Have 1–2 classmates run heuristic evaluation round 2.
4. Optional: one month of the API's paid tier (€19) unlocks full multi-season history (2,000+ matches, ranking evolution).
