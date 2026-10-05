import React, { useState } from 'react';
import {
  GameSettings,
  THEMES,
  ThemeId,
  DifficultyPreset,
  DEFAULT_SETTINGS,
  ScreenShakeIntensity,
  SynthesizerScale,
} from '../types';
import { CoreAudio } from '../audio';
import { X, RotateCcw, Volume2, Sliders, Palette, Zap, Sparkles, User } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onUpdateSettings, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'difficulty' | 'themes' | 'audio' | 'controls' | 'profile'>('difficulty');

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
  };

  const handleDifficultyPreset = (preset: DifficultyPreset) => {
    let updated = { ...settings, difficulty: preset };
    if (preset === 'zen') {
      updated = {
        ...updated,
        initialEnergy: 50,
        spawnRateMultiplier: 0.6,
        projectileSpeedMultiplier: 0.7,
        shieldArcWidth: 2.0,
        spaceShieldDrain: 0.06,
        energyGain: 12,
        energyDamage: 4,
      };
    } else if (preset === 'original') {
      updated = {
        ...updated,
        initialEnergy: 30,
        spawnRateMultiplier: 1.0,
        projectileSpeedMultiplier: 1.0,
        shieldArcWidth: 1.6,
        spaceShieldDrain: 0.1,
        energyGain: 8,
        energyDamage: 6,
      };
    } else if (preset === 'hardcore') {
      updated = {
        ...updated,
        initialEnergy: 25,
        spawnRateMultiplier: 1.4,
        projectileSpeedMultiplier: 1.3,
        shieldArcWidth: 1.2,
        spaceShieldDrain: 0.15,
        energyGain: 6,
        energyDamage: 10,
      };
    } else if (preset === 'bulletHell') {
      updated = {
        ...updated,
        initialEnergy: 40,
        spawnRateMultiplier: 2.2,
        projectileSpeedMultiplier: 1.1,
        shieldArcWidth: 1.6,
        spaceShieldDrain: 0.08,
        energyGain: 8,
        energyDamage: 5,
      };
    }
    onUpdateSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    updateSetting('masterVolume', vol);
    CoreAudio.setVolume(vol);
  };

  const handleScaleChange = (scale: SynthesizerScale) => {
    updateSetting('synthesizerScale', scale);
    CoreAudio.setScale(scale);
  };

  const resetDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    CoreAudio.setVolume(DEFAULT_SETTINGS.masterVolume);
    CoreAudio.setMuted(DEFAULT_SETTINGS.isMuted);
    CoreAudio.setAmbientEnabled(DEFAULT_SETTINGS.ambientSynth);
    CoreAudio.setSfxEnabled(DEFAULT_SETTINGS.sfx);
    CoreAudio.setScale(DEFAULT_SETTINGS.synthesizerScale);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#03131c] border border-[#1b3d4f] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b3d4f] bg-[#020d14]">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-[#3be2d4]" />
            <h2 className="font-['Montserrat'] font-black uppercase text-lg tracking-wider text-white">
              Game Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1b3d4f] bg-[#020d14]/70 px-4 sm:px-6 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('difficulty')}
            className={`py-3 px-2 sm:px-3 text-xs font-['Montserrat'] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'difficulty'
                ? 'border-[#3be2d4] text-[#3be2d4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Difficulty
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3 px-2 sm:px-3 text-xs font-['Montserrat'] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'border-[#3be2d4] text-[#3be2d4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Themes
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-2 sm:px-3 text-xs font-['Montserrat'] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'border-[#3be2d4] text-[#3be2d4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" /> Audio
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-2 sm:px-3 text-xs font-['Montserrat'] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'controls'
                ? 'border-[#3be2d4] text-[#3be2d4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Controls
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-2 sm:px-3 text-xs font-['Montserrat'] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#3be2d4] text-[#3be2d4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Pilot
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          {/* DIFFICULTY TAB */}
          {activeTab === 'difficulty' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 font-['Montserrat']">
                    Difficulty Preset
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    ⚡ Anti-Cheat: Hardcore Ranked Only
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'zen', label: 'Zen / Chill', desc: 'Slow & forgiving', ranked: false },
                      { id: 'original', label: 'Original 2018', desc: 'Hakim classic', ranked: false },
                      { id: 'hardcore', label: 'Hardcore', desc: 'Fast & lethal', ranked: true },
                      { id: 'bulletHell', label: 'Bullet Hell', desc: 'Dense swarms', ranked: false },
                    ] as const
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleDifficultyPreset(preset.id)}
                      className={`p-3 text-left border transition-all cursor-pointer relative ${
                        settings.difficulty === preset.id
                          ? 'border-[#3be2d4] bg-[#3be2d4]/10 text-white'
                          : 'border-[#1b3d4f] bg-[#020d14]/40 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {preset.ranked && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold uppercase text-[#3be2d4] bg-[#3be2d4]/20 border border-[#3be2d4]/40 px-1">
                          RANKED
                        </span>
                      )}
                      <div className="font-['Montserrat'] font-bold text-xs uppercase tracking-wide">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{preset.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-2.5 bg-[#020d14]/70 border border-[#1b3d4f] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>
                    Status:{' '}
                    {settings.difficulty === 'hardcore' ? (
                      <span className="text-[#3be2d4] font-bold">
                        ACTIVE ON LEADERBOARD (Hardcore)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">
                        UNRANKED PRACTICE ({settings.difficulty.toUpperCase()})
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500 hidden sm:inline">
                    Scores only submit on Hardcore
                  </span>
                </div>
              </div>

              {/* Advanced Fine Tuning */}
              <div className="pt-4 border-t border-[#1b3d4f]/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-['Montserrat'] font-bold text-xs uppercase tracking-wider text-slate-300">
                    Custom Tuning Parameters
                  </span>
                  <span className="text-[11px] text-slate-500">Live modifications</span>
                </div>

                <div className="space-y-4 bg-[#020d14]/50 p-4 border border-[#1b3d4f]">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Initial Core Energy</span>
                      <span className="font-mono text-[#3be2d4]">{settings.initialEnergy}</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={80}
                      step={5}
                      value={settings.initialEnergy}
                      onChange={(e) => {
                        updateSetting('difficulty', 'custom');
                        updateSetting('initialEnergy', Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Spawn Rate Multiplier</span>
                      <span className="font-mono text-[#3be2d4]">
                        {settings.spawnRateMultiplier.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={settings.spawnRateMultiplier}
                      onChange={(e) => {
                        updateSetting('difficulty', 'custom');
                        updateSetting('spawnRateMultiplier', Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Projectile Speed Multiplier</span>
                      <span className="font-mono text-[#3be2d4]">
                        {settings.projectileSpeedMultiplier.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={settings.projectileSpeedMultiplier}
                      onChange={(e) => {
                        updateSetting('difficulty', 'custom');
                        updateSetting('projectileSpeedMultiplier', Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Shield Arc Width</span>
                      <span className="font-mono text-[#3be2d4]">
                        {settings.shieldArcWidth < 1.4
                          ? 'Narrow'
                          : settings.shieldArcWidth > 1.8
                          ? 'Wide'
                          : 'Standard'}{' '}
                        ({(settings.shieldArcWidth * (180 / Math.PI)).toFixed(0)}°)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={2.4}
                      step={0.1}
                      value={settings.shieldArcWidth}
                      onChange={(e) => {
                        updateSetting('difficulty', 'custom');
                        updateSetting('shieldArcWidth', Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THEMES & VISUALS TAB */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 font-['Montserrat']">
                  Visual Color Palette
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = settings.theme === themeKey;
                    return (
                      <button
                        key={t.id}
                        onClick={() => updateSetting('theme', themeKey)}
                        className={`p-3 border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3be2d4] bg-[#3be2d4]/10 text-white'
                            : 'border-[#1b3d4f] bg-[#020d14]/40 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="font-['Montserrat'] font-bold text-xs uppercase">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.coreStroke }}
                            />
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.shieldArc }}
                            />
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.enemyColor }}
                            />
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.energyColor }}
                            />
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[#3be2d4] text-xs font-mono font-bold">ACTIVE</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Effects */}
              <div className="space-y-3 bg-[#020d14]/50 p-4 border border-[#1b3d4f]">
                <div className="font-['Montserrat'] font-bold text-xs uppercase tracking-wider text-slate-300 mb-2">
                  Screen Effects & Topology
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-slate-200 font-medium">Screen Shake on Impact</div>
                    <div className="text-[11px] text-slate-400">Vibration feedback when hit</div>
                  </div>
                  <div className="flex items-center gap-1 border border-[#1b3d4f] bg-[#020d14]">
                    {(['off', 'subtle', 'intense'] as ScreenShakeIntensity[]).map((val) => (
                      <button
                        key={val}
                        onClick={() => updateSetting('screenShake', val)}
                        className={`px-2 py-1 text-[11px] uppercase font-mono transition-colors ${
                          settings.screenShake === val
                            ? 'bg-[#3be2d4]/20 text-[#3be2d4] font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="text-slate-200 font-medium">Damage Screen Flash</div>
                    <div className="text-[11px] text-slate-400">Red warning vignette when core takes damage</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.damageFlash}
                    onChange={(e) => updateSetting('damageFlash', e.target.checked)}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="text-slate-200 font-medium">Core Blob Topology Nodes</div>
                    <div className="text-[11px] text-slate-400">Geometry resolution of the organic core</div>
                  </div>
                  <div className="flex items-center gap-1 border border-[#1b3d4f] bg-[#020d14]">
                    {[
                      { val: 8, label: '8 (Low)' },
                      { val: 16, label: '16 (Orig)' },
                      { val: 24, label: '24 (Liquid)' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => updateSetting('coreQualityNodes', item.val)}
                        className={`px-2 py-1 text-[11px] uppercase font-mono transition-colors ${
                          settings.coreQualityNodes === item.val
                            ? 'bg-[#3be2d4]/20 text-[#3be2d4] font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 font-['Montserrat']">
                  Particle Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => updateSetting('particleDensity', density)}
                      className={`p-2.5 text-center border uppercase font-['Montserrat'] text-xs font-bold transition-all cursor-pointer ${
                        settings.particleDensity === density
                          ? 'border-[#3be2d4] bg-[#3be2d4]/10 text-white'
                          : 'border-[#1b3d4f] bg-[#020d14]/40 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-['Montserrat'] font-bold uppercase text-slate-300">
                    Master Volume
                  </span>
                  <span className="font-mono text-[#3be2d4]">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3 bg-[#020d14]/50 p-4 border border-[#1b3d4f]">
                <div className="font-['Montserrat'] font-bold text-xs uppercase tracking-wider text-slate-300 mb-1">
                  Synthesizer Musical Tuning Scale
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { id: 'minor', label: 'Minor Hexatonic', desc: 'Original classic dark ambient' },
                    { id: 'dorian', label: 'Dorian Cyber', desc: 'Futuristic sci-fi mood' },
                    { id: 'blues', label: 'Cyber Blues', desc: 'Gritty electric tension' },
                    { id: 'major', label: 'Lydian Celestial', desc: 'Bright harmonic resonance' },
                  ].map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => handleScaleChange(scale.id as SynthesizerScale)}
                      className={`p-2.5 text-left border transition-all cursor-pointer ${
                        settings.synthesizerScale === scale.id
                          ? 'border-[#3be2d4] bg-[#3be2d4]/10 text-white'
                          : 'border-[#1b3d4f] bg-[#020d14]/40 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-['Montserrat'] font-bold text-xs uppercase">
                        {scale.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{scale.desc}</div>
                    </button>
                  ))}
                </div>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="font-medium text-slate-200">Ambient Procedural Synth</div>
                    <div className="text-[11px] text-slate-400">
                      Spatial generative harmonic chords on organism spawn
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ambientSynth}
                    onChange={(e) => {
                      updateSetting('ambientSynth', e.target.checked);
                      CoreAudio.setAmbientEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="font-medium text-slate-200">Sound Effects (SFX)</div>
                    <div className="text-[11px] text-slate-400">
                      Deflection clicks, forcefield hum, energy chimes, crash
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sfx}
                    onChange={(e) => {
                      updateSetting('sfx', e.target.checked);
                      CoreAudio.setSfxEnabled(e.target.checked);
                    }}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* CONTROLS & DISPLAY TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="space-y-3 bg-[#020d14]/50 p-4 border border-[#1b3d4f]">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <div className="font-medium text-slate-200">Show In-Game HUD &amp; FPS</div>
                    <div className="text-[11px] text-slate-400">
                      Top bar with real-time score, energy meter, elapsed time &amp; FPS
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showHud}
                    onChange={(e) => updateSetting('showHud', e.target.checked)}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="font-medium text-slate-200">Smooth Cursor Lerp</div>
                    <div className="text-[11px] text-slate-400">
                      Smooth rotational momentum vs direct snap (recommended ON)
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smoothMouse}
                    onChange={(e) => updateSetting('smoothMouse', e.target.checked)}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="font-medium text-slate-200">Invert Rotation Direction</div>
                    <div className="text-[11px] text-slate-400">
                      Mirror shield angle calculation
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.invertControls}
                    onChange={(e) => updateSetting('invertControls', e.target.checked)}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-2 border-t border-[#1b3d4f]/60">
                  <div>
                    <div className="font-medium text-slate-200">Spacebar Mode: Toggle vs Hold</div>
                    <div className="text-[11px] text-slate-400">
                      {settings.spacebarToggleMode
                        ? 'Press Space once to toggle shield on/off'
                        : 'Hold Space continuously to keep shield active'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.spacebarToggleMode}
                    onChange={(e) => updateSetting('spacebarToggleMode', e.target.checked)}
                    className="w-4 h-4 accent-[#3be2d4] cursor-pointer"
                  />
                </label>

                <div className="py-2 border-t border-[#1b3d4f]/60">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Inner Cursor Deadzone</span>
                    <span className="font-mono text-[#3be2d4]">{settings.deadzoneRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={settings.deadzoneRadius}
                    onChange={(e) => updateSetting('deadzoneRadius', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PILOT PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#020d14]/50 p-4 border border-[#1b3d4f] space-y-3">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-300 font-['Montserrat']">
                  Pilot Callsign / Nickname
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.nickname}
                    onChange={(e) => updateSetting('nickname', e.target.value.slice(0, 20))}
                    placeholder="Enter callsig..."
                    maxLength={20}
                    className="flex-1 bg-[#020d14] border border-[#1b3d4f] focus:border-[#3be2d4] px-3 py-2 text-sm text-white font-mono outline-none"
                  />
                  <button
                    onClick={() =>
                      updateSetting(
                        'nickname',
                        'Pilot_' + Math.floor(100 + Math.random() * 900)
                      )
                    }
                    className="px-3 py-2 border border-[#1b3d4f] hover:border-slate-400 text-xs font-mono text-slate-300 hover:text-white"
                  >
                    Random
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your nickname will be attributed to your high scores on the global leaderboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1b3d4f] bg-[#020d14]">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#eee] hover:bg-white text-slate-900 font-['Montserrat'] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
