'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { useStartInterview } from '@/composites/recruitment/file/useStartInterview'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useObserving } from '@/core/hooks/data/recruitment/useObserving'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { pickedOptions } from '@/core/lib/forms/options'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY, RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import type { CandidateView } from '@/types/recruitment'

export interface CandidateTeamProps {
  candidate: CandidateView
  record: RecordFile
}

/**
 * Recruiters and observers, with the way to sit in
 * @param {CandidateView} candidate - Applicant followed
 * @param {RecordFile} record - Inline state of their fields
 * @return {JSX.Element}
 */

export const CandidateTeam = ({ candidate, record }: CandidateTeamProps) => {
  const router = useRouter()
  const { detail, fields, can } = useRecruitmentState()
  const startInterview = useStartInterview()
  const observe = useObserving()
  // Read from the card, a seat given in the picker counts too
  const joined = candidate.observers.some((seat) => seat.id === can.viewerId)

  // Once the verdict is given, only a manager or its recruiter moves the seats
  const isLocked = isInterviewLocked(
    candidate.verdictAt !== null,
    candidate.recruiters.map((seat) => seat.id),
    can
  )

  const fieldFor = (name: string) => fields.candidate.find((field) => field.name === name)!
  const stack = (name: string) => {
    const picked = pickedOptions(fieldFor(name), record.values[name])

    return picked.length > 0 ? (
      <AvatarStack
        wrap
        size="sm"
        max={picked.length}
        people={picked.map((option) => ({
          id: option.value,
          name: option.label,
          src: option.image,
        }))}
      />
    ) : null
  }

  const entries: EditableEntry[] = [
    {
      label: RECRUITMENT_FIELD_COPY.recruiters,
      field: { ...fieldFor('recruiterIds'), readOnly: isLocked },
      display: stack('recruiterIds'),
    },
    {
      label: RECRUITMENT_COPY.observersTitle,
      field: can.observing ? undefined : { ...fieldFor('observerIds'), readOnly: isLocked },
      display: stack('observerIds'),
    },
  ]

  // A recruiter of the candidate leads the interview
  const isRecruiter = candidate.recruiters.some((seat) => seat.id === can.viewerId)
  const lead =
    candidate.verdictAt || candidate.interviewEndedAt
      ? {
          label: CANDIDATE_COPY.review,
          run: () => router.push(ROUTES.interview(detail.summary.id, candidate.id)),
        }
      : {
          label: candidate.interviewStartedAt ? CANDIDATE_COPY.resume : CANDIDATE_COPY.start,
          run: () => startInterview(candidate.id),
        }

  const toggle = async () => {
    if (await observe(candidate.id, !joined)) router.refresh()
  }

  return (
    <>
      <EditableDetailGrid
        stacked
        entries={entries}
        values={record.values}
        issues={record.issues}
        disabled={!can.writeCandidates}
        onCommit={record.saveField}
      />
      {isRecruiter && (
        <Button variant="primary" onClick={lead.run}>
          {lead.label}
        </Button>
      )}
      {!isRecruiter && can.canObserve && (
        <Button onClick={() => void toggle()}>
          {joined ? CANDIDATE_COPY.observeStop : CANDIDATE_COPY.observe}
        </Button>
      )}
    </>
  )
}
