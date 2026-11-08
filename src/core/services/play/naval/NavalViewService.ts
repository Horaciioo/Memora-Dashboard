import 'server-only'

import { prisma } from '@/core/lib/db'
import {
  isDamage,
  navalSea,
  navalSettingsOf,
  readWeaponName,
  shipsAfloat,
  sunkShips,
  weaponCode,
} from '@/core/lib/play/naval'
import type { NavalShip } from '@/core/lib/play/naval'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { EngineSession } from '@/types/play'
import { NavalPhases, NavalResults } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

// Result as a number, shots travel as tuples
const RESULT_CODES = {
  [NavalResults.Miss]: 0,
  [NavalResults.Hit]: 1,
  [NavalResults.Sunk]: 2,
  [NavalResults.Spotted]: 3,
  [NavalResults.Clear]: 4,
} as const

/**
 * Board of a naval battle as one viewer may see it
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const navalView = async (session: EngineSession, viewerId: string) => {
  const where = { sessionId: session.id }
  const [game, rows, matches, shots] = await Promise.all([
    prisma.navalGame.findUnique({ where }),
    prisma.navalPlayer.findMany({ where, orderBy: { slot: 'asc' } }),
    prisma.navalMatch.findMany({ where, orderBy: [{ round: 'asc' }, { slot: 'asc' }] }),
    prisma.navalShot.findMany({ where, orderBy: { rev: 'asc' } }),
  ])
  const settings = navalSettingsOf(session.settings)
  const sea = navalSea(settings)
  const present = new Set(session.players)
  const phase = game?.phase ?? NavalPhases.Placement
  const indexOfId = new Map(rows.map((row, index) => [row.accountId, index]))
  const matchIndex = new Map(matches.map((match, index) => [match.id, index]))
  const fleetOf = (accountId: string) =>
    (rows.find((row) => row.accountId === accountId)?.fleet ?? []) as unknown as NavalShip[]
  const shotsAt = (matchId: string, targetId: string) =>
    shots.filter(
      (shot) => shot.matchId === matchId && shot.targetId === targetId && isDamage(shot.result)
    )

  // Latest match of each captain
  const latest = (accountId: string) =>
    matches.filter((match) => match.fighters.includes(accountId)).at(-1)
  const me = rows.find((row) => row.accountId === viewerId)
  const myMatch = me
    ? (matches.find((match) => match.status === 'LIVE' && match.fighters.includes(viewerId)) ??
      latest(viewerId))
    : undefined

  return {
    settings,
    sea: { size: sea.size, fleet: sea.fleet },
    phase,
    rev: game?.rev ?? 0,
    startsAt: game?.startsAt ?? new Date(),
    phaseEndsAt: game?.phaseEndsAt ?? new Date(),
    serverTime: new Date(),
    players: rows.map((row) => {
      const match = latest(row.accountId)

      return {
        accountId: row.accountId,
        slot: row.slot,
        isReady: Boolean(row.readyAt),
        isOut: Boolean(row.eliminatedAt),
        place: row.place,
        strikes: row.strikes,
        hasLeft: !present.has(row.accountId),
        afloat: match
          ? shipsAfloat(fleetOf(row.accountId), shotsAt(match.id, row.accountId)).length
          : sea.fleet.length,
      }
    }),
    // Only the viewer's own ships, the rest shows at the end
    you: me
      ? {
          fleet: (me.fleet ?? null) as unknown as NavalShip[] | null,
          isReady: Boolean(me.readyAt),
          ammo: me.ammo,
          offer: me.offer.map(readWeaponName),
        }
      : null,
    fleets:
      phase === NavalPhases.Over
        ? rows.map((row) => (row.fleet ?? []) as unknown as NavalShip[])
        : null,
    matches: matches.map((match) => ({
      id: match.id,
      round: match.round,
      slot: match.slot,
      status: match.status,
      fighters: match.fighters.map((id) => indexOfId.get(id) ?? -1),
      winner: match.winnerId ? (indexOfId.get(match.winnerId) ?? -1) : -1,
      turn: match.turnId ? (indexOfId.get(match.turnId) ?? -1) : -1,
      startsAt: match.startsAt,
      turnEndsAt: match.turnEndsAt,
      // Moment the shooter may fire, after the last shot played out
      readyAt: new Date(
        match.turnEndsAt.getTime() -
          (settings.turnSeconds + NAVAL_SETTINGS.graceSeconds) * SECOND_MS
      ),
    })),
    myMatch: myMatch ? (matchIndex.get(myMatch.id) ?? -1) : -1,
    // Rev, match, shooter, target, column, row, result, weapon, orientation
    shots: shots.map((shot) => [
      shot.rev,
      matchIndex.get(shot.matchId) ?? -1,
      indexOfId.get(shot.shooterId) ?? -1,
      indexOfId.get(shot.targetId) ?? -1,
      shot.x,
      shot.y,
      RESULT_CODES[shot.result],
      weaponCode(shot.weapon),
      shot.orientation,
    ]),
    // Ships sent down, shown whole
    sunk: matches.flatMap((match, index) =>
      match.fighters.flatMap((targetId) =>
        sunkShips(fleetOf(targetId), shotsAt(match.id, targetId)).map((ship) => ({
          match: index,
          target: indexOfId.get(targetId) ?? -1,
          ship,
        }))
      )
    ),
  }
}
