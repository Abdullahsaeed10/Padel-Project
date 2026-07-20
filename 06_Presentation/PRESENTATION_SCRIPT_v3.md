# PadelLens — Resubmission Presentation Script (v3)

**Deck:** `PadelLens_Deck_v3_full.pptx` (37 slides) · **Target length:** ~35 minutes + Q&A
**Format per entry:** Slide # · Title · Badge status · What to say (2-4 sentences, first person)

Timings are cumulative guidance, not a stopwatch contract — pace to the room, but use these as
checkpoints so Part 6 doesn't get rushed.

---

## Opening (target: 2:15)

**Slide 1 — PADELLENS** · *unchanged, new subtitle line* · ~0:30
"Good evening. My name is Sensei, this is my final project for Data Visualization for Sport.
PadelLens is a data visualization tool for amateur padel players, with a real-data pro-tour layer
underneath. This is a resubmission, and that word is on the slide on purpose — I've rebuilt this
talk to walk you through the whole project again from the beginning, not just a diff of what
changed."

**Slide 2 — OVERVIEW** · **[UPDATED]** · ~0:45
"The structure is the same six parts as my first submission — brief, data, UX, data
representation, technical implementation, demo. What's different: Part 2 and Part 4 now carry
real discovered findings instead of assumptions, and validation has moved from absent to
scheduled. Every slide that's new or different carries a small badge, blue for new and gray for
updated, so you can see exactly where the improvements landed as we go."

**Slide 3 — WHAT CHANGED — AT A GLANCE** · **[NEW]** · ~1:00
"Before I dive back into the full story, here's the honest one-slide summary. Six things changed
since the 21-out-of-30 first submission: a real 776-match dataset instead of a small demo pull;
genuine exploration that surfaced seven findings, including an honest null; a new analytics layer
with Elo, a win model, clustering, and confidence intervals; an upgraded multi-user app with a new
Insights page; validation instruments that are ready, with sessions scheduled; and a polished,
machine-verified deck. Keep an eye on the badges from here — they mark exactly where."

---

## PART 1 — The Brief (target: 4:10)

**Slide 4 — PART 1 divider** · *unchanged* · ~0:15
"Part one, the brief. What am I building, for whom, and why — everything downstream traces back
to a decision made here."

**Slide 5 — 1.1 Sport Domain** · *unchanged* · ~0:50
"I picked padel because the gap is the right size. It's exploding in Italy — over a million
federated players — but the analytics available stop at the pro tier. Amateurs have gut
feelings — 'I always lose in the third set' — but no way to confirm any of them. That gap is the
whole project."

**Slide 6 — 1.2 Problem & User** · **[UPDATED]** · ~0:55
"Marco the club player and Luca the amateur coach haven't changed — same personas, same problem
statement. What's new is the line right under the problem box: I've built a real survey and
interview guide, ready to run with actual club players, so Marco and Luca stop being my own
assumptions and start being grounded in real respondents."

**Slide 7 — 1.3 Editorial Thinking** · *unchanged* · ~0:55
"Angle, framing, focus — Kirk's three questions. Reflective self-analysis over time, what an
amateur can actually log on a phone, and one number above the fold. I deliberately excluded court
heatmaps and sensor data here — I don't have that data, and pretending I do would be dishonest
design."

**Slide 8 — 1.4 Relevance** · *unchanged* · ~0:55
"Scored against Kirk's four factors — timeliness, interestingness, pertinence, sufficiency — and
it holds up well, three out of three on the first three. Sufficiency is the honest 2 out of 3: a
deliberate trade-off, enough to inform without overwhelming."

---

## PART 2 — Working with Data (target: 7:35)

**Slide 9 — PART 2 divider** · *unchanged* · ~0:15
"Part two, working with data — acquisition, transformation, exploration. This is where most of the
resubmission's weight lives."

**Slide 10 — 2.0 Pro Data Source** · **[UPDATED]** · ~1:00
"This is the single biggest change in the project. The pro layer used to be a small demo pull —
thirty players, 276 matches. It's now the real thing: padelapi.org, a REST API, my own API key,
the full 2026 Premier Padel season so far — 776 completed matches, 26 tournaments, full draws
round-of-64 to final, both tours, 2,165 ranked players. Everything downstream is built on this."

**Slide 11 — 2.1 Acquisition** · **[UPDATED]** · ~1:00
"Acquiring this meant designing around real constraints. Ten requests a minute on the free tier,
so the fetcher throttles itself and backs off properly on a 429. It's restartable by tournament,
and — this matters — every raw response is archived to disk before any cleaning touches it. That
archive is what let me fix a real bug later without re-fetching anything."

**Slide 12 — 2.2 Examination & Transformation** · **[UPDATED]** · ~1:00
"I want to be honest about the one real bug I hit. My first parser assumed the score came back as
a comma-separated string. It doesn't — it's a JSON array of set objects. I only caught that by
reading the raw archive during examination. Because acquisition and transformation are separate
scripts, the fix cost one file and zero re-fetching."

**Slide 13 — 2.3 Exploration — How** · **[UPDATED]** · ~0:50
"This slide is method, not results — results are next. Ten hypotheses, every one a two-sided test
at alpha 0.05, every proportion carrying a Wilson 95% confidence interval. Critically, I built in
three verdicts, not two: signal, null, or insufficient data. That's what separates real
exploration from cherry-picking."

**Slide 14 — 2.4 Findings — Momentum & Chemistry** · **[NEW]** · ~1:10
"Two real discoveries. Win set one and you win the match 86% of the time — a huge signal. But
narrow that to matches that reach a third set, and the edge disappears to 49%, a coin flip.
Second, chemistry: pairs climb from 40% to 67% win rate as they rack up matches together — but
I'll flag now, that's survivorship as much as chemistry, and I come back to it in Part 4."

**Slide 15 — 2.5 Findings — Ranking, Upsets, Efficiency** · **[NEW]** · ~1:10
"Rankings genuinely predict — the higher-points team wins 78.5% of the time, AUC of 0.88, though I
treat that as an upper bound given a snapshot-bias caveat. Upsets are rarer than they feel, only
22.4% of seeded matches, and spike to a coin flip in the final. And efficiency matters — fewer
games in your previous round predicts a 59.7% win next match."

**Slide 16 — 2.6 The Honest Nulls** · **[NEW]** · ~1:10
"Three of ten questions came back null or insufficient, and I'm showing them on purpose. No home
advantage — 43%, not significant. No age-gap effect between winners and losers. Handedness and
height simply don't have enough coverage to trust a comparison. A project that only shows findings
that worked isn't exploration, it's marketing."

---

## PART 3 — UX Design (target: 5:10)

**Slide 17 — PART 3 divider** · *unchanged* · ~0:15
"Part three, UX design — wireframes, principles, heuristic evaluation."

**Slide 18 — 3.1 Process** · *unchanged* · ~0:50
"Paper sketches to low-fi wireframes to a mid-fi pass with real chart shapes, straight into a
working Streamlit build. No throwaway click-prototype — the fidelity ladder went straight to
working code."

**Slide 19 — 3.2 Wireframes** · *unchanged* · ~0:55
"Five pages, five tasks. Home answers 'how am I doing right now,' Log Match answers 'add today's
match,' and so on — every page maps to exactly one question from the brief."

**Slide 20 — 3.3 Principles** · *unchanged* · ~0:50
"Six rules applied throughout: one number above the fold, recognition over recall, default to
action, low data-entry friction, honest visual hierarchy, and annotate rather than decorate."

**Slide 21 — 3.4 Heuristic Evaluation** · *unchanged* · ~0:55
"Two concrete changes from Nielsen's ten. Error prevention: set-3 inputs are now disabled until
sets one and two split. Recognition over recall: filters moved from a hidden button to an
always-visible sidebar."

**Slide 22 — 3.5 Closing the Validation Loop** · **[NEW]** · ~1:05
"This was the most direct criticism — validation was essentially absent. Now the instrument pack
is complete: a persona survey in English and Italian, an interview guide, a full SUS questionnaire
with scoring sheet, a task-based protocol, and a heuristic round two for external evaluators.
Status, honestly: sessions are scheduled, not run — I will not give you an invented SUS score."

---

## PART 4 — Data Representation (target: 7:00)

**Slide 23 — PART 4 divider** · *unchanged (renumbered from PART 5)* · ~0:15
"Part four, data representation — chart choices, color, interactivity. Note this divider used to
be mislabeled Part 5 in the first submission; that numbering bug is fixed throughout."

**Slide 24 — 4.1 Chart Inventory** · **[UPDATED]** · ~0:55
"Same nine core chart types as before, each mapped to one page and one finding. What's new is
scope — the Insights page adds seven more purpose-built charts on top, bringing the working
inventory to sixteen, listed at the bottom rather than padding out the table."

**Slide 25 — 4.2 Case Study — Shot DNA** · *unchanged* · ~0:55
"This was the one case study the evaluation singled out as reasoned properly. Zero line dead
center, sign readable at a glance, winners and errors sharing one bar. I rejected a pie, a stacked
bar, and side-by-side bars — all of them hide or fragment the zero line."

**Slide 26 — 4.3 Case Study — Momentum Slope Chart** · **[NEW]** · ~1:05
"Winning set one looks decisive — 86% of the time it is. But that number hides every two-set
blowout. Restricting to matches that go the distance, the edge drops to 49%, a coin flip. I drew
that as two connected dots, not two bars, because the story is the drop between them, not the two
numbers separately."

**Slide 27 — 4.4 Case Study — Chemistry Line + CI Band** · **[NEW]** · ~1:05
"Pairs climb from 40% to 68% win rate with more matches together. Tempting to call that practice —
but only 39% of pairs ever reach five matches together, and the rival explanation is survivorship.
I didn't want that caveat buried in a caption, so the confidence band narrows visibly as you move
right, with a callout that spells out why."

**Slide 28 — 4.5 Case Study — Calibration Lollipop** · **[NEW]** · ~1:05
"Rankings predict — 78.5% favorite win rate, AUC 0.88. I checked that with an ROC curve and a
calibration plot, both looked fine, but neither answers what my audience actually asks. This
lollipop shows the same finding sliced by gap size: barely above a coin flip at the closest gap,
almost certain at the widest. Rankings predict — they don't decide."

**Slide 29 — 4.6 Color** · **[UPDATED — renumber only]** · ~0:45
"This content hasn't changed — same palette, same accessibility checks, and they held up well in
the evaluation. Only the label changed: this used to sit under a mislabeled divider, now it's
correctly Part 4."

**Slide 30 — 4.7 Interactivity & Annotations** · **[UPDATED]** · ~0:55
"Same interactivity and annotation layers as before — sidebar filters, drill-down, hover detail,
static headline plus dynamic hover. What's new: every Insights-page card follows the same
discipline but adds a method note under the chart — test, sample size, p-value — so a claim can be
verified without leaving the chart."

---

## PART 5 — Technical Implementation (target: 2:25)

**Slide 31 — PART 5 divider** · *unchanged (renumbered from PART 4)* · ~0:15
"Part five, technical implementation. This divider used to sit before the wrong section — it's
now correctly Part 5, after data representation."

**Slide 32 — 5.1 Tech Stack & Architecture** · **[UPDATED]** · ~1:05
"Same stack — Python, Streamlit, Pandas, Plotly. What's underneath changed: CSV reads are replaced
by a SQLite database with a users table, schema is multi-user-ready. There's a new analytics.py
module, backed by 12 out of 12 passing tests, and every pro view now captions its data source.
run_app.bat installs, builds the database, and launches the app in one step."

**Slide 33 — 5.2 The Analytics Module** · **[NEW]** · ~1:05
"This module didn't exist before — no modelling or analytical tooling was a direct criticism. Now
there's an Elo engine over all 776 real matches, a logistic win model with calibration, k-means
player archetypes, and Wilson confidence intervals on every win rate. A small-n guard means fewer
than ten matches behind a stat, and the app refuses to claim anything."

---

## PART 6 — Demo & Conclusions (target: 4:20)

**Slide 34 — PART 6 divider** · *unchanged* · ~0:15
"Part six, demo and conclusions — let's see it running, then what's next."

**Slide 35 — 6.1 Demo** · **[UPDATED]** · ~3:00 (live walkthrough)
"Same five-step structure as before, but I've swapped the last stop. Instead of ending on Pro
Tour, I land on the new Insights page — seven discovery cards, each with its own chart, headline,
and method note. [Switch to the live app now.] Watch for the synthetic-demo-data badge on every
personal page — that's not hidden, it's on screen the whole time."

**Slide 36 — 6.2 Future Developments** · **[UPDATED]** · ~1:05
"Four of these five are genuinely new priorities. Run the scheduled user tests and get a real SUS
score. Start logging my own real matches, retiring the synthetic layer piece by piece. One month
of the API's paid tier unlocks full multi-season history. And a public Streamlit Cloud deployment
means Marco and Luca could actually use this."

**Slide 37 — THANK YOU** · *unchanged* · ~0:30
"That's PadelLens, resubmitted — real data, discovered findings, an honest validation status, and
a deck that's machine-verified against its own claims. Thank you. I'm happy to take questions."

---

## Timing summary

| Part | Slides | Target time |
|---|---|---|
| Opening (title, overview, what changed) | 1–3 | 2:15 |
| Part 1 — The Brief | 4–8 | 4:10 |
| Part 2 — Working with Data | 9–16 | 7:35 |
| Part 3 — UX Design | 17–22 | 5:10 |
| Part 4 — Data Representation | 23–30 | 7:00 |
| Part 5 — Technical Implementation | 31–33 | 2:25 |
| Part 6 — Demo & Conclusions | 34–37 | 4:20 |
| **Total** | **37 slides** | **~33 min + Q&A** |

Live demo (slide 35) can stretch or compress by a minute or two depending on questions during the
walkthrough — everything else should hold close to its budget to land the talk at roughly 35
minutes including natural pacing.
