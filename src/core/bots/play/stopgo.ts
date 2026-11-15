import 'server-only'

import type { PlayBotStrategy } from '@/types/play'

/**
 * Stop & Go bot, asleep until its lot
 * @type {PlayBotStrategy}
 */

export const STOPGO_BOT: PlayBotStrategy = {
  decide: async () => null,
}
