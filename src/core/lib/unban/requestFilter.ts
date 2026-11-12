import { UnbanStatuses } from '@/utils/constants/unban'
import type { UnbanStatusName } from '@/utils/constants/unban'
import type { Prisma } from '@prisma/client'

/**
 * Who a list is narrowed to, besides a member id
 * @type {Record<string, string>}
 */

export const AssigneeFilters = {
  Me: 'me',
  Nobody: 'none',
} as const

/**
 * What narrows the list of requests
 * @typedef {Object} RequestFilters
 * @property {UnbanStatusName[]} [statuses] - Statuses wanted
 * @property {string} [youtuberId] - One creator only
 * @property {string} [assignee] - `me`, `none` or a member id
 * @property {string} [from] - ISO first day of submission
 * @property {string} [to] - ISO last day of submission
 * @property {string} [discordId] - Exact Discord identifier
 * @property {string} [q] - Text looked for in reference and Discord names
 * @property {string} [cursor] - Identifier the page follows
 * @property {number} [limit] - Page size
 */

export interface RequestFilters {
  statuses?: UnbanStatusName[]
  youtuberId?: string
  assignee?: string
  from?: string
  to?: string
  discordId?: string
  q?: string
  cursor?: string
  limit?: number
}

/**
 * Clause on who holds the request
 * @param {string | undefined} assignee - Filter value
 * @param {string} actorId - Member asking
 * @return {Prisma.UnbanRequestWhereInput} - Clause
 */

const assigneeWhere = (
  assignee: string | undefined,
  actorId: string
): Prisma.UnbanRequestWhereInput => {
  if (!assignee) return {}
  if (assignee === AssigneeFilters.Nobody) return { assigneeId: null }

  return { assigneeId: assignee === AssigneeFilters.Me ? actorId : assignee }
}

/**
 * Clause on the submission period, an unreadable date narrows nothing
 * @param {string | undefined} from - First day
 * @param {string | undefined} to - Last day
 * @return {Prisma.UnbanRequestWhereInput} - Clause
 */

const periodWhere = (
  from: string | undefined,
  to: string | undefined
): Prisma.UnbanRequestWhereInput => {
  const start = from ? new Date(from) : null
  const end = to ? new Date(to) : null
  const range = {
    ...(start && !Number.isNaN(start.getTime()) ? { gte: start } : {}),
    ...(end && !Number.isNaN(end.getTime()) ? { lte: end } : {}),
  }

  return Object.keys(range).length > 0 ? { submittedAt: range } : {}
}

/**
 * Clause on the text, never on the answers which are stored sealed
 * @param {string | undefined} text - Text typed
 * @return {Prisma.UnbanRequestWhereInput} - Clause
 */

const textWhere = (text: string | undefined): Prisma.UnbanRequestWhereInput => {
  const q = text?.trim()
  if (!q) return {}

  const like = { contains: q, mode: 'insensitive' as const }

  return { OR: [{ reference: like }, { discordId: like }, { discordName: like }] }
}

/**
 * Query clause of the filters, the perimeter is added by the caller
 * @param {RequestFilters} filters - Narrowing
 * @param {string} actorId - Member asking
 * @return {Prisma.UnbanRequestWhereInput} - Clause
 */

export const requestWhere = (
  filters: RequestFilters,
  actorId: string
): Prisma.UnbanRequestWhereInput => ({
  ...(filters.statuses?.length ? { status: { in: filters.statuses } } : {}),
  ...(filters.youtuberId ? { youtuberId: filters.youtuberId } : {}),
  ...(filters.discordId ? { discordId: filters.discordId } : {}),
  ...assigneeWhere(filters.assignee, actorId),
  ...periodWhere(filters.from, filters.to),
  ...textWhere(filters.q),
})

/**
 * Middle value of a series, null for none
 * @param {number[]} values - Numbers
 * @return {number | null} - Median
 */

export const median = (values: number[]): number | null => {
  if (values.length === 0) return null

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

// Statuses a query string may name
const STATUS_VALUES: string[] = Object.values(UnbanStatuses)

/**
 * Filters named by a query string, unknown values are left out
 * @param {URLSearchParams} query - Query string
 * @return {RequestFilters} - Filters
 */

export const parseRequestFilters = (query: URLSearchParams): RequestFilters => {
  const text = (name: string): string | undefined => query.get(name)?.trim() || undefined
  const limit = Number(query.get('limit'))

  return {
    statuses: query
      .getAll('status')
      .flatMap((value) => value.split(','))
      .filter((value): value is UnbanStatusName => STATUS_VALUES.includes(value)),
    youtuberId: text('youtuberId'),
    assignee: text('assignee'),
    from: text('from'),
    to: text('to'),
    discordId: text('discordId'),
    q: text('q'),
    cursor: text('cursor'),
    limit: Number.isInteger(limit) && limit > 0 ? limit : undefined,
  }
}
