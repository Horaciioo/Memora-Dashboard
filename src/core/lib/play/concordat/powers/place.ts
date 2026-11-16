import { CONCORDAT_COUNTRIES } from '@/declarations/play/concordat/countries'
import {
  CONCORDAT_TRIBE_BEASTS,
  CONCORDAT_TRIBE_REGIONS,
} from '@/declarations/play/concordat/tribeNames'
import { CONCORDAT_WINDOWS } from '@/declarations/play/concordat/world'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { startTerritory } from '@/core/lib/play/concordat/map/starts'
import { createGaps } from '@/core/lib/play/concordat/powers/gaps'
import type { ConcordatGaps } from '@/core/lib/play/concordat/powers/gaps'
import type { SeededRng } from '@/core/lib/play/seeded'
import type { ConcordatMap } from '@/types/concordat'
import { ConcordatPowers, ConcordatTerrains } from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
  ConcordatPowerName,
  ConcordatSizeName,
} from '@/utils/constants/concordat'

const { powers, map: mapRules } = CONCORDAT

/**
 * Country or tribe laid on the map
 * @typedef {Object} ConcordatPowerSpec
 */

export interface ConcordatPowerSpec {
  kind: ConcordatPowerName
  name: string
  color: number
  tile: number
  // Tiles of its first land
  tiles: number
}

/**
 * Who stands where at the start
 * @typedef {Object} ConcordatPlacement
 */

export interface ConcordatPlacement {
  humanStarts: number[]
  powers: ConcordatPowerSpec[]
}

// Packed RGB of an HSL colour
const packedColor = (hue: number, saturation: number, lightness: number): number => {
  const chroma = saturation * Math.min(lightness, 1 - lightness)
  const channel = (n: number): number => {
    const k = (n + hue / 30) % 12

    return Math.round(255 * (lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }

  return (channel(0) << 16) | (channel(8) << 8) | channel(4)
}

// Land a start can stand on
const isHost = (map: ConcordatMap, tile: number): boolean => {
  const kind = map.terrain[tile]

  return (
    kind !== ConcordatTerrains.Sea &&
    kind !== ConcordatTerrains.Mountain &&
    kind !== ConcordatTerrains.River
  )
}

// Tile of a place, minus one outside the window
const tileOfPlace = (map: ConcordatMap, lat: number, lon: number): number => {
  const window = CONCORDAT_WINDOWS[map.style] ?? CONCORDAT_WINDOWS.world
  if (lat > window.latMax || lat < window.latMin || lon < window.lonMin || lon > window.lonMax)
    return -1

  const x = Math.min(
    map.width - 1,
    Math.floor(((lon - window.lonMin) / (window.lonMax - window.lonMin)) * map.width)
  )
  const y = Math.min(
    map.height - 1,
    Math.floor(((window.latMax - lat) / (window.latMax - window.latMin)) * map.height)
  )

  return y * map.width + x
}

// Nearest host tile with room, searched ring by ring
const landNear = (map: ConcordatMap, tile: number, radius: number, room: number): number => {
  const { width, height, terrain } = map
  const cx = tile % width
  const cy = Math.floor(tile / width)

  for (let ring = 0; ring <= radius; ring++) {
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue
        const x = cx + dx
        const y = cy + dy
        if (x < 4 || y < 4 || x >= width - 4 || y >= height - 4) continue

        const candidate = y * width + x
        if (
          isHost(map, candidate) &&
          startTerritory(candidate, terrain, width, height, undefined, room).length >= room
        ) {
          return candidate
        }
      }
    }
  }

  return -1
}

// Real countries at their position
const placeCountries = (map: ConcordatMap, gaps: ConcordatGaps): ConcordatPowerSpec[] => {
  const { country } = powers
  const placed: ConcordatPowerSpec[] = []

  CONCORDAT_COUNTRIES.forEach((entry, index) => {
    const wanted = tileOfPlace(map, entry.lat, entry.lon)
    if (wanted < 0) return

    const tile = landNear(map, wanted, country.snapRadius, Math.round(country.tiles / 2))
    if (tile < 0 || !gaps.isClear(tile, country.gap)) return

    gaps.add(tile)
    placed.push({
      kind: ConcordatPowers.Country,
      name: entry.name,
      color: packedColor((index * 137.5 + 20) % 360, 0.68, 0.5),
      tile,
      tiles: country.tiles,
    })
  })

  return placed
}

// Human starts clear of every country, spare ones are scattered
const placeHumans = (
  map: ConcordatMap,
  count: number,
  gaps: ConcordatGaps,
  rng: SeededRng
): number[] => {
  const chosen: number[] = []
  const starts = [...map.starts]

  // Shuffled fair starts first
  for (let index = starts.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1))
    ;[starts[index], starts[swap]] = [starts[swap], starts[index]]
  }
  for (const tile of starts) {
    if (chosen.length >= count) break
    if (!gaps.isClear(tile, mapRules.start.placeGap)) continue
    gaps.add(tile)
    chosen.push(tile)
  }

  // Land left over when countries crowd the fair starts
  const missing = count - chosen.length
  const extra = scatter(map, missing, mapRules.start.minDistance, mapRules.start.tiles, gaps, rng)
  extra.forEach((tile) => chosen.push(tile))

  return chosen
}

// Random host tiles kept apart from everything placed
const scatter = (
  map: ConcordatMap,
  count: number,
  gap: number,
  room: number,
  gaps: ConcordatGaps,
  rng: SeededRng
): number[] => {
  const { width, height, terrain } = map
  const found: number[] = []

  for (let attempt = 0; attempt < count * 80 && found.length < count; attempt++) {
    const x = 4 + Math.floor(rng() * (width - 8))
    const y = 4 + Math.floor(rng() * (height - 8))
    const tile = y * width + x
    if (!isHost(map, tile) || !gaps.isClear(tile, gap)) continue
    if (startTerritory(tile, terrain, width, height, undefined, room).length < room) continue

    gaps.add(tile)
    found.push(tile)
  }

  return found
}

// Distinct tribe names, shuffled
const tribeNames = (count: number, rng: SeededRng): string[] => {
  const all = CONCORDAT_TRIBE_REGIONS.flatMap((region) =>
    CONCORDAT_TRIBE_BEASTS.map((beast) => `${beast} ${region}`.trim())
  )
  for (let index = all.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1))
    ;[all[index], all[swap]] = [all[swap], all[index]]
  }

  return all.slice(0, count)
}

/**
 * Countries, human starts and tribes for a new game
 * @param {Object} input - Placement input
 * @param {ConcordatMap} input.map - Map
 * @param {number} input.humans - Seats
 * @param {ConcordatSizeName} input.size - Map size
 * @param {SeededRng} input.rng - Random source
 * @return {ConcordatPlacement} - Placement
 */

export const placePowers = (input: {
  map: ConcordatMap
  humans: number
  size: ConcordatSizeName
  rng: SeededRng
}): ConcordatPlacement => {
  const { map, humans, size, rng } = input
  const gaps = createGaps(map.width)

  // Countries first, seats around them
  const countries = placeCountries(map, gaps)
  const humanStarts = placeHumans(map, humans, gaps, rng)

  // Tribes fill what is left, under the actor cap
  const room = Math.max(0, CONCORDAT.maxActors - humans - countries.length)
  const wanted = Math.min(powers.tribe.counts[size], room)
  const tiles = scatter(map, wanted, powers.tribe.gap, powers.tribe.tiles, gaps, rng)
  const names = tribeNames(tiles.length, rng)
  const tribes: ConcordatPowerSpec[] = tiles.map((tile, index) => ({
    kind: ConcordatPowers.Tribe,
    name: names[index],
    color: packedColor((index * 47 + 30) % 360, 0.28, 0.56),
    tile,
    tiles: powers.tribe.tiles,
  }))

  return { humanStarts, powers: [...countries, ...tribes] }
}

/**
 * Starting shares of a country on a difficulty
 * @param {ConcordatDifficultyName} difficulty - Difficulty
 * @return {typeof powers.difficulties.easy} - Shares
 */

export const difficultyOf = (difficulty: ConcordatDifficultyName) => powers.difficulties[difficulty]
