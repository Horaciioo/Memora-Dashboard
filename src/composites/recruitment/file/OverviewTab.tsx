'use client'

import { AvatarStack } from '@/components/elements/display/Avatar'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { RecordId } from '@/components/elements/display/RecordId'
import { Status } from '@/components/elements/display/Status'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview, type FileOverviewGroup } from '@/components/structures/page/FileOverview'
import { InstructionsCard } from '@/composites/recruitment/file/InstructionsCard'
import { SessionTimelineCard } from '@/composites/recruitment/file/SessionTimelineCard'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import { pickedOptions } from '@/core/lib/forms/options'
import { API_ROUTES } from '@/core/lib/api/routes'
import { RECRUITMENT_ENTITY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { formatDayTime } from '@/utils/format/dates'

// Portraits drawn side by side
const portraits = (list: { id: string; name: string; src?: string | null }[]) =>
  list.length > 0 ? <AvatarStack size="sm" people={list} /> : null

/**
 * Overview of a recruitment session: boxes of what it is, who carries it
 * @return {JSX.Element}
 */

export const OverviewTab = () => {
  const { detail, fields, can } = useRecruitmentState()
  const { summary } = detail
  const record = useRecordFile({
    path: API_ROUTES.recruitment(summary.id),
    entity: RECRUITMENT_ENTITY,
    initialValues: summary.values,
  })

  const fieldFor = (name: string) => fields.session.find((field) => field.name === name)!
  const text = (name: string) =>
    typeof record.values[name] === 'string' ? (record.values[name] as string) : ''
  const status =
    RECRUITMENT_STATUS_REGISTRY.map[text('status') as keyof typeof RECRUITMENT_STATUS_REGISTRY.map]
  const FunctionGlyph =
    summary.jobFunction.icon && isIconName(summary.jobFunction.icon)
      ? ICONS[summary.jobFunction.icon]
      : null
  const responsables = pickedOptions(fieldFor('responsableIds'), record.values.responsableIds)
  const observers = pickedOptions(fieldFor('observerIds'), record.values.observerIds)

  const range = Array.isArray(record.values.period) ? record.values.period : null
  const period = range ? `${formatDayTime(range[0])} – ${formatDayTime(range[1])}` : null

  const session: EditableEntry[] = [
    { label: SESSION_FILE_COPY.id, display: <RecordId id={summary.id} /> },
    {
      label: SESSION_FILE_COPY.status,
      field: fieldFor('status'),
      display: status ? (
        <Status label={status.label} accent={status.accent} icon="statusDot" />
      ) : null,
    },
    {
      label: SESSION_FILE_COPY.youtuber,
      display: <CreatorLabel name={summary.youtuber.label} image={summary.youtuber.image} />,
    },
    {
      label: SESSION_FILE_COPY.jobFunction,
      display: (
        <span className="inline-flex items-center gap-2">
          {FunctionGlyph && <FunctionGlyph className="size-5" aria-hidden="true" />}
          {summary.jobFunction.label}
        </span>
      ),
    },
    { label: SESSION_FILE_COPY.period, field: fieldFor('period'), display: period },
  ]

  const team: EditableEntry[] = [
    {
      label: SESSION_FILE_COPY.responsables,
      field: fieldFor('responsableIds'),
      display: portraits(
        responsables.map((option) => ({ id: option.value, name: option.label, src: option.image }))
      ),
    },
    {
      label: SESSION_FILE_COPY.recruiters,
      display: portraits(
        summary.recruiters.map((person) => ({
          id: person.id,
          name: person.label,
          src: person.image,
        }))
      ),
    },
    ...(can.observing
      ? []
      : [
          {
            label: SESSION_FILE_COPY.observers,
            field: fieldFor('observerIds'),
            display: portraits(
              observers.map((option) => ({
                id: option.value,
                name: option.label,
                src: option.image,
              }))
            ),
          },
        ]),
  ]

  const groups: FileOverviewGroup[] = [
    {
      id: 'session',
      title: SESSION_FILE_COPY.informations,
      entries: session,
      side: <SessionTimelineCard />,
    },
    { id: 'team', title: SESSION_FILE_COPY.team, entries: team, side: <InstructionsCard /> },
  ]

  return (
    <FileOverview
      groups={groups}
      values={record.values}
      issues={record.issues}
      disabled={!can.manage}
      onCommit={record.saveField}
      description={{
        id: 'recruitment-summary',
        value: text('summary'),
        maxLength: fieldFor('summary').maxLength,
        onCommit: (next) => record.saveField('summary', next.trim() === '' ? null : next),
      }}
    />
  )
}
