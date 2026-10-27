import ludo from '@/configurations/play/ludo.json'
import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const rules = readNode(ludo.rules, 'play/ludo.rules')
const exits = readNode(ludo.exits, 'play/ludo.exits')

// Seat bounds
const minPlayers = readInteger(ludo.minPlayers, {
  path: 'play/ludo.minPlayers',
  fallback: 1,
  min: 1,
})

/**
 * Die faces letting a pawn out, per rule
 * @param {string} key - Rule key
 * @param {number[]} fallback - Default faces
 * @return {number[]} - Faces
 */

const readFaces = (key: string, fallback: number[]): number[] => {
  const faces = Array.isArray(exits[key]) ? (exits[key] as unknown[]) : fallback
  const read = faces.map((face, index) =>
    readInteger(face, { path: `play/ludo.exits.${key}.${index}`, fallback: 6, min: 1, max: 6 })
  )

  return read.length ? read : fallback
}

/**
 * Die faces opening the yard, per rule
 * @type {Record<string, number[]>}
 */

const EXIT_FACES = {
  six: readFaces('six', [6]),
  oneOrSix: readFaces('oneOrSix', [1, 6]),
  fiveOrSix: readFaces('fiveOrSix', [5, 6]),
}

export type LudoExitRule = keyof typeof EXIT_FACES

/**
 * When a Ludo game ends
 * @type {Record<string, string>}
 */

export const LudoEndings = {
  // First player home wins
  First: 'first',
  // Play on for every place
  Podium: 'podium',
} as const

export type LudoEndingName = (typeof LudoEndings)[keyof typeof LudoEndings]

/**
 * Switchable house rules
 * @type {Record<string, boolean>}
 */

const RULES = {
  sixReplay: readBoolean(rules.sixReplay, { path: 'play/ludo.rules.sixReplay', fallback: true }),
  threeSixes: readBoolean(rules.threeSixes, { path: 'play/ludo.rules.threeSixes', fallback: true }),
  captureReplay: readBoolean(rules.captureReplay, {
    path: 'play/ludo.rules.captureReplay',
    fallback: true,
  }),
  homeReplay: readBoolean(rules.homeReplay, { path: 'play/ludo.rules.homeReplay', fallback: true }),
  forcedCapture: readBoolean(rules.forcedCapture, {
    path: 'play/ludo.rules.forcedCapture',
    fallback: false,
  }),
  safeSquares: readBoolean(rules.safeSquares, {
    path: 'play/ludo.rules.safeSquares',
    fallback: true,
  }),
  exactFinish: readBoolean(rules.exactFinish, {
    path: 'play/ludo.rules.exactFinish',
    fallback: true,
  }),
}

export type LudoRuleName = keyof typeof RULES

/**
 * Ludo settings
 * @type {Object}
 */

export const LUDO_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(ludo.maxPlayers, {
    path: 'play/ludo.maxPlayers',
    fallback: 4,
    min: minPlayers,
    max: 4,
  }),
  countdownSeconds: readInteger(ludo.countdownSeconds, {
    path: 'play/ludo.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  pawns: readRange(ludo.pawns, 'play/ludo.pawns', { initial: 4, min: 1, max: 4 }),
  turnSeconds: readRange(ludo.turnSeconds, 'play/ludo.turnSeconds', {
    initial: 20,
    min: 10,
    max: 60,
  }),
  turnStep: readInteger(ludo.turnStep, { path: 'play/ludo.turnStep', fallback: 5, min: 1 }),
  exits: EXIT_FACES,
  exit: readChoice<LudoExitRule>(ludo.exit, {
    path: 'play/ludo.exit',
    fallback: 'six',
    allowed: Object.keys(EXIT_FACES) as LudoExitRule[],
  }),
  ending: readChoice<LudoEndingName>(ludo.ending, {
    path: 'play/ludo.ending',
    fallback: LudoEndings.Podium,
    allowed: Object.values(LudoEndings),
  }),
  rules: RULES,
  maxSixes: readInteger(ludo.maxSixes, { path: 'play/ludo.maxSixes', fallback: 3, min: 2 }),
  graceSeconds: readInteger(ludo.graceSeconds, {
    path: 'play/ludo.graceSeconds',
    fallback: 1,
    min: 0,
  }),
  stepMs: readInteger(ludo.stepMs, { path: 'play/ludo.stepMs', fallback: 280, min: 40 }),
  rollMs: readInteger(ludo.rollMs, { path: 'play/ludo.rollMs', fallback: 700, min: 100 }),
  shuffleMs: readInteger(ludo.shuffleMs, { path: 'play/ludo.shuffleMs', fallback: 80, min: 20 }),
  alertSeconds: readInteger(ludo.alertSeconds, {
    path: 'play/ludo.alertSeconds',
    fallback: 5,
    min: 0,
  }),
  feedSize: readInteger(ludo.feedSize, { path: 'play/ludo.feedSize', fallback: 40, min: 1 }),
}
