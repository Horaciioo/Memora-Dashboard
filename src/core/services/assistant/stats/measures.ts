import 'server-only'

import { prisma } from '@/core/lib/db'
import { addDays } from '@/core/lib/assistant/dates'
import type { StatMeasureId } from '@/declarations/assistant/stats'
import type { PeriodMatch } from '@/core/lib/assistant/period'
import { WorkflowPhases } from '@/utils/constants/workflow'
import { wallToInstant } from '@/utils/format/time/zone'

/**
 * What a reader is given
 * @typedef {Object} ReadInput
 * @property {string} accountId - Member asking
 * @property {PeriodMatch} window - Days read
 * @property {string} today - ISO day
 */

export interface ReadInput {
  accountId: string
  window: PeriodMatch
  today: string
}

// Instants a window covers, the end day included
const spanOf = ({ start, end }: PeriodMatch) => ({
  gte: wallToInstant(`${start}T00:00`),
  lt: wallToInstant(`${addDays(end, 1)}T00:00`),
})

// A task is open until its state is a done one
const OPEN_TASK = { archived: false, state: { phase: { not: WorkflowPhases.Done } } } as const

/**
 * One reader per figure, each a bounded indexed query
 * @type {Record<StatMeasureId, (input: ReadInput) => Promise<number>>}
 */

export const READERS: Record<StatMeasureId, (input: ReadInput) => Promise<number>> = {
  livesModerated: async ({ accountId, window }) =>
    (
      await prisma.modViewPresence.groupBy({
        by: ['liveId'],
        where: { accountId, openedAt: spanOf(window) },
      })
    ).length,
  moderationHours: async ({ accountId, window }) =>
    (
      await prisma.modViewPresence.aggregate({
        where: { accountId, openedAt: spanOf(window) },
        _sum: { activeSeconds: true },
      })
    )._sum.activeSeconds ?? 0,
  tasksOpen: ({ accountId }) => prisma.task.count({ where: { ownerId: accountId, ...OPEN_TASK } }),
  tasksOverdue: ({ accountId, today }) =>
    prisma.task.count({
      where: {
        ownerId: accountId,
        ...OPEN_TASK,
        dueDate: { lt: wallToInstant(`${today}T00:00`) },
      },
    }),
}
