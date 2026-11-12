import 'server-only'

import { prisma } from '@/core/lib/db'
import { forbidden, immutable, invalidInput, notFound } from '@/core/lib/errors'
import { diffSnapshots, hasChanged } from '@/core/lib/unban/formDiff'
import { parseDraftSnapshot, readStoredSnapshot } from '@/core/lib/unban/formSnapshot'
import { recordEvent } from '@/core/services/system/ActivityService'
import { UNBAN_COPY, UNBAN_FORM_COPY } from '@/declarations/unban/copy'
import { UNBAN_SEED_FORM } from '@/declarations/unban/seed'
import { Permissions } from '@/utils/constants/permissions'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'
import type { PermissionHelpers } from '@/types/auth'
import type { UnbanFormVersionView } from '@/types/unban'
import type { Prisma, UnbanFormVersion } from '@prisma/client'

// First published version
const FIRST_VERSION = 1

/**
 * Stored version ready for display
 * @param {UnbanFormVersion} row - Stored version
 * @return {UnbanFormVersionView} - Version view
 */

const toView = (row: UnbanFormVersion): UnbanFormVersionView => ({
  id: row.id,
  number: row.number,
  snapshot: readStoredSnapshot(row.fields),
  publishedAt: row.publishedAt?.toISOString() ?? null,
})

/**
 * Refuse anyone who cannot edit the form
 * @param {PermissionHelpers} access - Caller rights
 * @return {void}
 */

const assertManager = (access: PermissionHelpers): void => {
  if (!access.can(Permissions.UnbanManage)) throw forbidden()
}

/**
 * Highest published version number
 * @param {Pick<Prisma.TransactionClient, 'unbanFormVersion'>} tx - Client or transaction
 * @return {Promise<number>} - Highest number
 */

const lastNumber = async (
  tx: Pick<Prisma.TransactionClient, 'unbanFormVersion'>
): Promise<number> => {
  const last = await tx.unbanFormVersion.aggregate({
    where: { publishedAt: { not: null } },
    _max: { number: true },
  })

  return last._max.number ?? 0
}

/**
 * Latest published row, the seed when none exists
 * @return {Promise<UnbanFormVersion>} - Active row
 */

const ensureActive = async (): Promise<UnbanFormVersion> => {
  const active = await prisma.unbanFormVersion.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { number: 'desc' },
  })
  if (active) return active

  // Idempotent by number
  const fields = UNBAN_SEED_FORM as unknown as Prisma.InputJsonValue

  return prisma.unbanFormVersion.upsert({
    where: { number: FIRST_VERSION },
    update: {},
    create: { number: FIRST_VERSION, fields, publishedAt: new Date() },
  })
}

/**
 * Form served to new requests
 * @return {Promise<UnbanFormVersionView>} - Active version
 */

export const readActive = async (): Promise<UnbanFormVersionView> => toView(await ensureActive())

/**
 * Any version, whatever its age
 * @param {string} id - Version identifier
 * @return {Promise<UnbanFormVersionView>} - Version
 */

export const readVersion = async (id: string): Promise<UnbanFormVersionView> => {
  const row = await prisma.unbanFormVersion.findUnique({ where: { id } })
  if (!row) throw notFound()

  return toView(row)
}

/**
 * Published versions, newest first, for the read-only history
 * @param {PermissionHelpers} access - Caller rights
 * @return {Promise<UnbanFormVersionView[]>} - Published versions
 */

export const listVersions = async (access: PermissionHelpers): Promise<UnbanFormVersionView[]> => {
  assertManager(access)
  const rows = await prisma.unbanFormVersion.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { number: 'desc' },
  })

  return rows.map(toView)
}

/**
 * Unpublished version being edited
 * @param {PermissionHelpers} access - Caller rights
 * @return {Promise<UnbanFormVersionView | null>} - Draft
 */

export const readDraft = async (
  access: PermissionHelpers
): Promise<UnbanFormVersionView | null> => {
  assertManager(access)
  const row = await prisma.unbanFormVersion.findFirst({ where: { publishedAt: null } })

  return row ? toView(row) : null
}

/**
 * Write the draft, born from nothing when absent
 * @param {PermissionHelpers} access - Caller rights
 * @param {unknown} raw - Raw form
 * @return {Promise<UnbanFormVersionView>} - Saved draft
 */

export const saveDraft = async (
  access: PermissionHelpers,
  raw: unknown
): Promise<UnbanFormVersionView> => {
  assertManager(access)
  const snapshot = parseDraftSnapshot(raw)
  const fields = snapshot as unknown as Prisma.InputJsonValue
  await ensureActive()

  // Only a row without publication date may change
  const updated = await prisma.unbanFormVersion.updateMany({
    where: { publishedAt: null },
    data: { fields },
  })
  if (updated.count === 0) {
    const number = (await lastNumber(prisma)) + 1
    await prisma.unbanFormVersion.create({ data: { number, fields } })
  }

  return toView(await prisma.unbanFormVersion.findFirstOrThrow({ where: { publishedAt: null } }))
}

/**
 * Throw away the draft
 * @param {PermissionHelpers} access - Caller rights
 * @return {Promise<void>} - Discarded
 */

export const discardDraft = async (access: PermissionHelpers): Promise<void> => {
  assertManager(access)
  await prisma.unbanFormVersion.deleteMany({ where: { publishedAt: null } })
}

/**
 * Freeze the draft as the next version
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} actorId - Who publishes
 * @return {Promise<{ version: UnbanFormVersion, before: UnbanFormSnapshot }>} - Published row
 */

const freezeDraft = async (
  tx: Prisma.TransactionClient,
  actorId: string
): Promise<{ version: UnbanFormVersion; before: UnbanFormSnapshot }> => {
  const draft = await tx.unbanFormVersion.findFirst({ where: { publishedAt: null } })
  if (!draft) throw invalidInput([{ message: UNBAN_FORM_COPY.noDraft }])

  const active = await tx.unbanFormVersion.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { number: 'desc' },
  })
  const before = active ? readStoredSnapshot(active.fields) : { questions: [] }
  if (!hasChanged(before, readStoredSnapshot(draft.fields))) {
    throw invalidInput([{ message: UNBAN_FORM_COPY.nothingChanged }])
  }

  const frozen = await tx.unbanFormVersion.updateMany({
    where: { id: draft.id, publishedAt: null },
    data: { number: (await lastNumber(tx)) + 1, publishedAt: new Date(), publishedById: actorId },
  })
  if (frozen.count === 0) throw immutable()

  return {
    version: await tx.unbanFormVersion.findUniqueOrThrow({ where: { id: draft.id } }),
    before,
  }
}

/**
 * Publish the draft and journal what changed
 * @param {PermissionHelpers} access - Caller rights
 * @param {string} actorId - Who publishes
 * @return {Promise<UnbanFormVersionView>} - New active version
 */

export const publishDraft = async (
  access: PermissionHelpers,
  actorId: string
): Promise<UnbanFormVersionView> => {
  assertManager(access)
  await ensureActive()
  const { version, before } = await prisma.$transaction((tx) => freezeDraft(tx, actorId))
  const view = toView(version)

  await recordEvent({
    eventType: 'UnbanFormPublished',
    actorId,
    targetType: 'unbanForm',
    targetId: version.id,
    summary: UNBAN_COPY.formVersion.replace('{number}', String(version.number)),
    payload: { ...diffSnapshots(before, view.snapshot) },
  })

  return view
}
