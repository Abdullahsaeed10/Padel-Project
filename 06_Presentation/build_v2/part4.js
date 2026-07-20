const M = require("./part3.js");
const {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS, getSlideNum,
} = M;

// =====================================================================
// SECTION 4 — DATA REPRESENTATION & VISUAL ENCODING (slides 18-24)
// =====================================================================

// Slide 18 — Chart inventory
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.1 Chart inventory", title: "9 chart types, none of them decorative",
    notes: "The whole app uses nine distinct chart types, and none of them are decorative — each one traces back to a specific EDA finding. I had a longer list initially and cut it down ruthlessly: a pie chart of shot share, a court heatmap, a Sankey of points to match wins, an animated ranking time-lapse — all rejected because they either communicate less than a simpler alternative or imply a precision I can't back up with the data I have. The rule was simple: every chart has to beat at least one specific alternative in a head-to-head comparison on the exact question it's answering.",
  });
  const rows = [
    ["C1", "Home", "Big KPI + sparkline", "\"How am I doing?\" in 0.5s"],
    ["C2", "Home", "Horiz. bar — partner win rate", "Length = best preattentive channel for comparison"],
    ["C3", "Home", "Diverging bar — Shot DNA", "Signed magnitude: net-positive vs net-negative"],
    ["C4", "Pro Tour", "Ranking table + row sparkline", "A ranking is fundamentally tabular"],
    ["C5", "Pro Tour", "Small multiples — tier split", "Compares distributions without overlay"],
    ["C6", "My Stats", "Rolling-mean line + ±1σ band", "Trend over time, noise-reduced"],
    ["C7", "My Stats", "Set-by-set columns + delta", "The story is the gap, not the bars"],
    ["C8", "Compare", "Radar — shot mix vs pro", "Small, fixed, parallel categories"],
    ["C9", "Multiple", "In-canvas annotations", "Kirk's focus principle, applied directly"],
  ];
  let ty = 1.55;
  const rh = 0.53;
  card(s, 0.55, ty, 12.25, rh, { fill: INK, noShadow: true });
  const heads = ["#", "Page", "Chart", "Why this chart"];
  const hx = [0.75, 1.55, 3.15, 6.55];
  heads.forEach((h, i) => s.addText(h, { x: hx[i], y: ty + 0.1, w: (i === 3 ? 5.9 : hx[i + 1] - hx[i] - 0.15), h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 12, color: WHITE, margin: 0 }));
  ty += rh;
  rows.forEach((r, i) => {
    card(s, 0.55, ty, 12.25, rh, { fill: i % 2 === 0 ? CARD_BG : WHITE, noShadow: true, line: BORDER });
    s.addText(r[0], { x: hx[0], y: ty + 0.1, w: 0.7, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 11.5, color: ACCENT_DARK, margin: 0 });
    s.addText(r[1], { x: hx[1], y: ty + 0.1, w: 1.5, h: 0.35, fontFace: BODY_FONT, fontSize: 11, color: INK, margin: 0 });
    s.addText(r[2], { x: hx[2], y: ty + 0.1, w: 3.3, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 11, color: INK, margin: 0 });
    s.addText(r[3], { x: hx[3], y: ty + 0.1, w: 5.9, h: 0.35, fontFace: BODY_FONT, italic: true, fontSize: 10.8, color: MUTED, margin: 0 });
    ty += rh;
  });
  s.addText("Considered and rejected: pie chart of shot share, court heatmap, Sankey (points → match wins), animated ranking time-lapse, 3D bar charts — always rejected.", {
    x: 0.55, y: ty + 0.12, w: 12.25, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 11.3, color: CAPTION, margin: 0,
  });
}

// Slide 19 — Shot DNA recap
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.1 Case study recap", title: "Shot DNA — the diverging bar",
    notes: "This is the one case study the first evaluation praised for reasoning against alternatives properly, so I'm keeping it as the model for the three new ones. Shot DNA is a diverging horizontal bar — winners to the right, unforced errors to the left, colored by whether the shot is net-positive or net-negative. The reason is that the underlying question is signed: bandeja is net positive, smash is net negative. A pie chart shows proportions, which isn't the question. Stacked bars hide the zero line. Diverging bars put that zero line dead center and let you read the sign instantly from which side the bar falls on.",
  });
  const shots = [
    ["Bandeja", 6.1, -1.4], ["Volley", 5.2, -1.8], ["Forehand", 4.4, -2.6], ["Backhand", 2.9, -3.7], ["Smash", 2.1, -4.8],
  ];
  s.addChart(pres.ChartType.bar, [
    { name: "Errors", labels: shots.map(x => x[0]), values: shots.map(x => x[2]) },
    { name: "Winners", labels: shots.map(x => x[0]), values: shots.map(x => x[1]) },
  ], {
    x: 0.55, y: 1.55, w: 7.1, h: 4.5, barDir: "bar", barGrouping: "stacked",
    chartColors: [RED, ACCENT], showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 10, dataLabelPosition: "ctr",
    showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 11,
    catAxisLabelColor: INK, catAxisLabelFontSize: 11.5, catAxisLabelPos: "low",
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 10,
    valGridLine: { color: "E5E7EB", size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: "Winners (right) vs unforced errors (left), per shot", titleColor: INK, titleFontSize: 13,
  });
  card(s, 7.95, 1.55, 4.85, 4.5, { fill: CARD_BG });
  bulletsBlock(s, [
    { text: "Question is signed", bold: true },
    "bandeja is net-positive, smash is net-negative — the sign is the point",
    { text: "Rejected: pie chart", bold: true },
    "shows proportions of use, not net sign",
    { text: "Rejected: stacked bars", bold: true },
    "hide the zero line the whole story depends on",
    { text: "Diverging bars", bold: true, color: ACCENT_DARK },
    "put zero dead-center — sign readable at a glance",
  ], 8.2, 1.8, 4.4, 4.0, { fontSize: 12.3, spaceAfter: 9 });
}

// Slide 20 — Momentum case study (NEW)
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.5 New case study", title: "Momentum: does winning set 1 mean anything?",
    notes: "Winning set one looks decisive — 86% of the time the set-one winner takes the match. But that number hides a trap: it's dragging in every two-set blowout alongside the close matches. So I asked a sharper question — of the matches that actually reach a valid third set, does the set-one winner still have the edge? The answer is no: 49%, a coin flip. I drew this as two connected dots on a shared scale instead of two separate bars, with a dashed line at fifty percent, because the story isn't the two numbers, it's the 37-point collapse between them — a slope chart puts that drop directly in the geometry, not in a caption underneath.",
  });
  const cats = ["After winning set 1\n(n=763)", "Set-1 winner in a decider\n(n=207)"];
  s.addChart([
    { type: pres.ChartType.line, data: [{ name: "Win rate", labels: cats, values: [86.2, 49.3] }],
      options: { chartColors: [ACCENT], lineSize: 3.5, lineDataSymbol: "circle", lineDataSymbolSize: 12, lineDataSymbolLineColor: ACCENT_DARK, showValue: true, dataLabelPosition: "t", dataLabelColor: INK, dataLabelFontSize: 14, dataLabelFontBold: true } },
    { type: pres.ChartType.line, data: [{ name: "Coin flip (50%)", labels: cats, values: [50, 50] }],
      options: { chartColors: [CAPTION], lineSize: 1.5, lineDataSymbol: "none", dashType: "dash", showValue: false } },
  ], {
    x: 0.55, y: 1.55, w: 7.3, h: 4.55, valAxisMinVal: 0, valAxisMaxVal: 100,
    showLegend: true, legendPos: "b", legendColor: MUTED, legendFontSize: 10.5,
    catAxisLabelColor: INK, catAxisLabelFontSize: 11.5, valAxisLabelColor: MUTED, valAxisLabelFontSize: 10,
    valGridLine: { color: "E5E7EB", size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: "P(match winner = set-1 winner)", titleColor: INK, titleFontSize: 13,
    valAxisTitle: "Win rate (%)", showValAxisTitle: true, valAxisTitleColor: MUTED, valAxisTitleFontSize: 10,
  });
  s.addText("86% → 49%: the set-1 lead evaporates once it's a decider.", {
    x: 0.75, y: 6.15, w: 6.9, h: 0.5, fontFace: BODY_FONT, bold: true, italic: true, fontSize: 13, color: ACCENT_DARK, margin: 0,
  });
  card(s, 8.05, 1.55, 4.75, 4.5, { fill: CARD_BG });
  bulletsBlock(s, [
    { text: "Encoding: position + slope", bold: true },
    "the collapse lives in the geometry, not a caption",
    { text: "Rejected: grouped bars", bold: true },
    "reads two facts, not one collapse",
    { text: "Rejected: waterfall", bold: true },
    "falsely implies an additive decomposition",
    { text: "Rejected: Sankey", bold: true },
    "the 49% group isn't a flow-subset of the 86% group",
  ], 8.3, 1.8, 4.3, 4.1, { fontSize: 12, spaceAfter: 8 });
}

// Slide 21 — Chemistry case study (NEW)
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.6 New case study", title: "Pair chemistry: reps, or survivorship?",
    notes: "Pairs who play more matches together win a lot more — around 40% in their first three matches, 68% once they've played sixteen-plus together. It's tempting to read that as 'practice builds chemistry.' But I made myself uncomfortable with that story before shipping the chart: only 39% of pairs ever even reach five matches together. The rival explanation is survivorship — winning pairs keep getting rebooked, losing pairs get split up. I didn't want that caveat buried in a caption half the room skips, so I built it into the chart itself: a gray band behind the line that visibly narrows toward the high end, with a callout that spells out exactly why.",
  });
  // Narrowing wedge (schematic, gray, behind the chart plot area only — not overlapping title/footer).
  // Trapezoid is authored pre-rotation as a TALL box (pre-w x pre-h), then rotated 270 degrees so the
  // rendered bounding box becomes WIDE x SHORT, centered on the same point: pre-w becomes the final
  // height, pre-h becomes the final width. Final target box: x[1.3,7.5] y[2.3,5.5] -> center (4.4, 3.9).
  s.addShape(pres.ShapeType.trapezoid, {
    x: 2.8, y: 0.8, w: 3.2, h: 6.2, rotate: 270,
    fill: { color: GRAY_WEDGE, transparency: 30 }, line: { type: "none" },
  });
  const cats2 = ["1–3 (n=488)", "4–8 (n=400)", "9–15 (n=289)", "16+ (n=349)"];
  s.addChart([
    { type: pres.ChartType.line, data: [{ name: "Win rate by reps together", labels: cats2, values: [39.8, 45.3, 51.9, 68.2] }],
      options: { chartColors: [ACCENT], lineSize: 3.5, lineDataSymbol: "circle", lineDataSymbolSize: 11, showValue: true, dataLabelPosition: "t", dataLabelColor: INK, dataLabelFontSize: 13, dataLabelFontBold: true } },
  ], {
    x: 0.55, y: 1.55, w: 7.3, h: 4.4, valAxisMinVal: 0, valAxisMaxVal: 100, showLegend: false,
    catAxisLabelColor: INK, catAxisLabelFontSize: 11, valAxisLabelColor: MUTED, valAxisLabelFontSize: 10,
    valGridLine: { color: "E5E7EB", size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: "Win rate by matches played together (chi-sq p<0.001)", titleColor: INK, titleFontSize: 12.5,
    chartArea: { fill: { color: WHITE, transparency: 100 } }, plotArea: { fill: { color: WHITE, transparency: 100 } },
  });
  s.addText("Only 39% of pairs (89 of 230) ever reach 5+ matches together — the narrowing band is the shrinking population, not just decoration.", {
    x: 0.75, y: 6.1, w: 6.9, h: 0.6, fontFace: BODY_FONT, bold: true, italic: true, fontSize: 12, color: ACCENT_DARK, margin: 0,
  });
  card(s, 8.05, 1.55, 4.75, 4.5, { fill: CARD_BG });
  bulletsBlock(s, [
    { text: "Encoding: line + ordinal x + gray wedge", bold: true },
    "wedge stands in for the shrinking pair population",
    { text: "Rejected: bar per bucket", bold: true },
    "no room left to layer in \"how many pairs survive\"",
    { text: "Rejected: scatter per pair", bold: true },
    "noisy fan at low x overwhelms the real signal",
    { text: "Rejected: small multiples", bold: true },
    "solves a shape-comparison problem this finding doesn't have",
  ], 8.3, 1.8, 4.3, 4.1, { fontSize: 11.8, spaceAfter: 8 });
}

// Slide 22 — Calibration case study (NEW)
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.7 New case study", title: "Ranking calibration: predicts, doesn't decide",
    notes: "Rankings do predict outcomes — favorites win 78.5% of matches overall, and a logistic regression on the points gap reaches an AUC of 0.88, a genuinely strong number. I checked that with an ROC curve and a calibration plot first, and both looked good — but neither one made it into the final design, because they answer 'is this model honest,' not the question my audience actually has. What I built instead slices the same finding by how big the ranking gap actually is: in the closest quintile it's barely above a coin flip at 59%; in the widest gap it's a near-certainty at 97%. The stems start at 50%, not zero, because the baseline that matters here is 'no information.'",
  });
  const cats3 = ["Closest ranking-gap\nquintile (n≈153)", "Season average\n(all matches)", "Widest ranking-gap\nquintile (n≈153)"];
  s.addChart(pres.ChartType.bar, [
    { name: "Favorite win rate", labels: cats3, values: [58.8, 78.5, 96.7] },
  ], {
    x: 0.55, y: 1.55, w: 7.3, h: 4.55, barDir: "col", valAxisMinVal: 50, valAxisMaxVal: 100,
    chartColors: [ACCENT], showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 13, dataLabelFontBold: true,
    showLegend: false, catAxisLabelColor: INK, catAxisLabelFontSize: 10.5, catAxisLabelPos: "low",
    valAxisLabelColor: MUTED, valAxisLabelFontSize: 10,
    valGridLine: { color: "E5E7EB", size: 0.75 }, catGridLine: { style: "none" }, barGapWidthPct: 60,
    showTitle: true, title: "Favorite win rate, stems anchored at 50% (\"no information\")", titleColor: INK, titleFontSize: 12.5,
  });
  s.addText("Coin-flip baseline is 50%, not 0% — everything shown is distance above \"no information.\"", {
    x: 0.75, y: 6.25, w: 6.9, h: 0.45, fontFace: BODY_FONT, italic: true, fontSize: 11.5, color: MUTED, margin: 0,
  });
  card(s, 8.05, 1.55, 4.75, 4.5, { fill: CARD_BG });
  bulletsBlock(s, [
    { text: "Logistic model: AUC = 0.883", bold: true },
    "checked internally, never shown to Marco/Luca directly",
    { text: "Rejected: ROC curve", bold: true },
    "answers \"is the model honest\", not \"does the gap matter\"",
    { text: "Rejected: calibration-vs-diagonal", bold: true },
    "same objection — analyst tool, not audience chart",
    { text: "Rejected: single KPI (78.5%)", bold: true },
    "hides that the gap size changes everything",
  ], 8.3, 1.8, 4.3, 4.1, { fontSize: 11.8, spaceAfter: 8 });
}

// Slide 23 — Color & accessibility
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.3 Color & accessibility", title: "Color does editorial work, not decoration",
    notes: "Color here is doing editorial work, not decoration. Blue is the default — neutral, positive, interactive. Red is reserved narrowly, for negative signal that actually requires action: a partner you're losing with, a shot category that's net-negative. Gray marks the pro reference frame — we're not saying pros are better, just that they're the comparison point. I deliberately use no green at all, because blue-red is one of the safest pairs for color blindness, while red-green is the worst combination you could pick. And every red mark also carries an explicit minus sign or downward arrow, so the story survives even a black-and-white printout.",
  });
  const swatches = [
    [ACCENT, "Sky blue #0EA5E9", "Neutral / positive / interactive — the default for all charts"],
    [RED, "Red #EF4444", "Negative signal that requires action, only — never decorative"],
    [MUTED, "Gray #6B7280 / #9AA3AD", "Pro reference frame — the comparison point, not a competing color"],
    [INK, "Ink #1F2937", "Body text — 12.6:1 contrast on white (WCAG AAA)"],
  ];
  let sx = 0.55;
  const sw = 2.95;
  swatches.forEach((sw2) => {
    card(s, sx, 1.55, sw - 0.03, 2.3, { fill: WHITE });
    s.addShape(pres.ShapeType.roundRect, { x: sx + 0.2, y: 1.75, w: sw - 0.43, h: 0.85, rectRadius: 0.06, fill: { color: sw2[0] }, line: { type: "none" } });
    s.addText(sw2[1], { x: sx + 0.2, y: 2.72, w: sw - 0.43, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 11.5, color: INK, margin: 0 });
    s.addText(sw2[2], { x: sx + 0.2, y: 3.08, w: sw - 0.43, h: 0.7, fontFace: BODY_FONT, fontSize: 10, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
    sx += sw + 0.03;
  });
  card(s, 0.55, 4.1, 12.25, 2.65, { fill: CARD_BG });
  s.addText("Accessibility checks", { x: 0.8, y: 4.28, w: 11.7, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: INK, margin: 0 });
  bulletsBlock(s, [
    "WCAG AA contrast: body text on white = 12.6:1 ✓ (annotation gray = 2.8:1, used only for italic captions, never actionable text)",
    "Color-blind safety: blue/red tested in the Coblis simulator for deuteranopia and protanopia — both distinguish clearly. No green anywhere: red-green is the worst pairing for color blindness.",
    "No color-only encoding: every red bar/value also carries a minus sign or a downward arrow — the signal survives a black-and-white printout.",
  ], 0.8, 4.7, 11.7, 1.9, { fontSize: 12.5, spaceAfter: 10 });
}

// Slide 24 — Interactivity & annotation
{
  const s = sectionSlide({
    sectionNum: 4, sectionName: "Data Representation & Visual Encoding",
    kicker: "§4.4 Interactivity & annotation", title: "Static callouts carry the headline; hover carries detail",
    notes: "Interactivity follows the same editorial framework as everything else. Sidebar filters let the user re-frame the data — that's literally Kirk's framing layer, always visible, never hidden. Hover tooltips give exact values and dates on demand, without cluttering the chart surface. But the annotations that actually carry the headline are static and in-canvas — the '-40 percentage point' callout on the fatigue chart, the narrowing-wedge label on the chemistry chart — because those are the things a reader sees even if they never hover over anything. Captions outside the chart explain what it is; annotations inside explain why you should care.",
  });
  const rows = [
    ["Pro Tour sidebar", "Filter by country, surface, tier, date range", "Lets the user choose the frame (Kirk: framing)"],
    ["Pro Tour table", "Click a row → drill to player detail", "Progressive disclosure"],
    ["My Stats", "Toggle 30 / 60 / 90 / all matches", "A/B compare periods (Task T6)"],
    ["Any chart", "Hover tooltip: value + date + opponent", "Precision on demand, no clutter"],
    ["Log form", "Live \"auto-result\" preview while typing", "Visibility of system status"],
    ["Compare", "Toggle vs pro average / vs a named player", "Two intents, one chart"],
  ];
  let ty = 1.55;
  const rh = 0.62;
  card(s, 0.55, ty, 12.25, 0.42, { fill: INK, noShadow: true });
  ["Where", "What", "Editorial purpose"].forEach((h, i) => {
    const hx = [0.75, 3.55, 8.05];
    s.addText(h, { x: hx[i], y: ty + 0.06, w: (i === 2 ? 4.7 : hx[i + 1] - hx[i] - 0.15), h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12, color: WHITE, margin: 0 });
  });
  ty += 0.42;
  rows.forEach((r, i) => {
    card(s, 0.55, ty, 12.25, rh, { fill: i % 2 === 0 ? CARD_BG : WHITE, noShadow: true, line: BORDER });
    s.addText(r[0], { x: 0.75, y: ty + 0.1, w: 2.6, h: 0.45, fontFace: BODY_FONT, bold: true, fontSize: 11, color: ACCENT_DARK, margin: 0, valign: "top" });
    s.addText(r[1], { x: 3.55, y: ty + 0.1, w: 4.3, h: 0.45, fontFace: BODY_FONT, fontSize: 10.8, color: INK, margin: 0, valign: "top" });
    s.addText(r[2], { x: 8.05, y: ty + 0.1, w: 4.7, h: 0.45, fontFace: BODY_FONT, italic: true, fontSize: 10.5, color: MUTED, margin: 0, valign: "top" });
    ty += rh;
  });
  s.addText("Annotation strategy: static in-canvas callouts carry the headline · hover tooltips carry precise detail · captions outside the chart explain what it is.", {
    x: 0.55, y: ty + 0.12, w: 12.25, h: 0.45, fontFace: BODY_FONT, italic: true, fontSize: 11.3, color: CAPTION, margin: 0,
  });
}

console.log("part4 loaded, slide num=" + getSlideNum());
module.exports = M;
