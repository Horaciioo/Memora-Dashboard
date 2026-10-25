import 'server-only'

import { prisma } from '@/core/lib/db'
import { after } from '@/core/lib/play/clock'
import { cardTotal, drawCourse, golfSettingsOf, holeScore, holesOf } from '@/core/lib/play/golf'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { asJson, isEveryoneDone, withGolf } from '@/core/services/play/golf/lookups'
import type { GolfTable } from '@/core/services/play/golf/lookups'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { EngineSession, EngineStep } from '@/types/play'

/**
 * Step that only moved the board
 * @param {Date | null} deadline - Next timed move
 * @return {EngineStep} - Step
 */

export const boardStep = (deadline: Date | null): EngineStep => ({
  changed: true,
  finished: false,
  deadline,
  isBoardOnly: true,
})

/**
 * Moment the scorecard of a closed hole gives way
 * @param {GolfTable} table - Locked course
 * @param {Date} closedAt - Hole closed
 * @return {Date} - Next hole or the end
 */

const nextAt = (table: GolfTable, closedAt: Date): Date =>
  after(
    closedAt,
    table.game.hole + 1 >= table.holes
      ? GOLF_SETTINGS.resultDelaySeconds
      : GOLF_SETTINGS.intermissionSeconds
  )

/**
 * Tee off the first hole
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openCourse = async (session: EngineSession): Promise<EngineStep> => {
  // A random course is drawn at each start
  const settings = drawCourse(golfSettingsOf(session.settings))
  const [first] = holesOf(settings)
  const now = new Date()
  const startsAt = after(now, GOLF_SETTINGS.countdownSeconds)
  const endsAt = after(startsAt, settings.holeSeconds)

  await prisma.$transaction([
    prisma.golfPlayer.createMany({
      data: session.players.map((accountId) => ({
        sessionId: session.id,
        accountId,
        x: first.tee[0],
        z: first.tee[1],
        restsAt: now,
      })),
    }),
    prisma.golfGame.create({ data: { sessionId: session.id, startsAt, endsAt } }),
    prisma.playSession.update({ where: { id: session.id }, data: { settings: asJson(settings) } }),
  ])

  return boardStep(endsAt)
}

/**
 * Close the hole once the last ball stops, every card written
 * @param {GolfTable} table - Locked course
 * @return {Promise<EngineStep>} - Step
 */

export const closeHole = async (table: GolfTable): Promise<EngineStep> => {
  const { tx, game, players, settings, now } = table
  // Rolling balls finish first, never past the clock
  const lastRest = Math.max(now.getTime(), ...players.map((player) => player.restsAt.getTime()))
  const closedAt = new Date(Math.min(lastRest, Math.max(now.getTime(), game.endsAt.getTime())))

  for (const player of players) {
    await tx.golfPlayer.update({
      where: { id: player.id },
      data: { card: { push: holeScore(player, settings.maxStrokes) } },
    })
  }
  await tx.golfGame.update({
    where: { sessionId: game.sessionId },
    data: { closedAt, rev: { increment: 1 } },
  })

  return boardStep(nextAt(table, closedAt))
}

/**
 * Next hole, every ball back on the tee
 * @param {GolfTable} table - Locked course
 * @return {Promise<EngineStep>} - Step
 */

const openNextHole = async ({ tx, game, settings, now }: GolfTable): Promise<EngineStep> => {
  const hole = game.hole + 1
  const [x, z] = holesOf(settings)[hole].tee
  const startsAt = after(now, GOLF_SETTINGS.holeIntroSeconds)
  const endsAt = after(startsAt, settings.holeSeconds)

  // Powers in hand stay, effects wear off
  await tx.golfPlayer.updateMany({
    where: { sessionId: game.sessionId },
    data: { x, z, restsAt: now, strokes: 0, holedAt: null, effects: [] },
  })
  await tx.golfGame.update({
    where: { sessionId: game.sessionId },
    data: { hole, startsAt, endsAt, closedAt: null, orbs: [], hazards: [], rev: { increment: 1 } },
  })

  return boardStep(endsAt)
}

/**
 * Final scores, fewest strokes best
 * @param {GolfTable} table - Locked course
 * @return {Promise<EngineStep>} - Finished step
 */

const finishCourse = async ({ tx, session, players }: GolfTable): Promise<EngineStep> => {
  for (const player of players) {
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId: player.accountId } },
      data: { score: -cardTotal(player.card) },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Play every overdue move of the course
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleCourse = (session: EngineSession): Promise<EngineStep> =>
  withGolf(session, async (table) => {
    const { game, now } = table
    if (!game.closedAt) {
      // Everyone done, or the clock ran out
      if (isEveryoneDone(table) || now >= game.endsAt) return closeHole(table)

      return { ...IDLE_STEP, deadline: game.endsAt }
    }

    const until = nextAt(table, game.closedAt)
    if (now < until) return { ...IDLE_STEP, deadline: until }

    return game.hole + 1 >= table.holes ? finishCourse(table) : openNextHole(table)
  })
