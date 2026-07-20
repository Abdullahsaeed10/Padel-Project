const M = require("./part4.js");
const {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS, getSlideNum,
} = M;

// =====================================================================
// SECTION 5 — TECHNICAL IMPLEMENTATION (slides 25-27)
// =====================================================================

// Slide 25 — Stack & architecture
{
  const s = sectionSlide({
    sectionNum: 5, sectionName: "Technical Implementation",
    kicker: "§5.1 Stack & architecture", title: "From raw JSON to a Streamlit app, in one straight line",
    notes: "The pipeline is a straight line: raw JSON archived on disk, transformed into two CSVs by build_real_csv.py, migrated into a SQLite database by build_db.py, read by an analytics module, and rendered across six Streamlit pages — Dashboard, Pro Tour, My Stats, Log a Match, Compare, and the new Insights page. The stack is deliberately boring on purpose: Python, Streamlit for the multi-page framework and caching, Pandas for the data wrangling, Plotly for interactive charts, scikit-learn for the logistic regression and clustering, and plain sqlite3 with no ORM. Boring means I spend my time on the data logic, not on frontend plumbing.",
  });
  const stages = ["Raw JSON\n(real/raw/*.jsonl)", "build_real_csv.py\n→ 2 CSVs", "build_db.py\n→ padellens.db", "analytics.py\n(Elo, model, CI)", "Streamlit\n6 pages"];
  const bw = 2.25, gap = 0.24, x0 = 0.55, y0 = 1.65;
  stages.forEach((st, i) => {
    const x = x0 + i * (bw + gap);
    card(s, x, y0, bw, 1.55, { fill: i === 4 ? ACCENT : CARD_BG });
    s.addText(st, { x: x + 0.12, y: y0 + 0.15, w: bw - 0.24, h: 1.25, fontFace: BODY_FONT, bold: true, fontSize: 11.5, color: i === 4 ? WHITE : INK, align: "center", valign: "middle", margin: 0 });
    if (i < 4) s.addText("→", { x: x + bw, y: y0 + 0.45, w: gap, h: 0.6, fontFace: BODY_FONT, fontSize: 18, color: ACCENT, align: "center", valign: "middle", margin: 0 });
  });

  card(s, 0.55, 3.55, 12.25, 3.35, { fill: CARD_BG });
  s.addText("Tech stack — deliberately boring", { x: 0.85, y: 3.75, w: 11.6, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: INK, margin: 0 });
  const stack = [
    ["Streamlit ≥1.32", "Multi-page framework, sidebar, forms, caching"],
    ["Pandas ≥2.0", "Data wrangling, groupby, rolling windows"],
    ["Plotly ≥5.18", "Interactive line, bar, box, radar charts"],
    ["scikit-learn ≥1.3", "Logistic win model, k-means archetypes"],
    ["SciPy ≥1.11", "Statistical tests, Wilson intervals"],
    ["sqlite3 (stdlib)", "db.py persistence, no ORM"],
  ];
  const cw2 = 3.95, x02 = 0.85, y02 = 4.25;
  stack.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x02 + col * (cw2 + 0.1), y = y02 + row * 1.15;
    s.addText(t[0], { x, y, w: cw2, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: ACCENT_DARK, margin: 0 });
    s.addText(t[1], { x, y: y + 0.35, w: cw2, h: 0.6, fontFace: BODY_FONT, fontSize: 11, color: MUTED, margin: 0, valign: "top" });
  });
}

// Slide 26 — Analytics module
{
  const s = sectionSlide({
    sectionNum: 5, sectionName: "Technical Implementation",
    kicker: "§5.2 Analytics module", title: "analytics.py — Elo, win model, clustering, CIs",
    notes: "analytics.py is pure pandas and scikit-learn, no Streamlit dependency, so it's testable on its own. compute_elo runs a chronological Elo rating with K=32 starting from a base of 1500 across all 776 real matches. fit_win_model is a logistic regression on the log ranking-points ratio, reaching an AUC of 0.883, with a full decile calibration table. momentum_table and pair_chemistry both wrap Wilson 95% confidence intervals around every proportion they compute, so no win rate ever gets reported as a bare, uncertain-looking percentage. There's also a k-means clustering routine for player archetypes. All four feed directly into the Insights page's discovery cards.",
  });
  const fns = [
    ["compute_elo(K=32, base=1500)", "Chronological Elo rating over all 776 real matches", "Powers the \"what Elo sees that the ranking doesn't\" discovery card"],
    ["fit_win_model(...)", "Logistic regression on log(points ratio); AUC = 0.883", "Powers the calibration lollipop and decile calibration table"],
    ["momentum_table(...)", "P(win | won set 1) with Wilson 95% CI, overall + by tier", "Powers the momentum slope chart"],
    ["pair_chemistry(...)", "Win rate by matches-together bucket, chi-square test", "Powers the chemistry line + survivorship wedge"],
    ["k-means player clustering", "Player archetypes from match-derived features", "Supporting analysis for the Insights page"],
  ];
  let fy = 1.55;
  fns.forEach((f) => {
    card(s, 0.55, fy, 12.25, 1.0, { fill: CARD_BG });
    s.addText(f[0], { x: 0.8, y: fy + 0.12, w: 4.4, h: 0.35, fontFace: "Courier New", bold: true, fontSize: 12, color: ACCENT_DARK, margin: 0 });
    s.addText(f[1], { x: 5.35, y: fy + 0.12, w: 4.0, h: 0.75, fontFace: BODY_FONT, fontSize: 11, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
    s.addText(f[2], { x: 9.5, y: fy + 0.12, w: 3.1, h: 0.75, fontFace: BODY_FONT, italic: true, fontSize: 10, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
    fy += 1.1;
  });
  s.addText("Pure pandas / scikit-learn / SciPy — zero Streamlit dependency, so the whole module is testable standalone.", {
    x: 0.55, y: fy + 0.05, w: 12.25, h: 0.4, fontFace: BODY_FONT, italic: true, fontSize: 12, color: CAPTION, margin: 0,
  });
}

// Slide 27 — Multi-user readiness & deployment
{
  const s = sectionSlide({
    sectionNum: 5, sectionName: "Technical Implementation",
    kicker: "§5.3 Multi-user & deployment", title: "Multi-user-ready today, cloud-ready next",
    notes: "The database schema is already multi-user ready: my_matches carries a user_id column, and there's a users table seeded with a demo user. db.py reads SQLite when it exists and falls back transparently to the CSVs when it doesn't, so the app never hard-fails on a fresh checkout. What's honestly still missing is a login layer — right now the app always operates as user one, locally, with no cloud sync. My deployment plan is to add a simple authentication layer, host on Streamlit Community Cloud, and migrate from local SQLite to a hosted Postgres instance once there's more than one concurrent writer.",
  });
  const cols = [
    ["Already there", [
      "my_matches carries a user_id column — multi-user-ready schema",
      "users table seeded with a Demo User",
      "db.py falls back to CSVs transparently if padellens.db isn't built yet",
      "source column on pro_matches distinguishes 'real' vs 'demo' data",
    ], ACCENT_LIGHT, ACCENT_DARK],
    ["Honestly still missing", [
      "No login layer — the app always operates as user_id=1",
      "Local SQLite file, no cloud sync",
      "No concurrent-write handling for more than one player",
    ], "F3F4F6", MUTED],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.55, ch = 2.9;
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + 0.25);
    card(s, x, y0, cw, ch, { fill: c[2] });
    s.addText(c[0], { x: x + 0.25, y: y0 + 0.2, w: cw - 0.5, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: c[3], margin: 0 });
    bulletsBlock(s, c[1], x + 0.25, y0 + 0.75, cw - 0.5, ch - 0.95, { fontSize: 12, spaceAfter: 10 });
  });
  card(s, 0.55, 4.65, 12.25, 2.25, { fill: INK, noShadow: true });
  s.addText("Deployment plan", { x: 0.85, y: 4.85, w: 11.6, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: ACCENT_LIGHT, margin: 0 });
  bulletsBlock(s, [
    { text: "Add a simple authentication layer (Streamlit login component) so user_id stops being hardcoded to 1", color: "E5E7EB" },
    { text: "Host on Streamlit Community Cloud for a shareable public demo link", color: "E5E7EB" },
    { text: "Migrate local SQLite → a hosted Postgres instance once there's more than one concurrent writer", color: "E5E7EB" },
  ], 0.85, 5.25, 11.6, 1.55, { fontSize: 12.5, spaceAfter: 9 });
}

console.log("part5 loaded, slide num=" + getSlideNum());
module.exports = M;
