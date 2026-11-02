import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import type { CandidateView } from '@/types/recruitment'
import { formatDayKey } from '@/utils/format/days'

const MINUTE_MS = 60_000

// Where the viewer sits on an interview
export type MySeat = 'recruiters' | 'observers'

/**
 * Candidates where the viewer holds a seat
 * @param {CandidateView[]} candidates - Whole session
 * @param {string} viewerId - Member identifier
 * @param {MySeat} seat - Recruiter or observer
 * @return {CandidateView[]} - Their interviews
 */

export const myInterviews = (
  candidates: CandidateView[],
  viewerId: string,
  seat: MySeat
): CandidateView[] =>
  candidates.filter((candidate) => candidate[seat].some((member) => member.id === viewerId))

/**
 * Questionnaire opening window
 * @param {string | null} interviewAt - Slot of the interview
 * @param {number} now - Server milliseconds
 * @param {string | null} verdictAt - When the verdict was given
 * @return {boolean} - Open from the lead time to the verdict
 */

export const isQuestionnaireOpen = (
  interviewAt: string | null,
  now: number,
  verdictAt: string | null
): boolean =>
  interviewAt !== null &&
  verdictAt === null &&
  now >= new Date(interviewAt).getTime() - RECRUITMENT_SETTINGS.questionnaireLeadMinutes * MINUTE_MS

/**
 * One day of interviews
 * @typedef {Object} InterviewDay
 * @property {string | null} key - Local day key, null when unplanned
 * @property {CandidateView[]} items - Interviews in time order
 */

export interface InterviewDay {
  key: string | null
  items: CandidateView[]
}

/**
 * Interviews grouped by day
 * @param {CandidateView[]} candidates - Interviews to range
 * @return {InterviewDay[]} - Days in order, unplanned last
 */

export const groupByDay = (candidates: CandidateView[]): InterviewDay[] => {
  const planned = candidates
    .filter((candidate) => candidate.interviewAt !== null)
    .sort((a, b) => a.interviewAt!.localeCompare(b.interviewAt!))
  const days = [...Map.groupBy(planned, (candidate) => formatDayKey(candidate.interviewAt!))]
  const unplanned = candidates.filter((candidate) => candidate.interviewAt === null)

  return [
    ...days.map(([key, items]) => ({ key, items })),
    ...(unplanned.length > 0 ? [{ key: null, items: unplanned }] : []),
  ]
}

/**
 * Interviews from the latest to the oldest, the unplanned ones last
 * @param {CandidateView[]} candidates - Interviews to range
 * @return {CandidateView[]} - Newest first
 */

export const newestFirst = (candidates: CandidateView[]): CandidateView[] =>
  [...candidates].sort((a, b) => {
    if (a.interviewAt === null || b.interviewAt === null) {
      return Number(a.interviewAt === null) - Number(b.interviewAt === null)
    }

    return b.interviewAt.localeCompare(a.interviewAt)
  })

/**
 * Whether an interview falls today
 * @param {CandidateView[]} candidates - Interviews of the viewer
 * @param {number} now - Server milliseconds
 * @return {boolean} - One interview today
 */

export const hasInterviewToday = (candidates: CandidateView[], now: number): boolean =>
  candidates.some(
    (candidate) =>
      candidate.interviewAt !== null &&
      formatDayKey(candidate.interviewAt) === formatDayKey(new Date(now))
  )

/**
 * Interviews still to come
 * @param {CandidateView[]} candidates - Whole session
 * @param {number} now - Server milliseconds
 * @param {number} limit - Interviews kept
 * @return {CandidateView[]} - Soonest first
 */

export const upcomingInterviews = (
  candidates: CandidateView[],
  now: number,
  limit: number
): CandidateView[] =>
  candidates
    .filter(
      (candidate) =>
        candidate.interviewAt !== null &&
        candidate.verdictAt === null &&
        new Date(candidate.interviewAt).getTime() >= now
    )
    .sort((first, second) =>
      (first.interviewAt as string).localeCompare(second.interviewAt as string)
    )
    .slice(0, limit)

/**
 * Interviews counted per day
 * @param {CandidateView[]} candidates - Interviews to count
 * @return {{ key: string; label: string; count: number }[]} - Days in order, day of month as label
 */

export const dailyCounts = (
  candidates: CandidateView[]
): { key: string; label: string; count: number }[] =>
  groupByDay(candidates)
    .filter((day): day is InterviewDay & { key: string } => day.key !== null)
    .map((day) => ({
      key: day.key,
      label: String(Number(day.key.slice(-2))),
      count: day.items.length,
    }))
