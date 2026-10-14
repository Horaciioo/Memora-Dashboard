'use client'

import { CopyValue } from '@/components/elements/actions/CopyValue'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { Status } from '@/components/elements/display/Status'
import type { EditableEntry } from '@/components/structures/EditableDetailGrid'
import { FileOverview } from '@/components/structures/FileOverview'
import { ObserveCheck } from '@/composites/recruitment/candidate/ObserveCheck'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useObservers } from '@/core/hooks/data/useObservers'
import type { RecordFile } from '@/core/hooks/data/useRecordFile'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { pickedOptions } from '@/core/lib/forms/options'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { RECRUITMENT_COPY, RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import type { CandidateView } from '@/types/recruitment'
import { formatDayTime } from '@/utils/format/dates'
import { useState } from 'react'
import type { ReactNode } from 'react'

export interface CandidateOverviewProps {
  candidate: CandidateView
  record: RecordFile
  // Panel inside the box
  side: ReactNode
  // Sections under the box
  children: ReactNode
}

/**
 * Everything known of a candidate, each value edited in place
 * @param {CandidateView} candidate - Applicant followed
 * @param {RecordFile} record - Inline state of their fields
 * @param {ReactNode} side - Panel inside the box
 * @param {ReactNode} children - Sections under the box
 * @return {JSX.Element}
 */

export const CandidateOverview = ({
  candidate,
  record,
  side,
  children,
}: CandidateOverviewProps) => {
  const { detail, fields, file, can } = useRecruitmentState()
  const { observers, observe } = useObservers(detail.summary.id, detail.observers)
  const [joined, setJoined] = useState(candidate.observers.some((seat) => seat.id === can.viewerId))
  const seat = observers.find((entry) => entry.person.id === can.viewerId)

  // Once the interview is taken, only a manager or its recruiter moves the seats
  const isLocked = isInterviewLocked(candidate.attended, candidate.recruiter?.id ?? null, can)

  const fieldFor = (name: string) => fields.candidate.find((field) => field.name === name)!
  const text = (name: string) =>
    typeof record.values[name] === 'string' ? (record.values[name] as string) : ''
  const recruiter = pickedOptions(fieldFor('recruiterId'), record.values.recruiterId)[0]
  const outcome = detail.outcomes.find((entry) => entry.id === text('outcomeId'))
  const sitting = pickedOptions(fieldFor('observerIds'), record.values.observerIds)

  // Quota counts the interviews already joined elsewhere
  const sittingElsewhere =
    (seat?.used ?? 0) - (candidate.observers.some((s) => s.id === can.viewerId) ? 1 : 0)
  const isFull = seat !== undefined && sittingElsewhere >= seat.quota && !joined

  const toggle = async (next: boolean) => {
    if (await observe(candidate.id, next)) setJoined(next)
  }

  const entries: EditableEntry[] = [
    {
      label: RECRUITMENT_FIELD_COPY.discordId,
      field: fieldFor('discordId'),
      display: <CopyValue value={candidate.discordId} />,
    },
    {
      label: RECRUITMENT_FIELD_COPY.displayName,
      field: fieldFor('displayName'),
      display: text('displayName') || null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.formId,
      field: fieldFor('formId'),
      display: text('formId') || null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.recruiter,
      field: { ...fieldFor('recruiterId'), readOnly: isLocked },
      display: recruiter ? <CreatorLabel name={recruiter.label} image={recruiter.image} /> : null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.interviewAt,
      field: fieldFor('interviewAt'),
      display: text('interviewAt') ? formatDayTime(text('interviewAt')) : null,
    },
    {
      label: RECRUITMENT_FIELD_COPY.outcome,
      field: fieldFor('outcomeId'),
      display: outcome ? <Status label={outcome.label} accent={outcome.accent} /> : null,
    },
    can.observing
      ? {
          label: RECRUITMENT_COPY.observersTitle,
          display: (
            <ObserveCheck
              joined={joined}
              label={isFull ? CANDIDATE_COPY.observeFull : CANDIDATE_COPY.observe}
              disabled={isFull || isLocked}
              onChange={(next) => void toggle(next)}
            />
          ),
        }
      : {
          label: RECRUITMENT_COPY.observersTitle,
          field: { ...fieldFor('observerIds'), readOnly: isLocked },
          display:
            sitting.length > 0 ? (
              <AvatarStack
                size="sm"
                people={sitting.map((option) => ({
                  id: option.value,
                  name: option.label,
                  src: option.image,
                }))}
              />
            ) : null,
        },
    {
      label: RECRUITMENT_FIELD_COPY.attended,
      field: fieldFor('attended'),
      display:
        record.values.attended === true ? RECRUITMENT_COPY.attended : RECRUITMENT_COPY.missed,
    },
  ]

  return (
    <FileOverview
      groups={[{ id: 'informations', title: CANDIDATE_COPY.informations, entries, side }]}
      values={record.values}
      issues={record.issues}
      disabled={!can.writeCandidates}
      onCommit={record.saveField}
      description={{
        id: 'candidate-review',
        label: RECRUITMENT_COPY.reviewTitle,
        value: candidate.review,
        onCommit: (next) => file.saveReview(candidate.id, next),
      }}
    >
      {children}
    </FileOverview>
  )
}
