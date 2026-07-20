"""
Padel API client — command-line data acquisition for PadelLens.

The live app fetches rankings and results on demand (see 05_App/utils.py:
``load_rankings`` / ``load_matches``). This script is the standalone equivalent:
it pulls the same data from the Padel API and writes the snapshot CSVs the app
falls back to when it is offline. Run it to pre-warm those snapshots before a
demo, for BOTH the men's and women's tours.

Padel API (https://padelapi.org). Free tier: 50k requests/month, 10 req/min,
roughly the last 6 months of matches, Bearer-token auth.

How to use locally:
  1. Sign up at padelapi.org and copy your API token.
  2. Save it as an env var:   export PADEL_API_TOKEN="xxx"
     (Windows PowerShell:     $env:PADEL_API_TOKEN = "xxx")
  3. Run:  python api_client.py
     → writes ../05_App/data/{rankings,matches}_{men,women}.csv

If the token is missing or the API is unreachable the script exits non-zero and
leaves any existing snapshots untouched, so the app still runs from them.
"""

import csv
import datetime
import os
import sys
import time

try:
    import requests
except ImportError:  # so the file imports cleanly even before `pip install`
    requests = None

BASE_URL = "https://padelapi.org/api"
TOKEN = os.environ.get("PADEL_API_TOKEN")

# padelapi.org sits behind Cloudflare, which blocks the default python-requests
# user-agent with HTTP 403 (error 1010). A browser-like UA is mandatory.
USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# Write straight into the app's data folder so this refreshes the exact
# snapshots the app reads.
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "05_App", "data")

# Map the API vocabulary to the labels the app uses.
SIDE_LABEL = {"drive": "Drive", "backhand": "Reves"}
LEVEL_LABEL = {"finals": "Finals", "major": "Major", "p1": "P1", "p2": "P2",
               "fip_platinum": "FIP Platinum", "fip_gold": "FIP Gold",
               "fip_silver": "FIP Silver", "fip_bronze": "FIP Bronze"}

RANKING_FIELDS = ["ranking", "name", "nationality", "side", "points",
                  "ranking_diff", "points_diff", "date"]
MATCH_FIELDS = ["date", "tournament", "level", "round", "round_name", "team1",
                "team2", "score", "winner", "duration_min", "n_sets",
                "status", "category"]


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _get(path, params):
    """Authenticated GET with one retry on rate-limit / server errors."""
    if requests is None:
        raise RuntimeError("Install requests: pip install requests")
    if not TOKEN:
        raise RuntimeError("PADEL_API_TOKEN env var is not set.")
    headers = {"Authorization": f"Bearer {TOKEN}",
               "Accept": "application/json", "User-Agent": USER_AGENT}
    for attempt in range(2):
        r = requests.get(f"{BASE_URL}{path}", params=params,
                         headers=headers, timeout=20)
        if r.status_code in (429, 500, 502, 503) and attempt == 0:
            time.sleep(5)
            continue
        r.raise_for_status()
        return r.json()


def _paged(path, params, want):
    """Collect up to `want` rows, following the API's `links.next` pages."""
    rows, page = [], 1
    while len(rows) < want:
        payload = _get(path, {**params, "page": page})
        batch = payload.get("data", [])
        if not batch:
            break
        rows.extend(batch)
        if not (payload.get("links") or {}).get("next"):
            break
        page += 1
    return rows[:want]


def _duration_min(s):
    """'HH:MM' → integer minutes; None / malformed → ''."""
    if not s or ":" not in str(s):
        return ""
    h, mm = str(s).split(":")[:2]
    try:
        return int(h) * 60 + int(mm)
    except ValueError:
        return ""


# ---------------------------------------------------------------------------
# Endpoints → tidy rows (same schema as the app's snapshot CSVs)
# ---------------------------------------------------------------------------

def fetch_rankings(category, top_n=30):
    """GET /rankings (+ /players for side) → ranking rows for one tour.

    `category` is 'men' or 'women'. /rankings gives order, points and the weekly
    movement; /players supplies the playing side, joined on player id. Pairs
    legitimately share a rank, exactly as on the official FIP site.
    """
    ranks = _paged("/rankings", {"type": "official", "category": category}, top_n)
    players = _paged("/players", {"category": category, "sort_by": "ranking",
                                  "order_by": "asc"}, top_n)
    side = {p["id"]: SIDE_LABEL.get(p.get("side"), p.get("side") or "")
            for p in players}
    return [{
        "ranking": r["ranking"], "name": r["name"],
        "nationality": r["nationality"], "side": side.get(r["id"], ""),
        "points": r["points"], "ranking_diff": r.get("ranking_diff"),
        "points_diff": r.get("points_diff"), "date": r.get("date"),
    } for r in ranks]


def _tournament_info(tid, cache):
    """Name + tier for a tournament id, memoised across matches in one run."""
    if tid not in cache:
        try:
            d = _get(f"/tournaments/{tid}", {})
            obj = d.get("data") if isinstance(d, dict) and "data" in d else d
            cache[tid] = {"name": obj.get("name"), "level": obj.get("level") or ""}
        except Exception:
            cache[tid] = {}
    return cache[tid]


def fetch_matches(category, want=90, max_pages=5):
    """GET /matches → recent played results for one tour, mapped to the app schema.

    Keeps finished / retired matches with a score (skips scheduled and byes),
    newest first, up to today. Tournament names are not on the match object, so
    they are looked up once per tournament from /tournaments/{id}.
    """
    today = datetime.date.today().isoformat()
    raw, tcache = [], {}
    for page in range(1, max_pages + 1):
        payload = _get("/matches", {"category": category, "before_date": today,
                                    "sort_by": "played_at", "order_by": "desc",
                                    "page": page})
        batch = payload.get("data", [])
        if not batch:
            break
        raw += [m for m in batch
                if m.get("status") in ("finished", "retired") and m.get("score")]
        if len(raw) >= want or not (payload.get("links") or {}).get("next"):
            break

    out = []
    for m in raw:
        conns = m.get("connections") or {}
        tid = (conns.get("tournament", "") or "").rstrip("/").split("/")[-1]
        tinfo = _tournament_info(tid, tcache) if tid else {}
        level = tinfo.get("level") or ""
        players = m.get("players") or {}
        names = lambda t: " / ".join(p.get("name", "")
                                     for p in (players.get(t) or []))
        score = m.get("score") or []
        out.append({
            "date": m.get("played_at"),
            "tournament": tinfo.get("name") or LEVEL_LABEL.get(level, level) or "—",
            "level": LEVEL_LABEL.get(level, level or "—"),
            "round": m.get("round"), "round_name": m.get("round_name"),
            "team1": names("team_1"), "team2": names("team_2"),
            "score": " · ".join(f"{s.get('team_1', '')}-{s.get('team_2', '')}"
                                for s in score),
            "winner": names(m.get("winner")) if m.get("winner") else "",
            "duration_min": _duration_min(m.get("duration")),
            "n_sets": len(score), "status": m.get("status"),
            "category": category,
        })
    return out


def write_csv(rows, fieldnames, filename):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    return path


if __name__ == "__main__":
    try:
        for cat in ("men", "women"):
            ranks = fetch_rankings(cat)
            write_csv(ranks, RANKING_FIELDS, f"rankings_{cat}.csv")
            print(f"  rankings_{cat}.csv  ({len(ranks)} players)")
            time.sleep(7)  # stay under the 10 req/min free-tier limit

            matches = fetch_matches(cat)
            write_csv(matches, MATCH_FIELDS, f"matches_{cat}.csv")
            print(f"  matches_{cat}.csv   ({len(matches)} matches)")
            time.sleep(7)
        print("Snapshots refreshed in 05_App/data/.")
    except Exception as e:
        print(f"Live fetch failed ({e}). Existing snapshots left untouched; "
              f"the app still runs from them.", file=sys.stderr)
        sys.exit(1)
