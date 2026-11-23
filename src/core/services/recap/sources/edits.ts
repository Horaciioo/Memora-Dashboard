import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import type { RecapContext, RecapDraft } from '@/types/recap'

/**
 * Tasks and projects of the member that someone else touched
 * @param {RecapContext} context - Member and window
 * @return {Promise<RecapDraft[]>} - Beats
 */

export const readEditBeats = async ({
  accountId,
  since,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  const touched = {
    updatedAt: { gt: since, lte: until },
    updatedById: { not: accountId },
    archived: false,
  }
  const select = { id: true, title: true, updatedAt: true, updatedById: true } as const

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { ...touched, ownerId: accountId },
      select,
      take: RECAP_SETTINGS.sourceTake,
    }),
    prisma.project.findMany({
      where: {
        ...touched,
        OR: [{ leads: { some: { accountId } } }, { assistants: { some: { accountId } } }],
      },
      select,
      take: RECAP_SETTINGS.sourceTake,
    }),
  ])

  const draft =
    (target: 'task' | 'project') =>
    (row: (typeof tasks)[number]): RecapDraft => ({
      beat: 'edited',
      at: row.updatedAt,
      actorIds: row.updatedById ? [row.updatedById] : [],
      count: 1,
      target,
      targetId: row.id,
      subject: row.title,
    })

  return [...tasks.map(draft('task')), ...projects.map(draft('project'))]
}
