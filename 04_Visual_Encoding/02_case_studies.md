# Step 4 (continued) — Three More Chart Case Studies at Shot-DNA Depth

The evaluation of the first submission singled out exactly one case study — the Shot DNA
diverging bar in §4.1/C3 — as reasoned "against alternatives" at the right depth. Everything
else in that inventory stated a winner without fully showing its work. This document repeats
the Shot-DNA treatment for the three headline findings that came out of the **real** EDA
(`02_Data/eda/eda_report.md`, `eda_results.json`) that didn't exist when the first chart
inventory was written: **momentum**, **pair chemistry**, and **ranking calibration**.

Same method every time: **question → encoding decision (channels) → alternatives rejected
(with the specific perceptual reason, not a vibe) → chart-family classification → annotation
plan → accessibility note → what I'd actually say out loud.**

Chart-family classification uses the standard chart-family vocabulary the course's design
lectures build on (deviation / comparison / ranking / distribution / part-to-whole /
change-over-time / flow / spatial — the same families implicit in §4.1's own reasoning,
e.g. "diverging bars = signed-magnitude / deviation family"). No local lecture material
spells out an acronym for this, so families are named in full rather than guessed at.

---

## 4.5 Case study: Momentum ("does winning set 1 mean anything?")

**Finding (E1, `eda_report.md`):** P(win match | won set 1) = **86.2%** (n=763, 95% CI
[83.6%, 88.5%]) — a huge, statistically overwhelming lead (p = 1.15e-98). But restrict to
matches that actually reached a valid 3rd set and ask P(set-1 winner also wins set 3) and it
drops to **49.3%** (n=207, 95% CI [42.5%, 56.0%]) — indistinguishable from a coin flip
(p = 0.89).

### The question
"If I win the first set, how much does that really tell me about the outcome — and does
that edge survive if the match goes the distance?" This is a **two-part story on purpose**:
a strong signal (86%) that quietly evaporates under one specific condition (49%). Any single
chart has to carry both numbers without letting the second one read as "a slightly smaller
version of the first."

### Encoding decision
**Primary: a two-point slope chart.** Two dots on a shared 0–100% vertical scale — "win rate
after taking set 1" (86%) and "win rate for the set-1 winner once it's a decider" (49%) —
connected by a single line, with a dashed reference line at 50% labeled "coin flip." Channels:
**position** (both dots sit on the same win-rate scale, so their values are directly
comparable — the strongest channel per Cleveland–McGill for judging two individual
magnitudes) plus **slope** (the connecting line's steepness is the channel that carries the
actual finding: momentum *decays*). The story isn't "here are two numbers," it's "here is a
lead, and here is what happens to it" — slope is the only channel among the candidates that
encodes a *rate of collapse* rather than two static facts sitting next to each other.

### Alternatives rejected
- **Grouped bars** (two bars side by side, "after set 1" vs. "in a decider"). Perceptually
  this is fine for reading each value precisely — bars are excellent at that. But it loses
  because it presents the two numbers as two independent facts the reader has to subtract
  mentally to find the story. There's no mark in the chart itself that *is* the 37-point
  collapse; that has to live entirely in a caption. The slope chart puts the collapse in the
  geometry, not the text.
- **Waterfall.** A waterfall shows a running total moving through named contributing steps
  (start → +x → −y → end). That's not what's happening here: 49% isn't "86% minus some
  identifiable factor," it's an entirely different conditional probability computed on a
  different, smaller subset (n=207 of 763, only the matches that reached a valid 3rd set).
  Drawing it as a waterfall would visually imply an additive decomposition that doesn't exist
  in the data and would misstate what the second number even measures.
- **Sankey / flow diagram.** Tempting — "momentum" sounds like something that flows — but
  the two percentages sit on different reference populations (all 763 finished matches vs.
  only the 207 that went to a decider). A Sankey encodes value through ribbon *width*, which
  forces a literal population-flow reading that isn't actually true here (the 49% group isn't
  a strict downstream subset of the same measured quantity as the 86% group). This is the
  same objection that already killed the "Sankey of points → set wins → match wins" idea in
  §4.1: it looks like a specific quantitative claim it can't actually back up. Style over
  substance, again.
- **100% stacked bar.** Same problem the Shot-DNA case study already solved once: stacked
  segments float without a shared, meaningful baseline. Here the baseline that matters isn't
  zero, it's **50%** — "how far above a coin flip are we." A stacked bar buries that
  reference line inside colored segments instead of foregrounding it as the thing the reader
  should be measuring distance from.

### Chart-family classification
**Change-over-time / trend family**, specifically the two-point "bump/slope" variant — the
same family as a line chart, minimized to its two most informative points. Not the
comparison-bars family (rejected above) and explicitly not the flow family (Sankey, rejected).

### Annotation plan
One static, in-canvas callout bridges the two dots with a bracket: **"86% → 49%: your set-1
lead evaporates once it's a decider."** The 50% reference line carries its own small label
("coin flip") so the reader doesn't need domain knowledge to know why that line matters.
Hover only adds precision (exact n and CI per dot) — the headline lives in the canvas, not
behind an interaction, consistent with the annotation rule already set in §4.4.

### Accessibility note
Single hue throughout (brand blue for both dots and the connecting line); the reference line
is gray, reused from the existing "gray = context, not a competing signal" rule. No color
encodes the finding — the finding is entirely in position and slope, so the chart is
grayscale-safe by construction and trivially colorblind-safe (there is no second hue to
confuse with the first).

> **What to say in the presentation:** *"Winning set one looks like it decides the match —
> 86% of the time it does. But I didn't want to stop there, because that number hides a
> trap: it's dragging in every 2-set blowout along with the close matches. So I asked a
> sharper question — of the matches that actually went the distance, does the set-1 winner
> still have the edge? The answer is no: 49%, a coin flip. I drew that as two connected dots
> instead of two separate bars, because the point isn't the two numbers, it's the drop
> between them — a slope chart puts that collapse directly in the ink instead of leaving it
> for the reader to compute."*

---

## 4.6 Case study: Pair Chemistry ("does chemistry actually build with reps — and can I trust that?")

**Finding (E3, `eda_report.md`):** across 230 distinct pairs (mean 6.63 matches together,
median 3, max 51), win rate by nth-match-together bucket climbs from **39.8%** (1–3
matches, n=488) → **45.3%** (4–8, n=400) → **51.9%** (9–15, n=289) → **68.2%** (16+, n=349).
Chi-square across buckets p = 2.97e-15 — a real, detectable pattern. But 88 of the 230 pairs
never play more than one match together, and only 89 of 230 (39%) ever reach 5+ matches —
the pairs that survive into the higher buckets are a shrinking, self-selected group, and
self-selection is the obvious rival explanation to "chemistry improves with practice": pairs
that win *keep getting rebooked*; pairs that lose *stop playing together*. The data cannot,
by itself, separate "reps build chemistry" from "winning pairs get more reps."

### The question
"Does playing more matches together make a pair better — or are we just watching the
survivors?" Unlike the momentum case, this finding needs a caveat that is **structural**, not
just a nice-to-have footnote: if the chart doesn't visually acknowledge the shrinking sample,
it silently endorses the more flattering (and less supported) causal story.

### Encoding decision
**Primary: a line chart across the four ordered buckets, win rate on the y-axis, Wilson 95%
CI band around the line — with a narrowing gray wedge shaded behind the line that visually
thins from left to right**, standing in for the shrinking population of pairs that actually
reach that bucket. Channels: **position** (win rate, the precise channel, on a continuous
scale) along an **ordinal x** (bucket order, which *is* the "reps" variable), with **width**
as a second, deliberately soft channel behind the line to carry "how many pairs are even
still in this bucket" without competing for the reader's primary attention.

### Alternatives rejected
- **Bar per bucket.** Perfectly capable of showing the four win-rate values — bars are a top
  channel for precise magnitude reading. But bars have already spent their one channel (bar
  length) on the win rate; there's no natural place left to layer in "and here's how many
  pairs survive to this point" without resorting to a second, disconnected axis or a wall of
  caption text outside the chart — exactly what the brief rules out. A trend across an
  *ordered* variable (repetitions) is also read more naturally as a connected line than as
  four separate columns the eye has to re-scan and re-compare one at a time.
- **Scatter per pair with an overall trend line** (each of the 230 pairs as one point, x =
  matches together, y = that pair's own win rate, LOESS/regression line through them). Loses
  on two counts: (1) most pairs sit at 1–3 matches together, where a "win rate" computed on
  1, 2, or 3 games can only take a handful of discrete values (0%, 33%, 50%, 67%, 100%) — this
  produces a fan of noisy extreme dots at low x that has nothing to do with the underlying
  signal and would visually overwhelm the real pattern; (2) 230 overlapping points at the
  low end create serious overplotting, and the survivorship story (that the high-x tail is
  thin) becomes something the reader has to notice from *sparseness*, an easy thing to miss
  without deliberate emphasis — the opposite of "the caveat must appear in the design."
- **Small multiples** (one facet per bucket, e.g. a mini-histogram of pair win rates within
  each bucket). Small multiples earn their keep when the interesting comparison is *shape*
  across many categories (see C5, the indoor/outdoor split in §4.1). Here there are only four
  ordered buckets and one cross-bucket story — a monotonic climb — which is exactly the case
  where forcing the reader to mentally re-stitch four separate panels back into one trend line
  adds cognitive cost for no payoff. It solves a problem this finding doesn't have.

### Chart-family classification
**Change-over-time / trend family** (line + uncertainty band across an ordered variable),
with a secondary **distribution-adjacent cue** (the narrowing wedge) layered in — deliberately
not the distribution family's primary chart type (histogram/small multiples, rejected above),
kept subordinate so it reads as context, not a second competing story.

### Annotation plan — the survivorship caveat lives in the design, not just the text
Two things happen inside the canvas, not only in a caption underneath it:
1. **The shrinking gray wedge itself** is a visual, always-on cue: the reader sees the "lane"
   the line travels through get narrower toward 16+, before reading a single word.
2. **A static callout anchored at the narrow end** makes the visual cue legible in words:
   *"Only 39% of pairs (89 of 230) ever reach 5+ matches together — this rise partly reflects
   who stays paired, not only how chemistry improves."* This callout sits inside the chart's
   visual perimeter (per the hierarchy rule in §4.2), not in an external caption, precisely
   because it is a load-bearing part of the finding, not a footnote.

### Accessibility note
Single data-carrying hue (blue line + band); the survivorship wedge is neutral gray, using
*lightness/opacity*, not hue, to stay distinct from the blue line — consistent with the
existing "gray = context, not a competing signal" rule. The caveat is also fully present as
plain text in the callout, so a reader who can't perceive the shaded wedge at all (low
vision, grayscale print at low contrast) still gets the survivorship warning from the label,
never only from the shape.

> **What to say in the presentation:** *"Pairs who play more matches together win a lot more
> — 40% early on, 68% once they've played sixteen-plus matches. It's tempting to read that as
> 'practice makes you better together.' But I made myself uncomfortable with that story before
> I'd shipped the chart: only 39% of pairs ever even reach five matches together. The obvious
> rival explanation is that winning pairs just keep getting picked again, and losing pairs get
> split up — survivorship, not chemistry. I didn't want that caveat to be a sentence under the
> chart that half the room skips, so I put a visual cue for it directly in the chart: the band
> the line travels through gets narrower as you move right, and there's a callout that spells
> out exactly why."*

---

## 4.7 Case study: Ranking Calibration ("do rankings predict — or decide?")

**Finding (E2, `eda_report.md`):** the higher-ranked team (by current combined ranking
points) wins **78.5%** of matches overall (n=763, 95% CI [75.5%, 81.3%]) — real, but nowhere
near certain. A logistic regression of the outcome on log(points ratio) reaches **AUC =
0.883**, and its decile calibration table tracks the diagonal closely (e.g. predicted 42.5% →
actual 39.0% in the middle decile; predicted 97.3% → actual 98.7% at the top). Splitting by
the *size* of the ranking gap (quintiles of |points gap|) shows the real texture: the closest
quintile still favors the higher-ranked team 58.8% of the time; the widest quintile favors
them 96.7% of the time. **Caveat carried from the EDA itself:** ranking points are a single
end-of-window snapshot, not each player's points as of the match date, so this likely
overstates true pre-match predictive power (look-ahead bias) — reported as approximate.

### The question
"Do rankings actually mean something, or is 'higher seed' just a number FIP prints next to a
name?" The nuance that matters to *this* audience (Marco, an amateur fan; Luca, a coach who
wants a plain talking point) is not "is the statistical model well-calibrated" — it's "how
much should I actually trust a ranking gap, and does that trust scale with how big the gap
is." That reframing is what decides the encoding.

### Encoding decision
**Primary: a lollipop chart by points-gap quintile, stems anchored at 50% (not zero).** Five
ordered categories from "closest quintile" to "biggest gap," length/position of each dot above
the shared 50% baseline showing how far above a coin flip the favorite's win rate sits at that
gap size, with the overall average (78.5%) as a secondary dashed reference. Channels:
**length from a meaningful baseline** (the strongest channel for this comparison, and reusing
the exact idiom C3/Shot-DNA already established: the zero-point that matters isn't
mathematical zero, it's the "no information" baseline — there, net-zero shot balance; here,
50-50 odds) plus **ordered position** (quintile order = gap size, so the chart itself tells
the "bigger gap → more certain" part of the story just by reading left to right).

### Alternatives rejected
- **ROC curve — deliberately rejected as too technical for this audience.** An ROC curve
  plots true-positive rate against false-positive rate swept across every possible decision
  threshold, and the AUC (0.883) is the area under it. That's the right tool for *me*, as the
  person validating that the model has real discriminative power before I trust it enough to
  build a chart on top of it — and I did check it. But it is not a chart to *put in front of*
  Marco or Luca: it requires understanding classification thresholds and a false-positive/
  true-positive tradeoff that has no intuitive counterpart in "should I worry about this
  ranking gap before my match." Putting an ROC curve on screen would answer a question the
  audience never asked (is the model good?) instead of the one they did (does the gap
  matter?). The AUC number lives in this document's methodology, not on any chart.
- **Calibration dot plot vs. y = x** (the decile table above, plotted as predicted probability
  on the x-axis, observed win rate on the y-axis, points hugging a diagonal reference line).
  This is the textbook-correct way to show a model is well-calibrated, and it's genuinely
  close to the diagonal in this data — good news, but news for the analyst, not the audience.
  It presupposes the reader already accepts "predicted probability from a logistic regression"
  as a meaningful quantity and knows that distance-from-diagonal is the thing to evaluate.
  Rejected for the same reason as the ROC curve: it answers "is the model honest" rather than
  "how much should a ranking gap change my expectations" — the latter is what Marco and Luca
  actually came to ask. (Used internally to sanity-check the model before building anything
  on top of it; not shown as a chart.)
- **Simple KPI** ("Favorites win 78.5% of matches," styled like the Home-page big-number
  card, C1). Loses because collapsing to one number actively hides the finding that matters
  most: the 78.5% average is not one fact, it's an average over a range from 58.8% (closest
  quintile) to 96.7% (biggest gap). A single KPI would let the reader walk away believing
  every ranking gap carries the same predictive weight — the opposite of "rankings predict but
  don't decide," which is precisely a statement about that weight *varying*. A KPI can't carry
  a "depends on how big the gap is" finding; a quintile breakdown can.

### Chart-family classification
**Ranking / magnitude family** — an ordered-categorical magnitude comparison, the same family
as a bar chart, using the lollipop variant so the reference baseline (50%) can sit visually
mid-chart rather than at a plot edge. Explicitly not the correlation/relationship family
(where the rejected ROC curve and calibration-vs-diagonal plot both belong).

### Annotation plan
Two static callouts, one at each end of the quintile order: **"Even the closest call still
tips to the higher-ranked pair (59%)"** at the small-gap end, and **"A landslide gap is almost
a sure thing (97%) — 'almost' is the word: upsets still happen"** at the wide-gap end. The
50% reference line is labeled "coin flip" directly on the chart, and the overall 78.5% average
appears as a lighter dashed line labeled "season average" so a reader can see at a glance that
no single quintile actually sits at that average — the average is a blend of very different
realities. Hover adds the exact n and CI per quintile for anyone who wants to check the
numbers, but none of the headline claims require hovering.

### Accessibility note
Single hue (blue dots and stems); both reference lines (50% and season average) are gray,
distinguished from each other by dash pattern (solid vs. dashed) rather than color, so the
distinction survives grayscale printing and any form of color blindness. Every callout states
its number in text, so the finding never depends on reading a bar's length precisely off an
unlabeled axis.

> **What to say in the presentation:** *"Rankings do predict outcomes — favorites win 78.5%
> of the time, and a logistic regression on the points gap gets an AUC of 0.88, which is
> genuinely a strong number. I checked that with an ROC curve and a calibration plot, and both
> looked good — but neither of those went anywhere near the final design, because they answer
> 'is this model honest,' not the question my audience actually has. What I built instead
> shows the same finding sliced by how big the ranking gap actually is: in the closest
> quintile it's barely better than a coin flip, 59%; in the most lopsided quintile it's near a
> sure thing, 97%. The stems start at 50%, not zero, for the same reason the shot-DNA bars
> don't start at an arbitrary edge — the baseline that matters here is 'no information,' and
> everything the chart shows is distance above that. The headline is: rankings predict, but
> they don't decide — and now you can see exactly how much they don't, depending on how big
> the gap is."*
