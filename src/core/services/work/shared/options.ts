import 'server-only'
import { prisma } from '@/core/lib/db'
import { HELD_FUNCTIONS, toMemberFunctions } from '@/core/services/reference/functions'
import { allPriorities } from '@/core/services/reference/lookups'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { activeAbsenceFilter } from '@/core/services/absences/AbsenceService'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { FIXED_PRIORITIES } from '@/declarations/reference/fixed'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { projectVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { FieldOption } from '@/types/forms'
import { GLOBAL_ROLES, GONE_MEMBER_STATUSES, LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { WorkflowPhases } from '@/utils/constants/workflow'
import type { WorkflowScopeName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'
import { peopleInScope } from '@/core/services/work/shared/people'

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

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    isDefault: row.isDefault,
  }))
}

/**
 * Read the moderators that can be assigned
 * @param {AccessScope} [scope] - Viewer perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

export const memberOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: { status: { notIn: GONE_MEMBER_STATUSES }, ...peopleInScope(scope) },
    orderBy: { displayName: 'asc' },
    include: {
      ...HELD_FUNCTIONS,
      _count: { select: { absences: { where: activeAbsenceFilter() } } },
    },
  })

  return roleGroupedOptions(rows, (row) => {
    const isAbsent = row._count.absences > 0

    return {
      disabled: isAbsent,
      // The hint tells homonyms apart
      hint: isAbsent
        ? MEMBER_COPY.absentHint.replace('{name}', row.displayName)
        : (toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role)),
    }
  })
}

/**
 * Read the members of a creator's team holding a role or a function
 * @param {Object} filter - Who qualifies
 * @param {MemberRoleName} [filter.role] - Role held
 * @param {string} [filter.functionName] - Function held
 * @param {string} [filter.youtuberId] - Creator whose team narrows the list, else each option names its creators
 * @param {boolean} [filter.withGlobal] - Employees and administrators qualify too, whatever their creators
 * @return {Promise<FieldOption[]>} - Select options
 */

export const teamOptions = async ({
  role,
  functionName,
  youtuberId,
  withGlobal,
}: {
  role?: MemberRoleName
  functionName?: string
  youtuberId?: string
  withGlobal?: boolean
}): Promise<FieldOption[]> => {
  const team: Prisma.AccountWhereInput = {
    ...(role && { role }),
    ...(functionName && { functions: { some: { jobFunction: { name: functionName } } } }),
    ...(youtuberId && { youtubers: { some: { id: youtuberId } } }),
  }

  const rows = await prisma.account.findMany({
    where: {
      status: { notIn: GONE_MEMBER_STATUSES },
      ...(withGlobal ? { OR: [team, { role: { in: GLOBAL_ROLES } }] } : team),
    },
    orderBy: { displayName: 'asc' },
    include: {
      ...HELD_FUNCTIONS,
      youtubers: { select: { id: true } },
      _count: { select: { absences: { where: activeAbsenceFilter() } } },
    },
  })

  return roleGroupedOptions(rows, (row) => ({
    disabled: row._count.absences > 0,
    // Global roles reach every creator
    owners: GLOBAL_ROLES.includes(row.role)
      ? undefined
      : row.youtubers.map((youtuber) => youtuber.id),
    hint:
      row._count.absences > 0
        ? MEMBER_COPY.absentHint.replace('{name}', row.displayName)
        : (toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role)),
  }))
}

/**
 * Read the moderators allowed to lead a team
 * @param {AccessScope} [scope] - Viewer perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

export const leadOptions = async (
  scope?: AccessScope,
  roles: MemberRoleName[] = LEADERSHIP_ROLES
): Promise<FieldOption[]> => {
  const rows = await prisma.account.findMany({
    where: {
      status: { notIn: GONE_MEMBER_STATUSES },
      role: { in: roles },
      ...peopleInScope(scope),
    },
    orderBy: { displayName: 'asc' },
    include: HELD_FUNCTIONS,
  })

  return roleGroupedOptions(rows, (row) => ({
    hint: toMemberFunctions(row.functions)[0]?.label ?? ROLE_REGISTRY.label(row.role),
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
  const preset = FIXED_PRIORITIES.find((priority) => priority.isDefault)?.name

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    isDefault: row.name === preset,
  }))
}

/**
 * Read the ongoing or planned projects of a perimeter
 * @param {AccessScope} [scope] - Viewer perimeter
 * @param {WorkViewer} [viewer] - Who reads
 * @return {Promise<FieldOption[]>} - Select options
 */

export const projectOptions = async (
  scope?: AccessScope,
  viewer?: WorkViewer
): Promise<FieldOption[]> => {
  // Finished projects drop out
  const live: Prisma.ProjectWhereInput = {
    archived: false,
    OR: [{ stateId: null }, { state: { phase: { not: WorkflowPhases.Done } } }],
  }

  const rows = await prisma.project.findMany({
    where: {
      AND: [
        scope ? scopedWhere('project', scope, live) : live,
        viewer ? projectVisibility(viewer) : {},
      ],
    },
    orderBy: { title: 'asc' },
  })

  return rows.map((row) => ({ value: row.id, label: row.title, emoji: row.emoji }))
}
