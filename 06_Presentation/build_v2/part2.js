const M = require("./part1.js");
const {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS, getSlideNum, setSlideNum,
} = M;

// =====================================================================
// SECTION 2 — WORKING WITH DATA (slides 8-13)
// =====================================================================

// Slide 8 — Acquisition
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.1 Acquisition", title: "The padelapi.org pipeline",
    notes: "Everything downstream of this slide comes from a real API — padelapi.org — not a static CSV I dressed up. I designed the fetch script around real constraints: a ten-requests-per-minute free-tier limit, so I throttle every call to 6.5 seconds and back off on a 429; and a rolling six-month data window, so anything hidden behind that window comes back as a literal string I skip rather than guess. I targeted season 5, 'Premier Padel 2026' — 26 tournaments, and thirteen of them simply hadn't been played yet when I pulled the data. That's not a bug, that's an honest snapshot of a season in progress. I also pulled the full player directory — 2,165 players.",
  });
  bulletsBlock(s, [
    { text: "REST API, bearer token (PADELAPI_TOKEN) — fetch_padelapi.py", bold: true },
    "10 requests/minute free-tier cap → 6.5s throttle between calls; HTTP 429 backs off 65×(attempt+1)s, up to 4 tries",
    "Rolling ~6-month data window: anything hidden returns literal \"hidden_free_plan\" → skipped, never guessed",
    "Restartable by design: each tournament archived to its own .jsonl file; a re-run skips what's already on disk",
  ], 0.55, 1.55, 7.1, 3.9, { fontSize: 14, spaceAfter: 14 });

  const stats = [["26", "tournaments in season"], ["13 / 13", "played vs. not yet"], ["2,165", "players fetched"]];
  let sx = 0.55;
  stats.forEach((st) => {
    card(s, sx, 5.6, 2.28, 1.35, { fill: ACCENT });
    s.addText(st[0], { x: sx + 0.15, y: 5.72, w: 2.0, h: 0.6, fontFace: TITLE_FONT, bold: true, fontSize: 26, color: WHITE, margin: 0 });
    s.addText(st[1], { x: sx + 0.15, y: 6.35, w: 2.0, h: 0.55, fontFace: BODY_FONT, fontSize: 10.5, color: "E0F2FE", margin: 0, valign: "top" });
    sx += 2.28 + 0.13;
  });

  card(s, 7.95, 1.55, 4.85, 5.4, { fill: CARD_BG });
  s.addText("Season targeted", { x: 8.2, y: 1.75, w: 4.4, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
  s.addText("“Premier Padel 2026” (season id 5) — Riyadh P1, Gijón P2, Cancún P2, Miami P1, Newgiza P2, Brussels P2, Asunción P2, Buenos Aires P1, Italy Major, Valencia P1, Valladolid P2, Bordeaux P2, Málaga P1 played; 13 more (Madrid, Paris Major, Dubai, Barcelona Finals...) not yet played at fetch time.", {
    x: 8.2, y: 2.15, w: 4.4, h: 2.2, fontFace: BODY_FONT, fontSize: 11.3, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.15,
  });
  s.addText("This 13/13 split isn't a bug — it's the honest state of a season in progress.", {
    x: 8.2, y: 4.5, w: 4.4, h: 0.9, fontFace: BODY_FONT, italic: true, fontSize: 12, color: ACCENT_DARK, margin: 0, valign: "top",
  });
  s.addText("Source: 02_Data/fetch_padelapi.py · real/fetch_log.txt", { x: 8.2, y: 5.65, w: 4.4, h: 1.1, fontFace: BODY_FONT, fontSize: 10, italic: true, color: CAPTION, margin: 0, valign: "top" });
}

// Slide 9 — Examination: the score-format discovery
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.2–2.3 Raw archiving & examination", title: "The score-format discovery",
    notes: "I want to be honest about the one real bug I hit. My first parser assumed the API's score field was a comma-separated string, like what you'd see on a results page. It wasn't — it's actually a JSON array of set objects. I only caught that by reading the raw archived API responses during examination, not by trusting my own assumption. Because I archive every raw response before transforming anything, fixing the parser cost me one file and zero re-fetching — I just re-ran the transformation script against data already sitting on disk. That's the entire argument for keeping acquisition and transformation as separate scripts.",
  });
  const cols = [
    ["Assumed", "\"6-3, 4-6, 7-5\"", "A comma-separated display string — what the website shows", RED, RED_LIGHT],
    ["Actual", "[{\"team_1\":\"6\",\"team_2\":\"4\"}, ...]", "A JSON array of set objects — found only by reading raw archived responses", ACCENT_DARK, ACCENT_LIGHT],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.55, ch = 2.15;
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + 0.25);
    card(s, x, y0, cw, ch, { fill: c[4] });
    s.addText(c[0], { x: x + 0.25, y: y0 + 0.18, w: cw - 0.5, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: c[3], margin: 0 });
    s.addText(c[1], { x: x + 0.25, y: y0 + 0.58, w: cw - 0.5, h: 0.6, fontFace: "Courier New", fontSize: 12.5, color: INK, margin: 0 });
    s.addText(c[2], { x: x + 0.25, y: y0 + 1.28, w: cw - 0.5, h: 0.8, fontFace: BODY_FONT, fontSize: 11.5, color: MUTED, margin: 0, valign: "top" });
  });

  card(s, 0.55, 3.95, 12.25, 1.6, { fill: INK, noShadow: true });
  s.addText("def sets_from_score(score):  # build_real_csv.py", { x: 0.85, y: 4.1, w: 11.65, h: 0.3, fontFace: "Courier New", fontSize: 12, bold: true, color: ACCENT_LIGHT, margin: 0 });
  s.addText('    if isinstance(score, list):\n        for s in score: out.append(f"{s[\'team_1\']}-{s[\'team_2\']}")', {
    x: 0.85, y: 4.45, w: 11.65, h: 0.9, fontFace: "Courier New", fontSize: 12, color: "D1D5DB", margin: 0, valign: "top",
  });

  bulletsBlock(s, [
    { text: "Found during examination — reading raw *.jsonl, not trusting the assumption", bold: true },
    "Fixed in one file, zero re-fetching: build_real_csv.py re-run against the already-archived JSON",
    "hidden_free_plan values dropped, never guessed; only status ∈ {finished, ended, retired, walkover} kept (776 rows)",
  ], 0.55, 5.75, 12.25, 1.55, { fontSize: 12.8, spaceAfter: 9 });
}

// Slide 10 — Transformation
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.4 Transformation", title: "From raw JSON to clean, traceable CSVs",
    notes: "Transformation is its own script, separate from fetching and analysis. It reads only the raw archive, applies the fixed score parser, and writes two clean CSVs — never touching the network. The result: 776 match rows across the 13 tournaments that had actually been played, sorted by date, spanning Round of 64 through the finals, men's and women's draws combined, plus 2,165 player rows with current ranking points and nationality. Every row keeps a literal source string pointing back to the exact API record, so if anyone asks me to trace a single EDA number back to its origin, I can, in seconds.",
  });
  const stats = [["776", "match rows"], ["13", "tournaments played"], ["2,165", "player rows"], ["R64→F", "round coverage"]];
  const cw = 2.9, x0 = 0.55, y0 = 1.6;
  stats.forEach((st, i) => {
    const x = x0 + i * (cw + 0.17);
    card(s, x, y0, cw, 1.55, { fill: i % 2 === 0 ? ACCENT : ACCENT_DARK });
    s.addText(st[0], { x: x + 0.18, y: y0 + 0.18, w: cw - 0.36, h: 0.7, fontFace: TITLE_FONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
    s.addText(st[1], { x: x + 0.18, y: y0 + 0.92, w: cw - 0.36, h: 0.5, fontFace: BODY_FONT, fontSize: 11.5, color: "E0F2FE", margin: 0 });
  });

  card(s, 0.55, 3.4, 12.25, 3.1, { fill: CARD_BG });
  s.addText("build_real_csv.py — reads only real/raw/*.jsonl, never the network", { x: 0.85, y: 3.6, w: 11.6, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: INK, margin: 0 });
  bulletsBlock(s, [
    "Per-match fields: id, date, tournament, tier, category, both teams (names + ids), side, seeds, winner, 3 set scores, duration, status, source string",
    "Player rows from the /players directory dump, falling back to \"players seen in matches\" if the directory pull failed — logged at run time",
    "Every row keeps a source string (\"padelapi.org match <id>\") — any number in the EDA traces back to one exact API record",
  ], 0.85, 4.05, 11.6, 2.3, { fontSize: 13, spaceAfter: 11 });
}

// Slide 11 — Exploration: how we explored
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.5 Exploration — method", title: "How we explored: 10 questions, no manual numbers",
    notes: "Exploration is the fourth and final script, and it only ever reads the clean CSVs — never the raw JSON, never the network. It runs ten questions, E1 through E10, all as two-sided statistical tests at alpha 0.05, with Wilson 95% confidence intervals on every single proportion I report, not just the headline ones. The output is a reproducible report plus a JSON results file — no manual numbers anywhere. Keeping these four stages separate — acquisition, raw archiving, transformation, exploration — is what makes each step auditable, and it's exactly what let me fix that score-parsing bug earlier without re-fetching a single byte.",
  });
  const stages = ["Acquisition\n(network)", "Raw archiving\n(*.jsonl)", "Transformation\n(clean CSVs)", "Exploration\n(eda_report.md)"];
  const bw = 2.75, gap = 0.35, x0 = 0.55, y0 = 1.65;
  stages.forEach((st, i) => {
    const x = x0 + i * (bw + gap);
    card(s, x, y0, bw, 1.5, { fill: i === 3 ? ACCENT : CARD_BG });
    s.addText(st, { x: x + 0.15, y: y0 + 0.15, w: bw - 0.3, h: 1.2, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: i === 3 ? WHITE : INK, align: "center", valign: "middle", margin: 0 });
    if (i < 3) {
      s.addText("→", { x: x + bw, y: y0 + 0.45, w: gap, h: 0.6, fontFace: BODY_FONT, fontSize: 22, color: ACCENT, align: "center", valign: "middle", margin: 0 });
    }
  });

  bulletsBlock(s, [
    { text: "eda/exploration.py → eda_report.md + eda_results.json — reproducible, seeded, no manual numbers", bold: true },
    "10 questions (E1–E10), two-sided tests at α = 0.05",
    "Wilson 95% confidence intervals on every reported proportion, not just the headline ones",
    "Each stage only reads its predecessor's output — never re-touches the network or re-guesses a value",
  ], 0.55, 3.6, 12.25, 2.0, { fontSize: 14.5, spaceAfter: 13 });

  card(s, 0.55, 5.75, 12.25, 1.15, { fill: ACCENT_LIGHT, noShadow: true });
  s.addText("Why separate scripts? Because this separation is exactly what let the score-parsing bug (previous slide) get fixed with one file and zero re-fetching.", {
    x: 0.85, y: 5.95, w: 11.6, h: 0.8, fontFace: BODY_FONT, italic: true, fontSize: 13, color: ACCENT_DARK, margin: 0, valign: "middle",
  });
}

// Slide 12 — What we found overview
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.5 Exploration — results", title: "What we found: 7 findings, 3 honest nulls",
    notes: "Ten questions went into the analysis, and I want to show you all of them, not just the ones that worked. Seven came back with real, statistically significant findings: momentum, ranking calibration, pair chemistry, seed upsets, scheduling efficiency, scoreline patterns, and what Elo sees that the ranking doesn't. Three came back null or insufficient — handedness, height, and overall home advantage — and I kept those in the report instead of quietly dropping them. A project that only shows you the findings that worked isn't doing exploratory analysis, it's doing marketing. I'll go deeper on three of the headline findings in the visual encoding section.",
  });
  const found = [
    ["E1 Momentum", "86.2% → 49.3% once a match reaches a decider"],
    ["E2 Calibration", "Favorite wins 78.5% (AUC 0.883)"],
    ["E3 Chemistry", "39.8% → 68.2% win rate by reps together"],
    ["E4 Upsets", "22.4% of seeded matches are upsets"],
    ["E7/E8 Efficiency", "Fewer games last round → 59.7% next-match win"],
    ["Elo vs ranking", "Elo flags players the official points underrate"],
    ["E10 Scoreline", "6-3 most common set; 10.6% include a 6-0 set"],
  ];
  let fy = 1.55;
  const colW = 5.95;
  found.slice(0, 4).forEach((f) => {
    card(s, 0.55, fy, colW, 0.85, { fill: CARD_BG });
    s.addText(f[0], { x: 0.75, y: fy + 0.08, w: colW - 0.4, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: ACCENT_DARK, margin: 0 });
    s.addText(f[1], { x: 0.75, y: fy + 0.4, w: colW - 0.4, h: 0.4, fontFace: BODY_FONT, fontSize: 11.5, color: INK, margin: 0 });
    fy += 0.95;
  });
  fy = 1.55;
  found.slice(4).forEach((f) => {
    card(s, 6.75, fy, colW, 0.85, { fill: CARD_BG });
    s.addText(f[0], { x: 6.95, y: fy + 0.08, w: colW - 0.4, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: ACCENT_DARK, margin: 0 });
    s.addText(f[1], { x: 6.95, y: fy + 0.4, w: colW - 0.4, h: 0.4, fontFace: BODY_FONT, fontSize: 11.5, color: INK, margin: 0 });
    fy += 0.95;
  });
  card(s, 6.75, fy, colW, 1.15, { fill: "EDEFF2" });
  s.addText("3 honest nulls, reported anyway", { x: 6.95, y: fy + 0.08, w: colW - 0.4, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText("E5 handedness (6.4% coverage) · E6 height (33.8% coverage) · E9 home advantage overall (p=0.18)", { x: 6.95, y: fy + 0.4, w: colW - 0.4, h: 0.65, fontFace: BODY_FONT, italic: true, fontSize: 11, color: MUTED, margin: 0, valign: "top" });

  s.addText("A project that only shows the findings that worked isn't exploratory analysis — it's marketing.", {
    x: 0.55, y: 6.55, w: 12.25, h: 0.5, fontFace: BODY_FONT, italic: true, fontSize: 13, color: ACCENT_DARK, margin: 0,
  });
}

// Slide 13 — Data limitations
{
  const s = sectionSlide({
    sectionNum: 2, sectionName: "Working with Data",
    kicker: "§2.6 Limitations", title: "What the data honestly can't tell us",
    notes: "Three honest limitations I want on the record. First, this is a single-season snapshot — Premier Padel 2026 — with 13 of 26 tournaments still unplayed at fetch time, so there's no multi-year comparison possible. Second, the ranking-calibration finding uses each player's current points, not their points on the actual match date, because the free API tier has no historical point-in-time endpoint — so I treat that 78.5% and 0.88 AUC as an optimistic upper bound, not a clean prospective test. Third, court type just isn't exposed on this API tier, so indoor-versus-outdoor analysis, which existed in the synthetic first submission, can't be reproduced honestly with real data.",
  });
  const lims = [
    ["Single-season snapshot", "Free-tier window = 2026 season only. 13 of 26 tournaments hadn't been played at fetch time — a season in progress, not a completed year."],
    ["Ranking look-ahead bias (E2)", "Points are today's snapshot, not each player's points on the match date. The 78.5% favorite-win-rate and 0.883 AUC are an optimistic upper bound, not a clean prospective test — this caveat carries into the §4 calibration case study."],
    ["court_type unavailable", "The column exists in the schema but is empty on this API tier — indoor/outdoor surface analysis (present in the synthetic v1 data) is dropped, not backfilled with a guess."],
  ];
  let ly = 1.6;
  lims.forEach((l) => {
    card(s, 0.55, ly, 12.25, 1.65, { fill: CARD_BG });
    s.addShape(pres.ShapeType.ellipse, { x: 0.8, y: ly + 0.22, w: 0.3, h: 0.3, fill: { color: MUTED }, line: { type: "none" } });
    s.addText("!", { x: 0.8, y: ly + 0.22, w: 0.3, h: 0.3, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 13, color: WHITE, margin: 0 });
    s.addText(l[0], { x: 1.3, y: ly + 0.15, w: 11.3, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: INK, margin: 0 });
    s.addText(l[1], { x: 1.3, y: ly + 0.55, w: 11.3, h: 1.0, fontFace: BODY_FONT, fontSize: 12, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.12 });
    ly += 1.78;
  });
}

console.log("part2 loaded, slide num=" + getSlideNum());
module.exports = M;
