const fs = require('fs');
const path = require('path');

const DAYS = [
  {
    day: 'Sunday',
    themeName: 'MATRIX REBOOT // SEED PROTOCOL',
    color: '#00ff66',
    secondary: '#052e16',
    accent: '#86efac',
    quote: '"The Matrix is everywhere. It is all around us."',
    easterEgg: '🐰 Secret: Follow the white rabbit down the terminal rabbit hole.',
    badge: 'STAGE 0: AWAKENING',
    speed: '4s',
  },
  {
    day: 'Monday',
    themeName: 'OVERCLOCK OVERDRIVE // NEON PROTOCOL',
    color: '#a855f7',
    secondary: '#3b0764',
    accent: '#d8b4fe',
    quote: '"I can only show you the door. You have to walk through it."',
    easterEgg: '🕹️ Konami Code Active: [UP, UP, DOWN, DOWN, LEFT, RIGHT, B, A]',
    badge: 'STAGE 1: OVERCLOCKED',
    speed: '2.5s',
  },
  {
    day: 'Tuesday',
    themeName: 'QUANTUM SHADER // NEXUS GRID',
    color: '#06b6d4',
    secondary: '#083344',
    accent: '#67e8f9',
    quote: '"Déjà vu is usually a glitch in the Matrix. It happens when they change something."',
    easterEgg: '⚡ Shader Uniform: uTime = 1337.0; gl_FragColor = vec4(CYAN, 1.0);',
    badge: 'STAGE 2: QUANTUM FLUX',
    speed: '3s',
  },
  {
    day: 'Wednesday',
    themeName: 'HOLOGRAPHIC CHOREOGRAPHY // THEATRE MATRIX',
    color: '#f59e0b',
    secondary: '#451a03',
    accent: '#fde68a',
    quote: '"You take the blue pill, the story ends. You take the red pill, you stay in Wonderland."',
    easterEgg: '💊 Red Pill Swallowed: Neural bypass active.',
    badge: 'STAGE 3: CHOREOGRAPHED',
    speed: '3.5s',
  },
  {
    day: 'Thursday',
    themeName: 'AUDIO KINETIC // SYNTH WAVEFORM',
    color: '#ec4899',
    secondary: '#500724',
    accent: '#fbcfe8',
    quote: '"Hear that, Mr. Anderson? That is the sound of inevitability."',
    easterEgg: '🎵 Tone.js Sub-Bass Oscillation: 432 Hz Solfeggio Matrix.',
    badge: 'STAGE 4: HARMONIC',
    speed: '1.8s',
  },
  {
    day: 'Friday',
    themeName: 'ZERO-DAY RECON // PRODUCTION OVERRIDE',
    color: '#ef4444',
    secondary: '#450a0a',
    accent: '#fca5a5',
    quote: '"There is a difference between knowing the path and walking the path."',
    easterEgg: '🚀 Root Access Granted: chmod +x reality.sh && ./reality.sh',
    badge: 'STAGE 5: ZERO-DAY PUSH',
    speed: '1.5s',
  },
  {
    day: 'Saturday',
    themeName: 'GOD-TIER ARCHITECT // NEO CONSTRUCT',
    color: '#10b981',
    secondary: '#064e3b',
    accent: '#6ee7b7',
    quote: '"Do not try and bend the spoon, that\'s impossible. Instead, only try to realize the truth: There is no spoon."',
    easterEgg: '🥄 Spoon.exe NOT FOUND: Reality is client-side rendered.',
    badge: 'STAGE 6: CONSTRUCT ARCHITECT',
    speed: '5s',
  }
];

const now = new Date();
const dayIndex = now.getDay();
const dayData = DAYS[dayIndex];

const dateString = now.toISOString().split('T')[0];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 260" width="100%" height="100%">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05080f"/>
      <stop offset="60%" stop-color="${dayData.secondary}"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>

    <filter id="neonPulse" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <style>
      @keyframes radarSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes barPulse { 0%, 100% { height: 8px; } 50% { height: 42px; } }
      @keyframes glitchText { 0%, 95%, 100% { transform: none; } 96% { transform: skewX(-6deg); } 98% { transform: skewX(6deg); } }
      @keyframes blinkBeacon { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

      .radar-arm { transform-origin: 80px 130px; animation: radarSweep ${dayData.speed} infinite linear; }
      .bar-anim { animation: barPulse 1.2s infinite ease-in-out alternate; }
      .text-glitch { animation: glitchText 6s infinite ease; }
      .beacon { animation: blinkBeacon 1.5s infinite ease-in-out; }
      .matrix-font { font-family: 'Consolas', 'Courier New', monospace; }
    </style>
  </defs>

  <!-- Base Card -->
  <rect width="850" height="260" rx="16" fill="url(#cardGrad)" stroke="${dayData.color}" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- Radar HUD Circle -->
  <g transform="translate(10, 0)">
    <circle cx="80" cy="130" r="50" fill="none" stroke="${dayData.color}" stroke-opacity="0.25" stroke-dasharray="3 3"/>
    <circle cx="80" cy="130" r="32" fill="none" stroke="${dayData.color}" stroke-opacity="0.35"/>
    <circle cx="80" cy="130" r="14" fill="none" stroke="${dayData.color}" stroke-opacity="0.5"/>
    <circle cx="80" cy="130" r="3" fill="${dayData.color}" filter="url(#neonPulse)"/>
    <!-- Radar Arm -->
    <line x1="80" y1="130" x2="130" y2="130" stroke="${dayData.color}" stroke-width="2" class="radar-arm"/>
  </g>

  <!-- Header & Live Tag -->
  <g transform="translate(160, 45)">
    <rect width="180" height="24" rx="6" fill="${dayData.color}" fill-opacity="0.15" stroke="${dayData.color}" stroke-width="1"/>
    <circle cx="12" cy="12" r="4" fill="${dayData.color}" class="beacon"/>
    <text x="24" y="16" class="matrix-font" fill="${dayData.accent}" font-size="10" font-weight="bold">${dayData.badge}</text>
    
    <text x="520" y="16" text-anchor="end" class="matrix-font" fill="#64748b" font-size="11">DATE: ${dateString} // ${dayData.day.toUpperCase()}</text>
  </g>

  <!-- Title Mode -->
  <g transform="translate(160, 100)">
    <text x="0" y="0" class="matrix-font text-glitch" fill="#ffffff" font-size="22" font-weight="900" letter-spacing="1">
      ${dayData.themeName}
    </text>
    <text x="0" y="24" class="matrix-font" fill="${dayData.accent}" font-size="12" font-style="italic">
      ${dayData.quote}
    </text>
  </g>

  <!-- Easter Egg Box -->
  <g transform="translate(160, 155)">
    <rect width="520" height="42" rx="8" fill="#010308" stroke="${dayData.color}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="16" y="26" class="matrix-font" fill="${dayData.color}" font-size="12" font-weight="bold">
      ${dayData.easterEgg}
    </text>
  </g>

  <!-- Interactive Equalizer Bars -->
  <g transform="translate(710, 197)" fill="${dayData.color}">
    <rect x="0" y="-8" width="5" height="15" rx="2" class="bar-anim" style="animation-delay: 0.1s"/>
    <rect x="10" y="-14" width="5" height="25" rx="2" class="bar-anim" style="animation-delay: 0.4s"/>
    <rect x="20" y="-22" width="5" height="35" rx="2" class="bar-anim" style="animation-delay: 0.2s"/>
    <rect x="30" y="-30" width="5" height="45" rx="2" class="bar-anim" style="animation-delay: 0.6s"/>
    <rect x="40" y="-18" width="5" height="28" rx="2" class="bar-anim" style="animation-delay: 0.3s"/>
    <rect x="50" y="-10" width="5" height="18" rx="2" class="bar-anim" style="animation-delay: 0.5s"/>
    <rect x="60" y="-4" width="5" height="12" rx="2" class="bar-anim" style="animation-delay: 0.7s"/>
  </g>

  <!-- Bottom Metric Line -->
  <text x="160" y="232" class="matrix-font" fill="#475569" font-size="10">
    ⚡ PROTOCOL ROTATION: AUTOMATED VIA GITHUB ACTIONS CRON · NEXT SHIFT IN 24H
  </text>
</svg>`;

const outputPath = path.join(__dirname, '../assets/daily-matrix-status.svg');
fs.writeFileSync(outputPath, svgContent, 'utf8');
console.log(`[+] Successfully generated daily matrix status for ${dayData.day} -> ${outputPath}`);
