const fs = require('fs');
const path = require('path');

const W = 2400;
const H = 1500;

function generateSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">
  <defs>
    <!-- Background Dot Pattern -->
    <pattern id="dotGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="24" cy="24" r="1.5" fill="#DDD9CC" opacity="0.65" />
    </pattern>

    <!-- Drop Shadows -->
    <filter id="tileShadow" x="-30%" y="-25%" width="160%" height="175%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#44403c" flood-opacity="0.12" />
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#44403c" flood-opacity="0.08" />
    </filter>

    <filter id="slabShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#78716c" flood-opacity="0.10" />
    </filter>

    <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Gradients -->
    <linearGradient id="crystalTopLeft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c4b5fd" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="crystalTopRight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="crystalBotLeft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="crystalBotRight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6d28d9" />
      <stop offset="100%" stop-color="#4c1d95" />
    </linearGradient>

    <!-- Water Canal Gradient -->
    <linearGradient id="waterFlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cce7eb" />
      <stop offset="50%" stop-color="#b6dee3" />
      <stop offset="100%" stop-color="#cce7eb" />
    </linearGradient>

    <!-- Glass Shrine -->
    <linearGradient id="glassFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(215, 235, 237, 0.65)" />
      <stop offset="100%" stop-color="rgba(182, 218, 222, 0.35)" />
    </linearGradient>

    <!-- Rocket Flame -->
    <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
    </linearGradient>
  </defs>

  <style>
    /* <![CDATA[ */
    /* Fonts and Typography */
    .serif-title { font-family: 'Playfair Display', 'Bodoni MT', 'Didot', Georgia, serif; font-weight: 700; }
    .serif-italic { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
    .mono-meta { font-family: 'SF Mono', 'Geist Mono', 'Cascadia Code', Menlo, monospace; }
    .sans-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 700; }

    /* Diorama & Environment Animations */
    @keyframes crystalHover {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-16px) rotate(1.5deg); }
    }
    .anim-crystal {
      animation: crystalHover 4s ease-in-out infinite;
      transform-origin: 1200px 700px;
    }

    @keyframes pulseData {
      0% { stroke-dashoffset: 96; }
      100% { stroke-dashoffset: 0; }
    }
    .water-stream {
      stroke-dasharray: 12, 20;
      animation: pulseData 3s linear infinite;
    }

    @keyframes rocketHover {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(-1deg); }
    }
    .anim-rocket {
      animation: rocketHover 3.2s ease-in-out infinite;
      transform-origin: 1720px 1230px;
    }

    @keyframes flameFlicker {
      0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
      50% { transform: scaleY(1.25) scaleX(0.92); opacity: 1; }
    }
    .anim-flame {
      animation: flameFlicker 0.35s ease-in-out infinite alternate;
      transform-origin: 1720px 1290px;
    }

    @keyframes gyroSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .anim-gyro {
      animation: gyroSpin 16s linear infinite;
      transform-origin: 1220px 340px;
    }

    @keyframes dishSway {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(4deg); }
    }
    .anim-dish-1 { animation: dishSway 4.5s ease-in-out infinite; transform-origin: 1870px 390px; }
    .anim-dish-2 { animation: dishSway 3.8s ease-in-out infinite reverse; transform-origin: 1960px 345px; }
    .anim-dish-3 { animation: dishSway 4.2s ease-in-out infinite 1s; transform-origin: 2050px 410px; }

    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .anim-blink { animation: blink 1s steps(1) infinite; }

    @keyframes birdDrift {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(12px, -6px); }
    }
    .anim-bird { animation: birdDrift 6s ease-in-out infinite; }

    /* ==================================================== */
    /* 🌟 3D SPINNING & KINETIC LOGO ANIMATIONS (60FPS)     */
    /* ==================================================== */

    /* 3D Coin Flip / Y-Axis Spin (Simulated Perspective) */
    @keyframes spin3D_Y {
      0% { transform: scaleX(1); }
      25% { transform: scaleX(0.12) skewY(-4deg); }
      50% { transform: scaleX(-1); }
      75% { transform: scaleX(-0.12) skewY(4deg); }
      100% { transform: scaleX(1); }
    }

    /* Transform-box rule ensuring all logo elements rotate around their own centers */
    .anim-react-1, .anim-react-2, .anim-react-3, .anim-react-core,
    .anim-spin-ts, .anim-spin-js, .anim-spin-css, .anim-spin-html,
    .anim-vite, .anim-tailwind,
    .anim-threejs, .anim-three-inner, .anim-r3f, .anim-drei-ring, .anim-drei-cross, .anim-webgl, .anim-glsl-top, .anim-glsl-bot, .anim-spline,
    .anim-gsap, .anim-eye-pupil, .anim-eye-core, .anim-motion, .anim-spring, .anim-lenis-1, .anim-lenis-2, .anim-lenis-3,
    .anim-svg-cross, .anim-canvas-ring, .anim-mermaid, .anim-waapi,
    .anim-chrome-api, .anim-scripts, .anim-worker, .anim-storage,
    .anim-py-blue, .anim-py-yellow, .anim-node, .anim-npm, .anim-git-node, .anim-github, .anim-playwright, .anim-devtools,
    .anim-vercel, .anim-supabase, .anim-actions {
      transform-box: fill-box;
      transform-origin: center;
    }

    /* 3D Axial Rotation */
    @keyframes rotateClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes rotateCounterClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(-360deg); }
    }

    /* React 3-Axis Electron Orbit Spin */
    @keyframes reactOrbit1 {
      0% { transform: rotate(30deg); }
      100% { transform: rotate(390deg); }
    }
    @keyframes reactOrbit2 {
      0% { transform: rotate(90deg); }
      100% { transform: rotate(450deg); }
    }
    @keyframes reactOrbit3 {
      0% { transform: rotate(150deg); }
      100% { transform: rotate(510deg); }
    }
    @keyframes reactNucleusPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.35); }
    }
    .anim-react-1 { animation: reactOrbit1 5s linear infinite; transform-origin: 36px 36px; }
    .anim-react-2 { animation: reactOrbit2 7s linear infinite reverse; transform-origin: 36px 36px; }
    .anim-react-3 { animation: reactOrbit3 9s linear infinite; transform-origin: 36px 36px; }
    .anim-react-core { animation: reactNucleusPulse 2s ease-in-out infinite; transform-origin: 36px 36px; }

    /* TypeScript & JavaScript 3D Coin Flip */
    .anim-spin-ts { animation: spin3D_Y 6s ease-in-out infinite; transform-origin: 36px 36px; }
    .anim-spin-js { animation: spin3D_Y 6s ease-in-out infinite 1.5s; transform-origin: 36px 36px; }

    /* Vite Electric Surge */
    @keyframes viteBolt {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.15) rotate(-4deg); }
      50% { transform: scale(0.95) rotate(2deg); }
      75% { transform: scale(1.12) rotate(-2deg); }
    }
    .anim-vite { animation: viteBolt 2.2s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Tailwind Wave Flow */
    @keyframes tailwindFlow {
      0%, 100% { transform: scaleX(1) translateY(0); }
      50% { transform: scaleX(1.12) translateY(-2px); }
    }
    .anim-tailwind { animation: tailwindFlow 3s ease-in-out infinite; transform-origin: 36px 36px; }

    /* HTML5 & CSS3 Shields 3D Spin */
    .anim-spin-css { animation: spin3D_Y 7s ease-in-out infinite 0.8s; transform-origin: 36px 36px; }
    .anim-spin-html { animation: spin3D_Y 7s ease-in-out infinite 2.2s; transform-origin: 36px 36px; }

    /* Three.js 3D Isometric Cube Spin */
    @keyframes threeCubeSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes threeInnerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.7) rotate(45deg); }
    }
    .anim-threejs { animation: threeCubeSpin 10s linear infinite; transform-origin: 36px 36px; }
    .anim-three-inner { animation: threeInnerPulse 3s ease-in-out infinite; transform-origin: 36px 36px; }

    /* R3F Purple Rhombus 3D Spin */
    @keyframes r3fRhombus {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(0.78); }
      100% { transform: rotate(360deg) scale(1); }
    }
    .anim-r3f { animation: r3fRhombus 6s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Drei Reticle Rotation & Crosshair Pulse */
    .anim-drei-ring { animation: rotateClockwise 12s linear infinite; transform-origin: 36px 36px; }
    @keyframes dreiCross {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .anim-drei-cross { animation: dreiCross 2.5s ease-in-out infinite; transform-origin: 36px 36px; }

    /* WebGL Wireframe Pyramid 3D Spin */
    .anim-webgl { animation: spin3D_Y 5s ease-in-out infinite; transform-origin: 36px 36px; }

    /* GLSL Shader Diamond Layer Separation */
    @keyframes glslTop {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    @keyframes glslBottom {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }
    .anim-glsl-top { animation: glslTop 2.8s ease-in-out infinite; transform-origin: 36px 36px; }
    .anim-glsl-bot { animation: glslBottom 2.8s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Spline 3D Möbius Curve Loop */
    @keyframes splineLoop {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.14); }
      100% { transform: rotate(360deg) scale(1); }
    }
    .anim-spline { animation: splineLoop 8s ease-in-out infinite; transform-origin: 36px 36px; }

    /* GSAP Kinetic Hourglass Twist */
    @keyframes gsapTwist {
      0% { transform: rotate(0deg) scale(1); }
      25% { transform: rotate(90deg) scale(1.15); }
      50% { transform: rotate(180deg) scale(1); }
      75% { transform: rotate(270deg) scale(1.15); }
      100% { transform: rotate(360deg) scale(1); }
    }
    .anim-gsap { animation: gsapTwist 7s ease-in-out infinite; transform-origin: 36px 36px; }

    /* ScrollTrigger Eye Look & Dilate */
    @keyframes eyeLook {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    @keyframes eyeDilate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.35); }
    }
    .anim-eye-pupil { animation: eyeLook 3s ease-in-out infinite; transform-origin: 36px 36px; }
    .anim-eye-core { animation: eyeDilate 2s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Motion (Framer) Physics Rebound */
    @keyframes framerRebound {
      0%, 100% { transform: translateY(0) scaleY(1); }
      40% { transform: translateY(-7px) scaleY(1.16); }
      60% { transform: translateY(2px) scaleY(0.9); }
    }
    .anim-motion { animation: framerRebound 2.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; transform-origin: 36px 36px; }

    /* React Spring Physics Coil */
    @keyframes springCoil {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.62) translateY(5px); }
    }
    .anim-spring { animation: springCoil 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite; transform-origin: 36px 36px; }

    /* Lenis Smooth Wave Undulation */
    @keyframes wavePhase1 { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    @keyframes wavePhase2 { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
    @keyframes wavePhase3 { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
    .anim-lenis-1 { animation: wavePhase1 2.2s ease-in-out infinite; transform-origin: 36px 36px; }
    .anim-lenis-2 { animation: wavePhase2 2.2s ease-in-out infinite 0.3s; transform-origin: 36px 36px; }
    .anim-lenis-3 { animation: wavePhase3 2.2s ease-in-out infinite 0.6s; transform-origin: 36px 36px; }

    /* SVG Cross Node Spin */
    .anim-svg-cross { animation: rotateClockwise 8s linear infinite; transform-origin: 36px 36px; }

    /* Canvas Orbital Ring Spin */
    .anim-canvas-ring { animation: rotateCounterClockwise 6s linear infinite; transform-origin: 36px 36px; }

    /* Mermaid Node Pulse */
    @keyframes mermaidRotate {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.15); }
      100% { transform: rotate(360deg) scale(1); }
    }
    .anim-mermaid { animation: mermaidRotate 6s ease-in-out infinite; transform-origin: 36px 36px; }

    /* WAAPI Play Triangle Pulse */
    @keyframes waapiPlay {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.22); }
    }
    .anim-waapi { animation: waapiPlay 1.6s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Chrome APIs Aperture Spin */
    .anim-chrome-api { animation: rotateClockwise 10s linear infinite; transform-origin: 36px 36px; }

    /* Manifest V3 Laser Scan */
    @keyframes laserSweep {
      0%, 100% { transform: translateY(0); opacity: 0.3; }
      50% { transform: translateY(18px); opacity: 1; stroke: #2563eb; }
    }
    .anim-manifest-scan { animation: laserSweep 2s ease-in-out infinite; }

    /* Content Scripts Code Bracket Expansion */
    @keyframes scriptBreath {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.18); }
    }
    .anim-scripts { animation: scriptBreath 2s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Service Workers 3D Gear/Shield Tilt */
    .anim-worker { animation: spin3D_Y 8s ease-in-out infinite 1s; transform-origin: 36px 36px; }

    /* Chrome Storage Disk Head Sweep */
    @keyframes diskBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .anim-storage { animation: diskBob 2.5s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Python Snakes Gliding Past Each Other */
    @keyframes snakeBlue { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    @keyframes snakeYellow { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
    .anim-py-blue { animation: snakeBlue 2.4s ease-in-out infinite; }
    .anim-py-yellow { animation: snakeYellow 2.4s ease-in-out infinite; }

    /* Node.js Hexagon 3D Flip */
    .anim-node { animation: spin3D_Y 7s ease-in-out infinite 0.5s; transform-origin: 36px 36px; }

    /* npm Terminal Prompt Flash */
    @keyframes npmCursor {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15) translateX(2px); }
    }
    .anim-npm { animation: npmCursor 1.5s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Git Commit Node Pulse */
    @keyframes gitCommitPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); fill: #f97316; }
    }
    .anim-git-node { animation: gitCommitPulse 2s ease-in-out infinite; transform-origin: 36px 47px; }

    /* GitHub Octocat Orbit Spin */
    .anim-github { animation: rotateClockwise 14s linear infinite; transform-origin: 36px 36px; }

    /* Playwright Chevron Flex */
    @keyframes pwFlex {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(3.5px); }
    }
    .anim-playwright { animation: pwFlex 1.8s ease-in-out infinite; transform-origin: 36px 36px; }

    /* DevTools Hexagon Spin */
    .anim-devtools { animation: rotateClockwise 9s linear infinite; transform-origin: 36px 36px; }

    /* Vercel 3D Triangle Spin */
    .anim-vercel { animation: spin3D_Y 4.5s ease-in-out infinite; transform-origin: 36px 36px; }

    /* Supabase Emerald Lightning Pulse */
    @keyframes supaPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.16); }
    }
    .anim-supabase { animation: supaPulse 2.2s ease-in-out infinite; transform-origin: 36px 36px; }

    /* GitHub Actions CI/CD Pipeline Spin */
    .anim-actions { animation: rotateClockwise 5s linear infinite; transform-origin: 36px 36px; }

    /* Interactive Tile Badge Hover */
    .tile-badge {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .tile-badge:hover {
      transform: translateY(-8px);
    }
    /* ]]> */
  </style>

  <!-- ================= BACKGROUND CANVAS ================= -->
  <rect width="${W}" height="${H}" fill="#F6F5EF" />
  <rect width="${W}" height="${H}" fill="url(#dotGrid)" />

  <!-- Subtle Outer Border -->
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#E5E2D5" stroke-width="1" />

  <!-- ================= SEAGULLS / BIRDS ================= -->
  <g class="anim-bird" fill="none" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round">
    <path d="M 680 430 Q 692 422 704 430 Q 716 422 728 430" />
    <path d="M 720 460 Q 730 454 740 460 Q 750 454 760 460" />
    <path d="M 1660 370 Q 1672 362 1684 370 Q 1696 362 1708 370" />
    <path d="M 1720 400 Q 1730 394 1740 400 Q 1750 394 1760 400" />
  </g>

  <!-- ================= TOP LEFT HEADER ================= -->
  <g id="header-top-left">
    <text x="140" y="145" class="serif-title" font-size="64" fill="#1c1917" letter-spacing="2">TECH STACK</text>
    <text x="140" y="195" class="serif-italic" font-size="24" fill="#78716c">Tools that turn ideas into reality.</text>
    <line x1="140" y1="230" x2="880" y2="230" stroke="#d6d3c7" stroke-width="1.5" />
    <text x="140" y="270" class="mono-meta" font-size="14" fill="#78716c" letter-spacing="5">ANISH JHA / SELECTED TOOLS / 2026</text>
  </g>

  <!-- ================= TOP RIGHT HEADER ================= -->
  <g id="header-top-right">
    <text x="1560" y="135" class="serif-italic" font-size="22" fill="#57534e">A curated set of technologies</text>
    <text x="1560" y="168" class="serif-italic" font-size="22" fill="#57534e">I use to design, develop and ship</text>
    <text x="1560" y="201" class="serif-italic" font-size="22" fill="#57534e">interactive experiences on the web.</text>

    <!-- Checklist with dot marker -->
    <circle cx="2160" cy="128" r="5" fill="#1c1917" />
    <line x1="2160" y1="144" x2="2160" y2="258" stroke="#d6d3c7" stroke-width="1.5" />
    <g class="mono-meta" font-size="13" fill="#78716c" letter-spacing="3">
      <text x="2185" y="133">BUILD</text>
      <text x="2185" y="163">EXPLORE</text>
      <text x="2185" y="193">CREATE</text>
      <text x="2185" y="223">IMPROVE</text>
      <text x="2185" y="253">REPEAT</text>
    </g>
  </g>

  <!-- ================= WATER CANALS / AQUEDUCTS ================= -->
  <g id="water-canals">
    <!-- Canal: Center to 01 Web -->
    <path d="M 1120 780 L 580 580" fill="none" stroke="url(#waterFlow)" stroke-width="26" stroke-linecap="round" />
    <path d="M 1120 780 L 580 580" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 02 3D -->
    <path d="M 1200 730 L 1220 460" fill="none" stroke="url(#waterFlow)" stroke-width="28" stroke-linecap="round" />
    <path d="M 1200 730 L 1220 460" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 03 Motion -->
    <path d="M 1280 770 L 1820 560" fill="none" stroke="url(#waterFlow)" stroke-width="26" stroke-linecap="round" />
    <path d="M 1280 770 L 1820 560" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 04 Graphics -->
    <path d="M 1110 830 L 530 920" fill="none" stroke="url(#waterFlow)" stroke-width="26" stroke-linecap="round" />
    <path d="M 1110 830 L 530 920" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 05 Browser -->
    <path d="M 1290 830 L 1860 920" fill="none" stroke="url(#waterFlow)" stroke-width="26" stroke-linecap="round" />
    <path d="M 1290 830 L 1860 920" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 06 Engineering -->
    <path d="M 1130 870 L 680 1200" fill="none" stroke="url(#waterFlow)" stroke-width="28" stroke-linecap="round" />
    <path d="M 1130 870 L 680 1200" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />

    <!-- Canal: Center to 07 Deployment -->
    <path d="M 1270 870 L 1720 1200" fill="none" stroke="url(#waterFlow)" stroke-width="28" stroke-linecap="round" />
    <path d="M 1270 870 L 1720 1200" fill="none" stroke="#72b5bc" stroke-width="2" class="water-stream" />
  </g>

  <!-- ================= CENTRAL MONOLITH ISLAND ================= -->
  <g id="central-island">
    <!-- Water Moat Ring -->
    <ellipse cx="1200" cy="840" rx="340" ry="170" fill="#cce7eb" stroke="#a4d3d8" stroke-width="3" />

    <!-- Main Stepped Isometric Slab -->
    <g filter="url(#slabShadow)">
      <!-- Base Slab -->
      <path d="M 1200 700 L 1440 820 L 1200 940 L 960 820 Z" fill="#E8E5DC" />
      <path d="M 960 820 L 1200 940 L 1200 985 L 960 865 Z" fill="#C0BAAC" />
      <path d="M 1200 940 L 1440 820 L 1440 865 L 1200 985 Z" fill="#9E988A" />

      <!-- Inner Stepped Plinth -->
      <path d="M 1200 730 L 1380 820 L 1200 910 L 1020 820 Z" fill="#F0EDE4" stroke="#DBD7C9" stroke-width="1.5" />
    </g>

    <!-- Miniature Trees around Island -->
    <line x1="1005" y1="830" x2="1005" y2="850" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
    <circle cx="1005" cy="824" r="14" fill="#607d67" />
    <circle cx="1001" cy="820" r="9" fill="#75977d" />

    <line x1="1070" y1="770" x2="1070" y2="790" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
    <circle cx="1070" cy="764" r="13" fill="#607d67" />
    <circle cx="1067" cy="760" r="8" fill="#75977d" />

    <line x1="1080" y1="895" x2="1080" y2="915" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
    <circle cx="1080" cy="889" r="14" fill="#607d67" />

    <line x1="1395" y1="830" x2="1395" y2="850" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
    <circle cx="1395" cy="824" r="14" fill="#607d67" />

    <line x1="1320" y1="895" x2="1320" y2="915" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
    <circle cx="1320" cy="889" r="14" fill="#607d67" />

    <!-- Glass Shrine Cuboid -->
    <g id="glass-shrine">
      <polygon points="1120,760 1280,760 1280,875 1120,875" fill="rgba(205, 230, 233, 0.4)" stroke="#9bc2c5" stroke-width="1.5" />
      <text x="1200" y="805" text-anchor="middle" class="serif-title" font-size="22" font-weight="700" fill="#292524" letter-spacing="4">CREATE</text>
      <text x="1200" y="837" text-anchor="middle" class="serif-title" font-size="22" font-weight="700" fill="#292524" letter-spacing="4">BUILD</text>
      <text x="1200" y="869" text-anchor="middle" class="serif-title" font-size="22" font-weight="700" fill="#292524" letter-spacing="4">SHIP</text>

      <polygon points="1105,790 1200,740 1295,790 1200,840" fill="url(#glassFace)" stroke="#89b7ba" stroke-width="1.5" />
      <line x1="1105" y1="790" x2="1105" y2="905" stroke="#89b7ba" stroke-width="2" />
      <line x1="1200" y1="840" x2="1200" y2="955" stroke="#89b7ba" stroke-width="2" />
      <line x1="1295" y1="790" x2="1295" y2="905" stroke="#89b7ba" stroke-width="2" />
      <polygon points="1105,905 1200,955 1295,905 1200,855" fill="none" stroke="#89b7ba" stroke-width="1.5" />
    </g>

    <!-- Levitating Crystal Monolith -->
    <g class="anim-crystal" filter="url(#crystalGlow)">
      <ellipse cx="1200" cy="740" rx="35" ry="12" fill="rgba(109, 40, 217, 0.25)" />
      <polygon points="1200,580 1140,680 1200,730" fill="url(#crystalTopLeft)" />
      <polygon points="1200,580 1200,730 1260,680" fill="url(#crystalTopRight)" />
      <polygon points="1200,795 1140,680 1200,730" fill="url(#crystalBotLeft)" />
      <polygon points="1200,795 1200,730 1260,680" fill="url(#crystalBotRight)" />
      <line x1="1200" y1="580" x2="1200" y2="795" stroke="#ede9fe" stroke-width="2" opacity="0.8" />
    </g>
  </g>

  <!-- ================= 01 / WEB ISLAND ================= -->
  <g id="zone-01-web">
    <text x="140" y="370" class="serif-title" font-size="34" fill="#1c1917">01 / WEB</text>
    <text x="140" y="405" class="serif-italic" font-size="22" fill="#57534e">Build interfaces that feel alive.</text>
    <text x="140" y="445" class="serif-italic" font-size="18" fill="#78716c">From design to delightful interfaces.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 460 480 L 800 610 L 460 740 L 120 610 Z" fill="#E8E5DC" />
      <path d="M 120 610 L 460 740 L 460 775 L 120 645 Z" fill="#C0BAAC" />
      <path d="M 460 740 L 800 610 L 800 645 L 460 775 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Desktop Screen with Code -->
    <g id="diorama-web-screen">
      <rect x="255" y="555" width="20" height="30" fill="#a8a29e" />
      <ellipse cx="265" cy="585" rx="22" ry="7" fill="#78716c" />
      <rect x="180" y="475" width="170" height="110" rx="8" fill="#3a3734" stroke="#292524" stroke-width="2" />
      <rect x="190" y="485" width="150" height="90" rx="4" fill="#1c1917" />
      <line x1="205" y1="505" x2="260" y2="505" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
      <line x1="205" y1="525" x2="295" y2="525" stroke="#f472b6" stroke-width="3.5" stroke-linecap="round" />
      <line x1="205" y1="545" x2="250" y2="545" stroke="#4ade80" stroke-width="3.5" stroke-linecap="round" />
      <rect x="258" y="538" width="7" height="12" fill="#38bdf8" class="anim-blink" />
      <circle cx="355" cy="485" r="16" fill="#607d67" />
      <circle cx="365" cy="495" r="12" fill="#75977d" />
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. React (3-Axis Spinning Orbit Model) -->
    <g class="tile-badge" transform="translate(390, 480)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g>
        <ellipse cx="36" cy="36" rx="21" ry="7.5" fill="none" stroke="#0284c7" stroke-width="3" class="anim-react-1" />
        <ellipse cx="36" cy="36" rx="21" ry="7.5" fill="none" stroke="#0284c7" stroke-width="3" class="anim-react-2" />
        <ellipse cx="36" cy="36" rx="21" ry="7.5" fill="none" stroke="#0284c7" stroke-width="3" class="anim-react-3" />
        <circle cx="36" cy="36" r="4.5" fill="#0284c7" class="anim-react-core" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">React</text>
    </g>

    <!-- 2. Vite (Electric Lightning Bolt Surge) -->
    <g class="tile-badge" transform="translate(485, 480)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-vite">
        <polygon points="40,15 25,38 35,38 32,57 47,32 37,32" fill="#7c3aed" stroke="#6d28d9" stroke-width="1" />
        <polygon points="39,17 27,37 35,37 33,53 45,33 37,33" fill="#fbbf24" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Vite</text>
    </g>

    <!-- 3. Tailwind CSS (Flowing Wind Ribbon) -->
    <g class="tile-badge" transform="translate(580, 480)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <path d="M 23 36 C 26 26, 36 26, 39 31 C 42 36, 46 42, 51 42 C 57 42, 59 36, 59 36 C 56 46, 46 46, 43 41 C 40 36, 36 30, 31 30 C 25 30, 23 36, 23 36 Z" fill="#06b6d4" class="anim-tailwind" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Tailwind</text>
    </g>

    <!-- 4. CSS3 (3D Spinning Shield) -->
    <g class="tile-badge" transform="translate(675, 480)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spin-css">
        <polygon points="18,16 54,16 50,54 36,58 22,54" fill="#2563eb" />
        <text x="36" y="44" text-anchor="middle" class="sans-label" font-size="18" fill="#FFFFFF">3</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">CSS3</text>
    </g>

    <!-- 5. JavaScript (3D Spinning Gold Tile) -->
    <g class="tile-badge" transform="translate(435, 575)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spin-js">
        <rect x="11" y="11" width="50" height="50" rx="8" fill="#eab308" />
        <text x="36" y="44" text-anchor="middle" class="sans-label" font-size="22" fill="#1c1917">JS</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">JavaScript</text>
    </g>

    <!-- 6. TypeScript (3D Spinning Amber Tile) -->
    <g class="tile-badge" transform="translate(535, 575)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spin-ts">
        <rect x="11" y="11" width="50" height="50" rx="8" fill="#d97706" />
        <text x="36" y="44" text-anchor="middle" class="sans-label" font-size="22" fill="#FFFFFF">TS</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">TypeScript</text>
    </g>

    <!-- 7. HTML5 (3D Spinning Orange Shield) -->
    <g class="tile-badge" transform="translate(635, 575)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spin-html">
        <polygon points="18,16 54,16 50,54 36,58 22,54" fill="#ea580c" />
        <text x="36" y="44" text-anchor="middle" class="sans-label" font-size="18" fill="#FFFFFF">5</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">HTML5</text>
    </g>
  </g>

  <!-- ================= 02 / 3D + INTERACTIVE ISLAND ================= -->
  <g id="zone-02-3d">
    <text x="680" y="210" class="serif-title" font-size="34" fill="#1c1917">02 / 3D + INTERACTIVE</text>
    <text x="680" y="245" class="serif-italic" font-size="22" fill="#57534e">Turn ideas into interactive worlds.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 1220 280 L 1600 410 L 1220 540 L 840 410 Z" fill="#E8E5DC" />
      <path d="M 840 410 L 1220 540 L 1220 575 L 840 445 Z" fill="#C0BAAC" />
      <path d="M 1220 540 L 1600 410 L 1600 445 L 1220 575 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Celestial Gyroscope / Armillary Sphere -->
    <g id="diorama-armillary">
      <polygon points="1165,400 1195,310 1210,315 1180,405" fill="#d6d1c4" />
      <polygon points="1275,400 1245,310 1230,315 1260,405" fill="#b3ad9f" />
      <polygon points="1220,420 1220,320 1228,320 1228,420" fill="#c4beaf" />
      <circle cx="1220" cy="340" r="28" fill="#818cf8" opacity="0.3" stroke="#6366f1" stroke-width="1.5" />
      <circle cx="1220" cy="340" r="10" fill="#a78bfa" />
      <g class="anim-gyro">
        <ellipse cx="1220" cy="340" rx="46" ry="18" fill="none" stroke="#78716c" stroke-width="2.5" transform="rotate(35 1220 340)" />
        <ellipse cx="1220" cy="340" rx="46" ry="18" fill="none" stroke="#92400e" stroke-width="2" transform="rotate(-40 1220 340)" />
      </g>
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. Three.js (Continuous 3D Rotating Cube) -->
    <g class="tile-badge" transform="translate(890, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-threejs">
        <polygon points="36,15 56,27 36,39 16,27" fill="#383533" />
        <polygon points="16,27 36,39 36,57 16,45" fill="#292524" />
        <polygon points="36,39 56,27 56,45 36,57" fill="#1c1917" />
        <polygon points="36,25 46,31 36,37 26,31" fill="#a8a29e" class="anim-three-inner" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Three.js</text>
    </g>

    <!-- 2. R3F (Spinning Purple Rhombus) -->
    <g class="tile-badge" transform="translate(995, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-r3f">
        <polygon points="36,15 58,36 36,57 14,36" fill="#8b5cf6" />
        <polygon points="36,15 36,57 58,36" fill="#7c3aed" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">R3F</text>
    </g>

    <!-- 3. Drei (Spinning Reticle Target) -->
    <g class="tile-badge" transform="translate(1100, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-drei-ring">
        <circle cx="36" cy="36" r="21" fill="none" stroke="#52525b" stroke-width="6.5" />
      </g>
      <g class="anim-drei-cross">
        <line x1="36" y1="12" x2="36" y2="60" stroke="#52525b" stroke-width="2.5" />
        <line x1="12" y1="36" x2="60" y2="36" stroke="#52525b" stroke-width="2.5" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Drei</text>
    </g>

    <!-- 4. WebGL (3D Spinning Wireframe Pyramid) -->
    <g class="tile-badge" transform="translate(1205, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-webgl">
        <polygon points="36,17 57,55 15,55" fill="none" stroke="#0d9488" stroke-width="2" />
        <line x1="36" y1="17" x2="36" y2="55" stroke="#0d9488" stroke-width="1.5" />
        <polygon points="36,17 36,55 15,55" fill="rgba(13, 148, 136, 0.25)" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">WebGL</text>
    </g>

    <!-- 5. GLSL (Breathing Stacked Diamonds) -->
    <g class="tile-badge" transform="translate(1310, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g>
        <polygon points="36,17 54,28 36,39 18,28" fill="#818cf8" class="anim-glsl-top" />
        <polygon points="36,32 54,43 36,54 18,43" fill="#4f46e5" class="anim-glsl-bot" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">GLSL</text>
    </g>

    <!-- 6. Spline (Continuous 3D Möbius Curve Loop) -->
    <g class="tile-badge" transform="translate(1415, 420)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spline">
        <path d="M 22 46 C 20 28, 40 22, 48 30 C 56 38, 42 52, 28 46" fill="none" stroke="#ec4899" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="28" cy="46" r="3.5" fill="#f43f5e" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Spline</text>
    </g>
  </g>

  <!-- ================= 03 / MOTION ISLAND ================= -->
  <g id="zone-03-motion">
    <text x="1750" y="245" class="serif-italic" font-size="20" fill="#78716c">Smooth is a feeling.</text>
    <text x="1750" y="285" class="serif-title" font-size="34" fill="#1c1917">03 / MOTION</text>
    <text x="1750" y="320" class="serif-italic" font-size="22" fill="#57534e">Bring experiences to life.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 1940 450 L 2280 580 L 1940 710 L 1600 580 Z" fill="#E8E5DC" />
      <path d="M 1600 580 L 1940 710 L 1940 745 L 1600 615 Z" fill="#C0BAAC" />
      <path d="M 1940 710 L 2280 580 L 2280 615 L 1940 745 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Kinetic Antenna Towers -->
    <g id="diorama-antennae">
      <line x1="1780" y1="520" x2="2160" y2="520" stroke="#78716c" stroke-width="3" stroke-linecap="round" />
      
      <line x1="1870" y1="520" x2="1870" y2="400" stroke="#78716c" stroke-width="3.5" />
      <g class="anim-dish-1">
        <ellipse cx="1870" cy="390" rx="32" ry="14" fill="#d6d1c4" stroke="#78716c" stroke-width="2.5" />
      </g>

      <line x1="1960" y1="520" x2="1960" y2="350" stroke="#78716c" stroke-width="3.5" />
      <g class="anim-dish-2">
        <ellipse cx="1960" cy="345" rx="34" ry="16" fill="#d6d1c4" stroke="#78716c" stroke-width="2.5" />
      </g>

      <line x1="2050" y1="520" x2="2050" y2="420" stroke="#78716c" stroke-width="3.5" />
      <g class="anim-dish-3">
        <ellipse cx="2050" cy="410" rx="28" ry="12" fill="#d6d1c4" stroke="#78716c" stroke-width="2.5" />
      </g>
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. GSAP (Kinetic Twisting Hourglass) -->
    <g class="tile-badge" transform="translate(1675, 520)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-gsap">
        <path d="M 22 20 Q 36 36 22 52 L 50 52 Q 36 36 50 20 Z" fill="#65a30d" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">GSAP</text>
    </g>

    <!-- 2. ScrollTrigger (Animated Looking Eye) -->
    <g class="tile-badge" transform="translate(1780, 520)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <ellipse cx="36" cy="36" rx="21" ry="11" fill="none" stroke="#b45309" stroke-width="3" />
      <g class="anim-eye-pupil">
        <circle cx="36" cy="36" r="5.5" fill="#b45309" class="anim-eye-core" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">ScrollTrigger</text>
    </g>

    <!-- 3. Motion (Physical Spring Rebound) -->
    <g class="tile-badge" transform="translate(1885, 520)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-motion">
        <polygon points="18,48 36,22 45,36 54,22 72,48" fill="#64748b" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Motion</text>
    </g>

    <!-- 4. React Spring (Compressing & Rebounding Coil) -->
    <g class="tile-badge" transform="translate(1990, 520)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-spring">
        <path d="M 20 46 C 20 26, 32 26, 36 36 C 40 46, 52 46, 52 26" fill="none" stroke="#e11d48" stroke-width="3.5" stroke-linecap="round" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Spring</text>
    </g>

    <!-- 5. Lenis (Phase-Shifted Triple Wave) -->
    <g class="tile-badge" transform="translate(2095, 520)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <path d="M 18 26 Q 36 16 54 26" fill="none" stroke="#0f766e" stroke-width="3.8" stroke-linecap="round" class="anim-lenis-1" />
      <path d="M 18 37 Q 36 27 54 37" fill="none" stroke="#0f766e" stroke-width="3.8" stroke-linecap="round" class="anim-lenis-2" />
      <path d="M 18 48 Q 36 38 54 48" fill="none" stroke="#0f766e" stroke-width="3.8" stroke-linecap="round" class="anim-lenis-3" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Lenis</text>
    </g>
  </g>

  <!-- ================= 04 / GRAPHICS ISLAND ================= -->
  <g id="zone-04-graphics">
    <text x="140" y="780" class="serif-title" font-size="34" fill="#1c1917">04 / GRAPHICS</text>
    <text x="140" y="815" class="serif-italic" font-size="22" fill="#57534e">Shape visuals with code.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 440 850 L 780 980 L 440 1110 L 100 980 Z" fill="#E8E5DC" />
      <path d="M 100 980 L 440 1110 L 440 1145 L 100 1015 Z" fill="#C0BAAC" />
      <path d="M 440 1110 L 780 980 L 780 1015 L 440 1145 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Miniature Art Easel Canvas -->
    <g id="diorama-easel">
      <line x1="220" y1="960" x2="270" y2="840" stroke="#78716c" stroke-width="3.5" />
      <line x1="380" y1="960" x2="330" y2="840" stroke="#78716c" stroke-width="3.5" />
      <rect x="210" y="840" width="190" height="120" rx="6" fill="#FDFCF7" stroke="#b8b2a5" stroke-width="2.5" />
      <path d="M 225 940 Q 290 870 330 910 Q 360 930 385 940 Z" fill="#889985" />
      <circle cx="350" cy="875" r="12" fill="#d97706" />
      <path d="M 225 910 Q 280 890 310 905 T 385 890" fill="none" stroke="#292524" stroke-width="2.5" />
      <circle cx="385" cy="890" r="4" fill="#ef4444" />
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. SVG (Spinning Vector Cross) -->
    <g class="tile-badge" transform="translate(435, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-svg-cross">
        <line x1="20" y1="20" x2="52" y2="52" stroke="#1c1917" stroke-width="4.5" stroke-linecap="round" />
        <line x1="52" y1="20" x2="20" y2="52" stroke="#1c1917" stroke-width="4.5" stroke-linecap="round" />
      </g>
      <circle cx="36" cy="36" r="5" fill="#f59e0b" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">SVG</text>
    </g>

    <!-- 2. Canvas (Spinning Orbital Ring) -->
    <g class="tile-badge" transform="translate(535, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-canvas-ring">
        <circle cx="36" cy="36" r="19" fill="none" stroke="#0e7490" stroke-width="5.5" stroke-dasharray="25 6" />
      </g>
      <path d="M 23 41 Q 36 25 49 41" fill="none" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Canvas</text>
    </g>

    <!-- 3. Mermaid (Rotating Flowchart Node) -->
    <g class="tile-badge" transform="translate(635, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-mermaid">
        <polygon points="36,16 54,36 36,56 18,36" fill="none" stroke="#e11d48" stroke-width="3.5" />
        <circle cx="36" cy="36" r="4.5" fill="#e11d48" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Mermaid</text>
    </g>

    <!-- 4. Web Animations API (WAAPI Play Pulse) -->
    <g class="tile-badge" transform="translate(735, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <rect x="14" y="14" width="44" height="44" rx="8" fill="#b0a99b" />
      <g class="anim-waapi">
        <polygon points="31,26 47,36 31,46" fill="#FFFFFF" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">WAAPI</text>
    </g>
  </g>

  <!-- ================= 05 / BROWSER ISLAND ================= -->
  <g id="zone-05-browser">
    <text x="1820" y="730" class="serif-italic" font-size="20" fill="#78716c">Closer to the platform.</text>
    <text x="1800" y="780" class="serif-title" font-size="34" fill="#1c1917">05 / BROWSER</text>
    <text x="1800" y="815" class="serif-italic" font-size="22" fill="#57534e">Extend the web.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 1960 850 L 2300 980 L 1960 1110 L 1620 980 Z" fill="#E8E5DC" />
      <path d="M 1620 980 L 1960 1110 L 1960 1145 L 1620 1015 Z" fill="#C0BAAC" />
      <path d="M 1960 1110 L 2300 980 L 2300 1015 L 1960 1145 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Browser Window Frame -->
    <g id="diorama-browser">
      <rect x="1940" y="830" width="180" height="115" rx="8" fill="#FDFCF7" stroke="#b8b2a5" stroke-width="2.5" />
      <circle cx="1960" cy="850" r="5" fill="#78716c" />
      <rect x="1975" y="845" width="125" height="10" rx="3" fill="#e7e5e4" />
      <rect x="1960" y="875" width="140" height="7" rx="3" fill="#cbd5e1" />
      <rect x="1960" y="895" width="110" height="7" rx="3" fill="#cbd5e1" />
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. Chrome APIs (Spinning Aperture Ring) -->
    <g class="tile-badge" transform="translate(1660, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-chrome-api">
        <circle cx="36" cy="36" r="18" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="18 6" />
        <path d="M 23 36 Q 36 27 49 36 Q 36 45 23 36 Z" fill="#3b82f6" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Chrome APIs</text>
    </g>

    <!-- 2. Manifest V3 (Laser Document Scan) -->
    <g class="tile-badge" transform="translate(1765, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <rect x="18" y="15" width="36" height="42" rx="5" fill="#d6d3c7" />
      <line x1="25" y1="26" x2="47" y2="26" stroke="#1c1917" stroke-width="3" stroke-linecap="round" />
      <line x1="25" y1="36" x2="47" y2="36" stroke="#1c1917" stroke-width="3" stroke-linecap="round" />
      <line x1="25" y1="46" x2="39" y2="46" stroke="#1c1917" stroke-width="3" stroke-linecap="round" />
      <!-- Sweeping Laser Beam -->
      <line x1="16" y1="20" x2="56" y2="20" stroke="#3b82f6" stroke-width="2" class="anim-manifest-scan" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Manifest V3</text>
    </g>

    <!-- 3. Content Scripts (Breathing Code Injection) -->
    <g class="tile-badge" transform="translate(1870, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-scripts">
        <rect x="16" y="16" width="40" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" />
        <text x="24" y="42" class="mono-meta" font-size="18" font-weight="700" fill="#2563eb">&lt;/&gt;</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Scripts</text>
    </g>

    <!-- 4. Service Workers (3D Spinning Shield) -->
    <g class="tile-badge" transform="translate(1975, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-worker">
        <polygon points="18,18 54,18 54,42 36,54 18,42" fill="#718d7f" />
        <polyline points="27,32 36,41 45,32" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Workers</text>
    </g>

    <!-- 5. Chrome Storage (Bobbing Database Disks) -->
    <g class="tile-badge" transform="translate(2080, 890)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-storage">
        <ellipse cx="36" cy="24" rx="18" ry="7" fill="#64748b" />
        <path d="M 18 24 L 18 36 C 18 40, 54 40, 54 36 L 54 24" fill="#64748b" />
        <path d="M 18 36 L 18 48 C 18 52, 54 52, 54 48 L 54 36" fill="#475569" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Storage</text>
    </g>
  </g>

  <!-- ================= 06 / ENGINEERING ISLAND ================= -->
  <g id="zone-06-engineering">
    <text x="220" y="1120" class="serif-title" font-size="34" fill="#1c1917">06 / ENGINEERING</text>
    <text x="220" y="1155" class="serif-italic" font-size="22" fill="#57534e">Develop with confidence.</text>
    <text x="660" y="1155" class="serif-italic" font-size="20" fill="#78716c">Tools for better builders.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 520 1200 L 940 1330 L 520 1460 L 100 1330 Z" fill="#E8E5DC" />
      <path d="M 100 1330 L 520 1460 L 520 1495 L 100 1365 Z" fill="#C0BAAC" />
      <path d="M 520 1460 L 940 1330 L 940 1365 L 520 1495 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Terminal Screen Monitor -->
    <g id="diorama-terminal">
      <rect x="230" y="1180" width="160" height="100" rx="6" fill="#3a3734" stroke="#292524" stroke-width="2" />
      <rect x="240" y="1190" width="140" height="80" rx="3" fill="#1c1917" />
      <line x1="255" y1="1210" x2="315" y2="1210" stroke="#a3e635" stroke-width="3" stroke-linecap="round" />
      <line x1="255" y1="1228" x2="355" y2="1228" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
      <rect x="255" y="1240" width="6" height="10" fill="#a3e635" class="anim-blink" />
      <circle cx="405" cy="1190" r="14" fill="#607d67" />
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. Python (Gliding Interlocking Snakes) -->
    <g class="tile-badge" transform="translate(420, 1190)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <rect x="17" y="15" width="38" height="42" rx="4" fill="#e2ded4" />
      <line x1="23" y1="27" x2="47" y2="27" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" class="anim-py-blue" />
      <line x1="23" y1="36" x2="49" y2="36" stroke="#eab308" stroke-width="3" stroke-linecap="round" class="anim-py-yellow" />
      <line x1="23" y1="45" x2="37" y2="45" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" class="anim-py-blue" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Python</text>
    </g>

    <!-- 2. Node.js (3D Hexagon Flip) -->
    <g class="tile-badge" transform="translate(525, 1190)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-node">
        <rect x="17" y="15" width="38" height="42" rx="4" fill="#4d7c57" />
        <line x1="24" y1="27" x2="48" y2="27" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
        <line x1="24" y1="36" x2="48" y2="36" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
        <line x1="24" y1="45" x2="40" y2="45" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Node.js</text>
    </g>

    <!-- 3. npm (Flashing Command Prompt) -->
    <g class="tile-badge" transform="translate(630, 1190)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-npm">
        <rect x="15" y="15" width="42" height="42" rx="6" fill="#bfae99" />
        <text x="24" y="43" class="mono-meta" font-size="20" font-weight="700" fill="#1c1917">&gt;_</text>
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">npm</text>
    </g>

    <!-- 4. Git (Pulsing Commit Nodes) -->
    <g class="tile-badge" transform="translate(735, 1190)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <polygon points="36,15 56,27 56,49 36,59 16,49 16,27" fill="#9a5a4a" />
      <circle cx="27" cy="33" r="3.5" fill="#FFFFFF" />
      <circle cx="45" cy="33" r="3.5" fill="#FFFFFF" />
      <circle cx="36" cy="47" r="3.5" fill="#FFFFFF" class="anim-git-node" />
      <path d="M 27 33 L 36 41 L 36 47 M 45 33 L 36 41" stroke="#FFFFFF" stroke-width="2" fill="none" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Git</text>
    </g>

    <!-- 5. GitHub (Orbiting Radar Octocat Node) -->
    <g class="tile-badge" transform="translate(470, 1285)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <circle cx="36" cy="36" r="21" fill="#24292f" />
      <g class="anim-github">
        <circle cx="29" cy="33" r="4" fill="#FFFFFF" />
        <circle cx="43" cy="41" r="4" fill="#FFFFFF" />
        <line x1="29" y1="33" x2="43" y2="41" stroke="#FFFFFF" stroke-width="2.5" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">GitHub</text>
    </g>

    <!-- 6. Playwright (Testing Chevron Flex) -->
    <g class="tile-badge" transform="translate(575, 1285)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <polygon points="18,18 54,18 54,42 36,54 18,42" fill="#718d7f" />
      <polyline points="27,32 36,41 45,32" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="anim-playwright" />
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Playwright</text>
    </g>

    <!-- 7. DevTools (Rotating Inspector Hexagon) -->
    <g class="tile-badge" transform="translate(680, 1285)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-devtools">
        <polygon points="36,15 53,25 53,47 36,57 19,47 19,25" fill="none" stroke="#52525b" stroke-width="4.5" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">DevTools</text>
    </g>
  </g>

  <!-- ================= 07 / DEPLOYMENT ISLAND ================= -->
  <g id="zone-07-deployment">
    <text x="1560" y="1210" class="serif-italic" font-size="20" fill="#78716c">Make it real.</text>
    <text x="1720" y="1120" class="serif-title" font-size="34" fill="#1c1917">07 / DEPLOYMENT</text>
    <text x="1720" y="1155" class="serif-italic" font-size="22" fill="#57534e">Ship to the world.</text>

    <!-- Island Slab -->
    <g filter="url(#slabShadow)">
      <path d="M 1880 1200 L 2220 1330 L 1880 1460 L 1540 1330 Z" fill="#E8E5DC" />
      <path d="M 1540 1330 L 1880 1460 L 1880 1495 L 1540 1365 Z" fill="#C0BAAC" />
      <path d="M 1880 1460 L 2220 1330 L 2220 1365 L 1880 1495 Z" fill="#9E988A" />
    </g>

    <!-- Diorama: Retro Rocket on Launch Trajectory -->
    <g id="diorama-rocket" class="anim-rocket">
      <polygon points="1714,1276 1726,1276 1720,1325" fill="url(#flameGrad)" class="anim-flame" />
      <path d="M 1708 1253 L 1692 1276 L 1712 1272 Z" fill="#a8a29e" />
      <path d="M 1732 1253 L 1748 1276 L 1728 1272 Z" fill="#a8a29e" />
      <path d="M 1720 1178 Q 1740 1228 1732 1274 L 1708 1274 Q 1700 1228 1720 1178 Z" fill="#FDFCF7" stroke="#78716c" stroke-width="2.5" />
      <circle cx="1720" cy="1233" r="10" fill="#72b5bc" stroke="#57534e" stroke-width="2" />
    </g>

    <!-- Tech Badges with 3D Animations -->
    <!-- 1. Vercel (3D Spinning Black Diamond) -->
    <g class="tile-badge" transform="translate(1800, 1240)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-vercel">
        <polygon points="36,15 56,36 36,57 16,36" fill="#1c1917" />
        <polygon points="36,27 46,44 26,44" fill="#FFFFFF" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Vercel</text>
    </g>

    <!-- 2. Supabase (Pulsing Emerald Origami Surge) -->
    <g class="tile-badge" transform="translate(1910, 1240)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-supabase">
        <polygon points="36,15 55,39 39,39 45,57 19,33 35,33" fill="#528f73" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Supabase</text>
    </g>

    <!-- 3. Actions (Continuous CI/CD Pipeline Spin) -->
    <g class="tile-badge" transform="translate(2020, 1240)">
      <rect width="72" height="72" rx="14" fill="#FFFFFF" stroke="#E7E4DA" stroke-width="1.5" filter="url(#tileShadow)" />
      <g class="anim-actions">
        <circle cx="36" cy="36" r="21" fill="#d6d1c4" />
        <line x1="36" y1="22" x2="36" y2="50" stroke="#57534e" stroke-width="5.5" stroke-linecap="round" />
        <line x1="22" y1="36" x2="50" y2="36" stroke="#57534e" stroke-width="5.5" stroke-linecap="round" />
      </g>
      <text x="36" y="94" text-anchor="middle" class="sans-label" font-size="13" fill="#1c1917">Actions</text>
    </g>
  </g>

  <!-- ================= FOOTER ================= -->
  <g id="footer">
    <line x1="100" y1="1420" x2="2300" y2="1420" stroke="#d6d3c7" stroke-width="1.5" />
    <text x="100" y="1460" class="mono-meta" font-size="14" fill="#78716c" letter-spacing="4">ANISH JHA / TECH STACK</text>
    <text x="2300" y="1460" text-anchor="end" class="mono-meta" font-size="14" fill="#78716c" letter-spacing="4">IDEAS — CODE — EXPERIENCES</text>
  </g>
</svg>`;
}

const outputPath = path.join(__dirname, '..', 'assets', 'tech-stack.svg');
const svgContent = generateSVG();
fs.writeFileSync(outputPath, svgContent, 'utf8');
console.log(`[+] Successfully generated 3D-animated Isometric Tech Stack Archipelago SVG at: ${outputPath}`);
