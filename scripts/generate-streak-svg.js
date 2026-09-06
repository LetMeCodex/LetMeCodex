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
      <circle cx="0" cy="18" r="4" fill="#6E7681" opacity="0.6"/>
      <circle cx="0" cy="18" r="2" fill="#8B949E" class="ember-pulse"/>
      <path d="M 0 14 Q -4 4 2 -6" fill="none" stroke="#484F58" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.4"/>
    `;
  }

  const c0 = palette[0];
  const c1 = palette[1];
  const c2 = palette[2];
  const c3 = palette[3];
  const c4 = palette[4];

  return `
    <g class="flame-group" transform="scale(0.135)">
      <!-- Aura Glow -->
      <circle cx="-11" cy="0" r="230" fill="url(#${idPrefix}auraGlow)" class="flame-aura-anim" />

      ${(isLegendary || isMythic) ? `
      <!-- Legendary Orbital Energy Ring -->
      <ellipse cx="-11" cy="10" rx="260" ry="75" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="16 24" class="energy-orbit" opacity="0.75"/>
      ` : ''}

      ${isMythic ? `
      <!-- Mythic Luminous Star Core -->
      <circle cx="-11" cy="-210" r="16" fill="#FFFFFF" class="mythic-sparkle"/>
      ` : ''}

      <!-- Shadow & Silhouette Outline -->
      <g class="flame-outer-anim" opacity="0.5">
        <path fill="${c1}" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path stroke="${accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.35" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
      </g>

      <!-- Main Outer Flame (Exact Lottie Tongues) -->
      <g class="flame-outer-anim">
        <path fill="url(#${idPrefix}outerGrad)" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-101.993,-71.701 -126.604,15.347 -11,192 C115.073,-14.97 -61.444,-36.548 -36.898,-145.17z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-29.625,-141.125 -8.262,-154.805 -11.627,-198.246 C2.443,-53.713 -69.323,-90.814 -36.898,-145.17z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-107.023,-59.32 C-166.38,13.28 -113.38,144.70 -11,192 C81.5,-23.5 -116.16,47.34 -107.023,-59.32z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-135.05,84.36 C-148.51,123.68 -85.94,192 -11,192 C17.15,68.55 -110.18,126.14 -135.05,84.36z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-88.60,158.17 C-68.90,166.72 -65,192 -11,192 C-21.72,149.02 -65.19,155.08 -88.60,158.17z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M108.98,-59.68 C75.36,10.05 -46.55,2.52 -11,192 C122.73,140.84 144.78,40.84 108.98,-59.68z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M121.36,118.23 C75,114.89 -10.79,121.61 -11,192 C87.47,192 107.68,134.94 121.36,118.23z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M30.97,176.34 C14.27,167.16 -10.95,175.79 -11.04,191.24 C15.45,191.24 24.57,172.66 30.97,176.34z"/>
      </g>

      <!-- Middle Flame Layer (Exact Lottie Second Tongues) -->
      <g class="flame-mid-anim">
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C95.52,-18.31 32.10,-80.47 -8.70,-156.68 C-20.73,-86.36 -137.36,-109.73 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C91.10,134.84 87.78,21.68 89.94,-18.17 C66.10,16.26 -35.5,-26.39 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C72.68,161 101.84,113.57 103.95,90.03 C80.63,96 0.10,82.63 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C59.28,192 51.13,153.18 76.98,142.36 C51.55,130.44 -9.80,147.38 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-8.17,-154.36 C-34.65,101.78 66.13,95 89.94,-18.17 C82.97,-8.24 71.32,-5.95 59.66,-8.89 C26.23,-14.98 49.89,-80.47 -8.17,-154.36z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C7.32,-10.82 -77.20,70.96 -109.08,-4.89 C-134.87,51.84 -72.07,131.74 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C-11,76.50 -65.35,143.31 -101.39,111.51 C-97.47,164.05 -49.62,192 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-56.93,-80.83 C-66.55,-59.58 -58.92,-19.35 -69.43,0.08 C-76.84,13.80 -96.81,13.31 -108.98,-4.99 C-126.03,76.33 2.02,102.01 -56.93,-80.83z"/>
      </g>

      <!-- Third Highlight Layer -->
      <g opacity="0.32" class="flame-mid-anim">
        <path fill="${c4}" d="M-0.026,-98.88 C0.157,-47.05 -108,-67.78 -12,192.42 C44.68,101.84 31.31,-9.47 -0.026,-98.88z M57.63,23.73 C49.08,31.12 24.81,33.76 21.16,7.69 C17.16,-21.13 -31.30,63.64 -12,192.42 C28.84,120.26 84.57,116.94 57.63,23.73z M-80.12,54.82 C-84.81,113.66 -41.15,143.19 -12,192.42 C-9.15,136.64 -42.23,10.05 -47.53,30.36 C-49.09,64.02 -64.24,57.06 -80.12,54.82z"/>
      </g>

      <!-- Core Hearth Layer (Exact Lottie Core Tongues) -->
      <g class="flame-core-anim">
        <path fill="url(#${idPrefix}coreGrad)" d="M-5.87,-22.27 C-12.09,25.84 -77.88,36.63 -12,192.42 C74.23,64.59 -12.02,43.79 -5.87,-22.27z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M42.90,56.23 C28.57,82.21 -28.19,74.48 -12,192.42 C27.07,145.77 36.23,140.23 42.90,56.23z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M70.01,103.60 C43.15,112.26 -16.5,82.5 -12,192.42 C32.23,165.57 57.68,133.5 70.01,103.60z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-61.02,87.46 C-65.47,104.16 -62.65,139.36 -12,192.42 C15.22,90.81 -43.62,102.51 -61.02,87.46z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-60.80,142.56 C-53.52,154.91 -54.20,178.63 -12,192.42 C-3.07,138.74 -41.61,137.68 -60.80,142.56z"/>
      </g>

      <!-- Incandescent Center Core Hotspot -->
      <ellipse cx="-11" cy="142" rx="14" ry="24" fill="#FFFFFF" opacity="0.95" class="flame-core-anim" />

      <!-- Top-Left Detached Lick / Spark (Layer 75 from Lottie) -->
      <g class="spark-float-anim">
        <path fill="${accent}" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
        <path stroke="${c4}" stroke-width="6" fill="none" opacity="0.75" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
      </g>
    </g>
  `;
}

function renderEmbers(accent, count = 5) {
  const embersData = [
    { x: -14, y: 16, r: 1.4, dur: 1.9, del: 0 },
    { x: -22, y: 12, r: 1.1, dur: 2.3, del: 0.5 },
    { x: -5,  y: 18, r: 1.3, dur: 2.1, del: 1.1 },
    { x: 8,   y: 15, r: 1.5, dur: 1.8, del: 0.3 },
    { x: 18,  y: 11, r: 1.2, dur: 2.4, del: 0.8 },
  ];
  return embersData.slice(0, count).map(e => 
    `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="${accent}" class="ember" style="animation-duration: ${e.dur}s; animation-delay: ${e.del}s;" />`
  ).join('\n      ');
}

function buildSingleDayStreakSvg(stats, dayIndex = 1) {
  const egg = SEVEN_DAY_EASTER_EGGS[dayIndex] || SEVEN_DAY_EASTER_EGGS[1];
  const { currentStreak, longestStreak, tier } = stats;

  const flameG = renderFlameGraphic(egg.accent, egg.palette, tier);
  const embers = renderEmbers(egg.accent, 5);

  const c0 = egg.palette[0];
  const c1 = egg.palette[1];
  const c2 = egg.palette[2];
  const c3 = egg.palette[3];
  const c4 = egg.palette[4];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 76" width="100%" height="100%">
  <defs>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.35" />
      <stop offset="60%" stop-color="${c1}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="45%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${egg.accent}" />
    </linearGradient>
    <linearGradient id="midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${c2}" />
      <stop offset="55%" stop-color="${egg.accent}" />
      <stop offset="100%" stop-color="${c4}" />
    </linearGradient>
    <linearGradient id="coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${egg.accent}" />
      <stop offset="60%" stop-color="${c4}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <style>
      @keyframes auraBreath {
        0%, 100% { transform: scale(1); opacity: 0.75; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes flameOuterSway {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        25% { transform: scaleY(1.04) skewX(1.8deg); }
        50% { transform: scaleY(0.97) skewX(-1.5deg); }
        75% { transform: scaleY(1.02) skewX(1.2deg); }
      }
      @keyframes flameMidSway {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        30% { transform: scaleY(0.96) skewX(-2deg); }
        70% { transform: scaleY(1.05) skewX(2.2deg); }
      }
      @keyframes flameCorePulse {
        0%, 100% { transform: scale(1); opacity: 0.92; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes sparkFloat {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.9; }
        50% { transform: translate(-8px, -18px) rotate(-8deg) scale(0.9); opacity: 0.5; }
      }
      @keyframes emberAscent {
        0% { transform: translate(0, 0); opacity: 0.9; }
        50% { transform: translate(-3px, -18px); opacity: 0.6; }
        100% { transform: translate(3px, -36px); opacity: 0; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura-anim { transform-origin: -11px 0px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer-anim { transform-origin: -11px 192px; animation: flameOuterSway 2.4s infinite ease-in-out; }
      .flame-mid-anim { transform-origin: -11px 192px; animation: flameMidSway 1.8s infinite ease-in-out; }
      .flame-core-anim { transform-origin: -11px 160px; animation: flameCorePulse 1.4s infinite ease-in-out; }
      .spark-float-anim { transform-origin: -81px -212px; animation: sparkFloat 2s infinite ease-in-out; }
      .ember { animation: emberAscent 2s infinite ease-out; }
    </style>
  </defs>

  <!-- Clean Minimalist Frame (Matches Matrix 1px Border and Radius) -->
  <rect width="920" height="76" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Left: The Living Flame Animation (Scaled to fit seamlessly in 76px) -->
  <g transform="translate(48, 38)">
    ${embers}
    ${flameG}
  </g>

  <!-- Left Center: Streak Count & Tier Tag -->
  <g transform="translate(88, 0)">
    <text x="0" y="49" class="inter" fill="#F0F6FC" font-size="34" font-weight="800" letter-spacing="-1">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="36" class="inter" fill="${egg.accent}" font-size="13" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="52" class="mono" fill="#8B949E" font-size="11" font-weight="500">${tier.name.toUpperCase()} TIER</text>
  </g>

  <!-- Subtle Minimal Vertical Divider -->
  <line x1="265" y1="20" x2="265" y2="56" stroke="#21262D" stroke-width="1"/>

  <!-- Right Center: Longest Streak Metric -->
  <g transform="translate(295, 0)">
    <text x="0" y="36" class="mono" fill="#7D8590" font-size="10" letter-spacing="1">LONGEST STREAK</text>
    <text x="0" y="54" class="inter" fill="#F0F6FC" font-size="15" font-weight="700">${longestStreak} Days</text>
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
    const c0 = egg.palette[0];
    const c1 = egg.palette[1];
    const c2 = egg.palette[2];
    const c3 = egg.palette[3];
    const c4 = egg.palette[4];

    defsContent += `
    <radialGradient id="${prefix}auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.35" />
      <stop offset="60%" stop-color="${c1}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${prefix}outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="45%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${egg.accent}" />
    </linearGradient>
    <linearGradient id="${prefix}midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${c2}" />
      <stop offset="55%" stop-color="${egg.accent}" />
      <stop offset="100%" stop-color="${c4}" />
    </linearGradient>
    <linearGradient id="${prefix}coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${egg.accent}" />
      <stop offset="60%" stop-color="${c4}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    `;

    const flameG = renderFlameGraphic(egg.accent, egg.palette, tier, prefix);
    const embs = renderEmbers(egg.accent, 5);

    layersContent += `
    <!-- Layer ${idx}: ${egg.shortName} (${egg.name}) In Lockstep with Matrix -->
    <g class="cycle-layer cycle-layer-${idx}">
      <!-- Flame Stage -->
      <g transform="translate(48, 38)">
        ${embs}
        ${flameG}
      </g>

      <!-- Label in Active Theme Accent -->
      <text x="${currentStreak >= 10 ? 138 : 116}" y="36" class="inter" fill="${egg.accent}" font-size="13" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>
    </g>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 76" width="100%" height="100%">
  <defs>
    ${defsContent}
    <style>
      @keyframes auraBreath {
        0%, 100% { transform: scale(1); opacity: 0.75; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes flameOuterSway {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        25% { transform: scaleY(1.04) skewX(1.8deg); }
        50% { transform: scaleY(0.97) skewX(-1.5deg); }
        75% { transform: scaleY(1.02) skewX(1.2deg); }
      }
      @keyframes flameMidSway {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        30% { transform: scaleY(0.96) skewX(-2deg); }
        70% { transform: scaleY(1.05) skewX(2.2deg); }
      }
      @keyframes flameCorePulse {
        0%, 100% { transform: scale(1); opacity: 0.92; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes sparkFloat {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.9; }
        50% { transform: translate(-8px, -18px) rotate(-8deg) scale(0.9); opacity: 0.5; }
      }
      @keyframes emberAscent {
        0% { transform: translate(0, 0); opacity: 0.9; }
        50% { transform: translate(-3px, -18px); opacity: 0.6; }
        100% { transform: translate(3px, -36px); opacity: 0; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura-anim { transform-origin: -11px 0px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer-anim { transform-origin: -11px 192px; animation: flameOuterSway 2.4s infinite ease-in-out; }
      .flame-mid-anim { transform-origin: -11px 192px; animation: flameMidSway 1.8s infinite ease-in-out; }
      .flame-core-anim { transform-origin: -11px 160px; animation: flameCorePulse 1.4s infinite ease-in-out; }
      .spark-float-anim { transform-origin: -81px -212px; animation: sparkFloat 2s infinite ease-in-out; }
      .ember { animation: emberAscent 2s infinite ease-out; }

      ${cycleCss}
    </style>
  </defs>

  <!-- Clean Minimal Frame (76px Height) -->
  <rect width="920" height="76" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Persistent Base Elements -->
  <g transform="translate(88, 0)">
    <text x="0" y="49" class="inter" fill="#F0F6FC" font-size="34" font-weight="800" letter-spacing="-1">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 50 : 28}" y="52" class="mono" fill="#8B949E" font-size="11" font-weight="500">${tier.name.toUpperCase()} TIER</text>
  </g>

  <!-- Minimal Divider -->
  <line x1="265" y1="20" x2="265" y2="56" stroke="#21262D" stroke-width="1"/>

  <!-- Longest Streak -->
  <g transform="translate(295, 0)">
    <text x="0" y="36" class="mono" fill="#7D8590" font-size="10" letter-spacing="1">LONGEST STREAK</text>
    <text x="0" y="54" class="inter" fill="#F0F6FC" font-size="15" font-weight="700">${longestStreak} Days</text>
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
    if (forcedStreak > stats.longestStreak) stats.longestStreak = forcedStreak;
    // Re-evaluate tier
    for (const t of TIERS) {
      if (stats.currentStreak >= t.minStreak && stats.currentStreak <= t.maxStreak) {
        stats.tier = t;
        break;
      }
    }
  }

  console.log(`GitStreak: ${stats.currentStreak} days (${stats.tier.name} tier), Longest: ${stats.longestStreak} days`);

  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  if (isCycle) {
    console.log('Generating Synchronized Cycling GitStreak SVG (28s timeline lockstep with matrix)...');
    const cyclingSvg = buildCyclingShowcaseStreakSvg(stats);
    const mainPath = path.join(assetsDir, 'git-streak.svg');
    fs.writeFileSync(mainPath, cyclingSvg);
    console.log(`Saved cycling streak to ${mainPath}`);

    // Also generate static theme SVGs for all 7 days
    for (let d = 0; d < 7; d++) {
      const egg = SEVEN_DAY_EASTER_EGGS[d];
      const singleSvg = buildSingleDayStreakSvg(stats, d);
      const filename = `git-streak-${egg.shortName.toLowerCase()}.svg`;
      fs.writeFileSync(path.join(assetsDir, filename), singleSvg);
    }
    console.log('Generated static SVGs for all 7 easter egg themes.');
  } else {
    const dayIndex = targetDay !== null ? targetDay : todayDay;
    const egg = SEVEN_DAY_EASTER_EGGS[dayIndex];
    console.log(`Generating GitStreak for Day ${dayIndex}: ${egg.shortName} (${egg.name})...`);
    const singleSvg = buildSingleDayStreakSvg(stats, dayIndex);
    const mainPath = path.join(assetsDir, 'git-streak.svg');
    fs.writeFileSync(mainPath, singleSvg);
    console.log(`Saved single-theme streak to ${mainPath}`);
  }
}

main().catch(err => {
  console.error('Error generating GitStreak SVG:', err);
  process.exit(1);
});
