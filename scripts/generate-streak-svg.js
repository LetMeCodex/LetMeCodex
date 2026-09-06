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

function buildStreakSvg(stats, themeKey = 'github') {
  const theme = THEMES[themeKey] || THEMES.github;
  const {
    currentStreak,
    longestStreak,
    totalContributions,
    todayContributions,
    streakActive,
    streakStatus,
    tier,
    milestone,
    intensity,
    recentDays
  } = stats;

  const isDormant = tier.id === 'dormant';
  const isSpark = tier.id === 'spark';
  const isFlame = tier.id === 'flame';
  const isHot = tier.id === 'hot';
  const isBlaze = tier.id === 'blaze';
  const isInferno = tier.id === 'inferno';
  const isLegendary = tier.id === 'legendary';
  const isMythic = tier.id === 'mythic';

  // Flame scale and turbulence based on tier
  const flameScale = tier.scale || 1.0;
  const auraScale = tier.auraScale || 1.0;

  // Particle Generation
  const particleCount = tier.particleCount || 18;
  const embers = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i * 137.5) * (Math.PI / 180);
    const radius = 10 + (i % 6) * 6;
    const startX = Math.round(150 + Math.cos(angle) * radius);
    const startY = Math.round(180 - (i % 4) * 12);
    const dur = (1.4 + (i % 5) * 0.3).toFixed(1);
    const delay = ((i % 7) * 0.25).toFixed(2);
    const size = (i % 4 === 0 ? 3 : (i % 2 === 0 ? 2 : 1.5));
    const color = i % 3 === 0 ? theme.tip : (i % 2 === 0 ? theme.sparks : theme.flame);
    return `<circle cx="${startX}" cy="${startY}" r="${size}" fill="${color}" class="ember ember-${i % 6}" style="animation-duration: ${dur}s; animation-delay: ${delay}s;" />`;
  }).join('\n      ');

  // Mini Contribution Energy Strip (last 20 days)
  const miniCells = (recentDays || []).slice(-20).map((d, idx) => {
    const x = 640 + (idx * 11.5);
    const y = 224;
    const count = d.count || 0;
    let fill = '#161B22';
    if (count >= 100) fill = theme.tip;
    else if (count >= 50) fill = theme.sparks;
    else if (count >= 10) fill = theme.flame;
    else if (count >= 1) fill = theme.core;
    return `<rect x="${x}" y="${y}" width="9" height="12" rx="2" fill="${fill}" />`;
  }).join('\n      ');

  // Milestone Progress Width (max 220px)
  const milestoneBarWidth = Math.max(8, Math.min(220, Math.round((milestone.progress / 100) * 220)));

  // Flame Shape Variants
  // If dormant: tiny ember and smoke
  let flameGraphic = '';
  if (isDormant) {
    flameGraphic = `
      <!-- Dormant Ember -->
      <circle cx="150" cy="180" r="8" fill="#78350F" opacity="0.8"/>
      <circle cx="150" cy="180" r="4" fill="#F59E0B" class="core-pulse"/>
      <!-- Drifting Smoke Wisps -->
      <path d="M 150 170 Q 142 145 152 125 T 148 100" fill="none" stroke="#4B5563" stroke-width="1.8" stroke-dasharray="4 4" class="smoke-wisp" opacity="0.5"/>
      <path d="M 152 168 Q 158 140 148 118 T 154 95" fill="none" stroke="#6B7280" stroke-width="1.4" stroke-dasharray="3 3" class="smoke-wisp-2" opacity="0.4"/>
    `;
  } else {
    // Active Living Flame Silhouette
    flameGraphic = `
      <!-- Flame Radiant Aura -->
      <circle cx="150" cy="148" r="${65 * auraScale}" fill="url(#auraGlow)" class="flame-aura"/>

      ${(isLegendary || isMythic) ? `
      <!-- Legendary Energy Orbit Ring -->
      <circle cx="150" cy="148" r="74" fill="none" stroke="${theme.flame}" stroke-width="1.2" stroke-dasharray="6 8" class="energy-orbit" opacity="0.7"/>
      <circle cx="150" cy="148" r="84" fill="none" stroke="${theme.sparks}" stroke-width="0.8" stroke-dasharray="3 9" class="energy-orbit-rev" opacity="0.5"/>
      ` : ''}

      ${isMythic ? `
      <!-- Mythic Git Node Network -->
      <g class="mythic-nodes" opacity="0.75">
        <circle cx="85" cy="148" r="4" fill="${theme.tip}"/>
        <line x1="89" y1="148" x2="110" y2="148" stroke="${theme.sparks}" stroke-width="1" stroke-dasharray="2 2"/>
        <circle cx="215" cy="148" r="4" fill="${theme.tip}"/>
        <line x1="190" y1="148" x2="211" y2="148" stroke="${theme.sparks}" stroke-width="1" stroke-dasharray="2 2"/>
        <circle cx="150" cy="65" r="4" fill="${theme.tip}"/>
        <line x1="150" y1="69" x2="150" y2="90" stroke="${theme.sparks}" stroke-width="1" stroke-dasharray="2 2"/>
      </g>
      ` : ''}

      <!-- Outer Flame Body (Licking tongues) -->
      <g transform="translate(150, 155) scale(${flameScale}) translate(-150, -155)">
        <!-- Layer 1: Outer Tongue (Broad Body) -->
        <path d="M 150 78 
                 C 178 108, 195 138, 185 174 
                 C 176 205, 124 205, 115 174 
                 C 105 138, 122 108, 150 78 Z"
              fill="url(#outerFlameGrad)"
              class="flame-outer" />

        <!-- Layer 2: Secondary Tongue Flick (Left/Right Motion) -->
        <path d="M 152 88 
                 C 172 115, 186 142, 176 170 
                 C 168 194, 130 194, 124 170 
                 C 116 140, 132 115, 152 88 Z"
              fill="url(#midFlameGrad)"
              class="flame-mid" />

        ${(isInferno || isLegendary || isMythic) ? `
        <!-- Inferno Triple Tongue Flare -->
        <path d="M 125 150 C 110 130, 118 110, 132 100 C 128 120, 135 140, 140 155 Z" fill="${theme.flame}" opacity="0.8" class="flame-lick-left"/>
        <path d="M 175 150 C 190 130, 182 110, 168 100 C 172 120, 165 140, 160 155 Z" fill="${theme.flame}" opacity="0.8" class="flame-lick-right"/>
        ` : ''}

        <!-- Layer 3: Inner Core (Incandescent Heart) -->
        <path d="M 150 115 
                 C 162 135, 170 152, 164 172 
                 C 158 188, 142 188, 136 172 
                 C 130 152, 138 135, 150 115 Z"
              fill="url(#innerCoreGrad)"
              class="flame-core" />
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 280" width="100%" height="100%">
  <defs>
    <!-- Aura Radial Gradient -->
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.flame}" stop-opacity="0.38" />
      <stop offset="60%" stop-color="${theme.core}" stop-opacity="0.14" />
      <stop offset="100%" stop-color="${theme.core}" stop-opacity="0" />
    </radialGradient>

    <!-- Outer Flame Linear Gradient -->
    <linearGradient id="outerFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.core}" />
      <stop offset="55%" stop-color="${theme.flame}" />
      <stop offset="100%" stop-color="${theme.sparks}" />
    </linearGradient>

    <!-- Mid Flame Linear Gradient -->
    <linearGradient id="midFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.flame}" />
      <stop offset="65%" stop-color="${theme.sparks}" />
      <stop offset="100%" stop-color="${theme.tip}" />
    </linearGradient>

    <!-- Inner Core Radiant Gradient -->
    <linearGradient id="innerCoreGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${theme.sparks}" />
      <stop offset="70%" stop-color="${theme.tip}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <!-- Milestone Progress Gradient -->
    <linearGradient id="milestoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.core}" />
      <stop offset="70%" stop-color="${theme.flame}" />
      <stop offset="100%" stop-color="${theme.sparks}" />
    </linearGradient>

    <style>
      @keyframes flameAuraBreath {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.12); opacity: 1; }
      }
      @keyframes flameOuterWiggle {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        25% { transform: scaleY(1.04) skewX(2deg); }
        50% { transform: scaleY(0.97) skewX(-1.5deg); }
        75% { transform: scaleY(1.03) skewX(1deg); }
      }
      @keyframes flameMidWiggle {
        0%, 100% { transform: scaleY(1) skewX(0deg); }
        30% { transform: scaleY(0.96) skewX(-2deg); }
        70% { transform: scaleY(1.05) skewX(2deg); }
      }
      @keyframes flameCorePulse {
        0%, 100% { transform: scale(1); opacity: 0.95; }
        50% { transform: scale(1.08); opacity: 1; filter: brightness(1.25); }
      }
      @keyframes emberFloat {
        0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
        50% { transform: translate(-8px, -45px) scale(1.2); opacity: 0.7; }
        100% { transform: translate(6px, -95px) scale(0.4); opacity: 0; }
      }
      @keyframes smokeDrift {
        0% { transform: translateY(0) scaleX(1); opacity: 0.4; }
        50% { transform: translateY(-30px) scaleX(1.3); opacity: 0.25; }
        100% { transform: translateY(-65px) scaleX(1.6); opacity: 0; }
      }
      @keyframes orbitSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes orbitSpinRev {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes badgePulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }

      .flame-aura { transform-origin: 150px 148px; animation: flameAuraBreath 2.8s infinite ease-in-out; }
      .flame-outer { transform-origin: 150px 185px; animation: flameOuterWiggle 2.2s infinite ease-in-out; }
      .flame-mid { transform-origin: 150px 185px; animation: flameMidWiggle 1.7s infinite ease-in-out; }
      .flame-core { transform-origin: 150px 172px; animation: flameCorePulse 1.3s infinite ease-in-out; }
      
      .flame-lick-left { transform-origin: 135px 150px; animation: flameMidWiggle 1.5s infinite ease-in-out; }
      .flame-lick-right { transform-origin: 165px 150px; animation: flameOuterWiggle 1.9s infinite ease-in-out; }

      .ember { animation: emberFloat infinite ease-out; }
      .smoke-wisp { animation: smokeDrift 4s infinite linear; }
      .smoke-wisp-2 { animation: smokeDrift 3.5s infinite linear; animation-delay: 1.5s; }

      .energy-orbit { transform-origin: 150px 148px; animation: orbitSpin 16s infinite linear; }
      .energy-orbit-rev { transform-origin: 150px 148px; animation: orbitSpinRev 12s infinite linear; }
      .badge-glow { animation: badgePulse 2.5s infinite ease-in-out; }
    </style>
  </defs>

  <!-- Container Box -->
  <rect width="920" height="280" rx="8" fill="#0D1117" stroke="#30363D" stroke-width="1.2"/>

  <!-- Subtle Accent Edge Line -->
  <line x1="2" y1="2" x2="918" y2="2" stroke="${theme.flame}" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- LEFT: THE LIVING FLAME HERO                                    -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(0, 0)">
    <!-- Particles Layer -->
    <g>
      ${embers}
    </g>

    <!-- Flame Graphics Hierarchy -->
    ${flameGraphic}

    <!-- Flame Base Pedestal Grid -->
    <ellipse cx="150" cy="196" rx="42" ry="7" fill="#161B22" stroke="#21262D" stroke-width="1"/>
    <ellipse cx="150" cy="196" rx="28" ry="4" fill="${theme.core}" opacity="0.35"/>
  </g>

  <!-- Vertical Divider 1 -->
  <line x1="300" y1="24" x2="300" y2="256" stroke="#21262D" stroke-width="1"/>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- CENTER: DUOLINGO-INSPIRED GAMIFIED STREAK HERO                 -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(325, 34)">
    <!-- Header Tag Badge -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="168" height="24" rx="12" fill="#161B22" stroke="#30363D" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="${theme.flame}" class="badge-glow"/>
      <text x="24" y="16" class="mono" fill="#F0F6FC" font-size="10" font-weight="700" letter-spacing="1">GITSTREAK ENGINE</text>
    </g>

    <!-- Large Streak Counter -->
    <g transform="translate(0, 72)">
      <text x="0" y="0" class="inter" fill="#F0F6FC" font-size="68" font-weight="900" letter-spacing="-2">${currentStreak}</text>
      <text x="${currentStreak >= 10 ? 98 : 55}" y="-26" class="inter" fill="${theme.flame}" font-size="20" font-weight="800">DAYS</text>
      <text x="${currentStreak >= 10 ? 98 : 55}" y="-5" class="mono" fill="#7D8590" font-size="12" font-weight="600" letter-spacing="1">STREAK</text>
    </g>

    <!-- Tier & Status Pill -->
    <g transform="translate(0, 108)">
      <rect x="0" y="0" width="180" height="26" rx="13" fill="${theme.core}26" stroke="${theme.flame}" stroke-width="1.2"/>
      <text x="90" y="17" text-anchor="middle" class="mono" fill="${theme.tip}" font-size="11" font-weight="700" letter-spacing="0.5">🔥 ${tier.name.toUpperCase()} TIER</text>
    </g>

    <!-- Fuel Status Callout -->
    <g transform="translate(0, 160)">
      ${todayContributions > 0 ? `
      <text x="0" y="0" class="inter" fill="#3FB950" font-size="13" font-weight="600">⚡ ${todayContributions} contributions fueled today</text>
      <text x="0" y="20" class="inter" fill="#7D8590" font-size="11">• Flame burning bright for LetMeCodex</text>
      ` : `
      <text x="0" y="0" class="inter" fill="#F59E0B" font-size="13" font-weight="600">⚠️ Flame is hungry</text>
      <text x="0" y="20" class="inter" fill="#7D8590" font-size="11">• Push a commit today to keep streak active!</text>
      `}
    </g>
  </g>

  <!-- Vertical Divider 2 -->
  <line x1="605" y1="24" x2="605" y2="256" stroke="#21262D" stroke-width="1"/>

  <!-- ══════════════════════════════════════════════════════════════ -->
  <!-- RIGHT: TELEMETRY CRUCIBLE & HEATMAP CONNECTOR                 -->
  <!-- ══════════════════════════════════════════════════════════════ -->
  <g transform="translate(630, 34)">
    <!-- Milestone Progress Card -->
    <g transform="translate(0, 0)">
      <text x="0" y="12" class="mono" fill="#7D8590" font-size="11" font-weight="600" letter-spacing="1">NEXT MILESTONE</text>
      <text x="240" y="12" text-anchor="end" class="mono" fill="${theme.flame}" font-size="12" font-weight="700">${milestone.next} Days (${milestone.daysToGo} to go)</text>

      <!-- Progress Track -->
      <g transform="translate(0, 24)">
        <rect x="0" y="0" width="240" height="8" rx="4" fill="#161B22" stroke="#21262D" stroke-width="1"/>
        <rect x="0" y="0" width="${milestoneBarWidth}" height="8" rx="4" fill="url(#milestoneGrad)"/>
      </g>
    </g>

    <!-- Stats Table Grid -->
    <g transform="translate(0, 68)" class="inter" font-size="12">
      <!-- Longest Streak -->
      <g transform="translate(0, 0)">
        <text x="0" y="0" fill="#7D8590">Longest Streak</text>
        <text x="240" y="0" text-anchor="end" fill="#F0F6FC" font-weight="700">${longestStreak} Days</text>
        <line x1="0" y1="12" x2="240" y2="12" stroke="#21262D" stroke-width="1"/>
      </g>

      <!-- Total Contributions -->
      <g transform="translate(0, 32)">
        <text x="0" y="0" fill="#7D8590">Total Contributions</text>
        <text x="240" y="0" text-anchor="end" fill="#F0F6FC" font-weight="700">${totalContributions.toLocaleString()}</text>
        <line x1="0" y1="12" x2="240" y2="12" stroke="#21262D" stroke-width="1"/>
      </g>

      <!-- Intensity Factor -->
      <g transform="translate(0, 64)">
        <text x="0" y="0" fill="#7D8590">Heat Intensity</text>
        <text x="240" y="0" text-anchor="end" class="mono" fill="${theme.sparks}" font-weight="700">${Math.round(intensity * 100)}%</text>
        <line x1="0" y1="12" x2="240" y2="12" stroke="#21262D" stroke-width="1"/>
      </g>
    </g>

    <!-- Miniature Heatmap Energy Strip (Feeding toward flame) -->
    <g transform="translate(0, 160)">
      <text x="0" y="12" class="mono" fill="#7D8590" font-size="10" font-weight="600" letter-spacing="1">ENERGY CONNECTOR</text>
      <text x="240" y="12" text-anchor="end" class="mono" fill="${theme.flame}" font-size="10">20-DAY FUEL</text>

      <!-- 20 Recent Days Bars -->
      <g transform="translate(-640, -42)">
        ${miniCells}
      </g>
    </g>
  </g>
</svg>`;

  return svg.replace(/<!--(.*?)-->/gs, (match) => match.replace(/&/g, 'and'));
}

async function main() {
  const args = process.argv.slice(2);
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

  const svgContent = buildStreakSvg(stats, themeArg);
  const outPath = path.join(__dirname, '../assets/git-streak.svg');
  fs.writeFileSync(outPath, svgContent, 'utf8');
  console.log(`[+] Generated GitStreak SVG -> ${outPath} (${stats.currentStreak} Days, Tier: ${stats.tier.name}, Theme: ${themeArg})`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildStreakSvg
};
