import stopgo from '@/configurations/play/stopgo.json'
import {
  readBoolean,
  readInteger,
  readIntegerList,
  readNode,
  readStringList,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'
import { STOPGO_CARD_KEYS } from '@/declarations/play/stopgo/cards'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'

// Raw nodes
const deck = readNode(stopgo.deck, 'play/stopgo.deck')
const immunity = readNode(stopgo.immunity, 'play/stopgo.immunity')
const goodDraw = readNode(stopgo.goodDraw, 'play/stopgo.goodDraw')
const mystery = readNode(stopgo.mystery, 'play/stopgo.mystery')
const accident = readNode(stopgo.accident, 'play/stopgo.accident')
const limit = readNode(stopgo.limit, 'play/stopgo.limit')
const track = readNode(stopgo.track, 'play/stopgo.track')

// Seat bounds
const minPlayers = readInteger(stopgo.minPlayers, {
  path: 'play/stopgo.minPlayers',
  fallback: 2,
  min: 2,
})

// Race distances
const targets = readIntegerList(stopgo.targets, {
  path: 'play/stopgo.targets',
  fallback: [500, 1000, 1500, 2000],
  min: 1,
})

/**
 * Deck quantity per card
 * @type {Record<StopGoCardKey, number>}
 */

const DECK = Object.fromEntries(
  STOPGO_CARD_KEYS.map((key) => [
    key,
    readInteger(deck[key], { path: `play/stopgo.deck.${key}`, fallback: 0, min: 0 }),
  ])
) as Record<StopGoCardKey, number>

/**
 * Stop and Go settings
 * @type {Object}
 */

export const STOPGO_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(stopgo.maxPlayers, {
    path: 'play/stopgo.maxPlayers',
    fallback: 4,
    min: minPlayers,
    max: 4,
  }),
  countdownSeconds: readInteger(stopgo.countdownSeconds, {
    path: 'play/stopgo.countdownSeconds',
    fallback: 5,
    min: 0,
  }),
  targets,
  target: targets.includes(stopgo.target) ? stopgo.target : targets[0],
  handSize: readInteger(stopgo.handSize, { path: 'play/stopgo.handSize', fallback: 6, min: 2 }),
  deck: DECK,
  turnSeconds: readRange(stopgo.turnSeconds, 'play/stopgo.turnSeconds', {
    initial: 30,
    min: 15,
    max: 60,
  }),
  turnStep: readInteger(stopgo.turnStep, { path: 'play/stopgo.turnStep', fallback: 5, min: 1 }),
  strikes: readInteger(stopgo.strikes, { path: 'play/stopgo.strikes', fallback: 3, min: 1 }),
  afkSeconds: readInteger(stopgo.afkSeconds, {
    path: 'play/stopgo.afkSeconds',
    fallback: 5,
    min: 1,
  }),
  reshuffles: readInteger(stopgo.reshuffles, {
    path: 'play/stopgo.reshuffles',
    fallback: 2,
    min: 0,
  }),
  immunitySeconds: readInteger(immunity.seconds, {
    path: 'play/stopgo.immunity.seconds',
    fallback: 6,
    min: 1,
  }),
  goodDrawSeconds: readInteger(goodDraw.seconds, {
    path: 'play/stopgo.goodDraw.seconds',
    fallback: 15,
    min: 1,
  }),
  mysteryCost: readInteger(mystery.cost, {
    path: 'play/stopgo.mystery.cost',
    fallback: 75,
    min: 0,
  }),
  accidentMinTargets: readInteger(accident.minTargets, {
    path: 'play/stopgo.accident.minTargets',
    fallback: 2,
    min: 1,
  }),
  limitMaxKm: readInteger(limit.maxKm, { path: 'play/stopgo.limit.maxKm', fallback: 50, min: 1 }),
  remedyNeedsGreen: readBoolean(stopgo.remedyNeedsGreen, {
    path: 'play/stopgo.remedyNeedsGreen',
    fallback: false,
  }),
  startsStopped: readBoolean(stopgo.startsStopped, {
    path: 'play/stopgo.startsStopped',
    fallback: true,
  }),
  mapKm: readInteger(track.mapKm, { path: 'play/stopgo.track.mapKm', fallback: 250, min: 1 }),
  signKm: readInteger(track.signKm, { path: 'play/stopgo.track.signKm', fallback: 100, min: 1 }),
  colors: readStringList(stopgo.colors, {
    path: 'play/stopgo.colors',
    fallback: ['red', 'blue', 'green', 'yellow'],
  }),
  feedSize: readInteger(stopgo.feedSize, { path: 'play/stopgo.feedSize', fallback: 40, min: 1 }),
}
