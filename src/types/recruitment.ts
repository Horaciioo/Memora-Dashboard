import type { CommentView } from '@/types/comments'
import type { DiscordIdentifierView } from '@/types/discord'
import type { IntegrationLinkView } from '@/types/onboarding'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type {
  AnswerAppreciationName,
  RecruitmentOwnerName,
  RecruitmentPlatformName,
  RecruitmentStatusName,
} from '@/utils/constants/recruitment'

/**
 * Named row a session points at
 * @typedef {Object} RecruitmentRef
 * @property {string} id - Row identifier
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 * @property {string | null} [image] - Portrait shown beside the label
 * @property {string | null} [icon] - Glyph key of a function
 */

export interface RecruitmentRef {
  id: string
  label: string
  accent: string | null
  image?: string | null
  icon?: string | null
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
 * @property {RecruitmentRef[]} responsables - Moderators carrying the session
 * @property {RecruitmentPlatformName} platform - Platform the script is written for
 * @property {string | null} academySessionId - Promotion this campaign feeds
 * @property {string | null} promotionTitle - Name of that promotion
 * @property {string | null} youtuberBanner - Banner of the creator
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
  responsables: RecruitmentRef[]
  platform: RecruitmentPlatformName
  academySessionId: string | null
  promotionTitle: string | null
  youtuberBanner: string | null
  // Discord wording once announced
  announcement: string | null
  opensAt: string | null
  closesAt: string | null
  candidateCount: number
  interviewedCount: number
  values: FormValues
}

/**
 * What the recruiter wrote on one question
 * @typedef {Object} AnswerState
 * @property {string} notes - Free notes
 * @property {AnswerAppreciationName | null} appreciation - Reaction
 * @property {boolean} skipped - Left out
 */

export interface AnswerState {
  notes: string
  appreciation: AnswerAppreciationName | null
  skipped: boolean
}

/**
 * One applicant of a session
 * @typedef {Object} CandidateView
 * @property {string} id - Candidate identifier
 * @property {string} discordId - Discord identifier
 * @property {string | null} displayName - Pseudonym given at application
 * @property {string} name - Best known name
 * @property {string | null} formId - Meltdown Forms identifier
 * @property {RecruitmentRef | null} recruiter - Moderator leading the interview
 * @property {RecruitmentRef[]} observers - Moderators sitting in
 * @property {string | null} interviewAt - When the interview is held
 * @property {boolean} attended - Showed up
 * @property {string | null} outcomeId - Column of the results board
 * @property {string} review - Written outcome of the application
 * @property {number} position - Order inside its column
 * @property {string | null} memberId - Existing moderator holding that Discord identifier
 * @property {string | null} memberName - Display name of that moderator
 * @property {string | null} avatarUrl - Discord portrait once known
 * @property {Record<string, boolean>} stageMarks - Timeline moments ticked by hand
 * @property {CommentView[]} comments - Remarks left on the application
 * @property {Record<string, AnswerState>} answers - Interview notes by question key
 */

export interface CandidateView {
  id: string
  discordId: string
  displayName: string | null
  name: string
  formId: string | null
  recruiter: RecruitmentRef | null
  observers: RecruitmentRef[]
  interviewAt: string | null
  attended: boolean
  outcomeId: string | null
  review: string
  position: number
  memberId: string | null
  memberName: string | null
  avatarUrl: string | null
  stageMarks: Record<string, boolean>
  comments: CommentView[]
  answers: Record<string, AnswerState>
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
 * @property {boolean} emitsInvite - Hands out the integration form
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
  emitsInvite: boolean
  position: number
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
 * @property {CommentView[]} comments - Remarks left on the whole session
 * @property {CandidateView[]} candidates - Applicants held
 * @property {RecruitmentStepView[]} steps - Timeline moments
 * @property {string[]} questionKeys - Questions picked for the interviews
 * @property {RecruitmentOutcomeView[]} outcomes - Columns of the results board
 * @property {IntegrationLinkView | null} link - Integration form handed out
 */

export interface RecruitmentDetail {
  summary: RecruitmentSummary
  instructions: string
  comments: CommentView[]
  candidates: CandidateView[]
  steps: RecruitmentStepView[]
  questionKeys: string[]
  outcomes: RecruitmentOutcomeView[]
  link: IntegrationLinkView | null
  identifiers: DiscordIdentifierView[]
}

/**
 * Declarations of the forms of a session file
 * @typedef {Object} RecruitmentFields
 */

export interface RecruitmentFields {
  session: FieldDefinition[]
  candidate: FieldDefinition[]
  step: FieldDefinition[]
  comment: FieldDefinition[]
  review: FieldDefinition[]
  instruction: FieldDefinition[]
  link: FieldDefinition[]
}

/**
 * What the viewer may do on the file
 * @typedef {Object} RecruitmentRights
 */

export interface RecruitmentRights {
  manage: boolean
  writeCandidates: boolean
  writeInstructions: boolean
  manageLinks: boolean
  readLogs: boolean
  // Reads as an observer, nothing writes
  observing: boolean
  viewerId: string
}

/**
 * Temporary link handing a written context to a candidate
 * @typedef {Object} ExerciseLinkView
 * @property {string} id - Link identifier
 * @property {string} contextKey - Context handed out
 * @property {string} token - Public token
 * @property {number} plays - Times the situation was played
 * @property {boolean} isClaimed - Candidate proved their identity
 * @property {string} expiresAt - End of validity, ISO date
 * @property {boolean} isExpired - Over, by time or by hand
 */

export interface ExerciseLinkView {
  id: string
  contextKey: string
  token: string
  plays: number
  isClaimed: boolean
  expiresAt: string
  isExpired: boolean
}
