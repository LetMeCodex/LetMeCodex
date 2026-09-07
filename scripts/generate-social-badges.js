const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'socials');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. LINKEDIN BADGE
const linkedinSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 42" width="155" height="42">
  <defs>
    <linearGradient id="bgIn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1b30" />
      <stop offset="100%" stop-color="#050e1a" />
    </linearGradient>
    <linearGradient id="borderIn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a66c2" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0a66c2" />
    </linearGradient>
    <filter id="glowIn">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0a66c2" flood-opacity="0.35" />
    </filter>
  </defs>

  <style>
    /* <![CDATA[ */
    @keyframes iBeacon {
      0%, 100% { transform: scale(1); fill: #0a66c2; }
      50% { transform: scale(1.35); fill: #38bdf8; filter: drop-shadow(0 0 4px #38bdf8); }
    }
    @keyframes radioWave {
      0% { r: 3; opacity: 0.9; stroke-width: 1.5; }
      100% { r: 10; opacity: 0; stroke-width: 0.5; }
    }
    @keyframes borderSweep {
      0%, 100% { stroke-opacity: 0.5; }
      50% { stroke-opacity: 1; }
    }
    .anim-i-dot {
      animation: iBeacon 2s ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .anim-wave {
      animation: radioWave 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
    }
    .anim-border {
      animation: borderSweep 3s ease-in-out infinite;
    }
    /* ]]> */
  </style>

  <!-- Button Chassis -->
  <rect x="1" y="1" width="153" height="40" rx="9" fill="url(#bgIn)" stroke="url(#borderIn)" stroke-width="1.6" class="anim-border" filter="url(#glowIn)" />

  <!-- LinkedIn Icon -->
  <g transform="translate(14, 9)">
    <!-- Blue Box -->
    <rect width="24" height="24" rx="5" fill="#0a66c2" />
    
    <!-- Letter 'in' -->
    <!-- 'i' stem and dot -->
    <line x1="7" y1="11" x2="7" y2="19" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
    
    <!-- Radio signal wave radiating from dot -->
    <circle cx="7" cy="6.5" r="3" fill="none" stroke="#60a5fa" class="anim-wave" />
    <circle cx="7" cy="6.5" r="1.8" fill="#ffffff" class="anim-i-dot" />

    <!-- 'n' shape -->
    <path d="M 12 19 L 12 11 M 12 14 C 12 11.5, 14 11, 16 11 C 18 11, 19 12.5, 19 14.5 L 19 19" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Label -->
  <text x="50" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#e0f2fe">LINKEDIN</text>
</svg>`;

// 2. X BADGE
const xSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115 42" width="115" height="42">
  <defs>
    <linearGradient id="bgX" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141417" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="glintGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#52525b" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#52525b" />
    </linearGradient>
    <filter id="glowX">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.15" />
    </filter>
  </defs>

  <style>
    /* <![CDATA[ */
    @keyframes glintSweep {
      0% { stroke-dashoffset: 48; opacity: 0.3; }
      50% { stroke-dashoffset: 0; opacity: 1; filter: drop-shadow(0 0 5px #ffffff); }
      100% { stroke-dashoffset: -48; opacity: 0.3; }
    }
    @keyframes xPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    .anim-glint {
      stroke-dasharray: 20, 28;
      animation: glintSweep 3s ease-in-out infinite;
    }
    .anim-x-body {
      animation: xPulse 3.5s ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    /* ]]> */
  </style>

  <!-- Button Chassis -->
  <rect x="1" y="1" width="113" height="40" rx="9" fill="url(#bgX)" stroke="#27272a" stroke-width="1.6" filter="url(#glowX)" />

  <!-- X Glyph -->
  <g transform="translate(16, 11)" class="anim-x-body">
    <!-- Main Black Body -->
    <path d="M 14.5 1.5 L 18.5 1.5 L 10.5 11 L 19 21.5 L 14 21.5 L 8.5 14.5 L 3.5 21.5 L 0.5 21.5 L 9 11.5 L 1 1.5 L 6.2 1.5 L 11 8 Z" fill="#ffffff" />
    <!-- Glinting diagonal line -->
    <line x1="1" y1="1.5" x2="19" y2="21.5" stroke="url(#glintGrad)" stroke-width="2.5" class="anim-glint" />
  </g>

  <!-- Label -->
  <text x="48" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="800" letter-spacing="2" fill="#f4f4f5">X</text>
</svg>`;

// 3. INSTAGRAM BADGE
const instagramSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 165 42" width="165" height="42">
  <defs>
    <linearGradient id="bgInsta" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e0c1b" />
      <stop offset="100%" stop-color="#0d040e" />
    </linearGradient>
    <linearGradient id="instaGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="30%" stop-color="#e11d48" />
      <stop offset="70%" stop-color="#c026d3" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <filter id="glowInsta">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#e11d48" flood-opacity="0.3" />
    </filter>
  </defs>

  <style>
    /* <![CDATA[ */
    @keyframes lensSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes flashFire {
      0%, 80%, 100% { transform: scale(1); opacity: 0.5; fill: #ffffff; }
      88% { transform: scale(2.2); opacity: 1; fill: #fef08a; filter: drop-shadow(0 0 6px #fef08a); }
    }
    @keyframes borderPulse {
      0%, 100% { stroke-opacity: 0.6; }
      50% { stroke-opacity: 1; }
    }
    .anim-lens {
      animation: lensSpin 8s linear infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .anim-flash {
      animation: flashFire 2.8s ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .anim-insta-border {
      animation: borderPulse 3s ease-in-out infinite;
    }
    /* ]]> */
  </style>

  <!-- Button Chassis -->
  <rect x="1" y="1" width="163" height="40" rx="9" fill="url(#bgInsta)" stroke="url(#instaGrad)" stroke-width="1.6" class="anim-insta-border" filter="url(#glowInsta)" />

  <!-- Instagram Camera Glyph -->
  <g transform="translate(14, 9)">
    <!-- Outer Rounded Square -->
    <rect width="24" height="24" rx="6.5" fill="none" stroke="url(#instaGrad)" stroke-width="2.5" />
    
    <!-- Spinning Center Lens -->
    <g class="anim-lens">
      <circle cx="12" cy="12" r="5.8" fill="none" stroke="url(#instaGrad)" stroke-width="2.5" stroke-dasharray="24 6" />
      <circle cx="12" cy="12" r="2.2" fill="#ffffff" opacity="0.9" />
    </g>

    <!-- Pulsing Shutter Flash Dot -->
    <circle cx="18.5" cy="5.5" r="1.5" class="anim-flash" />
  </g>

  <!-- Label -->
  <text x="48" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#fdf2f8">INSTAGRAM</text>
</svg>`;

// 4. ORCID BADGE
const orcidSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 42" width="135" height="42">
  <defs>
    <linearGradient id="bgOrcid" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111d09" />
      <stop offset="100%" stop-color="#080e04" />
    </linearGradient>
    <filter id="glowOrcid">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#a6ce39" flood-opacity="0.35" />
    </filter>
  </defs>

  <style>
    /* <![CDATA[ */
    @keyframes orbitNode {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes orcidPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); fill: #bef264; }
    }
    .anim-orbit {
      animation: orbitNode 5s linear infinite;
      transform-box: fill-box;
      transform-origin: 12px 12px;
    }
    .anim-id-text {
      animation: orcidPulse 2.5s ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    /* ]]> */
  </style>

  <!-- Button Chassis -->
  <rect x="1" y="1" width="133" height="40" rx="9" fill="url(#bgOrcid)" stroke="#a6ce39" stroke-width="1.6" filter="url(#glowOrcid)" />

  <!-- ORCID Glyph -->
  <g transform="translate(14, 9)">
    <!-- Base Green Disc -->
    <circle cx="12" cy="12" r="11" fill="#a6ce39" />
    
    <!-- Orbiting Satellite Dot -->
    <g class="anim-orbit">
      <circle cx="12" cy="1" r="2" fill="#ffffff" />
    </g>

    <!-- White iD Typography -->
    <g class="anim-id-text">
      <!-- 'i' -->
      <line x1="7.8" y1="9.5" x2="7.8" y2="16" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="7.8" cy="7" r="1.1" fill="#ffffff" />
      <!-- 'D' -->
      <path d="M 11 7.2 L 13.8 7.2 C 16.5 7.2, 17.5 9, 17.5 11.5 C 17.5 14, 16.5 15.8, 13.8 15.8 L 11 15.8 Z" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round" />
      <line x1="11" y1="7.2" x2="11" y2="15.8" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
    </g>
  </g>

  <!-- Label -->
  <text x="48" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#ecfccb">ORCID</text>
</svg>`;

// 5. EMAIL BADGE
const emailSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 42" width="135" height="42">
  <defs>
    <linearGradient id="bgEmail" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#240c0b" />
      <stop offset="100%" stop-color="#110505" />
    </linearGradient>
    <filter id="glowEmail">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#ea4335" flood-opacity="0.35" />
    </filter>
  </defs>

  <style>
    /* <![CDATA[ */
    @keyframes letterGlide {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3.5px); }
    }
    @keyframes flapBlink {
      0%, 100% { stroke-opacity: 0.8; }
      50% { stroke-opacity: 1; stroke: #fca5a5; filter: drop-shadow(0 0 3px #f87171); }
    }
    .anim-letter {
      animation: letterGlide 2.2s ease-in-out infinite;
      transform-box: fill-box;
      transform-origin: center;
    }
    .anim-flap {
      animation: flapBlink 2.2s ease-in-out infinite;
    }
    /* ]]> */
  </style>

  <!-- Button Chassis -->
  <rect x="1" y="1" width="133" height="40" rx="9" fill="url(#bgEmail)" stroke="#ea4335" stroke-width="1.6" filter="url(#glowEmail)" />

  <!-- Envelope Icon -->
  <g transform="translate(14, 10)">
    <!-- Envelope Body -->
    <rect x="1" y="4" width="22" height="15" rx="3" fill="#ea4335" />
    
    <!-- Emerging Letter Card -->
    <g class="anim-letter">
      <rect x="4" y="1" width="16" height="10" rx="1.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
      <line x1="6.5" y1="4" x2="13.5" y2="4" stroke="#64748b" stroke-width="1.2" stroke-linecap="round" />
      <line x1="6.5" y1="7" x2="17.5" y2="7" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" />
    </g>

    <!-- Front Envelope V Flap -->
    <polyline points="2,5 12,12.5 22,5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="anim-flap" />
  </g>

  <!-- Label -->
  <text x="48" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="#fee2e2">EMAIL</text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'linkedin.svg'), linkedinSvg, 'utf8');
fs.writeFileSync(path.join(outDir, 'x.svg'), xSvg, 'utf8');
fs.writeFileSync(path.join(outDir, 'instagram.svg'), instagramSvg, 'utf8');
fs.writeFileSync(path.join(outDir, 'orcid.svg'), orcidSvg, 'utf8');
fs.writeFileSync(path.join(outDir, 'email.svg'), emailSvg, 'utf8');

console.log('[+] Successfully generated all 5 bespoke animated social badges in assets/socials/');
