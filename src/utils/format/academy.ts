import { ACADEMY_COPY } from '@/declarations/academy/copy'
import type { SessionSummary } from '@/types/academy'

/**
 * Name of a session
 * @param {SessionSummary} session - Session row
 * @return {string} - Mod. Discord #8
 */

export const sessionTitle = (session: Pick<SessionSummary, 'function' | 'number'>): string =>
  ACADEMY_COPY.sessionTitle
    .replace('{function}', session.function.name)
    .replace('{number}', String(session.number))
