import 'server-only'

import { latest, pauseAfter } from '@/core/bots/play/random'
import { decideStopGo } from '@/core/lib/play/stopgo'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'

/**
 * Stop & Go bot, reads its own board only
 * @type {PlayBotStrategy}
 */

export const STOPGO_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as StopGoBoardView
    const plan = decideStopGo({ board, botId, level, random: Math.random })
    if (!plan) return null
    const at = pauseAfter(latest(now, new Date(board.startsAt)), PLAY_BOT_SETTINGS.stopgo.thinkMs)

    return { key: plan.key, raw: plan.raw, at }
  },
}
