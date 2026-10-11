import 'server-only'

import { prisma } from '@/core/lib/db'
import { behindDeadlineWhere } from '@/core/lib/work'
import type { PermissionHelpers } from '@/types/auth'
import type { OverdueFlags } from '@/types/work'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Pages holding a late item of a member
 * @param {string} accountId - Account identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<OverdueFlags>} - Late projects, tasks and meetings
 */

export const readOverdueFlags = async (
  accountId: string,
  access: PermissionHelpers
): Promise<OverdueFlags> => {
  // Only what the member is named on counts
  const [project, task, meeting] = await Promise.all([
    access.can(Permissions.ProjectRead)
      ? prisma.project.findFirst({
          where: {
            archived: false,
            AND: [
              behindDeadlineWhere('deadline'),
              {
                OR: [{ leads: { some: { accountId } } }, { assistants: { some: { accountId } } }],
              },
            ],
          },
          select: { id: true },
        })
      : null,
    access.can(Permissions.TaskRead)
      ? prisma.task.findFirst({
          where: { archived: false, ownerId: accountId, ...behindDeadlineWhere('dueDate') },
          select: { id: true },
        })
      : null,
    access.can(Permissions.MeetingRead)
      ? prisma.meeting.findFirst({
          where: { attendees: { some: { accountId } }, ...behindDeadlineWhere('scheduledAt') },
          select: { id: true },
        })
      : null,
  ])

  return { projects: project !== null, tasks: task !== null, meetings: meeting !== null }
}
