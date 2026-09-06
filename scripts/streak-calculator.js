const fs = require('fs');
const path = require('path');

const THEMES = {
  github: {
    id: 'github',
    name: 'GitHub Green',
    core: '#238636',
    flame: '#3FB950',
    sparks: '#56D364',
    tip: '#E6EDF3',
    glow: 'rgba(63, 185, 80, 0.45)',
    bgDark: '#0D1117',
    border: '#30363D'
  },
  inferno: {
    id: 'inferno',
    name: 'Inferno Flame',
    core: '#EA580C',
    flame: '#F97316',
    sparks: '#FBBF24',
    tip: '#FEF08A',
    glow: 'rgba(249, 115, 22, 0.45)',
    bgDark: '#120A05',
    border: '#431407'
  },
  arcane: {
    id: 'arcane',
    name: 'Arcane Violet',
    core: '#7C3AED',
    flame: '#A855F7',
    sparks: '#E879F9',
    tip: '#F5D0FE',
    glow: 'rgba(168, 85, 247, 0.45)',
    bgDark: '#0F0B18',
    border: '#3B0764'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Aurora',
    core: '#0284C7',
    flame: '#38BDF8',
    sparks: '#67E8F9',
    tip: '#E0F2FE',
    glow: 'rgba(56, 189, 248, 0.45)',
    bgDark: '#07101C',
    border: '#0C4A6E'
  },
  zen: {
    id: 'zen',
    name: 'Zen Blossom',
    core: '#DB2777',
    flame: '#F472B6',
    sparks: '#FBCFE8',
    tip: '#FDF2F8',
    glow: 'rgba(244, 114, 182, 0.45)',
    bgDark: '#160912',
    border: '#500724'
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Gold',
    core: '#D97706',
    flame: '#F59E0B',
    sparks: '#FDE047',
    tip: '#FEF9C3',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgDark: '#150F05',
    border: '#451A03'
  },
  void: {
    id: 'void',
    name: 'Cosmic Void',
    core: '#4C1D95',
    flame: '#6366F1',
    sparks: '#38BDF8',
    tip: '#FFFFFF',
    glow: 'rgba(99, 102, 241, 0.45)',
    bgDark: '#070610',
    border: '#1E1B4B'
  }
};

const TIERS = [
  { min: 0, max: 0, id: 'dormant', name: 'Dormant', tag: 'DORMANT EMBER', auraScale: 0.4, scale: 0.6, particleCount: 3, speed: 4.5, turbulence: 1 },
  { min: 1, max: 2, id: 'spark', name: 'Spark', tag: 'NASCENT SPARK', auraScale: 0.7, scale: 0.8, particleCount: 6, speed: 3.5, turbulence: 2 },
  { min: 3, max: 6, id: 'flame', name: 'Flame', tag: 'LIVING FLAME', auraScale: 1.0, scale: 1.0, particleCount: 12, speed: 2.8, turbulence: 3 },
  { min: 7, max: 13, id: 'hot', name: 'Hot', tag: 'HOT FLAME', auraScale: 1.25, scale: 1.15, particleCount: 18, speed: 2.2, turbulence: 4 },
  { min: 14, max: 29, id: 'blaze', name: 'Blaze', tag: 'DUAL BLAZE', auraScale: 1.45, scale: 1.28, particleCount: 26, speed: 1.8, turbulence: 5 },
  { min: 30, max: 59, id: 'inferno', name: 'Inferno', tag: 'INFERNO TRIPLE', auraScale: 1.65, scale: 1.4, particleCount: 36, speed: 1.4, turbulence: 6 },
  { min: 60, max: 99, id: 'legendary', name: 'Legendary', tag: 'LEGENDARY RING', auraScale: 1.85, scale: 1.52, particleCount: 48, speed: 1.2, turbulence: 7 },
  { min: 100, max: 99999, id: 'mythic', name: 'Mythic', tag: 'MYTHIC CORE', auraScale: 2.1, scale: 1.65, particleCount: 64, speed: 1.0, turbulence: 8 },
];

const MILESTONES = [3, 7, 14, 30, 50, 60, 100, 365];

async function fetchLetMeCodexContributions() {
  const currentYear = new Date().getUTCFullYear();
  let data = null;
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/LetMeCodex?y=${currentYear}`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('[!] Failed to fetch live contributions, checking fallback cache...');
  }

  // Fallback to cached or standard history if offline
  if (!data || !data.contributions || data.contributions.length === 0) {
    try {
      const allRes = await fetch(`https://github-contributions-api.jogruber.de/v4/LetMeCodex`);
      data = await allRes.json();
    } catch (e) {
      console.warn('[!] Using fallback mock data');
    }
  }

  return data;
}

function calculateStreakData(apiData) {
  const contribs = (apiData && apiData.contributions) || [];
  const map = {};
  contribs.forEach(c => { map[c.date] = c.count; });

  const now = new Date();
  const utcTime = now.getTime();
  const istDate = new Date(utcTime + (5.5 * 60 * 60 * 1000));
  const istKey = istDate.toISOString().split('T')[0];
  const utcKey = now.toISOString().split('T')[0];
  const todayKey = (map[istKey] !== undefined && map[istKey] > 0) ? istKey : (map[utcKey] !== undefined ? utcKey : istKey);

  const yesterdayDate = new Date(now);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayKey = yesterdayDate.toISOString().split('T')[0];

  const todayContributions = map[todayKey] || 0;
  const yesterdayContributions = map[yesterdayKey] || 0;

  // Streak calculation
  let currentStreak = 0;
  let cursor = new Date(todayContributions > 0 ? (todayKey === istKey ? istDate : now) : yesterdayDate);
  
  if (todayContributions > 0 || yesterdayContributions > 0) {
    while (true) {
      const k = cursor.toISOString().split('T')[0];
      const count = map[k] || 0;
      if (count > 0) {
        currentStreak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  contribs.forEach(c => {
    if (c.count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  const streakActive = (todayContributions > 0 || yesterdayContributions > 0);
  const totalContributions = (apiData && apiData.total && (apiData.total['2026'] || apiData.total['lastYear'])) || 1349;

  // Determine Tier
  const tier = TIERS.find(t => currentStreak >= t.min && currentStreak <= t.max) || TIERS[0];

  // Determine Milestone
  const nextMilestone = MILESTONES.find(m => m > currentStreak) || 500;
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) || 0;
  const milestoneProgress = Math.min(100, Math.round(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100));
  const daysToGo = nextMilestone - currentStreak;

  // Intensity factor (0.0 to 1.0)
  const streakFactor = Math.min(currentStreak / 30, 0.7);
  const todayFactor = Math.min(todayContributions / 15, 0.3);
  const intensity = parseFloat(Math.min(1.0, Math.max(0.1, streakFactor + todayFactor)).toFixed(2));

  return {
    username: 'LetMeCodex',
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalContributions,
    todayContributions,
    yesterdayContributions,
    streakActive,
    streakStatus: streakActive ? 'Active' : 'Dormant',
    tier,
    milestone: {
      next: nextMilestone,
      prev: prevMilestone,
      progress: milestoneProgress,
      daysToGo
    },
    intensity,
    todayKey,
    recentDays: contribs.slice(-28)
  };
}

module.exports = {
  THEMES,
  TIERS,
  MILESTONES,
  fetchLetMeCodexContributions,
  calculateStreakData
};

if (require.main === module) {
  (async () => {
    const raw = await fetchLetMeCodexContributions();
    const stats = calculateStreakData(raw);
    console.log('=== LetMeCodex Deterministic Streak Engine Output ===');
    console.log(JSON.stringify(stats, null, 2));
  })();
}
