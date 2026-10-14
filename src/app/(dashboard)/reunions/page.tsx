import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { MeetingsBoard } from '@/composites/work/MeetingsBoard'
import { busySlots, withBusy } from '@/core/services/calendar/BusyService'
import { listMeetings, meetingFields } from '@/core/services/work/MeetingService'
import { boardColumns, projectOptions, youtuberOptions } from '@/core/services/work/shared'
import { workViewer } from '@/core/services/work/visibility'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { MEETING_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'
import { WorkflowScopes } from '@/utils/constants/workflow'

export const metadata: Metadata = { title: MEETING_COPY.title }

/**
 * Meeting board
 * @return {Promise<JSX.Element>} - Board page
 */

export default async function MeetingsPage() {
  const { session, access, scope } = await requirePermission(Permissions.MeetingRead)
  const perimeter = await scope()
  const viewer = workViewer(session, access)

  const [meetings, columns, baseFields, slots, youtubers, projects] = await Promise.all([
    listMeetings(perimeter, viewer),
    boardColumns(WorkflowScopes.Meeting),
    meetingFields(perimeter, viewer),
    busySlots({ viewerId: session.id, access, scope: perimeter }),
    youtuberOptions(),
    projectOptions(perimeter, viewer),
  ])

  const fields = withBusy(baseFields, ['scheduledAt'], slots)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MEETING_COPY.title} heroDescription={MEETING_COPY.heroDescription} />
      <MeetingsBoard
        initialMeetings={meetings}
        columns={columns}
        fields={fields}
        youtubers={youtubers}
        projects={projects}
        canCreate={access.can(Permissions.MeetingCreate)}
        canUpdate={access.can(Permissions.MeetingUpdate)}
        canDelete={access.can(Permissions.MeetingDelete)}
      />
    </div>
  )
}
