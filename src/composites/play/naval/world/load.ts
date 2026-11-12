import { loadDecor } from '@/composites/play/naval/world/decor'
import type { DecorPainters } from '@/composites/play/naval/world/decor'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'

// Painters fetched once per map and page visit
const PAINTERS = new Map<string, Promise<DecorPainters>>()

/**
 * Painters of a map
 * @param {string} id - Map key
 * @return {Promise<DecorPainters>} - Painter per kind it uses
 */

export const loadWorldPainters = (id: string): Promise<DecorPainters> => {
  const known = PAINTERS.get(id)
  if (known) return known
  const map = NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : NAVAL_MAPS.list[0]
  const loading = loadDecor(map.look.decor).catch(() => {
    PAINTERS.delete(id)

    return {}
  })
  PAINTERS.set(id, loading)

  return loading
}
