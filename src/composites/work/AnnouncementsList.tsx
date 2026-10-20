'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Status } from '@/components/elements/display/Status'
import type { BoardColumn } from '@/components/structures/data/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { announcementAside } from '@/composites/work/announcementAside'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import {
  ANNOUNCEMENT_COPY,
  ANNOUNCEMENT_ENTITY,
  ANNOUNCEMENT_FILTER_COPY,
  ANNOUNCEMENT_SOURCES,
  COMMUNICATION_STATUS_OPTIONS,
  COMMUNICATION_STATUSES,
} from '@/declarations/work/announcements'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { AnnouncementRow } from '@/types/work'
import { formatDay } from '@/utils/format/dates'

export interface AnnouncementsListProps {
  initialRows: AnnouncementRow[]
  fields: FieldDefinition[]
  platforms: FieldOption[]
  projects: FieldOption[]
  canWrite: boolean
}

// Board columns, one per status
const COLUMNS: BoardColumn[] = COMMUNICATION_STATUS_OPTIONS.map((option) => ({
  id: option.value,
  label: option.label,
  accent: option.accent ?? null,
}))

type Linkage = 'all' | 'with' | 'without'

// Announcements stay on the board once written, only these fold away
const FOLDED = { published: 'PUBLISHED', cancelled: 'CANCELLED' } as const

// Identifier without its source prefix
const recordOf = (id: string): string => id.slice(id.indexOf(':') + 1)

/**
 * Announcements board, a column per status, written here or leading back to where they are edited
 * @param {AnnouncementRow[]} initialRows - Cards resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the announcement form
 * @param {FieldOption[]} platforms - Platform filter options
 * @param {FieldOption[]} projects - Project filter options
 * @param {boolean} canWrite - Member may write announcements
 * @return {JSX.Element}
 */

export const AnnouncementsList = ({
  initialRows,
  fields,
  platforms,
  projects,
  canWrite,
}: AnnouncementsListProps) => {
  const router = useRouter()
  const { session } = useAuthContext()
  const [linkage, setLinkage] = useState<Linkage>('all')
  const [showPublished, setShowPublished] = useState(false)
  const [showCancelled, setShowCancelled] = useState(false)

  const aside = announcementAside(ANNOUNCEMENT_COPY.preview, fields, session)

  const options: PageOption[] = [
    {
      id: 'linkage',
      label: ANNOUNCEMENT_FILTER_COPY.linkage,
      value: linkage,
      choices: [
        { value: 'all', label: ANNOUNCEMENT_FILTER_COPY.everything },
        { value: 'with', label: ANNOUNCEMENT_FILTER_COPY.withProject },
        { value: 'without', label: ANNOUNCEMENT_FILTER_COPY.withoutProject },
      ],
      onChange: (value: string) => setLinkage(value as Linkage),
    },
    {
      id: 'published',
      label: ANNOUNCEMENT_FILTER_COPY.showPublished,
      checked: showPublished,
      onChange: setShowPublished,
    },
    {
      id: 'cancelled',
      label: ANNOUNCEMENT_FILTER_COPY.showCancelled,
      checked: showCancelled,
      onChange: setShowCancelled,
    },
  ]

  const hiddenColumns = useMemo(
    () => [
      ...(showPublished ? [] : [FOLDED.published]),
      ...(showCancelled ? [] : [FOLDED.cancelled]),
    ],
    [showPublished, showCancelled]
  )

  const tableColumns: DataTableColumn<AnnouncementRow>[] = [
    {
      key: 'title',
      header: FIELD_COPY.title,
      sortValue: (row) => row.title.toLowerCase(),
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'status',
      header: FIELD_COPY.state,
      sortValue: (row) => COMMUNICATION_STATUSES[row.status].label,
      render: (row) => (
        <Status
          label={COMMUNICATION_STATUSES[row.status].label}
          accent={COMMUNICATION_STATUSES[row.status].accent}
          icon="statusDot"
        />
      ),
    },
    {
      key: 'origin',
      header: FIELD_COPY.project,
      render: (row) => `${ANNOUNCEMENT_SOURCES[row.source].singular} - ${row.origin}`,
    },
    {
      key: 'at',
      header: FIELD_COPY.date,
      sortValue: (row) => row.at,
      className: 'whitespace-nowrap',
      render: (row) => formatDay(row.at),
    },
  ]

  return (
    <WorkBoard<AnnouncementRow>
      scope={null}
      entity={ANNOUNCEMENT_ENTITY}
      subject={FORM_SUBJECTS.communication}
      aside={aside}
      endpoints={{
        collection: API_ROUTES.announcements,
        item: (id) => API_ROUTES.announcement(recordOf(id)),
        move: (id) => API_ROUTES.announcementStatus(recordOf(id)),
      }}
      initialCards={initialRows}
      columns={COLUMNS}
      fields={fields}
      columnField="status"
      copy={ANNOUNCEMENT_COPY}
      figure="meetings"
      tableColumns={tableColumns}
      filters={[
        {
          name: 'owner',
          label: ANNOUNCEMENT_FILTER_COPY.owner,
          allLabel: ANNOUNCEMENT_FILTER_COPY.allOwners,
          options: [{ value: 'mine', label: ANNOUNCEMENT_FILTER_COPY.mine }],
        },
        {
          name: 'status',
          label: ANNOUNCEMENT_FILTER_COPY.status,
          allLabel: ANNOUNCEMENT_FILTER_COPY.allStatuses,
          options: COMMUNICATION_STATUS_OPTIONS,
        },
        {
          name: 'platform',
          label: ANNOUNCEMENT_FILTER_COPY.platform,
          allLabel: ANNOUNCEMENT_FILTER_COPY.allPlatforms,
          options: platforms,
          mark: 'avatar',
        },
        {
          name: 'project',
          label: ANNOUNCEMENT_FILTER_COPY.project,
          allLabel: ANNOUNCEMENT_FILTER_COPY.allProjects,
          options: projects,
        },
      ]}
      matches={(row, search, filters) => {
        if (search.length > 0 && !row.title.toLowerCase().includes(search)) return false
        // Only what is written here has an author of its own
        if (filters.owner === 'mine' && (!row.values || row.person?.id !== session?.id))
          return false
        if (filters.status && row.status !== filters.status) return false
        if (filters.platform && row.platformId !== filters.platform) return false
        if (filters.project && row.projectId !== filters.project) return false
        if (linkage === 'with' && row.source !== 'project') return false
        if (linkage === 'without' && row.source === 'project') return false

        return true
      }}
      valuesOf={(row) => row.values ?? {}}
      labelOf={(row) => row.title}
      onOpen={(row) => row.href && router.push(row.href)}
      hasPage={(row) => row.href !== null}
      canCreate={canWrite}
      canUpdate={canWrite}
      canDelete={canWrite}
      isEditable={(row) => row.values !== null}
      extraOptions={options}
      hiddenColumns={hiddenColumns}
      tintByColumn
      renderCard={(row) => (
        <>
          <p className={BOARD_STYLES.cardTitle}>{row.title}</p>
          <p className={BOARD_STYLES.cardOrigin}>
            {ANNOUNCEMENT_SOURCES[row.source].singular} - {row.origin}
          </p>
        </>
      )}
    />
  )
}
