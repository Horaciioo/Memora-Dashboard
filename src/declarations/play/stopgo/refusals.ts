/**
 * Why a play is refused
 * @type {Record<string, string>}
 */

export const StopGoRefusals = {
  NotSeated: 'notSeated',
  Stopped: 'stopped',
  Limited: 'limited',
  Overshoot: 'overshoot',
  AlreadyGreen: 'alreadyGreen',
  NoHazard: 'noHazard',
  NoOpponent: 'noOpponent',
  WrongTargetCount: 'wrongTargetCount',
  TooFewTargets: 'tooFewTargets',
  BadTarget: 'badTarget',
  AlreadyHit: 'alreadyHit',
  JokerSpent: 'jokerSpent',
  NothingToClean: 'nothingToClean',
} as const

export type StopGoRefusal = (typeof StopGoRefusals)[keyof typeof StopGoRefusals]
