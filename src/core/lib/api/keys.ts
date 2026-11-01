/**
 * Single source of every cache key
 * @type {Record<string, (...parts: string[]) => readonly unknown[]>}
 */

export const QUERY_KEYS = {
  search: (term: string) => ['search', term] as const,
  assistant: (term: string, pathname: string) => ['assistant', term, pathname] as const,
  mentionable: (term: string) => ['mentionable', term] as const,
  notifications: (size: number) => ['notifications', size] as const,
  calendar: (from: string, to: string, sessionId?: string) =>
    ['calendar', from, to, sessionId ?? null] as const,
  access: (youtuberId: string | null) => ['access', youtuberId] as const,
  accessSimulation: (query: string) => ['access', 'simulation', query] as const,
  sanctions: (youtuberId: string, levelId: string | null) =>
    ['sanctions', youtuberId, levelId] as const,
  sanctionOffense: (id: string) => ['sanctions', 'offense', id] as const,
  reviewDesk: (juniorId: string) => ['academy', 'review-desk', juniorId] as const,
  blockQuiz: (blockId: string) => ['academy', 'quiz', blockId] as const,
  liveRoster: (liveId: string) => ['lives', 'roster', liveId] as const,
  liveEmotes: (liveId: string) => ['lives', 'emotes', liveId] as const,
  liveInspect: (liveId: string, accountId: string) =>
    ['lives', 'inspect', liveId, accountId] as const,
  exerciseLinks: (candidateId: string) => ['recruitment', 'exercises', candidateId] as const,
  recruitmentHistory: (search: string, bannedOnly: boolean) =>
    ['recruitment', 'history', search, bannedOnly] as const,
  workComments: (kind: string, id: string) => ['work', 'comments', kind, id] as const,
  playProfile: ['play', 'profile'] as const,
  liveBan: (liveId: string, viewerId: string) => ['lives', 'ban', liveId, viewerId] as const,
  liveViewer: (liveId: string, viewerId: string) => ['lives', 'viewer', liveId, viewerId] as const,
  liveViewerComments: (liveId: string, viewerId: string) =>
    ['lives', 'viewer-comments', liveId, viewerId] as const,
  liveFocus: (liveId: string) => ['lives', 'focus', liveId] as const,
  livePanel: (youtuberId: string, panel: string, levelId: string | null) =>
    ['lives', 'panel', youtuberId, panel, levelId] as const,
  pages: ['pages'] as const,
  page: (id: string) => ['pages', 'detail', id] as const,
  pageSharing: (id: string) => ['pages', 'sharing', id] as const,
  pageComments: (id: string) => ['pages', 'comments', id] as const,
  pageSearch: (term: string) => ['pages', 'search', term] as const,
  pageTrash: ['pages', 'trash'] as const,
} as const
