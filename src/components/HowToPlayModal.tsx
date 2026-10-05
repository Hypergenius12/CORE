import React from 'react';
import { X, Shield, Zap, Sparkles, Volume2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#03131c] border border-[#1b3d4f] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b3d4f] bg-[#020d14]">
          <h2 className="font-['Montserrat'] font-black uppercase text-lg tracking-wider text-white">
            How to Play Core
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm font-sans">
          <div className="p-4 bg-[#020d14]/60 border border-[#1b3d4f] flex items-start gap-4">
            <div className="p-2.5 bg-[#3be2d4]/10 border border-[#3be2d4]/40 text-[#3be2d4] shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Montserrat'] font-bold text-xs uppercase text-white tracking-wider mb-1">
                1. Deflect Red Projectiles
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Move your mouse pointer or touch the screen to rotate your circular shield arc. Block incoming red enemy projectiles before they reach the organic core.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#020d14]/60 border border-[#1b3d4f] flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Montserrat'] font-bold text-xs uppercase text-white tracking-wider mb-1">
                2. Absorb Green Energy
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Green organisms are harmless and nourish your core. Let them pass unobstructed through your shield. Absorbing green energy grants <span className="text-emerald-400 font-bold">+8 Vitality</span> and <span className="text-emerald-400 font-bold">+30 Points</span>!
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#020d14]/60 border border-[#1b3d4f] flex items-start gap-4">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Montserrat'] font-bold text-xs uppercase text-white tracking-wider mb-1">
                3. Emergency 360° Shield
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Press &amp; hold <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 border border-white/20">SPACE</span> on desktop or touch the <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 border border-white/20">HOLD SHIELD</span> button on mobile to project a full 360-degree forcefield. Uses core vitality over time!
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#020d14]/60 border border-[#1b3d4f] flex items-start gap-4">
            <div className="p-2.5 bg-purple-500/10 border border-purple-400/40 text-purple-300 shrink-0 mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Montserrat'] font-bold text-xs uppercase text-white tracking-wider mb-1">
                4. Dynamic Procedural Audio
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Procedural synthesizer creates real-time harmonies panned across stereo space as organisms spawn, deflect, and interact with the core.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#020d14]/40 border border-[#1b3d4f]/60 text-xs text-slate-400 space-y-1">
            <div className="font-['Montserrat'] font-bold text-white uppercase text-[11px] tracking-wider">
              Origins &amp; Attribution
            </div>
            <p className="leading-relaxed">
              <strong>Core</strong> was originally created by creative developer{' '}
              <a
                href="https://hakim.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3be2d4] hover:underline"
              >
                Hakim El Hattab
              </a>{' '}
              as an interactive HTML5 experiment exploring procedural fluid dynamics and kinetic gameplay. Original lab demo available at{' '}
              <a
                href="https://lab.hakim.se/core/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3be2d4] hover:underline"
              >
                lab.hakim.se/core
              </a>
              . Sound design by{' '}
              <a
                href="https://luisbergmann.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3be2d4] hover:underline"
              >
                Luis Bergmann
              </a>
              .
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#1b3d4f] bg-[#020d14]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#eee] hover:bg-white text-slate-900 font-['Montserrat'] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
