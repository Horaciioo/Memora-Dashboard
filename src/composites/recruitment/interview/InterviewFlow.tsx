'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ExercisePicker } from '@/composites/recruitment/exercise/ExercisePicker'
import { ExerciseReveal } from '@/composites/recruitment/exercise/ExerciseReveal'
import { ExerciseStage } from '@/composites/recruitment/exercise/ExerciseStage'
import { InterviewCrumbs } from '@/composites/recruitment/interview/InterviewCrumbs'
import { InterviewFrame } from '@/composites/recruitment/interview/InterviewFrame'
import { InterviewIntro } from '@/composites/recruitment/interview/InterviewIntro'
import { InterviewPart } from '@/composites/recruitment/questionnaire/InterviewPart'
import {
  RecruitmentFileProvider,
  useRecruitmentState,
} from '@/composites/recruitment/file/RecruitmentFileContext'
import { useQuestionnaire } from '@/core/hooks/data/recruitment/useQuestionnaire'
import { useInterviewStep } from '@/core/hooks/interaction/state/useInterviewStep'
import { useExercisePick } from '@/core/hooks/interaction/scenes/useExercisePick'
import { isInterviewLocked } from '@/core/lib/recruitment/interviewLock'
import { offeredExercises } from '@/core/lib/recruitment/exercises'
import { groupByPart } from '@/core/lib/recruitment/questionnaire'
import { ROUTES } from '@/declarations/navigation'
import { EXERCISES } from '@/declarations/recruitment/exercises'
import { QUESTION_PARTS } from '@/declarations/recruitment/questionnaire'
import { InterviewMinutes } from '@/composites/recruitment/interview/InterviewMinutes'
import { PART_BANNER_SLOTS } from '@/declarations/reference/design'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { cn } from '@/utils/classnames'
import { INTERVIEW, QUESTION_BODY, TOUR_CHAT } from '@/declarations/ui/variants'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'

/**
 * The interview as pages: an introduction, then one page per part, then the deliberation
 * @param {Object} props - Component props
 * @param {string} props.candidateId - Applicant interviewed
 * @param {boolean} props.showsDevExercises - Dev-only exercises on offer
 * @return {JSX.Element}
 */

const InterviewBody = ({
  candidateId,
  showsDevExercises,
}: {
  candidateId: string
  showsDevExercises: boolean
}) => {
  const router = useRouter()
  const { detail, file, can } = useRecruitmentState()
  const candidate = file.candidates.find((entry) => entry.id === candidateId)!
  const { youtuber, youtuberBanner, youtuberPartBanners, youtuberLogo, platform } = detail.summary
  // Read in the register the recruiters chose
  const questionnaire = useQuestionnaire(
    platform,
    youtuber.label,
    file.questionKeys,
    candidate.formal
  )
  // A finished interview only opens to a manager or its recruiter
  const isLocked = isInterviewLocked(
    candidate.verdictAt !== null,
    candidate.recruiters.map((seat) => seat.id),
    can
  )
  const isReadOnly = isLocked || !can.writeCandidates

  // Opening the page opens the interview
  const { interviewStartedAt } = candidate
  useEffect(() => {
    if (can.writeCandidates && !interviewStartedAt) {
      void file.setInterview(candidate.id, { started: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate.id, interviewStartedAt])
  // An observer reads the questions, never the tips
  const parts = groupByPart(
    can.observing
      ? questionnaire.picked.map((question) => ({ ...question, hint: undefined }))
      : questionnaire.picked
  )

  // Zero is the introduction, then one step per part
  const [storedStep, setStep] = useInterviewStep(candidateId)
  const step = Math.min(Math.max(storedStep, 0), parts.length)
  // Contexts picked and not started yet
  const [isHeld, setHeld] = useState(false)
  const group = parts[step - 1]
  const offered = group?.part === 'situation' ? offeredExercises(group.questions) : []
  const picker = useExercisePick(offered)
  const go = (target: number) => {
    setStep(target)
    picker.clear()
  }
  const leave = () => router.push(ROUTES.candidate(detail.summary.id, candidate.id))
  const isLast = step === parts.length
  // The bilan and the verdict live on the candidate file
  const finish = async () => {
    if (can.writeCandidates && !isLocked) await file.setInterview(candidate.id, { ended: true })
    router.push(ROUTES.candidateBilan(detail.summary.id, candidate.id))
  }

  const upcoming = parts[step]
  const forward = upcoming
    ? QUESTIONNAIRE_COPY.nextPart
        .replace('{number}', String(step + 1))
        .replace('{name}', QUESTION_PARTS[upcoming.part].label)
    : QUESTIONNAIRE_COPY.finish

  const partKicker = QUESTIONNAIRE_COPY.partKicker
    .replace('{number}', String(step))
    .replace('{total}', String(parts.length))

  // Trail above the title: session, candidate, interview, part, exercise
  const partCrumb = {
    label: QUESTIONNAIRE_COPY.partLabel.replace('{number}', String(step)),
    onSelect: picker.chosen ? picker.clear : undefined,
  }
  const crumbs = [
    { label: detail.summary.name, href: ROUTES.recruitment(detail.summary.id) },
    { label: candidate.name, href: ROUTES.candidate(detail.summary.id, candidate.id) },
    { label: QUESTIONNAIRE_COPY.crumbInterview, onSelect: step === 0 ? undefined : () => go(0) },
    ...(group ? [partCrumb] : []),
    ...(picker.chosen ? [{ label: EXERCISES[picker.chosen].label }] : []),
  ]

  return (
    <InterviewFrame
      portrait={
        youtuberPartBanners[PART_BANNER_SLOTS[step]] ?? youtuberBanner ?? youtuber.image ?? null
      }
      caption={youtuber.label}
      logo={youtuberLogo}
      header={
        group && (
          <>
            <span className={INTERVIEW.figureKicker}>{partKicker}</span>
            <h2 className={INTERVIEW.figureTitle}>{QUESTION_PARTS[group.part].label}</h2>
            <p className={INTERVIEW.figureLead}>{QUESTION_PARTS[group.part].lead}</p>
          </>
        )
      }
    >
      {parts.length === 0 ? (
        <div className={TOUR_CHAT.scroll}>
          <EmptyState
            figure="notes"
            title={QUESTIONNAIRE_COPY.noQuestionsTitle}
            description={QUESTIONNAIRE_COPY.noQuestionsDescription}
            action={<Button onClick={leave}>{QUESTIONNAIRE_COPY.back}</Button>}
          />
        </div>
      ) : (
        <>
          <div className={cn(TOUR_CHAT.scroll, INTERVIEW.scrollPad)}>
            <div className={cn(INTERVIEW.content, step === 0 && INTERVIEW.contentWide)}>
              <div className={INTERVIEW.crumbsRow}>
                <InterviewMinutes questions={parts.flatMap((entry) => entry.questions)} />
                <div className={INTERVIEW.crumbsTrail}>
                  <InterviewCrumbs crumbs={crumbs} />
                </div>
                <span className={INTERVIEW.formalSwitch}>
                  {QUESTIONNAIRE_COPY.formal}
                  <Toggle
                    bare
                    checked={candidate.formal}
                    disabled={!can.writeCandidates || picker.chosen !== null}
                    label={QUESTIONNAIRE_COPY.formal}
                    onChange={(formal) => void file.setInterview(candidate.id, { formal })}
                  />
                </span>
              </div>
              {group ? (
                <>
                  <header className="flex flex-col gap-2 lg:hidden">
                    {' '}
                    <span className={QUESTION_BODY.label}>{partKicker}</span>
                    <h2 className={INTERVIEW.partTitle}>{QUESTION_PARTS[group.part].label}</h2>
                    <p className="text-[var(--color-ink-subtle)]">
                      {QUESTION_PARTS[group.part].lead}
                    </p>
                  </header>
                  {offered.length > 0 ? (
                    picker.chosen ? (
                      !picker.reveal && (
                        <ExerciseStage
                          exercise={picker.chosen}
                          questions={group.questions}
                          candidateId={candidate.id}
                          answers={candidate.answers}
                          disabled={isReadOnly}
                          onHold={setHeld}
                          onAnswer={(key, patch) => void file.saveAnswer(candidate.id, key, patch)}
                        />
                      )
                    ) : (
                      <ExercisePicker
                        offered={offered}
                        showsDev={showsDevExercises}
                        onPick={picker.pick}
                        onRandom={picker.random}
                      />
                    )
                  ) : (
                    <InterviewPart
                      questions={group.questions}
                      candidate={candidate}
                      disabled={isReadOnly}
                      onAnswer={(key, patch) => void file.saveAnswer(candidate.id, key, patch)}
                    />
                  )}
                </>
              ) : (
                <InterviewIntro candidateName={candidate.name} parts={parts} />
              )}
            </div>
          </div>

          <div className={INTERVIEW.footerZone}>
            <div className={INTERVIEW.footerBlur} aria-hidden="true" />
            <footer className={cn(INTERVIEW.footer, step === 0 && INTERVIEW.contentWide)}>
              <Button
                disabled={isHeld}
                onClick={step === 0 ? leave : picker.chosen ? picker.clear : () => go(step - 1)}
              >
                {QUESTIONNAIRE_COPY.back}
              </Button>
              <Button
                variant="primary"
                disabled={isHeld || (isLast && !can.writeCandidates)}
                onClick={() => (isLast ? void finish() : go(step + 1))}
              >
                {forward}
              </Button>
            </footer>
          </div>
        </>
      )}

      {picker.reveal && (
        <ExerciseReveal
          key={picker.reveal.exercise}
          exercise={picker.reveal.exercise}
          shuffle={picker.reveal.shuffle}
          onDone={picker.endReveal}
        />
      )}
    </InterviewFrame>
  )
}

export interface InterviewFlowProps {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  candidateId: string
  showsDevExercises: boolean
}

/**
 * Interview of one candidate as a full page
 * @param {RecruitmentDetail} detail - Session resolved server-side
 * @param {RecruitmentFields} fields - Declarations of the forms
 * @param {RecruitmentRights} can - What the viewer may do
 * @param {string} candidateId - Applicant interviewed
 * @param {boolean} showsDevExercises - Dev-only exercises on offer
 * @return {JSX.Element}
 */

export const InterviewFlow = ({
  detail,
  fields,
  can,
  candidateId,
  showsDevExercises,
}: InterviewFlowProps) => (
  <RecruitmentFileProvider detail={detail} fields={fields} can={can}>
    <InterviewBody candidateId={candidateId} showsDevExercises={showsDevExercises} />
  </RecruitmentFileProvider>
)
