const fs = require('fs');
const path = require('path');
const { TIERS, fetchLetMeCodexContributions, calculateStreakData } = require('./streak-calculator.js');

// Iconic Flame Palette from Image 1017 (Sunday: Solar Supernova - Warm Golden Fire)
const GOLDEN_FIRE_THEME = {
  accent: '#F59E0B',
  palette: ['#161B22', '#78350F', '#D97706', '#F59E0B', '#FDE047'],
  name: 'Solar Supernova',
  symbol: '☀️'
};

const SEVEN_DAY_EASTER_EGGS = {
  0: { day: 0, shortName: 'Sun', name: 'Solar Supernova', accent: '#F59E0B', palette: ['#161B22', '#78350F', '#D97706', '#F59E0B', '#FDE047'], symbol: '☀️' },
  1: { day: 1, shortName: 'Mon', name: 'Cyberpunk Phosphor', accent: '#10B981', palette: ['#0D1117', '#064E3B', '#059669', '#10B981', '#34D399'], symbol: '⚡' },
  2: { day: 2, shortName: 'Tue', name: 'Quantum Aurora', accent: '#38BDF8', palette: ['#0E121E', '#312E81', '#6366F1', '#06B6D4', '#38BDF8'], symbol: '🌌' },
  3: { day: 3, shortName: 'Wed', name: 'Retro Synthwave', accent: '#F43F5E', palette: ['#120F1D', '#701A75', '#C026D3', '#F43F5E', '#FB7185'], symbol: '🌆' },
  4: { day: 4, shortName: 'Thu', name: 'Zen Hydro-Wave', accent: '#14B8A6', palette: ['#0D1518', '#134E4A', '#0D9488', '#14B8A6', '#5EEAD4'], symbol: '🌊' },
  5: { day: 5, shortName: 'Fri', name: "Conway's Living Colony", accent: '#84CC16', palette: ['#0F1612', '#365314', '#65A30D', '#84CC16', '#BEF264'], symbol: '🧬' },
  6: { day: 6, shortName: 'Sat', name: 'Halloween Spook', accent: '#FA7A18', palette: ['#161B22', '#631C03', '#BD561D', '#FA7A18', '#FDDF68'], symbol: '🎃' },
};

function renderFlameGraphic(accent = GOLDEN_FIRE_THEME.accent, palette = GOLDEN_FIRE_THEME.palette, tier = { id: 'hot' }, idPrefix = '') {
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

  // Upward-rushing fiery wisps & sparks giving organic fluid turbulence
  const risingWisps = `
    <!-- Rising Flame Wisp 1 (Center High Surge) -->
    <path class="rising-wisp-1" fill="url(#${idPrefix}midGrad)"
          d="M-11.6,-140 C-24,-110 -36,-80 -11,-20 C14,-80 2,-110 -11.6,-140 Z"/>

    <!-- Rising Flame Wisp 2 (Left Flank Surge) -->
    <path class="rising-wisp-2" fill="url(#${idPrefix}outerGrad)"
          d="M-45,-70 C-58,-50 -65,-20 -35,20 C-20,-20 -35,-50 -45,-70 Z"/>

    <!-- Rising Flame Wisp 3 (Right Flank Surge) -->
    <path class="rising-wisp-3" fill="url(#${idPrefix}outerGrad)"
          d="M35,-50 C20,-30 15,0 40,30 C52,0 45,-30 35,-50 Z"/>

    <!-- Rising Flame Wisp 4 (Core White-Gold Surging Tongue) -->
    <path class="rising-wisp-4" fill="url(#${idPrefix}coreGrad)"
          d="M-11.6,-90 C-18,-60 -22,-30 -11,0 C0,-30 -5,-60 -11.6,-90 Z"/>

    <!-- Signature Detached Floating Spark (Layer 75) -->
    <g class="spark-whipping-anim">
      <path fill="${accent}" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
      <path stroke="${c4}" stroke-width="6" fill="none" opacity="0.8" d="M-81.61,-212.15 C-78.53,-191.03 -118.03,-193.80 -97.59,-151.04 C-97.08,-151.74 -96.45,-152.17 -95.86,-152.01 C-68.61,-174.70 -66.37,-195.21 -81.61,-212.15z"/>
    </g>

    <!-- Secondary Rising Sparks -->
    <circle cx="45" cy="-70" r="10" fill="${c4}" class="spark-rise-right"/>
    <circle cx="-35" cy="-90" r="9" fill="#FFFFFF" class="spark-rise-left"/>
  `;

  return `
    <g class="flame-master" transform="scale(0.23)">
      <!-- Pulsing Aura Heat Glow -->
      <circle cx="-11" cy="0" r="240" fill="url(#${idPrefix}auraGlow)" class="heat-aura-pulse" />

      ${(isLegendary || isMythic) ? `
      <!-- Legendary Orbital Energy Ring -->
      <ellipse cx="-11" cy="10" rx="260" ry="75" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="16 24" class="energy-orbit" opacity="0.75"/>
      ` : ''}

      ${isMythic ? `
      <!-- Mythic Luminous Star Core -->
      <circle cx="-11" cy="-210" r="16" fill="#FFFFFF" class="mythic-sparkle"/>
      ` : ''}

      <!-- Shadow & Base Foundation -->
      <g class="flame-sway-base" opacity="0.45">
        <path fill="${c1}" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path stroke="${accent}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
      </g>

      <!-- Center Main Tongue (Vigorous Upward Surge) -->
      <g class="flame-surge-center">
        <path fill="url(#${idPrefix}outerGrad)" d="M-11.648,-198.368 C-42.315,-49.21 -191.842,-7.631 -11,192 C136.105,-1.263 65.263,-120 -11.648,-198.368z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-101.993,-71.701 -126.604,15.347 -11,192 C115.073,-14.97 -61.444,-36.548 -36.898,-145.17z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-36.898,-145.17 C-29.625,-141.125 -8.262,-154.805 -11.627,-198.246 C2.443,-53.713 -69.323,-90.814 -36.898,-145.17z"/>
      </g>

      <!-- Left Flank Tongues (Flicks Outward Left & Up) -->
      <g class="flame-lick-left-flank">
        <path fill="url(#${idPrefix}outerGrad)" d="M-107.023,-59.32 C-166.38,13.28 -113.38,144.70 -11,192 C81.5,-23.5 -116.16,47.34 -107.023,-59.32z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-135.05,84.36 C-148.51,123.68 -85.94,192 -11,192 C17.15,68.55 -110.18,126.14 -135.05,84.36z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M-88.60,158.17 C-68.90,166.72 -65,192 -11,192 C-21.72,149.02 -65.19,155.08 -88.60,158.17z"/>
      </g>

      <!-- Right Flank Tongues (Flicks Outward Right & Up) -->
      <g class="flame-lick-right-flank">
        <path fill="url(#${idPrefix}outerGrad)" d="M108.98,-59.68 C75.36,10.05 -46.55,2.52 -11,192 C122.73,140.84 144.78,40.84 108.98,-59.68z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M121.36,118.23 C75,114.89 -10.79,121.61 -11,192 C87.47,192 107.68,134.94 121.36,118.23z"/>
        <path fill="url(#${idPrefix}outerGrad)" d="M30.97,176.34 C14.27,167.16 -10.95,175.79 -11.04,191.24 C15.45,191.24 24.57,172.66 30.97,176.34z"/>
      </g>

      <!-- Middle Flame Layer (Rapid Asynchronous Flutter) -->
      <g class="flame-mid-flutter">
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
      <g opacity="0.32" class="flame-mid-flutter" style="animation-delay: -0.35s;">
        <path fill="${c4}" d="M-0.026,-98.88 C0.157,-47.05 -108,-67.78 -12,192.42 C44.68,101.84 31.31,-9.47 -0.026,-98.88z M57.63,23.73 C49.08,31.12 24.81,33.76 21.16,7.69 C17.16,-21.13 -31.30,63.64 -12,192.42 C28.84,120.26 84.57,116.94 57.63,23.73z M-80.12,54.82 C-84.81,113.66 -41.15,143.19 -12,192.42 C-9.15,136.64 -42.23,10.05 -47.53,30.36 C-49.09,64.02 -64.24,57.06 -80.12,54.82z"/>
      </g>

      <!-- Core Hearth Layer (Rapid White-Hot Pulse) -->
      <g class="flame-core-pulse">
        <path fill="url(#${idPrefix}coreGrad)" d="M-5.87,-22.27 C-12.09,25.84 -77.88,36.63 -12,192.42 C74.23,64.59 -12.02,43.79 -5.87,-22.27z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M42.90,56.23 C28.57,82.21 -28.19,74.48 -12,192.42 C27.07,145.77 36.23,140.23 42.90,56.23z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M70.01,103.60 C43.15,112.26 -16.5,82.5 -12,192.42 C32.23,165.57 57.68,133.5 70.01,103.60z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-61.02,87.46 C-65.47,104.16 -62.65,139.36 -12,192.42 C15.22,90.81 -43.62,102.51 -61.02,87.46z"/>
        <path fill="url(#${idPrefix}coreGrad)" d="M-60.80,142.56 C-53.52,154.91 -54.20,178.63 -12,192.42 C-3.07,138.74 -41.61,137.68 -60.80,142.56z"/>
      </g>

      <!-- Incandescent Center Core Hotspot -->
      <ellipse cx="-11" cy="142" rx="14" ry="24" fill="#FFFFFF" class="flame-core-pulse" />

      <!-- Active Rising Flames & Sparks -->
      ${risingWisps}
    </g>
  `;
}

function renderEmbers(accent = GOLDEN_FIRE_THEME.accent) {
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
    `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="${accent}" class="ember-particle" style="--dx: ${e.dx}px; animation-duration: ${e.dur}s; animation-delay: ${e.del}s;" />`
  ).join('\n      ');
}

function buildCanonicalStreakSvg(stats) {
  const egg = GOLDEN_FIRE_THEME;
  const { currentStreak, longestStreak, tier } = stats;

  const flameG = renderFlameGraphic(egg.accent, egg.palette, tier);
  const embers = renderEmbers(egg.accent);

  const c0 = egg.palette[0];
  const c1 = egg.palette[1];
  const c2 = egg.palette[2];
  const c3 = egg.palette[3];
  const c4 = egg.palette[4];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 96" width="100%" height="100%">
  <defs>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#78350F" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#78350F" />
      <stop offset="45%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="55%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#FDE047" />
    </linearGradient>
    <linearGradient id="coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="60%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <style><![CDATA[
      /* 1. Heat Aura Breathing */
      @keyframes heatAura {
        0%, 100% { transform: scale(1); opacity: 0.75; }
        50% { transform: scale(1.14); opacity: 1; }
      }

      /* 2. Base Sway */
      @keyframes baseSway {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        50% { transform: scaleY(1.03) skewX(1.2deg); }
      }

      /* 3. Center Flame Upward Surge and Turbulence */
      @keyframes centerSurge {
        0%, 100% { transform: scaleY(1) translateY(0) skewX(0deg); }
        25% { transform: scaleY(1.15) translateY(-26px) skewX(2.5deg); }
        50% { transform: scaleY(0.92) translateY(6px) skewX(-2deg); }
        75% { transform: scaleY(1.1) translateY(-18px) skewX(1.8deg); }
      }

      /* 4. Left Flank Lick and Whip */
      @keyframes lickLeft {
        0%, 100% { transform: rotate(0deg) scale(1) translateY(0); }
        35% { transform: rotate(-8deg) scaleY(1.16) translateY(-24px) skewX(-4deg); }
        70% { transform: rotate(3deg) scaleY(0.92) translateY(6px) skewX(2deg); }
      }

      /* 5. Right Flank Lick and Whip */
      @keyframes lickRight {
        0%, 100% { transform: rotate(0deg) scale(1) translateY(0); }
        40% { transform: rotate(8deg) scaleY(1.15) translateY(-22px) skewX(4deg); }
        75% { transform: rotate(-3deg) scaleY(0.93) translateY(5px) skewX(-2deg); }
      }

      /* 6. Mid Layer Rapid Asymmetric Flutter */
      @keyframes midFlutter {
        0%, 100% { transform: scaleY(1) skewX(0deg); opacity: 0.95; }
        30% { transform: scaleY(1.14) translateY(-18px) skewX(-3deg); opacity: 1; }
        65% { transform: scaleY(0.92) translateY(6px) skewX(3deg); opacity: 0.88; }
      }

      /* 7. Hearth Core Rapid White-Hot Throbbing */
      @keyframes coreThrob {
        0%, 100% { transform: scale(1); opacity: 0.92; }
        30% { transform: scale(1.18) translateY(-6px); opacity: 1; }
        70% { transform: scale(0.92) translateY(3px); opacity: 0.85; }
      }

      /* 8. Rising Flame Wisp 1 (Center Surge) */
      @keyframes riseWisp1 {
        0% { transform: translateY(30px) scale(0.8); opacity: 0; }
        20% { opacity: 0.9; }
        65% { opacity: 0.6; }
        100% { transform: translateY(-220px) scale(0.3); opacity: 0; }
      }

      /* 9. Rising Flame Wisp 2 (Left Surge) */
      @keyframes riseWisp2 {
        0% { transform: translate(0, 40px) scale(0.8); opacity: 0; }
        25% { opacity: 0.85; }
        65% { opacity: 0.5; }
        100% { transform: translate(-35px, -200px) scale(0.25); opacity: 0; }
      }

      /* 10. Rising Flame Wisp 3 (Right Surge) */
      @keyframes riseWisp3 {
        0% { transform: translate(0, 40px) scale(0.8); opacity: 0; }
        25% { opacity: 0.85; }
        65% { opacity: 0.5; }
        100% { transform: translate(35px, -190px) scale(0.25); opacity: 0; }
      }

      /* 11. Rising Flame Wisp 4 (High Core Surge) */
      @keyframes riseWisp4 {
        0% { transform: translateY(20px) scale(0.9); opacity: 0; }
        20% { opacity: 0.95; }
        60% { opacity: 0.6; }
        100% { transform: translateY(-260px) scale(0.2); opacity: 0; }
      }

      /* 12. Top-Left Detached Spark (Whipping & Floating) */
      @keyframes sparkWhip {
        0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.95; }
        25% { transform: translate(-10px, -24px) rotate(-12deg) scale(1.12); opacity: 0.8; }
        50% { transform: translate(-4px, -45px) rotate(6deg) scale(0.85); opacity: 0.5; }
        75% { transform: translate(-12px, -26px) rotate(-6deg) scale(0.95); opacity: 0.9; }
      }

      /* 13. Floating Embers Ascending */
      @keyframes emberAscent {
        0% { transform: translate(0, 0); opacity: 0.95; }
        50% { transform: translate(var(--dx, -6px), -36px); opacity: 0.65; }
        100% { transform: translate(calc(var(--dx, -6px) * 2), -72px); opacity: 0; }
      }

      /* 14. High Sparks Ascending */
      @keyframes sparkRiseHigh {
        0% { transform: translate(0, 0) scale(1); opacity: 0.95; }
        40% { opacity: 0.7; }
        100% { transform: translate(-18px, -120px) scale(0.2); opacity: 0; }
      }
      @keyframes sparkRiseRight {
        0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
        40% { opacity: 0.65; }
        100% { transform: translate(18px, -110px) scale(0.2); opacity: 0; }
      }

      .heat-aura-pulse { transform-origin: -11px 0px; animation: heatAura 2s infinite ease-in-out; }
      .flame-sway-base { transform-origin: -11px 192px; animation: baseSway 2.2s infinite ease-in-out; }
      .flame-surge-center { transform-origin: -11px 192px; animation: centerSurge 1.05s infinite ease-in-out; }
      .flame-lick-left-flank { transform-origin: -60px 150px; animation: lickLeft 1.25s infinite ease-in-out; }
      .flame-lick-right-flank { transform-origin: 50px 150px; animation: lickRight 1.35s infinite ease-in-out; animation-delay: -0.4s; }
      .flame-mid-flutter { transform-origin: -11px 180px; animation: midFlutter 0.85s infinite ease-in-out; }
      .flame-core-pulse { transform-origin: -11px 160px; animation: coreThrob 0.65s infinite ease-in-out; }
      
      .rising-wisp-1 { transform-origin: -11px -20px; animation: riseWisp1 1.25s infinite linear; }
      .rising-wisp-2 { transform-origin: -35px 20px; animation: riseWisp2 1.55s infinite linear; animation-delay: -0.5s; }
      .rising-wisp-3 { transform-origin: 40px 30px; animation: riseWisp3 1.65s infinite linear; animation-delay: -1.0s; }
      .rising-wisp-4 { transform-origin: -11px 0px; animation: riseWisp4 1.15s infinite linear; animation-delay: -0.3s; }
      
      .spark-whipping-anim { transform-origin: -81px -212px; animation: sparkWhip 1.5s infinite ease-in-out; }
      .spark-rise-left { animation: sparkRiseHigh 1.4s infinite ease-out; animation-delay: -0.4s; }
      .spark-rise-right { animation: sparkRiseRight 1.7s infinite ease-out; animation-delay: -1.0s; }
      .ember-particle { animation: emberAscent 1.6s infinite ease-out; }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    ]]></style>
  </defs>

  <!-- Left: The Large Living Turbulent Flame Animation -->
  <g transform="translate(50, 48)">
    ${embers}
    ${flameG}
  </g>

  <!-- Left Center: Streak Count & Tier Tag (Borderless & Minimal) -->
  <g transform="translate(106, 0)">
    <text x="0" y="62" class="inter" fill="#F0F6FC" font-size="44" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 62 : 36}" y="44" class="inter" fill="${egg.accent}" font-size="15" font-weight="800" letter-spacing="0.8">DAYS STREAK</text>
    <text x="${currentStreak >= 10 ? 62 : 36}" y="63" class="mono" fill="#8B949E" font-size="11" font-weight="600" letter-spacing="1">${tier.name.toUpperCase()} TIER</text>
  </g>
</svg>`;
}

function buildSingleDayStreakSvg(stats, dayIndex = 0) {
  const egg = (dayIndex !== null && SEVEN_DAY_EASTER_EGGS[dayIndex]) ? SEVEN_DAY_EASTER_EGGS[dayIndex] : GOLDEN_FIRE_THEME;
  const { currentStreak, longestStreak, tier } = stats;

  const flameG = renderFlameGraphic(egg.accent, egg.palette, tier);
  const embers = renderEmbers(egg.accent);

  return buildCanonicalStreakSvg(stats);
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

  console.log('Generating Living, Dynamic, Turbulent Flame GitStreak SVG...');
  const streakSvg = buildCanonicalStreakSvg(stats);
  const mainPath = path.join(assetsDir, 'git-streak.svg');
  fs.writeFileSync(mainPath, streakSvg);
  console.log(`Saved alive streak to ${mainPath}`);

  // Also update day-specific SVGs
  for (let d = 0; d < 7; d++) {
    const egg = SEVEN_DAY_EASTER_EGGS[d];
    const singleSvg = buildSingleDayStreakSvg(stats, d);
    const filename = `git-streak-${egg.shortName.toLowerCase()}.svg`;
    fs.writeFileSync(path.join(assetsDir, filename), singleSvg);
  }
  console.log('Updated day-specific streak SVGs.');
}

main().catch(err => {
  console.error('Error generating GitStreak SVG:', err);
  process.exit(1);
});
