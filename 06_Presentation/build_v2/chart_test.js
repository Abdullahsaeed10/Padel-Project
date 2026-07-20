const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const s = pres.addSlide();

const cats = ["After set 1", "In a decider (3rd set)"];
s.addChart(
  [
    { type: pres.ChartType.line, data: [{ name: "Set-1 winner's win rate", labels: cats, values: [86.2, 49.3] }],
      options: { chartColors: ["0EA5E9"], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 10, showValue: true, dataLabelPosition: "t", dataLabelColor: "1F2937", dataLabelFontSize: 12 } },
    { type: pres.ChartType.line, data: [{ name: "Coin flip", labels: cats, values: [50, 50] }],
      options: { chartColors: ["9AA3AD"], lineSize: 1.5, lineDataSymbol: "none", dashType: "dash", showValue: false } },
  ],
  { x: 0.5, y: 0.5, w: 8, h: 4.5, valAxisMinVal: 0, valAxisMaxVal: 100, showLegend: false, catAxisLabelColor: "6B7280", valAxisLabelColor: "6B7280", valGridLine: { color: "E5E7EB", size: 0.75 }, catGridLine: { style: "none" } }
);
pres.writeFile({ fileName: "chart_test.pptx" }).then(()=>console.log("ok"));
