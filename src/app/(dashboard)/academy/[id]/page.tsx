import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { CopyInviteLink } from '@/composites/academy/CopyInviteLink'
import { SessionPanel } from '@/composites/academy/SessionPanel'
import { prisma } from '@/core/lib/db'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  stepFields,
  juniorCandidates,
  juniorFields,
  readSession,
} from '@/core/services/academy/AcademyService'
import { calendarFields, listEntries } from '@/core/services/calendar/CalendarService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { toTone } from '@/declarations/ui/theme'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatDay } from '@/utils/format/dates'
import { gridRange, monthGrid, toDayKey } from '@/utils/format/calendar'

/**
 * Name the browser tab after the session
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { session, access } = await requirePermission(Permissions.AcademyRead)

  try {
    const { summary } = await readSession(id, academyScope(session, access))

    return { title: `${summary.function.name} • ${formatDay(summary.startsAt)}` }
  } catch {
    return { title: ACADEMY_COPY.title }
  }
}

/**
 * One academy session, its juniors and its thread
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Session page
 */

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access } = await requirePermission(Permissions.AcademyRead)

  const detail = await readSession(id, academyScope(session, access)).catch(() => null)
  if (!detail) notFound()

  const anchor = toDayKey(new Date())
  const { from, to } = gridRange(monthGrid(anchor))

  const [juniors, steps, candidates, entries, fields, typeCount] = await Promise.all([
    juniorFields(id),
    stepFields(id),
    juniorCandidates(id),
    listEntries({
      from: new Date(from),
      to: new Date(to),
      viewerId: session.id,
      access,
      sessionId: id,
    }),
    calendarFields(),
    prisma.eventType.count({ where: { archived: false } }),
  ])

  const jobFunction = detail.summary.function

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={ACADEMY_COPY.confidential}
        title={`${jobFunction.name} • ${formatDay(detail.summary.startsAt)}`}
        lead={detail.summary.summary ?? jobFunction.summary ?? undefined}
        actions={
          <span className="flex items-center gap-2">
            {detail.summary.inviteToken && <CopyInviteLink token={detail.summary.inviteToken} />}
            <Badge label={jobFunction.name} tone={toTone(jobFunction.accent, 'brand')} dot />
          </span>
        }
      />
      <SessionPanel
        detail={detail}
        juniorFields={juniors}
        stepFields={steps}
        hasCandidates={candidates.length > 0}
        canManage={access.can(Permissions.AcademyManage)}
        calendarEntries={entries}
        calendarFields={fields}
        calendarAnchor={anchor}
        hasCalendarTypes={typeCount > 0}
        canManageCalendar={access.can(Permissions.CalendarManage)}
      />
    </div>
  )
}
