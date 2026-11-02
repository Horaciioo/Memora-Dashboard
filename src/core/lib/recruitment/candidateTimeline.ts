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
 * @param {Record<string, boolean>} [marks] - Position set by hand, one entry per moment
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

  const computed: Record<CandidateStage, TimelineState> = {
    // A candidate exists through their Discord identifier
    joined: 'done',
    availabilities: isSlotted ? 'done' : 'current',
    waiting: isStarted ? 'done' : isSlotted ? 'current' : 'upcoming',
    interviewing: isJudged ? 'done' : isStarted ? 'current' : 'upcoming',
    results: isDecided ? 'done' : isJudged ? 'current' : 'upcoming',
  }

  return CANDIDATE_STAGES.some((stage) => stage in marks) ? positioned(marks) : computed
}

/**
 * Timeline placed by hand: ticked moments done, the first other one current
 * @param {Record<string, boolean>} marks - Ticked moments
 * @return {Record<CandidateStage, TimelineState>} - State per moment
 */

const positioned = (marks: Record<string, boolean>): Record<CandidateStage, TimelineState> => {
  const current = CANDIDATE_STAGES.find((stage) => stage !== 'joined' && marks[stage] !== true)
  const reached = current ? CANDIDATE_STAGES.indexOf(current) : CANDIDATE_STAGES.length

  return Object.fromEntries(
    CANDIDATE_STAGES.map((stage, index) => [
      stage,
      index < reached ? 'done' : index === reached ? 'current' : 'upcoming',
    ])
  ) as Record<CandidateStage, TimelineState>
}

/**
 * Marks putting a candidate on a moment: earlier ones ticked, the rest not
 * @param {CandidateStage} stage - Moment wanted as current
 * @return {Record<CandidateStage, boolean>} - Mark per moment
 */

export const marksAt = (stage: CandidateStage): Record<CandidateStage, boolean> =>
  Object.fromEntries(
    CANDIDATE_STAGES.map((entry, index) => [entry, index < CANDIDATE_STAGES.indexOf(stage)])
  ) as Record<CandidateStage, boolean>
