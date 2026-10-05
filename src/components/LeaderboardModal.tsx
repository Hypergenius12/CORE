import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { X, Trophy, RefreshCw, User, Shield, Zap, Clock, Search, Flame, CheckCircle2 } from 'lucide-react';

interface LeaderboardModalProps {
  currentNickname: string;
  onUpdateNickname: (name: string) => void;
  onClose: () => void;
  onPlayHardcore?: () => void;
}

export function LeaderboardModal({
  currentNickname,
  onUpdateNickname,
  onClose,
  onPlayHardcore,
}: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [newNickInput, setNewNickInput] = useState<string>(currentNickname);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/leaderboard', window.location.origin);
      url.searchParams.set('sort', sortBy);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setEntries(data.leaderboard);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: unknown) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Could not connect to leaderboard service. Displaying cached records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNickInput.trim().slice(0, 20);
    if (trimmed) {
      onUpdateNickname(trimmed);
      setIsEditingNick(false);
    }
  };

  const filteredEntries = entries.filter((item) =>
    item.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-[#03131c] border border-[#1b3d4f] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-[#1b3d4f] bg-[#020d14] gap-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Montserrat'] font-black uppercase text-base sm:text-lg tracking-wider text-white">
                  Hardcore Hall of Fame
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ANTI-CHEAT VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Worldwide Official Hardcore Rankings (No Cheats / Mods)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Nickname pill/editor */}
            <div className="flex items-center bg-[#020d14] border border-[#1b3d4f] px-2.5 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-[#3be2d4] mr-1.5" />
              {isEditingNick ? (
                <form onSubmit={handleSaveNickname} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newNickInput}
                    onChange={(e) => setNewNickInput(e.target.value)}
                    maxLength={20}
                    autoFocus
                    className="bg-[#03131c] border border-[#3be2d4] px-1.5 py-0.5 text-xs text-white font-mono outline-none w-28"
                  />
                  <button
                    type="submit"
                    className="text-[10px] font-bold uppercase text-[#3be2d4] hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNick(false)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white font-bold">{currentNickname}</span>
                  <button
                    onClick={() => {
                      setNewNickInput(currentNickname);
                      setIsEditingNick(true);
                    }}
                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-[#3be2d4] transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice banner */}
        <div className="px-6 py-2 bg-[#020d14]/90 border-b border-[#1b3d4f] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Scores only submit when playing on official <strong>Hardcore Mode</strong>.</span>
          </div>
          {onPlayHardcore && (
            <button
              onClick={() => {
                onClose();
                onPlayHardcore();
              }}
              className="text-[#3be2d4] hover:underline font-bold uppercase"
            >
              Play Hardcore Now →
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-[#020d14]/70 border-b border-[#1b3d4f] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-['Montserrat'] uppercase text-[10px] font-bold">
              Sort By:
            </span>
            <div className="flex items-center border border-[#1b3d4f] bg-[#020d14]">
              <button
                onClick={() => setSortBy('score')}
                className={`px-3 py-1 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                  sortBy === 'score' ? 'bg-[#3be2d4]/20 text-[#3be2d4] font-bold' : 'text-slate-400'
                }`}
              >
                Highest Score
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-3 py-1 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                  sortBy === 'time' ? 'bg-[#3be2d4]/20 text-[#3be2d4] font-bold' : 'text-slate-400'
                }`}
              >
                Survival Time
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search pilot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#020d14] border border-[#1b3d4f] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-[#3be2d4] w-36 sm:w-48 font-mono"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              {error}
            </div>
          )}

          {loading && entries.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#3be2d4]" />
              Retrieving verified hardcore rankings...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              No entries found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-[#1b3d4f] text-[10px] font-['Montserrat'] uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Pilot</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right">Survival</th>
                    <th className="py-2.5 px-3 text-center">Deflections</th>
                    <th className="py-2.5 px-3 text-center">Mode</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b3d4f]/40 font-mono text-xs">
                  {filteredEntries.map((entry, index) => {
                    const isUser =
                      entry.nickname.toLowerCase() === currentNickname.toLowerCase();
                    const rank = index + 1;
                    return (
                      <tr
                        key={entry.id || index}
                        className={`transition-colors ${
                          isUser
                            ? 'bg-[#3be2d4]/10 text-white font-bold'
                            : 'hover:bg-white/[0.03] text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-400/20 text-amber-400 border border-amber-400/40 font-bold text-xs">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-300/20 text-slate-200 border border-slate-300/40 font-bold text-xs">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 pl-1">{rank}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-sans font-medium">
                            <span className={isUser ? 'text-[#3be2d4]' : 'text-white'}>
                              {entry.nickname}
                            </span>
                            {isUser && (
                              <span className="text-[9px] uppercase font-mono text-[#3be2d4] bg-[#3be2d4]/20 px-1 border border-[#3be2d4]/40">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {entry.score.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {formatTime(entry.survivalSec)}
                        </td>

                        <td className="py-2.5 px-3 text-center text-slate-400">
                          {entry.deflections} defl · {entry.energyAbsorbed} nrg
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] uppercase font-['Montserrat'] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5">
                            HARDCORE
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                          {formatDate(entry.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1b3d4f] bg-[#020d14]">
          <div className="text-[11px] text-slate-400 font-mono">
            Anti-Cheat active: Only authentic Hardcore runs qualify for global leaderboard submissions.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#eee] hover:bg-white text-slate-900 font-['Montserrat'] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
