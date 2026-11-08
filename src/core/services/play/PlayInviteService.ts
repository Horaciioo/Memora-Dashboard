import 'server-only'

import { prisma } from '@/core/lib/db'
import { seatBoundsOf } from '@/core/lib/play/seats'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readBodyList } from '@/core/lib/play'
import { isPresent } from '@/core/lib/play/session'
import { signalNotices, signalPlay } from '@/core/lib/play/signal'
import { startSession } from '@/core/services/play/GameService'
import { joinSession } from '@/core/services/play/LobbyService'
import { loadSession, requireSeat } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS, PLAY_SETTINGS } from '@/declarations/play'
import type { PlayNoticeView } from '@/types/play'
import {
  PLAY_OPEN_STATUSES,
  PlayInviteRoles,
  PlayNoticeKinds,
  PlayStatuses,
} from '@/utils/constants/play'
import type { PlayInviteRoleName, PlayNoticeKindName } from '@/utils/constants/play'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Seat offered by a body
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayInviteRoleName} - Role
 */

const roleOf = (raw: Record<string, unknown>): PlayInviteRoleName => {
  const role = Object.values(PlayInviteRoles).find((entry) => entry === raw.role)
  if (!role) throw invalidInput([{ field: 'role', message: PLAY_ERRORS.inviteRole }])

  return role
}

/**
 * Call people, or all of Memora, to a game
 * @param {string} sessionId - Game
 * @param {string} inviterId - Seated player
 * @param {Record<string, unknown>} raw - Role, accountIds or everyone
 * @return {Promise<void>} - Sent
 */

export const inviteToSession = async (
  sessionId: string,
  inviterId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const role = roleOf(raw)
  const session = await loadSession(sessionId)
  requireSeat(session, inviterId)
  if (!PLAY_OPEN_STATUSES.includes(session.status)) throw conflict(PLAY_ERRORS.sessionClosed)
  if (role === PlayInviteRoles.Player && session.status !== PlayStatuses.Lobby) {
    throw conflict(PLAY_ERRORS.notInLobby)
  }

  const ids =
    raw.everyone === true
      ? null
      : (readBodyList(raw, 'accountIds') ?? []).filter((id) => id && id !== inviterId)
  if (!ids) {
    await prisma.playInvite.create({ data: { sessionId, inviterId, role } })
  } else {
    await prisma.$transaction(
      ids.map((inviteeId) =>
        prisma.playInvite.upsert({
          where: { sessionId_inviteeId: { sessionId, inviteeId } },
          create: { sessionId, inviterId, inviteeId, role },
          update: { inviterId, role, answeredAt: null, createdAt: new Date() },
        })
      )
    )
  }
  await signalPlay(sessionId, true)
  await signalNotices(ids)
}

/**
 * Members who shared a finished game with a player
 * @param {string} accountId - Player
 * @return {Promise<Set<string>>} - Former opponents
 */

const playedWith = async (accountId: string): Promise<Set<string>> => {
  const games = await prisma.playSeat.findMany({
    where: { accountId, session: { status: PlayStatuses.Finished } },
    orderBy: { joinedAt: 'desc' },
    take: PLAY_SETTINGS.historySize * 4,
    select: { sessionId: true },
  })
  const seats = await prisma.playSeat.findMany({
    where: { sessionId: { in: games.map((game) => game.sessionId) } },
    distinct: ['accountId'],
    select: { accountId: true },
  })

  return new Set(seats.map((seat) => seat.accountId))
}

/**
 * Members who sat at a table or were in Play lately
 * @return {Promise<Set<string>>} - Recent players
 */

const recentPlayers = async (): Promise<Set<string>> => {
  const since = new Date(Date.now() - PLAY_SETTINGS.privateGames.recentDays * DAY_MS)
  const [seats, seen] = await Promise.all([
    prisma.playSeat.findMany({
      where: { joinedAt: { gte: since } },
      distinct: ['accountId'],
      select: { accountId: true },
    }),
    prisma.playProfile.findMany({
      where: { lastSeenAt: { gte: since } },
      select: { accountId: true },
    }),
  ])

  return new Set([...seats, ...seen].map((entry) => entry.accountId))
}

/**
 * Members who can still be called to a game
 * @param {string[]} seated - Members already at the table
 * @param {string} viewerId - Player calling
 * @return {Promise<object[]>} - Candidates with their ties
 */

export const inviteCandidates = async (seated: string[], viewerId: string) => {
  const [members, former, recent] = await Promise.all([
    prisma.account.findMany({
      where: { id: { notIn: seated }, leftAt: null, anonymisedAt: null, frozenAt: null },
      select: { id: true, displayName: true, avatarUrl: true },
      orderBy: { displayName: 'asc' },
    }),
    playedWith(viewerId),
    recentPlayers(),
  ])

  return members.map((member) => ({
    ...member,
    hasPlayedWith: former.has(member.id),
    isRecent: recent.has(member.id),
  }))
}

/**
 * Kind of news an invitation is
 * @param {Object} row - Invitation
 * @param {PlayInviteRoleName} row.role - Seat offered
 * @param {{ rematchOfId: string | null }} row.session - Game invited to
 * @return {PlayNoticeKindName} - Kind
 */

const kindOf = (row: {
  role: PlayInviteRoleName
  session: { rematchOfId: string | null }
}): PlayNoticeKindName => {
  if (row.session.rematchOfId) return PlayNoticeKinds.Rematch

  return row.role === PlayInviteRoles.Player ? PlayNoticeKinds.Invite : PlayNoticeKinds.Spectate
}

/**
 * Invitations waiting for a member, open games only
 * @param {string} accountId - Member
 * @return {Promise<PlayNoticeView[]>} - Invitations, newest first
 */

export const listInvites = async (accountId: string): Promise<PlayNoticeView[]> => {
  const rows = await prisma.playInvite.findMany({
    where: {
      session: {
        status: { in: [...PLAY_OPEN_STATUSES] },
        seats: { none: { accountId, leftAt: null, kickedAt: null } },
      },
      OR: [
        { inviteeId: accountId, answeredAt: null },
        { inviteeId: null, inviterId: { not: accountId } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      session: { select: { id: true, game: true, status: true, rematchOfId: true } },
      inviter: { select: { displayName: true, avatarUrl: true } },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    kind: kindOf(row),
    sessionId: row.session.id,
    game: row.session.game,
    isEveryone: row.inviteeId === null,
    actor: { name: row.inviter.displayName, avatarUrl: row.inviter.avatarUrl },
    createdAt: row.createdAt.toISOString(),
  }))
}

/**
 * A replay table: the answerer is ready, the finished game is told, the table starts once all answered
 * @param {string} sessionId - Table invited to
 * @param {string} accountId - Member answering
 * @param {boolean} accept - Yes or no
 * @return {Promise<void>} - Settled
 */

const settleRematch = async (
  sessionId: string,
  accountId: string,
  accept: boolean
): Promise<void> => {
  const session = await loadSession(sessionId)
  if (!session.rematchOfId) return

  if (accept) {
    await prisma.playSeat.updateMany({
      where: { sessionId, accountId, leftAt: null },
      data: { readyAt: new Date() },
    })
  }
  await signalPlay(session.rematchOfId, true)

  // Everyone called has answered: the table goes
  const waiting = await prisma.playInvite.count({
    where: { sessionId, inviteeId: { not: null }, answeredAt: null },
  })
  const seated = session.seats.filter(isPresent).length
  if (waiting || session.status !== PlayStatuses.Lobby) return
  if (seated < seatBoundsOf(session.game, session.settings).min) return

  await startSession(sessionId, session.hostId).catch(() => undefined)
}

/**
 * Accept or decline an invitation
 * @param {string} inviteId - Invitation
 * @param {string} accountId - Member answering
 * @param {boolean} accept - Yes or no
 * @return {Promise<{ sessionId: string }>} - Game to open
 */

export const answerInvite = async (inviteId: string, accountId: string, accept: boolean) => {
  const invite = await prisma.playInvite.findUnique({ where: { id: inviteId } })
  if (!invite) throw notFound(PLAY_ERRORS.inviteMissing)
  if (invite.inviteeId && invite.inviteeId !== accountId) throw forbidden(PLAY_ERRORS.inviteMissing)

  if (invite.inviteeId) {
    await prisma.playInvite.update({ where: { id: inviteId }, data: { answeredAt: new Date() } })
  }
  if (accept && invite.role === PlayInviteRoles.Player) {
    await joinSession(invite.sessionId, accountId)
  }
  await settleRematch(invite.sessionId, accountId, accept)
  await signalNotices([accountId])

  return { sessionId: invite.sessionId }
}
