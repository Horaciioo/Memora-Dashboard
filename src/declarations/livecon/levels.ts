import type { LiveconStateView } from '@/types/livecon'

/**
 * Read the level in force for one creator, the team-wide one standing in when it has none
 * @param {LiveconStateView[]} state - Open entries
 * @param {string} youtuberId - Creator
 * @return {LiveconStateView | null} - Entry in force
 */

export const levelOfCreator = (
  state: LiveconStateView[],
  youtuberId: string
): LiveconStateView | null =>
  state.find((entry) => entry.youtuber?.id === youtuberId) ??
  state.find((entry) => entry.youtuber === null) ??
  null
