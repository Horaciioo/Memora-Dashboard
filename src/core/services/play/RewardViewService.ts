import 'server-only'

import { levelOf } from '@/core/lib/play'
import type { LoadedSession } from '@/core/lib/play/session'
import { readPlayProfile } from '@/core/services/play/ProfileService'
import { PLAY_XP_TIMING } from '@/declarations/play/xp'
import type { PlayRewardLadder, PlayRewardView, PlayXpPart } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Standing before and after a gain
 * @param {number} after - XP now
 * @param {number} gained - XP just earned
 * @return {PlayRewardLadder} - Ladder
 */

const ladderOf = (after: number, gained: number): PlayRewardLadder => ({
  before: levelOf(Math.max(0, after - gained)),
  after: levelOf(after),
})

/**
 * XP screen of a game just finished, for a player who earned some
 * @param {LoadedSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<PlayRewardView | null>} - Screen, null when nothing to show
 */

export const readReward = async (
  session: LoadedSession,
  viewerId: string
): Promise<PlayRewardView | null> => {
  const seat = session.seats.find((entry) => entry.accountId === viewerId)
  const isRecent =
    session.finishedAt !== null &&
    Date.now() - session.finishedAt.getTime() < PLAY_XP_TIMING.windowMs
  if (session.status !== PlayStatuses.Finished || !seat || !seat.xp || !isRecent) return null

  const profile = await readPlayProfile(viewerId)
  const gameXp = profile.games.find((entry) => entry.game === session.game)?.xp ?? 0

  return {
    gained: seat.xp,
    parts: (seat.xpParts ?? []) as unknown as PlayXpPart[],
    game: ladderOf(gameXp, seat.xp),
    global: ladderOf(profile.global.xp, seat.xp),
  }
}
