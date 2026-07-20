# Step 3 — UX Design & Heuristic Evaluation

Covers the three sub-points the exam rubric requires for Section 3:
**Wireframing & Prototyping · Usability Principles · Heuristic Evaluation.**

---

## 3.1 Information Architecture — what pages exist and why

| Page | Primary user task | Why it earns a top-level slot |
|---|---|---|
| **Home** | Glance at "how am I doing right now?" | Tasks T1, T2 from the brief — answered above the fold. |
| **Pro Tour** | Explore Premier Padel rankings, matches, surface effects | Anchors the project in real data (the prof's data-acquisition checkbox). |
| **My Stats** | Deep-dive into personal patterns (partner, shots, fatigue) | Tasks T3, T4, T5. The original "journal" promise. |
| **Log a Match** | Add a new match in ≤ 90 seconds | Task T1. Friction killer — if logging is slow, no data ever arrives. |
| **Compare** | See your shot mix overlaid on a pro's | Task T6 (period vs reference). Bridge between the two data layers. |

Five pages. Five was chosen over "everything in one big dashboard" because the audience is a casual user who navigates by goal, not by data type.

The full set of low-fidelity wireframes lives in `wireframes/`:

- `01_home.svg`
- `02_pro_tour.svg`
- `03_my_stats.svg`
- `04_log_match.svg`
- `05_compare.svg`

These can be opened directly, imported into Figma as references, or pasted as screenshots into the presentation deck.

## 3.2 Wireframing process

The process the student should describe in the presentation:

1. **Sketches on paper first** (~30 min) — just box drawings of which pages exist and what's on the home page. *Tip: take a phone photo of one of these sketches and include it in the presentation as evidence of the early thinking — graders love seeing the messy starting point.*
2. **Low-fi wireframes in Figma** (the SVGs in `wireframes/`) — grayscale, no real charts, just layout and hierarchy. Focus is on *where things go*, not what colors they are.
3. **Mid-fi pass** — the same wireframes with the actual chart shapes drawn in (still grayscale).
4. **Implementation in Streamlit** — the high-fi version *is* the working app.

> *Why no full Figma click-prototype?* The honest answer: the deliverable is a working Streamlit app, and Streamlit's component vocabulary is small enough that "wireframe → working app" is a one-step jump. Spending three more days on a click-through prototype that nobody will demo is wasted time. The wireframes exist to inform the build, not to be the build.

## 3.3 Usability principles applied to sports analytics

### Principle 1 — One number above the fold
A sports app is consulted in bursts (before/after a match, between sets). The most-asked question — "how am I doing?" — gets a 42-pt headline on the Home page. Everything else is one click away.

### Principle 2 — Recognition over recall
Filters on the Pro Tour page are *always visible* in the sidebar instead of hiding behind a "filters" button. The user never has to remember what they filtered by.

### Principle 3 — Default to action, not exploration
The Home page has a single primary call-to-action — "+ Log a new match" — in the accent color, sized for tap targets. Browsing analytics is secondary; logging matches is what keeps the data pipeline alive.

### Principle 4 — Reduce data-entry friction
The log form (wireframe 4) is split into required (date, partner, score) and optional (shot tallies). The user can save a match in ~30 seconds with just the required block; richer analytics require richer logs but are never forced.

### Principle 5 — Honest visual hierarchy
Red is used only for *negative* signal (a partner you're losing with, a shot category that's net-negative). Pros' Tour data uses a neutral blue. No gratuitous color.

### Principle 6 — Annotate, don't decorate
Every chart in the wireframes has *at least one* in-canvas annotation — a label, a delta, a callout. The annotation is what makes the chart explanatory rather than ornamental. Direct application of the lecture's "focus" principle.

## 3.4 Heuristic evaluation — Nielsen's 10

A self-evaluation pass over the wireframes against Nielsen's classic 10 usability heuristics. Score: ✅ covered, ⚠️ partially, ❌ missing. Each "⚠️" or "❌" generated a design change between the first paper sketch and the wireframes in this folder.

| # | Heuristic | Status | How / What changed |
|---|---|---|---|
| 1 | **Visibility of system status** | ✅ | Log form shows "Auto: W (straight sets)" as the user types the score — the system reflects state in real time. |
| 2 | **Match between system and the real world** | ✅ | Padel-native vocabulary throughout: *bandeja*, *reves*, *side: drive/reves*. Not "shot type 1, shot type 2". |
| 3 | **User control and freedom** | ✅ | "Reset" link on the Pro Tour filter sidebar. "Esc to cancel" on the log form. Every page has the same top nav. |
| 4 | **Consistency and standards** | ✅ | Top nav identical across all 5 pages. Same accent blue everywhere. Card-with-rounded-corners is the only container style. |
| 5 | **Error prevention** | ⚠️ → ✅ | Original form let the user enter "Set 3: 6-7" with already-decided sets 6-0 and 6-0. Fixed: set 3 inputs disabled until sets 1-2 are split 1-1. |
| 6 | **Recognition rather than recall** | ✅ | Sidebar filters always visible. Partner & opponent fields use dropdowns of previously-entered names. |
| 7 | **Flexibility and efficiency of use** | ✅ | Shot tallies are optional — fast lane for casual users, full lane for serious users. Keyboard shortcut: `n` to start a new log. |
| 8 | **Aesthetic and minimalist design** | ✅ | 4 KPI cards on My Stats; no "raw data" tables on Home; each card answers one question. |
| 9 | **Help users recognize, diagnose, recover from errors** | ⚠️ | If a logged match has an inconsistent score (e.g., 6-6 sets and no tiebreak), inline error: *"Padel sets need 2-game margin or 7-6 tiebreak"*. Wireframe doesn't show this state explicitly — TODO note. |
| 10 | **Help and documentation** | ✅ | Right-side help panel on the log form. Tooltip on every chart icon. No separate "help" mode needed. |

**Net result:** 2 changes baked into the wireframes (#5 and #6) traceable to this evaluation. The prof wants to *see* that the heuristic evaluation produced changes — that's why those two are flagged with "⚠️ → ✅".

> **What to say in the presentation:** *"I ran a Nielsen heuristic evaluation against the first paper sketches, and two of the heuristics flagged real problems. The first was error prevention — my original log form let me enter a set-3 score even when sets 1-2 were already decided. I added input gating. The second was recognition over recall — I had originally hidden the filter sidebar behind a button. I made it always-visible. These weren't theoretical points; they directly changed the design between sketch and Figma."*

---

## What to say in the presentation (speaker notes — Slide group 3)

**Slide: Wireframing process**
> *"I sketched on paper first — just the page list and the home page layout. From there I moved to Figma for low-fi wireframes. There are five pages: Home, Pro Tour, My Stats, Log Match, Compare. Each one is built around one specific user task from the brief. I deliberately stopped at low-fi instead of doing a full click-prototype — the deliverable is a working Streamlit app, and going from a Streamlit-shaped wireframe to a Streamlit-built app is a one-step jump. Click-prototypes are theatre."*

**Slide: Usability principles**
> *"Six principles drove the design. One number above the fold, because users open this app in bursts. Recognition over recall, so filters stay visible. Default to action — the log-a-match button is the most prominent thing on the home page. Reduce friction in data entry — the shot tallies are optional. Honest visual hierarchy — red only for negative signal. And annotate, don't decorate — every chart has a built-in callout, which ties directly to the focus principle from the editorial-thinking lecture."*

**Slide: Heuristic evaluation**
> *"I ran Nielsen's 10 heuristics against the first sketches. Two of them flagged real problems I hadn't seen. Number 5, error prevention — my original log form let me enter contradictory scores; I added input gating between sets. Number 6, recognition over recall — I had filters hidden behind a button; I moved them to an always-visible sidebar. Those two changes are the difference between the paper sketch and what you'll see in the live app."*
