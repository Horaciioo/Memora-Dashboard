import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readBodyList } from '@/core/lib/play'
import { isPresent } from '@/core/lib/play/session'
import { signalInvites, signalPlay } from '@/core/lib/play/signal'
import { joinSession } from '@/core/services/play/LobbyService'
import { loadSession, requireSeat } from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS } from '@/declarations/play'
import { PLAY_OPEN_STATUSES, PlayInviteRoles, PlayStatuses } from '@/utils/constants/play'
import type { PlayInviteRoleName } from '@/utils/constants/play'

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
  await signalInvites(ids)
}

/**
 * Members who can still be called to a game
 * @param {string} sessionId - Game
 * @return {Promise<object[]>} - Candidates
 */

export const inviteCandidates = async (sessionId: string) => {
  const session = await loadSession(sessionId)
  const seated = session.seats.filter(isPresent).map((seat) => seat.accountId)

  return prisma.account.findMany({
    where: { id: { notIn: seated }, leftAt: null, anonymisedAt: null, frozenAt: null },
    select: { id: true, displayName: true, avatarUrl: true },
    orderBy: { displayName: 'asc' },
  })
}

/**
 * Invitations waiting for a member, open games only
 * @param {string} accountId - Member
 * @return {Promise<object[]>} - Invitations, newest first
 */

export const listInvites = async (accountId: string) => {
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
      session: { select: { id: true, game: true, status: true } },
      inviter: { select: { displayName: true, avatarUrl: true } },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    sessionId: row.session.id,
    game: row.session.game,
    role: row.role,
    isEveryone: row.inviteeId === null,
    inviter: { name: row.inviter.displayName, avatarUrl: row.inviter.avatarUrl },
    createdAt: row.createdAt.toISOString(),
  }))
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
  await signalInvites([accountId])

  return { sessionId: invite.sessionId }
}
