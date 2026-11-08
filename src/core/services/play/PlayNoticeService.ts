import 'server-only'

import { listFollowNotices } from '@/core/services/play/PlayFollowService'
import { listInvites } from '@/core/services/play/PlayInviteService'
import type { PlayNoticeView } from '@/types/play'

/**
 * Everything waiting for a member in Play
 * @param {string} accountId - Member
 * @return {Promise<PlayNoticeView[]>} - News, newest first
 */

export const listNotices = async (accountId: string): Promise<PlayNoticeView[]> => {
  const [invites, followed] = await Promise.all([
    listInvites(accountId),
    listFollowNotices(accountId),
  ])

  return [...invites, ...followed].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
