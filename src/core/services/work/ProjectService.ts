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
import { emojiOrRandom, isBehindDeadline } from '@/core/lib/work'
import {
  AUTHORSHIP_INCLUDE,
  creatorLinks,
  defaultState,
  keptCreatorIds,
  leadOptions,
  memberOptions,
  platformOptions,
  positionAt,
  priorityOptions,
  readCreatorIds,
  stateOptions,
  toAuthorship,
  toCreatorTags,
  toPerson,
  toTag,
  youtuberOptions,
  YOUTUBERS_INCLUDE,
} from '@/core/services/work/shared'
import { EMOJI_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import {
  COMMUNICATION_STATUS_OPTIONS,
  COMMUNICATION_STATUSES,
} from '@/declarations/work/announcements'
import { PROJECT_COPY, PROJECT_FIELD_COPY, PROJECT_FIELD_INFO } from '@/declarations/work/copy'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { CommunicationEntry, ProjectDetail, ProjectSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import type { CommunicationStatus, Prisma } from '@prisma/client'

// Relations every project card needs
const PROJECT_INCLUDE = {
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

const toSummary = (row: ProjectRow): ProjectSummary => ({
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
 * Build the project form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const projectFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [states, priorities, platforms, youtubers, members, leads] = await Promise.all([
    stateOptions(WorkflowScopes.Project),
    priorityOptions(),
    platformOptions(),
    youtuberOptions(scope),
    memberOptions(scope),
    leadOptions(scope),
  ])

  return [
    {
      name: 'emoji',
      kind: 'emoji',
      label: PROJECT_FIELD_COPY.emoji,
      maxLength: EMOJI_SETTINGS.maxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'title',
      kind: 'text',
      label: PROJECT_FIELD_COPY.title,
      info: PROJECT_FIELD_INFO.title,
      required: true,
      glyph: 'emoji',
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'description',
      kind: 'markdown',
      label: PROJECT_FIELD_COPY.description,
      info: PROJECT_FIELD_INFO.description,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.leads,
      info: PROJECT_FIELD_INFO.leads,
      preset: 'actor',
      placeholder: PROJECT_FIELD_COPY.leadsEmpty,
      options: leads,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'assistantIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.assistants,
      info: PROJECT_FIELD_INFO.assistants,
      placeholder: PROJECT_FIELD_COPY.assistantsEmpty,
      options: members,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'youtuberIds',
      kind: 'multiselect',
      label: PROJECT_FIELD_COPY.youtubers,
      info: PROJECT_FIELD_INFO.youtubers,
      placeholder: PROJECT_FIELD_COPY.youtubersEmpty,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
    },
    {
      name: 'stateId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.state,
      info: PROJECT_FIELD_INFO.state,
      preset: 'default',
      options: states,
      mark: 'dot',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'priorityId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.priority,
      info: PROJECT_FIELD_INFO.priority,
      preset: 'default',
      options: priorities,
      mark: 'priority',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'platformId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.platform,
      info: PROJECT_FIELD_INFO.platform,
      options: platforms,
      mark: 'network',
      span: 'half',
      group: FORM_GROUPS.details,
    },
    {
      name: 'deadline',
      kind: 'date',
      label: PROJECT_FIELD_COPY.deadline,
      info: PROJECT_FIELD_INFO.deadline,
      preset: 'today',
      span: 'half',
      group: FORM_GROUPS.details,
    },
  ]
}

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

  // The system keeps its own project
  const row = await prisma.project.findUnique({ where: { id }, select: { systemKey: true } })
  if (row?.systemKey) throw forbidden()

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
  authorAvatar: row.author?.avatarUrl ?? null,
  status: row.status,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  values: {
    title: row.title,
    body: row.body,
    platformId: row.platformId,
    authorId: row.authorId,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().slice(0, 10) : null,
  },
})

/**
 * Build the announcement form declarations
 * @param {FieldOption[]} [mentions] - Members
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const communicationFields = async (
  mentions: FieldOption[] = []
): Promise<FieldDefinition[]> => {
  const [platforms, members] = await Promise.all([platformOptions(), memberOptions()])

  return [
    {
      name: 'title',
      kind: 'text',
      label: PROJECT_FIELD_COPY.communicationTitle,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'platformId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.communicationPlatform,
      options: platforms,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'status',
      kind: 'select',
      label: PROJECT_FIELD_COPY.communicationStatus,
      options: COMMUNICATION_STATUS_OPTIONS,
      required: true,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'authorId',
      kind: 'select',
      label: PROJECT_FIELD_COPY.communicationAuthor,
      options: members,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'publishedAt',
      kind: 'date',
      label: PROJECT_FIELD_COPY.publishedAt,
      span: 'half',
      group: FORM_GROUPS.essentials,
    },
    {
      name: 'body',
      kind: 'announcement',
      label: PROJECT_FIELD_COPY.communicationBody,
      options: mentions,
      maxLength: FORM_SETTINGS.markdownMaxLength,
      group: FORM_GROUPS.message,
    },
  ]
}

/**
 * Fields an announcement form writes, shared by every surface
 * @param {FormValues} values - Parsed body
 * @return {Pick<Prisma.CommunicationUncheckedCreateInput, 'title' | 'body' | 'platformId' | 'status' | 'publishedAt'>} - Row data
 */

export const communicationData = (values: FormValues) => {
  const picked = readText(values, 'status')
  const status: CommunicationStatus =
    picked && picked in COMMUNICATION_STATUSES ? (picked as CommunicationStatus) : 'PLANNED'

  return {
    title: readText(values, 'title') ?? '',
    body: readText(values, 'body') ?? '',
    platformId: readText(values, 'platformId'),
    status,
    // Published today unless a date says otherwise
    publishedAt: readDate(values, 'publishedAt') ?? (status === 'PUBLISHED' ? new Date() : null),
  }
}

/**
 * Write an announcement, on a project or on its own
 * @param {string | null} projectId - Project identifier, null when free
 * @param {string} authorId - Author identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CommunicationEntry>} - Created announcement
 */

export const addCommunication = async (
  projectId: string | null,
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
      authorId: readText(values, 'authorId') ?? authorId,
      ...communicationData(values),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
    },
    include: { author: true, platform: true },
  })

  return toCommunication(row)
}

/**
 * Read who carries a project
 * @param {string} projectId - Project identifier
 * @return {Promise<string[]>} - Account identifiers
 */

export const projectTeam = async (projectId: string): Promise<string[]> => {
  const [leads, assistants] = await Promise.all([
    prisma.projectLead.findMany({ where: { projectId }, select: { accountId: true } }),
    prisma.projectAssistant.findMany({ where: { projectId }, select: { accountId: true } }),
  ])

  return [...leads, ...assistants].map((seat) => seat.accountId)
}

/**
 * Edit an announcement
 * @param {string} id - Announcement identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<CommunicationEntry>} - Updated announcement
 */

export const updateCommunication = async (
  id: string,
  values: FormValues
): Promise<CommunicationEntry> => {
  const row = await prisma.communication.update({
    where: { id },
    data: { ...communicationData(values), authorId: readText(values, 'authorId') },
    include: { author: true, platform: true },
  })

  return toCommunication(row)
}

/**
 * Read who wrote an announcement and where
 * @param {string} id - Announcement identifier
 * @return {Promise<{ projectId: string | null, authorId: string | null }>} - Ownership
 */

export const communicationOwner = async (
  id: string
): Promise<{ projectId: string | null; authorId: string | null }> => {
  const row = await prisma.communication.findUnique({
    where: { id },
    select: { projectId: true, authorId: true },
  })
  if (!row) throw notFound()

  return row
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

/**
 * Copy of the project surfaces
 * @type {typeof PROJECT_COPY}
 */

export const PROJECT_MESSAGES = PROJECT_COPY
