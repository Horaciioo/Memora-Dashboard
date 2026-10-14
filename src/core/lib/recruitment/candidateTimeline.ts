import type { TimelineState } from '@/components/structures/Timeline'
import type { RecruitmentOutcomeView } from '@/types/recruitment'

/**
 * What the timeline reads from a candidate
 * @typedef {Object} CandidateProgress
 * @property {string | null} interviewAt - Slot fixed for the interview
 * @property {boolean} attended - Interview taken
 * @property {string | null} outcomeId - Column reached
 */

export interface CandidateProgress {
  interviewAt: string | null
  attended: boolean
  outcomeId: string | null
}

// Moments of a candidate, in order
export const CANDIDATE_STAGES = [
  'joined',
  'availabilities',
  'waiting',
  'interviewing',
  'passed',
  'results',
] as const

export type CandidateStage = (typeof CANDIDATE_STAGES)[number]

/**
 * Where each moment of a candidate stands
 * @param {CandidateProgress} progress - What is known of them
 * @param {RecruitmentOutcomeView[]} outcomes - Columns of the results board
 * @param {Record<string, boolean>} [marks] - Moments ticked by hand
 * @return {Record<CandidateStage, TimelineState>} - State per moment
 */

export const candidateStates = (
  progress: CandidateProgress,
  outcomes: RecruitmentOutcomeView[],
  marks: Record<string, boolean> = {}
): Record<CandidateStage, TimelineState> => {
  const slotted = progress.interviewAt !== null

  // Set by the interview page itself, never by a hand tick
  const started = marks.interviewing === true
  const decided = outcomes.find((outcome) => outcome.id === progress.outcomeId)?.isTerminal ?? false

  const derived: Record<CandidateStage, TimelineState> = {
    // A candidate exists through their Discord identifier
    joined: 'done',
    availabilities: slotted || progress.attended ? 'done' : 'current',
    waiting: started || progress.attended ? 'done' : slotted ? 'current' : 'upcoming',
    interviewing: progress.attended ? 'done' : started ? 'current' : 'upcoming',
    passed: progress.attended ? 'done' : 'upcoming',
    results: decided ? 'done' : progress.attended ? 'current' : 'upcoming',
  }

  // A hand mark wins over what is known
  return Object.fromEntries(
    CANDIDATE_STAGES.map((stage) => [
      stage,
      stage === 'interviewing'
        ? derived[stage]
        : marks[stage] === true
          ? 'done'
          : marks[stage] === false && derived[stage] === 'done'
            ? 'upcoming'
            : derived[stage],
    ])
  ) as Record<CandidateStage, TimelineState>
}
