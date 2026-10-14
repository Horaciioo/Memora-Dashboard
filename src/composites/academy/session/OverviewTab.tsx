'use client'

import { AvatarStack } from '@/components/elements/display/Avatar'
import { RecordId } from '@/components/elements/display/RecordId'
import { Status } from '@/components/elements/display/Status'
import { CommentThread } from '@/components/structures/CommentThread'
import type { EditableEntry } from '@/components/structures/EditableDetailGrid'
import { FileOverview, type FileOverviewGroup } from '@/components/structures/FileOverview'
import { SessionDesk } from '@/composites/academy/session/SessionDesk'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { useRecordFile } from '@/core/hooks/data/useRecordFile'
import { API_ROUTES } from '@/core/lib/api/routes'
import { pickedOptions } from '@/core/lib/forms/options'
import { ACADEMY_ENTITY } from '@/declarations/academy/copy'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { FILE_BOX } from '@/declarations/ui/variants'
import type { WorkPerson } from '@/types/work'
import { sessionState } from '@/utils/format/academy'
import { formatDayRange } from '@/utils/format/dates'

// Portraits drawn side by side
const people = (list: WorkPerson[]) =>
  list.length > 0 ? <AvatarStack size="sm" people={list} /> : null

/**
 * Overview of an academy session: its information beside the work waiting for the viewer, the
 * team, then the remarks left on it
 * @return {JSX.Element}
 */

export const OverviewTab = () => {
  const { detail, fields, can, comments } = useSessionState()
  const { summary } = detail
  const record = useRecordFile({
    path: API_ROUTES.session(summary.id),
    entity: ACADEMY_ENTITY,
    initialValues: summary.values,
  })

  const fieldFor = (name: string) => fields.session.find((field) => field.name === name)!
  const state = sessionState(summary)
  const FunctionGlyph =
    summary.function.icon && isIconName(summary.function.icon) ? ICONS[summary.function.icon] : null
  const trainers = pickedOptions(fieldFor('trainerIds'), record.values.trainerIds)
  const { recruitment } = summary
  const period = Array.isArray(record.values.period) ? record.values.period : null

  const entries: EditableEntry[] = [
    { label: SESSION_FILE_COPY.id, display: <RecordId id={summary.id} /> },
    {
      label: SESSION_FILE_COPY.status,
      field: fieldFor('status'),
      display: <Status label={state.label} accent={state.accent} icon="statusDot" />,
    },
    {
      label: SESSION_FILE_COPY.jobFunction,
      display: (
        <span className="inline-flex items-center gap-2">
          {FunctionGlyph && <FunctionGlyph className="size-5" aria-hidden="true" />}
          {summary.function.name}
        </span>
      ),
    },
    {
      label: SESSION_FILE_COPY.period,
      field: fieldFor('period'),
      display: period ? formatDayRange(period[0], period[1]) : null,
    },
  ]

  const team: EditableEntry[] = [
    {
      label: SESSION_FILE_COPY.trainers,
      field: fieldFor('trainerIds'),
      display:
        trainers.length > 0 ? (
          <AvatarStack
            size="sm"
            people={trainers.map((option) => ({
              id: option.value,
              name: option.label,
              src: option.image,
            }))}
          />
        ) : null,
    },
    { label: SESSION_FILE_COPY.responsables, display: people(recruitment?.responsables ?? []) },
  ]

  const groups: FileOverviewGroup[] = [
    {
      id: 'session',
      title: SESSION_FILE_COPY.informations,
      entries: [...entries, ...team],
      side: can.writeReviews || can.validateReviews ? <SessionDesk /> : undefined,
    },
  ]

  return (
    <FileOverview
      groups={groups}
      values={record.values}
      issues={record.issues}
      disabled={!can.manage}
      onCommit={record.saveField}
    >
      <div className={FILE_BOX.stack}>
        {can.readNotes && (
          <CommentThread
            comments={comments.comments}
            fields={fields.comment}
            issues={comments.issues}
            isSaving={comments.isSaving}
            canWrite={can.writeNotes}
            label={summary.function.name}
            onOpen={comments.clearIssues}
            onAdd={comments.add}
            onRemove={comments.remove}
          />
        )}
      </div>
    </FileOverview>
  )
}
