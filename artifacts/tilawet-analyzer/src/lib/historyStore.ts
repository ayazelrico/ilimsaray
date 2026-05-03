export interface AnalysisEntry {
  id: string;
  date: string;
  transcribedText: string;
  totalScore: number;
  genel_yorum: string;
}

const MAX_HISTORY = 20;
let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  _currentUserId = userId;
}

function getStorageKey(): string {
  return `tilawet_history__${_currentUserId}`;
}

export function getHistory(): AnalysisEntry[] {
  if (!_currentUserId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: Omit<AnalysisEntry, "id" | "date">): void {
  if (!_currentUserId) return;
  const history = getHistory();
  const newEntry: AnalysisEntry = {
    id: Math.random().toString(36).slice(2),
    date: new Date().toLocaleDateString("tr-TR"),
    ...entry,
  };
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
  } catch {
    // ignore
  }
}
