'use client'

import { Button } from '@/components/elements/actions/Button'
import { ScrollCard } from '@/components/structures/ScrollCard'
import { Timeline } from '@/components/structures/Timeline'
import type { TimelineItem, TimelineState } from '@/components/structures/Timeline'
import { CANDIDATE_STAGES } from '@/core/lib/recruitment/candidateTimeline'
import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'
import { CANDIDATE_COPY, CANDIDATE_STAGE_COPY } from '@/declarations/recruitment/candidateCopy'

export interface CandidateTimelineProps {
  states: Record<CandidateStage, TimelineState>
  canPass: boolean
  onPass: () => void
  // Opens the finished interview
  onReview: () => void
  // Ticks or unticks a moment
  onToggle?: (stage: CandidateStage) => void
}

/**
 * Where a candidate stands, small and quiet in a corner
 * @param {Record<CandidateStage, TimelineState>} states - State per moment
 * @param {boolean} canPass - Viewer may start the interview
 * @param {() => void} onPass - Starts the interview
 * @param {() => void} onReview - Opens the finished interview
 * @param {(stage: CandidateStage) => void} [onToggle] - Ticks a moment
 * @return {JSX.Element}
 */

export const CandidateTimeline = ({
  states,
  canPass,
  onPass,
  onReview,
  onToggle,
}: CandidateTimelineProps) => {
  const items: TimelineItem[] = CANDIDATE_STAGES.map((stage) => ({
    id: stage,
    state: states[stage],
    title: CANDIDATE_STAGE_COPY[stage],
    // The interview page drives its own moment
    onSelect: onToggle && stage !== 'interviewing' ? () => onToggle(stage) : undefined,
    children:
      stage === 'interviewing' && states.interviewing === 'done' ? (
        <Button onClick={onReview} className="self-start">
          {CANDIDATE_COPY.review}
        </Button>
      ) : (stage === 'waiting' && states.waiting !== 'done') ||
        (stage === 'interviewing' && states.interviewing === 'current') ? (
        <Button disabled={!canPass} onClick={onPass} className="self-start">
          {stage === 'waiting' ? CANDIDATE_COPY.pass : CANDIDATE_COPY.resume}
        </Button>
      ) : null,
  }))

  return (
    <ScrollCard title={CANDIDATE_COPY.timeline}>
      <Timeline compact fill label={CANDIDATE_COPY.timeline} items={items} />
    </ScrollCard>
  )
}
