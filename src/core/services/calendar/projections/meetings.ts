import 'server-only'
import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { meetingVisibility } from '@/core/services/work/visibility'
import { ROUTES } from '@/declarations/navigation'
import type { CalendarEntry } from '@/types/calendar'
import { Permissions } from '@/utils/constants/permissions'
import { AttendeeKinds, CalendarSources } from '@/utils/constants/workflow'
import { MINUTE_MS } from '@/utils/constants/time'
import {
  FUNCTION_SHAPE,
  creatorAccent,
  creatorId,
  projected,
} from '@/core/services/calendar/projections/shared'
import type { ProjectionContext } from '@/core/services/calendar/projections/shared'

/**
 * Project the meetings of the window that were not already posted by hand
 * @param {ProjectionContext} context - Window and permissions
 * @return {Promise<CalendarEntry[]>} - Projected meetings
 */

export const meetingEntries = async ({
  from,
  to,
  access,
  scope,
  viewer,
}: ProjectionContext): Promise<CalendarEntry[]> => {
  if (!access.can(Permissions.MeetingRead)) return []

  const rows = await prisma.meeting.findMany({
    where: {
      AND: [
        scopedWhere('meeting', scope, {
          scheduledAt: { gte: from, lte: to },
          // A meeting already posted on the calendar is drawn from its own row
          calendarEvents: { none: {} },
        }),
        // Only the meetings the member reaches
        meetingVisibility(viewer),
      ],
    },
    include: {
      attendees: {
        where: { kind: AttendeeKinds.Lead },
        take: 1,
        include: { account: FUNCTION_SHAPE },
      },
      topics: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
      youtubers: {
        select: { id: true, accent: true },
        orderBy: { position: 'asc' },
        take: 1,
      },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return rows.flatMap((row) => {
    // The range filter already left undated meetings out
    if (!row.scheduledAt) return []

    const lead = row.attendees[0]?.account ?? null

    return projected({
      source: CalendarSources.Meeting,
      id: row.id,
      title: row.title,
      emoji: row.emoji,
      startsAt: row.scheduledAt,
      endsAt: row.durationMin
        ? new Date(row.scheduledAt.getTime() + row.durationMin * MINUTE_MS)
        : null,
      allDay: false,
      accent: row.youtubers[0]?.accent ?? creatorAccent(lead),
      youtuberId: row.youtubers[0]?.id ?? creatorId(lead),
      // A planned meeting shows nothing of its content
      description: null,
      subjectName: lead?.displayName ?? null,
      href: ROUTES.meeting(row.id),
      topics: row.topics.map((topic) => ({ emoji: topic.emoji, title: topic.title })),
      minutes: row.minutes,
    })
  })
}
