import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
  ComposedChart, AreaChart, Area
} from "recharts";

/* =========================================================================
   N4A.ORB v27.2 — INTERACTIVE MONTE CARLO ANALYSIS DASHBOARD v2
   Editorial / Trading-Terminal aesthetic
   ========================================================================= */

// ============================================================
// FONTS
// ============================================================
function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400;1,9..144,500&family=JetBrains+Mono:wght@300;400;500;600&family=Manrope:wght@200;300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch (e) {}
    };
  }, []);
}

const FONT_DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif';
const FONT_BODY = '"Manrope", ui-sans-serif, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ============================================================
// DATA
// ============================================================
const STRATEGIES = {
  hunter: {
    id: "hunter",
    name: "Hunter Partial 0.7R/50%",
    short: "Hunter",
    tagline: "All 5 days · highest trade frequency",
    trades: 322, netProfit: 32809, pf: 1.75, profitDD: 7.49,
    wcDD: 4382, wcR: 5.48, mlDD: 2813, luckyDD: 1758,
    noRec: 7.0, wr: 65.2, tu: 63,
    monthlyTrades: 20,
    luckyR: 2.20, mlR: 3.52, wcR_mult: 5.48,
    luckyTU: 60, mlTU: 63, wcTU: 67,
    luckyLS: 3, mlLS: 4, wcLS: 6,
    luckyWS: 8, mlWS: 11, wcWS: 17,
    color: "#fbbf24", colorBright: "#fde68a", colorDim: "rgba(251,191,36,0.15)"
  },
  consDorb: {
    id: "consDorb",
    name: "Conservative + DORB",
    short: "Cons+DORB",
    tagline: "Best metrics · low frequency",
    trades: 155, netProfit: 34402, pf: 2.75, profitDD: 11.37,
    wcDD: 3027, wcR: 3.78, mlDD: 1926, luckyDD: 1308,
    noRec: 5.5, wr: 68.4, tu: 52.3,
    monthlyTrades: 10,
    luckyR: 1.64, mlR: 2.41, wcR_mult: 3.78,
    luckyTU: 47.7, mlTU: 52.3, wcTU: 56.1,
    luckyLS: 3, mlLS: 4, wcLS: 6,
    luckyWS: 8, mlWS: 11, wcWS: 16,
    color: "#34d399", colorBright: "#a7f3d0", colorDim: "rgba(52,211,153,0.15)"
  },
  comboB: {
    id: "comboB",
    name: "Combo B",
    short: "Combo B",
    tagline: "Recommended · Hunter (M/W/F) + Cons+DORB (Tu/Th)",
    trades: 253, netProfit: 34457, pf: 2.07, profitDD: 9.51,
    wcDD: 3625, wcR: 4.53, mlDD: 2318, luckyDD: 1650,
    noRec: 6.0, wr: 68.0, tu: 60.5,
    monthlyTrades: 16,
    luckyR: 2.06, mlR: 2.90, wcR_mult: 4.53,
    luckyTU: 57.3, mlTU: 60.5, wcTU: 63.6,
    luckyLS: 3, mlLS: 4, wcLS: 6,
    luckyWS: 9, mlWS: 12, wcWS: 18,
    color: "#22d3ee", colorBright: "#a5f3fc", colorDim: "rgba(34,211,238,0.15)"
  }
};

const RISK_TABLES = {
  hunter: {
    50: { SAFE: { risk: 250, mlDD: 880, wcDD: 1370, p99: 1720, annual: 10253, breach: "~1%" }, MODERATE: { risk: 325, mlDD: 1144, wcDD: 1781, p99: 2236, annual: 13329, breach: "~3%" }, AGGRESSIVE: { risk: 375, mlDD: 1320, wcDD: 2055, p99: 2580, annual: 15379, breach: "~5-7%" } },
    100: { SAFE: { risk: 375, mlDD: 1320, wcDD: 2055, p99: 2580, annual: 15379, breach: "~1%" }, MODERATE: { risk: 500, mlDD: 1760, wcDD: 2740, p99: 3440, annual: 20506, breach: "~3%" }, AGGRESSIVE: { risk: 550, mlDD: 1936, wcDD: 3014, p99: 3784, annual: 22556, breach: "~5-7%" } },
    150: { SAFE: { risk: 550, mlDD: 1936, wcDD: 3014, p99: 3784, annual: 22556, breach: "~1%" }, MODERATE: { risk: 750, mlDD: 2640, wcDD: 4110, p99: 5160, annual: 30758, breach: "~3%" }, AGGRESSIVE: { risk: 825, mlDD: 2904, wcDD: 4521, p99: 5676, annual: 33834, breach: "~5-7%" } }
  },
  consDorb: {
    50: { SAFE: { risk: 375, mlDD: 903, wcDD: 1419, p99: 1725, annual: 16126, breach: "~1%" }, MODERATE: { risk: 475, mlDD: 1143, wcDD: 1797, p99: 2185, annual: 20426, breach: "~3%" }, AGGRESSIVE: { risk: 525, mlDD: 1264, wcDD: 1986, p99: 2415, annual: 22577, breach: "~5-7%" } },
    100: { SAFE: { risk: 550, mlDD: 1324, wcDD: 2081, p99: 2530, annual: 23652, breach: "~1%" }, MODERATE: { risk: 725, mlDD: 1745, wcDD: 2743, p99: 3335, annual: 31177, breach: "~3%" }, AGGRESSIVE: { risk: 800, mlDD: 1926, wcDD: 3027, p99: 3680, annual: 34402, breach: "~5-7%" } },
    150: { SAFE: { risk: 825, mlDD: 1986, wcDD: 3121, p99: 3795, annual: 35477, breach: "~1%" }, MODERATE: { risk: 1075, mlDD: 2587, wcDD: 4067, p99: 4945, annual: 46228, breach: "~3%" }, AGGRESSIVE: { risk: 1200, mlDD: 2888, wcDD: 4540, p99: 5520, annual: 51604, breach: "~5-7%" } }
  },
  comboB: {
    50: { SAFE: { risk: 300, mlDD: 869, wcDD: 1359, p99: 1669, annual: 12921, breach: "~1%" }, MODERATE: { risk: 400, mlDD: 1159, wcDD: 1812, p99: 2225, annual: 17229, breach: "~3%" }, AGGRESSIVE: { risk: 450, mlDD: 1304, wcDD: 2039, p99: 2503, annual: 19382, breach: "~5-7%" } },
    100: { SAFE: { risk: 450, mlDD: 1304, wcDD: 2039, p99: 2503, annual: 19382, breach: "~1%" }, MODERATE: { risk: 600, mlDD: 1738, wcDD: 2719, p99: 3337, annual: 25843, breach: "~3%" }, AGGRESSIVE: { risk: 650, mlDD: 1883, wcDD: 2945, p99: 3615, annual: 27996, breach: "~5-7%" } },
    150: { SAFE: { risk: 700, mlDD: 2028, wcDD: 3172, p99: 3893, annual: 30150, breach: "~1%" }, MODERATE: { risk: 900, mlDD: 2608, wcDD: 4078, p99: 5006, annual: 38764, breach: "~3%" }, AGGRESSIVE: { risk: 1000, mlDD: 2897, wcDD: 4531, p99: 5562, annual: 43071, breach: "~5-7%" } }
  }
};

const HUNTER_CONFIGS = [
  { rank: 1, name: "Partial 0.7R/50%", trades: 322, netProfit: 32809, pf: 1.75, mlDD: 2813, wcDD: 4382, wcR: 5.48, profitDD: 7.49, noRec: 7.0, winner: true },
  { rank: 2, name: "Partial 0.5R/50%", trades: 322, netProfit: 28625, pf: 1.70, mlDD: 2874, wcDD: 4487, wcR: 5.61, profitDD: 6.38, noRec: 8.3 },
  { rank: 3, name: "Partial 0.7R/25%", trades: 322, netProfit: 37814, pf: 1.78, mlDD: 3923, wcDD: 6249, wcR: 7.81, profitDD: 6.05, noRec: 8.5 },
  { rank: 4, name: "BE 0.7R + Part 25%", trades: 322, netProfit: 29149, pf: 1.80, mlDD: 3402, wcDD: 5354, wcR: 6.69, profitDD: 5.44, noRec: 10.0 },
  { rank: 5, name: "Full Optimized", trades: 162, netProfit: 42937, pf: 1.82, mlDD: 5048, wcDD: 8168, wcR: 10.21, profitDD: 5.26, noRec: 9.7 },
  { rank: 6, name: "BE 1R + Part 25%", trades: 322, netProfit: 32136, pf: 1.69, mlDD: 3889, wcDD: 6190, wcR: 7.74, profitDD: 5.19, noRec: 10.3 },
  { rank: 7, name: "BE 0.7R", trades: 322, netProfit: 32086, pf: 1.87, mlDD: 4384, wcDD: 7141, wcR: 8.93, profitDD: 4.49, noRec: 11.4 },
  { rank: 8, name: "Baseline", trades: 162, netProfit: 41960, pf: 1.62, mlDD: 6072, wcDD: 9628, wcR: 12.04, profitDD: 4.36, noRec: 11.2 },
  { rank: 9, name: "BE 1R", trades: 322, netProfit: 34104, pf: 1.72, mlDD: 4996, wcDD: 8079, wcR: 10.10, profitDD: 4.22, noRec: 11.3 }
];

// ============================================================
// PINE SETTINGS — extracted from Recommended Setups PDF
// ============================================================
const PINE_SETTINGS = {
  hunter: {
    title: "Hunter Bot",
    days: "Mon · Wed · Fri",
    chart: "MNQ1!",
    timeframe: "5 minute",
    execution: "MNQ direct (no NQ scaling)",
    riskValue: 300,
    accent: "amber",
    color: "#fbbf24",
    sections: [
      { title: "ORB Logic Mode", items: [["ORB Logic Mode", "Classic"]] },
      { title: "Alert Settings", items: [["Alert Ticker Symbol", "MNQ1!"]] },
      { title: "Time-Zone & Session", items: [["Select Time-Zone", "New York"], ["Session Setup", "New York"]] },
      { title: "Entry Time (Hunter)", items: [["Hunter Entry Time Range", "0945-1100"]] },
      { title: "ORB Settings", items: [["ORB TF", "15"]] },
      { title: "Weekday Filter", critical: true, items: [["Mondays", "ON"], ["Tuesdays", "OFF"], ["Wednesdays", "ON"], ["Thursdays", "OFF"], ["Fridays", "ON"]] },
      { title: "Direction Filter", items: [["All days", "Both"]] },
      { title: "Risk Settings — Classic ORB", items: [["Use fixed $ risk per trade", "ON"], ["Max $ per trade", "$300"], ["Max contracts cap", "20"]] },
      { title: "MNQ Execution Mode", items: [["Enable MNQ Execution", "OFF"]], note: "Chart is already MNQ — no scaling needed" },
      { title: "Other Toggles", items: [["Min Raw Qty Filter", "OFF"], ["Force Flat", "OFF"], ["Trail Stop", "OFF"]] },
      { title: "Cool-Down (Hunter)", items: [["Minutes", "5"]] },
      { title: "Session Trade Limits", items: [["Classic Session Limit Mode", "Win-Loss Based"], ["Max Re-entries After Loss", "1"]] },
      { title: "Maximum Hold Time", items: [["Max hold for Classic", "270"]] },
      { title: "Strategy Mode (Classic)", items: [["Select Mode", "Hunter"]] },
      { title: "Hunter Mode Settings", items: [["Enable Hunter SL Mode", "ON"], ["Hunter Target R:R", "2.0"], ["Hunter SL Buffer", "0.0"], ["Enable Optimized Hunter", "ON"], ["Full Optimized", "ON"], ["Enable Large SL RR Reduction", "ON"], ["Large SL Threshold", "50"], ["Reduced Target RR", "1.0"]] },
      { title: "Hunter Break-Even", items: [["Enable Hunter Break-Even", "OFF"]] },
      { title: "Hunter Partial TP", critical: true, items: [["Enable Hunter Partial TP", "ON"], ["Hunter Partial Trigger", "0.7"], ["Hunter Partial Exit %", "50"], ["Hunter T2 Target", "2.0"]] }
    ]
  },
  consDorb: {
    title: "Conservative+DORB Bot",
    days: "Tue · Thu",
    chart: "NQ1!",
    timeframe: "5 minute",
    execution: "MNQ via NQ scaling (Execution ON)",
    riskValue: 300,
    accent: "emerald",
    color: "#34d399",
    sections: [
      { title: "ORB Logic Mode", critical: true, items: [["ORB Logic Mode", "Classic"]], note: "Classic ONLY — no FVG component for Combo B" },
      { title: "Alert Settings", items: [["Alert Ticker Symbol", "MNQ1!"]] },
      { title: "Time-Zone & Session", items: [["Select Time-Zone", "New York"], ["Session Setup", "New York"]] },
      { title: "Entry Time (Classic)", items: [["Entry Time Range", "0945-1040"]] },
      { title: "ORB Settings", items: [["ORB TF", "15"]] },
      { title: "Weekday Filter (Classic)", critical: true, items: [["Mondays", "OFF"], ["Tuesdays", "ON"], ["Wednesdays", "OFF"], ["Thursdays", "ON"], ["Fridays", "OFF"]] },
      { title: "Direction Filter", items: [["All days", "Both"]] },
      { title: "Risk Settings — Classic ORB", items: [["Use fixed $ risk per trade", "ON"], ["Max $ per trade", "$300"], ["Max contracts cap", "20"]] },
      { title: "MNQ Execution Mode", critical: true, items: [["Enable MNQ Execution", "ON"]], note: "Chart is NQ but executes MNQ — must be ON" },
      { title: "Other Toggles", items: [["Min Raw Qty Filter", "OFF"], ["Force Flat", "OFF"], ["Trail Stop", "OFF"]] },
      { title: "Cool-Down (Classic)", items: [["Minutes", "50"]] },
      { title: "Session Trade Limits", items: [["Classic Session Limit Mode", "Win-Loss Based"], ["Max Re-entries After Loss", "1"]] },
      { title: "Maximum Hold Time", items: [["Max hold for Classic", "270"]] },
      { title: "Strategy Mode (Classic)", items: [["Select Mode", "Conservative"]] },
      { title: "SD Target Settings", critical: true, items: [["SD0.5 Target", "OFF"], ["SD1.0 Target", "ON"], ["Exit % at SD1.0", "100"], ["SD1.5 Target", "OFF"], ["SD2.0 Target", "OFF"]] }
    ]
  }
};

// ============================================================
// ATOMS
// ============================================================
const Mono = ({ children, className = "" }) => (
  <span className={className} style={{ fontFamily: FONT_MONO }}>{children}</span>
);

const Display = ({ children, className = "", italic = false, weight = 400 }) => (
  <span className={className} style={{ fontFamily: FONT_DISPLAY, fontWeight: weight, fontStyle: italic ? "italic" : "normal" }}>{children}</span>
);

// Section number label - editorial style
function SectionMarker({ number, label, accent = "#f59e0b" }) {
  return (
    <div className="flex items-baseline gap-4 mb-8 mt-20">
      <Mono className="text-xs tracking-[0.3em]" style={{ color: accent }}>
        / {String(number).padStart(2, "0")}
      </Mono>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }} />
      <Mono className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</Mono>
    </div>
  );
}

// Corner brackets decoration
function CornerBrackets({ color = "#f59e0b" }) {
  return (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: color }} />
    </>
  );
}

// Tooltip for charts
const tooltipBaseStyle = {
  backgroundColor: "rgba(8, 11, 18, 0.95)",
  border: "1px solid #1e293b",
  borderRadius: 4,
  padding: "8px 12px",
  fontFamily: FONT_MONO,
  fontSize: 11,
  backdropFilter: "blur(8px)"
};

// ============================================================
// HERO
// ============================================================
function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-amber-500/20 bg-black">
      {/* Atmospheric layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 80% 30%, rgba(245,158,11,0.12), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(34,211,238,0.06), transparent 50%)"
        }} />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-16">
        {/* Top status bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-12 text-[10px]">
          <Mono className="tracking-[0.3em] text-amber-500">
            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2" />
            PLAYBIT.SYS / MONTE.CARLO / V27.2
          </Mono>
          <Mono className="tracking-[0.2em] text-slate-600">EST 2026-05</Mono>
          <Mono className="tracking-[0.2em] text-slate-600 hidden md:inline">MNQ · NQ · 5M · TRADINGVIEW</Mono>
        </div>

        {/* Main headline — editorial scale */}
        <div className="grid md:grid-cols-12 gap-6 items-end mb-16">
          <div className="md:col-span-9">
            <div className="overflow-hidden">
              <h1 className="text-[3.5rem] md:text-[6rem] leading-[0.95] tracking-[-0.04em] text-slate-50" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                The Monte Carlo
                <br />
                <span style={{ fontStyle: "italic", color: "#fbbf24" }}>verdict</span>
                <span className="text-amber-500/60">.</span>
              </h1>
            </div>
            <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
              Three configurations of <Mono className="text-amber-300">N4A.ORB v27.2</Mono>, ten thousand reshuffles each,
              calibrated to a <span className="text-slate-200">Tradeify 50K Lightning</span> account
              ($2,000 EOD trail, $1,250 DLL). Every chart, every number, every Pine setting — derived from your reports.
            </p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <Mono className="block text-[10px] uppercase tracking-[0.3em] text-slate-600">Dataset</Mono>
            <div className="text-3xl text-slate-200 mt-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, fontStyle: "italic" }}>16 months</div>
            <Mono className="block text-[10px] tracking-wider text-slate-600 mt-1">Jan 2025 → May 2026</Mono>
          </div>
        </div>

        {/* Bottom strip - meta info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800/40 border border-slate-800">
          {[
            ["Markets", "MNQ + NQ"],
            ["Timeframe", "5-minute"],
            ["Reshuffles", "10,000 / config"],
            ["Live track", "16mo + 2.5mo"]
          ].map(([k, v]) => (
            <div key={k} className="bg-black/60 px-4 py-3">
              <Mono className="block text-[9px] uppercase tracking-[0.3em] text-slate-600">{k}</Mono>
              <div className="text-slate-200 text-sm mt-0.5" style={{ fontFamily: FONT_BODY }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// VERDICT
// ============================================================
function VerdictCard() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 mt-20">
      <SectionMarker number={1} label="The Recommendation" accent="#fbbf24" />

      <div className="relative grid lg:grid-cols-12 gap-0 border border-amber-500/30 bg-gradient-to-br from-slate-950 via-black to-amber-950/10 overflow-hidden">
        <CornerBrackets color="#fbbf24" />

        {/* Left side — the recommendation */}
        <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-amber-500/20 relative">
          <Mono className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 mb-4 block">
            ◆ verdict no.1
          </Mono>
          <h2 className="text-4xl md:text-5xl leading-[1.05] tracking-tight text-slate-100" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
            Run <span style={{ fontStyle: "italic", color: "#fbbf24" }}>Combo B</span>
            <br />
            at <Mono className="text-amber-400 text-4xl md:text-5xl font-light">$300</Mono> per trade.
          </h2>
          <p className="text-slate-400 text-base mt-6 max-w-xl leading-relaxed">
            Two Pine scripts run in parallel on one Tradeify account. Hunter trades Mon/Wed/Fri.
            Conservative+DORB trades Tue/Thu. Day filters in Pine guarantee no overlap.
            You get Cons+DORB's elite metrics on its strongest days plus full 5-day coverage on the rest.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 bg-amber-500 text-black font-bold tracking-wide" style={{ fontFamily: FONT_BODY }}>SAFE PROFILE</span>
            <Mono className="text-slate-500">→</Mono>
            <span className="text-slate-300">~1% breach probability</span>
          </div>
        </div>

        {/* Right side — the numbers */}
        <div className="lg:col-span-5 p-8 md:p-10 bg-black/40">
          <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-6 block">Projected outcomes</Mono>

          <div className="space-y-5">
            <div>
              <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Annual profit</Mono>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl text-emerald-400" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>$12,921</span>
                <Mono className="text-xs text-slate-500">/year</Mono>
              </div>
              <Mono className="text-xs text-slate-600 mt-1 block">≈ $1,077 / month</Mono>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Worst-case DD</Mono>
                <div className="text-3xl text-rose-400" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>$1,359</div>
                <Mono className="text-[10px] text-slate-600">68% of $2,000 trail</Mono>
              </div>
              <div>
                <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Profit / DD</Mono>
                <div className="text-3xl text-amber-400" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>9.51</div>
                <Mono className="text-[10px] text-slate-600">top decile threshold: 6.0</Mono>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// COMBO B EXPLAINER
// ============================================================
function ComboBExplainer() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={2} label="The Schedule" accent="#fbbf24" />

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <h3 className="text-3xl md:text-4xl leading-tight text-slate-100" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
            Two Pine scripts.
            <br />
            <span style={{ fontStyle: "italic", color: "#fbbf24" }}>One account.</span>
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mt-4">
            Day filters baked into each script ensure only one bot is "live" on any given day.
            They share the trailing drawdown limit — that's why Combo B risk-per-trade is set lower than each standalone version.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-4 p-4 border-l-2 border-amber-500 bg-amber-500/5">
              <Mono className="text-amber-400 text-2xl mt-1">01</Mono>
              <div>
                <div className="text-amber-300 text-sm" style={{ fontFamily: FONT_BODY, fontWeight: 600 }}>Hunter</div>
                <Mono className="text-[11px] text-slate-500 mt-1 block">CHART · MNQ1! / 5M</Mono>
                <Mono className="text-[11px] text-slate-500 block">DAYS · MON · WED · FRI</Mono>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border-l-2 border-emerald-500 bg-emerald-500/5">
              <Mono className="text-emerald-400 text-2xl mt-1">02</Mono>
              <div>
                <div className="text-emerald-300 text-sm" style={{ fontFamily: FONT_BODY, fontWeight: 600 }}>Conservative + DORB</div>
                <Mono className="text-[11px] text-slate-500 mt-1 block">CHART · NQ1! / 5M</Mono>
                <Mono className="text-[11px] text-slate-500 block">DAYS · TUE · THU</Mono>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative border border-slate-800 bg-slate-950/40 p-6 md:p-8">
            <CornerBrackets color="#475569" />
            <div className="flex items-center justify-between mb-6">
              <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Weekly Schedule</Mono>
              <Mono className="text-[10px] tracking-wider text-slate-600">5 sessions / week</Mono>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { day: "Mon", short: "01", bot: "hunter" },
                { day: "Tue", short: "02", bot: "consDorb" },
                { day: "Wed", short: "03", bot: "hunter" },
                { day: "Thu", short: "04", bot: "consDorb" },
                { day: "Fri", short: "05", bot: "hunter" }
              ].map(({ day, short, bot }) => {
                const isHunter = bot === "hunter";
                const c = isHunter ? "amber" : "emerald";
                const accent = isHunter ? "#fbbf24" : "#34d399";
                return (
                  <div key={day} className="relative">
                    <Mono className="text-[10px] tracking-wider text-slate-600 block mb-2">/{short}</Mono>
                    <div className="aspect-[3/4] flex flex-col justify-between p-3 border" style={{
                      borderColor: `${accent}50`,
                      background: `linear-gradient(to bottom, ${accent}10, transparent)`
                    }}>
                      <Mono className="text-[10px] uppercase tracking-wider" style={{ color: accent }}>{day}</Mono>
                      <div>
                        <div className="text-sm leading-none" style={{ color: accent, fontFamily: FONT_DISPLAY, fontStyle: "italic", fontWeight: 400 }}>
                          {isHunter ? "Hunter" : "Cons"}
                        </div>
                        <Mono className="text-[9px] text-slate-600 mt-1.5 block">
                          {isHunter ? "MNQ" : "NQ→MNQ"}
                        </Mono>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-800">
              <div>
                <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-600 block mb-1">Hunter days</Mono>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-amber-400" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>3</span>
                  <Mono className="text-xs text-slate-600">days/wk</Mono>
                </div>
                <Mono className="text-[10px] text-slate-600">≈ 200 trades/yr</Mono>
              </div>
              <div>
                <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-600 block mb-1">Cons+DORB days</Mono>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-emerald-400" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>2</span>
                  <Mono className="text-xs text-slate-600">days/wk</Mono>
                </div>
                <Mono className="text-[10px] text-slate-600">≈ 50 trades/yr</Mono>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TRADINGVIEW SETUP — THE BIG NEW SECTION
// ============================================================

function PineSettingsBlock({ data, expanded, onToggle, accent }) {
  return (
    <div className="border border-slate-800 bg-black/40 mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/40 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          {data.critical && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />}
          <Mono className="text-xs text-slate-300">{data.title}</Mono>
          {data.critical && <Mono className="text-[9px] uppercase tracking-wider px-2 py-0.5" style={{ backgroundColor: `${accent}20`, color: accent }}>critical</Mono>}
        </div>
        <Mono className="text-xs text-slate-600 group-hover:text-slate-400">{expanded ? "−" : "+"}</Mono>
      </button>
      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 space-y-1.5">
          {data.items.map(([k, v], i) => {
            const isOn = v === "ON";
            const isOff = v === "OFF";
            return (
              <div key={i} className="flex items-baseline justify-between gap-4 group">
                <Mono className="text-[11px] text-slate-400 leading-relaxed">{k}</Mono>
                <div className="flex-1 mx-2 border-b border-dashed border-slate-800 mb-1 opacity-50" />
                <Mono
                  className={`text-[11px] tabular-nums ${
                    isOn ? "text-emerald-400" : isOff ? "text-rose-400/80" : "text-amber-300"
                  }`}
                >
                  {v}
                </Mono>
              </div>
            );
          })}
          {data.note && (
            <div className="mt-3 pt-3 border-t border-slate-800/50">
              <Mono className="text-[10px] text-slate-500 italic block leading-relaxed">→ {data.note}</Mono>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PineSettingsBot({ botKey }) {
  const data = PINE_SETTINGS[botKey];
  // Default expanded: critical sections only
  const [expandedSet, setExpandedSet] = useState(
    new Set(data.sections.map((s, i) => s.critical ? i : null).filter(x => x !== null))
  );
  const [showAll, setShowAll] = useState(false);

  const toggle = (i) => {
    const next = new Set(expandedSet);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpandedSet(next);
  };

  const expandAll = () => {
    if (showAll) {
      setExpandedSet(new Set());
      setShowAll(false);
    } else {
      setExpandedSet(new Set(data.sections.map((_, i) => i)));
      setShowAll(true);
    }
  };

  return (
    <div className="relative border-l-2 pl-6" style={{ borderColor: data.color }}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Mono className="text-[10px] uppercase tracking-[0.3em]" style={{ color: data.color }}>BOT · {botKey === "hunter" ? "01" : "02"}</Mono>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${data.color}40, transparent)` }} />
        </div>
        <h4 className="text-2xl text-slate-100 leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
          {data.title}
        </h4>
        <Mono className="text-xs text-slate-500 mt-1 block">{data.days}</Mono>
      </div>

      {/* Bot meta */}
      <div className="grid grid-cols-3 gap-px mb-6 bg-slate-800/40">
        {[
          ["chart", data.chart],
          ["TF", data.timeframe],
          ["risk/trade", `$${data.riskValue}`]
        ].map(([k, v]) => (
          <div key={k} className="bg-black px-3 py-2.5">
            <Mono className="text-[9px] uppercase tracking-wider text-slate-600 block">{k}</Mono>
            <Mono className="text-xs text-slate-200 mt-0.5">{v}</Mono>
          </div>
        ))}
      </div>

      {/* Execution warning */}
      <div className="mb-6 p-3 border border-slate-800 bg-slate-950/60">
        <Mono className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">execution mode</Mono>
        <Mono className="text-xs text-slate-300">{data.execution}</Mono>
      </div>

      <div className="flex items-center justify-between mb-3">
        <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pine inputs</Mono>
        <button onClick={expandAll} className="group">
          <Mono className="text-[10px] tracking-wider text-slate-500 group-hover:text-amber-400 transition-colors">
            {showAll ? "[ collapse all ]" : "[ expand all ]"}
          </Mono>
        </button>
      </div>

      <div>
        {data.sections.map((section, i) => (
          <PineSettingsBlock
            key={i}
            data={section}
            expanded={expandedSet.has(i)}
            onToggle={() => toggle(i)}
            accent={data.color}
          />
        ))}
      </div>
    </div>
  );
}

function TradingViewSetup() {
  const steps = [
    {
      n: "01",
      title: "Pre-flight",
      sub: "Before you touch TradingView",
      points: [
        "TradingView Premium subscription (you'll need 2+ active alerts)",
        "Tradeify Lightning 50K account active in Tradovate",
        "Webhook receiver set up (TradersPost is the standard)",
        "N4A.ORB v27.2 Pine script loaded into your TradingView library"
      ]
    },
    {
      n: "02",
      title: "Chart 1 — Hunter",
      sub: "Open MNQ1! on a 5-minute chart",
      points: [
        "Open TradingView, select symbol MNQ1!",
        "Set timeframe to 5min",
        "Add N4A.ORB v27.2 from Indicators → My Scripts",
        "Click the cog icon on the indicator → Settings",
        "Apply every input from Bot 01 below (use the panel to verify)",
        "Save as preset: 'Hunter Combo B' — important for restore later"
      ]
    },
    {
      n: "03",
      title: "Chart 2 — Cons+DORB",
      sub: "Open NQ1! on a 5-minute chart, separate tab",
      points: [
        "Open a NEW chart tab — switch symbol to NQ1!",
        "Set timeframe to 5min",
        "Add N4A.ORB v27.2 again (same script, different config)",
        "Cog → Settings — apply every input from Bot 02 below",
        "Critical: Enable MNQ Execution must be ON (chart is NQ, executes MNQ)",
        "Critical: ORB Logic Mode = Classic only (no FVG component for Combo B)",
        "Save as preset: 'Cons+DORB Combo B'"
      ]
    },
    {
      n: "04",
      title: "Alerts",
      sub: "Wire each chart to your webhook",
      points: [
        "On Hunter chart: Alt+A or right-click → Add Alert",
        "Condition: select N4A.ORB v27.2 strategy → 'Order fills only'",
        "Webhook URL: paste your TradersPost webhook for the Hunter strategy",
        "Message: use TradersPost's default JSON template (don't customize)",
        "Expiration: 'Open-ended' so it survives restarts",
        "Save. Repeat the entire process on the NQ1! chart for Cons+DORB"
      ]
    },
    {
      n: "05",
      title: "Tradovate / TradersPost",
      sub: "Connect the webhook to your Tradeify account",
      points: [
        "In TradersPost, create two strategies: 'N4A Hunter' and 'N4A Cons+DORB'",
        "Connect both to your Tradeify Tradovate account",
        "Symbol mapping: both should output to MNQ (front month auto-rolls)",
        "Set max position size: 20 contracts (matches Pine cap)",
        "Enable 'Reduce-only on opposite signal' for safety"
      ]
    },
    {
      n: "06",
      title: "Demo first, then live",
      sub: "The non-negotiable validation step",
      points: [
        "Run on a Tradeify SIM/eval (or Tradovate demo) for 2 full weeks first",
        "Verify Hunter only fires on Mon/Wed/Fri, Cons+DORB only on Tue/Thu",
        "Verify per-trade risk = $300 in both Pine inputs",
        "Watch the open of every session for the first 3 days for surprises",
        "Only after 2 clean weeks → flip alerts to your live Tradeify Lightning"
      ]
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={3} label="TradingView Setup" accent="#fbbf24" />

      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl leading-[1.05] text-slate-100" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
          The <span style={{ fontStyle: "italic", color: "#fbbf24" }}>cookbook.</span>
        </h2>
        <p className="text-slate-400 text-base mt-4 max-w-2xl leading-relaxed">
          Step-by-step. Every Pine setting. From a blank TradingView chart to a live Tradeify Lightning account
          in roughly 45 minutes — plus 2 weeks of demo validation.
        </p>
      </div>

      {/* The 6 steps */}
      <div className="grid md:grid-cols-2 gap-px bg-slate-800/40 border border-slate-800 mb-16">
        {steps.map((s, i) => (
          <div key={i} className="bg-black p-6 md:p-8 relative group hover:bg-slate-950/50 transition-colors">
            <div className="flex items-baseline gap-4 mb-4">
              <Mono className="text-3xl text-amber-500/60 group-hover:text-amber-400 transition-colors" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                /{s.n}
              </Mono>
              <div className="h-px flex-1 bg-slate-800 group-hover:bg-amber-500/20 transition-colors" />
            </div>
            <h3 className="text-xl text-slate-100 mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
              {s.title}
            </h3>
            <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-4">{s.sub}</Mono>
            <ul className="space-y-2">
              {s.points.map((p, pi) => (
                <li key={pi} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                  <span className="text-amber-500/60 mt-0.5">→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pine Settings — both bots side by side */}
      <div className="mb-12">
        <div className="flex items-baseline gap-4 mb-2">
          <Mono className="text-xs tracking-[0.3em] text-amber-500">/ pine inputs</Mono>
          <div className="h-px flex-1 bg-amber-500/20" />
        </div>
        <h3 className="text-3xl md:text-4xl text-slate-100 mb-8" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
          Every <span style={{ fontStyle: "italic", color: "#fbbf24" }}>setting</span> · both bots
        </h3>

        <div className="grid lg:grid-cols-2 gap-12">
          <PineSettingsBot botKey="hunter" />
          <PineSettingsBot botKey="consDorb" />
        </div>
      </div>

      {/* Final warning panel */}
      <div className="relative border border-rose-500/30 bg-gradient-to-r from-rose-950/30 to-transparent p-6 md:p-8">
        <CornerBrackets color="#f43f5e" />
        <Mono className="text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-3 block">⚠ critical / do not skip</Mono>
        <h4 className="text-2xl text-slate-100 mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
          Verify the day filters <span style={{ fontStyle: "italic" }}>before</span> live alerts.
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          The single most important thing in Combo B is the day filter on each Pine script. If both bots fire on
          the same day you'll double your position size, breach your trail limit, and fail your account.
          Run the demo for 2 weeks, manually check the trade log every Friday for the first 2 weeks,
          and confirm Hunter never fires on Tue/Thu and Cons+DORB never fires on Mon/Wed/Fri.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// STRATEGY COMPARISON
// ============================================================
function StrategyComparison({ activeStrategy, setActiveStrategy }) {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={4} label="Strategy Compare" accent="#fbbf24" />

      <div className="grid md:grid-cols-3 gap-px bg-slate-800/40 border border-slate-800">
        {Object.values(STRATEGIES).map((s) => {
          const isActive = activeStrategy === s.id;
          const isRecommended = s.id === "comboB";
          return (
            <button
              key={s.id}
              onClick={() => setActiveStrategy(s.id)}
              className="text-left p-6 md:p-8 bg-black hover:bg-slate-950 transition-all relative group"
              style={{
                outline: isActive ? `1px solid ${s.color}` : "none",
                outlineOffset: -1
              }}
            >
              {isRecommended && (
                <div className="absolute top-4 right-4">
                  <Mono className="text-[9px] uppercase tracking-wider px-2 py-1 bg-amber-500 text-black font-bold">PICK</Mono>
                </div>
              )}

              <Mono className="text-[10px] uppercase tracking-[0.3em] mb-2 block transition-colors" style={{ color: isActive ? s.color : "#475569" }}>
                strategy / {s.id === "hunter" ? "01" : s.id === "consDorb" ? "02" : "03"}
              </Mono>
              <div className="text-2xl md:text-3xl mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, fontStyle: "italic", color: isActive ? s.colorBright : "#e2e8f0" }}>
                {s.short}
              </div>
              <Mono className="text-[10px] text-slate-500 block mb-6 leading-relaxed">{s.tagline}</Mono>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Mono className="text-[9px] uppercase tracking-wider text-slate-600 block">Profit/DD</Mono>
                  <div className="text-3xl tabular-nums" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, color: s.color }}>
                    {s.profitDD.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Mono className="text-[9px] uppercase tracking-wider text-slate-600 block">Profit Factor</Mono>
                  <div className="text-3xl tabular-nums text-slate-200" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                    {s.pf.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Mono className="text-[9px] uppercase tracking-wider text-slate-600 block">Trades/mo</Mono>
                  <div className="text-3xl tabular-nums text-slate-200" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                    {s.monthlyTrades}
                  </div>
                </div>
                <div>
                  <Mono className="text-[9px] uppercase tracking-wider text-slate-600 block">WC DD (R)</Mono>
                  <div className="text-3xl tabular-nums text-slate-200" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                    {s.wcR.toFixed(2)}
                  </div>
                </div>
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: s.color }} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================
// STRATEGY DEEP DIVE
// ============================================================
function StrategyDeepDive({ strategy }) {
  const s = STRATEGIES[strategy];

  const scenarioData = [
    { scenario: "Lucky", DD: s.luckyDD, R: s.luckyR, TU: s.luckyTU, LossStreak: s.luckyLS, WinStreak: s.luckyWS, color: "#34d399", pct: "5%" },
    { scenario: "Most Likely", DD: s.mlDD, R: s.mlR, TU: s.mlTU, LossStreak: s.mlLS, WinStreak: s.mlWS, color: "#fbbf24", pct: "50%" },
    { scenario: "Worst Case", DD: s.wcDD, R: s.wcR_mult, TU: s.wcTU, LossStreak: s.wcLS, WinStreak: s.wcWS, color: "#f43f5e", pct: "95%" }
  ];

  const benchmarkData = [
    { metric: "PF", value: Math.min(100, (s.pf / 2.0) * 100), median: 65, top: 90 },
    { metric: "WR", value: Math.min(100, (s.wr / 70) * 100), median: 71, top: 92 },
    { metric: "P/DD", value: Math.min(100, (s.profitDD / 12) * 100), median: 30, top: 75 },
    { metric: "Low DD", value: Math.min(100, ((12 - s.wcR) / 12) * 100), median: 30, top: 70 },
    { metric: "Recovery", value: Math.min(100, ((20 - s.noRec) / 20) * 100), median: 25, top: 80 },
    { metric: "Peak", value: Math.min(100, ((100 - s.tu) / 50) * 100), median: 50, top: 80 }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
      <div className="relative border border-slate-800 bg-gradient-to-br from-slate-950 to-black p-8 md:p-10">
        <div className="absolute top-0 right-0 h-1 w-32" style={{ backgroundColor: s.color }} />

        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-8">
          <div>
            <Mono className="text-[10px] uppercase tracking-[0.3em] block mb-1" style={{ color: s.color }}>active config</Mono>
            <h3 className="text-3xl md:text-4xl text-slate-100" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
              {s.name}
            </h3>
          </div>
          <Mono className="text-xs text-slate-500">10,000 reshuffles · 16mo dataset</Mono>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-6 pb-8 mb-8 border-b border-slate-800">
          {[
            { label: "Net Profit", value: `$${(s.netProfit / 1000).toFixed(1)}k`, color: "text-slate-100" },
            { label: "Trades", value: s.trades, color: "text-slate-100" },
            { label: "Profit Factor", value: s.pf.toFixed(2), color: "text-slate-100" },
            { label: "Win Rate", value: `${s.wr.toFixed(1)}%`, color: "text-slate-100" },
            { label: "Profit/DD", value: s.profitDD.toFixed(2), color: "", style: { color: s.color } },
            { label: "Time Underwater", value: `${s.tu.toFixed(1)}%`, color: "text-slate-100" },
            { label: "No Recovery", value: `${s.noRec.toFixed(1)}%`, color: "text-slate-100" }
          ].map(({ label, value, color, style }) => (
            <div key={label}>
              <Mono className="text-[9px] uppercase tracking-[0.2em] text-slate-500 block mb-1">{label}</Mono>
              <div className={`text-2xl tabular-nums ${color}`} style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, ...style }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Drawdown by scenario */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500">drawdown · scenarios</Mono>
              <Mono className="text-[10px] text-slate-600">size for worst case</Mono>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Plan around <span className="text-amber-400">Most Likely</span>, size for <span className="text-rose-400">Worst Case</span>.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scenarioData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="scenario" tick={{ fill: "#64748b", fontSize: 10, fontFamily: FONT_MONO }} stroke="#1e293b" />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: FONT_MONO }} stroke="#1e293b" tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={tooltipBaseStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="DD" radius={[2, 2, 0, 0]}>
                  {scenarioData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-px bg-slate-800/40 mt-4">
              {scenarioData.map((d, i) => (
                <div key={i} className="bg-black p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <Mono className="text-[9px] uppercase tracking-wider text-slate-500">{d.scenario}</Mono>
                    <Mono className="text-[9px] text-slate-700 ml-auto">{d.pct}</Mono>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <Mono className="text-slate-600">DD$</Mono>
                      <Mono className="text-slate-200">${d.DD.toLocaleString()}</Mono>
                    </div>
                    <div className="flex justify-between">
                      <Mono className="text-slate-600">R-mult</Mono>
                      <Mono className="text-slate-200">{d.R.toFixed(2)}R</Mono>
                    </div>
                    <div className="flex justify-between">
                      <Mono className="text-slate-600">L-streak</Mono>
                      <Mono className="text-slate-200">{d.LossStreak}</Mono>
                    </div>
                    <div className="flex justify-between">
                      <Mono className="text-slate-600">W-streak</Mono>
                      <Mono className="text-slate-200">{d.WinStreak}</Mono>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500">vs · industry benchmarks</Mono>
              <Mono className="text-[10px] text-slate-600">100 = top decile</Mono>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              CSFB / Tremont, Morningstar, eVestment, BarclayHedge composites — normalized to 0-100.
            </p>
            <ResponsiveContainer width="100%" height={310}>
              <RadarChart data={benchmarkData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FONT_MONO }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 9, fontFamily: FONT_MONO }} angle={90} />
                <Radar name="Median" dataKey="median" stroke="#475569" fill="#475569" fillOpacity={0.08} strokeWidth={1} />
                <Radar name="Top decile" dataKey="top" stroke="#64748b" fill="transparent" strokeDasharray="3 3" strokeWidth={1} />
                <Radar name="This config" dataKey="value" stroke={s.color} fill={s.color} fillOpacity={0.35} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: FONT_MONO }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SCENARIO COMPARISON (all 3 strategies)
// ============================================================
function ScenarioComparisonChart() {
  const data = [
    { scenario: "Lucky · 5%", Hunter: STRATEGIES.hunter.luckyDD, "Cons+DORB": STRATEGIES.consDorb.luckyDD, "Combo B": STRATEGIES.comboB.luckyDD },
    { scenario: "Most Likely · 50%", Hunter: STRATEGIES.hunter.mlDD, "Cons+DORB": STRATEGIES.consDorb.mlDD, "Combo B": STRATEGIES.comboB.mlDD },
    { scenario: "Worst Case · 95%", Hunter: STRATEGIES.hunter.wcDD, "Cons+DORB": STRATEGIES.consDorb.wcDD, "Combo B": STRATEGIES.comboB.wcDD }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={5} label="Drawdown Spread" accent="#fbbf24" />

      <div className="grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4">
          <h3 className="text-3xl md:text-4xl text-slate-100 leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
            Worst case
            <br />
            <span style={{ fontStyle: "italic", color: "#fbbf24" }}>matters most.</span>
          </h3>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed">
            Plan around the median. Size for the 95th percentile.
            Combo B's worst case is $3,625 — well inside Tradeify's $2,000 trail
            <em className="text-slate-300"> at SAFE risk sizing</em>.
          </p>
          <div className="mt-6 space-y-2">
            {Object.values(STRATEGIES).map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-3 h-3" style={{ backgroundColor: s.color }} />
                <Mono className="text-xs text-slate-400">{s.short}</Mono>
                <Mono className="text-xs text-slate-600 ml-auto">P/DD {s.profitDD.toFixed(2)}</Mono>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-8 border border-slate-800 bg-black p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="scenario" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FONT_MONO }} stroke="#1e293b" />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: FONT_MONO }} stroke="#1e293b" tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltipBaseStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} formatter={(v) => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT_MONO, paddingTop: 20 }} />
              <Bar dataKey="Hunter" fill={STRATEGIES.hunter.color} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Cons+DORB" fill={STRATEGIES.consDorb.color} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Combo B" fill={STRATEGIES.comboB.color} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HEAD TO HEAD
// ============================================================
function HeadToHeadChart() {
  const tradeData = [
    { name: "Hunter", trades: STRATEGIES.hunter.trades, color: STRATEGIES.hunter.color },
    { name: "Cons+DORB", trades: STRATEGIES.consDorb.trades, color: STRATEGIES.consDorb.color },
    { name: "Combo B", trades: STRATEGIES.comboB.trades, color: STRATEGIES.comboB.color }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={6} label="Head to Head" accent="#fbbf24" />
      <div className="grid lg:grid-cols-2 gap-px bg-slate-800/40 border border-slate-800">
        {/* Trade frequency */}
        <div className="bg-black p-6 md:p-8">
          <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1 block">/ trade frequency · 16mo</Mono>
          <h4 className="text-2xl text-slate-100 mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
            Cons+DORB has <span style={{ fontStyle: "italic" }}>half</span> the samples.
          </h4>
          <p className="text-xs text-slate-500 mb-6">More trades → smoother curve, better statistical confidence.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tradeData} layout="vertical">
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10, fontFamily: FONT_MONO }} stroke="#1e293b" />
              <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11, fontFamily: FONT_MONO }} stroke="#1e293b" width={80} />
              <Tooltip contentStyle={tooltipBaseStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="trades" radius={[0, 2, 2, 0]}>
                {tradeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <Mono className="text-[10px] text-slate-600 mt-4 block italic">→ ~10 trades/mo on Cons+DORB → some weeks zero. Exactly the problem you noticed.</Mono>
        </div>

        {/* WC DD R-multiple */}
        <div className="bg-black p-6 md:p-8">
          <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1 block">/ worst case · R-multiple</Mono>
          <h4 className="text-2xl text-slate-100 mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>
            All three are <span style={{ fontStyle: "italic", color: "#fbbf24" }}>top decile</span>.
          </h4>
          <p className="text-xs text-slate-500 mb-6">≤6R is the threshold. Lower R = more position-size headroom inside the same trail.</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Cons+DORB", DD_R: STRATEGIES.consDorb.wcR, color: STRATEGIES.consDorb.color },
              { name: "Combo B", DD_R: STRATEGIES.comboB.wcR, color: STRATEGIES.comboB.color },
              { name: "Hunter", DD_R: STRATEGIES.hunter.wcR, color: STRATEGIES.hunter.color }
            ]}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11, fontFamily: FONT_MONO }} stroke="#1e293b" />
              <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: FONT_MONO }} stroke="#1e293b" tickFormatter={(v) => `${v}R`} />
              <Tooltip contentStyle={tooltipBaseStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} formatter={(v) => `${v.toFixed(2)}R`} />
              <ReferenceLine y={6} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: "Top decile · 6R", fill: "#fbbf24", fontSize: 10, position: "right", fontFamily: FONT_MONO }} />
              <Bar dataKey="DD_R" radius={[2, 2, 0, 0]}>
                {[STRATEGIES.consDorb, STRATEGIES.comboB, STRATEGIES.hunter].map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// RISK CALCULATOR
// ============================================================
function RiskCalculator() {
  const [accountSize, setAccountSize] = useState(50);
  const [profile, setProfile] = useState("SAFE");
  const [strategy, setStrategy] = useState("comboB");

  const sizing = RISK_TABLES[strategy][accountSize][profile];
  const trailDD = { 50: 2000, 100: 3000, 150: 4500 }[accountSize];
  const dll = { 50: 1250, 100: 2500, 150: 3750 }[accountSize];
  const profitGoal = { 50: 3000, 100: 6000, 150: 9000 }[accountSize];
  const monthsToFirstPayout = profitGoal / (sizing.annual / 12);

  const Toggle = ({ options, value, onChange, valueRender, colorMap }) => (
    <div className="flex p-1 bg-black border border-slate-800">
      {options.map((opt) => {
        const isActive = value === opt;
        const accent = colorMap?.[opt] || "#fbbf24";
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="flex-1 px-3 py-2.5 text-xs transition-all relative"
            style={{
              color: isActive ? accent : "#64748b",
              backgroundColor: isActive ? `${accent}15` : "transparent",
              fontFamily: FONT_MONO
            }}
          >
            {valueRender ? valueRender(opt) : opt}
            {isActive && <div className="absolute bottom-0 left-2 right-2 h-px" style={{ backgroundColor: accent }} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={7} label="Risk Calculator" accent="#fbbf24" />

      <div className="mb-8">
        <h2 className="text-4xl md:text-6xl text-slate-100 leading-[1.05]" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
          The <span style={{ fontStyle: "italic", color: "#fbbf24" }}>sizing</span> calculator.
        </h2>
        <p className="text-slate-400 text-base mt-3 max-w-xl">
          Pick a strategy, account size, and risk profile.
          Get the exact dollar value to type into your Pine input.
        </p>
      </div>

      <div className="border border-slate-800 bg-gradient-to-br from-black via-slate-950 to-black p-6 md:p-8">
        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div>
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2 block">/ strategy</Mono>
            <Toggle
              options={["hunter", "comboB", "consDorb"]}
              value={strategy}
              onChange={setStrategy}
              valueRender={(v) => v === "hunter" ? "Hunter" : v === "comboB" ? "Combo B" : "Cons+DORB"}
              colorMap={{ hunter: "#fbbf24", comboB: "#22d3ee", consDorb: "#34d399" }}
            />
          </div>
          <div>
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2 block">/ account · tradeify</Mono>
            <Toggle
              options={[50, 100, 150]}
              value={accountSize}
              onChange={setAccountSize}
              valueRender={(v) => `$${v}K`}
            />
          </div>
          <div>
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2 block">/ profile</Mono>
            <Toggle
              options={["SAFE", "MODERATE", "AGGRESSIVE"]}
              value={profile}
              onChange={setProfile}
              valueRender={(v) => v === "AGGRESSIVE" ? "AGGR" : v}
              colorMap={{ SAFE: "#34d399", MODERATE: "#fbbf24", AGGRESSIVE: "#f43f5e" }}
            />
          </div>
        </div>

        {/* Big result */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-5 relative bg-gradient-to-br from-amber-500/10 via-black to-transparent border border-amber-500/30 p-8">
            <CornerBrackets color="#fbbf24" />
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-amber-400 block mb-3">→ pine input · risk per trade</Mono>
            <div className="flex items-baseline gap-2">
              <span className="text-amber-500/40 text-3xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>$</span>
              <span className="text-7xl tabular-nums text-amber-300" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                {sizing.risk}
              </span>
            </div>
            <Mono className="text-xs text-slate-500 mt-2 block">per trade</Mono>
            {strategy === "comboB" && (
              <div className="mt-6 pt-6 border-t border-amber-500/20">
                <Mono className="text-[10px] uppercase tracking-wider text-amber-400 block mb-1">⚠ both bots</Mono>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use this <em className="text-amber-300">same value</em> in both Pine inputs — they share the trailing DD.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-slate-800/40">
            {[
              { label: "Annual profit", value: `$${sizing.annual.toLocaleString()}`, sub: `≈ $${Math.round(sizing.annual / 12).toLocaleString()}/mo`, color: "#34d399" },
              { label: "Breach probability", value: sizing.breach, sub: "trail breach risk", color: profile === "SAFE" ? "#34d399" : profile === "MODERATE" ? "#fbbf24" : "#f43f5e" },
              { label: "Most likely DD", value: `$${sizing.mlDD.toLocaleString()}`, sub: `${((sizing.mlDD / trailDD) * 100).toFixed(0)}% of trail`, color: "#cbd5e1" },
              { label: "Worst case DD", value: `$${sizing.wcDD.toLocaleString()}`, sub: `${((sizing.wcDD / trailDD) * 100).toFixed(0)}% of trail`, color: "#cbd5e1" }
            ].map((item) => (
              <div key={item.label} className="bg-black p-5">
                <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-2">{item.label}</Mono>
                <div className="text-3xl tabular-nums" style={{ color: item.color, fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                  {item.value}
                </div>
                <Mono className="text-[10px] text-slate-600 mt-1 block">{item.sub}</Mono>
              </div>
            ))}
          </div>
        </div>

        {/* DD vs Trail visual */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500">/ drawdown · vs trailing limit</Mono>
            <Mono className="text-[10px] text-slate-600">$0 → ${trailDD.toLocaleString()}</Mono>
          </div>
          <div className="relative h-14 bg-black border border-slate-800 overflow-hidden">
            {/* Grid lines */}
            {[25, 50, 75].map(p => (
              <div key={p} className="absolute inset-y-0 border-l border-slate-800/50" style={{ left: `${p}%` }} />
            ))}
            {/* Bars */}
            <div className="absolute inset-y-0 left-0 bg-emerald-500/30 transition-all duration-500"
                 style={{ width: `${(sizing.mlDD / trailDD) * 100}%` }} />
            <div className="absolute inset-y-0 bg-amber-500/40 transition-all duration-500"
                 style={{ left: `${(sizing.mlDD / trailDD) * 100}%`, width: `${((sizing.wcDD - sizing.mlDD) / trailDD) * 100}%` }} />
            <div className="absolute inset-y-0 bg-rose-500/30 transition-all duration-500"
                 style={{ left: `${(sizing.wcDD / trailDD) * 100}%`, width: `${((sizing.p99 - sizing.wcDD) / trailDD) * 100}%` }} />
            <div className="absolute inset-y-0 right-0 w-0.5 bg-rose-500" />

            {/* Markers */}
            {[
              { pos: (sizing.mlDD / trailDD) * 100, label: "ML", color: "#34d399" },
              { pos: (sizing.wcDD / trailDD) * 100, label: "WC", color: "#fbbf24" },
              { pos: (sizing.p99 / trailDD) * 100, label: "99", color: "#f43f5e" }
            ].map((m, i) => (
              <div key={i} className="absolute inset-y-0 transition-all duration-500" style={{ left: `${m.pos}%` }}>
                <div className="absolute inset-y-0 w-px" style={{ backgroundColor: m.color, opacity: 0.6 }} />
                <Mono className="absolute -top-5 -translate-x-1/2 text-[9px]" style={{ color: m.color }}>{m.label}</Mono>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] mt-2">
            <Mono className="text-emerald-400">most likely</Mono>
            <Mono className="text-amber-400">worst case</Mono>
            <Mono className="text-rose-400">99th pct</Mono>
            <Mono className="text-rose-500">FAIL · ${trailDD.toLocaleString()}</Mono>
          </div>
        </div>

        {/* Tradeify-specific */}
        <div className="grid md:grid-cols-3 gap-px bg-slate-800/40 pt-6 border-t border-slate-800">
          <div className="bg-black p-4">
            <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-1">/ daily loss limit</Mono>
            <div className="text-2xl text-slate-200 tabular-nums" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
              ${dll.toLocaleString()}
            </div>
            <Mono className="text-[10px] text-slate-600 mt-1 block">≈ {Math.floor(dll / sizing.risk)} losses pause for the day</Mono>
          </div>
          <div className="bg-black p-4">
            <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-1">/ first payout goal</Mono>
            <div className="text-2xl text-slate-200 tabular-nums" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
              ${profitGoal.toLocaleString()}
            </div>
            <Mono className="text-[10px] text-slate-600 mt-1 block">≈ {monthsToFirstPayout.toFixed(1)} months at this profile</Mono>
          </div>
          <div className="bg-black p-4">
            <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-1">/ consistency rule</Mono>
            <div className="text-2xl text-slate-200" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
              20 / 25 / 30
            </div>
            <Mono className="text-[10px] text-slate-600 mt-1 block">graduated across first 3 payouts</Mono>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PROFILE TRADEOFF
// ============================================================
function ProfitBreachExplorer() {
  const [strategy, setStrategy] = useState("comboB");
  const [accountSize, setAccountSize] = useState(50);

  const data = ["SAFE", "MODERATE", "AGGRESSIVE"].map((p) => {
    const r = RISK_TABLES[strategy][accountSize][p];
    return {
      profile: p === "AGGRESSIVE" ? "AGGR" : p,
      annual: r.annual,
      risk: r.risk,
      breach: p === "SAFE" ? 1 : p === "MODERATE" ? 3 : 6,
      wcDD: r.wcDD
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={8} label="Profile Tradeoff" accent="#fbbf24" />

      <div className="grid md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4">
          <h3 className="text-3xl md:text-4xl text-slate-100 leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
            Profit climbs.
            <br />
            <span style={{ fontStyle: "italic", color: "#f43f5e" }}>Risk climbs faster.</span>
          </h3>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed">
            Doubling risk doesn't double profit — but it more than doubles your breach probability.
            For a Tradeify Lightning account where one breach permanently ends the game, the math favors patience.
          </p>

          <div className="mt-6 space-y-3">
            <div>
              <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-2">strategy</Mono>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-black border border-slate-800 px-3 py-2.5 text-xs text-slate-200 cursor-pointer"
                style={{ fontFamily: FONT_MONO }}
              >
                <option value="hunter">Hunter</option>
                <option value="comboB">Combo B</option>
                <option value="consDorb">Cons+DORB</option>
              </select>
            </div>
            <div>
              <Mono className="text-[10px] uppercase tracking-[0.2em] text-slate-500 block mb-2">account</Mono>
              <select
                value={accountSize}
                onChange={(e) => setAccountSize(Number(e.target.value))}
                className="w-full bg-black border border-slate-800 px-3 py-2.5 text-xs text-slate-200 cursor-pointer"
                style={{ fontFamily: FONT_MONO }}
              >
                <option value={50}>$50K</option>
                <option value={100}>$100K</option>
                <option value={150}>$150K</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 border border-slate-800 bg-black p-6">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="profile" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: FONT_MONO }} stroke="#1e293b" />
              <YAxis yAxisId="left" tick={{ fill: "#34d399", fontSize: 10, fontFamily: FONT_MONO }} stroke="#34d399" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#f43f5e", fontSize: 10, fontFamily: FONT_MONO }} stroke="#f43f5e" tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={tooltipBaseStyle}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                formatter={(v, n) => [n === "annual" ? `$${v.toLocaleString()}` : `${v}%`, n === "annual" ? "Annual" : "Breach"]}
              />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: FONT_MONO, paddingTop: 10 }} />
              <Bar yAxisId="left" dataKey="annual" fill="#34d399" name="Annual profit" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="breach" stroke="#f43f5e" strokeWidth={2} name="Breach %" dot={{ fill: "#f43f5e", r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-px bg-slate-800/40 mt-4">
            {data.map((d) => (
              <div key={d.profile} className="bg-black p-4">
                <Mono className="text-[10px] uppercase tracking-[0.3em] text-slate-500 block mb-1">{d.profile}</Mono>
                <div className="text-xl text-slate-100 tabular-nums" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
                  ${d.risk}<span className="text-slate-600 text-xs">/trade</span>
                </div>
                <div className="flex justify-between mt-2">
                  <Mono className="text-[10px] text-emerald-400">${d.annual.toLocaleString()}/yr</Mono>
                  <Mono className="text-[10px] text-rose-400">{d.breach}%</Mono>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HUNTER ALL CONFIGS
// ============================================================
function HunterAllConfigs() {
  const [expanded, setExpanded] = useState(false);
  const sortedConfigs = [...HUNTER_CONFIGS].sort((a, b) => b.profitDD - a.profitDD);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10">
      <SectionMarker number={9} label="Hunter Variants" accent="#fbbf24" />

      <div className="mb-6">
        <h3 className="text-3xl md:text-4xl text-slate-100" style={{ fontFamily: FONT_DISPLAY, fontWeight: 300 }}>
          All <span style={{ fontStyle: "italic", color: "#fbbf24" }}>9 Hunter</span> exit variants.
        </h3>
        <p className="text-slate-400 text-sm mt-3 max-w-2xl">
          Same entry signal, different exit management. Ranked by Profit/DD ratio.
          The winning Partial 0.7R/50% beat 8 alternatives including Break-Even, Trail Stop, and full optimization-only setups.
        </p>
      </div>

      <div className="border border-slate-800 bg-black overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-950 transition-colors"
        >
          <Mono className="text-xs text-slate-400">→ {expanded ? "collapse" : "expand"} the full ranking</Mono>
          <Mono className="text-amber-400 text-xs">{expanded ? "[ −  hide ]" : "[ +  show ]"}</Mono>
        </button>

        {expanded && (
          <div className="border-t border-slate-800 overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: FONT_MONO }}>
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-3 font-normal">Rank</th>
                  <th className="px-4 py-3 font-normal">Configuration</th>
                  <th className="px-4 py-3 text-right font-normal">Trades</th>
                  <th className="px-4 py-3 text-right font-normal">Net</th>
                  <th className="px-4 py-3 text-right font-normal">PF</th>
                  <th className="px-4 py-3 text-right font-normal">WC$</th>
                  <th className="px-4 py-3 text-right font-normal">WC R</th>
                  <th className="px-4 py-3 text-right font-normal">P/DD</th>
                  <th className="px-4 py-3 text-right font-normal">No-Rec</th>
                </tr>
              </thead>
              <tbody>
                {sortedConfigs.map((c) => (
                  <tr key={c.rank} className={`border-b border-slate-800/40 hover:bg-slate-950 transition-colors ${c.winner ? "bg-amber-500/5" : ""}`}>
                    <td className="px-4 py-3 tabular-nums">
                      {c.winner ? <span className="text-amber-400">★ 01</span> : <span className="text-slate-500">{String(c.rank).padStart(2, "0")}</span>}
                    </td>
                    <td className={`px-4 py-3 ${c.winner ? "text-amber-300" : "text-slate-200"}`} style={{ fontFamily: FONT_BODY, fontWeight: c.winner ? 600 : 400 }}>
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{c.trades}</td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">${(c.netProfit / 1000).toFixed(1)}k</td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{c.pf.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-rose-400 tabular-nums">${(c.wcDD / 1000).toFixed(1)}k</td>
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{c.wcR.toFixed(2)}R</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${c.winner ? "text-amber-400" : "text-amber-300/70"}`}>{c.profitDD.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 tabular-nums">{c.noRec.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function FootNote() {
  return (
    <footer className="max-w-7xl mx-auto px-6 md:px-10 mt-24 mb-16">
      <div className="border-t border-slate-800 pt-10">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div className="md:col-span-2">
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 mb-3 block">/ methodology</Mono>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each backtest produced a specific historical trade sequence. Monte Carlo reshuffles that sequence 10,000 times
              to map the full distribution of equity curves possible from the same trade distribution. Net profit is constant
              across reshuffles; max DD, recovery time, and consecutive streaks vary. The 95th-percentile (Worst Case) values
              represent statistically realistic outcomes — not just what happened, but what could happen.
            </p>
          </div>
          <div>
            <Mono className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 mb-3 block">/ disclaimers</Mono>
            <p className="text-xs text-slate-500 leading-relaxed">
              Backtest ≠ live. Forward test 4-6 weeks in demo before scaling. SAFE means low probability of breach, not zero.
              Begin at SAFE; increase risk only after a 3+ month live track record.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-900">
          <Mono className="text-[10px] tracking-[0.3em] text-slate-600 uppercase">
            <span className="text-amber-500/60">★</span> n4a.orb v27.2 · monte carlo dashboard
          </Mono>
          <Mono className="text-[10px] tracking-[0.3em] text-slate-700 uppercase">
            © 2026 playbit trading systems
          </Mono>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// ROOT
// ============================================================
export default function Dashboard() {
  useGoogleFonts();
  const [activeStrategy, setActiveStrategy] = useState("comboB");

  return (
    <div className="min-h-screen bg-black text-slate-200 antialiased" style={{ fontFamily: FONT_BODY }}>
      <Hero />
      <VerdictCard />
      <ComboBExplainer />
      <TradingViewSetup />
      <StrategyComparison activeStrategy={activeStrategy} setActiveStrategy={setActiveStrategy} />
      <StrategyDeepDive strategy={activeStrategy} />
      <ScenarioComparisonChart />
      <HeadToHeadChart />
      <RiskCalculator />
      <ProfitBreachExplorer />
      <HunterAllConfigs />
      <FootNote />
    </div>
  );
}