import type { TimelineState } from '@/components/structures/data/Timeline'
import type { RecruitmentOutcomeView } from '@/types/recruitment'

/**
 * What the timeline reads from a candidate
 * @typedef {Object} CandidateProgress
 * @property {string | null} interviewAt - Slot fixed for the interview
 * @property {string | null} interviewStartedAt - When the interview was opened
 * @property {string | null} interviewEndedAt - When its recruiter closed it
 * @property {string | null} verdictAt - When the verdict was given
 * @property {string | null} outcomeId - Column reached
 */

export interface CandidateProgress {
  interviewAt: string | null
  interviewStartedAt: string | null
  interviewEndedAt: string | null
  verdictAt: string | null
  outcomeId: string | null
}

// Moments of a candidate, in order
export const CANDIDATE_STAGES = [
  'joined',
  'availabilities',
  'waiting',
  'interviewing',
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
  const isSlotted = progress.interviewAt !== null
  const isStarted = progress.interviewStartedAt !== null
  // Closed by its recruiter, or judged
  const isJudged = progress.interviewEndedAt !== null || progress.verdictAt !== null
  const isDecided =
    outcomes.find((outcome) => outcome.id === progress.outcomeId)?.isTerminal ?? false

  // A hand mark only stands in for a moment with no data of its own
  const hasSlot = isSlotted || marks.availabilities === true

  return {
    // A candidate exists through their Discord identifier
    joined: 'done',
    availabilities: hasSlot ? 'done' : 'current',
    waiting: isStarted ? 'done' : isSlotted ? 'current' : 'upcoming',
    interviewing: isJudged ? 'done' : isStarted ? 'current' : 'upcoming',
    results: isDecided ? 'done' : isJudged ? 'current' : 'upcoming',
  }
}
