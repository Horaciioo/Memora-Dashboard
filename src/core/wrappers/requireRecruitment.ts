import 'server-only'

import { forbidden } from 'next/navigation'

import { isObserver } from '@/core/services/recruitment/ObserverReader'
import { requireUser } from '@/core/wrappers/requireUser'
import type { GuardedSession } from '@/core/wrappers/requireUser'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { Permissions } from '@/utils/constants/permissions'

// Perimeter of an observer, the session id narrows it
const OBSERVER_SCOPE: AccessScope = { isGlobal: true, youtuberIds: [], activeYoutuberId: null }

/**
 * Guarded recruitment session
 * @typedef {Object} RecruitmentGuard
 * @property {AccessScope} perimeter - Creators reachable
 * @property {boolean} observing - Reads as an observer only
 */

export interface RecruitmentGuard extends GuardedSession {
  perimeter: AccessScope
  observing: boolean
}

/**
 * Open one recruitment session as a reader or as an observer
 * @param {string} sessionId - Session identifier
 * @return {Promise<RecruitmentGuard>} - Session, helpers and perimeter
 */

export const requireRecruitment = async (sessionId: string): Promise<RecruitmentGuard> => {
  const guarded = await requireUser()
  const canRead = guarded.access.can(Permissions.RecruitmentRead)
  const observing = !canRead && (await isObserver(sessionId, guarded.session.id))

  if (!canRead && !observing) forbidden()

  return { ...guarded, perimeter: observing ? OBSERVER_SCOPE : await guarded.scope(), observing }
}
