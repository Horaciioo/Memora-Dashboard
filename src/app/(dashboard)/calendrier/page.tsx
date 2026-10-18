import type { Metadata } from 'next'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { CalendarBoard } from '@/composites/calendar/CalendarBoard'
import {
  calendarFields,
  getEntry,
  listEntries,
  readCalendarScope,
} from '@/core/services/calendar/CalendarService'
import { readLiveTemplateId } from '@/core/services/lives/LiveService'
import { LIVE_PRESET } from '@/declarations/lives/registries'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { CALENDAR_LAYER_REGISTRY } from '@/declarations/calendar/registries'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'
import { gridRange, monthGrid, toDayKey } from '@/utils/format/calendar'

export const metadata: Metadata = { title: CALENDAR_COPY.title }

// Query keys of a deep link: an entry to open, a day to open on, a calendar left on alone
const FOCUS_PARAM = 'evenement'
const DAY_PARAM = 'jour'
const LAYER_PARAM = 'calque'
const PRESET_PARAM = 'modele'

/**
 * Shared calendar
 * @param {Object} props - Route props
 * @param {Promise<Record<string, string | string[] | undefined>>} props.searchParams - URL query
 * @return {Promise<JSX.Element>} - Calendar page
 */

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { session, access } = await requirePermission(Permissions.CalendarRead)
  const perimeter = await readCalendarScope(session, access)

  const canAnnounceLive = access.can(Permissions.LiveAnnounce)
  const preset = (await searchParams)[PRESET_PARAM]

  const raw = (await searchParams)[FOCUS_PARAM]
  const focusEntryId = typeof raw === 'string' ? raw : undefined

  // A deep link anchors the grid on the linked entry's month
  const focusEntry = focusEntryId
    ? await getEntry(focusEntryId, session.id, access, perimeter)
    : null

  const day = (await searchParams)[DAY_PARAM]
  const asked = typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
  const layer = (await searchParams)[LAYER_PARAM]
  const onlyLayer = CALENDAR_LAYER_REGISTRY.keys.find(
    (key) => typeof layer === 'string' && key.toLowerCase() === layer.toLowerCase()
  )

  const anchor = toDayKey(
    focusEntry ? new Date(focusEntry.startsAt) : asked ? new Date(`${asked}T12:00:00`) : new Date()
  )
  const { from, to } = gridRange(monthGrid(anchor))

  const [window, fields, youtubers] = await Promise.all([
    listEntries({
      from: new Date(from),
      to: new Date(to),
      viewerId: session.id,
      access,
      scope: perimeter,
    }),
    calendarFields(
      perimeter,
      workViewer(session, access),
      academyScope(session, access),
      canAnnounceLive
    ),
    youtuberOptions(perimeter),
  ])

  // The Live button of "Live en cours" lands here with the form open on the Live template
  const liveTemplateId =
    canAnnounceLive && preset === LIVE_PRESET ? await readLiveTemplateId() : null

  // The linked entry joins the window when the visibility filter left it out
  const entries =
    focusEntry && !window.some((entry) => entry.id === focusEntry.id)
      ? [...window, focusEntry]
      : window

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={CALENDAR_COPY.title} />
      <CalendarBoard
        initialEntries={entries}
        youtubers={youtubers}
        fields={fields}
        anchor={anchor}
        canManage={access.can(Permissions.CalendarManage)}
        focusEntryId={focusEntry ? focusEntryId : undefined}
        onlyLayer={onlyLayer}
        startWith={liveTemplateId ? { templateId: liveTemplateId } : undefined}
      />
    </div>
  )
}
