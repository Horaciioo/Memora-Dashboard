'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import type { SessionFileState } from '@/composites/academy/session/SessionFileContext'
import { reviewQueue } from '@/core/lib/academy/queues'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { PARKOUR_STEP } from '@/declarations/ui/variants'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'

/**
 * Gesture of a moment, given the juniors standing on it
 * @typedef {(state: SessionFileState, here: string[]) => ReactNode} PromotionGesture
 */

type Gesture = (state: SessionFileState, here: string[]) => ReactNode

// The trainer writes the check-ins of their own juniors standing here
const reviewGesture: Gesture = ({ session, can, setFlow }, here) =>
  can.writeReviews &&
  reviewQueue(session.juniors, can.viewerId).some((junior) => here.includes(junior.id)) ? (
    <Button variant="primary" icon="sheet" onClick={() => setFlow('reviews')}>
      {PARKOUR_COPY.doReviews}
    </Button>
  ) : null

// A responsable keeps an outcome on the check-ins waiting here
const decisionGesture: Gesture = ({ can, setFlow }, here) =>
  can.validateReviews && here.length > 0 ? (
    <Button variant="primary" icon="confirm" onClick={() => setFlow('decisions')}>
      {PARKOUR_COPY.doDecisions}
    </Button>
  ) : null

/**
 * Gestures each moment of the promotion offers to whoever stands to act on it
 * @type {Record<string, PromotionGesture>}
 */

const STEP_GESTURES: Record<string, Gesture> = {
  reviewOne: reviewGesture,
  reviewTwo: reviewGesture,
  finalReview: reviewGesture,
  passOne: decisionGesture,
  decisionTwo: decisionGesture,
  decisionFinal: decisionGesture,
  standby: ({ can, detail, promotion }, here) =>
    can.lead &&
    here.length > 0 &&
    detail.summary.status === AcademySessionStatuses.Running &&
    detail.summary.secondPeriodAt === null ? (
      <Button
        variant="secondary"
        icon="climb"
        isLoading={promotion.isSaving}
        title={PARKOUR_COPY.openSecondPeriodHint}
        onClick={() => void promotion.openSecondPeriod()}
      >
        {PARKOUR_COPY.openSecondPeriod}
      </Button>
    ) : null,
}

/**
 * Gestures of a moment the promotion stands on, none for the others
 * @param {Object} props - Component props
 * @param {string} props.stepKey - Moment of the journey
 * @param {string[]} props.here - Juniors standing on it
 * @return {JSX.Element | null}
 */

export const PromotionStepActions = ({ stepKey, here }: { stepKey: string; here: string[] }) => {
  const state = useSessionState()
  const gestures = STEP_GESTURES[stepKey]?.(state, here)

  return gestures ? <div className={PARKOUR_STEP.actions}>{gestures}</div> : null
}
