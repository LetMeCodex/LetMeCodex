const fs = require('fs');
const path = require('path');
const { THEMES, TIERS, MILESTONES, fetchLetMeCodexContributions, calculateStreakData } = require('./streak-calculator.js');

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const THEME_KEYS = ['github', 'inferno', 'arcane', 'cyber', 'zen', 'legendary', 'void'];
const THEME_PILL_NAMES = {
  github: 'GitHub',
  inferno: 'Inferno',
  arcane: 'Arcane',
  cyber: 'Cyber',
  zen: 'Zen',
  legendary: 'Gold',
  void: 'Void'
};

function renderFlameGraphic(theme, tier, idPrefix = '') {
  const isLegendary = tier.id === 'legendary';
  const isMythic = tier.id === 'mythic';
  const isDormant = tier.id === 'dormant';
  const auraScale = tier.auraScale || 1.0;
  const flameScale = tier.scale || 1.0;

  if (isDormant) {
    return `
      <!-- Dormant Faint Ember -->
      <circle cx="120" cy="148" r="6" fill="#6E7681" opacity="0.6"/>
      <circle cx="120" cy="148" r="3" fill="#8B949E" class="ember-pulse"/>
      <path d="M 120 142 Q 114 125 122 110 T 118 90" fill="none" stroke="#484F58" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.45"/>
    `;
  }

  return `
    <!-- Flame Soft Diffuse Aura Glow -->
    <circle cx="120" cy="135" r="${68 * auraScale}" fill="url(#${idPrefix}auraGlow)" class="flame-aura"/>

    ${(isLegendary || isMythic) ? `
    <!-- Legendary Orbital Energy Ring -->
    <ellipse cx="120" cy="135" rx="72" ry="22" fill="none" stroke="${theme.flame}" stroke-width="1.2" stroke-dasharray="5 7" class="energy-orbit" opacity="0.65"/>
    ` : ''}

    ${isMythic ? `
    <!-- Mythic Luminous Core Sparkle -->
    <circle cx="120" cy="74" r="3.5" fill="#FFFFFF" class="mythic-sparkle"/>
    <circle cx="120" cy="74" r="7" fill="none" stroke="${theme.tip}" stroke-width="1" stroke-dasharray="2 2"/>
    ` : ''}

    <!-- Main Flame Anatomy with Organic Asymmetric Licking Curves -->
    <g transform="translate(120, 140) scale(${flameScale}) translate(-120, -140)">
      <!-- Outer Flame Lick -->
      <path d="M 120 52 
               C 140 80, 166 106, 160 150 
               C 154 182, 94 182, 86 148 
               C 80 118, 102 88, 118 52 Z"
            fill="url(#${idPrefix}outerGrad)"
            class="flame-outer" />

      <!-- Secondary Mid Lick (Asymmetric Sway) -->
      <path d="M 124 66 
               C 148 94, 158 124, 150 154 
               C 142 176, 104 176, 96 152 
               C 90 126, 106 98, 124 66 Z"
            fill="url(#${idPrefix}midGrad)"
            class="flame-mid" />

      <!-- Side Flick Tongue -->
      <path d="M 98 134 
               C 84 110, 92 86, 106 78 
               C 102 100, 110 122, 116 138 Z" 
            fill="${theme.flame}" 
            opacity="0.85" 
            class="flame-lick-left" />

      <!-- Incandescent Luminous Inner Core -->
      <path d="M 120 96 
               C 132 116, 142 136, 136 158 
               C 130 174, 110 174, 104 158 
               C 98 136, 108 116, 120 96 Z"
            fill="url(#${idPrefix}coreGrad)"
            class="flame-core" />

      <!-- White Hot Ignition Point -->
      <ellipse cx="120" cy="150" rx="5" ry="12" fill="#FFFFFF" opacity="0.95" class="core-hotspot" />
    </g>

    <!-- Subtle Ground Ambient Shimmer (No Heavy Pedestal) -->
    <ellipse cx="120" cy="184" rx="38" ry="5" fill="#161B22" opacity="0.6"/>
    <ellipse cx="120" cy="184" rx="22" ry="2.5" fill="${theme.core}" opacity="0.35"/>
  `;
}

function renderEmbers(theme, count = 16) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 137.5) * (Math.PI / 180);
    const radius = 8 + (i % 6) * 5;
    const startX = Math.round(120 + Math.cos(angle) * radius);
    const startY = Math.round(172 - (i % 4) * 10);
    const dur = (1.6 + (i % 5) * 0.3).toFixed(1);
    const delay = ((i % 7) * 0.22).toFixed(2);
    const size = (i % 4 === 0 ? 2.5 : (i % 2 === 0 ? 1.8 : 1.2));
    const color = i % 3 === 0 ? theme.tip : (i % 2 === 0 ? theme.sparks : theme.flame);
    return `<circle cx="${startX}" cy="${startY}" r="${size}" fill="${color}" class="ember" style="animation-duration: ${dur}s; animation-delay: ${delay}s;" />`;
  }).join('\n      ');
}

function render20DayFuelStrip(recentDays, theme) {
  const days = (recentDays || []).slice(-20);
  return days.map((d, idx) => {
    const x = 440 + (idx * 22.5);
    const y = 202;
    const count = d.count || 0;
    let fill = '#161B22';
    if (count >= 100) fill = theme.tip;
    else if (count >= 50) fill = theme.sparks;
    else if (count >= 10) fill = theme.flame;
    else if (count >= 1) fill = theme.core;
    return `<rect x="${x}" y="${y}" width="16" height="8" rx="2" fill="${fill}" />`;
  }).join('\n      ');
}

function buildSingleThemeSvg(stats, themeKey = 'github') {
  const theme = THEMES[themeKey] || THEMES.github;
  const {
    currentStreak,
    longestStreak,
    totalContributions,
    todayContributions,
    tier,
    milestone,
    intensity,
    recentDays
  } = stats;

  const milestoneBarWidth = Math.max(6, Math.min(662, Math.round((milestone.progress / 100) * 662)));
  const flameGraphic = renderFlameGraphic(theme, tier);
  const embers = renderEmbers(theme, 16);
  const fuelStrip = render20DayFuelStrip(recentDays, theme);

  // Theme Pills in Header
  const pillsSvg = THEME_KEYS.map((k, i) => {
    const px = 2 + (i * 48);
    const isAct = (k === themeKey);
    const bg = isAct ? '#21262D' : 'transparent';
    const border = isAct ? theme.flame : 'transparent';
    const fg = isAct ? theme.flame : '#7D8590';
    const fontW = isAct ? '700' : '500';
    return `<rect x="${px}" y="2" width="44" height="22" rx="4" fill="${bg}" stroke="${border}" stroke-width="1"/>
      <text x="${px + 22}" y="16" text-anchor="middle" class="mono" fill="${fg}" font-size="10" font-weight="${fontW}">${THEME_PILL_NAMES[k]}</text>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 240" width="100%" height="100%">
  <defs>
    <!-- Soft Ambient Radial Aura -->
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.flame}" stop-opacity="0.25" />
      <stop offset="60%" stop-color="${theme.core}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>

    <!-- Outer Flame Gradient -->
    <linearGradient id="outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.core}" />
      <stop offset="55%" stop-color="${theme.flame}" />
      <stop offset="100%" stop-color="${theme.sparks}" />
    </linearGradient>

    <!-- Mid Flame Gradient -->
    <linearGradient id="midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.flame}" />
      <stop offset="65%" stop-color="${theme.sparks}" />
      <stop offset="100%" stop-color="${theme.tip}" />
    </linearGradient>

    <!-- Incandescent Core Gradient -->
    <linearGradient id="coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.sparks}" />
      <stop offset="60%" stop-color="${theme.tip}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <!-- Hairline Milestone Progress Gradient -->
    <linearGradient id="milestoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.core}" />
      <stop offset="50%" stop-color="${theme.flame}" />
      <stop offset="100%" stop-color="${theme.sparks}" />
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
        50% { transform: translate(-6px, -36px); opacity: 0.6; }
        100% { transform: translate(5px, -78px); opacity: 0; }
      }
      @keyframes orbitSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes statusPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.15); }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura { transform-origin: 120px 135px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer { transform-origin: 120px 175px; animation: flameOuter 2.4s infinite ease-in-out; }
      .flame-mid { transform-origin: 120px 175px; animation: flameMid 1.8s infinite ease-in-out; }
      .flame-core { transform-origin: 120px 165px; animation: flameCore 1.4s infinite ease-in-out; }
      .flame-lick-left { transform-origin: 106px 130px; animation: flameFlick 2s infinite ease-in-out; }
      .ember { animation: emberFloat 2.2s infinite ease-out; }
      .energy-orbit { transform-origin: 120px 135px; animation: orbitSpin 14s infinite linear; }
      .status-pulse { transform-origin: 32px 24px; animation: statusPulse 2.5s infinite ease-in-out; }
    </style>
  </defs>

  <!-- Clean Background (Minimalist 1px Border, No Harsh Top Bar) -->
  <rect width="920" height="240" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- TOP HEADER BAR                                               -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(0, 0)">
    <!-- Status Dot & Title -->
    <circle cx="32" cy="24" r="3.5" fill="${theme.flame}" class="status-pulse"/>
    <text x="44" y="28" class="mono" fill="#7D8590" font-size="11" font-weight="600" letter-spacing="1.5">GITSTREAK</text>
    <text x="126" y="28" class="mono" fill="#484F58" font-size="11">/ CONTRIBUTION FLAME</text>

    <!-- Top Right 7 Theme Pills (Matching Matrix Header Style) -->
    <g transform="translate(554, 13)">
      <rect x="0" y="0" width="338" height="26" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      ${pillsSvg}
    </g>
  </g>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- LEFT: THE LIVING FLAME HERO                                    -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(0, 0)">
    <!-- Micro Embers -->
    <g>
      ${embers}
    </g>
    <!-- Living Flame Silhouette -->
    ${flameGraphic}
  </g>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- RIGHT: EDITORIAL MINIMALIST STREAK & TELEMETRY ARENA            -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(0, 0)">
    <!-- Hero Streak Counter & Status Row -->
    <g transform="translate(230, 86)">
      <!-- Giant Odometer Number -->
      <text x="0" y="0" class="inter" fill="#F0F6FC" font-size="52" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
      
      <!-- Units & Status Tag -->
      <g transform="translate(${currentStreak >= 10 ? 76 : 42}, 0)">
        <text x="0" y="-20" class="inter" fill="${theme.flame}" font-size="15" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>
        <text x="0" y="-3" class="mono" fill="#8B949E" font-size="11" font-weight="600" letter-spacing="0.8">${tier.name.toUpperCase()} TIER</text>
      </g>

      <!-- Fuel Status Callout -->
      <g transform="translate(410, -20)">
        ${todayContributions > 0 ? `
        <text x="0" y="0" class="mono" fill="#3FB950" font-size="11" font-weight="600">⚡ ${todayContributions} CONTRIBUTIONS TODAY</text>
        <text x="0" y="16" class="mono" fill="#7D8590" font-size="10">Active flame burning for LetMeCodex</text>
        ` : `
        <text x="0" y="0" class="mono" fill="#F59E0B" font-size="11" font-weight="600">⚠️ FLAME NEEDS FUEL</text>
        <text x="0" y="16" class="mono" fill="#7D8590" font-size="10">Push a commit today to keep streak active</text>
        `}
      </g>
    </g>

    <!-- Milestone Tracker & Hairline Progress Bar -->
    <g transform="translate(230, 118)">
      <text x="0" y="0" class="mono" fill="#8B949E" font-size="11">Next Milestone: <tspan fill="#F0F6FC" font-weight="600">${milestone.next} Days</tspan> <tspan fill="#7D8590">(${milestone.daysToGo} days to go)</tspan></text>
      <text x="662" y="0" text-anchor="end" class="mono" fill="${theme.flame}" font-size="11" font-weight="600">${milestone.progress}%</text>

      <!-- Hairline Track -->
      <rect x="0" y="8" width="662" height="3" rx="1.5" fill="#21262D"/>
      <rect x="0" y="8" width="${milestoneBarWidth}" height="3" rx="1.5" fill="url(#milestoneGrad)"/>
    </g>

    <!-- Minimalist Horizontal Telemetry Stats -->
    <g transform="translate(230, 168)" class="inter" font-size="12">
      <text x="0" y="0" fill="#7D8590">Longest Streak: <tspan fill="#F0F6FC" font-weight="600">${longestStreak} Days</tspan></text>
      <text x="180" y="0" fill="#30363D">•</text>
      <text x="198" y="0" fill="#7D8590">Total Contributions: <tspan fill="#F0F6FC" font-weight="600">${totalContributions.toLocaleString()}</tspan></text>
      <text x="430" y="0" fill="#30363D">•</text>
      <text x="448" y="0" fill="#7D8590">Heat Intensity: <tspan fill="${theme.flame}" class="mono" font-weight="600">${Math.round(intensity * 100)}%</tspan></text>
    </g>

    <!-- 20-Day Fuel Energy Strip -->
    <g transform="translate(230, 208)">
      <text x="0" y="-1" class="mono" fill="#484F58" font-size="10" letter-spacing="1">20-DAY FUEL CONNECTOR</text>
      <g transform="translate(-230, -208)">
        ${fuelStrip}
      </g>
    </g>
  </g>
</svg>`;
}

function buildCyclingShowcaseStreakSvg(stats) {
  const {
    currentStreak,
    longestStreak,
    totalContributions,
    todayContributions,
    tier,
    milestone,
    intensity,
    recentDays
  } = stats;

  const milestoneBarWidth = Math.max(6, Math.min(662, Math.round((milestone.progress / 100) * 662)));

  const slices = [
    { key: 'github', start: 0, end: 14.28 },
    { key: 'inferno', start: 14.29, end: 28.57 },
    { key: 'arcane', start: 28.58, end: 42.85 },
    { key: 'cyber', start: 42.86, end: 57.14 },
    { key: 'zen', start: 57.15, end: 71.42 },
    { key: 'legendary', start: 71.43, end: 85.71 },
    { key: 'void', start: 85.72, end: 100.0 }
  ];

  let cycleCss = `
    .cycle-layer { opacity: 0; visibility: hidden; }
  `;

  slices.forEach((s, idx) => {
    const theme = THEMES[s.key];
    const sStart = (s.start).toFixed(2);
    const sMidEnd = (s.end - 0.6).toFixed(2);
    const sEnd = (s.end).toFixed(2);

    cycleCss += `
    .cycle-layer-${idx} { animation: layerCycle${idx} 28s infinite; }
    .spill-bg-${idx} { animation: pillBgCycle${idx} 28s infinite; }
    .spill-txt-${idx} { animation: pillTxtCycle${idx} 28s infinite; }`;

    if (idx === 0) {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 99.2% { opacity: 0; visibility: hidden; }
        100% { opacity: 1; visibility: visible; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${sMidEnd}% { fill: #21262D; stroke: ${theme.flame}; stroke-width: 1px; }
        ${sEnd}%, 99.2% { fill: transparent; stroke: transparent; }
        100% { fill: #21262D; stroke: ${theme.flame}; stroke-width: 1px; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${sMidEnd}% { fill: ${theme.flame}; font-weight: 700; }
        ${sEnd}%, 99.2% { fill: #7D8590; font-weight: 500; }
        100% { fill: ${theme.flame}; font-weight: 700; }
      }`;
    } else if (idx === 6) {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { opacity: 1; visibility: visible; }
        100% { opacity: 0; visibility: hidden; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { fill: transparent; stroke: transparent; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { fill: #21262D; stroke: ${theme.flame}; stroke-width: 1px; }
        100% { fill: transparent; stroke: transparent; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${(slices[idx-1].end).toFixed(2)}% { fill: #7D8590; font-weight: 500; }
        ${(slices[idx-1].end + 0.1).toFixed(2)}%, 99.2% { fill: ${theme.flame}; font-weight: 700; }
        100% { fill: #7D8590; font-weight: 500; }
      }`;
    } else {
      cycleCss += `
      @keyframes layerCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { opacity: 0; visibility: hidden; }
        ${sStart}%, ${sMidEnd}% { opacity: 1; visibility: visible; }
        ${sEnd}%, 100% { opacity: 0; visibility: hidden; }
      }
      @keyframes pillBgCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { fill: transparent; stroke: transparent; }
        ${sStart}%, ${sMidEnd}% { fill: #21262D; stroke: ${theme.flame}; stroke-width: 1px; }
        ${sEnd}%, 100% { fill: transparent; stroke: transparent; }
      }
      @keyframes pillTxtCycle${idx} {
        0%, ${(s.start - 0.1).toFixed(2)}% { fill: #7D8590; font-weight: 500; }
        ${sStart}%, ${sMidEnd}% { fill: ${theme.flame}; font-weight: 700; }
        ${sEnd}%, 100% { fill: #7D8590; font-weight: 500; }
      }`;
    }
  });

  // Build Gradients & Layers for all 7 themes
  let defsContent = '';
  let layersContent = '';

  THEME_KEYS.forEach((tk, idx) => {
    const t = THEMES[tk];
    const prefix = `c${idx}_`;
    defsContent += `
    <radialGradient id="${prefix}auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${t.flame}" stop-opacity="0.25" />
      <stop offset="60%" stop-color="${t.core}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0D1117" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${prefix}outerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${t.core}" />
      <stop offset="55%" stop-color="${t.flame}" />
      <stop offset="100%" stop-color="${t.sparks}" />
    </linearGradient>
    <linearGradient id="${prefix}midGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${t.flame}" />
      <stop offset="65%" stop-color="${t.sparks}" />
      <stop offset="100%" stop-color="${t.tip}" />
    </linearGradient>
    <linearGradient id="${prefix}coreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${t.sparks}" />
      <stop offset="60%" stop-color="${t.tip}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <linearGradient id="${prefix}milestoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.core}" />
      <stop offset="50%" stop-color="${t.flame}" />
      <stop offset="100%" stop-color="${t.sparks}" />
    </linearGradient>
    `;

    const flameG = renderFlameGraphic(t, tier, prefix);
    const embs = renderEmbers(t, 16);
    const fuel = render20DayFuelStrip(recentDays, t);

    layersContent += `
    <!-- Layer ${idx}: ${t.name} -->
    <g class="cycle-layer cycle-layer-${idx}">
      <!-- Header Status Pip -->
      <circle cx="32" cy="24" r="3.5" fill="${t.flame}" class="status-pulse"/>
      
      <!-- Flame Stage -->
      <g>
        ${embs}
      </g>
      ${flameG}

      <!-- Dynamic Text Colors -->
      <text x="${currentStreak >= 10 ? 306 : 272}" y="66" class="inter" fill="${t.flame}" font-size="15" font-weight="700" letter-spacing="0.5">DAYS STREAK</text>
      <text x="892" y="118" text-anchor="end" class="mono" fill="${t.flame}" font-size="11" font-weight="600">${milestone.progress}%</text>
      <rect x="230" y="126" width="${milestoneBarWidth}" height="3" rx="1.5" fill="url(#${prefix}milestoneGrad)"/>
      <text x="678" y="168" fill="${t.flame}" class="mono" font-weight="600">${Math.round(intensity * 100)}%</text>

      <!-- 20-Day Fuel -->
      <g transform="translate(0, 0)">
        ${fuel}
      </g>
    </g>
    `;
  });

  // Pills with cycle classes
  const cyclePillsSvg = THEME_KEYS.map((k, i) => {
    const px = 2 + (i * 48);
    return `<rect x="${px}" y="2" width="44" height="22" rx="4" class="spill-bg spill-bg-${i}" fill="transparent"/>
      <text x="${px + 22}" y="16" text-anchor="middle" class="mono spill-txt spill-txt-${i}" fill="#7D8590" font-size="10">${THEME_PILL_NAMES[k]}</text>`;
  }).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 240" width="100%" height="100%">
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
        50% { transform: translate(-6px, -36px); opacity: 0.6; }
        100% { transform: translate(5px, -78px); opacity: 0; }
      }
      @keyframes orbitSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes statusPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.15); }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura { transform-origin: 120px 135px; animation: auraBreath 3s infinite ease-in-out; }
      .flame-outer { transform-origin: 120px 175px; animation: flameOuter 2.4s infinite ease-in-out; }
      .flame-mid { transform-origin: 120px 175px; animation: flameMid 1.8s infinite ease-in-out; }
      .flame-core { transform-origin: 120px 165px; animation: flameCore 1.4s infinite ease-in-out; }
      .flame-lick-left { transform-origin: 106px 130px; animation: flameFlick 2s infinite ease-in-out; }
      .ember { animation: emberFloat 2.2s infinite ease-out; }
      .energy-orbit { transform-origin: 120px 135px; animation: orbitSpin 14s infinite linear; }
      .status-pulse { transform-origin: 32px 24px; animation: statusPulse 2.5s infinite ease-in-out; }

      ${cycleCss}
    </style>
  </defs>

  <!-- Clean Minimalist Background -->
  <rect width="920" height="240" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1"/>

  <!-- Static Persistent Base Content -->
  <g transform="translate(0, 0)">
    <!-- Header Title -->
    <text x="44" y="28" class="mono" fill="#7D8590" font-size="11" font-weight="600" letter-spacing="1.5">GITSTREAK</text>
    <text x="126" y="28" class="mono" fill="#484F58" font-size="11">/ CONTRIBUTION FLAME</text>

    <!-- Header Pills Container -->
    <g transform="translate(554, 13)">
      <rect x="0" y="0" width="338" height="26" rx="6" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      ${cyclePillsSvg}
    </g>

    <!-- Streak Number & Tier Base -->
    <text x="230" y="86" class="inter" fill="#F0F6FC" font-size="52" font-weight="800" letter-spacing="-1.5">${currentStreak}</text>
    <text x="${currentStreak >= 10 ? 306 : 272}" y="83" class="mono" fill="#8B949E" font-size="11" font-weight="600" letter-spacing="0.8">${tier.name.toUpperCase()} TIER</text>

    <!-- Today's Fuel Base Callout -->
    <g transform="translate(640, 66)">
      ${todayContributions > 0 ? `
      <text x="0" y="0" class="mono" fill="#3FB950" font-size="11" font-weight="600">⚡ ${todayContributions} CONTRIBUTIONS TODAY</text>
      <text x="0" y="16" class="mono" fill="#7D8590" font-size="10">Active flame burning for LetMeCodex</text>
      ` : `
      <text x="0" y="0" class="mono" fill="#F59E0B" font-size="11" font-weight="600">⚠️ FLAME NEEDS FUEL</text>
      <text x="0" y="16" class="mono" fill="#7D8590" font-size="10">Push a commit today to keep streak active</text>
      `}
    </g>

    <!-- Milestone Tracker Base -->
    <g transform="translate(230, 118)">
      <text x="0" y="0" class="mono" fill="#8B949E" font-size="11">Next Milestone: <tspan fill="#F0F6FC" font-weight="600">${milestone.next} Days</tspan> <tspan fill="#7D8590">(${milestone.daysToGo} days to go)</tspan></text>
      <rect x="0" y="8" width="662" height="3" rx="1.5" fill="#21262D"/>
    </g>

    <!-- Telemetry Persistent Base -->
    <g transform="translate(230, 168)" class="inter" font-size="12">
      <text x="0" y="0" fill="#7D8590">Longest Streak: <tspan fill="#F0F6FC" font-weight="600">${longestStreak} Days</tspan></text>
      <text x="180" y="0" fill="#30363D">•</text>
      <text x="198" y="0" fill="#7D8590">Total Contributions: <tspan fill="#F0F6FC" font-weight="600">${totalContributions.toLocaleString()}</tspan></text>
      <text x="430" y="0" fill="#30363D">•</text>
      <text x="448" y="0" fill="#7D8590">Heat Intensity:</text>
    </g>

    <!-- Fuel Connector Label -->
    <text x="230" y="207" class="mono" fill="#484F58" font-size="10" letter-spacing="1">20-DAY FUEL CONNECTOR</text>
  </g>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- 7 DYNAMIC CONTINUOUS AUTO-CYCLE THEME LAYERS                   -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  ${layersContent}
</svg>`;
}

async function main() {
  const args = process.argv.slice(2);
  const isCycle = args.includes('--cycle') || (!args.some(a => a.startsWith('--theme=')));
  let themeArg = 'github';
  const tFind = args.find(a => a.startsWith('--theme='));
  if (tFind) themeArg = tFind.split('=')[1];

  let forcedStreak = null;
  const sFind = args.find(a => a.startsWith('--streak='));
  if (sFind) forcedStreak = parseInt(sFind.split('=')[1], 10);

  const rawData = await fetchLetMeCodexContributions();
  const stats = calculateStreakData(rawData);

  if (forcedStreak !== null) {
    stats.currentStreak = forcedStreak;
    stats.tier = TIERS.find(t => forcedStreak >= t.min && forcedStreak <= t.max) || TIERS[0];
    const nextMilestone = MILESTONES.find(m => m > forcedStreak) || 500;
    const prevMilestone = [...MILESTONES].reverse().find(m => m <= forcedStreak) || 0;
    stats.milestone = {
      next: nextMilestone,
      prev: prevMilestone,
      progress: Math.min(100, Math.round(((forcedStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)),
      daysToGo: nextMilestone - forcedStreak
    };
  }

  // 1. Generate all individual theme SVG files
  THEME_KEYS.forEach(tk => {
    const singleSvg = buildSingleThemeSvg(stats, tk);
    const fname = `git-streak-${tk}.svg`;
    fs.writeFileSync(path.join(__dirname, `../assets/${fname}`), singleSvg, 'utf8');
    console.log(`[+] Generated theme file -> assets/${fname}`);
  });

  // 2. Generate the main git-streak.svg
  if (isCycle && !tFind) {
    const cycleSvg = buildCyclingShowcaseStreakSvg(stats);
    fs.writeFileSync(path.join(__dirname, '../assets/git-streak.svg'), cycleSvg, 'utf8');
    console.log(`[+] Generated dynamic 7-theme auto-morph cycling showcase -> assets/git-streak.svg`);
  } else {
    const singleSvg = buildSingleThemeSvg(stats, themeArg);
    fs.writeFileSync(path.join(__dirname, '../assets/git-streak.svg'), singleSvg, 'utf8');
    console.log(`[+] Generated active theme -> assets/git-streak.svg (${themeArg})`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildSingleThemeSvg,
  buildCyclingShowcaseStreakSvg
};
