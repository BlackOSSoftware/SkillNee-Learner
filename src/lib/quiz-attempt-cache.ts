const PREFIX = 'skillbee:quiz-attempt:';

export function cacheQuizAttempt(attemptId: string, payload: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${attemptId}`, JSON.stringify(payload));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function readCachedQuizAttempt<T>(attemptId: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${attemptId}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearCachedQuizAttempt(attemptId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${PREFIX}${attemptId}`);
    window.sessionStorage.removeItem(`${PREFIX}${attemptId}:answers`);
    window.sessionStorage.removeItem(`${PREFIX}${attemptId}:marked`);
  } catch {
    /* ignore */
  }
}

export function cacheQuizAnswers(attemptId: string, answers: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${attemptId}:answers`, JSON.stringify(answers));
  } catch {
    /* ignore */
  }
}

export function readCachedQuizAnswers<T>(attemptId: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${attemptId}:answers`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function cacheQuizMarked(attemptId: string, marked: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${attemptId}:marked`, JSON.stringify(marked));
  } catch {
    /* ignore */
  }
}

export function readCachedQuizMarked(attemptId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${attemptId}:marked`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
