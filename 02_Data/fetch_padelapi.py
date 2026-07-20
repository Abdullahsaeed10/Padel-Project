"""
PadelLens — REAL data acquisition from padelapi.org (free tier).

Pulls every Premier Padel / FIP tournament of the 2026 season and all match
results visible on the free plan (rolling ~6-month window; older matches
return the literal string "hidden_free_plan" and are skipped, never guessed),
plus the player directory with current rankings.

Design notes (documented for the exam — §2 Data Acquisition):
- Free-tier rate limit is 10 requests/minute → the script sleeps 6.5 s
  between requests and backs off on HTTP 429.
- Every raw API response is archived to real/raw/*.jsonl BEFORE any
  transformation, so the cleaning step is fully reproducible and auditable.
- Restartable: already-fetched tournaments are skipped on re-run.

Usage:
    cd 02_Data
    python fetch_padelapi.py
"""

from __future__ import annotations

import csv
import json
import os
import sys
import time
from pathlib import Path

import requests

API_TOKEN = os.environ.get(
    "PADELAPI_TOKEN",
    "1EGpCnZDsCpoghzuT9ZzAJB8DS8cuInNx3aHAtFK08075c80",
)
BASE = "https://padelapi.org/api"
HEADERS = {"Authorization": f"Bearer {API_TOKEN}", "Accept": "application/json"}
SEASON = "2026"
THROTTLE_S = 6.5          # 10 req/min free tier → stay safely under
OUT = Path(__file__).parent / "real"
RAW = OUT / "raw"
HIDDEN = "hidden_free_plan"

session = requests.Session()
session.headers.update(HEADERS)


def log(msg: str) -> None:
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(OUT / "fetch_log.txt", "a", encoding="utf-8") as f:
        f.write(line + "\n")


def get(path: str, params: dict | None = None, retries: int = 4) -> dict:
    """GET with throttle + 429 backoff. Raises on persistent failure."""
    url = f"{BASE}{path}"
    for attempt in range(retries):
        time.sleep(THROTTLE_S)
        r = session.get(url, params=params, timeout=30)
        if r.status_code == 429:
            wait = 65 * (attempt + 1)
            log(f"  429 rate-limited, waiting {wait}s …")
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r.json()
    raise RuntimeError(f"Gave up on {url} after {retries} retries")


def paginate(path: str, params: dict | None = None):
    """Yield items across all pages (Laravel-style envelope)."""
    params = dict(params or {})
    params.setdefault("per_page", 50)
    page = 1
    while True:
        params["page"] = page
        body = get(path, params)
        data = body.get("data", [])
        yield from data
        meta = body.get("meta", {})
        if page >= int(meta.get("last_page", 1)):
            break
        page += 1


def archive(name: str, items: list) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    with open(RAW / f"{name}.jsonl", "w", encoding="utf-8") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")


def parse_score(score) -> list[str]:
    """'6-3, 4-6, 7-5' -> ['6-3','4-6','7-5'] (max 3, blanks padded)."""
    if not score or score == HIDDEN or not isinstance(score, str):
        return ["", "", ""]
    parts = [p.strip().replace("/", "-") for p in score.split(",")]
    parts = [p for p in parts if p]
    return (parts + ["", "", ""])[:3]


def team_names(players: list) -> tuple[str, str]:
    names = [p.get("name", "") for p in (players or [])]
    return (names[0] if names else "", names[1] if len(names) > 1 else "")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    log(f"=== PadelLens real-data fetch, season {SEASON} ===")

    # 0. Discover the season identifier (the API may not key seasons by year)
    season_param = SEASON
    try:
        seasons = get("/seasons").get("data", [])
        archive("seasons", seasons)
        log(f"Seasons visible: {[ (s.get('id'), s.get('name', s.get('year'))) for s in seasons ]}")
        for s in seasons:
            blob = json.dumps(s)
            if SEASON in blob:
                season_param = s.get("id", s.get("year", SEASON))
                break
        log(f"Using season identifier: {season_param}")
    except Exception as e:
        log(f"/seasons discovery failed ({e}) — will use date-filter fallback")
        season_param = None

    # 1. Tournaments of the season (season route, else date filter)
    tournaments = []
    if season_param is not None:
        try:
            tournaments = list(paginate(f"/seasons/{season_param}/tournaments"))
        except Exception as e:
            log(f"/seasons/{season_param}/tournaments failed ({e}) — falling back to /tournaments date filter")
    if not tournaments:
        tournaments = list(paginate("/tournaments", {
            "after_date": f"{SEASON}-01-01", "before_date": f"{SEASON}-12-31",
        }))
    archive("tournaments", tournaments)
    log(f"Season {SEASON}: {len(tournaments)} tournaments")

    # 2. Matches per tournament (skip ones already archived → restartable)
    match_rows: list[dict] = []
    for t in tournaments:
        tid, tname = t.get("id"), t.get("name", f"t{t.get('id')}")
        level = t.get("level", "")
        raw_file = RAW / f"matches_{tid}.jsonl"
        if raw_file.exists():
            matches = [json.loads(l) for l in raw_file.read_text(encoding="utf-8").splitlines()]
            log(f"  {tname}: cached ({len(matches)} matches)")
        else:
            try:
                matches = list(paginate(f"/tournaments/{tid}/matches"))
            except Exception as e:  # tournament without draw yet, etc.
                log(f"  {tname}: SKIP ({e})")
                continue
            archive(f"matches_{tid}", matches)
            log(f"  {tname}: fetched {len(matches)} matches")

        for m in matches:
            score, winner = m.get("score"), m.get("winner")
            if score == HIDDEN or winner == HIDDEN:
                continue                      # never invent hidden data
            if m.get("status") not in ("ended", "finished", "retired", "walkover"):
                continue
            s1, s2, s3 = parse_score(score)
            p11, p12 = team_names((m.get("players") or {}).get("team_1"))
            p21, p22 = team_names((m.get("players") or {}).get("team_2"))
            match_rows.append({
                "match_id": m.get("id"),
                "date": m.get("played_at", ""),
                "tournament": tname,
                "level": level,
                "tour_category": m.get("category", ""),
                "country": t.get("country", ""),
                "court_type": t.get("court_type", ""),
                "round": m.get("round_name", m.get("round", "")),
                "team1_p1": p11, "team1_p2": p12,
                "team2_p1": p21, "team2_p2": p22,
                "winner_team": 1 if winner == "team_1" else 2,
                "set1": s1, "set2": s2, "set3": s3,
                "status": m.get("status", ""),
                "source": f"padelapi.org match {m.get('id')}",
            })

    # 3. Player directory (current ranking lives on the player resource)
    players = []
    for cat in ("men", "women"):
        try:
            players += list(paginate("/players", {"category": cat}))
        except Exception as e:
            log(f"players[{cat}]: {e}")
    archive("players", players)
    log(f"Players fetched: {len(players)}")

    # 4. Write clean CSVs
    if match_rows:
        with open(OUT / "pro_matches_real.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(match_rows[0].keys()))
            w.writeheader()
            w.writerows(match_rows)
    if players:
        keys = sorted({k for p in players for k in p.keys()})
        with open(OUT / "pro_players_real.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            w.writeheader()
            for p in players:
                w.writerow({k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v) for k, v in p.items()})

    log(f"DONE — {len(match_rows)} real match rows → real/pro_matches_real.csv, "
        f"{len(players)} players → real/pro_players_real.csv")
    log("Hidden/free-plan-masked and unfinished matches were skipped, never guessed.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("Interrupted — re-run to resume (cached tournaments are skipped).")
