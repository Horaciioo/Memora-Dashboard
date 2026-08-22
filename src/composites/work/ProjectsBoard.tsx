'use client'

import { useRouter } from 'next/navigation'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import { PROJECT_COPY, BOARD_FILTER_COPY } from '@/declarations/work/copy'
import type { BoardColumn } from '@/components/structures/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/DataTable'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { ProjectSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay, formatRelativeDay, isOverdue } from '@/utils/format/dates'

export interface ProjectsBoardProps {
  initialProjects: ProjectSummary[]
  columns: BoardColumn[]
  fields: FieldDefinition[]
  youtubers: FieldOption[]
  priorities: FieldOption[]
  platforms: FieldOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

/**
 * Project board, its cards carrying the YouTuber, the priority and the deadline
 * @param {ProjectSummary[]} initialProjects - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the project form
 * @param {FieldOption[]} youtubers - YouTuber filter options
 * @param {FieldOption[]} priorities - Priority filter options
 * @param {FieldOption[]} platforms - Platform filter options
 * @param {boolean} canCreate - Member may open a project
 * @param {boolean} canUpdate - Member may edit a project
 * @param {boolean} canDelete - Member may drop a project
 * @return {JSX.Element}
 */

export const ProjectsBoard = ({
  initialProjects,
  columns,
  fields,
  youtubers,
  priorities,
  platforms,
  canCreate,
  canUpdate,
  canDelete,
}: ProjectsBoardProps) => {
  const router = useRouter()

  const tableColumns: DataTableColumn<ProjectSummary>[] = [
    {
      key: 'title',
      header: FIELD_COPY.title,
      sortValue: (project) => project.title.toLowerCase(),
      render: (project) => <span className="font-medium">{project.title}</span>,
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      render: (project) =>
        project.youtuber ? (
          <Badge label={project.youtuber.label} tone={toTone(project.youtuber.accent, 'info')} />
        ) : null,
    },
    {
      key: 'state',
      header: FIELD_COPY.state,
      sortValue: (project) => project.state?.label ?? '',
      render: (project) =>
        project.state ? (
          <Badge label={project.state.label} tone={toTone(project.state.accent)} dot />
        ) : null,
    },
    {
      key: 'priority',
      header: FIELD_COPY.priority,
      render: (project) =>
        project.priority ? (
          <Badge label={project.priority.label} tone={toTone(project.priority.accent, 'warning')} />
        ) : null,
    },
    {
      key: 'lead',
      header: FIELD_COPY.lead,
      render: (project) => project.lead?.name ?? null,
    },
    {
      key: 'deadline',
      header: FIELD_COPY.deadline,
      sortValue: (project) => project.deadline ?? '',
      className: 'whitespace-nowrap',
      render: (project) =>
        project.deadline ? (
          <Badge
            label={formatDay(project.deadline)}
            tone={isOverdue(project.deadline) ? 'danger' : 'neutral'}
            icon="deadline"
          />
        ) : null,
    },
  ]

  return (
    <WorkBoard<ProjectSummary>
      scope={WorkflowScopes.Project}
      endpoints={{ collection: API_ROUTES.projects, item: API_ROUTES.project }}
      initialCards={initialProjects}
      columns={columns}
      fields={fields}
      copy={PROJECT_COPY}
      figure="projects"
      tableColumns={tableColumns}
      filters={[
        {
          name: 'youtuber',
          label: BOARD_FILTER_COPY.youtuber,
          allLabel: BOARD_FILTER_COPY.allYoutubers,
          options: youtubers,
        },
        {
          name: 'priority',
          label: BOARD_FILTER_COPY.priority,
          allLabel: BOARD_FILTER_COPY.allPriorities,
          options: priorities,
        },
        {
          name: 'platform',
          label: BOARD_FILTER_COPY.platform,
          allLabel: BOARD_FILTER_COPY.allPlatforms,
          options: platforms,
        },
      ]}
      matches={(project, search, filters) => {
        if (search.length > 0 && !project.title.toLowerCase().includes(search)) return false
        if (filters.youtuber && project.youtuber?.id !== filters.youtuber) return false
        if (filters.priority && project.priority?.id !== filters.priority) return false
        if (filters.platform && project.platform?.id !== filters.platform) return false

        return true
      }}
      valuesOf={(project) => project.values}
      labelOf={(project) => project.title}
      onOpen={(project) => router.push(ROUTES.project(project.id))}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      renderCard={(project) => (
        <>
          <p className={BOARD_STYLES.cardTitle}>{project.title}</p>
          <div className={BOARD_STYLES.cardMeta}>
            {project.youtuber && (
              <Badge
                label={project.youtuber.label}
                tone={toTone(project.youtuber.accent, 'info')}
                icon="youtuber"
              />
            )}
            {project.priority && (
              <Badge
                label={project.priority.label}
                tone={toTone(project.priority.accent, 'warning')}
              />
            )}
            {project.platform && <Badge label={project.platform.label} tone="neutral" />}
          </div>
          <div className={BOARD_STYLES.cardMeta}>
            {project.deadline && (
              <Badge
                label={formatRelativeDay(project.deadline)}
                tone={isOverdue(project.deadline) ? 'danger' : 'neutral'}
                icon="deadline"
              />
            )}
            <span className="ml-auto">
              <AvatarStack
                people={[...(project.lead ? [project.lead] : []), ...project.assistants].map(
                  (person) => ({ id: person.id, name: person.name, src: person.src })
                )}
              />
            </span>
          </div>
        </>
      )}
    />
  )
}
