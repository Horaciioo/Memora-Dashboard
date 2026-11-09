import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { parseAudience, audienceYoutuberId } from '@/core/services/calendar/audience'
import type { FormValues } from '@/types/forms'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
import type { CalendarKindName } from '@/utils/constants/workflow'

/**
 * Turn parsed values into an entry payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

export const toEntryData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  emoji: readText(values, 'emoji'),
  description: readText(values, 'description'),
  kind: (readText(values, 'kind') ?? CalendarKinds.Event) as CalendarKindName,
  templateId: readText(values, 'templateId'),
  accountId: readText(values, 'accountId'),
  ...parseAudience(values),
  startsAt: readDate(values, 'startsAt') ?? new Date(),
  endsAt: readDate(values, 'endsAt'),
  // Zones and periods span whole days
  allDay:
    readFlag(values, 'allDay') ||
    [CalendarKinds.Zone, CalendarKinds.Period].some((kind) => kind === readText(values, 'kind')),
  // A creator team names its creator
  youtuberId: audienceYoutuberId(values) ?? readText(values, 'youtuberId'),
  projectId: readText(values, 'projectId'),
  rollCall: readFlag(values, 'rollCall'),
  remindAt: readDate(values, 'remindAt'),
  rollCallTeamIds: readList(values, 'teamIds'),
  // An academy template fixes these afterwards
  juniorId: null as string | null,
  referentId: null as string | null,
})
