import 'server-only'

import { prisma } from '@/core/lib/db'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { RecapContext, RecapDraft } from '@/types/recap'
import type { Prisma } from '@prisma/client'

// Records the member is close to, each reached the way its page reaches it
const closeTo = (accountId: string): Prisma.WorkCommentWhereInput[] => [
  { task: { is: { ownerId: accountId } } },
  {
    project: {
      is: {
        OR: [{ leads: { some: { accountId } } }, { assistants: { some: { accountId } } }],
      },
    },
  },
  { meeting: { is: { attendees: { some: { accountId } } } } },
  { communication: { is: { authorId: accountId } } },
  { unbanRequest: { is: { assigneeId: accountId } } },
]

interface Place {
  target: NotificationTargetName
  targetId: string
  subject: string
}

type CommentRow = Prisma.WorkCommentGetPayload<{ include: typeof PLACE_INCLUDE }>

const PLACE_INCLUDE = {
  task: { select: { id: true, title: true } },
  project: { select: { id: true, title: true } },
  meeting: { select: { id: true, title: true } },
  unbanRequest: { select: { id: true, reference: true } },
  communication: { select: { project: { select: { id: true, title: true } } } },
} satisfies Prisma.WorkCommentInclude

// Where a remark sits, a communication leading to its project
const placeOf = (row: CommentRow): Place | null => {
  if (row.task) return { target: 'task', targetId: row.task.id, subject: row.task.title }
  if (row.meeting)
    return { target: 'meeting', targetId: row.meeting.id, subject: row.meeting.title }
  if (row.unbanRequest) {
    return {
      target: 'unbanRequest',
      targetId: row.unbanRequest.id,
      subject: row.unbanRequest.reference,
    }
  }

  const project = row.project ?? row.communication?.project

  return project ? { target: 'project', targetId: project.id, subject: project.title } : null
}

/**
 * Remarks left by others on what the member is close to
 * @param {RecapContext} context - Member and window
 * @return {Promise<RecapDraft[]>} - Beats, one per record
 */

export const readCommentBeats = async ({
  accountId,
  since,
  until,
}: RecapContext): Promise<RecapDraft[]> => {
  const rows = await prisma.workComment.findMany({
    where: {
      authorId: { not: accountId },
      createdAt: { gt: since, lte: until },
      OR: closeTo(accountId),
    },
    include: PLACE_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: RECAP_SETTINGS.sourceTake,
  })

  const placed = rows.flatMap((row) => {
    const place = placeOf(row)

    return place ? [{ row, place }] : []
  })

  return [...Map.groupBy(placed, ({ place }) => `${place.target}|${place.targetId}`).values()].map(
    (group) => ({
      beat: 'comments',
      at: group[0].row.createdAt,
      actorIds: [...new Set(group.flatMap(({ row }) => (row.authorId ? [row.authorId] : [])))],
      count: group.length,
      ...group[0].place,
      figures: group.length > 1 ? [{ key: 'comments', count: group.length }] : [],
    })
  )
}
