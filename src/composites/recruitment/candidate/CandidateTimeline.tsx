'use client'

import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/page/Section'
import { Timeline } from '@/components/structures/data/Timeline'
import type { TimelineState } from '@/components/structures/data/Timeline'
import { CANDIDATE_STAGES } from '@/core/lib/recruitment/candidateTimeline'
import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'
import { CANDIDATE_COPY, CANDIDATE_STAGE_COPY } from '@/declarations/recruitment/candidateCopy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'

export interface CandidateTimelineProps {
  states: Record<CandidateStage, TimelineState>
  canPass: boolean
  // Opens the interview for the first time or again
  onPass: () => void
  // Opens the finished interview
  onReview: () => void
  // Puts the candidate on this moment
  onToggle?: (stage: CandidateStage) => void
}

// Button each moment offers, only while it is the current one
const STAGE_BUTTONS: Partial<Record<CandidateStage, string>> = {
  interviewing: CANDIDATE_COPY.resume,
  results: CANDIDATE_COPY.review,
}

/**
 * Where a candidate stands, every moment drawn on a vertical thread
 * @param {Record<CandidateStage, TimelineState>} states - State per moment
 * @param {boolean} canPass - Viewer may start the interview
 * @param {() => void} onPass - Starts or resumes the interview
 * @param {() => void} onReview - Opens the finished interview
 * @param {(stage: CandidateStage) => void} [onToggle] - Places the candidate on a moment
 * @return {JSX.Element}
 */

export const CandidateTimeline = ({
  states,
  canPass,
  onPass,
  onReview,
  onToggle,
}: CandidateTimelineProps) => (
  <Section title={CANDIDATE_COPY.timeline} bare className="mt-4">
    <div className={MEMBER_FILE.rail}>
      <div className="p-4 md:p-5">
        <Timeline
          struckDone
          label={CANDIDATE_COPY.timeline}
          items={CANDIDATE_STAGES.map((stage) => {
            const label = STAGE_BUTTONS[stage]

            return {
              id: stage,
              state: states[stage],
              title: CANDIDATE_STAGE_COPY[stage],
              onSelect: stage !== 'joined' && onToggle ? () => onToggle(stage) : undefined,
              children:
                label && states[stage] === 'current' ? (
                  <Button
                    variant="primary"
                    disabled={stage !== 'results' && !canPass}
                    onClick={stage === 'results' ? onReview : onPass}
                    className="mt-2 self-start"
                  >
                    {label}
                  </Button>
                ) : undefined,
            }
          })}
        />
      </div>
    </div>
  </Section>
)
