import { ACCESS_COMMANDS } from '@/declarations/nexus/commands/access'
import { GAME_COMMANDS } from '@/declarations/nexus/commands/game'
import { REALTIME_COMMANDS } from '@/declarations/nexus/commands/realtime'
import { SYSTEM_COMMANDS } from '@/declarations/nexus/commands/system'
import { DB_COMMANDS } from '@/declarations/nexus/commands/db'
import { MEMORA_COMMANDS, NEXUS_COMMANDS_ON_SELF } from '@/declarations/nexus/commands/memora'
import { OBSERVABILITY_COMMANDS } from '@/declarations/nexus/commands/observability'
import type { NexusCommand } from '@/declarations/nexus/commands/types'

/**
 * Every command, one family per file
 * @type {NexusCommand[]}
 */

export const NEXUS_COMMAND_LIST: NexusCommand[] = [
  ...ACCESS_COMMANDS,
  ...MEMORA_COMMANDS,
  ...OBSERVABILITY_COMMANDS,
  ...DB_COMMANDS,
  ...SYSTEM_COMMANDS,
  ...GAME_COMMANDS,
  ...REALTIME_COMMANDS,
  ...NEXUS_COMMANDS_ON_SELF,
]
