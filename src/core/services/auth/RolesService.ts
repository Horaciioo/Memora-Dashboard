import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { FLOOR_ROLE } from '@/declarations/access/roles'
import { isIconName } from '@/declarations/ui/icons'
import { MemberStatuses } from '@/utils/constants/hierarchy'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'
import type { FunctionKindName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

/**
 * Colour and glyph override of a hierarchy level
 * @typedef {Object} RoleAppearanceView
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 */

export interface RoleAppearanceView {
  accent: string | null
  icon: string | null
}

/**
 * Account shown in a role or function roster
 * @typedef {Object} AccessMember
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait URL
 * @property {MemberRoleName} role - Hierarchy level
 * @property {string[]} functionIds - Functions held
 */

export interface AccessMember {
  id: string
  displayName: string
  avatarUrl: string | null
  role: MemberRoleName
  functionIds: string[]
}

/**
 * Creator with the functions it opens
 * @typedef {Object} CreatorPerimeter
 * @property {string} id - Creator identifier
 * @property {string} name - Creator name
 * @property {string | null} handle - Channel handle
 * @property {string | null} accent - Stored colour
 * @property {string | null} avatarUrl - Portrait URL
 * @property {string[]} functionIds - Functions the creator opens
 * @property {number} members - Accounts attached to the creator
 */

export interface CreatorPerimeter {
  id: string
  name: string
  handle: string | null
  accent: string | null
  avatarUrl: string | null
  functionIds: string[]
  members: number
}

/**
 * Draft of a function's identity
 * @typedef {Object} FunctionDraft
 * @property {string} name - Function name
 * @property {AccessCategoryName} category - Rail section of the access console
 * @property {FunctionKindName} kind - Primary or secondary holder slot
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 * @property {string | null} summary - Short description
 */

export interface FunctionDraft {
  name: string
  category: AccessCategoryName
  kind: FunctionKindName
  accent: string | null
  icon: string | null
  summary: string | null
}

/**
 * Keep only a known glyph key
 * @param {string | null | undefined} value - Raw glyph key
 * @return {string | null} - Known key or nothing
 */

const cleanIcon = (value: string | null | undefined): string | null =>
  value && isIconName(value) ? value : null

/**
 * Read the appearance override of every hierarchy level
 * @return {Promise<Partial<Record<MemberRoleName, RoleAppearanceView>>>} - Overrides per level
 */

export const readRoleAppearances = async (): Promise<
  Partial<Record<MemberRoleName, RoleAppearanceView>>
> => {
  const rows = await prisma.roleAppearance.findMany()

  return Object.fromEntries(rows.map((row) => [row.role, { accent: row.accent, icon: row.icon }]))
}

/**
 * Save the appearance override of one hierarchy level
 * @param {MemberRoleName} role - Hierarchy level
 * @param {RoleAppearanceView} patch - New colour and glyph
 * @return {Promise<void>} - Saved
 */

export const saveRoleAppearance = async (
  role: MemberRoleName,
  patch: RoleAppearanceView
): Promise<void> => {
  const data = { accent: patch.accent, icon: cleanIcon(patch.icon) }

  await prisma.roleAppearance.upsert({ where: { role }, update: data, create: { role, ...data } })
}

/**
 * Land a new function
 * @param {FunctionDraft} draft - Function identity
 * @return {Promise<string>} - New identifier
 */

export const createJobFunction = async (draft: FunctionDraft): Promise<string> => {
  const last = await prisma.jobFunction.aggregate({ _max: { position: true } })

  const row = await prisma.jobFunction
    .create({
      data: {
        name: draft.name,
        category: draft.category,
        kind: draft.kind,
        accent: draft.accent,
        icon: cleanIcon(draft.icon),
        summary: draft.summary,
        position: (last._max.position ?? 0) + 1,
      },
    })
    .catch((error: unknown) => {
      // A name already taken by another function
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw conflict()
      }

      throw error
    })

  return row.id
}

/**
 * Edit a function's identity
 * @param {string} id - Function identifier
 * @param {Partial<FunctionDraft>} patch - Fields to change
 * @return {Promise<void>} - Saved
 */

export const updateJobFunction = async (
  id: string,
  patch: Partial<FunctionDraft>
): Promise<void> => {
  const data: Prisma.JobFunctionUpdateInput = {
    name: patch.name,
    category: patch.category,
    kind: patch.kind,
    summary: patch.summary,
  }

  // Colour and glyph are nullable, so an explicit null still writes
  if ('accent' in patch) data.accent = patch.accent
  if ('icon' in patch) data.icon = cleanIcon(patch.icon)

  await prisma.jobFunction.update({ where: { id }, data }).catch((error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw conflict()
    }

    throw error
  })
}

/**
 * Drop a function nobody holds
 * @param {string} id - Function identifier
 * @return {Promise<void>} - Removed
 */

export const deleteJobFunction = async (id: string): Promise<void> => {
  const row = await prisma.jobFunction.findUnique({
    where: { id },
    include: { _count: { select: { holders: true } } },
  })

  // A held function keeps its holders consistent, it is archived rather than deleted
  if (row && row._count.holders > 0) throw conflict()

  await prisma.jobFunction.delete({ where: { id } })
}

/**
 * Read the roster feeding the members tab
 * @return {Promise<AccessMember[]>} - Active accounts, by name
 */

export const readAccessRoster = async (): Promise<AccessMember[]> => {
  const rows = await prisma.account.findMany({
    where: { status: { not: MemberStatuses.Left } },
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      functions: { select: { functionId: true } },
    },
  })

  return rows.map(({ functions, ...row }) => ({
    ...row,
    functionIds: functions.map((held) => held.functionId),
  }))
}

/**
 * Read every creator with the functions it opens
 * @return {Promise<CreatorPerimeter[]>} - Creators, in display order
 */

export const readCreatorPerimeter = async (): Promise<CreatorPerimeter[]> => {
  const rows = await prisma.youtuber.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
    include: {
      functions: { select: { functionId: true }, orderBy: { position: 'asc' } },
      _count: { select: { accounts: true } },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    handle: row.handle,
    accent: row.accent,
    avatarUrl: row.avatarUrl,
    functionIds: row.functions.map((seat) => seat.functionId),
    members: row._count.accounts,
  }))
}

/**
 * Fallback holder slot when a raw value is not a function kind
 * @param {string} value - Raw kind
 * @return {FunctionKindName} - Known kind
 */

export const readKind = (value: string): FunctionKindName =>
  value === FunctionKinds.Secondary ? value : FunctionKinds.Primary

/**
 * Move a set of accounts onto one hierarchy level
 * @param {string[]} accountIds - Accounts to move
 * @param {MemberRoleName} role - Hierarchy level
 * @return {Promise<void>} - Moved
 */

export const assignRoleMembers = async (
  accountIds: string[],
  role: MemberRoleName
): Promise<void> => {
  await prisma.account.updateMany({ where: { id: { in: accountIds } }, data: { role } })
}

/**
 * Seat a set of accounts on one function, on top of the ones they already hold
 * @param {string[]} accountIds - Accounts to seat
 * @param {string} functionId - Function identifier
 * @return {Promise<void>} - Seated
 */

export const assignFunctionMembers = async (
  accountIds: string[],
  functionId: string
): Promise<void> => {
  await prisma.accountFunction.createMany({
    data: accountIds.map((accountId) => ({ accountId, functionId })),
    skipDuplicates: true,
  })
}

/**
 * Take one account off a role or function, a role falling back to the floor level
 * @param {string} accountId - Account identifier
 * @param {string | null} functionId - Function to clear, null clearing the role instead
 * @return {Promise<void>} - Removed
 */

export const removeAccessMember = async (
  accountId: string,
  functionId: string | null
): Promise<void> => {
  if (functionId === null) {
    await prisma.account.update({ where: { id: accountId }, data: { role: FLOOR_ROLE } })

    return
  }

  const account = await prisma.account.findUnique({ where: { id: accountId } })
  if (!account) throw notFound()

  await prisma.accountFunction.deleteMany({ where: { accountId, functionId } })
}
