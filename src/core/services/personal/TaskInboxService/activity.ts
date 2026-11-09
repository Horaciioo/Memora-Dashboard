import 'server-only'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { HomeTask } from '@/types/personal'
import { Permissions } from '@/utils/constants/permissions'
import { unreadMentions } from '@/core/services/system/NotificationService'
import { prisma } from '@/core/lib/db'
import { WorkflowPhases } from '@/utils/constants/workflow'
import { PlayGames } from '@/utils/constants/play'

/**
 * Comments of a recruitment session that named the member
 * @param {string} accountId - Member
 * @return {Promise<HomeTask[]>} - One task per unseen mention
 */

export const mentionTasks = async (accountId: string): Promise<HomeTask[]> => {
  const mentions = await unreadMentions(accountId, 'recruitment')

  return mentions.flatMap((mention) =>
    mention.targetId
      ? [
          {
            key: `mention:${mention.id}`,
            kind: 'mention' as const,
            title: PERSONAL_TASK_COPY.mentionTitle.replace(
              '{name}',
              mention.actorName ?? PERSONAL_TASK_COPY.mentionSomeone
            ),
            context: mention.subject ?? '',
            icon: 'note' as const,
            href: ROUTES.recruitment(mention.targetId),
            description: PERSONAL_TASK_COPY.mentionDescription,
            guide: null,
            destinationLabel: null,
            dueAt: null,
          },
        ]
      : []
  )
}

/**
 * First Baccalaureat game, until one is played
 * @param {string} accountId - Member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - The task, or none
 */

export const playTasks = async (
  accountId: string,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  if (!access.can(Permissions.PlayAccess)) return []
  const played = await prisma.playGameStat.count({
    where: { accountId, game: PlayGames.Baccalaureat, played: { gt: 0 } },
  })
  if (played) return []

  return [
    {
      key: 'play:first-baccalaureat',
      kind: 'play',
      title: PERSONAL_TASK_COPY.firstGameTitle,
      context: '',
      icon: 'play',
      href: ROUTES.play,
      description: PERSONAL_TASK_COPY.firstGameDescription,
      guide: null,
      destinationLabel: null,
      dueAt: null,
    },
  ]
}

/**
 * Tasks of the task board held by the member, the ones the system opens excluded
 * @param {string} accountId - Owner
 * @return {Promise<HomeTask[]>} - One task per card still to do
 */

export const boardTasks = async (accountId: string): Promise<HomeTask[]> => {
  const rows = await prisma.task.findMany({
    where: {
      ownerId: accountId,
      // The ones mirroring the timeline already show through it
      NOT: { systemKey: { startsWith: `${accountId}:` } },
      archived: false,
      OR: [{ stateId: null }, { state: { phase: { not: WorkflowPhases.Done } } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      project: { select: { title: true } },
    },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })

  return rows.map((row) => ({
    key: `task:${row.id}`,
    kind: 'task' as const,
    title: row.title,
    context: row.project?.title ?? '',
    icon: 'tasks' as const,
    href: ROUTES.task(row.id),
    description: row.description,
    guide: null,
    destinationLabel: null,
    dueAt: row.dueDate?.toISOString() ?? null,
  }))
}
