// PadelLens - exam presentation deck builder.
// Run:  node build_deck.js
//
// Produces PadelLens_Deck.pptx in this folder. Speaker notes on every slide.

const path = require("path");
const pptxgen = require(path.join("/tmp/node_modules", "pptxgenjs"));

const ASSETS = path.join(__dirname, "assets");

// ---- Palette (matches the app's visual encoding doc) ----
const C = {
  navy: "1E293B",     // primary dark
  navy2: "0F172A",    // deeper, for dividers
  ink: "1F2937",      // body
  muted: "64748B",    // captions
  border: "CFD6DD",
  card: "FFFFFF",
  bg: "F8FAFC",
  sky: "0EA5E9",      // accent (positive / interactive)
  skyDark: "0369A1",
  red: "EF4444",      // negative signal
  redLight: "FEE2E2",
  amber: "F59E0B",
  amberLight: "FEF3C7",
  green: "10B981",
  greenLight: "D1FAE5",
};

const HEADER = "Calibri";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";   // 10" x 5.625"
pres.author = "Sensei";
pres.title = "PadelLens - DV4S Exam Presentation";

// ----------------------------------------------------------------------------
// Shared helpers
// ----------------------------------------------------------------------------

function addSlideHeader(slide, sectionLabel, title) {
  // Accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 0.42, w: 0.07, h: 0.32, fill: { color: C.sky }, line: { type: "none" }
  });
  slide.addText(sectionLabel, {
    x: 0.56, y: 0.38, w: 6, h: 0.28,
    fontSize: 10, fontFace: HEADER, color: C.muted,
    bold: true, charSpacing: 4, margin: 0,
  });
  slide.addText(title, {
    x: 0.56, y: 0.6, w: 9, h: 0.6,
    fontSize: 26, fontFace: HEADER, color: C.navy, bold: true, margin: 0,
  });
}

function addFooter(slide, pageNum) {
  slide.addText("PadelLens · DV4S Exam · Politecnico Milano · AY 2025/2026", {
    x: 0.4, y: 5.3, w: 8, h: 0.25,
    fontSize: 9, fontFace: BODY, color: C.muted, margin: 0,
  });
  slide.addText(pageNum + "", {
    x: 9.3, y: 5.3, w: 0.4, h: 0.25,
    fontSize: 9, fontFace: BODY, color: C.muted, align: "right", margin: 0,
  });
}

function bg(slide, color = C.bg) {
  slide.background = { color };
}

function caption(slide, x, y, w, text) {
  slide.addText(text, {
    x, y, w, h: 0.3, fontSize: 10, italic: true,
    color: "9AA3AD", fontFace: BODY, margin: 0,
  });
}

function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.75 },
  });
}

// ----------------------------------------------------------------------------
// 1) COVER
// ----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  bg(s, C.navy);
  // Decorative accent line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 0.6, h: 0.06, fill: { color: C.sky }, line: { type: "none" },
  });
  s.addText("PADELLENS", {
    x: 0.5, y: 1.75, w: 9, h: 1.1,
    fontSize: 60, fontFace: HEADER, color: "FFFFFF", bold: true,
    charSpacing: 2, margin: 0,
  });
  s.addText("Pro Tour Insights + My Match Log", {
    x: 0.5, y: 2.85, w: 9, h: 0.4,
    fontSize: 20, fontFace: HEADER, color: C.sky, italic: true, margin: 0,
  });
  s.addText("A data visualization tool for amateur padel players.", {
    x: 0.5, y: 3.4, w: 9, h: 0.4,
    fontSize: 14, fontFace: BODY, color: "CBD5E1", margin: 0,
  });
  // Footer block
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.55, w: 0.06, h: 0.6,
    fill: { color: C.sky }, line: { type: "none" },
  });
  s.addText([
    { text: "Sensei", options: { bold: true, color: "FFFFFF" } },
    { text: "  ·  Data Visualization for Sport", options: { color: "CBD5E1" } },
    { text: "  ·  Sports Engineering MSc", options: { color: "CBD5E1", breakLine: true } },
    { text: "Politecnico di Milano  ·  AY 2025/2026", options: { color: "94A3B8" } },
  ], {
    x: 0.7, y: 4.55, w: 8, h: 0.6, fontSize: 12, fontFace: BODY, margin: 0,
  });
  s.addNotes("Open with confidence. \"Good evening. My name is Sensei, this is my final " +
    "project for Data Visualization for Sport. I'll walk you through the whole process, " +
    "from the brief all the way to the live demo. The application is called PadelLens. " +
    "It's a data viz tool for amateur padel players, with a real-data pro tour layer underneath.\"");
}

// ----------------------------------------------------------------------------
// 2) AGENDA
// ----------------------------------------------------------------------------
{
  const s = pres.addSlide();
  bg(s);
  addSlideHeader(s, "OVERVIEW", "How this talk is organized");
  const items = [
    ["1", "The Brief",            "Sport domain, audience, editorial angle"],
    ["2", "Working with Data",    "Sources, schema, exploration"],
    ["3", "UX Design",            "Wireframes, principles, heuristic eval"],
    ["4", "Data Representation",  "Chart choices, color, interactivity"],
    ["5", "Technical Implementation","Python, Streamlit, architecture"],
    ["6", "Demo & Conclusions",   "Live walkthrough, future work"],
  ];
  items.forEach(([n, label, desc], i) => {
    const y = 1.5 + i * 0.55;
    s.addShape(pres.shapes.OVAL, {
      x: 0.5, y, w: 0.4, h: 0.4, fill: { color: C.sky }, line: { type: "none" },
    });
    s.addText(n, { x: 0.5, y, w: 0.4, h: 0.4, fontSize: 14, color: "FFFFFF",
                   bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(label, { x: 1.1, y: y + 0.02, w: 2.6, h: 0.4,
                       fontSize: 15, fontFace: HEADER, bold: true,
                       color: C.ink, margin: 0, valign: "middle" });
    s.addText(desc, { x: 3.7, y: y + 0.02, w: 5.8, h: 0.4,
                      fontSize: 12, fontFace: BODY, color: C.muted,
                      margin: 0, valign: "middle" });
  });
  addFooter(s, 2);
  s.addNotes("\"The exam rubric has six sections. I'll cover them in order. The brief, " +
    "data, UX, visualization layer, code, then a live demo. Total time is about 30 minutes. " +
    "Please save questions for the end.\"");
}

// ----------------------------------------------------------------------------
// SECTION DIVIDERS HELPER
// ----------------------------------------------------------------------------
function sectionDivider(num, label, subtitle) {
  const s = pres.addSlide();
  bg(s, C.navy);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.0, w: 0.6, h: 0.06, fill: { color: C.sky }, line: { type: "none" },
  });
  s.addText("PART " + num, {
    x: 0.5, y: 2.15, w: 8, h: 0.4, fontSize: 12, color: C.sky,
    fontFace: HEADER, bold: true, charSpacing: 6, margin: 0,
  });
  s.addText(label, {
    x: 0.5, y: 2.55, w: 9, h: 0.8, fontSize: 44, color: "FFFFFF",
    fontFace: HEADER, bold: true, margin: 0,
  });
  s.addText(subtitle, {
    x: 0.5, y: 3.45, w: 9, h: 0.4, fontSize: 14, color: "94A3B8",
    fontFace: BODY, italic: true, margin: 0,
  });
  return s;
}

// ----------------------------------------------------------------------------
// SECTION 1 - THE BRIEF
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("1", "The Brief", "Context & Vision · Stage 1 of Kirk's data visualization process");
  d.addNotes("\"Part one. The brief - what am I building, for whom, and why. This is " +
    "the most important part of the whole project. Everything that follows traces back " +
    "to a decision made here.\"");
}

// 4. Why padel?
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "1.1 SPORT DOMAIN", "Why padel?");
  // Left: facts
  card(s, 0.5, 1.5, 4.5, 3.4);
  s.addText("Padel is exploding.", { x: 0.7, y: 1.65, w: 4.1, h: 0.5,
    fontSize: 18, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "1.1M+", options: { fontSize: 36, bold: true, color: C.sky } },
    { text: "  federated players in Italy (2024)", options: { fontSize: 13, color: C.muted } },
  ], { x: 0.7, y: 2.2, w: 4.1, h: 0.7, margin: 0 });
  s.addText("Up from ~30,000 in 2019 (FIP data).", {
    x: 0.7, y: 2.85, w: 4.1, h: 0.3, fontSize: 11, italic: true, color: C.muted, margin: 0 });
  s.addText([
    { text: "Pros have analytics. ", options: { bold: true, color: C.ink, breakLine: true } },
    { text: "Amateurs have a group chat.", options: { color: C.muted } },
  ], { x: 0.7, y: 3.3, w: 4.1, h: 0.7, fontSize: 13, margin: 0 });
  s.addText("Premier Padel rankings, ball-tracking, broadcast overlays - none of that reaches the club player.",
    { x: 0.7, y: 4.05, w: 4.1, h: 0.7, fontSize: 12, color: C.muted, margin: 0 });

  // Right: the gap
  card(s, 5.3, 1.5, 4.2, 3.4);
  s.addText("THE GAP", { x: 5.5, y: 1.65, w: 3.8, h: 0.3,
    fontSize: 10, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  s.addText("What amateurs feel", { x: 5.5, y: 1.95, w: 3.8, h: 0.4,
    fontSize: 14, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "\"I always lose in the third set.\"", options: { italic: true, breakLine: true } },
    { text: "\"I play better with Luca.\"", options: { italic: true, breakLine: true } },
    { text: "\"My bandeja is OK, my smash isn't.\"", options: { italic: true } },
  ], { x: 5.5, y: 2.35, w: 3.8, h: 1.0, fontSize: 12, color: C.muted, margin: 0,
       paraSpaceAfter: 4 });
  s.addText("What they can confirm", { x: 5.5, y: 3.5, w: 3.8, h: 0.4,
    fontSize: 14, bold: true, color: C.ink, margin: 0 });
  s.addText("Nothing.", { x: 5.5, y: 3.9, w: 3.8, h: 0.4,
    fontSize: 22, bold: true, color: C.red, margin: 0 });
  s.addText("That gap is the project.", { x: 5.5, y: 4.4, w: 3.8, h: 0.4,
    fontSize: 12, italic: true, color: C.muted, margin: 0 });

  addFooter(s, 4);
  s.addNotes("\"I picked padel because the gap is the right size. It's exploding in Italy - " +
    "over a million federated players - but the analytical tools available stop at the pro tier. " +
    "Amateurs have gut feelings - 'I always lose in the third set' - but no way to confirm any " +
    "of them. The whole project is built around closing that gap.\"");
}

// 5. The problem & user
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "1.2 PROBLEM & USER", "Who's at the other end of the screen?");
  // Problem statement
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.5, w: 9, h: 0.9, fill: { color: C.navy }, line: { type: "none" },
  });
  s.addText([
    { text: "PROBLEM STATEMENT", options: { fontSize: 9, color: C.sky, bold: true, charSpacing: 4, breakLine: true } },
    { text: "Amateur padel players want to see patterns in their own game that they can't feel - but no simple tool turns a player's match log into honest visual feedback.",
      options: { fontSize: 13, color: "FFFFFF" } },
  ], { x: 0.8, y: 1.6, w: 8.4, h: 0.7, margin: 0, valign: "middle", paraSpaceAfter: 4 });

  // Personas
  card(s, 0.5, 2.65, 4.4, 2.4);
  s.addText("PRIMARY USER", { x: 0.7, y: 2.78, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.sky, charSpacing: 4, margin: 0 });
  s.addText("Marco · the club player", { x: 0.7, y: 3.05, w: 4.0, h: 0.4,
    fontSize: 16, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "22-40 years old", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Plays 1-3 times per week at his local club", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "6 months to 5 years of experience", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Will spend 90 seconds logging on his phone", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Wants to improve · is not a pro · has no coach", options: { bullet: { code: "25CF" } } },
  ], { x: 0.7, y: 3.45, w: 4.0, h: 1.55, fontSize: 11.5, color: C.muted, margin: 0,
       paraSpaceAfter: 2 });

  card(s, 5.1, 2.65, 4.4, 2.4);
  s.addText("SECONDARY USER", { x: 5.3, y: 2.78, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.sky, charSpacing: 4, margin: 0 });
  s.addText("Luca · the amateur coach", { x: 5.3, y: 3.05, w: 4.0, h: 0.4,
    fontSize: 16, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "Gives weekly 1-hour lessons", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Needs a 2-min summary of each student before training", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Cares about shot balance, error trends, partner effect", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Reads on a laptop, not a phone", options: { bullet: { code: "25CF" } } },
  ], { x: 5.3, y: 3.45, w: 4.0, h: 1.55, fontSize: 11.5, color: C.muted, margin: 0,
       paraSpaceAfter: 2 });

  addFooter(s, 5);
  s.addNotes("\"My primary user - I call him Marco - is a club player, 22 to 40 years old, " +
    "plays a couple of times a week, willing to spend 90 seconds logging a match on his phone. " +
    "Not a pro. Not a coach. The whole app is built around what Marco actually wants to know. " +
    "The secondary user is the amateur coach - same data, different reading habits. Builds for " +
    "Marco automatically work for the coach.\"");
}

// 6. Editorial angle - Angle / Framing / Focus
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "1.3 EDITORIAL THINKING", "Angle · Framing · Focus (Kirk)");
  const cols = [
    { tag: "ANGLE", color: C.red, title: "Reflective self-analysis over time",
      sub: "Temporal · Categorical · Comparative.",
      detail: "Spatial overlays (court heatmaps) deliberately excluded - we don't have sensor data." },
    { tag: "FRAMING", color: C.green, title: "What an amateur can log on a phone",
      sub: "Inside: matches, sets, shot tallies, partners, surface.",
      detail: "Outside: ball-trajectory, biometrics, opponent scouting." },
    { tag: "FOCUS", color: C.sky, title: "One number above the fold",
      sub: "Last-10-matches win rate.",
      detail: "Plus: net shot balance, plain-language insight (\"You win 80% with Luca\")." },
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.5, 2.95, 3.5);
    // tag pill
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: 1.65, w: 1.2, h: 0.28,
      fill: { color: c.color }, line: { type: "none" },
    });
    s.addText(c.tag, {
      x: x + 0.2, y: 1.65, w: 1.2, h: 0.28,
      fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      charSpacing: 3, margin: 0,
    });
    s.addText(c.title, { x: x + 0.2, y: 2.1, w: 2.55, h: 0.8,
      fontSize: 16, bold: true, color: C.ink, margin: 0 });
    s.addText(c.sub, { x: x + 0.2, y: 3.0, w: 2.55, h: 0.7,
      fontSize: 12, color: C.muted, italic: true, margin: 0 });
    s.addText(c.detail, { x: x + 0.2, y: 3.85, w: 2.55, h: 1.0,
      fontSize: 11, color: C.muted, margin: 0 });
  });
  addFooter(s, 6);
  s.addNotes("\"Using Kirk's editorial-thinking framework from the lecture, the angle is " +
    "reflective self-analysis over time. The framing keeps only what an amateur can actually " +
    "log on a phone after a match - no sensor data, no biometrics, no opponent scouting. " +
    "The focus is one number above the fold: your last 10 matches. That's what Marco opens " +
    "the app to see.\"");
}

// 7. Relevance + core message
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "1.4 RELEVANCE", "Scored on Kirk's four factors");
  const factors = [
    ["Timeliness", "3", "Opens after a match or before the next one - actionable now."],
    ["Interestingness", "3", "Confirms or contradicts gut feelings - both outcomes are interesting."],
    ["Pertinence", "3", "Literally the user's own data - maximum personal connection."],
    ["Sufficiency", "2", "Deliberate trade-off: enough to inform, not so much it overwhelms."],
  ];
  factors.forEach(([f, sc, why], i) => {
    const y = 1.5 + i * 0.65;
    card(s, 0.5, y, 9, 0.55);
    s.addText(f, { x: 0.7, y, w: 1.8, h: 0.55, fontSize: 13, bold: true,
                    color: C.ink, valign: "middle", margin: 0 });
    // Score pill
    const scColor = sc === "3" ? C.green : (sc === "2" ? C.amber : C.red);
    s.addShape(pres.shapes.OVAL, {
      x: 2.5, y: y + 0.13, w: 0.3, h: 0.3, fill: { color: scColor }, line: { type: "none" },
    });
    s.addText(sc + "/3", { x: 2.5, y: y + 0.13, w: 0.3, h: 0.3,
      fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    s.addText(why, { x: 3.0, y, w: 6.4, h: 0.55,
      fontSize: 11, color: C.muted, valign: "middle", margin: 0 });
  });
  // Core message banner
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: C.sky }, line: { type: "none" },
  });
  s.addText("“You don't have to feel your game - you can see it.”", {
    x: 0.5, y: 4.4, w: 9, h: 0.6, fontSize: 18, italic: true, color: "FFFFFF",
    bold: true, align: "center", valign: "middle", margin: 0,
  });
  addFooter(s, 7);
  s.addNotes("\"Scoring relevance on Kirk's four factors - timeliness, interestingness, " +
    "pertinence and sufficiency - the project hits maximum on the first three and intentionally " +
    "trades off on sufficiency. I'd rather show less and have it land, than show everything and " +
    "have the user bounce. The core message of the whole project boils down to one line: you " +
    "don't have to feel your game - you can see it.\"");
}

// ----------------------------------------------------------------------------
// SECTION 2 - WORKING WITH DATA
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("2", "Working with Data", "Acquisition · Transformation · Exploration");
  d.addNotes("\"Part two. Where the data comes from, what shape it's in, and what it told me " +
    "before I drew a single chart.\"");
}

// Premier Padel context (pro data source)
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "2.0 PRO DATA SOURCE", "Premier Padel: the elite circuit behind our data");

  s.addText(
    "The official global professional padel tour (launched 2022, run by the FIP and Qatar Sports " +
    "Investments). In 2024 it absorbed the former World Padel Tour, unifying the pro game. My app's " +
    "Pro Tour layer pulls its rankings and match results from this circuit.",
    { x: 0.56, y: 1.26, w: 9.0, h: 0.55, fontSize: 11.5, fontFace: BODY, color: C.muted, margin: 0 }
  );

  // Court image (left)
  s.addImage({ path: path.join(ASSETS, "premier_padel_court.png"), x: 0.5, y: 1.95, w: 3.0, h: 3.0 });
  caption(s, 0.5, 4.98, 3.0, "Premier Padel court (top-down). Swap in an official photo if you have rights.");

  // Tournaments-per-year highlight (right)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.85, y: 1.95, w: 5.75, h: 0.72, rectRadius: 0.06,
    fill: { color: "EAF6FD" }, line: { color: C.sky, width: 0.75 },
  });
  s.addText([
    { text: "~26  ", options: { fontSize: 26, bold: true, color: C.skyDark } },
    { text: "tournaments per season, on 5 continents (Majors + P1 + P2 + Finals)", options: { fontSize: 12, color: C.ink } },
  ], { x: 4.05, y: 1.95, w: 5.4, h: 0.72, valign: "middle", fontFace: BODY, margin: 0 });

  // Tier rows
  const tiers = [
    ["Majors",  "2,000 pts", "Top tier - 4 a year (Qatar, Italy, France, Mexico)", C.sky],
    ["P1",      "1,000 pts", "Second tier - e.g. Madrid, Milano, Dubai, London", C.sky],
    ["P2",      "~500 pts",  "Entry tier - e.g. Brussels, Rotterdam, Germany", C.muted],
    ["Finals",  "1,500 pts", "Season finale - top 16 pairs, Barcelona", C.skyDark],
  ];
  let ty = 2.85;
  tiers.forEach(([name, pts, desc, col]) => {
    s.addText(name, { x: 3.9, y: ty, w: 1.15, h: 0.42, fontSize: 14, bold: true, color: C.navy, fontFace: HEADER, valign: "middle", margin: 0 });
    s.addText(pts, {
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05,
      x: 5.05, y: ty + 0.04, w: 1.05, h: 0.34, fill: { color: col },
      fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: BODY, margin: 0,
    });
    s.addText(desc, { x: 6.25, y: ty, w: 3.35, h: 0.42, fontSize: 11, color: C.muted, fontFace: BODY, valign: "middle", margin: 0 });
    ty += 0.5;
  });

  // Feeder circuit line
  s.addText([
    { text: "Below Premier Padel: ", options: { bold: true, color: C.ink } },
    { text: "the CUPRA FIP Tour feeder circuit (Platinum / Gold / Silver / Bronze), where emerging pairs earn points and climb toward P2 and P1.", options: { color: C.muted } },
  ], { x: 3.9, y: 4.95, w: 5.7, h: 0.5, fontSize: 10.5, fontFace: BODY, margin: 0 });

  addFooter(s, 9);
  s.addNotes(
    "\"Before I talk about my data, a quick word on where the real pro data comes from. Premier " +
    "Padel is the official global professional tour, launched in 2022 and backed by the " +
    "International Padel Federation and Qatar Sports Investments. In 2024 it absorbed the old " +
    "World Padel Tour, so it's now the single elite circuit. There are about 26 tournaments a " +
    "year across five continents, in three tiers: Majors at the top worth 2,000 ranking points, " +
    "then P1 at 1,000, then the more accessible P2 at around 500, plus a season-ending Finals in " +
    "Barcelona for the top 16 pairs. Below all of that sits the FIP feeder tour - Platinum, Gold, " +
    "Silver, Bronze - where new pairs earn points and climb. My app's Pro Tour layer takes its " +
    "rankings and results from this Premier Padel circuit, which is why this data is real and " +
    "verifiable.\""
  );
}

// Data sources
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "2.1 ACQUISITION", "Two layers, two sources");
  // Layer A
  card(s, 0.5, 1.5, 4.4, 3.5);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.5, w: 0.08, h: 3.5, fill: { color: C.sky }, line: { type: "none" },
  });
  s.addText("LAYER A · PRO TOUR (REAL)", { x: 0.75, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  s.addText("Padel API · padelapi.org", { x: 0.75, y: 1.95, w: 4.0, h: 0.4,
    fontSize: 15, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "Premier Padel rankings + match results", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Free tier: 50k req/month, 6 months of data", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Token auth, REST + JSON", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Paid only: full history · live point-by-point · shot stats", options: { bullet: { code: "25CB" }, color: C.ink, italic: true } },
  ], { x: 0.75, y: 2.35, w: 4.0, h: 1.2, fontSize: 11.5, color: C.muted,
       margin: 0, paraSpaceAfter: 3 });
  s.addText("BACKUP", { x: 0.75, y: 3.72, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Kaggle Padel Tennis WC dataset", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Premier Padel website scrape", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Cached CSV for offline demo", options: { bullet: { code: "25CF" } } },
  ], { x: 0.75, y: 4.02, w: 4.0, h: 0.95, fontSize: 11, color: C.muted,
       margin: 0, paraSpaceAfter: 2 });

  // Layer B
  card(s, 5.1, 1.5, 4.4, 3.5);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 1.5, w: 0.08, h: 3.5, fill: { color: C.amber }, line: { type: "none" },
  });
  s.addText("LAYER B · PERSONAL LOG", { x: 5.35, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.amber, charSpacing: 3, margin: 0 });
  s.addText("Seed data + user-generated", { x: 5.35, y: 1.95, w: 4.0, h: 0.4,
    fontSize: 15, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "No public amateur padel match data exists.", options: { breakLine: true, bold: true, color: C.ink } },
    { text: "That absence is part of why this project exists.", options: { italic: true } },
  ], { x: 5.35, y: 2.35, w: 4.0, h: 0.75, fontSize: 11, color: C.muted, margin: 0 });
  s.addText("APPROACH", { x: 5.35, y: 3.2, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Realistic seed log demonstrates the app", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Real users replace it via Log Match form", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Transparently disclosed - not hidden", options: { bullet: { code: "25CF" } } },
  ], { x: 5.35, y: 3.5, w: 4.0, h: 1.4, fontSize: 11.5, color: C.muted,
       margin: 0, paraSpaceAfter: 3 });

  addFooter(s, 10);
  s.addNotes("\"Two data layers, two sources. The pro layer comes from the Padel API - real " +
    "Premier Padel results, free tier, 50k requests a month. The cached CSV is the offline " +
    "fallback for the live demo so I'm not at the mercy of the wifi. The personal layer is seed " +
    "data. No public amateur padel dataset exists - and that gap is exactly why the project is " +
    "interesting in the first place. The lecture on editorial thinking specifically says: when " +
    "the data isn't there, make the absence part of the story. That's what I did.\"");
}

// Schema
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "2.2 EXAMINATION & TRANSFORMATION", "Three CSVs, tidy schemas");
  const tables = [
    { name: "pro_players.csv", rows: "30", color: C.sky,
      cols: ["player_id", "name", "country", "side (D/R)", "ranking_points", "+ 3 more"] },
    { name: "pro_matches.csv", rows: "276", color: C.sky,
      cols: ["match_id", "date · tournament", "round", "team1_p{1,2}", "team2_p{1,2}", "winner_team", "set{1,2,3}", "surface", "duration_min"] },
    { name: "my_matches.csv", rows: "40+", color: C.amber,
      cols: ["match_id · date", "partner · opponents", "club · surface", "set scores (per set)", "winners_{shot} · errors_{shot}", "result · duration · notes"] },
  ];
  tables.forEach((t, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.5, 2.95, 3.4);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.5, w: 2.95, h: 0.32,
      fill: { color: t.color }, line: { type: "none" },
    });
    s.addText(t.name, { x: x + 0.15, y: 1.5, w: 1.8, h: 0.32,
      fontSize: 11, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addText(t.rows + " rows", { x: x + 1.9, y: 1.5, w: 1.0, h: 0.32,
      fontSize: 10, color: "FFFFFF", align: "right", valign: "middle", margin: 0 });
    const colItems = t.cols.map((c, i) => ({
      text: c, options: { breakLine: i < t.cols.length - 1 }
    }));
    s.addText(colItems, {
      x: x + 0.2, y: 1.95, w: 2.6, h: 2.8, fontSize: 11, fontFace: "Courier New",
      color: C.ink, margin: 0, paraSpaceAfter: 3,
    });
  });
  // Transformation strip below
  s.addText([
    { text: "Transformations (cached in Streamlit): ", options: { bold: true, color: C.ink } },
    { text: "score-string parsing → numeric · derived 'won' & 'net_<shot>' · groupby on partner / surface / shot · 5-match rolling win rate.",
      options: { color: C.muted } },
  ], { x: 0.5, y: 5.0, w: 9, h: 0.3, fontSize: 11, margin: 0 });

  addFooter(s, 11);
  s.addNotes("\"Three CSVs. Thirty top pros, two hundred and seventy-six pro matches across " +
    "twelve real tournaments, and forty seed personal matches. The transformations are mostly " +
    "small - parsing tournament score strings into numeric pairs, computing derived columns " +
    "like 'won' and net per shot type, and grouping by partner, surface and shot. All cached " +
    "in Streamlit at load time so the UI stays snappy.\"");
}

// EDA findings
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "2.3 EXPLORATION", "What the data told me before I drew anything");
  // Three findings
  const findings = [
    { tag: "PRO TOUR", finding: "68%", label: "straight-set rate",
      detail: "Matches the real Premier Padel rate (~68-72%). Means: third-set analytics are rare on the pro side. Don't waste space on them." },
    { tag: "PARTNER", finding: "80% vs 20%", label: "Luca vs Davide",
      detail: "60-point spread across the same player. This is the single most surprising actionable fact in the data." },
    { tag: "FATIGUE", finding: "−40 pp", label: "drop in 3-set matches",
      detail: "Two-set win rate is 80%, three-set is 40%. The fade is real, and it's the biggest learnable pattern." },
  ];
  findings.forEach((f, i) => {
    const y = 1.5 + i * 1.18;
    card(s, 0.5, y, 9, 1.05);
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.08, h: 1.05, fill: { color: C.sky }, line: { type: "none" }
    });
    s.addText(f.tag, { x: 0.75, y: y + 0.1, w: 1.2, h: 0.3,
      fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    s.addText(f.finding, { x: 0.75, y: y + 0.35, w: 2.2, h: 0.55,
      fontSize: 28, bold: true, color: C.ink, margin: 0 });
    s.addText(f.label, { x: 0.75, y: y + 0.85, w: 2.2, h: 0.25,
      fontSize: 10, italic: true, color: C.muted, margin: 0 });
    s.addText(f.detail, { x: 3.1, y, w: 6.2, h: 1.05,
      fontSize: 12.5, color: C.ink, valign: "middle", margin: 0 });
  });
  addFooter(s, 12);
  s.addNotes("\"Three findings drove the entire design. One: on the pro tour, two-thirds of " +
    "matches end in straight sets - meaning I should not waste screen real estate on third-set " +
    "analytics for the pro side. Two: on my personal log, the partner effect is enormous - " +
    "eighty percent win rate with one partner, twenty with another. Three: when matches go to a " +
    "third set, my win rate drops by forty percentage points. Every chart I'll show you in a " +
    "minute earned its place by answering one of these three findings.\"");
}

// ----------------------------------------------------------------------------
// SECTION 3 - UX DESIGN
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("3", "UX Design", "Wireframes · Principles · Heuristic evaluation");
  d.addNotes("\"Part three. How the app is laid out, why those choices, and what I changed " +
    "after a heuristic evaluation.\"");
}

// Process
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "3.1 PROCESS", "From paper sketch to working app");
  const steps = [
    { n: "1", title: "Paper sketches", desc: "30 min. Just box drawings - which pages exist." },
    { n: "2", title: "Low-fi wireframes", desc: "Figma · 5 SVGs · grayscale layout only." },
    { n: "3", title: "Mid-fi pass", desc: "Same layout, real chart shapes drawn in." },
    { n: "4", title: "Streamlit build", desc: "High-fi == working app. No click-prototype." },
  ];
  steps.forEach((step, i) => {
    const x = 0.5 + i * 2.3;
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.95, y: 1.7, w: 0.45, h: 0.45, fill: { color: C.sky }, line: { type: "none" }
    });
    s.addText(step.n, { x: x + 0.95, y: 1.7, w: 0.45, h: 0.45,
      fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    if (i < steps.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: x + 1.45, y: 1.92, w: 0.85, h: 0,
        line: { color: C.border, width: 1.5, dashType: "dash" },
      });
    }
    card(s, x, 2.3, 2.2, 2.5);
    s.addText(step.title, { x: x + 0.15, y: 2.45, w: 1.9, h: 0.45,
      fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(step.desc, { x: x + 0.15, y: 2.95, w: 1.9, h: 1.7,
      fontSize: 11, color: C.muted, margin: 0 });
  });
  // Footer reasoning
  s.addText([
    { text: "Why I stopped at low-fi: ", options: { bold: true, color: C.ink } },
    { text: "The deliverable is a Streamlit app, and going from a Streamlit-shaped wireframe to a Streamlit-built app is a one-step jump. Click-prototypes are theatre.",
      options: { color: C.muted, italic: true } },
  ], { x: 0.5, y: 5.0, w: 9, h: 0.3, fontSize: 11, margin: 0 });
  addFooter(s, 14);
  s.addNotes("\"My design process was deliberately short. I sketched on paper, moved to low-fi " +
    "Figma wireframes, did a mid-fi pass with the actual chart shapes drawn in, then jumped " +
    "directly to the Streamlit build. I did not do a full click-prototype because the deliverable " +
    "is a working app - building a click-prototype that nobody will demo is wasted time. The " +
    "Streamlit build is the high-fi version.\"");
}

// Wireframes overview (5 thumbnails)
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "3.2 WIREFRAMES", "Five pages, each built around one user task");
  const wfs = [
    { f: "01_home.png", title: "Home", desc: "Last 10 + partner + shot DNA" },
    { f: "02_pro_tour.png", title: "Pro Tour", desc: "Rankings + filters" },
    { f: "03_my_stats.png", title: "My Stats", desc: "Personal dashboard" },
    { f: "04_log_match.png", title: "Log Match", desc: "90-second data entry" },
    { f: "05_compare.png", title: "Compare", desc: "Radar vs pro reference" },
  ];
  // 5 thumbnails in a row + 1 bigger feature
  const colW = 1.78, colH = 1.1;
  wfs.forEach((wf, i) => {
    const x = 0.5 + i * (colW + 0.08);
    s.addImage({ path: path.join(ASSETS, wf.f), x, y: 1.5, w: colW, h: colH });
    s.addText(wf.title, { x, y: 2.65, w: colW, h: 0.28,
      fontSize: 12, bold: true, color: C.ink, margin: 0 });
    s.addText(wf.desc, { x, y: 2.92, w: colW, h: 0.5,
      fontSize: 10, color: C.muted, margin: 0 });
  });
  // Feature: zoom on Home wireframe
  card(s, 0.5, 3.55, 9, 1.45);
  s.addText("Each page answers ONE task from the brief.", {
    x: 0.7, y: 3.7, w: 8.6, h: 0.4, fontSize: 14, bold: true, color: C.ink, margin: 0,
  });
  s.addText([
    { text: "Home → ", options: { bold: true } }, { text: "\"How am I doing right now?\" · " },
    { text: "Pro Tour → ", options: { bold: true } }, { text: "\"Explore the pro game\" · " },
    { text: "My Stats → ", options: { bold: true } }, { text: "\"Why am I winning/losing?\" · " },
    { text: "Log Match → ", options: { bold: true, breakLine: false } }, { text: "\"Add today's match\" · " },
    { text: "Compare → ", options: { bold: true } }, { text: "\"How big is the gap to a pro?\"" },
  ], { x: 0.7, y: 4.15, w: 8.6, h: 0.75, fontSize: 11, color: C.muted, margin: 0 });
  addFooter(s, 15);
  s.addNotes("\"Five pages. Home is the landing - the last-10 KPI plus the partner-effect and " +
    "shot-DNA cards. Pro Tour is the rankings explorer with the always-visible filter sidebar. " +
    "My Stats is the personal deep-dive. Log Match is the data entry form, deliberately " +
    "frictionless - under 90 seconds to log a match. Compare is the radar overlay of your shot " +
    "mix against the pro reference. Each page is built around exactly one user task.\"");
}

// Usability principles
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "3.3 PRINCIPLES", "Six rules applied throughout");
  const ps = [
    ["One number above the fold", "The app is opened in bursts. 42-pt KPI on Home."],
    ["Recognition over recall", "Filters always visible - never behind a button."],
    ["Default to action", "+ Log a match is the most prominent CTA on Home."],
    ["Reduce data-entry friction", "Shot tallies optional. Score + partner is enough."],
    ["Honest visual hierarchy", "Red only for negative signal. No gratuitous color."],
    ["Annotate, don't decorate", "Every chart has at least one in-canvas annotation."],
  ];
  ps.forEach((p, i) => {
    const x = 0.5 + (i % 2) * 4.55;
    const y = 1.5 + Math.floor(i / 2) * 1.15;
    card(s, x, y, 4.45, 1.0);
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.27, w: 0.45, h: 0.45,
      fill: { color: C.sky }, line: { type: "none" },
    });
    s.addText((i+1) + "", { x: x + 0.2, y: y + 0.27, w: 0.45, h: 0.45,
      fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    s.addText(p[0], { x: x + 0.8, y: y + 0.18, w: 3.55, h: 0.3,
      fontSize: 12.5, bold: true, color: C.ink, margin: 0 });
    s.addText(p[1], { x: x + 0.8, y: y + 0.48, w: 3.55, h: 0.5,
      fontSize: 11, color: C.muted, margin: 0 });
  });
  addFooter(s, 16);
  s.addNotes("\"Six principles drove the design. One number above the fold because users open " +
    "the app in bursts. Recognition over recall - filters are always visible in the sidebar. " +
    "Default to action - the log-a-match button is the most prominent CTA. Reduce friction in " +
    "data entry - shot tallies are optional, score plus partner is enough. Honest visual " +
    "hierarchy - red is reserved for negative signal. And annotate, don't decorate - every " +
    "chart has an in-canvas callout. That last one ties directly back to the focus principle " +
    "from the editorial thinking lecture.\"");
}

// Heuristic evaluation
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "3.4 HEURISTIC EVALUATION", "Two real changes from Nielsen's 10");
  // Two columns: before / after for the two changed heuristics
  const changes = [
    { n: "#5", h: "Error prevention", before: "Original form let me enter Set-3 scores even when sets 1-2 were already decided (6-0, 6-0).", after: "Set-3 inputs are disabled until sets 1-2 are split 1-1." },
    { n: "#6", h: "Recognition over recall", before: "First sketch had filters hidden behind a 'Filters' button - user has to remember what they filtered by.", after: "Filters live in an always-visible sidebar on the Pro Tour page." },
  ];
  changes.forEach((c, i) => {
    const y = 1.5 + i * 1.65;
    card(s, 0.5, y, 9, 1.5);
    // Heuristic header
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 1.1, h: 1.5, fill: { color: C.navy }, line: { type: "none" },
    });
    s.addText(c.n, { x: 0.5, y: y + 0.2, w: 1.1, h: 0.5,
      fontSize: 22, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    s.addText(c.h, { x: 0.5, y: y + 0.75, w: 1.1, h: 0.65,
      fontSize: 9, color: "FFFFFF", align: "center", valign: "top", margin: 0 });
    // Before
    s.addText("BEFORE", { x: 1.8, y: y + 0.15, w: 3.0, h: 0.25,
      fontSize: 9, bold: true, color: C.red, charSpacing: 3, margin: 0 });
    s.addText(c.before, { x: 1.8, y: y + 0.4, w: 3.5, h: 1.0,
      fontSize: 11, color: C.muted, margin: 0 });
    // Arrow
    s.addShape(pres.shapes.LINE, {
      x: 5.5, y: y + 0.75, w: 0.4, h: 0,
      line: { color: C.sky, width: 2.5, endArrowType: "triangle" },
    });
    // After
    s.addText("AFTER", { x: 6.0, y: y + 0.15, w: 3.0, h: 0.25,
      fontSize: 9, bold: true, color: C.green, charSpacing: 3, margin: 0 });
    s.addText(c.after, { x: 6.0, y: y + 0.4, w: 3.3, h: 1.0,
      fontSize: 11, color: C.ink, margin: 0 });
  });
  addFooter(s, 17);
  s.addNotes("\"I ran Nielsen's ten heuristics against my first paper sketches. Two of them " +
    "flagged real problems. Number five - error prevention - my original log form let me enter " +
    "a third-set score even when sets one and two were already decided. I added input gating. " +
    "Number six - recognition over recall - I'd originally hidden filters behind a button. I " +
    "moved them to an always-visible sidebar. These two changes are the difference between the " +
    "paper sketch and the wireframe you just saw.\"");
}

// ----------------------------------------------------------------------------
// SECTION 4 - DATA REPRESENTATION
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("4", "Data Representation", "Chart choices · Color · Interactivity");
  d.addNotes("\"Part four. How the data is shown. Chart by chart.\"");
}

// Chart inventory
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "4.1 CHART INVENTORY", "Nine chart types · each answers one EDA finding");
  // Table-like layout
  const charts = [
    ["KPI + sparkline", "Home", "Last-10 win rate"],
    ["Horizontal bar", "Home / My Stats", "Partner win rate"],
    ["Diverging bar", "Home / My Stats", "Shot DNA (winners − errors)"],
    ["Ranking table + row sparkline", "Pro Tour", "Top players + form"],
    ["Small-multiples", "Pro Tour", "Surface effect"],
    ["Rolling-mean line", "My Stats", "Win-rate trend"],
    ["Set-by-set columns", "My Stats", "Fatigue (2-set vs 3-set)"],
    ["Radar overlay", "Compare", "You vs pro shot mix"],
    ["Inline annotations", "All pages", "Headline numbers"],
  ];
  // Header row
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.5, w: 9, h: 0.35, fill: { color: C.navy }, line: { type: "none" }
  });
  s.addText("CHART", { x: 0.7, y: 1.5, w: 3.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", charSpacing: 2, valign: "middle", margin: 0 });
  s.addText("WHERE", { x: 3.8, y: 1.5, w: 2.5, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", charSpacing: 2, valign: "middle", margin: 0 });
  s.addText("ANSWERS", { x: 6.4, y: 1.5, w: 3.0, h: 0.35,
    fontSize: 10, bold: true, color: "FFFFFF", charSpacing: 2, valign: "middle", margin: 0 });
  charts.forEach((c, i) => {
    const y = 1.85 + i * 0.32;
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y, w: 9, h: 0.32, fill: { color: C.card }, line: { type: "none" },
      });
    }
    s.addText(c[0], { x: 0.7, y, w: 3.0, h: 0.32, fontSize: 11.5, bold: true,
      color: C.ink, valign: "middle", margin: 0 });
    s.addText(c[1], { x: 3.8, y, w: 2.5, h: 0.32, fontSize: 11, color: C.muted,
      valign: "middle", margin: 0 });
    s.addText(c[2], { x: 6.4, y, w: 3.0, h: 0.32, fontSize: 11, color: C.muted,
      valign: "middle", margin: 0 });
  });
  caption(s, 0.5, 5.0, 9, "Rejected: pie charts, court heatmaps, Sankeys, 3D bars, animated rankings. Each lost head-to-head against a simpler alternative.");
  addFooter(s, 19);
  s.addNotes("\"Nine chart types in the app. Each one answers one specific finding from the " +
    "exploratory analysis. I had a longer list - pie charts, court heatmaps, Sankeys, animated " +
    "rankings - that I cut. They each lost head-to-head against a simpler alternative on the " +
    "specific question they were trying to answer.\"");
}

// Case study: shot DNA chart
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "4.2 CASE STUDY", "Why a diverging bar for shot DNA?");
  // Left: question
  card(s, 0.5, 1.5, 4.4, 3.5);
  s.addText("THE QUESTION", { x: 0.7, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  s.addText("Which shots win me points, which bleed them?", {
    x: 0.7, y: 1.95, w: 4.0, h: 0.7, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  s.addText("The question is signed. Some shots are net positive, others net negative.", {
    x: 0.7, y: 2.7, w: 4.0, h: 0.6, fontSize: 11, color: C.muted, italic: true, margin: 0 });
  s.addText("CONSIDERED:", { x: 0.7, y: 3.35, w: 4.0, h: 0.25,
    fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Pie of shot share - hides the zero line.", options: { breakLine: true, color: C.red } },
    { text: "Stacked bar - needs eye traversal.", options: { breakLine: true, color: C.red } },
    { text: "Two side-by-side bar charts - same problem.", options: { breakLine: true, color: C.red } },
    { text: "Diverging bar - chosen.", options: { color: C.green, bold: true } },
  ], { x: 0.7, y: 3.6, w: 4.0, h: 1.3, fontSize: 11.5, margin: 0, paraSpaceAfter: 3 });

  // Right: the chart preview (built with shapes)
  card(s, 5.1, 1.5, 4.4, 3.5);
  s.addText("YOUR SHOT DNA · 40 MATCHES", { x: 5.3, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  // bars
  const bars = [
    ["Bandeja",  +176, "0EA5E9"],
    ["Forehand", +87,  "0EA5E9"],
    ["Volley",   +86,  "0EA5E9"],
    ["Backhand", -117, "EF4444"],
    ["Smash",    -170, "EF4444"],
  ];
  // Compact diverging bar: category labels on the far left (5.25-6.15),
  // zero axis at cx=8.2, scale=0.004 so max bar (≈176) = 0.70in and value labels
  // fit inside the card on both sides (card extends to x=9.5).
  const cx = 8.2, scale = 0.004;
  s.addShape(pres.shapes.LINE, {
    x: cx, y: 2.05, w: 0, h: 2.5,
    line: { color: C.muted, width: 0.5 }
  });
  s.addText("0", { x: cx - 0.15, y: 4.55, w: 0.3, h: 0.2, fontSize: 9,
    color: C.muted, align: "center", margin: 0 });
  bars.forEach((b, i) => {
    const y = 2.15 + i * 0.4;
    // Category label always on the far left, right-aligned, in its own gutter
    s.addText(b[0], { x: 5.25, y: y, w: 0.9, h: 0.3, fontSize: 11,
      color: C.ink, align: "right", valign: "middle", margin: 0 });
    const w = Math.abs(b[1]) * scale;
    if (b[1] > 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: y + 0.05, w, h: 0.22, fill: { color: b[2] }, line: { type: "none" },
      });
      // Value sits to the right of the positive bar
      s.addText("+" + b[1], { x: cx + w + 0.04, y: y, w: 0.55, h: 0.3, fontSize: 10,
        color: C.ink, valign: "middle", margin: 0 });
    } else {
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx - w, y: y + 0.05, w, h: 0.22, fill: { color: b[2] }, line: { type: "none" },
      });
      // Value sits to the LEFT of the negative bar - in the gutter
      s.addText(b[1] + "", { x: 6.25, y: y, w: (cx - w) - 6.30, h: 0.3, fontSize: 10,
        color: C.red, align: "right", valign: "middle", margin: 0 });
    }
  });
  caption(s, 5.3, 4.85, 4.0, "Zero line dead center · sign readable at a glance · winners and errors share the bar.");
  addFooter(s, 20);
  s.addNotes("\"Walk through one chart choice as a case study. The shot DNA question is signed - " +
    "bandeja is net-positive, smash is net-negative. A pie chart shows proportions, not signs. " +
    "Stacked bars hide the zero line. Two bar charts force eye traversal. A diverging bar puts " +
    "the zero line dead center, lets winners go right and errors go left, and the sign is " +
    "readable at a glance. Every chart in the app went through this kind of head-to-head choice.\"");
}

// Color
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "4.3 COLOR", "Editorial use, not decoration");
  const swatches = [
    { name: "Blue", hex: "0EA5E9", role: "Positive / interactive / default" },
    { name: "Red", hex: "EF4444", role: "Negative signal requiring action" },
    { name: "Gray", hex: "94A3B8", role: "Pro reference frame" },
    { name: "Ink", hex: "1F2937", role: "Body text" },
    { name: "Muted", hex: "6B7280", role: "Secondary text" },
    { name: "BG", hex: "F8FAFC", role: "Page background" },
  ];
  swatches.forEach((sw, i) => {
    const x = 0.5 + (i % 3) * 3.05;
    const y = 1.5 + Math.floor(i / 3) * 1.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.9, h: 0.9, fill: { color: sw.hex },
      line: { color: C.border, width: 0.5 },
    });
    s.addText(sw.name, { x: x + 1.0, y: y + 0.05, w: 1.95, h: 0.3,
      fontSize: 13, bold: true, color: C.ink, margin: 0 });
    s.addText("#" + sw.hex, { x: x + 1.0, y: y + 0.35, w: 1.95, h: 0.25,
      fontSize: 10, fontFace: "Courier New", color: C.muted, margin: 0 });
    s.addText(sw.role, { x: x + 1.0, y: y + 0.6, w: 1.95, h: 0.35,
      fontSize: 10, italic: true, color: C.muted, margin: 0 });
  });
  // Accessibility line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.0, w: 9, h: 1.0, fill: { color: C.navy }, line: { type: "none" }
  });
  s.addText("ACCESSIBILITY CHECKS", { x: 0.7, y: 4.1, w: 8.6, h: 0.3,
    fontSize: 9, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "WCAG AA body-text contrast 12.6:1 ✓ · " },
    { text: "Blue/red palette: deuteranopia & protanopia safe ✓ · " },
    { text: "No green/red pairs · " },
    { text: "Every red mark is also negatively signed numerically.", options: { bold: true } },
  ], { x: 0.7, y: 4.4, w: 8.6, h: 0.55, fontSize: 12, color: "FFFFFF", margin: 0 });
  addFooter(s, 21);
  s.addNotes("\"Color is doing editorial work, not decoration. Blue is the neutral and positive " +
    "case. Red is reserved for negative signal that requires action - losing partner, net-negative " +
    "shot, the third-set fade KPI. Gray is the pro reference frame on the Compare page. No green " +
    "anywhere - green/red is the worst color-blindness pair. And every red mark is also signed " +
    "numerically, so even on a black-and-white printout the chart still tells the same story.\"");
}

// Interactivity & annotations
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "4.4 INTERACTIVITY & ANNOTATIONS", "Kirk's last two design layers");
  card(s, 0.5, 1.5, 4.4, 3.5);
  s.addText("INTERACTIVITY", { x: 0.7, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Sidebar filters (country, surface, category, dates)", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Row-click drill from rankings to player detail", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Time-range toggle on My Stats (30/60/90/all)", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Hover tooltips: precision on demand", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Live auto-result preview while typing a score", options: { bullet: { code: "25CF" } } },
  ], { x: 0.7, y: 2.0, w: 4.0, h: 2.9, fontSize: 12, color: C.ink,
       margin: 0, paraSpaceAfter: 5 });

  card(s, 5.1, 1.5, 4.4, 3.5);
  s.addText("ANNOTATION", { x: 5.3, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Static in-canvas: the headline (\"-40 pp\")", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Dynamic hover: the detail (exact value, date)", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Captions outside the chart: WHAT", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Callouts inside the chart: WHY you should care", options: { bullet: { code: "25CF" }, breakLine: true } },
    { text: "Color-coded gap cards on Compare (red→amber→green)", options: { bullet: { code: "25CF" } } },
  ], { x: 5.3, y: 2.0, w: 4.0, h: 2.9, fontSize: 12, color: C.ink,
       margin: 0, paraSpaceAfter: 5 });
  addFooter(s, 22);
  s.addNotes("\"Interactivity follows Kirk's framing layer - filters let the user reframe the " +
    "data. Hover tooltips give precision on demand without cluttering the chart. The most " +
    "important annotations are static and in-canvas, like the minus-forty-pp tag on the fatigue " +
    "chart - those are the headline, not a footnote. Hover tooltips are for the detail-seeking " +
    "user; static annotations are for the user who's not even reading carefully.\"");
}

// ----------------------------------------------------------------------------
// SECTION 4b - CHART GALLERY (screenshots of each chart)
// ----------------------------------------------------------------------------
function galleryItem(s, x, name, imgFile, sentence) {
  s.addText(name, { x, y: 1.42, w: 4.35, h: 0.4, fontSize: 15, bold: true, color: C.navy, fontFace: HEADER, margin: 0 });
  s.addImage({ path: path.join(ASSETS, "charts", imgFile), x, y: 1.92, w: 4.35, h: 2.5, sizing: { type: "contain", w: 4.35, h: 2.5 } });
  s.addText(sentence, { x, y: 4.55, w: 4.35, h: 0.85, fontSize: 11.5, color: C.muted, fontFace: BODY, margin: 0 });
}
function gallerySlide(part, left, right) {
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "4." + (4 + part) + " CHART GALLERY", "The charts in the app (" + part + "/4)");
  galleryItem(s, 0.5, left[0], left[1], left[2]);
  galleryItem(s, 5.15, right[0], right[1], right[2]);
  return s;
}
{
  const s = gallerySlide(1,
    ["Win-rate KPI + sparkline", "01_kpi_sparkline.png", "The single headline number the user opens the app for, with a sparkline showing recent momentum."],
    ["Partner win-rate bars", "02_partner_bars.png", "Win rate per partner; bar length is the fastest channel for comparison (Luca 80% best, Davide 20% worst)."]);
  addFooter(s, 23);
  s.addNotes("\"These next four slides are the actual charts, rendered from my real data. First, the headline KPI with its sparkline, and the partner bars - which immediately surface the 80-versus-20 partner effect.\"");
}
{
  const s = gallerySlide(2,
    ["Shot DNA (diverging bars)", "03_shot_dna.png", "Winners minus errors per shot around a zero line - strengths point right (Bandeja +176), weaknesses left (Smash -170)."],
    ["Rolling win-rate line", "04_rolling_line.png", "A 5-match rolling mean against a 50% baseline smooths single-match noise to reveal the real trend."]);
  addFooter(s, 24);
  s.addNotes("\"The shot-DNA diverging bar is my signed-magnitude chart; the rolling line is my trend chart - the rolling mean stops a single bad match from dominating.\"");
}
{
  const s = gallerySlide(3,
    ["Set-by-set fatigue", "05_fatigue.png", "Two-set vs three-set win rate, with the -40-point fatigue gap annotated directly on the chart."],
    ["Pro rankings + form sparklines", "06_rankings_table.png", "A ranking is inherently tabular; a tiny form sparkline per row adds momentum without a spaghetti plot."]);
  addFooter(s, 25);
  s.addNotes("\"The fatigue chart makes the gap the hero with a direct annotation. The rankings table stays tabular but adds a per-row form sparkline.\"");
}
{
  const s = gallerySlide(4,
    ["Surface effect (small multiples)", "07_surface_multiples.png", "Indoor vs outdoor panels show overlapping distributions - surface is a weak predictor, so it is a filter, not a headline."],
    ["Shot-profile radar", "08_radar.png", "Your average winners per shot overlaid on the tour reference across five shot types - the shape gap is the story."]);
  addFooter(s, 26);
  s.addNotes("\"Finally the surface small multiples - which justify treating surface as a minor filter - and the Compare radar, my one radar chart, used because the question is the shape difference across a small fixed set of categories.\"");
}

// ----------------------------------------------------------------------------
// SECTION 5 - TECHNICAL IMPLEMENTATION
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("5", "Technical Implementation", "Python · Streamlit · Plotly");
  d.addNotes("\"Part five, quickly - what's under the hood.\"");
}

// Tech stack + architecture
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "5.1 TECH STACK & ARCHITECTURE", "What's under the hood");
  const stack = [
    ["Python 3.11", "Language"],
    ["Streamlit 1.32", "Multi-page web app framework"],
    ["Pandas 2.x", "Data wrangling, groupby, rolling means"],
    ["Plotly 5.x", "Interactive charts (hover, zoom, brush)"],
    ["Requests", "Padel API client"],
  ];
  // Stack column
  card(s, 0.5, 1.5, 4.4, 3.5);
  s.addText("STACK", { x: 0.7, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  stack.forEach(([lib, role], i) => {
    const y = 2.0 + i * 0.55;
    s.addText(lib, { x: 0.7, y, w: 1.8, h: 0.3, fontSize: 13, bold: true,
      color: C.ink, fontFace: "Courier New", margin: 0 });
    s.addText(role, { x: 2.5, y, w: 2.3, h: 0.3, fontSize: 11, color: C.muted, margin: 0 });
  });
  // Architecture diagram
  card(s, 5.1, 1.5, 4.4, 3.5);
  s.addText("ARCHITECTURE", { x: 5.3, y: 1.65, w: 4.0, h: 0.3,
    fontSize: 10, bold: true, color: C.sky, charSpacing: 3, margin: 0 });
  // Boxes
  function box(x, y, w, h, label, sub) {
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h, fill: { color: C.bg }, line: { color: C.border, width: 0.75 },
    });
    s.addText(label, { x, y: y + 0.05, w, h: 0.25,
      fontSize: 10, bold: true, color: C.ink, align: "center", valign: "middle", margin: 0 });
    if (sub) s.addText(sub, { x, y: y + 0.28, w, h: 0.22,
      fontSize: 8, color: C.muted, align: "center", italic: true, margin: 0 });
  }
  box(5.3, 2.0, 1.9, 0.55, "Padel API", "REST + JSON");
  box(7.4, 2.0, 1.9, 0.55, "CSV cache", "offline-safe");
  // arrow
  s.addShape(pres.shapes.LINE, {
    x: 7.2, y: 2.28, w: 0.18, h: 0, line: { color: C.muted, width: 1.5, endArrowType: "triangle" }
  });
  box(6.35, 2.85, 1.9, 0.55, "Pandas", "load + transform");
  // arrows down
  s.addShape(pres.shapes.LINE, { x: 6.25, y: 2.55, w: 1.0, h: 0.3,
    line: { color: C.muted, width: 1, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 8.35, y: 2.55, w: -1.0, h: 0.3,
    line: { color: C.muted, width: 1, endArrowType: "triangle" } });
  box(6.35, 3.7, 1.9, 0.55, "Plotly", "interactive");
  s.addShape(pres.shapes.LINE, { x: 7.3, y: 3.4, w: 0, h: 0.3,
    line: { color: C.muted, width: 1, endArrowType: "triangle" } });
  box(5.3, 4.55, 3.9, 0.4, "Streamlit · multi-page web", "");
  s.addShape(pres.shapes.LINE, { x: 7.3, y: 4.25, w: 0, h: 0.3,
    line: { color: C.muted, width: 1, endArrowType: "triangle" } });
  addFooter(s, 28);
  s.addNotes("\"The stack is intentionally boring: Python, Streamlit, Pandas, Plotly, Requests. " +
    "Total app code is about six hundred lines across five files. The architecture is simple - " +
    "the Padel API or the cached CSV feeds into Pandas, which feeds into Plotly, which renders " +
    "inside Streamlit. Streamlit's caching means each CSV is read once per session. The whole " +
    "thing runs on a laptop in under three seconds from cold start.\"");
}

// ----------------------------------------------------------------------------
// SECTION 6 - DEMO & CONCLUSIONS
// ----------------------------------------------------------------------------
{
  const d = sectionDivider("6", "Demo & Conclusions", "Live walkthrough · Future work");
  d.addNotes("\"Last part. I'll switch to the live app now and walk through a real use case, " +
    "then close with what would come next.\"");
}

// Demo walkthrough plan
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "6.1 DEMO", "Five-step walkthrough I'll show you next");
  const stops = [
    { p: "Home",       wf: "01_home.png",      task: "Open the app. Last 10: 7-3. Partner card shows Luca on top, Davide red." },
    { p: "Log Match",  wf: "04_log_match.png", task: "Add today's match in 30 seconds. Watch the auto-result update." },
    { p: "My Stats",   wf: "03_my_stats.png",  task: "Filter to last 60 days. Read the partner & fatigue panels." },
    { p: "Compare",    wf: "05_compare.png",   task: "Toggle to a specific pro. See the radar gap on the smash." },
    { p: "Pro Tour",   wf: "02_pro_tour.png",  task: "Filter to indoor majors. Read the form sparkline column." },
  ];
  stops.forEach((stop, i) => {
    const x = 0.5 + (i % 5) * 1.85;
    const y = 1.6;
    s.addImage({ path: path.join(ASSETS, stop.wf), x, y, w: 1.78, h: 1.1 });
    s.addText((i + 1) + " · " + stop.p, { x, y: y + 1.15, w: 1.78, h: 0.28,
      fontSize: 11, bold: true, color: C.ink, margin: 0 });
    s.addText(stop.task, { x, y: y + 1.43, w: 1.78, h: 0.95,
      fontSize: 9, color: C.muted, margin: 0 });
  });
  // CTA
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.55, w: 9, h: 0.5, fill: { color: C.sky }, line: { type: "none" }
  });
  s.addText("→  Switch to live app now: streamlit run app.py", {
    x: 0.5, y: 4.55, w: 9, h: 0.5, fontSize: 13, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", fontFace: BODY, margin: 0,
  });
  addFooter(s, 30);
  s.addNotes("\"I'll show you this live next. Five stops: open Home, log a match in thirty seconds, " +
    "filter My Stats, toggle the Compare radar, and finish on the Pro Tour rankings. Then I'll " +
    "switch to the running app.\"");
}

// Future developments
{
  const s = pres.addSlide(); bg(s);
  addSlideHeader(s, "6.2 FUTURE DEVELOPMENTS", "What v2 would add");
  const items = [
    ["Per-player shot averages", "Padel API doesn't currently expose them. v2 would scrape them from match-level video annotations."],
    ["Sensor integration", "Modern padel paddles (Babolat Pop, Zepp) push event streams. Plugging them in unlocks the spatial layer deliberately left out of v1."],
    ["Multi-user support", "Currently single-user. Add Streamlit auth + per-user CSV so a club coach can see every student."],
    ["Mobile-first redesign", "Logging is a phone task. Streamlit's mobile layout is OK; a native wrap would be better."],
    ["LLM-generated weekly digest", "\"This week your bandeja was on; your smash bled 12 points. Drill X.\""],
  ];
  let ty = 1.55;
  items.forEach(([title, desc]) => {
    s.addText("+", {
      shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05,
      x: 0.55, y: ty, w: 0.34, h: 0.34, fill: { color: C.sky },
      fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: BODY, margin: 0,
    });
    s.addText(title, { x: 1.05, y: ty - 0.04, w: 8.4, h: 0.3, fontSize: 14, bold: true, color: C.navy, fontFace: HEADER, margin: 0 });
    s.addText(desc, { x: 1.05, y: ty + 0.26, w: 8.4, h: 0.34, fontSize: 10.5, color: C.muted, fontFace: BODY, margin: 0 });
    ty += 0.66;
  });
  addFooter(s, 31);
  s.addNotes("\"Five things I'd add next: per-player shot stats once the data exists, paddle-sensor " +
    "integration to unlock the spatial layer, multi-user support for coaches, a mobile-first " +
    "redesign, and an LLM weekly digest. None of these change the core thesis - they extend it.\"");
}

// Closing
{
  const s = pres.addSlide(); bg(s, C.navy);
  s.addText("THANK YOU", { x: 0.6, y: 1.7, w: 8.8, h: 0.9, fontSize: 46, bold: true, color: "FFFFFF", align: "center", fontFace: HEADER, margin: 0 });
  s.addText("Questions?", { x: 0.6, y: 2.7, w: 8.8, h: 0.5, fontSize: 22, color: C.sky, align: "center", fontFace: HEADER, margin: 0 });
  s.addText("App code, wireframes, data and these slides bundled in the Padel-Project repository - available on request.",
    { x: 1.2, y: 3.5, w: 7.6, h: 0.6, fontSize: 12, color: "CBD5E1", align: "center", fontFace: BODY, margin: 0 });
  s.addText("\"You don't have to feel your game - you can see it.\"",
    { x: 1.2, y: 4.2, w: 7.6, h: 0.5, fontSize: 14, italic: true, color: "E2E8F0", align: "center", fontFace: BODY, margin: 0 });
  s.addNotes("\"That's PadelLens. Thank you - happy to take questions.\"");
}

pres.writeFile({ fileName: path.join(__dirname, "PadelLens_Deck.pptx") })
  .then(() => console.log("Deck written:", path.join(__dirname, "PadelLens_Deck.pptx")));
