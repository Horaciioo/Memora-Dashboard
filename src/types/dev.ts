/**
 * State of the fake live while testing
 * @typedef {Object} FakeLiveStatus
 * @property {boolean} running - The fake Twitch answers
 * @property {boolean} streaming - The simulated stream is on air
 * @property {string | null} liveId - Live created for the test
 * @property {string | null} pace - Chat pace
 */

export interface FakeLiveStatus {
  running: boolean
  streaming: boolean
  liveId: string | null
  pace: string | null
}
