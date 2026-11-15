import 'server-only'
import { prisma } from '@/core/lib/db'
import { unbanTaskKey } from '@/core/lib/unban/taskKey'
import { readScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { HomeTask } from '@/types/personal'
import { CONTEXT_SEPARATOR } from '@/declarations/personal/groups'
import { Permissions } from '@/utils/constants/permissions'
import { UnbanStatuses } from '@/utils/constants/unban'

const { Pending, InReview } = UnbanStatuses

/**
 * Requests waiting on the member: the free ones of their perimeter, and the ones put in their hands
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - One task per request
 */

export const unbanTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  if (!access.can(Permissions.UnbanHandle)) return []

  const rows = await prisma.unbanRequest.findMany({
    where: scopedWhere('unbanRequest', await readScope(viewer, access), {
      OR: [
        { status: Pending, assigneeId: null },
        { status: { in: [Pending, InReview] }, assigneeId: viewer.id },
      ],
    }),
    select: {
      id: true,
      cycle: true,
      reference: true,
      discordId: true,
      discordName: true,
      youtuber: { select: { name: true } },
    },
    orderBy: { submittedAt: 'asc' },
  })

  return rows.map((row) => ({
    key: unbanTaskKey(row.id, row.cycle),
    kind: 'unbanRequest' as const,
    title: PERSONAL_TASK_COPY.unbanTitle.replace('{name}', row.discordName),
    context: [row.youtuber.name, row.discordId, row.reference].join(CONTEXT_SEPARATOR),
    icon: 'unlock' as const,
    href: ROUTES.unbanRequest(row.id),
    description: PERSONAL_TASK_COPY.unbanDescription,
    guide: null,
    destinationLabel: UNBAN_COPY.title,
    dueAt: null,
  }))
}
