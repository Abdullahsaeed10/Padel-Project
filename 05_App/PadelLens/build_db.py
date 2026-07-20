"""Migrate data/*.csv into data/padellens.db (SQLite).

Run: python build_db.py

Creates (rebuilding from scratch each run, so this is safe to re-run):
  users        user_id, name               - seeded with user 1 = "Demo User"
  pro_matches  match_id, date, tournament, category, surface, country, round,
               team1_p1, team1_p2, team2_p1, team2_p2, winner_team, set1,
               set2, set3, duration_min, status, source ('real' | 'demo')
  pro_players  player_id, name, country, side, hand, height_cm, birth_year,
               ranking_points
  my_matches   the personal match log schema + a user_id column (all seeded
               rows get user_id=1, i.e. the Demo User)

pro_matches prefers the real 2026-season feed at
02_Data/real/pro_matches_real.csv (mapped into this schema - see
db._read_real_pro_matches) when that file exists; otherwise it falls back to
the bundled demo data/pro_matches.csv. Either way every row is tagged with a
`source` column so the app can show an honest "real" vs "Demo dataset"
caption without re-deriving that at every page load.

This script only ever reads outside 05_App/PadelLens/ (the optional real CSV
in 02_Data/); every write stays inside data/padellens.db.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd

import db

DATA_DIR = db.DATA_DIR
DB_PATH = db.DB_PATH


def build(db_path: Path = DB_PATH) -> Path:
    pro_matches = db._read_pro_matches_from_csv()
    used_real = bool(len(pro_matches)) and (pro_matches["source"] == "real").all()

    pro_players = pd.read_csv(DATA_DIR / "pro_players.csv")

    my_matches = pd.read_csv(DATA_DIR / "my_matches.csv")
    my_matches["user_id"] = db.DEMO_USER_ID

    users = pd.DataFrame([{"user_id": db.DEMO_USER_ID, "name": db.DEMO_USER_NAME}])

    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()

    with sqlite3.connect(db_path) as conn:
        # See db._connect(): MEMORY journal + synchronous=OFF keeps this a
        # plain single-file db that behaves the same on every filesystem.
        conn.execute("PRAGMA journal_mode=MEMORY")
        conn.execute("PRAGMA synchronous=OFF")
        users.to_sql("users", conn, index=False)
        pro_matches.to_sql("pro_matches", conn, index=False)
        pro_players.to_sql("pro_players", conn, index=False)
        my_matches.to_sql("my_matches", conn, index=False)
        conn.commit()

    source_label = "real (02_Data/real/pro_matches_real.csv)" if used_real else "demo (bundled CSV)"
    print("Built " + str(db_path))
    print("  pro_matches : " + str(len(pro_matches)) + " rows, source=" + source_label)
    print("  pro_players : " + str(len(pro_players)) + " rows")
    print("  my_matches  : " + str(len(my_matches)) + " rows (user_id="
          + str(db.DEMO_USER_ID) + ", '" + db.DEMO_USER_NAME + "')")
    print("  users       : " + str(len(users)) + " row(s)")
    return db_path


if __name__ == "__main__":
    build()
