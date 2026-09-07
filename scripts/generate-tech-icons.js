const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Reusable SVG wrapper
function wrapSvg(name, innerSvg, styleCss = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace; }
      ${styleCss}
    </style>
  </defs>
  <!-- Card Base Plate -->
  <rect x="2" y="2" width="60" height="60" rx="12" fill="#111620" stroke="#222C3D" stroke-width="1.2"/>
  ${innerSvg}
</svg>`;
}

const ICONS = {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. LANGUAGES
  // ──────────────────────────────────────────────────────────────────────────
  'javascript': wrapSvg('javascript', `
    <rect x="14" y="14" width="36" height="36" rx="6" fill="#F7DF1E" class="js-box"/>
    <text x="32" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="20" fill="#000000" text-anchor="middle">JS</text>
    <circle cx="48" cy="16" r="3" fill="#F7DF1E" class="js-spark" opacity="0.8"/>
  `, `
    @keyframes jsGlow {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(247, 223, 30, 0.4)); transform: scale(1); }
      50% { filter: drop-shadow(0 0 8px rgba(247, 223, 30, 0.85)); transform: scale(1.02); }
    }
    @keyframes sparkFloat {
      0%, 100% { transform: translateY(0); opacity: 0.3; }
      50% { transform: translateY(-4px); opacity: 1; }
    }
    .js-box { animation: jsGlow 2.5s infinite ease-in-out; transform-origin: 32px 32px; }
    .js-spark { animation: sparkFloat 2s infinite ease-in-out; }
  `),

  'typescript': wrapSvg('typescript', `
    <rect x="14" y="14" width="36" height="36" rx="6" fill="#3178C6" class="ts-box"/>
    <text x="32" y="41" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">TS</text>
    <line x1="14" y1="14" x2="50" y2="14" stroke="#60A5FA" stroke-width="1.8" class="ts-sheen"/>
  `, `
    @keyframes tsPulse {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(49, 120, 198, 0.4)); }
      50% { filter: drop-shadow(0 0 9px rgba(96, 165, 250, 0.85)); }
    }
    @keyframes sheenMove {
      0% { stroke-dasharray: 0 40; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 25 15; stroke-dashoffset: -20; }
      100% { stroke-dasharray: 0 40; stroke-dashoffset: -40; }
    }
    .ts-box { animation: tsPulse 2.8s infinite ease-in-out; }
    .ts-sheen { animation: sheenMove 2.8s infinite ease-in-out; }
  `),

  'python': wrapSvg('python', `
    <g transform="translate(32, 32)" class="py-snakes">
      <!-- Blue Snake (Top-Left) -->
      <path d="M -3 -15 C -11 -15 -13 -11 -13 -7 L -13 -1 L -1 -1 L -1 2 L -10 2 C -15 2 -16 6 -16 11 C -16 16 -12 16 -8 16 L -6 16 L -6 12 C -6 8 -2 6 3 6 L 5 6 L 5 -2 C 5 -10 0 -15 -3 -15 Z" fill="#387EB8"/>
      <circle cx="-7" cy="-10" r="1.5" fill="#FFFFFF" class="py-eye"/>
      <!-- Yellow Snake (Bottom-Right) -->
      <path d="M 3 15 C 11 15 13 11 13 7 L 13 1 L 1 1 L 1 -2 L 10 -2 C 15 -2 16 -6 16 -11 C 16 -16 12 -16 8 -16 L 6 -16 L 6 -12 C 6 -8 2 -6 -3 -6 L -5 -6 L -5 2 C -5 10 0 15 3 15 Z" fill="#FFE873"/>
      <circle cx="7" cy="10" r="1.5" fill="#387EB8" class="py-eye"/>
    </g>
  `, `
    @keyframes pyBob {
      0%, 100% { transform: translate(32px, 32px) rotate(0deg) scale(1); }
      50% { transform: translate(32px, 30px) rotate(2deg) scale(1.04); filter: drop-shadow(0 0 6px rgba(255, 232, 115, 0.6)); }
    }
    .py-snakes { animation: pyBob 3s infinite ease-in-out; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 2. FRONTEND
  // ──────────────────────────────────────────────────────────────────────────
  'react': wrapSvg('react', `
    <g transform="translate(32, 32)">
      <!-- Central Glowing Nucleus -->
      <circle cx="0" cy="0" r="4.2" fill="#00D8FF" class="react-core"/>
      <!-- 3 Orbital Rings -->
      <g class="react-rings">
        <ellipse cx="0" cy="0" rx="19" ry="7.5" fill="none" stroke="#00D8FF" stroke-width="1.6" opacity="0.85"/>
        <ellipse cx="0" cy="0" rx="19" ry="7.5" fill="none" stroke="#00D8FF" stroke-width="1.6" transform="rotate(60)" opacity="0.85"/>
        <ellipse cx="0" cy="0" rx="19" ry="7.5" fill="none" stroke="#00D8FF" stroke-width="1.6" transform="rotate(120)" opacity="0.85"/>
      </g>
    </g>
  `, `
    @keyframes reactSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes corePulse {
      0%, 100% { r: 4; filter: drop-shadow(0 0 3px #00D8FF); }
      50% { r: 5.5; filter: drop-shadow(0 0 9px #00D8FF); }
    }
    .react-rings { animation: reactSpin 12s infinite linear; transform-origin: 0 0; }
    .react-core { animation: corePulse 2s infinite ease-in-out; }
  `),

  'vite': wrapSvg('vite', `
    <g transform="translate(32, 32)" class="vite-group">
      <!-- Shield Base -->
      <polygon points="0,-18 16,-9 12,14 0,20 -12,14 -16,-9" fill="url(#viteGrad)" opacity="0.9"/>
      <!-- Crackling Bolt -->
      <polygon points="-3,-19 9,-19 1,-4 8,-4 -7,19 -2,2 -8,2" fill="#FFD62E" class="vite-bolt"/>
    </g>
    <linearGradient id="viteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#41D1FF"/>
      <stop offset="100%" stop-color="#BD34FE"/>
    </linearGradient>
  `, `
    @keyframes boltCrack {
      0%, 100% { filter: drop-shadow(0 0 3px #FFD62E); transform: scale(1); }
      45% { filter: drop-shadow(0 0 4px #FFD62E); }
      50% { filter: drop-shadow(0 0 12px #FFD62E); transform: scale(1.08); }
      55% { filter: drop-shadow(0 0 4px #FFD62E); transform: scale(1); }
    }
    .vite-bolt { animation: boltCrack 2s infinite ease-in-out; transform-origin: center; }
  `),

  'tailwind': wrapSvg('tailwind', `
    <g transform="translate(32, 32)" class="tw-waves">
      <!-- Top Crest -->
      <path d="M -16 -4 C -11 -12 -5 -12 0 -7 C 5 -2 8 -2 12 -4 C 14 -5 16 -8 16 -8 C 16 -8 14 -2 10 2 C 5 6 0 6 -4 2 C -8 -2 -11 -2 -14 0 C -15 1 -16 4 -16 4 Z" fill="#38BDF8" opacity="0.95"/>
      <!-- Bottom Crest -->
      <path d="M -12 6 C -8 -2 -2 -2 3 3 C 8 8 11 8 15 6 C 17 5 19 2 19 2 C 19 2 17 8 13 12 C 8 16 3 16 -1 12 C -5 8 -8 8 -11 10 C -12 11 -13 14 -13 14 Z" fill="#0EA5E9" opacity="0.9"/>
    </g>
  `, `
    @keyframes twWave {
      0%, 100% { transform: translate(32px, 32px) translateY(0) scale(1); filter: drop-shadow(0 0 2px #38BDF8); }
      50% { transform: translate(32px, 32px) translateY(-3px) scale(1.05); filter: drop-shadow(0 0 8px #38BDF8); }
    }
    .tw-waves { animation: twWave 2.6s infinite ease-in-out; }
  `),

  'html5': wrapSvg('html5', `
    <g transform="translate(32, 32)" class="html-shield">
      <polygon points="-16,-18 16,-18 13,16 0,20 -13,16" fill="#E34F26"/>
      <polygon points="0,-15 13,-15 11,13 0,16" fill="#EF652A"/>
      <path d="M -9 -10 L 9 -10 L 8 -4 L -3 -4 L -2 2 L 7 2 L 6 9 L 0 11 L -6 9 L -6 5 L -3 5 L -3 7 L 0 8 L 3 7 L 4 4 L -8 4 Z" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes htmlPulse {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #E34F26); }
      50% { transform: translate(32px, 32px) scale(1.05); filter: drop-shadow(0 0 8px #EF652A); }
    }
    .html-shield { animation: htmlPulse 3s infinite ease-in-out; }
  `),

  'css3': wrapSvg('css3', `
    <g transform="translate(32, 32)" class="css-shield">
      <polygon points="-16,-18 16,-18 13,16 0,20 -13,16" fill="#1572B6"/>
      <polygon points="0,-15 13,-15 11,13 0,16" fill="#33A9DC"/>
      <path d="M -9 -10 L 9 -10 L 8 -4 L 0 -4 L 0 -1 L 8 -1 L 7 9 L 0 11 L -6 9 L -6 5 L -3 5 L -3 7 L 0 8 L 4 7 L 5 2 L -9 2 Z" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes cssPulse {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #1572B6); }
      50% { transform: translate(32px, 32px) scale(1.05); filter: drop-shadow(0 0 8px #33A9DC); }
    }
    .css-shield { animation: cssPulse 3s infinite ease-in-out; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 3. 3D / CREATIVE WEB
  // ──────────────────────────────────────────────────────────────────────────
  'threejs': wrapSvg('threejs', `
    <g transform="translate(32, 32)" class="three-tetra">
      <!-- 3D Rotating Wireframe Tetrahedron -->
      <polygon points="0,-18 16,12 -16,12" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>
      <line x1="0" y1="-18" x2="0" y2="4" stroke="#38BDF8" stroke-width="1.6"/>
      <line x1="16" y1="12" x2="0" y2="4" stroke="#38BDF8" stroke-width="1.6"/>
      <line x1="-16" y1="12" x2="0" y2="4" stroke="#38BDF8" stroke-width="1.6"/>
      <circle cx="0" cy="4" r="2.5" fill="#38BDF8"/>
      <circle cx="0" cy="-18" r="2.5" fill="#FFFFFF"/>
      <circle cx="16" cy="12" r="2.5" fill="#FFFFFF"/>
      <circle cx="-16" cy="12" r="2.5" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes threeRot {
      0%, 100% { transform: translate(32px, 32px) rotate(0deg) scale(1); filter: drop-shadow(0 0 3px #38BDF8); }
      50% { transform: translate(32px, 32px) rotate(180deg) scale(1.06); filter: drop-shadow(0 0 10px #38BDF8); }
    }
    .three-tetra { animation: threeRot 8s infinite ease-in-out; }
  `),

  'react-three-fiber': wrapSvg('react-three-fiber', `
    <g transform="translate(32, 32)" class="r3f-cube">
      <!-- Isometric Cube -->
      <polygon points="0,-16 14,-8 0,0 -14,-8" fill="#1E293B" stroke="#00D8FF" stroke-width="1.4"/>
      <polygon points="-14,-8 0,0 0,16 -14,8" fill="#0F172A" stroke="#00D8FF" stroke-width="1.4"/>
      <polygon points="0,0 14,-8 14,8 0,16" fill="#1E293B" stroke="#00D8FF" stroke-width="1.4"/>
      <!-- Inner Glowing Core -->
      <circle cx="0" cy="0" r="3.5" fill="#F43F5E" class="r3f-core"/>
    </g>
  `, `
    @keyframes r3fBob {
      0%, 100% { transform: translate(32px, 32px) translateY(0); }
      50% { transform: translate(32px, 32px) translateY(-5px); filter: drop-shadow(0 0 8px #00D8FF); }
    }
    @keyframes r3fPulse {
      0%, 100% { r: 3.5; opacity: 0.8; }
      50% { r: 5; opacity: 1; filter: drop-shadow(0 0 6px #F43F5E); }
    }
    .r3f-cube { animation: r3fBob 3.5s infinite ease-in-out; }
    .r3f-core { animation: r3fPulse 1.8s infinite ease-in-out; }
  `),

  'drei': wrapSvg('drei', `
    <g transform="translate(32, 32)">
      <!-- Polyhedron -->
      <polygon points="0,-15 14,-5 9,14 -9,14 -14,-5" fill="none" stroke="#A855F7" stroke-width="1.6" class="drei-poly"/>
      <!-- Orbiting Satellite -->
      <g class="drei-orbit">
        <circle cx="18" cy="0" r="3" fill="#EC4899"/>
      </g>
      <circle cx="0" cy="0" r="4" fill="#A855F7"/>
    </g>
  `, `
    @keyframes orbitSat {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes polyPulse {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #A855F7); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 8px #EC4899); }
    }
    .drei-orbit { animation: orbitSat 5s infinite linear; }
    .drei-poly { animation: polyPulse 2.5s infinite ease-in-out; transform-origin: center; }
  `),

  'webgl': wrapSvg('webgl', `
    <g transform="translate(32, 32)" class="webgl-axes">
      <!-- 3 RGB Coordinate Axes -->
      <line x1="0" y1="0" x2="0" y2="-18" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="16" y2="10" stroke="#10B981" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="-16" y2="10" stroke="#3B82F6" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Axis Terminal Spheres -->
      <circle cx="0" cy="-18" r="3" fill="#EF4444"/>
      <circle cx="16" cy="10" r="3" fill="#10B981"/>
      <circle cx="-16" cy="10" r="3" fill="#3B82F6"/>
      <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes webglSpin {
      0%, 100% { transform: translate(32px, 32px) rotate(0deg); }
      50% { transform: translate(32px, 32px) rotate(120deg); filter: drop-shadow(0 0 6px #10B981); }
    }
    .webgl-axes { animation: webglSpin 6s infinite ease-in-out; }
  `),

  'glsl': wrapSvg('glsl', `
    <g transform="translate(32, 32)">
      <!-- Shader Sphere with Wave Lines -->
      <circle cx="0" cy="0" r="18" fill="url(#glslGrad)" class="glsl-sphere"/>
      <path d="M -14 0 Q 0 -10 14 0 Q 0 10 -14 0" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8" class="glsl-sine"/>
    </g>
    <radialGradient id="glslGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#EC4899"/>
      <stop offset="60%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </radialGradient>
  `, `
    @keyframes glslBreathe {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #EC4899); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 12px #8B5CF6); }
    }
    .glsl-sphere { animation: glslBreathe 3s infinite ease-in-out; transform-origin: 32px 32px; }
  `),

  'spline': wrapSvg('spline', `
    <g transform="translate(32, 32)" class="spline-ribbon">
      <!-- 3D Extruded Infinity Ribbon -->
      <path d="M -14 -6 C -6 -18 6 18 14 6 C 6 18 -6 -18 -14 -6 Z" fill="none" stroke="url(#splineGrad)" stroke-width="4.5" stroke-linecap="round"/>
    </g>
    <linearGradient id="splineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
  `, `
    @keyframes splineRot {
      0%, 100% { transform: translate(32px, 32px) rotate(0deg) scale(1); }
      50% { transform: translate(32px, 32px) rotate(180deg) scale(1.1); filter: drop-shadow(0 0 8px #EC4899); }
    }
    .spline-ribbon { animation: splineRot 7s infinite ease-in-out; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 4. MOTION
  // ──────────────────────────────────────────────────────────────────────────
  'gsap': wrapSvg('gsap', `
    <g transform="translate(32, 32)">
      <!-- GreenSock Gear Icon -->
      <path d="M -4 -16 L 4 -16 L 5 -12 L 12 -12 L 14 -7 L 18 -5 L 16 3 L 13 8 L 8 13 L 0 16 L -8 13 L -13 8 L -16 3 L -18 -5 L -14 -7 L -12 -12 L -5 -12 Z" fill="#88CE02" class="gsap-gear"/>
      <circle cx="0" cy="0" r="7" fill="#111620"/>
      <circle cx="0" cy="0" r="4" fill="#88CE02"/>
    </g>
  `, `
    @keyframes gsapTurn {
      0% { transform: rotate(0deg); filter: drop-shadow(0 0 2px #88CE02); }
      50% { filter: drop-shadow(0 0 10px #88CE02); }
      100% { transform: rotate(360deg); filter: drop-shadow(0 0 2px #88CE02); }
    }
    .gsap-gear { animation: gsapTurn 10s infinite linear; transform-origin: 0 0; }
  `),

  'scrolltrigger': wrapSvg('scrolltrigger', `
    <g transform="translate(32, 32)">
      <!-- Mouse Shell -->
      <rect x="-10" y="-16" width="20" height="32" rx="10" fill="none" stroke="#88CE02" stroke-width="1.8"/>
      <!-- Wheel -->
      <line x1="0" y1="-10" x2="0" y2="-3" stroke="#88CE02" stroke-width="2.4" stroke-linecap="round" class="st-wheel"/>
      <!-- Scroll Arrow -->
      <path d="M -5 6 L 0 11 L 5 6" fill="none" stroke="#88CE02" stroke-width="1.6" class="st-arrow"/>
    </g>
  `, `
    @keyframes stWheel {
      0%, 100% { transform: translateY(0); opacity: 1; }
      50% { transform: translateY(5px); opacity: 0.3; }
    }
    @keyframes stArrow {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(4px); opacity: 1; }
    }
    .st-wheel { animation: stWheel 1.6s infinite ease-in-out; }
    .st-arrow { animation: stArrow 1.6s infinite ease-in-out; }
  `),

  'framer-motion': wrapSvg('framer-motion', `
    <g transform="translate(32, 32)" class="fm-blocks">
      <polygon points="-14,-16 0,-16 14,0 0,0" fill="#FF0055"/>
      <polygon points="-14,0 0,0 -14,16" fill="#0055FF"/>
      <polygon points="0,0 14,0 0,16" fill="#FF0055"/>
    </g>
  `, `
    @keyframes fmBounce {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 3px #FF0055); }
      50% { transform: translate(32px, 32px) scale(1.08) translateY(-2px); filter: drop-shadow(0 0 9px #0055FF); }
    }
    .fm-blocks { animation: fmBounce 2.4s infinite ease-in-out; }
  `),

  'react-spring': wrapSvg('react-spring', `
    <g transform="translate(32, 32)" class="spring-coil">
      <path d="M 0 -16 C -12 -16 -12 -8 0 -8 C 12 -8 12 0 0 0 C -12 0 -12 8 0 8 C 12 8 12 16 0 16" fill="none" stroke="#F43F5E" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="0" cy="-16" r="3" fill="#F43F5E"/>
      <circle cx="0" cy="16" r="3" fill="#F43F5E"/>
    </g>
  `, `
    @keyframes springBounce {
      0%, 100% { transform: translate(32px, 32px) scaleY(1); filter: drop-shadow(0 0 2px #F43F5E); }
      40% { transform: translate(32px, 32px) scaleY(0.7); }
      60% { transform: translate(32px, 32px) scaleY(1.2); filter: drop-shadow(0 0 8px #F43F5E); }
      80% { transform: translate(32px, 32px) scaleY(0.95); }
    }
    .spring-coil { animation: springBounce 1.8s infinite ease-in-out; }
  `),

  'lenis': wrapSvg('lenis', `
    <g transform="translate(32, 32)">
      <path d="M -18 10 C -8 10 -8 -10 0 -10 C 8 -10 8 10 18 10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
      <circle cx="-18" cy="10" r="3.5" fill="#38BDF8" class="lenis-dot"/>
    </g>
  `, `
    @keyframes lenisGlide {
      0% { transform: translate(0, 0); }
      50% { transform: translate(18px, -20px); filter: drop-shadow(0 0 6px #38BDF8); }
      100% { transform: translate(36px, 0); }
    }
    .lenis-dot { animation: lenisGlide 2.2s infinite ease-in-out alternate; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 5. VISUAL / GRAPHICS
  // ──────────────────────────────────────────────────────────────────────────
  'svg': wrapSvg('svg', `
    <g transform="translate(32, 32)">
      <!-- Pen Tool & Curve -->
      <path d="M -14 10 Q 0 -14 14 10" fill="none" stroke="#FFB13B" stroke-width="2" stroke-dasharray="32" class="svg-curve"/>
      <circle cx="-14" cy="10" r="2.5" fill="#FFFFFF"/>
      <circle cx="14" cy="10" r="2.5" fill="#FFFFFF"/>
      <!-- Pen Nib -->
      <polygon points="0,-14 6,-6 0,-2 -6,-6" fill="#FFB13B" class="svg-pen"/>
    </g>
  `, `
    @keyframes drawSvg {
      0% { stroke-dashoffset: 32; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -32; }
    }
    @keyframes penBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .svg-curve { animation: drawSvg 3s infinite linear; }
    .svg-pen { animation: penBob 3s infinite ease-in-out; }
  `),

  'mermaid': wrapSvg('mermaid', `
    <g transform="translate(32, 32)">
      <!-- Flowchart Nodes -->
      <rect x="-16" y="-14" width="12" height="10" rx="2" fill="#FF3570"/>
      <rect x="4" y="-14" width="12" height="10" rx="2" fill="#38BDF8"/>
      <rect x="-6" y="6" width="12" height="10" rx="2" fill="#10B981"/>
      <!-- Connecting Flow Lines -->
      <path d="M -10 -4 L -10 0 L 0 0 L 0 6" fill="none" stroke="#7D8590" stroke-width="1.4"/>
      <path d="M 10 -4 L 10 0 L 0 0" fill="none" stroke="#7D8590" stroke-width="1.4"/>
      <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" class="flow-pulse"/>
    </g>
  `, `
    @keyframes pulseFlow {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.6); opacity: 1; filter: drop-shadow(0 0 5px #38BDF8); }
    }
    .flow-pulse { animation: pulseFlow 2s infinite ease-in-out; transform-origin: 0 0; }
  `),

  'canvas': wrapSvg('canvas', `
    <g transform="translate(32, 32)">
      <!-- Palette Body -->
      <path d="M -14 6 C -18 -8 0 -18 12 -10 C 18 -4 16 10 8 14 C 4 16 -2 14 -6 12 C -10 10 -12 14 -14 6 Z" fill="#E2E8F0"/>
      <!-- Paint Wells -->
      <circle cx="-6" cy="-8" r="2.2" fill="#EF4444"/>
      <circle cx="2" cy="-10" r="2.2" fill="#F59E0B"/>
      <circle cx="8" cy="-4" r="2.2" fill="#10B981"/>
      <circle cx="2" cy="6" r="2.2" fill="#3B82F6"/>
      <!-- Paint Drip -->
      <circle cx="0" cy="18" r="2" fill="#3B82F6" class="canvas-drip"/>
    </g>
  `, `
    @keyframes dripAnim {
      0% { transform: translateY(-4px); opacity: 0; }
      50% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(6px); opacity: 0; }
    }
    .canvas-drip { animation: dripAnim 2.2s infinite ease-in; }
  `),

  'waapi': wrapSvg('waapi', `
    <g transform="translate(32, 32)">
      <!-- Timeline Track -->
      <line x1="-16" y1="0" x2="16" y2="0" stroke="#475569" stroke-width="2"/>
      <!-- Keyframe Diamonds -->
      <polygon points="-14,-4 -10,0 -14,4 -18,0" fill="#38BDF8"/>
      <polygon points="0,-4 4,0 0,4 -4,0" fill="#A855F7"/>
      <polygon points="14,-4 18,0 14,4 10,0" fill="#EC4899"/>
      <!-- Sweeping Playhead -->
      <line x1="-14" y1="-12" x2="-14" y2="12" stroke="#FFFFFF" stroke-width="1.8" class="waapi-playhead"/>
    </g>
  `, `
    @keyframes sweepPlayhead {
      0% { transform: translateX(0); }
      100% { transform: translateX(28px); }
    }
    .waapi-playhead { animation: sweepPlayhead 2.5s infinite ease-in-out alternate; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 6. BROWSER / EXTENSIONS
  // ──────────────────────────────────────────────────────────────────────────
  'chrome-extension': wrapSvg('chrome-extension', `
    <g transform="translate(32, 32)" class="ext-puzzle">
      <!-- Puzzle Piece -->
      <path d="M -12 -12 L -4 -12 C -4 -16 4 -16 4 -12 L 12 -12 L 12 -4 C 16 -4 16 4 12 4 L 12 12 L 4 12 C 4 8 -4 8 -4 12 L -12 12 L -12 4 C -8 4 -8 -4 -12 -4 Z" fill="#4285F4"/>
      <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes puzzlePulse {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #4285F4); }
      50% { transform: translate(32px, 32px) scale(1.08); filter: drop-shadow(0 0 10px #4285F4); }
    }
    .ext-puzzle { animation: puzzlePulse 3s infinite ease-in-out; }
  `),

  'manifest-v3': wrapSvg('manifest-v3', `
    <g transform="translate(32, 32)" class="mv3-shield">
      <polygon points="0,-16 15,-8 12,12 0,18 -12,12 -15,-8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.6"/>
      <text x="0" y="4" class="mono" font-size="10" font-weight="900" fill="#F59E0B" text-anchor="middle">V3</text>
      <circle cx="0" cy="-6" r="2" fill="#F59E0B"/>
    </g>
  `, `
    @keyframes mv3Glow {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #F59E0B); }
      50% { transform: translate(32px, 32px) scale(1.06); filter: drop-shadow(0 0 9px #F59E0B); }
    }
    .mv3-shield { animation: mv3Glow 2.8s infinite ease-in-out; }
  `),

  'content-scripts': wrapSvg('content-scripts', `
    <g transform="translate(32, 32)">
      <!-- Document File -->
      <rect x="-12" y="-14" width="24" height="28" rx="3" fill="#1E293B" stroke="#64748B" stroke-width="1.4"/>
      <line x1="-7" y1="-8" x2="2" y2="-8" stroke="#94A3B8" stroke-width="1.2"/>
      <line x1="-7" y1="-3" x2="7" y2="-3" stroke="#94A3B8" stroke-width="1.2"/>
      <line x1="-7" y1="2" x2="4" y2="2" stroke="#94A3B8" stroke-width="1.2"/>
      <!-- Injected Electric Syringe/Beam -->
      <polygon points="14,-14 6,-6 9,-3 17,-11" fill="#10B981" class="cs-inject"/>
    </g>
  `, `
    @keyframes injectFlash {
      0%, 100% { transform: translate(0, 0); opacity: 0.7; }
      50% { transform: translate(-3px, 3px); opacity: 1; filter: drop-shadow(0 0 6px #10B981); }
    }
    .cs-inject { animation: injectFlash 2s infinite ease-in-out; }
  `),

  'service-workers': wrapSvg('service-workers', `
    <g transform="translate(32, 32)">
      <!-- Core Node -->
      <circle cx="0" cy="6" r="5" fill="#3B82F6" class="sw-core"/>
      <!-- Signal Arcs -->
      <path d="M -8 -2 A 10 10 0 0 1 8 -2" fill="none" stroke="#60A5FA" stroke-width="1.6" class="sw-wave sw-wave-1"/>
      <path d="M -14 -8 A 17 17 0 0 1 14 -8" fill="none" stroke="#60A5FA" stroke-width="1.6" class="sw-wave sw-wave-2"/>
    </g>
  `, `
    @keyframes waveEmit {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; filter: drop-shadow(0 0 4px #60A5FA); }
    }
    .sw-wave-1 { animation: waveEmit 2s infinite ease-in-out; }
    .sw-wave-2 { animation: waveEmit 2s infinite ease-in-out 0.4s; }
  `),

  'chrome-storage': wrapSvg('chrome-storage', `
    <g transform="translate(32, 32)">
      <!-- Disk Cylinder 1 -->
      <ellipse cx="0" cy="-6" rx="14" ry="5" fill="#334155"/>
      <path d="M -14 -6 L -14 0 A 14 5 0 0 0 14 0 L 14 -6 Z" fill="#1E293B" stroke="#475569" stroke-width="1"/>
      <ellipse cx="0" cy="0" rx="14" ry="5" fill="#334155"/>
      <!-- Disk Cylinder 2 -->
      <path d="M -14 2 L -14 8 A 14 5 0 0 0 14 8 L 14 2 Z" fill="#1E293B" stroke="#475569" stroke-width="1"/>
      <ellipse cx="0" cy="8" rx="14" ry="5" fill="#334155"/>
      <!-- Read/Write LED -->
      <circle cx="8" cy="8" r="1.8" fill="#10B981" class="storage-led"/>
    </g>
  `, `
    @keyframes ledBlink {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; filter: drop-shadow(0 0 5px #10B981); }
    }
    .storage-led { animation: ledBlink 1.4s infinite ease-in-out; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 7. DEV / TESTING
  // ──────────────────────────────────────────────────────────────────────────
  'nodejs': wrapSvg('nodejs', `
    <g transform="translate(32, 32)" class="node-hex">
      <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#5FA04E" opacity="0.9"/>
      <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="#111620"/>
      <!-- Inner Cube -->
      <polygon points="0,-8 7,-4 0,0 -7,-4" fill="#5FA04E"/>
      <polygon points="-7,-4 0,0 0,8 -7,4" fill="#4B823E"/>
      <polygon points="0,0 7,-4 7,4 0,8" fill="#6FB35C"/>
    </g>
  `, `
    @keyframes nodeBreathe {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #5FA04E); }
      50% { transform: translate(32px, 32px) scale(1.06); filter: drop-shadow(0 0 9px #5FA04E); }
    }
    .node-hex { animation: nodeBreathe 3s infinite ease-in-out; }
  `),

  'npm': wrapSvg('npm', `
    <g transform="translate(32, 32)" class="npm-box">
      <rect x="-16" y="-12" width="32" height="24" rx="2" fill="#CB3837"/>
      <!-- Inner Cutout n-p-m -->
      <path d="M -12 -7 L 12 -7 L 12 7 L 7 7 L 7 -2 L 3 -2 L 3 7 L -12 7 Z M -8 3 L -4 3 L -4 -2 L -8 -2 Z" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes npmHop {
      0%, 100% { transform: translate(32px, 32px) translateY(0); filter: drop-shadow(0 0 2px #CB3837); }
      50% { transform: translate(32px, 32px) translateY(-3px); filter: drop-shadow(0 0 8px #CB3837); }
    }
    .npm-box { animation: npmHop 2.4s infinite ease-in-out; }
  `),

  'git': wrapSvg('git', `
    <g transform="translate(32, 32)" class="git-icon">
      <!-- Diamond -->
      <rect x="-13" y="-13" width="26" height="26" rx="4" fill="#F05032" transform="rotate(45)"/>
      <!-- Commit Branch Lines -->
      <circle cx="-5" cy="0" r="2.5" fill="#FFFFFF"/>
      <circle cx="5" cy="-5" r="2.5" fill="#FFFFFF"/>
      <circle cx="5" cy="5" r="2.5" fill="#FFFFFF"/>
      <line x1="-5" y1="0" x2="5" y2="5" stroke="#FFFFFF" stroke-width="1.6"/>
      <path d="M -5 0 Q 0 -5 5 -5" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>
    </g>
  `, `
    @keyframes gitPulse {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 2px #F05032); }
      50% { transform: translate(32px, 32px) scale(1.06); filter: drop-shadow(0 0 8px #F05032); }
    }
    .git-icon { animation: gitPulse 3s infinite ease-in-out; }
  `),

  'github': wrapSvg('github', `
    <g transform="translate(32, 32)" class="gh-cat">
      <path d="M 0 -16 C -9 -16 -16 -9 -16 0 C -16 7 -11 13 -5 15 C -4 15 -4 14 -4 14 L -4 11 C -9 12 -10 9 -10 9 C -11 7 -12 7 -12 7 C -13 6 -12 6 -12 6 C -11 6 -10 7 -10 7 C -9 9 -7 9 -6 8 C -6 7 -5 6 -4 6 C -8 5 -11 4 -11 -2 C -11 -4 -10 -5 -9 -6 C -9 -7 -10 -8 -9 -10 C -9 -10 -8 -10 -6 -9 C -4 -10 0 -10 2 -9 C 4 -10 5 -10 5 -10 C 6 -8 6 -7 5 -6 C 6 -5 7 -4 7 -2 C 7 4 4 5 0 6 C 1 6 2 8 2 10 L 2 14 C 2 14 2 15 3 15 C 9 13 14 7 14 0 C 14 -9 7 -16 0 -16 Z" fill="#F0F6FC"/>
    </g>
  `, `
    @keyframes ghFloat {
      0%, 100% { transform: translate(32px, 32px) translateY(0); filter: drop-shadow(0 0 2px rgba(240, 246, 252, 0.4)); }
      50% { transform: translate(32px, 32px) translateY(-2.5px); filter: drop-shadow(0 0 8px rgba(240, 246, 252, 0.85)); }
    }
    .gh-cat { animation: ghFloat 3s infinite ease-in-out; }
  `),

  'playwright': wrapSvg('playwright', `
    <g transform="translate(32, 32)">
      <!-- Drama Masks Silhouette -->
      <path d="M -12 -10 C -14 4 -6 14 0 14 C 6 14 14 4 12 -10 Z" fill="#2EAD33" opacity="0.85"/>
      <circle cx="-5" cy="-3" r="2" fill="#111620"/>
      <circle cx="5" cy="-3" r="2" fill="#111620"/>
      <path d="M -4 5 Q 0 8 4 5" fill="none" stroke="#111620" stroke-width="1.5"/>
      <!-- Sweeping Laser Scanline -->
      <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#45BA4B" stroke-width="1.8" class="pw-scanner"/>
    </g>
  `, `
    @keyframes pwScan {
      0% { transform: translateY(0); opacity: 0.3; }
      50% { transform: translateY(18px); opacity: 1; filter: drop-shadow(0 0 5px #45BA4B); }
      100% { transform: translateY(0); opacity: 0.3; }
    }
    .pw-scanner { animation: pwScan 2.4s infinite ease-in-out; }
  `),

  'chrome-devtools': wrapSvg('chrome-devtools', `
    <g transform="translate(32, 32)">
      <!-- Terminal Console -->
      <rect x="-14" y="-12" width="28" height="24" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1.4"/>
      <text x="-10" y="3" class="mono" font-size="11" font-weight="900" fill="#38BDF8">&gt;</text>
      <!-- Blinking Cursor -->
      <line x1="-2" y1="2" x2="4" y2="2" stroke="#FFFFFF" stroke-width="2" class="dt-cursor"/>
    </g>
  `, `
    @keyframes dtBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .dt-cursor { animation: dtBlink 1s infinite; }
  `),

  // ──────────────────────────────────────────────────────────────────────────
  // 8. DEPLOYMENT / SERVICES
  // ──────────────────────────────────────────────────────────────────────────
  'vercel': wrapSvg('vercel', `
    <g transform="translate(32, 32)" class="vercel-tri">
      <polygon points="0,-16 16,14 -16,14" fill="#FFFFFF"/>
    </g>
  `, `
    @keyframes vercelGlow {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.4)); }
      50% { transform: translate(32px, 32px) scale(1.06); filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9)); }
    }
    .vercel-tri { animation: vercelGlow 3s infinite ease-in-out; }
  `),

  'supabase': wrapSvg('supabase', `
    <g transform="translate(32, 32)" class="supa-bolt">
      <path d="M -4 -16 L 14 -16 C 16 -16 17 -14 16 -12 L 4 4 L 12 4 C 14 4 15 7 13 9 L -6 24 C -8 26 -10 24 -9 22 L 0 6 L -8 6 C -10 6 -11 3 -10 1 Z" fill="#3ECF8E"/>
    </g>
  `, `
    @keyframes supaPulse {
      0%, 100% { transform: translate(32px, 32px) scale(1); filter: drop-shadow(0 0 3px #3ECF8E); }
      50% { transform: translate(32px, 32px) scale(1.08); filter: drop-shadow(0 0 11px #3ECF8E); }
    }
    .supa-bolt { animation: supaPulse 2.6s infinite ease-in-out; }
  `),

  'github-actions': wrapSvg('github-actions', `
    <g transform="translate(32, 32)" class="gha-spin">
      <!-- Looping Arrows Circle -->
      <circle cx="0" cy="0" r="14" fill="none" stroke="#2088FF" stroke-width="2.5" stroke-dasharray="24 10" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="4.5" fill="#2088FF"/>
    </g>
  `, `
    @keyframes ghaRotate {
      0% { transform: translate(32px, 32px) rotate(0deg); }
      100% { transform: translate(32px, 32px) rotate(360deg); }
    }
    .gha-spin { animation: ghaRotate 6s infinite linear; }
  `),
};

// Generate all SVG files
let count = 0;
for (const [name, content] of Object.entries(ICONS)) {
  const filePath = path.join(ICONS_DIR, `${name}.svg`);
  fs.writeFileSync(filePath, content, 'utf-8');
  count++;
}

console.log(`[+] Successfully generated all ${count} animated tech stack SVG icons in ${ICONS_DIR}`);
