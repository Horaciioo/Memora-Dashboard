import { Permissions } from '@/utils/constants/permissions'
import { UnbanStatuses } from '@/utils/constants/unban'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'
import type { UnbanVoteSummary } from '@/types/unban'
import type { UnbanStatusName } from '@/utils/constants/unban'

// Sides a moderator can take
export const UNBAN_VOTE_CHOICES = ['FOR', 'AGAINST'] as const

export type UnbanVoteChoiceName = (typeof UNBAN_VOTE_CHOICES)[number]

/**
 * Whether the caller may give an opinion, whoever decides stays out of the vote
 * @param {UnbanStatusName} status - Status of the request
 * @param {UnbanCaller['access']} access - Rights of the caller
 * @return {boolean} - May vote
 */

export const canVoteOn = (status: UnbanStatusName, access: UnbanCaller['access']): boolean =>
  (status === UnbanStatuses.Pending || status === UnbanStatuses.InReview) &&
  access.can(Permissions.UnbanHandle) &&
  !access.can(Permissions.UnbanManage)

/**
 * Votes as the caller may read them, whoever decides only sees how many voted
 * @param {{ voterId: string, choice: UnbanVoteChoiceName }[]} votes - Stored votes
 * @param {UnbanStatusName} status - Status of the request
 * @param {UnbanCaller} caller - Who reads
 * @return {UnbanVoteSummary} - Summary
 */

export const summarizeVotes = (
  votes: { voterId: string; choice: UnbanVoteChoiceName }[],
  status: UnbanStatusName,
  caller: UnbanCaller
): UnbanVoteSummary => {
  const decides = caller.access.can(Permissions.UnbanManage)
  const count = (side: UnbanVoteChoiceName) => votes.filter(({ choice }) => choice === side).length

  return {
    voters: votes.length,
    canVote: canVoteOn(status, caller.access),
    mine: votes.find(({ voterId }) => voterId === caller.actorId)?.choice ?? null,
    forCount: decides ? null : count('FOR'),
    againstCount: decides ? null : count('AGAINST'),
  }
}
