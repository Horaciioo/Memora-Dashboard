import 'server-only'

import { presenceOf } from '@/core/lib/realtime/server/presence'
import { takeOf } from '@/core/services/nexus/bounds'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { readPlayAdminLogs } from '@/core/services/play/PlayAdminLogService'
import { readPlayAdminStats } from '@/core/services/play/PlayAdminStatsService'
import { PLAY_TOPICS } from '@/declarations/play/topics'

const logs: NexusHandler = async (context) => {
  const player = context.args.player ? String(context.args.player) : null
  const lines = (await readPlayAdminLogs())
    .filter((line) => !player || line.subjectId === player)
    .filter((line) => context.args.admin !== true || line.isAdminAction)

  return { output: lines.slice(0, takeOf(context.args.take)) }
}

const figures: NexusHandler = async () => ({ output: { ...(await readPlayAdminStats()) } })

const online: NexusHandler = async () => ({
  output: presenceOf(PLAY_TOPICS.lobbies)
    .filter((member) => member.status !== 'left')
    .map(({ accountId, name, status, place }) => ({ accountId, name, status, place })),
})

/**
 * Journal, figures and presence of the game module
 * @type {Record<string, NexusHandler>}
 */

export const GAME_FIGURES_HANDLERS: Record<string, NexusHandler> = {
  'game.logs': logs,
  'game.figures': figures,
  'game.online': online,
}
