import 'server-only'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { invalidInput, notFound } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import {
  expandRoster,
  notifyConvened,
  pruneRoster,
  readRosterFor,
  syncRoster,
} from '@/core/services/calendar/attendance'
import {
  cancelLivesOfEntries,
  openLive,
  readLiveInput,
  readLiveTemplates,
  withTemplatePlatform,
  syncLiveWithEntry,
} from '@/core/services/lives/LiveService'
import { assertLiveSlotFree, assertNoLiveClash } from '@/core/services/lives/LiveClashService'
import { audienceYoutuberId } from '@/core/services/calendar/audience'
import { emojiOrRandom } from '@/core/lib/work'
import { reshapeSeries } from '@/core/services/calendar/AnnualSlotService'
import { instantToWall, wallToInstant } from '@/utils/format/zone'
import { CALENDAR_FIELD_INFO } from '@/declarations/calendar/copy'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { resolveAcademyEntry } from '@/core/services/calendar/academyEntries'
import { CALENDAR_SETTINGS } from '@/declarations/configurations/settings'
import { FORM_COPY } from '@/declarations/ui/copy'
import type { CalendarEntry } from '@/types/calendar'
import type { FormValues } from '@/types/forms'
import { CalendarKinds, EventVisibilities } from '@/utils/constants/workflow'
import { DAY_MS } from '@/utils/constants/time'
import { ENTRY_SHAPE, toEntry } from '@/core/services/calendar/CalendarService/reads'
import { toEntryData } from '@/core/services/calendar/CalendarService/entryData'
import {
  applyTemplate,
  openSeries,
  templateAudience,
} from '@/core/services/calendar/CalendarService/templates'
import {
  fileLinkedZone,
  readLinkedZone,
} from '@/core/services/calendar/CalendarService/linkedZones'
import {
  dropMeetingCards,
  fileMeeting,
  syncMeetingCard,
} from '@/core/services/calendar/CalendarService/meetingCards'

/**
 * Refuse an entry ending before it starts
 * @param {ReturnType<typeof toEntryData>} data - Payload read off the form
 * @return {void} - Throws on an end behind the start
 */

const assertEndAfterStart = (data: ReturnType<typeof toEntryData>): void => {
  if (data.endsAt && data.endsAt < data.startsAt) {
    throw invalidInput([{ field: 'endsAt', message: FORM_COPY.endBeforeStart }])
  }
}

/**
 * Who writes entries
 * @typedef {Object} EntryWriter
 * @property {AccessScope} scope - Creator perimeter
 * @property {string} viewerId - Member identifier
 * @property {boolean} canManage - Manage permission
 * @property {AcademyScope} academy - Plannable juniors
 */

export interface EntryWriter {
  scope: AccessScope
  viewerId: string
  canManage: boolean
  academy: AcademyScope
}

/**
 * Settle when the reminder fires
 * @param {Date} startsAt - Event start
 * @param {Date | null} remindAt - Moment picked on the form
 * @return {Date | null} - Reminder moment
 */

const resolveRemindAt = (startsAt: Date, remindAt: Date | null): Date | null => {
  if (remindAt) return remindAt

  // Reminder hour on the team clock
  const day = instantToWall(
    new Date(startsAt.getTime() - CALENDAR_SETTINGS.rollCallReminderLeadDays * DAY_MS)
  ).slice(0, 10)
  const hour = String(CALENDAR_SETTINGS.rollCallReminderHour).padStart(2, '0')
  const at = wallToInstant(`${day}T${hour}:00`)

  return at.getTime() <= Date.now() ? null : at
}

// Rescheduled reminders fire again
const rearm = (remindAt: Date | null, current: { remindAt: Date | null } | null) =>
  remindAt?.getTime() === current?.remindAt?.getTime()
    ? { remindAt }
    : { remindAt, remindedAt: null }

/**
 * Apply new days and hours to a series of slots
 * @param {string} periodId - Period of the series
 * @param {FormValues} values - Parsed body
 * @return {Promise<CalendarEntry>} - The period, new slots in `siblings`, dropped ones in `dropped`
 */

const reshapeEntry = async (periodId: string, values: FormValues): Promise<CalendarEntry> => {
  const [firstDay, lastDay] = readList(values, 'slotDays')
  const from = readText(values, 'slotFrom')
  const to = readText(values, 'slotTo')
  if (!firstDay || !lastDay) {
    throw invalidInput([{ field: 'slotDays', message: FORM_COPY.required }])
  }
  if (!from || !to) throw invalidInput([{ field: 'slotFrom', message: FORM_COPY.required }])

  const { created, removed } = await reshapeSeries(periodId, {
    firstDay: firstDay.slice(0, 10),
    lastDay: lastDay.slice(0, 10),
    from,
    to,
  })

  const rows = await prisma.calendarEvent.findMany({
    where: { id: { in: [periodId, ...created] } },
    include: ENTRY_SHAPE,
  })
  const entries = rows.map((row) => toEntry(row))
  const period = entries.find((entry) => entry.id === periodId) as CalendarEntry

  return {
    ...period,
    siblings: entries.filter((entry) => entry.id !== periodId),
    dropped: removed,
  }
}

/**
 * Post an entry on the calendar
 * @param {string} ownerId - Who posts it
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {AcademyScope} academy - Juniors the member may plan for
 * @return {Promise<CalendarEntry>} - Created entry
 */

export const createEntry = async (
  ownerId: string,
  values: FormValues,
  scope: AccessScope,
  academy: AcademyScope
): Promise<CalendarEntry> => {
  const base = toEntryData(values)
  assertEndAfterStart(base)

  // A model that opens slots makes a whole series, not one entry
  const slotTemplate = base.templateId
    ? await prisma.eventTemplate.findUnique({ where: { id: base.templateId } })
    : null
  if (slotTemplate?.slotMinutes) return openSeries(slotTemplate.id, values, ownerId)

  // A zone tied to a session is never typed in by hand, the session carries it
  const linkedZone = await readLinkedZone(base.templateId)
  if (linkedZone) return fileLinkedZone(linkedZone, base, values)

  const { memberIds: convened, ...fixed } = await resolveAcademyEntry(
    base.templateId,
    values,
    ownerId,
    academy
  )
  const applied = await applyTemplate({ ...base, ...fixed })
  // Nobody picked a glyph, one is drawn at random
  applied.emoji = emojiOrRandom(applied.emoji)

  // A live is checked before anything is written, and always calls the roll
  const liveTemplates = await readLiveTemplates()
  const isLive = applied.templateId !== null && liveTemplates.has(applied.templateId)
  const live = isLive ? await readLiveInput(withTemplatePlatform(values, liveTemplates)) : null
  if (live) await assertNoLiveClash({ ...live, startsAt: applied.startsAt, endsAt: applied.endsAt })
  const data = live ? { ...applied, rollCall: true, youtuberId: live.youtuberId } : applied

  const row = await prisma.calendarEvent.create({
    data: {
      ownerId,
      ...data,
      remindAt: data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null,
    },
    include: ENTRY_SHAPE,
  })

  if (live) {
    // The live convenes its team and asks its Coordinators itself
    await openLive({
      entry: row,
      live: {
        ...live,
        pickedIds: [],
      },
      actorId: ownerId,
      scope,
    })

    const fresh = await prisma.calendarEvent.findUnique({
      where: { id: row.id },
      include: ENTRY_SHAPE,
    })

    return toEntry(fresh ?? row, await readRosterFor(row.id, ownerId, true))
  }

  if (!data.rollCall) return toEntry(row)

  // Fan the roll-call out to its convened members
  const memberIds = await expandRoster(
    data.rollCallTeamIds,
    convened ?? readList(values, 'memberIds'),
    scope,
    data.startsAt,
    {
      everyone: data.visibility === EventVisibilities.Everyone,
      youtuberId: audienceYoutuberId(values),
      ...(await templateAudience(data.templateId, data.youtuberId)),
    }
  )
  await syncRoster(row.id, memberIds)
  await notifyConvened({ id: row.id, title: row.title, ownerId }, memberIds)
  await fileMeeting(row, ownerId, memberIds)

  const fresh = await prisma.calendarEvent.findUnique({
    where: { id: row.id },
    include: ENTRY_SHAPE,
  })

  return toEntry(fresh ?? row, await readRosterFor(row.id, ownerId, true))
}

/**
 * Edit an entry
 * @param {string} id - Entry identifier
 * @param {FormValues} sent - Parsed body
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} viewerId - Signed-in member identifier
 * @param {boolean} canManage - Viewer holds the manage permission
 * @param {AcademyScope} academy - Juniors the member may plan for
 * @return {Promise<CalendarEntry>} - Updated entry
 */

export const updateEntry = async (
  id: string,
  sent: FormValues,
  scope: AccessScope,
  viewerId: string,
  canManage: boolean,
  academy: AcademyScope
): Promise<CalendarEntry> => {
  // A series of slots is reshaped through its days and hours, the entry itself holds none of the usual fields
  const stored = await prisma.calendarEvent.findUnique({ where: { id }, include: ENTRY_SHAPE })
  if (!stored) throw notFound()
  if (stored.template?.slotMinutes && stored.kind === CalendarKinds.Period) {
    return reshapeEntry(id, sent)
  }

  // Hidden fields keep their value
  const values: FormValues = { ...toEntry(stored).values, ...sent }
  const base = toEntryData(values)
  assertEndAfterStart(base)
  const { memberIds: convened, ...fixed } = await resolveAcademyEntry(
    base.templateId,
    values,
    viewerId,
    academy
  )
  const applied = await applyTemplate({ ...base, ...fixed })
  // A live always calls the roll
  const liveTemplates = await readLiveTemplates()
  const isLive = applied.templateId !== null && liveTemplates.has(applied.templateId)
  const data = isLive ? { ...applied, rollCall: true } : applied
  if (isLive) await assertLiveSlotFree(id, data.startsAt, data.endsAt)

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...data,
      ...rearm(data.rollCall ? resolveRemindAt(data.startsAt, data.remindAt) : null, stored),
    },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id, withTemplatePlatform(values, liveTemplates), viewerId)

  // The card of the Réunions page follows its entry
  await syncMeetingCard(row)

  // A live keeps the team it convened, its audience never widens the roll
  if (isLive) return toEntry(row, await readRosterFor(id, viewerId, canManage))
  if (!data.rollCall) return toEntry(row)

  // Members the old audience brought
  const known = new Set(row.attendances.map((seat) => seat.accountId))
  const formerAudience = stored.rollCall
    ? new Set(
        await expandRoster(stored.rollCallTeamIds, [], scope, stored.startsAt, {
          everyone: stored.visibility === EventVisibilities.Everyone,
          youtuberId: audienceYoutuberId(toEntry(stored).values),
          ...(await templateAudience(stored.templateId, stored.youtuberId)),
        })
      )
    : new Set<string>()
  const named = readList(values, 'memberIds').filter((memberId) => !formerAudience.has(memberId))
  const memberIds = await expandRoster(
    data.rollCallTeamIds,
    convened ?? named,
    scope,
    data.startsAt,
    {
      everyone: data.visibility === EventVisibilities.Everyone,
      youtuberId: audienceYoutuberId(values),
      ...(await templateAudience(data.templateId, data.youtuberId)),
    }
  )
  await syncRoster(id, memberIds)
  await pruneRoster(id, memberIds)
  await notifyConvened(
    { id, title: row.title, ownerId: row.ownerId },
    memberIds.filter((memberId) => !known.has(memberId))
  )

  const fresh = await prisma.calendarEvent.findUnique({ where: { id }, include: ENTRY_SHAPE })

  return toEntry(fresh ?? row, await readRosterFor(id, viewerId, canManage))
}

/**
 * Move an entry to another moment
 * @param {string} id - Entry identifier
 * @param {Date} startsAt - New start
 * @return {Promise<CalendarEntry>} - Moved entry
 */

export const moveEntry = async (id: string, startsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()

  // Dragging never stretches an entry
  const shift = startsAt.getTime() - current.startsAt.getTime()
  const endsAt = current.endsAt ? new Date(current.endsAt.getTime() + shift) : null
  const remindAt = current.remindAt ? new Date(current.remindAt.getTime() + shift) : null
  await assertLiveSlotFree(id, startsAt, endsAt)

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { startsAt, endsAt, ...rearm(remindAt, current) },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id)
  await syncMeetingCard(row)

  return toEntry(row)
}

/**
 * Stretch an entry to a new end
 * @param {string} id - Entry identifier
 * @param {Date} endsAt - New end
 * @return {Promise<CalendarEntry>} - Resized entry
 */

export const resizeEntry = async (id: string, endsAt: Date): Promise<CalendarEntry> => {
  const current = await prisma.calendarEvent.findUnique({ where: { id } })
  if (!current) throw notFound()
  if (endsAt <= current.startsAt) {
    throw invalidInput([{ field: 'endsAt', message: FORM_COPY.endBeforeStart }])
  }
  await assertLiveSlotFree(id, current.startsAt, endsAt)

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: { endsAt },
    include: ENTRY_SHAPE,
  })
  await syncLiveWithEntry(id)
  await syncMeetingCard(row)

  return toEntry(row)
}

/**
 * Drop an entry
 * @param {string} id - Entry identifier
 * @return {Promise<void>} - Removed
 */

export const removeEntry = async (id: string): Promise<void> => {
  await cancelLivesOfEntries([id])
  await dropMeetingCards([id])
  await prisma.calendarEvent.delete({ where: { id } })
}

/**
 * Edit a whole selection
 * @param {string[]} ids - Selected entries
 * @param {FormValues} values - Keys sent
 * @param {EntryWriter} writer - Who edits
 * @return {Promise<CalendarEntry[]>} - Updated entries
 */

export const updateEntries = async (
  ids: string[],
  values: FormValues,
  { scope, viewerId, canManage, academy }: EntryWriter
): Promise<CalendarEntry[]> => {
  // A live is posted one at a time, it needs its platform and its Coordinators
  if ((await readLiveTemplates()).has(readText(values, 'templateId') ?? '')) {
    throw invalidInput([{ field: 'templateId', message: CALENDAR_FIELD_INFO.liveAlone }])
  }

  // Same path as one edit
  const entries: CalendarEntry[] = []
  for (const id of ids) {
    entries.push(await updateEntry(id, values, scope, viewerId, canManage, academy))
  }

  return entries
}

/**
 * Drop a whole selection
 * @param {string[]} ids - Selected entries
 * @return {Promise<void>} - Removed
 */

export const removeEntries = async (ids: string[]): Promise<void> => {
  await cancelLivesOfEntries(ids)
  await dropMeetingCards(ids)
  await prisma.calendarEvent.deleteMany({ where: { id: { in: ids } } })
}
