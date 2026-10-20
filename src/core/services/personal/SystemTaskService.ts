import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { defaultState } from '@/core/services/work/shared'
import { SYSTEM_TASK_KINDS } from '@/declarations/personal/groups'
import type { HomeTask } from '@/types/personal'
import { WorkflowPhases, WorkflowScopes } from '@/utils/constants/workflow'

/**
 * Identifier a mirrored task is stored under
 * @param {string} accountId - Owner
 * @param {string} key - Key of the home task
 * @return {string} - Unique system key
 */

const systemKeyOf = (accountId: string, key: string): string => `${accountId}:${key}`

/**
 * Open, refresh and close the tasks the timeline asks of a member, with no gesture from anyone.
 * The ones ticked done by hand are returned so the home leaves them out
 * @param {string} accountId - Owner
 * @param {HomeTask[]} tasks - What the timeline asks right now
 * @return {Promise<Set<string>>} - Keys of the home tasks already done
 */

export const syncSystemTasks = async (
  accountId: string,
  tasks: HomeTask[]
): Promise<Set<string>> => {
  const done = new Set<string>()

  try {
    const wanted = tasks.filter((task) => SYSTEM_TASK_KINDS.includes(task.kind))
    const [todoId, doneState, stored] = await Promise.all([
      defaultState(WorkflowScopes.Task),
      prisma.workflowState.findFirst({
        where: { scope: WorkflowScopes.Task, phase: WorkflowPhases.Done },
        orderBy: { position: 'asc' },
      }),
      prisma.task.findMany({
        where: { ownerId: accountId, systemKey: { startsWith: `${accountId}:` } },
        select: {
          id: true,
          systemKey: true,
          title: true,
          description: true,
          href: true,
          dueDate: true,
          state: { select: { phase: true } },
        },
      }),
    ])
    const byKey = new Map(stored.map((row) => [row.systemKey, row]))
    const currentKeys = new Set(wanted.map((task) => systemKeyOf(accountId, task.key)))

    // Opened by the timeline
    await prisma.task.createMany({
      skipDuplicates: true,
      data: wanted
        .filter((task) => !byKey.has(systemKeyOf(accountId, task.key)))
        .map((task) => ({
          systemKey: systemKeyOf(accountId, task.key),
          title: task.title,
          description: [task.context, task.description].filter(Boolean).join('\n\n') || null,
          href: task.href,
          dueDate: task.dueAt ? new Date(task.dueAt) : null,
          ownerId: accountId,
          stateId: todoId,
        })),
    })

    for (const task of wanted) {
      const row = byKey.get(systemKeyOf(accountId, task.key))
      if (!row) continue

      if (row.state?.phase === WorkflowPhases.Done) done.add(task.key)

      // Kept in line with the timeline
      const description = [task.context, task.description].filter(Boolean).join('\n\n') || null
      if (row.title !== task.title || row.href !== task.href || row.description !== description) {
        await prisma.task.update({
          where: { id: row.id },
          data: { title: task.title, href: task.href, description },
        })
      }
    }

    // Closed once the timeline no longer asks for it
    const closing = stored.filter(
      (row) =>
        row.systemKey && !currentKeys.has(row.systemKey) && row.state?.phase !== WorkflowPhases.Done
    )
    if (doneState && closing.length > 0) {
      await prisma.task.updateMany({
        where: { id: { in: closing.map((row) => row.id) } },
        data: { stateId: doneState.id },
      })
    }
  } catch (error) {
    // The home keeps working from the timeline alone
    logger.error('[system-tasks]', error)
  }

  return done
}
