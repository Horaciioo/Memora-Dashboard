import 'server-only'

import { PlayNoticeKind } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { mayEnter } from '@/core/lib/play/access'
import { isPresent } from '@/core/lib/play/session'
import { signalNotices } from '@/core/lib/play/signal'
import { notify } from '@/core/services/system/NotificationService'
import { loadSession } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { PLAY_OPEN_STATUSES, PlayNoticeKinds, PlayStatuses } from '@/utils/constants/play'
import type { PlayNoticeView } from '@/types/play'

/**
 * Follow a game or let it go
 * @param {string} sessionId - Game
 * @param {string} accountId - Member
 * @param {boolean} isFollowing - Follow or not
 * @return {Promise<void>} - Saved
 */

export const setFollow = async (
  sessionId: string,
  accountId: string,
  isFollowing: boolean
): Promise<void> => {
  const where = { accountId_sessionId: { accountId, sessionId } }
  if (!isFollowing) {
    await prisma.playFollow.deleteMany({ where: { accountId, sessionId } })

    return
  }

  // Open and visible games only
  const session = await loadSession(sessionId)
  if (!PLAY_OPEN_STATUSES.includes(session.status)) throw conflict(PLAY_ERRORS.sessionClosed)
  if (!(await mayEnter(prisma, session, accountId))) throw notFound(PLAY_ERRORS.privateGame)

  // Seated players already know
  if (session.seats.some((seat) => seat.accountId === accountId && isPresent(seat))) return
  await prisma.playFollow.upsert({ where, create: { accountId, sessionId }, update: {} })
}

/**
 * Games a member follows among some
 * @param {string} accountId - Member
 * @param {string[]} sessionIds - Games looked at
 * @return {Promise<Set<string>>} - Followed games
 */

export const followedAmong = async (
  accountId: string,
  sessionIds: string[]
): Promise<Set<string>> => {
  const rows = await prisma.playFollow.findMany({
    where: { accountId, sessionId: { in: sessionIds } },
    select: { sessionId: true },
  })

  return new Set(rows.map((row) => row.sessionId))
}

/**
 * Write the news for every follower
 * @param {string} sessionId - Game
 * @param {PlayNoticeKind} kind - News
 * @return {Promise<void>} - Written
 */

const notifyFollowers = async (sessionId: string, kind: PlayNoticeKind): Promise<void> => {
  const session = await loadSession(sessionId)
  const seated = session.seats.filter(isPresent).map((seat) => seat.accountId)
  const followers = await prisma.playFollow.findMany({
    where: { sessionId, accountId: { notIn: seated } },
    select: { accountId: true },
  })
  if (followers.length === 0) return

  // The end replaces the start
  if (kind === PlayNoticeKind.FINISHED) {
    await prisma.playNotice.deleteMany({ where: { sessionId, kind: PlayNoticeKind.STARTED } })
  }
  await prisma.playNotice.createMany({
    data: followers.map(({ accountId }) => ({ accountId, sessionId, kind })),
    skipDuplicates: true,
  })
  await signalNotices(followers.map(({ accountId }) => accountId))

  // The start reaches phones
  if (kind !== PlayNoticeKind.STARTED) return
  await notify({
    kind: 'PlayFollowedStarted',
    recipients: followers.map(({ accountId }) => accountId),
    target: 'playGame',
    targetId: sessionId,
    subject: PLAY_GAMES.label(session.game),
    once: true,
  })
}

/**
 * Tell the followers a game started or ended, never breaking the game
 * @param {string} sessionId - Game
 * @param {PlayNoticeKind} kind - News
 * @return {Promise<void>} - Told
 */

export const tellFollowers = (sessionId: string, kind: PlayNoticeKind): Promise<void> =>
  notifyFollowers(sessionId, kind).catch((error: unknown) =>
    logger.warn('[play] followers not told', error)
  )

/**
 * Followed game news still worth acting on
 * @param {string} accountId - Member
 * @return {Promise<PlayNoticeView[]>} - News, newest first
 */

export const listFollowNotices = async (accountId: string): Promise<PlayNoticeView[]> => {
  const rows = await prisma.playNotice.findMany({
    where: {
      accountId,
      session: { seats: { none: { accountId, leftAt: null, kickedAt: null } } },
      OR: [
        { kind: PlayNoticeKind.STARTED, session: { status: PlayStatuses.Running } },
        { kind: PlayNoticeKind.FINISHED, session: { status: PlayStatuses.Finished } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      session: {
        select: { id: true, game: true, host: { select: { displayName: true, avatarUrl: true } } },
      },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind === PlayNoticeKind.STARTED ? PlayNoticeKinds.Started : PlayNoticeKinds.Finished,
    sessionId: row.session.id,
    game: row.session.game,
    isEveryone: false,
    actor: { name: row.session.host.displayName, avatarUrl: row.session.host.avatarUrl },
    createdAt: row.createdAt.toISOString(),
  }))
}

/**
 * Close a followed game news
 * @param {string} noticeId - News
 * @param {string} accountId - Member
 * @return {Promise<void>} - Closed
 */

export const closeNotice = async (noticeId: string, accountId: string): Promise<void> => {
  await prisma.playNotice.deleteMany({ where: { id: noticeId, accountId } })
}
