import 'server-only'
import { prisma } from '@/core/lib/db'
import { functionTeamWhere } from '@/core/services/calendar/attendance'
import { openMeetingForEntry } from '@/core/services/work/MeetingService'
import { ROOT_IDENTITY } from '@/declarations/access/identity'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * File a meeting model on the Réunions page and link the entry to it
 * @param {{ id: string, title: string, emoji: string | null, startsAt: Date, endsAt: Date | null, templateId: string | null, youtuberId: string | null }} row - Entry just created
 * @param {string} ownerId - Who planned it
 * @param {string[]} memberIds - Members convened
 * @return {Promise<void>} - Linked
 */

export const fileMeeting = async (
  row: {
    id: string
    title: string
    emoji: string | null
    startsAt: Date
    endsAt: Date | null
    templateId: string | null
    youtuberId: string | null
  },
  ownerId: string,
  memberIds: string[]
): Promise<void> => {
  const template = row.templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: row.templateId } })
    : null
  if (!template?.meetingAudience) return

  // A team meeting is run by the Responsables of the team, the others by the root administrator
  const team = template.functionName
    ? await prisma.team.findFirst({
        where: functionTeamWhere(row.youtuberId, template.functionName),
        select: { leads: { select: { accountId: true } } },
      })
    : null
  const root = ROOT_IDENTITY.discordId
    ? await prisma.account.findFirst({
        where: { discordId: ROOT_IDENTITY.discordId },
        select: { id: true },
      })
    : null
  const leadIds = team ? team.leads.map((lead) => lead.accountId) : [root?.id ?? ownerId]

  const meetingId = await openMeetingForEntry({
    title: row.title,
    emoji: row.emoji,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    audience: template.meetingAudience,
    youtuberId: row.youtuberId,
    leadIds,
    participantIds: memberIds,
    actorId: ownerId,
  })

  await prisma.calendarEvent.update({ where: { id: row.id }, data: { meetingId } })
}

/**
 * Keep the card of the Réunions page in line with the entry it was filed for
 * @param {Object} row - Entry just written
 * @param {string | null} row.meetingId - Card it is linked to
 * @param {string} row.title - Entry title
 * @param {string | null} row.emoji - Entry glyph
 * @param {Date} row.startsAt - Start
 * @param {Date | null} row.endsAt - End
 * @param {boolean} row.allDay - Spans whole days
 * @return {Promise<void>} - Card updated
 */

export const syncMeetingCard = async (row: {
  meetingId: string | null
  title: string
  emoji: string | null
  startsAt: Date
  endsAt: Date | null
  allDay: boolean
}): Promise<void> => {
  if (!row.meetingId) return

  await prisma.meeting.updateMany({
    where: { id: row.meetingId },
    data: {
      title: row.title,
      emoji: row.emoji,
      scheduledAt: row.startsAt,
      durationMin:
        row.endsAt && !row.allDay
          ? Math.round((row.endsAt.getTime() - row.startsAt.getTime()) / MINUTE_MS)
          : null,
    },
  })
}

/**
 * Drop the cards of the Réunions page that entries of a meeting or slot model had filed
 * @param {string[]} ids - Entries about to be removed
 * @return {Promise<void>} - Cards removed
 */

export const dropMeetingCards = async (ids: string[]): Promise<void> => {
  const rows = await prisma.calendarEvent.findMany({
    where: {
      id: { in: ids },
      meetingId: { not: null },
      template: { OR: [{ meetingAudience: { not: null } }, { slotMinutes: { not: null } }] },
    },
    select: { meetingId: true },
  })
  const cards = rows.flatMap((row) => (row.meetingId ? [row.meetingId] : []))
  if (cards.length > 0) await prisma.meeting.deleteMany({ where: { id: { in: cards } } })
}
