import 'server-only'

import { deflateSync, inflateSync } from 'node:zlib'

import { prisma } from '@/core/lib/db'
import type { ConcordatSnapshot } from '@/core/lib/play/concordat'
import type { ConcordatEvent } from '@/types/concordat'
import { ConcordatBotLevels } from '@/utils/constants/concordat'
import type { ConcordatBotLevelName } from '@/utils/constants/concordat'
import { PlayBotKinds, PlayStatuses } from '@/utils/constants/play'
import type { PlayBotKindName } from '@/utils/constants/play'

// Sharpness of a bot by its account level
const LEVEL_OF_KIND: Record<PlayBotKindName, ConcordatBotLevelName> = {
  [PlayBotKinds.Easy]: ConcordatBotLevels.Recruit,
  [PlayBotKinds.Medium]: ConcordatBotLevels.Strategist,
  [PlayBotKinds.Hard]: ConcordatBotLevels.Raptor,
}

// Heartbeat older than this means the owner is gone
const OWNER_TIMEOUT_MS = 30_000

/**
 * Rows of a new game
 * @typedef {Object} ConcordatNewGame
 */

export interface ConcordatNewGame {
  sessionId: string
  seed: number
  size: string
  style: string
  speed: string
  durationMinutes: number
  map: Uint8Array
  snapshot: ConcordatSnapshot
  nations: { accountId: string; nation: number }[]
}

/**
 * Snapshot bytes, deflated JSON
 * @param {ConcordatSnapshot} snapshot - Snapshot
 * @return {Uint8Array} - Bytes
 */

export const packSnapshot = (snapshot: ConcordatSnapshot): Uint8Array<ArrayBuffer> =>
  new Uint8Array(deflateSync(Buffer.from(JSON.stringify(snapshot))))

/**
 * Snapshot from its bytes
 * @param {Uint8Array} bytes - Bytes
 * @return {ConcordatSnapshot} - Snapshot
 */

export const unpackSnapshot = (bytes: Uint8Array): ConcordatSnapshot =>
  JSON.parse(inflateSync(bytes).toString()) as ConcordatSnapshot

/**
 * Write the rows of a new game
 * @param {ConcordatNewGame} game - New game
 * @param {string} ownerId - Process that runs it
 * @return {Promise<void>} - Written
 */

export const createGameRows = async (game: ConcordatNewGame, ownerId: string): Promise<void> => {
  await prisma.$transaction([
    prisma.concordatGame.upsert({
      where: { sessionId: game.sessionId },
      create: {
        sessionId: game.sessionId,
        seed: game.seed,
        size: game.size,
        style: game.style,
        speed: game.speed,
        durationMinutes: game.durationMinutes,
        map: new Uint8Array(game.map),
        snapshot: packSnapshot(game.snapshot),
        snapshotTick: game.snapshot.tick,
        phase: game.snapshot.phase,
        ownerId,
        heartbeatAt: new Date(),
        startsAt: new Date(),
      },
      update: {},
    }),
    prisma.concordatPlayer.deleteMany({ where: { sessionId: game.sessionId } }),
    prisma.concordatPlayer.createMany({
      data: game.nations.map((entry) => ({ sessionId: game.sessionId, ...entry })),
    }),
  ])
}

/**
 * Stored game of a session
 * @param {string} sessionId - Game
 * @return {Promise<Awaited<ReturnType<typeof prisma.concordatGame.findUnique>>>} - Row
 */

export const loadGameRow = (sessionId: string) =>
  prisma.concordatGame.findUnique({ where: { sessionId } })

/**
 * Take or renew the game, refused while another process keeps it
 * @param {string} sessionId - Game
 * @param {string} ownerId - Process
 * @return {Promise<boolean>} - Owned
 */

export const claimGame = async (sessionId: string, ownerId: string): Promise<boolean> => {
  const now = new Date()
  const { count } = await prisma.concordatGame.updateMany({
    where: {
      sessionId,
      OR: [
        { ownerId: null },
        { ownerId },
        { heartbeatAt: { lt: new Date(now.getTime() - OWNER_TIMEOUT_MS) } },
      ],
    },
    data: { ownerId, heartbeatAt: now },
  })

  return count === 1
}

/**
 * Game still running on the Play side
 * @param {string} sessionId - Game
 * @return {Promise<boolean>} - Running
 */

export const isSessionRunning = async (sessionId: string): Promise<boolean> => {
  const session = await prisma.playSession.findUnique({
    where: { id: sessionId },
    select: { status: true },
  })

  return session?.status === PlayStatuses.Running
}

/**
 * Keep the latest snapshot, refused once another process owns the game
 * @param {Object} input - Snapshot input
 * @param {string} input.sessionId - Game
 * @param {string} input.ownerId - Process
 * @param {ConcordatSnapshot} input.snapshot - Snapshot
 * @param {number} input.rev - Revision
 * @param {{ nation: number; tiles: number; peak: number; provinces: number }[]} input.nations - Figures
 * @return {Promise<void>} - Saved
 */

export const saveSnapshotRow = async (input: {
  sessionId: string
  ownerId: string
  snapshot: ConcordatSnapshot
  rev: number
  nations: { nation: number; tiles: number; peak: number; provinces: number }[]
}): Promise<void> => {
  const { sessionId, snapshot } = input
  const { count } = await prisma.concordatGame.updateMany({
    where: { sessionId, ownerId: input.ownerId },
    data: {
      snapshot: packSnapshot(snapshot),
      snapshotTick: snapshot.tick,
      rev: input.rev,
      phase: snapshot.phase,
      heartbeatAt: new Date(),
    },
  })
  if (count !== 1) return

  await prisma.$transaction(
    input.nations.map((entry) =>
      prisma.concordatPlayer.update({
        where: { sessionId_nation: { sessionId, nation: entry.nation } },
        data: { tiles: entry.tiles, peakTiles: entry.peak, provinces: entry.provinces },
      })
    )
  )
}

/**
 * Journal lines of a game
 * @param {string} sessionId - Game
 * @param {ConcordatEvent[]} events - Lines
 * @return {Promise<void>} - Written
 */

export const saveEventRows = async (sessionId: string, events: ConcordatEvent[]): Promise<void> => {
  await prisma.concordatEvent.createMany({
    data: events.map((event) => ({ sessionId, ...event })),
  })
}

/**
 * Final ranks and scores of a game
 * @param {string} sessionId - Game
 * @param {{ accountId: string; rank: number; score: number }[]} results - Results
 * @return {Promise<void>} - Written
 */

export const saveResultRows = async (
  sessionId: string,
  results: { accountId: string; rank: number; score: number }[]
): Promise<void> => {
  await prisma.$transaction(
    results.flatMap((result) => [
      prisma.playSeat.update({
        where: { sessionId_accountId: { sessionId, accountId: result.accountId } },
        data: { score: result.score },
      }),
      prisma.concordatPlayer.update({
        where: { sessionId_accountId: { sessionId, accountId: result.accountId } },
        data: { rank: result.rank, score: result.score },
      }),
    ])
  )
}

/**
 * Level of each bot account among these
 * @param {string[]} accountIds - Seated accounts
 * @return {Promise<Map<string, ConcordatBotLevelName>>} - Level per bot account
 */

export const botAccountLevels = async (
  accountIds: string[]
): Promise<Map<string, ConcordatBotLevelName>> => {
  const rows = await prisma.account.findMany({
    where: { id: { in: accountIds }, botKind: { not: null } },
    select: { id: true, botKind: true },
  })

  return new Map(rows.map((row) => [row.id, LEVEL_OF_KIND[row.botKind as PlayBotKindName]]))
}
