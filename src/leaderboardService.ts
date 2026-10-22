import { collection, doc, getDocs, setDoc, query, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { LeaderboardEntry } from './types';

const LOCAL_STORAGE_KEY = 'core_hardcore_leaderboard_cache_v1';

export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'hc_1',
    nickname: 'VortexPilot',
    score: 6890,
    survivalSec: 142.5,
    difficulty: 'hardcore',
    deflections: 128,
    energyAbsorbed: 24,
    theme: 'matrix',
    createdAt: 1790953767045,
  },
  {
    id: 'hc_2',
    nickname: 'ApexCore',
    score: 5420,
    survivalSec: 121,
    difficulty: 'hardcore',
    deflections: 104,
    energyAbsorbed: 19,
    theme: 'cyberCyan',
    createdAt: 1791040167045,
  },
  {
    id: 'hc_1791212972265_f5w78',
    nickname: 'TrueGamer',
    score: 5120,
    survivalSec: 115.3,
    difficulty: 'hardcore',
    deflections: 92,
    energyAbsorbed: 18,
    theme: 'matrix',
    createdAt: 1791212972265,
  },
  {
    id: 'hc_3',
    nickname: 'ShieldRunner',
    score: 4780,
    survivalSec: 108.4,
    difficulty: 'hardcore',
    deflections: 96,
    energyAbsorbed: 16,
    theme: 'synthwave',
    createdAt: 1791126567045,
  },
  {
    id: 'hc_4',
    nickname: 'PulseKnight',
    score: 3950,
    survivalSec: 92.1,
    difficulty: 'hardcore',
    deflections: 82,
    energyAbsorbed: 14,
    theme: 'solar',
    createdAt: 1791162567045,
  },
  {
    id: 'hc_5',
    nickname: 'CyberPhantom',
    score: 3410,
    survivalSec: 79.6,
    difficulty: 'hardcore',
    deflections: 71,
    energyAbsorbed: 12,
    theme: 'abyssal',
    createdAt: 1791191367045,
  },
  {
    id: 'hc_6',
    nickname: 'CoreDef_X',
    score: 2980,
    survivalSec: 68.3,
    difficulty: 'hardcore',
    deflections: 64,
    energyAbsorbed: 10,
    theme: 'matrix',
    createdAt: 1791205767045,
  },
];

function getLocalCachedEntries(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read leaderboard from localStorage', e);
  }
  return SEED_LEADERBOARD;
}

function saveLocalCachedEntries(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to write leaderboard to localStorage', e);
  }
}

/**
 * Fetch leaderboard entries across Firestore cloud, local server, or local cache
 */
export async function getGlobalLeaderboard(sortBy: 'score' | 'time' = 'score'): Promise<LeaderboardEntry[]> {
  let combined: LeaderboardEntry[] = [];

  // 1. Try Firebase Firestore directly (works on GitHub Pages!)
  try {
    const colRef = collection(db, 'leaderboard');
    const q = query(colRef, limit(100));
    const snapshot = await getDocs(q);

    const cloudEntries: LeaderboardEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      cloudEntries.push({
        id: docSnap.id,
        nickname: String(data.nickname || 'Pilot'),
        score: Number(data.score) || 0,
        survivalSec: Number(data.survivalSec) || 0,
        difficulty: String(data.difficulty || 'hardcore'),
        deflections: Number(data.deflections) || 0,
        energyAbsorbed: Number(data.energyAbsorbed) || 0,
        theme: String(data.theme || 'cyberCyan'),
        createdAt: Number(data.createdAt) || Date.now(),
      });
    });

    if (cloudEntries.length > 0) {
      combined = cloudEntries;
    }
  } catch (err) {
    console.warn('Firestore fetch failed, checking local API / cache:', err);
  }

  // 2. If Firestore was empty or failed, try Express API if running
  if (combined.length === 0) {
    try {
      const res = await fetch('/api/leaderboard?sort=' + sortBy);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          combined = data.leaderboard;
        }
      }
    } catch {
      // Ignore static host 404s
    }
  }

  // 3. Merge with seed/local cache to guarantee records are always visible
  const mergedMap = new Map<string, LeaderboardEntry>();
  SEED_LEADERBOARD.forEach((item) => mergedMap.set(item.id, item));
  getLocalCachedEntries().forEach((item) => mergedMap.set(item.id, item));
  combined.forEach((item) => mergedMap.set(item.id, item));

  const allEntries = Array.from(mergedMap.values());

  if (sortBy === 'time') {
    allEntries.sort((a, b) => b.survivalSec - a.survivalSec || b.score - a.score);
  } else {
    allEntries.sort((a, b) => b.score - a.score || b.survivalSec - a.survivalSec);
  }

  saveLocalCachedEntries(allEntries);
  return allEntries;
}

/**
 * Submit score to global Firestore and local storage
 */
export async function submitGlobalScore(entry: Omit<LeaderboardEntry, 'id'>): Promise<{ rank: number }> {
  const docId = `hc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullEntry: LeaderboardEntry = {
    ...entry,
    id: docId,
  };

  let savedCloud = false;

  // 1. Save directly to Firebase Firestore (works on GitHub Pages!)
  try {
    const docRef = doc(db, 'leaderboard', docId);
    await setDoc(docRef, fullEntry);
    savedCloud = true;
  } catch (err) {
    console.error('Failed to submit score to Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.CREATE, `leaderboard/${docId}`);
    } catch {
      // logged
    }
  }

  // 2. Also try Express server if running in fullstack mode
  try {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullEntry),
    });
  } catch {
    // Non-fatal on static hosts
  }

  // 3. Always update local storage cache immediately
  const existing = getLocalCachedEntries();
  const updated = [fullEntry, ...existing];
  updated.sort((a, b) => b.score - a.score);
  saveLocalCachedEntries(updated);

  const rank = updated.findIndex((item) => item.id === docId) + 1;
  return { rank: rank > 0 ? rank : 1 };
}
