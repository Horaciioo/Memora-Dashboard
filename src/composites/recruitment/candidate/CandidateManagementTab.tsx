'use client'

import { Button } from '@/components/elements/actions/Button'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview } from '@/components/structures/page/FileOverview'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { CandidateView } from '@/types/recruitment'

export interface CandidateManagementTabProps {
  candidate: CandidateView
  record: RecordFile
}

/**
 * Form identifier and blacklist of a candidate
 * @param {CandidateView} candidate - Applicant followed
 * @param {RecordFile} record - Inline state of their fields
 * @return {JSX.Element}
 */

export const CandidateManagementTab = ({ candidate, record }: CandidateManagementTabProps) => {
  const { detail, fields, can, setBanning } = useRecruitmentState()
  const isBanned = detail.bannedIds.includes(candidate.discordId)
  const formId = record.values.formId

  const entries: EditableEntry[] = [
    {
      label: RECRUITMENT_FIELD_COPY.formId,
      field: fields.candidate.find((field) => field.name === 'formId')!,
      display: typeof formId === 'string' && formId !== '' ? formId : null,
    },
    // Responsables and above only
    ...(can.manage
      ? [
          {
            label: CANDIDATE_COPY.measures,
            display: (
              <Button
                className="max-w-full"
                onClick={() =>
                  setBanning({
                    discordId: candidate.discordId,
                    sessionId: detail.summary.id,
                    candidateId: candidate.id,
                  })
                }
              >
                {isBanned ? HISTORY_COPY.unbanTitle : CANDIDATE_COPY.blacklist}
              </Button>
            ),
          },
        ]
      : []),
  ]

  return (
    <FileOverview
      groups={[{ id: 'management', title: CANDIDATE_COPY.tabManagement, entries }]}
      values={record.values}
      issues={record.issues}
      disabled={!can.writeCandidates}
      onCommit={record.saveField}
    />
  )
}
