const pptxgen = require("pptxgenjs");

const ASSETS = "/sessions/lucid-funny-davinci/mnt/Padel-Project/06_Presentation/assets";

const INK = "1F2937";
const MUTED = "6B7280";
const CAPTION = "9AA3AD";
const ACCENT = "0EA5E9";
const ACCENT_LIGHT = "BAE6FD";
const ACCENT_DARK = "0369A1";
const RED = "EF4444";
const RED_LIGHT = "FECACA";
const BORDER = "CFD6DD";
const CARD_BG = "F6F8FA";
const WHITE = "FFFFFF";
const GRAY_WEDGE = "D9DEE3";

const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

const TOTAL = 32;
let SLIDE_NUM = 0;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Abdullah Saeed Aly Elhusseiny";
pres.title = "PadelLens — DV4S 2025/26";

function newSlide() {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  SLIDE_NUM += 1;
  return s;
}

function footer(slide, sectionNum, sectionName) {
  const label = sectionNum === null
    ? `PadelLens — DV4S 2025/26 — ${sectionName} — slide ${SLIDE_NUM}/${TOTAL}`
    : `PadelLens — DV4S 2025/26 — §${sectionNum} ${sectionName} — slide ${SLIDE_NUM}/${TOTAL}`;
  slide.addText(label, {
    x: 0.5, y: 7.16, w: 12.33, h: 0.28,
    fontFace: BODY_FONT, fontSize: 9, color: CAPTION,
    align: "left", margin: 0,
  });
}

function badge(slide, txt) {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 12.45, y: 0.42, w: 0.5, h: 0.5,
    fill: { color: ACCENT }, line: { type: "none" },
  });
  slide.addText(txt, {
    x: 12.45, y: 0.42, w: 0.5, h: 0.5,
    fontFace: TITLE_FONT, bold: true, fontSize: 16, color: WHITE,
    align: "center", valign: "middle", margin: 0,
  });
}

function titleBlock(slide, kicker, title, opts) {
  opts = opts || {};
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.55, y: 0.34, w: 11.5, h: 0.3,
      fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: ACCENT,
      charSpacing: 1, align: "left", margin: 0,
    });
  }
  slide.addText(title, {
    x: 0.55, y: kicker ? 0.62 : 0.42, w: 11.6, h: opts.titleH || 0.72,
    fontFace: TITLE_FONT, bold: true, fontSize: opts.titleSize || 30, color: INK,
    align: "left", margin: 0, valign: "top",
  });
}

function card(slide, x, y, w, h, opts) {
  opts = opts || {};
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || CARD_BG },
    line: { color: opts.line || BORDER, width: 1 },
    shadow: opts.noShadow ? undefined : {
      type: "outer", color: "9AA3AD", opacity: 0.18, blur: 6, offset: 2, angle: 90,
    },
  });
}

function bulletsBlock(slide, items, x, y, w, h, opts) {
  opts = opts || {};
  const paras = items.map((it, i) => {
    if (typeof it === "string") {
      return {
        text: it,
        options: {
          bullet: { code: "25AA", indent: 18 },
          color: INK, fontFace: BODY_FONT, fontSize: opts.fontSize || 14.5,
          breakLine: i !== items.length - 1, paraSpaceAfter: opts.spaceAfter || 12,
        },
      };
    }
    return {
      text: it.text,
      options: {
        bullet: it.noBullet ? false : { code: "25AA", indent: 18 },
        color: it.color || INK, fontFace: BODY_FONT,
        fontSize: it.fontSize || opts.fontSize || 14.5,
        bold: !!it.bold,
        breakLine: i !== items.length - 1, paraSpaceAfter: opts.spaceAfter || 12,
      },
    };
  });
  slide.addText(paras, { x, y, w, h, valign: "top", margin: 0, lineSpacingMultiple: 1.08 });
}

function sectionSlide(spec) {
  const s = newSlide();
  if (spec.sectionNum !== null) badge(s, String(spec.sectionNum));
  titleBlock(s, spec.kicker, spec.title, spec.titleOpts);
  footer(s, spec.sectionNum, spec.sectionName);
  s.addNotes(spec.notes);
  return s;
}

function tag(slide, x, y, text, opts) {
  opts = opts || {};
  const w = opts.w || 1.9;
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h: 0.32, rectRadius: 0.16,
    fill: { color: opts.fill || ACCENT_LIGHT }, line: { type: "none" },
  });
  slide.addText(text, {
    x, y, w, h: 0.32, fontFace: BODY_FONT, bold: true,
    fontSize: 10.5, color: opts.color || ACCENT_DARK, align: "center", valign: "middle", margin: 0,
  });
}

// SLIDE 1 — TITLE
{
  const s = newSlide();
  s.background = { color: INK };
  s.addShape(pres.ShapeType.ellipse, { x: 10.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: ACCENT_DARK }, line: { type: "none" } });
  s.addShape(pres.ShapeType.ellipse, { x: -1.8, y: 5.2, w: 4.4, h: 4.4, fill: { color: "111827" }, line: { type: "none" } });
  s.addText("DATA VISUALIZATION FOR SPORT · POLITECNICO DI MILANO · AY 2025/2026", {
    x: 0.7, y: 1.55, w: 11.9, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 13, color: ACCENT_LIGHT, charSpacing: 2,
  });
  s.addText("PadelLens", { x: 0.65, y: 2.05, w: 11.9, h: 1.5, fontFace: TITLE_FONT, bold: true, fontSize: 64, color: WHITE });
  s.addText("Pro Tour Insights + My Match Log", { x: 0.7, y: 3.5, w: 11.5, h: 0.6, fontFace: BODY_FONT, fontSize: 22, color: ACCENT_LIGHT });
  s.addShape(pres.ShapeType.line, { x: 0.72, y: 4.35, w: 3.0, h: 0, line: { color: ACCENT, width: 2 } });
  s.addText([{ text: "“You don’t have to feel your game — you can see it.”", options: { italic: true, fontSize: 16, color: "D1D5DB", breakLine: true, paraSpaceAfter: 4 } }],
    { x: 0.72, y: 4.55, w: 8.5, h: 0.5, fontFace: BODY_FONT, margin: 0 });
  s.addText("Abdullah Saeed Aly Elhusseiny", { x: 0.72, y: 6.35, w: 6, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 16, color: WHITE });
  s.addText("Student presentation — resit submission", { x: 0.72, y: 6.75, w: 6, h: 0.35, fontFace: BODY_FONT, fontSize: 12.5, color: MUTED });
  s.addText(`PadelLens — DV4S 2025/26 — Title — slide ${SLIDE_NUM}/${TOTAL}`, { x: 0.7, y: 7.16, w: 11.9, h: 0.28, fontFace: BODY_FONT, fontSize: 9, color: "6B7280", margin: 0 });
  s.addNotes("Good afternoon, I'm Abdullah Saeed Aly Elhusseiny, and this is PadelLens — Pro Tour Insights plus My Match Log, my project for Data Visualization for Sport here at Politecnico di Milano. This is the resit submission, and the short version of what changed is: everything downstream of the brief is now built on real data instead of a placeholder demo, with genuine analytics and an honest validation plan behind it. I'll walk through the brief, the data pipeline, the UX work, the chart design, the technical build, and finish with a live-style demo script and the honest limitations. Let's start with what actually changed since the first hand-in.");
}

// SLIDE 2 — What changed
{
  const s = sectionSlide({
    sectionNum: null, sectionName: "Front Matter",
    kicker: "Resit submission", title: "What changed since the first submission",
    notes: "Before diving in, I want to be upfront about what's different this time. The old deck used a thin synthetic dataset — now it's 776 real matches from the 2026 Premier Padel season. I ran a genuine exploratory analysis with ten questions, seven of which produced real findings and three of which honestly came back null or insufficient — I kept those in rather than hiding them. I added an analytics layer: Elo ratings, a logistic win model, k-means clustering, Wilson confidence intervals. The app now runs on SQLite and is multi-user ready, with a new Insights page. And I built a full validation instrument pack, with sessions scheduled against real club players.",
  });
  const items = [
    ["Real data", "776-match, 2,165-player 2026 season dataset from padelapi.org replaces the thin synthetic demo CSV."],
    ["Genuine exploration", "10 EDA questions, 7 real findings, and one honest null — kept in, not hidden."],
    ["Analytics layer", "Elo ratings, a logistic win model, k-means player clustering, Wilson 95% CIs on every proportion."],
    ["Multi-user app", "SQLite persistence (was raw CSV reads) plus a new Insights page surfacing the 7 findings live."],
    ["Validation instruments", "Persona survey, interview guide, SUS, testing protocol, heuristic round 2 — sessions scheduled with real club players."],
    ["Immaculate deliverable", "Zero placeholder text, consistent §1–§6 numbering throughout this deck."],
  ];
  const colW = 5.85, gx = 0.25, x0 = 0.55, y0 = 1.55, rowH = 1.72, gy = 0.15;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (colW + gx), y = y0 + row * (rowH + gy);
    card(s, x, y, colW, rowH);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.22, y: y + 0.22, w: 0.36, h: 0.36, fill: { color: ACCENT }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.22, y: y + 0.22, w: 0.36, h: 0.36, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 13, color: WHITE, margin: 0 });
    s.addText(it[0], { x: x + 0.7, y: y + 0.16, w: colW - 0.9, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: INK, margin: 0 });
    s.addText(it[1], { x: x + 0.22, y: y + 0.62, w: colW - 0.45, h: rowH - 0.75, fontFace: BODY_FONT, fontSize: 11.5, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
  });
}

// SECTION 1 — THE BRIEF (slides 3-7)

// Slide 3
{
  const s = sectionSlide({
    sectionNum: 1, sectionName: "The Brief",
    kicker: "§1.1 Sport domain & context", title: "Why padel?",
    notes: "I picked padel because the growth curve in Italy is extraordinary — from around thirty thousand federated players in 2019 to over 1.1 million by 2024. But look at the tooling landscape and there's a real gap: pro-tour products like Premier Padel rankings or Worldpadeltour stats are irrelevant to a recreational player, and generic fitness trackers like Strava don't understand padel-specific dynamics — sets, the glass wall, rotating partners. Amateurs are playing one to four matches a week with almost no tool built for them. As a Sports Engineering student, that gap felt like exactly the right size to attack in one semester.",
  });
  card(s, 0.55, 1.55, 4.0, 4.9, { fill: ACCENT });
  s.addText("1.1M+", { x: 0.75, y: 1.85, w: 3.6, h: 1.0, fontFace: TITLE_FONT, bold: true, fontSize: 46, color: WHITE, margin: 0 });
  s.addText("federated players in Italy, 2024 — up from ~30,000 in 2019 (FIP data)", { x: 0.75, y: 2.85, w: 3.6, h: 1.1, fontFace: BODY_FONT, fontSize: 13, color: "E0F2FE", margin: 0, valign: "top" });
  s.addText("Most are amateurs: 1–4 matches a week, rotating partners, indoor or outdoor club courts.", { x: 0.75, y: 4.55, w: 3.6, h: 1.6, fontFace: BODY_FONT, italic: true, fontSize: 13, color: "E0F2FE", margin: 0, valign: "top" });
  s.addText("The tooling gap", { x: 4.85, y: 1.55, w: 7.9, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 16, color: INK, margin: 0 });
  const rows = [
    ["Pro-tour analytics", "Premier Padel rankings, Worldpadeltour stats", "Irrelevant to a recreational player"],
    ["Generic fitness trackers", "Strava, Apple Fitness", "Don't understand sets, the glass wall, partner pairings"],
    ["Amateur player", "Almost nothing built for them", "The gap this project targets"],
  ];
  let ry = 2.1;
  rows.forEach((r, i) => {
    const rh = 1.35;
    card(s, 4.85, ry, 7.9, rh, { fill: i === 2 ? ACCENT_LIGHT : CARD_BG });
    s.addText(r[0], { x: 5.1, y: ry + 0.12, w: 7.4, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
    s.addText(r[1], { x: 5.1, y: ry + 0.48, w: 7.4, h: 0.32, fontFace: BODY_FONT, italic: true, fontSize: 12, color: MUTED, margin: 0 });
    s.addText(r[2], { x: 5.1, y: ry + 0.84, w: 7.4, h: 0.4, fontFace: BODY_FONT, fontSize: 12.5, color: i === 2 ? ACCENT_DARK : INK, bold: i === 2, margin: 0 });
    ry += rh + 0.15;
  });
}

// Slide 4
{
  const s = sectionSlide({
    sectionNum: 1, sectionName: "The Brief",
    kicker: "§1.2 Problem statement", title: "The problem",
    notes: "The problem in one sentence: amateur padel players want to see patterns in their own game that they can't feel during a match, but no simple tool exists that turns a player's own match log into honest visual feedback. Amateurs feel things — 'I always lose the third set,' 'I play better with this partner' — but they can't confirm any of it. My project takes those gut feelings and turns them into a number on a screen. The product is a Streamlit web app that lets a player keep a match journal and get immediate, clear visual answers to the questions they already ask themselves after every match.",
  });
  card(s, 0.55, 1.6, 12.25, 2.0, { fill: INK, noShadow: true });
  s.addText("“Amateur padel players want to see patterns in their own game that they can’t feel during a match — but no simple tool exists that takes a player’s own match log and turns it into actionable, honest visual feedback.”", {
    x: 0.95, y: 1.8, w: 11.45, h: 1.6, fontFace: TITLE_FONT, italic: true, fontSize: 20, color: WHITE, valign: "middle", margin: 0,
  });
  const cols = [
    ["What Marco feels", "“I always lose the third set.”\n“I play better with this partner.”", RED, RED_LIGHT],
    ["What he can confirm today", "Nothing — no tool exists to check either gut feeling.", MUTED, CARD_BG],
    ["What PadelLens gives him", "A Streamlit web app: log a match, get clear, immediate visual answers.", ACCENT_DARK, ACCENT_LIGHT],
  ];
  const cw = 3.95, gx = 0.2, x0 = 0.55, y0 = 3.9, ch = 2.55;
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + gx);
    card(s, x, y0, cw, ch, { fill: c[3] });
    s.addText(c[0], { x: x + 0.25, y: y0 + 0.22, w: cw - 0.5, h: 0.6, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: c[2], margin: 0 });
    s.addText(c[1], { x: x + 0.25, y: y0 + 0.9, w: cw - 0.5, h: ch - 1.1, fontFace: BODY_FONT, fontSize: 13, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
  });
}

// Slide 5
{
  const s = sectionSlide({
    sectionNum: 1, sectionName: "The Brief",
    kicker: "§1.3 Target audience", title: "Who it's for — Marco and Luca",
    notes: "My target user is Marco — a club player, 22 to 40, plays a couple of times a week, willing to spend 90 seconds logging a match on his phone. Not a coach, not a pro. Luca is my secondary persona, an amateur coach who wants a 30-second visual summary before a lesson. Here's the honest update from the resit: these personas were originally drawn from my own assumptions, which the first evaluation correctly flagged. I've since built a persona validation survey and a semi-structured interview guide, mapped question-by-question to every trait, and sessions with real club players are scheduled to ground them in actual evidence, not just my intuition.",
  });
  const personas = [
    ["Marco", "the club player (primary)", ["22–40 years old, plays 1–3× a week", "Playing 6 months to 5 years", "Texts the group chat after a match; will spend ~90s logging", "Wants to improve, not a pro, no personal coach"]],
    ["Luca", "the amateur coach (secondary)", ["Gives weekly 1-hour lessons to club players", "Wants a 30-second visual summary before a session", "Cares about shot-type balance, error trends, partner effects"]],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.55, ch = 3.2;
  personas.forEach((p, i) => {
    const x = x0 + i * (cw + 0.25);
    card(s, x, y0, cw, ch);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: y0 + 0.3, w: 0.7, h: 0.7, fill: { color: i === 0 ? ACCENT : ACCENT_DARK }, line: { type: "none" } });
    s.addText(p[0][0], { x: x + 0.3, y: y0 + 0.3, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: TITLE_FONT, bold: true, fontSize: 24, color: WHITE, margin: 0 });
    s.addText(p[0], { x: x + 1.15, y: y0 + 0.32, w: cw - 1.4, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 18, color: INK, margin: 0 });
    s.addText(p[1], { x: x + 1.15, y: y0 + 0.68, w: cw - 1.4, h: 0.35, fontFace: BODY_FONT, italic: true, fontSize: 12.5, color: MUTED, margin: 0 });
    bulletsBlock(s, p[2], x + 0.3, y0 + 1.25, cw - 0.6, ch - 1.4, { fontSize: 12.5, spaceAfter: 8 });
  });
  card(s, 0.55, 4.95, 12.25, 1.8, { fill: ACCENT_LIGHT, noShadow: true });
  s.addText("Grounded, not assumed", { x: 0.85, y: 5.1, w: 11.6, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14, color: ACCENT_DARK, margin: 0 });
  s.addText("The first evaluation flagged these personas as drawn without a stated foundation. Response: a persona validation survey and a semi-structured interview guide (07_Validation/01, 02) map every attribute above — age, frequency, willingness to log, coach priorities — to a specific survey question. Sessions with 3–5 real club players are scheduled; the mapping table is ready to record Confirmed / Partially confirmed / Contradicted per attribute.", {
    x: 0.85, y: 5.5, w: 11.6, h: 1.15, fontFace: BODY_FONT, fontSize: 12.5, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.1,
  });
}

// Slide 6
{
  const s = sectionSlide({
    sectionNum: 1, sectionName: "The Brief",
    kicker: "§1.5 Editorial thinking (Kirk)", title: "Angle, framing, focus",
    notes: "Following Kirk's framework, my angle is reflective self-analysis over time — temporal, categorical, comparative — deliberately not ball-tracking heatmaps, because I don't have that sensor data and Marco wouldn't read them anyway. Framing keeps only what an amateur can log in ninety seconds: your own matches, per-set shot tallies, partner and opponent names. It excludes ball trajectories, biometrics, and pro comparisons. And focus is the one number Marco actually wants when he opens the app — his last-ten-match win rate — plus one auto-generated plain-language insight, like 'you win 73% with Luca versus 41% with others.' Everything else is de-emphasized but still reachable.",
  });
  const cols = [
    ["Angle", "Reflective self-analysis over time.", ["Temporal — trends across matches", "Categorical — partner, shot, surface", "Comparative — this period vs previous", "Excludes: ball-trajectory heatmaps (no sensor data)"]],
    ["Framing", "What's inside vs outside the frame.", ["Inside: own matches, per-set shot tallies, partner/opponent, score", "Outside: trajectory data, biometrics, pro comparisons, opponent scouting"]],
    ["Focus", "What we make impossible to ignore.", ["Last-10-match win rate — above the fold", "Net shot balance (winners − errors)", "One plain-language insight, auto-generated"]],
  ];
  const cw = 3.95, x0 = 0.55, y0 = 1.55, ch = 5.15;
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + 0.2);
    card(s, x, y0, cw, ch);
    tag(s, x + 0.25, y0 + 0.25, c[0], { w: 1.6 });
    s.addText(c[1], { x: x + 0.25, y: y0 + 0.72, w: cw - 0.5, h: 0.55, fontFace: BODY_FONT, italic: true, fontSize: 12, color: MUTED, margin: 0 });
    bulletsBlock(s, c[2], x + 0.25, y0 + 1.35, cw - 0.5, ch - 1.55, { fontSize: 11.8, spaceAfter: 10 });
  });
}

// Slide 7
{
  const s = sectionSlide({
    sectionNum: 1, sectionName: "The Brief",
    kicker: "§1.6–1.7 Relevance & core message", title: "Why it matters, and the one line that guides it",
    notes: "Rating the project on Kirk's four relevance factors: timeliness and interestingness and pertinence all score a 3 — the user opens this right after or right before a match, it confirms or contradicts a gut feeling, and it's literally about them. Sufficiency scores a 2 on purpose — I deliberately don't go deeper than the amateur needs, no shot-by-shot rally tagging in version one. And the whole project collapses into one line I keep coming back to: you don't have to feel your game, you can see it. Every chart I'll show you later exists because it helps Marco see something he couldn't feel.",
  });
  const facts = [
    ["Timeliness", 3, "Opened right after or right before a match — actionable now."],
    ["Interestingness", 3, "Confirms or contradicts a gut feeling — both outcomes are interesting."],
    ["Pertinence", 3, "The user's own data about themselves — maximum personal connection."],
    ["Sufficiency", 2, "Deliberate trade-off — enough to decide, not padded to look complete."],
  ];
  let fx = 0.55;
  const fw = 2.95;
  facts.forEach((f) => {
    card(s, fx, 1.55, fw, 2.55);
    s.addText(f[0], { x: fx + 0.2, y: 1.7, w: fw - 0.4, h: 0.4, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
    s.addText("●".repeat(f[1]), { x: fx + 0.2, y: 2.1, w: fw - 0.4, h: 0.4, fontFace: BODY_FONT, fontSize: 18, color: ACCENT, margin: 0 });
    s.addText(f[2], { x: fx + 0.2, y: 2.6, w: fw - 0.4, h: 1.4, fontFace: BODY_FONT, fontSize: 11.3, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
    fx += fw + 0.16;
  });
  card(s, 0.55, 4.35, 12.25, 2.35, { fill: INK, noShadow: true });
  s.addText("Core message", { x: 0.95, y: 4.55, w: 11.4, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 13, color: ACCENT_LIGHT, margin: 0 });
  s.addText("“You don’t have to feel your game — you can see it.”", { x: 0.95, y: 4.95, w: 11.4, h: 0.9, fontFace: TITLE_FONT, bold: true, italic: true, fontSize: 30, color: WHITE, margin: 0 });
  s.addText("If a chart doesn't help the user see something they couldn't feel, it doesn't go in the app.", { x: 0.95, y: 5.95, w: 11.4, h: 0.6, fontFace: BODY_FONT, fontSize: 13.5, color: "D1D5DB", margin: 0 });
}

console.log("part1 loaded, slide num=" + SLIDE_NUM);

module.exports = {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS,
  getSlideNum: () => SLIDE_NUM, setSlideNum: (n) => { SLIDE_NUM = n; },
};
