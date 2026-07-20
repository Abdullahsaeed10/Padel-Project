const M = require("./part2.js");
const {
  pres, newSlide, footer, badge, titleBlock, card, bulletsBlock, sectionSlide, tag,
  INK, MUTED, CAPTION, ACCENT, ACCENT_LIGHT, ACCENT_DARK, RED, RED_LIGHT, BORDER, CARD_BG, WHITE, GRAY_WEDGE,
  TITLE_FONT, BODY_FONT, TOTAL, ASSETS, getSlideNum,
} = M;

// =====================================================================
// SECTION 3 — UX DESIGN & HEURISTIC EVALUATION (slides 14-17)
// =====================================================================

// Slide 14 — IA + wireframes
{
  const s = sectionSlide({
    sectionNum: 3, sectionName: "UX Design & Heuristic Evaluation",
    kicker: "§3.1–3.2 Information architecture & wireframes", title: "Five pages, five tasks, one working app",
    notes: "The app has five pages, and each one maps to a specific task from the brief. Home answers 'how am I doing right now' above the fold. Pro Tour anchors the project in real data. My Stats is the deep-dive — partner effects, shot balance, fatigue. Log a Match is the friction killer, built for under ninety seconds. And Compare bridges the personal and pro-tour layers. I sketched on paper first, then moved to low-fidelity wireframes in Figma — these five, grayscale, layout-only. I deliberately stopped there instead of building a full click-prototype: the deliverable is a working Streamlit app, and a wireframe-to-Streamlit jump is a one-step move, not three more days of prototyping theatre.",
  });
  const pages = [
    ["Home", "\"How am I doing right now?\" — above the fold"],
    ["Pro Tour", "Explore rankings, matches, surface effects"],
    ["My Stats", "Deep-dive: partner, shots, fatigue"],
    ["Log a Match", "Add a match in ≤ 90 seconds"],
    ["Compare", "Shot mix vs. pro reference"],
  ];
  const cw = 2.36, gx = 0.13, x0 = 0.55, y0 = 1.55;
  pages.forEach((p, i) => {
    const x = x0 + i * (cw + gx);
    card(s, x, y0, cw, 1.3, { fill: CARD_BG });
    s.addText(p[0], { x: x + 0.14, y: y0 + 0.12, w: cw - 0.28, h: 0.32, fontFace: BODY_FONT, bold: true, fontSize: 13, color: ACCENT_DARK, margin: 0 });
    s.addText(p[1], { x: x + 0.14, y: y0 + 0.46, w: cw - 0.28, h: 0.8, fontFace: BODY_FONT, fontSize: 10, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
  });

  // wireframe strip
  const imgs = ["01_home.png", "02_pro_tour.png", "03_my_stats.png", "04_log_match.png", "05_compare.png"];
  const iw = 2.36, ih = iw * 1200 / 1920;
  let ix = x0;
  const iy = 3.05;
  imgs.forEach((f) => {
    s.addImage({ path: `${ASSETS}/${f}`, x: ix, y: iy, w: iw, h: ih });
    s.addShape(pres.ShapeType.rect, { x: ix, y: iy, w: iw, h: ih, fill: { type: "none" }, line: { color: BORDER, width: 0.75 } });
    ix += iw + gx;
  });
  s.addText("Low-fidelity wireframes (03_UX/wireframes) — grayscale, layout-only, before any color or chart styling", {
    x: x0, y: iy + ih + 0.12, w: 12.25, h: 0.35, fontFace: BODY_FONT, italic: true, fontSize: 11, color: CAPTION, margin: 0,
  });

  bulletsBlock(s, [
    "Process: paper sketch (~30 min) → low-fi Figma wireframes → mid-fi (chart shapes) → Streamlit build is the high-fi",
    "No full click-prototype: the deliverable is a working app — wireframe-to-Streamlit is a one-step jump, not prototyping theatre",
  ], x0, iy + ih + 0.55, 12.25, 1.0, { fontSize: 12.5, spaceAfter: 8 });
}

// Slide 15 — Usability principles
{
  const s = sectionSlide({
    sectionNum: 3, sectionName: "UX Design & Heuristic Evaluation",
    kicker: "§3.3 Usability principles", title: "Six principles for sports analytics",
    notes: "Six principles drove the design. One number above the fold, because Marco opens this app in bursts, right after or right before a match. Recognition over recall — filters stay visible in the sidebar, never hidden behind a button. Default to action — logging a match is the most prominent button on the home page, because that's what keeps the whole pipeline alive. Reduce entry friction — shot tallies are optional, only score and partner are required. Honest visual hierarchy — red only for negative signal, never decoration. And annotate, don't decorate — every chart carries at least one in-canvas callout, directly applying Kirk's focus principle.",
  });
  const principles = [
    ["1", "One number above the fold", "A 42pt headline answers \"how am I doing?\" — everything else is one click away."],
    ["2", "Recognition over recall", "Pro Tour filters are always visible in the sidebar, never hidden behind a button."],
    ["3", "Default to action", "\"+ Log a new match\" is the single primary call-to-action on Home, in the accent color."],
    ["4", "Reduce data-entry friction", "Required block (date, partner, score) saves in ~30s; shot tallies are optional."],
    ["5", "Honest visual hierarchy", "Red is reserved for negative signal only — a losing partner, a net-negative shot."],
    ["6", "Annotate, don't decorate", "Every chart has at least one in-canvas annotation — Kirk's focus principle, applied."],
  ];
  const cw = 5.95, x0 = 0.55, y0 = 1.55, ch = 1.62, gy = 0.14;
  principles.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (cw + 0.25), y = y0 + row * (ch + gy);
    card(s, x, y, cw, ch);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.2, w: 0.4, h: 0.4, fill: { color: ACCENT }, line: { type: "none" } });
    s.addText(p[0], { x: x + 0.2, y: y + 0.2, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: BODY_FONT, bold: true, fontSize: 15, color: WHITE, margin: 0 });
    s.addText(p[1], { x: x + 0.75, y: y + 0.15, w: cw - 1.0, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
    s.addText(p[2], { x: x + 0.75, y: y + 0.52, w: cw - 1.0, h: ch - 0.65, fontFace: BODY_FONT, fontSize: 11.3, color: MUTED, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  });
}

// Slide 16 — Nielsen Round 1
{
  const s = sectionSlide({
    sectionNum: 3, sectionName: "UX Design & Heuristic Evaluation",
    kicker: "§3.4 Heuristic evaluation — Round 1", title: "Nielsen's 10 against the first sketches",
    notes: "I ran Nielsen's ten heuristics against my first paper sketches, and two flagged real problems that changed the design. Error prevention: my original log form let you enter a set-three score even when sets one and two were already decided in straight sets — I added input gating so set three only unlocks once the first two sets are split. Recognition over recall: I'd originally hidden the Pro Tour filters behind a button — I moved them to an always-visible sidebar. These weren't theoretical checkbox items; they're the concrete difference between the paper sketch and what's in the wireframes you just saw.",
  });
  s.addText("All 10 heuristics checked against low-fi wireframes — 8 passed as designed, 2 drove a concrete change", {
    x: 0.55, y: 1.5, w: 12.25, h: 0.4, fontFace: BODY_FONT, fontSize: 13, italic: true, color: MUTED, margin: 0,
  });
  const changes = [
    ["#5 · Error prevention", "Before", "The form let you enter a Set 3 score even with Sets 1–2 already decided 6-0, 6-0.", "After", "Set 3 inputs disabled until Sets 1–2 are split 1–1 — input gating."],
    ["#6 · Recognition rather than recall", "Before", "Pro Tour filters were hidden behind a \"Filters\" button.", "After", "Filters moved to an always-visible sidebar — no recall needed."],
  ];
  let cy = 2.1;
  changes.forEach((c) => {
    card(s, 0.55, cy, 12.25, 1.95, { fill: CARD_BG });
    tag(s, 0.8, cy + 0.2, c[0], { w: 3.6 });
    card(s, 0.8, cy + 0.65, 5.6, 1.1, { fill: RED_LIGHT, noShadow: true });
    s.addText(c[1], { x: 1.0, y: cy + 0.72, w: 5.2, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 11.5, color: RED, margin: 0 });
    s.addText(c[2], { x: 1.0, y: cy + 1.0, w: 5.2, h: 0.68, fontFace: BODY_FONT, fontSize: 11, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    card(s, 6.6, cy + 0.65, 5.9, 1.1, { fill: ACCENT_LIGHT, noShadow: true });
    s.addText(c[3], { x: 6.8, y: cy + 0.72, w: 5.5, h: 0.3, fontFace: BODY_FONT, bold: true, fontSize: 11.5, color: ACCENT_DARK, margin: 0 });
    s.addText(c[4], { x: 6.8, y: cy + 1.0, w: 5.5, h: 0.68, fontFace: BODY_FONT, fontSize: 11, color: INK, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    cy += 2.1;
  });
  s.addText("Round 1 was a self-evaluation against static wireframes — Round 2 (next slide) brings in independent evaluators and the live app.", {
    x: 0.55, y: 6.25, w: 12.25, h: 0.6, fontFace: BODY_FONT, italic: true, fontSize: 12, color: CAPTION, margin: 0,
  });
}

// Slide 17 — Validation loop
{
  const s = sectionSlide({
    sectionNum: 3, sectionName: "UX Design & Heuristic Evaluation",
    kicker: "§3.5 Validation loop", title: "Instruments ready — sessions scheduled",
    notes: "This is the step the first evaluation correctly called out as essentially absent — no user testing, no SUS score, and a heuristic evaluation that only found two changes. Here's the honest status: I've built the complete instrument pack — a persona survey, a semi-structured interview guide, the standard ten-item SUS in English and Italian, a five-task think-aloud testing protocol, and a Round 2 heuristic evaluation for two independent classmate evaluators against the live app, not sketches. What I haven't done yet is run the actual sessions — recruiting three to five club players is the bottleneck, and those sessions are scheduled before the oral defense. I'd rather report 'in progress, honestly' than fabricate a SUS score.",
  });
  const loop = ["Persona survey\n(01)", "Interview guide\n(02)", "Testing protocol\n+ SUS (03, 04)", "Heuristic eval\nRound 2 (05)"];
  const bw = 2.75, gap = 0.35, x0 = 0.55, y0 = 1.6;
  loop.forEach((st, i) => {
    const x = x0 + i * (bw + gap);
    card(s, x, y0, bw, 1.35, { fill: ACCENT_LIGHT });
    s.addText(st, { x: x + 0.15, y: y0 + 0.15, w: bw - 0.3, h: 1.05, fontFace: BODY_FONT, bold: true, fontSize: 12.5, color: ACCENT_DARK, align: "center", valign: "middle", margin: 0 });
    if (i < 3) s.addText("→", { x: x + bw, y: y0 + 0.35, w: gap, h: 0.6, fontFace: BODY_FONT, fontSize: 20, color: ACCENT, align: "center", valign: "middle", margin: 0 });
  });

  card(s, 0.55, 3.25, 12.25, 3.65, { fill: CARD_BG });
  s.addText("Honest status: in progress, not fabricated", { x: 0.85, y: 3.45, w: 11.6, h: 0.35, fontFace: BODY_FONT, bold: true, fontSize: 14.5, color: INK, margin: 0 });
  bulletsBlock(s, [
    { text: "Ready: 10–12 question persona survey (EN/IT), 15-min interview guide, standard 10-item SUS (EN/IT, scored 0–100), a 5-task think-aloud protocol mapped to all 5 app pages, and a Round-2 Nielsen evaluation pack for 2 independent classmate evaluators against the live app.", },
    { text: "Not yet run: sessions with 3–5 real club players + 1–2 external evaluators — recruiting is the scheduling bottleneck. Scheduled before the oral defense.", },
    { text: "This directly answers the prior evaluation's \"validation is essentially absent — no user testing or SUS score.\" The instruments exist; the results genuinely don't yet, and this deck says so rather than inventing a number.", bold: true, color: ACCENT_DARK },
  ], 0.85, 3.9, 11.6, 2.85, { fontSize: 13, spaceAfter: 14 });
}

console.log("part3 loaded, slide num=" + getSlideNum());
module.exports = M;
