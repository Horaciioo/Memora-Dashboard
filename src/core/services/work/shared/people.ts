import 'server-only'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { WorkAuthorship, WorkPerson } from '@/types/work'
import { LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

/**
 * Narrow a people list to what a bounded viewer may pick — the encadrement always
 * @param {AccessScope} [scope] - Viewer perimeter
 * @return {Prisma.AccountWhereInput} - Clause
 */

export const peopleInScope = (scope?: AccessScope): Prisma.AccountWhereInput =>
  !scope || scope.isGlobal
    ? {}
    : {
        OR: [
          { role: { in: LEADERSHIP_ROLES } },
          { youtubers: { some: { id: { in: scope.youtuberIds } } } },
        ],
      }

/**
 * Account row shaped like a person
 * @typedef {Object} PersonRow
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string | null} avatarUrl - Portrait
 */

interface PersonRow {
  id: string
  displayName: string
  avatarUrl: string | null
}

/**
 * Map an account row to a person
 * @param {PersonRow | null} row - Account row
 * @return {WorkPerson | null} - Person or null
 */

export const toPerson = (row: PersonRow | null | undefined): WorkPerson | null =>
  row ? { id: row.id, name: row.displayName, src: row.avatarUrl } : null

// Relations naming who opened a work record and who touched it last
export const AUTHORSHIP_INCLUDE = { createdBy: true, updatedBy: true } as const

/**
 * Work row carrying its authorship
 * @typedef {Object} AuthoredRow
 * @property {PersonRow | null} createdBy - Who opened it
 * @property {PersonRow | null} updatedBy - Who last edited it
 * @property {Date} createdAt - Creation moment
 * @property {Date} updatedAt - Last edit moment
 */

interface AuthoredRow {
  createdBy: PersonRow | null
  updatedBy: PersonRow | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Map the authorship of a work row
 * @param {AuthoredRow} row - Row with its author and its editor
 * @return {WorkAuthorship} - Who touched it and when
 */

export const toAuthorship = (row: AuthoredRow): WorkAuthorship => ({
  createdBy: toPerson(row.createdBy),
  createdAt: row.createdAt.toISOString(),
  updatedBy: toPerson(row.updatedBy),
  updatedAt: row.updatedAt.toISOString(),
})
