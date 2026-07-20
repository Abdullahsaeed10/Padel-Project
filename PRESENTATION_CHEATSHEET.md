# PadelLens — Presentation Cheat Sheet (read this twice before you go in)

Deck: `06_Presentation/PadelLens_Deck_v5_FINAL.pptx` (40 slides — the one to present). Script: `06_Presentation/PRESENTATION_SCRIPT_v3.md`. App: double-click `run_app.bat` BEFORE the talk starts and leave it running in a browser tab.

---

## Timing plan (~35 min)

| Slides | Section | Minutes |
|---|---|---|
| 1–2 | Title + **What changed since the first submission** | 3 |
| 3–7 | §1 The Brief | 5 |
| 8–13 | §2 Working with Data + Exploration | 7 |
| 14–17 | §3 UX & Validation | 5 |
| 18–24 | §4 Visual Encoding + case studies | 7 |
| 25–27 | §5 Technical Implementation | 3 |
| 28–31 | §6 Live Demo + Conclusions | 5 |
| 32 | Close + questions | — |

Open with the "what changed" slide confidently: *"I took the evaluation seriously. Three things changed fundamentally: the data is now real, the insights are now discovered rather than assumed, and there is now an analytical layer under every chart."*

## The numbers to know cold

- Dataset: **776 real matches**, **26 tournaments**, full draws R64→Finals, men + women, **2,165 players**, 2026 Premier Padel season, via padelapi.org REST API (raw responses archived; throttled 10 req/min).
- **Momentum**: set-1 winner wins the match **86%** (n=668, p<0.001) — but wins a deciding 3rd set only **~49%** (coin flip).
- **Pair chemistry**: win rate **~40% → ~67%** from 1–3 to 16+ matches together (+27 pp, p<0.001). Caveat you say YOURSELF: survivorship — bad pairs split early.
- **Ranking calibration**: favorite by combined points wins **78.5%**, model **AUC 0.88**. Caveat: points are an end-of-window snapshot (look-ahead bias) — say this before they ask.
- **Upsets**: only **22.4%** of seeded matches; NOT monotonic by round — Semifinals lowest (~14%), **Finals ≈ 50%** (seeds 1 vs 2 are near-equals, so "upset" loses meaning — nice discussion point).
- **Efficiency**: team with fewer total games in the previous round wins **59.7%** of the next match (n=233, p=0.004).
- **Honest null — say it proudly**: NO home advantage (home teams 43%, p=0.18). "Trustworthy analysis includes what the data does NOT show."
- Elo vs official points over-performers: De Pascual (Elo #35 vs points #103), Rodriguez Martinez (#35 vs #101), Valenzuela (#58 vs #121).
- Analytics module: Elo, logistic win model, **Wilson CIs on every win rate**, small-n guard (<10 matches → no claim). 12/12 unit tests.

## The three case-study one-liners (§4)

1. **Momentum slope chart** — two points per group joined by a line: slope IS the message; rejected grouped bars (slope invisible) and pie (no part-to-whole question).
2. **Chemistry line + CI band + survivorship wedge** — the annotation carries the caveat inside the chart, honesty as a design element.
3. **Calibration lollipop** — predicted vs actual by decile; the distance to the y=x line is the message; rejected scatter (overplotting) and table (no perception).

## Questions the professor will ask — and your answers

**"Is the personal match log still synthetic?"**
→ "Yes, and it is labeled SYNTHETIC DEMO DATA on every personal page. The insight engine is no longer built on it — all seven findings come from the real pro dataset. The personal layer is now a *method demo*: every statistic it shows carries a Wilson confidence interval and refuses to claim anything under n=10. Real logging is underway — instruments are ready in 07_Validation and club players are being recruited."

**"Where is the user testing / SUS?"**
→ Be honest, never invent a score: "Validation instruments are complete — task-based protocol, SUS questionnaire EN/IT, persona-grounding survey, heuristic evaluation round 2 — and sessions with real club players are scheduled. I chose not to fabricate a SUS number; I'd rather present a real one at the follow-up."

**"Why only 2026 data?"**
→ "Free API tier hides scores older than 6 months. The pipeline is already built to ingest full history the moment access is upgraded — it's one flag, not a redesign. 776 full-draw matches were sufficient for statistically significant findings."

**"Are these correlations causal?"**
→ "No, and the app never claims so. Chemistry has a survivorship confound, annotated in the chart itself. Calibration has a look-ahead caveat, printed under the chart. Every finding card names its test, n, and p-value."

**"CHRTS families?"** (if asked to classify)
→ Momentum/upsets/efficiency = **C**omparison; chemistry & rolling trends = **T**emporal; Elo-vs-points scatter & calibration = **R**elationship; rankings table = ordered **H**ierarchy; spatial deliberately excluded — no positional data, stated in the framing (§1).

**"What would you do next?"**
→ "Close the validation loop with the scheduled user tests; full-history ingestion for ranking-evolution charts; per-user accounts are already in the schema — deployment to Streamlit Cloud."

## Demo script (4 minutes, rehearse once)

1. Home — headline win rate WITH confidence interval; point at the demo badge: "honesty by design."
2. Pro Tour — real 2026 data caption, filter by tournament.
3. **Insights page — the star.** Walk momentum card → chemistry card → home-advantage null ("this chart's job is to show nothing is there").
4. Log a match — 30-second entry, auto-result preview.
5. If anything breaks: the deck's §6 slides describe every step — narrate from slides without apologizing.

## Before you leave (checklist)

- [ ] Laptop charged + charger packed
- [ ] `run_app.bat` tested once at home (it was verified today — run it once yourself anyway)
- [ ] Deck opens (PowerPoint or LibreOffice) — check slide 2 and slide notes visible in presenter view
- [ ] Know your first two sentences by heart
- [ ] `PROGRESS_LOG.md` open in a tab in case the professor asks "what exactly did you change?"
