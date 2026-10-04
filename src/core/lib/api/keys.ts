/**
 * Single source of every cache key
 * @type {Record<string, (...parts: string[]) => readonly unknown[]>}
 */

export const QUERY_KEYS = {
  search: (term: string) => ['search', term] as const,
  notifications: (size: number) => ['notifications', size] as const,
  calendar: (from: string, to: string, sessionId?: string) =>
    ['calendar', from, to, sessionId ?? null] as const,
  access: (youtuberId: string | null) => ['access', youtuberId] as const,
  accessSimulation: (query: string) => ['access', 'simulation', query] as const,
  sanctions: (youtuberId: string, levelId: string | null) =>
    ['sanctions', youtuberId, levelId] as const,
  sanctionOffense: (id: string) => ['sanctions', 'offense', id] as const,
  blockQuiz: (blockId: string) => ['academy', 'quiz', blockId] as const,
  liveRoster: (liveId: string) => ['lives', 'roster', liveId] as const,
  liveInspect: (liveId: string, accountId: string) =>
    ['lives', 'inspect', liveId, accountId] as const,
  liveFocus: (liveId: string) => ['lives', 'focus', liveId] as const,
} as const
