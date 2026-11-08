'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CommentThread } from '@/components/structures/data/CommentThread'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { Status } from '@/components/elements/display/Status'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview, type FileOverviewGroup } from '@/components/structures/page/FileOverview'
import { CloseRecruitmentDialog } from '@/composites/recruitment/CloseRecruitmentDialog'
import { SessionTimelineCard } from '@/composites/recruitment/file/SessionTimelineCard'
import { useSessionRecord } from '@/composites/recruitment/file/useSessionRecord'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { FILE_BOX } from '@/declarations/ui/variants'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'
import { formatDayTime } from '@/utils/format/dates'

/**
 * Overview of a recruitment session: boxes of what it is, who carries it
 * @return {JSX.Element}
 */

export const OverviewTab = () => {
  const router = useRouter()
  const [isClosing, setClosing] = useState(false)
  const { detail, file, fields, can } = useRecruitmentState()
  const { summary } = detail
  const { record, fieldFor, text, teamEntry } = useSessionRecord()
  const status =
    RECRUITMENT_STATUS_REGISTRY.map[text('status') as keyof typeof RECRUITMENT_STATUS_REGISTRY.map]
  const FunctionGlyph =
    summary.jobFunction.icon && isIconName(summary.jobFunction.icon)
      ? ICONS[summary.jobFunction.icon]
      : null

  const range = Array.isArray(record.values.period) ? record.values.period : null
  const period = range ? `${formatDayTime(range[0])} – ${formatDayTime(range[1])}` : null

  const session: EditableEntry[] = [
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
    { label: SESSION_FILE_COPY.period, field: fieldFor('period'), display: period, wide: true },
  ]

  const team: EditableEntry[] = [
    teamEntry(SESSION_FILE_COPY.responsables, 'responsableIds'),
    teamEntry(SESSION_FILE_COPY.recruiters, 'recruiterIds'),
    // An observer never reads who else sits in
    ...(can.observing ? [] : [teamEntry(SESSION_FILE_COPY.observers, 'observerIds')]),
  ]

  const groups: FileOverviewGroup[] = [
    {
      id: 'session',
      title: SESSION_FILE_COPY.informations,
      entries: session,
      side: <SessionTimelineCard />,
    },
    // Managers read the team in the administration tab
    ...(can.manage ? [] : [{ id: 'team', title: SESSION_FILE_COPY.team, entries: team }]),
  ]

  return (
    <FileOverview
      groups={groups}
      values={record.values}
      issues={record.issues}
      disabled={!can.manage}
      onCommit={(name, value) => {
        // Closing asks first
        if (
          name === 'status' &&
          value === RecruitmentStatuses.Closed &&
          summary.status !== RecruitmentStatuses.Closed
        ) {
          setClosing(true)
          return Promise.resolve(false)
        }

        return record.saveField(name, value)
      }}
      description={{
        id: 'recruitment-summary',
        value: text('summary'),
        maxLength: fieldFor('summary').maxLength,
        onCommit: (next) => record.saveField('summary', next.trim() === '' ? null : next),
      }}
    >
      {/* An observer never reads the remarks */}
      {!can.observing && (
        <div className={FILE_BOX.stack}>
          <CommentThread
            comments={file.comments}
            fields={fields.comment}
            issues={file.issues}
            isSaving={file.isSaving}
            canWrite={can.writeCandidates}
            label={summary.name}
            onOpen={file.clearIssues}
            onAdd={file.addSessionComment}
            onRemove={file.removeSessionComment}
          />
        </div>
      )}
      <CloseRecruitmentDialog
        sessionId={isClosing ? summary.id : null}
        onClose={() => setClosing(false)}
        onClosed={() => router.refresh()}
      />
    </FileOverview>
  )
}
