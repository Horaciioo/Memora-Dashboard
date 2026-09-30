import { FunctionKinds } from '@/utils/constants/workflow'
import type { MemberFunction } from '@/types/members'
import type { JobFunction } from '@prisma/client'

// Held functions with their reference row, the include every reader shares
export const HELD_FUNCTIONS = {
  functions: { include: { jobFunction: true } },
} as const

/**
 * Compare two functions down the hierarchy, principal ones first, then by rank
 * @param {Object} left - First function
 * @param {Object} right - Second function
 * @return {number} - Sort order
 */

export const byHierarchy = (
  left: { kind: string; position: number },
  right: { kind: string; position: number }
): number =>
  Number(left.kind === FunctionKinds.Secondary) - Number(right.kind === FunctionKinds.Secondary) ||
  left.position - right.position

/**
 * Order held functions down the hierarchy
 * @param {Array<{ jobFunction: JobFunction }>} rows - Held function rows
 * @return {MemberFunction[]} - Functions in display order
 */

export const toMemberFunctions = (rows: { jobFunction: JobFunction }[]): MemberFunction[] =>
  rows
    .map((row) => row.jobFunction)
    .sort(byHierarchy)
    .map((row) => ({ id: row.id, label: row.name, kind: row.kind, icon: row.icon }))

/**
 * Names of the held functions of one kind, joined for a read-only line
 * @param {MemberFunction[]} functions - Functions in display order
 * @param {string} kind - Principal or secondary
 * @return {string | null} - Joined names, nothing when none
 */

export const joinFunctionNames = (functions: MemberFunction[], kind: string): string | null => {
  const names = functions.filter((entry) => entry.kind === kind).map((entry) => entry.label)

  return names.length > 0 ? names.join(', ') : null
}
