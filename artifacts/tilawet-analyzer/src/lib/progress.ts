export interface GameProgress {
  completed: boolean;
  highScore: number;
  completedAt?: string;
  badge?: string;
}

const BASE_KEYS: Record<string, string> = {
  "kuran-kasifi": "progress-kuran-kasifi",
  "tecvid-ustasi": "progress-tecvid-ustasi",
  "harflerin-yolculugu": "progress-harflerin-yolculugu",
  "tilavet-yarismasi": "progress-tilavet-yarismasi",
  "bilgi-yolculugu": "progress-bilgi-yolculugu",
};

let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  _currentUserId = userId;
}

function getStorageKey(gameId: string): string {
  const base = BASE_KEYS[gameId] ?? gameId;
  return `${base}__${_currentUserId}`;
}

const EMPTY: GameProgress = { completed: false, highScore: 0 };

export function getProgress(gameId: string): GameProgress {
  if (!_currentUserId) return { ...EMPTY };
  try {
    const raw = localStorage.getItem(getStorageKey(gameId));
    if (!raw) return { ...EMPTY };
    return JSON.parse(raw) as GameProgress;
  } catch {
    return { ...EMPTY };
  }
}

export function saveProgress(gameId: string, score: number, badge?: string): void {
  if (!_currentUserId) return;
  const existing = getProgress(gameId);
  const updated: GameProgress = {
    completed: true,
    highScore: Math.max(existing.highScore, score),
    completedAt: new Date().toLocaleDateString("tr-TR"),
    badge: badge || existing.badge,
  };
  try {
    localStorage.setItem(getStorageKey(gameId), JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getAllProgress(): Record<string, GameProgress> {
  if (!_currentUserId) {
    return Object.keys(BASE_KEYS).reduce(
      (acc, id) => ({ ...acc, [id]: { ...EMPTY } }),
      {} as Record<string, GameProgress>
    );
  }
  return Object.keys(BASE_KEYS).reduce(
    (acc, id) => ({ ...acc, [id]: getProgress(id) }),
    {} as Record<string, GameProgress>
  );
}
