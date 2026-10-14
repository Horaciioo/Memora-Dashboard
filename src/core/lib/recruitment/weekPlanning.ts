import { PLANNING_LAYOUT } from '@/declarations/recruitment/planning'
import type { CandidateView } from '@/types/recruitment'
import { weekGrid, type CalendarDay } from '@/utils/format/calendar'
import { formatDayKey, startOfWeek, parseDay } from '@/utils/format/days'

/**
 * One interview drawn on a day
 * @typedef {Object} PlannedInterview
 * @property {string} id - Candidate identifier
 * @property {string} name - Candidate name
 * @property {number} startMinute - Opening minute
 * @property {number} endMinute - Closing minute
 */

export interface PlannedInterview {
  id: string
  name: string
  startMinute: number
  endMinute: number
}

/**
 * Seven days of a week with their interviews
 * @typedef {Object} WeekPlan
 * @property {CalendarDay[]} days - Monday to Sunday
 * @property {Record<string, PlannedInterview[]>} byDay - Interviews per ISO day
 * @property {number} fromHour - First hour drawn
 * @property {number} toHour - Last hour drawn
 * @property {number} count - Interviews of the week
 */

export interface WeekPlan {
  days: CalendarDay[]
  byDay: Record<string, PlannedInterview[]>
  fromHour: number
  toHour: number
  count: number
}

/**
 * Monday of the week holding a moment
 * @param {string} moment - ISO day or moment
 * @return {string} - ISO Monday
 */

export const weekStartOf = (moment: string): string => formatDayKey(startOfWeek(parseDay(moment)))

/**
 * Week the planning opens on
 * @param {CandidateView[]} candidates - Session candidates
 * @return {string} - ISO Monday
 */

export const openingWeek = (candidates: CandidateView[]): string => {
  const moments = candidates
    .map((candidate) => candidate.interviewAt)
    .filter((moment): moment is string => moment !== null)
    .sort()
  const now = new Date().toISOString()

  // Next interview, else the last one
  const target = moments.find((moment) => moment >= now) ?? moments.at(-1) ?? now

  return weekStartOf(target)
}

/**
 * Lay the interviews of one week
 * @param {CandidateView[]} candidates - Session candidates
 * @param {string} weekStart - ISO Monday
 * @return {WeekPlan} - Week with hour window
 */

export const planWeek = (candidates: CandidateView[], weekStart: string): WeekPlan => {
  const days = weekGrid(weekStart)
  const byDay: Record<string, PlannedInterview[]> = Object.fromEntries(
    days.map((day) => [day.key, []])
  )

  // Interviews dropped on their day
  for (const candidate of candidates) {
    if (!candidate.interviewAt) continue

    const start = parseDay(candidate.interviewAt)
    const startMinute = start.getHours() * 60 + start.getMinutes()
    byDay[formatDayKey(start)]?.push({
      id: candidate.id,
      name: candidate.name,
      startMinute,
      endMinute: startMinute + PLANNING_LAYOUT.interviewMinutes,
    })
  }

  // Hour window around the interviews
  const all = Object.values(byDay).flat()
  const first = Math.min(...all.map((item) => item.startMinute))
  const last = Math.max(...all.map((item) => item.endMinute))
  const fromHour = all.length
    ? Math.max(Math.floor(first / 60) - PLANNING_LAYOUT.padHours, 0)
    : PLANNING_LAYOUT.emptyFromHour
  const toHour = all.length
    ? Math.min(Math.ceil(last / 60) + PLANNING_LAYOUT.padHours, 24)
    : PLANNING_LAYOUT.emptyToHour

  return { days, byDay, fromHour, toHour, count: all.length }
}
