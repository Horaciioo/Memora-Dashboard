'use client'

import { useEffect, useState } from 'react'

import { loadWorldPainters } from '@/composites/play/naval/world/load'
import type { StageWorld } from '@/composites/play/naval/world/stage'

// Worlds fetched once per map and page visit
const WORLDS = new Map<string, Promise<StageWorld | null>>()

/**
 * World of a map
 * @param {string} id - Map key
 * @return {Promise<StageWorld | null>} - World
 */

export const loadOceanWorld = (id: string): Promise<StageWorld | null> => {
  const known = WORLDS.get(id)
  if (known) return known
  const loading = Promise.all([
    import('@/composites/play/naval/world/stage'),
    loadWorldPainters(id),
  ])
    .then(([{ stageWorld }, painters]) => stageWorld(id, painters))
    .catch(() => {
      WORLDS.delete(id)

      return null
    })
  WORLDS.set(id, loading)

  return loading
}

/**
 * Map drawn around a sea
 * @param {string | null} mapId - Map key, none for plain water
 * @return {StageWorld | null} - World
 */

export const useOceanWorld = (mapId: string | null): StageWorld | null => {
  const [loaded, setLoaded] = useState<{ id: string; world: StageWorld | null } | null>(null)
  useEffect(() => {
    if (!mapId) return
    let isLive = true
    void loadOceanWorld(mapId).then((world) => isLive && setLoaded({ id: mapId, world }))

    return () => {
      isLive = false
    }
  }, [mapId])

  return loaded && loaded.id === mapId ? loaded.world : null
}
