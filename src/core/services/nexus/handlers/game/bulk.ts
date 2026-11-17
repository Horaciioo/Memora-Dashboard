import 'server-only'

import { invalidInput } from '@/core/lib/errors'
import { targetArg } from '@/core/services/nexus/handlers/game/player'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { adjustEveryonesXp, resetSelectedPlay } from '@/core/services/play/PlayAdminBoardService'
import { PLAY_ERRORS } from '@/declarations/play'

// Owner acts as an administrator
const actorOf = (accountId: string) => ({ id: accountId, isAdmin: true })

// Identifiers of a comma list
const idsOf = (value: unknown): string[] =>
  String(value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

const give: NexusHandler = async (context) => {
  const ids = idsOf(context.args.ids)
  const isEveryone = context.args.everyone === true
  // Everyone is named, never implied
  if (!ids.length && !isEveryone) {
    throw invalidInput([{ field: 'ids', message: PLAY_ERRORS.invalidSettings }])
  }
  const body = {
    game: targetArg(context.args.game),
    amount: Number(context.args.delta),
    accountIds: isEveryone ? [] : ids,
  }
  if (context.dryRun) return { output: { players: isEveryone ? 'tous' : ids.length, ...body } }

  const count = await adjustEveryonesXp(actorOf(context.accountId), body)

  return { output: { touched: count, game: body.game, delta: body.amount }, level: 'warning' }
}

const reset: NexusHandler = async (context) => {
  const body = { game: targetArg(context.args.game), accountIds: idsOf(context.args.ids) }
  if (context.dryRun) return { output: { players: body.accountIds.length, game: body.game } }

  const count = await resetSelectedPlay(actorOf(context.accountId), body)

  return { output: { touched: count, game: body.game }, level: 'warning' }
}

/**
 * Bulk XP gestures of the game module
 * @type {Record<string, NexusHandler>}
 */

export const GAME_BULK_HANDLERS: Record<string, NexusHandler> = {
  'game.xpGive': give,
  'game.xpReset': reset,
}
