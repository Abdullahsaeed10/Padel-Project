# Step 1 — Formulating the Brief

**Project working title:** *PadelLens — Pro Tour Insights + My Match Log*

*(originally drafted as "Padel Match Journal"; pivoted to a hybrid after surveying available data — the original journal page is preserved as a sub-feature, see §1.8)*

> This document is Stage 1 of the data visualization process (Kirk, 2019). It defines **what** the project is, **for whom**, **for where**, **with what data**, and crucially **why**. Everything that follows — data, wireframes, charts, code — has to trace back to a decision made here.

---

## 1.1 Sport Domain & Context

Padel is the fastest-growing racket sport in Europe. In Italy alone, federated players grew from ~30,000 in 2019 to over 1.1 million in 2024 (FIP data). Most padel players are **amateurs**: they play 1–4 matches a week at a local club, with rotating partners, on indoor or outdoor courts.

Unlike football or tennis, where amateurs have a wealth of tools to track their performance (FBref, MyFitnessPal-style apps, racquet sensors), the **padel amateur has almost nothing**. The available products are either:

- Pro-tour focused (Premier Padel rankings, Worldpadeltour stats) — irrelevant to a recreational player, OR
- Generic fitness trackers (Strava, Apple Fitness) — they don't understand padel-specific dynamics (sets, glass wall, partner pairings).

There is a clear gap between **what amateurs feel** ("I always lose in the third set", "I play badly with this partner") **and what they can confirm**.

## 1.2 Problem Statement

> **Amateur padel players want to see patterns in their own game that they can't feel during a match — but no simple tool exists that takes a player's own match log and turns it into actionable, honest visual feedback.**

The project's product is a **web application** (Streamlit) that lets a player keep a journal of their matches and gives them back clear, immediate visual answers to questions they already ask themselves.

## 1.3 Target Audience

**Primary user — "Marco, the club player":**
- 22–40 years old, plays 1–3 times per week at his local club.
- Has been playing for 6 months to 5 years.
- Uses his phone after a match to text his group chat; willing to spend 90 seconds logging stats.
- Wants to *improve* but is not a pro, doesn't have a personal coach, and won't read a 4-page analytics report.

**Secondary user — "Luca, the amateur coach":**
- Gives weekly 1-hour lessons to club players.
- Wants a quick visual summary of a student's recent matches before starting a session.
- Cares most about: shot-type balance, error trends, partner effects.

The audience is **explicitly not** the professional analyst or the pro player. Keeping this clear stops the project from drifting toward over-engineered analytics.

## 1.4 Task Analysis

After Marco logs his matches, what should he be able to do with the app? Six core tasks:

| # | Task | Why it matters |
|---|---|---|
| T1 | Log a finished match in under 2 minutes | Friction is the enemy. If logging takes 10 min, no data ever gets entered. |
| T2 | See win rate and trend over the last *N* matches | Answers: "Am I improving?" |
| T3 | Compare partners — which pairings work? | Answers: "Should I keep playing with X?" |
| T4 | Compare shot types — winners vs unforced errors | Answers: "What should I drill this week?" |
| T5 | See set-by-set fatigue patterns | Answers: "Why do I lose third sets?" |
| T6 | Filter by surface / time period | Answers: "Am I worse indoors? Am I worse in winter?" |

## 1.5 Editorial Thinking — Angle, Framing, Focus

Using Kirk's photojournalism metaphor:

### Angle ("the perspective from which we take the shot")
The angle is **"reflective self-analysis over time"** — not pro-style overlay heatmaps with model output, but clear, honest mirrors of your own play. The chosen analytical perspectives are:
- **Temporal** (trends across matches),
- **Categorical** (partner, shot type, surface),
- **Comparative** (this period vs previous period).

Spatial overlays (e.g., ball-trajectory heatmaps on the court) are *deliberately excluded* — they require sensor data the amateur doesn't have.

### Framing ("what's inside vs outside the frame")
**Inside the frame:**
- The user's own matches.
- Per-set shot tallies (winners, unforced errors) broken down by shot family (forehand, backhand, smash, lob, bandeja, volley).
- Partner & opponent names, date, surface, final score.

**Outside the frame:**
- Ball-trajectory / radar data (not feasible).
- Heart rate / biometrics (out of scope for v1).
- Pro-player comparisons (different audience).
- Opponent scouting (we are looking at the *self*, not the opposition).

### Focus ("what we make impossible to ignore")
The headline numbers visible above the fold on the home screen:
1. **Last-10-matches win rate** — the one number the user actually wants when they open the app.
2. **Net shot balance** (winners minus errors) over the last 10 matches.
3. **One personal insight** auto-generated in plain language ("You win 73% of matches with Luca vs 41% with others") — this is the "focus" highlight in editorial terms.

De-emphasized but accessible: raw counts, full match history, individual shot tallies.

## 1.6 Relevance — the four factors (Kirk)

Rating the project from the audience's point of view (1 = low, 3 = high):

| Factor | Score | Why |
|---|---|---|
| Timeliness | 3 | The user opens the app *right after* a match or *the day before* their next one — the info is actionable now. |
| Interestingness | 3 | Confirms or contradicts gut feelings ("I always lose in the third set"); both outcomes are interesting. |
| Pertinence | 3 | It is literally the user's own data about themselves — maximum personal connection. |
| Sufficiency | 2 | Deliberate trade-off: the app shows enough to inform decisions, not so much it overwhelms. v1 omits some depth (e.g., shot-by-shot tagging within a rally). |

## 1.7 Core Message

> **"You don't have to feel your game — you can see it."**

This headline guides every later decision. If a chart doesn't help the user *see something they couldn't feel*, it doesn't go in the app.

---

## 1.8 Final scope after data survey

After surveying available data (see §2 — Working with Data), the project was scoped into two complementary halves to ground it in real, verifiable data while preserving the original self-analysis angle:

- **Main app — Pro Tour Insights.** Uses real Premier Padel data (via the Padel API / scraping fallback): rankings, match results, player comparisons, surface effects, partner pairings on the pro side. *Audience: padel fan / amateur player interested in the pro game.*
- **Personal feature — My Match Log.** A small page where the user can enter their own matches and see their stats *next to pro reference distributions* ("Pros hit 41% of points through the bandeja, you hit 18% — drill it"). *Audience: amateur player as a sub-user.*

The editorial angle from §1.5 still holds — temporal, categorical, comparative; the framing now includes a pro-tour layer that contextualizes the amateur layer.

## What to say in the presentation (speaker notes — Slide group 1)

Read these out roughly as written. Adjust to your voice.

**Slide: Why padel?**
> *"I picked padel because it's exploding in Italy — over a million federated players — but the tools available to amateurs are basically zero. Pros have Premier Padel analytics, recreational players have nothing. As a Sports Engineering student that gap felt like the right size to attack in one semester."*

**Slide: The problem**
> *"Amateurs feel things during a match — 'I always lose the third set', 'I play better with Luca' — but they can't confirm any of it. My project takes those gut feelings and turns them into a number on a screen."*

**Slide: Who it's for**
> *"My target user is what I call Marco — a club player, 22 to 40 years old, plays a couple of times a week, willing to spend 90 seconds logging a match on his phone. Not a coach, not a pro. The app is built around what Marco actually wants to know."*

**Slide: Editorial angle**
> *"Following Kirk's framework from the course, my angle is reflective self-analysis over time. I'm not trying to do ball-tracking heatmaps — I don't have that data and Marco wouldn't read them anyway. The angle is temporal, categorical, and comparative. The framing keeps only what an amateur can actually log in 90 seconds after a match. The focus is one headline number at the top of the app — your last-10-matches win rate — because that's what Marco opens the app to see."*

**Slide: Core message**
> *"The whole project boils down to one line: you don't have to feel your game, you can see it. Every chart I'll show you later is here because it helps an amateur see something they couldn't feel."*
