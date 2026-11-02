'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { CheckGlyph } from '@/components/elements/display/glyphs/BrandGlyphs'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { useStartInterview } from '@/composites/recruitment/file/useStartInterview'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useClock } from '@/core/hooks/interaction/state/useClock'
import { useObserving } from '@/core/hooks/data/recruitment/useObserving'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { pickedOptions } from '@/core/lib/forms/options'
import { candidateStates, progressOf } from '@/core/lib/recruitment/candidateTimeline'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { ROUTES } from '@/declarations/navigation'
import { OBSERVE_SUCCESS } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'
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
  const { detail, file, fields, can } = useRecruitmentState()
  const startInterview = useStartInterview()
  const observe = useObserving()
  // Read from the card, a seat given in the picker counts too
  const joined = candidate.observers.some((seat) => seat.id === can.viewerId)

  // Once the verdict is given, only a manager or its recruiter moves the observers
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
      field: fieldFor('recruiterIds'),
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
  // A barred candidate is never taken in interview
  const isBarred = detail.bannedIds.includes(candidate.discordId)
  const now = useClock()
  // The timeline decides the button: review once at the final moment, else start
  const states = candidateStates(
    progressOf(candidate, record.values),
    detail.outcomes,
    candidate.stageMarks,
    now
  )
  const lead =
    states.results !== 'upcoming'
      ? {
          label: CANDIDATE_COPY.review,
          run: () => router.push(ROUTES.interview(detail.summary.id, candidate.id)),
        }
      : {
          label: candidate.interviewStartedAt ? CANDIDATE_COPY.resume : CANDIDATE_COPY.start,
          run: () => startInterview(candidate.id),
        }

  // The animation plays on the gesture, not each time the file opens
  const [justJoined, setJustJoined] = useState(false)
  const [isAsking, setIsAsking] = useState(false)

  const toggle = async () => {
    const saved = await observe(candidate.id, !joined)
    if (!saved) return
    setJustJoined(!joined)
    file.mergeCandidate(saved)
  }

  return (
    <>
      <EditableDetailGrid
        paired
        entries={entries}
        values={record.values}
        issues={record.issues}
        disabled={!can.writeCandidates}
        onCommit={record.saveField}
      />
      {isRecruiter && !isBarred && lead && (
        <Button variant="primary" onClick={lead.run}>
          {lead.label}
        </Button>
      )}
      {!isRecruiter && !isBarred && can.canObserve && (
        <Button
          variant={joined ? 'success' : 'secondary'}
          onClick={joined ? () => setIsAsking(true) : () => void toggle()}
        >
          {joined ? (
            <span className={OBSERVE_SUCCESS.row} role="status">
              <span className={cn(OBSERVE_SUCCESS.mark, justJoined && OBSERVE_SUCCESS.markPop)}>
                <CheckGlyph className={OBSERVE_SUCCESS.glyph} />
              </span>
              <span className={cn(justJoined && OBSERVE_SUCCESS.textReveal)}>
                {CANDIDATE_COPY.observing}
              </span>
            </span>
          ) : (
            CANDIDATE_COPY.observe
          )}
        </Button>
      )}
      <ConfirmDialog
        open={isAsking}
        title={CANDIDATE_COPY.observeStopTitle}
        confirmLabel={CANDIDATE_COPY.observeStopYes}
        cancelLabel={CANDIDATE_COPY.observeStopNo}
        cancelVariant="success"
        onCancel={() => setIsAsking(false)}
        onConfirm={async () => {
          await toggle()
          setIsAsking(false)
        }}
      />
    </>
  )
}
