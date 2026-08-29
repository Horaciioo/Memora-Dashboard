import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MeetingFile } from '@/composites/work/MeetingFile'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { meetingFields, readMeeting, topicFields } from '@/core/services/work/MeetingService'
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
  const { access, scope } = await requirePermission(Permissions.MeetingRead)
  const perimeter = await scope()

  const detail = await readMeeting(id).catch(() => null)
  if (!detail) notFound()

  const [fields, activity] = await Promise.all([
    meetingFields(perimeter),
    readRecordActivity('meeting', id),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <MeetingFile
        detail={detail}
        meetingFields={fields}
        topicFields={topicFields()}
        activity={activity}
        canUpdate={access.can(Permissions.MeetingUpdate)}
      />
    </div>
  )
}
