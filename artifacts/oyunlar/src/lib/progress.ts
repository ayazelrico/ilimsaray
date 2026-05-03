export interface GameProgress {
  completed: boolean;
  highScore: number;
  completedAt?: string;
  badge?: string;
}

const KEYS: Record<string, string> = {
  "kuran-kasifi": "progress-kuran-kasifi",
  "tecvid-ustasi": "progress-tecvid-ustasi",
  "harflerin-yolculugu": "progress-harflerin-yolculugu",
  "tilavet-yarismasi": "progress-tilavet-yarismasi",
  "bilgi-yolculugu": "progress-bilgi-yolculugu",
};

export function getProgress(gameId: string): GameProgress {
  try {
    const raw = localStorage.getItem(KEYS[gameId] || gameId);
    if (!raw) return { completed: false, highScore: 0 };
    return JSON.parse(raw) as GameProgress;
  } catch {
    return { completed: false, highScore: 0 };
  }
}

export function saveProgress(gameId: string, score: number, badge?: string) {
  const existing = getProgress(gameId);
  const updated: GameProgress = {
    completed: true,
    highScore: Math.max(existing.highScore, score),
    completedAt: new Date().toLocaleDateString("tr-TR"),
    badge: badge || existing.badge,
  };
  try {
    localStorage.setItem(KEYS[gameId] || gameId, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getAllProgress(): Record<string, GameProgress> {
  return Object.keys(KEYS).reduce(
    (acc, id) => ({ ...acc, [id]: getProgress(id) }),
    {} as Record<string, GameProgress>
  );
}
