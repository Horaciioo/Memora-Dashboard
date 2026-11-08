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
    fallback: 15,
    min: minPlayers,
  }),
  countdownSeconds: readSeconds(golf.countdownSeconds, 'countdownSeconds', 4),
  holeIntroSeconds: readSeconds(golf.holeIntroSeconds, 'holeIntroSeconds', 2),
  intermissionSeconds: readSeconds(golf.intermissionSeconds, 'intermissionSeconds', 8),
  resultDelaySeconds: readSeconds(golf.resultDelaySeconds, 'resultDelaySeconds', 3),
  holeSeconds: readRange(golf.holeSeconds, 'play/golf.holeSeconds', {
    initial: 120,
    min: 30,
    max: 300,
  }),
  holeSecondsPresets: (Array.isArray(golf.holeSecondsPresets) ? golf.holeSecondsPresets : []).map(
    (seconds, index) =>
      readInteger(seconds, { path: `play/golf.holeSecondsPresets.${index}`, fallback: 90, min: 1 })
  ),
  maxStrokes: readRange(golf.maxStrokes, 'play/golf.maxStrokes', { initial: 8, min: 3, max: 15 }),
  holes: readRange(golf.holes, 'play/golf.holes', { initial: 6, min: 1, max: 6 }),
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
  // Par: tee to cup distance, in metres, up to which a hole is a par 2 then a par 3
  par: readNumbers(golf.par, 'play/golf.par', { shortTo: 12, mediumTo: 22 }),
  collisions: readBoolean(golf.collisions, { path: 'play/golf.collisions', fallback: true }),
  course: readString(golf.course, { path: 'play/golf.course', fallback: 'randomtown' }),
  shotsKeptSeconds: readSeconds(golf.shotsKeptSeconds, 'shotsKeptSeconds', 20),
  lateShotMs: readSeconds(golf.lateShotMs, 'lateShotMs', 1200),
  restToleranceMs: readSeconds(golf.restToleranceMs, 'restToleranceMs', 250),
  logLines: readInteger(golf.logLines, { path: 'play/golf.logLines', fallback: 4, min: 1 }),
  feedSize: readInteger(golf.feedSize, { path: 'play/golf.feedSize', fallback: 40, min: 1 }),
  clockLowSeconds: readSeconds(golf.clockLowSeconds, 'clockLowSeconds', 15),
  placementGap: readSeconds(golf.placementGap, 'placementGap', 1.2),
  physics: readNumbers(golf.physics, 'play/golf.physics', {
    stepHz: 120,
    frameEvery: 4,
    maxSeconds: 14,
    ballRadius: 0.1,
    maxSpeed: 9.8,
    layoutScale: 0.8,
    minPower: 0.03,
    rolling: 2.2,
    damping: 0.12,
    gravity: 6.5,
    restSpeed: 0.07,
    speedCap: 13.3,
    wallBounce: 0.86,
    ballBounce: 0.9,
    bumperBounce: 1.2,
    bumperKick: 4,
    cushionBounce: 1.1,
    cushionKick: 3.2,
    spinnerBounce: 0.85,
    spinnerThickness: 0.09,
    stepUp: 0.03,
    hitSound: 0.6,
    worldMargin: 1.5,
    boostAccel: 12,
    fall: 9.8,
    voidDepth: 3,
    landKeep: 0.92,
    hopSpeed: 1.2,
    groundBounce: 0.3,
    gridCell: 0.6,
  }),
  // Cup: funnel edge, funnel width and drop, pit depth, lip rebound
  cup: readNumbers(golf.physics.cup, 'play/golf.physics.cup', {
    radius: 0.24,
    funnel: 0.1,
    drop: 0.06,
    depth: 0.3,
    lipBounce: 0.45,
    lipKeep: 0.75,
    lipHold: 0.5,
  }),
  surfaces: readNumbers(golf.surfaces, 'play/golf.surfaces', {
    grass: 1,
    sand: 4.2,
    ice: 0.15,
    boost: 1,
  }),
  orbs: readNumbers(golf.orbs, 'play/golf.orbs', {
    radius: 0.15,
    respawnSeconds: 10,
    catchUp: 1,
  }),
  powers: {
    tornado: readNumbers(powers.tornado, 'play/golf.powers.tornado', {
      seconds: 25,
      radius: 2.4,
      swirl: 10,
      push: 2.5,
      pull: 1.6,
      core: 0.3,
      drift: 0.25,
      meander: 0.9,
      sway: 0.8,
    }),
    sticky: readNumbers(powers.sticky, 'play/golf.powers.sticky', {}),
    ice: readNumbers(powers.ice, 'play/golf.powers.ice', { seconds: 30, grip: 0.2 }),
    giant: readNumbers(powers.giant, 'play/golf.powers.giant', {
      shots: 1,
      scale: 1.5,
    }),
    mini: readNumbers(powers.mini, 'play/golf.powers.mini', {
      shots: 1,
      scale: 0.6,
      power: 0.75,
    }),
    antiCollision: readNumbers(powers.antiCollision, 'play/golf.powers.antiCollision', {
      seconds: 45,
    }),
    bumper: readNumbers(powers.bumper, 'play/golf.powers.bumper', { lives: 3, radius: 0.38 }),
    ghost: readNumbers(powers.ghost, 'play/golf.powers.ghost', { shots: 1 }),
    gust: readNumbers(powers.gust, 'play/golf.powers.gust', {
      seconds: 9,
      accel: 4,
      fans: 6,
      radius: 1.2,
      boost: 6,
    }),
    fart: readNumbers(powers.fart, 'play/golf.powers.fart', { reach: 1.2, tries: 12 }),
    flash: readNumbers(powers.flash, 'play/golf.powers.flash', { shots: 1, power: 4 }),
    steady: readNumbers(powers.steady, 'play/golf.powers.steady', { shots: 1 }),
    twist: readNumbers(powers.twist, 'play/golf.powers.twist', { shots: 1, turn: 1.6 }),
    mirror: readNumbers(powers.mirror, 'play/golf.powers.mirror', { shots: 1 }),
    blind: readNumbers(powers.blind, 'play/golf.powers.blind', { shots: 1 }),
    lob: readNumbers(powers.lob, 'play/golf.powers.lob', { shots: 1, lift: 0.55 }),
    bumperMan: readNumbers(powers.bumperMan, 'play/golf.powers.bumperMan', {
      shots: 2,
      lives: 2,
      scale: 2,
      kick: 7,
    }),
    boingBoing: readNumbers(powers.boingBoing, 'play/golf.powers.boingBoing', {
      shots: 2,
      bounces: 6,
      scale: 2,
      hop: 3.2,
      keep: 0.6,
    }),
    teleport: readNumbers(powers.teleport, 'play/golf.powers.teleport', { cells: 50 }),
  },
  // Ground squares, shared by the lawn grid and the teleporter reach
  grid: readNumbers(golf.grid, 'play/golf.grid', { cell: 0.2 }),
  // Chaos format, orbs and malus multipliers, powers held
  chaos: readNumbers(golf.chaos, 'play/golf.chaos', { orbs: 4, malus: 2, hand: 5 }),
  // Powers held at once
  hand: readInteger(golf.hand, { path: 'play/golf.hand', fallback: 3, min: 1 }),
  obstacles: readNumbers(golf.obstacles, 'play/golf.obstacles', {
    portalRadius: 0.3,
    vortexPull: 9,
    vortexCore: 0.2,
    fanAccel: 9,
    totemBounce: 0.9,
  }),
  tournament: {
    holesPerMap: readInteger(golf.tournament.holesPerMap, {
      path: 'play/golf.tournament.holesPerMap',
      fallback: 6,
      min: 1,
    }),
    maps: golf.tournament.maps.map((count, index) =>
      readInteger(count, { path: `play/golf.tournament.maps.${index}`, fallback: 3, min: 1 })
    ),
  },
  camera: readNumbers(golf.camera, 'play/golf.camera', {
    distance: 9.8,
    minDistance: 2.6,
    maxDistance: 14,
    pitch: 1,
    minPitch: 0.3,
    maxPitch: 1.45,
    dragPitch: 0.004,
    keyPitch: 1.2,
    follow: 6,
    turnSpeed: 2.2,
    dragTurn: 0.006,
    zoomStep: 0.0018,
    overviewPitch: 1.15,
    overviewReach: 0.95,
    keyZoom: 1.4,
    fov: 50,
  }),
  // Free flight of spectators and admins
  freeCamera: readNumbers(golf.freeCamera, 'play/golf.freeCamera', {
    speed: 6,
    minSpeed: 1.5,
    maxSpeed: 24,
    accel: 8,
    wheel: 0.0015,
    pan: 0.03,
    pinch: 0.04,
    margin: 6,
    minHeight: 0.6,
    maxHeight: 30,
    blend: 4,
  }),
  aim: readNumbers(golf.aim, 'play/golf.aim', {
    grabRadius: 1.1,
    pullMeters: 2.6,
    previewMeters: 3.2,
    wobble: 0.35,
    wobbleHz: 0.8,
    guideMeters: 6,
    guideBounce: 1.4,
    curve: 1.3,
    fullMeters: 16.2,
    shortPull: 0.1,
    shortMeters: 0.05,
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
    orbHover: 0.2,
  }),
}
