'use client'

import { useRouter } from 'next/navigation'
import { Status } from '@/components/elements/display/Status'
import { CreatorLabels } from '@/components/elements/display/RecordLabel'
import { OptionMark } from '@/components/elements/forms/selects/OptionMark'
import { Glyph } from '@/components/elements/display/glyphs/Glyph'
import { OverdueMark } from '@/composites/work/OverdueMark'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'

import { PROJECT_COPY, BOARD_FILTER_COPY, TASK_COPY } from '@/declarations/work/copy'
import type { BoardColumn } from '@/components/structures/data/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { ProjectSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDay } from '@/utils/format/dates'

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
 * Project board
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
      render: (project) => (
        <span className="font-medium">
          <Glyph value={project.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
          {project.title}
        </span>
      ),
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      render: (project) => (
        <CreatorLabels
          creators={project.youtubers.map((youtuber) => ({
            name: youtuber.label,
            image: youtuber.image,
          }))}
        />
      ),
    },
    {
      key: 'state',
      header: FIELD_COPY.state,
      sortValue: (project) => project.state?.label ?? '',
      render: (project) =>
        project.state ? (
          <Status label={project.state.label} accent={project.state.accent} icon="statusDot" />
        ) : null,
    },
    {
      key: 'priority',
      header: FIELD_COPY.priority,
      render: (project) =>
        project.priority ? (
          <span className="inline-flex items-center gap-2">
            <OptionMark
              mark="priority"
              option={{
                value: project.priority.id,
                label: project.priority.label,
                accent: project.priority.accent ?? undefined,
              }}
            />
            <Status
              label={project.priority.label}
              accent={project.priority.accent}
              tone="warning"
            />
          </span>
        ) : null,
    },
    {
      key: 'platform',
      header: FIELD_COPY.platform,
      render: (project) =>
        project.platform ? (
          <span className="inline-flex items-center gap-2">
            <OptionMark
              mark="network"
              option={{ value: project.platform.id, label: project.platform.label }}
            />
            <Status label={project.platform.label} tone="neutral" />
          </span>
        ) : null,
    },
    {
      key: 'leads',
      header: FIELD_COPY.lead,
      render: (project) => project.leads.map((person) => person.name).join(', ') || null,
    },
    {
      key: 'deadline',
      header: FIELD_COPY.deadline,
      sortValue: (project) => project.deadline ?? '',
      className: 'whitespace-nowrap',
      render: (project) =>
        project.deadline ? (
          <span className="inline-flex items-center gap-2">
            <Status
              label={formatDay(project.deadline)}
              tone={project.isOverdue ? 'danger' : 'neutral'}
              icon="deadline"
            />
            {project.isOverdue && <OverdueMark kind="project" />}
          </span>
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
      columnField="stateId"
      copy={PROJECT_COPY}
      figure="projects"
      isRemovable={(project) => !project.isSystem || project.isSeries}
      deleteNote={(project) => (project.isSeries ? PROJECT_COPY.deleteSeriesNote : null)}
      tableColumns={tableColumns}
      filters={[
        {
          name: 'youtuber',
          label: BOARD_FILTER_COPY.youtuber,
          allLabel: BOARD_FILTER_COPY.allYoutubers,
          options: youtubers,
          mark: 'avatar',
        },
        {
          name: 'priority',
          label: BOARD_FILTER_COPY.priority,
          allLabel: BOARD_FILTER_COPY.allPriorities,
          options: priorities,
          mark: 'priority',
        },
        {
          name: 'platform',
          label: BOARD_FILTER_COPY.platform,
          allLabel: BOARD_FILTER_COPY.allPlatforms,
          options: platforms,
          mark: 'network',
        },
      ]}
      matches={(project, search, filters) => {
        if (search.length > 0 && !project.title.toLowerCase().includes(search)) return false
        if (filters.youtuber && !project.youtubers.some((item) => item.id === filters.youtuber))
          return false
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
      tintByColumn
      renderCard={(project) => (
        <div>
          {project.isSystem && (
            <Status label={TASK_COPY.systemTag} tone="danger" className="mb-1 flex" />
          )}
          <p className={BOARD_STYLES.cardTitle}>
            <Glyph value={project.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
            {project.title}
          </p>
        </div>
      )}
    />
  )
}
