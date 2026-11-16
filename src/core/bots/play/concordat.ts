import 'server-only'

import type { PlayBotStrategy } from '@/types/play'

/**
 * Concordat bot, asleep until the bot lot
 * @type {PlayBotStrategy}
 */

export const CONCORDAT_BOT: PlayBotStrategy = { decide: async () => null }
