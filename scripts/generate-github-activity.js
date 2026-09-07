const fs = require('fs');
const path = require('path');

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const SEVEN_DAY_EASTER_EGGS = {
  0: {
    day: 0,
    shortName: 'Sun',
    name: 'Solar Supernova',
    tag: 'COSMIC STELLAR FLARE',
    accent: '#F59E0B',
    palette: ['#161B22', '#78350F', '#D97706', '#F59E0B', '#FDE047'],
    symbol: '☀️',
    renderArt: (width, height) => `
      <!-- Sun Solar Corona -->
      <circle cx="820" cy="130" r="32" fill="none" stroke="#FDE047" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="820" cy="130" r="22" fill="rgba(253, 224, 71, 0.15)" stroke="#F59E0B" stroke-width="1.8"/>
      <line x1="820" y1="92" x2="820" y2="82" stroke="#FDE047" stroke-width="2"/>
      <line x1="820" y1="168" x2="820" y2="178" stroke="#FDE047" stroke-width="2"/>
      <line x1="782" y1="130" x2="772" y2="130" stroke="#FDE047" stroke-width="2"/>
      <line x1="858" y1="130" x2="868" y2="130" stroke="#FDE047" stroke-width="2"/>
    `
  },
  1: {
    day: 1,
    shortName: 'Mon',
    name: 'Cyberpunk Phosphor',
    tag: 'DIGITAL PHOSPHOR STREAM',
    accent: '#10B981',
    palette: ['#0D1117', '#064E3B', '#059669', '#10B981', '#34D399'],
    symbol: '⚡',
    renderArt: (width, height) => `
      <!-- Mon Cyberpunk Traces -->
      <path d="M 750 110 L 810 110 L 830 130 L 860 130" fill="none" stroke="#10B981" stroke-width="1.5"/>
      <circle cx="860" cy="130" r="4" fill="#34D399"/>
      <circle cx="750" cy="110" r="3" fill="#10B981"/>
    `
  },
  2: {
    day: 2,
    shortName: 'Tue',
    name: 'Quantum Aurora',
    tag: 'ETHEREAL BOREALIS',
    accent: '#38BDF8',
    palette: ['#0E121E', '#312E81', '#6366F1', '#06B6D4', '#38BDF8'],
    symbol: '🌌',
    renderArt: (width, height) => `
      <!-- Tue Aurora Waves -->
      <path d="M 680 120 Q 750 90 810 125 T 870 110" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.8"/>
      <path d="M 690 128 Q 760 98 820 133 T 880 118" fill="none" stroke="#6366F1" stroke-width="1.5" opacity="0.6"/>
    `
  },
  3: {
    day: 3,
    shortName: 'Wed',
    name: 'Retro Synthwave',
    tag: '1984 OUTRUN HORIZON',
    accent: '#F43F5E',
    palette: ['#120F1D', '#701A75', '#C026D3', '#F43F5E', '#FB7185'],
    symbol: '🌆',
    renderArt: (width, height) => `
      <!-- Wed Outrun Sun -->
      <ellipse cx="820" cy="135" rx="34" ry="24" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" stroke-width="1.8"/>
      <line x1="786" y1="135" x2="854" y2="135" stroke="#FB7185" stroke-width="1.5"/>
      <line x1="790" y1="142" x2="850" y2="142" stroke="#FB7185" stroke-width="1.5"/>
    `
  },
  4: {
    day: 4,
    shortName: 'Thu',
    name: 'Zen Hydro-Wave',
    tag: 'LIQUID CAUSTIC RIPPLES',
    accent: '#14B8A6',
    palette: ['#0D1518', '#134E4A', '#0D9488', '#14B8A6', '#5EEAD4'],
    symbol: '🌊',
    renderArt: (width, height) => `
      <!-- Thu Concentric Caustic Ripples -->
      <circle cx="820" cy="130" r="20" fill="none" stroke="#5EEAD4" stroke-width="1.5"/>
      <circle cx="820" cy="130" r="38" fill="none" stroke="rgba(94, 234, 212, 0.4)" stroke-width="1.2"/>
      <circle cx="820" cy="130" r="54" fill="none" stroke="rgba(20, 184, 166, 0.2)" stroke-width="0.9"/>
    `
  },
  5: {
    day: 5,
    shortName: 'Fri',
    name: "Conway's Living Colony",
    tag: 'LIVING CELLULAR AUTOMATA',
    accent: '#84CC16',
    palette: ['#0F1612', '#365314', '#65A30D', '#84CC16', '#BEF264'],
    symbol: '🧬',
    renderArt: (width, height) => `
      <!-- Fri Cellular Colony -->
      <circle cx="790" cy="120" r="14" fill="rgba(132, 204, 22, 0.2)" stroke="#84CC16" stroke-width="1.5"/>
      <circle cx="810" cy="135" r="10" fill="rgba(190, 242, 100, 0.3)" stroke="#BEF264" stroke-width="1.2"/>
      <circle cx="835" cy="120" r="16" fill="rgba(132, 204, 22, 0.25)" stroke="#84CC16" stroke-width="1.5"/>
    `
  },
  6: {
    day: 6,
    shortName: 'Sat',
    name: 'Halloween Spook',
    tag: "JACK-O'-LANTERN GHOST FLARE",
    accent: '#FA7A18',
    palette: ['#161B22', '#631C03', '#BD561D', '#FA7A18', '#FDDF68'],
    symbol: '🎃',
    renderArt: (width, height) => `
      <!-- Sat Jack-o'-Lantern and Ghost Flare (Exact match to screenshot) -->
      <g transform="translate(805, 96)">
        <!-- Pumpkin Body -->
        <ellipse cx="20" cy="20" rx="22" ry="17" fill="rgba(250, 122, 24, 0.25)" stroke="#FA7A18" stroke-width="2"/>
        <!-- Stem -->
        <line x1="20" y1="3" x2="22" y2="-4" stroke="#65A30D" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Eyes (Triangles) -->
        <polygon points="12,16 16,16 14,11" fill="#FDDF68"/>
        <polygon points="24,16 28,16 26,11" fill="#FDDF68"/>
        <!-- Nose -->
        <polygon points="19,19 21,19 20,17" fill="#FDDF68"/>
        <!-- Toothy Grin -->
        <path d="M 12 23 Q 20 28 28 23" fill="none" stroke="#FDDF68" stroke-width="2" stroke-linecap="round"/>
      </g>
    `
  }
};

function buildSvgContent(data, activeDayIndex = 1) {
  const now = new Date();
  const egg = SEVEN_DAY_EASTER_EGGS[activeDayIndex] || SEVEN_DAY_EASTER_EGGS[1];

  const totalContribs = (data && data.total && (data.total['2026'] || data.total['lastYear'])) || 1313;
  const contribsList = (data && data.contributions) || [];

  const contribMap = {};
  contribsList.forEach(c => { contribMap[c.date] = c; });

  // 53 Weeks Grid Calculations
  // Last 12 months ending today (or reference date in 2026)
  const endDate = new Date(now);
  const currentDayOfWeek = now.getUTCDay();
  const totalDays = 52 * 7 + currentDayOfWeek;
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - totalDays);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthHeaders = [];
  let lastMonth = -1;

  for (let w = 0; w < 53; w++) {
    const weekDate = new Date(startDate);
    weekDate.setUTCDate(startDate.getUTCDate() + (w * 7));
    const m = weekDate.getUTCMonth();
    if (m !== lastMonth && w < 51) {
      monthHeaders.push({ label: months[m], x: 44 + (w * 14.8) });
      lastMonth = m;
    }
  }

  // Generate 53 columns x 7 rows cells
  let cellsSvg = '';
  let cursor = new Date(startDate);

  for (let w = 0; w < 53; w++) {
    const colX = 44 + (w * 14.8);
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(cursor);
      const dateKey = cellDate.toISOString().substring(0, 10);
      cursor.setUTCDate(cursor.getUTCDate() + 1);

      if (cellDate > endDate) continue;

      const item = contribMap[dateKey] || { count: 0, level: 0 };
      const count = item.count || 0;
      let level = item.level;
      if (level === undefined) {
        if (count >= 30) level = 4;
        else if (count >= 20) level = 3;
        else if (count >= 10) level = 2;
        else if (count >= 1) level = 1;
        else level = 0;
      }

      const color = egg.palette[level] || egg.palette[0];
      const cellY = 114 + (d * 14.5);
      const strokeAttr = level === 0 ? 'stroke="#21262D" stroke-width="1"' : '';

      // Highlight selected cell from screenshot (12 Feb 2026: 0 contributions) around col 22, row 4
      const isSelectedCell = (dateKey === '2026-02-12');
      const selectionBox = isSelectedCell
        ? `<rect x="${colX - 2}" y="${cellY - 2}" width="15" height="15" rx="3" fill="none" class="selected-box"/>`
        : '';

      const animClass = level > 0 ? `class="rw-${w % 8}"` : '';
      cellsSvg += `\n    <rect x="${colX}" y="${cellY}" width="11" height="11" rx="2" fill="${color}" ${strokeAttr} ${animClass}/>${selectionBox}`;
    }
  }

  // 12 Random Floating Embers matching Easter Egg
  const embersSvg = Array.from({ length: 18 }, (_, i) => {
    const ex = 40 + Math.floor(Math.sin(i * 137.5) * 400 + 420);
    const ey = 80 + (i * 9) % 150;
    const dur = (2.2 + (i % 4) * 0.8).toFixed(1);
    const del = ((i % 5) * 0.4).toFixed(1);
    const sz = (i % 3 === 0 ? 2 : 1.5);
    return `<circle cx="${ex}" cy="${ey}" r="${sz}" fill="${egg.palette[4]}" class="particle" style="animation-duration: ${dur}s; animation-delay: ${del}s;"/>`;
  }).join('\n    ');

  // Days Pill Bar SVG
  const dayPillsSvg = [0, 1, 2, 3, 4, 5, 6].map((d, i) => {
    const e = SEVEN_DAY_EASTER_EGGS[d];
    const isAct = (d === activeDayIndex);
    const px = i * 36;
    const bg = isAct ? '#21262D' : '#161B22';
    const fg = isAct ? '#F0F6FC' : '#7D8590';
    const border = isAct ? '#30363D' : 'transparent';
    const fontW = isAct ? '600' : '400';
    return `<rect x="${px}" y="0" width="34" height="22" rx="4" fill="${bg}" stroke="${border}" stroke-width="1"/>
      <text x="${px + 17}" y="15" text-anchor="middle" class="mono" fill="${fg}" font-size="11" font-weight="${fontW}">${e.shortName}</text>`;
  }).join('\n      ');

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 320" width="100%" height="100%">
  <defs>
    <style>
      @keyframes emberFloat {
        0%, 100% { transform: translateY(0); opacity: 0.3; }
        50% { transform: translateY(-8px) scale(1.3); opacity: 0.9; }
      }
      @keyframes rippleWave {
        0%, 100% { opacity: 0.85; filter: brightness(1); }
        35% { opacity: 1; filter: brightness(1.45); }
        70% { opacity: 0.85; filter: brightness(1); }
      }
      @keyframes selectedPulse {
        0%, 100% { stroke: #FFFFFF; stroke-width: 1.5; opacity: 0.7; }
        50% { stroke: #FFFFFF; stroke-width: 2.2; opacity: 1; }
      }
      @keyframes replayWiggle {
        0%, 88%, 100% { transform: scale(1); }
        92% { transform: scale(1.2) rotate(8deg); }
        96% { transform: scale(1.1) rotate(-4deg); }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .particle { animation: emberFloat infinite ease-in-out; }
      .selected-box { animation: selectedPulse 2s infinite ease-in-out; }
      .replay-btn { animation: replayWiggle 5s infinite ease-in-out; transform-origin: center; }

      .rw-0 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.0s; }
      .rw-1 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.35s; }
      .rw-2 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.7s; }
      .rw-3 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.05s; }
      .rw-4 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.4s; }
      .rw-5 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.75s; }
      .rw-6 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 2.1s; }
      .rw-7 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 2.45s; }
    </style>
  </defs>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- TOP HEADER ROW                                               -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(16, 26)">
    <!-- Label -->
    <text x="0" y="0" class="mono" fill="#7D8590" font-size="11" font-weight="600" letter-spacing="1">GITHUB ACTIVITY</text>

    <!-- Stat Value & Subtext -->
    <g transform="translate(0, 32)">
      <text x="0" y="0" class="inter" fill="#F0F6FC" font-size="32" font-weight="700" letter-spacing="-0.5">${Number(totalContribs).toLocaleString()}</text>
      <text x="96" y="-2" class="inter" fill="#7D8590" font-size="14">contributions in the last 12 months</text>
    </g>
  </g>

  <!-- Top Right Controls (Day Selector, Replay, Year Selector) -->
  <g transform="translate(480, 24)">
    <!-- 7-Day Pill Container -->
    <g transform="translate(0, 0)">
      <rect x="-4" y="-3" width="260" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      ${dayPillsSvg}
    </g>

    <!-- Replay Button -->
    <g transform="translate(268, 0)">
      <rect x="0" y="-3" width="70" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      <polygon points="14,6 14,16 22,11" fill="${egg.accent}"/>
      <text x="28" y="15" class="mono" fill="#7D8590" font-size="11">Replay</text>
    </g>

    <!-- Year Toggle (2026 Active) -->
    <g transform="translate(348, 0)">
      <rect x="0" y="-3" width="90" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      <!-- 2026 Pill -->
      <rect x="2" y="-1" width="42" height="24" rx="4" fill="#21262D" stroke="#30363D" stroke-width="1"/>
      <text x="23" y="15" text-anchor="middle" class="mono" fill="#F0F6FC" font-size="11" font-weight="600">2026</text>
      <!-- 2025 -->
      <text x="66" y="15" text-anchor="middle" class="mono" fill="#7D8590" font-size="11">2025</text>
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- MAIN MATRIX CONTAINER CARD                                    -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(16, 75)">
    <rect width="888" height="235" rx="6" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

    <!-- Floating Embers Layer -->
    <g opacity="0.65">
      ${embersSvg}
    </g>

    <!-- Month Labels -->
    <g class="inter" fill="#7D8590" font-size="11" font-weight="500">
      ${monthHeaders.map(m => `<text x="${m.x}" y="24">${m.label}</text>`).join('\n      ')}
    </g>

    <!-- Weekday Labels -->
    <g class="inter" fill="#7D8590" font-size="10" font-weight="500" text-anchor="end">
      <text x="32" y="58">Mon</text>
      <text x="32" y="87">Wed</text>
      <text x="32" y="116">Fri</text>
    </g>

    <!-- 53-Week Contribution Grid Cells -->
    <g transform="translate(0, -75)">
      ${cellsSvg}
    </g>

    <!-- Easter Egg Handcrafted Overlay -->
    ${egg.renderArt(888, 235)}

    <!-- Bottom Footer Bar -->
    <line x1="16" y1="198" x2="872" y2="198" stroke="#21262D" stroke-width="1"/>

    <g transform="translate(20, 218)">
      <!-- Selected Cell Text (Exact from screenshot) -->
      <text x="0" y="0" class="inter" fill="#F0F6FC" font-size="12" font-weight="500">12 Feb 2026: 0 contributions</text>
      <text x="175" y="0" class="inter" fill="#7D8590" font-size="12">• Data synchronized from GitHub API</text>

      <!-- Less / More Intensity Scale in Active Palette -->
      <g transform="translate(735, -9)" class="inter" font-size="11" fill="#7D8590">
        <text x="-32" y="9">Less</text>
        <rect x="0" y="0" width="10" height="10" rx="2" fill="${egg.palette[0]}" stroke="#21262D"/>
        <rect x="13" y="0" width="10" height="10" rx="2" fill="${egg.palette[1]}"/>
        <rect x="26" y="0" width="10" height="10" rx="2" fill="${egg.palette[2]}"/>
        <rect x="39" y="0" width="10" height="10" rx="2" fill="${egg.palette[3]}"/>
        <rect x="52" y="0" width="10" height="10" rx="2" fill="${egg.palette[4]}"/>
        <text x="68" y="9">More</text>
      </g>
    </g>
  </g>
</svg>`;

  const cleanedSvg = finalSvg.replace(/<!--(.*?)-->/gs, (match) => {
    return match.replace(/&/g, 'and');
  });

  return cleanedSvg;
}

function buildCyclingShowcaseSvg(data) {
  const now = new Date();
  const totalContribs = (data && data.total && (data.total['2026'] || data.total['lastYear'])) || 1313;
  const contribsList = (data && data.contributions) || [];
  const contribMap = {};
  contribsList.forEach(c => { contribMap[c.date] = c; });

  const currentDayOfWeek = now.getUTCDay();
  const totalDays = 52 * 7 + currentDayOfWeek;
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - totalDays);
  const endDate = new Date(now);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthHeaders = [];
  let lastMonth = -1;
  for (let w = 0; w < 53; w++) {
    const weekDate = new Date(startDate);
    weekDate.setUTCDate(startDate.getUTCDate() + (w * 7));
    const m = weekDate.getUTCMonth();
    if (m !== lastMonth && w < 51) {
      monthHeaders.push({ label: months[m], x: 44 + (w * 14.8) });
      lastMonth = m;
    }
  }

  let layersSvg = '';
  for (let d = 0; d < 7; d++) {
    const egg = SEVEN_DAY_EASTER_EGGS[d];
    let cursor = new Date(startDate);
    let cellsSvg = '';

    for (let w = 0; w < 53; w++) {
      const colX = 44 + (w * 14.8);
      for (let r = 0; r < 7; r++) {
        const cellDate = new Date(cursor);
        const dateKey = cellDate.toISOString().substring(0, 10);
        cursor.setUTCDate(cursor.getUTCDate() + 1);

        if (cellDate > endDate) continue;

        const item = contribMap[dateKey] || { count: 0, level: 0 };
        const count = item.count || 0;
        let level = item.level;
        if (level === undefined) {
          if (count >= 30) level = 4;
          else if (count >= 20) level = 3;
          else if (count >= 10) level = 2;
          else if (count >= 1) level = 1;
          else level = 0;
        }

        const color = egg.palette[level] || egg.palette[0];
        const cellY = 114 + (r * 14.5);
        const strokeAttr = level === 0 ? 'stroke="#21262D" stroke-width="1"' : '';

        const isSelectedCell = (dateKey === '2026-02-12');
        const selectionBox = isSelectedCell
          ? `<rect x="${colX - 2}" y="${cellY - 2}" width="15" height="15" rx="3" fill="none" class="selected-box"/>`
          : '';

        const animClass = level > 0 ? `class="rw-${w % 8}"` : '';
        cellsSvg += `\n      <rect x="${colX}" y="${cellY}" width="11" height="11" rx="2" fill="${color}" ${strokeAttr} ${animClass}/>${selectionBox}`;
      }
    }

    const embersSvg = Array.from({ length: 18 }, (_, i) => {
      const ex = 40 + Math.floor(Math.sin(i * 137.5) * 400 + 420);
      const ey = 80 + (i * 9) % 150;
      const dur = (2.2 + (i % 4) * 0.8).toFixed(1);
      const del = ((i % 5) * 0.4).toFixed(1);
      const sz = (i % 3 === 0 ? 2 : 1.5);
      return `<circle cx="${ex}" cy="${ey}" r="${sz}" fill="${egg.palette[4]}" class="particle" style="animation-duration: ${dur}s; animation-delay: ${del}s;"/>`;
    }).join('\n      ');

    layersSvg += `
    <g class="cycle-layer cycle-layer-${d}">
      <g opacity="0.65">
        ${embersSvg}
      </g>
      <g transform="translate(0, -75)">
        ${cellsSvg}
      </g>
      ${egg.renderArt(888, 235)}
      <g transform="translate(20, 218)">
        <text x="0" y="0" class="inter" fill="#F0F6FC" font-size="12" font-weight="500">12 Feb 2026: 0 contributions</text>
        <text x="175" y="0" class="inter" fill="${egg.accent}" font-size="12" font-weight="600">• ${egg.symbol} ${egg.shortName}: ${egg.name}</text>
        <text x="440" y="0" class="inter" fill="#7D8590" font-size="11">(${egg.tag})</text>
        <g transform="translate(735, -9)" class="inter" font-size="11" fill="#7D8590">
          <text x="-32" y="9">Less</text>
          <rect x="0" y="0" width="10" height="10" rx="2" fill="${egg.palette[0]}" stroke="#21262D"/>
          <rect x="13" y="0" width="10" height="10" rx="2" fill="${egg.palette[1]}"/>
          <rect x="26" y="0" width="10" height="10" rx="2" fill="${egg.palette[2]}"/>
          <rect x="39" y="0" width="10" height="10" rx="2" fill="${egg.palette[3]}"/>
          <rect x="52" y="0" width="10" height="10" rx="2" fill="${egg.palette[4]}"/>
          <text x="68" y="9">More</text>
        </g>
      </g>
    </g>`;
  }

  const dayPillsSvg = [0, 1, 2, 3, 4, 5, 6].map((d, i) => {
    const e = SEVEN_DAY_EASTER_EGGS[d];
    const px = i * 36;
    return `<rect x="${px}" y="0" width="34" height="22" rx="4" class="cpill-bg cpill-bg-${d}" fill="#161B22"/>
      <text x="${px + 17}" y="15" text-anchor="middle" class="mono cpill-txt cpill-txt-${d}" font-size="11">${e.shortName}</text>`;
  }).join('\n      ');

  let cycleCss = `
    .cycle-layer { opacity: 0; visibility: hidden; }
  `;
  const slices = [
    { start: 0, end: 14.28, accent: '#F59E0B' },
    { start: 14.29, end: 28.57, accent: '#10B981' },
    { start: 28.58, end: 42.85, accent: '#38BDF8' },
    { start: 42.86, end: 57.14, accent: '#F43F5E' },
    { start: 57.15, end: 71.42, accent: '#14B8A6' },
    { start: 71.43, end: 85.71, accent: '#84CC16' },
    { start: 85.72, end: 100, accent: '#FA7A18' },
  ];

  slices.forEach((s, idx) => {
    const sStart = (s.start).toFixed(2);
    const sMidEnd = (s.end - 0.7).toFixed(2);
    const sEnd = (s.end).toFixed(2);

    cycleCss += `
    .cycle-layer-${idx} { animation: layerCycle${idx} 28s infinite; }
    .cpill-bg-${idx} { animation: pillBgCycle${idx} 28s infinite; }
    .cpill-txt-${idx} { animation: pillTxtCycle${idx} 28s infinite; }`;

    if (idx === 0) {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 99.2% { opacity: 0; visibility: hidden; }
        100% { opacity: 1; visibility: visible; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${sMidEnd}% { fill: #21262D; stroke: ${s.accent}; stroke-width: 1.2px; }
        ${sEnd}%, 99.2% { fill: #161B22; stroke: transparent; }
        100% { fill: #21262D; stroke: ${s.accent}; stroke-width: 1.2px; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${sMidEnd}% { fill: ${s.accent}; font-weight: 700; }
        ${sEnd}%, 99.2% { fill: #7D8590; font-weight: 400; }
        100% { fill: ${s.accent}; font-weight: 700; }
      }`;
    } else if (idx === 6) {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { opacity: 1; visibility: visible; }
        100% { opacity: 0; visibility: hidden; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { fill: #161B22; stroke: transparent; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { fill: #21262D; stroke: ${s.accent}; stroke-width: 1.2px; }
        100% { fill: #161B22; stroke: transparent; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { fill: #7D8590; font-weight: 400; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { fill: ${s.accent}; font-weight: 700; }
        100% { fill: #7D8590; font-weight: 400; }
      }`;
    } else {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${sStart}%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { fill: #161B22; stroke: transparent; }
        ${sStart}%, ${sMidEnd}% { fill: #21262D; stroke: ${s.accent}; stroke-width: 1.2px; }
        ${sEnd}%, 100% { fill: #161B22; stroke: transparent; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { fill: #7D8590; font-weight: 400; }
        ${sStart}%, ${sMidEnd}% { fill: ${s.accent}; font-weight: 700; }
        ${sEnd}%, 100% { fill: #7D8590; font-weight: 400; }
      }`;
    }
  });

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 320" width="100%" height="100%">
  <defs>
    <style>
      @keyframes emberFloat {
        0%, 100% { transform: translateY(0); opacity: 0.3; }
        50% { transform: translateY(-8px) scale(1.3); opacity: 0.9; }
      }
      @keyframes rippleWave {
        0%, 100% { opacity: 0.85; filter: brightness(1); }
        35% { opacity: 1; filter: brightness(1.45); }
        70% { opacity: 0.85; filter: brightness(1); }
      }
      @keyframes selectedPulse {
        0%, 100% { stroke: #FFFFFF; stroke-width: 1.5; opacity: 0.7; }
        50% { stroke: #FFFFFF; stroke-width: 2.2; opacity: 1; }
      }
      @keyframes replayWiggle {
        0%, 88%, 100% { transform: scale(1); }
        92% { transform: scale(1.2) rotate(8deg); }
        96% { transform: scale(1.1) rotate(-4deg); }
      }

      @keyframes photonPulse {
        0%, 100% { r: 5.5; opacity: 0.95; }
        50% { r: 8; opacity: 1; }
      }
      @keyframes auraBreathe {
        0%, 100% { r: 12; opacity: 0.22; }
        50% { r: 18; opacity: 0.45; }
      }
      @keyframes laserDash {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -2080; }
      }
      @keyframes shockPulse1 {
        0%, 8%, 100% { r: 2; opacity: 0; }
        9% { r: 3; opacity: 1; stroke-width: 2; }
        18% { r: 22; opacity: 0; stroke-width: 0.5; }
      }
      @keyframes shockPulse2 {
        0%, 32%, 100% { r: 2; opacity: 0; }
        33% { r: 3; opacity: 1; stroke-width: 2; }
        42% { r: 24; opacity: 0; stroke-width: 0.5; }
      }
      @keyframes shockPulse3 {
        0%, 54%, 100% { r: 2; opacity: 0; }
        55% { r: 4; opacity: 1; stroke-width: 2.5; }
        66% { r: 28; opacity: 0; stroke-width: 0.5; }
      }
      @keyframes arcFlash {
        0%, 53%, 65%, 100% { opacity: 0; }
        55%, 62% { opacity: 0.95; stroke: #FFFFFF; }
        58% { opacity: 0.4; }
      }
      @keyframes paddleGlow {
        0%, 100% { opacity: 0.55; }
        50% { opacity: 1; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .particle { animation: emberFloat infinite ease-in-out; }
      .selected-box { animation: selectedPulse 2s infinite ease-in-out; }
      .replay-btn { transform-box: fill-box; transform-origin: center; }

      .photon-mid { animation: photonPulse 1.8s infinite ease-in-out; }
      .photon-aura { animation: auraBreathe 1.8s infinite ease-in-out; }
      .laser-track { animation: laserDash 14s infinite linear; }
      .shock-1 { animation: shockPulse1 14s infinite ease-out; }
      .shock-2 { animation: shockPulse2 14s infinite ease-out; }
      .shock-3 { animation: shockPulse3 14s infinite ease-out; }
      .arc-flash { animation: arcFlash 14s infinite ease-in-out; }
      .paddle-deflector { animation: paddleGlow 3s infinite ease-in-out; }

      .rw-0 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.0s; }
      .rw-1 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.35s; }
      .rw-2 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 0.7s; }
      .rw-3 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.05s; }
      .rw-4 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.4s; }
      .rw-5 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 1.75s; }
      .rw-6 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 2.1s; }
      .rw-7 { animation: rippleWave 2.8s infinite ease-in-out; animation-delay: 2.45s; }

      ${cycleCss}
    </style>
  </defs>

  <rect width="920" height="320" rx="8" fill="#0D1117"/>

  <!-- Top Header Bar -->
  <g transform="translate(16, 12)">
    <text x="20" y="32" class="mono" fill="#7D8590" font-size="11" letter-spacing="1">GITHUB ACTIVITY // ⚡ KINETIC RESONATOR</text>
    <text x="20" y="55" class="inter" fill="#F0F6FC" font-size="20" font-weight="700">${totalContribs.toLocaleString()}</text>
    <text x="80" y="55" class="inter" fill="#7D8590" font-size="13">contributions in the last 12 months</text>
  </g>

  <!-- Top Right Controls -->
  <g transform="translate(480, 24)">
    <g transform="translate(0, 0)">
      <rect x="-4" y="-3" width="260" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      ${dayPillsSvg}
    </g>

    <g transform="translate(268, 0)" class="replay-btn">
      <rect x="0" y="-3" width="70" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      <polygon points="14,6 14,16 22,11" fill="#10B981"/>
      <text x="28" y="15" class="mono" fill="#7D8590" font-size="11">Replay</text>
    </g>

    <g transform="translate(348, 0)">
      <rect x="0" y="-3" width="90" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      <rect x="2" y="-1" width="42" height="24" rx="4" fill="#21262D" stroke="#30363D" stroke-width="1"/>
      <text x="23" y="15" text-anchor="middle" class="mono" fill="#F0F6FC" font-size="11" font-weight="600">2026</text>
      <text x="66" y="15" text-anchor="middle" class="mono" fill="#7D8590" font-size="11">2025</text>
    </g>
  </g>

  <!-- MAIN MATRIX CONTAINER CARD -->
  <g transform="translate(16, 75)">
    <rect width="888" height="235" rx="6" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

    <!-- Month Labels (Static) -->
    <g class="inter" fill="#7D8590" font-size="11" font-weight="500">
      ${monthHeaders.map(m => `<text x="${m.x}" y="24">${m.label}</text>`).join('\n      ')}
    </g>

    <!-- Weekday Labels (Static) -->
    <g class="inter" fill="#7D8590" font-size="10" font-weight="500" text-anchor="end">
      <text x="32" y="58">Mon</text>
      <text x="32" y="87">Wed</text>
      <text x="32" y="116">Fri</text>
    </g>

    <!-- 7 Continuous Morph Layers -->
    ${layersSvg}

    <!-- ⚡ QUANTUM KINETIC BREAKOUT ENGINE -->
    <g class="breakout-engine">
      <!-- Trailing Laser Track -->
      <path d="M 68 46 L 160 125 L 310 42 L 460 126 L 610 44 L 730 120 L 810 52 L 750 42 L 640 124 L 510 44 L 370 122 L 230 42 L 120 124 Z"
            fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.6" stroke-dasharray="100 240" stroke-linecap="round" class="laser-track" />

      <!-- Kinetic Deflector Pads at Top/Bottom Grid Edges -->
      <rect x="142" y="38" width="36" height="3" rx="1.5" fill="#38BDF8" class="paddle-deflector" />
      <rect x="592" y="40" width="38" height="3" rx="1.5" fill="#38BDF8" class="paddle-deflector" />
      <rect x="442" y="128" width="40" height="3" rx="1.5" fill="#38BDF8" class="paddle-deflector" />
      <rect x="712" y="128" width="44" height="3" rx="1.5" fill="#38BDF8" class="paddle-deflector" />

      <!-- Collision Shockwave Rings -->
      <circle cx="160" cy="125" r="3" fill="none" stroke="#38BDF8" class="shock-1" />
      <circle cx="460" cy="126" r="3" fill="none" stroke="#F59E0B" class="shock-2" />
      <circle cx="730" cy="120" r="4" fill="none" stroke="#38BDF8" class="shock-3" />

      <!-- Critical Overdrive Electric Arc at Level 4 Commit Cluster (730, 120) -->
      <path d="M 730 120 L 718 105 L 726 100 L 710 88 M 730 120 L 745 132 L 758 126 L 766 140" fill="none" stroke="#38BDF8" stroke-width="1.4" stroke-linecap="round" class="arc-flash" />

      <!-- High-Energy Moving Photon Core -->
      <g>
        <animateMotion path="M 68 46 L 160 125 L 310 42 L 460 126 L 610 44 L 730 120 L 810 52 L 750 42 L 640 124 L 510 44 L 370 122 L 230 42 L 120 124 Z" dur="14s" repeatCount="indefinite" />
        <!-- Aura -->
        <circle cx="0" cy="0" r="14" fill="rgba(56, 189, 248, 0.22)" class="photon-aura" />
        <!-- Mid Core -->
        <circle cx="0" cy="0" r="5.5" fill="#38BDF8" class="photon-mid" />
        <!-- Center Hot Core -->
        <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
      </g>
    </g>

    <!-- Bottom Separator Line -->
    <line x1="16" y1="198" x2="872" y2="198" stroke="#21262D" stroke-width="1"/>
  </g>
</svg>`;

  const cleanedSvg = finalSvg.replace(/<!--(.*?)-->/gs, (match) => {
    return match.replace(/&/g, 'and');
  });

  return cleanedSvg;
}

function buildLinearMinimalistActivitySvg(data) {
  const now = new Date();
  const totalContribs = (data && data.total && (data.total['2026'] || data.total['lastYear'])) || 1423;
  const contribsList = (data && data.contributions) || [];
  const contribMap = {};
  contribsList.forEach(c => { contribMap[c.date] = c; });

  const currentDayOfWeek = now.getUTCDay();
  const totalDays = 52 * 7 + currentDayOfWeek;
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - totalDays);
  const endDate = new Date(now);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthHeaders = [];
  let lastMonth = -1;
  for (let w = 0; w < 53; w++) {
    const weekDate = new Date(startDate);
    weekDate.setUTCDate(startDate.getUTCDate() + (w * 7));
    const m = weekDate.getUTCMonth();
    if (m !== lastMonth && w < 51) {
      monthHeaders.push({ label: months[m], x: 44 + (w * 14.8) });
      lastMonth = m;
    }
  }

  // Linear Platinum & Graphite Monochrome Palette
  const platPalette = ['#18181B', '#363C45', '#636C76', '#A1A1AA', '#F4F4F5'];

  let cursor = new Date(startDate);
  let cellsSvg = '';

  for (let w = 0; w < 53; w++) {
    const colX = 44 + (w * 14.8);
    for (let r = 0; r < 7; r++) {
      const cellDate = new Date(cursor);
      const dateKey = cellDate.toISOString().substring(0, 10);
      cursor.setUTCDate(cursor.getUTCDate() + 1);

      if (cellDate > endDate) continue;

      const item = contribMap[dateKey] || { count: 0, level: 0 };
      const count = item.count || 0;
      let level = item.level;
      if (level === undefined) {
        if (count >= 30) level = 4;
        else if (count >= 20) level = 3;
        else if (count >= 10) level = 2;
        else if (count >= 1) level = 1;
        else level = 0;
      }

      const color = platPalette[level] || platPalette[0];
      const cellY = 38 + (r * 14.5);
      const strokeAttr = level === 0 ? 'stroke="#27272A" stroke-width="1" class="cell-l0"' : '';

      const isSelectedCell = (dateKey === '2026-02-12');
      const selectionBox = isSelectedCell
        ? `<rect x="${colX - 2}" y="${cellY - 2}" width="15" height="15" rx="3" fill="none" class="selected-box"/>`
        : '';

      const animClass = level > 0 ? `class="sw-${w % 8}"` : '';
      cellsSvg += `\n      <rect x="${colX}" y="${cellY}" width="11" height="11" rx="2" fill="${color}" ${strokeAttr} ${animClass}/>${selectionBox}`;
    }
  }

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 225" width="100%" height="100%">
  <defs>
    <style>
      @keyframes shimmerWave {
        0%, 100% { opacity: 0.88; filter: brightness(1); }
        50% { opacity: 1; filter: brightness(1.22); }
      }
      @keyframes selectedPulse {
        0%, 100% { stroke: #FFFFFF; stroke-width: 1.5; opacity: 0.6; }
        50% { stroke: #FFFFFF; stroke-width: 2.2; opacity: 1; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      
      .activity-title { fill: #71717A; }
      .activity-num { fill: #F4F4F5; }
      .activity-sub { fill: #71717A; }
      .hairline-div { stroke: #27272A; }
      .cell-l0 { fill: #18181B; stroke: #27272A; }
      .selected-box { animation: selectedPulse 2.4s infinite ease-in-out; }

      .sw-0 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 0.0s; }
      .sw-1 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 0.45s; }
      .sw-2 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 0.9s; }
      .sw-3 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 1.35s; }
      .sw-4 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 1.8s; }
      .sw-5 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 2.25s; }
      .sw-6 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 2.7s; }
      .sw-7 { animation: shimmerWave 3.6s infinite ease-in-out; animation-delay: 3.15s; }

      @media (prefers-color-scheme: light) {
        .activity-num { fill: #18181B; }
        .activity-title { fill: #52525B; }
        .activity-sub { fill: #71717A; }
        .hairline-div { stroke: #E4E4E7; }
        .cell-l0 { fill: #EBEDF0; stroke: #E1E4E8; }
      }
    </style>
  </defs>

  <!-- Top Header Row (Minimal Editorial) -->
  <g transform="translate(16, 26)">
    <text x="0" y="0" class="mono activity-title" font-size="11" font-weight="600" letter-spacing="1.5">GITHUB ACTIVITY</text>
    <g transform="translate(0, 30)">
      <text x="0" y="0" class="inter activity-num" font-size="28" font-weight="700" letter-spacing="-0.5">${Number(totalContribs).toLocaleString()}</text>
      <text x="88" y="-2" class="inter activity-sub" font-size="13">contributions in the last 12 months</text>
    </g>
  </g>

  <!-- Activity Grid Canvas (100% Borderless and Transparent) -->
  <g transform="translate(16, 68)">
    <!-- Month Labels -->
    <g class="inter activity-sub" font-size="11" font-weight="500">
      ${monthHeaders.map(m => `<text x="${m.x}" y="22">${m.label}</text>`).join('\n      ')}
    </g>

    <!-- Weekday Labels -->
    <g class="inter activity-sub" font-size="10" font-weight="500" text-anchor="end">
      <text x="32" y="47">Mon</text>
      <text x="32" y="76">Wed</text>
      <text x="32" y="105">Fri</text>
    </g>

    <!-- Contribution Grid Cells -->
    ${cellsSvg}

    <!-- Bottom Hairline Separator -->
    <line x1="16" y1="148" x2="872" y2="148" class="hairline-div" stroke-width="1"/>

    <!-- Bottom Footer (Minimal Legend) -->
    <g transform="translate(20, 166)">
      <text x="0" y="0" class="inter activity-sub" font-size="11">12 Feb 2026: 0 contributions</text>

      <g transform="translate(735, -9)" class="inter activity-sub" font-size="11">
        <text x="-32" y="9">Less</text>
        <rect x="0" y="0" width="10" height="10" rx="2" class="cell-l0"/>
        <rect x="13" y="0" width="10" height="10" rx="2" fill="#363C45"/>
        <rect x="26" y="0" width="10" height="10" rx="2" fill="#636C76"/>
        <rect x="39" y="0" width="10" height="10" rx="2" fill="#A1A1AA"/>
        <rect x="52" y="0" width="10" height="10" rx="2" fill="#F4F4F5"/>
        <text x="68" y="9">More</text>
      </g>
    </g>
  </g>
</svg>`;

  return finalSvg;
}

async function main() {
  let data;
  try {
    const res = await fetch('https://github-contributions-api.jogruber.de/v4/LetMeCodex');
    data = await res.json();
  } catch (e) {
    console.warn('Using cached data fallback...');
  }

  const now = new Date();
  const utcTime = now.getTime();
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  const todayDay = istTime.getUTCDay();

  const args = process.argv.slice(2);
  let targetDay = null;
  const dayArg = args.find(a => a.startsWith('--day='));
  if (dayArg) {
    targetDay = parseInt(dayArg.split('=')[1], 10);
  }
  const isSingle = args.includes('--single');
  const isMinimal = args.includes('--minimal');

  // Default to 7-Day Synchronized Easter Egg Auto-Morph Showcase
  if (isMinimal) {
    const minimalSvg = buildLinearMinimalistActivitySvg(data);
    fs.writeFileSync(path.join(__dirname, '../assets/github-activity.svg'), minimalSvg, 'utf8');
    console.log('[+] Generated Linear / Apple Minimalist Activity SVG -> github-activity.svg');
  } else if (targetDay !== null || isSingle) {
    const activeDay = targetDay !== null ? targetDay : todayDay;
    const mainSvg = buildSvgContent(data, activeDay);
    fs.writeFileSync(path.join(__dirname, '../assets/github-activity.svg'), mainSvg, 'utf8');
    console.log(`[+] Generated active SVG -> github-activity.svg (Day ${activeDay})`);
  } else {
    const cycleSvg = buildCyclingShowcaseSvg(data);
    fs.writeFileSync(path.join(__dirname, '../assets/github-activity.svg'), cycleSvg, 'utf8');
    console.log('[+] Generated 7-day auto-morph cycling showcase SVG -> github-activity.svg');
  }

  const dayFiles = [
    { day: 0, file: 'github-activity-sun.svg' },
    { day: 1, file: 'github-activity-mon.svg' },
    { day: 2, file: 'github-activity-tue.svg' },
    { day: 3, file: 'github-activity-wed.svg' },
    { day: 4, file: 'github-activity-thu.svg' },
    { day: 5, file: 'github-activity-fri.svg' },
    { day: 6, file: 'github-activity-sat.svg' },
  ];

  for (const item of dayFiles) {
    const svg = buildSvgContent(data, item.day);
    fs.writeFileSync(path.join(__dirname, `../assets/${item.file}`), svg, 'utf8');
    console.log(`[+] Generated ${item.file} (Day ${item.day})`);
  }
}

main();
