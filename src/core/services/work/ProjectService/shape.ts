import 'server-only'
import { isBehindDeadline } from '@/core/lib/work'
import {
  AUTHORSHIP_INCLUDE,
  toAuthorship,
  toCreatorTags,
  toPerson,
  toTag,
  YOUTUBERS_INCLUDE,
} from '@/core/services/work/shared'
import { PROJECT_COPY } from '@/declarations/work/copy'
import type { ProjectSummary } from '@/types/work'
import type { Prisma } from '@prisma/client'

// Relations every project card needs
export const PROJECT_INCLUDE = {
  state: true,
  priority: true,
  platform: true,
  youtubers: YOUTUBERS_INCLUDE,
  leads: { include: { account: true } },
  assistants: { include: { account: true } },
  _count: { select: { communications: true, tasks: true, meetings: true } },
  ...AUTHORSHIP_INCLUDE,
} satisfies Prisma.ProjectInclude

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>

/**
 * Map a project row to its card shape
 * @param {ProjectRow} row - Project row with its references
 * @return {ProjectSummary} - Board card
 */

export const toSummary = (row: ProjectRow): ProjectSummary => ({
  ...toAuthorship(row),
  id: row.id,
  title: row.title,
  emoji: row.emoji,
  description: row.description,
  columnId: row.stateId,
  state: toTag(row.state),
  priority: toTag(row.priority),
  platform: toTag(row.platform),
  youtubers: toCreatorTags(row.youtubers),
  leads: row.leads.map((lead) => toPerson(lead.account)).filter((person) => person !== null),
  assistants: row.assistants
    .map((assistant) => toPerson(assistant.account))
    .filter((person) => person !== null),
  deadline: row.deadline?.toISOString() ?? null,
  isSystem: row.systemKey !== null,
  isSeries: row.systemKey?.startsWith('annual-reviews:') ?? false,
  isOverdue: isBehindDeadline(row.deadline, row.state?.phase),
  position: row.position,
  communicationCount: row._count.communications,
  taskCount: row._count.tasks,
  meetingCount: row._count.meetings,
  values: {
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    youtuberIds: row.youtubers.map((youtuber) => youtuber.id),
    stateId: row.stateId,
    priorityId: row.priorityId,
    platformId: row.platformId,
    leadIds: row.leads.map((lead) => lead.accountId),
    assistantIds: row.assistants.map((assistant) => assistant.accountId),
    deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : null,
  },
})

/**
 * Copy of the project surfaces
 * @type {typeof PROJECT_COPY}
 */

export const PROJECT_MESSAGES = PROJECT_COPY
