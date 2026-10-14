'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { IntegrationLink } from '@/composites/academy/timeline/IntegrationLink'
import { LiveProgress } from '@/composites/academy/timeline/LiveProgress'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import type { JuniorFileContextState } from '@/composites/academy/junior/JuniorFileContext'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { PARKOUR_STEP } from '@/declarations/ui/variants'

type Gestures = (state: JuniorFileContextState) => ReactNode

// Lives bar of a period in course
const livesBar: Gestures = ({ parkour }) =>
  parkour && parkour.livesNeeded !== null ? (
    <LiveProgress count={parkour.liveCount} needed={parkour.livesNeeded} />
  ) : null

// The trainer of the junior writes the check-in
const reviewGesture: Gestures = ({ file, can, setFlow }) =>
  file.junior.trainer?.id === can.viewerId && can.writeReviews ? (
    <Button variant="primary" icon="sheet" onClick={() => setFlow('reviews')}>
      {PARKOUR_COPY.doReviews}
    </Button>
  ) : null

// A responsable keeps an outcome on the check-in
const decisionGesture: Gestures = ({ can, setFlow }) =>
  can.validateReviews ? (
    <Button variant="primary" icon="confirm" onClick={() => setFlow('decisions')}>
      {PARKOUR_COPY.doDecisions}
    </Button>
  ) : null

/**
 * Gestures each moment of the journey offers while it is the one in course
 * @type {Record<string, (state: JuniorFileContextState) => ReactNode>}
 */

const STEP_GESTURES: Record<string, Gestures> = {
  trainer: ({ can, trainerForm }) =>
    can.lead ? (
      <span {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiEdit }}>
        <Button variant="primary" icon="functionTrainer" onClick={trainerForm}>
          {PARKOUR_COPY.assignTrainer}
        </Button>
      </span>
    ) : null,
  kickoff: ({ can, actions }) =>
    can.lead ? (
      <Button
        variant="primary"
        icon="link"
        isLoading={actions.isSaving}
        onClick={() => void actions.declareKickoff()}
      >
        {PARKOUR_COPY.declareKickoff}
      </Button>
    ) : null,
  integration: ({ can, parkour }) =>
    can.lead && parkour?.integrationPath ? (
      <IntegrationLink path={parkour.integrationPath} />
    ) : null,
  launch: ({ can, parkour, promotion }) =>
    can.lead && parkour?.canLaunchAnyway ? (
      <Button
        variant="secondary"
        icon="climb"
        isLoading={promotion.isSaving}
        title={PARKOUR_COPY.launchAnywayHint}
        onClick={() => void promotion.launch()}
      >
        {PARKOUR_COPY.launchAnyway}
      </Button>
    ) : null,
  periodOne: livesBar,
  periodTwo: livesBar,
  reviewOne: reviewGesture,
  reviewTwo: reviewGesture,
  finalReview: reviewGesture,
  passOne: decisionGesture,
  decisionTwo: decisionGesture,
  decisionFinal: decisionGesture,
  standby: ({ can, parkour, promotion }) =>
    can.lead && parkour?.canOpenSecondPeriod ? (
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
 * Gestures of the moment in course, none for the others
 * @param {Object} props - Component props
 * @param {string} props.stepKey - Moment of the journey
 * @return {JSX.Element | null}
 */

export const JuniorStepActions = ({ stepKey }: { stepKey: string }) => {
  const state = useJuniorState()
  const gestures = STEP_GESTURES[stepKey]?.(state)

  return gestures ? <div className={PARKOUR_STEP.actions}>{gestures}</div> : null
}
