import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { isFleetValid, navalSettingsOf } from '@/core/lib/play/naval'
import { readBodyInteger } from '@/core/lib/play/parse'
import { advance } from '@/core/services/play/naval/NavalFlowService'
import { checkShot, fireShot } from '@/core/services/play/naval/NavalFireService'
import { captainOf, saveCaptain, withTable } from '@/core/services/play/naval/NavalTable'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession, EngineStep } from '@/types/play'
import { NavalPhases } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Lay out the table: captains in a random order, placement open
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openBattle = async (session: EngineSession): Promise<EngineStep> => {
  const settings = navalSettingsOf(session.settings)
  const startsAt = new Date()
  const phaseEndsAt = new Date(
    startsAt.getTime() + (settings.placementSeconds + NAVAL_SETTINGS.countdownSeconds) * SECOND_MS
  )
  const order = session.players.toSorted(() => Math.random() - 0.5)

  await prisma.$transaction([
    prisma.navalPlayer.createMany({
      data: order.map((accountId, slot) => ({ sessionId: session.id, accountId, slot })),
    }),
    prisma.navalGame.create({ data: { sessionId: session.id, startsAt, phaseEndsAt } }),
  ])

  return { changed: true, finished: false, deadline: phaseEndsAt }
}

/**
 * Validate and lock a fleet
 * @param {EngineSession} session - Game
 * @param {string} accountId - Captain
 * @param {Record<string, unknown>} raw - Body with the ships
 * @return {Promise<EngineStep>} - Step
 */

export const placeFleet = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    if (table.game.phase !== NavalPhases.Placement) throw conflict(PLAY_ERRORS.notPlacing)
    const ships = raw.ships
    if (!isFleetValid(ships, table.sea)) throw conflict(PLAY_ERRORS.badFleet)

    const fleet = ships.map(({ id, length, x, y, isHorizontal }) => ({
      id,
      length,
      x,
      y,
      isHorizontal,
    }))
    await saveCaptain(table, accountId, { fleet, readyAt: table.now })

    return advance(table)
  })

/**
 * Take the fleet back to change it
 * @param {EngineSession} session - Game
 * @param {string} accountId - Captain
 * @return {Promise<EngineStep>} - Step
 */

export const retractFleet = (session: EngineSession, accountId: string): Promise<EngineStep> =>
  withTable(session, async (table) => {
    if (table.game.phase !== NavalPhases.Placement) throw conflict(PLAY_ERRORS.notPlacing)
    await saveCaptain(table, accountId, { readyAt: null })

    return advance(table)
  })

/**
 * Fire one shell
 * @param {EngineSession} session - Game
 * @param {string} accountId - Shooter
 * @param {Record<string, unknown>} raw - Body with square and target
 * @return {Promise<EngineStep>} - Step
 */

export const fire = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, async (table) => {
    await advance(table)
    if (table.game.phase !== NavalPhases.Battle) throw conflict(PLAY_ERRORS.notRunning)
    const match = table.matches.find(
      (entry) => entry.status === 'LIVE' && entry.turnId === accountId
    )
    if (!match || !captainOf(table, accountId)) throw conflict(PLAY_ERRORS.notYourTurn)

    // Square and target checked
    const cell = { x: readBodyInteger(raw, 'x') ?? -1, y: readBodyInteger(raw, 'y') ?? -1 }
    const targetId = checkShot(table, match, {
      shooterId: accountId,
      targetId: typeof raw.target === 'string' ? raw.target : null,
      cell,
    })
    await saveCaptain(table, accountId, { strikes: 0 })
    await fireShot(table, match, { shooterId: accountId, targetId, cell })

    return advance(table)
  })
