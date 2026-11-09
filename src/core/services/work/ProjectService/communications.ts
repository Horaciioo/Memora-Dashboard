import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDate, readText } from '@/core/lib/forms/values'
import { memberOptions, platformOptions, toTag } from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import {
  COMMUNICATION_STATUS_OPTIONS,
  COMMUNICATION_STATUSES,
} from '@/declarations/work/announcements'
import { PROJECT_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'
import type { CommunicationEntry } from '@/types/work'
import type { CommunicationStatus, Prisma } from '@prisma/client'

/**
 * Map a communication row to its display shape
 * @param {Prisma.CommunicationGetPayload<{ include: { author: true, platform: true } }>} row - Communication row
 * @return {CommunicationEntry} - Announcement
 */

export const toCommunication = (
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
