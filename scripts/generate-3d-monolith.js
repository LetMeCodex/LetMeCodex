const fs = require('fs');
const path = require('path');
const { fetchLetMeCodexContributions } = require('./streak-calculator.js');

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generate3dMonolith() {
  const data = await fetchLetMeCodexContributions();
  const totalContribs = (data && data.total && (data.total['2026'] || data.total['lastYear'])) || 1430;
  const contribsList = (data && data.contributions) || [];
  const contribMap = {};
  contribsList.forEach(c => { contribMap[c.date] = c; });

  const W = 1000;
  const H = 560;
  const originX = 500;
  const originY = 245;
  const tileW = 10.5;
  const tileH = 5.8;

  const now = new Date();
  const currentDayOfWeek = now.getUTCDay();
  const totalDays = 52 * 7 + currentDayOfWeek;
  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - totalDays);
  const endDate = new Date(now);

  const cells = [];
  let cursor = new Date(startDate);

  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(cursor);
      const dateKey = cellDate.toISOString().substring(0, 10);
      cursor.setUTCDate(cursor.getUTCDate() + 1);

      if (cellDate > endDate) continue;

      const item = contribMap[dateKey] || { count: 0, level: 0 };
      const count = item.count || 0;
      let level = item.level;
      if (level === undefined) {
        if (count >= 30) level = 4;
        else if (count >= 20) level = 3;
        else if (count >= 10) level = 2;
        else if (count >= 1) level = 1;
        else level = 0;
      }

      const u = w - 26;
      const v = d - 3;
      const isoX = originX + (u - v) * tileW;
      const isoY = originY + (u + v) * tileH;

      let pillarHeight = 4;
      if (level === 1) pillarHeight = 12;
      else if (level === 2) pillarHeight = 22;
      else if (level === 3) pillarHeight = 36;
      else if (level === 4) pillarHeight = 54;

      cells.push({
        col: w,
        row: d,
        dateKey,
        count,
        level,
        isoX,
        isoY,
        height: pillarHeight,
        depthScore: w + d,
      });
    }
  }

  // Sort from back to front for accurate 3D isometric occlusion
  cells.sort((a, b) => a.depthScore - b.depthScore);

  const PALETTE = {
    0: { top: '#151C28', left: '#0A0F17', right: '#0F1722', stroke: '#1D283A' },
    1: { top: '#17365D', left: '#0B1C33', right: '#102747', stroke: '#255794' },
    2: { top: '#0284C7', left: '#01456B', right: '#025E91', stroke: '#38BDF8' },
    3: { top: '#38BDF8', left: '#02679C', right: '#0284C7', stroke: '#7DD3FC' },
    4: { top: '#BAE6FD', left: '#0284C7', right: '#38BDF8', stroke: '#FFFFFF' },
  };

  let pillarsSvg = '';
  const topCrystals = [];

  cells.forEach((c) => {
    const pal = PALETTE[c.level];
    const x = Number(c.isoX.toFixed(1));
    const yBase = Number(c.isoY.toFixed(1));
    const z = c.height;
    const yTop = Number((c.isoY - z).toFixed(1));

    const hw = Number((tileW * 0.92).toFixed(1));
    const hh = Number((tileH * 0.92).toFixed(1));

    const topPoints = `${x},${(yTop - hh).toFixed(1)} ${(x + hw).toFixed(1)},${yTop} ${x},${(yTop + hh).toFixed(1)} ${(x - hw).toFixed(1)},${yTop}`;
    const leftPoints = `${(x - hw).toFixed(1)},${yTop} ${x},${(yTop + hh).toFixed(1)} ${x},${(yBase + hh).toFixed(1)} ${(x - hw).toFixed(1)},${yBase}`;
    const rightPoints = `${x},${(yTop + hh).toFixed(1)} ${(x + hw).toFixed(1)},${yTop} ${(x + hw).toFixed(1)},${yBase} ${x},${(yBase + hh).toFixed(1)}`;

    const isLvl4 = c.level === 4;
    const glowClass = isLvl4 ? 'class="beacon-cell"' : '';

    pillarsSvg += `
      <!-- Pillar ${c.col},${c.row} (${c.dateKey}) -->
      <g ${glowClass}>
        <polygon points="${leftPoints}" fill="${pal.left}"/>
        <polygon points="${rightPoints}" fill="${pal.right}"/>
        <polygon points="${topPoints}" fill="${pal.top}" stroke="${pal.stroke}" stroke-width="0.6"/>
      </g>`;

    if (c.level === 4) {
      topCrystals.push({ x, y: yTop - hh - 12, count: c.count });
    }
  });

  // Render floating crystals above top peaks
  const crystalsSvg = topCrystals.slice(0, 5).map((cr, idx) => {
    const dur = (3.0 + idx * 0.5).toFixed(1);
    const del = (idx * 0.4).toFixed(1);
    return `
      <!-- Floating Crystal Peak -->
      <g transform="translate(${cr.x}, ${cr.y})" class="crystal-float" style="animation-duration: ${dur}s; animation-delay: ${del}s;">
        <line x1="0" y1="12" x2="0" y2="-32" stroke="rgba(56, 189, 248, 0.5)" stroke-width="1.2" stroke-dasharray="2 2"/>
        <polygon points="0,-8 5,0 0,8 -5,0" fill="#BAE6FD" stroke="#FFFFFF" stroke-width="0.8" opacity="0.95"/>
        <polygon points="0,-8 0,8 5,0" fill="rgba(56, 189, 248, 0.85)"/>
        <circle cx="0" cy="0" r="1.5" fill="#FFFFFF"/>
      </g>`;
  }).join('\n');

  // Floating debris rock shards beneath island
  const debris = [
    { x: 310, y: 450, r: 8, dur: 4.2, del: 0.2 },
    { x: 410, y: 485, r: 12, dur: 5.0, del: 0.8 },
    { x: 570, y: 495, r: 10, dur: 4.6, del: 1.2 },
    { x: 690, y: 460, r: 9, dur: 5.4, del: 0.5 },
    { x: 500, y: 520, r: 14, dur: 6.0, del: 1.5 },
  ];
  const debrisSvg = debris.map(d => `
    <g transform="translate(${d.x}, ${d.y})" class="debris-float" style="animation-duration: ${d.dur}s; animation-delay: ${d.del}s;">
      <polygon points="0,-${d.r} ${(d.r * 0.8).toFixed(1)},0 0,${d.r} -${(d.r * 0.8).toFixed(1)},0" fill="#0D1522" stroke="#1E293B" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="1.5" fill="#38BDF8" opacity="0.7"/>
    </g>
  `).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">
  <defs>
    <!-- Background Cosmic Atmosphere -->
    <linearGradient id="cosmicBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#080C14"/>
      <stop offset="50%" stop-color="#0D1220"/>
      <stop offset="100%" stop-color="#131B2A"/>
    </linearGradient>

    <!-- Anti-Gravity Underglow Field -->
    <radialGradient id="antiGravGlow" cx="50%" cy="65%" r="45%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.22)"/>
      <stop offset="50%" stop-color="rgba(14, 165, 233, 0.08)"/>
      <stop offset="100%" stop-color="rgba(8, 12, 20, 0)"/>
    </radialGradient>

    <!-- Scanner Cone Gradient -->
    <linearGradient id="scannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.28)"/>
      <stop offset="60%" stop-color="rgba(56, 189, 248, 0.06)"/>
      <stop offset="100%" stop-color="rgba(56, 189, 248, 0)"/>
    </linearGradient>

    <!-- Bedrock Cliff Gradients -->
    <linearGradient id="cliffGradL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0E1520"/>
      <stop offset="100%" stop-color="#070A0F"/>
    </linearGradient>
    <linearGradient id="cliffGradR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#131D2C"/>
      <stop offset="100%" stop-color="#090E16"/>
    </linearGradient>

    <style>
      @keyframes citadelLevitate {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-7px); }
      }
      @keyframes crystalHover {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-5px) rotate(180deg); }
      }
      @keyframes radarSweep3D {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes antiGravBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(6px); }
      }
      @keyframes pulseGrid {
        0%, 100% { opacity: 0.35; }
        50% { opacity: 0.85; }
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.8; }
      }

      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace; }
      .inter { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

      .citadel-group { animation: citadelLevitate 7s infinite ease-in-out; }
      .crystal-float { animation: crystalHover 4s infinite ease-in-out; transform-origin: center; }
      .scanner-beam { animation: radarSweep3D 14s infinite linear; transform-origin: 500px 245px; }
      .debris-float { animation: antiGravBob infinite ease-in-out; }
      .circuit-line { animation: pulseGrid 3s infinite ease-in-out; }
      .star { animation: starTwinkle infinite ease-in-out; }
    </style>
  </defs>

  <!-- BACKGROUND & CARD SHELL -->
  <rect width="${W}" height="${H}" rx="8" fill="url(#cosmicBg)" stroke="#30363D" stroke-width="1"/>

  <!-- Subtle Starfield -->
  <g fill="#E8DEC9">
    <circle cx="80" cy="60" r="1.2" class="star" style="animation-duration: 2.1s;"/>
    <circle cx="190" cy="110" r="0.9" class="star" style="animation-duration: 3.2s;"/>
    <circle cx="310" cy="50" r="1.5" class="star" style="animation-duration: 1.8s;"/>
    <circle cx="750" cy="75" r="1.1" class="star" style="animation-duration: 2.5s;"/>
    <circle cx="890" cy="130" r="1.4" class="star" style="animation-duration: 3.0s;"/>
    <circle cx="920" cy="45" r="0.8" class="star" style="animation-duration: 2.2s;"/>
  </g>

  <!-- HEADER HUD READOUT -->
  <g transform="translate(28, 36)">
    <text x="0" y="0" class="mono" fill="#38BDF8" font-size="11" font-weight="700" letter-spacing="1.5">⟪ 3D CITADEL // ORBITAL TOPOGRAPHY ⟫</text>
    <text x="0" y="22" class="inter" fill="#F0F6FC" font-size="20" font-weight="700">${Number(totalContribs).toLocaleString()} Commits Elevated in Orbit</text>
  </g>

  <g transform="translate(${W - 28}, 36)" text-anchor="end">
    <rect x="-160" y="-12" width="160" height="22" rx="4" fill="#161B22" stroke="#30363D" stroke-width="1"/>
    <circle cx="-148" cy="-1" r="3.5" fill="#10B981"/>
    <text x="-136" y="2" class="mono" fill="#7D8590" font-size="10" text-anchor="start">ANTI-GRAV: STABLE</text>
    <text x="0" y="22" class="mono" fill="#38BDF8" font-size="11">SECTOR: LETMECODEX // 2026</text>
  </g>

  <!-- LEVITATING 3D FLOATING CITADEL -->
  <g class="citadel-group">
    <!-- Anti-Gravity Underglow Field -->
    <ellipse cx="500" cy="350" rx="340" ry="120" fill="url(#antiGravGlow)"/>

    <!-- Rotating Holographic Radar Scanner Beam -->
    <g class="scanner-beam" opacity="0.75">
      <path d="M 500 245 L 840 175 A 360 160 0 0 1 820 315 Z" fill="url(#scannerGrad)"/>
    </g>

    <!-- Floating Bedrock Island Cliff Base (Chiseled Crystalline Strata) -->
    <g>
      <!-- Deep Obsidian Stalactite Underside & Shadow Core -->
      <polygon points="180,110 500,500 820,380 500,340" fill="#04070C" opacity="0.95"/>

      <!-- Front-Left Cliff Facets (Chiseled Obsidian Terraces) -->
      <polygon points="180,110 360,265 380,440 180,135" fill="url(#cliffGradL)"/>
      <polygon points="360,265 540,360 500,500 380,440" fill="#080E17"/>
      <polygon points="540,360 750,422 500,500" fill="#0C1420"/>

      <!-- Front-Right Cliff Facets -->
      <polygon points="750,422 820,380 500,500" fill="url(#cliffGradR)"/>
      <polygon points="750,422 820,380 820,395 750,435" fill="#0F1A2A"/>

      <!-- Glowing Cyan Circuit Fissures in Bedrock -->
      <path d="M 210,140 L 330,245 L 390,320 L 460,420 L 500,490" stroke="#0284C7" stroke-width="1.4" fill="none" opacity="0.75" class="circuit-line"/>
      <path d="M 330,245 L 370,280 L 410,290" stroke="#38BDF8" stroke-width="1" fill="none" opacity="0.6" class="circuit-line"/>
      <path d="M 780,390 L 680,405 L 610,430 L 520,490" stroke="#0284C7" stroke-width="1.4" fill="none" opacity="0.7" class="circuit-line"/>
      <path d="M 680,405 L 640,435 L 590,450" stroke="#38BDF8" stroke-width="0.9" fill="none" opacity="0.55" class="circuit-line"/>
    </g>

    <!-- 3D Isometric Spires (Commit Pillars) -->
    <g>
      ${pillarsSvg}
    </g>

    <!-- Levitating Crystal Peaks -->
    <g>
      ${crystalsSvg}
    </g>

    <!-- Anti-Gravity Shards Debris -->
    <g>
      ${debrisSvg}
    </g>
  </g>

  <!-- BOTTOM TELEMETRY FOOTER -->
  <line x1="28" y1="${H - 46}" x2="${W - 28}" y2="${H - 46}" stroke="#21262D" stroke-width="1"/>

  <g transform="translate(28, ${H - 22})">
    <text x="0" y="0" class="mono" fill="#7D8590" font-size="11">[ROTATION: 30° ISO] • [PROJECTION: AXONOMETRIC] • [ELEVATION PEAK: 54m]</text>

    <!-- 3D Mini-Legend -->
    <g transform="translate(${W - 320}, -3)">
      <text x="-30" y="3" class="mono" fill="#7D8590" font-size="10">Less</text>
      <!-- Lvl 0 -->
      <polygon points="0,-3 4,0 0,3 -4,0" fill="#151C28" stroke="#1D283A" stroke-width="0.5"/>
      <!-- Lvl 1 -->
      <g transform="translate(20, 0)">
        <polygon points="0,-5 4,-2 0,1 -4,-2" fill="#17365D" stroke="#255794" stroke-width="0.5"/>
        <polygon points="-4,-2 0,1 0,4 -4,1" fill="#0B1C33"/>
        <polygon points="0,1 4,-2 4,1 0,4" fill="#102747"/>
      </g>
      <!-- Lvl 2 -->
      <g transform="translate(45, 0)">
        <polygon points="0,-7 4,-4 0,-1 -4,-4" fill="#0284C7" stroke="#38BDF8" stroke-width="0.5"/>
        <polygon points="-4,-4 0,-1 0,4 -4,1" fill="#01456B"/>
        <polygon points="0,-1 4,-4 4,1 0,4" fill="#025E91"/>
      </g>
      <!-- Lvl 3 -->
      <g transform="translate(70, 0)">
        <polygon points="0,-9 4,-6 0,-3 -4,-6" fill="#38BDF8" stroke="#7DD3FC" stroke-width="0.5"/>
        <polygon points="-4,-6 0,-3 0,4 -4,1" fill="#02679C"/>
        <polygon points="0,-3 4,-6 4,1 0,4" fill="#0284C7"/>
      </g>
      <!-- Lvl 4 -->
      <g transform="translate(95, 0)">
        <polygon points="0,-11 4,-8 0,-5 -4,-8" fill="#BAE6FD" stroke="#FFFFFF" stroke-width="0.6"/>
        <polygon points="-4,-8 0,-5 0,4 -4,1" fill="#0284C7"/>
        <polygon points="0,-5 4,-8 4,1 0,4" fill="#38BDF8"/>
      </g>
      <text x="110" y="3" class="mono" fill="#7D8590" font-size="10">More</text>
    </g>
  </g>
</svg>`;

  const outPath = path.join(__dirname, '..', 'assets', 'profile-3d.svg');
  fs.writeFileSync(outPath, svg, 'utf-8');
  console.log('[+] Generated 3D Isometric Monolith Citadel -> ' + outPath);
}

generate3dMonolith().catch(err => {
  console.error('[!] Error generating 3D monolith:', err);
  process.exit(1);
});
