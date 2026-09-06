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
    footerText: 'Solar Supernova Active • Cosmic Radiance',
    accent: '#F59E0B',
    palette: ['#161B22', '#78350F', '#D97706', '#F59E0B', '#FDE047'],
    symbol: '☀️',
    quote: '"Stellar fusion core ignited. High-energy radiation sweep active."',
    sketchDetail: 'Rough.js Hand-Drawn Solar Corona & Stellar Flare'
  },
  1: {
    day: 1,
    shortName: 'Mon',
    name: 'Cyberpunk Phosphor',
    tag: 'DIGITAL PHOSPHOR STREAM',
    footerText: 'Cyberpunk Matrix Active • Digital Phosphor Cascade',
    accent: '#10B981',
    palette: ['#0D1117', '#064E3B', '#059669', '#10B981', '#34D399'],
    symbol: '⚡',
    quote: '"Continuous stream of green phosphor commits. Zero dropped frames."',
    sketchDetail: 'Rough.js Circuit Traces & Terminal Brackets'
  },
  2: {
    day: 2,
    shortName: 'Tue',
    name: 'Quantum Aurora',
    tag: 'ETHEREAL BOREALIS',
    footerText: 'Quantum Aurora Borealis • Magnetic Flux Undulation',
    accent: '#38BDF8',
    palette: ['#0E121E', '#312E81', '#6366F1', '#06B6D4', '#38BDF8'],
    symbol: '🌌',
    quote: '"Magnetic dipole perturbation. Multi-harmonic ionosphere excitation."',
    sketchDetail: 'Three.js Orthographic Wave Particles & Dual Sine Arcs'
  },
  3: {
    day: 3,
    shortName: 'Wed',
    name: 'Retro Synthwave',
    tag: '1984 OUTRUN HORIZON',
    footerText: 'Retro 1984 Synthwave • Neon Horizon Active',
    accent: '#F43F5E',
    palette: ['#120F1D', '#701A75', '#C026D3', '#F43F5E', '#FB7185'],
    symbol: '🌆',
    quote: '"Neon wireframe grid extending toward infinite retro outrun horizon."',
    sketchDetail: 'Rough.js Hachure Halftone Sun & Horizon Grid'
  },
  4: {
    day: 4,
    shortName: 'Thu',
    name: 'Zen Hydro-Wave',
    tag: 'LIQUID CAUSTIC RIPPLES',
    footerText: 'Zen Hydro-Caustics Active • Fluid ripple physics',
    accent: '#14B8A6',
    palette: ['#0D1518', '#134E4A', '#0D9488', '#14B8A6', '#5EEAD4'],
    symbol: '🌊',
    quote: '"Surface tension equilibrium. Sub-surface refraction caustics."',
    sketchDetail: 'Procedural Concentric Caustics & Fluid Wave'
  },
  5: {
    day: 5,
    shortName: 'Fri',
    name: "Conway's Living Colony",
    tag: 'LIVING CELLULAR AUTOMATA',
    footerText: 'Living Cellular Automata • Generational Colony Active',
    accent: '#84CC16',
    palette: ['#0F1612', '#365314', '#65A30D', '#84CC16', '#BEF264'],
    symbol: '🧬',
    quote: '"Any live cell with two or three live neighbors survives."',
    sketchDetail: 'Organic Cellular Spores & Glider Gun Automata'
  },
  6: {
    day: 6,
    shortName: 'Sat',
    name: 'Halloween Spook',
    tag: "JACK-O'-LANTERN GHOST FLARE",
    footerText: 'Design Spells Halloween Easter Egg • Warm Ember Glow',
    accent: '#FA7A18',
    palette: ['#161B22', '#631C03', '#BD561D', '#FA7A18', '#FDDF68'],
    symbol: '🎃',
    quote: '"Floating ghost silhouettes, carved pumpkin eyes, and rising embers."',
    sketchDetail: 'Rough.js Jack-o-Lantern & Ghost Silhouette'
  }
};

const now = new Date();
const utcTime = now.getTime();
const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
const dayOfWeek = istTime.getUTCDay();
const egg = SEVEN_DAY_EASTER_EGGS[dayOfWeek];
const istDateString = istTime.toISOString().split('T')[0];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 160" width="100%" height="100%">
  <defs>
    <style>
      @keyframes radarSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes beaconBlink { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .radar-arm { transform-origin: 50px 80px; animation: radarSweep 3.5s infinite linear; }
      .beacon { animation: beaconBlink 1.4s infinite ease-in-out; }
    </style>
  </defs>

  <!-- Card Base -->
  <rect width="850" height="160" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Subheader -->
  <rect x="0" y="0" width="850" height="34" rx="8" fill="#161B22"/>
  <rect x="0" y="26" width="850" height="8" fill="#161B22"/>
  <line x1="0" y1="34" x2="850" y2="34" stroke="#30363D" stroke-width="1"/>

  <g transform="translate(16, 21)">
    <text x="0" y="0" class="mono" fill="#7D8590" font-size="11">02. GITHUB ACTIVITY</text>
    <text x="120" y="0" class="mono" fill="#30363D">•</text>
    <text x="132" y="0" class="mono" fill="${egg.accent}" font-size="11" font-weight="700">${xmlEscape(egg.tag)}</text>
  </g>

  <!-- 7-Day Quick Pills on Top Right -->
  <g transform="translate(480, 8)">
    ${[0, 1, 2, 3, 4, 5, 6].map((d, i) => {
      const e = SEVEN_DAY_EASTER_EGGS[d];
      const isToday = d === dayOfWeek;
      const x = i * 50;
      const bg = isToday ? '#21262D' : '#0D1117';
      const color = isToday ? egg.accent : '#7D8590';
      const border = isToday ? egg.accent : '#30363D';
      const weight = isToday ? '700' : '400';
      return `<rect x="${x}" y="0" width="46" height="18" rx="4" fill="${bg}" stroke="${border}" stroke-width="1"/>
      <text x="${x + 23}" y="12" text-anchor="middle" class="mono" fill="${color}" font-size="10" font-weight="${weight}">${e.shortName}</text>`;
    }).join('\n    ')}
  </g>

  <!-- Left Radar and Planetary Sensor -->
  <g transform="translate(20, 10)">
    <circle cx="50" cy="80" r="38" fill="none" stroke="${egg.accent}" stroke-opacity="0.2" stroke-dasharray="3 3"/>
    <circle cx="50" cy="80" r="24" fill="none" stroke="${egg.accent}" stroke-opacity="0.3"/>
    <circle cx="50" cy="80" r="10" fill="none" stroke="${egg.accent}" stroke-opacity="0.45"/>
    <circle cx="50" cy="80" r="2.5" fill="${egg.accent}"/>
    <line x1="50" y1="80" x2="88" y2="80" stroke="${egg.accent}" stroke-width="1.75" class="radar-arm"/>
  </g>

  <!-- Center Telemetry Info -->
  <g transform="translate(130, 58)">
    <g transform="translate(0, 0)">
      <rect width="180" height="20" rx="4" fill="${egg.accent}" fill-opacity="0.12" stroke="${egg.accent}" stroke-opacity="0.3" stroke-width="1"/>
      <circle cx="10" cy="10" r="3" fill="${egg.accent}" class="beacon"/>
      <text x="20" y="14" class="mono" fill="${egg.accent}" font-size="10" font-weight="700">TODAY&apos;S EASTER EGG</text>
      <text x="200" y="14" class="mono" fill="#7D8590" font-size="10">IST DATE: ${istDateString}</text>
    </g>

    <text x="0" y="44" class="mono" fill="#F0F6FC" font-size="20" font-weight="800">
      ${egg.symbol} ${xmlEscape(egg.name)}
    </text>

    <text x="0" y="64" class="inter" fill="#7D8590" font-size="12" font-style="italic">
      ${xmlEscape(egg.quote)}
    </text>

    <!-- Palette Swatches for Today -->
    <g transform="translate(0, 76)">
      <text x="0" y="10" class="mono" fill="#7D8590" font-size="10">Active Intensity Palette:</text>
      ${egg.palette.map((c, i) => `
        <rect x="${145 + i * 16}" y="1" width="12" height="12" rx="2" fill="${c}" stroke="#21262D" stroke-width="1"/>
      `).join('')}
      <text x="238" y="10" class="mono" fill="#7D8590" font-size="10">• ${xmlEscape(egg.sketchDetail)}</text>
    </g>
  </g>

  <!-- Right Side Live Flag -->
  <g transform="translate(710, 80)">
    <rect x="0" y="0" width="118" height="34" rx="4" fill="#161B22" stroke="#30363D" stroke-width="1"/>
    <text x="12" y="14" class="mono" fill="#3FB950" font-size="10" font-weight="700">● 7-DAY ENGINE</text>
    <text x="12" y="27" class="mono" fill="#7D8590" font-size="9">Auto-Shift: 00:00 UTC</text>
  </g>
</svg>`;

const outputPath = path.join(__dirname, '../assets/daily-easter-egg.svg');
fs.writeFileSync(outputPath, svgContent, 'utf8');
console.log(`[+] Valid XML SVG generated for ${egg.name} -> ${outputPath}`);
