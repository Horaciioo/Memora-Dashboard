import type { PlayInviteCandidate } from '@/types/play'

export const PlayInviteGroups = {
  Online: 'online',
  Recent: 'recent',
  PlayedWith: 'playedWith',
} as const

export type PlayInviteGroupName = (typeof PlayInviteGroups)[keyof typeof PlayInviteGroups]

/**
 * Candidates sorted into the picker sections
 * @param {PlayInviteCandidate[]} candidates - Members to call
 * @param {Set<string>} onlineIds - Members in Play now
 * @return {Record<PlayInviteGroupName, PlayInviteCandidate[]>} - Sections, first match wins
 */

export const groupCandidates = (
  candidates: PlayInviteCandidate[],
  onlineIds: Set<string>
): Record<PlayInviteGroupName, PlayInviteCandidate[]> => {
  const groups: Record<PlayInviteGroupName, PlayInviteCandidate[]> = {
    [PlayInviteGroups.Online]: [],
    [PlayInviteGroups.Recent]: [],
    [PlayInviteGroups.PlayedWith]: [],
  }

  // Online, then lately seated, then former opponents
  for (const candidate of candidates) {
    if (onlineIds.has(candidate.id)) groups[PlayInviteGroups.Online].push(candidate)
    else if (candidate.isRecent) groups[PlayInviteGroups.Recent].push(candidate)
    else if (candidate.hasPlayedWith) groups[PlayInviteGroups.PlayedWith].push(candidate)
  }

  return groups
}
