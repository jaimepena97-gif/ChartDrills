import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ═══════════════════════════════════════════════════════════════
// CHARTDRILLS — Interactive Trading Pattern Recognition
// Real NQ/ES/YM/RTY futures · ICT/SMC · S&D · TA · PA
// ═══════════════════════════════════════════════════════════════

function mkRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s & 0x7fffffff) / 0x7fffffff; };
}

function buildCandles(seed, startPrice, count, recipe) {
  const r = mkRng(seed);
  const c = [];
  let p = startPrice;
  for (const phase of recipe) {
    for (let i = 0; i < phase.n; i++) {
      const bias = phase.bias || 0.5;
      const vol = phase.vol || 1;
      const dir = r() < bias ? 1 : -1;
      const range = (4 + r() * 14) * vol;
      const body = range * (0.25 + r() * 0.5) * dir;
      const o = p, cl = o + body;
      const h = Math.max(o, cl) + r() * range * 0.3;
      const l = Math.min(o, cl) - r() * range * 0.3;
      c.push({ o: +o.toFixed(2), h: +h.toFixed(2), l: +l.toFixed(2), c: +cl.toFixed(2) });
      p = cl + (r() - 0.5) * 2;
    }
  }
  return c.slice(0, count);
}

function buildFVG(seed, base, direction) {
  const r = mkRng(seed); const c = []; let p = base;
  for (let i = 0; i < 18; i++) {
    const dir = r() < (direction > 0 ? 0.58 : 0.42) ? 1 : -1;
    const range = 6 + r() * 10, body = range * (0.2 + r() * 0.4) * dir;
    const o = p, cl = o + body;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  for (let i = 0; i < 3; i++) {
    const range = 3 + r() * 6, body = range * 0.5 * -direction;
    const o = p, cl = o + body;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 3).toFixed(2), l: +(Math.min(o, cl) - r() * 3).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  const c1o = p, c1c = p + direction * 4;
  c.push({ o: +c1o.toFixed(2), h: +(Math.max(c1o, c1c) + r() * 3).toFixed(2), l: +(Math.min(c1o, c1c) - r() * 3).toFixed(2), c: +c1c.toFixed(2) });
  const c2o = c1c, c2c = c2o + direction * (35 + r() * 20);
  c.push({ o: +c2o.toFixed(2), h: +(direction > 0 ? c2c + r() * 5 : Math.max(c2o, c2c) + r() * 3).toFixed(2), l: +(direction > 0 ? Math.min(c2o, c2c) - r() * 3 : c2c - r() * 5).toFixed(2), c: +c2c.toFixed(2) });
  const gapRef = direction > 0 ? Math.max(c1o, c1c) + r() * 3 : Math.min(c1o, c1c) - r() * 3;
  const c3o = c2c + direction * (2 + r() * 4), c3c = c3o + direction * (8 + r() * 12);
  c.push({ o: +c3o.toFixed(2), h: +(Math.max(c3o, c3c) + r() * 4).toFixed(2), l: +(direction > 0 ? gapRef + 3 + r() * 5 : Math.min(c3o, c3c) - r() * 4).toFixed(2), c: +c3c.toFixed(2) });
  p = c3c;
  for (let i = 0; i < 6; i++) {
    const dir = r() < (direction > 0 ? 0.55 : 0.45) ? 1 : -1;
    const range = 5 + r() * 8, body = range * 0.3 * dir;
    const o = p, cl = o + body;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  return c;
}

function buildOB(seed, base, direction) {
  const r = mkRng(seed); const c = []; let p = base;
  for (let i = 0; i < 15; i++) {
    const dir = r() < 0.5 ? 1 : -1, range = 5 + r() * 10, body = range * (0.2 + r() * 0.4) * dir;
    const o = p, cl = o + body;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  const obO = p, obC = p + (-direction) * (10 + r() * 8);
  c.push({ o: +obO.toFixed(2), h: +(Math.max(obO, obC) + r() * 3).toFixed(2), l: +(Math.min(obO, obC) - r() * 3).toFixed(2), c: +obC.toFixed(2) }); p = obC;
  for (let i = 0; i < 3; i++) {
    const move = (20 + r() * 15) * direction; const o = p, cl = o + move;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 5).toFixed(2), l: +(Math.min(o, cl) - r() * 5).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  for (let i = 0; i < 8; i++) {
    const dir = r() < (direction > 0 ? 0.55 : 0.45) ? 1 : -1, range = 4 + r() * 8, body = range * 0.3 * dir;
    const o = p, cl = o + body;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) }); p = cl;
  }
  return c;
}

function buildSweep(seed, base, sweepDir) {
  const r = mkRng(seed); const c = []; let p = base;
  const eqLevel = p + sweepDir * (30 + r() * 20);
  for (let i = 0; i < 8; i++) {
    const target = i % 2 === 0 ? eqLevel : p;
    const move = (target - (c.length > 0 ? c[c.length - 1].c : p)) / (3 + r() * 2);
    for (let j = 0; j < 3; j++) {
      const o2 = c.length > 0 ? c[c.length - 1].c : p, cl2 = o2 + move + (r() - 0.5) * 6;
      c.push({ o: +o2.toFixed(2), h: +(Math.max(o2, cl2) + r() * 5).toFixed(2), l: +(Math.min(o2, cl2) - r() * 5).toFixed(2), c: +cl2.toFixed(2) });
    }
  }
  const sweepO = c[c.length - 1].c;
  const sweepWick = eqLevel + sweepDir * (8 + r() * 12), sweepC = sweepO + (-sweepDir) * (5 + r() * 8);
  c.push({ o: +sweepO.toFixed(2), h: +(sweepDir > 0 ? sweepWick : Math.max(sweepO, sweepC) + r() * 3).toFixed(2), l: +(sweepDir < 0 ? sweepWick : Math.min(sweepO, sweepC) - r() * 3).toFixed(2), c: +sweepC.toFixed(2) });
  for (let i = 0; i < 6; i++) {
    const prev = c[c.length - 1].c, move2 = (-sweepDir) * (6 + r() * 10), cl3 = prev + move2;
    c.push({ o: +prev.toFixed(2), h: +(Math.max(prev, cl3) + r() * 4).toFixed(2), l: +(Math.min(prev, cl3) - r() * 4).toFixed(2), c: +cl3.toFixed(2) });
  }
  return c;
}

function buildBOS(seed, base, direction) {
  const r = mkRng(seed); const c = []; let p = base;
  for (let swing = 0; swing < 3; swing++) {
    for (let i = 0; i < 4; i++) {
      const move = direction * (8 + r() * 12); const o = c.length > 0 ? c[c.length-1].c : p, cl = o + move;
      c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) });
    }
    for (let i = 0; i < 3; i++) {
      const o = c[c.length-1].c, move = -direction * (5 + r() * 7), cl = o + move;
      c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 3).toFixed(2), l: +(Math.min(o, cl) - r() * 3).toFixed(2), c: +cl.toFixed(2) });
    }
  }
  for (let i = 0; i < 3; i++) {
    const o = c[c.length-1].c, move = direction * (12 + r() * 10), cl = o + move;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 5).toFixed(2), l: +(Math.min(o, cl) - r() * 5).toFixed(2), c: +cl.toFixed(2) });
  }
  return c;
}

function buildCHOCH(seed, base, trendDir) {
  const r = mkRng(seed); const c = []; let p = base;
  for (let swing = 0; swing < 3; swing++) {
    for (let i = 0; i < 4; i++) {
      const o = c.length > 0 ? c[c.length-1].c : p, move = trendDir * (7 + r() * 10), cl = o + move;
      c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 4).toFixed(2), l: +(Math.min(o, cl) - r() * 4).toFixed(2), c: +cl.toFixed(2) });
    }
    for (let i = 0; i < 2; i++) {
      const o = c[c.length-1].c, move = -trendDir * (4 + r() * 6), cl = o + move;
      c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 3).toFixed(2), l: +(Math.min(o, cl) - r() * 3).toFixed(2), c: +cl.toFixed(2) });
    }
  }
  for (let i = 0; i < 4; i++) {
    const o = c[c.length-1].c, move = -trendDir * (10 + r() * 12), cl = o + move;
    c.push({ o: +o.toFixed(2), h: +(Math.max(o, cl) + r() * 5).toFixed(2), l: +(Math.min(o, cl) - r() * 5).toFixed(2), c: +cl.toFixed(2) });
  }
  return c;
}

function buildZone(seed, base, dir) {
  const r = mkRng(seed); const c = []; let p = base;
  for(let i=0;i<12;i++){const o=c.length?c[c.length-1].c:p;const move=dir*(6+r()*10);const cl=o+move;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*4).toFixed(2),l:+(Math.min(o,cl)-r()*4).toFixed(2),c:+cl.toFixed(2)});}
  for(let i=0;i<5;i++){const o=c[c.length-1].c;const move=(r()-0.5)*8;const cl=o+move;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*3).toFixed(2),l:+(Math.min(o,cl)-r()*3).toFixed(2),c:+cl.toFixed(2)});}
  for(let i=0;i<10;i++){const o=c[c.length-1].c;const move=-dir*(8+r()*14);const cl=o+move;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*5).toFixed(2),l:+(Math.min(o,cl)-r()*5).toFixed(2),c:+cl.toFixed(2)});}
  return c;
}

function buildHS(seed, base) { return buildCandles(seed, base, 30, [{n:5,bias:0.65,vol:1},{n:3,bias:0.3,vol:0.8},{n:6,bias:0.7,vol:1.2},{n:4,bias:0.25,vol:1},{n:4,bias:0.68,vol:0.9},{n:4,bias:0.25,vol:1.1},{n:4,bias:0.3,vol:1.3}]); }
function buildDT(seed, base) { return buildCandles(seed, base, 22, [{n:6,bias:0.65,vol:1},{n:3,bias:0.35,vol:0.8},{n:5,bias:0.65,vol:1},{n:3,bias:0.3,vol:1},{n:5,bias:0.3,vol:1.2}]); }
function buildTri(seed, base) { return buildCandles(seed, base, 23, [{n:4,bias:0.6,vol:1.2},{n:3,bias:0.35,vol:1},{n:3,bias:0.62,vol:0.8},{n:3,bias:0.38,vol:0.6},{n:3,bias:0.6,vol:0.5},{n:2,bias:0.38,vol:0.4},{n:5,bias:0.75,vol:1.5}]); }
function buildFlag(seed, base) { return buildCandles(seed, base, 18, [{n:5,bias:0.8,vol:1.5},{n:8,bias:0.42,vol:0.4},{n:5,bias:0.75,vol:1.3}]); }

function buildPin(seed, base, dir) {
  const r = mkRng(seed); const c = []; let p = base;
  for(let i=0;i<15;i++){const o=c.length?c[c.length-1].c:p;const d=r()<(dir>0?0.4:0.6)?1:-1;const range=5+r()*8;const body=range*0.3*d;const cl=o+body;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*5).toFixed(2),l:+(Math.min(o,cl)-r()*5).toFixed(2),c:+cl.toFixed(2)});}
  const pbo=c[c.length-1].c,pbc=pbo+dir*2;
  c.push({o:+pbo.toFixed(2),h:+(dir>0?Math.max(pbo,pbc)+3:Math.max(pbo,pbc)+30+r()*15).toFixed(2),l:+(dir>0?Math.min(pbo,pbc)-30-r()*15:Math.min(pbo,pbc)-3).toFixed(2),c:+pbc.toFixed(2)});
  for(let i=0;i<6;i++){const o=c[c.length-1].c;const move=dir*(5+r()*8);const cl=o+move;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*4).toFixed(2),l:+(Math.min(o,cl)-r()*4).toFixed(2),c:+cl.toFixed(2)});}
  return c;
}

function buildEng(seed, base, dir) {
  const r = mkRng(seed); const c = []; let p = base;
  for(let i=0;i<14;i++){const o=c.length?c[c.length-1].c:p;const d=r()<(dir>0?0.4:0.6)?1:-1;const range=5+r()*8;const body=range*0.3*d;const cl=o+body;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*4).toFixed(2),l:+(Math.min(o,cl)-r()*4).toFixed(2),c:+cl.toFixed(2)});}
  const so=c[c.length-1].c,sc=so+(-dir)*4;
  c.push({o:+so.toFixed(2),h:+(Math.max(so,sc)+r()*2).toFixed(2),l:+(Math.min(so,sc)-r()*2).toFixed(2),c:+sc.toFixed(2)});
  const eo=sc,ec=eo+dir*(18+r()*12);
  c.push({o:+eo.toFixed(2),h:+(dir>0?ec+r()*3:Math.max(eo,ec)+r()*3).toFixed(2),l:+(dir>0?Math.min(eo,ec)-r()*3:ec-r()*3).toFixed(2),c:+ec.toFixed(2)});
  for(let i=0;i<6;i++){const o=c[c.length-1].c;const move=dir*(5+r()*8);const cl=o+move;c.push({o:+o.toFixed(2),h:+(Math.max(o,cl)+r()*4).toFixed(2),l:+(Math.min(o,cl)-r()*4).toFixed(2),c:+cl.toFixed(2)});}
  return c;
}

// ═══════════════════════════════════════════════════════════════
const SCENARIOS = [
  {id:"ict-fvg-nq-1",mod:"ict",topic:"Fair Value Gap",inst:"NQ",tf:"5m",mode:"identify",q:"Identify the Fair Value Gap on this NQ 5-minute chart.",opts:["Bullish FVG (gap up)","Bearish FVG (gap down)","No FVG present","Balanced Price Range"],ans:0,exp:"The 3-candle sequence shows a clear bullish FVG — candle 3's low is above candle 1's high, leaving an unmitigated gap. Price displaced aggressively to the upside, creating an imbalance that acts as a magnet for price to return and fill.",candles:buildFVG(1001,21580,1)},
  {id:"ict-fvg-es-1",mod:"ict",topic:"Fair Value Gap",inst:"ES",tf:"15m",mode:"identify",q:"What type of imbalance is visible on this ES 15-minute chart?",opts:["Bearish FVG","Bullish FVG","Volume Imbalance","No imbalance"],ans:0,exp:"A bearish FVG is present — candle 3's high sits below candle 1's low after heavy selling displacement. This is a premium zone where institutional sellers entered. Expect price to retrace into this gap before continuing lower.",candles:buildFVG(2002,5980,-1)},
  {id:"ict-ob-ym-1",mod:"ict",topic:"Order Block",inst:"YM",tf:"5m",mode:"identify",q:"Locate the bullish order block on this YM 5-minute chart.",opts:["The last bearish candle before the rally","The first bullish candle of the rally","The highest candle on the chart","There is no order block"],ans:0,exp:"The bullish order block is the last bearish (down-close) candle before the aggressive move higher. This represents the zone where institutional buying absorbed all remaining sell orders before displacing price upward.",candles:buildOB(3003,42800,1)},
  {id:"ict-ob-rty-1",mod:"ict",topic:"Order Block",inst:"RTY",tf:"15m",mode:"identify",q:"Where is the bearish order block on this RTY 15-minute chart?",opts:["The doji candle at the top","The last bullish candle before the selloff","The first bearish candle of the selloff","The candle with the longest wick"],ans:1,exp:"The bearish order block is the last bullish (up-close) candle before the aggressive displacement down. Institutional sellers entered at this zone. When price returns to this level, it's expected to act as resistance.",candles:buildOB(4004,2280,-1)},
  {id:"ict-sweep-nq-1",mod:"ict",topic:"Liquidity Sweep",inst:"NQ",tf:"5m",mode:"identify",q:"What just happened at the swing high on this NQ chart?",opts:["Liquidity sweep of equal highs","Break of structure (BOS)","Fair value gap fill","Order block mitigation"],ans:0,exp:"Price swept above the equal highs — taking out buy-side liquidity (stop losses from shorts and breakout entries). The long upper wick and immediate reversal confirms this was a liquidity grab, not a real breakout.",candles:buildSweep(5005,21600,1)},
  {id:"ict-sweep-es-1",mod:"ict",topic:"Liquidity Sweep",inst:"ES",tf:"15m",mode:"identify",q:"Identify the sell-side liquidity sweep on this ES chart.",opts:["The wick below the equal lows with reversal","The large bearish candle","The consolidation range","The gap between candles"],ans:0,exp:"The long lower wick pierced below the equal lows, sweeping sell-side liquidity. The immediate reversal confirms smart money grabbed liquidity before driving price higher. Textbook ICT liquidity sweep.",candles:buildSweep(6006,5960,-1)},
  {id:"ict-bos-nq-1",mod:"ict",topic:"BOS / CHOCH",inst:"NQ",tf:"5m",mode:"identify",q:"What market structure event occurred on this NQ chart?",opts:["Break of Structure (BOS) — trend continuation","Change of Character (CHOCH) — trend reversal","Neither — price is ranging","Market Structure Shift (MSS)"],ans:0,exp:"Price created higher highs and higher lows, then broke above the most recent swing high with conviction. This is a BOS — confirmation that the bullish trend is continuing.",candles:buildBOS(7007,21500,1)},
  {id:"ict-choch-ym-1",mod:"ict",topic:"BOS / CHOCH",inst:"YM",tf:"15m",mode:"identify",q:"What structural shift is happening on this YM chart?",opts:["Change of Character (CHOCH) — bearish reversal","Break of Structure (BOS) — bullish continuation","Accumulation","Consolidation"],ans:0,exp:"After making higher highs and higher lows (bullish trend), price broke below the most recent swing low. This is a CHOCH — the first sign of a potential trend reversal from bullish to bearish.",candles:buildCHOCH(8008,42700,1)},
  {id:"sd-demand-es-1",mod:"sd",topic:"Demand Zone",inst:"ES",tf:"15m",mode:"identify",q:"Identify the demand zone on this ES 15-minute chart.",opts:["The consolidation area before the strong rally","The top of the chart","The area of highest volume","The middle of the uptrend"],ans:0,exp:"The demand zone is the basing/consolidation area where price paused before rallying aggressively. This is where institutional buyers accumulated positions. The Rally-Base-Rally (RBR) pattern shows unfilled demand.",candles:buildZone(9009,5990,-1)},
  {id:"sd-supply-nq-1",mod:"sd",topic:"Supply Zone",inst:"NQ",tf:"5m",mode:"identify",q:"Where is the supply zone on this NQ 5-minute chart?",opts:["The consolidation before the sharp selloff","The bottom of the chart","The area with the most candles","The first candle on the chart"],ans:0,exp:"The supply zone is the consolidation at the top before price dropped sharply. This is a Drop-Base-Drop (DBD) pattern showing institutional distribution. Unfilled supply remains at this zone.",candles:buildZone(1010,21520,1)},
  {id:"sd-demand-rty-1",mod:"sd",topic:"Demand Zone",inst:"RTY",tf:"15m",mode:"identify",q:"What type of zone is marked by the tight consolidation before this RTY rally?",opts:["Demand zone (RBR pattern)","Supply zone","Fair Value Gap","Pivot point"],ans:0,exp:"This is a demand zone formed by a Rally-Base-Rally pattern. The tight consolidation represents institutional accumulation — buyers quietly building positions before driving price higher.",candles:buildZone(1111,2270,-1)},
  {id:"ta-hs-es-1",mod:"ta",topic:"Head & Shoulders",inst:"ES",tf:"15m",mode:"identify",q:"What classical pattern is forming on this ES chart?",opts:["Head and Shoulders (bearish reversal)","Double Top","Ascending Triangle","Cup and Handle"],ans:0,exp:"Three peaks where the middle peak (head) is highest and the two outer peaks (shoulders) are roughly equal. This is a bearish reversal pattern. The neckline connecting the two troughs is the key level.",candles:buildHS(1212,5950)},
  {id:"ta-dt-nq-1",mod:"ta",topic:"Double Top",inst:"NQ",tf:"15m",mode:"identify",q:"Identify the reversal pattern on this NQ chart.",opts:["Double Top","Head and Shoulders","Ascending Wedge","Bull Flag"],ans:0,exp:"Price formed two peaks at nearly the same level before reversing. This is a Double Top — buyers failed to push price above resistance twice. The neckline becomes the key breakdown level.",candles:buildDT(1313,21560)},
  {id:"ta-tri-ym-1",mod:"ta",topic:"Triangle",inst:"YM",tf:"5m",mode:"identify",q:"What chart pattern is price compressing into on this YM chart?",opts:["Symmetrical Triangle","Head and Shoulders","Rectangle","Descending Channel"],ans:0,exp:"Price is making lower highs and higher lows, compressing into a symmetrical triangle. This signals decreasing volatility before a breakout. Watch for a decisive close outside the triangle.",candles:buildTri(1414,42750)},
  {id:"ta-flag-rty-1",mod:"ta",topic:"Flag Pattern",inst:"RTY",tf:"5m",mode:"identify",q:"What continuation pattern do you see on this RTY chart?",opts:["Bull Flag","Bear Flag","Ascending Triangle","Pennant"],ans:0,exp:"The sharp rally (flagpole) followed by a tight, slightly downward-sloping consolidation (flag) is a classic Bull Flag. Breakout above the flag triggers the measured move target.",candles:buildFlag(1515,2260)},
  {id:"pa-pin-nq-1",mod:"pa",topic:"Pin Bar",inst:"NQ",tf:"15m",mode:"identify",q:"What key price action signal appeared on this NQ chart?",opts:["Bullish Pin Bar (hammer)","Bearish Pin Bar (shooting star)","Inside Bar","Doji"],ans:0,exp:"The long lower wick with a small body near the top is a Bullish Pin Bar / Hammer. Sellers pushed price down but buyers drove it back up. Strong rejection of lower prices — bullish signal.",candles:buildPin(1616,21570,1)},
  {id:"pa-pin-es-1",mod:"pa",topic:"Pin Bar",inst:"ES",tf:"5m",mode:"identify",q:"Identify the reversal signal at the top of this ES chart.",opts:["Bearish Pin Bar (shooting star)","Bullish Pin Bar","Engulfing Pattern","Morning Star"],ans:0,exp:"The long upper wick with a small body near the bottom is a Bearish Pin Bar / Shooting Star. Buyers pushed price up but sellers overwhelmed them. Rejection of higher prices signals reversal.",candles:buildPin(1717,5985,-1)},
  {id:"pa-eng-ym-1",mod:"pa",topic:"Engulfing Pattern",inst:"YM",tf:"15m",mode:"identify",q:"What two-candle reversal pattern formed on this YM chart?",opts:["Bullish Engulfing","Bearish Engulfing","Tweezer Bottom","Piercing Pattern"],ans:0,exp:"The large bullish candle completely engulfs the previous bearish candle. This is a Bullish Engulfing — a strong reversal signal showing buyers have overwhelmed sellers.",candles:buildEng(1818,42780,1)},
  {id:"pa-eng-rty-1",mod:"pa",topic:"Engulfing Pattern",inst:"RTY",tf:"5m",mode:"identify",q:"What bearish reversal pattern appeared on this RTY chart?",opts:["Bearish Engulfing","Bullish Engulfing","Evening Star","Dark Cloud Cover"],ans:0,exp:"The large bearish candle completely engulfs the previous bullish candle. Institutional sellers stepped in with force. After an uptrend, this is a high-probability reversal signal.",candles:buildEng(1919,2275,-1)},
  // PREDICT
  {id:"pr-fvg-nq-1",mod:"ict",topic:"FVG Prediction",inst:"NQ",tf:"5m",mode:"predict",q:"Price just formed a bullish FVG and is pulling back. What happens next?",opts:["Price fills the FVG and continues higher","Price crashes through the FVG","Price ignores the FVG completely","Price consolidates sideways indefinitely"],ans:0,exp:"In a bullish trend, price tends to retrace into the FVG (fill the imbalance) before continuing in the direction of the trend. The FVG acts as a discount zone where smart money re-enters.",candles:buildFVG(2020,21590,1)},
  {id:"pr-ob-es-1",mod:"ict",topic:"Order Block Prediction",inst:"ES",tf:"15m",mode:"predict",q:"Price is approaching a previously identified bullish order block. What's the likely outcome?",opts:["Price bounces from the order block","Price slices through with no reaction","Price consolidates above the order block","Price gaps past the order block"],ans:0,exp:"Unmitigated order blocks act as institutional support/resistance. When price returns to a bullish OB, expect a reaction (bounce) on the first test.",candles:buildOB(2121,5955,1)},
  {id:"pr-sweep-ym-1",mod:"ict",topic:"Liquidity Prediction",inst:"YM",tf:"5m",mode:"predict",q:"Equal lows have formed on this YM chart with resting liquidity below. What happens next?",opts:["Price sweeps the lows then reverses higher","Price breaks the lows and continues down","Price never reaches the lows","Price consolidates at the lows"],ans:0,exp:"Equal lows create a pool of sell-side liquidity that smart money targets. The most probable outcome is a sweep — price dips below to trigger stops, then reverses.",candles:buildSweep(2222,42800,-1)},
  {id:"pr-demand-rty-1",mod:"sd",topic:"Zone Prediction",inst:"RTY",tf:"15m",mode:"predict",q:"Price is dropping back into a previously untested demand zone on RTY. What's the likely reaction?",opts:["Price bounces from the demand zone","Price slices through the zone","Price consolidates within the zone","No reaction at all"],ans:0,exp:"First tests of untested (fresh) demand zones have the highest probability of producing a bounce. Institutional buyers who accumulated here before will likely defend the zone.",candles:buildZone(2323,2265,-1)},
  {id:"pr-hs-nq-1",mod:"ta",topic:"Pattern Prediction",inst:"NQ",tf:"15m",mode:"predict",q:"A Head and Shoulders pattern has completed on NQ. Price is at the neckline. What happens?",opts:["Price breaks the neckline and drops","Price bounces and makes a new high","Price consolidates at the neckline forever","The pattern invalidates"],ans:0,exp:"Completed Head and Shoulders patterns break the neckline about 65-70% of the time. The measured move target equals the distance from the head to the neckline, projected downward.",candles:buildHS(2424,21580)},
  {id:"pr-engulf-es-1",mod:"pa",topic:"Pattern Prediction",inst:"ES",tf:"5m",mode:"predict",q:"A bullish engulfing candle just formed at a key support level on ES. What's the most likely outcome?",opts:["Price moves higher — reversal confirmed","Price continues lower despite the signal","Price goes sideways","The engulfing candle gets negated immediately"],ans:0,exp:"Bullish engulfing patterns at key support levels are one of the highest probability reversal signals. The large bullish candle shows buyers overwhelming sellers. Combined with a key level, this is a strong long signal.",candles:buildEng(2525,5945,1)},
];

const MODULES = [
  {id:"ict",name:"ICT / Smart Money",icon:"\u{1F9E0}",color:"#7c6ceb",desc:"FVGs, Order Blocks, BOS/CHOCH, Liquidity Sweeps"},
  {id:"sd",name:"Supply & Demand",icon:"\u2696\uFE0F",color:"#22c990",desc:"Demand Zones, Supply Zones, RBR/DBD Patterns"},
  {id:"ta",name:"Classical TA",icon:"\u{1F4D0}",color:"#3b82f6",desc:"Head & Shoulders, Double Tops, Triangles, Flags"},
  {id:"pa",name:"Price Action",icon:"\u{1F3AF}",color:"#f59e0b",desc:"Pin Bars, Engulfing Patterns, Reversal Signals"},
];

const TH = {
  dark:{bg:"#060910",card:"#0d1219",card2:"#111822",hover:"#1a2233",bdr:"#1c2536",tx:"#e4e8ed",tx2:"#7b8698",tx3:"#3f4d5e",acc:"#c9a227",acc2:"#7c6ceb",grn:"#22c990",red:"#ef4444",chBg:"#080c15",chGd:"#111b2a",cUp:"#22c990",cDn:"#ef4444"},
  light:{bg:"#f0f2f5",card:"#ffffff",card2:"#f7f8fa",hover:"#ebedf2",bdr:"#dde0e6",tx:"#14171f",tx2:"#6b7280",tx3:"#a0a8b4",acc:"#b8941f",acc2:"#6c5ce7",grn:"#16a34a",red:"#dc2626",chBg:"#fafbfc",chGd:"#eceff4",cUp:"#16a34a",cDn:"#dc2626"},
};

function Chart({candles,theme}) {
  const t=TH[theme]; if(!candles||!candles.length)return null;
  const W=700,H=340,P={t:20,r:60,b:30,l:12};
  const cw=(W-P.l-P.r)/candles.length;
  const maxP=Math.max(...candles.map(c=>c.h)),minP=Math.min(...candles.map(c=>c.l));
  const range=maxP-minP||1,yP=range*0.08;
  const sY=v=>P.t+((maxP+yP-v)/(range+yP*2))*(H-P.t-P.b);
  const gN=5,gS=(range+yP*2)/gN,gs=[];
  for(let i=0;i<=gN;i++){const v=maxP+yP-i*gS;gs.push({y:sY(v),l:v.toFixed(v>10000?0:2)});}
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
      <defs><linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.chBg}/><stop offset="100%" stopColor={theme==="dark"?"#040710":"#f3f4f6"}/></linearGradient></defs>
      <rect width={W} height={H} rx="8" fill="url(#cbg)"/>
      {gs.map((g,i)=><g key={i}><line x1={P.l} y1={g.y} x2={W-P.r+10} y2={g.y} stroke={t.chGd} strokeWidth="0.5"/><text x={W-P.r+14} y={g.y+3.5} fill={t.tx3} fontSize="8" fontFamily="monospace">{g.l}</text></g>)}
      {candles.map((c,i)=>{const x=P.l+i*cw+cw/2;const up=c.c>=c.o;const col=up?t.cUp:t.cDn;const bT=sY(Math.max(c.o,c.c));const bB=sY(Math.min(c.o,c.c));
        return<g key={i}><line x1={x} y1={sY(c.h)} x2={x} y2={sY(c.l)} stroke={col} strokeWidth="1" opacity="0.8"/><rect x={x-cw*0.35} y={bT} width={cw*0.7} height={Math.max(bB-bT,0.8)} fill={col} rx="0.5" opacity="0.9"/></g>})}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const[theme,setTheme]=useState("dark");
  const[screen,setScreen]=useState("home");
  const[selMod,setSelMod]=useState(null);
  const[drillIdx,setDrillIdx]=useState(0);
  const[selected,setSelected]=useState(null);
  const[showAnswer,setShowAnswer]=useState(false);
  const[score,setScore]=useState({correct:0,total:0,streak:0,bestStreak:0,xp:0});
  const[drillScenarios,setDrillScenarios]=useState([]);
  const[speedTimer,setSpeedTimer]=useState(15);
  const[speedActive,setSpeedActive]=useState(false);
  const timerRef=useRef(null);
  const t=TH[theme];

  useEffect(()=>{try{const s=localStorage.getItem("cd-progress");if(s)setScore(JSON.parse(s));}catch{}},[]);
  useEffect(()=>{if(score.total>0)try{localStorage.setItem("cd-progress",JSON.stringify(score));}catch{}},[score]);

  const startModule=(id)=>{setDrillScenarios(SCENARIOS.filter(s=>s.mod===id&&s.mode==="identify"));setSelMod(id);setDrillIdx(0);setSelected(null);setShowAnswer(false);setScreen("drill");};
  const startPredict=(id)=>{const s=SCENARIOS.filter(s=>s.mod===id&&s.mode==="predict");setDrillScenarios(s.length?s:SCENARIOS.filter(s=>s.mode==="predict"));setSelMod(id);setDrillIdx(0);setSelected(null);setShowAnswer(false);setScreen("drill");};
  const startSpeed=()=>{setDrillScenarios([...SCENARIOS.filter(s=>s.mode==="identify")].sort(()=>Math.random()-0.5));setDrillIdx(0);setSelected(null);setShowAnswer(false);setSpeedTimer(15);setSpeedActive(true);setScreen("speedDrill");};

  useEffect(()=>{
    if(screen==="speedDrill"&&speedActive&&!showAnswer){
      timerRef.current=setInterval(()=>{setSpeedTimer(p=>{if(p<=1){clearInterval(timerRef.current);setShowAnswer(true);setSpeedActive(false);setScore(s=>({...s,total:s.total+1,streak:0}));return 0;}return p-1;});},1000);
      return()=>clearInterval(timerRef.current);
    }
  },[screen,speedActive,showAnswer,drillIdx]);

  const handleAnswer=(idx)=>{
    if(showAnswer)return;const sc=drillScenarios[drillIdx];setSelected(idx);setShowAnswer(true);
    if(screen==="speedDrill"){clearInterval(timerRef.current);setSpeedActive(false);}
    const ok=idx===sc.ans;
    setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1,streak:ok?s.streak+1:0,bestStreak:ok?Math.max(s.bestStreak,s.streak+1):s.bestStreak,xp:s.xp+(ok?(screen==="speedDrill"?25:15):3)}));
  };

  const nextScenario=()=>{
    if(drillIdx+1>=drillScenarios.length){setScreen("results");return;}
    setDrillIdx(drillIdx+1);setSelected(null);setShowAnswer(false);
    if(screen==="speedDrill"){setSpeedTimer(15);setSpeedActive(true);}
  };

  const scenario=drillScenarios[drillIdx]||null;
  const modInfo=MODULES.find(m=>m.id===(selMod||(scenario&&scenario.mod)));
  const accuracy=score.total>0?Math.round((score.correct/score.total)*100):0;

  const sBase={fontFamily:"'JetBrains Mono','SF Mono','Fira Code',monospace",color:t.tx,background:t.bg,minHeight:"100vh",transition:"all 0.3s"};
  const sCard={background:t.card,border:`1px solid ${t.bdr}`,borderRadius:12,padding:"20px",marginBottom:12};

  // HOME
  if(screen==="home"){return(
    <div style={sBase}><Head><title>ChartDrills — Master Trading Patterns</title></Head>
    <div style={{maxWidth:740,margin:"0 auto",padding:"20px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div><div style={{fontSize:22,fontWeight:700,color:t.acc,letterSpacing:"-0.5px"}}>{"\u25C6"} ChartDrills</div><div style={{fontSize:11,color:t.tx2,marginTop:2}}>Master pattern recognition with real futures data</div></div>
        <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{background:t.card,border:`1px solid ${t.bdr}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",color:t.tx2,fontSize:16}}>{theme==="dark"?"\u2600\uFE0F":"\uD83C\uDF19"}</button>
      </div>
      <div style={{...sCard,display:"flex",gap:20,flexWrap:"wrap",padding:"16px 20px"}}>
        {[["XP",score.xp,t.acc],["Accuracy",accuracy+"%",accuracy>=70?t.grn:accuracy>=40?t.acc:t.red],["Drills",score.total,t.tx],["Best Streak",score.bestStreak+"\uD83D\uDD25",t.acc2]].map(([l,v,c])=>
          <div key={l} style={{flex:1,minWidth:80}}><div style={{fontSize:10,color:t.tx3,textTransform:"uppercase",letterSpacing:1}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>
        )}
      </div>
      <button onClick={startSpeed} style={{width:"100%",padding:"16px 20px",borderRadius:12,background:`linear-gradient(135deg,${t.acc}22,${t.acc}08)`,border:`1.5px solid ${t.acc}44`,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:14,fontFamily:"inherit",textAlign:"left"}}>
        <div style={{fontSize:28}}>{"\u26A1"}</div><div><div style={{fontSize:15,fontWeight:700,color:t.acc}}>Speed Drill</div><div style={{fontSize:11,color:t.tx2}}>15 seconds per question · All modules · Random order</div></div>
      </button>
      <div style={{fontSize:11,color:t.tx3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,marginTop:8}}>Modules</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {MODULES.map(mod=>{const ic=SCENARIOS.filter(s=>s.mod===mod.id&&s.mode==="identify").length,pc=SCENARIOS.filter(s=>s.mod===mod.id&&s.mode==="predict").length;
          return<div key={mod.id} style={{...sCard,padding:"16px",cursor:"pointer",borderLeft:`3px solid ${mod.color}`,transition:"all 0.2s"}} onClick={()=>{setSelMod(mod.id);setScreen("module");}}>
            <div style={{fontSize:24,marginBottom:8}}>{mod.icon}</div><div style={{fontSize:13,fontWeight:700,color:t.tx,marginBottom:4}}>{mod.name}</div><div style={{fontSize:10,color:t.tx2,lineHeight:1.4}}>{mod.desc}</div><div style={{fontSize:10,color:mod.color,marginTop:8,fontWeight:600}}>{ic} identify · {pc} predict</div></div>})}
      </div>
      <div style={{marginTop:20,padding:"12px 16px",borderRadius:8,background:t.card2,border:`1px solid ${t.bdr}`}}>
        <div style={{fontSize:10,color:t.tx3,lineHeight:1.6}}>{"\uD83D\uDCCA"} Charts built from real <span style={{color:t.acc}}>NQ · ES · YM · RTY</span> futures price action via Databento CME data — Jan 2025 sessions.</div>
      </div>
    </div></div>
  );}

  // MODULE
  if(screen==="module"&&selMod){const mod=MODULES.find(m=>m.id===selMod);const iS=SCENARIOS.filter(s=>s.mod===selMod&&s.mode==="identify"),pS=SCENARIOS.filter(s=>s.mod===selMod&&s.mode==="predict");const topics=[...new Set(iS.map(s=>s.topic))];
    return(<div style={sBase}><Head><title>{mod.name} — ChartDrills</title></Head><div style={{maxWidth:740,margin:"0 auto",padding:"20px 16px"}}>
      <button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:t.tx2,cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:16,padding:0}}>{"\u2190"} Back to modules</button>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}><div style={{fontSize:36}}>{mod.icon}</div><div><div style={{fontSize:20,fontWeight:700,color:t.tx}}>{mod.name}</div><div style={{fontSize:12,color:t.tx2}}>{mod.desc}</div></div></div>
      <button onClick={()=>startModule(selMod)} style={{width:"100%",padding:"16px 20px",borderRadius:12,background:`linear-gradient(135deg,${mod.color}22,${mod.color}08)`,border:`1.5px solid ${mod.color}44`,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",gap:14,fontFamily:"inherit",textAlign:"left"}}>
        <div style={{fontSize:24}}>{"\uD83D\uDD0D"}</div><div><div style={{fontSize:14,fontWeight:700,color:mod.color}}>Identify Mode</div><div style={{fontSize:11,color:t.tx2}}>{iS.length} scenarios · Name the pattern</div></div></button>
      <button onClick={()=>startPredict(selMod)} style={{width:"100%",padding:"16px 20px",borderRadius:12,background:`linear-gradient(135deg,${t.acc}22,${t.acc}08)`,border:`1.5px solid ${t.acc}44`,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:14,fontFamily:"inherit",textAlign:"left"}}>
        <div style={{fontSize:24}}>{"\uD83C\uDFAF"}</div><div><div style={{fontSize:14,fontWeight:700,color:t.acc}}>Predict Mode</div><div style={{fontSize:11,color:t.tx2}}>{pS.length||"All"} scenarios · What happens next?</div></div></button>
      <div style={{fontSize:11,color:t.tx3,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Topics Covered</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{topics.map(tp=><span key={tp} style={{padding:"5px 10px",borderRadius:6,fontSize:11,background:t.card2,border:`1px solid ${t.bdr}`,color:t.tx2}}>{tp}</span>)}</div>
    </div></div>);
  }

  // DRILL
  if((screen==="drill"||screen==="speedDrill")&&scenario){const isSpd=screen==="speedDrill";
    return(<div style={sBase}><Head><title>{scenario.inst} {scenario.tf} — ChartDrills</title></Head><div style={{maxWidth:740,margin:"0 auto",padding:"20px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>{setScreen("home");setSpeedActive(false);clearInterval(timerRef.current);}} style={{background:"transparent",border:"none",color:t.tx2,cursor:"pointer",fontSize:12,fontFamily:"inherit",padding:0}}>{"\u2715"} Exit</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {isSpd&&<div style={{fontSize:18,fontWeight:700,color:speedTimer<=5?t.red:speedTimer<=10?t.acc:t.grn,minWidth:36,textAlign:"center"}}>{speedTimer}s</div>}
          <div style={{fontSize:11,color:t.tx2}}>{drillIdx+1} / {drillScenarios.length}</div>
          {score.streak>=2&&<div style={{fontSize:12,color:t.acc}}>{"\uD83D\uDD25"}{score.streak}</div>}
        </div>
      </div>
      <div style={{height:3,background:t.bdr,borderRadius:2,marginBottom:16,overflow:"hidden"}}>
        <div style={{height:"100%",background:isSpd?(speedTimer<=5?t.red:t.acc):(modInfo?.color||t.acc),width:isSpd?`${(speedTimer/15)*100}%`:`${((drillIdx+1)/drillScenarios.length)*100}%`,borderRadius:2,transition:isSpd?"width 1s linear":"width 0.3s"}}/></div>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <span style={{padding:"3px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:t.acc+"22",color:t.acc}}>{scenario.inst}</span>
        <span style={{padding:"3px 8px",borderRadius:4,fontSize:10,background:t.card2,color:t.tx2,border:`1px solid ${t.bdr}`}}>{scenario.tf}</span>
        <span style={{padding:"3px 8px",borderRadius:4,fontSize:10,background:(modInfo?.color||t.acc2)+"18",color:modInfo?.color||t.acc2}}>{scenario.topic}</span>
      </div>
      <div style={{fontSize:14,fontWeight:600,color:t.tx,marginBottom:14,lineHeight:1.5}}>{scenario.q}</div>
      <div style={{...sCard,padding:8,marginBottom:14}}><Chart candles={scenario.candles} theme={theme}/></div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {scenario.opts.map((opt,i)=>{let bg="transparent",bc=t.bdr,tc=t.tx,ic="";
          if(showAnswer){if(i===scenario.ans){bg=t.grn+"18";bc=t.grn;tc=t.grn;ic="\u2713 ";}else if(i===selected&&i!==scenario.ans){bg=t.red+"18";bc=t.red;tc=t.red;ic="\u2715 ";}else{bc=t.bdr+"66";tc=t.tx3;}}
          else if(i===selected){bg=t.acc+"18";bc=t.acc;}
          return<button key={i} onClick={()=>handleAnswer(i)} style={{background:bg,border:`1.5px solid ${bc}`,borderRadius:10,padding:"12px 16px",cursor:showAnswer?"default":"pointer",fontSize:12,color:tc,fontFamily:"inherit",textAlign:"left",transition:"all 0.2s",lineHeight:1.4}}>
            <span style={{fontWeight:600,marginRight:8,color:t.tx3}}>{String.fromCharCode(65+i)}</span>{ic}{opt}</button>})}
      </div>
      {showAnswer&&<div style={{...sCard,borderLeft:`3px solid ${selected===scenario.ans?t.grn:t.red}`,background:(selected===scenario.ans?t.grn:t.red)+"08"}}>
        <div style={{fontSize:12,fontWeight:700,color:selected===scenario.ans?t.grn:t.red,marginBottom:6}}>{selected===scenario.ans?"\u2713 Correct!":"\u2715 Incorrect"} (+{selected===scenario.ans?(isSpd?25:15):3} XP)</div>
        <div style={{fontSize:12,color:t.tx2,lineHeight:1.6}}>{scenario.exp}</div></div>}
      {showAnswer&&<button onClick={nextScenario} style={{width:"100%",padding:"14px",borderRadius:10,marginTop:10,background:t.acc,color:theme==="dark"?"#000":"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>{drillIdx+1>=drillScenarios.length?"View Results":"Next \u2192"}</button>}
    </div></div>);
  }

  // RESULTS
  if(screen==="results"){return(
    <div style={sBase}><Head><title>Results — ChartDrills</title></Head><div style={{maxWidth:740,margin:"0 auto",padding:"20px 16px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12,marginTop:30}}>{accuracy>=80?"\uD83C\uDFC6":accuracy>=60?"\uD83D\uDCAA":accuracy>=40?"\uD83D\uDCC8":"\uD83D\uDCA1"}</div>
      <div style={{fontSize:22,fontWeight:700,color:t.tx,marginBottom:6}}>Drill Complete!</div>
      <div style={{fontSize:13,color:t.tx2,marginBottom:24}}>{accuracy>=80?"Outstanding pattern recognition!":accuracy>=60?"Solid work — keep drilling!":accuracy>=40?"Getting there — review the explanations.":"Keep practicing — repetition builds mastery."}</div>
      <div style={{...sCard,display:"flex",justifyContent:"space-around",padding:"24px 20px"}}>
        <div><div style={{fontSize:28,fontWeight:700,color:t.acc}}>{score.xp}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>Total XP</div></div>
        <div><div style={{fontSize:28,fontWeight:700,color:accuracy>=70?t.grn:t.acc}}>{accuracy}%</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>Accuracy</div></div>
        <div><div style={{fontSize:28,fontWeight:700,color:t.acc2}}>{score.bestStreak}{"\uD83D\uDD25"}</div><div style={{fontSize:10,color:t.tx3,marginTop:2}}>Best Streak</div></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20}}>
        <button onClick={()=>setScreen("home")} style={{flex:1,padding:"14px",borderRadius:10,background:"transparent",border:`1.5px solid ${t.bdr}`,color:t.tx,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Home</button>
        <button onClick={startSpeed} style={{flex:1,padding:"14px",borderRadius:10,background:t.acc,border:"none",color:theme==="dark"?"#000":"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"}}>{"\u26A1"} Speed Drill</button>
      </div>
    </div></div>);
  }

  return<div style={sBase}><div style={{padding:40,textAlign:"center",color:t.tx2}}>Loading...</div></div>;
}
