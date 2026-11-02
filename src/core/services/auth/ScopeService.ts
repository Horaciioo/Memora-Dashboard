import 'server-only'

import { cache } from 'react'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readActiveCreator } from '@/core/lib/auth/activeCreator'
import { readLedCreatorIds } from '@/core/services/auth/LeadService'
import { SCOPE_SETTINGS } from '@/declarations/configurations/settings'
import { SCOPE_TARGETS } from '@/declarations/access/scope'
import type { ScopeTarget } from '@/declarations/access/scope'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import { OPEN_LIVE_STATUSES } from '@/utils/constants/lives'

/**
 * Creators a member is allowed to reach
 * @typedef {Object} AccessScope
 * @property {boolean} isGlobal - Sees every creator
 * @property {string[]} youtuberIds - Creators in perimeter
 * @property {string | null} activeYoutuberId - Creator the perimeter is narrowed to
 * @property {string[]} [reinforcedLiveIds] - Open lives the member was called to as reinforcement
 */

export interface AccessScope {
  isGlobal: boolean
  youtuberIds: string[]
  activeYoutuberId: string | null
  reinforcedLiveIds?: string[]
}

// Teams a responsable leads widen their perimeter to the whole creator
const leadPerimeter = cache(async (accountId: string): Promise<string[]> => {
  const teams = await prisma.team.findMany({
    where: { leads: { some: { accountId } }, archived: false },
    select: { youtuberId: true },
  })

  return teams.map((team) => team.youtuberId).filter((id): id is string => id !== null)
})

/**
 * Open lives a member was called to as reinforcement, whatever their creators
 * @param {string} accountId - Member
 * @return {Promise<string[]>} - Live identifiers
 */

const reinforcedLives = async (accountId: string): Promise<string[]> => {
  const rows = await prisma.liveMember.findMany({
    where: { accountId, reinforcement: true, live: { status: { in: [...OPEN_LIVE_STATUSES] } } },
    select: { liveId: true },
  })

  return rows.map((row) => row.liveId)
}

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
  const [base, reinforcedLiveIds] = await Promise.all([
    readBaseScope(viewer, access),
    reinforcedLives(viewer.id),
  ])

  return { ...base, reinforcedLiveIds }
}

/**
 * Creators a member may read, before any reinforcement
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<AccessScope>} - Perimeter
 */

const readBaseScope = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<AccessScope> => {
  const active = await readActiveCreator()

  // An administrator or an employee always stays global
  if (access.isGlobal) return { isGlobal: true, youtuberIds: [], activeYoutuberId: active }

  if (!access.isResponsable) {
    return { isGlobal: false, youtuberIds: viewer.youtuberIds, activeYoutuberId: null }
  }

  const [ledTeams, anchored] = await Promise.all([
    leadPerimeter(viewer.id),
    readLedCreatorIds(viewer.id),
  ])

  const perimeter = [...new Set([...viewer.youtuberIds, ...ledTeams, ...anchored])]

  // Holding several creators
  const narrowed = active !== null && perimeter.includes(active)

  return {
    isGlobal: false,
    youtuberIds: narrowed ? [active] : perimeter,
    activeYoutuberId: narrowed ? active : null,
  }
}

/**
 * Whole perimeter
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<string[]>} - Creators reachable at all
 */

export const readFullPerimeter = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<string[]> => {
  if (!access.isResponsable) return viewer.youtuberIds

  const [ledTeams, anchored] = await Promise.all([
    leadPerimeter(viewer.id),
    readLedCreatorIds(viewer.id),
  ])

  return [...new Set([...viewer.youtuberIds, ...ledTeams, ...anchored])]
}

/**
 * Whole perimeter as a scope, outside any request (sockets)
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<AccessScope>} - Perimeter, never narrowed
 */

export const readFullScope = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<AccessScope> =>
  access.isGlobal
    ? { isGlobal: true, youtuberIds: [], activeYoutuberId: null }
    : {
        isGlobal: false,
        youtuberIds: await readFullPerimeter(viewer, access),
        activeYoutuberId: null,
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
  const kind = SCOPE_TARGETS[target]

  // A global perimeter reads everything
  if (scope.isGlobal) {
    if (scope.activeYoutuberId === null) return base

    const pinned =
      kind === 'relation' || kind === 'shared'
        ? { youtubers: { some: { id: scope.activeYoutuberId } } }
        : { youtuberId: scope.activeYoutuberId }

    return { AND: [base, pinned] } as unknown as T
  }

  const ids = scope.youtuberIds
  const reach = { youtubers: { some: { id: { in: ids } } } }

  // Shared rows may carry no creator at all
  const open = SCOPE_SETTINGS.includeUnassigned
  const filter =
    kind === 'relation'
      ? reach
      : kind === 'shared'
        ? open
          ? { OR: [{ youtubers: { none: {} } }, reach] }
          : reach
        : open && kind === 'direct'
          ? { OR: [{ youtuberId: null }, { youtuberId: { in: ids } }] }
          : { youtuberId: { in: ids } }

  const scoped = { AND: [base, filter] }

  // A live the member was called to reinforce is theirs whatever the creator
  const reinforced = target === 'live' ? (scope.reinforcedLiveIds ?? []) : []
  if (reinforced.length === 0) return scoped as unknown as T

  return {
    OR: [scoped, { AND: [base, { id: { in: reinforced } }] }],
  } as unknown as T
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
 * Guard a write naming several creators
 * @param {AccessScope} scope - Perimeter
 * @param {string[]} youtuberIds - Creators carried by the row
 * @return {void} - Throws when one is out of perimeter
 */

export const assertAllInScope = (scope: AccessScope, youtuberIds: string[]): void => {
  if (scope.isGlobal) return
  if (youtuberIds.length === 0 && SCOPE_SETTINGS.includeUnassigned) return
  if (youtuberIds.length > 0 && youtuberIds.every((id) => scope.youtuberIds.includes(id))) return

  throw notFound()
}

/**
 * Creators a stored row carries
 * @param {string | null | undefined} youtuberId - Single creator column
 * @return {string[]} - Creator identifiers
 */

const single = (youtuberId: string | null | undefined): string[] => (youtuberId ? [youtuberId] : [])

// Creators a shared row carries
const HELD_CREATORS = { youtubers: { select: { id: true } } } as const

// Identifiers of the creators a row carries
const heldBy = (row: { youtubers: { id: string }[] } | null): string[] =>
  row?.youtubers.map((youtuber) => youtuber.id) ?? []

/**
 * Where each scoped model keeps its creators
 * @type {Record<string, (id: string) => Promise<string[]>>}
 */

const SCOPE_LOOKUPS = {
  project: async (id: string) =>
    heldBy(await prisma.project.findUnique({ where: { id }, select: HELD_CREATORS })),
  task: async (id: string) =>
    heldBy(await prisma.task.findUnique({ where: { id }, select: HELD_CREATORS })),
  meeting: async (id: string) =>
    heldBy(await prisma.meeting.findUnique({ where: { id }, select: HELD_CREATORS })),
  team: async (id: string) =>
    single(
      (await prisma.team.findUnique({ where: { id }, select: { youtuberId: true } }))?.youtuberId
    ),
  calendarEvent: async (id: string) =>
    single(
      (await prisma.calendarEvent.findUnique({ where: { id }, select: { youtuberId: true } }))
        ?.youtuberId
    ),
  liveconEntry: async (id: string) =>
    single(
      (await prisma.liveconEntry.findUnique({ where: { id }, select: { youtuberId: true } }))
        ?.youtuberId
    ),
} as const

/**
 * Model whose creator is reachable by identifier
 * @type {keyof typeof SCOPE_LOOKUPS}
 */

export type LookupTarget = keyof typeof SCOPE_LOOKUPS

/**
 * Guard a row addressed by identifier
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

  // One creator in perimeter is enough to reach a shared row
  const creators = await SCOPE_LOOKUPS[target](id)
  if (creators.length === 0) return assertInScope(scope, null)
  if (creators.some((creator) => scope.youtuberIds.includes(creator))) return

  throw notFound()
}

/**
 * Guard a member addressed by identifier
 * @param {string} id - Account identifier
 * @param {AccessScope} scope - Perimeter
 * @param {string} viewerId - Signed-in account
 * @return {Promise<void>} - Throws when out of perimeter
 */

export const assertAccountInScope = async (
  id: string,
  scope: AccessScope,
  viewerId: string
): Promise<void> => {
  // Everyone reaches their own file
  if (scope.isGlobal || id === viewerId) return

  const found = await prisma.account.findFirst({
    where: scopedWhere('account', scope, { id }),
    select: { id: true },
  })
  if (!found) throw notFound()
}

/**
 * Guard a whole selection
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
