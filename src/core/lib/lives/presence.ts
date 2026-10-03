/**
 * Where a presence stands before a beat
 * @typedef {Object} PresenceTally
 * @property {Date} lastBeatAt - Previous beat
 * @property {number} visibleSeconds - Visible so far
 * @property {number} activeSeconds - Active so far
 */

export interface PresenceTally {
  lastBeatAt: Date
  visibleSeconds: number
  activeSeconds: number
}

/**
 * Add one beat to a presence: the time since the previous beat counts as visible or active,
 * capped so a late beat never inflates the total
 * @param {PresenceTally} tally - Presence
 * @param {Object} beat - Beat
 * @param {Date} beat.at - When
 * @param {boolean} beat.visible - Tab shown
 * @param {boolean} beat.active - Member acting recently
 * @param {number} capSeconds - Longest span one beat counts
 * @return {PresenceTally} - Presence after the beat
 */

export const tallyBeat = (
  tally: PresenceTally,
  beat: { at: Date; visible: boolean; active: boolean },
  capSeconds: number
): PresenceTally => {
  const elapsed = Math.max(
    0,
    Math.min(capSeconds, Math.round((beat.at.getTime() - tally.lastBeatAt.getTime()) / 1000))
  )

  return {
    lastBeatAt: beat.at,
    visibleSeconds: tally.visibleSeconds + (beat.visible ? elapsed : 0),
    // Acting in a hidden tab is not watching the chat
    activeSeconds: tally.activeSeconds + (beat.visible && beat.active ? elapsed : 0),
  }
}

/**
 * Whether a presence went silent long enough to be closed
 * @param {Date} lastBeatAt - Previous beat
 * @param {Date} now - Now
 * @param {number} staleSeconds - Silence tolerated
 * @return {boolean} - Stale
 */

export const isStale = (lastBeatAt: Date, now: Date, staleSeconds: number): boolean =>
  now.getTime() - lastBeatAt.getTime() > staleSeconds * 1000
