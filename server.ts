import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

app.use(express.json());

// Seed initial verified Hardcore global records
const DEFAULT_HARDCORE_LEADERBOARD = [
  {
    id: 'hc_1',
    nickname: 'VortexPilot',
    score: 6890,
    survivalSec: 142.5,
    difficulty: 'hardcore',
    deflections: 128,
    energyAbsorbed: 24,
    theme: 'matrix',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'hc_2',
    nickname: 'ApexCore',
    score: 5420,
    survivalSec: 121.0,
    difficulty: 'hardcore',
    deflections: 104,
    energyAbsorbed: 19,
    theme: 'cyberCyan',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
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
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

function getLeaderboardData(): typeof DEFAULT_HARDCORE_LEADERBOARD {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADERBOARD_FILE)) {
      fs.writeFileSync(
        LEADERBOARD_FILE,
        JSON.stringify(DEFAULT_HARDCORE_LEADERBOARD, null, 2)
      );
      return DEFAULT_HARDCORE_LEADERBOARD;
    }
    const content = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Ensure all stored entries are strictly hardcore
    const filtered = parsed.filter(
      (item: { difficulty: string }) => item.difficulty === 'hardcore'
    );
    return filtered.length > 0 ? filtered : DEFAULT_HARDCORE_LEADERBOARD;
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
    return DEFAULT_HARDCORE_LEADERBOARD;
  }
}

function saveLeaderboardData(data: typeof DEFAULT_HARDCORE_LEADERBOARD) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing leaderboard file:', err);
  }
}

// API Routes
app.get('/api/leaderboard', (req, res) => {
  const sort = req.query.sort as string | undefined; // 'score' or 'time'

  // Only hardcore records qualify
  let list = getLeaderboardData();

  if (sort === 'time') {
    list.sort((a, b) => b.survivalSec - a.survivalSec);
  } else {
    list.sort((a, b) => b.score - a.score);
  }

  res.json({
    success: true,
    mode: 'hardcore',
    total: list.length,
    leaderboard: list.slice(0, 100),
  });
});

app.post('/api/leaderboard', (req, res) => {
  const {
    nickname,
    score,
    survivalSec,
    difficulty,
    deflections = 0,
    energyAbsorbed = 0,
    theme = 'cyberCyan',
  } = req.body;

  // STRICT ANTI-CHEAT: Only Hardcore mode qualifies for the Global Leaderboard
  if (difficulty !== 'hardcore') {
    return res.status(403).json({
      success: false,
      error: 'Leaderboard submissions are strictly restricted to Hardcore difficulty.',
      qualifies: false,
    });
  }

  if (typeof score !== 'number' || score <= 0) {
    return res.status(400).json({ error: 'Valid positive score is required' });
  }

  const cleanNickname = String(nickname || 'Anonymous')
    .trim()
    .slice(0, 20);

  const newEntry = {
    id: 'hc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    nickname: cleanNickname || 'Anonymous',
    score: Math.round(score),
    survivalSec: Math.round(Number(survivalSec || 0) * 10) / 10,
    difficulty: 'hardcore',
    deflections: Math.round(Number(deflections || 0)),
    energyAbsorbed: Math.round(Number(energyAbsorbed || 0)),
    theme: String(theme || 'cyberCyan'),
    createdAt: Date.now(),
  };

  const list = getLeaderboardData();
  list.push(newEntry);
  // Sort descending by score
  list.sort((a, b) => b.score - a.score);
  // Keep top 200
  const trimmed = list.slice(0, 200);
  saveLeaderboardData(trimmed);

  const rank = trimmed.findIndex((item) => item.id === newEntry.id) + 1;

  res.json({
    success: true,
    qualifies: true,
    entry: newEntry,
    rank: rank > 0 ? rank : trimmed.length,
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Core Game Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
