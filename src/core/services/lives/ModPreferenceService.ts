import 'server-only'

import { prisma } from '@/core/lib/db'
import { sanitizePreferences } from '@/core/lib/modview/preferences'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { channelOf } from '@/core/services/lives/ViewerCommentService'
import type { ModPreferences, StoredPreferences } from '@/types/modview'

// Row of the account itself
const ACCOUNT_SCOPE = ''

// Row a live writes to
const scopeOf = async (liveId: string | null, scope: AccessScope): Promise<string> =>
  liveId ? (await channelOf(liveId, scope)).youtuberId : ACCOUNT_SCOPE

/**
 * Preferences of a moderator
 * @param {string} accountId - Moderator
 * @param {string | null} liveId - Live whose channel profile applies
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<StoredPreferences>} - Account then channel values
 */

export const readPreferences = async (
  accountId: string,
  liveId: string | null,
  scope: AccessScope
): Promise<StoredPreferences> => {
  const channel = await scopeOf(liveId, scope)
  const rows = await prisma.modViewPreference.findMany({
    where: { accountId },
    select: { scope: true, values: true },
  })
  const valuesOf = (key: string) =>
    sanitizePreferences(rows.find((row) => row.scope === key)?.values)

  return {
    isStored: rows.length > 0,
    values: { ...valuesOf(ACCOUNT_SCOPE), ...valuesOf(channel) },
  }
}

/**
 * Save changed preferences
 * @param {string} accountId - Moderator
 * @param {string | null} liveId - Live whose channel profile receives them
 * @param {AccessScope} scope - Writer perimeter
 * @param {unknown} patch - Untrusted values
 * @return {Promise<Partial<ModPreferences>>} - Values now kept
 */

export const writePreferences = async (
  accountId: string,
  liveId: string | null,
  scope: AccessScope,
  patch: unknown
): Promise<Partial<ModPreferences>> => {
  const key = await scopeOf(liveId, scope)
  const where = { accountId_scope: { accountId, scope: key } }

  // Merge into the row
  const current = await prisma.modViewPreference.findUnique({ where })
  const values = { ...sanitizePreferences(current?.values), ...sanitizePreferences(patch) }
  await prisma.modViewPreference.upsert({
    where,
    create: { accountId, scope: key, values },
    update: { values },
  })

  return values
}
