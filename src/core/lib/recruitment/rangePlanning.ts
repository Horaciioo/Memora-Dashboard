import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import { PLANNING_LAYOUT } from '@/declarations/recruitment/planning'
import type { CandidateView } from '@/types/recruitment'
import { rangeGrid, type CalendarDay } from '@/utils/format/calendar'
import { addDays, formatDayKey, parseDay, startOfWeek } from '@/utils/format/days'

// Milliseconds in a day
const DAY_MS = 86_400_000

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
 * Interviews opening on the same minute, listed in one block
 * @typedef {Object} PlannedBlock
 * @property {{ id: string, name: string }[]} people - Candidates, one under the other
 * @property {number} startMinute - Opening minute
 * @property {number} endMinute - Closing minute, stretched to hold the names
 */

export interface PlannedBlock {
  people: { id: string; name: string }[]
  startMinute: number
  endMinute: number
}

/**
 * Days of a period with their interviews
 * @typedef {Object} RangePlan
 * @property {CalendarDay[]} days - First to last day
 * @property {Record<string, PlannedBlock[]>} byDay - Blocks per ISO day
 * @property {number} fromHour - First hour drawn
 * @property {number} toHour - Last hour drawn
 * @property {number} count - Interviews of the period
 */

export interface RangePlan {
  days: CalendarDay[]
  byDay: Record<string, PlannedBlock[]>
  fromHour: number
  toHour: number
  count: number
}

/**
 * Days a period holds, kept within the cap
 * @param {string} from - First ISO day
 * @param {string} to - Last ISO day
 * @return {number} - Day count, at least one
 */

export const rangeLength = (from: string, to: string): number => {
  const days = Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS) + 1

  return Math.min(Math.max(days, 1), RECRUITMENT_SETTINGS.planningMaxDays)
}

/**
 * Last day of a period once capped
 * @param {string} from - First ISO day
 * @param {string} to - Asked last ISO day
 * @return {string} - Last ISO day
 */

export const rangeEnd = (from: string, to: string): string =>
  formatDayKey(addDays(parseDay(from), rangeLength(from, to) - 1))

/**
 * Move a period by its own length
 * @param {[string, string]} range - First and last ISO day
 * @param {1 | -1} direction - Forward or back
 * @return {[string, string]} - Neighbouring period
 */

export const shiftRange = (range: [string, string], direction: 1 | -1): [string, string] => {
  const length = rangeLength(range[0], range[1])
  const from = formatDayKey(addDays(parseDay(range[0]), length * direction))

  return [from, formatDayKey(addDays(parseDay(from), length - 1))]
}

/**
 * Period the planning opens on
 * @param {CandidateView[]} candidates - Session candidates
 * @return {[string, string]} - Week holding the next interview, else the last
 */

export const openingRange = (candidates: CandidateView[]): [string, string] => {
  const moments = candidates
    .map((candidate) => candidate.interviewAt)
    .filter((moment): moment is string => moment !== null)
    .sort()
  const now = new Date().toISOString()

  // Next interview, else the last one
  const target = moments.find((moment) => moment >= now) ?? moments.at(-1) ?? now
  const start = startOfWeek(parseDay(target))

  return [formatDayKey(start), formatDayKey(addDays(start, 6))]
}

/**
 * Minutes a block needs to list its names
 * @param {number} count - Candidates in the block
 * @return {number} - Block length
 */

const blockMinutes = (count: number): number => {
  // One candidate fits on the time line
  if (count === 1) return RECRUITMENT_SETTINGS.interviewMinutes

  const height = (count + 1) * PLANNING_LAYOUT.lineHeight + PLANNING_LAYOUT.eventInset * 3

  return Math.max(
    RECRUITMENT_SETTINGS.interviewMinutes,
    Math.ceil((height * 60) / PLANNING_LAYOUT.hourHeight)
  )
}

/**
 * Gather interviews opening on the same minute
 * @param {PlannedInterview[]} items - One day interviews
 * @return {PlannedBlock[]} - Blocks, earliest first
 */

export const stackSameStart = (items: PlannedInterview[]): PlannedBlock[] => {
  const groups = Map.groupBy(items, (item) => item.startMinute)

  return [...groups]
    .sort(([first], [second]) => first - second)
    .map(([startMinute, group]) => ({
      people: group.map(({ id, name }) => ({ id, name })),
      startMinute,
      endMinute: Math.max(
        ...group.map((item) => item.endMinute),
        startMinute + blockMinutes(group.length)
      ),
    }))
}

/**
 * Lay the interviews of one period
 * @param {CandidateView[]} candidates - Session candidates
 * @param {string} from - First ISO day
 * @param {string} to - Last ISO day
 * @return {RangePlan} - Period with hour window
 */

export const planRange = (candidates: CandidateView[], from: string, to: string): RangePlan => {
  const days = rangeGrid(from, rangeLength(from, to))
  const perDay: Record<string, PlannedInterview[]> = Object.fromEntries(
    days.map((day) => [day.key, []])
  )

  // Interviews dropped on their day
  for (const candidate of candidates) {
    if (!candidate.interviewAt) continue

    const start = parseDay(candidate.interviewAt)
    const startMinute = start.getHours() * 60 + start.getMinutes()
    perDay[formatDayKey(start)]?.push({
      id: candidate.id,
      name: candidate.name,
      startMinute,
      endMinute: startMinute + RECRUITMENT_SETTINGS.interviewMinutes,
    })
  }

  // Same minute, one block
  const byDay = Object.fromEntries(
    Object.entries(perDay).map(([key, items]) => [key, stackSameStart(items)])
  )

  // Hour window around the interviews
  const all = Object.values(byDay).flat()
  const count = all.reduce((total, block) => total + block.people.length, 0)
  const first = Math.min(...all.map((block) => block.startMinute))
  const last = Math.max(...all.map((block) => block.endMinute))
  const fromHour = all.length
    ? Math.max(Math.floor(first / 60) - PLANNING_LAYOUT.padHours, 0)
    : PLANNING_LAYOUT.emptyFromHour
  const toHour = all.length
    ? Math.min(Math.ceil(last / 60) + PLANNING_LAYOUT.padHours, 24)
    : PLANNING_LAYOUT.emptyToHour

  return { days, byDay, fromHour, toHour, count }
}
