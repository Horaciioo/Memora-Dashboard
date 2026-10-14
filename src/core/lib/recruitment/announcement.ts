import { PLANNING_COPY, WAITING_ROLE_PLACEHOLDER } from '@/declarations/recruitment/copy'

/**
 * Generic announcement naming the stored waiting role
 * @param {string | null} waitingToken - Role token, null when unknown
 * @return {string} - Markdown with the role token
 */

export const genericAnnouncement = (waitingToken: string | null): string =>
  PLANNING_COPY.announcement.replace(
    WAITING_ROLE_PLACEHOLDER,
    waitingToken ?? PLANNING_COPY.waitingFallback
  )
