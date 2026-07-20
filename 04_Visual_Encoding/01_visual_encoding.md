# Step 4 — Data Representation & Visual Encoding

Covers the three sub-points the exam rubric requires for Section 4:
**Chart Selection & Justification · Composition & Aesthetics · Interactivity & Annotations.**

Maps to Kirk's *Developing the Design Solution* stage with its five layers:
**Data Representation · Interactivity · Annotation · Color · Composition.**

---

## 4.1 Chart inventory & justification

The whole app uses **9 distinct chart types**. Every choice traces back to an EDA finding (§2.3) and an editorial angle (§1.5). Charts that didn't earn a place — e.g., a pie chart of shot share, a bubble chart of opponents — are listed at the bottom under "considered and rejected".

| # | Page | Chart | Encodings | Why this chart | Alternatives rejected |
|---|---|---|---|---|---|
| C1 | Home | Big KPI + sparkline | Number + line (time on x, win rate on y) | KPI answers "how am I doing?" in 0.5 s. Sparkline gives momentum without commanding attention. | Gauge chart (too decorative); donut (worse for one number). |
| C2 | Home | Horizontal bar (partner win rate) | Length = win rate · color = good/bad | Length is the best preattentive channel for comparison. Reading top-to-bottom mirrors a leaderboard. | Radar (too many partners, axes collapse); scatter (overkill for 6 categories). |
| C3 | Home | Diverging horizontal bar (shot DNA) | Length-left = errors · length-right = winners · color = positive/negative | Diverging bars make "net positive vs net negative" instantly visible. Most powerful encoding for *signed* magnitude. | Stacked bars (hide the zero line); two side-by-side bar charts (eyes have to traverse). |
| C4 | Pro Tour | Ranking table with row sparkline | Tabular + mini-line per row | A ranking is fundamentally tabular — don't fight it. Sparkline adds momentum in ~30 px without breaking the row. | Big multi-line chart of all top-30 players' points (the "spaghetti plot" problem). |
| C5 | Pro Tour > Surface effect | Small-multiples (indoor / outdoor) | Two faceted bar/line panels | Lets the eye compare distributions across surfaces without overlaying. Tufte-clean. | Grouped bars (more visual noise at the same information content). |
| C6 | My Stats | Rolling-mean line chart | Time on x · 5-match rolling win rate on y · band = ±1σ | The right tool for trend over time. Rolling mean reduces single-match noise that would obscure the trend. | Bar-per-match (noise dominates signal); cumulative win count (hides recent form). |
| C7 | My Stats | Set-by-set columns (fatigue) | Categorical x (2-set / 3-set) · win rate y · annotation = "-40 pp" | Simplest possible comparison of two numbers. The story is *the gap*, not the bars themselves — so the gap is the focus annotation. | Line chart (overkill for 2 points); donut pair (worse precision). |
| C8 | Compare | Radar (shot mix overlay) | 5 axes · two filled polygons (you vs pro) | Radar is generally overused — but for a small, fixed set of *parallel* categories where the question is "what's the shape difference?", it's the right tool. The accompanying side panel breaks down each gap numerically so the radar is supplementary, not primary. | Parallel coordinates (less familiar to non-technical users); grouped bars (works too — listed as fallback in §4.4). |
| C9 | Multiple | Inline annotations / callouts | Text + arrow + delta | Direct application of Kirk's "focus" principle — guides the reader to the headline. | Pure-numeric label (less commanding); no annotation (= ornamental chart). |

### Considered and rejected

| Chart | Where it was considered | Why rejected |
|---|---|---|
| Pie chart of shot share | Home, shot DNA | Pies are bad at comparing slices; diverging bars beat them on the same data. |
| Court heatmap (where points end) | My Stats | Requires positional data we don't have. Would falsely imply precision we can't deliver. Explicitly out of frame (§1.5). |
| Sankey of points → set wins → match wins | My Stats | Looks impressive, communicates very little to an amateur. Style over substance. |
| Animated time-lapse of ranking changes | Pro Tour | Cool, useless for the task. The ranking sparkline (C4) gives the same info statically. |
| 3D bar chart of anything | Anywhere | Always rejected. |

> **What to say in the presentation:** *"I had a longer list of charts initially and cut it down ruthlessly. The rule was: each chart has to answer one EDA finding, and there has to be at least one other chart it beats in a head-to-head comparison. Pies, court heatmaps, Sankeys, animations — all rejected. Diverging bars, sparklines, small multiples — they earned their place because they each beat their alternative on the specific question they're answering."*

---

## 4.2 Composition & Aesthetics

### Layout grid

12-column grid at 1280 px viewport. Cards snap to 4-, 6-, 8- or 12-column widths.

- Home: hero (8) + side card (4) on row 1 → three 4-column cards on row 2 → two cards (8+4) on row 3.
- My Stats: four 3-column KPI cards on row 1 → 2x2 chart grid of 6-column cards on rows 2-3.

### Visual hierarchy (top → bottom on every page)

1. **Headline KPI** in 28-42 px.
2. **Chart title** in 14 px bold.
3. **Chart body** with axes in 11 px.
4. **Annotation / callout** in 11 px italic gray *but* inside the chart's visual perimeter.
5. **Caption** in 10 px gray italic *outside* the chart.

### Whitespace

Cards have 24 px internal padding; gaps between cards are 16 px. The Home page is intentionally airy — a user opening the app on a tired Tuesday should feel relief, not overwhelm.

### Typography

System sans (`Inter` if available, falls back to Arial/Helvetica). One typeface, four weights (400 / 500 / 600 / 700). Numbers use tabular figures so vertical lists of numbers align.

## 4.3 Color palette & accessibility

```
Brand accent (positive / interactive)   #0EA5E9  sky-500
Brand accent muted                       #BAE6FD  sky-200
Negative signal                          #EF4444  red-500
Negative muted                           #FECACA  red-200
Surface (cards)                          #FFFFFF
Background                               #F6F8FA
Border                                   #CFD6DD
Body text                                #1F2937  gray-800
Muted text                               #6B7280  gray-500
Annotation text                          #9AA3AD  gray-400
```

### Editorial use of color (not decorative)

- **Blue = neutral / positive / interactive.** All charts default to blue. Most data is just "here is the value", not "this is good or bad".
- **Red = negative signal *that requires action*.** Used sparingly: a partner you're losing with (Davide bar on Home), a shot category that's net-negative (Smash / Backhand on Shot DNA), the third-set fade KPI.
- **Gray = pro reference / context.** When the user is compared to the pro average (Compare page), the pro polygon is gray — *not* a competing color. We're not saying pros are better, we're saying they're the reference frame.

### Accessibility checks

- **WCAG AA contrast.** Body text on white (#1F2937 on #FFFFFF) = 12.6:1 ✅. Annotation gray on white (#9AA3AD on #FFFFFF) = 2.8:1 ⚠️ — used only for italic gray *captions*, never for actionable text.
- **Color-blind safety.** Blue vs red is the most common red-green-safe pair after blue/orange. Tested in Coblis simulator: deuteranopia and protanopia both still distinguish the two clearly.
- **No color-only encoding.** Every red bar/value also has a minus sign, a downward arrow, or an explicit negative number. Color *reinforces* the signal, never carries it alone.

> **What to say in the presentation:** *"Color is doing editorial work, not decoration. Blue is the neutral / positive case, red is reserved for negative signals that require action, gray is the pro reference frame. I deliberately don't use any green — green-red palettes fail for the most common color-blindness. And every red mark is also signed numerically, so even with a black-and-white printout you'd see the same story."*

---

## 4.4 Interactivity & Annotations

Mapped to Kirk's *Interaction* and *Annotation* design layers.

### Interactivity

| Where | What | Editorial purpose |
|---|---|---|
| Pro Tour sidebar | Filter by country, surface, tournament category, date range | Lets the user choose the *frame* of the data (Kirk: framing). |
| Pro Tour table | Click a row → drill to player detail | Progressive disclosure — table is the overview, click is the dive. |
| My Stats time range | Toggle 30 / 60 / 90 / all matches | Lets the user A/B compare periods (the original Task T6). |
| Charts | Hover tooltip with exact value + date + opponent | Precision on demand without cluttering the chart surface. |
| Log form | Live "auto-result" preview as the user types the score | Visibility of system status (Nielsen #1). |
| Compare | Toggle vs pro average / vs specific player | Two modes for two intents — "where do I stand generally" vs "what would playing like X take?". |

### Annotation strategy

- **Static, in-canvas annotations** carry the editorial focus: the "-40 pp" callout on the fatigue chart, the "Luca · best partner" tag on the partner bars, the red "biggest gap" callout pointing to Smash on the radar.
- **Dynamic, hover-triggered annotations** carry detail: tooltips with the exact number, the date, the opponent.
- **Captions outside the chart** explain *what* the chart is. Captions inside the chart explain *why* you should look.

> **What to say in the presentation:** *"Interactivity is shaped by the editorial framework. Filters let the user reframe — that's literally Kirk's framing layer. Hover tooltips give precision on demand. The most important annotations are static and in-canvas — like the '-40 percentage point' tag on the fatigue chart — because they're the headline, not a footnote. Hover tooltips are for the detail-seeking user; the static annotations are for the user who's not even reading carefully."*

---

## What to say in the presentation (speaker notes — Slide group 4)

**Slide: Chart inventory**
> *"The app has 9 distinct chart types. None of them are decorative — every one answers one specific finding from my exploratory analysis. I had a longer list of charts that I cut: pie charts, court heatmaps, Sankeys, animated rankings. They all lost head-to-head against simpler alternatives."*

**Slide: Why diverging bars (shot DNA)**
> *"The shot-DNA chart is a diverging horizontal bar. The reason is: my question is signed — bandeja is net positive, smash is net negative. A pie chart would have shown me proportions of shot use, which isn't the question. Stacked bars would have hidden the zero line. Diverging bars put the zero line dead center and let you read the sign from the side."*

**Slide: Color**
> *"Color is editorial. Blue is neutral. Red is reserved for negative signal that requires action. Gray is the pro reference frame. No green — green-red is the worst palette for color blindness — and every red element is also negatively signed, so the chart survives a black-and-white printout."*

**Slide: Interactivity & annotation**
> *"Static annotations carry the headline. Hover tooltips carry the detail. The filter sidebar is always visible because re-framing the data is the most common user action and shouldn't be hidden behind a button."*
