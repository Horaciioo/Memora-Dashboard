import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { MeetingsBoard } from '@/composites/work/MeetingsBoard'
import { listMeetings, meetingFields } from '@/core/services/work/MeetingService'
import { boardColumns, projectOptions, youtuberOptions } from '@/core/services/work/shared'
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
  const { access, scope } = await requirePermission(Permissions.MeetingRead)
  const perimeter = await scope()

  const [meetings, columns, fields, youtubers, projects] = await Promise.all([
    listMeetings(perimeter),
    boardColumns(WorkflowScopes.Meeting),
    meetingFields(perimeter),
    youtuberOptions(),
    projectOptions(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MEETING_COPY.title} lead={MEETING_COPY.lead} />
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
