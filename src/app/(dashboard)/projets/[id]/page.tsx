import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectFileTabs } from '@/composites/work/ProjectFileTabs'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { meetingFields } from '@/core/services/work/MeetingService'
import {
  communicationFields,
  projectFields,
  readProject,
} from '@/core/services/work/ProjectService'
import { taskFields } from '@/core/services/work/TaskService'
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
  const { access, scope } = await requirePermission(Permissions.ProjectRead)
  const perimeter = await scope()

  const detail = await readProject(id).catch(() => null)
  if (!detail) notFound()

  const [projectForm, taskForm, meetingForm, communicationForm, activity] = await Promise.all([
    projectFields(perimeter),
    taskFields(perimeter),
    meetingFields(perimeter),
    communicationFields(),
    readRecordActivity('project', id),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <ProjectFileTabs
        detail={detail}
        projectFields={projectForm}
        taskFields={taskForm}
        meetingFields={meetingForm}
        communicationFields={communicationForm}
        activity={activity}
        canUpdate={access.can(Permissions.ProjectUpdate)}
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
