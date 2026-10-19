import type { ChatTier, Chatter, MemoraRank } from '@/types/modview'

/**
 * Who a chatter is to the team
 * @param {Chatter} chatter - Chatter
 * @param {Record<string, MemoraRank>} [roster] - Ranks by user
 * @return {ChatTier} - Tier
 */

export const tierOf = (chatter: Chatter, roster?: Record<string, MemoraRank>): ChatTier => {
  if (chatter.badges.includes('broadcaster')) return 'creator'

  // Memora rank first, then the platform badge
  return roster?.[chatter.id] ?? (chatter.badges.includes('moderator') ? 'moderator' : 'viewer')
}
