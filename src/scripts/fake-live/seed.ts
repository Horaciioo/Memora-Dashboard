import { prisma } from '@/fixtures/lib/client'
import { TWITCH_SCOPES } from '@/declarations/platforms/twitch'

import { FAKE_PREFIXES, OPERATOR_IDENTITIES, fakeId, fakeUser } from './identities.ts'
import type { FakeUser } from './identities.ts'

// Event template of a live
const LIVE_EVENT_TEMPLATE = 'Live'

// Every row this script writes starts here
const FAKE_LIVE_PREFIX = 'fx-fakelive-'
const CHANNEL_ROW_ID = `${FAKE_LIVE_PREFIX}channel`

// Plain marker the app reads in every environment
const PLAIN_PREFIX = 'plain:'

// Login from a display name
const loginOf = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\W+/g, '_')

// Moderators given a fake Twitch account
const TEAM_SIZE = 4

/**
 * What the fake live runs on
 * @typedef {Object} FakeLiveSetup
 */

export interface FakeLiveSetup {
  liveId: string
  youtuberName: string
  broadcasterId: string
  channelLogin: string
  operatorName: string
  team: { accountId: string; user: FakeUser }[]
}

/**
 * Member who drives the test
 * @param {string | null} discordId - Asked identifier
 * @return {Promise<{ id: string, displayName: string }>} - Account
 */

const findOperator = async (discordId: string | null) => {
  const wanted = discordId ?? process.env.ADMIN_DISCORD_ID ?? null
  const operator = wanted
    ? await prisma.account.findUnique({
        where: { discordId: wanted },
        select: { id: true, displayName: true },
      })
    : await prisma.account.findFirst({
        where: { role: 'ADMIN', NOT: { id: { startsWith: 'fx-' } } },
        orderBy: { createdAt: 'asc' },
        select: { id: true, displayName: true },
      })
  if (!operator) throw new Error('Compte introuvable : passe --compte <identifiant Discord>.')

  return operator
}

/**
 * Twitch channel of the creator
 * @param {string} youtuberId - Creator
 * @param {string} youtuberName - Creator name
 * @return {Promise<{ externalId: string, login: string }>} - Channel
 */

const ensureChannel = async (youtuberId: string, youtuberName: string) => {
  const existing = await prisma.youtuberChannel.findFirst({
    where: { youtuberId, platform: 'TWITCH' },
    select: { externalId: true, login: true },
  })
  if (existing)
    return { externalId: existing.externalId, login: existing.login ?? youtuberName.toLowerCase() }

  // A fake channel the clear removes
  const login = `${youtuberName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_faux`
  const externalId = fakeId(FAKE_PREFIXES.broadcaster, 1)
  await prisma.youtuberChannel.create({
    data: {
      id: CHANNEL_ROW_ID,
      youtuberId,
      platform: 'TWITCH',
      externalId,
      login,
      displayName: login,
    },
  })

  return { externalId, login }
}

/**
 * Link a few moderators to fake Twitch accounts
 * @param {string} youtuberId - Creator
 * @param {string} operatorId - Operator, left out
 * @return {Promise<FakeLiveSetup['team']>} - Team
 */

const linkTeam = async (youtuberId: string, operatorId: string): Promise<FakeLiveSetup['team']> => {
  const members = await prisma.account.findMany({
    where: {
      youtubers: { some: { id: youtuberId } },
      role: 'MODERATEUR',
      status: 'ACTIVE',
      NOT: { id: operatorId },
    },
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true },
    take: TEAM_SIZE,
  })

  return Promise.all(
    members.map(async (member, index) => {
      const user = fakeUser(
        fakeId(FAKE_PREFIXES.moderator, index + 1),
        loginOf(member.displayName),
        ['moderator']
      )
      const tokens = {
        accessToken: `${PLAIN_PREFIX}fake-access-${user.id}`,
        refreshToken: `${PLAIN_PREFIX}fake-refresh-${user.id}`,
        expiresAt: new Date(Date.now() + 365 * 86_400_000),
        revokedAt: null,
      }
      await prisma.platformAccount.upsert({
        where: { accountId_platform: { accountId: member.id, platform: 'TWITCH' } },
        update: { externalUserId: user.id, login: user.login, displayName: user.name, ...tokens },
        create: {
          accountId: member.id,
          platform: 'TWITCH',
          externalUserId: user.id,
          login: user.login,
          displayName: user.name,
          scopes: [...TWITCH_SCOPES],
          ...tokens,
        },
      })

      return { accountId: member.id, user }
    })
  )
}

/**
 * Link the operator to the fake moderator account, no consent page to click through
 * @param {string} operatorId - Operator
 * @return {Promise<void>} - Linked
 */

const linkOperator = async (operatorId: string): Promise<void> => {
  const user = OPERATOR_IDENTITIES.moderator
  const tokens = {
    accessToken: `${PLAIN_PREFIX}fake-access-${user.id}`,
    refreshToken: `${PLAIN_PREFIX}fake-refresh-${user.id}`,
    expiresAt: new Date(Date.now() + 365 * 86_400_000),
    revokedAt: null,
  }
  await prisma.platformAccount.upsert({
    where: { accountId_platform: { accountId: operatorId, platform: 'TWITCH' } },
    update: { externalUserId: user.id, login: user.login, displayName: user.name, ...tokens },
    create: {
      accountId: operatorId,
      platform: 'TWITCH',
      externalUserId: user.id,
      login: user.login,
      displayName: user.name,
      scopes: [...TWITCH_SCOPES],
      ...tokens,
    },
  })
}

/**
 * Calendar entry of the live, roll call open
 * @param {Object} input - Entry
 * @param {{ id: string, name: string }} input.youtuber - Creator
 * @param {string} input.ownerId - Operator
 * @param {string[]} input.memberIds - Convened team
 * @param {Date} input.start - Planned start
 * @return {Promise<{ id: string, title: string, endsAt: Date | null }>} - Entry
 */

const createLiveEvent = async (input: {
  youtuber: { id: string; name: string }
  ownerId: string
  memberIds: string[]
  start: Date
}) => {
  const template = await prisma.eventTemplate.findUnique({
    where: { name: LIVE_EVENT_TEMPLATE },
    select: { id: true },
  })

  return prisma.calendarEvent.create({
    data: {
      id: `${FAKE_LIVE_PREFIX}event-${Date.now()}`,
      title: `Faux live de ${input.youtuber.name}`,
      description: 'Live simulé par yarn live:fake.',
      templateId: template?.id ?? null,
      ownerId: input.ownerId,
      youtuberId: input.youtuber.id,
      startsAt: input.start,
      endsAt: new Date(input.start.getTime() + 3 * 3_600_000),
      visibility: 'EVERYONE',
      rollCall: true,
      // Everyone answered Present: Focus only follows who is present
      attendances: {
        create: input.memberIds.map((accountId) => ({
          accountId,
          status: 'PRESENT' as const,
          respondedAt: new Date(),
          availableFrom: input.start,
          availableTo: new Date(input.start.getTime() + 3 * 3_600_000),
        })),
      },
    },
    select: { id: true, title: true, endsAt: true },
  })
}

/**
 * Prepare a fake live in the dev database
 * @param {Object} input - Options
 * @param {string} input.creator - Creator name
 * @param {string | null} input.discordId - Operator
 * @param {number} input.startInMinutes - Planned start
 * @return {Promise<FakeLiveSetup>} - Setup
 */

export const prepareFakeLive = async (input: {
  creator: string
  discordId: string | null
  startInMinutes: number
}): Promise<FakeLiveSetup> => {
  const youtuber = await prisma.youtuber.findFirst({
    where: { name: { equals: input.creator, mode: 'insensitive' }, archived: false },
    select: { id: true, name: true },
  })
  if (!youtuber)
    throw new Error(
      `Créateur introuvable : ${input.creator}. Lance yarn fixtures:seed ou passe --createur.`
    )

  const operator = await findOperator(input.discordId)
  const channel = await ensureChannel(youtuber.id, youtuber.name)
  const team = await linkTeam(youtuber.id, operator.id)
  await linkOperator(operator.id)

  // Announced like the Calendar does
  const memberIds = [operator.id, ...team.map((seat) => seat.accountId)]
  const start = new Date(Date.now() + input.startInMinutes * 60_000)
  const event = await createLiveEvent({ youtuber, ownerId: operator.id, memberIds, start })
  const live = await prisma.live.create({
    data: {
      id: `${FAKE_LIVE_PREFIX}${Date.now()}`,
      youtuberId: youtuber.id,
      platform: 'TWITCH',
      title: event.title,
      plannedStartAt: start,
      plannedEndAt: event.endsAt,
      announcedById: operator.id,
      calendarEventId: event.id,
      instructions: 'Live entièrement simulé : rien ne part chez Twitch.',
      members: { create: memberIds.map((accountId) => ({ accountId })) },
      coordinations: {
        create: {
          accountId: operator.id,
          status: 'ACCEPTED',
          startsAt: start,
          // Window kept open so the coordinator reads as such all along
          endsAt: event.endsAt,
          respondedAt: new Date(),
        },
      },
    },
    select: { id: true },
  })

  return {
    liveId: live.id,
    youtuberName: youtuber.name,
    broadcasterId: channel.externalId,
    channelLogin: channel.login,
    operatorName: operator.displayName,
    team,
  }
}

/**
 * Keep the fake team present in the Mod View
 * @param {string} liveId - Live
 * @param {string[]} accountIds - Team
 * @return {Promise<void>} - Beaten
 */

export const beatTeamPresence = async (liveId: string, accountIds: string[]): Promise<void> => {
  const now = new Date()
  for (const accountId of accountIds) {
    const open = await prisma.modViewPresence.findFirst({
      where: { liveId, accountId, closedAt: null },
    })
    if (!open) {
      await prisma.modViewPresence.create({
        data: { liveId, accountId, openedAt: now, lastBeatAt: now },
      })
      continue
    }

    // Seconds since the last beat
    const elapsed = Math.round((now.getTime() - open.lastBeatAt.getTime()) / 1000)
    await prisma.modViewPresence.update({
      where: { id: open.id },
      data: {
        lastBeatAt: now,
        visibleSeconds: { increment: elapsed },
        activeSeconds: { increment: Math.round(elapsed * 0.8) },
      },
    })
  }
}

/**
 * Remove everything a fake live wrote
 * @return {Promise<{ lives: number, links: number }>} - Rows removed
 */

export const clearFakeLives = async (): Promise<{ lives: number; links: number }> => {
  const lives = await prisma.live.deleteMany({ where: { id: { startsWith: FAKE_LIVE_PREFIX } } })
  await prisma.calendarEvent.deleteMany({ where: { id: { startsWith: FAKE_LIVE_PREFIX } } })
  // Report alerts pointing at those lives
  await prisma.notification.deleteMany({
    where: { targetType: 'liveReport', targetId: { startsWith: FAKE_LIVE_PREFIX } },
  })
  const links = await prisma.platformAccount.deleteMany({
    where: { platform: 'TWITCH', externalUserId: { startsWith: FAKE_PREFIXES.moderator } },
  })
  await prisma.platformAccount.deleteMany({
    where: { platform: 'TWITCH', externalUserId: { startsWith: FAKE_PREFIXES.viewer } },
  })
  await prisma.youtuberChannel.deleteMany({ where: { id: CHANNEL_ROW_ID } })

  return { lives: lives.count, links: links.count }
}

/**
 * Twitch channels declared in Memora
 * @return {Promise<{ externalId: string, login: string }[]>} - Channels
 */

export const readTwitchChannels = async (): Promise<{ externalId: string; login: string }[]> => {
  const rows = await prisma.youtuberChannel.findMany({
    where: { platform: 'TWITCH' },
    select: { externalId: true, login: true },
  })

  return rows.map((row) => ({
    externalId: row.externalId,
    login: row.login ?? `chaine_${row.externalId}`,
  }))
}

/**
 * Close the database
 * @return {Promise<void>} - Closed
 */

export const closeDatabase = (): Promise<void> => prisma.$disconnect()
