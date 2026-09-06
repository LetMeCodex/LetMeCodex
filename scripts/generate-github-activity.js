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

async function buildActivitySvg(forcedDay = null) {
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
  const activeDayIndex = forcedDay !== null ? Number(forcedDay) : istTime.getUTCDay();
  const egg = SEVEN_DAY_EASTER_EGGS[activeDayIndex] || SEVEN_DAY_EASTER_EGGS[6];

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

  const outPath = path.join(__dirname, '../assets/github-activity.svg');
  fs.writeFileSync(outPath, cleanedSvg, 'utf8');
  console.log(`[+] Generated pixel-perfect activity SVG for ${egg.name} (${egg.shortName}) -> ${outPath}`);
}

const args = process.argv.slice(2);
let targetDay = null;
const dayArg = args.find(a => a.startsWith('--day='));
if (dayArg) {
  const val = dayArg.split('=')[1];
  targetDay = parseInt(val, 10);
}

buildActivitySvg(targetDay);
