const fs = require('fs');
const path = require('path');
const { TIERS, fetchLetMeCodexContributions, calculateStreakData } = require('./streak-calculator.js');

const SEVEN_DAY_EASTER_EGGS = {
  0: { day: 0, shortName: 'Sun', name: 'Solar Supernova', accent: '#F59E0B', palette: ['#161B22', '#78350F', '#D97706', '#F59E0B', '#FDE047'], symbol: '☀️' },
  1: { day: 1, shortName: 'Mon', name: 'Cyberpunk Phosphor', accent: '#10B981', palette: ['#0D1117', '#064E3B', '#059669', '#10B981', '#34D399'], symbol: '⚡' },
  2: { day: 2, shortName: 'Tue', name: 'Quantum Aurora', accent: '#38BDF8', palette: ['#0E121E', '#312E81', '#6366F1', '#06B6D4', '#38BDF8'], symbol: '🌌' },
  3: { day: 3, shortName: 'Wed', name: 'Retro Synthwave', accent: '#F43F5E', palette: ['#120F1D', '#701A75', '#C026D3', '#F43F5E', '#FB7185'], symbol: '🌆' },
  4: { day: 4, shortName: 'Thu', name: 'Zen Hydro-Wave', accent: '#14B8A6', palette: ['#0D1518', '#134E4A', '#0D9488', '#14B8A6', '#5EEAD4'], symbol: '🌊' },
  5: { day: 5, shortName: 'Fri', name: "Conway's Living Colony", accent: '#84CC16', palette: ['#0F1612', '#365314', '#65A30D', '#84CC16', '#BEF264'], symbol: '🧬' },
  6: { day: 6, shortName: 'Sat', name: 'Halloween Spook', accent: '#FA7A18', palette: ['#161B22', '#631C03', '#BD561D', '#FA7A18', '#FDDF68'], symbol: '🎃' },
};

function renderFlameGraphic(accent, palette, tier, idPrefix = '') {
  const isDormant = tier.id === 'dormant';
  const isLegendary = tier.id === 'legendary';
  const isMythic = tier.id === 'mythic';

  if (isDormant) {
    return `
      <!-- Dormant Ember -->
      <circle cx="120" cy="148" r="5" fill="#6E7681" opacity="0.6"/>
      <circle cx="120" cy="148" r="2.5" fill="#8B949E" class="ember-pulse"/>
      <path d="M 120 142 Q 115 130 122 118" fill="none" stroke="#484F58" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.4"/>
    `;
  }

  const baseCol = palette[1] || palette[0];
  const midCol = palette[3] || accent;
  const tipCol = palette[4] || '#FFFFFF';

  return `
    <!-- Flame Soft Diffuse Aura Glow -->
    <circle cx="120" cy="135" r="58" fill="url(#${idPrefix}auraGlow)" class="flame-aura"/>

    ${(isLegendary || isMythic) ? `
    <!-- Legendary Orbital Energy Ring -->
    <ellipse cx="120" cy="135" rx="64" ry="20" fill="none" stroke="${accent}" stroke-width="1.2" stroke-dasharray="4 6" class="energy-orbit" opacity="0.7"/>
    ` : ''}

    ${isMythic ? `
    <!-- Mythic Luminous Core Sparkle -->
    <circle cx="120" cy="74" r="3" fill="#FFFFFF" class="mythic-sparkle"/>
    ` : ''}

    <!-- Main Living Flame Silhouette -->
    <g transform="translate(120, 140) scale(0.95) translate(-120, -140)">
      <!-- Outer Flame Tongue -->
      <path d="M 120 52 
               C 140 80, 166 106, 160 150 
               C 154 182, 94 182, 86 148 
               C 80 118, 102 88, 118 52 Z"
            fill="url(#${idPrefix}outerGrad)"
            class="flame-outer" />

      <!-- Secondary Mid Flick Tongue -->
      <path d="M 124 66 
               C 148 94, 158 124, 150 154 
               C 142 176, 104 176, 96 152 
               C 90 126, 106 98, 124 66 Z"
            fill="url(#${idPrefix}midGrad)"
            class="flame-mid" />

      <!-- Asymmetric Side Flick -->
      <path d="M 98 134 
               C 84 110, 92 86, 106 78 
               C 102 100, 110 122, 116 138 Z" 
            fill="${accent}" 
            opacity="0.85" 
            class="flame-lick-left" />

      <!-- Incandescent Heart Core -->
      <path d="M 120 96 
               C 132 116, 142 136, 136 158 
               C 130 174, 110 174, 104 158 
               C 98 136, 108 116, 120 96 Z"
            fill="url(#${idPrefix}coreGrad)"
            class="flame-core" />

      <!-- Hot Center Point -->
      <ellipse cx="120" cy="150" rx="4.5" ry="11" fill="#FFFFFF" opacity="0.95" class="core-hotspot" />
    </g>
  `;
}

function renderEmbers(accent, count = 8) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 137.5) * (Math.PI / 180);
    const radius = 6 + (i % 4) * 4;
    const startX = Math.round(120 + Math.cos(angle) * radius);
    const startY = Math.round(168 - (i % 3) * 8);
    const dur = (1.5 + (i % 4) * 0.3).toFixed(1);
    const delay = ((i % 5) * 0.25).toFixed(2);
    const size = (i % 3 === 0 ? 2 : 1.4);
    return `<circle cx="${startX}" cy="${startY}" r="${size}" fill="${accent}" class="ember" style="animation-duration: ${dur}s; animation-delay: ${delay}s;" />`;
  }).join('\n      ');
}

function buildSingleDayStreakSvg(stats, dayIndex = 1) {
  const egg = SEVEN_DAY_EASTER_EGGS[dayIndex] || SEVEN_DAY_EASTER_EGGS[1];
  const { currentStreak, longestStreak, tier } = stats;

  const flameG = renderFlameGraphic(egg.accent, egg.palette, tier);
  const embers = renderEmbers(egg.accent, 8);

  const baseCol = egg.palette[1] || egg.palette[0];
  const midCol = egg.palette[3] || egg.accent;
  const tipCol = egg.palette[4] || '#FFFFFF';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 76" width="100%" height="100%">
  <defs>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.28" />
      <stop offset="60%" stop-color="${baseCol}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${baseCol}" />
      <stop offset="55%" stop-color="${egg.accent}" />
      <stop offset="100%" stop-color="${midCol}" />
    </linearGradient>
    <linearGradient id="midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${egg.accent}" />
      <stop offset="65%" stop-color="${midCol}" />
      <stop offset="100%" stop-color="${tipCol}" />
    </linearGradient>
    <linearGradient id="coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${midCol}" />
      <stop offset="60%" stop-color="${tipCol}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <style>
      @keyframes auraBreath {
        0%, 100% { transform: scale(1); opacity: 0.75; }
        50% { transform: scale(1.09); opacity: 1; }
      }
      @keyframes flameOuter {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        25% { transform: scaleY(1.03) skewX(1.4deg); }
        50% { transform: scaleY(0.97) skewX(-1.2deg); }
        75% { transform: scaleY(1.02) skewX(0.8deg); }
      }
      @keyframes flameMid {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        30% { transform: scaleY(0.96) skewX(-1.6deg); }
        70% { transform: scaleY(1.04) skewX(1.6deg); }
      }
      @keyframes flameCore {
        0%, 100% { transform: scale(1); opacity: 0.92; }
        50% { transform: scale(1.06); opacity: 1; }
      }
      @keyframes flameFlick {
        0%, 100% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(-3deg) scale(1.05); }
      }
      @keyframes emberFloat {
        0% { transform: translate(0, 0); opacity: 0.85; }
        50% { transform: translate(-5px, -30px); opacity: 0.6; }
        100% { transform: translate(4px, -65px); opacity: 0; }
      }
      @keyframes statusPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura { transform-origin: 120px 135px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer { transform-origin: 120px 175px; animation: flameOuter 2.4s infinite ease-in-out; }
      .flame-mid { transform-origin: 120px 175px; animation: flameMid 1.8s infinite ease-in-out; }
      .flame-core { transform-origin: 120px 165px; animation: flameCore 1.4s infinite ease-in-out; }
      .flame-lick-left { transform-origin: 106px 130px; animation: flameFlick 2s infinite ease-in-out; }
      .ember { animation: emberFloat 2.2s infinite ease-out; }
      .status-pulse { transform-origin: 14px 14px; animation: statusPulse 2.5s infinite ease-in-out; }
    </style>
  </defs>

  <!-- Clean Minimalist Frame (Matches Matrix 1px Border and Radius) -->
  <rect width="920" height="76" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Left: The Living Flame Animation (Scaled to fit seamlessly in 76px) -->
  <g transform="translate(45, 38) scale(0.55) translate(-120, -140)">
    <g>
      ${embers}
    </g>
    ${flameG}
  </g>

  <!-- Left Center: Streak Count & Tier Tag -->
  <g transform="translate(85, 0)">
    <text x="0" y="48" class="inter" fill="#F0F6FC" font-size="34" font-weight="800" letter-spacing="-1">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="35" class="inter" fill="${egg.accent}" font-size="13" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="51" class="mono" fill="#8B949E" font-size="11" font-weight="500">${tier.name.toUpperCase()} TIER</text>
  </g>

  <!-- Subtle Minimal Vertical Divider -->
  <line x1="270" y1="18" x2="270" y2="58" stroke="#21262D" stroke-width="1"/>

  <!-- Right Center: Longest Streak Metric -->
  <g transform="translate(298, 0)">
    <text x="0" y="35" class="mono" fill="#7D8590" font-size="10" letter-spacing="1">LONGEST STREAK</text>
    <text x="0" y="53" class="inter" fill="#F0F6FC" font-size="15" font-weight="700">${longestStreak} Days</text>
  </g>

  <!-- Right: Matrix Sync Indicator (Complimenting Matrix Active Day Theme) -->
  <g transform="translate(650, 24)">
    <rect x="0" y="0" width="242" height="28" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
    <circle cx="14" cy="14" r="3.5" fill="${egg.accent}" class="status-pulse"/>
    <text x="26" y="18" class="mono" fill="#F0F6FC" font-size="11" font-weight="600">${egg.shortName}: ${egg.name}</text>
  </g>
</svg>`;
}

function buildCyclingShowcaseStreakSvg(stats) {
  const { currentStreak, longestStreak, tier } = stats;

  const slices = [
    { day: 0, start: 0, end: 14.28 },
    { day: 1, start: 14.29, end: 28.57 },
    { day: 2, start: 28.58, end: 42.85 },
    { day: 3, start: 42.86, end: 57.14 },
    { day: 4, start: 57.15, end: 71.42 },
    { day: 5, start: 71.43, end: 85.71 },
    { day: 6, start: 85.72, end: 100.0 }
  ];

  let cycleCss = `
    .cycle-layer { opacity: 0; visibility: hidden; }
  `;

  slices.forEach((s, idx) => {
    const egg = SEVEN_DAY_EASTER_EGGS[s.day];
    const sStart = (s.start).toFixed(2);
    const sMidEnd = (s.end - 0.6).toFixed(2);
    const sEnd = (s.end).toFixed(2);

    cycleCss += `
    .cycle-layer-${idx} { animation: streakCycle${idx} 28s infinite; }`;

    if (idx === 0) {
      cycleCss += `
      @keyframes streakCycle${idx} {
        0%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 99.2% { opacity: 0; visibility: hidden; }
        100% { opacity: 1; visibility: visible; }
      }`;
    } else if (idx === 6) {
      cycleCss += `
      @keyframes streakCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { opacity: 1; visibility: visible; }
        100% { opacity: 0; visibility: hidden; }
      }`;
    } else {
      cycleCss += `
      @keyframes streakCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${sStart}%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 100% { opacity: 0; visibility: hidden; }
      }`;
    }
  });

  let defsContent = '';
  let layersContent = '';

  slices.forEach((s, idx) => {
    const egg = SEVEN_DAY_EASTER_EGGS[s.day];
    const prefix = `c${idx}_`;
    const baseCol = egg.palette[1] || egg.palette[0];
    const midCol = egg.palette[3] || egg.accent;
    const tipCol = egg.palette[4] || '#FFFFFF';

    defsContent += `
    <radialGradient id="${prefix}auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.28" />
      <stop offset="60%" stop-color="${baseCol}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${prefix}outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${baseCol}" />
      <stop offset="55%" stop-color="${egg.accent}" />
      <stop offset="100%" stop-color="${midCol}" />
    </linearGradient>
    <linearGradient id="${prefix}midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${egg.accent}" />
      <stop offset="65%" stop-color="${midCol}" />
      <stop offset="100%" stop-color="${tipCol}" />
    </linearGradient>
    <linearGradient id="${prefix}coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${midCol}" />
      <stop offset="60%" stop-color="${tipCol}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    `;

    const flameG = renderFlameGraphic(egg.accent, egg.palette, tier, prefix);
    const embs = renderEmbers(egg.accent, 8);

    layersContent += `
    <!-- Layer ${idx}: ${egg.shortName} (${egg.name}) In Lockstep with Matrix -->
    <g class="cycle-layer cycle-layer-${idx}">
      <!-- Flame Stage -->
      <g transform="translate(45, 38) scale(0.55) translate(-120, -140)">
        <g>
          ${embs}
        </g>
        ${flameG}
      </g>

      <!-- Label in Active Theme Accent -->
      <text x="${currentStreak >= 10 ? 135 : 113}" y="35" class="inter" fill="${egg.accent}" font-size="13" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>

      <!-- Synced Matrix Day Pill -->
      <g transform="translate(650, 24)">
        <rect x="0" y="0" width="242" height="28" rx="6" fill="#161B22" stroke="${egg.accent}" stroke-width="1.2"/>
        <circle cx="14" cy="14" r="3.5" fill="${egg.accent}" class="status-pulse"/>
        <text x="26" y="18" class="mono" fill="${egg.accent}" font-size="11" font-weight="700">${egg.shortName}: ${egg.name}</text>
      </g>
    </g>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 76" width="100%" height="100%">
  <defs>
    ${defsContent}
    <style>
      @keyframes auraBreath {
        0%, 100% { transform: scale(1); opacity: 0.75; }
        50% { transform: scale(1.09); opacity: 1; }
      }
      @keyframes flameOuter {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        25% { transform: scaleY(1.03) skewX(1.4deg); }
        50% { transform: scaleY(0.97) skewX(-1.2deg); }
        75% { transform: scaleY(1.02) skewX(0.8deg); }
      }
      @keyframes flameMid {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        30% { transform: scaleY(0.96) skewX(-1.6deg); }
        70% { transform: scaleY(1.04) skewX(1.6deg); }
      }
      @keyframes flameCore {
        0%, 100% { transform: scale(1); opacity: 0.92; }
        50% { transform: scale(1.06); opacity: 1; }
      }
      @keyframes flameFlick {
        0%, 100% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(-3deg) scale(1.05); }
      }
      @keyframes emberFloat {
        0% { transform: translate(0, 0); opacity: 0.85; }
        50% { transform: translate(-5px, -30px); opacity: 0.6; }
        100% { transform: translate(4px, -65px); opacity: 0; }
      }
      @keyframes statusPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura { transform-origin: 120px 135px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer { transform-origin: 120px 175px; animation: flameOuter 2.4s infinite ease-in-out; }
      .flame-mid { transform-origin: 120px 175px; animation: flameMid 1.8s infinite ease-in-out; }
      .flame-core { transform-origin: 120px 165px; animation: flameCore 1.4s infinite ease-in-out; }
      .flame-lick-left { transform-origin: 106px 130px; animation: flameFlick 2s infinite ease-in-out; }
      .ember { animation: emberFloat 2.2s infinite ease-out; }
      .status-pulse { transform-origin: 14px 14px; animation: statusPulse 2.5s infinite ease-in-out; }

      ${cycleCss}
    </style>
  </defs>

  <!-- Clean Minimal Frame (76px Height) -->
  <rect width="920" height="76" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Persistent Base Elements -->
  <g transform="translate(85, 0)">
    <text x="0" y="48" class="inter" fill="#F0F6FC" font-size="34" font-weight="800" letter-spacing="-1">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="51" class="mono" fill="#8B949E" font-size="11" font-weight="500">${tier.name.toUpperCase()} TIER</text>
  </g>

  <!-- Minimal Divider -->
  <line x1="270" y1="18" x2="270" y2="58" stroke="#21262D" stroke-width="1"/>

  <!-- Longest Streak -->
  <g transform="translate(298, 0)">
    <text x="0" y="35" class="mono" fill="#7D8590" font-size="10" letter-spacing="1">LONGEST STREAK</text>
    <text x="0" y="53" class="inter" fill="#F0F6FC" font-size="15" font-weight="700">${longestStreak} Days</text>
  </g>

  <!-- 7 Synchronized Dynamic Layers (Matching Matrix Timeline Exactly) -->
  ${layersContent}
</svg>`;
}

async function main() {
  const args = process.argv.slice(2);
  const now = new Date();
  const utcTime = now.getTime();
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  const todayDay = istTime.getUTCDay();

  const isCycle = args.includes('--cycle') || (!args.some(a => a.startsWith('--day=') || a.startsWith('--theme=')));
  
  let targetDay = null;
  const dayArg = args.find(a => a.startsWith('--day='));
  if (dayArg) targetDay = parseInt(dayArg.split('=')[1], 10);
  
  const themeArg = args.find(a => a.startsWith('--theme='));
  if (themeArg) {
    const tVal = themeArg.split('=')[1].toLowerCase();
    const dayMap = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6,
                     'github': 1, 'inferno': 6, 'arcane': 3, 'cyber': 2, 'zen': 4, 'legendary': 0, 'void': 2 };
    if (dayMap[tVal] !== undefined) targetDay = dayMap[tVal];
  }

  let forcedStreak = null;
  const sFind = args.find(a => a.startsWith('--streak='));
  if (sFind) forcedStreak = parseInt(sFind.split('=')[1], 10);

  const rawData = await fetchLetMeCodexContributions();
  const stats = calculateStreakData(rawData);

  if (forcedStreak !== null) {
    stats.currentStreak = forcedStreak;
    stats.tier = TIERS.find(t => forcedStreak >= t.min && forcedStreak <= t.max) || TIERS[0];
  }

  // 1. Generate individual day files
  const dayFiles = [
    { day: 0, file: 'git-streak-sun.svg' },
    { day: 1, file: 'git-streak-mon.svg' },
    { day: 2, file: 'git-streak-tue.svg' },
    { day: 3, file: 'git-streak-wed.svg' },
    { day: 4, file: 'git-streak-thu.svg' },
    { day: 5, file: 'git-streak-fri.svg' },
    { day: 6, file: 'git-streak-sat.svg' },
  ];

  for (const item of dayFiles) {
    const singleSvg = buildSingleDayStreakSvg(stats, item.day);
    fs.writeFileSync(path.join(__dirname, `../assets/${item.file}`), singleSvg, 'utf8');
  }
  console.log('[+] Generated 7 single-day minimal streak SVGs (git-streak-sun..sat.svg)');

  // 2. Generate main git-streak.svg
  if (isCycle && targetDay === null) {
    const cycleSvg = buildCyclingShowcaseStreakSvg(stats);
    fs.writeFileSync(path.join(__dirname, '../assets/git-streak.svg'), cycleSvg, 'utf8');
    console.log('[+] Generated synchronized 7-day auto-morph cycling showcase -> assets/git-streak.svg');
  } else {
    const activeDay = targetDay !== null ? targetDay : todayDay;
    const singleSvg = buildSingleDayStreakSvg(stats, activeDay);
    fs.writeFileSync(path.join(__dirname, '../assets/git-streak.svg'), singleSvg, 'utf8');
    console.log(`[+] Generated active theme minimal streak -> assets/git-streak.svg (Day ${activeDay})`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildSingleDayStreakSvg,
  buildCyclingShowcaseStreakSvg
};
