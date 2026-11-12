'use client'

import { Status } from '@/components/elements/display/Status'
import { StepTimeline } from '@/components/structures/data/StepTimeline'
import type { StepState, TimelineStep } from '@/components/structures/data/StepTimeline'
import { useFollowUp } from '@/core/hooks/data/unban/useFollowUp'
import { UNBAN_COPY, UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import { ONBOARDING_STYLES, UNBAN_PUBLIC_STYLES } from '@/declarations/ui/variants'
import { UnbanStatuses } from '@/utils/constants/unban'
import { formatDay, formatDayTime } from '@/utils/format/time/dates'
import type { PublicRequestView } from '@/types/unban'

// Where each step stands for each status
const STEP_STATES: Record<PublicRequestView['status'], [StepState, StepState, StepState]> = {
  [UnbanStatuses.Pending]: ['current', 'idle', 'idle'],
  [UnbanStatuses.InReview]: ['done', 'current', 'idle'],
  [UnbanStatuses.Accepted]: ['done', 'done', 'done'],
  [UnbanStatuses.Refused]: ['done', 'done', 'done'],
}

/**
 * Stages of the real path a request goes through
 * @param {PublicRequestView['status']} status - Where the request stands
 * @return {TimelineStep[]} - Steps
 */

const stepsOf = (status: PublicRequestView['status']): TimelineStep[] => {
  const [filed, review, decided] = STEP_STATES[status]

  return [
    { id: 'filed', label: UNBAN_PUBLIC_COPY.stepFiled, state: filed },
    { id: 'review', label: UNBAN_PUBLIC_COPY.stepReview, state: review },
    { id: 'decided', label: UNBAN_PUBLIC_COPY.stepDecided, state: decided },
  ]
}

export interface UnbanFollowUpProps {
  token: string
  initial: PublicRequestView
}

/**
 * Follow-up page of a filed request, the state first
 * @param {UnbanFollowUpProps} props - Component props
 * @return {JSX.Element}
 */

export const UnbanFollowUp = ({ token, initial }: UnbanFollowUpProps) => {
  const { view, hasFailed } = useFollowUp(token, initial)
  const option = UNBAN_STATUS_REGISTRY.get(view.status)
  const isDecided = view.decidedAt !== null

  return (
    <div className={UNBAN_PUBLIC_STYLES.stack}>
      <div className={UNBAN_PUBLIC_STYLES.section}>
        <span className={UNBAN_PUBLIC_STYLES.label}>{UNBAN_PUBLIC_COPY.reference}</span>
        <p className={UNBAN_PUBLIC_STYLES.reference}>{view.reference}</p>
        <Status
          label={view.statusLabel}
          tone={option.accent}
          icon={option.icon}
          className={UNBAN_PUBLIC_STYLES.statusBig}
        />
      </div>

      <StepTimeline steps={stepsOf(view.status)} label={UNBAN_PUBLIC_COPY.progressLabel} />

      {isDecided && (
        <div className={UNBAN_PUBLIC_STYLES.decision}>
          <span className={UNBAN_PUBLIC_STYLES.label}>
            {view.reviewNote ? UNBAN_PUBLIC_COPY.answer : UNBAN_PUBLIC_COPY.decision}
          </span>
          <p className={UNBAN_PUBLIC_STYLES.decisionText}>{view.reviewNote ?? view.statusLabel}</p>
        </div>
      )}

      <div className={UNBAN_PUBLIC_STYLES.meta}>
        <span>
          {UNBAN_PUBLIC_COPY.filedAt} {formatDayTime(view.submittedAt)}
        </span>
        <span>
          {UNBAN_PUBLIC_COPY.lastUpdate} {formatDayTime(view.updatedAt)}
        </span>
        <span>
          {UNBAN_PUBLIC_COPY.validUntil} {formatDay(view.linkExpiresAt)}
        </span>
        {hasFailed && <span className={UNBAN_PUBLIC_STYLES.error}>{UNBAN_PUBLIC_COPY.refreshFailed}</span>}
      </div>

      <section className={UNBAN_PUBLIC_STYLES.section}>
        <span className={UNBAN_PUBLIC_STYLES.label}>{UNBAN_PUBLIC_COPY.yourAnswers}</span>
        {view.answers.map((answer, index) => (
          <div key={`${index}-${answer.label}`} className={UNBAN_PUBLIC_STYLES.answer}>
            <span className={ONBOARDING_STYLES.identityName}>{answer.label}</span>
            <p className={answer.text ? UNBAN_PUBLIC_STYLES.answerText : UNBAN_PUBLIC_STYLES.empty}>
              {answer.text ?? UNBAN_COPY.emptyAnswer}
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
