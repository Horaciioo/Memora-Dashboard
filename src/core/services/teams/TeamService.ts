import 'server-only'

import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import { memberOptions, toPerson, toTag, youtuberOptions } from '@/core/services/work/shared'
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
  const [members, youtubers] = await Promise.all([memberOptions(), youtuberOptions()])

  return [
    {
      name: 'name',
      kind: 'text',
      label: TEAM_FIELD_COPY.name,
      required: true,
      maxLength: FORM_SETTINGS.shortTextMaxLength,
    },
    { name: 'leadId', kind: 'select', label: TEAM_FIELD_COPY.lead, options: members, span: 'half' },
    {
      name: 'youtuberId',
      kind: 'select',
      label: TEAM_FIELD_COPY.youtuber,
      options: youtubers,
      span: 'half',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: TEAM_FIELD_COPY.summary,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
  ]
}

/**
 * Read every team and everyone left outside
 * @return {Promise<TeamBoardData>} - Board data
 */

export const readTeamBoard = async (): Promise<TeamBoardData> => {
  const [rows, accounts] = await Promise.all([
    prisma.team.findMany({
      include: {
        lead: true,
        youtuber: true,
        members: { include: { account: true } },
      },
      orderBy: { name: 'asc' },
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
      values: {
        name: row.name,
        summary: row.summary,
        leadId: row.leadId,
        youtuberId: row.youtuberId,
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
})

/**
 * Create a team
 * @param {FormValues} values - Parsed body
 * @return {Promise<TeamBoardData>} - Board data
 */

export const createTeam = async (values: FormValues): Promise<TeamBoardData> => {
  await prisma.team.create({ data: toTeamData(values) })

  return readTeamBoard()
}

/**
 * Edit a team
 * @param {string} id - Team identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TeamBoardData>} - Board data
 */

export const updateTeam = async (id: string, values: FormValues): Promise<TeamBoardData> => {
  await prisma.team.update({ where: { id }, data: toTeamData(values) })

  return readTeamBoard()
}

/**
 * Drop a team
 * @param {string} id - Team identifier
 * @return {Promise<TeamBoardData>} - Board data
 */

export const removeTeam = async (id: string): Promise<TeamBoardData> => {
  await prisma.team.delete({ where: { id } })

  return readTeamBoard()
}

/**
 * Move a member between teams
 * @param {string} accountId - Account identifier
 * @param {string | null} teamId - Target team, null to detach
 * @return {Promise<TeamBoardData>} - Board data
 */

export const moveMember = async (
  accountId: string,
  teamId: string | null
): Promise<TeamBoardData> => {
  // A member holds one membership at a time
  await prisma.teamMember.deleteMany({ where: { accountId } })

  if (teamId) await prisma.teamMember.create({ data: { accountId, teamId } })

  return readTeamBoard()
}
