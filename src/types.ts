/**
 * Types and presets for Core Game Settings, Themes, Leaderboards, and Statistics
 */

export type DifficultyPreset = 'zen' | 'original' | 'hardcore' | 'bulletHell' | 'custom';

export type ThemeId = 'cyberCyan' | 'synthwave' | 'matrix' | 'solar' | 'abyssal';

export type ScreenShakeIntensity = 'off' | 'subtle' | 'intense';

export type SynthesizerScale = 'minor' | 'dorian' | 'blues' | 'major';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  coreFill: string;
  coreStroke: string;
  shieldArc: string;
  enemyColor: string;
  energyColor: string;
  bgInner: string;
  bgOuter: string;
  accent: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cyberCyan: {
    id: 'cyberCyan',
    name: 'Cyber Cyan (Original)',
    coreFill: '#249d93',
    coreStroke: '#3be2d4',
    shieldArc: '#648d93',
    enemyColor: 'rgb(255, 40, 40)',
    energyColor: 'rgb(0, 235, 190)',
    bgInner: 'rgba(0, 70, 70, 1)',
    bgOuter: 'rgba(0, 8, 14, 1)',
    accent: '#3be2d4',
  },
  synthwave: {
    id: 'synthwave',
    name: 'Neon Synthwave',
    coreFill: '#9d2483',
    coreStroke: '#f43f8e',
    shieldArc: '#38bdf8',
    enemyColor: 'rgb(255, 180, 20)',
    energyColor: 'rgb(244, 63, 142)',
    bgInner: 'rgba(70, 0, 65, 1)',
    bgOuter: 'rgba(12, 0, 18, 1)',
    accent: '#f43f8e',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Terminal',
    coreFill: '#15803d',
    coreStroke: '#22c55e',
    shieldArc: '#166534',
    enemyColor: 'rgb(249, 115, 22)',
    energyColor: 'rgb(74, 222, 128)',
    bgInner: 'rgba(0, 45, 15, 1)',
    bgOuter: 'rgba(2, 12, 4, 1)',
    accent: '#22c55e',
  },
  solar: {
    id: 'solar',
    name: 'Solar Flare',
    coreFill: '#b45309',
    coreStroke: '#f59e0b',
    shieldArc: '#ef4444',
    enemyColor: 'rgb(168, 85, 247)',
    energyColor: 'rgb(251, 191, 36)',
    bgInner: 'rgba(60, 25, 0, 1)',
    bgOuter: 'rgba(14, 4, 0, 1)',
    accent: '#f59e0b',
  },
  abyssal: {
    id: 'abyssal',
    name: 'Deep Abyssal',
    coreFill: '#1d4ed8',
    coreStroke: '#60a5fa',
    shieldArc: '#38bdf8',
    enemyColor: 'rgb(244, 63, 94)',
    energyColor: 'rgb(56, 189, 248)',
    bgInner: 'rgba(0, 30, 80, 1)',
    bgOuter: 'rgba(1, 6, 18, 1)',
    accent: '#60a5fa',
  },
};

export interface GameSettings {
  difficulty: DifficultyPreset;
  initialEnergy: number;
  spawnRateMultiplier: number;
  projectileSpeedMultiplier: number;
  shieldArcWidth: number; // in radians, default 1.6
  spaceShieldDrain: number; // per frame, default 0.1
  energyGain: number; // default 8
  energyDamage: number; // default 6
  theme: ThemeId;
  masterVolume: number; // 0 to 1
  isMuted: boolean;
  ambientSynth: boolean;
  sfx: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  showHud: boolean;
  smoothMouse: boolean;
  hapticFeedback: boolean;
  // Extra settings
  nickname: string;
  screenShake: ScreenShakeIntensity;
  damageFlash: boolean;
  coreQualityNodes: number; // 8, 16, 24
  invertControls: boolean;
  spacebarToggleMode: boolean; // false = hold, true = toggle
  synthesizerScale: SynthesizerScale;
  deadzoneRadius: number; // 0 to 30
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'original',
  initialEnergy: 30,
  spawnRateMultiplier: 1.0,
  projectileSpeedMultiplier: 1.0,
  shieldArcWidth: 1.6,
  spaceShieldDrain: 0.1,
  energyGain: 8,
  energyDamage: 6,
  theme: 'cyberCyan',
  masterVolume: 0.8,
  isMuted: false,
  ambientSynth: true,
  sfx: true,
  particleDensity: 'medium',
  showHud: true,
  smoothMouse: true,
  hapticFeedback: true,
  // Extra settings defaults
  nickname: 'Pilot_' + Math.floor(100 + Math.random() * 900),
  screenShake: 'subtle',
  damageFlash: true,
  coreQualityNodes: 16,
  invertControls: false,
  spacebarToggleMode: false,
  synthesizerScale: 'minor',
  deadzoneRadius: 5,
};

export interface GameStats {
  highScore: number;
  gamesPlayed: number;
  enemiesDeflected: number;
  energyAbsorbed: number;
  longestSurvivalSec: number;
  totalScoreAllTime: number;
}

export const DEFAULT_STATS: GameStats = {
  highScore: 0,
  gamesPlayed: 0,
  enemiesDeflected: 0,
  energyAbsorbed: 0,
  longestSurvivalSec: 0,
  totalScoreAllTime: 0,
};

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  survivalSec: number;
  difficulty: string;
  deflections: number;
  energyAbsorbed: number;
  theme: string;
  createdAt: number;
}
