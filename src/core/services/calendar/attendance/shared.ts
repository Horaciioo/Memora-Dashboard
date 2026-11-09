import 'server-only'
import type { AttendanceHours, AttendancePerson } from '@/types/calendar'
import type { Prisma } from '@prisma/client'

// Roll-call notification always points back at the calendar
export const NOTIFY = {
  kind: 'AttendanceRequested',
  target: 'calendar',
} as const

// Row shape every roster reader maps from
export type AttendanceRow = Prisma.EventAttendanceGetPayload<{
  include: { account: { select: { displayName: true; avatarUrl: true; role: true } } }
}>

/**
 * Who a roll-call convenes besides the teams and members named on the form
 * @typedef {Object} RosterAudience
 * @property {boolean} [everyone] - Whole perimeter
 * @property {string | null} [youtuberId] - Whole team of a creator
 * @property {boolean} [responsables] - Every Responsable and Administrator
 * @property {{ youtuberId: string | null, functionName: string } | null} [team] - Team of a creator for a function, with its Responsables
 * @property {boolean} [includeLeadership] - Responsables and Administrators are convened too
 */

export interface RosterAudience {
  everyone?: boolean
  youtuberId?: string | null
  responsables?: boolean
  team?: { youtuberId: string | null; functionName: string } | null
  includeLeadership?: boolean
}

/**
 * Live team of a creator function
 * @param {string | null} youtuberId - Creator identifier
 * @param {string} functionName - Function name
 * @return {Prisma.TeamWhereInput} - Team clause
 */

export const functionTeamWhere = (
  youtuberId: string | null,
  functionName: string
): Prisma.TeamWhereInput => ({ youtuberId, archived: false, jobFunction: { name: functionName } })

/**
 * Map an account row to a roster person
 * @param {AttendanceRow} row - Roster row
 * @return {AttendancePerson} - Roster person
 */

export const toPerson = (row: AttendanceRow, reinforced: Set<string>): AttendancePerson => ({
  id: row.accountId,
  name: row.account.displayName,
  avatar: row.account.avatarUrl,
  hours: hoursOf(row),
  isReinforcement: reinforced.has(row.accountId),
})

/**
 * Hours a row carries
 * @param {AttendanceRow} row - Roster row
 * @return {AttendanceHours | null} - Hours given
 */

export const hoursOf = (row: AttendanceRow): AttendanceHours | null =>
  row.availableFrom && row.availableTo
    ? { from: row.availableFrom.toISOString(), to: row.availableTo.toISOString() }
    : null
