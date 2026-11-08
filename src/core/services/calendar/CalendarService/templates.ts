import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { wholeDays } from '@/core/lib/calendar/wholeDays'
import { readList, readText } from '@/core/lib/forms/values'
import { functionTeamWhere } from '@/core/services/calendar/attendance'
import type { RosterAudience } from '@/core/services/calendar/attendance'
import { openAnnualSlots } from '@/core/services/calendar/AnnualSlotService'
import { wallToInstant } from '@/utils/format/zone'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { FORM_COPY } from '@/declarations/ui/copy'
import type { CalendarEntry } from '@/types/calendar'
import type { FormValues } from '@/types/forms'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
import { MINUTE_MS } from '@/utils/constants/time'
import { toEntryData } from '@/core/services/calendar/CalendarService/entryData'
import { ENTRY_SHAPE, toEntry } from '@/core/services/calendar/CalendarService/reads'

/**
 * Fill what a form left blank with what its template already declares
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {Promise<ReturnType<typeof toEntryData>>} - Payload the template completed
 */

export const applyTemplate = async (data: ReturnType<typeof toEntryData>) => {
  const filled = await fillFromTemplate(data)

  // A whole day starts at midnight and ends at the last minute
  return filled.allDay ? { ...filled, ...wholeDays(filled.startsAt, filled.endsAt) } : filled
}

/**
 * Who a model that always calls the roll convenes
 * @param {string | null} templateId - Model of the entry
 * @param {string | null} youtuberId - Creator it is posted for
 * @return {Promise<RosterAudience>} - Convened audience
 */

export const templateAudience = async (
  templateId: string | null,
  youtuberId: string | null
): Promise<RosterAudience> => {
  const template = templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: templateId } })
    : null
  // An interview with responsables convenes them too
  if (template?.purpose) return { includeLeadership: true }
  if (!template?.rollCall) return {}

  return {
    includeLeadership: true,
    responsables: template.visibility === EventVisibilities.Responsables && !template.functionName,
    team: template.functionName ? { youtuberId, functionName: template.functionName } : null,
  }
}

/**
 * Fill the blanks of a payload from its template
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {Promise<ReturnType<typeof toEntryData>>} - Payload the template completed
 */

const fillFromTemplate = async (data: ReturnType<typeof toEntryData>) => {
  if (!data.templateId) return data

  const template = await prisma.eventTemplate.findUnique({ where: { id: data.templateId } })
  if (!template) return data

  const allDay = data.allDay || template.allDay

  // A team meeting is shown to the team of the creator for its function
  const team =
    template.functionName && data.youtuberId
      ? await prisma.team.findFirst({
          where: functionTeamWhere(data.youtuberId, template.functionName),
          select: { id: true, leads: { select: { accountId: true }, take: 1 } },
        })
      : null
  if (template.functionName && !team) {
    throw invalidInput([{ field: 'youtuberId', message: FORM_COPY.required }])
  }

  return {
    ...data,
    rollCall: data.rollCall || template.rollCall,
    // The template is a pre-designed thing
    kind: template.kind,
    description: data.description ?? template.body,
    visibility: data.visibility ?? template.visibility,
    allDay,
    endsAt:
      data.endsAt ??
      (template.defaultMinutes && !allDay
        ? new Date(data.startsAt.getTime() + template.defaultMinutes * MINUTE_MS)
        : null),
    ...(team && {
      visibility: EventVisibilities.Team,
      audienceTeamId: team.id,
      audienceSessionId: null,
      // Run by a lead of the team when nobody was named
      accountId: data.accountId ?? team.leads[0]?.accountId ?? null,
    }),
  }
}

/**
 * Open a series of annual review slots and hand them back with the message to show
 * @param {string} templateId - Annual reviews model
 * @param {FormValues} values - Parsed body
 * @param {string} ownerId - Responsable opening it
 * @return {Promise<CalendarEntry>} - First slot, the others in `siblings`
 */

export const openSeries = async (
  templateId: string,
  values: FormValues,
  ownerId: string
): Promise<CalendarEntry> => {
  // Days and hours come from their own fields
  const [firstDay, lastDay] = readList(values, 'slotDays')
  const from = readText(values, 'slotFrom')
  const to = readText(values, 'slotTo')
  const teamId = readText(values, 'slotTeamId')
  if (!teamId) throw invalidInput([{ field: 'slotTeamId', message: FORM_COPY.required }])
  if (!firstDay || !lastDay) {
    throw invalidInput([{ field: 'slotDays', message: FORM_COPY.required }])
  }
  if (!from || !to) throw invalidInput([{ field: 'slotFrom', message: FORM_COPY.required }])

  const opened = await openAnnualSlots(
    {
      templateId,
      teamId,
      startsAt: wallToInstant(`${firstDay.slice(0, 10)}T${from}`),
      endsAt: wallToInstant(`${lastDay.slice(0, 10)}T${to}`),
    },
    ownerId
  )
  const rows = await prisma.calendarEvent.findMany({
    where: { projectId: opened.projectId },
    orderBy: { startsAt: 'asc' },
    include: ENTRY_SHAPE,
  })
  // The period leads, its slots follow
  const ordered = [...rows].sort(
    (left, right) =>
      Number(right.kind === CalendarKinds.Period) - Number(left.kind === CalendarKinds.Period)
  )
  const [first, ...others] = ordered.map((row) => toEntry(row))

  return {
    ...(first as CalendarEntry),
    notice: ANNUAL_REVIEW_COPY.projectCreated,
    siblings: others,
  }
}
