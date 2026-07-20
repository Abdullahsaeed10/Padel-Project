"""SQLite persistence layer for PadelLens.

Plain sqlite3 + pandas.read_sql - no ORM. This module is the single place that
knows whether the app is reading from data/padellens.db or falling back to the
bundled CSVs, and whether the active pro dataset is the real 2026 season feed
or the synthetic demo set. Pages and utils.py should go through here instead
of reading CSVs directly.

Multi-user shape: my_matches carries a user_id column (default 1, "Demo
User" in the seeded users table) so a future login layer only has to swap
which user_id is active - the schema is already there.

Falls back transparently to the bundled CSVs when data/padellens.db hasn't
been built yet (see build_db.py) - the app must never hard-fail just because
nobody has run the migration script.
"""
from __future__ import annotations

import csv
import sqlite3
from pathlib import Path
from typing import Optional

import pandas as pd

APP_DIR = Path(__file__).parent
DATA_DIR = APP_DIR / "data"
DB_PATH = DATA_DIR / "padellens.db"

# The real 2026-season pro match feed (if the project's data-acquisition step
# has produced it) lives outside this app's folder, three levels up in
# 02_Data/real/. Reading it here is fine (import-only, read-only); this module
# never writes there.
REAL_PRO_CSV = APP_DIR.parent.parent / "02_Data" / "real" / "pro_matches_real.csv"
REAL_PRO_PLAYERS_CSV = APP_DIR.parent.parent / "02_Data" / "real" / "pro_players_real.csv"

DEMO_USER_ID = 1
DEMO_USER_NAME = "Demo User"

# ---------------------------------------------------------------------------
# Real-data mapping: pro_matches_real.csv schema ->
#   match_id,date,tournament,category,surface,country,round,team1_p1,
#   team1_p2,team2_p1,team2_p2,winner_team,set1,set2,set3,duration_min,
#   status,source
# (this is the schema analytics.py's functions and the rest of the app
# already expect from the demo pro_matches.csv, so mapping into it means every
# downstream consumer - analytics.py, the Insights renderers, Pro Tour's
# "recent form" table - works unchanged regardless of which source is active.)
# ---------------------------------------------------------------------------

_LEVEL_TO_CATEGORY = {
    "p1": "P1", "p2": "P2", "major": "Major", "finals": "Finals",
    "fip_platinum": "FIP Platinum", "fip_gold": "FIP Gold",
    "fip_silver": "FIP Silver", "fip_bronze": "FIP Bronze",
}

# court_type -> surface. padelapi.org's court_type vocabulary isn't fully
# known ahead of time, so common indoor/outdoor synonyms are mapped
# explicitly and anything else passes through lowercased rather than being
# silently dropped.
_COURT_TO_SURFACE = {
    "indoor": "indoor", "covered": "indoor", "panoramic": "indoor",
    "outdoor": "outdoor", "open air": "outdoor", "hard": "outdoor",
    "hard court": "outdoor", "clay": "outdoor",
}


def _map_level(level) -> str:
    if pd.isna(level):
        return "Unknown"
    key = str(level).strip().lower()
    return _LEVEL_TO_CATEGORY.get(key, str(level).strip())


def _map_court(court_type) -> str:
    if pd.isna(court_type) or not str(court_type).strip():
        return "unknown"
    key = str(court_type).strip().lower()
    return _COURT_TO_SURFACE.get(key, key)


def _read_real_pro_matches() -> Optional[pd.DataFrame]:
    """Real 2026-season pro matches, mapped into the app's pro_matches schema.

    Returns None when 02_Data/real/pro_matches_real.csv doesn't exist yet, so
    callers fall back to the demo dataset transparently.
    """
    if not REAL_PRO_CSV.exists():
        return None
    raw = pd.read_csv(REAL_PRO_CSV)
    df = pd.DataFrame({
        "match_id": raw["match_id"],
        "date": raw["date"],
        "tournament": raw["tournament"],
        "category": raw["level"].map(_map_level),
        "surface": raw["court_type"].map(_map_court),
        "country": raw["country"],
        "round": raw["round"],
        "team1_p1": raw["team1_p1"], "team1_p2": raw["team1_p2"],
        "team2_p1": raw["team2_p1"], "team2_p2": raw["team2_p2"],
        "winner_team": raw["winner_team"],
        "set1": raw["set1"], "set2": raw["set2"], "set3": raw["set3"],
        "duration_min": float("nan"),   # not present in the real feed
        "status": raw["status"] if "status" in raw.columns else "finished",
    })
    df["source"] = "real"
    # Extra columns beyond the demo pro_matches schema -- analytics.py's
    # functions document that extra columns are ignored, so carrying these
    # through is safe for every existing consumer. The Insights page uses
    # them for findings the demo schema can't express: tour_category (men /
    # women) lets the momentum renderer facet by gender instead of surface;
    # seed_t1/seed_t2 (numeric seed or WC/Q/LL/blank) drive the seeded-upsets
    # finding.
    if "tour_category" in raw.columns:
        df["tour_category"] = raw["tour_category"]
    if "seed_t1" in raw.columns:
        df["seed_t1"] = raw["seed_t1"]
    if "seed_t2" in raw.columns:
        df["seed_t2"] = raw["seed_t2"]
    return df


def _read_real_pro_players() -> Optional[pd.DataFrame]:
    """Real 2026-season player roster, mapped into the app's pro_players
    schema (player_id, name, country, side, hand, height_cm, birth_year,
    ranking_points). Returns None when 02_Data/real/pro_players_real.csv
    doesn't exist yet, so callers fall back to whatever pro_players source
    was already active.

    Why this exists: data/padellens.db's pro_players table is seeded once by
    build_db.py straight from the *demo* data/pro_players.csv, and is never
    re-derived when the real match feed shows up -- so without this function,
    Elo (computed on real match player names) would be joined against a
    completely disjoint set of 30 demo player names, silently producing an
    empty join. Reading the real roster live here keeps pro_players in sync
    with the real pro_matches names build_db.py already prefers.

    height_cm is imputed with the column mean for the ~11% of match
    participants missing it (a documented, defensible simplification): unlike
    the real-matches mapping, analytics.fit_win_model has no per-row NaN
    guard of its own beyond checking that a player *name* is present in the
    table, so a NaN height would silently become a NaN model feature and
    break model fitting for every match, not just the ones with missing
    height. ranking_points ('points' in the source data) has full coverage
    among match participants, so no imputation is needed there.
    """
    if not REAL_PRO_PLAYERS_CSV.exists():
        return None
    raw = pd.read_csv(REAL_PRO_PLAYERS_CSV)
    birth_year = pd.to_datetime(raw["birthdate"], errors="coerce").dt.year
    height_cm = pd.to_numeric(raw["height"], errors="coerce")
    height_cm = height_cm.fillna(height_cm.mean())
    return pd.DataFrame({
        "player_id": raw["id"],
        "name": raw["name"],
        "country": raw["nationality"],
        "side": raw["side"],
        "hand": raw["hand"],
        "height_cm": height_cm,
        "birth_year": birth_year,
        "ranking_points": raw["points"],
    })


def _read_demo_pro_matches() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "pro_matches.csv")
    df["status"] = "finished"
    df["source"] = "demo"
    return df


def _read_pro_matches_from_csv() -> pd.DataFrame:
    """Real data if present, else the bundled demo CSV. Used both by the
    no-db fallback path here and by build_db.py's migration."""
    real = _read_real_pro_matches()
    return real if real is not None else _read_demo_pro_matches()


# ---------------------------------------------------------------------------
# Connection helper
# ---------------------------------------------------------------------------

def _connect() -> sqlite3.Connection:
    """Open the SQLite connection with pragmas that keep this a plain
    single-file local db: a MEMORY journal (no separate -journal file) and
    synchronous=OFF. This is a small local demo app, not a system of record,
    so trading crash-safety for a connection that behaves the same on every
    filesystem (including network-mounted drives that don't support SQLite's
    default rollback-journal file locking) is the right tradeoff.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=MEMORY")
    conn.execute("PRAGMA synchronous=OFF")
    return conn


def _db_exists() -> bool:
    return DB_PATH.exists()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_pro_players() -> pd.DataFrame:
    """All pro players - the real 2026-season roster if
    02_Data/real/pro_players_real.csv exists (mapped into this schema, see
    _read_real_pro_players), else SQLite (data/padellens.db) if built, else
    the bundled demo CSV.

    The real CSV is checked first, ahead of SQLite: see
    _read_real_pro_players's docstring for why padellens.db's pro_players
    table can't be trusted to reflect the real feed on its own.
    """
    real = _read_real_pro_players()
    if real is not None:
        return real
    if _db_exists():
        with _connect() as conn:
            return pd.read_sql("SELECT * FROM pro_players", conn)
    return pd.read_csv(DATA_DIR / "pro_players.csv")


def load_pro_matches() -> pd.DataFrame:
    """All pro matches, with a `source` column ('real' | 'demo').

    Prefers data/padellens.db (built by build_db.py, which already resolved
    real-vs-demo at migration time); falls back to resolving it live from CSV
    when the db hasn't been built yet. Because that SQLite table was built
    before the tour_category/seed_t1/seed_t2 passthrough columns existed,
    those extra columns are merged back in live from the real CSV (when
    present) so pages don't need data/padellens.db rebuilt to use them.
    """
    if _db_exists():
        with _connect() as conn:
            df = pd.read_sql("SELECT * FROM pro_matches", conn)
        if (df.get("source") == "real").all() if len(df) else False:
            extra = _read_real_pro_matches()
            if extra is not None:
                extra_cols = [c for c in ("tour_category", "seed_t1", "seed_t2")
                              if c in extra.columns and c not in df.columns]
                if extra_cols:
                    df = df.merge(extra[["match_id"] + extra_cols], on="match_id", how="left")
    else:
        df = _read_pro_matches_from_csv()
    df["date"] = pd.to_datetime(df["date"])
    return df


def pro_data_meta() -> dict:
    """Describe which pro dataset is currently active, for the UI caption.

    Returns {"real": bool, "caption": str}. `real` is True only when every
    row in pro_matches was tagged 'real' at migration/load time (i.e. the
    02_Data/real/pro_matches_real.csv feed was found).
    """
    df = load_pro_matches()
    is_real = bool(len(df)) and "source" in df.columns and (df["source"] == "real").all()
    if is_real:
        return {"real": True, "caption": "Data: padelapi.org, 2026 season (real)"}
    return {"real": False, "caption": "Demo dataset"}


def load_my_matches(user_id: int = DEMO_USER_ID) -> pd.DataFrame:
    """Personal match log for one user."""
    if _db_exists():
        with _connect() as conn:
            df = pd.read_sql(
                "SELECT * FROM my_matches WHERE user_id = ?", conn, params=(user_id,)
            )
    else:
        df = pd.read_csv(DATA_DIR / "my_matches.csv")
        df["user_id"] = user_id
    df["date"] = pd.to_datetime(df["date"])
    return df


def is_demo_user(user_id: int = DEMO_USER_ID) -> bool:
    """True when this user's my_matches is the seeded synthetic demo set.

    Academic-honesty gate for the "SYNTHETIC DEMO DATA" badge: before
    data/padellens.db is built the app can only be showing the bundled demo
    log, so this returns True unconditionally; once built, it checks whether
    the users table still has this user_id registered as 'Demo User'.
    """
    if not _db_exists():
        return True
    with _connect() as conn:
        row = conn.execute(
            "SELECT name FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
    return bool(row) and row[0] == DEMO_USER_NAME


def save_my_match(row: dict, user_id: int = DEMO_USER_ID) -> int:
    """Persist one logged match for `user_id`. Assigns match_id automatically
    (max existing + 1 for that user). Returns the new match_id.

    Writes to data/padellens.db when it exists; otherwise appends to the
    bundled my_matches.csv (the pre-migration fallback), matching the
    behaviour the app had before this module existed.
    """
    existing = load_my_matches(user_id=user_id)
    new_id = int(existing["match_id"].max()) + 1 if len(existing) else 1

    record = dict(row)
    record["match_id"] = new_id

    if _db_exists():
        record["user_id"] = user_id
        cols = ", ".join(record.keys())
        placeholders = ", ".join("?" for _ in record)
        with _connect() as conn:
            conn.execute(
                "INSERT INTO my_matches (" + cols + ") VALUES (" + placeholders + ")",
                list(record.values()),
            )
            conn.commit()
    else:
        p = DATA_DIR / "my_matches.csv"
        write_header = not p.exists()
        with open(p, "a", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(record.keys()))
            if write_header:
                w.writeheader()
            w.writerow(record)

    return new_id
