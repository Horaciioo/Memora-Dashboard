import 'server-only'
import { prisma } from '@/core/lib/db'
import { assertAllInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { MEETING_INCLUDE, toMeetingSummary } from '@/core/services/work/MeetingService'
import { TASK_INCLUDE, toTaskSummary } from '@/core/services/work/TaskService'
import { projectVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { forbidden, notFound } from '@/core/lib/errors'
import { readDate, readList, readText } from '@/core/lib/forms/values'
import { emojiOrRandom } from '@/core/lib/work'
import {
  creatorLinks,
  defaultState,
  keptCreatorIds,
  positionAt,
  readCreatorIds,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FormValues } from '@/types/forms'
import type { ProjectDetail, ProjectSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { PROJECT_INCLUDE, toSummary } from '@/core/services/work/ProjectService/shape'
import { toCommunication } from '@/core/services/work/ProjectService/communications'

/**
 * Read every project
 * @param {AccessScope} scope - Creator perimeter
 * @param {WorkViewer} viewer - Who reads
 * @return {Promise<ProjectSummary[]>} - Board cards
 */

export const listProjects = async (
  scope: AccessScope,
  viewer: WorkViewer
): Promise<ProjectSummary[]> => {
  const rows = await prisma.project.findMany({
    where: { AND: [scopedWhere('project', scope, { archived: false }), projectVisibility(viewer)] },
    include: PROJECT_INCLUDE,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(toSummary)
}

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.ProjectUncheckedUpdateInput} - Database payload
 */

const toProjectData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  emoji: readText(values, 'emoji'),
  description: readText(values, 'description'),
  stateId: readText(values, 'stateId'),
  priorityId: readText(values, 'priorityId'),
  platformId: readText(values, 'platformId'),
  deadline: readDate(values, 'deadline'),
})

/**
 * Read the picked responsables
 * @param {FormValues} values - Parsed body
 * @return {string[]} - Account identifiers
 */

const readLeadIds = (values: FormValues): string[] => readList(values, 'leadIds')

/**
 * Open a project
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who opened it
 * @return {Promise<ProjectSummary>} - Created card
 */

export const createProject = async (
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<ProjectSummary> => {
  const data = toProjectData(values)
  const youtuberIds = readCreatorIds(values)
  assertAllInScope(scope, youtuberIds)
  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Project))
  const leadIds = readLeadIds(values)
  const assistantIds = readList(values, 'assistantIds')

  // A new card lands at the bottom of its column
  const last = await prisma.project.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.project.create({
    data: {
      ...data,
      emoji: emojiOrRandom(data.emoji),
      stateId,
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
      createdById: actorId,
      updatedById: actorId,
      youtubers: { connect: creatorLinks(youtuberIds) },
      leads: { create: leadIds.map((accountId) => ({ accountId })) },
      assistants: { create: assistantIds.map((accountId) => ({ accountId })) },
    },
    include: PROJECT_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Edit a project
 * @param {string} id - Project identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} actorId - Who edited it
 * @return {Promise<ProjectSummary>} - Updated card
 */

export const updateProject = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  actorId: string
): Promise<ProjectSummary> => {
  await assertRowInScope('project', id, scope)

  const picked = readCreatorIds(values)
  assertAllInScope(scope, picked)

  const stored = await prisma.project.findUnique({
    where: { id },
    select: { youtubers: { select: { id: true } } },
  })
  const leadIds = readLeadIds(values)
  const assistantIds = readList(values, 'assistantIds')

  // The team is replaced wholesale
  const row = await prisma.project.update({
    where: { id },
    data: {
      ...toProjectData(values),
      updatedById: actorId,
      youtubers: {
        set: creatorLinks(
          keptCreatorIds(
            picked,
            scope,
            stored?.youtubers.map((youtuber) => youtuber.id)
          )
        ),
      },
      leads: {
        deleteMany: {},
        create: leadIds.map((accountId) => ({ accountId })),
      },
      assistants: {
        deleteMany: {},
        create: assistantIds.map((accountId) => ({ accountId })),
      },
    },
    include: PROJECT_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Drop a project
 * @param {string} id - Project identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Removed
 */

export const removeProject = async (id: string, scope: AccessScope): Promise<void> => {
  await assertRowInScope('project', id, scope)

  // The system keeps its own project, but a series of annual reviews goes with everything it made
  const row = await prisma.project.findUnique({ where: { id }, select: { systemKey: true } })
  const isSeries = row?.systemKey?.startsWith('annual-reviews:') ?? false
  if (row?.systemKey && !isSeries) throw forbidden()

  if (isSeries) {
    await prisma.calendarEvent.deleteMany({ where: { projectId: id } })
    await prisma.meeting.deleteMany({ where: { projectId: id } })
    await prisma.task.deleteMany({
      where: {
        OR: [
          { systemKey: { startsWith: `annual-slot:${id}:` } },
          { systemKey: { startsWith: `annual-questions:${id}:` } },
          { systemKey: { startsWith: `annual-reminder:${id}:` } },
        ],
      },
    })
  }

  await prisma.project.delete({ where: { id } })
}

/**
 * Move a project card
 * @param {string} id - Project identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @param {string} actorId - Who moved it
 * @return {Promise<ProjectSummary>} - Moved card
 */

export const moveProject = async (
  id: string,
  stateId: string,
  index: number,
  actorId: string
): Promise<ProjectSummary> => {
  const cards = await prisma.project.findMany({
    where: { stateId, archived: false, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.project.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index), updatedById: actorId },
    include: PROJECT_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Read one project file
 * @param {string} id - Project identifier
 * @return {Promise<ProjectDetail>} - Full file
 */

export const readProject = async (id: string): Promise<ProjectDetail> => {
  const row = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE })
  if (!row) throw notFound()

  const [communications, tasks, meetings] = await Promise.all([
    prisma.communication.findMany({
      where: { projectId: id },
      include: { author: true, platform: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.findMany({
      where: { projectId: id },
      include: TASK_INCLUDE,
      orderBy: [{ position: 'asc' }],
    }),
    prisma.meeting.findMany({
      where: { projectId: id },
      include: MEETING_INCLUDE,
      orderBy: { scheduledAt: 'desc' },
    }),
  ])

  return {
    summary: toSummary(row),
    communications: communications.map(toCommunication),
    tasks: tasks.map(toTaskSummary),
    meetings: meetings.map(toMeetingSummary),
  }
}
