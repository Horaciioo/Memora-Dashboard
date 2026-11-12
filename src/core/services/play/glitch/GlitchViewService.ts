import 'server-only'

import { prisma } from '@/core/lib/db'
import { glitchSettingsOf, roundScene, secondsLabel } from '@/core/lib/play/glitch'
import type { GlitchScene } from '@/core/lib/play/glitch'
import { GLITCH_SETTINGS } from '@/declarations/play'
import type { EngineSession } from '@/types/play'

// Pictures before the first round opens
const NO_SCENE: GlitchScene = { theme: '', left: [], right: [], marks: [] }

/**
 * Everything a reader needs, the differences kept back until the reveal
 * @param {EngineSession} session - Game
 * @return {Promise<Object>} - Shared board and the hidden parts
 */

const readTable = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const [game, rows] = await Promise.all([
    prisma.glitchGame.findUnique({ where }),
    prisma.glitchProgress.findMany({ where, orderBy: { updatedAt: 'asc' } }),
  ])
  const settings = glitchSettingsOf(session.settings)
  const now = new Date()
  const round = game?.round ?? 1
  const revealUntil = game?.revealUntil ?? null
  const scene = game ? roundScene(game.seed, round, settings) : NO_SCENE
  const current = rows.filter((entry) => entry.round === round)

  // Everyone seated, plus whoever scored and left
  const accounts = [...new Set([...session.players, ...rows.map((entry) => entry.accountId)])]
  const players = accounts.map((accountId) => {
    const mine = current.find((entry) => entry.accountId === accountId)

    return {
      accountId,
      score: rows
        .filter((entry) => entry.accountId === accountId)
        .reduce((sum, entry) => sum + entry.points, 0),
      hasLeft: !session.players.includes(accountId),
      // State on this round
      found: mine?.found.length ?? 0,
      rank: mine?.rank ?? null,
      gain: mine?.points ?? 0,
      ms: mine?.ms ?? 0,
    }
  })

  const base = {
    settings,
    serverTime: now,
    round,
    rounds: settings.rounds,
    startsAt: game?.startsAt ?? now,
    endsAt: game?.endsAt ?? now,
    revealUntil,
    isOver: Boolean(game && revealUntil && round >= settings.rounds && now >= revealUntil),
    theme: scene.theme,
    width: GLITCH_SETTINGS.scene.width,
    height: GLITCH_SETTINGS.scene.height,
    total: scene.marks.length,
    left: scene.left,
    right: scene.right,
    // Spots of every difference, once the round is over
    marks: revealUntil ? scene.marks : null,
    players,
    feed: rows
      .filter((entry) => entry.rank !== null)
      .toReversed()
      .slice(0, GLITCH_SETTINGS.feedSize)
      .map((entry) => ({
        id: entry.id,
        kind: 'DONE',
        accountId: entry.accountId,
        at: entry.updatedAt,
        values: {
          total: scene.marks.length,
          seconds: secondsLabel(entry.ms),
          points: entry.points,
        },
      })),
  }

  return { base, scene, current }
}

/**
 * Board of a Glitch game: the same pictures for all, the own finds for each
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const glitchBoards = async (session: EngineSession) => {
  const { base, scene, current } = await readTable(session)

  return (viewerId: string) => {
    const mine = current.find((entry) => entry.accountId === viewerId)

    return {
      ...base,
      mine: {
        found: (mine?.found ?? []).flatMap((index) => scene.marks[index] ?? []),
        lockedUntil: mine?.lockUntil ?? null,
      },
    }
  }
}

/**
 * Board of a Glitch game, as seen by one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const glitchView = async (session: EngineSession, viewerId: string) =>
  (await glitchBoards(session))(viewerId)

/**
 * Board read by the bots: the pictures and every difference with who found what
 * @param {EngineSession} session - Game
 * @return {Promise<object>} - Board with its secret
 */

export const glitchBotView = async (session: EngineSession) => {
  const { base, scene, current } = await readTable(session)

  return {
    ...base,
    secret: {
      marks: scene.marks,
      found: Object.fromEntries(current.map((entry) => [entry.accountId, entry.found])),
    },
  }
}
