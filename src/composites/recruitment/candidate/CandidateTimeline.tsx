'use client'

import { Section } from '@/components/structures/page/Section'
import { Timeline } from '@/components/structures/data/Timeline'
import type { TimelineState } from '@/components/structures/data/Timeline'
import { CANDIDATE_STAGES } from '@/core/lib/recruitment/candidateTimeline'
import type { CandidateStage } from '@/core/lib/recruitment/candidateTimeline'
import { CANDIDATE_COPY, CANDIDATE_STAGE_COPY } from '@/declarations/recruitment/candidateCopy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'

export interface CandidateTimelineProps {
  states: Record<CandidateStage, TimelineState>
  // Puts the candidate on this moment
  onToggle?: (stage: CandidateStage) => void
}

/**
 * Every moment of a candidate drawn on a vertical thread
 * @param {Record<CandidateStage, TimelineState>} states - State per moment
 * @param {(stage: CandidateStage) => void} [onToggle] - Places the candidate on a moment
 * @return {JSX.Element}
 */

export const CandidateTimelineBody = ({ states, onToggle }: CandidateTimelineProps) => (
  <Timeline
    struckDone
    label={CANDIDATE_COPY.timeline}
    items={CANDIDATE_STAGES.map((stage) => ({
      id: stage,
      state: states[stage],
      title: CANDIDATE_STAGE_COPY[stage],
      onSelect: stage !== 'joined' && onToggle ? () => onToggle(stage) : undefined,
    }))}
  />
)

/**
 * Timeline in its own box, under the identity rail
 * @param {CandidateTimelineProps} props - States and handlers
 * @return {JSX.Element}
 */

export const CandidateTimeline = (props: CandidateTimelineProps) => (
  <Section title={CANDIDATE_COPY.timeline} bare className="mt-4">
    <div className={MEMBER_FILE.rail}>
      <div className="p-4 md:p-5">
        <CandidateTimelineBody {...props} />
      </div>
    </div>
  </Section>
)
