import 'server-only'

import { listEntries } from '@/core/services/calendar/CalendarService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { AGENDA_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import type { PermissionHelpers } from '@/types/auth'
import type { BusySlot, FieldDefinition } from '@/types/forms'
import { CalendarSources } from '@/utils/constants/workflow'
import { addDays, startOfDay } from '@/utils/format/days'

// Sources telling something is happening
const HOLDING_SOURCES: string[] = [CalendarSources.Entry, CalendarSources.Meeting]

/**
 * Record an entry stands for
 * @param {string} id - Entry identifier
 * @param {string} source - Entry source
 * @param {string | null} href - Page of the record
 * @return {string} - Record identifier
 */

const refOf = (id: string, source: string, href: string | null): string => {
  const meetingPage = ROUTES.meeting('')
  if (href?.startsWith(meetingPage)) return href.slice(meetingPage.length)

  return source === CalendarSources.Meeting ? id.slice(id.indexOf(':') + 1) : id
}

/**
 * Read the events happening from now on
 * @param {Object} input - Read context
 * @param {string} input.viewerId - Signed-in member
 * @param {PermissionHelpers} input.access - Permission helpers
 * @param {AccessScope} input.scope - Creator perimeter
 * @return {Promise<BusySlot[]>} - Slots held
 */

export const busySlots = async ({
  viewerId,
  access,
  scope,
}: {
  viewerId: string
  access: PermissionHelpers
  scope: AccessScope
}): Promise<BusySlot[]> => {
  const from = startOfDay(new Date())
  const entries = await listEntries({
    from,
    to: addDays(from, AGENDA_SETTINGS.busyHorizonDays),
    viewerId,
    access,
    scope,
  })

  return entries
    .filter((entry) => HOLDING_SOURCES.includes(entry.source))
    .map((entry) => ({
      refId: refOf(entry.id, entry.source, entry.href),
      label: entry.title,
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      allDay: entry.allDay,
    }))
}

/**
 * Attach the busy slots to the date fields of a form
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {string[]} names - Date fields that warn
 * @param {BusySlot[]} slots - Slots held
 * @return {FieldDefinition[]} - Declarations carrying the slots
 */

export const withBusy = (
  fields: FieldDefinition[],
  names: string[],
  slots: BusySlot[]
): FieldDefinition[] =>
  fields.map((field) => (names.includes(field.name) ? { ...field, busy: slots } : field))
