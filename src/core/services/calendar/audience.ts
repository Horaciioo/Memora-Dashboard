import 'server-only'

import { prisma } from '@/core/lib/db'
import { readFlag, readText } from '@/core/lib/forms/values'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { youtuberOptions } from '@/core/services/work/shared'
import { AUDIENCE_COPY } from '@/declarations/calendar/copy'
import type { FieldOption, FormValues } from '@/types/forms'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { EventVisibilities } from '@/utils/constants/workflow'
import type { EventVisibilityName } from '@/utils/constants/workflow'
import type { Prisma } from '@prisma/client'

// Form values naming a team or a promotion
const TEAM_PREFIX = 'team:'
const SESSION_PREFIX = 'session:'
const YOUTUBER_PREFIX = 'youtuber:'

/**
 * Audience columns of an entry row
 * @typedef {Object} AudienceColumns
 * @property {EventVisibilityName | null} visibility - Stored level
 * @property {string | null} audienceTeamId - Team shown to
 * @property {string | null} audienceSessionId - Promotion shown to
 * @property {string | null} youtuberId - Creator whose whole team it is shown to
 */

interface AudienceColumns {
  visibility: EventVisibilityName | null
  audienceTeamId: string | null
  audienceSessionId: string | null
  youtuberId: string | null
}

/**
 * Read the teams and promotions an entry may be shown to
 * @param {AccessScope} [scope] - Creator perimeter
 * @return {Promise<FieldOption[]>} - Select options
 */

export const audienceOptions = async (scope?: AccessScope): Promise<FieldOption[]> => {
  const [youtubers, teams, sessions] = await Promise.all([
    youtuberOptions(scope),
    prisma.team.findMany({
      where: scope ? scopedWhere('team', scope, { archived: false }) : { archived: false },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        youtuberId: true,
        youtuber: { select: { name: true, avatarUrl: true } },
      },
    }),
    prisma.academySession.findMany({
      where: {
        status: { notIn: [AcademySessionStatuses.Closed, AcademySessionStatuses.Archived] },
      },
      orderBy: { startsAt: 'desc' },
      select: { id: true, startsAt: true, jobFunction: { select: { name: true } } },
    }),
  ])

  return [
    // The whole team of the creator comes first, under the whole of Memora
    ...youtubers.map((youtuber) => ({
      value: `${YOUTUBER_PREFIX}${youtuber.value}`,
      label: `${AUDIENCE_COPY.youtuberTeam} ${youtuber.label}`,
      image: youtuber.image,
      icon: 'teams',
      owner: youtuber.value,
    })),
    ...teams.map((team) => ({
      value: `${TEAM_PREFIX}${team.id}`,
      label: team.name,
      hint: team.youtuber?.name,
      owner: team.youtuberId ?? undefined,
      image: team.youtuber?.avatarUrl,
      icon: 'teams',
      group: team.youtuber?.name ?? AUDIENCE_COPY.noYoutuber,
    })),
    ...sessions.map((session) => ({
      value: `${SESSION_PREFIX}${session.id}`,
      label: session.jobFunction.name,
      hint: session.startsAt.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      icon: 'academy',
      group: AUDIENCE_COPY.juniorTeams,
    })),
  ]
}

/**
 * Read the form value an entry's audience stands for
 * @param {AudienceColumns} row - Entry columns
 * @return {string | null} - Select value
 */

export const audienceValue = (row: AudienceColumns): string | null => {
  if (row.visibility === EventVisibilities.Youtuber) {
    return row.youtuberId ? `${YOUTUBER_PREFIX}${row.youtuberId}` : EventVisibilities.Everyone
  }
  if (row.visibility !== EventVisibilities.Team) return row.visibility
  if (row.audienceTeamId) return `${TEAM_PREFIX}${row.audienceTeamId}`

  return row.audienceSessionId ? `${SESSION_PREFIX}${row.audienceSessionId}` : null
}

/**
 * Split the visibility pick into stored columns
 * @param {FormValues} values - Parsed body
 * @return {object} - Audience columns
 */

export const parseAudience = (values: FormValues) => {
  const picked = readText(values, 'visibility') ?? null
  const isTeam = picked?.startsWith(TEAM_PREFIX) ?? false
  const isSession = picked?.startsWith(SESSION_PREFIX) ?? false
  const isYoutuber = picked?.startsWith(YOUTUBER_PREFIX) ?? false

  return {
    visibility: (isYoutuber
      ? EventVisibilities.Youtuber
      : isTeam || isSession
        ? EventVisibilities.Team
        : picked) as EventVisibilityName | null,
    audienceTeamId: isTeam ? picked!.slice(TEAM_PREFIX.length) : null,
    audienceSessionId: isSession ? picked!.slice(SESSION_PREFIX.length) : null,
    audienceLeadsOnly: (isTeam || isSession) && readFlag(values, 'audienceLeadsOnly'),
  }
}

/**
 * Form value standing for the whole team of a creator
 * @param {string} youtuberId - Creator identifier
 * @return {string} - Select value
 */

export const youtuberAudienceValue = (youtuberId: string): string =>
  `${YOUTUBER_PREFIX}${youtuberId}`

/**
 * Creator whose whole team the visibility pick stands for
 * @param {FormValues} values - Parsed body
 * @return {string | null} - Creator identifier, none for any other pick
 */

export const audienceYoutuberId = (values: FormValues): string | null => {
  const picked = readText(values, 'visibility') ?? ''

  return picked.startsWith(YOUTUBER_PREFIX) ? picked.slice(YOUTUBER_PREFIX.length) : null
}

/**
 * Whether a visibility pick stands for the whole team of a creator
 * @param {string} value - Select value
 * @return {boolean} - True for a creator team
 */

export const isYoutuberAudience = (value: string): boolean => value.startsWith(YOUTUBER_PREFIX)

// Columns a visibility pick rewrites together
export const AUDIENCE_KEYS = [
  'visibility',
  'audienceTeamId',
  'audienceSessionId',
  'audienceLeadsOnly',
] as const

/**
 * Clauses opening the entries bound to a viewer's own teams
 * @param {string} viewerId - Signed-in member identifier
 * @return {Promise<Prisma.CalendarEventWhereInput[]>} - Clauses to OR
 */

export const audienceClauses = async (
  viewerId: string
): Promise<Prisma.CalendarEventWhereInput[]> => {
  const [teams, trained, followed] = await Promise.all([
    prisma.team.findMany({
      where: {
        archived: false,
        OR: [
          { leads: { some: { accountId: viewerId } } },
          { members: { some: { accountId: viewerId } } },
        ],
      },
      select: { id: true, leads: { select: { accountId: true } } },
    }),
    prisma.academySessionTrainer.findMany({
      where: { accountId: viewerId },
      select: { sessionId: true },
    }),
    prisma.academyJunior.findMany({ where: { accountId: viewerId }, select: { sessionId: true } }),
  ])

  const ledTeamIds = teams
    .filter((team) => team.leads.some((lead) => lead.accountId === viewerId))
    .map((team) => team.id)
  const trainedIds = trained.map((seat) => seat.sessionId)
  const bound = { visibility: EventVisibilities.Team }

  return [
    // Everyone of a team, its lead included
    {
      ...bound,
      audienceLeadsOnly: false,
      audienceTeamId: { in: teams.map((team) => team.id) },
    },
    { ...bound, audienceLeadsOnly: true, audienceTeamId: { in: ledTeamIds } },
    // Juniors and trainers of a promotion
    {
      ...bound,
      audienceLeadsOnly: false,
      audienceSessionId: { in: [...trainedIds, ...followed.map((seat) => seat.sessionId)] },
    },
    { ...bound, audienceLeadsOnly: true, audienceSessionId: { in: trainedIds } },
  ]
}
