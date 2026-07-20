# System Usability Scale (SUS) — PadelLens

**Purpose.** Produces the single quantitative usability number the professor's evaluation says is missing ("no user testing or SUS score"). Administer this *immediately after* the task-based session in `04_user_testing_protocol.md`, while the app experience is fresh — never as a cold standalone questionnaire.

**Who.** Every participant who completes the user-testing protocol (target: 3–5 club players + 1–2 classmates, i.e. N=4–7). SUS is validated down to small samples (N≥5 already gives a stable estimate for formative testing; this is not a lab-grade statistical study, and that's fine for a coursework validation pass).

**Language.** Give participants the language they're most comfortable in. Both versions below are the same 10 canonical Brooke (1986) items; the Italian column is a standard Italian adaptation consistent with the translation used in Italian public-sector usability practice (e.g., Designers Italia usability toolkit) and the dimensionality work of Borsci, Federici & Lauriola (2009) validating SUS's two-factor structure in Italian samples. **Before printing for real participants, do a 30-second sanity read of the Italian column yourself (or have a native speaker glance at it) — translation nuance matters more than instrument-hunting rigor here.**

**Scale.** 5-point Likert, single scale label shown once at the top (not per item) to keep the form compact.

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Strongly disagree / Fortemente in disaccordo | Disagree / In disaccordo | Neutral / Neutro | Agree / D'accordo | Strongly agree / Fortemente d'accordo |

---

## The 10 Items

| # | English (Brooke, 1986) | Italiano | Polarity |
|---|---|---|---|
| 1 | I think that I would like to use this system frequently. | Penso che mi piacerebbe utilizzare questo sistema frequentemente. | Positive (odd) |
| 2 | I found the system unnecessarily complex. | Ho trovato il sistema inutilmente complesso. | Negative (even) |
| 3 | I thought the system was easy to use. | Ho trovato il sistema facile da usare. | Positive (odd) |
| 4 | I think that I would need the support of a technical person to be able to use this system. | Penso che avrei bisogno del supporto di una persona tecnica per riuscire a usare questo sistema. | Negative (even) |
| 5 | I found the various functions in this system were well integrated. | Ho trovato che le varie funzioni di questo sistema erano ben integrate tra loro. | Positive (odd) |
| 6 | I thought there was too much inconsistency in this system. | Ho riscontrato troppa incoerenza in questo sistema. | Negative (even) |
| 7 | I would imagine that most people would learn to use this system very quickly. | Immagino che la maggior parte delle persone imparerebbe a usare questo sistema molto rapidamente. | Positive (odd) |
| 8 | I found the system very cumbersome/awkward to use. | Ho trovato il sistema molto macchinoso/scomodo da usare. | Negative (even) |
| 9 | I felt very confident using the system. | Mi sono sentito/a molto sicuro/a usando il sistema. | Positive (odd) |
| 10 | I needed to learn a lot of things before I could get going with this system. | Ho dovuto imparare molte cose prima di riuscire a usare questo sistema. | Negative (even) |

### Printable participant form (English)

For each statement, circle one number from 1 (strongly disagree) to 5 (strongly agree). There are no right or wrong answers — please respond quickly, based on your immediate reaction.

```
 1. I think that I would like to use this system frequently.            1  2  3  4  5
 2. I found the system unnecessarily complex.                           1  2  3  4  5
 3. I thought the system was easy to use.                               1  2  3  4  5
 4. I think that I would need the support of a technical person
    to be able to use this system.                                     1  2  3  4  5
 5. I found the various functions in this system were well integrated.  1  2  3  4  5
 6. I thought there was too much inconsistency in this system.          1  2  3  4  5
 7. I would imagine that most people would learn to use this
    system very quickly.                                                1  2  3  4  5
 8. I found the system very cumbersome/awkward to use.                  1  2  3  4  5
 9. I felt very confident using the system.                             1  2  3  4  5
10. I needed to learn a lot of things before I could get going
    with this system.                                                   1  2  3  4  5
```

### Modulo stampabile per partecipante (Italiano)

Per ogni affermazione, cerchia un numero da 1 (fortemente in disaccordo) a 5 (fortemente d'accordo). Non ci sono risposte giuste o sbagliate — rispondi rapidamente, in base alla tua reazione immediata.

```
 1. Penso che mi piacerebbe utilizzare questo sistema frequentemente.    1  2  3  4  5
 2. Ho trovato il sistema inutilmente complesso.                        1  2  3  4  5
 3. Ho trovato il sistema facile da usare.                              1  2  3  4  5
 4. Penso che avrei bisogno del supporto di una persona tecnica
    per riuscire a usare questo sistema.                                1  2  3  4  5
 5. Ho trovato che le varie funzioni di questo sistema erano
    ben integrate tra loro.                                             1  2  3  4  5
 6. Ho riscontrato troppa incoerenza in questo sistema.                 1  2  3  4  5
 7. Immagino che la maggior parte delle persone imparerebbe a
    usare questo sistema molto rapidamente.                             1  2  3  4  5
 8. Ho trovato il sistema molto macchinoso/scomodo da usare.            1  2  3  4  5
 9. Mi sono sentito/a molto sicuro/a usando il sistema.                 1  2  3  4  5
10. Ho dovuto imparare molte cose prima di riuscire a usare
    questo sistema.                                                     1  2  3  4  5
```

---

## Exact Scoring Instructions

SUS produces a single score 0–100 per participant (it is **not** a percentage — treat it as a relative usability index).

1. **Odd items (1, 3, 5, 7, 9)** — positively worded. Contribution = **(score − 1)**.
2. **Even items (2, 4, 6, 8, 10)** — negatively worded. Contribution = **(5 − score)**.
3. Sum all 10 contributions (range 0–40).
4. **Multiply the sum by 2.5** → final SUS score, range 0–100.

Formula:

```
SUS = 2.5 × [ (Q1−1) + (5−Q2) + (Q3−1) + (5−Q4) + (Q5−1)
            + (5−Q6) + (Q7−1) + (5−Q8) + (Q9−1) + (5−Q10) ]
```

If a participant skips one item, standard practice (Sauro, 2011) is to substitute the mean of that participant's other 9 item-contributions rather than discard the questionnaire — but for this small sample, prefer re-asking the participant on the spot instead.

---

## Per-Participant Scoring Sheet

Copy this block once per participant into `07_Validation/results/P#_sus_score.md`.

```
Participant: P___        Date: __________       Session length: _____ min
Persona role (self-reported): ☐ club player (Marco-type)  ☐ coach (Luca-type)  ☐ classmate/other

Raw item scores (1-5):
Q1 __  Q2 __  Q3 __  Q4 __  Q5 __  Q6 __  Q7 __  Q8 __  Q9 __  Q10 __

Contributions:
Q1 (Q1-1)=__  Q2 (5-Q2)=__  Q3 (Q3-1)=__  Q4 (5-Q4)=__  Q5 (Q5-1)=__
Q6 (5-Q6)=__  Q7 (Q7-1)=__  Q8 (5-Q8)=__  Q9 (Q9-1)=__  Q10 (5-Q10)=__

Sum of contributions (0-40): _____
SUS score = Sum × 2.5 = _____  / 100
```

### Aggregate summary table (fill in after all participants complete SUS)

| Participant | Role | SUS Score | Grade (see below) |
|---|---|---|---|
| P1 | | | |
| P2 | | | |
| P3 | | | |
| P4 | | | |
| P5 | | | |
| **Mean** | | **____** | |

---

## Interpretation Benchmarks

- **68 = average.** Based on Sauro's (2011) analysis of 500+ SUS studies, the mean SUS score across products/industries is **68**. A score above 68 is above-average usability for a comparable product; below 68 is below-average.
- **Percentile / letter-grade curve (Sauro-Lewis, "Grade Card"):**

| SUS Score | Grade | Percentile rank | Adjective rating |
|---|---|---|---|
| ≥ 84.1 | A+ | 96–100 | Best imaginable |
| 80.8 – 84.0 | A | 90–95 | Excellent |
| 78.9 – 80.7 | A− | 85–89 | Excellent |
| 77.2 – 78.8 | B+ | 80–84 | Good/Excellent |
| 74.1 – 77.1 | B | 70–79 | Good |
| 72.6 – 74.0 | B− | 65–69 | Good |
| 71.1 – 72.5 | C+ | 60–64 | Good |
| 65.0 – 71.0 | C | 41–59 | OK |
| 62.7 – 64.9 | C− | 35–40 | OK |
| 51.7 – 62.6 | D | 15–34 | Poor |
| ≤ 51.6 | F | 0–14 | Worst imaginable |

- **Acceptability ranges (Bangor, Kortum & Miller, 2009):** < 50 = *not acceptable*; 50–70 = *marginal*; > 70 = *acceptable*.
- **Practical reading for this project:** with N=4–7 amateur/coach participants, treat the mean SUS as an *indicative* number, not a statistically powered claim — report it alongside the raw per-participant spread (min/max), and pair it with the qualitative findings from the interview guide and think-aloud protocol so a single low outlier doesn't get over-read.
- **What to say in the presentation:** *"I ran the standard 10-item SUS with N participants after the task-based session. The mean score was __, which lands in the [grade] band and is [above/below] the industry-average benchmark of 68. This is the number that was previously missing entirely from the evaluation."*
