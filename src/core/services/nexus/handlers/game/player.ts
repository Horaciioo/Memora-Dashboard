import 'server-only'

import {
  adjustPlayXp,
  correctPlayStats,
  readPlayAdmin,
  removeFromPlay,
  resetPlayGame,
  setPlayBan,
  setPlayLevel,
} from '@/core/services/play/PlayAdminService'
import { PLAY_ADMIN_TARGETS } from '@/declarations/play/admin'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

// Owner acts as an administrator
const actorOf = (accountId: string) => ({ id: accountId, isAdmin: true })

// Game as the admin service names it, the global line by default
export const targetArg = (value: unknown): string => {
  const text = String(value ?? PLAY_ADMIN_TARGETS.global).toLowerCase()

  return text === PLAY_ADMIN_TARGETS.global || text === PLAY_ADMIN_TARGETS.all
    ? text
    : text.toUpperCase()
}

// Body the admin service reads
const bodyOf = (args: Record<string, unknown>, extra: Record<string, unknown>) => ({
  game: targetArg(args.game),
  ...extra,
})

const player: NexusHandler = async (context) => ({
  output: await readPlayAdmin(String(context.args.id)),
})

const xp: NexusHandler = async (context) => {
  const id = String(context.args.id)
  const delta = Number(context.args.delta)
  if (context.dryRun) return { output: { player: id, game: context.args.game ?? 'global', delta } }

  const state = await adjustPlayXp(
    actorOf(context.accountId),
    id,
    bodyOf(context.args, { amount: delta })
  )

  return { output: state, target: `playProfile:${id}`, level: 'warning' }
}

const level: NexusHandler = async (context) => {
  const id = String(context.args.id)
  const wanted = Number(context.args.level)
  if (context.dryRun)
    return { output: { player: id, game: context.args.game ?? 'global', level: wanted } }

  const state = await setPlayLevel(
    actorOf(context.accountId),
    id,
    bodyOf(context.args, { level: wanted })
  )

  return { output: state, target: `playProfile:${id}`, level: 'warning' }
}

const ban: NexusHandler = async (context) => {
  const id = String(context.args.id)
  const lift = context.args.lift === true
  const reason = context.args.reason ? String(context.args.reason) : 'Décision de l’Administration'
  if (context.dryRun) return { output: { player: id, action: lift ? 'lever' : 'bannir', reason } }

  const state = await setPlayBan(actorOf(context.accountId), id, lift ? null : { reason })

  return { output: state, target: `playProfile:${id}`, level: 'warning' }
}

const reset: NexusHandler = async (context) => {
  const id = String(context.args.id)
  const game = targetArg(context.args.game)
  if (context.dryRun) return { output: { player: id, game } }

  const state = await resetPlayGame(actorOf(context.accountId), id, { game })

  return { output: state, target: `playProfile:${id}`, level: 'warning' }
}

const stats: NexusHandler = async (context) => {
  const id = String(context.args.id)
  const body = {
    game: targetArg(context.args.game),
    wins: context.args.wins,
    draws: context.args.draws,
    losses: context.args.losses,
    streak: context.args.streak,
  }
  if (context.dryRun) return { output: { player: id, ...body } }

  const state = await correctPlayStats(actorOf(context.accountId), id, body)

  return { output: state, target: `playProfile:${id}`, level: 'warning' }
}

const remove: NexusHandler = async (context) => {
  const id = String(context.args.id)
  if (context.dryRun) return { output: { player: id, action: 'sortir de sa partie' } }

  return {
    output: await removeFromPlay(actorOf(context.accountId), id),
    target: `playProfile:${id}`,
    level: 'warning',
  }
}

/**
 * Player gestures of the game module
 * @type {Record<string, NexusHandler>}
 */

export const GAME_PLAYER_HANDLERS: Record<string, NexusHandler> = {
  'game.player': player,
  'game.playerXp': xp,
  'game.playerLevel': level,
  'game.playerBan': ban,
  'game.playerReset': reset,
  'game.playerStats': stats,
  'game.playerRemove': remove,
}
