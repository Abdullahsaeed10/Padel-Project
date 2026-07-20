# PadelLens

**Data Visualization for Sport, Exam Project, Politecnico Milano AY 2025/2026**

A Streamlit web application for amateur padel players. It has three complementary parts:

- **Pro Tour Insights**: explore **live** Premier Padel rankings for both the men's and women's tours (pulled from the Padel API), plus match results and tournament statistics.
- **My Match Log**: log your own matches and surface patterns (partner effects, shot tendencies, fatigue curves) that are invisible during play.
- **Insights**: a modelling/analytics layer (`analytics.py` — Elo ratings, a logistic win-probability model, Wilson confidence intervals, pair-chemistry and momentum analysis) surfaced as discovery cards on the Insights page, backed by SQLite persistence (`db.py` / `build_db.py`) instead of raw CSV reads.

---

## Quick Start

```bash
# 1. Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Build the SQLite database from the bundled CSVs (safe to re-run any time)
python build_db.py
#    Creates data/padellens.db: pro_matches, pro_players, my_matches (+ a
#    users table — my_matches carries a user_id, seeded with user 1 =
#    "Demo User"). If the real 2026-season feed exists at
#    ../02_Data/real/pro_matches_real.csv, it's used for pro_matches instead
#    of the bundled demo CSV. Skipping this step is fine too — db.py falls
#    back to reading the CSVs directly if data/padellens.db isn't there yet.

# 4. (Optional) Enable live rankings, paste a free Padel API token
#    Get one at https://padelapi.org, then in .streamlit/secrets.toml set:
#    PADEL_API_TOKEN = "your-token-here"
#    Without a token the app still runs from the bundled ranking snapshots.

# 5. Run
streamlit run Dashboard.py
```

App opens at **http://localhost:8501**

---

## Project Layout

```
05_App/
├── Dashboard.py               Home page — landing dashboard
├── utils.py                   Shared data loaders, helpers, chart theme
├── analytics.py               Modelling/analytics layer (Elo, win model, Wilson CI, clustering) — pure pandas, no Streamlit
├── db.py                      SQLite persistence (sqlite3 + pandas.read_sql); falls back to CSVs transparently
├── build_db.py                One-time/repeatable migration: data/*.csv -> data/padellens.db
├── requirements.txt           Python dependencies
├── .streamlit/
│   ├── config.toml            UI theme (colors, font, background)
│   └── secrets.toml           Padel API token (git-ignored; you create this)
├── pages/
│   ├── 1_Pro_Tour.py          Premier Padel explorer (rankings + matches + surface)
│   ├── 2_My_Stats.py          Personal analytics dashboard
│   ├── 3_Log_Match.py         Match entry form (writes via db.py)
│   ├── 4_Compare.py           Personal shot profile vs pro reference (radar)
│   └── 5_Insights.py          Discovery cards backed by analytics.py (momentum, Elo vs ranking, pair chemistry, model calibration)
└── data/
    ├── padellens.db           SQLite database built by build_db.py (git-ignored; regenerate locally)
    ├── findings.json          Insights page content — one card per analytical question, honest "pending_real_data" status until real data lands
    ├── rankings_men.csv       Cached live snapshot — men's top 30 (auto-refreshed)
    ├── rankings_women.csv     Cached live snapshot — women's top 30 (auto-refreshed)
    ├── matches_men.csv        Cached live snapshot — recent men's results (auto-refreshed)
    ├── matches_women.csv      Cached live snapshot — recent women's results (auto-refreshed)
    ├── pro_players.csv        Offline fallback — top 30 male players
    ├── pro_matches.csv        Offline fallback — 276 men's matches (Feb 2024 onward)
    └── my_matches.csv         40 personal match seed records for demo user "Marco" (synthetic — flagged in-app)
```

Streamlit automatically turns every file in `pages/` into a sidebar route. The numeric prefix controls display order.

---

## Pages

### Dashboard (`Dashboard.py`)

The landing dashboard. Designed to answer *"How am I doing and what should I work on?"* in under 10 seconds.

| Section | What It Shows |
|---|---|
| KPI block | Last-10 win rate + delta vs previous 10 |
| Sparkline | Rolling 5-match win rate trend (15 matches) |
| Pro #1 card | Current World No.1 and No.2 from rankings |
| Partner effect | Horizontal bar — win rate per partner, best/worst highlighted |
| Shot DNA | Diverging bar — winners (right) vs errors (left) per shot type |
| Weekly recommendation | Auto-generated drill tip based on lowest net-balance shot |
| Recent matches | Last 6 matches: date, partner, opponents, score |

---

### Pro Tour (`pages/1_Pro_Tour.py`)

Three **fully live** tabs driven by a shared sidebar (Tour = Men/Women, country, tournament tier, date range). Picking a tour re-fetches everything for that circuit.

**Rankings**: live top-30 table for the **men's or women's** tour, fetched from the Padel API. Columns: rank, player, country, side, current points, and the weekly points movement (Δ pts). Pairs share a rank exactly as on the official FIP site. The caption shows the snapshot week, and the table falls back to a cached snapshot if the API is unreachable.

**Matches**: live played results (finished & retired) for the selected tour, newest first, **up to today**. Columns: date, tournament, round, both teams, set score, winner, duration. Filterable by tournament tier and date.

**Match dynamics**: two charts on the same live results:
- Straight-set rate (% won 2-0) **per tournament tier**
- Match duration distribution (box plot) **per tournament tier**
- *Why tier, not surface?* The API does not expose court surface (indoor/outdoor). `court_type`/`venue` are null, so the analysis groups by tournament tier instead. Editorial reading: higher tiers tend to produce tighter matches.

---

### My Stats (`pages/2_My_Stats.py`)

Detailed personal analytics with a time-window filter (All time / Last 30 / 60 / 90 days) in the sidebar.

**KPI row:** Total matches · Win rate (W-L) · 3-set fade (win rate in deciding sets) · Current streak

**Chart grid (2×2):**
- Rolling win rate — 5-match window with 50% reference line and shaded fill
- Win rate by partner — sorted horizontal bars
- Shot DNA — diverging bar (winners vs errors per shot)
- Set-by-set fatigue — 2-set win rate vs 3-set win rate with delta annotation

**Bottom:** Full filtered match table + CSV download button.

Every displayed win rate on this page carries a Wilson 95% CI suffix (e.g. "62% (CI 45-77, n=24)"); below n=10 it's replaced with a plain-language "not enough matches yet for a reliable estimate" caveat instead of a bold percentage.

---

### Log Match (`pages/3_Log_Match.py`)

Data entry form targeting under 90 seconds to complete.

- Club and partner names autocomplete from existing match history
- Set 3 score inputs are disabled unless Sets 1–2 are split (automatic validation)
- Real-time result preview updates as you type scores
- Shot tallies (winners/errors per shot) are optional, wrapped in a collapsible expander
- On submit: saves the match via `db.save_my_match()` (SQLite if `data/padellens.db` exists, else appends to `data/my_matches.csv`) and clears the Streamlit data cache so all charts refresh immediately

---

### Compare (`pages/4_Compare.py`)

Radar chart (polar plot) comparing your average winners per match against a professional reference across 5 shot types: forehand, backhand, smash, volley, bandeja.

**Pro reference values** are aggregate averages derived from documented Premier Padel performance studies:

```python
PRO_AVG = {
    "forehand": 5.2,
    "backhand": 5.8,
    "smash":    4.1,
    "volley":   6.5,
    "bandeja":  4.2
}
```

**Gap analysis cards**: one per shot, sorted worst-first, color-coded (red / orange / green). Each card includes a specific drill recommendation tailored to that shot.

---

### Insights (`pages/5_Insights.py`)

The "analytical tool" page: discovery cards driven by `data/findings.json`, each one calling a real `analytics.py` method and rendering it with an in-canvas annotation plus an n= / CI method note underneath.

| Card | Method |
|---|---|
| Momentum | `analytics.momentum_table` — P(win match \| won set 1) vs P(win \| lost set 1), overall and by surface, Wilson 95% CI error bars |
| Elo vs. ranking | `analytics.compute_elo` joined to official `ranking_points`, percentile scatter with a y=x reference diagonal, biggest over/under-performers annotated |
| Pair chemistry | `analytics.pair_chemistry` — win rate by matches-played-together bucket, with a CI band |
| Model calibration | `analytics.fit_win_model`'s calibration table — predicted vs. actual win rate by decile, with a y=x reference line |

Every card carries a `status` of `"ready"` or `"pending_real_data"` in `findings.json`. As shipped, all four are `"pending_real_data"`: the method still runs end-to-end on the bundled demo dataset (titled "Method preview on demo data — conclusions await real data"), but the takeaway is deliberately left as `"To be written from real data"` — no conclusion is stated until it's been computed on the real 2026-season feed.

---

## Data

All Pro Tour data is **live** from the [Padel API](https://padelapi.org); the CSVs below are auto-written snapshots used as offline fallbacks so the demo never breaks.

### `data/rankings_men.csv` · `data/rankings_women.csv`
Snapshots of the live top-30 ranking for each tour, rewritten on every successful fetch by `load_rankings()`. Columns: `ranking`, `name`, `nationality`, `side`, `points`, `ranking_diff`, `points_diff`, `date`.

### `data/matches_men.csv` · `data/matches_women.csv`
Snapshots of the live recent results for each tour, rewritten by `load_matches()`. Columns: `date`, `tournament`, `level`, `round`, `round_name`, `team1`, `team2`, `score`, `winner`, `duration_min`, `n_sets`, `status`, `category`.

### `data/pro_players.csv`
30 rows. Columns: `player_id`, `name`, `country`, `side` (D=Drive / R=Reves), `hand`, `height_cm`, `birth_year`, `ranking_points`.
Source: [Padel API](https://padelapi.org) free tier. Now the **last-resort** men's ranking fallback (API + snapshot both unavailable) and the Compare page's player picker.

### `data/pro_matches.csv`
276 rows, Feb 2024 onward. The **last-resort** men's match fallback, adapted into the live schema by `load_matches()` when the API and snapshot are both unavailable.

### `data/my_matches.csv`
40 seed rows for demo user "Marco" (Nov 2024 onward). Columns: `match_id`, `date`, `partner`, `opponents`, `club`, `surface`, `sets_played`, set scores (up to 3 sets), `result` (W/L), winners and errors per shot (10 columns), `duration_min`, `notes`.
This is a **synthetic** seed, not a real player's history — the app shows a visible "SYNTHETIC DEMO DATA" badge on every page built on it, per the project's academic-honesty rule (see `db.is_demo_user()`).

### `data/padellens.db`
SQLite database built by `build_db.py` from the CSVs above (git-ignored — each teammate/grader regenerates it locally). Tables: `pro_matches` (+ a `source` column, `'real'` or `'demo'`), `pro_players`, `my_matches` (+ `user_id`, multi-user-ready), `users` (`user_id`, `name`; seeded with `1, "Demo User"`). `db.py` reads this file when present and falls back to the CSVs transparently when it isn't.

### `data/findings.json`
Content for the Insights page — one JSON object per discovery card: `id`, `title`, `question`, `status` (`"ready"` / `"pending_real_data"`), `method`, `takeaway`. See the Insights page section above.

### Real pro data (optional)
If `../02_Data/real/pro_matches_real.csv` exists (schema: `match_id, date, tournament, level, tour_category, country, court_type, round, team1_p1, team1_p2, team2_p1, team2_p2, winner_team, set1, set2, set3, status, source`), `build_db.py`/`db.py` prefer it over the bundled demo `pro_matches.csv`: `level` maps to `category`, `court_type` maps to `surface`, and every pro page then shows the caption "Data: padelapi.org, 2026 season (real)" instead of "Demo dataset".

---

## Shared Utilities (`utils.py`)

All pages import from `utils.py`. Key contents:

| Name | Type | Purpose |
|---|---|---|
| `load_pro_players()` | cached loader | Via `db.py` (SQLite if built, else `pro_players.csv`) |
| `load_pro_matches()` | cached loader | Via `db.py` (SQLite if built, else `pro_matches.csv`), parses dates |
| `load_my_matches(user_id=1)` | cached loader | Via `db.py`, parses dates, adds `won` boolean, pre-calculates shot net balance |
| `pro_data_meta()` / `pro_data_caption()` | UI helper | Reports/renders whether the active pro dataset is the real 2026 feed or the demo set |
| `win_rate_display(wins, n)` | analytics | Win rate + Wilson 95% CI string, e.g. `"62% (CI 45-77, n=24)"`; below n=10 returns a plain-language caveat instead |
| `render_demo_badge()` | UI helper | Renders the "SYNTHETIC DEMO DATA" badge on personal match-log pages |
| `load_rankings(category)` | cached live loader | Fetches the current men's/women's top-30 from the Padel API (merging `/rankings` + `/players`); writes a snapshot CSV and falls back to it, then to `pro_players.csv`, when offline |
| `load_matches(category)` | cached live loader | Fetches recent played men's/women's results from `/matches` (tournament names joined from `/tournaments`); snapshot + `pro_matches.csv` fallback |
| `BLUE / RED / GREEN / ORANGE / GRAY / INK / MUTED` | color constants | Shared palette — one change updates all charts |
| `SHOT_TYPES` | list | `["forehand", "backhand", "smash", "volley", "bandeja"]` |
| `kpi(label, value, sub, color)` | UI helper | Renders styled KPI cards using `st.markdown` |
| `apply_theme(fig)` | chart helper | Applies consistent Plotly font, backgrounds, and gridlines |
| `partner_win_rate(df)` | analytics | Groups by partner, computes sorted win rates, flags best/worst |
| `shot_dna(df)` | analytics | Averages winners and errors per match per shot type |
| `rolling_win_rate(df, window=5)` | analytics | Returns rolling win percentage Series |
| `pro_player_form(df, name, n=10)` | analytics | Last `n` match results for a named pro player |
| `sidebar_player_name()` | UI helper | Persistent player name input (session_state, default "Marco") |

`@st.cache_data` decorators on loaders mean the DB/CSVs are read from disk once per session.

---

## Tech Stack

| Library | Version | Role |
|---|---|---|
| Python | 3.9+ | Core language |
| Streamlit | ≥ 1.32 | Multi-page app framework, sidebar, forms, cache |
| Pandas | ≥ 2.0 | Data wrangling, filtering, groupby, rolling windows |
| Plotly | ≥ 5.18 | Interactive line, bar, box, radar charts |
| Requests | ≥ 2.31 | Live Padel API integration — men's & women's rankings |
| scikit-learn | ≥ 1.3 | Logistic regression win model (`analytics.py`) |
| SciPy | ≥ 1.11 | Statistical support for `analytics.py` |
| sqlite3 (stdlib) | — | `db.py` persistence, via `build_db.py` |

Total application code: approximately **600 lines across 5 Python files**, plus `analytics.py`, `db.py` and `build_db.py`.

---

## Design Decisions

**SQLite over CSVs, via `db.py`**: `build_db.py` migrates the CSVs into `data/padellens.db` (plain `sqlite3` + `pandas.read_sql`, no ORM), and `my_matches` carries a `user_id` column so the app is multi-user-ready without a rewrite. `db.py` still falls back to reading the CSVs directly when the database hasn't been built, so the app never hard-fails on a fresh checkout.

**Streamlit over Flask/React**: this is a data visualization project. Streamlit delivers charts and interactivity in pure Python, keeping the codebase focused on data logic rather than frontend plumbing.

**Plotly over matplotlib**: interactive charts (hover tooltips, zoom) are more engaging during a live demo and allow the user to explore data independently.

**Every chart has an editorial caption**: a chart without a takeaway is decoration. Every visualization is annotated with the insight it is designed to surface.

**Rolling window = 5**: wide enough to smooth noise, narrow enough to be sensitive to recent form changes. A 10-match window would mask emerging trends.

**Cache clear on form submit**: `st.cache_data.clear()` is called immediately after a new match is saved. Without it, charts would not reflect the new entry until the session restarted.

**Shot tallies are optional**: requiring shot data on every entry would kill adoption. The form works as a pure W/L log; shot analytics become richer over time as users add tallies selectively.

---

## Known Limitations

- **No per-player shot statistics**: the API tier used does not expose shot-by-shot data. The Compare page uses documented aggregate averages as the reference, with a side-tilt heuristic for Drive vs Reves comparison.
- **No court surface in the API**: `court_type`/`venue` come back null, so the Match dynamics tab groups results by tournament tier rather than indoor/outdoor.
- **Free API tier**: 10 requests/minute and roughly 6 months of match history. The app caches for an hour and snapshots every successful fetch, so a rate-limited cold start falls back to the last snapshot instead of failing.
- **No court heatmaps**: positional tracking data is out of scope (see `../01_Brief/` §1.5).
- **Local SQLite storage, no auth**: `data/padellens.db` lives on the local machine and the schema is multi-user-ready (`my_matches.user_id`), but there is no login layer yet — the app always operates as `user_id=1`. No cloud sync.
- **Insights conclusions withheld pending real data**: the four `analytics.py`-backed discovery cards on the Insights page run their full method on the demo dataset today, but `findings.json` deliberately keeps every `takeaway` as `"To be written from real data"` until the real 2026-season feed (`../02_Data/real/pro_matches_real.csv`) is available — see the Insights page section above.

---

## Demo Path

1. **Home**: review KPI block and weekly recommendation
2. **Pro Tour → Rankings tab**: toggle Men/Women, read live points and the weekly Δ
3. **Pro Tour → Matches / Match dynamics**: live results up to today; straight-set rate and duration by tier
4. **My Stats**: switch time filter to "Last 30 days", observe trend shift
5. **Log Match**: fill in a new match (under 90 seconds), submit
6. **Home**: confirm KPI and recent matches table have updated
7. **Compare**: read gap analysis cards and drill recommendations
8. **Insights**: review the four analytics.py-backed discovery cards (momentum, Elo vs ranking, pair chemistry, model calibration)

---

## Exam Deliverable Map

| Folder | Content |
|---|---|
| `../01_Brief/` | Project brief, editorial angle, research questions |
| `../02_Data/` | Data acquisition notes, API client, raw CSV exports |
| `../03_UX/` | Wireframes, Nielsen heuristic evaluation |
| `../04_Visual_Encoding/` | Chart choice justifications (Kirk framework) |
| `../05_App/` | This folder — working Streamlit application |
