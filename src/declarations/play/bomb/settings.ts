import bomb from '@/configurations/play/bomb.json'
import {
  readBounds,
  readChoice,
  readInteger,
  readNode,
  readString,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const lives = readNode(bomb.lives, 'play/bomb.lives')
const difficulties = readNode(bomb.difficulties, 'play/bomb.difficulties')

// Seat bounds
const minPlayers = readInteger(bomb.minPlayers, {
  path: 'play/bomb.minPlayers',
  fallback: 1,
  min: 1,
})

// Letter sets
const alphabet = readString(bomb.alphabet, {
  path: 'play/bomb.alphabet',
  fallback: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
}).toUpperCase()

/**
 * Words a prompt must fit, per level
 * @type {Record<string, number>}
 */

const WORDS_PER_PROMPT = {
  beginner: readInteger(difficulties.beginner, {
    path: 'play/bomb.difficulties.beginner',
    fallback: 500,
    min: 1,
  }),
  medium: readInteger(difficulties.medium, {
    path: 'play/bomb.difficulties.medium',
    fallback: 300,
    min: 1,
  }),
  hard: readInteger(difficulties.hard, {
    path: 'play/bomb.difficulties.hard',
    fallback: 100,
    min: 1,
  }),
}

export type BombDifficulty = keyof typeof WORDS_PER_PROMPT | 'custom'

/**
 * Bomb Party settings
 * @type {Object}
 */

export const BOMB_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(bomb.maxPlayers, {
    path: 'play/bomb.maxPlayers',
    fallback: 12,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(bomb.countdownSeconds, {
    path: 'play/bomb.countdownSeconds',
    fallback: 5,
    min: 0,
  }),
  startLives: readRange(lives.start, 'play/bomb.lives.start', { initial: 2, min: 1, max: 10 }),
  maxLives: readRange(lives.max, 'play/bomb.lives.max', { initial: 3, min: 1, max: 10 }),
  minTurnSeconds: readRange(bomb.minTurnSeconds, 'play/bomb.minTurnSeconds', {
    initial: 5,
    min: 1,
    max: 20,
  }),
  promptAge: readRange(bomb.promptAge, 'play/bomb.promptAge', { initial: 2, min: 1, max: 20 }),
  fuseSeconds: readBounds(bomb.fuseSeconds, {
    path: 'play/bomb.fuseSeconds',
    fallback: { min: 10, max: 30 },
  }),
  wordsPerPrompt: WORDS_PER_PROMPT,
  difficulty: readChoice<BombDifficulty>(bomb.difficulty, {
    path: 'play/bomb.difficulty',
    fallback: 'beginner',
    allowed: [...(Object.keys(WORDS_PER_PROMPT) as BombDifficulty[]), 'custom'],
  }),
  customWordsPerPrompt: readRange(bomb.customWordsPerPrompt, 'play/bomb.customWordsPerPrompt', {
    initial: 200,
    min: 1,
    max: 5000,
  }),
  customWordsStep: readInteger(bomb.customWordsStep, {
    path: 'play/bomb.customWordsStep',
    fallback: 50,
    min: 1,
  }),
  promptLengths: (Array.isArray(bomb.promptLengths) ? bomb.promptLengths : [2, 3]).map(
    (length, index) =>
      readInteger(length, { path: `play/bomb.promptLengths.${index}`, fallback: 2, min: 1 })
  ),
  alphabet: [...alphabet],
  bonusAlphabet: [
    ...readString(bomb.bonusAlphabet, {
      path: 'play/bomb.bonusAlphabet',
      fallback: alphabet,
    }).toUpperCase(),
  ].filter((letter) => alphabet.includes(letter)),
  wordLength: readInteger(bomb.wordLength, { path: 'play/bomb.wordLength', fallback: 30, min: 2 }),
  typingPaceMs: readInteger(bomb.typingPaceMs, {
    path: 'play/bomb.typingPaceMs',
    fallback: 200,
    min: 0,
  }),
  feedSize: readInteger(bomb.feedSize, { path: 'play/bomb.feedSize', fallback: 40, min: 1 }),
  blastFlashMs: readInteger(bomb.blastFlashMs, {
    path: 'play/bomb.blastFlashMs',
    fallback: 1600,
    min: 0,
  }),
}
