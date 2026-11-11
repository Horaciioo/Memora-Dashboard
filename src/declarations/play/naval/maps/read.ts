import { readChoice, readInteger, readNode, readNumber } from '@/declarations/configurations/readers'
import { NavalDecorKinds, NavalSides } from '@/declarations/play/naval/maps/types'
import type {
  NavalBand,
  NavalDecor,
  NavalDecorKind,
  NavalMapLook,
  NavalRamp,
  NavalSide,
  NavalTheatre,
} from '@/declarations/play/naval/maps/types'

// Widest sea a theatre declares
const MAX_SIZE = 90

// Plain sides of a board
const EDGES = ['north', 'east', 'south', 'west'] as const

/**
 * Colours of a node, strings only
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {Record<string, string>} - Colours
 */

const readColours = (raw: unknown, path: string): Record<string, string> =>
  Object.fromEntries(
    Object.entries(readNode(raw, path)).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )

/**
 * Slow growth of strong weapons
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalRamp} - Ramp
 */

const readRamp = (raw: unknown, path: string): NavalRamp => {
  const node = readNode(raw, path)

  return {
    everyTurns: readInteger(node.everyTurns, { path: `${path}.everyTurns`, fallback: 6, min: 1 }),
    step: readNumber(node.step, { path: `${path}.step`, fallback: 0.05, min: 0, max: 1 }),
    max: readNumber(node.max, { path: `${path}.max`, fallback: 1.6, min: 1, max: 10 }),
  }
}

/**
 * What the combat reads of a map
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalTheatre} - Theatre
 */

export const readTheatre = (raw: unknown, path: string): NavalTheatre => {
  const node = readNode(raw, path)
  const size = readInteger(node.size, { path: `${path}.size`, fallback: 20, min: 6, max: MAX_SIZE })
  const lengths = Array.isArray(node.fleet) ? (node.fleet as unknown[]) : [5, 4, 3, 3, 2]

  return {
    size,
    fleet: lengths.map((length, index) =>
      readInteger(length, { path: `${path}.fleet.${index}`, fallback: 2, min: 1, max: size })
    ),
    reachScale: readNumber(node.reachScale, {
      path: `${path}.reachScale`,
      fallback: 1,
      min: 0.5,
      max: 3,
    }),
    ramp: readRamp(node.ramp, `${path}.ramp`),
  }
}

/**
 * Decor squares around the grid
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalBand} - Band per side
 */

const readBand = (raw: unknown, path: string): NavalBand => {
  const node = readNode(readNode(raw, path).band, `${path}.band`)

  return Object.fromEntries(
    EDGES.map((side) => [
      side,
      readInteger(node[side], { path: `${path}.band.${side}`, fallback: 2, min: 0, max: 16 }),
    ])
  ) as NavalBand
}

/**
 * One decor piece
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalDecor} - Piece
 */

const readDecor = (raw: unknown, path: string): NavalDecor => {
  const node = readNode(raw, path)
  const unit = (key: string, fallback: number) =>
    readNumber(node[key], { path: `${path}.${key}`, fallback, min: 0, max: 1 })

  return {
    kind: readChoice<NavalDecorKind>(node.kind, {
      path: `${path}.kind`,
      fallback: NavalDecorKinds.Rocks,
      allowed: Object.values(NavalDecorKinds),
    }),
    side: readChoice<NavalSide>(node.side, {
      path: `${path}.side`,
      fallback: 'north',
      allowed: NavalSides,
    }),
    at: unit('at', 0.5),
    depth: unit('depth', 0.5),
    scale: readNumber(node.scale, { path: `${path}.scale`, fallback: 1, min: 0.1, max: 3 }),
  }
}

/**
 * What the drawing reads of a map
 * @param {Record<string, unknown>} node - Map node
 * @param {string} path - Config path
 * @return {NavalMapLook} - Look
 */

export const readLook = (node: Record<string, unknown>, path: string): NavalMapLook => {
  const light = readNode(node.light, `${path}.light`)
  const sun = Array.isArray(light.sun) ? (light.sun as unknown[]) : []
  const life = readNode(node.life, `${path}.life`)
  const preview = readNode(node.preview, `${path}.preview`)

  return {
    band: readBand(node.frame, `${path}.frame`),
    sun: [0, 1].map((axis) =>
      readNumber(sun[axis], { path: `${path}.light.sun.${axis}`, fallback: -0.7, min: -1, max: 1 })
    ) as [number, number],
    light: readColours(node.light, `${path}.light`),
    water: readColours(node.water, `${path}.water`),
    land: readColours(node.land, `${path}.land`),
    decor: (Array.isArray(node.decor) ? (node.decor as unknown[]) : []).map((piece, index) =>
      readDecor(piece, `${path}.decor.${index}`)
    ),
    preview: {
      span: readNumber(preview.span, { path: `${path}.preview.span`, fallback: 40, min: 8, max: 140 }),
      focus: readNumber(preview.focus, { path: `${path}.preview.focus`, fallback: 0, min: 0, max: 1 }),
    },
    life: Object.fromEntries(
      Object.entries(life).filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    ),
  }
}
