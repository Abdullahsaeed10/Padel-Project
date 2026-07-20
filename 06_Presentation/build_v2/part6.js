const M = require("./part5.js");
const {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS, getSlideNum,
} = M;

// =====================================================================
// SECTION 6 — DEMO & CONCLUSIONS (slides 28-31)
// =====================================================================

// Slide 28 — Demo script
{
  const s = sectionSlide({
    sectionNum: 6, sectionName: "Demo & Conclusions",
    kicker: "§6.1 Live demo script", title: "What I'll show live: Marco logs a match",
    notes: "Here's exactly what I'd show you live. I open Home and point at the KPI block and the weekly drill recommendation. Then I go to Log a Match and fill in a 6-4, 3-6, 6-2 win with a partner and opponents of my choice, watching the live auto-result preview update as I type — the whole thing takes under ninety seconds. I go back to Home and show the KPI and recent-matches table updating instantly, because the cache clears on submit. Then My Stats, where every win rate carries a Wilson confidence interval suffix, like '62% (CI 45 to 77, n=24)' — never a bare, overconfident number. Finally Insights, where the four discovery cards run live against the real 2026 data.",
  });
  const steps = [
    ["1", "Home", "Point at the KPI block and the weekly drill recommendation — \"how am I doing\" in under 10 seconds."],
    ["2", "Log a Match", "Enter a 6-4, 3-6, 6-2 win live: partner and opponents of my choice, watching the auto-result preview update as I type. Under 90 seconds, start to submit."],
    ["3", "Home (refresh)", "Show the KPI and recent-matches table updating instantly — the cache clears automatically on submit."],
    ["4", "My Stats", "Point out that every win rate carries a Wilson CI suffix, e.g. \"62% (CI 45–77, n=24)\" — never a bare, overconfident percentage."],
    ["5", "Insights", "Walk through the four live discovery cards — momentum, Elo vs. ranking, pair chemistry, model calibration — computed on the real 2026 feed."],
  ];
  let sy = 1.55;
  steps.forEach((st) => {
    const h = 0.98;
    card(s, 0.55, sy, 12.25, h, { fill: CARD_BG });
    s.addShape(pres.ShapeType.ellipse, { x: 0.78, y: sy + 0.16, w: 0.5, h: 0.5, fill: { color: ACCENT }, line: { type: "none" } });
    s.addText(st[0], { x: 0.78, y: sy + 0.16, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 16, color: WHITE, margin: 0 });
    s.addText(st[1], { x: 1.5, y: sy + 0.1, w: 1.9, h: h - 0.2, fontFace: BODY_FONT, bold: true, fontSize: 13, color: ACCENT_DARK, valign: "middle", margin: 0 });
    s.addText(st[2], { x: 3.5, y: sy + 0.1, w: 9.1, h: h - 0.2, fontFace: BODY_FONT, fontSize: 11.5, color: INK, valign: "middle", margin: 0, lineSpacingMultiple: 1.1 });
    sy += h + 0.1;
  });
}

// Slide 29 — Seven findings takeaway table
{
  const s = sectionSlide({
    sectionNum: 6, sectionName: "Demo & Conclusions",
    kicker: "§6.2 Takeaway table", title: "The seven findings, side by side",
    notes: "Here are the seven findings side by side, as the honest takeaway table. Momentum: set-one winners take the match 86% of the time, but that collapses to a coin flip in deciders. Chemistry: win rate climbs from 40% to 68% with more matches together, survivorship caveat attached. Calibration: rankings predict at 78.5%, but don't decide. Elo versus ranking surfaces specific over- and under-rated players the official points miss. Upsets are rarer than they feel, at 22%. Efficiency: winning your previous round in fewer games gives you a real edge next round. And home advantage is a genuine null — I'm reporting that honestly rather than hiding it.",
  });
  const rows = [
    ["Momentum", "86.2% → 49.3% once it's a decider — momentum resets", false],
    ["Chemistry", "39.8% → 68.2% by reps together (survivorship caveat)", false],
    ["Calibration", "Favorites win 78.5% (AUC 0.883) — predicts, doesn't decide", false],
    ["Elo vs. ranking", "Flags specific players the official points under-rate", false],
    ["Upsets", "Only 22.4% of seeded matches are upsets", false],
    ["Efficiency", "Fewer games last round → 59.7% win rate next match", false],
    ["Home advantage", "43% win rate at home, n=109, p=0.18 — a genuine null", true],
  ];
  let ty = 1.55;
  const rh = 0.68;
  card(s, 0.55, ty, 12.25, 0.42, { fill: INK, noShadow: true });
  s.addText("Finding", { x: 0.8, y: ty + 0.06, w: 2.6, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: WHITE, margin: 0 });
  s.addText("Takeaway", { x: 3.5, y: ty + 0.06, w: 8.0, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: WHITE, margin: 0 });
  ty += 0.42;
  rows.forEach((r) => {
    card(s, 0.55, ty, 12.25, rh, { fill: r[2] ? "EDEFF2" : CARD_BG, noShadow: true, line: BORDER });
    s.addText(r[0], { x: 0.8, y: ty + 0.08, w: 2.6, h: rh - 0.16, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: r[2] ? MUTED : ACCENT_DARK, valign: "middle", margin: 0 });
    s.addText(r[1], { x: 3.5, y: ty + 0.08, w: 7.5, h: rh - 0.16, fontFace: BODY_FONT, fontSize: 11.8, color: INK, valign: "middle", margin: 0 });
    if (r[2]) tag(s, 11.15, ty + (rh - 0.32) / 2, "HONEST NULL", { w: 1.55, fill: "E5E7EB", color: MUTED });
    ty += rh;
  });
}

// Slide 30 — Limitations honest
{
  const s = sectionSlide({
    sectionNum: 6, sectionName: "Demo & Conclusions",
    kicker: "§6.3 Limitations", title: "Stated honestly, not buried in an appendix",
    notes: "Four limitations I want stated plainly, not buried in an appendix. The dataset is a single season snapshot with a rolling six-month free-tier window, so there's no historical comparison. The ranking-calibration number uses a snapshot of current points, not match-date points, so treat 78.5% and that 0.88 AUC as an optimistic upper bound. Court surface simply isn't available on this API tier. And validation is honestly in progress — the instruments are built and ready, but the actual sessions with real club players and external evaluators are scheduled, not yet run, so there's no SUS score or heuristic round-2 findings table to show you yet.",
  });
  const lims = [
    ["Single-season, free-tier window", "2026 season only; rolling ~6-month API window; no multi-year comparison possible."],
    ["Ranking-points snapshot caveat", "78.5% favorite-win-rate and 0.883 AUC use current points, not match-date points — an optimistic upper bound, carried into the §4 calibration case study."],
    ["No court surface", "court_type is empty on this API tier — indoor/outdoor analysis (present in the synthetic v1 data) is dropped, not guessed."],
    ["Validation in progress", "Instruments (survey, interview, SUS, testing protocol, heuristic round 2) are built and ready; sessions with real club players + external evaluators are scheduled, not yet run — no SUS score or findings table exists yet."],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.55, ch = 2.55;
  lims.forEach((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (cw + 0.25), y = y0 + row * (ch + 0.2);
    card(s, x, y, cw, ch, { fill: CARD_BG });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.22, y: y + 0.22, w: 0.34, h: 0.34, fill: { color: MUTED }, line: { type: "none" } });
    s.addText("!", { x: x + 0.22, y: y + 0.22, w: 0.34, h: 0.34, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 13, color: WHITE, margin: 0 });
    s.addText(l[0], { x: x + 0.7, y: y + 0.2, w: cw - 0.95, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
    s.addText(l[1], { x: x + 0.22, y: y + 0.75, w: cw - 0.45, h: ch - 0.95, fontFace: BODY_FONT, fontSize: 11.8, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
  });
}

// Slide 31 — Future developments
{
  const s = sectionSlide({
    sectionNum: 6, sectionName: "Demo & Conclusions",
    kicker: "§6.4 Future developments", title: "What comes after the exam",
    notes: "Looking ahead, past the exam: first priority is running the validation sessions and folding the SUS score and heuristic round-2 findings back into the app before the actual defense. Second, add real authentication and move to a hosted Postgres so PadelLens can genuinely support more than one player. Third, if I upgrade the API tier, a historical point-in-time ranking endpoint would let me redo the calibration analysis without the look-ahead caveat. Fourth, richer shot-by-shot tagging within a rally, once the ninety-second logging habit is actually established — sufficiency was a deliberate trade-off in version one, not a permanent ceiling.",
  });
  const items = [
    ["1", "Close the validation loop", "Run the scheduled sessions, compile the SUS score and heuristic round-2 findings, feed changes back into the app before the defense."],
    ["2", "Real multi-user auth", "Add authentication and a hosted Postgres instance so more than one player can genuinely use PadelLens."],
    ["3", "Point-in-time rankings", "A historical ranking endpoint (paid API tier) would let the calibration analysis drop the look-ahead-bias caveat entirely."],
    ["4", "Richer shot tagging", "Shot-by-shot tagging within a rally, once the 90-second logging habit is established — sufficiency was a v1 trade-off, not a ceiling."],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.6, ch = 2.5;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (cw + 0.25), y = y0 + row * (ch + 0.2);
    card(s, x, y, cw, ch);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: y + 0.25, w: 0.45, h: 0.45, fill: { color: ACCENT }, line: { type: "none" } });
    s.addText(it[0], { x: x + 0.25, y: y + 0.25, w: 0.45, h: 0.45, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 16, color: WHITE, margin: 0 });
    s.addText(it[1], { x: x + 0.85, y: y + 0.28, w: cw - 1.1, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: INK, margin: 0 });
    s.addText(it[2], { x: x + 0.28, y: y + 0.95, w: cw - 0.55, h: ch - 1.15, fontFace: BODY_FONT, fontSize: 12, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
  });
}

// =====================================================================
// CLOSING (slide 32)
// =====================================================================
{
  const s = newSlide();
  s.background = { color: INK };
  s.addShape(pres.ShapeType.ellipse, { x: -2.0, y: -2.0, w: 5.5, h: 5.5, fill: { color: ACCENT_DARK }, line: { type: "none" } });
  s.addShape(pres.ShapeType.ellipse, { x: 10.9, y: 4.6, w: 4.6, h: 4.6, fill: { color: "111827" }, line: { type: "none" } });
  s.addText("Thank you", { x: 0.7, y: 2.35, w: 11.9, h: 1.1, fontFace: TITLE_FONT, bold: true, fontSize: 52, color: WHITE, margin: 0 });
  s.addText("“You don’t have to feel your game — you can see it.”", { x: 0.72, y: 3.55, w: 10.5, h: 0.7, fontFace: BODY_FONT, italic: true, fontSize: 20, color: ACCENT_LIGHT, margin: 0 });
  s.addText("PadelLens — Pro Tour Insights + My Match Log", { x: 0.72, y: 4.35, w: 10, h: 0.4, fontFace: BODY_FONT, fontSize: 14, color: "D1D5DB", margin: 0 });
  s.addText("Abdullah Saeed Aly Elhusseiny  ·  Data Visualization for Sport  ·  Politecnico di Milano, AY 2025/2026", {
    x: 0.72, y: 6.4, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 13, color: MUTED, margin: 0,
  });
  s.addText(`PadelLens — DV4S 2025/26 — Closing — slide ${getSlideNum()}/${TOTAL}`, {
    x: 0.7, y: 7.16, w: 11.9, h: 0.28, fontFace: BODY_FONT, fontSize: 9, color: "6B7280", margin: 0,
  });
  s.addNotes("That's PadelLens end to end — a real API pipeline, an honest exploratory analysis with seven findings and one stated null, chart choices I can defend against named alternatives, a working multi-user-ready Streamlit app, and a validation plan that's honestly still a work in progress rather than fabricated. The whole project comes back to one line: you don't have to feel your game, you can see it. Thank you — I'm happy to take questions, or to walk through the live app in more depth.");
}

console.log("part6 (final) loaded, total slides=" + getSlideNum());

const OUT = "/sessions/lucid-funny-davinci/mnt/Padel-Project/06_Presentation/PadelLens_Deck_v2.pptx";
pres.writeFile({ fileName: OUT }).then(() => console.log("WROTE " + OUT));
