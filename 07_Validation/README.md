# Step 7 — Validation Instrument Pack

This folder is the direct response to the professor's evaluation: *"Validation is essentially absent — no user testing or SUS score, heuristic evaluation reports only two changes"* and *"personas are drawn even if it is not clear what was their foundation."*

**Important — this folder contains instruments, not results.** Every file here (01–05) is a tool to be *administered* by the student to real people. Nothing in this folder is a fabricated finding, score, or quote. Actual results go in `07_Validation/results/` once the student runs the sessions (see below).

## How this fits the design → develop → validate loop

```
01_Brief (personas, tasks)  →  03_UX (wireframes, Round-1 self-heuristic eval)
        ↓                              ↓
   PERSONA SURVEY  ←──────── validates the *foundation* of Marco/Luca
        ↓
   INTERVIEW GUIDE  ←──────── adds qualitative depth + quotable evidence
        ↓
   live Streamlit app gets built (Step 6 / app folder)
        ↓
   USER TESTING PROTOCOL (task-based, think-aloud)  →  SUS QUESTIONNAIRE
        ↓
   HEURISTIC EVAL ROUND 2 (external evaluators, live app, Nielsen's 10)
        ↓
   changes made → fed back into the app → closes the loop
```

In short: Round 1 (in `03_UX/`) validated the *design intent* before anything was built. This pack validates the *built product* against real users — the step that was missing.

## Files in this pack

| File | What it is |
|---|---|
| `01_persona_survey.md` | 10–12 question bilingual (EN/IT) survey for club players; includes a mapping table tying each question to a specific Marco/Luca attribute from the brief. |
| `02_interview_guide.md` | 15-minute semi-structured interview (5 questions + probes) plus a quote-capture template for the personas slide. |
| `03_sus_questionnaire.md` | Standard 10-item SUS, English + Italian, exact scoring formula, per-participant scoring sheet, and interpretation benchmarks (68 = average). |
| `04_user_testing_protocol.md` | 5-task think-aloud protocol mapped to the app's 5 pages, with success criteria, metrics, full session script, and a results-recording template. |
| `05_heuristic_eval_round2.md` | Instructions for 1–2 external (classmate) evaluators to re-run Nielsen's 10 against the live app, a findings-log template with severity ratings, and a changes-made tracking table to close the loop. |
| `results/` | Empty by design — see `results/README.md`. This is where actual participant data goes once sessions are run. |

## Recommended Execution Order & Time Estimates

Total student time: roughly **4–6 hours** spread across recruiting + running + compiling, excluding participant recruitment lead time.

| Step | Instrument | Who | Time per participant | Notes |
|---|---|---|---|---|
| 1 | Recruit 3–5 club players + 1–2 classmates | Student | — | Start early; club players' schedules are the bottleneck. |
| 2 | Persona survey (`01`) | All club-player participants | ~5 min | Can be sent ahead of time (Google Form) or done on the spot. |
| 3 | Interview (`02`) | 2–3 participants (subset) | ~15 min | Best done *before* they see the app, to avoid biasing answers. |
| 4 | User testing session (`04`), tasks + SUS | All participants | ~30–35 min | The core session: 5 tasks + SUS + debrief. |
| 5 | Heuristic eval round 2 (`05`) | 1–2 classmates | ~45–60 min each, independent | Can run in parallel with steps 2–4 since it doesn't need club players. |
| 6 | Compile results | Student | ~1–2 hrs | Aggregate SUS table, task success/time table, consolidated findings + changes-made table. |
| 7 | Feed into the app + deck | Student | Variable | Fix severity ≥2 findings where feasible; update personas slide with survey/interview evidence; add SUS score + task metrics to the validation slide. |

**Minimum viable version** if time is very tight: run step 4 (testing + SUS) with just 3 participants and step 5 with 1 classmate — that alone gives a real SUS score and a real multi-heuristic findings log, closing the two biggest gaps the professor named. Steps 2–3 (survey + interview) are what fix the "personas have no foundation" gap and should not be skipped entirely, but can be shortened to 2 participants.

## Results Folder Convention

`07_Validation/results/` holds the actual data collected by running these instruments. It currently contains only a placeholder — see `results/README.md`. Populate it with one file per participant per instrument, anonymized as **P1, P2, P3, P4, P5** (never real names), e.g.:

```
results/
  README.md                     (placeholder, explains convention)
  P1_persona_survey.md
  P1_interview_notes.md
  P1_testing_session.md
  P1_sus_score.md
  P2_persona_survey.md
  ...
  E1_heuristic_findings.md
  E2_heuristic_findings.md
  screenshots/
    F01_before.png
    F01_after.png
```
