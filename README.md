# PadelLens — DV4S Exam Project

**Data Visualization for Sport · Politecnico di Milano · AY 2025/2026**

A two-half web app for amateur padel players:
- **Pro Tour Insights** — real Premier Padel rankings + match results.
- **My Match Log** — log your own matches and see patterns you couldn't feel during play.

> *"You don't have to feel your game — you can see it."*

---

## What's in this folder

The project follows the six sections of the exam rubric exactly:

| Folder | What's inside | Maps to exam section |
|---|---|---|
| **01_Brief/** | `01_brief.md` — sport domain, problem, audience, editorial angle (Kirk's Angle/Framing/Focus + Relevance) | §1 The Brief |
| **02_Data/** | `01_data_acquisition.md`, `generate_padel_data.py`, `api_client.py`, three CSVs | §2 Working with Data |
| **03_UX/** | `01_ux_design.md`, five SVG wireframes, Nielsen heuristic eval | §3 UX Design |
| **04_Visual_Encoding/** | `01_visual_encoding.md` — nine charts justified, color palette, accessibility, interactivity | §4 Data Representation |
| **05_App/** | Streamlit web app (one main file + four pages + utils + data) | §5 Technical Implementation |
| **06_Presentation/** | `PadelLens_Deck.pptx` (27 slides) + `build_deck.js` regenerator | §6 Demo & Conclusions |

Every markdown file ends with **speaker notes** the student can read out as-is during the talk.

---

## Run the app

```bash
cd 05_App
pip install -r requirements.txt
streamlit run app.py
```

The app opens at http://localhost:8501 with five pages: Home, Pro Tour, My Stats, Log a Match, Compare.

## Open the deck

```
06_Presentation/PadelLens_Deck.pptx  (27 slides, speaker notes on every slide)
```

Also pre-rendered as `PadelLens_Deck.pdf` for quick preview.

## Regenerate the data (reproducible)

```bash
cd 02_Data
python3 generate_padel_data.py     # writes data/*.csv
```

## Regenerate the deck

```bash
cd 06_Presentation
node build_deck.js                  # writes PadelLens_Deck.pptx
```

Requires `pptxgenjs` (`npm install pptxgenjs`) and the wireframe PNGs in `assets/`.

---

## Key project facts (so they're easy to find)

- **Tech stack:** Python 3.11 · Streamlit 1.32 · Pandas 2.x · Plotly 5.x · Requests.
- **Data sources:** Padel API (padelapi.org, real) + synthetic personal seed log.
- **Dataset size:** 30 pro players · 276 pro matches across 12 tournaments · 40 personal matches.
- **Story-defining numbers in the personal log:**
  - Best partner (Luca): 80% win rate · Worst partner (Davide): 20% — a 60-pp spread.
  - Two-set win rate 80% vs three-set 40% — a −40 pp fatigue fade.
  - Bandeja net +176 winners · Smash net −170 — a clean strength-vs-weakness story.

## Tribute to the framework

The whole project is structured around Andy Kirk's data-visualization process from your lecture:

1. **Formulating the brief** (§1)
2. **Working with data** (§2)
3. **Editorial thinking** — Angle, Framing, Focus + Relevance scored on Timeliness / Interestingness / Pertinence / Sufficiency (woven through §§1, 4)
4. **Developing the design solution** — five layers: Data Representation, Interactivity, Annotation, Color, Composition (§4)

If the professor asks "where in your project do you apply Kirk's framework?", you can point to a specific page in each markdown file.
