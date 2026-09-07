const fs = require('fs');
const path = require('path');

// Mulberry32 PRNG for deterministic, aesthetic pseudo-randomness
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateBannerSvg() {
  const W = 1200;
  const H = 320;

  const NIGHT = {
    sky: "#0d1220",
    skyMid: "#131d2c",
    skyLow: "#172536",
    paper: "#101419",
    ivory: "#2a3342",
    cream: "#232c3a",
    moon: "#e8dec9",
    accent: "#d88932",
    navy: "#172536",
    navyMid: "#111c2a",
    navyNear: "#0d1621",
    ink: "#e8e0d2",
  };

  // 1. Stars Generation (Golden-Ratio distribution matching collage.ts)
  const starCount = 52;
  const rndStar = mulberry32(515);
  let starsSvg = '';
  
  for (let i = 0; i < starCount; i++) {
    const band = i / starCount;
    const x = (((i * 0.6180339887) % 1) * 1.04 - 0.02) * W;
    const y = (0.03 + band * 0.58 + (rndStar() - 0.5) * 0.1) * H;
    const r = (0.7 + rndStar() * 1.6).toFixed(1);
    const alpha = (0.35 + rndStar() * 0.55).toFixed(2);
    const dur = (1.8 + rndStar() * 2.2).toFixed(1);
    const delay = (rndStar() * 3.0).toFixed(1);
    const isCross = rndStar() > 0.76;

    if (isCross) {
      const arm = (r * 2.2).toFixed(1);
      starsSvg += `
      <g class="star-twinkle" style="animation-duration: ${dur}s; animation-delay: ${delay}s;" opacity="${alpha}">
        <line x1="${(x - arm).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + Number(arm)).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${NIGHT.moon}" stroke-width="0.9" stroke-linecap="round"/>
        <line x1="${x.toFixed(1)}" y1="${(y - arm).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + Number(arm)).toFixed(1)}" stroke="${NIGHT.moon}" stroke-width="0.9" stroke-linecap="round"/>
      </g>`;
    } else {
      starsSvg += `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${NIGHT.moon}" opacity="${alpha}" class="star-twinkle" style="animation-duration: ${dur}s; animation-delay: ${delay}s;"/>`;
    }
  }

  // 2. Hand-Cut Torn Moon Generation
  const moonR = 46;
  const moonCx = 880;
  const moonCy = 95;
  const rndMoon = mulberry32(64);
  let moonPath = '';

  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const r = moonR * (1 + Math.sin(a * 2.7) * 0.012 + (rndMoon() - 0.5) * 0.016);
    const x = moonCx + Math.cos(a) * r;
    const y = moonCy + Math.sin(a) * r;
    moonPath += (i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  moonPath += ' Z';

  // Moon craters
  const craters = [
    { a: 0.4, d: 0.35, r: 4.8 },
    { a: 1.2, d: 0.52, r: 6.2 },
    { a: 2.1, d: 0.28, r: 4.2 },
    { a: 3.4, d: 0.65, r: 7.5 },
    { a: 4.6, d: 0.42, r: 5.4 },
    { a: 5.5, d: 0.58, r: 6.8 },
  ];
  let cratersSvg = craters.map(c => {
    const cx = moonCx + Math.cos(c.a) * (moonR * c.d);
    const cy = moonCy + Math.sin(c.a) * (moonR * c.d);
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${c.r}" fill="rgba(23,37,54,0.14)"/>`;
  }).join('\n        ');

  // 3. Torn-Paper Mountain Ranges (Far, Mid, Near)
  function buildMountainPath(baseY, peakVariation, seed, stepCount = 28) {
    const rnd = mulberry32(seed);
    let pts = [`M 0 ${H}`];
    pts.push(`L 0 ${baseY}`);

    for (let i = 1; i <= stepCount; i++) {
      const x = (i / stepCount) * W;
      const noise = (rnd() - 0.5) * peakVariation;
      const wave = Math.sin((i / stepCount) * Math.PI * 2.5 + seed) * (peakVariation * 0.6);
      const y = Math.min(H - 10, Math.max(80, baseY + noise + wave));
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    pts.push(`L ${W} ${H}`);
    pts.push('Z');
    return pts.join(' ');
  }

  const farMountain = buildMountainPath(175, 45, 41, 32);
  const midMountain = buildMountainPath(210, 52, 77, 36);
  const frontMountain = buildMountainPath(255, 40, 103, 40);

  // 4. Drifting Paper Clouds
  function generateCloud(cx, cy, scale, opacity) {
    return `
    <g transform="translate(${cx}, ${cy}) scale(${scale})" opacity="${opacity}">
      <ellipse cx="0" cy="0" rx="90" ry="24" fill="#232C3A"/>
      <ellipse cx="-45" cy="-8" rx="55" ry="26" fill="#2A3342"/>
      <ellipse cx="25" cy="-12" rx="65" ry="30" fill="#2A3342"/>
      <ellipse cx="65" cy="-4" rx="45" ry="22" fill="#232C3A"/>
      <ellipse cx="-15" cy="-18" rx="40" ry="22" fill="#323C4D"/>
    </g>`;
  }

  // Cloud tier 1 (slower, far)
  const cloudsFar = `
    <g class="cloud-track-far">
      ${generateCloud(150, 110, 0.75, 0.45)}
      ${generateCloud(650, 85, 0.9, 0.40)}
      ${generateCloud(1150, 120, 0.8, 0.42)}
      ${generateCloud(150 + W, 110, 0.75, 0.45)}
      ${generateCloud(650 + W, 85, 0.9, 0.40)}
      ${generateCloud(1150 + W, 120, 0.8, 0.42)}
    </g>
  `;

  // Cloud tier 2 (mid-level)
  const cloudsMid = `
    <g class="cloud-track-mid">
      ${generateCloud(380, 155, 1.1, 0.55)}
      ${generateCloud(920, 170, 1.0, 0.50)}
      ${generateCloud(380 + W, 155, 1.1, 0.55)}
      ${generateCloud(920 + W, 170, 1.0, 0.50)}
    </g>
  `;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">
  <defs>
    <!-- Sky Midnight Atmospheric Gradient -->
    <linearGradient id="nightSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${NIGHT.sky}"/>
      <stop offset="55%" stop-color="${NIGHT.skyMid}"/>
      <stop offset="100%" stop-color="${NIGHT.skyLow}"/>
    </linearGradient>

    <!-- Horizon Twilight Glow (Warmer Dusk undertone from Phase 2) -->
    <linearGradient id="duskGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(184,92,43,0)"/>
      <stop offset="65%" stop-color="rgba(209,90,43,0.12)"/>
      <stop offset="100%" stop-color="rgba(76,44,64,0.24)"/>
    </linearGradient>

    <!-- Moon Halo Radial Gradient -->
    <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(232,222,201,0.26)"/>
      <stop offset="45%" stop-color="rgba(232,222,201,0.10)"/>
      <stop offset="100%" stop-color="rgba(232,222,201,0)"/>
    </radialGradient>

    <!-- Mountains Depth Gradients -->
    <linearGradient id="farGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1A293D"/>
      <stop offset="100%" stop-color="${NIGHT.navy}"/>
    </linearGradient>
    <linearGradient id="midGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#142131"/>
      <stop offset="100%" stop-color="${NIGHT.navyMid}"/>
    </linearGradient>
    <linearGradient id="frontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F1B27"/>
      <stop offset="100%" stop-color="${NIGHT.navyNear}"/>
    </linearGradient>

    <!-- Mist Between Mountain Ridges -->
    <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(35,44,58,0)"/>
      <stop offset="60%" stop-color="rgba(35,44,58,0.22)"/>
      <stop offset="100%" stop-color="rgba(35,44,58,0)"/>
    </linearGradient>

    <style>
      @keyframes twinkle {
        0%, 100% { opacity: 0.25; transform: scale(0.85); }
        50% { opacity: 0.95; transform: scale(1.18); }
      }
      @keyframes moonFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes haloBreathe {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      @keyframes driftFarAnim {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${W}px); }
      }
      @keyframes driftMidAnim {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${W}px); }
      }

      .star-twinkle {
        animation: twinkle infinite ease-in-out;
        transform-origin: center;
      }
      .moon-group {
        animation: moonFloat 7s infinite ease-in-out;
        transform-origin: ${moonCx}px ${moonCy}px;
      }
      .moon-halo-pulsing {
        animation: haloBreathe 5s infinite ease-in-out;
        transform-origin: ${moonCx}px ${moonCy}px;
      }
      .cloud-track-far {
        animation: driftFarAnim 85s linear infinite;
      }
      .cloud-track-mid {
        animation: driftMidAnim 55s linear infinite;
      }
    </style>
  </defs>

  <!-- 1. Cosmic Sky Base -->
  <rect width="${W}" height="${H}" fill="url(#nightSkyGrad)"/>
  <rect width="${W}" height="${H}" fill="url(#duskGlow)"/>

  <!-- 2. Twinkling Starfield -->
  <g id="starfield">
    ${starsSvg}
  </g>

  <!-- 3. Torn Ivory Moon with Radiant Halo -->
  <g class="moon-group">
    <!-- Radiant Halo -->
    <circle cx="${moonCx}" cy="${moonCy}" r="${moonR * 2.2}" fill="url(#moonHalo)" class="moon-halo-pulsing"/>
    <!-- Torn Paper Moon Silhouette -->
    <path d="${moonPath}" fill="${NIGHT.moon}"/>
    <!-- Hand-drawn Charcoal Ring -->
    <path d="${moonPath}" fill="none" stroke="rgba(23,37,54,0.45)" stroke-width="1.2"/>
    <!-- Craters -->
    <g>
      ${cratersSvg}
    </g>
  </g>

  <!-- 4. Drifting Far Clouds (Behind distant mountains) -->
  ${cloudsFar}

  <!-- 5. Far Mountain Peaks -->
  <path d="${farMountain}" fill="url(#farGrad)"/>
  <path d="${farMountain}" fill="none" stroke="rgba(232,224,210,0.12)" stroke-width="1"/>

  <!-- Mist Layer 1 -->
  <rect x="0" y="165" width="${W}" height="70" fill="url(#mistGrad)"/>

  <!-- 6. Mid Mountain Peaks -->
  <path d="${midMountain}" fill="url(#midGrad)"/>
  <path d="${midMountain}" fill="none" stroke="rgba(232,224,210,0.09)" stroke-width="1"/>

  <!-- 7. Drifting Mid Clouds (In valleys) -->
  ${cloudsMid}

  <!-- Mist Layer 2 -->
  <rect x="0" y="220" width="${W}" height="60" fill="url(#mistGrad)"/>

  <!-- 8. Front / Near Foreground Peaks -->
  <path d="${frontMountain}" fill="url(#frontGrad)"/>
  <path d="${frontMountain}" fill="none" stroke="rgba(232,224,210,0.07)" stroke-width="1.2"/>

  <!-- 9. Torn Paper Bottom Border Edge -->
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="${NIGHT.paper}"/>
</svg>`;

  return svgContent;
}

const bannerPath = path.join(__dirname, '../assets/banner.svg');
const svg = generateBannerSvg();
fs.writeFileSync(bannerPath, svg, 'utf8');
console.log(`[+] Generated Animated Kinetic Collage Banner -> ${bannerPath}`);
