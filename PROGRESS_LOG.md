# PadelLens — Resubmission Progress Log

Every action taken to address the evaluation (`PadelLens_DV4S_ProjectEvaluation.pdf`), in order, with evidence. Use this to reconstruct "what I did and why" for the presentation.

**Honesty rule adopted for the whole resubmission:** no insight is claimed unless it was found in real data; no validation result is claimed unless it came from a real person. (This directly answers the "circular analytical loop" criticism.)

| Date | Phase | Action | Evidence / Output | Addresses criticism |
|---|---|---|---|---|
| 2026-07-14 | Planning | Analyzed evaluation + professor's Q&A; wrote full improvement plan | `IMPROVEMENT_PLAN.md` | All |
| 2026-07-14 | Planning | Identified real data sources: padelapi.org free tier (6 months results + rankings, key requested), public season archives as fallback | This log §Data sources | Small pro dataset |
| 2026-07-14 | Phase 2/3 | Started analytics module: Elo engine, Wilson CIs, logistic win model, player clustering, with unit tests | `05_App/PadelLens/analytics.py`, `05_App/PadelLens/tests/` | No modelling/analytical tool |
| 2026-07-14 | Phase 4 | Created validation instrument pack (persona survey, interview guide, SUS, user-testing protocol, heuristic eval round 2) | `07_Validation/` | No validation / persona foundation |
| 2026-07-14 | Phase 3 | Analytics module finished and unit-tested: Elo engine, Wilson CIs, logistic win model + calibration, momentum table, pair chemistry, k-means archetypes. 12/12 tests pass (verified independently) | `05_App/PadelLens/analytics.py`, `tests/` | No modelling/analytical tool |
| 2026-07-14 | Phase 1 | Scouted real data sources; documented padelapi.org REST contract; confirmed free-tier limits (6-month window, older scores masked). Wrote throttled, restartable, raw-archiving fetch script | `02_Data/fetch_padelapi.py`, scout report | Small pro dataset |
| 2026-07-15 | Phase 5 | App upgraded: SQLite persistence + users table (multi-user-ready), real-data-aware loaders with source captions, "SYNTHETIC DEMO DATA" badge on personal pages, new Insights page with 4 discovery-card renderers (all marked pending real data — no invented conclusions), Wilson CIs on every win rate with small-n guard | `05_App/PadelLens/db.py`, `build_db.py`, `pages/5_Insights.py`, `data/findings.json` | Single-user / standard stack; circular insights |
| 2026-07-15 | QA | Independent seam verification: DB loaders, findings schema, CI displays, full test suite re-run (12/12) | This log | — |
| 2026-07-15 | Phase 1 | **REAL DATA ACQUIRED**: 2026 Premier Padel season via padelapi.org (user's free API key) — 26 tournaments, 776 completed matches with full draws (R64→Finals), men + women, majors/P1/P2, seeds, player IDs, court sides, durations. Raw API responses archived to `02_Data/real/raw/*.jsonl` before any transformation (reproducible pipeline). Cleaning done by separate auditable step `build_real_csv.py` (fixed score-format parsing found during examination — documented as pipeline "examination" evidence) | `02_Data/real/pro_matches_real.csv`, `02_Data/fetch_padelapi.py`, `02_Data/build_real_csv.py` | Small pro dataset; whole pipeline |

| 2026-07-15 | Phase 2 | **DATA EXPLORATION EXECUTED on real data** (the professor's core request): 10 questions tested with two-sided tests + Wilson CIs. Discoveries: set-1 winner takes match 86% but deciding set is a 49% coin-flip; pair chemistry +27pp (40%→67% by matches-together); ranking favorite wins 78.5% (AUC 0.88); upsets only 22.4% of seeded matches, rising to 50% in finals; prior-round efficiency → 59.7% next-match win. Honest nulls reported: NO home advantage (43%, p=0.18), no age-gap effect, handedness/height insufficient coverage. Headline numbers independently re-verified before publication | `02_Data/eda/` (exploration.py, eda_results.json, eda_report.md) | No data exploration / novel insights |
| 2026-07-15 | Phase 2/5 | Insights page wired to real findings: 7 discovery cards, each with purpose-built chart, in-canvas annotation, method note (test, n, p). Fixed a data-join bug found during verification (stale demo player table). Full app smoke-tested end-to-end, 12/12 tests | `05_App/PadelLens/pages/5_Insights.py`, `data/findings.json` | Circular insights → discovered insights |
| 2026-07-15 | Phase 6 | Three new chart case studies at Shot-DNA depth (momentum slope chart, chemistry line + CI + survivorship wedge, calibration lollipop), each with rejected alternatives + perceptual reasoning + accessibility notes. Real-data pipeline documented for §2 | `04_Visual_Encoding/02_case_studies.md`, `02_Data/02_pipeline_real_data.md` | Only one well-reasoned case study |
| 2026-07-15 | Phase 6 | New 32-slide deck built and machine-verified: zero placeholders, sequential §1–§6 numbering, speaker notes (55–121 words) on every slide, native charts for the case studies, honest "validation in progress" status (no invented SUS scores), visual QA of all slides | `06_Presentation/PadelLens_Deck_v2.pptx` | Placeholders / inconsistent numbering; rough finishing |

## Data sources
- **padelapi.org** — free tier: last 6 months Premier Padel match results + current rankings (real). Status: awaiting API key.
- **Public season archives** — full-season tournament results. Status: being scouted.

## Pending (require the student in person)
- [ ] Create free padelapi.org API key
- [ ] Log own real matches (start immediately — calendar time!)
- [ ] Recruit 3–5 club players: match logging + survey + SUS + user test
- [ ] Run user-testing sessions and record results in `07_Validation/results/`
- [ ] Have 1–2 classmates run heuristic evaluation round 2
