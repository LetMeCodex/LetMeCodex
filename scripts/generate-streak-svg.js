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

function renderFlameGraphic(accent, palette, tier = { id: 'hot' }, idPrefix = '', tIdx = 0) {
  const isDormant = tier.id === 'dormant';
  const isLegendary = tier.id === 'legendary';
  const isMythic = tier.id === 'mythic';

  if (isDormant) {
    return `
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

  const risingWisps = `
    <!-- Rising Flame Wisp 1 -->
    <path class="rising-wisp-1-${tIdx}" fill="url(#${idPrefix}midGrad)"
          d="M-11.6,-140 C-24,-110 -36,-80 -11,-20 C14,-80 2,-110 -11.6,-140 Z"/>

    <!-- Rising Flame Wisp 2 -->
    <path class="rising-wisp-2-${tIdx}" fill="url(#${idPrefix}outerGrad)"
          d="M-45,-70 C-58,-50 -65,-20 -35,20 C-20,-20 -35,-50 -45,-70 Z"/>

    <!-- Rising Flame Wisp 3 -->
    <path class="rising-wisp-3-${tIdx}" fill="url(#${idPrefix}outerGrad)"
          d="M35,-50 C20,-30 15,0 40,30 C52,0 45,-30 35,-50 Z"/>

    <!-- Rising Flame Wisp 4 -->
    <path class="rising-wisp-4-${tIdx}" fill="url(#${idPrefix}coreGrad)"
          d="M-11.6,-90 C-18,-60 -22,-30 -11,0 C0,-30 -5,-60 -11.6,-90 Z"/>

    <!-- Signature Detached Floating Spark (Layer 75) -->
    <g class="spark-whipping-${tIdx}">
      <path fill="${accent}" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
      <path stroke="${c4}" stroke-width="6" fill="none" opacity="0.8" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
    </g>

    <!-- Secondary Sparks -->
    <circle cx="45" cy="-70" r="10" fill="${c4}" class="spark-rise-right-${tIdx}"/>
    <circle cx="-35" cy="-90" r="9" fill="#FFFFFF" class="spark-rise-left-${tIdx}"/>
  `;

  return `
    <g class="flame-master" transform="scale(0.23)">
      <!-- Pulsing Aura Heat Glow -->
      <circle cx="-11" cy="0" r="240" fill="url(#${idPrefix}auraGlow)" class="heat-aura-${tIdx}" />

      ${(isLegendary || isMythic) ? `
      <ellipse cx="-11" cy="10" rx="260" ry="75" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="16 24" class="energy-orbit" opacity="0.75"/>
      ` : ''}

      ${isMythic ? `
      <circle cx="-11" cy="-210" r="16" fill="#FFFFFF" class="mythic-sparkle"/>
      ` : ''}

      <!-- Shadow and Base Foundation -->
      <g class="flame-sway-base-${tIdx}" opacity="0.45">
        <path fill="${c1}" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path stroke="${accent}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
      </g>

      <!-- Center Main Tongue (Unique Easter Egg Physics) -->
      <g class="flame-surge-center-${tIdx}">
        <path fill="url(#${idPrefix}outerGrad)" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-101.993,-71.701 -126.604,15.347 -11,192 C115.073,-14.97 -61.444,-36.548 -36.898,-145.17z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-29.625,-141.125 -8.262,-154.805 -11.627,-198.246 C2.443,-53.713 -69.323,-90.814 -36.898,-145.17z"/>
      </g>

      <!-- Left Flank Tongues -->
      <g class="flame-lick-left-${tIdx}">
        <path fill="url(#${idPrefix}outerGrad)" d="M-107.023,-59.32 C-166.38,13.28 -113.38,144.70 -11,192 C81.5,-23.5 -116.16,47.34 -107.023,-59.32z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-135.05,84.36 C-148.51,123.68 -85.94,192 -11,192 C17.15,68.55 -110.18,126.14 -135.05,84.36z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-88.60,158.17 C-68.90,166.72 -65,192 -11,192 C-21.72,149.02 -65.19,155.08 -88.60,158.17z"/>
      </g>

      <!-- Right Flank Tongues -->
      <g class="flame-lick-right-${tIdx}">
        <path fill="url(#${idPrefix}outerGrad)" d="M108.98,-59.68 C75.36,10.05 -46.55,2.52 -11,192 C122.73,140.84 144.78,40.84 108.98,-59.68z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M121.36,118.23 C75,114.89 -10.79,121.61 -11,192 C87.47,192 107.68,134.94 121.36,118.23z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M30.97,176.34 C14.27,167.16 -10.95,175.79 -11.04,191.24 C15.45,191.24 24.57,172.66 30.97,176.34z"/>
      </g>

      <!-- Middle Layer -->
      <g class="flame-mid-${tIdx}">
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C95.52,-18.31 32.10,-80.47 -8.70,-156.68 C-20.73,-86.36 -137.36,-109.73 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C91.10,134.84 87.78,21.68 89.94,-18.17 C66.10,16.26 -35.5,-26.39 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C72.68,161 101.84,113.57 103.95,90.03 C80.63,96 0.10,82.63 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C59.28,192 51.13,153.18 76.98,142.36 C51.55,130.44 -9.80,147.38 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-8.17,-154.36 C-34.65,101.78 66.13,95 89.94,-18.17 C82.97,-8.24 71.32,-5.95 59.66,-8.89 C26.23,-14.98 49.89,-80.47 -8.17,-154.36z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C7.32,-10.82 -77.20,70.96 -109.08,-4.89 C-134.87,51.84 -72.07,131.74 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-11,192 C-11,76.50 -65.35,143.31 -101.39,111.51 C-97.47,164.05 -49.62,192 -11,192z"/>
        <path fill="url(#${idPrefix}midGrad)" d="M-56.93,-80.83 C-66.55,-59.58 -58.92,-19.35 -69.43,0.08 C-76.84,13.80 -96.81,13.31 -108.98,-4.99 C-126.03,76.33 2.02,102.01 -56.93,-80.83z"/>
      </g>

      <!-- Translucent Gloss Layer -->
      <g opacity="0.32" class="flame-mid-${tIdx}" style="animation-delay: -0.35s;">
        <path fill="${c4}" d="M-0.026,-98.88 C0.157,-47.05 -108,-67.78 -12,192.42 C44.68,101.84 31.31,-9.47 -0.026,-98.88z M57.63,23.73 C49.08,31.12 24.81,33.76 21.16,7.69 C17.16,-21.13 -31.30,63.64 -12,192.42 C28.84,120.26 84.57,116.94 57.63,23.73z M-80.12,54.82 C-84.81,113.66 -41.15,143.19 -12,192.42 C-9.15,136.64 -42.23,10.05 -47.53,30.36 C-49.09,64.02 -64.24,57.06 -80.12,54.82z"/>
      </g>

      <!-- Core Hearth Layer -->
      <g class="flame-core-${tIdx}">
        <path fill="url(#${idPrefix}coreGrad)" d="M-5.87,-22.27 C-12.09,25.84 -77.88,36.63 -12,192.42 C74.23,64.59 -12.02,43.79 -5.87,-22.27z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M42.90,56.23 C28.57,82.21 -28.19,74.48 -12,192.42 C27.07,145.77 36.23,140.23 42.90,56.23z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M70.01,103.60 C43.15,112.26 -16.5,82.5 -12,192.42 C32.23,165.57 57.68,133.5 70.01,103.60z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-61.02,87.46 C-65.47,104.16 -62.65,139.36 -12,192.42 C15.22,90.81 -43.62,102.51 -61.02,87.46z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-60.80,142.56 C-53.52,154.91 -54.20,178.63 -12,192.42 C-3.07,138.74 -41.61,137.68 -60.80,142.56z"/>
      </g>

      <!-- Center Core Hotspot -->
      <ellipse cx="-11" cy="142" rx="14" ry="24" fill="#FFFFFF" class="flame-core-${tIdx}" />

      <!-- Active Wisps -->
      ${risingWisps}
    </g>
  `;
}

function renderEmbers(accent, tIdx = 0) {
  const embersData = [
    { x: -26, y: 24, r: 2.2, dur: 1.4, del: 0, dx: -9 },
    { x: -38, y: 18, r: 1.8, dur: 1.9, del: 0.3, dx: -16 },
    { x: -11, y: 28, r: 2.4, dur: 1.5, del: 0.8, dx: -4 },
    { x: 12,  y: 22, r: 2.5, dur: 1.3, del: 0.1, dx: 8 },
    { x: 30,  y: 16, r: 1.9, dur: 2.0, del: 0.6, dx: 14 },
    { x: 0,   y: 30, r: 2.6, dur: 1.6, del: 1.1, dx: 4 },
    { x: -18, y: 12, r: 1.7, dur: 1.7, del: 1.4, dx: -7 },
  ];
  return embersData.map(e => 
    `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="${accent}" class="ember-particle-${tIdx}" style="--dx: ${e.dx}px; animation-duration: ${e.dur}s; animation-delay: ${e.del}s;" />`
  ).join('\n      ');
}

function generateGradientsXml() {
  return [0, 1, 2, 3, 4, 5, 6].map(i => {
    const egg = SEVEN_DAY_EASTER_EGGS[i];
    const p = egg.palette;
    const prefix = `t${i}_`;
    return `
    <radialGradient id="${prefix}auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.45" />
      <stop offset="60%" stop-color="${p[1]}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${prefix}outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[1]}" />
      <stop offset="45%" stop-color="${p[2]}" />
      <stop offset="100%" stop-color="${p[3]}" />
    </linearGradient>
    <linearGradient id="${prefix}midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[2]}" />
      <stop offset="55%" stop-color="${p[3]}" />
      <stop offset="100%" stop-color="${p[4]}" />
    </linearGradient>
    <linearGradient id="${prefix}coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[3]}" />
      <stop offset="60%" stop-color="${p[4]}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>`;
  }).join('\n');
}

function generateCssRules() {
  return `
      /* 28s Synchronized Matrix Cycle Keyframes */
      .streak-cycle-layer { opacity: 0; visibility: hidden; }

      .streak-cycle-0 { animation: streakCycle0 28s infinite; }
      .streak-cycle-1 { animation: streakCycle1 28s infinite; }
      .streak-cycle-2 { animation: streakCycle2 28s infinite; }
      .streak-cycle-3 { animation: streakCycle3 28s infinite; }
      .streak-cycle-4 { animation: streakCycle4 28s infinite; }
      .streak-cycle-5 { animation: streakCycle5 28s infinite; }
      .streak-cycle-6 { animation: streakCycle6 28s infinite; }

      @keyframes streakCycle0 {
        0%, 13.58% { opacity: 1; visibility: visible; }
        14.28%, 99.2% { opacity: 0; visibility: hidden; }
        100% { opacity: 1; visibility: visible; }
      }
      @keyframes streakCycle1 {
        0%, 14.19% { opacity: 0; visibility: hidden; }
        14.29%, 27.87% { opacity: 1; visibility: visible; }
        28.57%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes streakCycle2 {
        0%, 28.48% { opacity: 0; visibility: hidden; }
        28.58%, 42.15% { opacity: 1; visibility: visible; }
        42.85%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes streakCycle3 {
        0%, 42.76% { opacity: 0; visibility: hidden; }
        42.86%, 56.44% { opacity: 1; visibility: visible; }
        57.14%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes streakCycle4 {
        0%, 57.05% { opacity: 0; visibility: hidden; }
        57.15%, 70.72% { opacity: 1; visibility: visible; }
        71.42%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes streakCycle5 {
        0%, 71.33% { opacity: 0; visibility: hidden; }
        71.43%, 85.01% { opacity: 1; visibility: visible; }
        85.71%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes streakCycle6 {
        0%, 85.71% { opacity: 0; visibility: hidden; }
        85.81%, 99.2% { opacity: 1; visibility: visible; }
        100% { opacity: 0; visibility: hidden; }
      }

      /* Synchronized DAYS STREAK Text Accent Cycle */
      .streak-txt-color { animation: streakTxtCycle 28s infinite; }
      @keyframes streakTxtCycle {
        0%, 13.58% { fill: #F59E0B; }
        14.29%, 27.87% { fill: #10B981; }
        28.58%, 42.15% { fill: #38BDF8; }
        42.86%, 56.44% { fill: #F43F5E; }
        57.15%, 70.72% { fill: #14B8A6; }
        71.43%, 85.01% { fill: #84CC16; }
        85.81%, 100% { fill: #FA7A18; }
      }

      /* ----------------------------------------------------------------- */
      /* THEME 0: Solar Supernova (Cosmic Flare & Coronal Mass Ejection)   */
      /* ----------------------------------------------------------------- */
      @keyframes aura0 { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.15); opacity: 1; } }
      @keyframes base0 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.04) skewX(1.5deg); } }
      @keyframes surge0 {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); }
        25% { transform: scaleY(1.15) translateY(-24px) skewX(2.5deg); }
        50% { transform: scaleY(0.92) translateY(5px) skewX(-2deg); }
        75% { transform: scaleY(1.1) translateY(-16px) skewX(1.8deg); }
      }
      @keyframes lickLeft0 { 0%, 100% { transform: rotate(0deg); } 35% { transform: rotate(-8deg) scaleY(1.16) translateY(-22px); } 70% { transform: rotate(3deg) scaleY(0.92); } }
      @keyframes lickRight0 { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(8deg) scaleY(1.15) translateY(-20px); } 75% { transform: rotate(-3deg) scaleY(0.93); } }
      @keyframes flutter0 { 0%, 100% { transform: scaleY(1); } 30% { transform: scaleY(1.14) translateY(-16px); } 65% { transform: scaleY(0.92); } }
      @keyframes throb0 { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.18) translateY(-5px); } 70% { transform: scale(0.92); } }
      @keyframes spark0 { 0%, 100% { transform: translate(0, 0); } 30% { transform: translate(-10px, -22px) rotate(-12deg); } 70% { transform: translate(-4px, -38px) rotate(6deg); } }
      @keyframes wisp0 { 0% { transform: translateY(20px) scale(0.8); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-200px) scale(0.3); opacity: 0; } }

      .heat-aura-0 { transform-origin: -11px 0; animation: aura0 2s infinite ease-in-out; }
      .flame-sway-base-0 { transform-origin: -11px 192px; animation: base0 2.2s infinite ease-in-out; }
      .flame-surge-center-0 { transform-origin: -11px 192px; animation: surge0 1.05s infinite ease-in-out; }
      .flame-lick-left-0 { transform-origin: -60px 150px; animation: lickLeft0 1.25s infinite ease-in-out; }
      .flame-lick-right-0 { transform-origin: 50px 150px; animation: lickRight0 1.35s infinite ease-in-out -0.4s; }
      .flame-mid-0 { transform-origin: -11px 180px; animation: flutter0 0.85s infinite ease-in-out; }
      .flame-core-0 { transform-origin: -11px 160px; animation: throb0 0.65s infinite ease-in-out; }
      .spark-whipping-0 { transform-origin: -81px -212px; animation: spark0 1.5s infinite ease-in-out; }
      .spark-rise-right-0 { animation: wisp0 1.5s infinite ease-out; }
      .spark-rise-left-0 { animation: wisp0 1.3s infinite ease-out -0.4s; }
      .rising-wisp-1-0 { animation: wisp0 1.2s infinite linear; }
      .rising-wisp-2-0 { animation: wisp0 1.4s infinite linear -0.5s; }
      .rising-wisp-3-0 { animation: wisp0 1.6s infinite linear -0.9s; }
      .rising-wisp-4-0 { animation: wisp0 1.1s infinite linear -0.3s; }
      .ember-particle-0 { animation: wisp0 1.6s infinite ease-out; }

      /* ----------------------------------------------------------------- */
      /* THEME 1: Cyberpunk Phosphor (Digital Glitch Stutter & Matrix Code)*/
      /* ----------------------------------------------------------------- */
      @keyframes aura1 { 0%, 100% { transform: scale(1); opacity: 0.6; } 40% { transform: scale(1.12); opacity: 0.9; } }
      @keyframes base1 { 0%, 100% { transform: skewX(0); } 30% { transform: skewX(-2deg); } 60% { transform: skewX(2deg); } }
      @keyframes surge1 {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); }
        20% { transform: scaleY(1.18) translateY(-26px) skewX(4deg); }
        40% { transform: scaleY(0.94) translateY(4px) skewX(-3deg); }
        60% { transform: scaleY(1.12) translateY(-14px) skewX(2deg); }
        80% { transform: scaleY(0.98) translateY(2px) skewX(-1deg); }
      }
      @keyframes lickLeft1 { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-12deg) scaleY(1.2) translateY(-24px); } 70% { transform: rotate(4deg) scaleY(0.9); } }
      @keyframes lickRight1 { 0%, 100% { transform: rotate(0deg); } 35% { transform: rotate(12deg) scaleY(1.18) translateY(-22px); } 75% { transform: rotate(-4deg) scaleY(0.9); } }
      @keyframes flutter1 { 0%, 100% { opacity: 0.95; } 25% { opacity: 0.7; transform: translateY(-14px); } 60% { opacity: 1; transform: translateY(4px); } }
      @keyframes throb1 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.22) translateY(-6px); } }
      @keyframes spark1 { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-14px, -24px); } 60% { transform: translate(6px, -36px); } }
      @keyframes wisp1 { 0% { transform: translateY(15px) scale(0.9); opacity: 0; } 30% { opacity: 0.95; } 100% { transform: translateY(-180px) scale(0.2); opacity: 0; } }

      .heat-aura-1 { transform-origin: -11px 0; animation: aura1 1.4s infinite ease-in-out; }
      .flame-sway-base-1 { transform-origin: -11px 192px; animation: base1 1.6s infinite steps(4, jump-none); }
      .flame-surge-center-1 { transform-origin: -11px 192px; animation: surge1 0.65s infinite steps(4, jump-none); }
      .flame-lick-left-1 { transform-origin: -60px 150px; animation: lickLeft1 0.75s infinite steps(3, jump-none); }
      .flame-lick-right-1 { transform-origin: 50px 150px; animation: lickRight1 0.85s infinite steps(3, jump-none) -0.25s; }
      .flame-mid-1 { transform-origin: -11px 180px; animation: flutter1 0.5s infinite steps(3, jump-none); }
      .flame-core-1 { transform-origin: -11px 160px; animation: throb1 0.45s infinite ease-in-out; }
      .spark-whipping-1 { transform-origin: -81px -212px; animation: spark1 1.1s infinite steps(4, jump-none); }
      .spark-rise-right-1 { animation: wisp1 1.1s infinite steps(4, jump-none); }
      .spark-rise-left-1 { animation: wisp1 1.0s infinite steps(4, jump-none) -0.3s; }
      .rising-wisp-1-1 { animation: wisp1 0.9s infinite steps(5, jump-none); }
      .rising-wisp-2-1 { animation: wisp1 1.1s infinite steps(5, jump-none) -0.4s; }
      .rising-wisp-3-1 { animation: wisp1 1.2s infinite steps(5, jump-none) -0.7s; }
      .rising-wisp-4-1 { animation: wisp1 0.8s infinite steps(5, jump-none) -0.2s; }
      .ember-particle-1 { animation: wisp1 1.2s infinite steps(4, jump-none); }

      /* ----------------------------------------------------------------- */
      /* THEME 2: Quantum Aurora (Hypnotic Silk Wave & Ethereal Borealis)  */
      /* ----------------------------------------------------------------- */
      @keyframes aura2 { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.18); opacity: 0.85; } }
      @keyframes base2 { 0%, 100% { transform: skewX(-2deg); } 50% { transform: skewX(2deg); } }
      @keyframes surge2 {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(-3deg); }
        50% { transform: scaleY(1.1) translateY(-14px) skewX(3deg); }
      }
      @keyframes lickLeft2 { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg) scaleY(1.08) translateY(-12px); } }
      @keyframes lickRight2 { 0%, 100% { transform: rotate(5deg); } 50% { transform: rotate(-5deg) scaleY(1.1) translateY(-14px); } }
      @keyframes flutter2 { 0%, 100% { transform: scaleY(1); opacity: 0.9; } 50% { transform: scaleY(1.08) translateY(-10px); opacity: 1; } }
      @keyframes throb2 { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.12); opacity: 1; } }
      @keyframes spark2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-8px, -18px); } }
      @keyframes wisp2 { 0% { transform: translateY(15px); opacity: 0; } 30% { opacity: 0.8; } 100% { transform: translateY(-160px); opacity: 0; } }

      .heat-aura-2 { transform-origin: -11px 0; animation: aura2 2.8s infinite ease-in-out; }
      .flame-sway-base-2 { transform-origin: -11px 192px; animation: base2 3.0s infinite ease-in-out; }
      .flame-surge-center-2 { transform-origin: -11px 192px; animation: surge2 2.6s infinite ease-in-out; }
      .flame-lick-left-2 { transform-origin: -60px 150px; animation: lickLeft2 2.4s infinite ease-in-out; }
      .flame-lick-right-2 { transform-origin: 50px 150px; animation: lickRight2 2.5s infinite ease-in-out -0.8s; }
      .flame-mid-2 { transform-origin: -11px 180px; animation: flutter2 2.0s infinite ease-in-out; }
      .flame-core-2 { transform-origin: -11px 160px; animation: throb2 1.8s infinite ease-in-out; }
      .spark-whipping-2 { transform-origin: -81px -212px; animation: spark2 2.2s infinite ease-in-out; }
      .spark-rise-right-2 { animation: wisp2 2.2s infinite ease-out; }
      .spark-rise-left-2 { animation: wisp2 2.0s infinite ease-out -0.5s; }
      .rising-wisp-1-2 { animation: wisp2 2.0s infinite linear; }
      .rising-wisp-2-2 { animation: wisp2 2.3s infinite linear -0.7s; }
      .rising-wisp-3-2 { animation: wisp2 2.5s infinite linear -1.2s; }
      .rising-wisp-4-2 { animation: wisp2 1.9s infinite linear -0.4s; }
      .ember-particle-2 { animation: wisp2 2.4s infinite ease-out; }

      /* ----------------------------------------------------------------- */
      /* THEME 3: Retro Synthwave (120 BPM Punchy Bass Beat & Neon Spikes) */
      /* ----------------------------------------------------------------- */
      @keyframes aura3 { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.16); opacity: 1; } }
      @keyframes base3 { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.05); } }
      @keyframes surge3 {
        0%, 100% { transform: scaleY(1) translateY(0); }
        18% { transform: scaleY(1.24) translateY(-28px); }
        42% { transform: scaleY(0.88) translateY(6px); }
        65% { transform: scaleY(1.15) translateY(-16px); }
      }
      @keyframes lickLeft3 { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-10deg) scaleY(1.2) translateY(-24px); } 60% { transform: rotate(4deg) scaleY(0.9); } }
      @keyframes lickRight3 { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(10deg) scaleY(1.18) translateY(-22px); } 65% { transform: rotate(-4deg) scaleY(0.9); } }
      @keyframes flutter3 { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.15) translateY(-15px); } }
      @keyframes throb3 { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.24) translateY(-8px); } }
      @keyframes spark3 { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(-12px, -26px); } }
      @keyframes wisp3 { 0% { transform: translateY(15px) scale(0.9); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-210px) scale(0.2); opacity: 0; } }

      .heat-aura-3 { transform-origin: -11px 0; animation: aura3 0.8s infinite ease-in-out; }
      .flame-sway-base-3 { transform-origin: -11px 192px; animation: base3 0.8s infinite ease-in-out; }
      .flame-surge-center-3 { transform-origin: -11px 192px; animation: surge3 0.75s infinite cubic-bezier(0.17, 0.89, 0.32, 1.28); }
      .flame-lick-left-3 { transform-origin: -60px 150px; animation: lickLeft3 0.75s infinite ease-out; }
      .flame-lick-right-3 { transform-origin: 50px 150px; animation: lickRight3 0.75s infinite ease-out -0.375s; }
      .flame-mid-3 { transform-origin: -11px 180px; animation: flutter3 0.5s infinite ease-in-out; }
      .flame-core-3 { transform-origin: -11px 160px; animation: throb3 0.5s infinite ease-in-out; }
      .spark-whipping-3 { transform-origin: -81px -212px; animation: spark3 0.9s infinite ease-in-out; }
      .spark-rise-right-3 { animation: wisp3 1.0s infinite ease-out; }
      .spark-rise-left-3 { animation: wisp3 0.9s infinite ease-out -0.3s; }
      .rising-wisp-1-3 { animation: wisp3 0.8s infinite linear; }
      .rising-wisp-2-3 { animation: wisp3 1.0s infinite linear -0.3s; }
      .rising-wisp-3-3 { animation: wisp3 1.1s infinite linear -0.6s; }
      .rising-wisp-4-3 { animation: wisp3 0.75s infinite linear -0.2s; }
      .ember-particle-3 { animation: wisp3 1.0s infinite ease-out; }

      /* ----------------------------------------------------------------- */
      /* THEME 4: Zen Hydro-Wave (Fluid Aquatic Caustics & Liquid Waves)   */
      /* ----------------------------------------------------------------- */
      @keyframes aura4 { 0%, 100% { transform: scale(1); opacity: 0.65; } 50% { transform: scale(1.14); opacity: 0.95; } }
      @keyframes base4 { 0%, 100% { transform: skewX(-1.5deg); } 50% { transform: skewX(1.5deg); } }
      @keyframes surge4 {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); }
        28% { transform: scaleY(1.12) translateY(-16px) skewX(3deg); }
        55% { transform: scaleY(0.94) translateY(6px) skewX(-2.5deg); }
        80% { transform: scaleY(1.06) translateY(-10px) skewX(1.5deg); }
      }
      @keyframes lickLeft4 { 0%, 100% { transform: rotate(-3deg); } 40% { transform: rotate(6deg) scaleY(1.12) translateY(-18px); } }
      @keyframes lickRight4 { 0%, 100% { transform: rotate(3deg); } 45% { transform: rotate(-6deg) scaleY(1.1) translateY(-16px); } }
      @keyframes flutter4 { 0%, 100% { transform: scaleY(1); opacity: 0.9; } 50% { transform: scaleY(1.1) translateY(-12px); opacity: 1; } }
      @keyframes throb4 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14) translateY(-4px); } }
      @keyframes spark4 { 0%, 100% { transform: translate(0, 0); } 40% { transform: translate(-8px, -18px) rotate(-8deg); } }
      @keyframes wisp4 { 0% { transform: translateY(15px); opacity: 0; } 30% { opacity: 0.85; } 100% { transform: translateY(-170px); opacity: 0; } }

      .heat-aura-4 { transform-origin: -11px 0; animation: aura4 2.4s infinite ease-in-out; }
      .flame-sway-base-4 { transform-origin: -11px 192px; animation: base4 2.6s infinite ease-in-out; }
      .flame-surge-center-4 { transform-origin: -11px 192px; animation: surge4 2.2s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95); }
      .flame-lick-left-4 { transform-origin: -60px 150px; animation: lickLeft4 2.1s infinite ease-in-out; }
      .flame-lick-right-4 { transform-origin: 50px 150px; animation: lickRight4 2.3s infinite ease-in-out -0.7s; }
      .flame-mid-4 { transform-origin: -11px 180px; animation: flutter4 1.5s infinite ease-in-out; }
      .flame-core-4 { transform-origin: -11px 160px; animation: throb4 1.4s infinite ease-in-out; }
      .spark-whipping-4 { transform-origin: -81px -212px; animation: spark4 1.8s infinite ease-in-out; }
      .spark-rise-right-4 { animation: wisp4 1.8s infinite ease-out; }
      .spark-rise-left-4 { animation: wisp4 1.6s infinite ease-out -0.4s; }
      .rising-wisp-1-4 { animation: wisp4 1.6s infinite linear; }
      .rising-wisp-2-4 { animation: wisp4 1.9s infinite linear -0.6s; }
      .rising-wisp-3-4 { animation: wisp4 2.1s infinite linear -1.0s; }
      .rising-wisp-4-4 { animation: wisp4 1.5s infinite linear -0.3s; }
      .ember-particle-4 { animation: wisp4 1.9s infinite ease-out; }

      /* ----------------------------------------------------------------- */
      /* THEME 5: Conway's Living Colony (Cellular Mitosis & Bio-Division) */
      /* ----------------------------------------------------------------- */
      @keyframes aura5 { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }
      @keyframes base5 { 0%, 100% { transform: scale(1); } 50% { transform: scaleX(1.08) scaleY(0.95); } }
      @keyframes surge5 {
        0%, 100% { transform: scale(1) translateY(0); }
        25% { transform: scaleX(0.88) scaleY(1.2) translateY(-22px); }
        50% { transform: scaleX(1.15) scaleY(0.92) translateY(5px); }
        75% { transform: scaleX(0.92) scaleY(1.12) translateY(-12px); }
      }
      @keyframes lickLeft5 { 0%, 100% { transform: scale(1); } 35% { transform: scaleX(1.15) scaleY(1.15) rotate(-8deg) translateY(-20px); } }
      @keyframes lickRight5 { 0%, 100% { transform: scale(1); } 40% { transform: scaleX(1.15) scaleY(1.12) rotate(8deg) translateY(-18px); } }
      @keyframes flutter5 { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.14) translateY(-14px); } }
      @keyframes throb5 { 0%, 100% { transform: scale(1); } 35% { transform: scale(1.22); } }
      @keyframes spark5 { 0%, 100% { transform: translate(0, 0); } 30% { transform: translate(-10px, -20px); } }
      @keyframes wisp5 { 0% { transform: translateY(15px) scale(0.9); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-175px) scale(0.3); opacity: 0; } }

      .heat-aura-5 { transform-origin: -11px 0; animation: aura5 1.5s infinite ease-in-out; }
      .flame-sway-base-5 { transform-origin: -11px 192px; animation: base5 1.6s infinite ease-in-out; }
      .flame-surge-center-5 { transform-origin: -11px 192px; animation: surge5 1.3s infinite ease-in-out; }
      .flame-lick-left-5 { transform-origin: -60px 150px; animation: lickLeft5 1.1s infinite ease-in-out; }
      .flame-lick-right-5 { transform-origin: 50px 150px; animation: lickRight5 1.25s infinite ease-in-out -0.45s; }
      .flame-mid-5 { transform-origin: -11px 180px; animation: flutter5 0.85s infinite ease-in-out; }
      .flame-core-5 { transform-origin: -11px 160px; animation: throb5 0.75s infinite ease-in-out; }
      .spark-whipping-5 { transform-origin: -81px -212px; animation: spark5 1.4s infinite ease-in-out; }
      .spark-rise-right-5 { animation: wisp5 1.4s infinite ease-out; }
      .spark-rise-left-5 { animation: wisp5 1.3s infinite ease-out -0.4s; }
      .rising-wisp-1-5 { animation: wisp5 1.2s infinite linear; }
      .rising-wisp-2-5 { animation: wisp5 1.4s infinite linear -0.5s; }
      .rising-wisp-3-5 { animation: wisp5 1.6s infinite linear -0.9s; }
      .rising-wisp-4-5 { animation: wisp5 1.1s infinite linear -0.3s; }
      .ember-particle-5 { animation: wisp5 1.5s infinite ease-out; }

      /* ----------------------------------------------------------------- */
      /* THEME 6: Halloween Spook (Phantom Ghost Flicker & Crypt Candle)   */
      /* ----------------------------------------------------------------- */
      @keyframes aura6 { 0%, 100% { transform: scale(1); opacity: 0.5; } 45% { transform: scale(1.18); opacity: 0.95; } 65% { opacity: 0.35; } }
      @keyframes base6 { 0%, 100% { transform: skewX(0); } 35% { transform: skewX(-3deg); } 75% { transform: skewX(3deg); } }
      @keyframes surge6 {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); opacity: 0.95; }
        18% { transform: scaleY(1.24) translateY(-30px) skewX(-5deg); opacity: 1; }
        35% { transform: scaleY(0.85) translateY(8px) skewX(3deg); opacity: 0.45; }
        48% { transform: scaleY(1.18) translateY(-22px) skewX(5deg); opacity: 0.9; }
        72% { transform: scaleY(0.92) translateY(4px) skewX(-2deg); opacity: 0.6; }
      }
      @keyframes lickLeft6 { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-12deg) scaleY(1.22) translateY(-26px); } 65% { transform: rotate(5deg) scaleY(0.88); } }
      @keyframes lickRight6 { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(12deg) scaleY(1.2) translateY(-24px); } 70% { transform: rotate(-5deg) scaleY(0.88); } }
      @keyframes flutter6 { 0%, 100% { opacity: 0.9; } 30% { opacity: 0.4; transform: translateY(6px); } 60% { opacity: 1; transform: translateY(-16px); } }
      @keyframes throb6 { 0%, 100% { transform: scale(1); opacity: 0.8; } 40% { transform: scale(1.25); opacity: 1; } 70% { opacity: 0.45; } }
      @keyframes spark6 { 0%, 100% { transform: translate(0, 0); } 30% { transform: translate(-14px, -26px) rotate(-15deg); } 70% { transform: translate(6px, -42px); } }
      @keyframes wisp6 { 0% { transform: translateY(15px) scale(0.9); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-190px) scale(0.2); opacity: 0; } }

      .heat-aura-6 { transform-origin: -11px 0; animation: aura6 1.7s infinite ease-in-out; }
      .flame-sway-base-6 { transform-origin: -11px 192px; animation: base6 1.8s infinite ease-in-out; }
      .flame-surge-center-6 { transform-origin: -11px 192px; animation: surge6 1.7s infinite ease-in-out; }
      .flame-lick-left-6 { transform-origin: -60px 150px; animation: lickLeft6 1.4s infinite ease-in-out; }
      .flame-lick-right-6 { transform-origin: 50px 150px; animation: lickRight6 1.55s infinite ease-in-out -0.5s; }
      .flame-mid-6 { transform-origin: -11px 180px; animation: flutter6 0.65s infinite ease-in-out; }
      .flame-core-6 { transform-origin: -11px 160px; animation: throb6 0.55s infinite ease-in-out; }
      .spark-whipping-6 { transform-origin: -81px -212px; animation: spark6 1.6s infinite ease-in-out; }
      .spark-rise-right-6 { animation: wisp6 1.6s infinite ease-out; }
      .spark-rise-left-6 { animation: wisp6 1.4s infinite ease-out -0.4s; }
      .rising-wisp-1-6 { animation: wisp6 1.3s infinite linear; }
      .rising-wisp-2-6 { animation: wisp6 1.5s infinite linear -0.5s; }
      .rising-wisp-3-6 { animation: wisp6 1.7s infinite linear -0.9s; }
      .rising-wisp-4-6 { animation: wisp6 1.2s infinite linear -0.3s; }
      .ember-particle-6 { animation: wisp6 1.6s infinite ease-out; }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      .streak-num { fill: #F0F6FC; }
      .streak-sub-txt { fill: #8B949E; }
      @media (prefers-color-scheme: light) {
        .streak-num { fill: #1F2328; }
        .streak-sub-txt { fill: #57606A; }
      }
  `;
}

function buildCanonicalStreakSvg(stats) {
  const { currentStreak, tier } = stats;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 118" width="100%" height="100%">
  <defs>
    ${generateGradientsXml()}
    <style><![CDATA[
${generateCssRules()}
    ]]></style>
  </defs>

  <!-- Left: 7 Synchronized Easter Egg Living Flames (Exact 28s Cycle with Matrix) -->
  <g transform="translate(52, 64)">
    ${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const egg = SEVEN_DAY_EASTER_EGGS[i];
      return `
    <g class="streak-cycle-layer streak-cycle-${i}">
      ${renderEmbers(egg.accent, i)}
      ${renderFlameGraphic(egg.accent, egg.palette, tier, `t${i}_`, i)}
    </g>`;
    }).join('\n')}
  </g>

  <!-- Left Center: Streak Count and Synchronized Tier & Theme Tag -->
  <g transform="translate(108, 0)">
    <text x="0" y="78" class="inter streak-num" font-size="46" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 64 : 36}" y="58" class="inter streak-txt-color" font-size="15" font-weight="800" letter-spacing="0.8">DAYS STREAK</text>
    
    <!-- Synchronized 7-Day Tier & Easter Egg Subtitle -->
    ${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const egg = SEVEN_DAY_EASTER_EGGS[i];
      return `<text x="${currentStreak >= 10 ? 64 : 36}" y="79" class="mono streak-cycle-layer streak-cycle-${i} streak-sub-txt" font-size="11" font-weight="600" letter-spacing="1">${tier.name.toUpperCase()} TIER • ${egg.name.toUpperCase()}</text>`;
    }).join('\n    ')}
  </g>
</svg>`;
}

function buildSingleDayStreakSvg(stats, dayIndex = 0) {
  const egg = (dayIndex !== null && SEVEN_DAY_EASTER_EGGS[dayIndex]) ? SEVEN_DAY_EASTER_EGGS[dayIndex] : SEVEN_DAY_EASTER_EGGS[0];
  const { currentStreak, tier } = stats;

  const prefix = `day${dayIndex}_`;
  const p = egg.palette;

  const gradXml = `
    <radialGradient id="${prefix}auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${egg.accent}" stop-opacity="0.45" />
      <stop offset="60%" stop-color="${p[1]}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${prefix}outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[1]}" />
      <stop offset="45%" stop-color="${p[2]}" />
      <stop offset="100%" stop-color="${p[3]}" />
    </linearGradient>
    <linearGradient id="${prefix}midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[2]}" />
      <stop offset="55%" stop-color="${p[3]}" />
      <stop offset="100%" stop-color="${p[4]}" />
    </linearGradient>
    <linearGradient id="${prefix}coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${p[3]}" />
      <stop offset="60%" stop-color="${p[4]}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 118" width="100%" height="100%">
  <defs>
    ${gradXml}
    <style><![CDATA[
${generateCssRules()}
    ]]></style>
  </defs>

  <g transform="translate(52, 64)">
    ${renderEmbers(egg.accent, dayIndex)}
    ${renderFlameGraphic(egg.accent, egg.palette, tier, prefix, dayIndex)}
  </g>

  <g transform="translate(108, 0)">
    <text x="0" y="78" class="inter streak-num" font-size="46" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 64 : 36}" y="58" class="inter" fill="${egg.accent}" font-size="15" font-weight="800" letter-spacing="0.8">DAYS STREAK</text>
    <text x="${currentStreak >= 10 ? 64 : 36}" y="79" class="mono streak-sub-txt" font-size="11" font-weight="600" letter-spacing="1">${tier.name.toUpperCase()} TIER • ${egg.name.toUpperCase()}</text>
  </g>
</svg>`;
}

function buildLinearMinimalistStreakSvg(stats) {
  const { currentStreak, tier } = stats;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 118" width="100%" height="100%">
  <defs>
    <radialGradient id="plat_auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="50%" stop-color="#A1A1AA" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="plat_outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#27272A" />
      <stop offset="45%" stop-color="#52525B" />
      <stop offset="100%" stop-color="#71717A" />
    </linearGradient>
    <linearGradient id="plat_midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#52525B" />
      <stop offset="55%" stop-color="#A1A1AA" />
      <stop offset="100%" stop-color="#E4E4E7" />
    </linearGradient>
    <linearGradient id="plat_coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#A1A1AA" />
      <stop offset="60%" stop-color="#E4E4E7" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <style><![CDATA[
      @keyframes auraPlat { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 0.95; } }
      @keyframes basePlat { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.04) skewX(1deg); } }
      @keyframes surgePlat {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); }
        25% { transform: scaleY(1.14) translateY(-22px) skewX(2deg); }
        50% { transform: scaleY(0.92) translateY(5px) skewX(-1.5deg); }
        75% { transform: scaleY(1.1) translateY(-15px) skewX(1.5deg); }
      }
      @keyframes lickLeftPlat { 0%, 100% { transform: rotate(0deg); } 35% { transform: rotate(-7deg) scaleY(1.15) translateY(-20px); } 70% { transform: rotate(3deg) scaleY(0.92); } }
      @keyframes lickRightPlat { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(7deg) scaleY(1.14) translateY(-18px); } 75% { transform: rotate(-3deg) scaleY(0.93); } }
      @keyframes flutterPlat { 0%, 100% { transform: scaleY(1); } 30% { transform: scaleY(1.12) translateY(-15px); } 65% { transform: scaleY(0.92); } }
      @keyframes throbPlat { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.16) translateY(-4px); } 70% { transform: scale(0.92); } }
      @keyframes sparkPlat { 0%, 100% { transform: translate(0, 0); } 30% { transform: translate(-10px, -20px) rotate(-10deg); } 70% { transform: translate(-4px, -35px) rotate(5deg); } }
      @keyframes wispPlat { 0% { transform: translateY(20px) scale(0.8); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-190px) scale(0.3); opacity: 0; } }

      .heat-aura { transform-origin: -11px 0; animation: auraPlat 2.4s infinite ease-in-out; }
      .flame-sway-base { transform-origin: -11px 192px; animation: basePlat 2.4s infinite ease-in-out; }
      .flame-surge-center { transform-origin: -11px 192px; animation: surgePlat 1.2s infinite ease-in-out; }
      .flame-lick-left { transform-origin: -60px 150px; animation: lickLeftPlat 1.35s infinite ease-in-out; }
      .flame-lick-right { transform-origin: 50px 150px; animation: lickRightPlat 1.45s infinite ease-in-out -0.4s; }
      .flame-mid { transform-origin: -11px 180px; animation: flutterPlat 0.95s infinite ease-in-out; }
      .flame-core { transform-origin: -11px 160px; animation: throbPlat 0.75s infinite ease-in-out; }
      .spark-whipping { transform-origin: -81px -212px; animation: sparkPlat 1.6s infinite ease-in-out; }
      .spark-rise-right { animation: wispPlat 1.6s infinite ease-out; }
      .spark-rise-left { animation: wispPlat 1.4s infinite ease-out -0.4s; }
      .rising-wisp-1 { animation: wispPlat 1.3s infinite linear; }
      .rising-wisp-2 { animation: wispPlat 1.5s infinite linear -0.5s; }
      .rising-wisp-3 { animation: wispPlat 1.7s infinite linear -0.9s; }
      .rising-wisp-4 { animation: wispPlat 1.2s infinite linear -0.3s; }
      .ember-particle { animation: wispPlat 1.6s infinite ease-out; }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      
      .streak-num { fill: #F4F4F5; }
      .streak-label { fill: #D4D4D8; }
      .streak-sub-txt { fill: #71717A; }

      @media (prefers-color-scheme: light) {
        .streak-num { fill: #18181B; }
        .streak-label { fill: #52525B; }
        .streak-sub-txt { fill: #71717A; }
      }
    ]]></style>
  </defs>

  <!-- Left: Monochrome Living Platinum Flame -->
  <g transform="translate(52, 64)">
    <circle cx="-26" cy="24" r="2.2" fill="#FFFFFF" class="ember-particle" style="--dx: -9px; animation-duration: 1.4s; animation-delay: 0s;" />
    <circle cx="-38" cy="18" r="1.8" fill="#E4E4E7" class="ember-particle" style="--dx: -16px; animation-duration: 1.9s; animation-delay: 0.3s;" />
    <circle cx="-11" cy="28" r="2.4" fill="#FFFFFF" class="ember-particle" style="--dx: -4px; animation-duration: 1.5s; animation-delay: 0.8s;" />
    <circle cx="12" cy="22" r="2.5" fill="#E4E4E7" class="ember-particle" style="--dx: 8px; animation-duration: 1.3s; animation-delay: 0.1s;" />
    <circle cx="30" cy="16" r="1.9" fill="#FFFFFF" class="ember-particle" style="--dx: 14px; animation-duration: 2s; animation-delay: 0.6s;" />

    <g class="flame-master" transform="scale(0.23)">
      <circle cx="-11" cy="0" r="240" fill="url(#plat_auraGlow)" class="heat-aura" />

      <!-- Shadow and Base Foundation -->
      <g class="flame-sway-base" opacity="0.45">
        <path fill="#27272A" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path stroke="#71717A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.25" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
      </g>

      <!-- Center Main Tongue -->
      <g class="flame-surge-center">
        <path fill="url(#plat_outerGrad)" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path fill="url(#plat_outerGrad)" d="M-36.898,-145.17 C-101.993,-71.701 -126.604,15.347 -11,192 C115.073,-14.97 -61.444,-36.548 -36.898,-145.17z"/>
        <path fill="url(#plat_outerGrad)" d="M-36.898,-145.17 C-29.625,-141.125 -8.262,-154.805 -11.627,-198.246 C2.443,-53.713 -69.323,-90.814 -36.898,-145.17z"/>
      </g>

      <!-- Left Flank Tongues -->
      <g class="flame-lick-left">
        <path fill="url(#plat_outerGrad)" d="M-107.023,-59.32 C-166.38,13.28 -113.38,144.70 -11,192 C81.5,-23.5 -116.16,47.34 -107.023,-59.32z"/>
        <path fill="url(#plat_outerGrad)" d="M-135.05,84.36 C-148.51,123.68 -85.94,192 -11,192 C17.15,68.55 -110.18,126.14 -135.05,84.36z"/>
        <path fill="url(#plat_outerGrad)" d="M-88.60,158.17 C-68.90,166.72 -65,192 -11,192 C-21.72,149.02 -65.19,155.08 -88.60,158.17z"/>
      </g>

      <!-- Right Flank Tongues -->
      <g class="flame-lick-right">
        <path fill="url(#plat_outerGrad)" d="M108.98,-59.68 C75.36,10.05 -46.55,2.52 -11,192 C122.73,140.84 144.78,40.84 108.98,-59.68z"/>
        <path fill="url(#plat_outerGrad)" d="M121.36,118.23 C75,114.89 -10.79,121.61 -11,192 C87.47,192 107.68,134.94 121.36,118.23z"/>
        <path fill="url(#plat_outerGrad)" d="M30.97,176.34 C14.27,167.16 -10.95,175.79 -11.04,191.24 C15.45,191.24 24.57,172.66 30.97,176.34z"/>
      </g>

      <!-- Middle Layer -->
      <g class="flame-mid">
        <path fill="url(#plat_midGrad)" d="M-11,192 C95.52,-18.31 32.10,-80.47 -8.70,-156.68 C-20.73,-86.36 -137.36,-109.73 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-11,192 C91.10,134.84 87.78,21.68 89.94,-18.17 C66.10,16.26 -35.5,-26.39 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-11,192 C72.68,161 101.84,113.57 103.95,90.03 C80.63,96 0.10,82.63 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-11,192 C59.28,192 51.13,153.18 76.98,142.36 C51.55,130.44 -9.80,147.38 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-8.17,-154.36 C-34.65,101.78 66.13,95 89.94,-18.17 C82.97,-8.24 71.32,-5.95 59.66,-8.89 C26.23,-14.98 49.89,-80.47 -8.17,-154.36z"/>
        <path fill="url(#plat_midGrad)" d="M-11,192 C7.32,-10.82 -77.20,70.96 -109.08,-4.89 C-134.87,51.84 -72.07,131.74 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-11,192 C-11,76.50 -65.35,143.31 -101.39,111.51 C-97.47,164.05 -49.62,192 -11,192z"/>
        <path fill="url(#plat_midGrad)" d="M-56.93,-80.83 C-66.55,-59.58 -58.92,-19.35 -69.43,0.08 C-76.84,13.80 -96.81,13.31 -108.98,-4.99 C-126.03,76.33 2.02,102.01 -56.93,-80.83z"/>
      </g>

      <!-- Translucent Gloss Layer -->
      <g opacity="0.35" class="flame-mid" style="animation-delay: -0.35s;">
        <path fill="#FFFFFF" d="M-0.026,-98.88 C0.157,-47.05 -108,-67.78 -12,192.42 C44.68,101.84 31.31,-9.47 -0.026,-98.88z M57.63,23.73 C49.08,31.12 24.81,33.76 21.16,7.69 C17.16,-21.13 -31.30,63.64 -12,192.42 C28.84,120.26 84.57,116.94 57.63,23.73z M-80.12,54.82 C-84.81,113.66 -41.15,143.19 -12,192.42 C-9.15,136.64 -42.23,10.05 -47.53,30.36 C-49.09,64.02 -64.24,57.06 -80.12,54.82z"/>
      </g>

      <!-- Core Hearth Layer -->
      <g class="flame-core">
        <path fill="url(#plat_coreGrad)" d="M-5.87,-22.27 C-12.09,25.84 -77.88,36.63 -12,192.42 C74.23,64.59 -12.02,43.79 -5.87,-22.27z"/>
        <path fill="url(#plat_coreGrad)" d="M42.90,56.23 C28.57,82.21 -28.19,74.48 -12,192.42 C27.07,145.77 36.23,140.23 42.90,56.23z"/>
        <path fill="url(#plat_coreGrad)" d="M70.01,103.60 C43.15,112.26 -16.5,82.5 -12,192.42 C32.23,165.57 57.68,133.5 70.01,103.60z"/>
        <path fill="url(#plat_coreGrad)" d="M-61.02,87.46 C-65.47,104.16 -62.65,139.36 -12,192.42 C15.22,90.81 -43.62,102.51 -61.02,87.46z"/>
        <path fill="url(#plat_coreGrad)" d="M-60.80,142.56 C-53.52,154.91 -54.20,178.63 -12,192.42 C-3.07,138.74 -41.61,137.68 -60.80,142.56z"/>
      </g>

      <!-- Center Core Hotspot -->
      <ellipse cx="-11" cy="142" rx="14" ry="24" fill="#FFFFFF" class="flame-core" />

      <!-- Rising Wisps & Sparks -->
      <path class="rising-wisp-1" fill="url(#plat_midGrad)" d="M-11.6,-140 C-24,-110 -36,-80 -11,-20 C14,-80 2,-110 -11.6,-140 Z"/>
      <path class="rising-wisp-2" fill="url(#plat_outerGrad)" d="M-45,-70 C-58,-50 -65,-20 -35,20 C-20,-20 -35,-50 -45,-70 Z"/>
      <path class="rising-wisp-3" fill="url(#plat_outerGrad)" d="M35,-50 C20,-30 15,0 40,30 C52,0 45,-30 35,-50 Z"/>
      <path class="rising-wisp-4" fill="url(#plat_coreGrad)" d="M-11.6,-90 C-18,-60 -22,-30 -11,0 C0,-30 -5,-60 -11.6,-90 Z"/>

      <g class="spark-whipping">
        <path fill="#FFFFFF" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
        <path stroke="#E4E4E7" stroke-width="6" fill="none" opacity="0.8" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
      </g>

      <circle cx="45" cy="-70" r="10" fill="#FFFFFF" class="spark-rise-right"/>
      <circle cx="-35" cy="-90" r="9" fill="#FFFFFF" class="spark-rise-left"/>
    </g>
  </g>

  <!-- Streak Count & Understated Typography -->
  <g transform="translate(108, 0)">
    <text x="0" y="78" class="inter streak-num" font-size="46" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 64 : 36}" y="58" class="inter streak-label" font-size="14" font-weight="700" letter-spacing="1.2">DAYS STREAK</text>
    <text x="${currentStreak >= 10 ? 64 : 36}" y="79" class="mono streak-sub-txt" font-size="11" font-weight="600" letter-spacing="1">${tier.name.toUpperCase()} TIER • ${currentStreak} CONSECUTIVE DAYS</text>
  </g>
</svg>`;
}

async function main() {
  const args = process.argv.slice(2);
  const now = new Date();
  const utcTime = now.getTime();
  const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  const todayDay = istTime.getUTCDay();

  let targetDay = null;
  const dayArg = args.find(a => a.startsWith('--day='));
  if (dayArg) targetDay = parseInt(dayArg.split('=')[1], 10);

  let forcedStreak = null;
  const sFind = args.find(a => a.startsWith('--streak='));
  if (sFind) forcedStreak = parseInt(sFind.split('=')[1], 10);

  const rawData = await fetchLetMeCodexContributions();
  const stats = calculateStreakData(rawData);

  if (forcedStreak !== null) {
    stats.currentStreak = forcedStreak;
    if (forcedStreak > stats.longestStreak) stats.longestStreak = forcedStreak;
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

  const isMinimal = args.includes('--minimal');
  if (!isMinimal) {
    console.log('Generating 7-Day Synchronized Living Easter Egg GitStreak SVGs...');
    const streakSvg = buildCanonicalStreakSvg(stats);
    const mainPath = path.join(assetsDir, 'git-streak.svg');
    fs.writeFileSync(mainPath, streakSvg);
    console.log(`Saved 7-day synchronized streak to ${mainPath}`);
  } else {
    console.log('Generating Linear / Apple Minimalist Platinum Living GitStreak SVG...');
    const streakSvg = buildLinearMinimalistStreakSvg(stats);
    const mainPath = path.join(assetsDir, 'git-streak.svg');
    fs.writeFileSync(mainPath, streakSvg);
    console.log(`Saved Linear / Apple Minimalist streak to ${mainPath}`);
  }

  // Also update day-specific SVGs
  for (let d = 0; d < 7; d++) {
    const egg = SEVEN_DAY_EASTER_EGGS[d];
    const singleSvg = buildSingleDayStreakSvg(stats, d);
    const filename = `git-streak-${egg.shortName.toLowerCase()}.svg`;
    fs.writeFileSync(path.join(assetsDir, filename), singleSvg);
  }
  console.log('Updated all day-specific streak SVGs.');
}

main().catch(err => {
  console.error('Error generating GitStreak SVG:', err);
  process.exit(1);
});
