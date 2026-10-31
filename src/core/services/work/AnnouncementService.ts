import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readRequiredText, readText } from '@/core/lib/forms/values'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { reachableSession } from '@/core/services/recruitment'
import {
  addCommunication,
  communicationData,
  communicationFields,
  communicationOwner,
} from '@/core/services/work/ProjectService'
import { assertProjectVisible, projectVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import { ROUTES } from '@/declarations/navigation'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { ANNOUNCEMENT_COPY, ANNOUNCEMENT_PARAM } from '@/declarations/work/announcements'
import { PROJECT_FIELD_COPY } from '@/declarations/work/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { AnnouncementRow } from '@/types/work'
import type { CommunicationStatus, Prisma } from '@prisma/client'
import { Permissions } from '@/utils/constants/permissions'

const COMMUNICATION_INCLUDE = { author: true, project: true } as const

type CommunicationWithOrigin = Prisma.CommunicationGetPayload<{
  include: typeof COMMUNICATION_INCLUDE
}>

/**
 * Map a communication row to its board card
 * @param {CommunicationWithOrigin} row - Communication row
 * @return {AnnouncementRow} - Board card
 */

const toRow = (row: CommunicationWithOrigin): AnnouncementRow => ({
  id: `${row.projectId ? 'project' : 'free'}:${row.id}`,
  columnId: row.status,
  source: row.projectId ? 'project' : 'free',
  title: row.title,
  status: row.status,
  origin: row.project?.title ?? ANNOUNCEMENT_COPY.free,
  projectId: row.projectId,
  platformId: row.platformId,
  at: (row.publishedAt ?? row.createdAt).toISOString(),
  person: row.author
    ? { id: row.author.id, name: row.author.displayName, src: row.author.avatarUrl }
    : null,
  href: null,
  values: {
    title: row.title,
    body: row.body,
    platformId: row.platformId,
    projectId: row.projectId,
    authorId: row.authorId,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString().slice(0, 10) : null,
  },
})

/**
 * Every announcement written in Memora, newest first
 * @param {WorkViewer} viewer - Who reads
 * @param {PermissionHelpers} access - What the viewer may open
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<AnnouncementRow[]>} - Rows, announcements written here and pointers back to their source
 */

export const listAnnouncements = async (
  viewer: WorkViewer,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<AnnouncementRow[]> => {
  const [communications, departures, sessions] = await Promise.all([
    access.can(Permissions.CommunicationRead)
      ? prisma.communication.findMany({
          // An empty relation filter matches nothing, so an unrestricted viewer skips it
          where: viewer.seesAll
            ? {}
            : { OR: [{ project: { is: projectVisibility(viewer) } }, { projectId: null }] },
          include: COMMUNICATION_INCLUDE,
        })
      : [],
    access.can(Permissions.AcademyManage)
      ? prisma.departureNotice.findMany({
          include: { account: true },
        })
      : [],
    access.can(Permissions.RecruitmentRead)
      ? prisma.recruitmentSession.findMany({
          where: scopedWhere('recruitmentSession', scope, { announcedAt: { not: null } }),
        })
      : [],
  ])

  const rows: AnnouncementRow[] = [
    ...communications.map(toRow),
    ...departures.map((row) => {
      const status: CommunicationStatus = row.publishedAt ? 'PUBLISHED' : 'PLANNED'

      return {
        id: `departure:${row.id}`,
        columnId: status,
        source: 'departure' as const,
        title: `${ANNOUNCEMENT_COPY.departure} - ${row.functionName}`,
        status,
        origin: row.account.displayName,
        projectId: null,
        platformId: null,
        at: (row.publishedAt ?? row.createdAt).toISOString(),
        person: {
          id: row.account.id,
          name: row.account.displayName,
          src: row.account.avatarUrl,
        },
        href: `${ROUTES.member(row.accountId)}?${ANNOUNCEMENT_PARAM}=${row.id}`,
        values: null,
      }
    }),
    ...sessions.map((row) => ({
      id: `recruitment:${row.id}`,
      columnId: 'PUBLISHED',
      source: 'recruitment' as const,
      title: ANNOUNCEMENT_COPY.interviews,
      status: 'PUBLISHED' as const,
      origin: row.name,
      projectId: null,
      platformId: null,
      at: row.announcedAt!.toISOString(),
      person: null,
      href: `${ROUTES.recruitment(row.id)}?${ANNOUNCEMENT_PARAM}=${row.id}`,
      values: null,
    })),
  ]

  return rows.sort((a, b) => b.at.localeCompare(a.at))
}

/**
 * Form of an announcement written from the page, the project becoming optional
 * @param {FieldOption[]} mentions - Members an announcement may mention
 * @param {FieldOption[]} projects - Projects it may be written for
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const announcementFields = async (
  mentions: FieldOption[],
  projects: FieldOption[]
): Promise<FieldDefinition[]> => {
  const fields = await communicationFields(mentions)
  const project: FieldDefinition = {
    name: 'projectId',
    kind: 'select',
    label: PROJECT_FIELD_COPY.communicationProject,
    options: projects,
    span: 'half',
    group: FORM_GROUPS.essentials,
  }

  // Right after the platform
  const at = fields.findIndex((field) => field.name === 'platformId') + 1

  return [...fields.slice(0, at), project, ...fields.slice(at)]
}

/**
 * Refuse an announcement the viewer neither reaches nor wrote
 * @param {string} id - Announcement identifier
 * @param {WorkViewer} viewer - Who writes
 * @return {Promise<void>} - Throws when refused
 */

export const assertWritable = async (id: string, viewer: WorkViewer): Promise<void> => {
  const owner = await communicationOwner(id)
  if (owner.projectId) await assertProjectVisible(owner.projectId, viewer)

  // Others only touch their own
  if (!viewer.seesAll && owner.authorId !== viewer.id) throw forbidden()
}

/**
 * Write an announcement from the page, linked to a project or to nothing
 * @param {string} authorId - Author identifier
 * @param {FormValues} values - Parsed body
 * @param {WorkViewer} viewer - Who writes
 * @return {Promise<AnnouncementRow>} - Created card
 */

export const createAnnouncement = async (
  authorId: string,
  values: FormValues,
  viewer: WorkViewer
): Promise<AnnouncementRow> => {
  const projectId = readText(values, 'projectId')
  if (projectId) await assertProjectVisible(projectId, viewer)

  const created = await addCommunication(projectId, authorId, values)
  const row = await prisma.communication.findUniqueOrThrow({
    where: { id: created.id },
    include: COMMUNICATION_INCLUDE,
  })

  return toRow(row)
}

/**
 * Edit an announcement from the page, moving it to another project when asked
 * @param {string} id - Announcement identifier
 * @param {FormValues} values - Parsed body
 * @param {WorkViewer} viewer - Who writes
 * @return {Promise<AnnouncementRow>} - Updated card
 */

export const editAnnouncement = async (
  id: string,
  values: FormValues,
  viewer: WorkViewer
): Promise<AnnouncementRow> => {
  const projectId = readText(values, 'projectId')
  if (projectId) await assertProjectVisible(projectId, viewer)

  const row = await prisma.communication.update({
    where: { id },
    data: { ...communicationData(values), projectId, authorId: readText(values, 'authorId') },
    include: COMMUNICATION_INCLUDE,
  })

  return toRow(row)
}

/**
 * Move an announcement to another status
 * @param {string} id - Announcement identifier
 * @param {CommunicationStatus} status - Target status
 * @return {Promise<AnnouncementRow>} - Updated card
 */

export const moveAnnouncement = async (
  id: string,
  status: CommunicationStatus
): Promise<AnnouncementRow> => {
  const current = await prisma.communication.findUnique({
    where: { id },
    select: { publishedAt: true },
  })
  if (!current) throw notFound()

  const row = await prisma.communication.update({
    where: { id },
    data: {
      status,
      // Published today unless it already carries a date
      publishedAt: status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : undefined,
    },
    include: COMMUNICATION_INCLUDE,
  })

  return toRow(row)
}

/**
 * Record the wording announced for the interviews of a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ id: string }>} - Announced session
 */

export const announceSession = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<{ id: string }> => {
  await reachableSession(id, scope)

  await prisma.recruitmentSession.update({
    where: { id },
    data: { announcement: readRequiredText(values, 'announcement'), announcedAt: new Date() },
  })

  return { id }
}
