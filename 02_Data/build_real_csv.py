"""
Build clean CSVs from the raw padelapi.org archives (real/raw/*.jsonl).

Separated from fetching on purpose (§2 pipeline: acquisition → examination →
transformation are distinct, auditable steps). Re-runnable any time without
touching the network. Never invents values: hidden or unfinished matches are
dropped, unknown fields stay blank.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

REAL = Path(__file__).parent / "real"
RAW = REAL / "raw"
HIDDEN = "hidden_free_plan"
KEEP_STATUS = {"finished", "ended", "retired", "walkover"}


def jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]


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


def duration_min(d) -> str:
    if isinstance(d, str) and ":" in d:
        try:
            h, m = d.split(":")[:2]
            return str(int(h) * 60 + int(m))
        except ValueError:
            return ""
    return ""


def team(players: dict, key: str) -> list[dict]:
    return (players or {}).get(key) or []


def main() -> None:
    tmeta = {t["id"]: t for t in jsonl(RAW / "tournaments.jsonl")}
    rows, players_seen = [], {}

    for f in sorted(RAW.glob("matches_*.jsonl")):
        tid = int(f.stem.split("_")[1])
        t = tmeta.get(tid, {})
        for m in jsonl(f):
            if m.get("status") not in KEEP_STATUS:
                continue
            score, winner = m.get("score"), m.get("winner")
            if score == HIDDEN or winner == HIDDEN or winner not in ("team_1", "team_2"):
                continue
            s1, s2, s3 = sets_from_score(score)
            t1, t2 = team(m.get("players"), "team_1"), team(m.get("players"), "team_2")
            for p in t1 + t2:
                players_seen[p.get("id")] = p
            get_name = lambda tm, i: tm[i].get("name", "") if len(tm) > i else ""
            get_id = lambda tm, i: tm[i].get("id", "") if len(tm) > i else ""
            get_side = lambda tm, i: tm[i].get("side", "") if len(tm) > i else ""
            seeds = m.get("seeds") or {}
            rows.append({
                "match_id": m.get("id"),
                "date": m.get("played_at", ""),
                "tournament": t.get("name", f"tournament {tid}"),
                "level": t.get("level", ""),
                "tour_category": m.get("category", ""),
                "country": t.get("country", ""),
                "court_type": t.get("court_type", "") or "",
                "round": m.get("round_name", m.get("round", "")),
                "round_code": m.get("round", ""),
                "team1_p1": get_name(t1, 0), "team1_p2": get_name(t1, 1),
                "team2_p1": get_name(t2, 0), "team2_p2": get_name(t2, 1),
                "team1_p1_id": get_id(t1, 0), "team1_p2_id": get_id(t1, 1),
                "team2_p1_id": get_id(t2, 0), "team2_p2_id": get_id(t2, 1),
                "team1_sides": f"{get_side(t1,0)}/{get_side(t1,1)}",
                "team2_sides": f"{get_side(t2,0)}/{get_side(t2,1)}",
                "seed_t1": seeds.get("team_1", ""), "seed_t2": seeds.get("team_2", ""),
                "winner_team": 1 if winner == "team_1" else 2,
                "set1": s1, "set2": s2, "set3": s3,
                "duration_min": duration_min(m.get("duration")),
                "status": m.get("status", ""),
                "source": f"padelapi.org match {m.get('id')}",
            })

    rows.sort(key=lambda r: (str(r["date"]), r["match_id"] or 0))
    if rows:
        with open(REAL / "pro_matches_real.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
    print(f"matches: {len(rows)} rows -> real/pro_matches_real.csv")

    # Players: prefer the full directory dump; fall back to players seen in matches
    directory = jsonl(RAW / "players.jsonl")
    plist = directory if directory else list(players_seen.values())
    if plist:
        keys = sorted({k for p in plist for k in p.keys() if k not in ("connections", "self")})
        with open(REAL / "pro_players_real.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=keys, extrasaction="ignore")
            w.writeheader()
            for p in plist:
                w.writerow({k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v)
                            for k, v in p.items()})
    print(f"players: {len(plist)} rows -> real/pro_players_real.csv "
          f"({'full directory' if directory else 'from matches only'})")


if __name__ == "__main__":
    main()
