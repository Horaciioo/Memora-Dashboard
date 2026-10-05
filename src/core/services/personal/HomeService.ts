import 'server-only'

import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { birthdaysBetween } from '@/core/services/calendar/projections'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import { MEETING_AUDIENCE_REGISTRY } from '@/declarations/work/registries'
import type { HomeBirthday, HomeMeeting } from '@/types/personal'
import { MeetingAudiences } from '@/utils/constants/workflow'
import type { AttendeeKindName, MeetingAudienceName } from '@/utils/constants/workflow'
import { addDays, startOfDay } from '@/utils/format/days'

/**
 * Read the birthdays coming up
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<HomeBirthday[]>} - Coming birthdays
 */

export const upcomingBirthdays = async (scope: AccessScope): Promise<HomeBirthday[]> => {
  const from = startOfDay(new Date())
  const occurrences = await birthdaysBetween(
    from,
    addDays(from, HOME_SETTINGS.birthdayWindowDays),
    scope
  )

  return occurrences.slice(0, HOME_SETTINGS.birthdayMax).map((occurrence) => ({
    accountId: occurrence.accountId,
    displayName: occurrence.displayName,
    avatarUrl: occurrence.avatarUrl,
    day: occurrence.day.toISOString(),
  }))
}

/**
 * Read the team audiences a member belongs to through the trades they hold
 * @param {string} viewerId - Signed-in member
 * @return {Promise<MeetingAudienceName[]>} - Team audiences
 */

const teamAudiences = async (viewerId: string): Promise<MeetingAudienceName[]> => {
  const held = await prisma.accountFunction.findMany({
    where: { accountId: viewerId },
    select: { jobFunction: { select: { name: true } } },
  })
  const trades = new Set(held.map((row) => tradeOfFunction(row.jobFunction.name)))

  return MEETING_AUDIENCE_REGISTRY.keys.filter((audience) => {
    const trade = MEETING_AUDIENCE_REGISTRY.get(audience).functionName

    return trade !== undefined && trades.has(trade)
  })
}

/**
 * Read the coming meetings a member is expected at
 * @param {string} viewerId - Signed-in member
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<HomeMeeting[]>} - Coming meetings
 */

export const myMeetings = async (viewerId: string, scope: AccessScope): Promise<HomeMeeting[]> => {
  const now = new Date()
  const teams = await teamAudiences(viewerId)

  const rows = await prisma.meeting.findMany({
    where: {
      scheduledAt: { gte: now, lte: addDays(now, HOME_SETTINGS.meetingWindowDays) },
      OR: [
        // A named seat always reaches its holder
        { attendees: { some: { accountId: viewerId } } },
        scopedWhere('meeting', scope, { audience: { in: [MeetingAudiences.Everyone, ...teams] } }),
      ],
    },
    select: {
      id: true,
      title: true,
      emoji: true,
      scheduledAt: true,
      durationMin: true,
      audience: true,
      attendees: { where: { accountId: viewerId }, select: { kind: true } },
    },
    orderBy: { scheduledAt: 'asc' },
    take: HOME_SETTINGS.meetingMax,
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    emoji: row.emoji,
    scheduledAt: row.scheduledAt.toISOString(),
    durationMin: row.durationMin,
    audience: row.audience,
    seat: (row.attendees[0]?.kind as AttendeeKindName | undefined) ?? null,
  }))
}
