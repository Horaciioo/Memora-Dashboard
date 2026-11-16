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
  AlreadyStopped: 'alreadyStopped',
  Shielded: 'shielded',
  AlreadyLaid: 'alreadyLaid',
  NoCounter: 'noCounter',
  NotYourTurn: 'notYourTurn',
  StaleTurn: 'staleTurn',
  NotInHand: 'notInHand',
  RaceOver: 'raceOver',
  NotYet: 'notYet',
  Waiting: 'waiting',
  NoWindow: 'noWindow',
  AlreadySealed: 'alreadySealed',
  NoSealed: 'noSealed',
  PileEmpty: 'pileEmpty',
  NotPicking: 'notPicking',
  SameMalus: 'sameMalus',
  AlreadyDrawn: 'alreadyDrawn',
  MustDraw: 'mustDraw',
  TooShort: 'tooShort',
} as const

export type StopGoRefusal = (typeof StopGoRefusals)[keyof typeof StopGoRefusals]
