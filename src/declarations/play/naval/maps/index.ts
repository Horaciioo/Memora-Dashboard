import coral from '@/configurations/play/naval/maps/coral.json'
import pirate from '@/configurations/play/naval/maps/pirate.json'
import mediterranean from '@/configurations/play/naval/maps/mediterranean.json'
import cliffs from '@/configurations/play/naval/maps/cliffs.json'
import strait from '@/configurations/play/naval/maps/strait.json'
import tropical from '@/configurations/play/naval/maps/tropical.json'
import volcanic from '@/configurations/play/naval/maps/volcanic.json'
import { firstCamera, stageCamera } from '@/core/lib/play/naval/camera'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import { createRegistry } from '@/core/lib/registry'
import { readLook, readTheatre } from '@/declarations/play/naval/maps/read'
import type { NavalMapMeta } from '@/declarations/play/naval/maps/types'

export * from '@/declarations/play/naval/maps/types'

// Map drawn when the game starts
export const NAVAL_RANDOM_MAP = 'random'

/**
 * Map read from its file, the words kept here
 * @param {string} id - Map key
 * @param {Record<string, unknown>} raw - File
 * @param {Object} words - Name and pitch
 * @return {NavalMapMeta} - Map
 */

const mapOf = (
  id: string,
  raw: Record<string, unknown>,
  words: { label: string; tagline: string }
): NavalMapMeta => ({
  ...words,
  theatre: readTheatre(raw.theatre, `play/naval/maps/${id}.theatre`),
  look: readLook(raw, `play/naval/maps/${id}`),
  ...(typeof raw.legacyFormat === 'string' && { legacyFormat: raw.legacyFormat }),
})

/**
 * Maps of the naval battle, smallest first
 * @type {Registry<string, NavalMapMeta>}
 */

export const NAVAL_MAPS = createRegistry<string, NavalMapMeta>({
  tropical: mapOf('tropical', tropical, {
    label: 'Archipel tropical',
    tagline: 'Mer ouverte en plein soleil avec rien pour se cacher.',
  }),
  coral: mapOf('coral', coral, {
    label: 'Lagon et récifs coralliens',
    tagline: 'Une eau claire sur des coraux de toutes les couleurs.',
  }),
  cliffs: mapOf('cliffs', cliffs, {
    label: 'Les falaises',
    tagline: 'Un large couloir entre deux murs de roche.',
  }),
  pirate: mapOf('pirate', pirate, {
    label: 'Baie pirate',
    tagline: 'Une crique des Caraïbes, son épave et le campement des pirates.',
  }),
  volcanic: mapOf('volcanic', volcanic, {
    label: 'L’archipel volcanique',
    tagline: 'Une mer sombre au pied du volcan en éruption.',
  }),
  strait: mapOf('strait', strait, {
    label: 'Le détroit militaire',
    tagline: 'Devant le port militaire, sous les grues et le phare.',
  }),
  mediterranean: mapOf('mediterranean', mediterranean, {
    label: 'Port méditerranéen antique',
    tagline: 'Un vieux port de pierre sous le soleil, au pied du village blanc.',
  }),
})

/**
 * Name and size of a map, as shown everywhere
 * @param {string} id - Map key
 * @return {string} - Like "Archipel tropical · 20x20"
 */

export const navalMapTitle = (id: string): string => {
  const map = NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : NAVAL_MAPS.list[0]

  return `${map.label} · ${navalMapSize(id)}`
}

/**
 * Size of a map
 * @param {string} id - Map key
 * @return {string} - Like "20x20"
 */

export const navalMapSize = (id: string): string => {
  const { size } = (NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : NAVAL_MAPS.list[0]).theatre

  return `${size}x${size}`
}

/**
 * What a sea of a game shows: its camera, and the map drawn around it when it fits the sea
 * @param {string | undefined} id - Map key
 * @param {number} size - Sea size
 * @return {{ camera: NavalCamera; mapId: string | null }} - Stage, no map for a sea of another size
 */

export const navalStageOf = (
  id: string | undefined,
  size: number
): { camera: NavalCamera; mapId: string | null } => {
  const map = id && NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : null
  if (!map || map.theatre.size !== size) return { camera: firstCamera(size, size), mapId: null }

  return { camera: stageCamera(size, map.look.band, map.look.stage), mapId: id ?? null }
}
