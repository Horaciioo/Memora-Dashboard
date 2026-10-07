import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/structures/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { ProjectFileTabs } from '@/composites/work/ProjectFileTabs'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { meetingFields } from '@/core/services/work/MeetingService'
import {
  communicationFields,
  projectFields,
  readProject,
} from '@/core/services/work/ProjectService'
import { creatableTaskFields, taskFields } from '@/core/services/work/TaskService'
import { assertProjectVisible, workViewer } from '@/core/services/work/visibility'
import { mentionOptions } from '@/core/services/work/DiscordDirectory'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { PROJECT_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the project
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
    const project = await readProject(id)

    return { title: project.summary.title }
  } catch {
    return { title: PROJECT_COPY.title }
  }
}

/**
 * Project file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.ProjectRead)
  const perimeter = await scope()
  const viewer = workViewer(session, access)

  const detail = await assertProjectVisible(id, viewer)
    .then(() => readProject(id))
    .catch(() => null)
  if (!detail) notFound()

  const [projectForm, taskForm, meetingForm, communicationForm, activity] = await Promise.all([
    projectFields(perimeter),
    taskFields(perimeter, viewer),
    meetingFields(perimeter, viewer),
    mentionOptions(detail.summary.youtuber?.id ?? null).then(communicationFields),
    access.can(Permissions.WorkLogRead) ? readRecordActivity('project', id) : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={PROJECT_COPY.title} isLabel />
      <BreadcrumbLabel label={detail.summary.title} />
      <ProjectFileTabs
        detail={detail}
        projectFields={projectForm}
        taskFields={access.can(Permissions.TaskManage) ? taskForm : creatableTaskFields(taskForm)}
        meetingFields={meetingForm}
        communicationFields={communicationForm}
        activity={activity}
        canUpdate={access.can(Permissions.ProjectUpdate)}
        canReadLogs={access.can(Permissions.WorkLogRead)}
        canCreateTasks={access.can(Permissions.TaskCreate)}
        canReadTasks={access.can(Permissions.TaskRead)}
        canCreateMeetings={access.can(Permissions.MeetingCreate)}
        canReadMeetings={access.can(Permissions.MeetingRead)}
        canReadCommunications={access.can(Permissions.CommunicationRead)}
        canWriteCommunications={access.can(Permissions.CommunicationWrite)}
      />
    </div>
  )
}
