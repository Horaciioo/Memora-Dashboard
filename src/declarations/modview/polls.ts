/**
 * Bounds of a Twitch poll
 * @type {Record<string, number>}
 */

export const POLL_LIMITS = {
  titleLength: 60,
  choiceLength: 25,
  minChoices: 2,
  maxChoices: 5,
  minSeconds: 15,
  maxSeconds: 1800,
  minPoints: 1,
  maxPoints: 1000000,
  defaultPoints: 100,
} as const

/**
 * Durations offered, in minutes
 * @type {readonly number[]}
 */

export const POLL_DURATIONS: readonly number[] = [1, 2, 3, 5, 10]

// Duration picked at opening
export const POLL_DEFAULT_MINUTES = 2

// Seconds between two reads of a running poll
export const POLL_REFRESH_SECONDS = 3

// Seconds the results stay above the chat
export const POLL_RESULT_SECONDS = 30
