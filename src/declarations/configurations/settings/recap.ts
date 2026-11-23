import recap from '@/configurations/system/recap.json'
import { readInteger } from '@/declarations/configurations/readers'

const read = (key: keyof typeof recap, fallback: number, min: number, max?: number) =>
  readInteger(recap[key], { path: `system/recap.${key}`, fallback, min, max })

/**
 * Recap bounds
 * @type {{ awayAfterMs: number, heartbeatMs: number, maxWindowDays: number, manualWindowDays: number, maxThreads: number, maxBeats: number, maxPeople: number, chapterLines: number, sourceTake: number, guideWaitMs: number, warmMs: number, switchOutMs: number, guideFindMs: number, switchMs: number, leaveMs: number, againNudgeMs: number }}
 */

export const RECAP_SETTINGS = {
  // Gap since the last sign of life that counts as an absence
  awayAfterMs: read('awayAfterMs', 28_800_000, 60_000),
  // Quiet time between two signs of life
  heartbeatMs: read('heartbeatMs', 300_000, 10_000),
  maxWindowDays: read('maxWindowDays', 30, 1, 365),
  // Window of a recap opened by hand
  manualWindowDays: read('manualWindowDays', 7, 1, 30),
  maxThreads: read('maxThreads', 40, 1, 200),
  // Lines a thread may hold
  maxBeats: read('maxBeats', 1, 1, 10),
  maxPeople: read('maxPeople', 50, 1, 100),
  // Lines a chapter shows before folding the rest
  chapterLines: read('chapterLines', 6, 1, 30),
  // Rows a source reads before folding them
  sourceTake: read('sourceTake', 200, 10, 1000),
  // Wait after a click on a lit part before the next stop
  guideWaitMs: read('guideWaitMs', 1200, 500, 60_000),
  // Pages loaded ahead, long enough to read what Memora says
  warmMs: read('warmMs', 2400, 500, 20_000),
  // Page fading out before the next one comes in
  switchOutMs: read('switchOutMs', 320, 50, 2000),
  // Time given to find the lit part before the whole page is lit
  guideFindMs: read('guideFindMs', 4000, 500, 20_000),
  // Page switch animation
  switchMs: read('switchMs', 600, 100, 3000),
  // Chat flying back to its button
  leaveMs: read('leaveMs', 650, 100, 3000),
  // Memora's closing line on her button
  againNudgeMs: read('againNudgeMs', 9000, 1000, 60_000),
}
