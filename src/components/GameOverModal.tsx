import React from 'react';
import { RotateCcw, Home, Sliders, Trophy, Shield, Zap, Clock, Globe, AlertCircle, Flame } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  isNewHigh: boolean;
  highScore: number;
  timeSec: number;
  deflections: number;
  energyAbsorbed: number;
  globalRank?: number | null;
  nickname: string;
  difficulty: string;
  onPlayAgain: () => void;
  onSwitchToHardcoreAndPlay: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onExitToMenu: () => void;
}

export function GameOverModal({
  score,
  isNewHigh,
  highScore,
  timeSec,
  deflections,
  energyAbsorbed,
  globalRank,
  nickname,
  difficulty,
  onPlayAgain,
  onSwitchToHardcoreAndPlay,
  onOpenSettings,
  onOpenLeaderboard,
  onExitToMenu,
}: GameOverModalProps) {
  const isHardcore = difficulty === 'hardcore';

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-[#03131c] border border-[#1b3d4f] shadow-2xl text-center">
        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {isNewHigh && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1">
              <Trophy className="w-3.5 h-3.5" /> NEW PERSONAL BEST!
            </div>
          )}

          {isHardcore ? (
            globalRank && globalRank > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#3be2d4] bg-[#3be2d4]/10 border border-[#3be2d4]/30 px-3 py-1">
                <Globe className="w-3.5 h-3.5" /> GLOBAL HARDCORE RANK #{globalRank}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#3be2d4] bg-[#3be2d4]/10 border border-[#3be2d4]/30 px-3 py-1">
                <Flame className="w-3.5 h-3.5" /> RANKED HARDCORE RUN
              </div>
            )
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700 px-2.5 py-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              UNRANKED ({difficulty.toUpperCase()})
            </div>
          )}
        </div>

        <h2 className="text-3xl sm:text-4xl font-['Montserrat'] font-black uppercase text-white tracking-wider mb-1">
          Game Over
        </h2>

        {/* Unranked Notice */}
        {!isHardcore && (
          <p className="text-[11px] text-amber-300/90 font-mono mt-1 mb-2 bg-amber-950/20 border border-amber-500/20 p-1.5">
            Only Hardcore runs qualify for the Global Leaderboard to prevent cheating.
          </p>
        )}

        <div className="my-4 p-4 bg-[#020d14]/80 border border-[#1b3d4f]">
          <div className="text-[10px] uppercase font-['Montserrat'] font-bold text-slate-400 tracking-widest mb-1">
            Final Score · Pilot {nickname}
          </div>
          <div className="text-4xl font-['Montserrat'] font-black text-[#3be2d4] tracking-tight">
            {Math.round(score).toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            ALL-TIME BEST: {Math.max(score, highScore).toLocaleString()}
          </div>
        </div>

        {/* Round Performance Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-2.5 bg-[#020d14]/50 border border-[#1b3d4f]">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-slate-400 font-['Montserrat'] mb-1">
              <Clock className="w-3 h-3 text-[#3be2d4]" /> Time
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {formatTime(timeSec)}
            </div>
          </div>

          <div className="p-2.5 bg-[#020d14]/50 border border-[#1b3d4f]">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-slate-400 font-['Montserrat'] mb-1">
              <Shield className="w-3 h-3 text-[#3be2d4]" /> Deflected
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {deflections}
            </div>
          </div>

          <div className="p-2.5 bg-[#020d14]/50 border border-[#1b3d4f]">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-slate-400 font-['Montserrat'] mb-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Energy
            </div>
            <div className="text-sm font-mono font-bold text-white">
              {energyAbsorbed}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!isHardcore ? (
            <button
              onClick={onSwitchToHardcoreAndPlay}
              className="w-full py-3 px-4 bg-[#3be2d4] hover:bg-[#5ff3e6] text-slate-950 font-['Montserrat'] font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <Flame className="w-4 h-4 text-slate-950 fill-current" /> Switch to Hardcore &amp; Compete
            </button>
          ) : null}

          <button
            onClick={onPlayAgain}
            className={`w-full py-3 px-6 ${
              isHardcore ? 'bg-[#eee] hover:bg-white text-slate-900' : 'border border-[#1b3d4f] bg-[#020d14]/80 text-white hover:bg-white/10'
            } font-['Montserrat'] font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer`}
          >
            <RotateCcw className="w-4 h-4" /> Play Again ({difficulty.toUpperCase()})
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 border border-[#3be2d4]/50 bg-[#3be2d4]/10 hover:bg-[#3be2d4]/20 text-[#3be2d4] hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#3be2d4]" /> View Global Hardcore Leaderboard
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSettings}
              className="py-2 px-3 border border-[#1b3d4f] bg-[#020d14]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#3be2d4]" /> Settings
            </button>
            <button
              onClick={onExitToMenu}
              className="py-2 px-3 border border-[#1b3d4f] bg-[#020d14]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#3be2d4]" /> Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
