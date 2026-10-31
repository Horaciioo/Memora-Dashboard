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
 * @property {Record<string, string>} youtuberPartBanners - Banner of each interview part, by slot
 * @property {string | null} youtuberLogo - Logo of the creator
 * @property {string | null} opensAt - Announcement day
 * @property {string | null} closesAt - Closing day
 * @property {number} candidateCount - Applicants held
 * @property {number} interviewedCount - Applicants given a verdict
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
  youtuberPartBanners: Record<string, string>
  youtuberLogo: string | null
  // Discord wording once announced
  announcement: string | null
  opensAt: string | null
  closesAt: string | null
  candidateCount: number
  interviewedCount: number
  values: FormValues
}

/**
 * Part of the interview state a recruiter changes
 * @typedef {Object} InterviewPatch
 * @property {boolean} [formal] - Questions read with « vous »
 * @property {boolean} [started] - Interview opened
 * @property {boolean} [ended] - Interview closed
 * @property {string | null} [verdictOutcomeId] - Verdict given, null takes it back
 */

export interface InterviewPatch {
  formal?: boolean
  started?: boolean
  ended?: boolean
  verdictOutcomeId?: string | null
}

/**
 * What the recruiter wrote on one question
 * @typedef {Object} AnswerState
 * @property {string | null} branch - Branch unfolded
 * @property {AnswerAppreciationName | null} appreciation - Reaction
 * @property {boolean} skipped - Left out
 */

export interface AnswerState {
  branch: string | null
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
 * @property {RecruitmentRef[]} recruiters - Moderators leading the interview
 * @property {RecruitmentRef[]} observers - Moderators sitting in
 * @property {string | null} interviewAt - When the interview is held
 * @property {boolean} attended - Showed up
 * @property {boolean} formal - Questions read with « vous »
 * @property {string | null} interviewStartedAt - When a recruiter opened the interview
 * @property {string | null} interviewEndedAt - When its recruiter closed it
 * @property {string | null} verdictAt - When the verdict was given
 * @property {string | null} outcomeId - Column of the results board
 * @property {string} review - Written outcome of the application
 * @property {number} position - Order inside its column
 * @property {string | null} memberId - Existing moderator holding that Discord identifier
 * @property {string | null} memberName - Display name of that moderator
 * @property {string | null} avatarUrl - Discord portrait once known
 * @property {Record<string, boolean>} stageMarks - Timeline moments ticked by hand
 * @property {CommentView[]} comments - Remarks left on the application
 * @property {Record<string, AnswerState>} answers - Interview reactions by question key
 */

export interface CandidateView {
  id: string
  discordId: string
  displayName: string | null
  name: string
  formId: string | null
  recruiters: RecruitmentRef[]
  observers: RecruitmentRef[]
  interviewAt: string | null
  attended: boolean
  formal: boolean
  interviewStartedAt: string | null
  interviewEndedAt: string | null
  verdictAt: string | null
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
 * @property {string} name - Stable name, what code looks an outcome up by
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 * @property {boolean} isTerminal - Closes the application
 */

export interface RecruitmentOutcomeView {
  id: string
  name: string
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
 * @property {string[]} bannedIds - Barred identifiers, for those who manage
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
  // Identifiers barred from new sessions, filled for those who manage
  bannedIds: string[]
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
  // May sit in on an interview
  canObserve: boolean
  // Holds an observer seat of this session
  isObserver: boolean
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

/**
 * Identifier barred from the new sessions
 * @typedef {Object} BanView
 * @property {string} discordId - Barred identifier
 * @property {string | null} name - Name known when barred
 * @property {string | null} reason - Why it was barred
 * @property {string | null} sessionId - Session the decision was taken on
 * @property {string | null} sessionName - Name of that session
 * @property {string} createdAt - ISO moment
 */

export interface BanView {
  discordId: string
  name: string | null
  reason: string | null
  sessionId: string | null
  sessionName: string | null
  createdAt: string
}

/**
 * One passage of a person through a session
 * @typedef {Object} HistoryPassage
 * @property {string} candidateId - Candidate row
 * @property {string} sessionId - Session identifier
 * @property {string} sessionName - Session name
 * @property {{ label: string, accent: string | null } | null} outcome - Issue of the passage
 * @property {string} at - ISO moment, interview else arrival
 * @property {RecruitmentRef[]} recruiters - Who led the interview
 */

export interface HistoryPassage {
  candidateId: string
  sessionId: string
  sessionName: string
  outcome: { label: string; accent: string | null } | null
  at: string
  recruiters: RecruitmentRef[]
}

/**
 * One Discord identity and every session it went through
 * @typedef {Object} HistoryEntry
 * @property {string} discordId - Identity
 * @property {string} name - Last known name
 * @property {string | null} avatarUrl - Portrait
 * @property {HistoryPassage[]} passages - Sessions, newest first
 * @property {BanView | null} ban - Blacklist state
 */

export interface HistoryEntry {
  discordId: string
  name: string
  avatarUrl: string | null
  passages: HistoryPassage[]
  ban: BanView | null
}

/**
 * One page of the history
 * @typedef {Object} HistoryPage
 * @property {HistoryEntry[]} entries - Identities of the page
 * @property {boolean} hasMore - Another page follows
 */

export interface HistoryPage {
  entries: HistoryEntry[]
  hasMore: boolean
}
