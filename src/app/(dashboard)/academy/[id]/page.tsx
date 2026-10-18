import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { SessionPanel } from '@/composites/academy/SessionPanel'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  juniorCandidates,
  juniorFields,
  readSession,
  sessionFields,
} from '@/core/services/academy/AcademyService'
import { calendarFields, listEntries } from '@/core/services/calendar/CalendarService'
import { commentFields } from '@/core/lib/forms'
import { listSessionComments } from '@/core/services/academy/juniors/CommentService'
import { readPeriods } from '@/core/services/academy/parkour/PeriodService'
import { REVIEW_FIELDS } from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'

import { PAGE_STYLES } from '@/declarations/ui/variants'
import { readSessionActivity } from '@/core/services/academy/SessionActivity'
import { workViewer } from '@/core/services/work/visibility'
import { Permissions } from '@/utils/constants/permissions'
import { sessionTitle } from '@/utils/format/academy'
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

    return { title: `${sessionTitle(summary)} • ${formatDay(summary.startsAt)}` }
  } catch {
    return { title: ACADEMY_COPY.title }
  }
}

/**
 * One academy session
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Session page
 */

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.AcademyRead)

  const detail = await readSession(id, academyScope(session, access)).catch(() => null)
  if (!detail) notFound()

  const anchor = toDayKey(new Date())
  const { from, to } = gridRange(monthGrid(anchor))
  const canReadLogs = access.can(Permissions.WorkLogRead)
  const canReadNotes = access.can(Permissions.AcademyNoteRead)

  const [sessionForm, juniors, candidates, entries, calendarForm, periods, comments, activity] =
    await Promise.all([
      sessionFields(detail.summary.recruitment?.youtuberId),
      juniorFields(id),
      juniorCandidates(id),
      listEntries({
        from: new Date(from),
        to: new Date(to),
        viewerId: session.id,
        access,
        scope: await scope(),
        sessionId: id,
      }),
      calendarFields(undefined, workViewer(session, access), academyScope(session, access)),
      readPeriods(id),
      canReadNotes ? listSessionComments(id, academyScope(session, access)) : Promise.resolve([]),
      canReadLogs ? readSessionActivity(id, detail.juniors) : Promise.resolve([]),
    ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={ACADEMY_COPY.title} isLabel />
      <BreadcrumbLabel label={sessionTitle(detail.summary)} />
      <SessionPanel
        detail={detail}
        activity={activity}
        hasCandidates={candidates.length > 0}
        fields={{
          session: sessionForm,
          junior: juniors,
          calendar: calendarForm,
          review: REVIEW_FIELDS,
          comment: commentFields(),
        }}
        can={{
          viewerId: session.id,
          manage: access.can(Permissions.AcademyManage),
          lead: access.isResponsable,
          manageCalendar: access.can(Permissions.CalendarManage),
          readLogs: canReadLogs,
          readNotes: canReadNotes,
          writeNotes: access.can(Permissions.AcademyNoteWrite),
          writeReviews: access.can(Permissions.AcademyReviewWrite),
          validateReviews: access.can(Permissions.AcademyReviewValidate),
        }}
        calendar={{ entries, anchor }}
        periods={periods}
        comments={comments}
      />
    </div>
  )
}
