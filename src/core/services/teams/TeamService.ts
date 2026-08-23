import 'server-only'

import { prisma } from '@/core/lib/db'
import { readFlag, readText } from '@/core/lib/forms/values'
import { leadOptions, toPerson, toTag, youtuberOptions } from '@/core/services/work/shared'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { TEAM_FIELD_COPY } from '@/declarations/teams/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { TeamBoardData } from '@/types/teams'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Build the team form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const teamFields = async (): Promise<FieldDefinition[]> => {
  const [leads, youtubers] = await Promise.all([leadOptions(), youtuberOptions()])

  return [
    {
      name: 'name',
      kind: 'text',
      label: TEAM_FIELD_COPY.name,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
    },
    {
      name: 'leadId',
      kind: 'select',
      label: TEAM_FIELD_COPY.lead,
      options: leads,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'youtuberId',
      kind: 'select',
      label: TEAM_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: TEAM_FIELD_COPY.summary,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
    { name: 'archived', kind: 'toggle', label: TEAM_FIELD_COPY.archived },
  ]
}

/**
 * Read every team and everyone left outside, optionally narrowed to one creator
 * @param {string} [youtuberId] - Creator the board is scoped to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const readTeamBoard = async (youtuberId?: string): Promise<TeamBoardData> => {
  const [rows, accounts] = await Promise.all([
    prisma.team.findMany({
      where: youtuberId ? { youtuberId } : undefined,
      include: {
        lead: true,
        youtuber: true,
        members: { include: { account: true } },
      },
      orderBy: [{ archived: 'asc' }, { name: 'asc' }],
    }),
    prisma.account.findMany({
      where: { status: { not: MemberStatuses.Left }, teamMemberships: { none: {} } },
      orderBy: { displayName: 'asc' },
    }),
  ])

  return {
    teams: rows.map((row) => ({
      id: row.id,
      name: row.name,
      summary: row.summary,
      lead: toPerson(row.lead),
      youtuber: toTag(row.youtuber),
      members: row.members
        .map((membership) => toPerson(membership.account))
        .filter((person) => person !== null),
      archived: row.archived,
      values: {
        name: row.name,
        summary: row.summary,
        leadId: row.leadId,
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
  leadId: readText(values, 'leadId'),
  youtuberId: readText(values, 'youtuberId'),
  archived: readFlag(values, 'archived'),
})

/**
 * Create a team
 * @param {FormValues} values - Parsed body
 * @param {string} [scope] - Creator the board is scoped to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const createTeam = async (values: FormValues, scope?: string): Promise<TeamBoardData> => {
  await prisma.team.create({ data: toTeamData(values) })

  return readTeamBoard(scope)
}

/**
 * Edit a team
 * @param {string} id - Team identifier
 * @param {FormValues} values - Parsed body
 * @param {string} [scope] - Creator the board is scoped to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const updateTeam = async (
  id: string,
  values: FormValues,
  scope?: string
): Promise<TeamBoardData> => {
  await prisma.team.update({ where: { id }, data: toTeamData(values) })

  return readTeamBoard(scope)
}

/**
 * Drop a team
 * @param {string} id - Team identifier
 * @param {string} [scope] - Creator the board is scoped to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const removeTeam = async (id: string, scope?: string): Promise<TeamBoardData> => {
  await prisma.team.delete({ where: { id } })

  return readTeamBoard(scope)
}

/**
 * Move a member between teams
 * @param {string} accountId - Account identifier
 * @param {string | null} teamId - Target team, null to detach
 * @param {string} [scope] - Creator the board is scoped to
 * @return {Promise<TeamBoardData>} - Board data
 */

export const moveMember = async (
  accountId: string,
  teamId: string | null,
  scope?: string
): Promise<TeamBoardData> => {
  // A member holds one membership at a time
  await prisma.teamMember.deleteMany({ where: { accountId } })

  if (teamId) await prisma.teamMember.create({ data: { accountId, teamId } })

  return readTeamBoard(scope)
}
