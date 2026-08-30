import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/elements/actions/Button'
import { PageHeader } from '@/components/structures/PageHeader'
import { CalendarBoard } from '@/composites/calendar/CalendarBoard'
import {
  calendarFields,
  countTemplates,
  getEntry,
  listEntries,
} from '@/core/services/calendar/CalendarService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { gridRange, monthGrid, toDayKey } from '@/utils/format/calendar'

export const metadata: Metadata = { title: CALENDAR_COPY.title }

// Query key of the entry a deep link opens straight onto
const FOCUS_PARAM = 'evenement'

/**
 * Shared calendar, opening on the current month or on a linked entry
 * @param {Object} props - Route props
 * @param {Promise<Record<string, string | string[] | undefined>>} props.searchParams - URL query
 * @return {Promise<JSX.Element>} - Calendar page
 */

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { session, access, scope } = await requirePermission(Permissions.CalendarRead)
  const perimeter = await scope()

  const raw = (await searchParams)[FOCUS_PARAM]
  const focusEntryId = typeof raw === 'string' ? raw : undefined

  // A deep link anchors the grid on the linked entry's month
  const focusEntry = focusEntryId
    ? await getEntry(focusEntryId, session.id, access, perimeter)
    : null

  const anchor = toDayKey(focusEntry ? new Date(focusEntry.startsAt) : new Date())
  const { from, to } = gridRange(monthGrid(anchor))

  const [window, fields, templateCount] = await Promise.all([
    listEntries({
      from: new Date(from),
      to: new Date(to),
      viewerId: session.id,
      access,
      scope: perimeter,
    }),
    calendarFields(perimeter),
    countTemplates(),
  ])

  // The linked entry joins the window when the visibility filter left it out
  const entries =
    focusEntry && !window.some((entry) => entry.id === focusEntry.id)
      ? [...window, focusEntry]
      : window

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={CALENDAR_COPY.title}
        lead={CALENDAR_COPY.lead}
        actions={
          <Link href={ROUTES.calendarLegend}>
            <Button variant="icon" icon="info" aria-label={CALENDAR_COPY.legendInfo} />
          </Link>
        }
      />
      <CalendarBoard
        initialEntries={entries}
        fields={fields}
        anchor={anchor}
        hasTemplates={templateCount > 0}
        canManage={access.can(Permissions.CalendarManage)}
        focusEntryId={focusEntry ? focusEntryId : undefined}
      />
    </div>
  )
}
