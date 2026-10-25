import golf from '@/configurations/play/golf.json'
import {
  readBoolean,
  readInteger,
  readNode,
  readNumber,
  readString,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

/**
 * Read a flat map of positive numbers
 * @param {unknown} value - Raw node
 * @param {string} path - Config path
 * @param {T} fallback - Defaults per key
 * @return {T} - Bounded numbers
 */

const readNumbers = <T extends Record<string, number>>(
  value: unknown,
  path: string,
  fallback: T
): T => {
  const node = readNode(value, path)

  return Object.fromEntries(
    Object.entries(fallback).map(([key, initial]) => [
      key,
      readNumber(node[key], { path: `${path}.${key}`, fallback: initial, min: 0 }),
    ])
  ) as T
}

// Raw nodes
const powers = readNode(golf.powers, 'play/golf.powers')

// Seat bounds
const minPlayers = readInteger(golf.minPlayers, {
  path: 'play/golf.minPlayers',
  fallback: 1,
  min: 1,
})

/**
 * Seconds of one timed step
 * @param {unknown} value - Raw value
 * @param {string} key - Config key
 * @param {number} fallback - Default
 * @return {number} - Seconds
 */

const readSeconds = (value: unknown, key: string, fallback: number): number =>
  readNumber(value, { path: `play/golf.${key}`, fallback, min: 0 })

/**
 * Golf settings
 * @type {Object}
 */

export const GOLF_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(golf.maxPlayers, {
    path: 'play/golf.maxPlayers',
    fallback: 8,
    min: minPlayers,
  }),
  countdownSeconds: readSeconds(golf.countdownSeconds, 'countdownSeconds', 4),
  holeIntroSeconds: readSeconds(golf.holeIntroSeconds, 'holeIntroSeconds', 2),
  intermissionSeconds: readSeconds(golf.intermissionSeconds, 'intermissionSeconds', 8),
  resultDelaySeconds: readSeconds(golf.resultDelaySeconds, 'resultDelaySeconds', 3),
  holeSeconds: readRange(golf.holeSeconds, 'play/golf.holeSeconds', {
    initial: 90,
    min: 30,
    max: 300,
  }),
  holeSecondsPresets: (Array.isArray(golf.holeSecondsPresets) ? golf.holeSecondsPresets : []).map(
    (seconds, index) =>
      readInteger(seconds, { path: `play/golf.holeSecondsPresets.${index}`, fallback: 90, min: 1 })
  ),
  maxStrokes: readRange(golf.maxStrokes, 'play/golf.maxStrokes', { initial: 8, min: 3, max: 15 }),
  holes: readRange(golf.holes, 'play/golf.holes', { initial: 9, min: 1, max: 9 }),
  missPenalty: readInteger(golf.missPenalty, {
    path: 'play/golf.missPenalty',
    fallback: 1,
    min: 0,
  }),
  voidPenalty: readInteger(golf.voidPenalty, {
    path: 'play/golf.voidPenalty',
    fallback: 1,
    min: 0,
  }),
  collisions: readBoolean(golf.collisions, { path: 'play/golf.collisions', fallback: true }),
  course: readString(golf.course, { path: 'play/golf.course', fallback: 'prairie' }),
  shotsKeptSeconds: readSeconds(golf.shotsKeptSeconds, 'shotsKeptSeconds', 20),
  lateShotMs: readSeconds(golf.lateShotMs, 'lateShotMs', 1200),
  restToleranceMs: readSeconds(golf.restToleranceMs, 'restToleranceMs', 250),
  feedSize: readInteger(golf.feedSize, { path: 'play/golf.feedSize', fallback: 40, min: 1 }),
  clockLowSeconds: readSeconds(golf.clockLowSeconds, 'clockLowSeconds', 10),
  placementGap: readSeconds(golf.placementGap, 'placementGap', 1.2),
  physics: readNumbers(golf.physics, 'play/golf.physics', {
    stepHz: 120,
    frameEvery: 4,
    maxSeconds: 14,
    ballRadius: 0.12,
    cupRadius: 0.21,
    maxSpeed: 13,
    minPower: 0.03,
    rolling: 1.25,
    damping: 0.32,
    gravity: 6.5,
    restSpeed: 0.07,
    speedCap: 19,
    wallBounce: 0.72,
    ballBounce: 0.9,
    bumperBounce: 1.2,
    bumperKick: 4,
    spinnerBounce: 0.85,
    spinnerThickness: 0.09,
    captureSpeed: 2.1,
    cupPull: 2,
    cupPullReach: 1.7,
    lipKeep: 0.82,
    stepUp: 0.03,
    hitSound: 0.6,
    worldMargin: 1.5,
    boostAccel: 12,
  }),
  surfaces: readNumbers(golf.surfaces, 'play/golf.surfaces', {
    grass: 1,
    sand: 4.2,
    ice: 0.15,
    boost: 1,
  }),
  orbs: readNumbers(golf.orbs, 'play/golf.orbs', { radius: 0.32, respawnSeconds: 10 }),
  powers: {
    tornado: readNumbers(powers.tornado, 'play/golf.powers.tornado', {
      seconds: 25,
      radius: 2.4,
      swirl: 10,
      push: 2.5,
    }),
    sticky: readNumbers(powers.sticky, 'play/golf.powers.sticky', { seconds: 25 }),
    giant: readNumbers(powers.giant, 'play/golf.powers.giant', {
      seconds: 25,
      scale: 3,
      capture: 0.55,
    }),
    mini: readNumbers(powers.mini, 'play/golf.powers.mini', {
      seconds: 25,
      scale: 0.34,
      power: 0.6,
    }),
    antiCollision: readNumbers(powers.antiCollision, 'play/golf.powers.antiCollision', {
      seconds: 45,
    }),
    bumper: readNumbers(powers.bumper, 'play/golf.powers.bumper', { lives: 3, radius: 0.38 }),
    ghost: readNumbers(powers.ghost, 'play/golf.powers.ghost', { shots: 1 }),
  },
  camera: readNumbers(golf.camera, 'play/golf.camera', {
    distance: 4.6,
    minDistance: 2.2,
    maxDistance: 11,
    pitch: 0.62,
    follow: 6,
    turnSpeed: 2.2,
    dragTurn: 0.006,
    zoomStep: 0.0018,
    overviewPitch: 1.15,
    overviewReach: 0.95,
    keyZoom: 1.4,
    fov: 50,
  }),
  aim: readNumbers(golf.aim, 'play/golf.aim', {
    grabRadius: 1.1,
    pullMeters: 2.6,
    previewMeters: 3.2,
  }),
  render: readNumbers(golf.render, 'play/golf.render', {
    maxDpr: 1.75,
    liteDpr: 1,
    liteCores: 4,
    floorDepth: 0.6,
    railHeight: 0.2,
    railWidth: 0.12,
    blockHeight: 0.42,
    flagHeight: 1.1,
    orbHover: 0.32,
    fallSpeed: 7,
  }),
}
