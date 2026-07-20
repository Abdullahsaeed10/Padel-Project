# Step 2 (Real Data) — The padelapi.org Pipeline

`01_data_acquisition.md` describes both data layers at a high level (real pro-tour data +
synthetic personal-log seed data) as they stood at the first submission. This document is the
deeper, exam-ready write-up of **just the real-data half** — acquisition, examination,
transformation, exploration, and honest limitations — now that the pipeline has actually been
run end to end against the live API and produced the 776-match dataset the EDA (§ `eda/`)
and the new case studies (`04_Visual_Encoding/02_case_studies.md`) are built on.

The four stages below are kept deliberately separate as scripts and as sections, because
that separation is what makes each step auditable: acquisition never touches statistics,
examination never invents a value, transformation never re-fetches, exploration never
re-cleans.

---

## 2.1 Acquisition

**Source:** [padelapi.org](https://padelapi.org) — a REST API covering Premier Padel / FIP
tour data (seasons, tournaments, matches, players/rankings), authenticated with a bearer
token (`Authorization: Bearer <token>`, via the `PADELAPI_TOKEN` environment variable).
Script: `02_Data/fetch_padelapi.py`.

**Constraints the script is built around, on purpose, not as an afterthought:**
- **Free-tier rate limit is 10 requests/minute.** The fetcher sleeps 6.5 s between every
  request (`THROTTLE_S = 6.5`) — safely under the cap — and on an HTTP 429 backs off for
  `65 × (attempt + 1)` seconds before retrying, up to 4 attempts.
- **Free-tier data window is rolling (~6 months).** Anything the plan doesn't expose comes
  back as the literal string `"hidden_free_plan"` rather than an error. The rule the script
  follows everywhere this appears: **skip it, never guess it.** Both `fetch_padelapi.py` and
  `build_real_csv.py` explicitly check `score == HIDDEN or winner == HIDDEN` and drop the row
  rather than infer a result from partial information.
- **Restartable by design.** Every tournament's matches are archived to their own file
  (`real/raw/matches_<tournament_id>.jsonl`); a re-run checks whether that file already exists
  and skips the network call if so. This mattered in practice — the season pull took from
  21:50 to 22:04 (`real/fetch_log.txt`) and needed to survive being interrupted.

**What actually came back.** The `/seasons` endpoint lists every season the API has ever
indexed (from "World Padel Tour 2015" through "Premier Padel 2026"); the fetch targets only
season id 5, "Premier Padel 2026." That season has **26 tournaments**. Of those, **13 had
already been played and returned matches** (Riyadh P1, Gijón P2, Cancún P2, Miami P1, Newgiza
P2, Brussels P2, Asunción P2, Buenos Aires P1, Italy Major, Valencia P1, Valladolid P2,
Bordeaux P2, Málaga P1) and **13 returned zero matches** (Pretoria, London, the Mediterranean
Games, Madrid, Paris Major, Rotterdam, Germany, Milano, Kuwait, the FIP World Cup, Dubai,
Mexico Major, Barcelona Finals) — draws for later in the season that hadn't been played yet
at fetch time. That 13/13 split is not a bug; it's the honest state of a season in progress,
and it's exactly why the dataset is scoped as "2026 season, R64 → Finals, as far as the
season has progressed" rather than a complete year.

Alongside matches, the player directory was pulled in two category calls
(`/players?category=men`, `/players?category=women`), returning **2,165 players** with
current ranking points, nationality, age, and (patchy) hand/height fields.

> **What to say in the presentation:** *"The pro data comes from a real REST API — padelapi.org
> — not a static CSV I dressed up. That meant designing around real constraints: a 10-requests-
> per-minute limit, a rolling six-month data window that silently masks older data, and a
> season that was still half-unplayed when I pulled it. Thirteen of the twenty-six tournaments
> in the 2026 season simply hadn't happened yet — the API told me that honestly, by returning
> zero matches, and I built the pipeline to accept that rather than fake a full season."*

---

## 2.2 Raw archiving — before any transformation

Every API response is written, untouched, to `02_Data/real/raw/*.jsonl` **before** a single
cleaning or parsing step runs: `seasons.jsonl`, `tournaments.jsonl`, one `matches_<id>.jsonl`
per tournament, and `players.jsonl`. This is the auditability boundary of the pipeline: if a
downstream number looks wrong, the fix is to re-read the raw JSON and re-derive it, never to
patch the derived CSV by hand. `build_real_csv.py` (the transformation script, §2.4) reads
*only* from this raw archive and never calls the network — it can be re-run any number of
times, deterministically, as the cleaning logic improves. That separation is exactly what let
the score-format bug below get fixed without re-fetching anything.

---

## 2.3 Examination — the score-format discovery

This is the one genuine "the data surprised me" moment in the pipeline, and it's worth
documenting precisely because it's real, not a tidied-up story.

The first version of the acquisition script (`fetch_padelapi.py`) was written assuming the
API would return a match score the way it's *displayed* on the website — a single string like
`"6-3, 4-6, 7-5"` — and shipped a `parse_score()` function that splits that string on commas.
That assumption held during initial testing against a handful of matches.

During examination of the full raw archive (reading the actual `real/raw/matches_*.jsonl`
files rather than trusting the assumption), the real shape turned up: the API's `score` field
is a **JSON array of set objects**, not a string —
`[{"team_1": "6", "team_2": "4"}, {"team_1": "3", "team_2": "6"}, ...]`. The string format
only shows up for the `"hidden_free_plan"` sentinel case. The comma-split parser silently
produced garbage (or empty strings) whenever it hit the array form, which is most of the time.

The fix lives in `build_real_csv.py`'s `sets_from_score()`, written specifically to branch on
the real type:

```python
def sets_from_score(score) -> list[str]:
    """API format: [{"team_1":"6","team_2":"4"}, ...] -> ["6-4", ...]."""
    out = []
    if isinstance(score, list):
        for s in score:
            t1, t2 = s.get("team_1", ""), s.get("team_2", "")
            out.append(f"{t1}-{t2}" if t1 != "" and t2 != "" else "")
    elif isinstance(score, str) and score and score != HIDDEN:
        out = [p.strip().replace("/", "-") for p in score.split(",")]
    return (out + ["", "", ""])[:3]
```

Because raw archiving (§2.2) happened first and independently of parsing, this was a
one-file, zero-refetch fix: `build_real_csv.py` was corrected and re-run against the already-
archived `.jsonl` files, and every downstream number (the 776-match CSV, the whole EDA) reflects
the corrected parser. Nothing was re-downloaded, re-guessed, or patched by hand.

Two other examination-stage rules, applied consistently rather than case-by-case:
- **`hidden_free_plan` values are dropped, never guessed.** Any match where `score` or
  `winner` came back as that literal string is excluded outright at this stage — there is no
  attempt to infer a plausible result from context.
- **Unfinished matches are excluded; retired/walkover matches are kept but flagged, not
  silently merged into "finished."** `build_real_csv.py` keeps any match with
  `status ∈ {finished, ended, retired, walkover}` (776 rows total) — a match still marked
  "scheduled" with no result yet is dropped entirely, since there's nothing to record. The EDA
  script (`eda/exploration.py`) then narrows further, to `status == "finished"` only (763 of
  the 776), for every statistical test — a retired or walkover match has a scoreline that
  doesn't reflect a fully contested result, so it's excluded from win-rate statistics even
  though it's preserved as a record in the CSV. `eda_report.md` states this exclusion
  explicitly rather than folding the 13 retired/walkover matches silently into "finished."

> **What to say in the presentation:** *"I want to be honest about the one real bug I hit.
> I wrote the first parser assuming the API's score field was a comma-separated string, like
> what you'd see on the results page. It wasn't — it's a JSON array of set objects. I only
> caught that by actually reading the raw archived responses during the examination step,
> not by trusting my own assumption. Because I archive every raw API response before I
> transform anything, fixing the parser cost me one file and zero re-fetching — I just re-ran
> the transformation script against data I already had on disk. That's the entire reason the
> pipeline separates acquisition from transformation as two different scripts."*

---

## 2.4 Transformation

Script: `02_Data/build_real_csv.py`. Reads only `real/raw/*.jsonl`, writes
`real/pro_matches_real.csv` and `real/pro_players_real.csv`. Never touches the network;
fully re-runnable.

**Per-match fields assembled:** match id, date, tournament name/level, tour category
(men/women), country, court type (see limitations, §2.6), round name and round code, both
teams' player names *and* ids (for joining to the player table), each team's court side,
seeds (where present), winner, three parsed set scores, duration in minutes, status, and a
`source` string (`"padelapi.org match <id>"`) traced back to the exact API record for every
row.

**Player rows** are taken from the full `/players` directory dump when available, falling back
to "players seen in matches" if the directory pull failed for some reason — documented in the
script's own print statement so it's obvious at run time which source was used.

**Result:** **776 match rows** across the 13 played tournaments, **2,165 player rows**, R64
through Finals, men's and women's draws combined, sorted by date. This is the exact CSV pair
the EDA and app now read — no separate "cleaned again" copy exists downstream.

> **What to say in the presentation:** *"Transformation is deliberately its own script,
> separate from both fetching and analysis. It reads the raw archive, applies the fixed score
> parser, keeps a match id and a literal source string on every row, and writes two CSVs. If a
> professor asked me to trace any single number in the EDA back to a specific API response, I
> can — that traceability is the point of keeping these steps apart instead of one script that
> fetches-and-cleans-and-analyzes in one pass."*

---

## 2.5 Exploration

Script: `02_Data/eda/exploration.py` → `eda_report.md` + `eda_results.json` (reproducible,
seeded, no manual numbers). Ten questions (E1–E10) run as two-sided tests at α = 0.05 with
Wilson 95% confidence intervals on every proportion. The headline results that drove the new
chart case studies (`04_Visual_Encoding/02_case_studies.md`):

- **E1 Momentum:** P(win match | won set 1) = 86.2% overall, collapsing to 49.3% — a coin
  flip — once a match actually reaches a valid 3rd set.
- **E2 Ranking calibration:** favorite wins 78.5% overall; AUC 0.883; win rate ranges from
  58.8% (closest ranking-gap quintile) to 96.7% (widest quintile).
- **E3 Pair chemistry:** win rate climbs from 39.8% (1–3 matches together) to 68.2% (16+),
  chi-square p = 2.97e-15, but only 39% of pairs ever reach 5+ matches together.

**The exploration script also reports honest nulls and non-findings, on purpose, rather than
only publishing what worked:**
- **E5 Handedness: insufficient data.** Hand coverage is 6.4% of all 2,165 players and 38.4%
  of the 279 players who actually appear in the 776 real matches — below the 60% usability
  threshold the script enforces before it will even attempt a comparison. Verdict recorded
  literally as `"insufficient_data"`, not silently skipped.
- **E6 Age/physique: mostly null.** Height coverage (33.8% of all players) is below the same
  60% threshold, so height-based analysis is skipped outright. The age-gap test (winner minus
  loser) is not significant (p = 0.277); a within-pair age-gap correlation is technically
  significant (p = 0.025) but explains well under 1% of variance — reported as statistically
  real but practically negligible rather than rounded up into a headline.
- **E9 Home advantage: null overall** (p = 0.18, n=109), reported with the by-country
  breakdown shown anyway for transparency even though the small per-country n's (4–34) don't
  support a claim either way.
- **E8 Rest/schedule:** the literal comparison requested (0 days rest vs. 1+) turned out to be
  impossible — **zero pairs in the entire dataset ever play twice on the same day** within a
  tournament — so that split is reported as `insufficient_data` rather than forced, and a
  1-day-vs-2+-day substitute comparison is used instead, clearly labeled as a substitution.

> **What to say in the presentation:** *"Ten questions went into the EDA script, and three of
> them came back null or insufficient — handedness, height, home advantage. I kept those in
> the report instead of quietly dropping them, because a project that only shows you the
> findings that worked isn't doing exploratory analysis, it's doing marketing. The zero-rest
> case is my favorite example: I asked for a same-day back-to-back comparison, and the honest
> answer was that it never happens in this bracket schedule — so I reported that fact instead
> of forcing a comparison that isn't there."*

---

## 2.6 Limitations

Stated plainly, the way the brief's "Sufficiency" factor (§1.6) asks for — enough to decide,
not padded to look complete:

- **Free-tier window = 2026 season only.** The fetch deliberately targets a single season
  (id 5, "Premier Padel 2026"); no multi-year historical comparison is possible from this
  dataset, and 13 of the 26 tournaments in that season hadn't been played yet at fetch time
  (§2.1). This is a snapshot of a season in progress, not a completed year.
- **Ranking-points look-ahead bias (E2).** The player table exposes *current* ranking points,
  not the points a player held on each match's actual date — the API's free tier has no
  historical point-in-time ranking endpoint. Early-season matches in E2's calibration analysis
  are therefore evaluated against points partly earned *after* the match happened. The 78.5%
  favorite-win-rate and 0.883 AUC are reported as approximate, optimistic upper bounds on true
  pre-match predictive power — not a clean prospective test — and this caveat is carried
  forward verbatim into the calibration case study (§4.7 of `02_case_studies.md`).
  Interestingly, this pipeline-level limitation is *also* the very fact that motivated case
  study 4.7's explicit rejection of a raw ROC/AUC display to the audience: the number is real,
  but its precision is already overstated by a data limitation, one more reason not to hand it
  to Marco as a headline stat.
- **`court_type` is unavailable.** The column exists in the transformed CSV schema (carried
  through from the tournament resource) but is empty for every row on this API tier — indoor
  vs. outdoor surface analysis, present for the synthetic data in the first submission
  (§2.3 of `01_data_acquisition.md`, "surface split"), cannot be reproduced with the real
  dataset and is dropped from the real-data findings rather than backfilled with a guess.

---

## What to say in the presentation (speaker notes — Data section)

**Slide: Where the real data comes from**
> *"Everything downstream of this slide — the EDA, the calibration case study, the momentum
> and chemistry findings — comes from a real API, padelapi.org, fetched with a script that
> respects a real 10-requests-per-minute limit and a rolling six-month data window. Where the
> API told me data was hidden behind that window, I skipped it. I never guessed a value the
> API wasn't willing to give me."*

**Slide: The pipeline is four separate steps on purpose**
> *"Acquisition writes raw JSON to disk and touches the network. Examination is where I read
> that raw JSON and actually found a bug — my score parser assumed the wrong format entirely.
> Transformation reads only the raw archive, never the network, and produces the clean CSVs.
> Exploration reads only those CSVs. Because they're separate, fixing the score-parsing bug
> cost me one script and zero re-fetching — that's the whole argument for keeping these steps
> apart instead of one script that does everything in one pass."*

**Slide: What the data honestly can't tell me**
> *"Three of my ten EDA questions came back null or insufficient — handedness, height, overall
> home advantage — and I'm showing you those alongside the findings that worked. The ranking-
> calibration number carries a real caveat too: it uses today's ranking points, not each
> player's points on the match date, so I treat 78.5% and an AUC of 0.88 as an optimistic upper
> bound, not a clean prediction test. I'd rather present a number with its limitation attached
> than a cleaner-looking number I can't actually defend."*
