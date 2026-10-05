import React from 'react';
import { Pause, Volume2, VolumeX, Sliders } from 'lucide-react';
import { GameSettings } from '../types';

interface HUDProps {
  score: number;
  energy: number;
  timeSec: number;
  fps: number;
  difficulty: number;
  settings: GameSettings;
  onPause: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export function HUD({
  score,
  energy,
  timeSec,
  fps,
  difficulty,
  settings,
  onPause,
  onToggleSound,
  onOpenSettings,
}: HUDProps) {
  const energyPercent = Math.max(0, Math.min(100, Math.round(energy)));
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getEnergyColor = (val: number) => {
    if (val > 40) return '#3be2d4';
    if (val > 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-5 flex items-start justify-between select-none">
      {/* Left: Score & Multiplier */}
      <div className="bg-[#020d14]/75 border border-[#1b3d4f] px-4 py-2.5 backdrop-blur-sm pointer-events-auto">
        <div className="text-[10px] font-['Montserrat'] uppercase font-bold text-slate-400 tracking-wider">
          Score
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight leading-none mt-0.5">
          {Math.round(score).toLocaleString()}
        </div>
        <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
          <span>DIFF: {difficulty.toFixed(2)}x</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{formatTime(timeSec)}</span>
        </div>
      </div>

      {/* Center: Vitality Core Energy Bar */}
      <div className="bg-[#020d14]/75 border border-[#1b3d4f] px-4 py-2.5 backdrop-blur-sm pointer-events-auto min-w-[160px] sm:min-w-[220px]">
        <div className="flex items-center justify-between text-[10px] font-['Montserrat'] uppercase font-bold tracking-wider mb-1">
          <span className="text-slate-300">Core Vitality</span>
          <span
            className="font-mono font-bold"
            style={{ color: getEnergyColor(energyPercent) }}
          >
            {energyPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-black/60 border border-[#1b3d4f]/80 overflow-hidden">
          <div
            className="h-full transition-all duration-75"
            style={{
              width: `${energyPercent}%`,
              backgroundColor: getEnergyColor(energyPercent),
              boxShadow: `0 0 8px ${getEnergyColor(energyPercent)}`,
            }}
          />
        </div>
      </div>

      {/* Right: Controls & FPS */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <div className="hidden sm:block bg-[#020d14]/75 border border-[#1b3d4f] px-2.5 py-1.5 backdrop-blur-sm text-[11px] font-mono text-slate-400">
          FPS: {fps}
        </div>

        <button
          onClick={onToggleSound}
          className="p-2 bg-[#020d14]/75 border border-[#1b3d4f] text-slate-300 hover:text-white hover:border-[#3be2d4] transition-colors cursor-pointer"
          title="Toggle Sound"
        >
          {settings.isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#3be2d4]" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 bg-[#020d14]/75 border border-[#1b3d4f] text-slate-300 hover:text-white hover:border-[#3be2d4] transition-colors cursor-pointer"
          title="Settings"
        >
          <Sliders className="w-4 h-4 text-slate-300" />
        </button>

        <button
          onClick={onPause}
          className="p-2 bg-[#020d14]/75 border border-[#1b3d4f] text-slate-300 hover:text-white hover:border-[#3be2d4] transition-colors cursor-pointer"
          title="Pause Game (ESC / P)"
        >
          <Pause className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}
