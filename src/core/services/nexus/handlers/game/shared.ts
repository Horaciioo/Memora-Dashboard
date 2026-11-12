import 'server-only'

import { conflict, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { GAME_ADAPTERS } from '@/core/services/nexus/handlers/game/adapters'
import type { GameAdapter } from '@/core/services/nexus/handlers/game/adapters/types'
import { GAME_COPY } from '@/declarations/nexus/modulesCopy'
import type { NexusGameCapability } from '@/declarations/nexus/inventory/games'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Game row the commands lean on
 * @typedef {Object} GameRow
 */

export interface GameRow {
  id: string
  game: PlayGameName
  status: string
  hostId: string
}

/**
 * Read a game, hidden codes left out
 * @param {unknown} id - Game identifier
 * @return {Promise<GameRow>} - Game
 */

export const gameOf = async (id: unknown): Promise<GameRow> => {
  const row = await prisma.playSession.findUnique({
    where: { id: String(id) },
    select: { id: true, game: true, status: true, hostId: true },
  })
  if (!row) throw notFound(GAME_COPY.missing)

  return row as GameRow
}

/**
 * Adapter of a game
 * @param {GameRow} game - Game
 * @return {GameAdapter} - Adapter
 */

export const adapterOf = (game: GameRow): GameAdapter => GAME_ADAPTERS[game.game]

/**
 * Refuse a power the engine lacks
 * @param {GameRow} game - Game
 * @param {NexusGameCapability} capability - Power asked
 * @return {void} - Throws when missing
 */

export const assertCapable = (game: GameRow, capability: NexusGameCapability): void => {
  if (!adapterOf(game).capabilities.includes(capability)) throw conflict(GAME_COPY.notCapable)
}
