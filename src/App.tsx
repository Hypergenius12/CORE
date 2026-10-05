/**
 * Core - a defensive game built in HTML5
 * Clone of Hakim El Hattab's creative coding experiment (https://lab.hakim.se/core/)
 * Enhanced with Global Leaderboard, Custom Nicknames, Dynamic Audio Scales, and Rich Settings
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CoreAudio } from './audio';
import {
  GameSettings,
  GameStats,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  THEMES,
} from './types';
import { HomeMenu } from './components/HomeMenu';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsModal } from './components/StatsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';

interface Point2D {
  x: number;
  y: number;
}

interface Particle {
  position: Point2D;
  velocity: Point2D;
  alpha: number;
}

interface CoreNode {
  position: Point2D;
  normal: Point2D;
  normalTarget: Point2D;
  offset: Point2D;
}

class Organism {
  public position: Point2D = { x: 0, y: 0 };
  public velocity: Point2D = { x: 0, y: 0 };
  public size: number = 6;
  public speed: number = 1;
  public type: 'enemy' | 'energy' = 'enemy';
  public alpha: number = 0;
  public dead: boolean = false;

  constructor(type: 'enemy' | 'energy') {
    this.type = type;
    if (type === 'enemy') {
      this.size = 6 + Math.random() * 4;
    } else {
      this.size = 10 + Math.random() * 6;
    }
  }

  public distanceTo(p: Point2D): number {
    const dx = p.x - this.position.x;
    const dy = p.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Player {
  public position: Point2D = { x: 0, y: 0 };
  public length: number = 15;
  public energy: number = 30;
  public energyRadius: number = 0;
  public energyRadiusTarget: number = 0;
  public radius: number = 60;
  public angle: number = 0;
  public coreQuality: number = 16;
  public coreNodes: CoreNode[] = [];

  public updateCore(quality: number = 16) {
    if (this.coreNodes.length !== quality) {
      this.coreQuality = quality;
      this.coreNodes = [];
      for (let i = 0; i < this.coreQuality; i++) {
        this.coreNodes.push({
          position: { x: this.position.x, y: this.position.y },
          normal: { x: 0, y: 0 },
          normalTarget: { x: 0, y: 0 },
          offset: { x: 0, y: 0 },
        });
      }
    }

    for (let i = 0; i < this.coreQuality; i++) {
      const n = this.coreNodes[i];
      const angle = (i / this.coreQuality) * Math.PI * 2;
      n.normal.x = Math.cos(angle) * this.energyRadius;
      n.normal.y = Math.sin(angle) * this.energyRadius;
      n.offset.x = Math.random() * 5;
      n.offset.y = Math.random() * 5;
    }
  }
}

export default function App() {
  const worldCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings & Lifetime Stats from localStorage
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('core_game_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('core_player_stats');
      if (saved) return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_STATS;
  });

  // App UI states
  const [appState, setAppState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);

  // Live in-game HUD states (synced smoothly)
  const [hudScore, setHudScore] = useState<number>(0);
  const [hudEnergy, setHudEnergy] = useState<number>(30);
  const [hudTime, setHudTime] = useState<number>(0);
  const [hudFps, setHudFps] = useState<number>(60);
  const [hudDiff, setHudDiff] = useState<number>(1);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [isHoldingShield, setIsHoldingShield] = useState<boolean>(false);
  const [flashDamage, setFlashDamage] = useState<boolean>(false);

  // Game-over round results
  const [roundStats, setRoundStats] = useState({
    score: 0,
    isNewHigh: false,
    survivalSec: 0,
    deflections: 0,
    energyAbsorbed: 0,
    globalRank: null as number | null,
  });

  // Mutable Game Loop State
  const gameStateRef = useRef({
    playing: false,
    paused: false,
    score: 0,
    startTime: 0,
    pauseStartTime: 0,
    totalPauseDuration: 0,
    difficulty: 1,
    lastSpawn: 0,
    spaceIsDown: false,
    mouseX: 500,
    mouseY: 325,
    mouseIsDown: false,
    organisms: [] as Organism[],
    particles: [] as Particle[],
    player: new Player(),
    world: { width: 1000, height: 650 },
    fps: 60,
    timeLastSecond: Date.now(),
    frames: 0,
    isMobile: false,
    borderWidth: 6,
    frameRate: 60,
    // Shake effect
    shakeMagnitude: 0,
    shakeX: 0,
    shakeY: 0,
    // Round stats
    roundDeflections: 0,
    roundEnergyAbsorbed: 0,
  });

  // Save settings when modified
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    if (newSettings.synthesizerScale) {
      CoreAudio.setScale(newSettings.synthesizerScale);
    }
    try {
      localStorage.setItem('core_game_settings', JSON.stringify(newSettings));
    } catch {
      // quota
    }
  };

  const handleUpdateNickname = (newNickname: string) => {
    handleUpdateSettings({ ...settings, nickname: newNickname });
  };

  // Save stats when modified
  const updateStats = useCallback((updater: (prev: GameStats) => GameStats) => {
    setStats((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('core_player_stats', JSON.stringify(next));
      } catch {
        // quota
      }
      return next;
    });
  }, []);

  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
    try {
      localStorage.removeItem('core_player_stats');
    } catch {
      // quota
    }
  };

  const handleToggleSound = () => {
    const nextMuted = !settings.isMuted;
    CoreAudio.setMuted(nextMuted);
    handleUpdateSettings({ ...settings, isMuted: nextMuted });
  };

  const triggerDamageEffects = () => {
    if (settings.screenShake !== 'off') {
      const mag = settings.screenShake === 'intense' ? 14 : 7;
      gameStateRef.current.shakeMagnitude = mag;
    }
    if (settings.damageFlash) {
      setFlashDamage(true);
      setTimeout(() => setFlashDamage(false), 150);
    }
  };

  const emitParticles = (
    position: Point2D,
    direction: Point2D,
    spread: number,
    seed: number
  ) => {
    let q = seed + Math.random() * seed;
    while (--q >= 0) {
      const p: Particle = {
        position: {
          x: position.x + Math.sin(q) * spread,
          y: position.y + Math.cos(q) * spread,
        },
        velocity: {
          x: direction.x + (-1 + Math.random() * 2),
          y: direction.y + (-1 + Math.random() * 2),
        },
        alpha: 1,
      };
      gameStateRef.current.particles.push(p);
    }
  };

  const renderBackground = useCallback(() => {
    const bgCanvas = backgroundCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES[settings.theme] || THEMES.cyberCyan;
    const { world } = gameStateRef.current;
    const gradient = ctx.createRadialGradient(
      world.width * 0.5,
      world.height * 0.5,
      0,
      world.width * 0.5,
      world.height * 0.5,
      500
    );
    gradient.addColorStop(0, theme.bgInner);
    gradient.addColorStop(1, theme.bgOuter);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, world.width, world.height);
  }, [settings.theme]);

  const handleResize = useCallback(() => {
    const canvas = worldCanvasRef.current;
    const canvasBg = backgroundCanvasRef.current;
    if (!canvas || !canvasBg) return;

    const isMobile =
      window.innerWidth < 1020 ||
      !!navigator.userAgent.match(/ipod|ipad|iphone|android/gi);

    gameStateRef.current.isMobile = isMobile;
    setIsMobileDevice(isMobile);

    const DEFAULT_WIDTH = 1000;
    const DEFAULT_HEIGHT = 650;
    const BORDER_WIDTH = isMobile ? 0 : 6;
    gameStateRef.current.borderWidth = BORDER_WIDTH;

    const width = isMobile ? window.innerWidth : DEFAULT_WIDTH;
    const height = isMobile ? window.innerHeight : DEFAULT_HEIGHT;

    gameStateRef.current.world.width = width;
    gameStateRef.current.world.height = height;

    // Center player in world
    gameStateRef.current.player.position.x = width * 0.5;
    gameStateRef.current.player.position.y = height * 0.5;

    // Resize canvases
    canvas.width = width;
    canvas.height = height;
    canvasBg.width = width;
    canvasBg.height = height;

    const cvx = (window.innerWidth - width) * 0.5;
    const cvy = (window.innerHeight - height) * 0.5;

    canvas.style.position = 'absolute';
    canvas.style.left = `${cvx}px`;
    canvas.style.top = `${cvy}px`;
    canvas.style.border = isMobile ? 'none' : '6px #333333 solid';

    canvasBg.style.position = 'absolute';
    canvasBg.style.left = `${cvx + BORDER_WIDTH}px`;
    canvasBg.style.top = `${cvy + BORDER_WIDTH}px`;

    renderBackground();
  }, [renderBackground]);

  const giveLife = (organism: Organism): Organism => {
    const { world, player, playing } = gameStateRef.current;
    const side = Math.round(Math.random() * 3);

    switch (side) {
      case 0:
        organism.position.x = 10;
        organism.position.y = world.height * Math.random();
        break;
      case 1:
        organism.position.x = world.width * Math.random();
        organism.position.y = 10;
        break;
      case 2:
        organism.position.x = world.width - 10;
        organism.position.y = world.height * Math.random();
        break;
      case 3:
        organism.position.x = world.width * Math.random();
        organism.position.y = world.height - 10;
        break;
    }

    if (playing) {
      CoreAudio.playSynth(organism.position.x / world.width);
    }

    const baseSpeed = Math.min(Math.max(Math.random(), 0.6), 0.75);
    organism.speed = baseSpeed * settings.projectileSpeedMultiplier;

    organism.velocity.x =
      (player.position.x - organism.position.x) * 0.006 * organism.speed;
    organism.velocity.y =
      (player.position.y - organism.position.y) * 0.006 * organism.speed;

    if (organism.type === 'enemy') {
      organism.velocity.x *= 1 + Math.random() * 0.1;
      organism.velocity.y *= 1 + Math.random() * 0.1;
    }

    organism.alpha = 0;
    return organism;
  };

  const switchToHardcoreAndPlay = () => {
    const hardcoreSettings: GameSettings = {
      ...settings,
      difficulty: 'hardcore',
      initialEnergy: 25,
      spawnRateMultiplier: 1.4,
      projectileSpeedMultiplier: 1.3,
      shieldArcWidth: 1.2,
      spaceShieldDrain: 0.15,
      energyGain: 6,
      energyDamage: 10,
    };
    handleUpdateSettings(hardcoreSettings);
    setShowLeaderboardModal(false);
    setShowSettingsModal(false);
    setTimeout(() => {
      startGame();
    }, 50);
  };

  const submitScoreToLeaderboard = async (finalScore: number, survivalSec: number) => {
    // ANTI-CHEAT ENFORCEMENT: Only Hardcore mode qualifies for the Global Leaderboard
    if (settings.difficulty !== 'hardcore') {
      return;
    }

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: settings.nickname || 'Pilot',
          score: finalScore,
          survivalSec,
          difficulty: 'hardcore',
          deflections: gameStateRef.current.roundDeflections,
          energyAbsorbed: gameStateRef.current.roundEnergyAbsorbed,
          theme: settings.theme,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rank) {
          setRoundStats((prev) => ({ ...prev, globalRank: data.rank }));
        }
      }
    } catch (err) {
      console.error('Failed to submit score to leaderboard:', err);
    }
  };

  const handleGameOver = () => {
    const state = gameStateRef.current;
    state.playing = false;

    const finalScore = Math.round(state.score);
    const survivalDuration = Math.round(
      (Date.now() - state.startTime - state.totalPauseDuration) / 1000
    );
    const isNewHigh = finalScore > stats.highScore;

    setRoundStats({
      score: finalScore,
      isNewHigh,
      survivalSec: survivalDuration,
      deflections: state.roundDeflections,
      energyAbsorbed: state.roundEnergyAbsorbed,
      globalRank: null,
    });

    submitScoreToLeaderboard(finalScore, survivalDuration);

    updateStats((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, finalScore),
      gamesPlayed: prev.gamesPlayed + 1,
      enemiesDeflected: prev.enemiesDeflected + state.roundDeflections,
      energyAbsorbed: prev.energyAbsorbed + state.roundEnergyAbsorbed,
      longestSurvivalSec: Math.max(prev.longestSurvivalSec, survivalDuration),
      totalScoreAllTime: prev.totalScoreAllTime + finalScore,
    }));

    setAppState('gameover');
  };

  const startGame = () => {
    CoreAudio.init();
    if (settings.synthesizerScale) {
      CoreAudio.setScale(settings.synthesizerScale);
    }

    const state = gameStateRef.current;
    state.playing = true;
    state.paused = false;
    state.organisms = [];
    state.particles = [];
    state.score = 0;
    state.difficulty = 1;
    state.player.energy = settings.initialEnergy;
    state.player.energyRadius = 0;
    state.player.energyRadiusTarget = 0;
    state.startTime = Date.now();
    state.totalPauseDuration = 0;
    state.timeLastSecond = Date.now();
    state.frames = 0;
    state.lastSpawn = Date.now();
    state.roundDeflections = 0;
    state.roundEnergyAbsorbed = 0;
    state.shakeMagnitude = 0;

    setHudScore(0);
    setHudEnergy(settings.initialEnergy);
    setHudTime(0);
    setAppState('playing');
  };

  const pauseGame = () => {
    if (appState !== 'playing') return;
    gameStateRef.current.paused = true;
    gameStateRef.current.pauseStartTime = Date.now();
    setAppState('paused');
  };

  const resumeGame = () => {
    if (appState !== 'paused') return;
    const pauseDur = Date.now() - gameStateRef.current.pauseStartTime;
    gameStateRef.current.totalPauseDuration += pauseDur;
    gameStateRef.current.paused = false;
    setAppState('playing');
  };

  const exitToMenu = () => {
    gameStateRef.current.playing = false;
    gameStateRef.current.paused = false;
    gameStateRef.current.organisms = [];
    setAppState('menu');
  };

  // Setup event handlers and animation loop
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.keyCode === 32) {
        if (settings.spacebarToggleMode) {
          gameStateRef.current.spaceIsDown = !gameStateRef.current.spaceIsDown;
          setIsHoldingShield(gameStateRef.current.spaceIsDown);
        } else {
          if (!gameStateRef.current.spaceIsDown && gameStateRef.current.player.energy > 15) {
            gameStateRef.current.player.energy -= 4;
          }
          gameStateRef.current.spaceIsDown = true;
          setIsHoldingShield(true);
        }
        e.preventDefault();
      }

      if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameStateRef.current.playing) {
          if (gameStateRef.current.paused) {
            resumeGame();
          } else {
            pauseGame();
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.keyCode === 32) {
        if (!settings.spacebarToggleMode) {
          gameStateRef.current.spaceIsDown = false;
          setIsHoldingShield(false);
          e.preventDefault();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const { world, borderWidth } = gameStateRef.current;
      gameStateRef.current.mouseX =
        e.clientX - (window.innerWidth - world.width) * 0.5 - borderWidth;
      gameStateRef.current.mouseY =
        e.clientY - (window.innerHeight - world.height) * 0.5 - borderWidth;
    };

    const onMouseDown = () => {
      gameStateRef.current.mouseIsDown = true;
    };

    const onMouseUp = () => {
      gameStateRef.current.mouseIsDown = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 1) {
        const touch = e.touches[0];
        const { world, borderWidth, isMobile } = gameStateRef.current;
        gameStateRef.current.mouseX =
          touch.clientX - (window.innerWidth - world.width) * 0.5 - (isMobile ? 0 : borderWidth);
        gameStateRef.current.mouseY =
          touch.clientY - (window.innerHeight - world.height) * 0.5 - (isMobile ? 0 : borderWidth);
        gameStateRef.current.mouseIsDown = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 1) {
        const touch = e.touches[0];
        const { world, borderWidth, isMobile } = gameStateRef.current;
        gameStateRef.current.mouseX =
          touch.clientX - (window.innerWidth - world.width) * 0.5 - (isMobile ? 0 : borderWidth);
        gameStateRef.current.mouseY =
          touch.clientY - (window.innerHeight - world.height) * 0.5 - (isMobile ? 0 : borderWidth);
      }
    };

    const onTouchEnd = () => {
      gameStateRef.current.mouseIsDown = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // Main 60fps Canvas Loop
    let animId: number;
    let lastHudSync = 0;

    const animate = () => {
      const canvas = worldCanvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      const state = gameStateRef.current;
      const { player, world, organisms, particles } = state;
      const theme = THEMES[settings.theme] || THEMES.cyberCyan;

      // Track FPS
      const frameTime = Date.now();
      state.frames++;
      if (frameTime > state.timeLastSecond + 1000) {
        state.fps = Math.min(
          Math.round((state.frames * 1000) / (frameTime - state.timeLastSecond)),
          state.frameRate
        );
        state.timeLastSecond = frameTime;
        state.frames = 0;
      }

      // If paused, just keep current display
      if (state.paused) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const scoreFactor =
        0.01 +
        (Math.max(Math.min(state.fps, state.frameRate), 0) / state.frameRate) *
          0.99;
      const scoreMultiplier = scoreFactor * scoreFactor;

      // Clear canvas
      context.save();

      // Screen Shake translation
      if (state.shakeMagnitude > 0.1) {
        state.shakeX = (Math.random() * 2 - 1) * state.shakeMagnitude;
        state.shakeY = (Math.random() * 2 - 1) * state.shakeMagnitude;
        state.shakeMagnitude *= 0.88;
        context.translate(state.shakeX, state.shakeY);
      } else {
        state.shakeX = 0;
        state.shakeY = 0;
      }

      context.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);

      if (state.playing) {
        // Increment difficulty
        state.difficulty += 0.0015;
        // Increment score
        state.score += 0.4 * state.difficulty * scoreMultiplier;

        // Player orientation
        const dx = state.mouseX - player.position.x;
        const dy = state.mouseY - player.position.y;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);

        // Deadzone check
        if (distToCenter > settings.deadzoneRadius) {
          let targetAngle = Math.atan2(dy, dx);
          if (settings.invertControls) {
            targetAngle = targetAngle + Math.PI;
          }
          if (Math.abs(targetAngle - player.angle) > Math.PI) {
            player.angle = targetAngle;
          }
          const lerpFactor = settings.smoothMouse ? 0.2 : 0.8;
          player.angle += (targetAngle - player.angle) * lerpFactor;
        }

        player.energyRadiusTarget =
          (player.energy / 100) * (player.radius * 0.8);
        player.energyRadius +=
          (player.energyRadiusTarget - player.energyRadius) * 0.2;

        // Shield arc
        context.beginPath();
        context.strokeStyle = theme.shieldArc;
        context.lineWidth = 3;
        context.arc(
          player.position.x,
          player.position.y,
          player.radius,
          player.angle + settings.shieldArcWidth,
          player.angle - settings.shieldArcWidth,
          true
        );
        context.stroke();

        // Core organism blob
        context.beginPath();
        context.fillStyle = theme.coreFill;
        context.strokeStyle = theme.coreStroke;
        context.lineWidth = 1.5;
        player.updateCore(settings.coreQualityNodes);

        const loopedNodes = player.coreNodes.concat();
        if (player.coreNodes.length > 0) {
          loopedNodes.push(player.coreNodes[0]);
          for (let i = 0; i < loopedNodes.length; i++) {
            const p = loopedNodes[i];
            const p2 = loopedNodes[i + 1];

            p.position.x +=
              (player.position.x + p.normal.x + p.offset.x - p.position.x) * 0.2;
            p.position.y +=
              (player.position.y + p.normal.y + p.offset.y - p.position.y) * 0.2;

            if (i === 0) {
              context.moveTo(p.position.x, p.position.y);
            } else if (p2) {
              context.quadraticCurveTo(
                p.position.x,
                p.position.y,
                p.position.x + (p2.position.x - p.position.x) / 2,
                p.position.y + (p2.position.y - p.position.y) / 2
              );
            }
          }
        }
        context.closePath();
        context.fill();
        context.stroke();

        // Spacebar temporary 360-degree shield
        if (state.spaceIsDown && player.energy > 10) {
          player.energy -= settings.spaceShieldDrain;
          context.beginPath();
          context.strokeStyle = theme.shieldArc;
          context.lineWidth = 1;
          context.fillStyle = `rgba(0, 100, 100, ${
            (player.energy / 100) * 0.9
          })`;
          context.arc(
            player.position.x,
            player.position.y,
            player.radius,
            0,
            Math.PI * 2,
            true
          );
          context.fill();
          context.stroke();

          CoreAudio.playShield();
        } else if (settings.spacebarToggleMode && state.spaceIsDown && player.energy <= 10) {
          state.spaceIsDown = false;
          setIsHoldingShield(false);
        }
      } else {
        // Ambient title screen core pulsation
        const targetAngle = Math.atan2(
          state.mouseY - player.position.y,
          state.mouseX - player.position.x
        );
        player.angle += (targetAngle - player.angle) * 0.05;
        player.energy = 35 + Math.sin(frameTime * 0.002) * 5;
        player.energyRadiusTarget = (player.energy / 100) * (player.radius * 0.8);
        player.energyRadius +=
          (player.energyRadiusTarget - player.energyRadius) * 0.1;

        context.beginPath();
        context.strokeStyle = theme.shieldArc;
        context.lineWidth = 2;
        context.arc(
          player.position.x,
          player.position.y,
          player.radius,
          player.angle + 1.2,
          player.angle - 1.2,
          true
        );
        context.stroke();

        context.beginPath();
        context.fillStyle = theme.coreFill;
        context.strokeStyle = theme.coreStroke;
        context.lineWidth = 1.5;
        player.updateCore(settings.coreQualityNodes);
        const loopedNodes = player.coreNodes.concat();
        if (player.coreNodes.length > 0) {
          loopedNodes.push(player.coreNodes[0]);
          for (let i = 0; i < loopedNodes.length; i++) {
            const p = loopedNodes[i];
            const p2 = loopedNodes[i + 1];
            p.position.x +=
              (player.position.x + p.normal.x + p.offset.x - p.position.x) * 0.1;
            p.position.y +=
              (player.position.y + p.normal.y + p.offset.y - p.position.y) * 0.1;

            if (i === 0) context.moveTo(p.position.x, p.position.y);
            else if (p2) {
              context.quadraticCurveTo(
                p.position.x,
                p.position.y,
                p.position.x + (p2.position.x - p.position.x) / 2,
                p.position.y + (p2.position.y - p.position.y) / 2
              );
            }
          }
        }
        context.closePath();
        context.fill();
        context.stroke();
      }

      let enemyCount = 0;
      let energyCount = 0;

      // Update & render organisms
      for (let i = 0; i < organisms.length; i++) {
        const p = organisms[i];
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        p.alpha += (1 - p.alpha) * 0.1;

        if (p.type === 'enemy') {
          context.fillStyle = theme.enemyColor.replace('rgb', 'rgba').replace(')', `, ${p.alpha})`);
        } else {
          context.fillStyle = theme.energyColor.replace('rgb', 'rgba').replace(')', `, ${p.alpha})`);
        }

        context.beginPath();
        context.arc(
          p.position.x,
          p.position.y,
          p.size / 2,
          0,
          Math.PI * 2,
          true
        );
        context.fill();

        const angle = Math.atan2(
          p.position.y - player.position.y,
          p.position.x - player.position.x
        );

        if (state.playing) {
          let dist = Math.abs(angle - player.angle);
          if (dist > Math.PI) {
            dist = Math.PI * 2 - dist;
          }

          // Shield collision
          if (dist < settings.shieldArcWidth) {
            const currentDist = p.distanceTo(player.position);
            if (
              currentDist > player.radius - 6 &&
              currentDist < player.radius + 6
            ) {
              p.dead = true;
              state.roundDeflections++;
              CoreAudio.organismDead();
            }
          }

          // Full shield collision (Space active)
          if (
            state.spaceIsDown &&
            p.distanceTo(player.position) < player.radius &&
            player.energy > 11
          ) {
            p.dead = true;
            state.score += 4;
            state.roundDeflections++;
          }

          // Core absorption / impact
          if (
            p.distanceTo(player.position) <
            player.energyRadius + p.size * 0.5
          ) {
            if (p.type === 'enemy') {
              player.energy -= settings.energyDamage;
              triggerDamageEffects();
              CoreAudio.energyDown();
            }
            if (p.type === 'energy') {
              player.energy += settings.energyGain;
              state.score += 30;
              state.roundEnergyAbsorbed++;
              CoreAudio.energyUp();
            }
            player.energy = Math.max(Math.min(player.energy, 100), 0);
            p.dead = true;
          }
        }

        // Out of bounds check
        if (
          p.position.x < -p.size ||
          p.position.x > world.width + p.size ||
          p.position.y < -p.size ||
          p.position.y > world.height + p.size
        ) {
          p.dead = true;
        }

        if (p.dead) {
          const particleSeed =
            settings.particleDensity === 'low'
              ? 3
              : settings.particleDensity === 'high'
              ? 8
              : 5;
          emitParticles(
            p.position,
            {
              x: (p.position.x - player.position.x) * 0.02,
              y: (p.position.y - player.position.y) * 0.02,
            },
            5,
            particleSeed
          );
          organisms.splice(i, 1);
          i--;
        } else {
          if (p.type === 'enemy') enemyCount++;
          if (p.type === 'energy') energyCount++;
        }
      }

      // Spawning
      const spawnTarget = 1 * state.difficulty * settings.spawnRateMultiplier;
      if (
        enemyCount < spawnTarget &&
        Date.now() - state.lastSpawn > (state.playing ? 100 : 350)
      ) {
        organisms.push(giveLife(new Organism('enemy')));
        state.lastSpawn = Date.now();
      }

      if (energyCount < 1 && Math.random() > 0.995) {
        organisms.push(giveLife(new Organism('energy')));
      }

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.position.x += pt.velocity.x;
        pt.position.y += pt.velocity.y;
        pt.alpha -= 0.02;

        context.fillStyle = `rgba(255,255,255,${Math.max(pt.alpha, 0)})`;
        context.fillRect(pt.position.x, pt.position.y, 1, 1);

        if (pt.alpha <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      context.restore();

      // Throttle HUD updates to 10Hz to prevent React overhead
      if (state.playing && frameTime - lastHudSync > 100) {
        lastHudSync = frameTime;
        const elapsedSec =
          (frameTime - state.startTime - state.totalPauseDuration) / 1000;
        setHudScore(state.score);
        setHudEnergy(player.energy);
        setHudTime(elapsedSec);
        setHudFps(state.fps);
        setHudDiff(state.difficulty);

        if (player.energy <= 0) {
          emitParticles(player.position, { x: 0, y: 0 }, 10, 40);
          handleGameOver();
          CoreAudio.playGameOver();
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleResize, settings, stats.highScore, updateStats]);

  // Mobile shield button touch handlers
  const handleMobileShieldStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (settings.spacebarToggleMode) {
      gameStateRef.current.spaceIsDown = !gameStateRef.current.spaceIsDown;
      setIsHoldingShield(gameStateRef.current.spaceIsDown);
    } else {
      if (!gameStateRef.current.spaceIsDown && gameStateRef.current.player.energy > 15) {
        gameStateRef.current.player.energy -= 4;
      }
      gameStateRef.current.spaceIsDown = true;
      setIsHoldingShield(true);
    }
  };

  const handleMobileShieldEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!settings.spacebarToggleMode) {
      gameStateRef.current.spaceIsDown = false;
      setIsHoldingShield(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#010c12]">
      {/* Damage Flash Vignette Overlay */}
      {flashDamage && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-rose-600/20 border-4 border-rose-500/40 animate-pulse transition-opacity duration-100" />
      )}

      {/* In-Game HUD overlay */}
      {appState === 'playing' && settings.showHud && (
        <HUD
          score={hudScore}
          energy={hudEnergy}
          timeSec={hudTime}
          fps={hudFps}
          difficulty={hudDiff}
          settings={settings}
          onPause={pauseGame}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => {
            pauseGame();
            setShowSettingsModal(true);
          }}
        />
      )}

      {/* Main Home Menu */}
      {appState === 'menu' && (
        <HomeMenu
          settings={settings}
          stats={stats}
          onStartGame={startGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          onOpenHowToPlay={() => setShowHowToPlayModal(true)}
          onOpenStats={() => setShowStatsModal(true)}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Pause Modal */}
      {appState === 'paused' && !showSettingsModal && (
        <PauseModal
          onResume={resumeGame}
          onRestart={startGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExitToMenu={exitToMenu}
        />
      )}

      {/* Game Over Modal */}
      {appState === 'gameover' && !showSettingsModal && !showLeaderboardModal && (
        <GameOverModal
          score={roundStats.score}
          isNewHigh={roundStats.isNewHigh}
          highScore={stats.highScore}
          timeSec={roundStats.survivalSec}
          deflections={roundStats.deflections}
          energyAbsorbed={roundStats.energyAbsorbed}
          globalRank={roundStats.globalRank}
          nickname={settings.nickname}
          difficulty={settings.difficulty}
          onPlayAgain={startGame}
          onSwitchToHardcoreAndPlay={switchToHardcoreAndPlay}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          onExitToMenu={exitToMenu}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal
          currentNickname={settings.nickname}
          onUpdateNickname={handleUpdateNickname}
          onClose={() => setShowLeaderboardModal(false)}
          onPlayHardcore={switchToHardcoreAndPlay}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* How to Play Modal */}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}

      {/* Records & Stats Modal */}
      {showStatsModal && (
        <StatsModal
          stats={stats}
          onResetStats={handleResetStats}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* Main Game World Canvas */}
      <canvas id="world" ref={worldCanvasRef}>
        <p className="no-canvas">
          You need a <a href="https://www.google.com/chrome">modern browser</a> to view this.
        </p>
      </canvas>

      {/* Background Canvas */}
      <canvas id="background" ref={backgroundCanvasRef} />

      {/* On-screen touch shield button for mobile / touch devices */}
      {isMobileDevice && appState === 'playing' && (
        <button
          className={`mobile-shield-btn ${isHoldingShield ? 'active' : ''}`}
          onTouchStart={handleMobileShieldStart}
          onTouchEnd={handleMobileShieldEnd}
          onMouseDown={handleMobileShieldStart}
          onMouseUp={handleMobileShieldEnd}
        >
          {settings.spacebarToggleMode
            ? isHoldingShield
              ? 'Shield ON'
              : 'Shield OFF'
            : 'Hold Shield'}
        </button>
      )}
    </div>
  );
}
