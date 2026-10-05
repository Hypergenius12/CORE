import React from 'react';
import { Play, RotateCcw, Sliders, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExitToMenu: () => void;
}

export function PauseModal({
  onResume,
  onRestart,
  onOpenSettings,
  onExitToMenu,
}: PauseModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm p-6 bg-[#03131c] border border-[#1b3d4f] shadow-2xl text-center">
        <h2 className="text-2xl font-['Montserrat'] font-black uppercase text-white tracking-widest mb-1">
          Paused
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">PRESS ESC OR P TO RESUME</p>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-[#eee] hover:bg-white text-slate-900 font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Resume
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 border border-[#1b3d4f] bg-[#020d14]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#3be2d4]" /> Restart Match
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 border border-[#1b3d4f] bg-[#020d14]/70 hover:bg-[#3be2d4]/10 hover:border-[#3be2d4]/50 text-slate-200 hover:text-white font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#3be2d4]" /> Game Settings
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 px-4 border border-[#1b3d4f] bg-[#020d14]/70 hover:bg-rose-500/10 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-['Montserrat'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> Return to Menu
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-[#1b3d4f]/60 text-[10px] font-mono text-slate-500">
          Core by <a href="https://hakim.se/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#3be2d4] underline">Hakim El Hattab</a> · Sound by <a href="https://luisbergmann.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#3be2d4] underline">Luis Bergmann</a>
        </div>
      </div>
    </div>
  );
}
