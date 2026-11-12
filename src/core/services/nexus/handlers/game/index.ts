import { GAME_CONTROL_HANDLERS } from '@/core/services/nexus/handlers/game/control'
import { GAME_OVERRIDE_HANDLERS } from '@/core/services/nexus/handlers/game/override'
import { GAME_PLAYER_HANDLERS } from '@/core/services/nexus/handlers/game/player'
import { GAME_READ_HANDLERS } from '@/core/services/nexus/handlers/game/read'
import { GAME_GROUP_HANDLERS } from '@/core/services/nexus/handlers/game/tournament'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

/**
 * Every game handler
 * @type {Record<string, NexusHandler>}
 */

export const GAME_HANDLERS: Record<string, NexusHandler> = {
  ...GAME_READ_HANDLERS,
  ...GAME_CONTROL_HANDLERS,
  ...GAME_OVERRIDE_HANDLERS,
  ...GAME_PLAYER_HANDLERS,
  ...GAME_GROUP_HANDLERS,
}
