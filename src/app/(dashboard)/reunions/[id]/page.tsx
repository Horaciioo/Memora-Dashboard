import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { MeetingFile } from '@/composites/work/MeetingFile'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { meetingFields, readMeeting, topicFields } from '@/core/services/work/MeetingService'
import { redactMeeting } from '@/core/services/work/redaction'
import {
  assertMeetingVisible,
  currentWorkViewer,
  workViewer,
} from '@/core/services/work/visibility'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { MEETING_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the meeting
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

  try {
    // A hidden file lends no title
    const viewer = await currentWorkViewer()
    if (!viewer) return { title: MEETING_COPY.title }

    await assertMeetingVisible(id, viewer)
    const meeting = await readMeeting(id)

    return { title: meeting.summary.title }
  } catch {
    return { title: MEETING_COPY.title }
  }
}

/**
 * Meeting file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.MeetingRead)
  const perimeter = await scope()
  const viewer = workViewer(session, access)

  const found = await assertMeetingVisible(id, viewer)
    .then(() => readMeeting(id))
    .catch(() => null)
  if (!found) notFound()

  const detail = redactMeeting(found, access)

  const [fields, activity] = await Promise.all([
    meetingFields(perimeter, viewer),
    access.can(Permissions.WorkLogRead) ? readRecordActivity('meeting', id) : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={MEETING_COPY.title} isLabel />
      <BreadcrumbLabel label={detail.summary.title} />
      <MeetingFile
        detail={detail}
        meetingFields={fields}
        topicFields={topicFields()}
        activity={activity}
        canUpdate={access.can(Permissions.MeetingUpdate)}
        canReadContent={access.can(Permissions.MeetingContentRead)}
        canReadLogs={access.can(Permissions.WorkLogRead)}
      />
    </div>
  )
}
