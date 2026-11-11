import { ACCESS_COMMANDS } from '@/declarations/nexus/commands/access'
import { MEMORA_COMMANDS, NEXUS_COMMANDS_ON_SELF } from '@/declarations/nexus/commands/memora'
import type { NexusCommand } from '@/declarations/nexus/commands/types'

/**
 * Every command, one family per file
 * @type {NexusCommand[]}
 */

export const NEXUS_COMMAND_LIST: NexusCommand[] = [
  ...ACCESS_COMMANDS,
  ...MEMORA_COMMANDS,
  ...NEXUS_COMMANDS_ON_SELF,
]
