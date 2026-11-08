import 'server-only'

import { prisma } from '@/core/lib/db'
import { after } from '@/core/lib/play/clock'
import {
  activePowers,
  cardTotal,
  golfPhase,
  golfSettingsOf,
  holesOf,
  isEffectKept,
  isHoleDone,
  isIced,
  strokeCeiling,
} from '@/core/lib/play/golf'
import { effectsOf, hazardsOf, orbsOf } from '@/core/services/play/golf/lookups'
import type { GolfTrack } from '@/core/services/play/golf/lookups'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { EngineSession } from '@/types/play'
import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Feed line kind, aces and teleports told apart
 * @param {{ kind: string, strokes: number | null, power: string | null }} move - Move
 * @return {string} - Kind
 */

const feedKindOf = (move: { kind: string; strokes: number | null; power: string | null }) => {
  if (move.strokes === 1) return 'ACE'

  return move.power === GolfPowers.Teleport ? 'TELEPORT' : move.kind
}

/**
 * Board of a golf game
 * @param {EngineSession} session - Game
 * @return {Promise<object>} - Board
 */

export const golfView = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const now = new Date()
  const since = after(now, -GOLF_SETTINGS.shotsKeptSeconds)
  const [game, players, shots, feed] = await Promise.all([
    prisma.golfGame.findUnique({ where }),
    prisma.golfPlayer.findMany({ where, orderBy: { id: 'asc' } }),
    prisma.golfMove.findMany({
      where: { ...where, kind: 'SHOT', createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, accountId: true, createdAt: true, path: true },
    }),
    prisma.golfMove.findMany({
      where: { ...where, kind: { not: 'SHOT' } },
      orderBy: { createdAt: 'desc' },
      take: GOLF_SETTINGS.feedSize,
      select: {
        id: true,
        kind: true,
        accountId: true,
        createdAt: true,
        strokes: true,
        power: true,
        hole: true,
      },
    }),
  ])
  const settings = golfSettingsOf(session.settings)
  const holes = holesOf(settings).length
  const present = new Set(session.players)
  const at = now.getTime()
  const clock = game ?? { hole: 0, startsAt: now, endsAt: now, closedAt: null }
  const isLast = clock.hole + 1 >= holes
  const hazards = hazardsOf(game?.hazards ?? []).filter((hazard) => isEffectKept(hazard, at))

  return {
    settings,
    holes,
    hole: clock.hole,
    phase: golfPhase(clock, at, holes),
    startsAt: clock.startsAt,
    endsAt: clock.endsAt,
    closedAt: clock.closedAt,
    nextAt: clock.closedAt
      ? after(
          clock.closedAt,
          isLast ? GOLF_SETTINGS.resultDelaySeconds : GOLF_SETTINGS.intermissionSeconds
        )
      : null,
    rev: game?.rev ?? 0,
    orbs: orbsOf(game?.orbs ?? []),
    hazards,
    // Whole course frozen, every slab drawn iced
    isIced: isIced(hazards, at),
    players: players.map((player) => ({
      accountId: player.accountId,
      x: player.x,
      z: player.z,
      restsAt: player.restsAt,
      strokes: player.strokes,
      isHoled: Boolean(player.holedAt),
      isDone: isHoleDone(player, strokeCeiling(settings)),
      card: player.card,
      total: cardTotal(player.card),
      hand: player.powers.filter((power): power is GolfPowerName => GOLF_POWERS.has(power)),
      effects: effectsOf(player.effects).filter((effect) => isEffectKept(effect, at)),
      powers: [...activePowers(effectsOf(player.effects), at)],
      hasLeft: !present.has(player.accountId),
    })),
    shots: shots.map((shot) => ({
      id: shot.id,
      accountId: shot.accountId,
      at: shot.createdAt,
      track: shot.path as unknown as GolfTrack,
    })),
    feed: feed.map((move) => ({
      id: move.id,
      kind: feedKindOf(move),
      accountId: move.accountId,
      at: move.createdAt,
      hole: move.hole,
      // Key for the power sound, none on a teleport line
      power:
        move.power && GOLF_POWERS.has(move.power) && feedKindOf(move) === 'POWER'
          ? move.power
          : null,
      values: {
        count: move.strokes ?? 0,
        power: move.power && GOLF_POWERS.has(move.power) ? GOLF_POWERS.label(move.power) : '',
      },
    })),
    serverTime: now,
  }
}
