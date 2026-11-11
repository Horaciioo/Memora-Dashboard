import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
  readNumber,
  readString,
} from '@/declarations/configurations/readers'
import { NavalDecks, NavalOutlines, NavalPieces } from '@/declarations/play/naval/fleets/types'
import type {
  NavalFleet,
  NavalFleetColours,
  NavalHull,
  NavalPiece,
} from '@/declarations/play/naval/fleets/types'

// Colour keys every fleet declares
const COLOUR_KEYS = [
  'rim',
  'rimDark',
  'deck',
  'deckDark',
  'seam',
  'metal',
  'top',
  'dark',
  'stripe',
  'shell',
  'trail',
] as const satisfies readonly (keyof NavalFleetColours)[]

/**
 * List node, empty when missing
 * @param {unknown} raw - Node
 * @return {unknown[]} - Items
 */

const listOf = (raw: unknown): unknown[] => (Array.isArray(raw) ? raw : [])

/**
 * One deck piece
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalPiece} - Piece
 */

const readPiece = (raw: unknown, path: string): NavalPiece => {
  const node = readNode(raw, path)

  return {
    kind: readChoice(node.kind, {
      path: `${path}.kind`,
      fallback: NavalPieces.Bridge,
      allowed: Object.values(NavalPieces),
    }),
    at: readNumber(node.at, { path: `${path}.at`, fallback: 0.5, min: 0, max: 1 }),
    size: readNumber(node.size, { path: `${path}.size`, fallback: 0.4, min: 0.05, max: 2 }),
    barrels: readInteger(node.barrels ?? 1, {
      path: `${path}.barrels`,
      fallback: 1,
      min: 1,
      max: 3,
    }),
    across: readNumber(node.across ?? 0, { path: `${path}.across`, fallback: 0, min: -1, max: 1 }),
  }
}

/**
 * One ship class
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalHull} - Class
 */

const readHull = (raw: unknown, path: string): NavalHull => {
  const node = readNode(raw, path)

  return {
    outline: readChoice(node.outline, {
      path: `${path}.outline`,
      fallback: NavalOutlines.Bow,
      allowed: Object.values(NavalOutlines),
    }),
    beam: readNumber(node.beam, { path: `${path}.beam`, fallback: 0.8, min: 0.3, max: 0.95 }),
    deck: readChoice(node.deck, {
      path: `${path}.deck`,
      fallback: NavalDecks.Plain,
      allowed: Object.values(NavalDecks),
    }),
    sway: readNumber(node.sway, { path: `${path}.sway`, fallback: 1, min: 0.2, max: 3 }),
    isSubmerged: readBoolean(node.isSubmerged ?? false, {
      path: `${path}.isSubmerged`,
      fallback: false,
    }),
    bands: listOf(node.bands).map((band, index) =>
      readNumber(band, { path: `${path}.bands.${index}`, fallback: 0.9, min: 0, max: 1 })
    ),
    pieces: listOf(node.pieces).map((piece, index) => readPiece(piece, `${path}.pieces.${index}`)),
  }
}

/**
 * One fleet from its node
 * @param {unknown} raw - Node
 * @param {string} path - Config path
 * @return {NavalFleet} - Fleet
 */

export const readFleet = (raw: unknown, path: string): NavalFleet => {
  const node = readNode(raw, path)
  const colours = readNode(node.colours, `${path}.colours`)
  const classes = readNode(node.classes, `${path}.classes`)

  return {
    colours: Object.fromEntries(
      COLOUR_KEYS.map((key) => [
        key,
        readString(colours[key], { path: `${path}.colours.${key}`, fallback: '#808080' }),
      ])
    ) as Record<(typeof COLOUR_KEYS)[number], string>,
    classes: Object.fromEntries(
      Object.entries(classes).map(([length, hulls]) => [
        Number(length),
        listOf(hulls).map((hull, index) => readHull(hull, `${path}.classes.${length}.${index}`)),
      ])
    ),
  }
}
