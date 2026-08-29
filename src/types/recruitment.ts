import type { FormValues } from '@/types/forms'
import type { RecruitmentOwnerName, RecruitmentStatusName } from '@/utils/constants/recruitment'

/**
 * Named row a session points at
 * @typedef {Object} RecruitmentRef
 * @property {string} id - Row identifier
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 * @property {string | null} [image] - Portrait shown beside the label
 */

export interface RecruitmentRef {
  id: string
  label: string
  accent: string | null
  image?: string | null
}

/**
 * One recruitment session as the list renders it
 * @typedef {Object} RecruitmentSummary
 * @property {string} id - Session identifier
 * @property {string} name - Display name
 * @property {RecruitmentStatusName} status - Phase in force
 * @property {string | null} summary - Supporting line
 * @property {RecruitmentRef} youtuber - Creator recruited for
 * @property {RecruitmentRef} jobFunction - Post recruited for
 * @property {string | null} opensAt - Announcement day
 * @property {string | null} closesAt - Closing day
 * @property {number} candidateCount - Applicants held
 * @property {number} interviewedCount - Applicants who attended
 * @property {FormValues} values - Values feeding the edit form
 */

export interface RecruitmentSummary {
  id: string
  name: string
  status: RecruitmentStatusName
  summary: string | null
  youtuber: RecruitmentRef
  jobFunction: RecruitmentRef
  opensAt: string | null
  closesAt: string | null
  candidateCount: number
  interviewedCount: number
  values: FormValues
}

/**
 * Remark left on one candidate
 * @typedef {Object} CandidateComment
 * @property {string} id - Comment identifier
 * @property {string | null} authorName - Who wrote it
 * @property {string} body - Written trace
 * @property {string} createdAt - When it was written
 */

export interface CandidateComment {
  id: string
  authorName: string | null
  body: string
  createdAt: string
}

/**
 * One applicant of a session, keyed on their Discord identifier
 * @typedef {Object} CandidateView
 * @property {string} id - Candidate identifier
 * @property {string} discordId - Discord identifier, the key to a later account
 * @property {string | null} formId - Meltdown Forms identifier
 * @property {RecruitmentRef | null} recruiter - Moderator leading the interview
 * @property {RecruitmentRef[]} spectators - Moderators sitting in
 * @property {string | null} interviewAt - When the interview is held
 * @property {boolean} attended - Showed up
 * @property {string | null} outcomeId - Column of the results board
 * @property {string} review - Written outcome of the application
 * @property {number} position - Order inside its column
 * @property {string | null} memberId - Existing moderator holding that Discord identifier
 * @property {string | null} memberName - Display name of that moderator
 * @property {CandidateComment[]} comments - Remarks left on the application
 */

export interface CandidateView {
  id: string
  discordId: string
  formId: string | null
  recruiter: RecruitmentRef | null
  spectators: RecruitmentRef[]
  interviewAt: string | null
  attended: boolean
  outcomeId: string | null
  review: string
  position: number
  memberId: string | null
  memberName: string | null
  comments: CandidateComment[]
}

/**
 * One moment of a session timeline
 * @typedef {Object} RecruitmentStepView
 * @property {string} id - Step identifier
 * @property {string} title - Display title
 * @property {string | null} notes - Free trace
 * @property {RecruitmentOwnerName} owner - Who carries it out
 * @property {number} offset - Days from the session opening
 * @property {string | null} scheduledAt - Resolved day
 * @property {string | null} doneAt - When it was cleared
 * @property {boolean} required - Cannot be skipped
 * @property {number} position - Display order
 */

export interface RecruitmentStepView {
  id: string
  title: string
  notes: string | null
  owner: RecruitmentOwnerName
  offset: number
  scheduledAt: string | null
  doneAt: string | null
  required: boolean
  position: number
}

/**
 * One question of the interview script
 * @typedef {Object} RecruitmentQuestionView
 * @property {string} id - Question identifier
 * @property {string} prompt - What is asked
 * @property {string | null} hint - What the answer should cover
 */

export interface RecruitmentQuestionView {
  id: string
  prompt: string
  hint: string | null
}

/**
 * One column of the results board
 * @typedef {Object} RecruitmentOutcomeView
 * @property {string} id - Outcome identifier
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 * @property {boolean} isTerminal - Closes the application
 */

export interface RecruitmentOutcomeView {
  id: string
  label: string
  accent: string | null
  isTerminal: boolean
}

/**
 * Everything one session page renders
 * @typedef {Object} RecruitmentDetail
 * @property {RecruitmentSummary} summary - Session header
 * @property {string} instructions - Consignes of this session
 * @property {CandidateView[]} candidates - Applicants held
 * @property {RecruitmentStepView[]} steps - Timeline moments
 * @property {RecruitmentQuestionView[]} questions - Interview script in force
 * @property {RecruitmentOutcomeView[]} outcomes - Columns of the results board
 */

export interface RecruitmentDetail {
  summary: RecruitmentSummary
  instructions: string
  candidates: CandidateView[]
  steps: RecruitmentStepView[]
  questions: RecruitmentQuestionView[]
  outcomes: RecruitmentOutcomeView[]
}
