'use client'

import { useRouter } from 'next/navigation'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Glyph } from '@/components/elements/display/Glyph'
import { WorkBoard } from '@/composites/work/WorkBoard'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { BOARD_STYLES } from '@/declarations/ui/variants'

import { BOARD_FILTER_COPY, MEETING_COPY } from '@/declarations/work/copy'
import type { BoardColumn } from '@/components/structures/KanbanBoard'
import type { DataTableColumn } from '@/components/structures/DataTable'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { MeetingSummary } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDayTime } from '@/utils/format/dates'

export interface MeetingsBoardProps {
  initialMeetings: MeetingSummary[]
  columns: BoardColumn[]
  fields: FieldDefinition[]
  youtubers: FieldOption[]
  projects: FieldOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

/**
 * Meeting board, its cards carrying the schedule and everyone expected
 * @param {MeetingSummary[]} initialMeetings - Cards resolved server-side
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {FieldDefinition[]} fields - Field declarations of the meeting form
 * @param {FieldOption[]} youtubers - YouTuber filter options
 * @param {FieldOption[]} projects - Project filter options
 * @param {boolean} canCreate - Member may plan a meeting
 * @param {boolean} canUpdate - Member may edit a meeting
 * @param {boolean} canDelete - Member may drop a meeting
 * @return {JSX.Element}
 */

export const MeetingsBoard = ({
  initialMeetings,
  columns,
  fields,
  youtubers,
  projects,
  canCreate,
  canUpdate,
  canDelete,
}: MeetingsBoardProps) => {
  const router = useRouter()

  const everyone = (meeting: MeetingSummary) => [
    ...meeting.leads,
    ...meeting.assistants,
    ...meeting.participants,
  ]

  const tableColumns: DataTableColumn<MeetingSummary>[] = [
    {
      key: 'title',
      header: FIELD_COPY.title,
      sortValue: (meeting) => meeting.title.toLowerCase(),
      render: (meeting) => (
        <span className="font-medium">
          <Glyph value={meeting.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
          {meeting.title}
        </span>
      ),
    },
    {
      key: 'scheduledAt',
      header: FIELD_COPY.date,
      sortValue: (meeting) => meeting.scheduledAt,
      className: 'whitespace-nowrap',
      render: (meeting) => formatDayTime(meeting.scheduledAt),
    },
    {
      key: 'state',
      header: FIELD_COPY.state,
      sortValue: (meeting) => meeting.state?.label ?? '',
      render: (meeting) =>
        meeting.state ? (
          <Badge label={meeting.state.label} accent={meeting.state.accent} dot />
        ) : null,
    },
    {
      key: 'project',
      header: FIELD_COPY.project,
      render: (meeting) =>
        meeting.project ? <Badge label={meeting.project.label} tone="brand" /> : null,
    },
    {
      key: 'youtuber',
      header: FIELD_COPY.youtuber,
      render: (meeting) =>
        meeting.youtuber ? (
          <Badge label={meeting.youtuber.label} accent={meeting.youtuber.accent} tone={'info'} />
        ) : null,
    },
    {
      key: 'attendees',
      header: FIELD_COPY.participants,
      render: (meeting) => <AvatarStack people={everyone(meeting)} />,
    },
  ]

  return (
    <WorkBoard<MeetingSummary>
      scope={WorkflowScopes.Meeting}
      endpoints={{ collection: API_ROUTES.meetings, item: API_ROUTES.meeting }}
      initialCards={initialMeetings}
      columns={columns}
      fields={fields}
      columnField="stateId"
      copy={MEETING_COPY}
      figure="meetings"
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
          name: 'project',
          label: BOARD_FILTER_COPY.project,
          allLabel: BOARD_FILTER_COPY.allProjects,
          options: projects,
        },
      ]}
      matches={(meeting, search, filters) => {
        if (search.length > 0 && !meeting.title.toLowerCase().includes(search)) return false
        if (filters.youtuber && meeting.youtuber?.id !== filters.youtuber) return false
        if (filters.project && meeting.project?.id !== filters.project) return false

        return true
      }}
      valuesOf={(meeting) => meeting.values}
      labelOf={(meeting) => meeting.title}
      onOpen={(meeting) => router.push(ROUTES.meeting(meeting.id))}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      tintByColumn
      renderCard={(meeting) => (
        <p className={BOARD_STYLES.cardTitle}>
          <Glyph value={meeting.emoji} size="row" className={BOARD_STYLES.cardGlyph} />
          {meeting.title}
        </p>
      )}
    />
  )
}
