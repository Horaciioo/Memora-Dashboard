'use client'

import { RecordId } from '@/components/elements/display/RecordId'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview } from '@/components/structures/page/FileOverview'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useSessionRecord } from '@/composites/recruitment/file/useSessionRecord'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'

/**
 * Session identifier and the people around it, for those who manage
 * @return {JSX.Element}
 */

export const AdminTab = () => {
  const { detail, can } = useRecruitmentState()
  const { record, teamEntry } = useSessionRecord()

  const entries: EditableEntry[] = [
    { label: SESSION_FILE_COPY.id, display: <RecordId id={detail.summary.id} />, wide: true },
    teamEntry(SESSION_FILE_COPY.responsables, 'responsableIds'),
    teamEntry(SESSION_FILE_COPY.recruiters, 'recruiterIds'),
    teamEntry(SESSION_FILE_COPY.observers, 'observerIds'),
  ]

  return (
    <FileOverview
      groups={[{ id: 'admin', title: RECRUITMENT_COPY.tabAdmin, entries }]}
      values={record.values}
      issues={record.issues}
      disabled={!can.manage}
      onCommit={record.saveField}
    />
  )
}
