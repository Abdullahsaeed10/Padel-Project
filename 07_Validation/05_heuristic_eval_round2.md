# Heuristic Evaluation — Round 2 (External Evaluators, Live App)

**Why a Round 2 exists.** The Round-1 evaluation in `03_UX/01_ux_design.md` §3.4 was a **self-evaluation** run by the student against **low-fidelity wireframes**, and it surfaced only 2 changes (#5 error prevention, #6 recognition rather than recall). The professor's evaluation explicitly flagged this as thin: *"heuristic evaluation reports only two changes."* Nielsen's own research shows a single evaluator (especially the designer themselves) finds ~35% of usability problems, while 3–5 *independent* evaluators typically find 65–75%. Round 2 fixes both weaknesses at once: it uses **1–2 external evaluators** (classmates, not the student) against the **live, working Streamlit app** (not static wireframes), and produces a real findings log plus a tracked-to-closure changes table.

---

## Instructions for External Evaluators

Give each evaluator this section verbatim (or as a printed handout). Evaluators should work **independently and separately** — do not let them discuss findings with each other before both logs are submitted, or you lose the benefit of independent coverage.

> You are reviewing a Streamlit web app called PadelLens — a padel match-logging and pro-tour stats tool for amateur players. Your job is to go through the live app page by page (Home, Pro Tour, My Stats, Log a Match, Compare) and check it against **Nielsen's 10 usability heuristics**, listed below. For every heuristic, on every page where it's relevant, note whether you find a violation — however small. Do not fix anything yourself; just log what you find, exactly where you found it, and how bad you think it is. Spend roughly 45–60 minutes total. It's fine — expected, even — to find nothing wrong for some heuristics on some pages; log "no issue found" rather than skipping it, so we know it was actually checked.

### Nielsen's 10 Heuristics (reference sheet for evaluators)

1. Visibility of system status
2. Match between system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, and recover from errors
10. Help and documentation

### Severity Rating Scale (Nielsen, 1994) — use this scale for every finding

| Rating | Meaning |
|---|---|
| 0 | Not a usability problem at all |
| 1 | Cosmetic problem — fix only if extra time is available |
| 2 | Minor usability problem — fixing it is low priority |
| 3 | Major usability problem — important to fix, should be given high priority |
| 4 | Usability catastrophe — imperative to fix before release |

### How to log a finding
For every issue you notice, add one row to the findings log below. Be specific about location (page + element, e.g., "Log a Match page, set-3 score inputs") — vague findings ("navigation is confusing") are hard to act on. If your setup allows it, take a screenshot and save it as `07_Validation/results/screenshots/E{evaluator#}_F{finding#}.png`, referencing that filename in the log.

---

## Findings Log Template

Copy this table into `07_Validation/results/E1_heuristic_findings.md` (evaluator 1) and `E2_heuristic_findings.md` (evaluator 2).

```
Evaluator: E___ (classmate, not the project author)     Date: __________
App version / commit reviewed: __________

| # | Heuristic (1-10) | Severity (0-4) | Page / Location | Description | Screenshot ref | Proposed fix |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| ... | | | | | | |
```

**Minimum coverage expectation:** at least one row (even if "no issue found," severity 0) per heuristic per evaluator, so the log demonstrates the full 10 were actually checked — this is what directly answers "only two changes were reported."

### Consolidated findings (student merges both evaluators' logs after collection)

| Finding ID | Heuristic | Severity | Page | Description | Reported by | Screenshot ref |
|---|---|---|---|---|---|---|
| F01 | | | | | E1/E2 | |
| F02 | | | | | E1/E2 | |

Sort the consolidated table by severity descending — that ordering becomes the fix priority list.

---

## Changes-Made Tracking Table (Closing the Loop)

This is the table that proves the evaluation actually changed the product, not just documented it. Fill in a row for every finding rated severity ≥ 2 that the student addresses (severity 0–1 items can be noted as "accepted, not fixed — low priority" rather than force-fitted into a change).

| Finding ID | Heuristic | Severity | Change made | Before screenshot | After screenshot | Status |
|---|---|---|---|---|---|---|
| F01 | | | | `results/screenshots/F01_before.png` | `results/screenshots/F01_after.png` | ☐ Fixed ☐ Deferred ☐ Won't fix (reason: ___) |
| F02 | | | | | | |

**Target for the presentation:** show at least 4–6 closed-loop rows here (finding → concrete change → before/after) — a substantial upgrade from Round 1's two changes, and unlike Round 1, these come from evaluators who did not design the app and are checked against the real running product rather than a sketch.

> **What to say in the presentation:** *"Round 1 was a self-evaluation against wireframes and found two issues. For Round 2 I brought in two classmates, gave them Nielsen's 10 heuristics, and had them independently test the live app — not sketches. Between them they logged [N] findings across all 10 heuristics, of which [M] were severity 2 or higher. I fixed [K] of those before the final submission; here's the before/after for the most important ones."*
