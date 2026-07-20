# Task-Based Think-Aloud User Testing Protocol

**Purpose.** This is the core response to "validation is essentially absent — no user testing." It gives the student a full, runnable session script to observe 3–5 club players (+ 1–2 classmates) actually using the live PadelLens app, one task per page, with think-aloud narration, objective metrics, and the SUS questionnaire folded in at the end.

**Duration per participant.** ~30–35 minutes total (5 min intro, ~15 min tasks, ~5 min SUS, ~5–10 min debrief).

**Equipment.** Laptop/tablet with the live app running (or screen-shared if remote), a timer/stopwatch, this protocol printed or on a second screen, screen recording if the participant consents (very useful for re-checking time-on-task and errors afterward).

---

## The 5 Tasks

Each task maps directly to a page in `03_UX/01_ux_design.md` §3.1 and a task from `01_Brief/01_brief.md` §1.4.

| Task | Instruction given to participant | App page | Brief task ref |
|---|---|---|---|
| **1. Log a match** | "Imagine you just finished a match: you won 6-4, 3-6, 6-2, playing with a partner of your choice against opponents of your choice. Log this match." | Log a Match | T1 |
| **2. Find your best partner** | "Using the app, find out which partner you have the best results with." | My Stats | T3 |
| **3. Interpret the fatigue chart** | "Look at the set-by-set chart and tell me, out loud, what it's telling you about how your performance changes across a match." | My Stats | T5 |
| **4. Filter Pro Tour by surface** | "Find how Premier Padel results differ between indoor and outdoor surfaces." | Pro Tour | T6 |
| **5. Read the Compare radar** | "Open the Compare page and tell me one thing about how your shot mix differs from the pro reference." | Compare | T6 (bridge) |

## Success Criteria per Task

| Task | Success = | Partial success = | Failure = |
|---|---|---|---|
| 1 | Match saved correctly (right score, partner, date) in ≤ 2 min without help | Saved but took > 2 min, or needed one hint | Could not save, or saved with wrong data, or gave up |
| 2 | Correctly names the best-performing partner unprompted | Finds it but needs to be told where to look | Cannot identify a best partner or misreads the data |
| 3 | Correctly states the fatigue pattern shown (e.g., "I do worse in set 3") in own words | Describes the chart shape but not what it means | Cannot describe what the chart shows |
| 4 | Correctly compares indoor vs outdoor results using the filter | Uses the filter but needs a nudge on where it is | Cannot locate or use the surface filter |
| 5 | Correctly states one concrete difference vs the pro reference (e.g., "I hit fewer bandejas") | States a vague difference ("mine looks different") | Cannot interpret the radar at all |

## Metrics to Record (per task, per participant)

- **Completion:** ☐ Success ☐ Partial (assisted) ☐ Failure
- **Time on task** (start when instruction finishes, stop when participant declares done)
- **Errors:** count + short description (wrong click, misread label, had to backtrack, asked "where is...")
- **Assists given:** number of hints the moderator provided, and what they were
- **Verbatim quotes:** anything said during think-aloud worth quoting later (frustration, delight, confusion)
- **Ease rating (optional, 1–5)** — ask immediately after each task: *"On a scale of 1 (very hard) to 5 (very easy), how was that?"* / *"Da 1 (molto difficile) a 5 (molto facile), come è andata?"*

## Session Script

### 1. Consent & framing (2 min)
> EN: *"Thanks for helping test this app. It's a university project, not a finished commercial product, so if something feels broken or unclear, that's exactly what I need to hear — it's the app being tested, not you. Please think out loud as you go: tell me what you're looking at, what you expect to happen, and what confuses you. I'll [record the screen / take notes]. You can stop anytime."*
> IT: *"Grazie per aiutarmi a testare questa app. È un progetto universitario, non un prodotto commerciale finito, quindi se qualcosa sembra rotto o poco chiaro, è esattamente quello che devo sapere — è l'app ad essere testata, non tu. Per favore pensa ad alta voce mentre procedi: dimmi cosa stai guardando, cosa ti aspetti che succeda, e cosa ti confonde. [Registrerò lo schermo / prenderò appunti]. Puoi fermarti quando vuoi."*

### 2. Warm-up (2 min)
- Confirm play frequency / experience (feeds persona validation too — reuse Q1–Q3 from `01_persona_survey.md` if not already collected).
- "Have you used any match-tracking or sports app before?"

### 3. Tasks 1–5, think-aloud (~15 min)
For each task:
1. Read the instruction verbatim (don't explain further — if the participant asks "how do I...", respond with *"What would you try first?"* rather than pointing).
2. Start the timer.
3. Record completion status, time, errors, assists, quotes as they happen (use the recording template below).
4. Ask the 1–5 ease rating.
5. Reset to the app's neutral starting page before the next task.

### 4. SUS questionnaire (~5 min)
Hand over `03_sus_questionnaire.md` printable form immediately after Task 5, while the experience is fresh. Do not discuss the app while they fill it in.

### 5. Debrief (5–10 min)
Short open debrief, reusing/adapting a couple of items from `02_interview_guide.md` if time allows:
- "What was the most frustrating moment?" / *"Qual è stato il momento più frustrante?"*
- "What was the most useful thing you saw?" / *"Qual è stata la cosa più utile che hai visto?"*
- "Would you actually use this after a real match?" / *"Useresti davvero questa app dopo una partita vera?"*
- Thank the participant, confirm anonymization as P#.

---

## Results-Recording Template

Fill one table per participant, save as `07_Validation/results/P#_testing_session.md`.

```
Participant: P___       Date: __________       Moderator: __________
Persona role: ☐ club player   ☐ coach   ☐ classmate
Prior experience with tracking apps: ______________________

| Task | Completion | Time (mm:ss) | Errors (count + note) | Assists | Ease (1-5) | Key quote |
|---|---|---|---|---|---|---|
| 1. Log a match | | | | | | |
| 2. Best partner | | | | | | |
| 3. Fatigue chart | | | | | | |
| 4. Pro Tour surface filter | | | | | | |
| 5. Compare radar | | | | | | |

SUS score (from 03_sus_questionnaire.md): _____ / 100

Debrief notes:
- Most frustrating moment: ________________________________
- Most useful thing seen: _________________________________
- Would use after a real match?  ☐ Yes  ☐ Maybe  ☐ No
- Free notes: _____________________________________________
```

### Cross-participant summary table (fill in after all sessions)

| Task | # Success | # Partial | # Failure | Avg time | Avg ease (1-5) |
|---|---|---|---|---|---|
| 1. Log a match | | | | | |
| 2. Best partner | | | | | |
| 3. Fatigue chart | | | | | |
| 4. Pro Tour surface filter | | | | | |
| 5. Compare radar | | | | | |

Use this table plus the aggregate SUS table (in `03_sus_questionnaire.md`) as the direct evidence base for the "validation" section of the presentation — this is what replaces "validation is essentially absent."
