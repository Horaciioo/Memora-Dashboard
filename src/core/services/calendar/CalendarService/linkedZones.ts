import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { projected } from '@/core/services/calendar/projections'
import { ROUTES } from '@/declarations/navigation'
import { FORM_COPY } from '@/declarations/ui/copy'
import type { CalendarEntry } from '@/types/calendar'
import type { FormValues } from '@/types/forms'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import { toEntryData } from '@/core/services/calendar/CalendarService/entryData'
import { ACTIVE_RECRUITMENTS } from '@/core/services/calendar/CalendarService/fields'

/**
 * Zone model tied to a session kind
 * @typedef {Object} LinkedZone
 * @property {string} name - Model name
 * @property {'RECRUITMENT' | 'ACADEMY'} linksTo - Session kind it follows
 */

interface LinkedZone {
  name: string
  linksTo: 'RECRUITMENT' | 'ACADEMY'
}

/**
 * Read the zone model an entry starts from, when it follows a session
 * @param {string | null} templateId - Model of the entry
 * @return {Promise<LinkedZone | null>} - Zone model, none for any other
 */

export const readLinkedZone = async (templateId: string | null): Promise<LinkedZone | null> => {
  const template = templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: templateId } })
    : null
  if (!template || template.kind !== CalendarKinds.Zone || !template.linksTo) return null

  return { name: template.name, linksTo: template.linksTo as LinkedZone['linksTo'] }
}

/**
 * Put a zone on the calendar through its session: a recruitment takes the dates given, the academy keeps its timeline
 * @param {LinkedZone} zone - Zone model
 * @param {ReturnType<typeof toEntryData>} base - Payload read off the form
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - Zone as the calendar draws it
 */

export const fileLinkedZone = async (
  zone: LinkedZone,
  base: ReturnType<typeof toEntryData>,
  values: FormValues
): Promise<CalendarEntry> => {
  const field = zone.linksTo === 'RECRUITMENT' ? 'recruitmentSessionId' : 'zoneSessionId'
  const sessionId = readText(values, field)
  if (!sessionId) throw invalidInput([{ field, message: FORM_COPY.required }])

  if (zone.linksTo === 'RECRUITMENT') {
    const session = await prisma.recruitmentSession.findFirst({
      where: { id: sessionId, status: { in: ACTIVE_RECRUITMENTS } },
    })
    if (!session) throw invalidInput([{ field, message: FORM_COPY.notAnOption }])

    // The campaign follows the dates given, its zone follows the campaign
    const closesAt = base.endsAt ?? session.closesAt
    await prisma.recruitmentSession.update({
      where: { id: sessionId },
      data: { opensAt: base.startsAt, closesAt },
    })

    return projected({
      source: CalendarSources.Recruitment,
      id: `${sessionId}:written`,
      title: `${zone.name}, ${session.name}`,
      startsAt: base.startsAt,
      endsAt: closesAt,
      allDay: true,
      kind: CalendarKinds.Zone,
      accent: null,
      description: null,
      subjectName: null,
      href: ROUTES.recruitment(sessionId),
    })
  }

  const session = await prisma.academySession.findFirst({
    where: {
      id: sessionId,
      status: { notIn: [AcademySessionStatuses.Closed, AcademySessionStatuses.Archived] },
    },
    include: { jobFunction: { select: { name: true } } },
  })
  if (!session) throw invalidInput([{ field, message: FORM_COPY.notAnOption }])

  // The timeline draws the zones itself, nothing is stored
  return projected({
    source: CalendarSources.AcademyPeriod,
    id: `${sessionId}:zone`,
    title: `${zone.name}, ${session.jobFunction.name}`,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    allDay: true,
    kind: CalendarKinds.Zone,
    accent: null,
    description: null,
    subjectName: null,
    href: ROUTES.session(sessionId),
  })
}
