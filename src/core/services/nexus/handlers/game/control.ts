import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { clearSessionTimers } from '@/core/lib/play/timers'
import { signalPlay } from '@/core/lib/play/signal'
import { assertCapable, gameOf } from '@/core/services/nexus/handlers/game/shared'
import { dependentsOf } from '@/core/services/nexus/handlers/db/links'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { startSession } from '@/core/services/play/GameService'
import { createSession } from '@/core/services/play/LobbyService'
import { finishSession } from '@/core/services/play/RewardService'
import { pauseSession, resumeSession } from '@/core/services/play/PlayPauseService'
import { GAME_COPY } from '@/declarations/nexus/modulesCopy'
import { PlayStatuses } from '@/utils/constants/play'

const create: NexusHandler = async (context) => {
  const type = String(context.args.type).toUpperCase()
  const isPrivate = context.args.private === true
  const output = { game: type, host: context.accountId, private: isPrivate }
  if (context.dryRun) return { output }

  const { id } = await createSession(
    context.accountId,
    { game: type, visibility: isPrivate ? 'PRIVATE' : 'PUBLIC' },
    true
  )

  return { output: { ...output, id }, target: `playSession:${id}` }
}

const start: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  if (context.dryRun) return { output: { game: game.id, status: game.status, next: 'RUNNING' } }

  // The host check passes with the host's own identifier
  await startSession(game.id, game.hostId)

  return { output: { game: game.id, status: 'RUNNING' }, target: `playSession:${game.id}` }
}

const pause: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  assertCapable(game, 'pause')
  const output = { game: game.id, status: game.status, next: 'PAUSED' }
  if (context.dryRun) return { output }

  await pauseSession(
    game.id,
    context.accountId,
    context.args.reason ? String(context.args.reason) : null
  )

  return { output, target: `playSession:${game.id}`, level: 'warning' }
}

const resume: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  assertCapable(game, 'resume')
  if (context.dryRun) return { output: { game: game.id, status: game.status, next: 'RUNNING' } }

  const shifted = await resumeSession(game.id)

  return {
    output: { game: game.id, status: 'RUNNING', shiftedSeconds: Math.round(shifted) },
    target: `playSession:${game.id}`,
  }
}

const stop: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  const settle = context.args.outcome === 'settle'
  const output = { game: game.id, from: game.status, outcome: settle ? 'settle' : 'abandon' }
  if (context.dryRun) return { output, level: 'warning' }

  if (settle) {
    // A paused table plays out first
    if (game.status === PlayStatuses.Paused) await resumeSession(game.id)
    clearSessionTimers(game.id)
    await finishSession(game.id)
  } else {
    clearSessionTimers(game.id)
    await prisma.playSession.updateMany({
      where: {
        id: game.id,
        status: { in: [PlayStatuses.Lobby, PlayStatuses.Running, PlayStatuses.Paused] },
      },
      data: { status: PlayStatuses.Abandoned, finishedAt: new Date(), pausedAt: null },
    })
    await signalPlay(game.id, true)
  }

  return {
    output: { ...output, note: GAME_COPY.stopped },
    target: `playSession:${game.id}`,
    level: 'warning',
  }
}

const remove: NexusHandler = async (context) => {
  const game = await gameOf(context.args.game)
  if (game.status === PlayStatuses.Running || game.status === PlayStatuses.Paused) {
    throw conflict(GAME_COPY.stillOn)
  }

  // Cascades are shown before they happen
  const dependents = await dependentsOf('playSession', game.id)
  const output = { game: game.id, status: game.status, dependents }
  if (context.dryRun) return { output, level: 'warning' }

  await (context.tx ?? prisma).playSession.delete({ where: { id: game.id } })
  await signalPlay(game.id, true)

  return { output, target: `playSession:${game.id}`, before: output, after: {}, level: 'warning' }
}

/**
 * Game control
 * @type {Record<string, NexusHandler>}
 */

export const GAME_CONTROL_HANDLERS: Record<string, NexusHandler> = {
  'game.create': create,
  'game.start': start,
  'game.pause': pause,
  'game.resume': resume,
  'game.stop': stop,
  'game.delete': remove,
}
