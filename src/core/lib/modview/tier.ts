import type { ChatTier, Chatter, MemoraRank } from '@/types/modview'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

// Memora rank by hierarchy level
const RANK_OF_ROLE: Partial<Record<MemberRoleName, MemoraRank>> = {
  [MemberRoles.Admin]: 'admin',
  [MemberRoles.Employe]: 'responsable',
  [MemberRoles.Responsable]: 'responsable',
  [MemberRoles.Moderateur]: 'moderator',
}

/**
 * Memora rank of a hierarchy level
 * @param {string} role - Member role
 * @return {MemoraRank | undefined} - Rank, none for a Junior
 */

export const rankOfRole = (role: string): MemoraRank | undefined =>
  RANK_OF_ROLE[role as MemberRoleName]

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
