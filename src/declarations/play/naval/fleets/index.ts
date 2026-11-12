import fleets from '@/configurations/play/naval/fleets.json'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { readNode, readString } from '@/declarations/configurations/readers'
import { readFleet } from '@/declarations/play/naval/fleets/read'
import { NavalDecks, NavalFleetSides, NavalOutlines } from '@/declarations/play/naval/fleets/types'
import type { NavalFleet, NavalFleetSide, NavalHull } from '@/declarations/play/naval/fleets/types'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'
import type { NavalSkin } from '@/declarations/play/naval/skins'

export * from '@/declarations/play/naval/fleets/types'

// Class of a fleet without any
const PLAIN_HULL: NavalHull = {
  outline: NavalOutlines.Bow,
  beam: 0.8,
  deck: NavalDecks.Plain,
  sway: 1,
  isSubmerged: false,
  bands: [],
  pieces: [],
}

// Raw nodes
const sides = readNode(fleets.sides, 'play/naval/fleets.sides')
const list = readNode(fleets.fleets, 'play/naval/fleets.fleets')

// Fleets by key
const FLEETS = new Map<string, NavalFleet>(
  Object.entries(list).map(([id, raw]) => [id, readFleet(raw, `play/naval/fleets.fleets.${id}`)])
)

// Fleet of a map without one
const DEFAULT_FLEET = readString(fleets.default, {
  path: 'play/naval/fleets.default',
  fallback: 'patrol',
})

/**
 * Class of a length, nearest shorter one when missing
 * @param {NavalFleet} fleet - Fleet
 * @param {number} length - Squares
 * @param {number} rank - Ships of that length before it
 * @return {NavalHull} - Class
 */

const classFor = ({ classes }: NavalFleet, length: number, rank: number): NavalHull => {
  const lengths = Object.keys(classes)
    .map(Number)
    .filter((key) => classes[key].length > 0)
    .sort((a, b) => a - b)
  const near = lengths.findLast((key) => key <= length) ?? lengths[0]
  if (near === undefined) return PLAIN_HULL
  const hulls = classes[near]

  return hulls[rank % hulls.length]
}

// Skins already built, by map and side
const skins = new Map<string, NavalSkin>()

/**
 * Skin of a map, accent by side
 * @param {string | null | undefined} mapId - Map key
 * @param {NavalFleetSide} side - Whose fleet
 * @return {NavalSkin} - Skin
 */

export const navalSkinOf = (
  mapId: string | null | undefined,
  side: NavalFleetSide = NavalFleetSides.Mine
): NavalSkin => {
  const map = mapId && NAVAL_MAPS.has(mapId) ? NAVAL_MAPS.get(mapId) : null
  const fleetId = map && FLEETS.has(map.look.fleet) ? map.look.fleet : DEFAULT_FLEET
  const key = `${fleetId}:${map ? mapId : ''}:${side}`
  const known = skins.get(key)
  if (known) return known

  // Class of every ship of the theatre
  const fleet = FLEETS.get(fleetId) ?? readFleet({}, 'play/naval/fleets.fleets.missing')
  const lengths = map?.theatre.fleet ?? []
  const skin: NavalSkin = {
    ...fleet.colours,
    accent: readString(sides[side], {
      path: `play/naval/fleets.sides.${side}`,
      fallback: fleet.colours.stripe,
    }),
    key,
    lengths,
    hulls: lengths.map((length, id) =>
      classFor(fleet, length, lengths.slice(0, id).filter((other) => other === length).length)
    ),
    classes: fleet,
  }
  skins.set(key, skin)

  return skin
}

/**
 * Class of a ship in a skin
 * @param {NavalSkin} skin - Skin
 * @param {NavalShip} ship - Ship
 * @return {NavalHull} - Class
 */

export const hullOf = (skin: NavalSkin, ship: NavalShip): NavalHull =>
  skin.lengths[ship.id] === ship.length
    ? skin.hulls[ship.id]
    : classFor(skin.classes, ship.length, 0)
