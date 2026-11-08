import 'server-only'
import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { createSession } from '@/core/services/play/LobbyService'
import { inviteToSession } from '@/core/services/play/PlayInviteService'
import { PLAY_GAMES, PLAY_GROUP_COPY, PLAY_GROUP_ERRORS } from '@/declarations/play'
import { PlayInviteRoles, PlayVisibilities } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { requireGroup, tellGroup } from '@/core/services/play/GroupService/shared'

/**
 * Propose a game to the group, or take the proposal back
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the game
 * @return {Promise<void>} - Toggled
 */

export const proposeGroupGame = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireGroup(accountId, groupId)
  const game = gameOf(raw)
  const where = { groupId_accountId_game: { groupId: group.id, accountId, game } }
  if (await prisma.playGroupProposal.findUnique({ where })) {
    await prisma.playGroupProposal.delete({ where })
  } else {
    await prisma.playGroupProposal.create({ data: { groupId: group.id, accountId, game } })
  }
  await tellGroup(group)
}

/**
 * Game named in a body, playable only
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayGameName} - Game
 */

const gameOf = (raw: Record<string, unknown>): PlayGameName => {
  const name = readBodyText(raw, 'game', PLAY_GROUP_ERRORS.notProposed)
  const game = PLAY_GAMES.keys.find((key) => key === name)
  if (!game || !PLAY_GAMES.get(game).playable) throw notFound(PLAY_GROUP_ERRORS.notProposed)

  return game
}

/**
 * Drop a proposal, by its author or the host
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {string} proposalId - Proposal
 * @return {Promise<void>} - Dropped
 */

export const dropGroupProposal = async (
  accountId: string,
  groupId: string,
  proposalId: string
): Promise<void> => {
  const group = await requireGroup(accountId, groupId)
  const proposal = group.proposals.find((entry) => entry.id === proposalId)
  if (!proposal) throw notFound(PLAY_GROUP_ERRORS.notProposed)
  if (proposal.accountId !== accountId && group.hostId !== accountId) {
    throw forbidden(PLAY_GROUP_ERRORS.hostOnly)
  }
  await prisma.playGroupProposal.delete({ where: { id: proposalId } })
  await tellGroup(group)
}

/**
 * Open a private table for the group, call everyone in and post it in the chat
 * @param {string} accountId - Member
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the game
 * @return {Promise<{ id: string }>} - Table
 */

export const launchGroupGame = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<{ id: string }> => {
  const group = await requireGroup(accountId, groupId)
  const game = gameOf(raw)
  const session = await createSession(accountId, { game, visibility: PlayVisibilities.Private })
  const others = group.members.map((member) => member.accountId).filter((id) => id !== accountId)
  if (others.length > 0) {
    await inviteToSession(session.id, accountId, {
      role: PlayInviteRoles.Player,
      accountIds: others,
    })
  }
  await prisma.playGroupProposal.deleteMany({ where: { groupId: group.id, game } })
  await prisma.playGroupMessage.create({
    data: {
      groupId: group.id,
      accountId,
      body: PLAY_GROUP_COPY.invitedToPlay,
      game,
      sessionId: session.id,
    },
  })
  await tellGroup(group)

  return session
}
