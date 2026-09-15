import type {
  Attempt,
  DrillAttempt,
  DrillStats,
  EnglishSkill,
  SavedSession,
} from "./types";
import { ENGLISH_SKILLS } from "./types";

const USED = "dcf.usedIds.v1";
const ATTEMPTS = "dcf.attempts.v1";
const DRILLS = "dcf.drills.v1";
const DRILL_STATS = "dcf.drillStats.v1";
const SESSION = "dcf.session.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadUsedIds(): Set<string> {
  return new Set(readJson<string[]>(USED, []));
}

export function saveUsedIds(ids: Set<string>) {
  writeJson(USED, Array.from(ids));
}

export function markServed(ids: string[]) {
  const used = loadUsedIds();
  for (const id of ids) used.add(id);
  saveUsedIds(used);
  return used;
}

export function loadAttempts(): Attempt[] {
  return readJson<Attempt[]>(ATTEMPTS, []);
}

export function saveAttempt(attempt: Attempt) {
  const all = loadAttempts();
  all.unshift(attempt);
  writeJson(ATTEMPTS, all.slice(0, 50));
}

export function loadDrillAttempts(): DrillAttempt[] {
  return readJson<DrillAttempt[]>(DRILLS, []);
}

export function saveDrillAttempt(attempt: DrillAttempt) {
  const all = loadDrillAttempts();
  all.unshift(attempt);
  writeJson(DRILLS, all.slice(0, 80));
}

export function emptyDrillStats(): DrillStats {
  const stats = {} as DrillStats;
  for (const s of ENGLISH_SKILLS) stats[s] = { correct: 0, total: 0 };
  return stats;
}

export function loadDrillStats(): DrillStats {
  const loaded = readJson<Partial<DrillStats>>(DRILL_STATS, {});
  const stats = emptyDrillStats();
  for (const s of ENGLISH_SKILLS) {
    if (loaded[s]) stats[s] = loaded[s]!;
  }
  return stats;
}

export function recordDrillAnswers(rows: Array<{ skill: EnglishSkill; correct: boolean }>) {
  const stats = loadDrillStats();
  for (const row of rows) {
    stats[row.skill].total += 1;
    if (row.correct) stats[row.skill].correct += 1;
  }
  writeJson(DRILL_STATS, stats);
  return stats;
}

export function loadSession(): SavedSession | null {
  return readJson<SavedSession | null>(SESSION, null);
}

export function saveSession(session: SavedSession | null) {
  if (!session) {
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION);
    return;
  }
  writeJson(SESSION, session);
}

export function resetAllProgress() {
  if (typeof window === "undefined") return;
  for (const key of [USED, ATTEMPTS, DRILLS, DRILL_STATS, SESSION]) {
    window.localStorage.removeItem(key);
  }
}

export function unseenCount(bankSize: number) {
  const used = loadUsedIds().size;
  return Math.max(0, bankSize - used);
}
