import cliffs from '@/configurations/play/naval/maps/cliffs.json'
import strait from '@/configurations/play/naval/maps/strait.json'
import tropical from '@/configurations/play/naval/maps/tropical.json'
import volcanic from '@/configurations/play/naval/maps/volcanic.json'
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
  cliffs: mapOf('cliffs', cliffs, {
    label: 'Les falaises',
    tagline: 'Un large couloir entre deux murs de roche.',
  }),
  volcanic: mapOf('volcanic', volcanic, {
    label: 'L’archipel volcanique',
    tagline: 'Une mer sombre au pied du volcan en éruption.',
  }),
  strait: mapOf('strait', strait, {
    label: 'Le détroit militaire',
    tagline: 'Devant le port militaire, sous les grues et le phare.',
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
