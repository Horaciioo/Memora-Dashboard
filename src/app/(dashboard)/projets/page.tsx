import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { ProjectsBoard } from '@/composites/work/ProjectsBoard'
import { listProjects, projectFields } from '@/core/services/work/ProjectService'
import {
  boardColumns,
  platformOptions,
  priorityOptions,
  youtuberOptions,
} from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { PROJECT_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'
import { WorkflowScopes } from '@/utils/constants/workflow'

export const metadata: Metadata = { title: PROJECT_COPY.title }

/**
 * Project board
 * @return {Promise<JSX.Element>} - Board page
 */

export default async function ProjectsPage() {
  const { access, scope } = await requirePermission(Permissions.ProjectRead)
  const perimeter = await scope()

  const [projects, columns, fields, youtubers, priorities, platforms] = await Promise.all([
    listProjects(perimeter),
    boardColumns(WorkflowScopes.Project),
    projectFields(perimeter),
    youtuberOptions(),
    priorityOptions(),
    platformOptions(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PROJECT_COPY.title} lead={PROJECT_COPY.lead} />
      <ProjectsBoard
        initialProjects={projects}
        columns={columns}
        fields={fields}
        youtubers={youtubers}
        priorities={priorities}
        platforms={platforms}
        canCreate={access.can(Permissions.ProjectCreate)}
        canUpdate={access.can(Permissions.ProjectUpdate)}
        canDelete={access.can(Permissions.ProjectDelete)}
      />
    </div>
  )
}
