import 'server-only'

import { cache } from 'react'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { SCOPE_SETTINGS } from '@/declarations/configurations/settings'
import { SCOPE_TARGETS } from '@/declarations/access/scope'
import type { ScopeTarget } from '@/declarations/access/scope'
import type { PermissionHelpers, SessionUser } from '@/types/auth'

/**
 * Creators a member is allowed to reach
 * @typedef {Object} AccessScope
 * @property {boolean} isGlobal - Sees every creator
 * @property {string[]} youtuberIds - Creators in perimeter
 */

export interface AccessScope {
  isGlobal: boolean
  youtuberIds: string[]
}

// Teams a responsable leads widen their perimeter to the whole creator
const leadPerimeter = cache(async (accountId: string): Promise<string[]> => {
  const teams = await prisma.team.findMany({
    where: { leadId: accountId, archived: false },
    select: { youtuberId: true },
  })

  return teams.map((team) => team.youtuberId).filter((id): id is string => id !== null)
})

/**
 * Resolve the creators a member may read
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<AccessScope>} - Perimeter
 */

export const readScope = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<AccessScope> => {
  if (access.isAdmin) return { isGlobal: true, youtuberIds: [] }
  if (!access.isResponsable) return { isGlobal: false, youtuberIds: viewer.youtuberIds }

  const led = await leadPerimeter(viewer.id)

  return { isGlobal: false, youtuberIds: [...new Set([...viewer.youtuberIds, ...led])] }
}

/**
 * Narrow a query to the creators in perimeter
 * @param {ScopeTarget} target - Scopable model
 * @param {AccessScope} scope - Perimeter
 * @param {T} [where] - Clause the caller already built
 * @return {T} - Composed clause
 */

export const scopedWhere = <T extends object>(
  target: ScopeTarget,
  scope: AccessScope,
  where?: T
): T => {
  const base = where ?? ({} as T)
  if (scope.isGlobal) return base

  const kind = SCOPE_TARGETS[target]
  const ids = scope.youtuberIds
  const filter =
    kind === 'relation'
      ? { youtubers: { some: { id: { in: ids } } } }
      : SCOPE_SETTINGS.includeUnassigned
        ? { OR: [{ youtuberId: null }, { youtuberId: { in: ids } }] }
        : { youtuberId: { in: ids } }

  return { AND: [base, filter] } as unknown as T
}

/**
 * Guard a write against the perimeter
 * @param {AccessScope} scope - Perimeter
 * @param {string | null} youtuberId - Creator carried by the row
 * @return {void} - Throws when out of perimeter
 */

export const assertInScope = (scope: AccessScope, youtuberId: string | null): void => {
  if (scope.isGlobal) return
  if (youtuberId === null && SCOPE_SETTINGS.includeUnassigned) return
  if (youtuberId !== null && scope.youtuberIds.includes(youtuberId)) return

  throw notFound()
}

/**
 * Where each directly scoped model keeps its creator, so no service writes its own lookup
 * @type {Record<string, (id: string) => Promise<{ youtuberId: string | null } | null>>}
 */

const SCOPE_LOOKUPS = {
  project: (id: string) =>
    prisma.project.findUnique({ where: { id }, select: { youtuberId: true } }),
  task: (id: string) => prisma.task.findUnique({ where: { id }, select: { youtuberId: true } }),
  meeting: (id: string) =>
    prisma.meeting.findUnique({ where: { id }, select: { youtuberId: true } }),
  team: (id: string) => prisma.team.findUnique({ where: { id }, select: { youtuberId: true } }),
  calendarEvent: (id: string) =>
    prisma.calendarEvent.findUnique({ where: { id }, select: { youtuberId: true } }),
  liveconEntry: (id: string) =>
    prisma.liveconEntry.findUnique({ where: { id }, select: { youtuberId: true } }),
} as const

/**
 * Model whose creator is reachable by identifier
 * @type {keyof typeof SCOPE_LOOKUPS}
 */

export type LookupTarget = keyof typeof SCOPE_LOOKUPS

/**
 * Guard a row addressed by identifier, the read filter never covering a write
 * @param {LookupTarget} target - Scopable model
 * @param {string} id - Row identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Throws when out of perimeter
 */

export const assertRowInScope = async (
  target: LookupTarget,
  id: string,
  scope: AccessScope
): Promise<void> => {
  if (scope.isGlobal) return

  const row = await SCOPE_LOOKUPS[target](id)
  assertInScope(scope, row?.youtuberId ?? null)
}

/**
 * Guard a whole selection, every row of it passing the single-row guard
 * @param {LookupTarget} target - Scopable model
 * @param {string[]} ids - Row identifiers
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Throws on the first row out of perimeter
 */

export const assertRowsInScope = async (
  target: LookupTarget,
  ids: string[],
  scope: AccessScope
): Promise<void> => {
  if (scope.isGlobal) return

  await Promise.all(ids.map((id) => assertRowInScope(target, id, scope)))
}
