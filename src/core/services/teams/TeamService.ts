import 'server-only'

import { prisma } from '@/core/lib/db'
import { assertInScope, assertRowInScope, scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readFlag, readList, readText } from '@/core/lib/forms/values'
import { leadOptions, toPerson, toTag, youtuberOptions } from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { TEAM_FIELD_COPY, TEAM_FIELD_INFO } from '@/declarations/teams/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { TeamBoardData } from '@/types/teams'
import { ENCADREMENT_ROLES } from '@/declarations/access/roles'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'

/**
 * Build the team form declarations
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const teamFields = async (scope?: AccessScope): Promise<FieldDefinition[]> => {
  const [leads, admins, youtubers] = await Promise.all([
    leadOptions(scope, [MemberRoles.Responsable]),
    leadOptions(scope, [MemberRoles.Admin]),
    youtuberOptions(scope),
  ])

  return [
    {
      name: 'name',
      kind: 'text',
      label: TEAM_FIELD_COPY.name,
      info: TEAM_FIELD_INFO.name,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
    },
    {
      name: 'leadIds',
      kind: 'multiselect',
      label: TEAM_FIELD_COPY.lead,
      info: TEAM_FIELD_INFO.lead,
      options: leads,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'adminIds',
      kind: 'multiselect',
      label: TEAM_FIELD_COPY.admin,
      info: TEAM_FIELD_INFO.admin,
      options: admins,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: TEAM_FIELD_COPY.youtuber,
      info: TEAM_FIELD_INFO.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: TEAM_FIELD_COPY.summary,
      info: TEAM_FIELD_INFO.summary,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
    { name: 'archived', kind: 'toggle', label: TEAM_FIELD_COPY.archived },
  ]
}

/**
 * Lead accounts of one role
 * @param {Array<{ accountId: string, account: { role: string } }>} leads - Team leads
 * @param {string} role - Role kept
 * @return {string[]} - Account identifiers
 */

const leadsOf = (leads: { accountId: string; account: { role: string } }[], role: string) =>
  leads.filter((lead) => lead.account.role === role).map((lead) => lead.accountId)

/**
 * Read every team and everyone left outside
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} [youtuberId] - Creator the board is narrowed to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const readTeamBoard = async (
  scope: AccessScope,
  youtuberId?: string
): Promise<TeamBoardData> => {
  const [rows, accounts] = await Promise.all([
    prisma.team.findMany({
      where: scopedWhere('team', scope, youtuberId ? { youtuberId } : {}),
      include: {
        leads: { include: { account: true } },
        youtuber: true,
        members: { include: { account: true } },
      },
      orderBy: [{ archived: 'asc' }, { name: 'asc' }],
    }),
    prisma.account.findMany({
      where: {
        status: { notIn: GONE_MEMBER_STATUSES },
        // Administration sits outside the teams
        role: { notIn: ENCADREMENT_ROLES },
        teamMemberships: { none: {} },
      },
      orderBy: { displayName: 'asc' },
    }),
  ])

  return {
    teams: rows.map((row) => ({
      id: row.id,
      name: row.name,
      summary: row.summary,
      leads: row.leads.map((lead) => toPerson(lead.account)).filter((person) => person !== null),
      youtuber: toTag(row.youtuber),
      members: row.members
        .map((membership) => toPerson(membership.account))
        .filter((person) => person !== null),
      archived: row.archived,
      values: {
        name: row.name,
        summary: row.summary,
        leadIds: leadsOf(row.leads, MemberRoles.Responsable),
        adminIds: leadsOf(row.leads, MemberRoles.Admin),
        youtuberId: row.youtuberId,
        archived: row.archived,
      },
    })),
    unassigned: accounts.map((account) => toPerson(account)).filter((person) => person !== null),
  }
}

/**
 * Turn parsed values into a database payload
 * @param {FormValues} values - Parsed body
 * @return {Prisma.TeamUncheckedUpdateInput} - Database payload
 */

const toTeamData = (values: FormValues) => ({
  name: readText(values, 'name') ?? '',
  summary: readText(values, 'summary'),
  youtuberId: readText(values, 'youtuberId'),
  archived: readFlag(values, 'archived'),
})

/**
 * Accounts running the team
 * @param {FormValues} values - Parsed body
 * @return {string[]} - Account identifiers
 */

const readLeadIds = (values: FormValues): string[] => [
  ...new Set([...readList(values, 'leadIds'), ...readList(values, 'adminIds')]),
]

/**
 * Create a team
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} [youtuberId] - Creator the board is narrowed to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const createTeam = async (
  values: FormValues,
  scope: AccessScope,
  youtuberId?: string
): Promise<TeamBoardData> => {
  const data = toTeamData(values)
  assertInScope(scope, data.youtuberId ?? null)

  await prisma.team.create({
    data: { ...data, leads: { create: readLeadIds(values).map((accountId) => ({ accountId })) } },
  })

  return readTeamBoard(scope, youtuberId)
}

/**
 * Edit a team
 * @param {string} id - Team identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} [youtuberId] - Creator the board is narrowed to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const updateTeam = async (
  id: string,
  values: FormValues,
  scope: AccessScope,
  youtuberId?: string
): Promise<TeamBoardData> => {
  await assertRowInScope('team', id, scope)

  const data = toTeamData(values)
  assertInScope(scope, data.youtuberId ?? null)

  await prisma.team.update({
    where: { id },
    data: {
      ...data,
      leads: {
        deleteMany: {},
        create: readLeadIds(values).map((accountId) => ({ accountId })),
      },
    },
  })

  return readTeamBoard(scope, youtuberId)
}

/**
 * Drop a team
 * @param {string} id - Team identifier
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} [youtuberId] - Creator the board is narrowed to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const removeTeam = async (
  id: string,
  scope: AccessScope,
  youtuberId?: string
): Promise<TeamBoardData> => {
  await assertRowInScope('team', id, scope)
  await prisma.team.delete({ where: { id } })

  return readTeamBoard(scope, youtuberId)
}

/**
 * Move a member between teams
 * @param {string} accountId - Account identifier
 * @param {string | null} teamId - Target team
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} [youtuberId] - Creator the board is narrowed to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const moveMember = async (
  accountId: string,
  teamId: string | null,
  scope: AccessScope,
  youtuberId?: string
): Promise<TeamBoardData> => {
  if (teamId) await assertRowInScope('team', teamId, scope)

  // A member holds one membership at a time
  await prisma.teamMember.deleteMany({ where: { accountId } })

  if (teamId) await prisma.teamMember.create({ data: { accountId, teamId } })

  return readTeamBoard(scope, youtuberId)
}
