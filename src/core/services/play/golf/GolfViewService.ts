import 'server-only'

import { prisma } from '@/core/lib/db'
import { after } from '@/core/lib/play/clock'
import {
  activePowers,
  cardTotal,
  golfPhase,
  golfSettingsOf,
  holesOf,
  isEffectActive,
  isHoleDone,
} from '@/core/lib/play/golf'
import { effectsOf, hazardsOf, orbsOf } from '@/core/services/play/golf/lookups'
import type { GolfTrack } from '@/core/services/play/golf/lookups'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { EngineSession } from '@/types/play'
import type { GolfPowerName } from '@/utils/constants/play'

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
      },
    }),
  ])
  const settings = golfSettingsOf(session.settings)
  const holes = holesOf(settings).length
  const present = new Set(session.players)
  const at = now.getTime()
  const clock = game ?? { hole: 0, startsAt: now, endsAt: now, closedAt: null }
  const isLast = clock.hole + 1 >= holes

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
    hazards: hazardsOf(game?.hazards ?? []).filter((hazard) => isEffectActive(hazard, at)),
    players: players.map((player) => ({
      accountId: player.accountId,
      x: player.x,
      z: player.z,
      restsAt: player.restsAt,
      strokes: player.strokes,
      isHoled: Boolean(player.holedAt),
      isDone: isHoleDone(player, settings.maxStrokes),
      card: player.card,
      total: cardTotal(player.card),
      power: player.power as GolfPowerName | null,
      effects: effectsOf(player.effects).filter((effect) => isEffectActive(effect, at)),
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
      kind: move.strokes === 1 ? 'ACE' : move.kind,
      accountId: move.accountId,
      at: move.createdAt,
      values: {
        count: move.strokes ?? 0,
        power: move.power && GOLF_POWERS.has(move.power) ? GOLF_POWERS.label(move.power) : '',
      },
    })),
    serverTime: now,
  }
}
