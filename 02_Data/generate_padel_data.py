"""Generates the working datasets for the PadelLens app.

Three CSV files are produced in ./data/:
  - pro_players.csv     Real Premier Padel players + plausible ranking points.
  - pro_matches.csv     Plausible 2024-2025 Premier Padel match results.
  - my_matches.csv      Synthetic personal-log data ('Marco' the amateur).
"""

import csv
import os
import random
from datetime import date, timedelta

random.seed(42)

OUT = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUT, exist_ok=True)

PRO_PLAYERS = [
    ("Arturo Coello","ESP","D","right",192,2002,11200),
    ("Agustin Tapia","ARG","R","left",170,1999,11050),
    ("Ale Galan","ESP","D","right",188,1996,9300),
    ("Federico Chingotto","ARG","R","right",168,1991,9180),
    ("Juan Lebron","ESP","R","right",187,1994,7600),
    ("Franco Stupaczuk","ARG","D","right",184,1996,7480),
    ("Martin Di Nenno","ARG","R","right",180,1997,6750),
    ("Paquito Navarro","ESP","R","right",178,1989,6400),
    ("Mike Yanguas","ESP","D","right",186,2001,6120),
    ("Momo Gonzalez","ESP","D","right",191,1996,5980),
    ("Jon Sanz","ESP","R","right",176,2002,5740),
    ("Lucas Bergamini","BRA","R","right",175,1995,5300),
    ("Pablo Cardona","ESP","D","right",182,1999,5150),
    ("Javi Garrido","ESP","D","right",188,1992,4980),
    ("Juan Tello","ARG","D","right",178,1993,4870),
    ("Leo Augsburger","ARG","D","right",175,2001,4600),
    ("Coki Nieto","ESP","D","right",184,1990,4280),
    ("Alex Ruiz","ESP","R","right",183,1999,4150),
    ("Tolito Aguirre","ARG","R","right",174,1992,3990),
    ("Edu Alonso","ESP","R","right",177,1999,3780),
    ("Miguel Yanguas","ESP","R","right",182,2003,3620),
    ("Sanyo Gutierrez","ARG","D","right",173,1985,3500),
    ("Maxi Sanchez","ARG","D","right",174,1985,3380),
    ("Pablo Lima","BRA","R","right",188,1985,3200),
    ("Ramiro Moyano","ARG","R","right",175,1987,3050),
    ("Lucas Campagnolo","BRA","D","right",180,1995,2890),
    ("Victor Ruiz","ESP","R","right",182,1998,2740),
    ("Pablo Bujosa","ESP","D","right",184,1999,2610),
    ("Denis Perino","ARG","R","right",179,1993,2470),
    ("Carlos Daniel Gutierrez","ARG","D","right",173,1989,2340),
]

def write_pro_players():
    p = os.path.join(OUT, "pro_players.csv")
    with open(p,"w",newline="",encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["player_id","name","country","side","hand","height_cm","birth_year","ranking_points"])
        for i, row in enumerate(PRO_PLAYERS, start=1):
            w.writerow([i, *row])
    return p

TOURNAMENTS = [
    ("Riyadh P1","outdoor","SAU",date(2024,2,19),"P1"),
    ("Qatar Major","outdoor","QAT",date(2024,3,4),"Major"),
    ("Brussels P2","indoor","BEL",date(2024,4,15),"P2"),
    ("Rome Major","outdoor","ITA",date(2024,5,13),"Major"),
    ("Bordeaux P2","outdoor","FRA",date(2024,6,17),"P2"),
    ("Madrid Major","outdoor","ESP",date(2024,7,22),"Major"),
    ("Milan P1","indoor","ITA",date(2024,9,9),"P1"),
    ("Paris Major","indoor","FRA",date(2024,10,7),"Major"),
    ("Mexico City P1","outdoor","MEX",date(2024,11,4),"P1"),
    ("Barcelona Finals","indoor","ESP",date(2024,12,2),"Finals"),
    ("Genova P2","indoor","ITA",date(2025,1,20),"P2"),
    ("Riyadh P1 25","outdoor","SAU",date(2025,2,17),"P1"),
]
ROUNDS = ["R32","R16","QF","SF","F"]

def _set_score():
    r = random.random()
    if r < 0.45:   return (6, random.choice([0,1,2,3,4]))
    if r < 0.80:   return (6, random.choice([3,4]))
    if r < 0.95:   return (7, 5)
    return (7, 6)

def realistic_score():
    if random.random() < 0.70:
        return [_set_score(), _set_score(), None]
    return [_set_score(), _set_score(), _set_score()]

def write_pro_matches():
    p = os.path.join(OUT,"pro_matches.csv")
    pairs = [
        ("Arturo Coello","Agustin Tapia"),
        ("Ale Galan","Federico Chingotto"),
        ("Juan Lebron","Franco Stupaczuk"),
        ("Martin Di Nenno","Paquito Navarro"),
        ("Mike Yanguas","Momo Gonzalez"),
        ("Jon Sanz","Pablo Cardona"),
        ("Javi Garrido","Lucas Bergamini"),
        ("Juan Tello","Leo Augsburger"),
        ("Coki Nieto","Alex Ruiz"),
        ("Tolito Aguirre","Edu Alonso"),
        ("Miguel Yanguas","Pablo Bujosa"),
        ("Sanyo Gutierrez","Maxi Sanchez"),
        ("Pablo Lima","Ramiro Moyano"),
        ("Lucas Campagnolo","Victor Ruiz"),
        ("Denis Perino","Carlos Daniel Gutierrez"),
    ]
    rows = []
    mid = 1
    for tname, surface, country, start, cat in TOURNAMENTS:
        counts = [8,8,4,2,1]
        day = 0
        for rnd, n in zip(ROUNDS, counts):
            sh = pairs.copy(); random.shuffle(sh)
            for i in range(n):
                t1 = sh[(2*i) % len(sh)]
                t2 = sh[(2*i+1) % len(sh)]
                if t1 == t2: continue
                s1, s2, s3 = realistic_score()
                winner = 1 if random.random() < 0.55 else 2
                def fmt(s):
                    if s is None: return ""
                    return f"{s[0]}-{s[1]}" if winner==1 else f"{s[1]}-{s[0]}"
                rows.append([mid, (start+timedelta(days=day)).isoformat(),
                             tname, cat, surface, country, rnd,
                             t1[0], t1[1], t2[0], t2[1], winner,
                             fmt(s1), fmt(s2), fmt(s3), random.randint(58,124)])
                mid += 1
            day += 1
    with open(p,"w",newline="",encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["match_id","date","tournament","category","surface","country","round",
                    "team1_p1","team1_p2","team2_p1","team2_p2","winner_team",
                    "set1","set2","set3","duration_min"])
        w.writerows(rows)
    return p, len(rows)

PARTNERS = ["Luca","Marco V.","Andrea","Giulia","Stefano","Davide"]
OPPONENTS = ["Paolo & Matteo","Sara & Elena","Roberto & Gianluca",
             "Federico & Tommaso","Alessio & Riccardo","Giorgio & Pietro",
             "Lorenzo & Nicolo","Simone & Daniele"]
CLUBS = ["Padel Milano Navigli","Aspria Harbour Club","Padel Bicocca","Padel Loreto"]
NOTES = ["","","Felt tired","Crowd at the club","New paddle",
         "Played late at night","Good rhythm today","Couldn't find serve",
         "","Cold court - slow play","Back from injury"]

def write_my_matches():
    p = os.path.join(OUT,"my_matches.csv")
    rows = []
    d = date(2024,11,1)
    # Planted patterns (DETERMINISTIC win counts per partner so the story is
    # unambiguous at N=40):
    #   Luca     8/10  (best partner)
    #   Marco V. 4/7
    #   Andrea   3/6
    #   Giulia   3/6
    #   Stefano  3/6
    #   Davide   1/5   (worst partner)
    # Total: 22/40 = 55% overall.
    partner_plan = [("Luca",10,8), ("Marco V.",7,4), ("Andrea",6,3),
                    ("Giulia",6,3), ("Stefano",6,3), ("Davide",5,1)]
    seq = []
    for name, n, w in partner_plan:
        seq.extend([(name, True)] * w + [(name, False)] * (n - w))
    random.shuffle(seq)

    for i, (partner, won) in enumerate(seq):
        opp = random.choice(OPPONENTS)
        surface = random.choice(["indoor","indoor","outdoor"])
        club = random.choice(CLUBS)
        # Force third-set rate: 60% of wins are straight, but 70% of losses are 3-set
        if won:
            three = random.random() < 0.40
        else:
            three = random.random() < 0.70
        if not three:
            sp = 2
            if won:
                us = [6,6]
                them = [random.choice([2,3,4]), random.choice([3,4])]
            else:
                us = [random.choice([2,3,4]), random.choice([3,4])]
                them = [6,6]
            us3 = them3 = None
        else:
            sp = 3
            us = [6, random.choice([3,4])]
            them = [random.choice([3,4]), 6]
            if won:
                us3, them3 = 6, random.choice([3,4])
            else:
                us3, them3 = random.choice([3,4]), 6
        boost = 1.0 if won else 0.7
        w_fh = int(random.randint(4,9) * boost)
        w_bh = int(random.randint(2,5) * boost)
        w_sm = random.randint(1,3)
        w_vo = int(random.randint(3,7) * boost)
        w_ba = int(random.randint(5,10) * boost)
        e_fh = random.randint(2,5)
        e_bh = random.randint(4,8)
        e_sm = random.randint(4,8)
        e_vo = random.randint(1,3)
        e_ba = random.randint(1,3)
        dur = 55 + (35 if sp==3 else 0) + random.randint(-5,15)
        rows.append([i+1, d.isoformat(), partner, opp, club, surface, sp,
                     us[0], them[0], us[1], them[1],
                     us3 if us3 is not None else "", them3 if them3 is not None else "",
                     "W" if won else "L",
                     w_fh, w_bh, w_sm, w_vo, w_ba,
                     e_fh, e_bh, e_sm, e_vo, e_ba,
                     dur, random.choice(NOTES)])
        d = d + timedelta(days=random.choice([2,3,3,4,5,7]))

    with open(p,"w",newline="",encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["match_id","date","partner","opponents","club","surface","sets_played",
                    "set1_us","set1_them","set2_us","set2_them","set3_us","set3_them","result",
                    "winners_forehand","winners_backhand","winners_smash","winners_volley","winners_bandeja",
                    "errors_forehand","errors_backhand","errors_smash","errors_volley","errors_bandeja",
                    "duration_min","notes"])
        w.writerows(rows)
    return p, len(rows)

if __name__ == "__main__":
    a = write_pro_players()
    b, nb = write_pro_matches()
    c, nc = write_my_matches()
    print(f"  pro_players.csv  -> {a}  ({len(PRO_PLAYERS)} rows)")
    print(f"  pro_matches.csv  -> {b}  ({nb} rows)")
    print(f"  my_matches.csv   -> {c}  ({nc} rows)")
