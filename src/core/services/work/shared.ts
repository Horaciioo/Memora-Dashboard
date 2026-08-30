import 'server-only'

import { prisma } from '@/core/lib/db'
import { allPriorities } from '@/core/services/reference/lookups'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { BoardColumn } from '@/components/structures/KanbanBoard'
import type { FieldOption } from '@/types/forms'
import type { WorkAuthorship, WorkPerson, WorkTag } from '@/types/work'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { WorkflowScopeName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

/**
 * Narrow a people list to what a bounded viewer may pick — the encadrement always, plus
 * whoever posts for a creator in their perimeter
 * @param {AccessScope} [scope] - Viewer perimeter
 * @return {Prisma.AccountWhereInput} - Clause, empty for a global viewer
 */

export const peopleInScope = (scope?: AccessScope): Prisma.AccountWhereInput =>
  !scope || scope.isGlobal
    ? {}
    : {
        OR: [
          { role: { in: [MemberRoles.Admin, MemberRoles.Responsable] } },
          { youtubers: { some: { id: { in: scope.youtuberIds } } } },
        ],
      }

/**
 * Reference row shaped like a tag
 * @typedef {Object} TagRow
 * @property {string} id - Row identifier
 * @property {string} name - Display name
 * @property {string | null} accent - Colour token
 */

interface TagRow {
  id: string
  name: string
  accent?: string | null
}

/**
 * Map a reference row to a tag
 * @param {TagRow | null} row - Reference row
 * @return {WorkTag | null} - Tag or null
 */

export const toTag = (row: TagRow | null | undefined): WorkTag | null =>
  row ? { id: row.id, label: row.name, accent: row.accent ?? null } : null

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

/**
 * Read the columns of one board
 * @param {WorkflowScopeName} scope - Board scope
 * @return {Promise<BoardColumn[]>} - Columns in display order
 */

export const boardColumns = async (scope: WorkflowScopeName): Promise<BoardColumn[]> => {
  const rows = await prisma.workflowState.findMany({
    where: { scope },
    orderBy: { position: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    accent: row.accent,
    isTerminal: row.isTerminal,
  }))
}

/**
 * Read the default column of one board
 * @param {WorkflowScopeName} scope - Board scope
 * @return {Promise<string | null>} - State identifier
 */

export const defaultState = async (scope: WorkflowScopeName): Promise<string | null> => {
  const state =
    (await prisma.workflowState.findFirst({ where: { scope, isDefault: true } })) ??
    (await prisma.workflowState.findFirst({ where: { scope }, orderBy: { position: 'asc' } }))

  return state?.id ?? null
}

/**
 * Read the state options of one board
 * @param {WorkflowScopeName} scope - Board scope
 * @return {Promise<FieldOption[]>} - Select options
 */

export const stateOptions = async (scope: WorkflowScopeName): Promise<FieldOption[]> => {
  const rows = await prisma.workflowState.findMany({
    where: { scope },
    orderBy: { position: 'asc' },
  })

  return rows.map((row) => ({ value: row.id, label: row.name, accent: row.accent ?? undefined }))
}

/**
 * Read the moderators that can be assigned
 * @param {AccessScope} [scope] - Viewer perimeter, unbounded when absent
 * @return {Promise<FieldOption[]>} - Select options
 */

export const memberOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: { status: { not: MemberStatuses.Left }, ...peopleInScope(scope) },
    orderBy: { displayName: 'asc' },
    include: {
      primaryFunction: { select: { name: true } },
      _count: { select: { absences: { where: activeAbsenceFilter() } } },
    },
  })

  return rows.map((row) => {
    const isAbsent = row._count.absences > 0

    return {
      value: row.id,
      label: row.displayName,
      image: row.avatarUrl,
      disabled: isAbsent,
      // The hint tells homonyms apart, unless the member is out and it carries that instead
      hint: isAbsent
        ? MEMBER_COPY.absentHint.replace('{name}', row.displayName)
        : (row.primaryFunction?.name ?? ROLE_REGISTRY.label(row.role)),
    }
  })
}

/**
 * Read the moderators allowed to lead a team, responsables and admins only
 * @param {AccessScope} [scope] - Viewer perimeter, unbounded when absent
 * @return {Promise<FieldOption[]>} - Select options
 */

export const leadOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: {
      status: { not: MemberStatuses.Left },
      role: { in: [MemberRoles.Admin, MemberRoles.Responsable] },
      ...peopleInScope(scope),
    },
    orderBy: { displayName: 'asc' },
    include: { primaryFunction: { select: { name: true } } },
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.displayName,
    image: row.avatarUrl,
    hint: row.primaryFunction?.name ?? ROLE_REGISTRY.label(row.role),
  }))
}

/**
 * Read the active YouTubers
 * @return {Promise<FieldOption[]>} - Select options
 */

export const youtuberOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.youtuber.findMany({
    where:
      scope && !scope.isGlobal
        ? { archived: false, id: { in: scope.youtuberIds } }
        : { archived: false },
    orderBy: { position: 'asc' },
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    image: row.avatarUrl,
  }))
}

/**
 * Read the active platforms
 * @return {Promise<FieldOption[]>} - Select options
 */

export const platformOptions = async (): Promise<FieldOption[]> => {
  const rows = await prisma.platform.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    image: row.avatarUrl,
  }))
}

/**
 * Read the priorities
 * @return {Promise<FieldOption[]>} - Select options
 */

export const priorityOptions = async (): Promise<FieldOption[]> => {
  const rows = await allPriorities()

  return rows.map((row) => ({ value: row.id, label: row.name, accent: row.accent ?? undefined }))
}

/**
 * Read the open projects
 * @return {Promise<FieldOption[]>} - Select options
 */

export const projectOptions = async (): Promise<FieldOption[]> => {
  const rows = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { title: 'asc' },
  })

  return rows.map((row) => ({ value: row.id, label: row.title }))
}

/**
 * Compute the position of a card dropped inside a column
 * @param {Array<{ id: string, position: number }>} cards - Cards already in the column
 * @param {number} index - Drop index
 * @return {number} - New position
 */

export const positionAt = (cards: { id: string; position: number }[], index: number): number => {
  const step = FORM_SETTINGS.positionStep

  // Dropped above the first card, or on an empty column
  if (cards.length === 0) return step
  if (index <= 0) return cards[0].position - step

  // Dropped below the last card
  if (index >= cards.length) return cards[cards.length - 1].position + step

  return Math.floor((cards[index - 1].position + cards[index].position) / 2)
}
