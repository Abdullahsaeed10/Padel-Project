# Results go here

This folder is intentionally empty except for this placeholder. It is where **actual data collected from real participants** is stored, after the instruments in `07_Validation/` (01–05) are administered.

## Rules for this folder

- **One file per participant, per instrument.** Anonymize every participant as `P1`, `P2`, `P3`, `P4`, `P5` (club players/classmates) — never store real names, phone numbers, or club affiliations against results.
- External heuristic evaluators are anonymized as `E1`, `E2`.
- Nothing in this folder should be written by the instrument-pack author (the assistant that created `01`–`05`) — it is filled in only by the student, only after real sessions are run. If this folder contains anything other than this README, it is real (or intentionally piloted test) data, not fabricated content.

## Expected files once sessions are run

```
results/
  README.md                     ← this file
  P1_persona_survey.md
  P1_interview_notes.md
  P1_testing_session.md
  P1_sus_score.md
  P2_persona_survey.md
  P2_testing_session.md
  P2_sus_score.md
  P3_...
  P4_...
  P5_...
  E1_heuristic_findings.md
  E2_heuristic_findings.md
  screenshots/
    F01_before.png
    F01_after.png
    ...
```

## Aggregation

Once all participant files exist, compile the cross-participant summary tables referenced in:
- `04_user_testing_protocol.md` (task success/time/ease summary + mean SUS)
- `05_heuristic_eval_round2.md` (consolidated findings + changes-made table)

Those aggregated tables — not the raw per-participant files — are what should be pulled into the final presentation deck.
