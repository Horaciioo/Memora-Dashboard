import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { redactRecord } from '@/core/lib/nexus/redact'
import { takeOf } from '@/core/services/nexus/bounds'
import { adapterOf, gameOf } from '@/core/services/nexus/handlers/game/shared'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { GAME_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_GAME } from '@/declarations/nexus/modulesSettings'
import type { Prisma } from '@prisma/client'

// Join codes never leave the server
const LIST_SELECT = {
  id: true,
  game: true,
  status: true,
  visibility: true,
  hostId: true,
  tournamentId: true,
  createdAt: true,
  startedAt: true,
  finishedAt: true,
  pausedAt: true,
} as const

const list: NexusHandler = async (context) => {
  const where: Prisma.PlaySessionWhereInput = {
    ...(context.args.type && { game: String(context.args.type).toUpperCase() as never }),
    ...(context.args.status && { status: String(context.args.status).toUpperCase() as never }),
    ...(context.args.player && { seats: { some: { accountId: String(context.args.player) } } }),
  }
  const take = takeOf(context.args.take)
  const page = Number(context.args.page ?? 1)
  const rows = await prisma.playSession.findMany({
    where,
    select: LIST_SELECT,
    orderBy: { createdAt: 'desc' },
    take,
    skip: (page - 1) * take,
  })

  return { output: rows, pagination: { page, total: await prisma.playSession.count({ where }) } }
}

const get: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const row = await prisma.playSession.findUnique({
    where: { id: game.id },
    select: {
      ...LIST_SELECT,
      settings: true,
      pauseReason: true,
      pausedById: true,
      rematchOfId: true,
    },
  })

  return { output: redactRecord({ ...row }), target: `playSession:${game.id}` }
}

const players: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const seats = await prisma.playSeat.findMany({
    where: { sessionId: game.id },
    include: { account: { select: { displayName: true } } },
    orderBy: { joinedAt: 'asc' },
  })
  const bans = await prisma.playProfile.findMany({
    where: { accountId: { in: seats.map((seat) => seat.accountId) }, bannedAt: { not: null } },
    select: { accountId: true },
  })

  return {
    output: seats.map((seat) => ({
      seat: seat.id,
      player: seat.accountId,
      name: seat.account.displayName,
      color: seat.color,
      score: seat.score,
      rank: seat.rank,
      ready: seat.readyAt,
      left: seat.leftAt,
      kicked: seat.kickedAt,
      host: seat.accountId === game.hostId,
      banned: bans.some((ban) => ban.accountId === seat.accountId),
    })),
  }
}

const state: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const reveal = context.args.reveal === true
  const body = await adapterOf(game).state(game.id, reveal)

  return {
    output: redactRecord(JSON.parse(JSON.stringify(body))),
    target: `playSession:${game.id}`,
    level: reveal ? 'warning' : 'info',
  }
}

const events: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const take = NEXUS_GAME.eventRows
  const [messages, invites, errors, overrides] = await Promise.all([
    prisma.playMessage.findMany({
      where: { sessionId: game.id },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, kind: true, accountId: true },
    }),
    prisma.playInvite.findMany({
      where: { sessionId: game.id },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, role: true, inviterId: true, inviteeId: true },
    }),
    prisma.errorEvent.findMany({
      where: { context: { path: ['sessionId'], equals: game.id } },
      orderBy: { lastAt: 'desc' },
      take,
      select: { lastAt: true, message: true, occurrences: true },
    }),
    prisma.nexusAudit.findMany({
      where: { status: 'OK', commandId: { startsWith: 'game.' }, input: { contains: game.id } },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, commandId: true },
    }),
  ])

  // Chat bodies stay out, only the shape of the exchange
  const rows = [
    ...messages.map((row) => ({
      at: row.createdAt,
      label: `Message ${row.kind} de ${row.accountId}`,
    })),
    ...invites.map((row) => ({
      at: row.createdAt,
      label: `Invitation ${row.role} de ${row.inviterId}`,
    })),
    ...errors.map((row) => ({
      at: row.lastAt,
      label: `Erreur x${row.occurrences} : ${row.message}`,
    })),
    ...overrides.map((row) => ({ at: row.createdAt, label: `Nexus ${row.commandId}` })),
  ]

  return { output: rows.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take) }
}

const history: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const page = Number(context.args.page ?? 1)
  const take = NEXUS_GAME.turnRows
  const turns = await adapterOf(game).turns(game.id, (page - 1) * take, take)
  if (page > 1 && turns.length === 0) throw notFound(GAME_COPY.missing)

  return { output: turns, pagination: { page, total: turns.length } }
}

/**
 * Game reads
 * @type {Record<string, NexusHandler>}
 */

export const GAME_READ_HANDLERS: Record<string, NexusHandler> = {
  'game.list': list,
  'game.get': get,
  'game.players': players,
  'game.state': state,
  'game.events': events,
  'game.history': history,
}
