'use client'

import { useEffect, useState } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import type { RegistryView } from '@/types/nexus'

// Nothing known while locked
const EMPTY: RegistryView = { commands: [], values: {} }

/**
 * Commands the console knows, read after unlock only
 * @param {boolean} isUnlocked - Console is unlocked
 * @return {RegistryView} - Listing
 */

export const useNexusRegistry = (isUnlocked: boolean): RegistryView => {
  const [registry, setRegistry] = useState<RegistryView>(EMPTY)

  useEffect(() => {
    if (!isUnlocked) return
    let isCurrent = true
    void apiGet<RegistryView>(NEXUS_PATHS.registry)
      .then((view) => isCurrent && setRegistry(view))
      .catch(() => undefined)

    return () => {
      isCurrent = false
    }
  }, [isUnlocked])

  // A lock forgets the listing
  return isUnlocked ? registry : EMPTY
}
