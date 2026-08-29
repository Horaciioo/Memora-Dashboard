import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { CalendarBoard } from '@/composites/calendar/CalendarBoard'
import {
  calendarFields,
  countTemplates,
  listEntries,
} from '@/core/services/calendar/CalendarService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { gridRange, monthGrid, toDayKey } from '@/utils/format/calendar'

export const metadata: Metadata = { title: CALENDAR_COPY.title }

/**
 * Shared calendar, opening on the current month
 * @return {Promise<JSX.Element>} - Calendar page
 */

export default async function CalendarPage() {
  const { session, access, scope } = await requirePermission(Permissions.CalendarRead)
  const perimeter = await scope()

  const anchor = toDayKey(new Date())
  const { from, to } = gridRange(monthGrid(anchor))

  const [entries, fields, templateCount] = await Promise.all([
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

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={CALENDAR_COPY.title} lead={CALENDAR_COPY.lead} />
      <CalendarBoard
        initialEntries={entries}
        fields={fields}
        anchor={anchor}
        hasTemplates={templateCount > 0}
        canManage={access.can(Permissions.CalendarManage)}
      />
    </div>
  )
}
