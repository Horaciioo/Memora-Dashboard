'use client'

import { usePersistedFlag } from '@/core/hooks/interaction/state/usePersistedFlag'

/**
 * Page column width
 * @return {{ isWide: boolean, setWide: (wide: boolean) => void }} - Width and setter
 */

export const usePageWidth = () => {
  const [isWide, setWide] = usePersistedFlag('memora:pages:wide:v1', false)

  return { isWide, setWide }
}
