import React from 'react';
import { GameStats } from '../types';
import { X, Trophy, Activity, Zap, Shield, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  stats: GameStats;
  onResetStats: () => void;
  onClose: () => void;
}

export function StatsModal({ stats, onResetStats, onClose }: StatsModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#03131c] border border-[#1b3d4f] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b3d4f] bg-[#020d14]">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#3be2d4]" />
            <h2 className="font-['Montserrat'] font-black uppercase text-lg tracking-wider text-white">
              Player Records
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#020d14]/70 border border-[#1b3d4f] text-center">
            <div className="text-xs uppercase font-['Montserrat'] text-slate-400 font-bold tracking-widest mb-1">
              All-Time High Score
            </div>
            <div className="text-3xl font-['Montserrat'] font-black text-[#3be2d4] tracking-tight">
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#020d14]/50 border border-[#1b3d4f]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-['Montserrat'] uppercase mb-1">
                <Shield className="w-3.5 h-3.5 text-[#3be2d4]" /> Deflections
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {stats.enemiesDeflected.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-[#020d14]/50 border border-[#1b3d4f]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-['Montserrat'] uppercase mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Energy Absorbed
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {stats.energyAbsorbed.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-[#020d14]/50 border border-[#1b3d4f]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-['Montserrat'] uppercase mb-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Best Survival
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {formatTime(stats.longestSurvivalSec)}
              </div>
            </div>

            <div className="p-3 bg-[#020d14]/50 border border-[#1b3d4f]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-['Montserrat'] uppercase mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Games Played
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {stats.gamesPlayed.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1b3d4f] bg-[#020d14]">
          <button
            onClick={() => {
              if (window.confirm('Reset all lifetime stats to zero?')) {
                onResetStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Records
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#eee] hover:bg-white text-slate-900 font-['Montserrat'] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
