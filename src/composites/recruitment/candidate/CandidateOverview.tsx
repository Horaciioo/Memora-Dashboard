'use client'

import { Status } from '@/components/elements/display/Status'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview } from '@/components/structures/page/FileOverview'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { RECRUITMENT_COPY, RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { COMMENT_COPY } from '@/declarations/ui/copy'
import { accentVars } from '@/declarations/ui/theme'
import { PASTEL_TAG } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/dates'
import type { ReactNode } from 'react'

export interface CandidateOverviewProps {
  record: RecordFile
  // Remarks box content
  comments: ReactNode
}

/**
 * Interview and remarks of a candidate, each value edited in place
 * @param {RecordFile} record - Inline state of their fields
 * @param {ReactNode} comments - Remarks box content
 * @return {JSX.Element}
 */

export const CandidateOverview = ({ record, comments }: CandidateOverviewProps) => {
  const { detail, fields, can } = useRecruitmentState()

  const fieldFor = (name: string) => fields.candidate.find((field) => field.name === name)!
  const text = (name: string) =>
    typeof record.values[name] === 'string' ? (record.values[name] as string) : ''
  const outcome = detail.outcomes.find((entry) => entry.id === text('outcomeId'))
  const isPresent = record.values.attended === true

  const entries: EditableEntry[] = [
    {
      label: RECRUITMENT_FIELD_COPY.interviewAt,
      field: fieldFor('interviewAt'),
      display: text('interviewAt') ? formatDayTime(text('interviewAt')) : null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.formId,
      field: fieldFor('formId'),
      display: text('formId') || null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.attended,
      field: fieldFor('attended'),
      display: (
        <Status
          icon={isPresent ? 'success' : 'failure'}
          tone={isPresent ? 'success' : 'danger'}
          label={isPresent ? RECRUITMENT_COPY.attended : RECRUITMENT_COPY.missed}
        />
      ),
    },
    {
      label: RECRUITMENT_FIELD_COPY.outcome,
      field: fieldFor('outcomeId'),
      display: outcome ? (
        <span className={PASTEL_TAG} style={accentVars(outcome.accent)}>
          {outcome.label}
        </span>
      ) : null,
    },
  ]

  return (
    <FileOverview
      groups={[
        { id: 'interview', title: CANDIDATE_COPY.informations, entries },
        // An observer never reads the remarks
        ...(can.observing ? [] : [{ id: 'comments', title: COMMENT_COPY.title, node: comments }]),
      ]}
      values={record.values}
      issues={record.issues}
      disabled={!can.writeCandidates}
      onCommit={record.saveField}
    />
  )
}
