import React from 'react';
import { GameSettings, GameStats, THEMES } from '../types';
import { Play, Sliders, HelpCircle, Trophy, Volume2, VolumeX, Globe, User } from 'lucide-react';

interface HomeMenuProps {
  settings: GameSettings;
  stats: GameStats;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onToggleSound: () => void;
}

export function HomeMenu({
  settings,
  stats,
  onStartGame,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenStats,
  onToggleSound,
}: HomeMenuProps) {
  const currentTheme = THEMES[settings.theme] || THEMES.cyberCyan;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-8 pointer-events-none select-none">
      <div className="relative w-full max-w-xl p-6 sm:p-10 bg-[#020d14]/85 border border-[#1b3d4f] shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Top bar indicators */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#1b3d4f] pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="font-['Montserrat'] font-bold uppercase tracking-wider text-slate-300">
              {settings.difficulty.toUpperCase()}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">{currentTheme.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#3be2d4] transition-colors"
              title="Edit Profile"
            >
              <User className="w-3.5 h-3.5 text-[#3be2d4]" />
              <span className="font-mono text-white font-bold">{settings.nickname}</span>
            </button>

            <button
              onClick={onToggleSound}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              title="Toggle Audio"
            >
              {settings.isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] font-mono">MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#3be2d4]" />
                  <span className="text-[11px] font-mono">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-baseline justify-between mb-2">
            <h1 className="text-4xl sm:text-5xl font-['Montserrat'] font-black uppercase text-white tracking-wider">
              Core
            </h1>
            {stats.highScore > 0 && (
              <div className="text-right">
                <div className="text-[10px] uppercase font-['Montserrat'] font-bold text-slate-400 tracking-widest">
                  Personal Best
                </div>
                <div className="text-lg font-mono font-bold text-[#3be2d4]">
                  {stats.highScore.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed uppercase font-['Montserrat'] font-medium">
            Protect the core from incoming red projectiles. Let green ones through.{' '}
            <span className="text-white font-bold">Press &amp; hold SPACE</span> for a temporary shield.
          </p>
        </div>

        {/* Main Action Menu */}
        <div className="space-y-2.5 mb-6 sm:mb-8">
          <button
            onClick={onStartGame}
            className="w-full py-3.5 px-6 bg-[#eee] hover:bg-white text-slate-950 font-['Montserrat'] font-black uppercase text-base sm:text-lg tracking-wider flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> Start Game
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 border border-[#3be2d4]/50 bg-[#3be2d4]/10 hover:bg-[#3be2d4]/20 text-[#3be2d4] hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#3be2d4]" /> Global Hall of Fame
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenSettings}
              className="py-2.5 px-3 border border-[#1b3d4f] bg-[#03141e]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#3be2d4]" /> Settings
            </button>
            <button
              onClick={onOpenHowToPlay}
              className="py-2.5 px-3 border border-[#1b3d4f] bg-[#03141e]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#3be2d4]" /> Guide
            </button>
            <button
              onClick={onOpenStats}
              className="py-2.5 px-3 border border-[#1b3d4f] bg-[#03141e]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#3be2d4]" /> Records
            </button>
          </div>
        </div>

        {/* Credits */}
        <div className="pt-4 border-t border-[#1b3d4f] text-slate-400 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              Original HTML5 Experiment by{' '}
              <a
                href="https://hakim.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3be2d4] hover:text-white hover:underline font-bold"
              >
                Hakim El Hattab
              </a>{' '}
              (
              <a
                href="https://github.com/hakimel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white hover:underline"
              >
                GitHub
              </a>{' '}
              ·{' '}
              <a
                href="https://twitter.com/hakimel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white hover:underline"
              >
                @hakimel
              </a>
              )
            </div>
            <div>
              Sound Design by{' '}
              <a
                href="https://luisbergmann.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3be2d4] hover:text-white hover:underline font-bold"
              >
                Luis Bergmann
              </a>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>
              Original Lab:{' '}
              <a
                href="https://lab.hakim.se/core/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#3be2d4] hover:underline"
              >
                lab.hakim.se/core
              </a>
            </span>
            <span>MIT Licensed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
