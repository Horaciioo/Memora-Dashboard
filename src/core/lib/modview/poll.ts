import { POLL_RESULT_SECONDS } from '@/declarations/modview/polls'
import type { LivePoll, LivePollChoice } from '@/types/modview'
import { MINUTE_SECONDS, SECOND_MS } from '@/utils/constants/time'

/**
 * Poll as Twitch answers it
 * @typedef {Object} HelixPoll
 */

export interface HelixPoll {
  id: string
  title: string
  status: string
  duration: number
  started_at: string
  ended_at: string | null
  choices: { id: string; title: string; votes: number }[]
}

/**
 * Poll worth showing above the chat
 * @param {HelixPoll} row - Twitch answer
 * @param {string | null} startedBy - Member who launched it
 * @param {number} now - Current time, milliseconds
 * @return {LivePoll | null} - Poll, none once its results are gone
 */

export const toLivePoll = (
  row: HelixPoll,
  startedBy: string | null,
  now: number
): LivePoll | null => {
  const isActive = row.status === 'ACTIVE'
  const isClosed = row.status === 'COMPLETED' || row.status === 'TERMINATED'
  if (!isActive && !isClosed) return null
  if (isClosed && row.ended_at) {
    const age = now - new Date(row.ended_at).getTime()
    if (age > POLL_RESULT_SECONDS * SECOND_MS) return null
  }

  return {
    id: row.id,
    title: row.title,
    choices: row.choices.map(({ id, title, votes }) => ({ id, title, votes })),
    status: isActive ? 'active' : 'ended',
    startedBy,
    startedAt: row.started_at,
    endsAt: new Date(new Date(row.started_at).getTime() + row.duration * SECOND_MS).toISOString(),
  }
}

/**
 * Votes of a poll
 * @param {LivePoll} poll - Poll
 * @return {number} - Total
 */

export const pollTotal = (poll: LivePoll): number =>
  poll.choices.reduce((sum, choice) => sum + choice.votes, 0)

/**
 * Share of the votes one choice holds
 * @param {LivePollChoice} choice - Choice
 * @param {number} total - Votes of the poll
 * @return {number} - Whole percent
 */

export const choiceShare = (choice: LivePollChoice, total: number): number =>
  total === 0 ? 0 : Math.round((choice.votes / total) * 100)

/**
 * Part of the time left
 * @param {LivePoll} poll - Poll
 * @param {number} now - Current time, milliseconds
 * @return {number} - Between 0 and 1
 */

export const pollTimeLeft = (poll: LivePoll, now: number): number => {
  const start = new Date(poll.startedAt).getTime()
  const end = new Date(poll.endsAt).getTime()

  return end <= start ? 0 : Math.min(1, Math.max(0, (end - now) / (end - start)))
}

/**
 * Remaining time as a clock
 * @param {LivePoll} poll - Poll
 * @param {number} now - Current time, milliseconds
 * @return {string} - Minutes and seconds
 */

export const pollClock = (poll: LivePoll, now: number): string => {
  const left = Math.max(0, Math.ceil((new Date(poll.endsAt).getTime() - now) / SECOND_MS))

  return `${Math.floor(left / MINUTE_SECONDS)}:${String(left % MINUTE_SECONDS).padStart(2, '0')}`
}
