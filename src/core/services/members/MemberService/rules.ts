import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { LEGACY_FUNCTION_OF } from '@/declarations/reference/fixed'
import type { FormValues } from '@/types/forms'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'

/**
 * Reject a division move the viewer is not allowed to make
 * @param {FormValues} values - Parsed body
 * @param {boolean} isAdmin - Viewer sits at admin level
 * @param {string | null} [current] - Division the member already sits in
 * @return {Promise<void>} - Throws on a restricted division
 */

export const assertDivisionAssignable = async (
  values: FormValues,
  isAdmin: boolean,
  current: string | null = null
): Promise<void> => {
  const divisionId = readText(values, 'divisionId')

  // Leaving a member where they already are is never a move
  if (isAdmin || !divisionId || divisionId === current) return

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { leadAssignable: true },
  })

  if (!division?.leadAssignable) throw forbidden()
}

// Levels below a Responsable, the only ones a Responsable sees and hands out
export const BELOW_LEAD_ROLES: MemberRoleName[] = [MemberRoles.Moderateur, MemberRoles.Junior]

// Functions only an Admin hands out
export const LEGACY_FUNCTION_NAMES = Object.values(LEGACY_FUNCTION_OF)

/**
 * Who hands out roles
 * @typedef {Object} RoleActor
 * @property {string} id - Member identifier
 * @property {MemberRoleName} role - Held role
 * @property {boolean} isAdmin - Admin level
 * @property {boolean} isSystem - System holder
 */

export interface RoleActor {
  id: string
  role: MemberRoleName
  isAdmin: boolean
  isSystem: boolean
}

/**
 * Reject a role or a Junior Responsable function beyond what the viewer may hand out
 * @param {FormValues} values - Parsed body
 * @param {RoleActor} actor - Who edits
 * @param {string} [currentId] - Member being edited
 * @return {Promise<void>} - Throws on an out-of-reach change
 */

export const assertMemberAssignable = async (
  values: FormValues,
  actor: RoleActor,
  currentId?: string
): Promise<void> => {
  if (actor.isSystem) return

  const current = currentId
    ? await prisma.account.findUnique({
        where: { id: currentId },
        select: { role: true, functions: { select: { functionId: true } } },
      })
    : null

  // A Responsable never touches a peer or a superior
  if (current && !BELOW_LEAD_ROLES.includes(current.role)) throw forbidden()

  const role = (readText(values, 'role') ?? MemberRoles.Moderateur) as MemberRoleName
  if (!BELOW_LEAD_ROLES.includes(role)) throw forbidden()

  const legacy = await prisma.jobFunction.findMany({
    where: { name: { in: LEGACY_FUNCTION_NAMES } },
    select: { id: true },
  })
  const legacyIds = new Set(legacy.map((row) => row.id))
  const held = new Set((current?.functions ?? []).map((row) => row.functionId))
  const asked = [
    ...readList(values, 'primaryFunctionIds'),
    ...readList(values, 'secondaryFunctionIds'),
  ].filter((id) => legacyIds.has(id))

  // Neither a new one nor a removed one
  const added = asked.some((id) => !held.has(id))
  const removed = [...held].some((id) => legacyIds.has(id) && !asked.includes(id))
  if (added || removed) throw forbidden()
}

/**
 * Refuse an identifier another file already holds
 * @param {string} discordId - Identifier to give
 * @param {string} [currentId] - File being edited
 * @return {Promise<void>} - Throws when taken
 */

export const assertIdentifierFree = async (
  discordId: string,
  currentId?: string
): Promise<void> => {
  const holder = await prisma.account.findUnique({
    where: { discordId },
    select: { id: true, status: true },
  })
  if (!holder || holder.id === currentId) return

  // A departed file keeps its identifier until it is deleted
  throw conflict(
    GONE_MEMBER_STATUSES.includes(holder.status)
      ? MEMBER_COPY.identifierHeldByGone
      : MEMBER_COPY.identifierTaken
  )
}
