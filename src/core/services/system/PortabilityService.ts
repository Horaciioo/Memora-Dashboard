import 'server-only'

import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { isEncryptedField } from '@/declarations/system/encryption'
import { DATA_CONTROLLER, PROCESSING_REGISTRY } from '@/declarations/system/privacy'

/**
 * Everything the application holds about one member
 * @typedef {Object} PersonalExport
 * @property {string} generatedAt - ISO stamp
 * @property {{ name: string, contact: string }} controller - Who answers for the processing
 * @property {Record<string, unknown>} identity - Account record
 * @property {Record<string, unknown[]>} records - Everything attached to the account
 * @property {Record<string, string>} retention - How long each family is kept
 */

export interface PersonalExport {
  generatedAt: string
  controller: { name: string; contact: string }
  identity: Record<string, unknown>
  records: Record<string, unknown[]>
  retention: Record<string, string>
}

/**
 * Every relation of an account, so the export never misses a table by omission
 * @type {Record<string, (accountId: string) => Promise<unknown[]>>}
 */

const PERSONAL_RECORD_READERS = {
  socialLinks: (id: string) => prisma.socialLink.findMany({ where: { accountId: id } }),
  absences: (id: string) => prisma.absence.findMany({ where: { accountId: id } }),
  notesReceived: (id: string) => prisma.accountNote.findMany({ where: { accountId: id } }),
  notesWritten: (id: string) => prisma.accountNote.findMany({ where: { authorId: id } }),
  teamMemberships: (id: string) =>
    prisma.teamMember.findMany({ where: { accountId: id }, include: { team: true } }),
  ownedTasks: (id: string) => prisma.task.findMany({ where: { ownerId: id } }),
  meetingSeats: (id: string) => prisma.meetingAttendee.findMany({ where: { accountId: id } }),
  eventAttendances: (id: string) =>
    prisma.eventAttendance.findMany({ where: { accountId: id }, include: { event: true } }),
  academyJuniors: (id: string) => prisma.academyJunior.findMany({ where: { accountId: id } }),
  juniorNotes: (id: string) => prisma.juniorNote.findMany({ where: { junior: { accountId: id } } }),
  juniorSkills: (id: string) =>
    prisma.juniorSkill.findMany({ where: { junior: { accountId: id } } }),
  juniorObjectives: (id: string) =>
    prisma.juniorObjective.findMany({ where: { junior: { accountId: id } } }),
  academyReviews: (id: string) =>
    prisma.academyReview.findMany({ where: { junior: { accountId: id } } }),
  trainingRecords: (id: string) => prisma.trainingRecord.findMany({ where: { accountId: id } }),
  quizAnswers: (id: string) => prisma.juniorAnswer.findMany({ where: { accountId: id } }),
  notifications: (id: string) => prisma.notification.findMany({ where: { recipientId: id } }),
  activity: (id: string) =>
    prisma.activityLog.findMany({ where: { OR: [{ subjectId: id }, { actorId: id }] } }),
  sessions: (id: string) =>
    prisma.session.findMany({
      where: { accountId: id },
      // The token itself is a credential, it never leaves the server
      select: { id: true, userAgent: true, address: true, createdAt: true, expiresAt: true },
    }),
  permissionOverrides: (id: string) =>
    prisma.accountPermission.findMany({ where: { accountId: id } }),
}

/**
 * Bring every stored ciphertext back to clear, so the dossier is readable by
 * the person it belongs to rather than by the database
 * @param {unknown} value - Row or list of rows
 * @return {unknown} - Readable payload
 */

const readable = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(readable)
  if (value === null || typeof value !== 'object' || value instanceof Date) return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([column, entry]) => [
      column,
      isEncryptedField(column) && typeof entry === 'string' ? decryptField(entry) : readable(entry),
    ])
  )
}

/**
 * Read the retention sentence of every processing, straight from the register
 * @return {Record<string, string>} - Retention per purpose
 */

const retentionSummary = (): Record<string, string> =>
  Object.fromEntries(
    PROCESSING_REGISTRY.keys.map((key) => [key, PROCESSING_REGISTRY.get(key).retention])
  )

/**
 * Assemble everything the application holds about one member
 * @param {string} accountId - Account identifier
 * @return {Promise<PersonalExport>} - Portable dossier
 */

export const buildPersonalExport = async (accountId: string): Promise<PersonalExport> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { division: true, youtubers: true, primaryFunction: true, secondaryFunction: true },
  })

  if (!account) throw notFound()

  const entries = Object.entries(PERSONAL_RECORD_READERS)
  const results = await Promise.all(entries.map(([, read]) => read(accountId)))

  return {
    generatedAt: new Date().toISOString(),
    controller: DATA_CONTROLLER,
    identity: readable(account) as Record<string, unknown>,
    records: Object.fromEntries(
      entries.map(([name], index) => [name, readable(results[index] ?? []) as unknown[]])
    ),
    retention: retentionSummary(),
  }
}
