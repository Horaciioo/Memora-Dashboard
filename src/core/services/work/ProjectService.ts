import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDate, readList, readText } from '@/core/lib/forms/values'
import {
  defaultState,
  memberOptions,
  platformOptions,
  positionAt,
  priorityOptions,
  stateOptions,
  toPerson,
  toTag,
  youtuberOptions,
} from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { PROJECT_COPY, PROJECT_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CommunicationEntry, ProjectDetail, ProjectSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Relations every project card needs
const PROJECT_INCLUDE = {
  state: true,
  priority: true,
  platform: true,
  youtuber: true,
  lead: true,
  assistants: { include: { account: true } },
  _count: { select: { communications: true, tasks: true, meetings: true } },
} satisfies Prisma.ProjectInclude

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>

/**
 * Map a project row to its card shape
 * @param {ProjectRow} row - Project row with its references
 * @return {ProjectSummary} - Board card
 */

const toSummary = (row: ProjectRow): ProjectSummary => ({
  id: row.id,
  title: row.title,
  description: row.description,
  columnId: row.stateId,
  state: toTag(row.state),
  priority: toTag(row.priority),
  platform: toTag(row.platform),
  youtuber: toTag(row.youtuber),
  lead: toPerson(row.lead),
  assistants: row.assistants
    .map((assistant) => toPerson(assistant.account))
    .filter((person) => person !== null),
  deadline: row.deadline?.toISOString() ?? null,
  position: row.position,
  communicationCount: row._count.communications,
  taskCount: row._count.tasks,
  meetingCount: row._count.meetings,
  values: {
    title: row.title,
    description: row.description,
    youtuberId: row.youtuberId,
    stateId: row.stateId,
    priorityId: row.priorityId,
    platformId: row.platformId,
    leadId: row.leadId,
    assistantIds: row.assistants.map((assistant) => assistant.accountId),
    deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : null,
  },
})

/**
 * Build the project form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const projectFields = async (): Promise<FieldDefinition[]> => {
  const [states, priorities, platforms, youtubers, members] = await Promise.all([
    stateOptions(WorkflowScopes.Project),
    priorityOptions(),
    platformOptions(),
    youtuberOptions(),
    memberOptions(),
  ])

  return [
    {
      name: 'title',
      kind: 'text',
      label: PROJECT_FIELD_COPY.title,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'textarea',
      label: PROJECT_FIELD_COPY.description,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'leadId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.lead,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.assistants,
      placeholder: PROJECT_FIELD_COPY.assistantsEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.state,
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'priorityId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.priority,
      options: priorities,
      mark: 'priority',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'platformId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.platform,
      options: platforms,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'deadline',
      kind: 'date',
      label: PROJECT_FIELD_COPY.deadline,
      span: 'half',
      group: FORM_GROUPS.details,
    },
  ]
}

/**
 * Read every project
 * @return {Promise<ProjectSummary[]>} - Board cards
 */

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const rows = await prisma.project.findMany({
    where: { archived: false },
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
  description: readText(values, 'description'),
  youtuberId: readText(values, 'youtuberId'),
  stateId: readText(values, 'stateId'),
  priorityId: readText(values, 'priorityId'),
  platformId: readText(values, 'platformId'),
  leadId: readText(values, 'leadId'),
  deadline: readDate(values, 'deadline'),
})

/**
 * Open a project
 * @param {FormValues} values - Parsed body
 * @return {Promise<ProjectSummary>} - Created card
 */

export const createProject = async (values: FormValues): Promise<ProjectSummary> => {
  const data = toProjectData(values)
  const stateId = data.stateId ?? (await defaultState(WorkflowScopes.Project))
  const assistantIds = readList(values, 'assistantIds')

  // A new card lands at the bottom of its column
  const last = await prisma.project.aggregate({ where: { stateId }, _max: { position: true } })

  const row = await prisma.project.create({
    data: {
      ...data,
      stateId,
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
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
 * @return {Promise<ProjectSummary>} - Updated card
 */

export const updateProject = async (id: string, values: FormValues): Promise<ProjectSummary> => {
  const assistantIds = readList(values, 'assistantIds')

  // Assistants are replaced wholesale, the form always sends the full list
  const row = await prisma.project.update({
    where: { id },
    data: {
      ...toProjectData(values),
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
 * @return {Promise<void>} - Removed
 */

export const removeProject = async (id: string): Promise<void> => {
  await prisma.project.delete({ where: { id } })
}

/**
 * Move a project card
 * @param {string} id - Project identifier
 * @param {string} stateId - Target column
 * @param {number} index - Drop index
 * @return {Promise<ProjectSummary>} - Moved card
 */

export const moveProject = async (
  id: string,
  stateId: string,
  index: number
): Promise<ProjectSummary> => {
  const cards = await prisma.project.findMany({
    where: { stateId, archived: false, id: { not: id } },
    select: { id: true, position: true },
    orderBy: { position: 'asc' },
  })

  const row = await prisma.project.update({
    where: { id },
    data: { stateId, position: positionAt(cards, index) },
    include: PROJECT_INCLUDE,
  })

  return toSummary(row)
}

/**
 * Map a communication row to its display shape
 * @param {Prisma.CommunicationGetPayload<{ include: { author: true, platform: true } }>} row - Communication row
 * @return {CommunicationEntry} - Announcement
 */

const toCommunication = (
  row: Prisma.CommunicationGetPayload<{ include: { author: true; platform: true } }>
): CommunicationEntry => ({
  id: row.id,
  title: row.title,
  body: row.body,
  platform: toTag(row.platform),
  authorName: row.author?.displayName ?? null,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  values: {
    title: row.title,
    body: row.body,
    platformId: row.platformId,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().slice(0, 10) : null,
  },
})

/**
 * Build the announcement form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const communicationFields = async (): Promise<FieldDefinition[]> => {
  const platforms = await platformOptions()

  return [
    {
      name: 'title',
      kind: 'text',
      label: PROJECT_FIELD_COPY.communicationTitle,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      span: 'half',
    },
    {
      name: 'platformId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.communicationPlatform,
      options: platforms,
      span: 'half',
    },
    {
      name: 'publishedAt',
      kind: 'date',
      label: PROJECT_FIELD_COPY.publishedAt,
      span: 'half',
    },
    {
      name: 'body',
      kind: 'markdown',
      label: PROJECT_FIELD_COPY.communicationBody,
      maxLength: FORM_SETTINGS.markdownMaxLength,
    },
  ]
}

/**
 * Write an announcement on a project
 * @param {string} projectId - Project identifier
 * @param {string} authorId - Author identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<CommunicationEntry>} - Created announcement
 */

export const addCommunication = async (
  projectId: string,
  authorId: string,
  values: FormValues
): Promise<CommunicationEntry> => {
  // Announcements keep their own order inside the project
  const last = await prisma.communication.aggregate({
    where: { projectId },
    _max: { position: true },
  })

  const row = await prisma.communication.create({
    data: {
      projectId,
      authorId,
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body') ?? '',
      platformId: readText(values, 'platformId'),
      publishedAt: readDate(values, 'publishedAt'),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
    },
    include: { author: true, platform: true },
  })

  return toCommunication(row)
}

/**
 * Edit an announcement
 * @param {string} id - Announcement identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<CommunicationEntry>} - Updated announcement
 */

export const updateCommunication = async (
  id: string,
  values: FormValues
): Promise<CommunicationEntry> => {
  const row = await prisma.communication.update({
    where: { id },
    data: {
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body') ?? '',
      platformId: readText(values, 'platformId'),
      publishedAt: readDate(values, 'publishedAt'),
    },
    include: { author: true, platform: true },
  })

  return toCommunication(row)
}

/**
 * Drop an announcement
 * @param {string} id - Announcement identifier
 * @return {Promise<void>} - Removed
 */

export const removeCommunication = async (id: string): Promise<void> => {
  await prisma.communication.delete({ where: { id } })
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
      include: { state: true, priority: true, youtuber: true, owner: true, project: true },
      orderBy: [{ position: 'asc' }],
    }),
    prisma.meeting.findMany({
      where: { projectId: id },
      include: {
        state: true,
        youtuber: true,
        project: true,
        attendees: { include: { account: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    }),
  ])

  return {
    summary: toSummary(row),
    communications: communications.map(toCommunication),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      columnId: task.stateId,
      state: toTag(task.state),
      priority: toTag(task.priority),
      youtuber: toTag(task.youtuber),
      project: task.project
        ? { id: task.project.id, label: task.project.title, accent: null }
        : null,
      owner: toPerson(task.owner),
      dueDate: task.dueDate?.toISOString() ?? null,
      position: task.position,
      values: {},
    })),
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      agenda: meeting.agenda,
      minutes: meeting.minutes,
      columnId: meeting.stateId,
      state: toTag(meeting.state),
      youtuber: toTag(meeting.youtuber),
      project: meeting.project
        ? { id: meeting.project.id, label: meeting.project.title, accent: null }
        : null,
      scheduledAt: meeting.scheduledAt.toISOString(),
      durationMin: meeting.durationMin,
      leads: [],
      assistants: [],
      participants: meeting.attendees
        .map((attendee) => toPerson(attendee.account))
        .filter((person) => person !== null),
      position: meeting.position,
      values: {},
    })),
  }
}

/**
 * Copy of the project surfaces, re-exported for the routes
 * @type {typeof PROJECT_COPY}
 */

export const PROJECT_MESSAGES = PROJECT_COPY
